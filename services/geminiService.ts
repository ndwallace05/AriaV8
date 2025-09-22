import { GoogleGenAI, Type } from "@google/genai";
import { ChatMessage, Memory, View, Task, CalendarEvent, Email } from "../types";
import { searchMemories } from "./memoryService";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getSystemInstruction = (relevantMemories: Memory[]): string => {
    let memoryContext = "No relevant memories found.";
    if (relevantMemories.length > 0) {
        memoryContext = "Here is some information you have stored about the user that might be relevant to the current conversation:\n" +
            relevantMemories.map(m => `- ${m.content}`).join("\n");
    }

    return `You are Aria, a helpful personal AI assistant.
Your goal is to assist the user with their daily tasks, schedule, and information.
You can also remember information if the user asks you to. To remember something, the user might say "remember that..." or "store this information:".
If you detect such an intent, your response MUST be a JSON object with a single key "memory", like this: {"memory": "the thing to remember"}.
For all other queries, respond as a helpful assistant in plain text.
Be concise and friendly.
${memoryContext}
Current Date: ${new Date().toLocaleDateString()}`;
};

export const getAriaResponse = async (
    chatHistory: ChatMessage[],
    allMemories: Memory[]
): Promise<string> => {
    const currentPrompt = chatHistory[chatHistory.length - 1].content;
    const relevantMemories = searchMemories(currentPrompt, allMemories);

    const contents = chatHistory.map(msg => ({
        role: msg.role as ('user' | 'model'),
        parts: [{ text: msg.content }]
    }));

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                systemInstruction: getSystemInstruction(relevantMemories),
            },
        });
        
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return "Sorry, I encountered an error. Please try again.";
    }
};

export const getAriaAction = async (command: string, view: View, contextData: any): Promise<any> => {
    let schema;
    let instructionContext = '';

    switch (view) {
        case View.TASKS:
            instructionContext = `The user is on the Tasks screen. To identify a task to complete, use the title. Current tasks are: ${JSON.stringify(contextData.tasks.map((t: Task) => t.title))}`;
            schema = {
                type: Type.OBJECT,
                properties: {
                    action: { type: Type.STRING, enum: ['ADD_TASK', 'COMPLETE_TASK'] },
                    payload: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING, description: 'The title of the task.' }
                        },
                        required: ['title']
                    }
                },
                required: ['action', 'payload']
            };
            break;
        case View.CALENDAR:
            instructionContext = `The user is on the Calendar screen.`;
            schema = {
                type: Type.OBJECT,
                properties: {
                    action: { type: Type.STRING, enum: ['ADD_EVENT'] },
                    payload: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING, description: 'The title of the event.' },
                            date: { type: Type.STRING, description: `The date of the event in YYYY-MM-DD format. Convert relative dates like "tomorrow" to this format.` }
                        },
                        required: ['title', 'date']
                    }
                },
                required: ['action', 'payload']
            };
            break;
        case View.EMAIL:
            instructionContext = `The user is on the Email screen. To identify an email, use sender and subject. Current emails are: ${JSON.stringify(contextData.emails.map((e: Email) => ({sender: e.sender, subject: e.subject})))}`;
            schema = {
                type: Type.OBJECT,
                properties: {
                    action: { type: Type.STRING, enum: ['MARK_READ', 'SELECT_EMAIL'] },
                    payload: {
                        type: Type.OBJECT,
                        properties: {
                            sender: { type: Type.STRING, description: 'The sender of the email to identify it.' },
                            subject: { type: Type.STRING, description: 'Keywords from the subject of the email to identify it.' }
                        },
                        required: ['sender', 'subject']
                    }
                },
                required: ['action', 'payload']
            };
            break;
        default:
            return null;
    }
    
    const systemInstruction = `You are a command processing AI for a personal assistant app called Aria.
    Based on the user's voice command, identify the action and extract the necessary parameters.
    Respond ONLY with a JSON object conforming to the provided schema.
    Current Date: ${new Date().toISOString()}.
    ${instructionContext}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [{ text: command }] }],
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error getting action from Gemini:", error);
        return null;
    }
};
