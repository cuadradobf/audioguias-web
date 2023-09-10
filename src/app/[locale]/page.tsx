"use client";

import firebaseApp from "@/services/firebaseService";
import {useTranslations} from 'next-intl';
import { getDownloadURL, getStorage, ref } from "firebase/storage";

export default function Home() {

  const imageURL = "https://firebasestorage.googleapis.com/v0/b/audioguias-24add.appspot.com/o/images%2Fdefault%2FhomeWeb.jpg?alt=media&token=78e5faa5-5fd0-4db3-a616-563008b27611";
  
  const t = useTranslations();

  const downloadFile = async () => {
    // Inicializa Firebase Storage
    const storage = getStorage(firebaseApp);
  
    // Referencia al archivo en Firebase Storage
    const storageRef = ref(storage, 'apk/Audioguias.apk');
  
    // Obtener URL de descarga
    try {
      const url = await getDownloadURL(storageRef);
      
      // Descargar el archivo
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Audioguias.apk';
      a.click();
    } catch (error) {
      console.error("Error descargando archivo: ", error);
    }
  }

  return (
    <div className="grow flex flex-col justify-center" style={{ 
      backgroundImage: `url(${imageURL})`, 
      backgroundSize: 'cover', 
      backgroundPosition: 'center',
    }}>
      <section className="hero p-5 text-center">
        <h1 className="defaultTitleWhite tracking-widest">AUDIOGUIAS</h1>
        <p className="text-white text-2xl">{t('welcome_message2')}</p>
        <p className="text-white text-2xl">{t('welcome_message3')}</p>
        <br />
        <button onClick={downloadFile} className="redButtonWA">{t('download_message')}</button>
      </section>

    </div>
  )
}
