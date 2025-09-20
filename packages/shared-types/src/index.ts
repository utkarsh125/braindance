import WebSocket from "ws";

export interface JWTPayload{
    userId: string;
}

declare global{
    namespace Express{ 
        interface Request {
            userId?: string;
        }
    }
}

export interface User{
    userId: string;
    ws: WebSocket;
    rooms: string[];
    currentRoom?: string;
    lastSeen?: number;
}

export interface RoomState{
    id: string;
    users: Map<string, User>;
    createdAt: number;
    lastActivity: number;
}