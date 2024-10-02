// require('dotenv').config({path: './env'});
import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({
  path: "./env",
});

connectDB();

// Whenever dealing with Data-Base it always takes time so it is a good practice to use :
// try-catch block or async-await
/*
import mongoose from "mongoose";
import { DB_NAME } from "./constants";
import express from "express";
const app = express();
(async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
    app.on("error", (error)=>{
        console.log("ERROR : ", error);
        throw error;
        
    })
  } catch (error) {
    console.error("ERROR : ", error);
    throw error;
  }
})();
*/
