import React from 'react';

import './Message.scss';

const Message = (props) => {
    const message = props.message;
    const message_extra_classes = message.author === "me" ? "message-self": "message-other";

    return (
        <div className={"Message " + message_extra_classes}>
            <div className="message-author">
                {message.author}
            </div>
            <div className="message-text">
                {message.text}
            </div>
        </div>
    );
};

export default Message;
