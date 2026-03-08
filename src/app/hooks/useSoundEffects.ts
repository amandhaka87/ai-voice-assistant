"use client";

import { useCallback, useRef } from "react";

export function useSoundEffects() {
    const ctxRef = useRef<AudioContext | null>(null);

    const getCtx = useCallback(() => {
        if (typeof window === "undefined") return null;
        if (!ctxRef.current) {
            ctxRef.current = new AudioContext();
        }
        return ctxRef.current;
    }, []);

    const playTone = useCallback(
        (freq: number, duration: number, type: OscillatorType = "sine", vol = 0.15) => {
            const ctx = getCtx();
            if (!ctx) return;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            gain.gain.setValueAtTime(vol, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + duration);
        },
        [getCtx]
    );

    const playActivation = useCallback(() => {
        // Rising sci-fi chime: 3 ascending tones
        playTone(400, 0.15, "sine", 0.12);
        setTimeout(() => playTone(600, 0.15, "sine", 0.1), 100);
        setTimeout(() => playTone(900, 0.3, "sine", 0.08), 200);
    }, [playTone]);

    const playMicOn = useCallback(() => {
        // Quick blip
        playTone(800, 0.08, "sine", 0.1);
        setTimeout(() => playTone(1200, 0.1, "sine", 0.08), 60);
    }, [playTone]);

    const playMicOff = useCallback(() => {
        // Descending blip
        playTone(1000, 0.08, "sine", 0.1);
        setTimeout(() => playTone(600, 0.12, "sine", 0.08), 60);
    }, [playTone]);

    const playMessageSent = useCallback(() => {
        // Soft whoosh
        playTone(500, 0.12, "triangle", 0.08);
        setTimeout(() => playTone(700, 0.08, "triangle", 0.06), 80);
    }, [playTone]);

    const playResponseReceived = useCallback(() => {
        // Gentle notification
        playTone(660, 0.1, "sine", 0.1);
        setTimeout(() => playTone(880, 0.15, "sine", 0.08), 120);
        setTimeout(() => playTone(1100, 0.2, "sine", 0.05), 240);
    }, [playTone]);

    return {
        playActivation,
        playMicOn,
        playMicOff,
        playMessageSent,
        playResponseReceived,
    };
}
