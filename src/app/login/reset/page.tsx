"use client";

import firebaseApp from "@/app/firebaseService";
import { log } from "console";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";
import { useRouter } from "next/navigation"


export default function Reset() {
    const auth = getAuth(firebaseApp);
    const [email, setEmail] = useState('');
    const {push} = useRouter();
    const [error, setError] = useState('');

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (email == '') {
            setError('empty-email');
            return;
        }
        try {
            await sendPasswordResetEmail(auth, email);
            console.log("Email sent");
            push('/');
            
        } catch (err: any) {
            const errorCode = err.code;
            const errorMessage = err.message;

            //Control de errores
            switch (errorCode) {
                case 'auth/invalid-email':
                    setError('invalid-email');
                    break;
                case 'auth/user-not-found':
                    setError('user-not-found');
                    break;
                default:
                    setError(errorMessage);
                    console.log(errorCode);
                    break;
            }
        }
    }
    return (
        <form id="resetPassword" onSubmit={handleSubmit}>
            <h2>Reset password</h2>

            {error != '' && (<p className="error">Error: {error}</p>)}

            <p>Forgot your password? Send an email to reset it:</p>

            <div>
                <label htmlFor="resetEmail">Email</label>
                <input type="text" id="resetEmail" value={email} onChange={(ev) => { setEmail(ev.target.value) }} required/>
            </div>

            <button type="submit">Send</button>
        </form>
    )
  }