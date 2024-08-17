import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { createContext, useState, useEffect } from "react";
import { auth, db } from "../config/Firebase";
import { Navigate, useNavigate } from "react-router-dom";

export const AppContext = createContext();

const AppContextProvider = (props) => {
    const [userData, setUserData] = useState(null);
    const [chatData, setChatData] = useState(null);
    const [messagesId, setMessagesId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [chatUser, setChatUser] = useState(null);
    const [chatVisible, setchatVisible] = useState(false);

    const navigate = useNavigate();
    
    const loadUserData = async (uid) => {
        try {
            const userRef = doc(db, 'users', uid);
            const userSnap = await getDoc(userRef);
            const userData = userSnap.data();
            setUserData(userData);
            if (userData.avatar && userData.name) {
               
                navigate('/chat');
            } else {
    
                navigate('/profile');
            }

            await updateDoc(userRef, {
                lastSeen: Date.now()
            });

            setInterval(async () => {
                if (auth.chatUser) { 
                    await updateDoc(userRef, {
                        lastSeen: Date.now()
                    });
                }
            }, 60000);
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    useEffect(() => {
        if(userData){
            const chatRef = doc(db, 'chats', userData.id);
            const unsub = onSnapshot(chatRef, async(res)=>{
                const chatitems = res.data().chatsData;
                const tempdata = [];
                for(const item of chatitems){
                    const userRef = doc(db, 'users', item.rId);
                    const userSnap = await getDoc(userRef);
                    const userData = userSnap.data();
                    tempdata.push({...item, userData})
                }
                setChatData(tempdata.sort((a,b)=> b.updatedAt - a.updatedAt))
            })

            return () => {
                unsub();
            }
        }
        return () => {
            
        };
    }, [userData]);

    const value = {
        userData, setUserData,
        chatData, setChatData,
        loadUserData,
        messages, setMessages,
        messagesId, setMessagesId,
        chatUser, setChatUser,
        chatVisible, setchatVisible

    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider;
