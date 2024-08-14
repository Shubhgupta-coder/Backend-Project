import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

// This is a common function for generating aceess and refreh token which is useed in video model
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    // first we have to find the user jiska toen hme generate krna h
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefershToken();

    // Now refrehToken ko hm database m bhi save krke rakhte h
    // Since User is a database Object
    user.refreshToken = refreshToken;

    // Now hme use save bhi krwana h  and at this time jb bhi hm save krwate h to hm koi bhi validation wagrah ka nhi kehte h
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh token"
    );
  }
};
// asyncHandler whixch is a wrapper and it contains anotherfunction
const registerUser = asyncHandler(async (req, res) => {
  //   res.status(200).json(
  //     {
  //        message:"ok"
  //     }
  //  )

  // get user details from frontend
  // validation - not empty
  // check if user already exists: username, email
  // check for images, check for avatar and all other required file
  // upload them to cloudinary, avatar
  // create user object - create entry in db
  // remove password and refresh token field from response because we did not want to give these to users
  // check for user creation
  // return res

  // step1: get user details from frontend
  // We will get all the user details from body request
  const { fullName, email, username, password } = req.body;

  // Here we check for validation
  // We check for every field here like email,password,fullname,username
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are empty");
  }

  // Now we check for whether User AALready exists or not
  const existedUser = await User.findOne({
    // if either username or email will be find out
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "User with email or password already exist");
  }

  // Access the local path of the uploaded avatar file
  // req.files: This is the object that contains all the uploaded files.
  // Now this avatar field contain many propertied but we need first property becaus first property consist of an object which also consist of path of file which is stored locally in our diskstorage
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is require");
  }

  // Now we have to uplaoad these avatar and coverImage on cloudinary
  // uploadOnCloudinary method is written on cloudinary.js
  // it will  take the local path of file
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is require");
  }

  //  create user object - create entry in db
  // Since here we are talking with Database so it might took time , so here we write await
  // Now mongodb also create id(_id) with every entrry
  const user = await User.create({
    fullName,
    avatar: avatar.url, //we want to store only avaatar ka URL on DB
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  // Now in next step we check for user creation and remove passwords and refreshTokens

  // Now we have to checkk whether user is created successfully or not
  // And also if user is created successfully we have to remove password or refreshTokens
  // Here we use .select and use -x in string then thosse are not taken

  // We have to chexk for coverImage seperately because it is not a required filed so it might gave undefined
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  // Here we send the response that usr has been created successfully
  // Using Apiresponse class which we made
  return res.status(201).json(
    // Herre we send status code , data (createdUser) and msg
    new ApiResponse(200, createdUser, "User registered Successfully")
  );
});

const loginUser = asyncHandler(async (req, res) => {
  // steps
  //requset body se daata laao
  // check username or email
  // find the user
  // check password of user
  // If password coreect , generate acceess and refresh token
  // Now send cookies at end

  // step1 : Get User Details form fronttend
  const { email, username, password } = req.body;

  // step2: Check for username or password
  //  yaha pr email or username m se agr koi bhi ek h to hm login krwa skte h
  if (!username && !email) {
    throw new ApiError(400, "Username or Password is required");
  }

  // Step3: Now find the user on the basis of email or Username
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  // If user does not exist throw error
  if (!user) {
    throw new ApiError(404, "User Does not exist");
  }

  // now weare checking whether password is user or correct or not
  // isPasswordCorrect is a method which we made in UseeSchema for validating Password
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid User Credentials");
  }

  // Now if uesr is validate then generate its access annd refresh token
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  //  Now we have to send cookies to user but when we have to send cookie we donot want to send all the field defined in user
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // Now send cookies
  // We have to define certain options beffore send cokies
  // With these options these cookies are server  modifiable
  const options = {
    httpOnly: true,
    secure: true,
  };

  // Here we send cookoies
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User Logged in SuccessFully"
      )
    );
});

// Logout
const logoutUser = asyncHandler(async (req, res) => {
  // First Delete refreh token  from database
  // Now here we have req.user which we add through middleware when we call for logout in routes
  // Now form req.user we got its id using req.user._id
  // req.user._id
  await User.findByIdAndUpdate(
    req.user._id,
    {
      // Now we make refrehToken : Undefined
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true, //here we got new updated value in response where refreshToken is undefined
    }
  );

  // Now secondly we have to clear cookies
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User loggedOut Successfully"));
});

// Refersh Token and access Token : Acess token are short lived jo ki help krte  h user ko login wagrah krne m
// Now acess token zldi expire hota h to jisse user ko baar baar login na krna pade , uske lie hamare paas ek refresh token bhi hota h
// jo ki D.B.m hi store hota h , to user ek req bhjejta h jisme refresh token bhi hota h , to agr user ka refresh token D.B. waale refreh token se match kr jaata h to hm user ko login krwa dete h

const refreshAccessToken = asyncHandler(async (req, res) => {
  // Now hm apne refresh token ko cookies se access kr skte h ya fir body se bhi access kr skte h
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  //    if user ne request hi ni bheji

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorised request");
  }

  //    Now hme apne incoming token ko verify krna padega , jwt se verify keke hme apna decoded token milta h jo D.B. m store j
  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    // Now jb hmne refreh token banaya to usme hmnen id store kri thi , to since ab hamare paas decoded token aa chuka h to usme id bhi aayi hogi to ab hm uski help se user ko find krskte h mongo db k through

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    // Now hm hamre paas jo incoming refreh rtoken aaya or jo user aaya h uske paaas nbhi refreh token hoga to hm dono k refreh token ko match krwayengr
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError("401", "Refresh Token is expired or used");
    }

    // Now since ab token match hoge honge to hm us user k lie  new acesstoken generate krre j
    // first we have to save in cookies
    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access Token refreshed successfully "
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Refresh Token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  // First wo took wahat fields are required while change password
  const { oldPassword, newPassword } = req.body;

  // Now since when we are changing password it means user is already logged in
  // so we can get user by using req.id
  const user = await User.findById(req.user._id);

  // Now we have a already defined method in user.model.js when we are encry[ting  passwored called iscoreectpassword , which check passwword by using bcrupt.compare

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid password");
  }

  // Now we have to set new passwprd
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password Chage Successfully"));
});

// It is very easy to get current User from req.user .Because we have a middleware set in auth.middleware , which set the whole user to req.user

const getCurrentUser = asyncHandler(async (req, res) => {
  res.status(200).json(200, req.user, "Current USer Fetched Successfully");
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  // Firstly , take those options which we need to update
  const { fullName, email } = req.body;

  if (!fullName || !email) {
    throw new ApiError(400, "All fields are required");
  }

  // First of all find user amd then update ,so here we direvtly use findnyIdandUpdate
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      // here we set or update data
      $set: {
        fullName: fullName,
        email: email,
      },
    },
    {
      new: true, //it means here we get updated info about user
    }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated Successfully "));
});

// Now we have to update file

// First update avatar
const updataUserAvatar = asyncHandler(async (req, res) => {
  // First took the path f our avatar from req.file
  const avatarLocalPath = req.file?.path; //req.file we got from multer middleware;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  // Now uplaoad it on cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(400, "Error while Uploading avatar");
  }

  // Now we have to update avatar

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    {
      new: true,
    }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avataar image upadaetd successfully"));
});

const updataUserCoverImage = asyncHandler(async (req, res) => {
    // First took the path f our avatar from req.file
    const coverImageLocalPath = req.file?.path; //req.file we got from multer middleware;
    if (!coverImageLocalPath) {
      throw new ApiError(400, "Cover Image  file is missing");
    }
  
    // Now uplaoad it on cloudinary
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  
    if (!coverImage.url) {
      throw new ApiError(400, "Error while Uploading Cover image");
    }
  
    // Now we have to update avatar
  
    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
            coverImage: coverImage.url,
        },
      },
      {
        new: true,
      }
    ).select("-password");
  
    return res
      .status(200)
      .json(new ApiResponse(200, user, "Cover image upadated successfully"));
  });

//Now we have to update cover imagae
export {
  registerUser, 
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  changeCurrentPassword,
  updateAccountDetails,
  updataUserAvatar,
  updataUserCoverImage
};
