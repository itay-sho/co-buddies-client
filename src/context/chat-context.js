import React, {useState} from "react";

export const ChatContext = React.createContext({
    conversationId: 0,
    setConversationId: () => {}
});

const ChatContextProvider = props => {
    const [conversationId, setConversationId] = useState(0);

    return <ChatContext.Provider value={{conversationId: conversationId, setConversationId: setConversationId}}>
        {props.children}
    </ChatContext.Provider>
};

export default ChatContextProvider;