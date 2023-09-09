"use client";

import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "firebase/auth";
import firebaseApp from "@/services/firebaseService";
import { getFirestore, collection, addDoc, doc, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useRouter } from "next-intl/client";
import { useTranslations } from 'next-intl';

export default function SignUp() {

  const { push } = useRouter();
  const t = useTranslations();

  const [isLoading, setLoading] = useState(true);

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

    await setDoc(doc(db, "user", email), {
      name: name,
      surname: surname,
      rol: 'Standar',
      banned: false
    });

    console.log("Document written");
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const regexName = new RegExp(/^[a-zA-ZÀ-ÿ\u00f1\u00d1]+( [a-zA-ZÀ-ÿ\u00f1\u00d1]+)*$/);
    const regexPassword = new RegExp(/^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,16}$/);

    if (name.trim() == '' || email.trim() == '' || password.trim() == '' || confirmPassword.trim() == '') {
      setError(t('empty_fields'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('password_dont_match'));
      return;
    }

    if (!regexPassword.test(password)) {
      setError(t('password_to_weak'));
      return;
    }

    if (!regexName.test(name)) {
      setError(t('invalid_name'));
      return;
    }
    if (surname != "" && !regexName.test(surname)) {
      setError(t('invalid_surname'));
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      addNewUser();
      updateAuthName();
      sendEmailVerification(auth.currentUser!);
      alert(t('account_created'));
      push('/audioguides');

    } catch (err: any) {
      const errorCode = err.code;
      const errorMessage = err.message;


      switch (errorCode) {
        case 'auth/email-already-in-use':
          setError(t('email_already_exists'));
          break;

        case 'auth/invalid-email':
          setError(t('invalid_email'));
          break;

        case 'auth/weak-password':
          setError(t('password_to_weak'));
          break;

        default:
          alert(errorMessage);
          console.log('Error code: ', errorCode);
          break;
      }
    }
  }

  useEffect(() => {
    auth.authStateReady()
      .then(() => {
        if (auth.currentUser != null) {
          push("/");
        } else {
          setLoading(false)
        }
      });
  }, []);

  return (

    <>
      {isLoading && (
        <div className="flex flex-col items-center justify-center">
          <div role="status">
            <svg aria-hidden="true" className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
              <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
            </svg>
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      )}
      {!isLoading && (
        
        <form className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0" id="registrationForm" onSubmit={handleSubmit}>

          <div className="defaultTitle">
            {t('signup')}
          </div>

          {error != '' && (<p className="error">Error: {error}</p>)}

          <div >
            <div className="p-6 space-y-2">
              <label
                className="defaultLabel"
                htmlFor="regName">
                {t('name')}
              </label>
              <input
                className="defaultInput"
                type="text"
                id="regName"
                placeholder="Name"
                value={name}
                onChange={(ev) => { setName(ev.target.value) }}
                required />
              <label
                className="defaultLabel"
                htmlFor="regSurname">
                {t('surname')}
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
                {t('email')}
              </label>
              <input
                className="defaultInput"
                type="email"
                id="regEmail"
                placeholder="name@company.com"
                onChange={(ev) => { setEmail(ev.target.value) }}
                value={email}
                required />

              <label
                className="defaultLabel"
                htmlFor="regPassword">
                {t('password')}
              </label>
              <input
                className="defaultInput"
                type="password"
                id="regPassword"
                placeholder="••••••••"
                onChange={(ev) => { setPassword(ev.target.value) }}
                value={password}
                required />

              <label
                className="defaultLabel"
                htmlFor="regConfirmPassword">
                {t('password_confirmation')}
              </label>
              <input
                className="defaultInput"
                type="password"
                id="regConfirmPassword"
                placeholder="••••••••"
                onChange={(ev) => { setConfirmPassword(ev.target.value) }}
                value={confirmPassword}
                required />
              <button className="redButton" type="submit">
                {t('register')}
              </button>
            </div>
          </div>
        </form>
      )}
    </>
  )
}