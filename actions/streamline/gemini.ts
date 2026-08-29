import {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
  } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY ?? "";
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
});

const generationConfig = {
    temperature: 0,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
};

async function run(prompt: string, retries = 3, delay = 2000) {
    const chatSession = model.startChat({
            generationConfig,
        // safetySettings: Adjust safety settings
        // See https://ai.google.dev/gemini-api/docs/safety-settings
            history: [
            ],
    });

    for(let i = 0; i < retries; i++) {
        try {
            const result = await chatSession.sendMessage(prompt);
            console.log(result.response.text());
            return result.response.text();
        } catch (error) {
            console.error(`Attempt ${i + 1} failed: ${error}`);
            if (i < retries - 1) await new Promise(res => setTimeout(res, delay));
        }
    }

    
    
}

export default run;