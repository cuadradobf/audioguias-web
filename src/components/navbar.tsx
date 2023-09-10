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
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const logout = () => {
        signOut(auth);
        router.push("/");
    }

    const loggedRoutes = [
        { id: 1, name: t('my_audioguides'), href: "/audioguides" },
        { id: 2, name: t('create_audioguide'), href: "/audioguides/new" },
    ]

    useEffect(() => {
        const unsubscribe = getAuth().onAuthStateChanged((user) => {
            // Se desactiva la carga cuando se recibe el estado de autenticación
            setIsLoading(false);
            if (user) {
                setIsLoged(true);
            } else {
                setIsLoged(false);
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <>
            {isLoading == true && (
                <>
                    <nav className="primaryColor">
                        <div className="max-w-7xl px-2 sm:px-6 lg:px-8">
                            <div className="relative flex h-16 items-center justify-between">
                                <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-center">
                                    <div className="flex flex-shrink-0 items-center">
                                        <img className="h-8 w-auto" src="https://firebasestorage.googleapis.com/v0/b/audioguias-24add.appspot.com/o/images%2Fdefault%2FlogoBlanco.png?alt=media&token=b0e151ba-f6f6-492e-8b0f-55aba7366819" alt="Audioguias" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </nav>
                </>
            )

            }


            {isLoading == false && (
                <nav className="primaryColor">
                    <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                        <Link href={"/"}>
                            <img className="h-8 w-auto" src="https://firebasestorage.googleapis.com/v0/b/audioguias-24add.appspot.com/o/images%2Fdefault%2FlogoBlanco.png?alt=media&token=b0e151ba-f6f6-492e-8b0f-55aba7366819" alt="Audioguias" />
                        </Link>
                        <div className="flex items-center md:order-2 space-x-4">
                            {isLoged
                                ? <>
                                    <img className="object-cover rounded-full h-8 w-8 cursor-pointer" src={imageProfileURL} onClick={() => { router.push("/profile") }} alt="Imagen del perfil"></img>
                                    <button className="defaultButtonNV2" onClick={logout}>
                                        {t('logout')}
                                    </button>
                                </>
                                : <>
                                    <Link href="/login" className="defaultButtonNV2">
                                        {t('login')}
                                    </Link>
                                    <Link href="/signup" className="defaultButtonNV2">
                                        {t('signup')}
                                    </Link>
                                </>
                            }
                            <LocaleSwitcher />
                            <button
                                onClick={toggleMenu}
                                type="button"
                                className="relative inline-flex items-center justify-center rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white sm:hidden"
                                aria-controls="mobile-menu"
                                aria-expanded="false">
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
                        <div className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1" id="navbar-language">
                            <ul className="flex flex-col  p-4 md:p-0 mt-4 md:flex-row md:space-x-8 md:mt-0 md:border-0">
                                {isLoged &&
                                    loggedRoutes.map((route) => (<li><Link key={route.id} href={route.href} className="defaultButtonNV">{route.name}</Link></li>))
                                }
                            </ul>
                        </div>
                    </div>

                    <div className={menuOpen ? "block" : "hidden"} id="mobile-menu">
                        <div className="space-y-1 px-2 pb-3 pt-2">
                            {isLoged &&
                                loggedRoutes.map((route) => (<Link key={route.id} href={route.href} className="text-white hover:border-white block rounded-md px-3 py-2 text-base font-medium">{route.name}</Link>))
                            }

                        </div>
                    </div>
                </nav>
            )
            }
        </>

    )



}