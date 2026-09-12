import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { connectDB } from './config/db.js'
import cookieParser from 'cookie-parser'

import meetingRoute from './routes/meeting.routes.js'
import authRoutes from "./routes/auth.routes.js";
import clientRoute from './routes/client.routes.js'

const app = express();
const port = 8000;

app.use(express.json())
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}))
app.use(cookieParser())
 await connectDB()

// app.use('/', (req, res)=>{
//     res.send("Welcome to Acme AI")
// })

app.use('/meet', meetingRoute)
app.use("/auth", authRoutes)
app.use("/client", clientRoute)

app.listen(port, ()=>{
    console.log(`server is running on port ${port}`)
})

