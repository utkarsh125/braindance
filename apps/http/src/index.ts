import { JWT_SECRET } from "@repo/backend-common/config";
import dotenv from "dotenv";
import express from "express";
import jwt from "jsonwebtoken";
import { middleware } from "./middleware.js";
import { CreateUserSchema, SignInSchema, CreateRoomSchema } from "@repo/common/types";
import { prisma } from "@repo/db";

dotenv.config();



const app = express();

app.use(express.json());

//Sign up endpoint
app.post("/signup", async (req, res) => {

  const parsedData = CreateUserSchema.safeParse(req.body);

  if(!parsedData.success){
    res.json({
      message:"Incorrect input",
    })
    return;
  }

  try {
    const user = await prisma.user.create({
      data: {
        username: parsedData.data?.username,
        password: parsedData.data.password,
        email: parsedData.data.email
      }
    })

    res.json({
      userId: user.id,
      message: "User created successfully",
    })

    return;
  } catch (error) {
    console.error(error, "Error creating user");
    res.status(411).json({
      message: "Error creating user",
    })
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
        username: parsedData.data.username
      }
    })
    console.log("User:", user);
  
    if(!user){
      res.status(401).json({
        message: "User not found"
      })
      return;
    }
  
    //TODO: add password verification logic
    //TODO: JWT token generation logic
    res.json({
      message: "Sign in successful",
      userId: user.id
    })
  
    
  } catch (error) {
    console.error("Error during signing in: ", error);
    res.status(500).json({
      message: "Error during sign in"
    })
  }

});

app.post("/room", middleware, (req, res) => {
  //add a db call over here later

  const data = CreateRoomSchema.safeParse(req.body);
  
  if(!data.success){
    res.json({
      message: "Incorrect input"
    })
    return;
  }

  //mock res
  res.json({
    roomId: 123,
  })
});

app.listen(3001, () => {
  console.log("Listening on PORT 3001");
});
