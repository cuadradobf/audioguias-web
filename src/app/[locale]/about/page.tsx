"use client";
import Link from "next-intl/link";
import {useTranslations} from 'next-intl';

export default function About() {
  const t = useTranslations();
    return (
      <div className="p-4 justify-center text-center">
        <h2 className="defaultTitle">{t('about_title')}</h2>
        <div className="lex flex-wrap -mx-3 mb-6 px-6">
          <p>{t('about_message')}</p>
          <p>{t('about_message2')}</p>
          <p>{t('about_message3')}</p>
          <p>Francisco Cuadrado</p>
        </div>
        <Link className="redButtonWA" href="/contact">{t('contact_title')}</Link>
      </div>
    ) 
  }
  