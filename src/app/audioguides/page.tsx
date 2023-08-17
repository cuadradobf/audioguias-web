"use client";

import { getAuth } from "firebase/auth";
import firebaseApp from "../firebaseService";
import { collection, query, where, getDocs, getFirestore, deleteDoc, doc } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../authContext";
import Link from "next/link";


export default function ListAudioGuides() {

    const { user } = useContext(AuthContext);
    const auth = getAuth(firebaseApp);
    const db = getFirestore(firebaseApp);

    const [audioGuides, setAudioGuides] = useState(new Array<any>());

    const deleteAudioguide = async (id: string) => {
        try {
            await deleteDoc(doc(db, "audioGuide", id));
            fetchData().catch(console.error);
        } catch(err) {
            alert(err);
        }
    }
    const fetchData = async () => {
        const data = new Array<any>();
        const q = query(collection(db, "audioGuide"), where("user", "==", auth.currentUser?.email));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
            const obj = {
                id: doc.id,
                data: doc.data()
            }
        
            data.push(obj);
        });

        setAudioGuides(data);
    }

    useEffect(() => {
        if (user) {
            fetchData().catch(console.error);
        }
        else {
            setAudioGuides([]);
        }
    }, [user]);

    //TODO: implementar el resto de elementos de la audioguia
    return (
        <>
            <div>
                {!user && (<p>Debes estar logeado</p>)}
            </div>

            {user && (
                <ul>
                    {audioGuides.map((audioGuide: any) => (
                        <li key={audioGuide.id}>
                            <Link href={`/audioguides/edit?guideId=${audioGuide.id}`}>{audioGuide.data.title}</Link> - <button className="redButton" onClick={() => { deleteAudioguide(audioGuide.id) }}>Eliminar</button>
                        </li>
                    ))}
                </ul>
            )}
        </>
    )
}