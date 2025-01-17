import express from "express";
import {
  followUnfollowUser,
  getSuggestedUser,
  getUserProfile,
  updateuser,
} from "../controllers/user.controller.js";
import { protectedRoute } from "../middlewares/protectedRoute.js";

const userRouter = express.Router();

userRouter.get("/profile/:username", protectedRoute, getUserProfile);
userRouter.get("/suggest", protectedRoute, getSuggestedUser);
userRouter.post("/follow/:id", protectedRoute, followUnfollowUser);
userRouter.post("/update", protectedRoute, updateuser);

export default userRouter;
