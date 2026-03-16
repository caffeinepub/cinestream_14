import { useEffect, useRef, useState } from "react";

interface CinematicIntroProps {
  onComplete: () => void;
}

export default function CinematicIntro({ onComplete }: CinematicIntroProps) {
  const [visible, setVisible] = useState(true);
  const [logoVisible, setLogoVisible] = useState(false);
  const hasPlayed = useRef(false);

  useEffect(() => {
    if (hasPlayed.current) return;
    hasPlayed.current = true;

    // Small delay so logo fade-in starts after component mounts
    const logoTimer = setTimeout(() => setLogoVisible(true), 50);

    // Play cinematic intro sound via Web Audio API
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;

      const makeLayer = (
        type: OscillatorType,
        freq: number,
        freqEnd: number | null,
        gainPeak: number,
        gainRampDelay: number,
        gainRampDuration: number,
      ) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, now);
        if (freqEnd !== null) {
          osc.frequency.linearRampToValueAtTime(freqEnd, now + 1.5);
        }
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(gainPeak, now + gainRampDelay);
        gain.gain.linearRampToValueAtTime(
          0,
          now + gainRampDelay + gainRampDuration,
        );
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 2.2);
      };

      // Layer 1: deep bass rumble
      makeLayer("sine", 55, null, 0.4, 0.3, 1.5);
      // Layer 2: sub-bass thud
      makeLayer("sine", 80, null, 0.5, 0.01, 0.5);
      // Layer 3: rising cinematic tone
      (() => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.linearRampToValueAtTime(600, now + 1.5);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.setValueAtTime(0.15, now + 1.8);
        gain.gain.linearRampToValueAtTime(0, now + 2.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 2.2);
      })();
    } catch (_e) {
      // AudioContext blocked by browser policy — fail silently
    }

    // Start fade-out after 2000ms
    const fadeTimer = setTimeout(() => setVisible(false), 2000);
    // Call onComplete after fade-out transition (500ms)
    const completeTimer = setTimeout(() => onComplete(), 2500);

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "#000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "32px",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.5s ease-out",
        pointerEvents: visible ? "all" : "none",
      }}
      data-ocid="intro.panel"
    >
      {/* CineStream Logo */}
      <div
        style={{
          opacity: logoVisible ? 1 : 0,
          transform: logoVisible ? "scale(1)" : "scale(0.92)",
          transition: "opacity 0.6s ease-in, transform 0.6s ease-out",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display, 'Bebas Neue', sans-serif)",
            fontWeight: 900,
            fontSize: "clamp(3rem, 8vw, 6rem)",
            letterSpacing: "-0.02em",
            lineHeight: 1,
            userSelect: "none",
          }}
        >
          <span style={{ color: "#e50914" }}>CINE</span>
          <span style={{ color: "#fff" }}>STREAM</span>
        </span>
      </div>

      {/* Spinner */}
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          border: "3px solid rgba(255,255,255,0.15)",
          borderTopColor: "#e50914",
          animation: "cineIntroSpin 0.9s linear infinite",
          opacity: logoVisible ? 1 : 0,
          transition: "opacity 0.4s ease 0.3s",
        }}
        data-ocid="intro.loading_state"
      />

      <style>{`
        @keyframes cineIntroSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
