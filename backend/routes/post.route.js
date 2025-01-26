import express from "express";
import { protectedRoute } from "../middlewares/protectedRoute.js";
import {
  commentOnPost,
  createPost,
  deletePost,
  getAllPost,
  getFollowingPost,
  getLikedPosts,
  getUserposts,
  likeUnlikePost,
  myPost,
} from "../controllers/post.controller.js";

const postRouter = express.Router();

postRouter.post("/create", protectedRoute, createPost);
postRouter.post("/like/:id", protectedRoute, likeUnlikePost);
postRouter.post("/comment/:id", protectedRoute, commentOnPost);
postRouter.delete("/delete/:id", protectedRoute, deletePost);
postRouter.get("/all", protectedRoute, getAllPost);
postRouter.get("/myposts", protectedRoute, myPost);
postRouter.get("/likes/:id", protectedRoute, getLikedPosts);
postRouter.get("/getfollowingposts", protectedRoute, getFollowingPost);
postRouter.get("/getuserpost/:username", protectedRoute, getUserposts)

export default postRouter;
