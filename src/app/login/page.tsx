"use client";

import { UserCredential, getAuth, signInWithEmailAndPassword } from "firebase/auth";
import firebaseApp from "../../services/firebaseService";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";//se usa redirect  en server y userRouter en client
import Link from "next/link";

export default function Login() {
  const auth = getAuth(firebaseApp);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { push } = useRouter();

  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const userCredential: UserCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("User logged in");
      //redirect to audioguides page 
      push('/audioguides');

    } catch (err: any) {
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
    <section className="bg-gray-50 dark:bg-gray-900">
      {
        //TODO: Quitar el logo o cambiar la imagen
      }
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <Link href="/" className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
          <img className="w-8 h-8 mr-2" src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/logo.svg" alt="logo" />
          AudioGuias
        </Link>

        {error != '' && (<p className="error">Error: {error}</p>)}

        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Sign in to your account
            </h1>
            <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
              <div>

                <label htmlFor="loginEmail" className="defaultLabel">Email</label>
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
                <label htmlFor="password" className="defaultLabel">Password</label>
                <input className="defaultInput" placeholder="••••••••" type="password" id="loginPassword" value={password} onChange={(ev) => { setPassword(ev.target.value) }} required />
              </div>
              {
                //TODO: Quitar remember me
              }
              <div className="flex items-center justify-between">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input id="remember" aria-describedby="remember" type="checkbox" className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800" />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="remember" className="text-gray-500 dark:text-gray-300">Remember me</label>
                  </div>
                </div>
                <Link href="/login/reset" className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-500">Forgot password?</Link>
              </div>
              <button type="submit" className="defaultButton">Sign in</button>
              <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                Don’t have an account yet? <Link href="/signup" className="font-medium text-primary-600 hover:underline dark:text-primary-500">Sign up</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
