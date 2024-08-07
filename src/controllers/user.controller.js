import {asyncHandler} from "../utils/asynchandler.js"

// asyncHandler whixch is a wrapper and it contains anotherfunction
const registerUser= asyncHandler(async(req,res)=>{
      res.status(200).json(
        {
           message:"ok"
        }
     )
})

export {registerUser}