

interface User {
    userId: string;
    ws: WebSocket;
    connectedAt: Date;
    lastActivity: Date;
    metadata?: Record<string, any>;
}

interface Room {
    id: string;
    name: string;
    members: Set<String>;
    createdAt: Date;
}

interface ServerState{
    connection: Map<string, User>;
    userSockets: Map<WebSocket, string>;
    rooms: Map<string, Room>; 
    userRooms: Map<string, Set<string>>;   
}