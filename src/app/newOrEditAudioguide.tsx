"use client";

import firebaseApp from "@/app/firebaseService";
import { AudioGuide } from "@/app/models";
import { GeoPoint, addDoc, collection, doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
import { ChangeEvent, useContext, useEffect, useState } from "react";
import { AuthContext } from "./authContext";
import { UploadResult, getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import AutocompletePlaces from "./autocompletePlaces";

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

    const [audioGuide, setAudioGuide] = useState<AudioGuide | null | undefined>(undefined);
    const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
    const [audioUrl, setAudioUrl] = useState<string | undefined>(undefined);
    const [image, setImage] = useState<File | null | undefined>(undefined);
    const [audio, setAudio] = useState<File | null | undefined>(undefined);
    const [point, setPoint] = useState<GeoPoint | null | undefined>(undefined);
    const [placeId, setPlaceId] = useState<string | null | undefined>(undefined);

    const handleInputChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ): void => {
        const { name, value } = event.target;
        setAudioGuide((prevAudioGuide) => ({
            ...prevAudioGuide,
            [name]: value,
        } as AudioGuide));
    };

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
            }
            else {
                await setDoc(doc(db, "audioGuide", props.id!), audioGuide);
                console.log("Document updated with ID: ", props.id);
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

        if (!isNew) {
            fetchAudioGuide(props.id!)
                .then((guide) => { setAudioGuide(guide); })
                .catch(console.error);

            getDownloadUrlFirestorage(`images/audioGuides/${props.id}/main.jpg`)
                .then((url) => { setImageUrl(url); })
                .catch(console.error);

            getDownloadUrlFirestorage(`audios/audioGuides/${props.id}/audio.mp3`)
                .then((url) => { setAudioUrl(url); })
                .catch(console.error);
        }
    }, []);

    return (
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
                        <input
                            //TODO: Cambiar por un textarea
                            className="defaultInput"
                            type="text"
                            value={audioGuide?.description ?? ""}
                            id="description"
                            name="description"
                            onChange={handleInputChange}
                            required
                        />
                    
                        {
                            //TODO: Cambiar por un select
                        }
                        <label className="defaultLabel" htmlFor="language">
                            Idioma
                        </label>
                        <input
                            className="defaultInput"
                            type="text"
                            id="language"
                            name="language"
                            value={audioGuide?.language ?? ""}
                            onChange={handleInputChange}
                            required
                        />
                        <div className="relative">
                            <select 
                                className="defaultInput" 
                                id="language"
                                name="language"
                                //value={audioGuide?.language ?? ""}
                                //onChange={handleInputChange}
                                //{audioGuide?.language === "es" && selected}
                            >
                                <option value="es" >Español</option>
                                <option value="en" >Inglés</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                            </div>
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
                    
                        <label className="defaultLabel" htmlFor="image">
                            Imagen
                        </label>
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
                            className="defaultInput"
                            onChange={handleImage}
                            required={isNew}
                        />
                    
                        <label className="defaultLabel" htmlFor="audio">
                            Audio
                        </label>
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
                            className="defaultInput"
                            onChange={handleAudio}
                            required={isNew}
                        />
                        
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
    );
}