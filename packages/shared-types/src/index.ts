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
}

export interface RoomState{
    id: string;
    users: Map<String, User>;
    createdAt: number;
    lastActivity: number;
}