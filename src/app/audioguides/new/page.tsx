"use client";

import firebaseApp from "@/app/firebaseService";
import { AudioGuide } from "@/app/models";
import { addDoc, collection, doc, getFirestore, setDoc } from "firebase/firestore";
import { useState } from "react";


export default function NewAudioGuide() {
    const db = getFirestore(firebaseApp);

    const [audioGuide, setAudioGuide] = useState<AudioGuide | null | undefined>(undefined);

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
        // Aquí puedes realizar el envío del formulario o cualquier otra lógica que necesites
        console.log(audioGuide);

        try {
            const docRef = await addDoc(collection(db, "audioGuide"), audioGuide);
            console.log("Document written with ID: ", docRef.id);
        } catch (error) {
            console.error("Error adding document: ", error);
        }
    };

    return (
        <>
            <div>Nueva AudioGuia</div>
            <form onSubmit={handleSubmit}>
                <label htmlFor="title">Título</label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    onChange={handleInputChange}
                />

                <label htmlFor="description">Descripción</label>
                <input
                    type="text"
                    id="description"
                    name="description"
                    onChange={handleInputChange}
                />

                {
                    //TODO: Cambiar por un select
                } 
                <label htmlFor="language">Idioma</label>
                <input
                    type="text"
                    id="language"
                    name="language"
                    onChange={handleInputChange}
                />

                <label htmlFor="country">País</label>
                <input
                    type="text"
                    id="country"
                    name="country"
                    onChange={handleInputChange}
                />

                <label htmlFor="city">Ciudad</label>
                <input
                    type="text"
                    id="city"
                    name="city"
                    onChange={handleInputChange}
                />

                <label htmlFor="cost">Coste</label>
                <input
                    type="number"
                    min="0"
                    id="cost"
                    name="cost"
                    onChange={handleInputChange}
                />

                {
                    //TODO: Oculto o no usar
                }
                <label htmlFor="user">Usuario</label>
                <input
                    type="text"
                    id="user"
                    name="user"
                    onChange={handleInputChange}
                />

                <button type="submit" >Create</button>
            </form>
        </>
    );
}