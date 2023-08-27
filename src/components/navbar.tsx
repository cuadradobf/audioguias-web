"use client";

import { useContext, useEffect, useState } from "react"
import { AuthContext } from "../contexts/authContext"
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import firebaseApp from "../services/firebaseService";
import Link from "next/link";
import { getDownloadURL, getStorage, ref } from "firebase/storage";
import { useProfileImageURL } from "@/hooks/useProfileImageURL";

export default function NavBar() {

    const { user } = useContext(AuthContext)
    const imageProfileURL = useProfileImageURL();
    const auth = getAuth(firebaseApp);
    const storageNavBar = getStorage(firebaseApp);
    const router = useRouter();

    const logout = () => {
        signOut(auth);
        router.push("/");
    }

    const loggedRoutes = [
        { id: 1, name: "Home", href: "/" },
        { id: 2, name: "Mis Audioguías", href: "/audioguides" },
        { id: 3, name: "Crear Audioguía", href: "/audioguides/new" },
        { id: 4, name: "Idioma", href: "#" },
        { id: 5, name: "Perfil", href: "/profile" },
    ]

    const notLoggedRoutes = [
        { id: 1, name: "Home", href: "/" },
    ]

    const getImageURLNavBar = async (path: string): Promise<string> => {
        return await getDownloadURL(ref(storageNavBar, path));
    }

    /*
    useEffect(() => {
        if (user) {
            getImageURLNavBar(`images/${user.email}/profile`)
                .then(url => {
                    setImageProfileURL(url);
                })
                .catch(
                    (error) => {
                        getImageURLNavBar(`images/default/profile.png`)
                            .then(urlDefault => {
                                setImageProfileURL(urlDefault);
                            })
                    }
                );
        }
    }, [user]);
    */

    return (
        <nav className="bg-gray-800">
            <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
                <div className="relative flex h-16 items-center justify-between">
                    <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                        <button type="button" className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white" aria-controls="mobile-menu" aria-expanded="false">
                            <span className="absolute -inset-0.5"></span>
                            <span className="sr-only">Open main menu</span>

                            <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            </svg>

                            <svg className="hidden h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                        <div className="flex flex-shrink-0 items-center">
                            <img className="h-8 w-auto" src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500" alt="Your Company" />
                        </div>
                        <div className="hidden sm:ml-6 sm:block">
                            <div className="flex space-x-4">
                                {!!user
                                    ? loggedRoutes.map((route) => (<Link key={route.id} href={route.href} className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium">{route.name}</Link>))
                                    : notLoggedRoutes.map((route) => (<Link key={route.id} href={route.href} className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium">{route.name}</Link>))
                                }

                                {!!user
                                    //TODO: colocar a la derecha
                                    ? <div className="flex space-x-4">
                                        <img className="h-8 w-8 rounded-full" src={imageProfileURL} alt="Imagen del perfil"></img>;
                                        <button className="text-white bg-red-900 hover:bg-red-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium" onClick={logout}>Logout</button>
                                    </div>
                                    : <div className="flex space-x-4">
                                        <Link href="/login" className="text-white bg-blue-900 hover:bg-blue-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium">Login</Link>
                                        <Link href="/signup" className="text-white bg-purple-900 hover:bg-purple-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium">Signup</Link>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="sm:hidden" id="mobile-menu">
                <div className="space-y-1 px-2 pb-3 pt-2">
                    {!!user
                        ? loggedRoutes.map((route) => (<Link key={route.id} href={route.href} className="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-base font-medium">{route.name}</Link>))
                        : notLoggedRoutes.map((route) => (<Link key={route.id} href={route.href} className="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-base font-medium">{route.name}</Link>))
                    }

                    {!!user
                        ? <div className="flex flex-col space-y-1 px-2 pb-3 pt-2">
                            <img className="h-8 w-8 rounded-full" src={imageProfileURL} alt="Imagen del perfil"></img>;
                            <button className="text-white bg-red-900 hover:bg-red-700 hover:text-white rounded-md px-3 py-2 block text-sm font-medium" onClick={logout}>Logout</button>
                        </div>
                        : <div className="flex flex-col space-y-1 px-2 pb-3 pt-2">
                            <Link href="/login" className="text-white bg-blue-900 hover:bg-blue-700 hover:text-white rounded-md px-3 py-2 block text-sm font-medium">Login</Link>
                            <Link href="/signup" className="text-white bg-red-900 hover:bg-red-700 hover:text-white rounded-md px-3 py-2 block text-sm font-medium">Signup</Link>
                        </div>
                    }
                </div>
            </div>
        </nav>
    )
}