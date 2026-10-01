"use client"; // uses hooks, so it must run in the browser
import { useEffect, useRef, useState } from "react";

// Animates a number toward its new value. useEffect here works like a Vue watch on `to`.
function useCountUp(to: number) {
  const [v, setV] = useState(to);
  const from = useRef(to);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      from.current = to;
      setV(to);
      return;
    }
    const a = from.current, t0 = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / 350);
      const x = a + (to - a) * (1 - (1 - p) ** 3);
      from.current = x;
      setV(x);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf); // cleanup, like onUnmounted
  }, [to]);
  return v;
}

type Props = {
  label: string; value: number; note?: string;
  decimals?: number; prefix?: string; big?: boolean; className?: string;
};

export default function Stat({ label, value, note, decimals = 0, prefix = "", big, className = "" }: Props) {
  const v = useCountUp(value);
  const text = prefix + v.toLocaleString("en-PH", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  const look = big
    ? "border-0 bg-gradient-to-br from-accent to-accent2 text-on"
    : "border border-line bg-card backdrop-blur hover:-translate-y-0.5 hover:border-accent";
  return (
    <div className={`flex min-h-32 flex-col justify-between rounded-3xl p-5 transition duration-300 ${look} ${className}`}>
      <span className={`text-xs ${big ? "opacity-80" : "text-mute"}`}>{label}</span>
      <span className={`font-display font-extrabold leading-none tracking-tight tabular-nums ${big ? "my-4 text-7xl sm:text-8xl" : "my-3 text-3xl"}`}>{text}</span>
      <span className={`text-xs ${big ? "opacity-80" : "text-mute"}`}>{note}</span>
    </div>
  );
}