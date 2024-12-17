import React, { useContext, useEffect, useState } from 'react'
import "./RightSideBar.css";
import greendot_pic from "../assets/green_dot.png";
import { logout } from '../config/firebase';
import { AppContext } from '../context/AppContext';

const RightSideBar = () => {

    const {chatUser,messages} = useContext(AppContext);
    const [msgImages, setMsgImages] = useState([]);

    useEffect(()=>{
        let tempVar = [];
        messages.map((msg)=>{
            if(msg.image){
                tempVar.push(msg.image);
            }
        })
        setMsgImages(tempVar);
    },[messages])

    const logoutHandler = () => {
        logout();
    }
    return chatUser ? (
        <div className='rsb text-white bg-[#001030] relative h-[85vh] overflow-y-scroll'>
            {/* right side profile */}
            <div className='pt-[60px] text-center max-w-[80%] m-auto'>
                <img className='w-[110px] aspect-square rounded-[50%] mx-auto bg-gray-200'
                src={chatUser.userData.avatar} alt='profile-picture'/>

                <h3 className='text-[18px] font-normal flex items-center justify-center gap-[5px] my-[5px] mx-0'>
                {chatUser.userData.name}
                {Date.now()-chatUser.userData.lastSeen <= 70000 ? 
                <img className='w-[15px]'
                src={greendot_pic} alt='online-status'/>: null}
                </h3>

                <p className='text-[10px] opacity-[90%] font-light'>{chatUser.userData.bio}</p>

                <hr className='border-[#ffffff50] my-[15px] mx-0'/>
                {/* media section */}
                <div className='mediaDiv py-0 text-[13px] w-full'>
                    <p className='text-start'>Media</p>
                    <div>
                    {msgImages.map((url,index)=>(<img onClick={()=>window.open(url)} key={index} src={url} alt=''/>))}
                    </div>
                </div>
                <button onClick={logoutHandler} className='absolute bottom-[20px] left-[50%] -translate-x-[50%] bg-[#077eff] text-white border-none text-[12px] font-light py-[10px] px-[65px] rounded-[20px] cursor-pointer hover:bg-[#077fffc7]'>Logout</button>
            </div>
        </div>
    ) 
    : (
        <div className='text-white bg-[#001030] relative h-[85vh] overflow-y-scroll' >
            <button onClick={logoutHandler} className='absolute bottom-[20px] left-[50%] -translate-x-[50%] bg-[#077eff] text-white border-none text-[12px] font-light py-[10px] px-[65px] rounded-[20px] cursor-pointer hover:bg-[#077fffc7]'>Logout</button>
        </div>
    )
}

export default RightSideBar