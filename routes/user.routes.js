import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
const router = Router();
import { loginUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.js";
import { verifyUser } from "../middlewares/auth.middleware.js";

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
    )
router.route("/login").post( loginUser);


export default router;