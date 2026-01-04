import { Router, Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client, TokenPayload } from "google-auth-library";

const router = Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// --- Google login ---
interface GoogleRequestBody {
  token: string;
}

router.post("/google", async (req: Request<{}, {}, GoogleRequestBody>, res: Response) => {
  const { token } = req.body;
  
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload() as TokenPayload | undefined;
    if (!payload) return res.status(400).json({ message: "Invalid token" });

    let user = await User.findOne({ googleId: payload.sub });

    if (!user) {
      user = new User({
        googleId: payload.sub!,
        email: payload.email!,
        name: payload.name,
        avatar: payload.picture,
      });
      await user.save();
    }

    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: "1h" });

    res.json({ token: jwtToken, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// --- Traditional registration ---
interface RegisterRequestBody {
  name: string;
  email: string;
  password: string;
}

router.post("/register", async (req: Request<{}, {}, RegisterRequestBody>, res: Response) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET!, { expiresIn: "1h" });

    res.json({ token, user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// --- Traditional login ---
interface LoginRequestBody {
  email: string;
  password: string;
}

router.post("/login", async (req: Request<{}, {}, LoginRequestBody>, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    if (!user.password) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: "1h" });

    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
