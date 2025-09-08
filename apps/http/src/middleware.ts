import { NextFunction, Request, Response } from "express";

import { JWTPayload } from "./types";
import { JWT_SECRET } from "./config";
import jwt from "jsonwebtoken";

export function middleware(req: Request, res: Response, next: NextFunction){

    const token = req.headers["authorization"] ?? "";

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(403).json({
            message:"Unauthorized"
        });
    }
}