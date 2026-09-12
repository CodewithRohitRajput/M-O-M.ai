import mongoose from "mongoose";

const ClientSchema = new mongoose.Schema({
    userId: String,
    email: String,
    projectId:  {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        default: null
    },

})

export default mongoose.model('Client', ClientSchema)