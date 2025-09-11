import { JWT_SECRET } from "@repo/backend-common/config";
import dotenv from "dotenv";
import express from "express";
import jwt from "jsonwebtoken";
import { middleware } from "./middleware";
import { CreateUserSchema, SignInSchema, CreateRoomSchema } from "@repo/common/types";

dotenv.config();

const app = express();

//Sign up endpoint
app.post("/signup", (req, res) => {

  const data = CreateUserSchema.safeParse(req.body);

  if(!data.success){
    res.json({
      message:"Incorrect input",
    })
    return;
  }

  res.json({
    userId: 123,
  })
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
