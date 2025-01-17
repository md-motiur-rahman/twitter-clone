import User from "../models/auth.model.js";
import Notification from "../models/notification.model.js";

import bcrypt from "bcryptjs";
import { v2 } from "cloudinary";

export const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const followUnfollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userToModify = await User.findById(id);
    const currentUser = await User.findById(req.user._id);

    if (id === req.user._id.toString()) {
      return res
        .status(400)
        .json({ error: "You can't follow/unfollow yourself" });
    }

    if (!userToModify || !currentUser)
      return res.status(400).json({ error: "User not found" });

    const isFollowing = currentUser.followeing.includes(id);

    if (isFollowing) {
      // Unfollow the user
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $pull: { followeing: id } });

      res.status(200).json({ message: "User unfollowed successfully" });
    } else {
      // Follow the user
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $push: { followeing: id } });
      // Send notification to the user
      const newNotification = new Notification({
        type: "follow",
        from: req.user._id,
        to: id,
      });
      await newNotification.save();

      res.status(200).json({ message: "User followed successfully" });
    }
  } catch (error) {
    console.log("Error in followUnfollowUser: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const updateuser = async (req, res) => {
  const {
    fullname,
    email,
    username,
    currentPassword,
    newPassword,
    bio,
    links,
  } = req.body;
  let { profileImage, coverImage } = req.body;

  const userId = req.user._id;
  try {
    let user = await User.findById(userId); //the user is let here as we are going to change value
    if (!user) return res.status(404).json({ error: "No user found" });
    if (
      (!currentPassword && newPassword) ||
      (currentPassword && !newPassword)
    ) {
      return res.status(400).json({ error: "Please provide both passwords" });
    }
    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Incorrent password" });
      }
      if (newPassword.length < 8) {
        return res
          .status(400)
          .json({ error: "New password must be 8 character long" });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }
    if (profileImage) {
      if (user.profileImage) {
        //delete the old image as we dont want to run out of storage
        await v2.uploader.destroy(
          user.profileImage.split("/").pop().split(".")[0]
        );
      }
      const uploadedRes = await v2.uploader.upload(profileImage);
      profileImage = uploadedRes.secure_url;
    }
    if (coverImage) {
      if (user.coverImage) {
        await v2.uploader.destroy(
          user.coverImage.split("/").pop().split(".")[0]
        );
      }
      const uploadRes = await v2.uploader.upload(coverImage);
      coverImage = uploadRes.secure_url;
    }
    user.fullname = fullname || user.fullname;
    user.email = email || user.email;
    user.username = username || user.username;
    user.profileImage = profileImage || user.profileImage;
    user.coverImage = coverImage || user.coverImage;
    user.bio = bio || user.bio;
    user.links = links || user.links;

    user = await user.save();

    user.password = null;

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getSuggestedUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const userFollowedByMe = await User.findById(userId).select("followeing");

    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },
      {
        $sample: {
          size: 10,
        },
      },
    ]);
    const filteredUser = users.filter(
      (user) => !userFollowedByMe.followeing.includes(user._id)
    );
    if (!filteredUser) {
      return res.status(200).json({ message: "No friends to suggest" });
    }
    const suggestedUser = filteredUser.slice(0, 4);
    suggestedUser.forEach((user) => (user.password = null));

    return res.status(200).json(suggestedUser);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
