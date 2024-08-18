import React, { useContext, useEffect, useState } from 'react'
import './LeftSideBar.css'
import assets from '../../assets/assets'
import { useNavigate } from 'react-router-dom'
import { arrayUnion, collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore'
import { db } from '../../config/Firebase'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-toastify'
import { logout } from '../../config/Firebase'
const LeftSideBar = () => {


  const navigate = useNavigate();
  const { userData, chatData, messagesId, setMessagesId, messages, setMessages, chatUser, setChatUser, chatVisible, setchatVisible } = useContext(AppContext);
  const [user, setuser] = useState(null);
  const [showSearch, setshowSearch] = useState(false);


  const inputHandler = async (e) => {
    try {
      const input = e.target.value;
      if (input) {
        setshowSearch(true);
        const userRef = collection(db, 'users');
        const q = query(userRef, where("username", "==", input.toLowerCase()));
        const querysnap = await getDocs(q);

        if (!querysnap.empty && querysnap.docs[0].data().id !== userData.id) {

          let userExist = false
          chatData.map((user) => {
            if (user.rId === querysnap.docs[0].data().id) {
              userExist = true;
            }
          })
          if (!userExist) {
            setuser(querysnap.docs[0].data());
          }

        }
        else {
          setuser(null);
        }
      }
      else {
        setshowSearch(false);
      }
    } catch (error) {

    }
  }


  const addchat = async () => {

    const messagesRef = collection(db, "messages");
    const chatRef = collection(db, "chats");
    try {
      const newmessageRef = doc(messagesRef);
      await setDoc(newmessageRef, {
        createAt: serverTimestamp(),
        messages: []
      })

      await updateDoc(doc(chatRef, user.id), {
        chatsData: arrayUnion({
          messageId: newmessageRef.id,
          lastMessage: "",
          rId: userData.id,
          updatedAt: Date.now(),
          messageSeen: true
        })
      })

      await updateDoc(doc(chatRef, userData.id), {
        chatsData: arrayUnion({
          messageId: newmessageRef.id,
          lastMessage: "",
          rId: user.id,
          updatedAt: Date.now(),
          messageSeen: true
        })
      })

      const usnap = await getDoc(doc(db, 'users', user.id));
      const udata = usnap.data();
      setChat({
        messagesId: newmessageRef.id,
        lastMessage: "",
        rId: user.id,
        updatedAt: Date.now(),
        messageSeen: true,
        userData: udata
      })
      setshowSearch(false)
      setchatVisible(true)

    } catch (error) {
      toast.error(error.message);
      console.error(error);
    }

  }

  const setChat = async (item) => {

    try {
      setMessagesId(item.messageId);
      setChatUser(item)
      const userChatRef = doc(db, 'chats', userData.id)
      const userChatsSnapshot = await getDoc(userChatRef);

      const userChatsData = userChatsSnapshot.data();
      const chatIndex = userChatsData.chatsData.findIndex((c) => c.messageId === item.messageId);
      userChatsData.chatsData[chatIndex].messageSeen = true;
      await updateDoc(userChatRef, {
        chatsData: userChatsData.chatsData
      })
      setchatVisible(true);
    } catch (error) {
      toast.error(error.message)
    }


  }



  useEffect(() => {

    const updateChatUserdata = async () => {

      if (chatUser) {
        const userRef = doc(db, 'users', chatUser.userData.id)
        const usersnap = await getDoc(userRef);
        const userData = usersnap.data();
        setChatUser(prev => ({ ...prev, userData: userData }))
      }
    }

  }, [chatData])

  return (
    <div className={`ls ${chatVisible ? "hidden" : ""}`}>
      <div className="ls-top">
        <div className="ls-nav">
          <img src={assets.logo} className='logo' alt="" />
          <div className="menu">
            <img src={assets.menu_icon} alt="" />
            <div className='sub-menu'>
              <p onClick={() => navigate('/profile')}>Edit Profile</p>
              <hr />
              <p onClick={()=>logout()}>Logout</p>

            </div>
          </div>
        </div>
        <div className="ls-search">
          <img src={assets.search_icon} alt="" />
          <input onChange={inputHandler} type="text" placeholder='Search here..' />
        </div>
      </div>
      <div className="ls-list">
        {showSearch && user
          ?
          <div onClick={addchat} className='friends add-user'>
            <img src={user.avatar} />
            <p> {user.name}</p>
          </div>
          : chatData.map((item, index) => (
            <div onClick={() => setChat(item)} key={index} className={`friends ${item.messageSeen || item.messageId === messagesId ? "" : "border"}`}>
              <img src={item.userData.avatar} alt="" />
              <div>
                <p>{item.userData.name}</p>
                <span>{item.lastMessage}</span>
              </div>
            </div>
          ))

        }
      </div>

    </div>
  )
}

export default LeftSideBar
