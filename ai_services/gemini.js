import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import "dotenv/config"
import fs from "fs";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const fileManager = new GoogleAIFileManager(apiKey);

async function uploadToGemini(path, mimeType) {
    const uploadResult = await fileManager.uploadFile(path, {
        mimeType,
        displayName: path,
    });
    const file = uploadResult.file;
    console.log(`Uploaded file ${file.displayName} as: ${file.name}`);
    return file;
}

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
});

const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 75,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
};

export async function runPrompt(prompt) {
    const files = [
        await uploadToGemini("generated_files/btc_turk_wallet.pdf", "application/pdf"),
        await uploadToGemini("generated_files/kline_data.pdf", "application/pdf"),
        await uploadToGemini("generated_files/current_prices_of_pairs.pdf", "application/pdf"),
    ];

    const chatSession = model.startChat({
        generationConfig,
        // safetySettings: Adjust safety settings
        // See https://ai.google.dev/gemini-api/docs/safety-settings
        history: [
            {
                role: "user",
                parts: [
                    {
                        fileData: {
                            mimeType: files[0].mimeType,
                            fileUri: files[0].uri,
                        },
                    },
                    {
                        fileData: {
                            mimeType: files[1].mimeType,
                            fileUri: files[1].uri,
                        },
                    },
                    {
                        fileData: {
                            mimeType: files[2].mimeType,
                            fileUri: files[2].uri,
                        },
                    },
                    { text: prompt },
                ],
            },
        ],
    });

    const result = await chatSession.sendMessage("INSERT_INPUT_HERE");

    try {
        fs.writeFileSync('generated_files/result.md', result.response.text(), 'utf-8');
        console.log('Analiz sonuçlarının hazırlanması tamamlandı, sonuçlar generated_files/result.md dosyasına kaydedildi,');
    } catch (err) {
        console.error('Sonuçları dosyaya yazma hatası:', err);
    }

    console.log(result.response.text());
}