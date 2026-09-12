import {z} from "zod"

/* Must stay in step with the `analysis` block in models/Project.ts - anything
   missing here is never generated, however hard the prompt asks for it. */
export const meetingSchema = z.object({
    summary: z.string(),
    clientWants: z.array(z.string()),
    clientNeeds: z.array(z.string()),
    problems: z.array(z.string()),
    preferences: z.array(z.string()),
    clientPromises: z.array(z.string()),
    ourPromises: z.array(z.string()),
    decisionMakers: z.array(z.string()),
    changesFromPreviousMeetings: z.array(z.string()),
    requirements: z.array(z.string()),
    decisions: z.array(z.string()),
    actionItems: z.array(
        z.object({
            task: z.string(),
            owner: z.string().nullable(),
            deadline: z.string().nullable()
        })
    ),
    risks : z.array(z.string())
})

export type meeting = z.infer<typeof meetingSchema>
