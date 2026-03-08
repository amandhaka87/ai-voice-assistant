"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./TypingText.module.css";

interface TypingTextProps {
    text: string;
    speed?: number;
    onComplete?: () => void;
}

export default function TypingText({ text, speed = 25, onComplete }: TypingTextProps) {
    const [displayed, setDisplayed] = useState("");
    const [isComplete, setIsComplete] = useState(false);
    const indexRef = useRef(0);

    useEffect(() => {
        setDisplayed("");
        indexRef.current = 0;
        setIsComplete(false);

        const interval = setInterval(() => {
            if (indexRef.current < text.length) {
                setDisplayed(text.slice(0, indexRef.current + 1));
                indexRef.current++;
            } else {
                clearInterval(interval);
                setIsComplete(true);
                onComplete?.();
            }
        }, speed);

        return () => clearInterval(interval);
    }, [text, speed, onComplete]);

    return (
        <span className={styles.typingText}>
            {displayed}
            {!isComplete && <span className={styles.cursor}>▌</span>}
        </span>
    );
}
