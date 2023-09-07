"use client";

import NewOrEditAudioGuide from "@/components/newOrEditAudioguide";
//FIXME:

import { useContext, useEffect } from "react";
import { useRouter } from "next-intl/client";
import { getAuth } from "firebase/auth";
import firebaseApp from "@/services/firebaseService";

export default function NewAudioGuide() {

    const { push } = useRouter();
    const auth = getAuth(firebaseApp);

    useEffect(() => {
        auth.authStateReady()
            .then(() => {
                if (!auth.currentUser || auth.currentUser === null) {
                    push("/login");
                }
            });
    }, []);

    return (
        <NewOrEditAudioGuide id={null} />
    );
}