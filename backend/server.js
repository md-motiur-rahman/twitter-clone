import express from "express";
import dotenv from "dotenv";
import authRouter from "./routes/auth.route.js";
import connectDB from "./db/db.js";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

const port = process.env.PORT || 8000;

app.use(express.json())

app.use(cookieParser())

// app.use(express.urlencoded({extended: true}))

// app.get("/", (req, res) => {
//     res.send("The server is started")
// })

app.use("/api/auth", authRouter)

app.listen(port, () => {
    connectDB()
  console.log(`Server running at http://localhost:${port}`);
});
