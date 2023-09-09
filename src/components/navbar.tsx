"use client";

import { useEffect, useState } from "react"
import { getAuth, signOut, User as FirebaseUser } from "firebase/auth";
import { useRouter } from 'next-intl/client';
import firebaseApp from "@/services/firebaseService";
import Link from "next-intl/link";
import { useProfileImageURL } from "@/hooks/useProfileImageURL";
import LocaleSwitcher from "./localeSwitcher";
import { useTranslations } from 'next-intl';

export default function NavBar() {

    const imageProfileURL = useProfileImageURL();
    const auth = getAuth(firebaseApp);
    const router = useRouter();
    const t = useTranslations();

    const [isLoading, setIsLoading] = useState(true);
    const [isLoged, setIsLoged] = useState(false);

    const logout = () => {
        signOut(auth);
        router.push("/");
    }

    const loggedRoutes = [
        { id: 1, name: t('home'), href: "/" },
        { id: 2, name: t('my_audioguides'), href: "/audioguides" },
        { id: 3, name: t('create_audioguide'), href: "/audioguides/new" },
    ]

    const notLoggedRoutes = [
        { id: 1, name: t('home'), href: "/" },
    ]

    useEffect(() => {
        const unsubscribe = getAuth().onAuthStateChanged((user) => {
            setIsLoading(false);  // Desactivar la carga cuando se reciba el estado de autenticación
            if (user) {
                setIsLoged(true);
            } else {
                setIsLoged(false);
            }
        });

        return () => unsubscribe();
    }, []);
    if (isLoading || !isLoged) {
        return <></>;
    } else {
        return (
            <nav className="primaryColor">
                <div className="max-w-7xl px-2 sm:px-6 lg:px-8">
                    <div className="relative flex h-16 items-center justify-between">
                        <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                            <button type="button" className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white" aria-controls="mobile-menu" aria-expanded="false">
                                <span className="absolute -inset-0.5"></span>
                                <span className="sr-only">
                                    {t('open_main_menu')}
                                </span>

                                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                </svg>

                                <svg className="hidden h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-center">
                            <div className="flex flex-shrink-0 items-center">
                                <img className="h-8 w-auto" src="https://firebasestorage.googleapis.com/v0/b/audioguias-24add.appspot.com/o/images%2Fdefault%2FlogoBlanco.png?alt=media&token=b0e151ba-f6f6-492e-8b0f-55aba7366819" alt="Your Company" />
                            </div>
                            <div className="hidden sm:ml-6 sm:block">
                                <div className="flex space-x-10">
                                    {isLoged
                                        ? loggedRoutes.map((route) => (<Link key={route.id} href={route.href} className="defaultButtonNV">{route.name}</Link>))
                                        : notLoggedRoutes.map((route) => (<Link key={route.id} href={route.href} className="defaultButtonNV">{route.name}</Link>))
                                    }

                                    {isLoged
                                        //TODO: colocar a la derecha
                                        ? <div className="flex content-end space-x-10">
                                            <img className="object-cover rounded-full h-8 w-8 cursor-pointer" src={imageProfileURL} onClick={() => { router.push("/profile") }} alt="Imagen del perfil"></img>
                                            <button className="defaultButtonNV2" onClick={logout}>
                                                {t('logout')}
                                            </button>
                                        </div>
                                        : <div className="flex space-x-10">
                                            <Link href="/login" className="defaultButtonNV2">
                                                {t('login')}
                                            </Link>
                                            <Link href="/signup" className="defaultButtonNV2">
                                                {t('signup')}
                                            </Link>
                                        </div>
                                    }

                                    <LocaleSwitcher />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="sm:hidden" id="mobile-menu">
                    <div className="space-y-1 px-2 pb-3 pt-2">
                        {isLoged
                            ? loggedRoutes.map((route) => (<Link key={route.id} href={route.href} className="text-white hover:bg-green-400 hover:text-white block rounded-md px-3 py-2 text-base font-medium">{route.name}</Link>))
                            : notLoggedRoutes.map((route) => (<Link key={route.id} href={route.href} className="text-white hover:bg-green-400 hover:text-white block rounded-md px-3 py-2 text-base font-medium">{route.name}</Link>))
                        }

                        {isLoged
                            ? <div className="flex flex-col space-y-1 px-2 pb-3 pt-2">
                                <img className="object-cover rounded-full h-8 w-8 cursor-pointer" src={imageProfileURL} onClick={() => { router.push("/profile") }} alt="Imagen del perfil"></img>
                                <button className="text-white hover:bg-green-400 hover:text-white block rounded-md px-3 py-2 text-base font-medium" onClick={logout}>
                                    {t('logout')}
                                </button>
                            </div>
                            : <div className="flex flex-col space-y-1 px-2 pb-3 pt-2">
                                <Link href="/login" className="text-white hover:bg-green-400 hover:text-white block rounded-md px-3 py-2 text-base font-medium">
                                    {t('login')}
                                </Link>
                                <Link href="/signup" className="text-white hover:bg-green-400 hover:text-white block rounded-md px-3 py-2 text-base font-medium">
                                    {t('signup')}
                                </Link>
                            </div>
                        }

                        <LocaleSwitcher />

                    </div>
                </div>
            </nav>
        )
    }


}