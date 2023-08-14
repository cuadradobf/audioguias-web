"use client";

import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "firebase/auth";
import firebaseApp from "../firebaseService";
import { getFirestore, collection, addDoc, doc, setDoc } from "firebase/firestore";
import { useState } from "react";
import { useRouter } from "next/navigation";


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
      event.preventDefault();//Que hace esto?

      //const regexPassword = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[.@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$');//TODO: mirar como funciona esto
      const regexName = new RegExp('^[a-zA-ZÀ-ÿ\u00f1\u00d1]+( [a-zA-ZÀ-ÿ\u00f1\u00d1]+)*$');//TODO: mirar como funciona esto


      if (password !== confirmPassword) {//Porque se usa el !== en vez de !=
        setError('passwords-not-match');
        return;
      }
      /*
      if (!regexPassword.test(password)) {
        setError('password-too-weak');
        return;
      }
      */
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
      <form id="registrationForm" onSubmit={handleSubmit}>
        <h2>Registration</h2>

        {error != '' && (<p className="error">Error: {error}</p>)}

        <div>
          <label htmlFor="regName">Name</label>
          <input type="text" id="regName" value={name} onChange={(ev) => { setName(ev.target.value) }} required/>
        </div>

        <div>
          <label htmlFor="regSurname">Surname (optional)</label>
          <input type="text" id="regSurname" onChange={(ev) => { setSurname(ev.target.value) }} value={surname} />
        </div>

        <div>
          <label htmlFor="regEmail">Email</label>
          <input type="email" id="regEmail" onChange={(ev) => { setEmail(ev.target.value) }}  value={email} required/>
        </div>

        <div>
          <label htmlFor="regPassword">Password</label>
          <input type="password" id="regPassword" onChange={(ev) => { setPassword(ev.target.value) }} value={password} required/>
        </div>

        <div>
          <label htmlFor="regConfirmPassword">Confirm Password</label>
          <input type="password" id="regConfirmPassword" onChange={(ev) => { setConfirmPassword(ev.target.value) }} value={confirmPassword} required/>
        </div>

        <button type="submit">Register</button>
      </form>
    )
  }