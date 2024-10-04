import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
// DATA  is received by backend from many sources : url, json, from body...
// we can use express.json() to parse json data from body
app.use(express.json({ limit: "16kb" }));
// t0 handle data coming from URL
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// routes import
import userRouter from "./routes/user.routes.js";

// routes declaration
app.use("/api/v1/users", userRouter);
export { app };
