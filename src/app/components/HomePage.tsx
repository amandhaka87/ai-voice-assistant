"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import styles from "../page.module.css";
import Robot from "./Robot";
import IdleChat from "./IdleChat";
import { useSpeech } from "../hooks/useSpeech";

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
    const { isSpeaking, isMouthOpen, speak, stopSpeaking } = useSpeech();
    const prevProviderRef = useRef<Provider>(null);

    // Auto-speak greeting when a new provider is detected
    useEffect(() => {
        if (detectedProvider && detectedProvider !== prevProviderRef.current) {
            speak(detectedProvider);
        }
        if (!detectedProvider && prevProviderRef.current) {
            stopSpeaking();
        }
        prevProviderRef.current = detectedProvider;
    }, [detectedProvider, speak, stopSpeaking]);

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
                            <div className={`${styles.detectedBadge} ${detectedProvider === "openai"
                                    ? styles.badgeOpenai
                                    : detectedProvider === "gemini"
                                        ? styles.badgeGemini
                                        : styles.badgeClaude
                                }`}>
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
                            const robotTalking = isActive && isSpeaking && isMouthOpen;

                            return (
                                <div
                                    key={agent.id}
                                    className={`${styles.card} ${agent.styleClass} ${isActive ? `${styles.cardActivated} ${positionActiveClass[agent.position]}` : ""
                                        } ${isFaded ? `${styles.cardFaded} ${positionFadedClass[agent.position]}` : ""}`}
                                >
                                    <div className={styles.robotWrapper}>
                                        <Robot variant={agent.variant} isTalking={isActive && isSpeaking} />
                                    </div>
                                    <h2 className={styles.name}>{agent.name}</h2>
                                    <p className={styles.role}>{agent.role}</p>
                                    <div className={`${styles.status} ${isActive ? styles.statusActivated : ""}`}>
                                        {isActive && isSpeaking ? "🔊 Speaking..." : isActive ? "✦ Activated" : agent.status}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>
        </>
    );
}
