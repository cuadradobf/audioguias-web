"use client";

import { ChangeEvent, MouseEventHandler, useContext, useEffect, useLayoutEffect, useState } from "react";
import { useRouter } from "next-intl/client";
import { StorageReference, UploadResult, deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import firebaseApp from "@/services/firebaseService";
import { User } from "@/models/models";
import { deleteDoc, doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
import { EmailAuthProvider, deleteUser, getAuth, reauthenticateWithCredential, sendEmailVerification, updatePassword, updateProfile, User as FirebaseUser } from "firebase/auth";
import { ProfileImageChangedEventDetail } from "@/events/profileImageChanged";
import {useTranslations} from 'next-intl';

export default function Profile() {

    const { push } = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [userInfo, setUserInfo] = useState<User>();
    const [imageProfileURL, setImageProfileURL] = useState<string>();
    const [actualPassword, setActualPassword] = useState<string>("");
    const [newPassword, setNewPassword] = useState<string>("");
    const [confirmNewPassword, setConfirmNewPassword] = useState<string>("");
    const [errorF1, setErrorF1] = useState('');
    const [errorF2, setErrorF2] = useState('');
    const t = useTranslations();

    const auth = getAuth(firebaseApp);
    const db = getFirestore(firebaseApp);
    const storage = getStorage(firebaseApp);

    const getImageURL = async (path: string): Promise<string> => {
        return await getDownloadURL(ref(storage, path));
    }

    const fetchUser = async (email: string): Promise<User> => {
        const docRef = doc(db, "user", email);
        const docSnap = await getDoc(docRef);

        setIsLoading(false);

        if (docSnap.exists()) {
            const u = docSnap.data() as User;
            return u;
        } else {
            throw new Error("No such document!");
        }
    }


    const handleInputChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ): void => {
        const { name, value } = event.target;
        setUserInfo((prevUserInfo) => ({
            ...prevUserInfo,
            [name]: value,
        } as User));
    };


    const updateAuthName = async () => {
        await updateProfile(auth.currentUser!, {
            displayName: userInfo?.name
        });
        console.log('Auth name updated successfully');
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const regexName = new RegExp(/^[a-zA-ZÀ-ÿ\u00f1\u00d1]+( [a-zA-ZÀ-ÿ\u00f1\u00d1]+)*$/);

        if (!regexName.test(userInfo!.name)) {
            setErrorF1(t('invalid_name'));
            return;
        }
        if (!regexName.test(userInfo!.surname)) {
            setErrorF1(t('invalid_surname'));
            return;
        }
        try {
            await setDoc(doc(db, "user", auth.currentUser?.email!), userInfo);
            await updateAuthName();
            alert(t('save_data'));
        } catch (error: any) {
            //const errorCode = error.code;
            const errorMessage = error.message;
            console.log(error);

            setErrorF1(errorMessage.toString());

        }
    };

    const handleSubmitChangePassword = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const regex = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,16}$/;
        const regexPassword = new RegExp(regex)
    
       if(actualPassword.trim() == '' || newPassword.trim() == '' || confirmNewPassword.trim() == '')

        if (newPassword != confirmNewPassword) {
            setErrorF2(t('empty_fields'));
            return;
        }

        if (!regexPassword.test(newPassword)) {
            setErrorF2(t('password_to_weak'));
            return;
        }

        try {
            await reauthenticateWithCredential(auth.currentUser!, EmailAuthProvider.credential(auth.currentUser!.email!, actualPassword))
            await updatePassword(auth.currentUser!, newPassword);
            alert(t('password_changed'));
            return;
        } catch (error: any) {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(error);
            switch (errorCode) {
                case "auth/wrong-password":
                    setErrorF2(t('wrong_password'));
                    break;
                default:
                    setErrorF2(errorMessage.toString());
                    break;
            }
        }
    }

    const handleDeleteAccount = async () => {
        const actualPw = prompt(t('confirm_delete_account'));
        if (actualPw == null || actualPw == "") {
            alert(t('password_empty'));
            return;
        }

        try {
            await reauthenticateWithCredential(auth.currentUser!, EmailAuthProvider.credential(auth.currentUser!.email!, actualPw))

            if (!decodeURIComponent(imageProfileURL!).includes("images/default/profile.png")) {
                await deleteImageProfile()
            }

            await deleteUser(auth.currentUser!)
            await deleteDoc(doc(db, "user", auth.currentUser?.email!))

            await auth.signOut();
            alert(t('account_deleted'))

        } catch (error: any) {
            const errorCode = error.code;
            const errorMessage = error.message;

            console.log(error);
            switch (errorCode) {
                case "auth/wrong-password":
                    alert(t('wrong_password'));
                    break;
                default:
                    alert(errorMessage.toString());
                    break;
            }

        }
    }

    const uploadFile = async (path: string, file: File): Promise<UploadResult> => {
        const storageRef = ref(storage, path);

        return await uploadBytes(storageRef, file)
    }


    const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            const result: UploadResult = await uploadFile(`images/${auth.currentUser?.email}/profile`, file);
            const url = await getImageURL(result.ref.fullPath);
            setImageProfileURL(url);

            // reset input value
            event.target.value = '';

            const ev = new CustomEvent("profileImageChanged", { detail: { url: url } as ProfileImageChangedEventDetail });
            window.dispatchEvent(ev);
        }
    }

    const deleteImageProfile = async () => {
        const refImage: StorageReference = ref(storage, `images/${auth.currentUser?.email}/profile`);
        await deleteObject(refImage);
    }

    const handleVerification = async () => {
        await sendEmailVerification(auth.currentUser!);
        alert(t('verification_email_sent'));
    }

    useEffect(() => {

        auth.authStateReady()
            .then(() => {
                if (!auth.currentUser || auth.currentUser === null) {
                    push("/login");
                }
                else {
                    fetchUser(auth.currentUser.email!).then(u => { setUserInfo(u) }).catch(console.error);
                    getImageURL(`images/${auth.currentUser.email}/profile`)
                        .then(url => {
                            setImageProfileURL(url);
                            const ev = new CustomEvent("profileImageChanged", { detail: { url: url } as ProfileImageChangedEventDetail });
                            window.dispatchEvent(ev);
                        })
                        .catch(
                            (error) => {
                                getImageURL(`images/default/profile.png`)
                                    .then(urlDefault => {
                                        setImageProfileURL(urlDefault);
                                        const ev = new CustomEvent("profileImageChanged", { detail: { url: urlDefault } as ProfileImageChangedEventDetail });
                                        window.dispatchEvent(ev);
                                    })
                            }
                        );
                }
            });
    }, []);

    return (
        <>
            {isLoading == false && auth.currentUser?.emailVerified &&
                (
                    <div className="flex flex-col mx-auto">
                        <div className="defaultTitle">
                            {t('profile')}
                        </div>
                        <div className="flex flex-col w-full max-w-lg">
                            <img
                                className="object-cover rounded-full mx-auto my-2 border-2 border-gray-200 shadow-md "
                                src={imageProfileURL} 
                                alt="Imagen del perfil"
                                style={{ width: '50%', aspectRatio: '1/1' }}
                            />
                            {
                                //TODO: Cambiar idioma
                            }
                            <input type="file" accept=".jpg, .jpeg"
                                onChange={handleImageUpload}
                            />

                            <br />
                            {!decodeURIComponent(imageProfileURL!).includes("images/default/profile.png") &&
                                (<button className="redButton" onClick={async () => {
                                    await deleteImageProfile();
                                    const urlDefault = await getImageURL(`images/default/profile.png`);
                                    setImageProfileURL(urlDefault);
                                    const ev = new CustomEvent("profileImageChanged", { detail: { url: urlDefault } as ProfileImageChangedEventDetail });
                                    window.dispatchEvent(ev);
                                }}>{t('delete')}</button>)
                            }

                            <br />
                            <br />

                            <p>{auth.currentUser?.email}</p>

                            <br />
                            <hr />

                            <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
                                {errorF1 != '' && (<p className="error">Error: {errorF1}</p>)}
                                <div>
                                    <div className="defaultTitle">
                                        {t('edit_name_surname')}
                                    </div>

                                    <label htmlFor="name" className="defaultLabel">
                                        {t('name')}
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={userInfo?.name}
                                        required
                                        className="defaultInput"
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="surname" className="defaultLabel">
                                        {t('surname')}
                                    </label>
                                    <input
                                        type="text"
                                        id="surname"
                                        name="surname"
                                        value={userInfo?.surname}
                                        className="defaultInput"
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <button type="submit" className="defaultButton">
                                    {t('save')}
                                </button>
                            </form>

                            <br />
                            <hr />

                            <div className="defaultTitle">
                                {t('change_password')}
                            </div>
                            {errorF2 != '' && (<p className="error">Error: {errorF2}</p>)}

                            <form className="space-y-4 md:space-y-6" onSubmit={handleSubmitChangePassword}>
                                <label
                                    htmlFor="actualPassword"
                                    className="defaultLabel">
                                    {t('actual_password')}
                                </label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="defaultInput"
                                    required
                                    onChange={(ev) => { setActualPassword(ev.target.value) }} />
                                <label
                                    htmlFor="newPassword"
                                    className="defaultLabel">
                                    {t('new_password')}
                                </label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="defaultInput"
                                    required
                                    onChange={(ev) => { setNewPassword(ev.target.value) }} />
                                <label
                                    htmlFor="confirmNewPassword"
                                    className="defaultLabel">
                                    {t('confirm_new_password')}
                                </label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="defaultInput"
                                    required
                                    onChange={(ev) => { setConfirmNewPassword(ev.target.value) }} />

                                <button type="submit" className="defaultButton">
                                    {t('change')}
                                </button>
                            </form>

                            <br />
                            <hr />

                            <div className="defaultTitle">
                                {t('delete_account')}
                            </div>

                            <button className="redButton" onClick={handleDeleteAccount}>
                                {t('delete')}
                            </button>
                        </div>
                    </div>
                )
            }

            {isLoading == false && !auth.currentUser?.emailVerified &&
                (
                    <>
                        <div className="flex flex-col mx-auto w-full max-w-lg">
                            <div className="defaultTitle">
                                {t('verify_title')}
                            </div>
                            <p>{t('verification_message')}</p>
                            <button 
                                className="defaultButton" 
                                onClick={handleVerification}>
                                    {t('send')}
                            </button>
                            <br />
                            <hr />

                            <div className="defaultTitle">
                                {t('delete_account')}
                            </div>
                            <button className="redButton" onClick={handleDeleteAccount}>
                                {t('delete')}
                            </button>
                        </div>
                    </>
                )
            }

        </>
    );
}