import { JWT_SECRET } from "@repo/backend-common/config";
import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { middleware } from "./middleware.js";
import { CreateUserSchema, SignInSchema, CreateRoomSchema } from "@repo/common/types";
import { prisma } from "@repo/db";
import bcrypt from "bcrypt";
import cors from "cors";

const app = express();

//CORS 
app.use(cors({
  origin: [process.env.FRONTEND_URL || "http://localhost:3000"],
  credentials: true, 
}))

app.use(express.json());

//Sign up endpoint
app.post("/signup", async (req, res) => {

  console.log("Sign up endpoint");

  const parsedData = CreateUserSchema.safeParse(req.body);

  if(!parsedData.success){
    res.json({
      message:"Incorrect input",
    })
    return;
  }

  const hashedPassword = await bcrypt.hash(parsedData.data.password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        username: parsedData.data?.username,
        password: hashedPassword,
        email: parsedData.data.email
      }
    })

    res.json({
      userId: user.id,
      message: "User created successfully",
    })

    return;
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(411).json({
      message: "Error while creating user, user might already exist"
    });
    return;
  }
});

//Sign in endpoint
app.post("/signin", async (req, res) => {


  const parsedData = SignInSchema.safeParse(req.body);

  if(!parsedData.success){
    res.json({
      message:"Incorrect input",
    })
    return;
  }

  try {
  
    const user = await prisma.user.findUnique({
      where: {
        username: parsedData.data.username,
      }
    })

    if(!user){
      res.status(401).json({
        message: "User not found"
      })
      return;
    }

    const isPasswordValid = await bcrypt.compare(parsedData.data.password, user.password);
    console.log("Password valid:", isPasswordValid);

    if(!isPasswordValid){
      res.status(401).json({
        message: "Invalid password"
      })
      return;
    }


    const token = jwt.sign({
      userId: user.id,
      username: user.username
    }, JWT_SECRET, { expiresIn: '24h' })

    res.json({
      message: "Sign in successful",
      userId: user.id,
      token: token
    })
  
    
  } catch (error) {
    console.error("Error during signing in: ", error);
    res.status(500).json({
      message: "Error during sign in"
    })
  }

});

interface RequestWithUserId extends Request {
    userId?: string;
}

app.post("/room", middleware, async(req: Request, res: Response) => {
  
  const parsedData = CreateRoomSchema.safeParse(req.body);
  
  if(!parsedData.success){
    res.json({
      message: "Incorrect input"
    })
    return;
  }

  const userId = (req as RequestWithUserId).userId;
  
  if (!userId) {
    res.status(403).json({
      message: "Not Authorized"
    });
    return;
  }

  try {
    const room =await prisma.room.create({
      data: {
        slug: parsedData.data.name,
        adminId: userId,
      }
    })
    res.json({
      message: "Room created successfully",
      roomId: room.id
    })
  } catch (error) {
    res.status(411).json({
      message: "Error while creating room, room might already exist"
    })
    return;
  }
});

app.listen(3001, () => {
  console.log("Listening on PORT 3001");
});
