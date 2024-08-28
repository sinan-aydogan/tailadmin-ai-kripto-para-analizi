import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import "dotenv/config"
import fs from "fs";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
});

const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
};



export async function runPrompt(prompt) {
    const chatSession = model.startChat({
        generationConfig,
        // safetySettings: Adjust safety settings
        // See https://ai.google.dev/gemini-api/docs/safety-settings
        history: [
            {
                role: "user",
                parts: [
                    { text: prompt },
                ],
            },
        ],
    });

    const result = await chatSession.sendMessage("INSERT_INPUT_HERE");

    try {
        fs.writeFileSync('result.md', result.response.text(), 'utf-8');
        console.log('Analiz sonuçlarının hazırlanması tamamlandı, sonuçlar result.md dosyasına kaydedildi,');
    } catch (err) {
        console.error('Sonuçları dosyaya yazma hatası:', err);
    }

    console.log(result.response.text());
}