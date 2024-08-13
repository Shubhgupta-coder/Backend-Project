import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asynchandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
// Here we use next beccause it is a middleware

// Here many times theres a situation when we do not use es , so we use _
export const verifyJWT = asyncHandler(async (req, _, next) => {
  // first of all we have to find cookies , So that we can verify whether user is corect or not
  // We got token either form cookies or from header
  // Sometimes User also send custom cookie in header using Authorization: Bearer <Token Name> .
  // Here we replace "Bearer " with "" , so that we only get tokens
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorised request");
    }

    // When we made user model and made jwt token , there we wrote a lot of information like id,fullname etc
    // so first e have to decode that info

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    // Now we find the user  by getting that id from decodeTOken
    // When we set jwt token we also gave _id there
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    // Now when we found user we add a new field in our object
    req.user = user;
    next();
  } 
  catch (error) {
    throw new ApiError(401,error?.message || "Invalid Access token")
  }
});
