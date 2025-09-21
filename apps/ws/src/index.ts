import WebSocket, { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { JWTPayload, User } from "@repo/shared-types/index";
import { prisma } from "@repo/db";
import { roomManager } from "./room.js"; // Import the room manager

// Dynamically import JWT_SECRET to fix ESM/CJS interop issue
// This issue can also be fixed by just using a simple change package.json, I made the change
// something to keep in mind in case of ESM/CJS interop 
// let JWT_SECRET: string;
// (async () => {
//     const config = await import("@repo/backend-common/config");
//     JWT_SECRET = config.JWT_SECRET;
// })();

import { JWT_SECRET } from "@repo/backend-common/config";

const wss = new WebSocketServer({
    port: 8080,
});

// Validate user
function checkUser(token: string): string | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
        // console.log("Decoded: ", decoded);

        //check if we received a malformed token
        if (typeof decoded === 'string') {
            return null;
        }

        //check if we have userId if we have valid string
        if (!decoded || !decoded.userId) {
            return null;
        }
        return decoded.userId;
    } catch (error) {
        console.error("Error:", error);
        return null;
    }
}

wss.on('connection', function connection(ws, request) {
    const url = request.url; //this would extract localhost:8080?token=xdasd
    if (!url) {
        return;
    }
    
    const queryParams = new URLSearchParams(url.split('?')[1]); //split after "?" so we just get the token
    const token = queryParams.get('token') || "";
    const userId = checkUser(token); //validate the token

    // console.log("User ID: ", userId);

    //close the ws connection if token is not valid
    if (userId == null) {
        ws.close();
        return null;
    }

    // Create user object with connection details - if token is valid
    const user: User = {
        userId,
        rooms: [],
        ws,
        currentRoom: undefined,
        lastSeen: Date.now()
    };

    // Add user to room manager
    const userAdded = roomManager.addUser(user, ws);
    if (!userAdded) {
        ws.close(1013, 'Server at capacity');
        return;
    }

    // Send welcome message
    ws.send(JSON.stringify({
        type: 'connected',
        userId: user.userId
    }));

    ws.on('message', async function message(data) { //listen for incoming message (type: "message")


        // console.log(`Raw message recieved: ${data}`);

        let parsedData;
        if (typeof data !== 'string') {
            parsedData = JSON.parse(data.toString());
        } else {
            parsedData = JSON.parse(data);
        }
        // console.log(`Parsed Message: ${parsedData}`);
        // console.log(`Message type: ${parsedData.type}`);

        
        // Update user's last seen
        const user = roomManager.getUserByWebSocket(ws);

        // console.log("User found: ", user);
        if (user) {
            user.lastSeen = Date.now();
        }

        switch (parsedData.type) {
            case "join-room":
                const roomId = parsedData.roomId;
                const result = await roomManager.joinRoom(roomId, userId);
                
                if (result.success) {
                    ws.send(JSON.stringify({
                        type: 'room-joined',
                        roomId,
                        message: 'Successfully joined room'
                    }));
                } else {
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: result.message
                    }));
                }
                break;

            case "leave-room":
                if (user && user.currentRoom) {
                    roomManager.leaveRoom(user.currentRoom, userId);
                    user.currentRoom = undefined;
                    ws.send(JSON.stringify({
                        type: 'room-left',
                        roomId: user.currentRoom
                    }));
                }
                break;

            case "chat":
                if (!user || !user.currentRoom) {
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: 'Not in a room'
                    }));
                    break;
                }

                const message = parsedData.message;
                await prisma.chat.create({
                    data: {
                        roomId: Number(user.currentRoom),
                        message,
                        userId
                    }
                });

                roomManager.broadcastToRoom(user.currentRoom, {
                    type: "chat",
                    message: message,
                    roomId: user.currentRoom,
                    userId
                });
                break;

            case "cursor-move":
                if (!user || !user.currentRoom) {
                    break;
                }

                roomManager.broadcastToRoom(user.currentRoom, {
                    type: 'cursor-move',
                    userId,
                    position: parsedData.position,
                    timestamp: Date.now()
                }, userId);
                break;

            case "health":
                ws.send(JSON.stringify({ type: 'health-good' }));
                break;

            default:
                ws.send(JSON.stringify({
                    type: 'error',
                    message: 'Unknown message type'
                }));
        }
    });

    // Cleanup on disconnect
    ws.on('close', () => {
        roomManager.removeUser(userId, ws);
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        roomManager.removeUser(userId, ws);
    });
});

// Cleanup inactive rooms every 5 minutes
setInterval(() => {
    roomManager.cleanupInactiveRooms();
}, 5 * 60 * 1000);

// Log statistics every minute
setInterval(() => {
    const stats = roomManager.getStats();
    console.log('Room Manager Stats:', stats);
}, 60 * 1000);

console.log('WebSocket server running on port 8080');