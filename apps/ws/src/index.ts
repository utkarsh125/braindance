import WebSocket, { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { JWTPayload } from "@repo/shared-types/index";
// Dynamically import JWT_SECRET to fix ESM/CJS interop issue
let JWT_SECRET: string;
(async () => {
    const config = await import("@repo/backend-common/config");
    JWT_SECRET = config.JWT_SECRET;
})();

const wss = new WebSocketServer({
    port: 8080,
})
