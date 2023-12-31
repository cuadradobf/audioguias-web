"use client";

import firebaseApp from "@/services/firebaseService";
import { AudioGuide, User } from "@/models/models";
import { GeoPoint, addDoc, collection, doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
import { ChangeEvent, useEffect, useState } from "react";
import { UploadResult, getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import AutocompletePlaces from "./autocompletePlaces";
import { useRouter } from "next-intl/client";
import { getAuth, sendEmailVerification } from "firebase/auth";
import Link from "next-intl/link";
import {useTranslations} from 'next-intl';

export interface NewOrEditAudioGuideProps {
    id: string | null | undefined
}

export default function NewOrEditAudioGuide(props: NewOrEditAudioGuideProps) {
    
    const t = useTranslations();

    const isNew: boolean = props.id === null || props === undefined;
    const title: string = isNew ? t('new_audioguide') : t('edit_audioguide');
    const submitButtonText: string = isNew ? t('create'): t('edit');
    const [error, setError] = useState('');

    const db = getFirestore(firebaseApp);
    const storage = getStorage(firebaseApp);
    const auth = getAuth(firebaseApp);

    
    const { push } = useRouter();

    const [userInfo, setUserInfo] = useState<User>();
    const [audioGuide, setAudioGuide] = useState<AudioGuide | null | undefined>(undefined);
    const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
    const [audioUrl, setAudioUrl] = useState<string | undefined>(undefined);
    const [image, setImage] = useState<File | null | undefined>(undefined);
    const [audio, setAudio] = useState<File | null | undefined>(undefined);
    const [point, setPoint] = useState<GeoPoint | null | undefined>(undefined);
    const [placeId, setPlaceId] = useState<string | null | undefined>(undefined);

    const handleInputChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ): void => {
        const { name, value } = event.target;
        setAudioGuide((prevAudioGuide) => ({
            ...prevAudioGuide,
            [name]: value,
        } as AudioGuide));
    };

    const fetchUser = async (email: string): Promise<User> => {
        const docRef = doc(db, "user", email);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const u = docSnap.data() as User;
            return u;
        } else {
            throw new Error("No such document!");
        }
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const regexName = new RegExp(/^[a-zA-ZÀ-ÿ\u00f1\u00d1]+( [a-zA-ZÀ-ÿ\u00f1\u00d1]+)*$/);

        if(!audioGuide) {
            setError(t('generic_error'));
            return;
        }
        if(audioGuide.title.trim() == "" || audioGuide.description.trim() == "" || audioGuide.country.trim() == "" || audioGuide.city.trim() == "") {
            setError(t('empty_fields'));
            return;
        }
        if (!regexName.test(audioGuide.title)) {
            setError(t('invalid_title'));
            return;
        }
        if (!regexName.test(audioGuide.country)) {
            setError(t('invalid_country'));
            return;
        }
        if (!regexName.test(audioGuide.city)) {
            setError(t('invalid_city'));
            return;
        }
        
        const email: string = auth.currentUser?.email ?? "";
        audioGuide.user = email;

        audioGuide.location = point!;
        audioGuide.placeId = placeId!;
        

        try {
            if (isNew) {
                //Si es nuevo, se sube el audioGuide y se crea un nuevo documento.
                const docRef = await addDoc(collection(db, "audioGuide"), audioGuide);
                console.log("Document written with ID: ", docRef.id);
                await uploadFile(`images/audioGuides/${docRef.id}/main.jpg`, image!);
                await uploadFile(`audios/audioGuides/${docRef.id}/audio.mp3`, audio!);
                push(`/audioguides`);
            }
            else {
                //Si no es nuevo, se actualiza el audioGuide y se edita el documento.
                await setDoc(doc(db, "audioGuide", props.id!), audioGuide);
                console.log("Document updated with ID: ", props.id);
                push(`/audioguides`);
            }
        } catch (err: any) {
            console.error("Error adding or editing document: ", err);

            const errorCode = err.code;
            const errorMessage = err.message;

            switch (errorCode) {
                case 'auth/invalid-email': 
                    setError(t('invalid_email'));
                    break;
                case 'auth/user-not-found':
                    setError(t('user_not_found'));
                    break;
                
                default:
                    setError(errorMessage);
                    console.log(errorCode);
                    break;
            }
            
        }
    };

    const handleImage = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files !== null) {
            setImage(event.target.files[0]);
        }
    }

    const handleAudio = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files !== null) {
            setAudio(event.target.files[0]);
        }
    }

    const handleVerification = async () => {
        await sendEmailVerification(auth.currentUser!);
        //FIXME
        alert(t('verification_email_sent'));
    }

    const getDownloadUrlFirestorage = async (path: string): Promise<string> => {
        const url = await getDownloadURL(ref(storage, path));
        return url;
    }

    const uploadFile = async (path: string, file: File): Promise<UploadResult> => {
        const storageRef = ref(storage, path);

        return await uploadBytes(storageRef, file)
    }

    const fetchAudioGuide = async (guideId: string): Promise<AudioGuide> => {
        // bajar el audioGuide y setearlo.
        const docRef = doc(db, "audioGuide", guideId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const guide: AudioGuide = docSnap.data() as AudioGuide;
            console.log("Document data:", guide);
            return guide;
        } else {
            throw new Error("No such document!");
        }
    }

    useEffect(() => {

        auth.authStateReady()
            .then(() => {
                if (!auth.currentUser || auth.currentUser === null) {
                    push("/login");
                }else{
                    fetchUser(auth.currentUser.email!).then(u => { setUserInfo(u) }).catch(console.error);
        
                    if (!isNew) {
                        //Si no es nuevo, bajar el audioGuide y setearlo.
                        fetchAudioGuide(props.id!)
                            .then((guide) => { 
                                setAudioGuide(guide);
                                setPoint(guide.location);
                                setPlaceId(guide.placeId);
                            })
                            .catch(console.error);

                        getDownloadUrlFirestorage(`images/audioGuides/${props.id}/main.jpg`)
                            .then((url) => { setImageUrl(url); })
                            .catch(console.error);

                        getDownloadUrlFirestorage(`audios/audioGuides/${props.id}/audio.mp3`)
                            .then((url) => { setAudioUrl(url); })
                            .catch(console.error);
                    }
                }
            });
    }, []);

    return (

        <div className="p-4">  {auth.currentUser?.emailVerified && userInfo?.banned == false &&
            (     
                <div className="flex flex-col">

                    <div className="defaultTitle">    
                        {title}  
                    </div>
                    {error != '' && (<p className="error">Error: {error}</p>)}
                    <form className="flex flex-col w-full max-w-lg" onSubmit={handleSubmit}>
                        <div className="flex flex-wrap -mx-3 mb-6">
                            <div className="w-full px-3">
                                <label className="defaultLabel" htmlFor="title">
                                    {t('title')}
                                </label>
                                <input
                                    className="defaultInput"
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={audioGuide?.title ?? ""}
                                    onChange={handleInputChange}
                                    required
                                />
                            
                                <label className="defaultLabel" htmlFor="description">
                                    {t('description')}
                                </label>
                                <textarea 
                                    className="defaultInput"
                                    rows={5}
                                    value={audioGuide?.description ?? ""}
                                    id="description"
                                    name="description"
                                    onChange={handleInputChange}
                                    required>

                                </textarea>
                            
                                <label className="defaultLabel" htmlFor="language">
                                    {t('language')}
                                </label>
                                <div className="relative">
                                    <select 
                                        className="defaultInput" 
                                        id="language"
                                        name="language"
                                        required
                                        value={audioGuide?.language ?? ""}
                                        onChange={handleInputChange}
                                    >
                                        <option value="" disabled>Selecciona un idioma</option>
                                        <option value="es" >Español</option>
                                        <option value="en" >Inglés</option>
                                    </select>
                                </div>
                            
                                <label className="defaultLabel" htmlFor="country">
                                    {t('country')}
                                </label>
                                <input
                                    className="defaultInput"
                                    type="text"
                                    id="country"
                                    name="country"
                                    value={audioGuide?.country ?? ""}
                                    onChange={handleInputChange}
                                    required
                                />
                            
                                <label className="defaultLabel" htmlFor="city">
                                    {t('city')}
                                </label>
                                <input
                                    className="defaultInput"
                                    type="text"
                                    id="city"
                                    name="city"
                                    value={audioGuide?.city ?? ""}
                                    onChange={handleInputChange}
                                    required
                                />

                                <label className="defaultLabel" htmlFor="location">
                                    {t('address')}
                                </label>
                                <AutocompletePlaces placeId={audioGuide?.placeId} setPlaceId={setPlaceId} setPoint={setPoint} />
                                <label className="defaultLabel" htmlFor="image">
                                    {t('Image')}
                                </label>
                                <div className="defaultInput">
                                    {!isNew && 
                                        (   
                                            <img 
                                                className="object-contain rounded mx-auto my-2 border-2 border-gray-200 shadow-md "
                                                src={imageUrl} alt="Imagen de la audioGuia"   
                                            />     
                                        )
                                    }
                                    <input type="file" accept=".jpg, .jpeg"
                                        onChange={handleImage}
                                        required={isNew}
                                    />
                                </div>
                            
                                <label className="defaultLabel" htmlFor="audio">
                                    {t('audio')}
                                </label>
                                <div className="defaultInput">
                                    {!isNew && 
                                        (   
                                            <audio 
                                                className="mx-auto my-2"
                                                src={audioUrl} 
                                                controls 
                                            />
                                        )
                                    }
                                    <input type="file" accept=".mp3"
                                        
                                        onChange={handleAudio}
                                        required={isNew}
                                    />
                                </div>
                                
                            </div>
                            
                        </div>
                        <div className="md:flex md:items-center">
                            <button 
                                className="redButton" 
                                type="submit">
                                    {submitButtonText}
                            </button>
                        </div>

                        
                    </form>
                </div>
            )}
            {!auth.currentUser?.emailVerified && userInfo?.banned == false &&
                (
                    <>
                        <div className="flex flex-col mx-auto w-full max-w-lg">
                            <div className="defaultTitle">{t('verify_title')}</div>
                            <p>{t('verification_message')}</p>
                            <button className="redButton" onClick={handleVerification}>{t('send')}</button>
                        </div>
                    </>
                )
            }
            {userInfo?.banned == true &&
                (
                    <>
                        <div className="flex flex-col mx-auto w-full max-w-lg">
                            <div className="defaultTitle">{t('banned_title')}</div>
                            <p>{t('banned_message')}</p>
                            <Link className="redButton" href="/contact">{t('contact_title')}</Link>
                        </div>
                    </>
                )
            }
        </div> 
    );
}