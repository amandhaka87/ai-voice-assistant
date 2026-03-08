"use client";

import { useState, useCallback, useRef } from "react";

const greetings: Record<string, string> = {
    openai:
        "Hello! I'm your OpenAI assistant. I can help you with code, writing, and complex reasoning tasks. What would you like to work on today?",
    gemini:
        "Hi there! I'm Gemini, your multimodal AI. I can search, analyze, and understand across text, images, and more. How can I assist you?",
    claude:
        "Hey! I'm Claude, and I'm here to help with thoughtful conversation and careful research. Tell me what's on your mind!",
};

export function useSpeech() {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isMouthOpen, setIsMouthOpen] = useState(false);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const stopSpeaking = useCallback(() => {
        if (typeof window !== "undefined") {
            window.speechSynthesis.cancel();
        }
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsSpeaking(false);
        setIsMouthOpen(false);
    }, []);

    const speakText = useCallback(
        (text: string, delay = 0) => {
            if (typeof window === "undefined") return;

            stopSpeaking();

            const utterance = new SpeechSynthesisUtterance(text);
            utteranceRef.current = utterance;

            utterance.rate = 0.95;
            utterance.pitch = 1.05;

            utterance.onboundary = () => {
                setIsMouthOpen(true);
                setTimeout(() => setIsMouthOpen(false), 120);
            };

            utterance.onstart = () => {
                setIsSpeaking(true);
                intervalRef.current = setInterval(() => {
                    setIsMouthOpen((prev) => !prev);
                }, 150);
            };

            utterance.onend = () => {
                stopSpeaking();
            };

            utterance.onerror = () => {
                stopSpeaking();
            };

            setTimeout(() => {
                // Chrome workaround: speech synthesis can get stuck.
                // Cancel any pending speech and re-queue.
                window.speechSynthesis.cancel();
                window.speechSynthesis.speak(utterance);
            }, delay);
        },
        [stopSpeaking]
    );

    const speakGreeting = useCallback(
        (provider: string) => {
            const text = greetings[provider] || "Hello, I am ready to assist you!";
            speakText(text, 600);
        },
        [speakText]
    );

    return { isSpeaking, isMouthOpen, speakText, speakGreeting, stopSpeaking };
}
