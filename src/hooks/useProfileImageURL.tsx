import { AuthContext } from '@/contexts/authContext';
import { ProfileImageChangedEventDetail } from '@/events/profileImageChanged';
import firebaseApp from '@/services/firebaseService';
import { getAuth } from 'firebase/auth';
import { FirebaseStorage, getDownloadURL, getStorage, ref } from 'firebase/storage';
import { useState, useEffect, useContext } from 'react';

const getImageURL = async (storage: FirebaseStorage, path: string): Promise<string> => {
    return await getDownloadURL(ref(storage, path));
}

export function useProfileImageURL() {
    
    const [url, setURL] = useState<string>();
    const storage = getStorage(firebaseApp);
    const auth = getAuth(firebaseApp);

    

    function handleProfileImageChange(ev: CustomEvent<ProfileImageChangedEventDetail>) {
        const info: ProfileImageChangedEventDetail = ev.detail;
        setURL(info.url);
    }

    useEffect(() => {
        auth.authStateReady()
            .then(() => {
                if (auth.currentUser) {
                    getImageURL(storage, `images/${auth.currentUser.email}/profile`)
                    .then(url => {
                        handleProfileImageChange(new CustomEvent("profileImageChanged", { detail: { url: url } as ProfileImageChangedEventDetail }));
                    })
                    .catch(
                        (error) => {
                            getImageURL(storage, `images/default/profile.png`)
                                .then(urlDefault => {
                                    handleProfileImageChange(new CustomEvent("profileImageChanged", { detail: { url: urlDefault } as ProfileImageChangedEventDetail }));
                                })
                        }
                    );
                }
                window.addEventListener('profileImageChanged', (ev) => { handleProfileImageChange(ev as CustomEvent<ProfileImageChangedEventDetail>) } );
                return () => {
                window.removeEventListener('profileImageChanged', (ev) => { handleProfileImageChange(ev as CustomEvent<ProfileImageChangedEventDetail>) } );
        };
            });
    }, [auth.currentUser]);

    return url;
}