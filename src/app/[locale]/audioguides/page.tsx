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
import { useTranslations } from 'next-intl';

const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

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

interface ImgItemRowProps {
    audioguideId: string
}

function ImgItemRow(props: ImgItemRowProps) {
    const { audioguideId } = props

    const [isLoadingImg, setLoadingImg] = useState(true);
    const [url, setUrl] = useState("");

    useEffect(() => {
        getDownloadUrlFirestorage(`images/audioGuides/${audioguideId}/main.jpg`)
            .then(resultUrl => {
                setUrl(resultUrl);
                setLoadingImg(false);
            })
    }, [])

    if (isLoadingImg) {
        return (
            <div role="status">
                <svg aria-hidden="true" className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                </svg>
                <span className="sr-only">Loading...</span>
            </div>
        );
    }

    return (
        <img className="h-12 w-12 flex-none rounded bg-gray-50" src={url} alt="" />
    )
}

interface RatingItemRowProps {
    audioguideId: string
}

function RatingItemRow(props: RatingItemRowProps) {
    const { audioguideId } = props

    const [isLoadingRating, setLoadingRating] = useState(true);
    const [rating, setRating] = useState<number>();

    useEffect(() => {
        getAverageRating(audioguideId)
            .then(rating => {
                setRating(rating);
                setLoadingRating(false);
            })
    }, [])

    if (isLoadingRating) {
        return (
            <div role="status">
                <svg aria-hidden="true" className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                </svg>
                <span className="sr-only">Loading...</span>
            </div>
        );
    }

    return (
        
        <p>{rating}/5</p>
    )
}


export default function ListAudioGuides() {

    const [isLoading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);
    const auth = getAuth(firebaseApp);

    const t = useTranslations();

    const [userInfo, setUserInfo] = useState<User>();
    const [audioGuides, setAudioGuides] = useState(new Array<{ id: string, data: AudioGuide }>());
    const [filteredAudioGuides, setFilteredAudioGuides] = useState(new Array<{ id: string, data: AudioGuide }>());

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
        const data = new Array<{ id: string, data: AudioGuide }>();
        let q = loggedUser.rol == "Admin" ? query(collection(db, "audioGuide")) : query(collection(db, "audioGuide"), where("user", "==", auth.currentUser?.email));
        const querySnapshot = await getDocs(q);

        for (const doc of querySnapshot.docs) {
            console.log(doc.id, " => ", doc.data());
            const obj = {
                id: doc.id,
                data: doc.data() as AudioGuide
            }

            data.push(obj);
        }

        setAudioGuides(data);
        setFilteredAudioGuides(data);
    }


    useEffect(() => {
        auth.authStateReady()
            .then(() => {
                if (!auth.currentUser || auth.currentUser === null) {
                    push("/login");
                }
                else {
                    fetchData().then(() => { setLoading(false) }).catch(console.error);
                }
            });
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center">

                <div role="status">
                    <svg aria-hidden="true" className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                    </svg>
                    <span className="sr-only">Loading...</span>
                </div>
            </div>
        );
    }

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

                    {filteredAudioGuides.length == 0 && (<p>No hay resultados</p>)}

                    <ul role="list" className="divide-y divide-gray-100">
                        {filteredAudioGuides.map((audioGuide) => (
                            <li key={audioGuide.id} className="flex justify-between gap-x-6 py-5">

                                <Link style={{ cursor: userInfo?.rol == "Admin" ? "default" : "pointer" }} href={userInfo?.rol == "Admin" ? "#" : `/audioguides/edit?guideId=${audioGuide.id}`} className="flex justify-between">
                                    <div className="flex min-w-0 gap-x-4">
                                        <ImgItemRow audioguideId={audioGuide.id} />
                                        <div className="min-w-0 flex-auto">
                                            <p className="text-sm font-semibold leading-6 text-gray-900">{audioGuide.data.title}</p>
                                            <p className="mt-1 truncate text-xs leading-5 text-gray-500">{audioGuide.data.city}, {audioGuide.data.country}</p>
                                        </div>
                                    </div>
                                </Link>
                                <div className="shrink-0 sm:flex sm:flex-col sm:items-end">
                                    <p>{t('valoration')}</p>
                                    <RatingItemRow audioguideId={audioGuide.id} />
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