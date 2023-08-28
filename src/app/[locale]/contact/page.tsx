"use client";

import { useState } from "react";
import firebaseApp from "@/services/firebaseService";
import { getFirestore, setDoc, doc } from "firebase/firestore";

export default function Contact() {
    const [question, setQuestion] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    const addNewQuestion = async () => {
        const db = getFirestore(firebaseApp);
        const docRef = await setDoc(doc(db, "question&feedback"), {
            name: name,
            email: email,
            text: question,
        });
        console.log("Document written successfully");
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const regexName = new RegExp('^[a-zA-ZÀ-ÿ\u00f1\u00d1]+( [a-zA-ZÀ-ÿ\u00f1\u00d1]+)*$');//TODO: mirar como funciona esto
        //TODO: add regex for email
        if (question == '') {
            setError('empty-question');
            return;
        }
        if (name == '') {
            setError('empty-name');
            return;
        }
        if (email == '') {
            setError('empty-email');
            return;
        }
        if (!regexName.test(name)) {
            setError('invalid-name');
            return;
        }
        
        try {
          addNewQuestion();
        } catch (err: any) {
          const errorCode = err.code;
          const errorMessage = err.message;
          setError(errorMessage);
          console.log(errorCode);
        }
    }
    return (
      <div className="flex flex-col mx-auto">
        <h2 className="defaultTitle">Contact us</h2>
          {error != '' && (<p className="error">Error: {error}</p>)}
        <form className="flex flex-col w-full max-w-lg" id="contactForm" onSubmit={handleSubmit}>
          <div>
            <label className="defaulLabel" htmlFor="contactName">Name</label>
            <input className="defaultInput" type="text" id="contactName" value={name} onChange={(ev) => { setName(ev.target.value) }} required/>
          </div>
          <div>
            <label className="defaultLabel" htmlFor="contactEmail">Email</label>
            <input className="defaultInput" type="email" id="contactEmail" onChange={(ev) => { setEmail(ev.target.value) }}  value={email} required/>
          </div>
          <p>Enter your question or feedback:</p>
          <input className="defaultInput" type="text" id="question" value={question} onChange={(ev) => { setQuestion(ev.target.value) }} required/>
        
          <button className="defaultButton" type="submit">Send</button>
        </form>
      </div>
      
    )
  }
  