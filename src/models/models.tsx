import { GeoPoint } from "firebase/firestore";

interface AudioGuide {
    title: string;
    description: string;
    language: string;
    location: GeoPoint;
    country: string;
    city: string;
    user: string;
    placeId: string;
}

interface User {
    name: string;
    surname: string;
    rol: string;
    banned: boolean;   
}

interface Comment {
    user: string;
    audioGuideID: string;
    valoration: number;
    commentData: string;
}
export type { AudioGuide, User, Comment };
