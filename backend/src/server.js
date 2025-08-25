import express from "express";
import "dotenv/config";
import cookieStore from "cookie-parser"
import authRoutes from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import { connectDB } from "./lib/db.js";

const app = express();
const PORT = process.env.PORT;
app.use(express.json());
app.use(cookieStore())

app.use("/api/auth", authRoutes)
app.use("/api/user", userRouter)

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
})