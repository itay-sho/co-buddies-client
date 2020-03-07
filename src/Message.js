import React from 'react';

import './Message.scss';

const Message = (props) => {
    const message = props.message;
    const message_extra_classes = message.author === "me" ? "message-self": "message-other";
    const namesDictionary = props.namesDictionary;

    const extra_style = {};
    if (message.author === 0) {
        extra_style['color'] = 'red';
    }

    const get_direction = (text) => {
        if (text[0] != null && text[0].search(/[\u0590-\u05FF]/) < 0) {
            return "ltr";
        }
        return "rtl";
    };


    return (
        <div className={"Message " + message_extra_classes}>
            <div className="message-author" style={extra_style}>
                {namesDictionary[message.author]}
            </div>
            <div className="message-text" style={{direction: get_direction(message.text)}}>
                {message.text}
            </div>
        </div>
    );
};

export default Message;
