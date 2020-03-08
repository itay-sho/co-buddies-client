import React, {useState} from "react";

export const ChatContext = React.createContext({
    conversationId: 0,
    setConversationId: () => {},
    websocket: null,
    setWebsocket: () => {},
    getNextSequenceNumber: () => {}
});

const ChatContextProvider = props => {
    const [conversationId, setConversationId] = useState(0);
    const [websocket, setWebsocket] = useState(null);
    const [sequenceNumber, setSequenceNumber] = useState(1);

    const getNextSequenceNumber = () => {
        setSequenceNumber(sequenceNumber + 1);
        return sequenceNumber;
    };

    return <ChatContext.Provider value={{
        conversationId: conversationId,
        setConversationId: setConversationId,
        websocket: websocket,
        setWebsocket: setWebsocket,
        getNextSequenceNumber: getNextSequenceNumber
    }}>
        {props.children}
    </ChatContext.Provider>
};

export default ChatContextProvider;