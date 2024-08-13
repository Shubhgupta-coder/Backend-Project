import {Router} from "express" ;
import { loginUser, logoutUser, registerUser ,refreshAccessToken} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router()
// yaha pr .post() m jo bhi method wo run ho jaeaga
router.route("/register").post( 
    // this is middleware we impoert upload from multer
    // yaha pr hm user ko register krne se phele usse file bhi upload krware h jo ki required h 
    upload.fields(
        [
            {
                name:"avatar",
                maxCount:1
            },
            {
                name:"coverImage",
                maxCount:1
            }
        ]
    ),
    registerUser
)

router.route("/login").post(
    loginUser
)

// Secured routes

// Here verifyJWT is our middleware
router.route("/logout").post(verifyJWT,logoutUser)

// Yaha pr hamara refresh token wala route h 
router.route("/refresh-token").post(refreshAccessToken)
export default router 