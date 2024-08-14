import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema({
  subscriber: {
    type: Schema.Types.ObjectId,  //one who is subscribig is also a user
    ref: "User",
  },
  channel:{
    type: Schema.Types.ObjectId,  //one to whom is subscriber is  subscribing is also a user
    ref: "User",
  }
},
{
    timestamps:true
});

export const Subscription = mongoose.model(Subscription, "subscriptionSchema");
