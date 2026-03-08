import { NextRequest, NextResponse } from "next/server";

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
        throw new Error(`API error: ${res.status} - ${err}`);
    }

    const data = await res.json();
    return data.choices[0]?.message?.content || "I couldn't generate a response.";
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

        const response = await callOpenAI(apiKey, message);
        return NextResponse.json({ response });
    } catch (error: unknown) {
        const errMsg =
            error instanceof Error ? error.message : "An unexpected error occurred.";
        return NextResponse.json({ error: errMsg }, { status: 500 });
    }
}
