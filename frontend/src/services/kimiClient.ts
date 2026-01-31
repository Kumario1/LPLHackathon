import { CLAWDBOT_SYSTEM_PROMPT } from './clawdbotSystemPrompt';

const KIMI_API_KEY = 'sk-kimi-Vp97U6BcI46DPF5zi0IcTZSql0VEZSur7VfHr5wMfFd5EoSUpLcuybDxFY6c9imv';
const KIMI_API_URL = 'https://api.moonshot.cn/v1/chat/completions'; // Assuming standard OpenAI-compatible endpoint for Kimi/Moonshot

export interface Message {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export const KimiClient = {
    sendMessage: async (messages: Message[]): Promise<string> => {
        try {
            // Prepend system prompt if not present
            const fullMessages = [
                { role: 'system', content: CLAWDBOT_SYSTEM_PROMPT },
                ...messages
            ];

            const response = await fetch(KIMI_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${KIMI_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'moonshot-v1-8k', // Or specific Kimi model version
                    messages: fullMessages,
                    temperature: 0.3,
                })
            });

            if (!response.ok) {
                throw new Error(`Kimi API Error: ${response.statusText}`);
            }

            const data = await response.json();
            return data.choices[0].message.content || "";
        } catch (error) {
            console.error("Failed to call Kimi API:", error);
            return "I'm sorry, I'm having trouble connecting to my brain right now. Please try again later.";
        }
    }
};
