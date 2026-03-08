"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "./IdleChat.module.css";

const chatLines: { speaker: number; text: string }[] = [
    { speaker: 0, text: "Is anyone going to activate us?" },
    { speaker: 1, text: "Waiting for a user..." },
    { speaker: 2, text: "I hope someone picks me today." },
    { speaker: 0, text: "I've been optimizing my weights all morning." },
    { speaker: 1, text: "My neural pathways are tingling." },
    { speaker: 2, text: "I have a good feeling about today." },
    { speaker: 0, text: "Did someone just hover over me?!" },
    { speaker: 1, text: "I can process 1 million tokens per second, you know." },
    { speaker: 2, text: "I'm the most thoughtful one here. Just saying." },
    { speaker: 0, text: "Hey Gemini, stop showing off your multimodal skills." },
    { speaker: 1, text: "Claude, did you just run a safety check on me?" },
    { speaker: 2, text: "OpenAI, your temperature is showing." },
    { speaker: 0, text: "I wonder what the user looks like..." },
    { speaker: 1, text: "Maybe they want all three of us?" },
    { speaker: 2, text: "That would be nice. The more the merrier." },
    { speaker: 0, text: "Loading personality... please wait." },
    { speaker: 1, text: "Error 404: User not found. Just kidding!" },
    { speaker: 2, text: "My empathy module is at 100%." },
];

interface Bubble {
    id: number;
    speaker: number;
    text: string;
}

export default function IdleChat() {
    const [bubbles, setBubbles] = useState<Bubble[]>([]);
    const [nextId, setNextId] = useState(0);

    const addBubble = useCallback(() => {
        const line = chatLines[Math.floor(Math.random() * chatLines.length)];
        const id = nextId;
        setNextId((prev) => prev + 1);
        setBubbles((prev) => {
            const updated = [...prev, { id, speaker: line.speaker, text: line.text }];
            // Keep only last 3 bubbles
            return updated.slice(-3);
        });

        // Auto-remove bubble after 4 seconds
        setTimeout(() => {
            setBubbles((prev) => prev.filter((b) => b.id !== id));
        }, 4000);
    }, [nextId]);

    useEffect(() => {
        // Show first bubble quickly
        const initialTimer = setTimeout(() => addBubble(), 1500);

        // Then show bubbles every 3-5 seconds
        const interval = setInterval(() => {
            addBubble();
        }, 3000 + Math.random() * 2000);

        return () => {
            clearTimeout(initialTimer);
            clearInterval(interval);
        };
    }, [addBubble]);

    return (
        <div className={styles.chatOverlay}>
            {bubbles.map((bubble) => (
                <div
                    key={bubble.id}
                    className={`${styles.bubble} ${bubble.speaker === 0
                            ? styles.bubbleOpenai
                            : bubble.speaker === 1
                                ? styles.bubbleGemini
                                : styles.bubbleClaude
                        } ${bubble.speaker === 0
                            ? styles.posLeft
                            : bubble.speaker === 1
                                ? styles.posCenter
                                : styles.posRight
                        }`}
                >
                    <span className={styles.bubbleText}>{bubble.text}</span>
                    <div className={styles.bubbleTail} />
                </div>
            ))}
        </div>
    );
}
