import { v2 } from "cloudinary";
import User from "../models/auth.model.js";
import Post from "../models/post.model.js";
import Notification from "../models/notification.model.js";

export const createPost = async (req, res) => {
  try {
    const { text } = req.body;
    let { image } = req.body;
    const userId = req.user._id.toString();

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (!text && !image) {
      return res
        .status(400)
        .json({ error: "A post must have an Image or text or both" });
    }
    if (image) {
      const uploadRes = await v2.uploader.upload(image);
      image = uploadRes.secure_url;
    }
    const newPost = new Post({
      user: userId,
      text,
      image,
    });

    await newPost.save();

    return res.status(201).json(newPost);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const likeUnlikePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id: postId } = req.params;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    const userLikedPost = post.likes.includes(userId);

    if (userLikedPost) {
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      await User.updateOne({ _id: userId }, { $pull: { likedpost: postId } });
      return res.status(200).json({ message: "Post Unliked" });
    } else {
      await Post.updateOne({ _id: postId }, { $push: { likes: userId } });
      await User.updateOne({ _id: userId }, { $push: { likedpost: postId } });
      const notification = new Notification({
        from: userId,
        to: post.user,
        type: "like",
      });
      await notification.save();
      return res.status(200).json({ message: "Post liked" });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const commentOnPost = async (req, res) => {
  try {
    let { text } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;

    if (!text) {
      return res.status(400).json({ error: "Comment can not be empty" });
    }
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    const comment = { user: userId, text };
    post.comment.push(comment);
    await post.save();

    return res.status(201).json(post);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "No post found" });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(400).json({ error: "You are not authorised" });
    }

    if (post.image) {
      await v2.uploader.destroy(post.image.split("/").pop().split(".")[0]);
    }

    await Post.findByIdAndDelete(req.params.id);

    return res.status(200).json({ message: "Post is deleted" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getAllPost = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({ path: "user", select: "-password" })
      .populate({ path: "comment.user", select: "-password" });

    if (posts.length === 0) {
      return res.status(200).json([]);
    }

    return res.status(200).json(posts);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const myPost = async (req, res) => {
  try {
    const userId = req.user._id;
    const posts = await Post.find({ user: userId });
    if (posts.length === 0) {
      return res.status(200).json([]);
    }

    return res.status(200).json(posts);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getLikedPosts = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ eror: "No user found" });
    }

    const likedPosts = await Post.find({
      _id: { $in: user.likedpost },
    })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comment.user",
        select: "-password",
      });

    return res.status(200).json(likedPosts);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getFollowingPost = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "no user found" });
    }

    const following = user.followeing;
    const feedPosts = await Post.find({ user: { $in: following } })
      .sort({ createdAt: -1 })
      .populate({ path: "user", select: "-password" })
      .populate({ path: "comment.user", select: "-password" });

    return res.status(200).json(feedPosts);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getUserposts = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: "No user found" });
    }

    const posts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate({ path: "user", select: "-password" })
      .populate({ path: "comment.user", select: "-password" });

    return res.status(200).json(posts);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
