import React, { useState, useContext, useEffect } from 'react';
import "./ChatBox.css";
import logo_pic from "../assets/chat_icon.png";
import avatar_pic from "../assets/avatar_icon.png";
import greendot_pic from "../assets/green_dot.png";
import help_icon from "../assets/help_icon.png";
import arrow_icon from "../assets/arrow_icon.png";
import gallery_pic from "../assets/gallery_icon.png";
import send_button from "../assets/send_button.png";
import { AppContext } from '../context/AppContext';
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { toast } from 'react-toastify';
import { uploadFile } from '../library/Upload';

const ChatBox = () => {

    const {userData, messagesId, chatUser, messages, setMessages, chatVisible, setChatVisible} = useContext(AppContext);

    const [input, setInput] = useState("");

    const sendMessage = async ()=> {
        try{
            if(input && messagesId){
                await updateDoc(doc(db,'messages',messagesId),{
                    messages: arrayUnion({
                        sId: userData.id,
                        text: input,
                        createdAt: new Date()
                    })
                })
    
                const userIDs = [userData.id, chatUser.rId];
    
                userIDs.forEach(async (id)=> {
                    const userChatsRef = doc(db,'chats',id);
                    const userChatsSnapshot = await getDoc(userChatsRef);
                    if(userChatsSnapshot.exists()){
                        const userChatData = userChatsSnapshot.data();
                        const chatIndex = userChatData.chatsData.findIndex((c)=>c.messageId === messagesId);
                        userChatData.chatsData[chatIndex].lastMessage = input.slice(0,30);
                        userChatData.chatsData[chatIndex].updatedAt = Date.now();
    
                        if(userChatData.chatsData[chatIndex].rId === userData.id){
                            userChatData.chatsData[chatIndex].messageSeen = false;
                        }
    
                        await updateDoc(userChatsRef,{
                            chatsData: userChatData.chatsData,
                        })
                    }
                })
            }
        } catch(error){
            toast.error(error.message);
        }
        setInput("");
    }

    const sendImage = async (e) => {
        try {
            const file = e.target.files[0];
            const onProgress = (progress) => {
                // console.log(`Upload progress: ${progress}%`);
            };
    
            const fileUrl = await uploadFile(file, onProgress); 
    
            if (fileUrl && messagesId) {
                await updateDoc(doc(db, 'messages', messagesId), {
                    messages: arrayUnion({
                        sId: userData.id,
                        image: fileUrl,
                        createdAt: new Date(),
                    }),
                });
    
                const userIDs = [userData.id, chatUser.rId];
                userIDs.forEach(async (id) => {
                    const userChatsRef = doc(db, 'chats', id);
                    const userChatsSnapshot = await getDoc(userChatsRef);
                    if (userChatsSnapshot.exists()) {
                        const userChatData = userChatsSnapshot.data();
                        const chatIndex = userChatData.chatsData.findIndex(
                            (c) => c.messageId === messagesId
                        );
                        userChatData.chatsData[chatIndex].lastMessage = 'Photo';
                        userChatData.chatsData[chatIndex].updatedAt = Date.now();
    
                        if (userChatData.chatsData[chatIndex].rId === userData.id) {
                            userChatData.chatsData[chatIndex].messageSeen = false;
                        }
    
                        await updateDoc(userChatsRef, {
                            chatsData: userChatData.chatsData,
                        });
                    }
                });
            }
        } catch (error) {
            toast.error(error.message);
        }
    };
    

    // time ko convert
    const convertTime = (timestamp)=>{
        let date = timestamp.toDate();
        const hour = date.getHours();
        const minute = date.getMinutes();
        if(hour>12){
            return hour-12 + ":" + minute + "PM";
        }
        else{
            return hour + ":" + minute + "AM";
        }
    }

    useEffect(()=>{
        if(messagesId){
            const unSub = onSnapshot(doc(db,'messages',messagesId),(res)=>{
                setMessages(res.data().messages.reverse())
                // console.log(res.data().messages.reverse());
                
            })
            return ()=>{
                unSub();
            }
        }
    },[messagesId, setMessages])

    return chatUser ? (
        <div className={`chat-box h-[85vh] relative bg-[#f1f5ff] ${!chatVisible ? "md:block hidden" : ""}`}>
            {/* chat user */}
            <div className='chat-user px-[15px] py-[10px] flex items-center gap-[10px]'>
                <img className='w-[38px] rounded-[50%] aspect-square bg-gray-200'
                src={chatUser.userData.avatar || avatar_pic} alt='profile-picture'/>
                <p className='flex-1 font-medium text-[20px] text-[#393939] flex items-center gap-[5px]'>{chatUser.userData.name} 
                    {Date.now()-chatUser.userData.lastSeen <= 70000 ? 
                    <img className='w-[15px]'
                    src={greendot_pic} alt='online-status'/>: null}
                </p>
                <img className='help w-[28px]' src={help_icon} alt='help-icon'/>
                <img onClick={()=>setChatVisible(false)} src={arrow_icon} className='arrow w-[28px]' alt='arrow-icon'/>
            </div>

            {/* chat messages */}
            <div className='chat-messages pb-[50px] overflow-y-scroll flex flex-col-reverse'>
                {messages.map((msg,index)=>(
                    <div className={`flex items-end justify-end gap-[5px] px-[15px] py-0 ${msg.sId === userData.id ? 'msg-s' : 'msg-r'}`} key={index}>

                        {msg["image"] ? 
                        <img onClick={()=>window.open(msg.image)} className='max-w-[230px] max-h-[230px] mb-[30px] rounded-[10px] cursor-pointer' src={msg.image} alt="User-uploaded content"/> :

                        <p className={`message text-white p-[8px] max-w-[270px] text-[11px] font-light mb-[30px] ${msg.sId === userData.id ? 'msg-s' : 'msg-r'}`}>
                        {msg.text}</p>
                        }
                        <div>
                            <img className='w-[27px] aspect-square rounded-[50%]' 
                            src={msg.sId === userData.id ? userData.avatar || avatar_pic : chatUser.userData.avatar || avatar_pic} alt="profile-picture"/>
                            <p className='text-center text-[9px]'>{convertTime(msg.createdAt)}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* chat input */}
            <div className='chat-input flex items-center gap-[12px] px-[15px] py-[10px] bg-white absolute bottom-0 left-0 right-0'>

                <input onChange={(e)=>setInput(e.target.value)} value={input} className='flex-1 border-none outline-none'
                type='text' placeholder='Type a message'/>
                <input onChange={sendImage} type='file' id='image' accept='image/png, image.jpeg' hidden/>
                <label className='flex' htmlFor='image'>
                    <img className='w-[22px] cursor-pointer' src={gallery_pic} alt="gallery-picture"/>
                </label>
                <img onClick={sendMessage} className='w-[30px] cursor-pointer' src={send_button} alt=""/>
            </div>
        </div>
    )
    : 
    // welcome div if no chatUser is selected yet
    <div className={`w-[100%] flex flex-col justify-center items-center gap-[5px] ${!chatVisible ? "md:flex hidden" : ""}`}>
        <img className='w-[60px]' src={logo_pic} alt="logo-picture"/>
        <p className='text-[20px] font-medium text-[#383838]'>Chat anytime, anywhere</p>
    </div>
}

export default ChatBox;