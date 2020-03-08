import React, {useContext, useEffect, useRef, useState} from 'react';

import './ChatBox.scss';
import Message from "./Message";
import ErrorCodes from './ErrorCodes'
import update from 'immutability-helper';
import crypto from "crypto";
import {ChatContext} from "./context/chat-context";

const ChatBox = () => {
    const [messages, updateMessages] = useState([]);
    // const [namesDictionary, updateNamesDictionary] = useState({0: 'הודעה מערכת'});
    const namesDictionaryRef = useRef({0: 'הודעה מערכת'});
    const sequenceNumberRef = useRef(1);
    const pendingResponseRef = useRef({});
    const websocketRef = useRef();
    const chatContext = useContext(ChatContext);

    const addPendingResponse = (sequence, callback) => {
        console.log('Adding!');
        let to_append = {};
        to_append[sequence] = callback;
        pendingResponseRef.current = update(pendingResponseRef.current, {$set:to_append});
    };

    const getNextSequenceNumber = () => {
        sequenceNumberRef.current++;
        return sequenceNumberRef.current
    };

    const displayMessage = (message) => {
        return (
            <div key={message.key} className="p-2">
                <Message text={message.text} author={namesDictionaryRef.current[message.user_id]} user_id={message.user_id} />
            </div>
        );
    };

    const addToMessageList = (newMessage) => {
        updateMessages(previousMessage => {
            return update(previousMessage, {$push: [newMessage]});
        });
    };

    const randomizeKey = () => crypto.randomBytes(10).toString('hex');

    const generateAdminMessage = (text) => {return {user_id: 0, 'text': text, key: randomizeKey()}};

    const handleErrorMessage = (message) => {
        switch (message.payload.error_code) {
            case ErrorCodes.OK:
                if (message.payload.response_to != null) {
                    console.dir(pendingResponseRef.current);
                    console.log(message.payload.response_to);
                    if (message.payload.response_to in pendingResponseRef.current) {
                        pendingResponseRef.current[message.payload.response_to]();
                    } else {
                        console.log('got a success message for seq: ' + message.payload.response_to);
                    }
                }
                break;
            case ErrorCodes.INVALID_TOKEN:
            case ErrorCodes.USER_INACTIVE:
                addToMessageList(generateAdminMessage('הסיסמה שניתנה שגויה או שהמשתמש נחסם. מתנתק...'));
                localStorage.removeItem('API_KEY');
                break;
            case ErrorCodes.TIMEOUT:
                addToMessageList(generateAdminMessage('המערכת נכשלה בהתחברות'));
                break;
            default:
                addToMessageList(generateAdminMessage(`Unknown error: ${message.payload.error_code} ${message.payload.error_message}`));
                break;

        }
    };

    const handleUnknownMessage = (message) => {
        addToMessageList(generateAdminMessage('הודעה לא ידועה! :' + JSON.stringify(message)));
    };

    const sendMatchRequest = () => {
        const sequenceNumber = getNextSequenceNumber();
        const match_request = JSON.stringify({
            request_type: 'request_match',
            seq: sequenceNumber,
            payload: {}
        });

        websocketRef.current.send(match_request);
        addPendingResponse(sequenceNumber, onMatchRequest);
    };

    const onLoginSuccess = () => {
        addToMessageList(generateAdminMessage('התחברת בהצלחה!'));
        sendMatchRequest();
    };

    const onMatchRequest = () => {
        addToMessageList(generateAdminMessage('מחפש פרטנרים לשיחה...'));
    };

    const onReceiveMatch = (message) => {
        const userID = localStorage.getItem('USER_ID');
        let attendees = '';
        console.log(message.payload.attendees);
        for (let [attendee_id, attendee_name] of Object.entries(message.payload.attendees)) {
            if (userID !== attendee_id) {
                attendees += attendee_name;
            }

            let newNameDict = {...namesDictionaryRef.current};
            newNameDict[attendee_id] = attendee_name;
            namesDictionaryRef.current = newNameDict;
        }

        addToMessageList(generateAdminMessage('אתה מדבר עם ' + attendees));

        chatContext.setConversationId(message.payload.conversationId);
    };

    const onReceiveDisconnect = (message) => {
        console.log(message.payload);
        console.log(namesDictionaryRef.current);
        console.log(namesDictionaryRef.current[message.payload.user_id]);

        const userName = namesDictionaryRef.current[message.payload.user_id];
        addToMessageList(generateAdminMessage(`${userName} עזב את השיחה.`));
    };

    const wsOnOpen = (event) => {
        const websocket = websocketRef.current;
        const sequenceNumber = getNextSequenceNumber();
        const login_request = JSON.stringify({
            request_type: 'authenticate',
            seq: sequenceNumber,
            payload: {'access_token': localStorage.getItem('API_KEY')}
        });

        websocket.send(login_request);
        addPendingResponse(sequenceNumber, onLoginSuccess);
    };

    const wsOnClose = (event) => {
        addToMessageList(generateAdminMessage('התנתקת מהשרת'));
    };

    const wsOnMessage =(event) => {
        console.log("New message: " + event.data);
        const message = JSON.parse(event.data);

        switch (message.request_type) {
            case "error":
                return handleErrorMessage(message);
            case "receive_match":
                return onReceiveMatch(message);
            case "disconnect":
                return onReceiveDisconnect(message);
            default:
                return handleUnknownMessage(message);
        }
    };

    useEffect(() => {
        console.log('useEffect');
        console.log('setting web socket...');
        const websocket = new WebSocket('ws://127.0.0.1:8000/chat');
        if (websocketRef.current === undefined) {
            websocket.onopen = wsOnOpen;
            websocket.onclose = wsOnClose;
            websocket.onmessage = wsOnMessage;
            websocketRef.current = websocket;

            addToMessageList({key: randomizeKey(), user_id: 0,'text': 'מתחבר אל השרת...'});
        }
    }, [websocketRef, wsOnOpen, wsOnClose, wsOnMessage]);

    return (
        <div className="ChatBox">
            {messages.map(displayMessage)}
        </div>
    );
};

export default ChatBox;
