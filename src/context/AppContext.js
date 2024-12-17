import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { createContext, useEffect, useState } from "react";
import { auth, db } from "../config/firebase";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export const AppContext = createContext();

const AppContextProvider = (props) => {
    const [userData, setUserData] = useState(null);
    const [chatData, setChatData] = useState(null);
    const [messagesId, setMessagesId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [chatUser, setChatUser] = useState(null);
    const [chatVisible, setChatVisible] = useState(false);
    const navigate = useNavigate();

    const loadUserData = async (uid) => {
        if (!uid) {
            toast.error("User ID is undefined");
            return;
        }

        try {
            const userRef = doc(db, "users", uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                throw new Error("User document does not exist.");
            }

            const userData = userSnap.data();
            setUserData(userData);

            if (userData.avatar && userData.name) {
                navigate("/chat");
            } else {
                navigate("/profile");
            }

            await updateDoc(userRef, { lastSeen: Date.now() });

            const intervalId = setInterval(async () => {
                if (auth.chatUser) {
                    await updateDoc(userRef, { lastSeen: Date.now() });
                }
            }, 60000);

            return () => clearInterval(intervalId);
        } catch (error) {
            toast.error(
                error.code?.split("/")[1]?.split("-").join(" ") ||
                error.message ||
                "Something went wrong"
            );
        }
    };

    useEffect(() => {
        if (userData) {
            const chatRef = doc(db, "chats", userData.id);

            const unSub = onSnapshot(chatRef, async (response) => {
                const chatItems = response.exists() ? response.data()?.chatsData || [] : [];
                const tempData = [];

                for (const item of chatItems) {
                    const userRef = doc(db, "users", item.rId);
                    const userSnap = await getDoc(userRef);
                    const userData = userSnap.data();

                    if (userData) {
                        tempData.push({ ...item, userData });
                    }
                }

                setChatData(tempData.sort((a, b) => b.updatedAt - a.updatedAt));
            });

            return () => unSub();
        } 
    }, [userData]);

    const value = {
        userData, setUserData,
        chatData, setChatData,
        messages, setMessages,
        messagesId, setMessagesId,
        chatUser, setChatUser,
        chatVisible, setChatVisible,
        loadUserData,
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};

export default AppContextProvider;
