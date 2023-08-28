"use client";

import { useContext } from "react"
import { AuthContext } from "@/contexts/authContext"
import firebaseApp from "@/services/firebaseService";
import { getAuth, signOut } from "firebase/auth";
import Link from "next-intl/link";
import {useTranslations} from 'next-intl';

export default function Home() {

  const { user } = useContext(AuthContext)

  const auth = getAuth(firebaseApp);

  const logout = () => {
    signOut(auth);
  }

  const t = useTranslations();

  return (
    <div>
      
      <section className="hero">
        <h1>{t('hello')}</h1>
        <h2>Descubre lugares fascinantes con nuestras audio guías</h2>
        <p>Explora destinos turísticos de manera única y envolvente. Crea y comparte tus propias guías.</p>
        <Link className="defaultButton" href="/download">Descarga nuestra app</Link>
      </section>

    </div>
  )
}
