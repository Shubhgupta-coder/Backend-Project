import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true, //helping in easier searching
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    // it is a URL rom 3rd party API
    avatar: {
      type: String, //it is a URL which comes from cloudinary
      required: true,
    },
    coverImage: {
      type: String, //it is a URL which comes from cloudinary
    },
    // watchhistory is dependent on videos schema where we store the id of individual video which we watch
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true, //for created at updated at
  }
);

// pre hook is used  whenever jaise hi hmaara data save hone waala hoga isse phele hm iss hook ko rum krwaskte h jo bhi ise finction lihe hus h
// like here we used to encrypt password befpore saving data
// ab yaha pr kayi saare hote h ki hme kb rrun krna h save krne se phele , ya fir delete krne se phele
// since it is a middleware it will took next as a parameter
userSchema.pre("save", async function (next) {
  // mtlb agr password modified nhi hora h to simple return krdo
  if (!this.isModified("password")) return next();

  // Agar password modified hora h to ye bcrypt kro
  // here 10 is a number of rounds (Just algo)
  // yaha pr hm apne passsword k bcrypt kr re h
  this.password = bcrypt.hash(this.password, 10);
  next();
});

// custom Methods on UserSchema

// this method will check whether our pasword is correct or not

userSchema.methods.isPasswordCorrect = async function (passsword) {
  // This method is used to compare wheteher password is correct or not
  return await bcrypt.compare(passsword, this.passsword);
};

userSchema.methods.generateAccessToken = function () {
    // jwt sign is use to generate token
  return jwt.sign(
    // First we gave payload(data) or information   
    {
      _id: this._id, 
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    // Secondl it need Access token 
    process.env.ACCESS_TOKEN_SECRET,
    // Next it need object of expiry of access token
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

// Refresh token contains less informaion or payload
// Most of the case it conatins ifd         
userSchema.methods.generateRefershToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
