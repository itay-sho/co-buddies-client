import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import App from './App';
import * as serviceWorker from './serviceWorker';
import axios from 'axios'
import ChatContextProvider from "./context/chat-context";
import * as firebase from "firebase/app";

axios.defaults.baseURL = process.env.REACT_APP_API_BASE_URL;

ReactDOM.render(
    <ChatContextProvider>
        <App />
    </ChatContextProvider>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

const firebaseConfig = {
    apiKey: "AIzaSyCkWIV6dQbYlUa-jU07FZfXGJKC8Kpeb7Q",
    authDomain: "co-buddies.firebaseapp.com",
    databaseURL: "https://co-buddies.firebaseio.com",
    projectId: "co-buddies",
    storageBucket: "co-buddies.appspot.com",
    messagingSenderId: "988924831308",
    appId: "1:988924831308:web:e46ac712f53892b40ab6e9"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);