"use client";

import firebaseApp from "@/services/firebaseService";
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
            
                default:
                    setError(errorMessage);
                    console.log(errorCode);
                    break;
            }
        }
    }
    return (
        <div className="flex flex-col">
            <div className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white">    
                Reset password  
            </div>

            {error != '' && (<p className="error">Error: {error}</p>)}

            <form id="resetPassword" className="flex flex-col w-full max-w-lg" onSubmit={handleSubmit}>
                <div className="flex flex-wrap -mx-3 mb-6"> 
                    <div className="w-full px-3">
                        <label className="defaultLabel" htmlFor="resetPassword">
                            Forgot your password? Put your email to reset it:
                        </label>
                        <input 
                            className="defaultInput"
                            type="text" 
                            id="resetEmail" 
                            placeholder="name@company.com" 
                            value={email} 
                            onChange={(ev) => { setEmail(ev.target.value) }} required
                        />
                        <div className="md:flex md:items-center">
                            <button 
                                className="defaultButton" 
                                type="submit">
                                    Send
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
        
    )
  }