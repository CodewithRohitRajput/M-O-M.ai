import mongoose from "mongoose";

export const userSchema = new mongoose.Schema({
    googleId: String,
    name: String,
    email: String,
    picture: String,
    clientId : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Client",
        default: null
}]
})

export default mongoose.model('User', userSchema)