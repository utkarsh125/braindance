"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export function useAuth(){

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const router = useRouter();

    useEffect(() => {
        const token = sessionStorage.getItem("token");
        if(token){
            setIsAuthenticated(true);
        }
        setIsLoading(false);
    }, []);

    const logout = () => {
        sessionStorage.removeItem("token");
        setIsAuthenticated(false);
        router.push("/login");
    }

    return {
        isAuthenticated,
        isLoading,
        logout,
    }
}