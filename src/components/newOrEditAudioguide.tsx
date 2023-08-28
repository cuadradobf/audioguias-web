"use client";

import firebaseApp from "@/services/firebaseService";
import { AudioGuide, User } from "@/models/models";
import { GeoPoint, addDoc, collection, doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
import { ChangeEvent, useContext, useEffect, useState } from "react";
import { AuthContext } from "@/contexts/authContext";
import { UploadResult, getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import AutocompletePlaces from "./autocompletePlaces";
import { useRouter } from "next-intl/client";
import { sendEmailVerification } from "firebase/auth";
import Link from "next-intl/link";

export interface NewOrEditAudioGuideProps {
    id: string | null | undefined
}

export default function NewOrEditAudioGuide(props: NewOrEditAudioGuideProps) {
    

    const isNew: boolean = props.id === null || props === undefined;
    const title: string = isNew ? "Nueva Audioguía" : "Editar Audioguía";
    const submitButtonText: string = isNew ? "Crear" : "Editar";
    const [error, setError] = useState('');

    const db = getFirestore(firebaseApp);
    const storage = getStorage(firebaseApp);

    const { user } = useContext(AuthContext);
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

        const email: string = user?.email ?? "";
        audioGuide!.user = email;

        console.log("image", image);
        console.log("audio", audio);

        audioGuide!.location = point!;
        audioGuide!.placeId = placeId!;
        console.log("audioGuide", audioGuide);

        try {
            if (isNew) {
                const docRef = await addDoc(collection(db, "audioGuide"), audioGuide);
                console.log("Document written with ID: ", docRef.id);
                await uploadFile(`images/audioGuides/${docRef.id}/main.jpg`, image!);
                await uploadFile(`audios/audioGuides/${docRef.id}/audio.mp3`, audio!);
                push(`/audioguides`);
            }
            else {
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
                    setError('invalid-email');
                    break;
                case 'auth/user-not-found':
                    setError('user-not-found');
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
        await sendEmailVerification(user!);
        alert("Email de verificación enviado");
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
        if (user) {
            fetchUser(user.email!).then(u => { setUserInfo(u) }).catch(console.error);
        
            if (!isNew) {
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
    }, []);

    return (

        <>  {user?.emailVerified && userInfo?.banned == false &&
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
                                    Título
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
                                    Descripción
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
                                    Idioma
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
                                    País
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
                                    Ciudad
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
                                    Dirección
                                </label>
                                <AutocompletePlaces placeId={audioGuide?.placeId} setPlaceId={setPlaceId} setPoint={setPoint} />
                            {/*
                                //TODO: en caso de implementar el coste hay que cambiar el tipo de dato a number
                                <label className="defaultLabel" htmlFor="cost">
                                    Coste
                                </label>
                                <input
                                    className="defaultInput"
                                    type="float"
                                    min="0"
                                    id="cost"
                                    name="cost"
                                    value={audioGuide?.cost ?? 0}
                                    onChange={handleInputChange}
                                    required
                                />
                            */}
                                <label className="defaultLabel" htmlFor="image">
                                    Imagen
                                </label>
                                <div className="defaultInput">
                                    {!isNew && 
                                        (   
                                            //TODO: darle un tamaño fijo
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
                                    Audio
                                </label>
                                <div className="defaultInput">
                                    {!isNew && 
                                        (   
                                            //TODO: centrar y darle un margen
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
                                className="defaultButton" 
                                type="submit">
                                    {submitButtonText}
                            </button>
                        </div>

                        
                    </form>
                </div>
            )}
            {!user?.emailVerified && userInfo?.banned == false &&
                (
                    <>
                        <div className="flex flex-col mx-auto w-full max-w-lg">
                            <div className="defaultTitle">Verify account</div>
                            <p>In order to access all the functionalities of the application, it is necessary to verify the account. Send an email verification:</p>
                            <button className="defaultButton" onClick={handleVerification}>Send</button>
                        </div>
                    </>
                )
            }
            {userInfo?.banned == true &&
                (
                    <>
                        <div className="flex flex-col mx-auto w-full max-w-lg">
                            <div className="defaultTitle">Banned account</div>
                            <p>Your account has been banned by an administrator. To find out the reasons, please contact us.</p>
                            <Link className="defaultButton" href="/contact">Contact us</Link>
                        </div>
                    </>
                )
            }
        </> 
    );
}