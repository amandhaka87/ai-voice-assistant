import { NextRequest, NextResponse } from "next/server";

type Provider = "openai" | "gemini" | "claude";

function detectProvider(key: string): Provider | null {
    if (key.startsWith("sk-ant-")) return "claude";
    if (key.startsWith("sk-")) return "openai";
    if (key.startsWith("AIza")) return "gemini";
    return null;
}

async function callOpenAI(apiKey: string, message: string): Promise<string> {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content:
                        "You are a friendly voice assistant. Keep responses concise and conversational, under 3 sentences. Speak naturally as if talking to someone.",
                },
                { role: "user", content: message },
            ],
            max_tokens: 200,
            temperature: 0.7,
        }),
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`OpenAI API error: ${res.status} - ${err}`);
    }

    const data = await res.json();
    return data.choices[0]?.message?.content || "I couldn't generate a response.";
}

async function callGemini(apiKey: string, message: string): Promise<string> {
    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: message }] }],
                systemInstruction: {
                    parts: [
                        {
                            text: "You are a friendly voice assistant. Keep responses concise and conversational, under 3 sentences. Speak naturally as if talking to someone.",
                        },
                    ],
                },
                generationConfig: { maxOutputTokens: 200, temperature: 0.7 },
            }),
        }
    );

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Gemini API error: ${res.status} - ${err}`);
    }

    const data = await res.json();
    return (
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "I couldn't generate a response."
    );
}

async function callClaude(apiKey: string, message: string): Promise<string> {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
            model: "claude-3-5-haiku-latest",
            max_tokens: 200,
            system:
                "You are a friendly voice assistant. Keep responses concise and conversational, under 3 sentences. Speak naturally as if talking to someone.",
            messages: [{ role: "user", content: message }],
        }),
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Claude API error: ${res.status} - ${err}`);
    }

    const data = await res.json();
    return (
        data.content?.[0]?.text || "I couldn't generate a response."
    );
}

export async function POST(request: NextRequest) {
    try {
        const { message, apiKey } = await request.json();

        if (!message || !apiKey) {
            return NextResponse.json(
                { error: "Message and API key are required." },
                { status: 400 }
            );
        }

        const provider = detectProvider(apiKey);
        if (!provider) {
            return NextResponse.json(
                { error: "Unrecognized API key format." },
                { status: 400 }
            );
        }

        let response: string;

        switch (provider) {
            case "openai":
                response = await callOpenAI(apiKey, message);
                break;
            case "gemini":
                response = await callGemini(apiKey, message);
                break;
            case "claude":
                response = await callClaude(apiKey, message);
                break;
        }

        return NextResponse.json({ response, provider });
    } catch (error: unknown) {
        const errMsg =
            error instanceof Error ? error.message : "An unexpected error occurred.";
        return NextResponse.json({ error: errMsg }, { status: 500 });
    }
}
