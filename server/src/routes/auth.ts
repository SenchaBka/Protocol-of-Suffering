import { Router, Request, Response } from "express";
import User from "../models/User";
import { OAuth2Client, TokenPayload } from "google-auth-library";
import jwt from "jsonwebtoken";

const router = Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

interface GoogleRequestBody {
  token: string;
}

router.post("/google", async (req: Request<{}, {}, GoogleRequestBody>, res: Response) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload() as TokenPayload | undefined;

    if (!payload) return res.status(400).json({ message: "Invalid token" });

    let user = await User.findOne({ googleId: payload.sub });

    if (!user) {
      user = new User({
        googleId: payload.sub!,
        email: payload.email!,
        name: payload.name,
        avatar: payload.picture
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

export default router;
