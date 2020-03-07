import React, {useEffect, useState} from 'react';

import './ChatBox.scss';
import Message from "./Message";

const ChatBox = () => {
    const [messages, updateMessages] = useState([]);
    const [namesDictionary, updateNameDictionary] = useState({0: 'הודעה מערכת'});
    const [isWebsocketInit, updateIsWebsocketInit] = useState(false);

    const displayMessages = (message) => {
        return (
            <div className="p-2">
                <Message message={message} namesDictionary={namesDictionary}/>
            </div>
        );
    };

    useEffect(() => {
        if (!isWebsocketInit) {
            updateMessages([...messages, {'key': 'shit', 'author': 0,'text': 'מתחבר אל השרת...'}]);
            updateIsWebsocketInit(true);
        }
    },[isWebsocketInit, messages]);

    return (
        <div className="ChatBox">
            {messages.map(displayMessages)}
        </div>
    );
};

export default ChatBox;
