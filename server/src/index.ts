import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./auth/auth";
import { startWebSocketServer } from "./websocket/server";

dotenv.config();
const app = express();

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI!)
  .then(() => {
    console.log("MongoDB connected");

    // Only start WebSocket after DB is ready
    startWebSocketServer();
  })
  .catch(err => console.log(err));

app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
