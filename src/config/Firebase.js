import { createUserWithEmailAndPassword, getAuth, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, setDoc, doc, collection, query, where, getDoc, getDocs } from "firebase/firestore";
import { toast } from "react-toastify";

const firebaseConfig = {
    apiKey: "AIzaSyBpqKL97Z8R-kODJ7D4Uyx77DK_HeS7bu0",
    authDomain: "mychatapp-a4564.firebaseapp.com",
    projectId: "mychatapp-a4564",
    storageBucket: "mychatapp-a4564.appspot.com",
    messagingSenderId: "1071332041652",
    appId: "1:1071332041652:web:b0a7fd03fc20b13ffe08e1",
    measurementId: "G-6G7FRNLWBJ"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const auth = getAuth(app);

const db = getFirestore(app);

const signup = async (username, email, password) => {

    try {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        const user = res.user;
        await setDoc(doc(db, "users", user.uid), {
            id: user.uid,
            username: username.toLowerCase(),
            email,
            name: "",
            avatar: "",
            bio: "Hey, There I am using chat app",
            lastSeen: Date.now()
        })

        await setDoc(doc(db, "chats", user.uid), {
            chatsData: []
        })
    } catch (error) {
        console.error(error)
        toast.error(error.code.split('/')[1].split('-').join(" "))
    }

}


const login = async (email, password) => {
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        console.error(error);
        toast.error(error.code.split('/')[1].split('-').join(" "))
    }
}

const logout = async () => {
    try {
        await signOut(auth)
    } catch (error) {
        console.error(error);
        toast.error(error.code.split('/')[1].split('-').join(" "))
    }

}

const resetPass = async (email)=>{
    if(!email){
        toast.error("Enter the email");
        return null;
    }
    try {
        const userRef = collection(db, 'users');
        const q = query(userRef, where("email", "==", email));
        const querySnap = await getDocs(q);

        if(!querySnap.empty){
            await sendPasswordResetEmail(auth,email);
            toast.success("Reset Email Sent")
        }
        else{
            toast.error("Email doesn't exist")
        }

    } catch (error) {
        console.error(error);
        toast.error(error.message)
    }

}

export { signup, login, logout,auth,db, resetPass}