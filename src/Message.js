import React from 'react';

import './Message.scss';

const Message = (props) => {
    const text = props.text;
    const author = props.author;
    const userId = props.user_id;
    const storedUserId = localStorage.getItem('USER_ID');
    const messageExtraClasses = (userId.toString() === storedUserId) ? "message-self": "message-other";

    const extra_style = {};
    if (userId === 0) {
        extra_style['color'] = 'red';
    }

    const get_direction = (text) => {
        if (text[0] != null && text[0].search(/[\u0590-\u05FF]/) < 0) {
            return "ltr";
        }
        return "rtl";
    };


    return (
        <div className={"Message " + messageExtraClasses}>
            <div className="message-author" style={extra_style}>
                {[author]}
            </div>
            <div className="message-text" style={{direction: get_direction(text)}}>
                {text}
            </div>
        </div>
    );
};

export default Message;
