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

    const updateRequestMatchCheckbox = (event) => {
        chatContext.setShouldRequestMatch(event.target.checked);
    };

    let conversationType;
    let conversationTypeContainer = null;
    switch (chatContext.conversationId) {
        case 1:
            conversationType = 'חדר המתנה';
            break;
        case -1:
            conversationType = null;
            break;
        default:
            conversationType = 'שיחה פרטית';
    }
    if (conversationType !== null) {
        conversationTypeContainer = (
            <div className="row m-0 chat-type">
                <div className="px-2 ml-auto col-6 text-left">
                    <label className="form-check-label" htmlFor="request_match_checkbox">
                        <b>חפש שיחה אישית</b>
                    </label>
                    <input className="form-check-input ml-1" type="checkbox" id="request_match_checkbox" checked={chatContext.shouldRequestMatch} onChange={updateRequestMatchCheckbox} />
                </div>
                <div className="px-2 mr-auto col-6 text-right">
                    אתה נמצא כעת ב
                    <b>
                        {conversationType}
                    </b>
                </div>
            </div>
        );
    }


    return (
        <div className="ChatInput mt-auto">
            {conversationTypeContainer}
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
