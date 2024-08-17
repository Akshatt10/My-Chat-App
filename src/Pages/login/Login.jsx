import React, {useState} from 'react'
import './Login.css'
import assests from '../../assets/assets'
import { signup, login, resetPass } from '../../config/Firebase'

const Login = () => {

  const [currstate, setcurrstate] = useState("Sign Up");
  const [userName, setuserName] = useState("");
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");


  const onSubmitHandler = (event) =>{

    event.preventDefault();
    if(currstate=='Sign Up'){
      signup(userName, email, password)
    }
    else{
      login(email,password)
    }

  }

  return (
    <div className='login'>
      <img src={assests.MYLOGO} alt="" className="logo" />
      <form  onSubmit={onSubmitHandler}  className="login-form">
        <h2>{currstate}</h2>
        {currstate === "Sign Up"?<input onChange={(e)=>setuserName(e.target.value)} value={userName}   type="text" placeholder = 'username' className="form-input" required />: null}
        <input onChange={(e)=>setemail(e.target.value)} value={email}  type="email"  placeholder='Email address' className="form-input" required/>
        <input onChange={(e)=>setpassword(e.target.value)} value={password} type="password" placeholder='password' className="form-input" required/>
        <button type='Submit'>{currstate==="Sign Up"?"Create account":"Login Now"}</button>
        <div className="login-term">
          <input type="checkbox" />
          <p>Agree to the terms of use & privacy policy</p>
        </div>
        <div className="login-forgot">

          {
            currstate === "Sign Up"
            ?
            <p className='login-toggle'>Already have an account <span onClick={()=>setcurrstate("Login")}>Login here</span></p>
            :
            <p className='login-toggle'>Create an account <span onClick={()=>setcurrstate("Sign Up")}>Click here</span></p>

          }
          {currstate === 'Login' ? <p className='login-toggle'>Forgot Password ? <span onClick={()=>resetPass(email)}>Reset Here</span></p> : null}
         
         
        </div>
      </form>

    </div>
  )
}

export default Login
