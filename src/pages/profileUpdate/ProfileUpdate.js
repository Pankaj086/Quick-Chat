import React, { useEffect, useState, useContext } from 'react';
import "./ProfileUpdate.css";
import avatar_pic from "../../assets/avatar_icon.png";
import { uploadFile } from '../../library/Upload';
import { toast } from "react-toastify";
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';

const ProfileUpdate = () => {
    const [image, setImage] = useState(null);
    const [imageUrl, setImageUrl] = useState(''); // Store the uploaded image URL
    const [uploadProgress, setUploadProgress] = useState(0); // Upload progress
    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [uid, setUid] = useState("");
    const navigate = useNavigate();
    const { setUserData } = useContext(AppContext);

    // Handle file input change
    const changeHandler = (e) => {
        setImage(e.target.files[0]);
    };

    // Bio handler
    const bioHandler = (e) => {
        setBio(e.target.value);
    };

    // Name handler
    const nameHandler = (e) => {
        setName(e.target.value);
    };

    // Handle save button click (upload the file)
    const handleSave = async (e) => {
        e.preventDefault();

        if (!uid) {
            toast.error("User not authenticated. Please login again.");
            return;
        }

        const docRef = doc(db, "users", uid);
        const snap = await getDoc(docRef);
        const data = snap.data();
        console.log("data is: ",data);

        if (
            data.name === name &&
            data.bio === bio &&
            (!image || data.avatar === URL.createObjectURL(image))
        ) { 
            toast.info("No changes to profile.");
            navigate('/chat');
            return;
        }

        if (image) {
            const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg'];
            if (!allowedTypes.includes(image.type)) {
                toast.error('Please upload a valid image (PNG, JPG, JPEG)');
                return;
            }

            try {
                const uploadedImageUrl = await uploadFile(image, (progress) => {
                    setUploadProgress(progress);
                });

                await updateDoc(docRef, {
                    avatar: uploadedImageUrl,
                    bio: bio,
                    name: name,
                });

                setImageUrl(uploadedImageUrl); 
                setUploadProgress(0);
                toast.success('Profile updated successfully!');
            } catch (error) {
                toast.error('Error updating profile.');
                setUploadProgress(0);
            }
        } else {
            await updateDoc(docRef, {
                bio: bio,
                name: name,
            });
        }
        setUserData(data);
        navigate('/chat');
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUid(user.uid);
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setName(data.name || "");
                    setBio(data.bio || "");
                    setImageUrl(data.avatar || "");
                }
            } else {
                navigate('/');
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    return (
        <div className='profileDiv min-h-[100vh] flex items-center justify-center'>
            <div className='profile-content bg-gradient-to-b from-blue-50 to-blue-100 flex items-center justify-between min-w-[700px] rounded-[10px] flex-col-reverse md:flex-row bg-opacity-10'>

                <form className='profile-form flex flex-col gap-[10px] md:gap-[20px] p-[40px]' onSubmit={handleSave}>
                    <h3 className='font-medium'>Profile Details</h3>

                    <label className='flex items-center gap-[10px] text-gray-600 cursor-pointer' htmlFor='avatar'>
                        <input onChange={changeHandler} type='file' id='avatar' accept='.png, .jpg, .jpeg' hidden />
                        <img
                            className='w-[50px] aspect-square rounded-[50%] border-2 border-orange-400'
                            src={image ? URL.createObjectURL(image) : imageUrl || avatar_pic}
                            alt='avatar-icon'
                        />
                        {image || imageUrl ? 'Update Profile Image' : 'Upload Profile Image'}
                    </label>

                    <input
                        className='input-textarea-profile-update outline-[#077eff] p-[10px] min-w-[300px]'
                        type='text'
                        placeholder='Your Name'
                        required
                        onChange={nameHandler}
                        value={name}
                    />

                    <textarea
                        className='input-textarea-profile-update outline-[#077eff] p-[10px] min-w-[300px]'
                        placeholder='Write profile bio'
                        required
                        onChange={bioHandler}
                        value={bio}
                    ></textarea>

                    <button className='border-none text-white bg-[#077eff] p-[8px] text-[16px] cursor-pointer' type='submit'>
                        Save
                    </button>
                </form>

                {/* Show loading spinner while uploading */}
                {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="flex items-center justify-center my-4">
                        <div className="loaderProfile"></div> {/* Add a CSS spinner */}
                    </div>
                )}

                {/* Display uploaded image */}
                <img
                    className='profile-img w-[120px] md:max-w-[160px] aspect-square mx-auto my-[20px] rounded-[50%] border-2 border-orange-400'
                    src={image ? URL.createObjectURL(image) : imageUrl || avatar_pic}
                    alt='logo-picture'
                />
            </div>
        </div>
    );
};

export default ProfileUpdate;
