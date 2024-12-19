import React, { useState, useContext, useEffect } from 'react';
import "./Chat.css";
import LeftSideBar from '../../components/LeftSideBar';
import RightSideBar from '../../components/RightSideBar';
import ChatBox from '../../components/ChatBox';
import { AppContext } from '../../context/AppContext';

const Chat = () => {

    const { chatData, userData } = useContext(AppContext);
    const [loading, setLoading] = useState(true);

    useEffect(()=>{
        if(chatData && userData){
            setLoading(false);
        }
    },[chatData,userData])
    return (
        <div className='chat min-h-[100vh] flex justify-center items-center relative z-0 bg-black' >
            {
                loading ?
                <div className="loader">Loading
                    <span></span>
                </div>
                :
                <div className='bg-white chat-container w-[100%] h-[85vh] max-w-[1000px] grid grid-cols-3 absolute z-10'>
                    <LeftSideBar/>
                    <ChatBox/>
                    <RightSideBar/>
                </div>
            }
        </div>
    );
};

export default Chat;
