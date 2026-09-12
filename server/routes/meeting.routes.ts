import express from 'express'
import {  getMeeting, getOneMeeting , deleteMeeting} from "../controllers/meeting.controller.js";    
import upload from '../middleware/upload.js';
import { transcribeMeeting } from '../controllers/meeting.controller.js';
import authenticateToken from "../middleware/auth.middleware.js";

const router = express.Router()

// router.post('/analyze', analyzeMeetingController)
router.get('/get', authenticateToken,getMeeting)
router.get('/get/:id', authenticateToken,getOneMeeting)
router.delete('/get/:id', authenticateToken,deleteMeeting)
router.post('/transcribe',authenticateToken, upload.single("audio"),transcribeMeeting )

export default router

