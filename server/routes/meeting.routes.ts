import express from 'express'
import {  getMeeting, getOneMeeting , deleteMeeting} from "../controllers/meeting.controller.js";    
import upload from '../middleware/upload.js';
import { transcribeMeeting, scheduleMeeting, claimNextJob, uploadJobRecording, failJob } from '../controllers/meeting.controller.js';
import authenticateToken from "../middleware/auth.middleware.js";

const router = express.Router()

router.get('/get', authenticateToken,getMeeting)
router.get('/get/:id', authenticateToken,getOneMeeting)
router.delete('/delete/:id', authenticateToken,deleteMeeting)
router.post('/transcribe',authenticateToken, upload.single("audio"),transcribeMeeting )
router.post('/schedule', authenticateToken, scheduleMeeting)

// Bot endpoints - authenticated with BOT_TOKEN inside the controller, not a cookie.
router.get('/bot/next', claimNextJob)
router.post('/bot/:id/recording', upload.single("audio"), uploadJobRecording)
router.post('/bot/:id/fail', failJob)

export default router
