import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";
import User from "../models/auth.model.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
  try {
    const { username, fullname, email, password } = req.body;
    const emialRegEx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emialRegEx.test(email)) {
      return res
        .status(400)
        .json({ error: "Please enter a valid email" });
    }
    const existingUserName = await User.findOne({ username });
    if (existingUserName) {
      return res.status(400).json({ error: "Username is already taken." });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: "Email is alrady in use" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be 8 characters long" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      username,
      fullname,
      email,
      password: hashedPassword,
    });
    if (user) {
      generateTokenAndSetCookie(user._id, res);
      const newUser = await user.save();
      return res.status(201).json({ success: true, data: newUser });
    } else {
      return res.status(400).json({ message: "Unable to create user" });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ success: false, error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    const checkPass = await bcrypt.compare(password, user?.password || "");
    if (!user || !checkPass) {
      return res.status(400).json({ error: "Invalid username or password" });
    }
    generateTokenAndSetCookie(user._id, res);
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ success: false, error: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    return res.status(200).json({ message: "You are logged out" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ success: false, error: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    return res.status(200).json(user);
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};
