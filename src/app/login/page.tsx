"use client";

import { UserCredential, getAuth, signInWithEmailAndPassword } from "firebase/auth";
import firebaseApp from "../firebaseService";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";//se usa redirect  en server y userRouter en client

export default function Login() {
    const auth = getAuth(firebaseApp);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const {push} = useRouter();

    const [error, setError] = useState('');

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      try {
        const userCredential: UserCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("User logged in");
        //redirect to audioguides page 
        push('/audioguides');
        
      } catch(err: any) {
        const errorCode = err.code;
        const errorMessage = err.message;

        //Control de errores
        switch (errorCode) {
          case 'auth/invalid-email':
            setError('invalid-email');
            break;
          case 'auth/wrong-password':
            setError('Wrong password');
            break;
          default:
            setError(errorMessage);
            console.log(errorCode);
            break;
        }
      }
      
    }


    return (
      <form id="loginForm" onSubmit={handleSubmit}>
      <h2>Login</h2>
      {error != '' && (<p className="error">Error: {error}</p>)}
      <div>
        <label htmlFor="loginEmail">Email</label>
        <input type="text" id="loginEmail" value={email} onChange={(ev) => { setEmail(ev.target.value) }} required/>
      </div>
      <div>
        <label htmlFor="loginPassword">Password</label>
        <input type="password" id="loginPassword" value={password} onChange={(ev) => { setPassword(ev.target.value) }} required/>
      </div>
      <button type="submit">Log In</button>
      <div>
        <p>Not registered? <a href="/signup">Create an account</a></p>
      </div>
      <p>Forgot your password? <a href="/login/reset">Reset password</a></p>
    </form>
    )
  }
  