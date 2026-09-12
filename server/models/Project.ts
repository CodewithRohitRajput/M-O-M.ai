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
        required: true
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
    }
});

export default mongoose.model("Meeting", meetingSchema);