"use client";

import Link from "next/link";

export default function Footer() {

    const footerRoutes = [
        { id: 1, name: "About", href: "/about" },
        { id: 2, name: "Download", href: "/download" },
        { id: 3, name: "Contact", href: "/contact" }
    ]

    return (
        <div className="bg-gray-800 w-screen mx-auto">
            <footer className="p-4 rounded-lg shadow md:flex md:items-center md:justify-between md:p-6">
                <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">© {new Date().getFullYear()} AudioGuias TFG</span>

                <ul className="flex flex-wrap items-center mt-3 sm:mt-0">
                    { 
                        footerRoutes.map((route) => (
                            <li key={route.id}>
                                <Link href={route.href} className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium">{route.name}</Link>
                            </li>)
                        )
                    }
                </ul>
            </footer>
        </div>
    );
}