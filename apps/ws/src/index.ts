import WebSocket, { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { JWTPayload } from "@repo/shared-types/index";
import { JWT_SECRET } from "@repo/backend-common/config";

const wss = new WebSocketServer({
    port: 8080,
})

wss.on('connection', function connection(ws, request){

    const url = request.url; //ws://localhost:3000/?token=123123
    //[ ws://localhost:3000, token = 123123]
    if(!url){
        return;
    }
    
    const queryParams = new URLSearchParams(url.split('?')[1]);
    const token = queryParams.get('token') || "";

    try {
        
        const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

        if(!decoded || !decoded.userId){
            ws.close(); // if no token, then no ws connection at all
            return;
        }
    } catch (error) {
        ws.close();
        return;
    }


    ws.on('error', console.error);

    ws.on('message', function message(data) {
        console.log('received: %s', data);
    });

    ws.send('something');
})