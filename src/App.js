import React from 'react';
import ChatContainer from "./ChatContainer";
import PageFooter from "./PageFooter";

import './App.scss';
import 'bootstrap/dist/css/bootstrap.css';

const App = () => {
    return (
        <div className="App">
            <ChatContainer></ChatContainer>
            <PageFooter></PageFooter>
        </div>
    );
};

export default App;
