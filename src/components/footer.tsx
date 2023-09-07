"use client";

import Link from "next-intl/link";
import {useTranslations} from 'next-intl';

export default function Footer() {
    const t = useTranslations();

    const footerRoutes = [
        { id: 1, name: t('about'), href: "/about" },
        { id: 2, name: t('contact'), href: "/contact" }
    ]

    return (
        <div className="bg-white w-screen mx-auto">
            <footer className="p-4 rounded-lg shadow md:flex md:items-center md:justify-between md:p-6">
                <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">© {new Date().getFullYear()} AudioGuias TFG</span>

                <ul className="flex flex-wrap items-center mt-3 sm:mt-0">
                    { 
                        footerRoutes.map((route) => (
                            <li key={route.id}>
                                <Link href={route.href} className="text-green-600 hover:bg-green-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium">{route.name}</Link>
                            </li>)
                        )
                    }
                </ul>
            </footer>
        </div>
    );
}