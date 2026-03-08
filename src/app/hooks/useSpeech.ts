"use client";

import { useState, useCallback, useRef } from "react";

const GREETING =
    "Hello! I'm your AI assistant. I can help you with questions, ideas, and conversation. What would you like to talk about?";

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
                window.speechSynthesis.cancel();
                window.speechSynthesis.speak(utterance);
            }, delay);
        },
        [stopSpeaking]
    );

    const speakGreeting = useCallback(() => {
        speakText(GREETING, 600);
    }, [speakText]);

    return { isSpeaking, isMouthOpen, speakText, speakGreeting, stopSpeaking };
}
