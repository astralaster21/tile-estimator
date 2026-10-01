import type { ReactElement } from "react";
import type { Estimate } from "@/lib/estimate";

// Draws the room as an SVG. Plain function component: props in, JSX out.
export default function LayoutDrawing({ e }: { e: Estimate }) {
  if (e.cols * e.rows > 3000) return null; // too many tiles to draw
  const vw = 600, sc = vw / e.L, vh = Math.max(40, e.W * sc);
  const rects: ReactElement[] = [];
  for (let y = 0; y < e.rows; y++) {
    for (let x = 0; x < e.cols; x++) {
      const x0 = x * (e.dw + e.j), y0 = y * (e.dh + e.j);
      const w = Math.min(e.dw, e.L - x0), h = Math.min(e.dh, e.W - y0);
      if (w <= 0 || h <= 0) continue;
      const cut = x >= e.fc || y >= e.fr;
      rects.push(
        <rect key={`${x}-${y}`} rx={1.5} x={x0 * sc} y={y0 * sc} width={w * sc} height={h * sc}
          fill={cut ? "var(--cut)" : "var(--tile)"} />
      ); // `key` is required on list items, like :key in v-for
    }
  }
  return (
    <svg viewBox={`0 0 ${vw} ${vh}`} role="img" aria-label="Tile layout of the room"
      className="block h-auto w-full rounded-xl bg-[var(--grout)]">
      {rects}
    </svg>
  );
}