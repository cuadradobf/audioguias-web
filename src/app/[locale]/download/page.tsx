"use client";
import {useTranslations} from 'next-intl';
export default function Download() {
  const t = useTranslations();
    return (
      <div className="flex flex-col mx-auto">
        <h2 className="defaultTitle">{t('download_message')}</h2>
        <p>{t('download_message2')}</p>
        <button className="defaultButton">{t('download')}</button>
      </div>
    )
  }
  