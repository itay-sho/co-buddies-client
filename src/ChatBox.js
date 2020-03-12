import React, {useCallback, useContext, useEffect, useRef, useState} from 'react';

import './ChatBox.scss';
import Message from "./Message";
import ErrorCodes from './ErrorCodes'
import update from 'immutability-helper';
import crypto from "crypto";
import {ChatContext} from "./context/chat-context";
import soundManger from 'soundmanager2'
import * as firebase from "firebase/app";
import "firebase/messaging";

const ChatBox = () => {
    const [messages, updateMessages] = useState([]);
    const [sound, setSound] = useState(null);
    const namesDictionaryRef = useRef({0: 'הודעת מערכת'});
    const pendingResponseRef = useRef({});
    const chatBoxRef = useRef();
    const websocketRef = useRef();
    const chatContext = useContext(ChatContext);
    const storedUserId = localStorage.getItem('USER_ID');

    const addPendingResponse = (sequence, callback) => {
        console.log('Adding!');
        let to_append = {};
        to_append[sequence] = callback;
        pendingResponseRef.current = update(pendingResponseRef.current, {$set:to_append});
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

    const clearMessagesList = () => {
      updateMessages(() => {
          return [];
      });
    };

    const randomizeKey = () => crypto.randomBytes(10).toString('hex');

    const generateMessage = (user_id, text) => {return {user_id: user_id, 'text': text, key: randomizeKey()}};
    const generateAdminMessage = text => generateMessage(0, text);

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
            case ErrorCodes.AUTH_FAIL_INVALID_TOKEN:
            case ErrorCodes.AUTH_FAIL_USER_INACTIVE:
                addToMessageList(generateAdminMessage('הסיסמה שניתנה שגויה או שהמשתמש נחסם. מתנתק...'));
                localStorage.removeItem('API_KEY');
                break;
            case ErrorCodes.AUTHENTICATION_TIMEOUT:
                addToMessageList(generateAdminMessage('המערכת נכשלה בהתחברות'));
                break;
            case ErrorCodes.INACTIVENESS_TIMEOUT:
                addToMessageList(generateAdminMessage('מתנתק בעקבות חוסר פעילות...'));
                // leaving conversation
                chatContext.setConversationId(-1);
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
        const sequenceNumber = chatContext.getNextSequenceNumber();
        const match_request = JSON.stringify({
            request_type: 'request_match',
            seq: sequenceNumber,
            payload: {}
        });

        websocketRef.current.send(match_request);
        console.log('match request sent!');
        addPendingResponse(sequenceNumber, onMatchRequest);
    };

    const onLoginSuccess = () => {
        addToMessageList(generateAdminMessage('התחברת בהצלחה!'));
        sendMatchRequest();
        getPushNotificationKey();
    };

    const onMatchRequest = () => {
        addToMessageList(generateAdminMessage('מחפש פרטנרים לשיחה...'));
    };

    const onReceiveMatch = (message) => {
        let attendees = [];
        for (let [attendee_id, attendee_name] of Object.entries(message.payload.attendees)) {
            if (storedUserId !== attendee_id) {
                attendees.push(attendee_name);
            }

            let newNameDict = {...namesDictionaryRef.current};
            newNameDict[attendee_id] = attendee_name;
            namesDictionaryRef.current = newNameDict;
        }

        clearMessagesList();

        if (message.payload.conversation_id === 1) {
            addToMessageList(generateAdminMessage('נכנסת ללובי'));
        }

        if (attendees.length >= 1) {
            addToMessageList(generateAdminMessage('אתה מדבר עם ' + attendees.join(', ')));
        }

        chatContext.setConversationId(message.payload.conversation_id);
    };

    const onReceiveMessage = (message) => {
        if (sound !== null && message.payload.author_id.toString() !== storedUserId) {
            sound.play();
        }
        addToMessageList(generateMessage(message.payload.author_id, message.payload.text));
    };

    const onReceiveLeave = (message) => {
        console.log(message.payload);
        console.log(namesDictionaryRef.current);
        console.log(namesDictionaryRef.current[message.payload.user_id]);

        const userName = namesDictionaryRef.current[message.payload.user_id];
        addToMessageList(generateAdminMessage(`${userName} עזב את השיחה`));

        if (chatContext.conversationId !== 1) {
            // moving to lobby
            sendMatchRequest();
        }
    };

    const onReceiveJoin = (message) => {
        console.log("connect message: ", message);
        const userId = message.payload.user_id;
        const name = message.payload.name;
        let newNameDict = {...namesDictionaryRef.current};
        newNameDict[userId] = name;
        namesDictionaryRef.current = newNameDict;
        if (userId.toString() !== storedUserId) {
            addToMessageList(generateAdminMessage(`${name} הצטרף לשיחה`));
        }
    };

    const wsOnOpen = () => {
        const websocket = websocketRef.current;
        const sequenceNumber = chatContext.getNextSequenceNumber();
        const login_request = JSON.stringify({
            request_type: 'authenticate',
            seq: sequenceNumber,
            payload: {'access_token': localStorage.getItem('API_KEY')}
        });

        websocket.send(login_request);
        addPendingResponse(sequenceNumber, onLoginSuccess);
    };

    const wsOnClose = () => {
        addToMessageList(generateAdminMessage('התנתקת מהשרת, נסה לרפרש את הדף'));
    };

    const wsOnMessage =(event) => {
        console.log("New message: " + event.data);
        const message = JSON.parse(event.data);

        switch (message.request_type) {
            case "error":
                return handleErrorMessage(message);
            case "receive_match":
                return onReceiveMatch(message);
            case 'receive_message':
                return onReceiveMessage(message);
            case "leave":
                return onReceiveLeave(message);
            case "join":
                return onReceiveJoin(message);
            default:
                return handleUnknownMessage(message);
        }
    };

    const getPushNotificationKey = useCallback(() => {
        const messaging = firebase.messaging();
        messaging.getToken()
            .then((token) =>{
                console.log('token:', token);

                const sequenceNumber = chatContext.getNextSequenceNumber();

                let message = JSON.stringify({
                    request_type: 'set_pn_token',
                    seq: sequenceNumber,
                    payload: {
                        token: token
                    }
                });

                chatContext.websocket.send(message);
            })
            .catch((error) => {
                console.log(error);
            });

        messaging.onMessage((payload) => {
            console.log('message', payload)
        });
    }, [chatContext]);

    useEffect(() => {
        console.log('useEffect');

        if (websocketRef.current === undefined) {
            console.log('setting web socket...');

            websocketRef.current = new WebSocket(process.env.REACT_APP_WEBSOCKET_URL);
            addToMessageList({key: randomizeKey(), user_id: 0,'text': 'מתחבר אל השרת...'});
        }

        websocketRef.current.onopen = wsOnOpen;
        websocketRef.current.onclose = wsOnClose;
        websocketRef.current.onmessage = wsOnMessage;
        chatContext.setWebsocket(websocketRef.current);

        chatBoxRef.current.scroll({top: chatBoxRef.current.scrollHeight, behavior: 'smooth'});
    }, [websocketRef, wsOnOpen, wsOnClose, wsOnMessage]);

    useEffect(() => {
        soundManger.soundManager.onready(() => {
            if (sound === null) {
                const newSound = soundManger.soundManager.createSound({
                    url: `${process.env.PUBLIC_URL}/new-message.wav`
                });
                setSound(newSound);
            }
        });
    }, []);

    const style = {
        backgroundImage: `url(${process.env.PUBLIC_URL}/chat_bg.png)`
    };

    return (
        <div className="ChatBox" ref={chatBoxRef} style={style}>
            {messages.map(displayMessage)}
        </div>
    );
};

export default ChatBox;
