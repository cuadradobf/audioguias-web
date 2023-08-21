"use client";

import { getAuth } from "firebase/auth";
import firebaseApp from "../../services/firebaseService";
import { collection, query, where, getDocs, getFirestore, deleteDoc, doc } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/authContext";
import Link from "next/link";
import { AudioGuide, Comment } from "../../models/models";
import { getDownloadURL, getStorage, ref } from "firebase/storage";
import { useRouter } from "next/navigation";


export default function ListAudioGuides() {

    const { user } = useContext(AuthContext);
    const auth = getAuth(firebaseApp);
    const db = getFirestore(firebaseApp);
    const storage = getStorage(firebaseApp);

    const [audioGuides, setAudioGuides] = useState(new Array<{ id: string, data: AudioGuide, imageUrl: string, rating: number }>());
    const { push } = useRouter();
    
    const deleteAudioguide = async (id: string) => {
        try {
            await deleteDoc(doc(db, "audioGuide", id));
            fetchData().catch(console.error);
        } catch (err) {
            alert(err);
        }
    }
    const fetchData = async () => {
        const data = new Array<{ id: string, data: AudioGuide, imageUrl: string, rating: number }>();
        const q = query(collection(db, "audioGuide"), where("user", "==", auth.currentUser?.email));
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
    }

    const getAverageRating = async (id: string): Promise<number> => {
        let total = 0;
        const q = query(collection(db, "audioGuide", id, "comments"));
        const querySnapshot = await getDocs(q);
        for (const doc of querySnapshot.docs) {
            let comment : Comment = doc.data() as Comment;
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
                <ul role="list" className="divide-y divide-gray-100">
                    {audioGuides.map((audioGuide) => (
                        <li key={audioGuide.id}>
                            <Link href={`/audioguides/edit?guideId=${audioGuide.id}`} className="flex justify-between gap-x-6 py-5">
                                <div className="flex min-w-0 gap-x-4">
                                    <img className="h-12 w-12 flex-none rounded-full bg-gray-50" src={audioGuide.imageUrl} alt="" />
                                    <div className="min-w-0 flex-auto">
                                        <p className="text-sm font-semibold leading-6 text-gray-900">{audioGuide.data.title}</p>
                                        <p className="mt-1 truncate text-xs leading-5 text-gray-500">{audioGuide.data.description}</p>
                                    </div>
                                </div>
                                <div className="shrink-0 sm:flex sm:flex-col sm:items-end">
                                    {audioGuide.rating} of 5
                                    <button className="redButton" onClick={() => { deleteAudioguide(audioGuide.id) }}>Eliminar</button>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </>
    )
}