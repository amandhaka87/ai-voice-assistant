"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import styles from "../page.module.css";
import Robot from "./Robot";
import TypingText from "./TypingText";
import { useSpeech } from "../hooks/useSpeech";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { useSoundEffects } from "../hooks/useSoundEffects";

export default function HomePage() {
    const [apiKey, setApiKey] = useState("");
    const hasKey = apiKey.trim().length > 0;
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
    const sfx = useSoundEffects();

    const [showHelp, setShowHelp] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [chatLog, setChatLog] = useState<{ role: "user" | "ai"; text: string }[]>([]);
    const [error, setError] = useState("");
    const prevHasKeyRef = useRef(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Auto-speak greeting + play activation sound
    useEffect(() => {
        if (hasKey && !prevHasKeyRef.current) {
            sfx.playActivation();
            speakGreeting();
            setChatLog([]);
            setError("");
        }
        if (!hasKey && prevHasKeyRef.current) {
            stopSpeaking();
            setChatLog([]);
        }
        prevHasKeyRef.current = hasKey;
    }, [hasKey, speakGreeting, stopSpeaking, sfx]);

    // Scroll chat to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatLog]);

    // Send message to AI
    const sendMessage = useCallback(
        async (text: string) => {
            if (!text.trim() || !apiKey) return;

            sfx.playMessageSent();
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

                sfx.playResponseReceived();
                setChatLog((prev) => [...prev, { role: "ai", text: data.response }]);
                speakText(data.response);
            } catch {
                setError("Failed to connect. Please check your connection.");
            } finally {
                setIsLoading(false);
            }
        },
        [apiKey, speakText, setTranscript, sfx]
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
            sfx.playMicOff();
            stopListening();
        } else {
            sfx.playMicOn();
            startListening();
        }
    };

    return (
        <>
            <div className={styles.bgGrid}></div>
            {/* Scan lines overlay */}
            <div className={styles.scanLines} />
            {/* HUD corners */}
            <div className={`${styles.hudCorner} ${styles.hudTL}`} />
            <div className={`${styles.hudCorner} ${styles.hudTR}`} />
            <div className={`${styles.hudCorner} ${styles.hudBL}`} />
            <div className={`${styles.hudCorner} ${styles.hudBR}`} />

            {hasKey && <div className={styles.cinematicOverlay} />}

            <main className={styles.container}>
                <h1 className={`${styles.title} ${hasKey ? styles.titleFaded : ""}`}>
                    AI Voice Assistant
                </h1>
                <p className={styles.subtitle}>
                    {hasKey
                        ? isSpeaking
                            ? "🔊 Speaking..."
                            : isListening
                                ? "🎙️ Listening..."
                                : isLoading
                                    ? "🤔 Thinking..."
                                    : "✦ Ready • Click mic to talk"
                        : "Enter your API key to get started"}
                </p>

                {/* API Key Input */}
                <div className={styles.inputWrapper}>
                    <div className={styles.inputContainer}>
                        <div className={`${styles.inputIcon} ${hasKey ? styles.inputIconActive : ""}`}>
                            {hasKey ? "🔓" : "🔑"}
                        </div>
                        <input
                            type="password"
                            className={`${styles.apiInput} ${hasKey ? styles.inputGlowActive : ""}`}
                            placeholder="Paste your OpenAI API key here (sk-...)"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            autoComplete="off"
                            spellCheck={false}
                        />
                        {hasKey && (
                            <div className={`${styles.detectedBadge} ${styles.badgeActive}`}>
                                ✦ Connected
                            </div>
                        )}
                    </div>
                    {!hasKey && (
                        <button
                            className={styles.helpToggle}
                            onClick={() => setShowHelp(!showHelp)}
                        >
                            {showHelp ? "✕ Close" : "? Where do I get an API key?"}
                        </button>
                    )}
                    {showHelp && !hasKey && (
                        <div className={styles.helpPanel}>
                            <h3 className={styles.helpTitle}>Get your OpenAI API key</h3>
                            <div className={styles.helpCards}>
                                <a
                                    href="https://platform.openai.com/api-keys"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`${styles.helpCard} ${styles.helpCardOpenai}`}
                                >
                                    <span className={styles.helpCardIcon}>🔑</span>
                                    <span className={styles.helpCardName}>OpenAI Platform</span>
                                    <span className={styles.helpCardSteps}>
                                        1. Sign up at platform.openai.com<br />
                                        2. Go to API Keys section<br />
                                        3. Click &quot;Create new secret key&quot;<br />
                                        4. Copy your key and paste it above
                                    </span>
                                    <span className={styles.helpCardLink}>Get Your Key →</span>
                                </a>
                            </div>
                            <p className={styles.helpNote}>
                                🔒 Your API key is never stored. It&apos;s only used during your current session.
                            </p>
                        </div>
                    )}
                </div>

                {/* Single Robot */}
                <div className={`${styles.robotSection} ${hasKey ? styles.robotActivated : ""}`}>
                    <div className={styles.robotCenter}>
                        <Robot isTalking={hasKey && isSpeaking} />
                    </div>
                    {!hasKey && (
                        <div className={styles.robotIdleLabel}>
                            Waiting for activation...
                        </div>
                    )}
                </div>

                {/* Voice Chat Interface */}
                {hasKey && (
                    <div className={styles.chatSection}>
                        {/* Chat Log */}
                        {chatLog.length > 0 && (
                            <div className={styles.chatLog}>
                                {chatLog.map((entry, i) => (
                                    <div
                                        key={i}
                                        className={`${styles.chatBubble} ${entry.role === "user" ? styles.chatUser : styles.chatAi}`}
                                    >
                                        <span className={styles.chatRole}>
                                            {entry.role === "user" ? "You" : "AI"}
                                        </span>
                                        {entry.role === "ai" && i === chatLog.length - 1 ? (
                                            <p className={styles.chatText}>
                                                <TypingText text={entry.text} speed={20} />
                                            </p>
                                        ) : (
                                            <p className={styles.chatText}>{entry.text}</p>
                                        )}
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
                                            : "Click to speak"
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
