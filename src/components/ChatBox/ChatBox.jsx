import React, { useContext, useEffect, useState } from 'react'
import './ChatBox.css'
import assets from '../../assets/assets'
import { AppContext } from '../../context/AppContext'
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from '../../config/Firebase'
import { toast } from 'react-toastify'
import upload from '../../lib/upload'


const ChatBox = () => {


    const { userData, messagesId, chatUser, messages, setMessages, chatVisible, setchatVisible } = useContext(AppContext);

    const [input, setinput] = useState("");

    const sendmessage = async () => {
        try {
            if (input && messagesId) {
                await updateDoc(doc(db, 'messages', messagesId), {
                    messages: arrayUnion({
                        sId: userData.id,
                        text: input,
                        createdAt: new Date()
                    })
                });
    
                const userIds = [chatUser.rId, userData.id];
    
                userIds.forEach(async (id) => {
                    const userChatRef = doc(db, 'chats', id);
                    const userChatsSnapshot = await getDoc(userChatRef);
    
                    if (userChatsSnapshot.exists()) {
                        const userchatdata = userChatsSnapshot.data();
                        const chatIndex = userchatdata.chatsData.findIndex((c) => c.messageId === messagesId);
    
                        // Ensure chatIndex is valid before proceeding
                        if (chatIndex !== -1) {
                            userchatdata.chatsData[chatIndex].lastMessage = input.slice(0, 30);
                            userchatdata.chatsData[chatIndex].updatedAt = Date.now();
                            if (userchatdata.chatsData[chatIndex].rId === userData.id) {
                                userchatdata.chatsData[chatIndex].messageSeen = false;
                            }
                            await updateDoc(userChatRef, {
                                chatsData: userchatdata.chatsData
                            });
                        } else {
                            // Handle the case where chatIndex is -1 (optional)
                            console.error("Chat index not found for messageId:", messagesId);
                        }
                    }
                }); // <-- Corrected line
            }
        } catch (error) {
            toast.error(error.message);
        }
        setinput("");
    };
    

    const sendImage = async (e) => {
        try {
            const fileUrl = await upload(e.target.files[0]);

            if (fileUrl && messagesId) {
                await updateDoc(doc(db, 'messages', messagesId), {
                    messages: arrayUnion({
                        sId: userData.id,
                        image: fileUrl,
                        createdAt: new Date()
                    })
                })

                const userIds = [chatUser.rId, userData.id];

                userIds.forEach(async (id) => {
                    const userChatRef = doc(db, 'chats', id);
                    const userChatsSnapshot = await getDoc(userChatRef);

                    if (userChatsSnapshot.exists()) {
                        const userchatdata = userChatsSnapshot.data();
                        const chatIndex = userchatdata.chatsData.findIndex((c) => c.messageId === messagesId);
                        userchatdata.chatsData[chatIndex].lastMessage = "Image";
                        userchatdata.chatsData[chatIndex].updatedAt = Date.now();
                        if (userchatdata.chatsData[chatIndex].rId === userData.id) {
                            userchatdata.chatsData[chatIndex].messageSeen = false;
                        }
                        await updateDoc(userChatRef, {
                            chatsData: userchatdata.chatsData
                        })
                    }
                })

            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const convertTimeStamp = (timestamp) => {
        let date = timestamp.toDate();
        const hour = date.getHours();
        const minute = date.getMinutes();
        if (hour > 12) {
            return hour - 12 + ":" + minute + "PM";
        }
        else {
            return hour + ":" + minute + "AM";
        }
    }

    useEffect(() => {
        if (messagesId) {
            console.log("Current messagesId:", messagesId); // Debugging line
            const unSub = onSnapshot(doc(db, 'messages', messagesId), (res) => {
                setMessages(res.data().messages.reverse());
            });
            return () => {
                unSub();
            };
        }
    }, [messagesId]);


    return chatUser ? (
        <div className={`chat-box ${chatVisible ? "" : "hidden"}`}>
            <div className="chat-user">
                <img src={chatUser.userData.avatar} alt="" />
                <p>{chatUser.userData.name}{Date.now() - chatUser.userData.lastSeen <= 70000 ? <img className='dot' src={assets.green_dot} /> : null}</p>
                <img src={assets.help_icon} className='help' alt="" />
                <img onClick={() => setchatVisible(false)} src={assets.arrow_icon} className='arrow' alt="" />
            </div>

            <div className="chat-message">

                {messages.map((msg, index) => (
                    <div key={index} className={msg.sId === userData.id ? "s-message" : "r-message"}>

                        {msg["image"]
                            ? <img className='msg-img' src={msg.image} />
                            : <p className='message'>{msg.text}</p>
                        }

                        <div>
                            <img src={msg.sId === userData.id ? userData.avatar : chatUser.userData.avatar} alt="" />
                            <p>{convertTimeStamp(msg.createdAt)}</p>
                        </div>
                    </div>
                ))}

            </div>
            <div className="chat-input">
                <input onChange={(e) => setinput(e.target.value)} value={input} type="text" placeholder='Send a message' />
                <input onChange={sendImage} type="file" id='image' accept='image/png, image/jpeg' hidden />
                <label htmlFor="image">
                    <img src={assets.gallery_icon} alt="" />
                </label>
                <img onClick={sendmessage} src={assets.send_button} alt="" />
            </div>

        </div>
    )
        : <div className={`chat-welcome ${chatVisible ? "" : "hidden"}`}>
            <img src={assets.logo_icon} alt="" />
            <p>Chat anytime, anywhere with chatApp!!</p>
        </div>

}

export default ChatBox
