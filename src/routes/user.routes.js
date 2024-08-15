import {Router} from "express" ;
import { loginUser, logoutUser, registerUser ,refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage, getUserChannelProfile} from "../controllers/user.controller.js";
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

// only  verfy log hi password change kr paaye , islie hmne yaha pr ek middleware lagaya h verifyjwt
router.route("/change-password").post(verifyJWT,changeCurrentPassword )

router.route("/current-user").get(verifyJWT,getCurrentUser)
// kuch hi detail update krni h
router.route("/update-account").patch(verifyJWT,updateAccountDetails)

// update avatar yaha pr hme 2 middleware likhne h
// one is for verifyjwt and other  is  for file upload i.e. multer
router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)

// update cover image
router.route("/cover-image").patch(verifyJWT,upload.single("coverImage"),updateUserCoverImage)

// here we use params so we gave like this url
router.route("/c/:username").get(verifyJWT,getUserChannelProfile)
export default router 