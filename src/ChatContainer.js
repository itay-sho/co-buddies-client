import React, {useState} from 'react';
import ChatBox from "./ChatBox";

import './ChatContainer.scss';
import ChatInput from "./ChatInput";
import axios from  'axios';
import crypto from 'crypto'

const ChatContainer = () => {
    const [pageState, updatePageState] = useState(localStorage.getItem('API_KEY') !== null ? 'chat': 'welcome');
    const [formState, setFormState] = useState({
        fullName: '',
        age: '',
        reasonToIsolation: '',
    });
    const inputChanged = (e) => {
        const targetName = e.target.name;
        setFormState({
            ...formState,
            [targetName]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const username = crypto.randomBytes(10).toString('hex');
        const password = crypto.randomBytes(20).toString('hex');

        axios.post('/registration/', {
            username: username,
            password1: password,
            password2: password,
            name: formState.fullName,
            reason_to_isolation: formState.reasonToIsolation,
            age: formState.age,
        }).then(response => {
            if (response.status === 201) {
                localStorage.setItem('API_KEY', response.data.key);
                localStorage.setItem('USER_ID', response.data.id);
                updatePageState('chat');
            } else {
                alert(response.status);
            }
        });
    };

    const render_page = () => {
        switch (pageState) {
            case 'chat':
                return(
                    <div className="d-flex flex-column chat-flex">
                        <ChatBox/>
                        <ChatInput/>
                    </div>
                );
            case 'welcome':
                return(
                    <div className="d-flex flex-column chat-flex justify-content-center">
                        <div className="text-center rtl no-chat-windows">
                            <img src={process.env.PUBLIC_URL + '/logo.png'} alt="logo" className="logo" />
                            <p>
                                ברוכים הבאים לאתר Co-Buddies!
                                <br />
                                באתר תוכלו לצ'וטט עם חברים נוספים הנמצאים בבידוד
                            </p>
                            <form onSubmit={handleSubmit}>
                                <div className="p-2">
                                    <input type="text" onChange={inputChanged} value={formState.fullName} name="fullName" placeholder="שם מלא" className="chat-input" required={true} />
                                </div>
                                <div className="p-2">
                                    <input type="number" onChange={inputChanged} value={formState.age} name="age" placeholder="גיל" min="1" className="chat-input" required={true}/>
                                </div>
                                <div className="p-2">
                                    <textarea onChange={inputChanged} value={formState.reasonToIsolation} placeholder="סיבת בידוד" name="reasonToIsolation" className="chat-input" maxLength="300" required={true} />
                                </div>
                                <div className="p-2">
                                    <input type="submit" className="btn btn-primary btn-lg" value="התחילו לצ'וטט!" />
                                </div>
                            </form>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };
    return (
        <div className="ChatContainer container">
            {render_page()}
        </div>
    );
};

export default ChatContainer;
