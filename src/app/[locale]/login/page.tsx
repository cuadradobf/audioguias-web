"use client";

import { UserCredential, getAuth, signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from "firebase/auth";
import firebaseApp from "@/services/firebaseService";
import { useState, useEffect } from "react";
import { useRouter } from "next-intl/client";
import Link from "next-intl/link";
import { useTranslations } from 'next-intl';

export default function Login() {

  const auth = getAuth(firebaseApp);

  setPersistence(auth, browserLocalPersistence)
    .then(() => {

    })
    .catch((error) => {
      console.log("Error en setPersistence...");
      console.log(error);
    });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { push } = useRouter();
  const t = useTranslations();
  const [isLoading, setLoading] = useState(true);

  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const userCredential: UserCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("User logged in");
      push('/audioguides');

    } catch (err: any) {
      const errorCode = err.code;
      const errorMessage = err.message;

      //Control de errores
      switch (errorCode) {
        case 'auth/invalid-email':
          setError(t('invalid_email'));
          break;
        case 'auth/wrong-password':
          setError(t('wrong_password'));
          break;
        default:
          setError(errorMessage);
          console.log(errorCode);
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
        <section>
          <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">


            {error != '' && (<p className="error">Error: {error}</p>)}

            <div >
              <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                <h1 className="defaultTitle">
                  {t('signin_message')}
                </h1>
                <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
                  <div>

                    <label htmlFor="loginEmail" className="defaultLabel">
                      {t('email')}
                    </label>
                    <input
                      type="text"
                      id="loginEmail"
                      value={email}
                      required
                      className="defaultInput"
                      onChange={(ev) => { setEmail(ev.target.value) }}
                      placeholder="name@company.com" />
                  </div>
                  <div>
                    <label htmlFor="password" className="defaultLabel">
                      {t('password')}
                    </label>
                    <input className="defaultInput" placeholder="••••••••" type="password" id="loginPassword" value={password} onChange={(ev) => { setPassword(ev.target.value) }} required />
                  </div>
                  <div>
                    <Link href="/login/reset" className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-500">
                      {t('forgot_password')}
                    </Link>
                  </div>
                  <button type="submit" className="redButton">
                    {t('sign_in')}
                  </button>
                  <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                    {t('dont_have_account')}
                    <Link href="/signup"
                      className="font-medium text-primary-600 hover:underline dark:text-primary-500">
                      {t('signup')}
                    </Link>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  )
}
