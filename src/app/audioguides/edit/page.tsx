"use client";

import { useSearchParams } from 'next/navigation';

export default function EditAudioGuide() {

    const searchParams = useSearchParams()
 
    const guideId = searchParams.get('guideId')

    return (
        <div>Editar AudioGuia {guideId}</div>
    )
}