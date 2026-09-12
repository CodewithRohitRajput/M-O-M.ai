import express from "express";

import {
    googleLogin,
    googleCallback,
    getUser
} from "../controllers/auth.controller.js";
import authenticateToken from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/google", googleLogin);

router.get("/google/callback", googleCallback);
router.get("/me", authenticateToken, getUser);

export default router;