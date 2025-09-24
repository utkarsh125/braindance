"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export function useAuth(){
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [userId, setUserId] = useState<string | null>(null)
    const [token, setToken] = useState<string | null>(null)

    const router = useRouter()

    useEffect(() => {
        const storedToken = sessionStorage.getItem("token")
        const storedUserId = sessionStorage.getItem("userId")
        if(storedToken && storedUserId){
            setIsAuthenticated(true)
            setToken(storedToken)
            setUserId(storedUserId)
        }
        setIsLoading(false)
    }, [])

    const logout = () => {
        sessionStorage.removeItem("token")
        sessionStorage.removeItem("userId")
        setIsAuthenticated(false)
        setToken(null)
        setUserId(null)
        router.push("/login")
    }

    return {
        isAuthenticated,
        isLoading,
        logout,
        userId,
        token,
    }
}