import React from 'react';
import ChatBox from "./ChatBox";

import './ChatContainer.scss';
import ChatInput from "./ChatInput";

const ChatContainer = () => {
    return (
        <div className="ChatContainer container">
            <div className="d-flex flex-column chat-flex">
                <ChatBox />
                <ChatInput />
            </div>
        </div>
    );
};

export default ChatContainer;
