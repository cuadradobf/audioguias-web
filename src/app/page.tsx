"use client";

import { useContext } from "react"
import { AuthContext } from "../contexts/authContext"
import firebaseApp from "../services/firebaseService";
import { getAuth, signOut } from "firebase/auth";
import Link from "next/link";
import { useTranslation } from "react-i18next";

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
        <Link className="defaultButton" href="/download">Descarga nuestra app</Link>
      </section>

    </div>
  )
}
