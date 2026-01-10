import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import { startWebSocketServer } from "./websocket/server";
import protectedRouter from "./routes/protected";

import path from "path";
import cookieParser from "cookie-parser";

dotenv.config({ path: path.resolve(__dirname, ".env") });

// Exit early if important secrets are missing (helps surface config issues)
if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET not set. Please check your .env file.");
  process.exit(1);
}

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI!)
  .then(() => {
    console.log("MongoDB connected");

    // Only start WebSocket after DB is ready
    startWebSocketServer();
  })
  .catch((err) => console.log(err));

app.use("/api/auth", authRoutes);

// Protected (everything here uses authenticateToken)
app.use("/api", protectedRouter); 

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
