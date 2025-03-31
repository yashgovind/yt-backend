
// middleware to verify if user is present or not..//
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
async function verifyUser(req,res,next) {
    try {
    /*
 -- by cookie parser we are able to access cookie in request object.
 -- extract the bearer token from request header or extract access token from cookie/.
 -- verify decoded token by using jwt.verify and check if it is valid or not
 -- find user and remove pass and refresh tokens, if user is not there then throw error.
 -- add a new user  object to the request.
    */
   const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
   console.log('token is : ',token);
   if (!token) {
            return res.status(401).json({
                message: "Unauthorized request"
            });
        }
        const decoded = jwt.verify(token, process.env.ACESS_TOKEN_SECRET);
        console.log('decoded token is :',decoded);

        const user = await User.findById(decoded?._id);

        if (!user) {
            return res.status(401).json({
                message: "Invalid Access Token"
              });
        }
        console.log('user object is:',user);
        req.user = user;
        next();


    } catch (error) {
        return res.status(500).json({
            error: error.message
          });
    }
}

export {verifyUser}