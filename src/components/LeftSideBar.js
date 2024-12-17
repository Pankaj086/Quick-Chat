import React, { useContext, useEffect, useState } from 'react';
import "./LeftSideBar.css";
import logo_pic from "../assets/logo.png";
import menu_icon from "../assets/menu_icon.png";
import search_pic from "../assets/search_icon.png";
import avatar_pic from "../assets/avatar_icon.png";
import { useNavigate } from 'react-router-dom';
import { db, logout } from '../config/firebase';
import { arrayUnion, collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';

const LeftSideBar = () => {
    const navigate = useNavigate();
    const { userData, chatData, chatUser, setChatUser, messagesId, setMessagesId, chatVisible, setChatVisible } = useContext(AppContext);
    const [user, setUser] = useState(null);
    const [showSearch, setShowSearch] = useState(false);

    const editProfileHandler = () => {
        navigate('/profile');
    }

    const logoutHandler = () => {
        logout();
    }

    const inputHandler = async (e) => {
        try {
            const input = e.target.value;
            if (input) {
                setShowSearch(true);
                const userRef = collection(db, "users");
                const q = query(userRef, where("username", "==", input.toLowerCase()));
                const querySnap = await getDocs(q);
    
                if (!querySnap.empty && querySnap.docs[0]?.data().id !== userData.id) {
                    let userExist = false;
                    chatData.map((user) => {
                        if(user.rId === querySnap.docs[0]?.data().id){
                            userExist = true;
                        }
                    })
                    if(!userExist){
                        const foundUser = querySnap.docs[0]?.data();
                        setUser(foundUser);
                    }
                } else {
                    setUser(null);
                }
            } else {
                setShowSearch(false);
            }
        } catch (error) {
            toast.error(error.message || "Error during search.");
            console.error("Search error:", error);
        }
    };
    
    
    // after searching if click on any user to save that user data
    const addChat = async () => {
        try {
            const messagesRef = collection(db, "messages");
            const chatsRef = collection(db, "chats");

            const userChatExist = chatData.some(chat => chat.rId === user.id);
            
            if(userChatExist){
                return;
            }

            else{
                const newMessageRef = doc(messagesRef);
    
            // Create a new message document
            await setDoc(newMessageRef, {
                createdAt: serverTimestamp(),
                messages: [],
            });
    
            // chat for the selected user
            await updateDoc(doc(chatsRef, user.id), {
                chatsData: arrayUnion({
                    messageId: newMessageRef.id,
                    lastMessage: "",
                    rId: userData.id,
                    updatedAt: Date.now(),
                    messageSeen: true,
                }),
            });
    
            // chat for the logged-in user
            await updateDoc(doc(chatsRef, userData.id), {
                chatsData: arrayUnion({
                    messageId: newMessageRef.id,
                    lastMessage: "",
                    rId: user.id,
                    updatedAt: Date.now(),
                    messageSeen: true,
                }),
            });

            const userSnap = await getDoc(doc(db,"users",user.id));
            const uData = userSnap.data();
            setChat({
                messagesId:newMessageRef.id,
                lastMessage:"",
                rId:user.id,
                updatedAt:Date.now(),
                messageSeen:true,
                userData:uData
            })

            setShowSearch(false);
            setChatVisible(true);
            }
    
            // toast.success("Chat added successfully!");
        } catch (error) {
            toast.error(error.message || "Failed to add chat.");
            console.error("Error adding chat:", error);
        }
    };
    
    const setChat = async (item)=> {
        // console.log(item);
        try {
            setMessagesId(item.messageId);
            setChatUser(item);
            const userChatsRef = doc(db,"chats",userData.id);
            const userChatsSnapshot = await getDoc(userChatsRef);
            const userChatsData = userChatsSnapshot.data();
            const chatIndex = userChatsData.chatsData.findIndex((c)=>c.messageId === item.messageId);
            userChatsData.chatsData[chatIndex].messageSeen = true;

            await updateDoc(userChatsRef,{
                chatsData: userChatsData.chatsData
            })
            setChatVisible(true);
        } catch (error) {
            toast.error(error.message);
        }
    }

    useEffect(()=>{
        const updateChatUserData = async ()=> {
            if(chatUser){
                const userRef = doc(db,"users",chatUser.userData.id);
                const userSnap = await getDoc(userRef);
                const userData = userSnap.data();
                setChatUser(prev=>({...prev,userData:userData}))
            }
        }
        updateChatUserData();
    },[chatData])
    
    return (
        <div className={`lsb bg-[#001030] text-white h-[85vh] ${chatVisible ? "md:block hidden" : ""}`}>

            {/* lsb-top-section */}
            <div className='p-[20px]'>

                {/* navbar section */}
                <div className='flex justify-between items-center'>

                    {/* app logo */}
                    <img
                        className='max-w-[140px]'
                        src={logo_pic}
                        alt='logo-picture'
                    />

                    {/* menu icon */}
                    <div className='menu relative py-[10px] px-0'>
                        <img
                            className='max-h-[20px] opacity-70 cursor-pointer'
                            src={menu_icon}
                            alt='menu-picture'
                        />
                        {/* sub menu */}
                        <div className='submenu absolute top-[100%] right-0 w-[130px] p-[16px] rounded-[5px] bg-white text-black'>
                            <p onClick={editProfileHandler}
                            className='cursor-pointer text-13px'>Edit Profile</p>
                            <hr className='border-none h-[1px] bg-[#a4a4a4] my-[8px] mx-0'/>
                            <p onClick={logoutHandler} className='cursor-pointer text-13px'>Logout</p>
                        </div>
                    </div>
                </div>

                {/* search field */}
                <div className='bg-[#002670] flex items-center gap-[10px] px-[12px] py-[10px] mt-[20px]'>

                    <img
                        className='w-[16px]'
                        src={search_pic}
                        alt='searchicon-picture'
                    />

                    <input onChange={inputHandler}
                        className='w-full input-feild-search bg-transparent border-none outline-none text-white text-[15px]'
                        type='text'
                        placeholder='Search here...'
                    />
                </div>

            </div>

            {/* multiple users lists */}
            <div className='flex flex-col h-[75%] overflow-y-auto'>

                { showSearch && user ? 
                    <div onClick={addChat}
                        className="flex items-center gap-[10px] py-[10px] px-[20px] text-[13px] cursor-pointer group hover:bg-[#077EFF] transition-all duration-200"
                    >
                        <img
                            className="w-[35px] aspect-square rounded-[50%] bg-gray-200"
                            src={user.avatar || avatar_pic}
                            alt="profile-picture"
                        />
                        <div className="flex flex-col">
                            <p>{user.name}</p>
                            <span className="text-[#9f9f9f] text-[11px] group-hover:text-white">
                                Hello, How are you ?
                            </span>
                        </div>
                    </div>
                : chatData.map((item, index) => (
                    <div
                        key={index}
                        onClick={()=>setChat(item)}
                        className={`flex items-center gap-[10px] py-[10px] px-[20px] text-[13px] cursor-pointer group hover:bg-[#077EFF] transition-all duration-200 ${item.messageSeen || item.messageId === messagesId ? "" : "border-msg"}`}
                    >
                        <img
                            className="w-[35px] aspect-square rounded-[50%] bg-gray-200"
                            src={item.userData.avatar || avatar_pic}
                            alt="profile-picture"
                        />
                        <div className="flex flex-col">
                            <p>{item.userData.name}</p>
                            <span className="text-[#9f9f9f] text-[11px] group-hover:text-white">
                                {item.lastMessage.split(' ').slice(0, 5).join(' ')}{item.lastMessage.split(' ').length > 5 ? '...' : ''}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
}

export default LeftSideBar;
