import { Router } from "express";
import { authenticateToken } from "../middleware/auth";  // Adjust path

const router = Router();

// Protects ALL routes in this file
router.use(authenticateToken);

router.get("/welcome", (req, res) => {
  res.json({ message: "Welcome back!", user: req.user });
});

export default router;
