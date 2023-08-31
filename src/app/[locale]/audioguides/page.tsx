"use client";

import { getAuth } from "firebase/auth";
import firebaseApp from "@/services/firebaseService";
import { collection, query, where, getDocs, getFirestore, deleteDoc, doc, getDoc } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/contexts/authContext";
import Link from "next-intl/link";
import { AudioGuide, Comment, User } from "@/models/models";
import { getDownloadURL, getStorage, ref } from "firebase/storage";
import { useRouter } from "next-intl/client";
import {useTranslations} from 'next-intl';



export default function ListAudioGuides() {

    const { user } = useContext(AuthContext);
    const auth = getAuth(firebaseApp);
    const db = getFirestore(firebaseApp);
    const storage = getStorage(firebaseApp);
    const t = useTranslations();

    const [userInfo, setUserInfo] = useState<User>();
    const [audioGuides, setAudioGuides] = useState(new Array<{ id: string, data: AudioGuide, imageUrl: string, rating: number }>());
    const [filteredAudioGuides, setFilteredAudioGuides] = useState(new Array<{ id: string, data: AudioGuide, imageUrl: string, rating: number }>());

    const { push } = useRouter();

    const deleteAudioguide = async (id: string) => {
        try {
            await deleteDoc(doc(db, "audioGuide", id));
            fetchData().catch(console.error);
        } catch (err) {
            alert(err);
        }
    }

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

    const fetchData = async () => {
        const loggedUser = await fetchUser(auth.currentUser?.email!);
        setUserInfo(loggedUser);
        const data = new Array<{ id: string, data: AudioGuide, imageUrl: string, rating: number }>();
        let q = loggedUser.rol == "Admin" ? query(collection(db, "audioGuide")) : query(collection(db, "audioGuide"), where("user", "==", auth.currentUser?.email));
        const querySnapshot = await getDocs(q);

        for (const doc of querySnapshot.docs) {
            console.log(doc.id, " => ", doc.data());
            const obj = {
                id: doc.id,
                data: doc.data() as AudioGuide,
                imageUrl: await getDownloadUrlFirestorage(`images/audioGuides/${doc.id}/main.jpg`),
                rating: await getAverageRating(doc.id)
            }

            data.push(obj);
        }

        setAudioGuides(data);
        setFilteredAudioGuides(data);
    }

    const getAverageRating = async (id: string): Promise<number> => {
        let total = 0;
        const q = query(collection(db, "audioGuide", id, "comments"));
        const querySnapshot = await getDocs(q);
        for (const doc of querySnapshot.docs) {
            let comment: Comment = doc.data() as Comment;
            total += comment.valoration;
        }

        return total == 0 ? total : total / querySnapshot.docs.length;
    }

    const getDownloadUrlFirestorage = async (path: string): Promise<string> => {
        const url = await getDownloadURL(ref(storage, path));
        return url;
    }

    useEffect(() => {
        if (user) {
            fetchData().catch(console.error);
        }
        else {
            push("/"); //setAudioGuides([]);
        }
    }, [user]);

    //TODO: implementar el resto de elementos de la audioguia
    return (
        <>
            <div>
                {!user && (<p>Debes estar logeado</p>)}
            </div>

            {user && ( 
                <div className="flex flex-col">
                    <input type="text" placeholder={t('search_for')} onChange={(e) => {
                        const text = e.target.value;
                        if (text.trim().length == 0) {
                            setFilteredAudioGuides(audioGuides);
                        }
                        else {
                            const filtered = audioGuides.filter((audioGuide) => {
                                return audioGuide.data.title.toLowerCase().includes(text.toLowerCase()) ||
                                    audioGuide.data.city.toLowerCase().includes(text.toLowerCase()) || 
                                    audioGuide.data.country.toLowerCase().includes(text.toLowerCase());
                            });
                            setFilteredAudioGuides(filtered);
                        }
                    }} />

                    { filteredAudioGuides.length == 0 && (<p>No hay resultados</p>) }

                    <ul role="list" className="divide-y divide-gray-100">
                        {filteredAudioGuides.map((audioGuide) => (
                            <li key={audioGuide.id} className="flex justify-between gap-x-6 py-5">

                                <Link style={{cursor: userInfo?.rol == "Admin" ? "default" : "pointer" }} href={userInfo?.rol == "Admin" ? "#" : `/audioguides/edit?guideId=${audioGuide.id}`} className="flex justify-between">
                                    <div className="flex min-w-0 gap-x-4">
                                        <img className="h-12 w-12 flex-none rounded bg-gray-50" src={audioGuide.imageUrl} alt="" />
                                        <div className="min-w-0 flex-auto">
                                            <p className="text-sm font-semibold leading-6 text-gray-900">{audioGuide.data.title}</p>
                                            <p className="mt-1 truncate text-xs leading-5 text-gray-500">{audioGuide.data.city}, {audioGuide.data.country}</p>
                                        </div>
                                    </div>
                                </Link>
                                <div className="shrink-0 sm:flex sm:flex-col sm:items-end">
                                    {audioGuide.rating} of 5
                                    <button className="redButton" onClick={() => {
                                        //FIXME: no funciona el confirm
                                        const wantToDelete = confirm(t('confirm_delete_audioguide'))
                                        if (wantToDelete) {
                                            deleteAudioguide(audioGuide.id)
                                        }
                                    }}>{t('delete')}</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </>
    )
}