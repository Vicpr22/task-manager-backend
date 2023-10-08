import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { userRouter } from "./routes/userRouter.js";
import { categoryRouter } from "./routes/categoryRouter.js";
import { taskRouter } from "./routes/taskRouter.js";

const app = express();
export const prisma = new PrismaClient();

//middleware
app.use(cors());
app.use(express.json());
dotenv.config();

// we want an auth middleware that fires before every
// request and checks if theres a token and checks if that token is valid and grabs the user info and stores it in req.user
// logged in back end? req.user

app.use(async (req, res, next) => {
  // check if theres an auth token in header and console it
  try {
    if (!req.headers.authorization) {
      return next();
    }

    const token = req.headers.authorization.split(" ")[1];

    const { userId } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return next();
    }
    delete user.password;
    req.user = user;
    next();
  } catch (error) {
    res.send({ success: false, error: error.message });
  }
});

app.get("/", (req, res) => {
  res.send({
    success: true,
    message: "Welcome to the Task Manager backend server!",
  });
});

app.use("/users", userRouter);
app.use("/categories", categoryRouter);
app.use("/tasks", taskRouter);

app.use((req, res) => {
  res.send({ success: false, error: "No route found." });
});

app.use((error, req, res, next) => {
  res.send({ success: false, error: error.message });
});

app.listen(3000, () => console.log("Server is up!"));
