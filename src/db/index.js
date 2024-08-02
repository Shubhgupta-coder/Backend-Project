import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

 const connectDB = async()=>{
     try {
        // Mongoose gave us an object
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n Mongo DB connected !! DB HOSt:${connectionInstance.connection.host}`);
               
     } catch (error) {  
        console.log("Mongoose Connection Error",error);
        // The process.exit() method is used to end the process which is running at the same time with an exit code in NodeJS.
        // It can be either 0 or 1. 0 means end the process without any kind of failure and 1 means end the process with some failure.
        // Return value: It does not return any value.

        process.exit(1);
        
     }    
}
export default connectDB ;