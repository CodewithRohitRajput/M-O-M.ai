import {z} from "zod"

export const meetingSchema = z.object({
    summary: z.string(),
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