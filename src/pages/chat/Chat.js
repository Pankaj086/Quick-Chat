import React, { useState, useContext, useEffect } from 'react';
import "./Chat.css";
import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
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
        <div className='chat min-h-[100vh] flex justify-center items-center relative z-0' 
            style={{ height: '100vh', position: 'relative', overflow: 'hidden' }}>
            <Canvas style={{ position: 'absolute', top: 0, left: 0, background: 'black' }}>
                <Stars radius={50} depth={50} count={100} factor={8} saturation={1} fade />
            </Canvas>
            <div style={{
                position: 'relative',
                zIndex: 2,
                color: 'white',
                textAlign: 'center',
                top: '50%',
                transform: 'translateY(-50%)'
            }}>
            </div>
            {
                loading ? <p className='loading z-10 text-[50px] text-white'>loading....</p>
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
