import type { Request, Response } from "express";
import { analyzeText } from "../services/gemini.service.js";
import Meeting from "../models/Project.js";
import { transcribeSpeech } from "../services/gemini.service.js";
import { createGoogleDoc } from "../services/google.service.js";
import Client from "../models/Client.js";
import authenticateToken from "../middleware/auth.middleware.js";

export const getMeeting = async (req: Request, res: Response) => {
    const userId = res.locals.userId
    const meetings = await Meeting.find({userId}).sort({createdAt: -1}).populate("clientId")
    return res.status(200).json({success: true, data: meetings})

}

export const getOneMeeting = async (req: Request, res: Response) => {
    const {id} = req.params;
    const meeting = await Meeting.findById(id).populate("clientId")

    return res.status(200).json({success: true, data: meeting})
}

export const deleteMeeting = async (req: Request, res: Response) => {
    const {id} = req.params;
    const deleted = await Meeting.findByIdAndDelete(id)
    return res.status(200).json({
        success: true,
        message: "Deleted"
    })
}



 export const transcribeMeeting = async (req : Request, res: Response) => {



    const audio = req.file
    const {clientId} = req.body
    const userId = res.locals.userId
    const accessToken = res.locals.googleAccessToken

    
    if(!audio) return res.status(400).json({
        success: false,
        message: "Audio file is required"
    })

    const prevMeet = await Meeting.findOne({clientId}).sort({_id : -1})
    const prevMeetingNotes = prevMeet ? JSON.stringify({transcript: prevMeet.transcript}) : "No previous meeting notes found"
    const text = await transcribeSpeech(audio.path)
    // console.log(text)
    const newMeet = await Meeting.create({userId, clientId, transcript: text})

    const analysizedText = await analyzeText(text, prevMeetingNotes)
    const updatedMeet = await Meeting.findByIdAndUpdate(newMeet._id, {analysis : analysizedText}, {new : true})
    
    const documentId = await createGoogleDoc(accessToken, 'Mom-ai-notes', JSON.stringify(analysizedText, null, 2))

    await Meeting.findByIdAndUpdate(newMeet._id, {googleDocId: documentId}, {new: true})

    return res.status(200).json({
        success: true,
        message: "Audio transcribed and analyzed successfully",
        data: updatedMeet
    })
}