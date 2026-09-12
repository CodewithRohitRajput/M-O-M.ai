import {google} from 'googleapis'
import type { docs_v1 } from 'googleapis'

const {GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI} = process.env

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
    throw new Error(
        'Missing Google OAuth configuration. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI.'
    )
}

const oauth2client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
)


export const getGoogleUser = async (accessToken: string) => {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo',{
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    })

    if (!response.ok) {
        throw new Error(`Google user info request failed: ${response.status}`)
    }

    const data = await response.json() as {
        id?: string
        name?: string
        email?: string
        picture?: string
    }

    if (!data.id || !data.email) {
        throw new Error("Google user info is missing id or email")
    }

    return data
}

export const getGoogleAuthUrl = () => {
    return oauth2client.generateAuthUrl({
        access_type: "offline",
        scope:[
            "openid",
            "email",
            "profile",
              "https://www.googleapis.com/auth/documents",
            "https://www.googleapis.com/auth/drive.file"
        ]
    })
}

export const getGoogleTokens = async (code:string) => {
    const {tokens} = await oauth2client.getToken(code)
    return tokens
}


type ActionItem = { task?: string; owner?: string | null; deadline?: string | null }

type Analysis = {
    summary?: string | null
    clientWants?: string[]
    clientNeeds?: string[]
    problems?: string[]
    preferences?: string[]
    clientPromises?: string[]
    ourPromises?: string[]
    decisionMakers?: string[]
    changesFromPreviousMeetings?: string[]
    requirements?: string[]
    decisions?: string[]
    actionItems?: ActionItem[]
    risks?: string[]
}

/* Rendered top to bottom; empty sections are skipped so a short meeting does
   not produce a page of blank headings. */
const SECTIONS: { key: keyof Analysis; label: string }[] = [
    { key: "problems", label: "Client Pain Points" },
    { key: "clientWants", label: "What the Client Wants" },
    { key: "clientNeeds", label: "What the Client Needs" },
    { key: "requirements", label: "Requirements" },
    { key: "preferences", label: "Preferences" },
    { key: "decisions", label: "Decisions" },
    { key: "actionItems", label: "Action Items" },
    { key: "clientPromises", label: "Client Commitments" },
    { key: "ourPromises", label: "Our Commitments" },
    { key: "decisionMakers", label: "Decision Makers" },
    { key: "changesFromPreviousMeetings", label: "Changes Since Last Meeting" },
    { key: "risks", label: "Risks" },
]

const formatActionItem = (item: ActionItem) => {
    const meta = [
        item.owner ? `Owner: ${item.owner}` : null,
        item.deadline ? `Due: ${item.deadline}` : null,
    ].filter(Boolean)

    return meta.length ? `${item.task}  (${meta.join(" · ")})` : `${item.task ?? ""}`
}

/**
 * Builds the Docs batchUpdate requests for a formatted note.
 *
 * Everything is inserted as one blob first, then styled - text insertion is the
 * only thing that moves indices, so the ranges recorded while building the
 * string stay valid for every styling request that follows.
 */
const buildDocRequests = (analysis: Analysis, heading: string) => {
    let text = ""
    // Docs Range uses startIndex/endIndex - "start"/"end" is rejected outright.
    const headingRanges: { startIndex: number; endIndex: number }[] = []
    const bulletRanges: { startIndex: number; endIndex: number }[] = []
    let titleRange = { startIndex: 1, endIndex: 1 }

    // The body starts at index 1, and every character (newline included) is one index.
    const line = (value: string) => {
        const startIndex = 1 + text.length
        text += value + "\n"
        return { startIndex, endIndex: 1 + text.length }
    }

    titleRange = line(heading)
    line("")

    if (analysis.summary) {
        headingRanges.push(line("Summary"))
        line(analysis.summary)
        line("")
    }

    for (const section of SECTIONS) {
        const value = analysis[section.key]
        if (!Array.isArray(value) || value.length === 0) continue

        headingRanges.push(line(section.label))

        let blockStart = 0
        let blockEnd = 0

        value.forEach((entry, index) => {
            const rendered =
                section.key === "actionItems"
                    ? formatActionItem(entry as ActionItem)
                    : String(entry)
            const range = line(rendered)
            if (index === 0) blockStart = range.startIndex
            blockEnd = range.endIndex
        })

        bulletRanges.push({ startIndex: blockStart, endIndex: blockEnd })
        line("")
    }

    const requests: docs_v1.Schema$Request[] = [
        { insertText: { location: { index: 1 }, text } },
        {
            updateParagraphStyle: {
                range: titleRange,
                paragraphStyle: { namedStyleType: "TITLE" },
                fields: "namedStyleType",
            },
        },
    ]

    for (const range of headingRanges) {
        requests.push({
            updateParagraphStyle: {
                range,
                paragraphStyle: { namedStyleType: "HEADING_2" },
                fields: "namedStyleType",
            },
        })
        // HEADING_2 defaults to a light grey; force it dark and bold.
        requests.push({
            updateTextStyle: {
                range,
                textStyle: {
                    bold: true,
                    foregroundColor: { color: { rgbColor: { red: 0.09, green: 0.09, blue: 0.11 } } },
                },
                fields: "bold,foregroundColor",
            },
        })
    }

    for (const range of bulletRanges) {
        requests.push({
            createParagraphBullets: {
                range,
                bulletPreset: "BULLET_DISC_CIRCLE_SQUARE",
            },
        })
    }

    return requests
}

export const createGoogleDoc = async (accessToken: string, title: string, analysis: Analysis)=>{
    oauth2client.setCredentials({
        access_token: accessToken
    })

    const docs = google.docs({
        version: "v1",
        auth: oauth2client
    })

    const document = await docs.documents.create({
        requestBody: {
            title
        }
    })

    const documentId = document.data.documentId

    await docs.documents.batchUpdate({
        documentId: documentId!,
        requestBody: {
            requests: buildDocRequests(analysis, title)
        }
    })

    return documentId


}





