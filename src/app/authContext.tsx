"use client";

import React, { useEffect, useState, createContext, ReactNode } from "react"
import { User, getAuth } from "firebase/auth"
import firebaseApp from "./firebaseService"

interface ContextProps {
    user: User | null | undefined
}

export const AuthContext = createContext<ContextProps>({ user: undefined })

interface AuthProviderProps {
    children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null | undefined>(undefined)

    useEffect(() => {
        getAuth(firebaseApp).onAuthStateChanged(setUser)
    }, [])

    return (
        <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
    )
}