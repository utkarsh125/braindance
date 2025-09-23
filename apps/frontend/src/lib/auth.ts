import axios from "axios";


const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function signup(username: string, email: string, password: string){

    try {
        
        const response = await axios.post(`${API_URL}/signup`, {
            username,
            email,
            password,
        })
        return {
            success: true,
            data: response.data,
        }
    } catch (error: any) {
        return {
            success: false,
            error: error.response.data.message,
        }
    }
}

export async function login(username: string, password: string){

    try {
        
        const response = await axios.post(`${API_URL}/signin`, {
            username,
            password,
        })
        return {
            success: true,
            data: response.data
        }
    } catch (error: any) {
        return {
            success: false,
            error: error.response.data.error
        }
    }
}