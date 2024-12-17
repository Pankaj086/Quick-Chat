import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getFirestore, setDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { toast } from "react-toastify";

const firebaseConfig = {
    apiKey: "AIzaSyBL-0V30cqWxYfLPByV6kmoH__tsaSufXc",
    authDomain: "quick-chat-app-87571.firebaseapp.com",
    projectId: "quick-chat-app-87571",
    storageBucket: "quick-chat-app-87571.firebasestorage.app",
    messagingSenderId: "438854852059",
    appId: "1:438854852059:web:4088ba7de9634ec614dbfe"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

// Sign up with email and password
const signup = async (username, email, password) => {
    try {
        const response = await createUserWithEmailAndPassword(auth, email, password);
        const user = response.user;

        // Save user data to Firestore
        await setDoc(doc(db, "users", user.uid), {
            id: user.uid,
            username: username.toLowerCase(),
            email: email,
            name: "",
            avatar: "",
            bio: "Hey, There! I am using Quick Chat!",
            lastSeen: Date.now()
        });

        // Initialize an empty chat document for the user
        await setDoc(doc(db, "chats", user.uid), {
            chatsData: []
        });

        toast.success("User created successfully!");
    } catch (error) {
        console.error("Error signing up:", error);
        // Display a more informative error message
        toast.error(error?.code?.split('/')[1]?.split('-').join(" ") || "Something went wrong during signup!");
    }
};

// login 
const login = async (email, password) => {
    try{
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Logged In successfully!");
    } catch(error){
        console.error("Error logging in:", error);
        toast.error(error?.code?.split('/')[1]?.split('-').join(" ") || "Something went wrong during login!");
    }
}

// Sign up with Google
const signupWithGoogle = async () => {
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Check if the user exists in Firestore, if not, create a new user
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            // Save user data to Firestore
            await setDoc(userDocRef, {
                id: user.uid,
                username: user.displayName || "Unnamed User", // You can update this later
                email: user.email,
                avatar: user.photoURL || "",
                bio: "Hey, There! I am using Quick Chat!",
                lastSeen: Date.now()
            });

            // Initialize an empty chat document for the user
            await setDoc(doc(db, "chats", user.uid), {
                chatsData: [] // Note: corrected from `chatData` to `chatsData`
            });
        }

        toast.success("Signed up successfully!");
    } catch (error) {
        console.error("Error signing up with Google:", error);
        toast.error(error?.code?.split('/')[1]?.split('-').join(" ") || "Something went wrong during Google sign-up!");
    }
};

// logout
const logout = async () => {
    try{
        await signOut(auth);
        toast.success("Logged out successfully!");
    }
    catch(error){
        toast.error(error?.code?.split('/')[1]?.split('-').join(" ") || "Something went wrong");
    }
}

const resetPassword = async (email)=> {
    if(!email){
        toast.error("Enter your email");
        return null;
    }
    try{
        const userRef = collection(db,"users");
        const q = query(userRef,where("email","==",email));
        const querySnap = await getDocs(q);
        if(!querySnap.empty){
            await sendPasswordResetEmail(auth,email);
            toast.success("Reset Email Sent");
        }
        else{
            toast.error("Email doesn't exist");
        }
    } catch(error){
        console.log(error);
        toast.error(error.message);
    }
}

export { signup, signupWithGoogle, login, logout, auth, db, resetPassword };
