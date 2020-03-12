import React, {useContext, useRef} from 'react';
import ResizableTextarea from "./ReiszeableTextarea";

import './ChatInput.scss'
import {ChatContext} from "./context/chat-context";

const ChatInput = () => {
    const chatContext = useContext(ChatContext);
    const disabled = chatContext.conversationId === -1;
    const textareaRef = useRef();
    const sendMessage = () => {
        const [textareaState, updateTextareaState] = textareaRef.current;
        const value = textareaState.value;

        if (disabled || value.length === 0)
            return;

        const sequenceNumber = chatContext.getNextSequenceNumber();

        let message = JSON.stringify({
            request_type: 'send_message',
            seq: sequenceNumber,
            payload: {
                text: value
            }
        });

        updateTextareaState({...textareaState, value: ''});
        chatContext.websocket.send(message);
    };

    let conversationType;
    switch (chatContext.conversationId) {
        case 1:
            conversationType = 'חדר המתנה';
            break;
        case -1:
            conversationType = 'טעינה';
            break;
        default:
            conversationType = 'שיחה פרטית';
    }

    return (

        <div className="ChatInput mt-auto">
            <div className="px-2 chat-type">
                אתה נמצא כעת ב
                <b>
                    {conversationType}
                </b>
            </div>
            <div className="p-2 d-flex">
                <ResizableTextarea ref={textareaRef} rows="1" minRows="1" maxRows="5" enterAction={sendMessage} disabled={disabled} />
                <div className="p2 d-flex align-items-center send-button-wrapper">
                    <img alt="logo" src={process.env.PUBLIC_URL + '/send_button.png'} className="send-button" onClick={sendMessage} />
                </div>
            </div>
        </div>
    );
};

export default ChatInput;
