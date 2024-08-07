import {Router} from "express" ;
import { registerUser } from "../controllers/user.controller.js";
const router = Router()
// yaha pr .post() m jo bhi method wo run ho jaeaga
router.route("/register").post(registerUser)
export default router 