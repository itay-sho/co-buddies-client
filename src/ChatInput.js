import React from 'react';
import ResizableTextarea from "./ReiszeableTextarea";

import './ChatInput.scss'

const ChatInput = () => {
    const sendMessage = () => {
        alert("clicked!");
    };

    return (

        <div className="ChatInput mt-auto">
            <div className="p-2 d-flex">
                {/*<textarea style={{wordBreak: "break-word", width: "500px", height: "60px", resize: "none", direction: "rtl", wordWrap: 'none'}} placeholder="הקלד\י הודעה" />*/}
                <ResizableTextarea rows="1" minRows="1" maxRows="5" enterAction={sendMessage} />
                <div className="p2 d-flex align-items-center send-button-wrapper">
                    <img alt="logo" src={process.env.PUBLIC_URL + '/send_button.png'} className="send-button" onClick={sendMessage} style={{margin: "auto"}} />
                </div>
            </div>
        </div>
    );
};

export default ChatInput;
