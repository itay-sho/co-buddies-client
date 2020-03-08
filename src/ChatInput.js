import React, {useContext} from 'react';
import ResizableTextarea from "./ReiszeableTextarea";

import './ChatInput.scss'
import {ChatContext} from "./context/chat-context";

const ChatInput = () => {
    const sendMessage = () => {
        alert("clicked!");
    };

    const chatContext = useContext(ChatContext);

    return (

        <div className="ChatInput mt-auto">
            <div className="p-2 d-flex">
                <ResizableTextarea rows="1" minRows="1" maxRows="5" enterAction={sendMessage} disabled={chatContext.conversationId === 0} />
                <div className="p2 d-flex align-items-center send-button-wrapper">
                    <img alt="logo" src={process.env.PUBLIC_URL + '/send_button.png'} className="send-button" onClick={sendMessage} style={{margin: "auto"}} />
                </div>
            </div>
        </div>
    );
};

export default ChatInput;
