import {generateObject, generateText} from 'ai'
import { google } from '@ai-sdk/google'
import {  meetingSchema, type meeting } from '../utils/meeting.schema.js'
import fs from 'fs/promises'

export const analyzeText = async (transcript: string, prevNotes: string) =>{
const {object} = await generateObject({
    model : google('gemini-3.5-flash'),
    schema : meetingSchema,
    prompt : 
    `You are mom.ai, an AI meeting assistant.

Analyze the following meeting transcript and return structured meeting notes.

Extract the following:

- A concise summary
- What the client wants
- What the client needs
- Problems or challenges the client is facing
- Client preferences
- Promises made by the client
- Promises made by our team
- Decision makers and their roles
- Changes from previous meetings
- Client requirements
- Important decisions
- Action items
- Owners of action items
- Deadlines
- Risks or concerns

Important rules:

1. Do not invent information.
2. Only extract information explicitly stated or strongly supported by the transcript.
3. If something is not mentioned, return an empty array.
4. Do not confuse client needs with client preferences.
5. "Client wants" means desired outcomes, features, or goals.
6. "Client needs" means necessary business or technical requirements.
7. "Problems" means current pain points, blockers, or challenges.
8. "Preferences" means choices about design, workflow, technology, timing, or communication style.
9. "Client promises" include commitments made by the client.
10. "Our promises" include commitments made by our team.
11. Include decision makers only when a person or role is identified.
12. Only describe changes from previous meetings when the transcript explicitly compares the current meeting with an earlier meeting.
13. If an owner or deadline is not mentioned, use null.
14. Keep action items specific and actionable.
15. Only include risks supported by the transcript.

Meeting transcript:

${transcript}
 this is the previous meeting notes from the same client
${prevNotes}
`

})

return object
}

export const transcribeSpeech = async (filePath: string) => {
 const audio = await fs.readFile(filePath)

 const text = await generateText({
    model: google('gemini-3.5-flash'),
    messages: [
          {
                role: "user",
                content: [
                    {
                        type: "text",
                        text: "Transcribe this audio exactly. Do not summarize it. Return only the spoken words."
                    },
                    {
                        type: "file",
                        data: audio,
                        mediaType: "audio/mpeg"
                    }]

                }
    ]
 })
 return text.text
}