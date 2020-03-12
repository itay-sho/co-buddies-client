import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import App from './App';
import axios from 'axios'
import ChatContextProvider from "./context/chat-context";
import * as firebase from "firebase/app";
import "firebase/messaging";

axios.defaults.baseURL = process.env.REACT_APP_API_BASE_URL;

const render_react_dom = () => {
    ReactDOM.render(
        <ChatContextProvider>
            <App />
        </ChatContextProvider>,
        document.getElementById('root')
    );
};

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();

const firebaseConfig = {
    apiKey: "AIzaSyCkWIV6dQbYlUa-jU07FZfXGJKC8Kpeb7Q",
    authDomain: "co-buddies.firebaseapp.com",
    databaseURL: "https://co-buddies.firebaseio.com",
    projectId: "co-buddies",
    storageBucket: "co-buddies.appspot.com",
    messagingSenderId: "988924831308",
    appId: "1:988924831308:web:e46ac712f53892b40ab6e9"
};

// we are rendering react regardless if the serviceworker registration succeeds. the reason that we do that
// from the beginning is there is a race condition between the useServiceWorker and the getToken call in the react dom
firebase.initializeApp(firebaseConfig);
let was_react_dom_rendered = false;
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register(`${process.env.PUBLIC_URL}/firebase-messaging-sw.js`).then(registration => {
        firebase.messaging().useServiceWorker(registration);
        render_react_dom();
        was_react_dom_rendered = true;
    });
}
if (!was_react_dom_rendered) {
    render_react_dom();
    was_react_dom_rendered = true;
}
