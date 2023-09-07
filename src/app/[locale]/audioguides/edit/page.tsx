"use client";

import NewOrEditAudioGuide from '@/components/newOrEditAudioguide';
import firebaseApp from '@/services/firebaseService';
import { getAuth } from 'firebase/auth';
import { useSearchParams } from 'next/navigation';
import { useRouter } from "next-intl/client";
import { useEffect } from 'react';

export default function EditAudioGuide() {

    const searchParams = useSearchParams()
 
    const guideId = searchParams.get('guideId')
    const auth = getAuth(firebaseApp);
    const { push } = useRouter();

    useEffect(() => {
        auth.authStateReady()
            .then(() => {
                if (!auth.currentUser || auth.currentUser === null) {
                    push("/login");
                }
            });
    }, []);

    return (
        <NewOrEditAudioGuide id={guideId} />
    )
}