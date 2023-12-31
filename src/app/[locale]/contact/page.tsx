"use client";

import { useState } from "react";
import firebaseApp from "@/services/firebaseService";
import { getFirestore, setDoc, doc } from "firebase/firestore";
import {useTranslations} from 'next-intl';

export default function Contact() {
    const t = useTranslations();
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
        const regexName = new RegExp('^[a-zA-ZÀ-ÿ\u00f1\u00d1]+( [a-zA-ZÀ-ÿ\u00f1\u00d1]+)*$');
        const regexEmail = new RegExp(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/);
        
        if (!regexEmail.test(email)) {
            setError(t('invalid_email'));
            return;
        }
        if (!regexName.test(name)) {
            setError(t('invalid_name'));
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
      <div className="p-4 flex flex-col items-center justify-center ">
        <h2 className="defaultTitle">{t('contact_title')}</h2>
          {error != '' && (<p className="error">Error: {error}</p>)}
        <form 
          className="w-full max-w-lg" 
          id="contactForm" 
          onSubmit={handleSubmit}>
          <div>
            <label 
              className="defaultLabel" 
              htmlFor="contactName">
                {t('name')}
            </label>
            <input 
              className="defaultInput" 
              type="text" 
              id="contactName" 
              value={name} 
              onChange={(ev) => { setName(ev.target.value) }} 
              required/>
          </div>
          <div>
            <label 
              className="defaultLabel" 
              htmlFor="contactEmail">
                {t('email')}
            </label>
            <input 
              className="defaultInput" 
              type="email" 
              id="contactEmail" 
              onChange={(ev) => { setEmail(ev.target.value) }}  
              value={email} 
              required/>
          </div>
          <label 
              className="defaultLabel" 
              htmlFor="contactFeedback">
                {t('question_feedback')}
            </label>
          <textarea 
            className="defaultInput" 
            name="question"
            rows={5}
            id="question" 
            value={question} 
            onChange={(ev) => { setQuestion(ev.target.value) }} 
            required/>
        
          <button 
            className="defaultButton" 
            type="submit">
              {t('send')}
          </button>
        </form>
      </div>
      
    )
  }
  