import WebSocket from "ws";
import { prisma } from "@repo/db";
import { RoomState, User } from "@repo/shared-types/index";


export class RoomManager {

    private rooms = new Map<string, RoomState>(); //map of roomId to RoomState
    private users = new Map<string, User>(); //map of userId to User
    private userConnections = new Map<WebSocket, string>(); //map of websockets to userId

    private readonly MAX_USERS_PER_ROOM = 5;
    private readonly MAX_TOTAL_CONNECTIONS = 100;

    //User Management
    addUser(user: User, ws: WebSocket): boolean {

        //server capacity check
        if(this.users.size >= this.MAX_TOTAL_CONNECTIONS){
            return false; //if capacity reached.
        }

        //if not then
        //add user to users map
        this.users.set(user.userId, user); 

        //map websocket to userId
        this.userConnections.set(ws, user.userId);
        return true; //success
    }

    removeUser(userId: string, ws: WebSocket): void {
        const user = this.users.get(userId); //get user from usermap
        if(user && user.currentRoom){ //if user exists and he is in a room (both true)
            this.leaveRoom(user.currentRoom, userId); //leave the room
        }

        this.users.delete(userId);//remove user from usermap
        this.userConnections.delete(ws);//remove websocket mapping
    }

    getUserByWebSocket(ws: WebSocket): User | undefined {
        const userId =this.userConnections.get(ws);
        
        if(userId){
            return this.users.get(userId);
        }else{
            return undefined;
        }


    }

    getUserById(userId: string): User | undefined {
        return this.users.get(userId);
    }

    //Room Validation
    async validateRoom(roomId: string): Promise<boolean> {
        try {
            
            const room = await prisma.room.findUnique({
                where: {
                    id: parseInt(roomId)
                }
            });
            return !!room;
        } catch (error) {
            console.error("Room validation failed: ", error);
            return false;
        }
    }


    //Room Management
    private createRoom(roomId: string): RoomState {
        const roomState: RoomState = {
            id: roomId,
            users: new Map(),
            createdAt: Date.now(),
            lastActivity: Date.now()
        };

        this.rooms.set(roomId, roomState);
        return roomState;
    }

    async joinRoom(roomId: string, userId: string): Promise<{ success: boolean; message?: string}>{

        //validate room's existence
        const isRoom = await this.validateRoom(roomId);

        if(!isRoom){
            return {
                success: false,
                message: "room not found"
            };
        }

        const user = this.users.get(userId);
        if(!user){
            return {
                success: false,
                message: "user not found"
            };
        }

        //check room capacity
        let room = this.rooms.get(roomId);
        if(!room){
            room = this.createRoom(roomId);
        }

        if(room.users.size >= this.MAX_USERS_PER_ROOM){
            return {
                success: false,
                message: "Room is full"
            }
        }

        //Leave previous room if any
        if(user.currentRoom && user.currentRoom !== roomId) {
            this.leaveRoom(user.currentRoom, userId);
        }
        
        //
        //Join new room
        room.users.set(userId, user);
        user.currentRoom = roomId;
        room.lastActivity = Date.now();

        //Notify other users
        this.broadcastToRoom(roomId, {
            type: 'user-joined',
            userId: user.userId,
            userCount: room.users.size
        }, userId);
        return {
            success: true
        }
    }


    leaveRoom(roomId: string, userId: string): void {
        const room = this.rooms.get(roomId);
        if(!room) return;

        room.users.delete(userId);
        room.lastActivity = Date.now();

        //notify other users
        this.broadcastToRoom(roomId, {
            type: "user-left",
            userId,
            userCount: room.users.size
        })

        //clean up empty rooms
        if(room.users.size === 0){
            this.rooms.delete(roomId);
        }

    }

    broadcastToRoom(roomId: string, message: any, excludeUserId?: string): void {
        const room = this.rooms.get(roomId); //get the room
        if(!room) return;


        const messageStr = JSON.stringify(message);
        room.users.forEach((user, userId) => {
            if(userId !== excludeUserId && user.ws.readyState === WebSocket.OPEN){
                user.ws.send(messageStr);
            }
        })
    }

    getRoomInfo(roomId: string): { userCount: number; users: string[] } | null {
        const room = this.rooms.get(roomId);
        if(!room) return null;

        return {
            userCount: room.users.size,
            users: Array.from(room.users.keys())
        }
    }

    //cleanup
    cleanupInactiveRooms(): void {
        const now = Date.now();
        const INACTIVE_THRESHOLD = 5 * 60 * 1000; //5 min threshold

        this.rooms.forEach((room, roomId) => {
            if(now - room.lastActivity > INACTIVE_THRESHOLD){
                console.log(`Cleaning up inactive room: ${roomId}`);
                this.rooms.delete(roomId);
            }
        })
    }

    //statistics
    getStats(): { totalUsers: number; totalRooms: number; activeRooms: number} {
        return {
            totalUsers:this.users.size,
            totalRooms:this.rooms.size,
            activeRooms:Array.from(this.rooms.values()).filter(room => room.users.size > 0).length
        }
    }
}

export const roomManager = new RoomManager();