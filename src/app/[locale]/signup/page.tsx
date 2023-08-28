"use client";

import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "firebase/auth";
import firebaseApp from "@/services/firebaseService";
import { getFirestore, collection, addDoc, doc, setDoc } from "firebase/firestore";
import { useState } from "react";
import { useRouter } from "next-intl/client";

export default function SignUp() {

    const {push} = useRouter();

    const auth = getAuth(firebaseApp);
    const db = getFirestore(firebaseApp);

    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [error, setError] = useState('');
    
    const updateAuthName = async () => { 
      await updateProfile(auth.currentUser!, {
        displayName: name
      });
      console.log('Auth name updated successfully');
    }

    const addNewUser = async () => {
      const email: string = auth.currentUser?.email?.toString() || '';

      const docRef = await setDoc(doc(db, "user", email), {
        name: name,
        surname: surname,
        provider: '',
        rol: 'Standar',
        locationMode: 'off',
        unitOfMeasurement: 'Km',
        banned: false
      });
      
      console.log("Document written");
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {  
      event.preventDefault();

      const regexName = new RegExp(/^[a-zA-ZÀ-ÿ\u00f1\u00d1]+( [a-zA-ZÀ-ÿ\u00f1\u00d1]+)*$/);
      const regex = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,16}$/;
      const regexPassword = new RegExp(regex)

      if (password !== confirmPassword) {
        setError('passwords-not-match');
        return;
      }
      
      if (!regexPassword.test(password)) {
        setError('password-too-weak');
        return;
      }
      
      if (!regexName.test(name)) {
        setError('invalid-name');
        return;
      }

      try {

        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        addNewUser();
        updateAuthName();
        sendEmailVerification(auth.currentUser!);
        alert('User created successfully');        
        push('/audioguides');

      } catch(err: any) {
        const errorCode = err.code;
        const errorMessage = err.message;

        /* implement error handling of create user with email and password of firebase using switch case  */
        switch (errorCode) {
          case 'auth/email-already-in-use':
            setError('email-in-use');
            break;

          case 'auth/invalid-email':
            setError('invalid-email');
            break;

          case 'auth/weak-password':
            setError('password-too-weak');
            break;
            // Todo implement error handling of setDoc
          default:
            alert(errorMessage);
            console.log('Error code: ', errorCode);
            break;
        }
      }
    }

    return (
      
        
        <form className="flex flex-col items-center justify-center w-full md:w-1/2 lg:w-1/3 mx-auto"  id="registrationForm" onSubmit={handleSubmit}>
          
          <div className="defaultTitle">
                Registration
          </div>
      
          {error != '' && (<p className="error">Error: {error}</p>)}

          <div className="formDiv">
            <div className="p-6 space-y-4">
              <label 
                className="defaultLabel"
                htmlFor="regName">
                  Name
              </label>
              <input 
                className="defaultInput"
                type="text" 
                id="regName" 
                placeholder="Name"
                value={name} 
                onChange={(ev) => { setName(ev.target.value) }} 
                required/>
              <label 
                className="defaultLabel"
                htmlFor="regSurname">
                  Surname (optional)
              </label>
              <input 
                className="defaultInput"
                type="text" 
                id="regSurname" 
                placeholder="Surname"
                onChange={(ev) => { setSurname(ev.target.value) }} 
                value={surname} />

              <label 
                className="defaultLabel"
                htmlFor="regEmail">
                  Email
              </label>
              <input 
                className="defaultInput"
                type="email" 
                id="regEmail" 
                placeholder="name@company.com"
                onChange={(ev) => { setEmail(ev.target.value) }}  
                value={email} 
                required/>

              <label 
                className="defaultLabel"
                htmlFor="regPassword">
                  Password
              </label>
              <input 
                className="defaultInput"
                type="password" 
                id="regPassword" 
                placeholder="••••••••"
                onChange={(ev) => { setPassword(ev.target.value) }} 
                value={password} 
                required/>

              <label 
                className="defaultLabel"
                htmlFor="regConfirmPassword">
                  Confirm Password
              </label>
              <input 
                className="defaultInput"
                type="password" 
                id="regConfirmPassword" 
                placeholder="••••••••"
                onChange={(ev) => { setConfirmPassword(ev.target.value) }} 
                value={confirmPassword} 
                required/>
              <button className="defaultButton" type="submit">Register</button>
            </div>
          </div>

          
            
        </form>
      
    )
  }