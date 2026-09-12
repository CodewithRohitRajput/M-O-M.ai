import type { Request, Response } from "express";
import { analyzeText } from "../services/gemini.service.js";
import Meeting from "../models/Project.js";
import { transcribeSpeech } from "../services/gemini.service.js";
import { createGoogleDoc } from "../services/google.service.js";

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


/**
 * transcribe -> analyze -> Google Doc, for a meeting that already has audioPath.
 * Both the manual upload and the bot callback run this. Never throws: it is
 * kicked off without await, so a failure is recorded on the row instead.
 */
const processRecording = async (meetingId: string) => {
    try {
        const meeting = await Meeting.findById(meetingId)
        if (!meeting?.audioPath) throw new Error("Meeting has no audio file")

        await Meeting.findByIdAndUpdate(meetingId, {status: "transcribing"})

        const text = await transcribeSpeech(meeting.audioPath)

        // Only finished meetings are useful context, and never this one.
        const prevMeet = await Meeting.findOne({
            clientId: meeting.clientId,
            status: "done",
            _id: {$ne: meeting._id}
        }).sort({_id: -1})

        const prevMeetingNotes = prevMeet
            ? JSON.stringify({transcript: prevMeet.transcript})
            : "No previous meeting notes found"

        const analysizedText = await analyzeText(text, prevMeetingNotes)

        const documentId = await createGoogleDoc(
            meeting.accessToken!, 'Mom-ai-notes', JSON.stringify(analysizedText, null, 2)
        )

        await Meeting.findByIdAndUpdate(meetingId, {
            transcript: text,
            analysis: analysizedText,
            googleDocId: documentId,
            status: "done",
            error: null
        })
    } catch (error) {
        console.error("processRecording failed:", error)
        await Meeting.findByIdAndUpdate(meetingId, {
            status: "failed",
            error: error instanceof Error ? error.message : "Processing failed"
        }).catch(() => {})
    }
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

    const newMeet = await Meeting.create({
        userId, clientId, accessToken,
        source: "upload",
        status: "transcribing",
        audioPath: audio.path
    })

    // Not awaited - a long recording would outlive the request timeout.
    // The client polls GET /meet/get/:id for the status.
    void processRecording(newMeet._id.toString())

    return res.status(202).json({
        success: true,
        message: "Recording received, processing started",
        data: newMeet
    })
}


/** Frontend: pick a client, paste a Meet link, the bot takes it from here. */
export const scheduleMeeting = async (req: Request, res: Response) => {
    const userId = res.locals.userId
    const accessToken = res.locals.googleAccessToken
    const {clientId, meetLink, duration} = req.body

    if (!clientId || !meetLink) return res.status(400).json({
        success: false,
        message: "clientId and meetLink are required"
    })

    const meeting = await Meeting.create({
        userId, clientId, meetLink, accessToken,
        source: "bot",
        status: "queued",
        duration: Number(duration) || 60
    })

    return res.status(201).json({
        success: true,
        message: "Bot scheduled",
        data: meeting
    })
}


const botTokenIsValid = (req: Request) =>
    Boolean(process.env.BOT_TOKEN) && req.header('x-bot-token') === process.env.BOT_TOKEN

/** The bot polls this. findOneAndUpdate filters on status, so a job is claimed once. */
export const claimNextJob = async (req: Request, res: Response) => {
    if (!botTokenIsValid(req)) return res.status(401).json({success: false, message: "Invalid bot token"})

    const job = await Meeting.findOneAndUpdate(
        {status: "queued", source: "bot"},
        {status: "recording"},
        {new: true, sort: {createdAt: 1}}
    )

    if (!job) return res.status(200).json({success: true, data: null})

    return res.status(200).json({
        success: true,
        data: {
            jobId: job._id.toString(),
            meetLink: job.meetLink,
            duration: job.duration ?? 60
        }
    })
}

/** The bot posts the finished .wav here, which drops it into the same pipeline. */
export const uploadJobRecording = async (req: Request, res: Response) => {
    if (!botTokenIsValid(req)) return res.status(401).json({success: false, message: "Invalid bot token"})

    const {id} = req.params
    const audio = req.file

    if (!audio) return res.status(400).json({success: false, message: "Audio file is required"})

    const meeting = await Meeting.findByIdAndUpdate(id, {audioPath: audio.path}, {new: true})
    if (!meeting) return res.status(404).json({success: false, message: "Job not found"})

    void processRecording(String(id))

    return res.status(202).json({success: true, message: "Recording received"})
}

/** The bot reports a crash here so the job does not sit on "recording" forever. */
export const failJob = async (req: Request, res: Response) => {
    if (!botTokenIsValid(req)) return res.status(401).json({success: false, message: "Invalid bot token"})

    await Meeting.findByIdAndUpdate(req.params.id, {
        status: "failed",
        error: req.body?.error ?? "Bot failed to record"
    })
    return res.status(200).json({success: true})
}
