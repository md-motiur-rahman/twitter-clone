import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    fullname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minLength: 8,
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    followeing: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    profileImage: {
      type: String,
      default: "",
    },
    coverImage: {
      type: String,
      defult: "",
    },
    bio: {
      type: String,
      default: "",
    },
    links: {
      type: String,
      default: "",
    },
    likedpost: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        default: []
      }
    ]
  },
  { timeseries: true }
);

const User = mongoose.model("User", userSchema);

export default User;
