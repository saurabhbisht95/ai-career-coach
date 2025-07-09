import { Inngest } from "inngest";

//create a client to send and receive events
export const inngest = new Inngest( { 
    id: "Ai-Career-Coach",
    name: "Ai-Career-Coach",
    credentials: {
        gemini: {
            apiKey: process.env.GEMINI_API_KEY
        }
    }
})