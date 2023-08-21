"use client";

import NewOrEditAudioGuide from "@/components/newOrEditAudioguide";
//FIXME:

import { useContext, useEffect } from "react";
import { AuthContext } from "@/contexts/authContext";
import { useRouter } from "next/navigation";

export default function NewAudioGuide() {

    const { push } = useRouter();
    const { user } = useContext(AuthContext);
    
    useEffect(() => {
        if (!user) {
            push('/login');
        }
    }, []);

    return (
        <NewOrEditAudioGuide id={null} />
    );
}