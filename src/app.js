import express from 'express'
import cookieParser from 'cookie-parser'
import cors from "cors"
const app = express()

// app.use() is for middleware
app.use(cors(       
    {
        origin:process.env.CORS_ORIGIN,
        credentials:true
    }
))
// YE jb hm koi form wagarah accept kr rahe ho
// iska mtlb app hamara JSON ko accept kr raha h 
// And hm uske andar kuch features bhi de skte h , like for security purpose
app.use(express.json(
    {
        limit:"16kb"
    }
))

// When we are accepting URL
app.use(express.urlencoded(
    {
        extended:true,  //iska mtlb hm objects k andar objects de skte h (means nested object)
        limit:"16kb"
    }
))

// it means when we have to store our some file or folder in our public folder (this is for assets)
app.use(express.static("public"))


// cookie-parer -> iska mtlb ki hm servwr ki help se user ki browseer ki cookies ko access kr paau or usme kuch crud operation perfrom kr skoo
app.use(cookieParser())


export {app}