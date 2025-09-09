import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import cookieSession from "cookie-session";
import User, { IUser } from "./models/User";

dotenv.config();

const app = express();

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI!, {
  // options if needed
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

// Cookie session
app.use(cookieSession({
  name: "session",
  keys: [process.env.SESSION_SECRET!],
  maxAge: 24 * 60 * 60 * 1000, // 1 day
}));

app.use(passport.initialize());
app.use(passport.session());

// Passport serialize/deserialize
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  const user = await User.findById(id);
  done(null, user);
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  const existingUser = await User.findOne({ googleId: profile.id });
  if (existingUser) {
    return done(null, existingUser);
  }
  const newUser = await User.create({
    googleId: profile.id,
    displayName: profile.displayName,
    email: profile.emails![0].value,
  });
  done(null, newUser);
}));

// Routes
app.get("/", (req, res) => res.send(`<a href="/auth/google">Login with Google</a>`));

app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get("/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/dashboard");
  }
);

app.get("/dashboard", (req, res) => {
  if (!req.user) return res.redirect("/");
  res.send(`Hello ${(req.user as IUser).displayName}! <a href="/logout">Logout</a>`);
});

app.get("/logout", (req, res) => {
  req.logout(() => {});
  res.redirect("/");
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
