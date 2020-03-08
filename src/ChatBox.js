import React, {useCallback, useEffect, useRef, useState} from 'react';

import './ChatBox.scss';
import Message from "./Message";
import ErrorCodes from './ErrorCodes'
import update from 'immutability-helper';

const ChatBox = () => {
    const [messages, updateMessages] = useState([]);
    const [namesDictionary, updateNameDictionary] = useState({0: 'הודעה מערכת'});
    const sequenceNumberRef = useRef(1);
    const pendingResponseRef = useRef({});
    const websocketRef = useRef();

    const addPendingResponse = (sequence, callback) => {
        console.log('Adding!');
        let to_append = {};
        to_append[sequence] = callback;
        pendingResponseRef.current = update(pendingResponseRef.current, {$set:to_append});
    };

    const getNextSequenceNumber = useCallback(() => {
        sequenceNumberRef.current++;
        return sequenceNumberRef.current
    }, [sequenceNumberRef]);

    const displayMessage = useCallback((message) => {
        return (
            <div className="p-2">
                <Message message={message} namesDictionary={namesDictionary}/>
            </div>
        );
    }, [namesDictionary]);

    const addToMessageList = (newMessage) => {
        updateMessages(previousMessage => {
            return update(previousMessage, {$push: [newMessage]});
        });
    };

    const generateAdminMessage = (text) => {
        return {key: 'TODO', author: 0, 'text': text};
    };

    const handleErrorMessage = useCallback((message) => {
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
    }, [pendingResponseRef]);

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

    const wsOnOpen = useCallback((event) => {
        const websocket = websocketRef.current;
        const sequenceNumber = getNextSequenceNumber();
        const login_request = JSON.stringify({
            request_type: 'authenticate',
            seq: sequenceNumber,
            payload: {'access_token': localStorage.getItem('API_KEY')}
        });

        websocket.send(login_request);
        addPendingResponse(sequenceNumber, onLoginSuccess);
    }, []);

    const wsOnClose = useCallback((event) => {
        addToMessageList(generateAdminMessage('התנתקת מהשרת'));
    }, []);

    const wsOnMessage = useCallback((event) => {
        console.log("New message: " + event.data);
        const message = JSON.parse(event.data);

        switch (message.request_type) {
            case "error":
                return handleErrorMessage(message);
            case "":
                return handleErrorMessage(message);
            default:
                return handleUnknownMessage(message);
        }
    }, []);

    useEffect(() => {
        console.log('useEffect');
        console.log('setting web socket...');
        const websocket = new WebSocket('ws://127.0.0.1:8000/chat');

        websocket.onopen = wsOnOpen;
        websocket.onclose = wsOnClose;
        websocket.onmessage = wsOnMessage;
        websocketRef.current = websocket;

        addToMessageList({'key': 'abcde', 'author': 0,'text': 'מתחבר אל השרת...'});
    }, []);

    return (
        <div className="ChatBox">
            {messages.map(displayMessage)}
        </div>
    );
};

export default ChatBox;
