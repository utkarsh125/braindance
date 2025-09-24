import { NextFunction, Request, Response } from "express";

import { JWTPayload } from "@repo/shared-types/index";
import { JWT_SECRET } from "@repo/backend-common/config";
import jwt from "jsonwebtoken";

interface RequestWithUserId extends Request {
    userId?: string;
}

export function middleware(req: RequestWithUserId, res: Response, next: NextFunction){

    // const token = req.header("authorization") ?? "";

    const authHeader = req.header("authorization") ?? "";

    //extract token from "Bearer <token>"
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
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