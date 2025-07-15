import express from "express";
import dotenv from "dotenv";
dotenv.config();
import connectDB from "./config/db.js";
import authRouter from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRouter from "./routes/user.routes.js"
import geminiResponse from "./gemini.js";


// Debug: Show environment variables
console.log("Environment variables loaded:");
console.log("PORT:", process.env.PORT);
console.log("MONGO_URL:", process.env.MONGO_URL);
console.log("All env vars:", Object.keys(process.env).filter(key => key.includes('MONGO') || key.includes('PORT')));

const app = express();
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
    credentials: true
}))
const port = process.env.PORT || 5000;
app.use(express.json())
app.use(cookieParser())
app.use("/api/auth",authRouter)
app.use("/api/user",userRouter)
// app.get("/",async (req,res)=>{
//     let prompt = req.query.prompt
//     let data=await geminiResponse(prompt)
//     res.json(data)
// })
app.use(cors({
    origin: [
        "https://gemini-ai-1t7a.vercel.app", // Vercel frontend
        // Add more allowed origins if needed
    ],
    credentials: true
}));
app.listen(port, () => {
    connectDB();
    console.log(`Server is running on port ${port}`);
});