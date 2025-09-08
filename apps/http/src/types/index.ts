export interface JWTPayload{
    userId: string;
}

declare global{
    namespace Express{ 
        interface Request {
            userId?: string;
        }
    }
}