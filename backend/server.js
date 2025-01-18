import express from "express";
import dotenv from "dotenv";
import authRouter from "./routes/auth.route.js";
import connectDB from "./db/db.js";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.route.js";
import { v2 } from "cloudinary";
import postRouter from "./routes/post.route.js";
import notificationRouter from "./routes/notification.route.js";

dotenv.config();

v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();

const port = process.env.PORT || 8000;

app.use(express.json());

app.use(cookieParser());

// app.use(express.urlencoded({extended: true}))

// app.get("/", (req, res) => {
//     res.send("The server is started")
// })

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/post", postRouter);
app.use("/api/notification", notificationRouter)

app.listen(port, () => {
  connectDB();
  console.log(`Server running at http://localhost:${port}`);
});
