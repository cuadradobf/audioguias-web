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
        <h1 className="defaultTitle">{t('welcome_message')}</h1>
        <h2>{t('welcome_message2')}</h2>
        <p>{t('welcome_message3')}</p>
        <br />
        <Link className="defaultButton" href="/download">{t('download_message')}</Link>
      </section>

    </div>
  )
}
