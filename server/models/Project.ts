import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    clientId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Client"
    },
    transcript: {
        type: String,
        default: null
    },

    analysis: {
        type: {
            summary: {
                type: String,
                default: null
            },

            clientWants: {
                type: [String],
                default: []
            },

            clientNeeds: {
                type: [String],
                default: []
            },

            problems: {
                type: [String],
                default: []
            },

            preferences: {
                type: [String],
                default: []
            },

            clientPromises: {
                type: [String],
                default: []
            },

            ourPromises: {
                type: [String],
                default: []
            },

            decisionMakers: {
                type: [String],
                default: []
            },

            changesFromPreviousMeetings: {
                type: [String],
                default: []
            },

            requirements: {
                type: [String],
                default: []
            },

            decisions: {
                type: [String],
                default: []
            },

            actionItems: {
                type: [
                    {
                        task: String,
                        owner: {
                            type: String,
                            default: null
                        },
                        deadline: {
                            type: String,
                            default: null
                        }
                    }
                ],
                default: []
            },

            risks: {
                type: [String],
                default: []
            }
        },
        default: null
    },
    googleDocId: {
        type: String,
        default : null
    },

    // Bot jobs: the row is created when you schedule, long before there is audio.
    source: {
        type: String,
        enum: ["upload", "bot"],
        default: "upload"
    },
    status: {
        type: String,
        enum: ["queued", "recording", "transcribing", "done", "failed"],
        default: "done"
    },
    meetLink: { type: String, default: null },
    duration: { type: Number, default: null },
    audioPath: { type: String, default: null },
    error: { type: String, default: null },

    // The bot posts back without a cookie, so it cannot supply a Google token.
    // Stash the one from the browser session that scheduled the job.
    accessToken: { type: String, default: null }
}, {timestamps: true});

export default mongoose.model("Meeting", meetingSchema);