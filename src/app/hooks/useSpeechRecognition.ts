"use client";

import { useState, useCallback, useRef, useEffect } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export function useSpeechRecognition() {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [interimTranscript, setInterimTranscript] = useState("");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognitionRef = useRef<any>(null);
    const [isSupported, setIsSupported] = useState(true);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setIsSupported(false);
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
            let interim = "";
            let final = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    final += result[0].transcript;
                } else {
                    interim += result[0].transcript;
                }
            }
            if (final) {
                setTranscript(final);
                setInterimTranscript("");
            } else {
                setInterimTranscript(interim);
            }
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onerror = (e: any) => {
            // "aborted" and "no-speech" are not real errors
            if (e?.error !== "aborted" && e?.error !== "no-speech") {
                console.warn("Speech recognition error:", e?.error);
            }
            setIsListening(false);
        };

        recognitionRef.current = recognition;
    }, []);

    const startListening = useCallback(() => {
        if (!recognitionRef.current) return;
        setTranscript("");
        setInterimTranscript("");
        try {
            recognitionRef.current.start();
            setIsListening(true);
        } catch (err) {
            // Already started — ignore DOMException
            console.warn("Recognition start error:", err);
        }
    }, []);

    const stopListening = useCallback(() => {
        if (!recognitionRef.current) return;
        try {
            recognitionRef.current.stop();
        } catch {
            // Already stopped — ignore
        }
        setIsListening(false);
    }, []);

    return {
        isListening,
        transcript,
        interimTranscript,
        startListening,
        stopListening,
        isSupported,
        setTranscript,
    };
}
