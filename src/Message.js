import React from 'react';

import './Message.scss';

const Message = (props) => {
    const time = props.time;
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

    const format_time = (epoch_time) => {
        var timezone_offset = new Date().getTimezoneOffset() * 60
        var message_time = (new Date((epoch_time.time - timezone_offset) * 1000))
        return "נשלח " + message_time.getHours() + ":" + message_time.getMinutes() + ":" + message_time.getSeconds()
    };


    return (
        <div className={"Message " + messageExtraClasses}>
            <div className="message-author" style={extra_style}>
                {[author]}
            </div>
            <div className="message-text" style={{direction: get_direction(text)}}>
                {text}
            </div>
            <div className="message-time">
                {format_time({time})}
            </div>
        </div>
    );
};

export default Message;
