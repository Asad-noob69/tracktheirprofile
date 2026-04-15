"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  rotation: number;
}

export default function SparkleOverlay() {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const sparkleId = useRef(0);
  const timeoutIds = useRef<number[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const removeSparkle = (id: number) => {
      setSparkles((prev) => prev.filter((s) => s.id !== id));
    };

    const spawnSparkle = () => {
      const id = sparkleId.current++;
      const sparkle: Sparkle = {
        id,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 8 + Math.random() * 10,
        duration: 900 + Math.random() * 1100,
        delay: Math.random() * 180,
        rotation: Math.random() * 45 - 22.5,
      };

      setSparkles((prev) => {
        const next = [...prev, sparkle];
        if (next.length > 36) next.shift();
        return next;
      });

      const timeout = window.setTimeout(
        () => removeSparkle(id),
        sparkle.duration + sparkle.delay + 120
      );
      timeoutIds.current.push(timeout);
    };

    for (let i = 0; i < 14; i += 1) {
      const bootTimeout = window.setTimeout(() => spawnSparkle(), i * 90);
      timeoutIds.current.push(bootTimeout);
    }

    const interval = window.setInterval(() => {
      const spawnCount = Math.random() < 0.22 ? 2 : 1;
      for (let i = 0; i < spawnCount; i += 1) {
        spawnSparkle();
      }
    }, 280);

    return () => {
      window.clearInterval(interval);
      timeoutIds.current.forEach((id) => window.clearTimeout(id));
      timeoutIds.current = [];
    };
  }, []);

  return (
    <div className="sparkle-field" aria-hidden>
      {sparkles.map((sparkle) => (
        <span
          key={sparkle.id}
          className="sparkle-star"
          style={
            {
              left: `${sparkle.x}%`,
              top: `${sparkle.y}%`,
              width: `${sparkle.size}px`,
              height: `${sparkle.size}px`,
              animationDuration: `${sparkle.duration}ms`,
              animationDelay: `${sparkle.delay}ms`,
              "--spark-rotation": `${sparkle.rotation}deg`,
            } as CSSProperties
          }
        >
          <span className="sparkle-core" />
        </span>
      ))}
    </div>
  );
}
