import { JWT_SECRET } from "@repo/backend-common/config";
import dotenv from "dotenv";
import express from "express";
import jwt from "jsonwebtoken";
import { middleware } from "./middleware.js";
import { CreateUserSchema, SignInSchema, CreateRoomSchema } from "@repo/common/types";
import { prisma } from "@repo/db";

dotenv.config();



const app = express();

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
        name: parsedData.data?.name,
        password: parsedData.data.password,
        email: parsedData.data.username
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
app.post("/signin", (req, res) => {


  const data = SignInSchema.safeParse(req.body);

  if(!data.success){
    res.json({
      message:"Incorrect input",
    })
    return;
  }

  const userId = 1;
  const token = jwt.sign(
    {
      userId,
    },
    JWT_SECRET
  );
  res.json({
    token,
  });
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
