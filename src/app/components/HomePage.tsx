"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import styles from "../page.module.css";
import Robot from "./Robot";
import IdleChat from "./IdleChat";
import { useSpeech } from "../hooks/useSpeech";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";

type Provider = "openai" | "gemini" | "claude" | null;

function detectProvider(key: string): Provider {
    const trimmed = key.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith("sk-ant-")) return "claude";
    if (trimmed.startsWith("sk-")) return "openai";
    if (trimmed.startsWith("AIza")) return "gemini";
    return null;
}

const agents = [
    {
        id: "openai",
        name: "OpenAI",
        role: "Advanced reasoning, code generation, and creative writing.",
        status: "Online",
        variant: "openai" as const,
        styleClass: styles.cardOpenai,
        position: "left" as const,
    },
    {
        id: "gemini",
        name: "Gemini",
        role: "Multimodal intelligence, search integration, and deep analysis.",
        status: "Ready",
        variant: "gemini" as const,
        styleClass: styles.cardGemini,
        position: "center" as const,
    },
    {
        id: "claude",
        name: "Claude",
        role: "Thoughtful conversation, safety-first design, and detailed research.",
        status: "Active",
        variant: "claude" as const,
        styleClass: styles.cardClaude,
        position: "right" as const,
    },
];

const positionActiveClass = {
    left: styles.activatedLeft,
    center: styles.activatedCenter,
    right: styles.activatedRight,
};

const positionFadedClass = {
    left: styles.fadedLeft,
    center: "",
    right: styles.fadedRight,
};

export default function HomePage() {
    const [apiKey, setApiKey] = useState("");
    const detectedProvider = useMemo(() => detectProvider(apiKey), [apiKey]);
    const isIdle = detectedProvider === null;
    const { isSpeaking, speakText, speakGreeting, stopSpeaking } = useSpeech();
    const {
        isListening,
        transcript,
        interimTranscript,
        startListening,
        stopListening,
        isSupported,
        setTranscript,
    } = useSpeechRecognition();

    const [isLoading, setIsLoading] = useState(false);
    const [chatLog, setChatLog] = useState<{ role: "user" | "ai"; text: string }[]>([]);
    const [error, setError] = useState("");
    const prevProviderRef = useRef<Provider>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Auto-speak greeting when a new provider is detected
    useEffect(() => {
        if (detectedProvider && detectedProvider !== prevProviderRef.current) {
            speakGreeting(detectedProvider);
            setChatLog([]);
            setError("");
        }
        if (!detectedProvider && prevProviderRef.current) {
            stopSpeaking();
            setChatLog([]);
        }
        prevProviderRef.current = detectedProvider;
    }, [detectedProvider, speakGreeting, stopSpeaking]);

    // Scroll chat to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatLog]);

    // Send message to AI when transcript finalizes
    const sendMessage = useCallback(
        async (text: string) => {
            if (!text.trim() || !apiKey) return;

            setChatLog((prev) => [...prev, { role: "user", text }]);
            setTranscript("");
            setIsLoading(true);
            setError("");

            try {
                const res = await fetch("/api/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ message: text, apiKey }),
                });

                const data = await res.json();

                if (!res.ok) {
                    setError(data.error || "Something went wrong.");
                    setIsLoading(false);
                    return;
                }

                setChatLog((prev) => [...prev, { role: "ai", text: data.response }]);
                speakText(data.response);
            } catch {
                setError("Failed to connect. Please check your connection.");
            } finally {
                setIsLoading(false);
            }
        },
        [apiKey, speakText, setTranscript]
    );

    // Auto-send when speech recognition finishes with a transcript
    useEffect(() => {
        if (!isListening && transcript && !isLoading) {
            sendMessage(transcript);
        }
    }, [isListening, transcript, isLoading, sendMessage]);

    const handleMicClick = () => {
        if (isSpeaking) {
            stopSpeaking();
            return;
        }
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    return (
        <>
            <div className={styles.bgGrid}></div>
            {!isIdle && <div className={styles.cinematicOverlay} />}

            <main className={styles.container}>
                <h1 className={`${styles.title} ${!isIdle ? styles.titleFaded : ""}`}>
                    Choose Your AI Assistant
                </h1>

                {/* API Key Input */}
                <div className={styles.inputWrapper}>
                    <div className={styles.inputContainer}>
                        <div className={`${styles.inputIcon} ${detectedProvider ? styles.inputIconActive : ""}`}>
                            {detectedProvider ? "🔓" : "🔑"}
                        </div>
                        <input
                            type="password"
                            className={`${styles.apiInput} ${detectedProvider === "openai"
                                    ? styles.inputGlowOpenai
                                    : detectedProvider === "gemini"
                                        ? styles.inputGlowGemini
                                        : detectedProvider === "claude"
                                            ? styles.inputGlowClaude
                                            : ""
                                }`}
                            placeholder="Paste your API key here (sk-..., AIza..., sk-ant-...)"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            autoComplete="off"
                            spellCheck={false}
                        />
                        {detectedProvider && (
                            <div
                                className={`${styles.detectedBadge} ${detectedProvider === "openai"
                                        ? styles.badgeOpenai
                                        : detectedProvider === "gemini"
                                            ? styles.badgeGemini
                                            : styles.badgeClaude
                                    }`}
                            >
                                {detectedProvider === "openai"
                                    ? "OpenAI Detected"
                                    : detectedProvider === "gemini"
                                        ? "Gemini Detected"
                                        : "Claude Detected"}
                            </div>
                        )}
                    </div>
                    {!detectedProvider && apiKey.length > 3 && (
                        <p className={styles.inputHint}>
                            Unrecognized key format. Supported: OpenAI (sk-), Gemini (AIza), Claude (sk-ant-)
                        </p>
                    )}
                </div>

                <div className={`${styles.gridWrapper} ${!isIdle ? styles.gridActivated : ""}`}>
                    {isIdle && <IdleChat />}
                    <div className={styles.grid}>
                        {agents.map((agent) => {
                            const isActive = detectedProvider === agent.id;
                            const isFaded = detectedProvider !== null && !isActive;

                            return (
                                <div
                                    key={agent.id}
                                    className={`${styles.card} ${agent.styleClass} ${isActive
                                            ? `${styles.cardActivated} ${positionActiveClass[agent.position]}`
                                            : ""
                                        } ${isFaded ? `${styles.cardFaded} ${positionFadedClass[agent.position]}` : ""}`}
                                >
                                    <div className={styles.robotWrapper}>
                                        <Robot variant={agent.variant} isTalking={isActive && isSpeaking} />
                                    </div>
                                    <h2 className={styles.name}>{agent.name}</h2>
                                    <p className={styles.role}>{agent.role}</p>
                                    <div className={`${styles.status} ${isActive ? styles.statusActivated : ""}`}>
                                        {isActive && isSpeaking
                                            ? "🔊 Speaking..."
                                            : isActive && isListening
                                                ? "🎙️ Listening..."
                                                : isActive && isLoading
                                                    ? "🤔 Thinking..."
                                                    : isActive
                                                        ? "✦ Activated"
                                                        : agent.status}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Voice Chat Interface */}
                {detectedProvider && (
                    <div className={styles.chatSection}>
                        {/* Chat Log */}
                        {chatLog.length > 0 && (
                            <div className={styles.chatLog}>
                                {chatLog.map((entry, i) => (
                                    <div
                                        key={i}
                                        className={`${styles.chatBubble} ${entry.role === "user" ? styles.chatUser : styles.chatAi
                                            }`}
                                    >
                                        <span className={styles.chatRole}>
                                            {entry.role === "user" ? "You" : detectedProvider.toUpperCase()}
                                        </span>
                                        <p className={styles.chatText}>{entry.text}</p>
                                    </div>
                                ))}
                                <div ref={chatEndRef} />
                            </div>
                        )}

                        {/* Live transcript */}
                        {(interimTranscript || (isListening && !transcript)) && (
                            <div className={styles.liveTranscript}>
                                <span className={styles.liveLabel}>🎙️</span>
                                <span>{interimTranscript || "Listening..."}</span>
                            </div>
                        )}

                        {/* Error */}
                        {error && <div className={styles.chatError}>{error}</div>}

                        {/* Mic Button */}
                        <button
                            className={`${styles.micButton} ${isListening
                                    ? styles.micListening
                                    : isSpeaking
                                        ? styles.micSpeaking
                                        : isLoading
                                            ? styles.micLoading
                                            : ""
                                }`}
                            onClick={handleMicClick}
                            disabled={!isSupported}
                            title={
                                !isSupported
                                    ? "Speech recognition not supported"
                                    : isListening
                                        ? "Stop listening"
                                        : isSpeaking
                                            ? "Stop speaking"
                                            : "Hold to speak"
                            }
                        >
                            {isListening ? (
                                <span className={styles.micIcon}>⏹</span>
                            ) : isSpeaking ? (
                                <span className={styles.micIcon}>🔇</span>
                            ) : isLoading ? (
                                <span className={styles.micIconSpin}>⟳</span>
                            ) : (
                                <span className={styles.micIcon}>🎤</span>
                            )}
                        </button>
                        <p className={styles.micHint}>
                            {isListening
                                ? "Speak now... click to stop"
                                : isSpeaking
                                    ? "AI is speaking... click to stop"
                                    : isLoading
                                        ? "Thinking..."
                                        : "Click to start talking"}
                        </p>
                    </div>
                )}
            </main>
        </>
    );
}
