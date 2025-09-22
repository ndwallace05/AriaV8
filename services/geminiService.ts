import { GoogleGenAI } from "@google/genai";
import { ChatMessage, Memory } from "../types";
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
