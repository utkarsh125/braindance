import { JWT_SECRET } from "@repo/backend-common/config";
import express from "express";
import jwt from "jsonwebtoken";
import { middleware } from "./middleware.js";
import { CreateUserSchema, SignInSchema, CreateRoomSchema } from "@repo/common/types";
import { prisma } from "@repo/db";
import bcrypt from "bcrypt";

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
    console.log("Attempting signin with username:", parsedData.data.username);
    
    const user = await prisma.user.findUnique({
      where: {
        username: parsedData.data.username,
      }
    })
    console.log("Found user:", user ? "yes" : "no");

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
