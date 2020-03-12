import React, {useState} from "react";

export const ChatContext = React.createContext({
    conversationId: -1,
    setConversationId: () => {},
    shouldRequestMatch: true,
    setShouldRequestMatch: () => {},
    websocket: null,
    setWebsocket: () => {},
    getNextSequenceNumber: () => {}
});

const ChatContextProvider = props => {
    const [conversationId, setConversationId] = useState(-1);
    const [shouldRequestMatch, setShouldRequestMatch] = useState(true);
    const [websocket, setWebsocket] = useState(null);
    const [sequenceNumber, setSequenceNumber] = useState(1);

    const getNextSequenceNumber = () => {
        setSequenceNumber(sequenceNumber + 1);
        return sequenceNumber;
    };

    return <ChatContext.Provider value={{
        conversationId: conversationId,
        setConversationId: setConversationId,
        shouldRequestMatch: shouldRequestMatch,
        setShouldRequestMatch: setShouldRequestMatch,
        websocket: websocket,
        setWebsocket: setWebsocket,
        getNextSequenceNumber: getNextSequenceNumber
    }}>
        {props.children}
    </ChatContext.Provider>
};

export default ChatContextProvider;