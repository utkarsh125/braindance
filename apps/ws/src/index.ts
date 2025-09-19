import WebSocket, { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { JWTPayload } from "@repo/shared-types/index";
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

interface User{
    userId: string;
    ws: WebSocket;
    rooms: string[];
}

const users: User[] = [];

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
    return null;
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

        if(parsedData.type === "join-room"){
            const user = users.find(x => x.ws ===ws);
            user?.rooms.push(parsedData.roomId);
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


