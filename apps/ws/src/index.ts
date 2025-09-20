import WebSocket, { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { JWTPayload, RoomState, User } from "@repo/shared-types/index";
import { prisma } from "@repo/db"
// Dynamically import JWT_SECRET to fix ESM/CJS interop issue
let JWT_SECRET: string;
(async () => {
    const config = await import("@repo/backend-common/config");
    JWT_SECRET = config.JWT_SECRET;
})();

const wss = new WebSocketServer({
    port: 8080,
})

//TODO: Put these in shared-types
// interface User{
//     userId: string;
//     ws: WebSocket;
//     rooms: string[];
// }

// interface RoomState{
//     id: string;
//     users: Map<String, User>;
//     createdAt: number;
//     lastActivity: number;
// }

//TODO: User Management
const users = new Map<String, User>();//userId-> user
const userConnections = new Map<WebSocket, string>(); //ws->userId

const rooms = new Map<string, RoomState>();

//validate user
function checkUser(token: string): string | null {

    try {
        
        const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
        if(typeof decoded == 'string'){
            return null;
        }
        if(!decoded || !decoded.userId){
            return null;
        }

        return decoded.userId;
    } catch (error) {
        console.error("Error: ", error);
        return null;
    }
}

//validate room
async function validateRoom(roomId: string): Promise<Boolean> {
    try {
        const room = await prisma.room.findUnique({
            where: {
                id: parseInt(roomId)
            }
        });
        return !!room; //if(room found then return true)
    } catch (error) {
        console.error("Room validation error: ", error);
        return false;
    }
}

wss.on('connection', function connection(ws, request){

    const url = request.url;
    if(!url){
        return;
    }
    const queryParams = new URLSearchParams(url.split('?')[1]);
    const token = queryParams.get('token') || "";
    const userId = checkUser(token);

    if(userId == null){
        ws.close();
        return null;
    }

    users.push({
        userId,
        rooms: [],
        ws
    })

    ws.on('message', async function message(data){

        let parsedData;
        if(typeof data !== 'string'){
            parsedData = JSON.parse(data.toString());
        }else{
            parsedData = JSON.parse(data); // {type: "join-room", roomId: 1}
        }

        //TODO: Check if the room is already in the table
        if(parsedData.type === "join-room"){
            const roomId = parsedData.roomId;

            //validate room's existence
            const isRoom = await validateRoom(roomId);

            if(!isRoom){
                ws.send(JSON.stringify({
                    type: "error",
                    message: "Room not found"
                }));
                return;
            }

            //check room capacity
            const room = rooms.get(roomId);
            if(room && room.users.size >=5){
                ws.send(JSON.stringify({
                    type: "error",
                    message: "Room is full"
                }));
                return;
            }

            //join room logic
            const user = users.get(userId);
            if(user){
                //leave previous room if any
                if(user.currentRoom){
                    leaveRoom(user.currentRoom, userId);
                }
                joinRoom(roomId,user);
            }
        }

        if(parsedData.type === "leave-room"){
            const user = users.find(x => x.ws ==ws);
            if(!user){
                return;
            }
            user.rooms = user?.rooms.filter(x => x === parsedData.room);

        }

        console.log("message received");
        console.log(parsedData);

        if(parsedData.type === "chat"){
            const roomId = parsedData.roomId;
            const message = parsedData.message;

            await prisma.chat.create({
                data: {
                    roomId: Number(roomId),
                    message,
                    userId
                }
            });

            users.forEach(user => {
                if(user.rooms.includes(roomId)){
                    user.ws.send(JSON.stringify({
                        type: "chat",
                        message: message,
                        roomId
                    }))
                }
            })
        }
    })

})


