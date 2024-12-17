import React, { useContext, useEffect } from 'react'
import { Route, Routes } from 'react-router-dom';
import Login from "./pages/login&signup/Login";
import Signup from './pages/login&signup/Signup';
import Chat from './pages/chat/Chat';
import ProfileUpdate from './pages/profileUpdate/ProfileUpdate';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import { useNavigate } from 'react-router-dom';
import { AppContext } from './context/AppContext';

const App = () => {

    const navigate = useNavigate();

    const {loadUserData} = useContext(AppContext);

    useEffect(()=>{
        onAuthStateChanged(auth, async (user)=> {
            if(user){
                navigate('/chat');
                await loadUserData(user.uid);
            }
            else{
                navigate('/');
            }
        })
    },[])

    return (
        <>
            <ToastContainer/>
            <Routes>
                <Route path='/' element={<Signup/>}/>
                <Route path='/login' element={<Login/>}/>
                <Route path='/chat' element={<Chat/>}/>
                <Route path='/profile' element={<ProfileUpdate/>}/>
            </Routes>
        </>
    )
}

export default App;