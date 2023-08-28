"use client";

import NewOrEditAudioGuide from "@/components/newOrEditAudioguide";
//FIXME:

import { useContext, useEffect } from "react";
import { AuthContext } from "@/contexts/authContext";
import { useRouter } from "next-intl/client";

export default function NewAudioGuide() {

    const { push } = useRouter();
    
    
    useEffect(() => {
        const { user } = useContext(AuthContext);
        if (!user) {
            push('/login');
        }
    }, []);

    return (
        <NewOrEditAudioGuide id={null} />
    );
}