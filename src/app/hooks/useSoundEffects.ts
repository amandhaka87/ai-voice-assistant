"use client";

import { useCallback, useRef, useMemo } from "react";

function createSoundEffects() {
    let ctx: AudioContext | null = null;

    function getCtx(): AudioContext | null {
        if (typeof window === "undefined") return null;
        if (!ctx) {
            ctx = new AudioContext();
        }
        return ctx;
    }

    function playTone(freq: number, duration: number, type: OscillatorType = "sine", vol = 0.15) {
        const audioCtx = getCtx();
        if (!audioCtx) return;

        // Resume context if suspended (Chrome autoplay policy)
        if (audioCtx.state === "suspended") {
            audioCtx.resume();
        }

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(vol, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + duration);
    }

    return { playTone };
}

export function useSoundEffects() {
    const engineRef = useRef<ReturnType<typeof createSoundEffects> | null>(null);

    const getEngine = useCallback(() => {
        if (!engineRef.current) {
            engineRef.current = createSoundEffects();
        }
        return engineRef.current;
    }, []);

    const playActivation = useCallback(() => {
        const { playTone } = getEngine();
        playTone(400, 0.15, "sine", 0.12);
        setTimeout(() => playTone(600, 0.15, "sine", 0.1), 100);
        setTimeout(() => playTone(900, 0.3, "sine", 0.08), 200);
    }, [getEngine]);

    const playMicOn = useCallback(() => {
        const { playTone } = getEngine();
        playTone(800, 0.08, "sine", 0.1);
        setTimeout(() => playTone(1200, 0.1, "sine", 0.08), 60);
    }, [getEngine]);

    const playMicOff = useCallback(() => {
        const { playTone } = getEngine();
        playTone(1000, 0.08, "sine", 0.1);
        setTimeout(() => playTone(600, 0.12, "sine", 0.08), 60);
    }, [getEngine]);

    const playMessageSent = useCallback(() => {
        const { playTone } = getEngine();
        playTone(500, 0.12, "triangle", 0.08);
        setTimeout(() => playTone(700, 0.08, "triangle", 0.06), 80);
    }, [getEngine]);

    const playResponseReceived = useCallback(() => {
        const { playTone } = getEngine();
        playTone(660, 0.1, "sine", 0.1);
        setTimeout(() => playTone(880, 0.15, "sine", 0.08), 120);
        setTimeout(() => playTone(1100, 0.2, "sine", 0.05), 240);
    }, [getEngine]);

    // Return a stable object via useMemo so consumers don't re-render
    return useMemo(
        () => ({
            playActivation,
            playMicOn,
            playMicOff,
            playMessageSent,
            playResponseReceived,
        }),
        [playActivation, playMicOn, playMicOff, playMessageSent, playResponseReceived]
    );
}
