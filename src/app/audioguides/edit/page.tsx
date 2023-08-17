"use client";

import NewOrEditAudioGuide from '@/app/newOrEditAudioguide';
import { useSearchParams } from 'next/navigation';

export default function EditAudioGuide() {

    const searchParams = useSearchParams()
 
    const guideId = searchParams.get('guideId')

    return (
        <NewOrEditAudioGuide id={guideId} />
    )
}