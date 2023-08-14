"use client";

import { useContext } from "react"
import { AuthContext } from "./authContext"
import firebaseApp from "./firebaseService";
import { getAuth, signOut } from "firebase/auth";

export default function Home() {

  const { user } = useContext(AuthContext)

  const auth = getAuth(firebaseApp);

  const logout = () => {
    signOut(auth);
  }

  return (
    <div>
      
      <section className="hero">
        <h2>Descubre lugares fascinantes con nuestras audio guías</h2>
        <p>Explora destinos turísticos de manera única y envolvente. Crea y comparte tus propias guías.</p>
        {!!user ? <p>Bienvenido {user.email} <cite onClick={logout}>Logout</cite></p> : <a href="/login">Login</a> }
      </section>

    </div>
  )
}
