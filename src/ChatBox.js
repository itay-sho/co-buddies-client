import React from 'react';

import './ChatBox.scss';
import Message from "./Message";

const ChatBox = () => {
    let messages = [
        {key: 1, author: "abdul", text: "LOOOOOOL"},
        {key: 2, author: "abdul", text: "stfu"},
        {key: 3, author: "me", text: "dude stahp"},
        {key: 4, author: "abdul", text: "SHIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIT"},
    ];

    const displayMessages = (message) => {
        return (
            <div className="p-2">
                <Message message={message}/>
            </div>
        );
    };

    return (
        <div className="ChatBox">
            {messages.map(displayMessages)}
        </div>
    );
};

export default ChatBox;
