import React, { useState, useEffect, useContext } from 'react'
import assets from '../../assets/assets'
import './ProfileUpdate.css'
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../config/Firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Navigate, useNavigate } from 'react-router-dom';
import {toast} from 'react-toastify';
import upload from '../../lib/upload';
import { AppContext } from '../../context/AppContext';

const ProfileUpdate = () => {

  const navigate = useNavigate();
  const [image, setimage] = useState(false);
  const [name, setname] = useState("");
  const [bio, setbio] = useState("");
  const [uid, setuid] = useState("");
  const [previmage, setprevimage] = useState("");
  const {setUserData} = useContext(AppContext)

  const profileupdate = async (event) =>{

    event.preventDefault();
    try {
      if (!previmage && !image) {
        toast.error("Upload Profile Picture")
      }

      const docRef = doc(db, "users", uid);
      if(image){
        const  imgURL = await upload(image);
        setprevimage(imgURL);
        await updateDoc(docRef, {
          avatar:imgURL,
          bio:bio,
          name:name
        })
      }
      else{
        await updateDoc(docRef, {
          bio:bio,
          name:name
        })
      }
      const snap = await getDoc(docRef);
      setUserData(snap.data());

      navigate('/chat')
    } catch (error) {
      console.error(error);
      toast.error(error.message);
      
    }

  }
  useEffect(() => {
    onAuthStateChanged(auth, async(user)=>{
      if(user){
        setuid(user.uid)
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if(docSnap.data().name){
          setname(docSnap.data().name);
        }
        if(docSnap.data().bio){
          setbio(docSnap.data().bio);
        }
        if(docSnap.data().avatar){
          setprevimage(docSnap.data().avatar)
        }
      }
      else{

        navigate('/')

      }
    })
    return () => {
      
    };
  }, []);
  return (
    <div className='profile'>
      <div className="profile-container">
        <form onSubmit={profileupdate}>
          <h3>Profile Details</h3>
          <label htmlFor="avatar">
            <input onChange={(e)=>setimage(e.target.files[0])}type="file" id='avatar' accept='.png, .jpg, .jpeg' hidden />
            <img src={image ? URL.createObjectURL(image) :assets.avatar_icon} alt="" />
            Upload profile picture
          </label>
          <input onChange={(e)=>setname(e.target.value)} value={name} type="text" placeholder='Your name' required/>
          <textarea onChange={(e)=>setbio(e.target.bio)} value={bio}placeholder='Write your bio' required ></textarea>
          <button type='submit'>Save</button>
        </form>
        <img className='profile-pic' src={image ? URL.createObjectURL(image) : previmage ? previmage : assets.logo_icon} alt="" />
      </div>
    </div>
  )
}

export default ProfileUpdate
