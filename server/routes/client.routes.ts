import express from "express"
import { createClient, getClient, getClientbyId } from "../controllers/client.controller.js"
import authenticateToken from "../middleware/auth.middleware.js"
const router = express.Router()

router.post('/create', authenticateToken, createClient)
router.get('/get',authenticateToken, getClient)
router.get('/get/:id',authenticateToken, getClientbyId)

export default router
