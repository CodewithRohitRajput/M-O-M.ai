import multer from "multer";
import path from "path";
import crypto from "crypto";

// diskStorage (not `dest`) so the extension survives - transcribeSpeech reads it
// to pick the media type, and the bot sends .wav.
const upload = multer({
    storage: multer.diskStorage({
        destination: "uploads/",
        filename: (_req, file, cb) => {
            cb(null, crypto.randomUUID() + path.extname(file.originalname))
        }
    }),
    limits: { fileSize: 500 * 1024 * 1024 }
})

export default upload
