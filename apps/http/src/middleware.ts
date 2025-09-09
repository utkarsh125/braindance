import { NextFunction, Request, Response } from "express";

import { JWTPayload } from "@repo/shared-types/index";
import { JWT_SECRET } from "@repo/backend-common/config";
import jwt from "jsonwebtoken";

export function middleware(req: Request, res: Response, next: NextFunction){

    const token = req.header("authorization") ?? "";

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