"use client";

import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/contexts/authContext";
import { useRouter } from "next/navigation";
import { getDownloadURL, getStorage, ref } from "firebase/storage";
import firebaseApp from "@/services/firebaseService";
import { User } from "@/models/models";
import { deleteDoc, doc, getDoc, getFirestore } from "firebase/firestore";
import { AuthCredential, EmailAuthProvider, deleteUser, getAuth, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { sign } from "crypto";

export default function Profile() {

    const { push } = useRouter();
    const { user } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(true);
    const [userInfo, setUserInfo] = useState<User>();
    const [imageProfileURL, setImageProfileURL] = useState<string>("");
    const [actualPassword, setActualPassword] = useState<string>("");
    const [newPassword, setNewPassword] = useState<string>("");
    const [confirmNewPassword, setConfirmNewPassword] = useState<string>("");
    const [errorF1, setErrorF1] = useState('');
    const [errorF2, setErrorF2] = useState('');

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
    //TODO: logica para cambiar imagen de perfil o borrarla

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        const regexName = new RegExp(/^[a-zA-ZÀ-ÿ\u00f1\u00d1]+( [a-zA-ZÀ-ÿ\u00f1\u00d1]+)*$/);

        if (!regexName.test(userInfo!.name)) {
            setErrorF1('name-invalid');
            return;
        }
        if (!regexName.test(userInfo!.surname)) {
            setErrorF1('surname-invalid');
            return;
        }
        try {
            //TODO: logica para guardar los datos del usuario
        } catch (error: any) {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(error);
            switch (errorCode) {
                default:
                    setErrorF1(errorMessage.toString());
                    break;
            }
        }
    };

    const handleSubmitChangePassword = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const regex = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,16}$/;
        const regexPassword = new RegExp(regex)

        if (actualPassword == "" || newPassword == "" || confirmNewPassword == "") {
            setErrorF2("Campos vacíos requeridos");
            return;
        }

        if (newPassword != confirmNewPassword) {
            setErrorF2("Las contraseñas no coinciden");
            return;
        }

        if (!regexPassword.test(newPassword)) {
            setErrorF2('password-too-weak');
            return;
        }

        try {
            await reauthenticateWithCredential(user!, EmailAuthProvider.credential(user!.email!, actualPassword))
            await updatePassword(user!, newPassword);
            alert("Contraseña cambiada correctamente");
            return;
        } catch (error: any) {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(error);
            switch (errorCode) {
                case "auth/wrong-password":
                    setErrorF2("wrong-password");
                    break;
                case "auth/weak-password":
                    setErrorF2("weak-password");
                    break;
                default:
                    setErrorF2(errorMessage.toString());
                    break;
            }
        }
    }

    const handleDeleteAccount = async () => {
        const actualPw = prompt("Introduce tu contraseña para confirmar la eliminación de la cuenta");
        if (actualPw == null || actualPw == "") {
            alert("No se ha introducido ninguna contraseña");
            return;
        }

        try {
            await reauthenticateWithCredential(user!, EmailAuthProvider.credential(user!.email!, actualPw))
            await deleteUser(user!)
            await deleteDoc(doc(db, "user", user?.email!))

            await auth.signOut();
            alert("Usuario borrado correctamente")

        } catch (error: any) {
            const errorCode = error.code;
            const errorMessage = error.message;

            console.log(error);
            switch (errorCode) {
                case "auth/wrong-password":
                    alert("wrong-password");
                    break;
                default:
                    alert(errorMessage.toString());
                    break;
            }

        }
    }

    useEffect(() => {
        if (!user) {
            push('/login');
        }
        else {
            fetchUser(user.email!).then(u => { setUserInfo(u) }).catch(console.error);
            getImageURL(`images/${user.email}/profile`)
                .then(url => { setImageProfileURL(url) })
                .catch(
                    (error) => {
                        getImageURL(`images/default/profile.png`)
                            .then(urlDefault => { setImageProfileURL(urlDefault) })
                    }
                );
        }
    }, []);

    return (
        <>
            {isLoading == false &&
                (
                    <div className="flex flex-col mx-auto">
                        <div className="defaultTitle">
                            Profile
                        </div>
                        <div className="flex flex-col w-full max-w-lg">
                            <img
                                className="object-contain rounded mx-auto my-2 border-2 border-gray-200 shadow-md "
                                src={imageProfileURL} alt="Imagen del perfil"
                            />

                            <br />  
                            <br />

                            <p>{user?.email}</p>

                            <br />
                            <hr />

                            <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
                                {errorF1 != '' && (<p className="error">Error: {errorF1}</p>)}
                                <div>
                                <div className="defaultTitle">Edit name or surname</div>

                                    <label htmlFor="name" className="defaultLabel">Name</label>
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
                                    <label htmlFor="surname" className="defaultLabel">Surname</label>
                                    <input
                                        type="text"
                                        id="surname"
                                        name="surname"
                                        value={userInfo?.surname}
                                        className="defaultInput"
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <button type="submit" className="defaultButton">Save</button>
                            </form>

                            <br />
                            <hr />
                            
                            <div className="defaultTitle">Change password</div>
                            {errorF2 != '' && (<p className="error">Error: {errorF2}</p>)}

                            <form className="space-y-4 md:space-y-6" onSubmit={handleSubmitChangePassword}>
                                <label 
                                    htmlFor="actualPassword" 
                                    className="defaultLabel">
                                        Actual password
                                </label>
                                <input 
                                    type="password" 
                                    placeholder="••••••••" 
                                    className="defaultInput" 
                                    required
                                    onChange={(ev) => { setActualPassword(ev.target.value) }} />
                                <label 
                                    htmlFor="actualPassword" 
                                    className="defaultLabel">
                                        New password
                                </label>
                                <input 
                                    type="password" 
                                    placeholder="••••••••" 
                                    className="defaultInput" 
                                    required
                                    onChange={(ev) => { setNewPassword(ev.target.value) }} />
                                <label 
                                    htmlFor="actualPassword" 
                                    className="defaultLabel">
                                        Confirm new password
                                </label>
                                <input 
                                    type="password" 
                                    placeholder="••••••••" 
                                    className="defaultInput" 
                                    required
                                    onChange={(ev) => { setConfirmNewPassword(ev.target.value) }} />

                                <button type="submit" className="defaultButton">Change</button>
                            </form>

                            <br />
                            <hr />
                            
                            <div className="defaultTitle">Delete account</div>

                            <button className="redButton" onClick={handleDeleteAccount}>Delete</button>
                        </div>
                    </div>
                )
            }
        </>
    );
}