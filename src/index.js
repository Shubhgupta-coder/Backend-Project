// DATABASE KO USE KRTE SAMYA TRY CATCH OR ASYNC AWAIT KA USE KRNA CHIAIYE
// this line tells us jitni zldi hamari app load ho utni zldi hamre envirnment variable load ho jaaye
// require('dotenv').config({path:'./env'});  //object tells us ki hamari home directory k andar hi env h
// import mongoose from 'mongoose';
// import { DB_NAME } from './constants.js';

import dotenv from "dotenv"
import connectDB from './db/index.js';
import {app} from './app.js'
dotenv.config(
    {
        path:'./env'
    }
)
connectDB()
.then(()=>{
      app.listen(process.env.PORT || 8000 ,()=>{
        console.log(`Server is running at Port :${process.env.PORT}`);
      })
}).
catch((err)=>{
    console.log("Mongo Db connection failed!!!",err);
})











                                            // ******APPROACH 2nd********
// here we used IIIFE   

// connect database genneral syntax
// mongoose.connect('mongodb://127.0.0.1:27017/test');  (URL/DTAABASE NAME)
// Approach 1 to connect DB
/*
import express from "express";
const app = express()
;(async()=>{
    try {
           await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

        //    sometime in professional work we use listener to catch error
        app.on("error",(error)=>{
            console.log("ERROR:",error);
            throw error
        })

        app.listen(process.env.PORT,()=>{
            console.log(`APP IS LISTEN ON portt ${process.env.PORT}`);
        })
    } catch (error) {
        console.log(error);
        throw error;
    }
})()    
    */