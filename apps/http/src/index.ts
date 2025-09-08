import { JWT_SECRET } from "./config";
import dotenv from "dotenv";
import express from "express";
import jwt from "jsonwebtoken";
import { middleware } from "./middleware";

dotenv.config();

const app = express();

//Sign up endpoint
app.post("/signup", (req, res) => {
  //db call over here later

  res.json({
    userId: 123,
  })
});

//Sign in endpoint
app.post("/signin", (req, res) => {
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

  //mock res
  res.json({
    roomId: 123,
  })
});

app.listen(3001, () => {
  console.log("Listening on PORT 3001");
});
