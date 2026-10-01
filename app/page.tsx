"use client"; // this page uses state, so it runs in the browser

import { useState } from "react";
import Field from "@/components/Field";
import Stat from "@/components/Stat";
import LayoutDrawing from "@/components/LayoutDrawing";
import { calculate, defaults, presets, type Form } from "@/lib/estimate";

const card = "rounded-3xl border border-line bg-card p-5 backdrop-blur";

export default function Home() {
  // useState is like ref(): [value, setter]. Setting it re-renders the component.
  const [form, setForm] = useState<Form>(defaults);

  // No `computed` needed: this just runs on every render, and it's cheap.
  const est = calculate(form);

  // Returns a function so each <Field> can update its own key. This replaces v-model.
  const set = (key: keyof Form) => (v: string) => setForm((f) => ({ ...f, [key]: v }));

  function setUnit(unit: "m" | "ft") {
    if (unit === form.unit) return;
    const k = unit === "ft" ? 1 / 0.3048 : 0.3048;
    const conv = (s: string) => (parseFloat(s) ? String(Math.round(parseFloat(s) * k * 100) / 100) : s);
    setForm((f) => ({ ...f, unit, len: conv(f.len), wid: conv(f.wid) }));
  }

  const size = `${form.tw}x${form.th}`;
  const presetValue = presets.includes(size) ? size : "custom";
  const selectCls = "mt-1 w-full rounded-xl border border-transparent bg-field px-3 py-3 text-base text-ink focus:border-accent focus:outline-none";

  return (
    <>
      <header className="hero-bg px-5 pb-10 pt-16 text-center">
        <span className="rise inline-flex items-center gap-2 rounded-full border border-line bg-card px-3.5 py-1.5 text-xs text-mute">
          <i className="size-1.5 rounded-full bg-accent2" /> Free, no signup
        </span>
        <h1 className="rise mx-auto mb-4 mt-5 max-w-[14ch] font-display text-5xl font-extrabold leading-none tracking-tighter sm:text-7xl">
          Know exactly how many tiles you need.
        </h1>
        <p className="rise mx-auto max-w-[46ch] text-mute">
          Add your room and tile size. Get tiles, boxes, adhesive, and grout, plus a layout that shows every cut.
        </p>
      </header>

      <main className="mx-auto grid max-w-6xl gap-4 px-4 pb-14 lg:grid-cols-[360px_1fr] lg:items-start">
        {/* ---------- Form ---------- */}
        <section className={`${card} lg:sticky lg:top-4`}>
          <h2 className="mb-2.5 font-display font-semibold">Room</h2>
          <div className="mb-3 flex gap-1 rounded-full bg-field p-1">
            {(["m", "ft"] as const).map((u) => (
              <button key={u} type="button" onClick={() => setUnit(u)} aria-pressed={form.unit === u}
                className={`flex-1 rounded-full py-2 text-sm transition ${form.unit === u ? "bg-ink font-semibold text-page" : "text-mute"}`}>
                {u === "m" ? "Meters" : "Feet"}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <Field label="Length" value={form.len} onChange={set("len")} />
            <Field label="Width" value={form.wid} onChange={set("wid")} />
          </div>

          <h2 className="mb-2.5 mt-4 font-display font-semibold">Tile</h2>
          <label className="mb-3 block text-xs text-mute">Common size
            <select className={selectCls} value={presetValue}
              onChange={(e) => {
                if (e.target.value === "custom") return;
                const [w, h] = e.target.value.split("x");
                setForm((f) => ({ ...f, tw: w, th: h }));
              }}>
              {presets.map((p) => <option key={p} value={p}>{p.replace("x", " × ")} cm</option>)}
              <option value="custom">Custom</option>
            </select>
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <Field label="Width (cm)" value={form.tw} onChange={set("tw")} />
            <Field label="Length (cm)" value={form.th} onChange={set("th")} />
          </div>
          <label className="mb-3 block text-xs text-mute">Layout direction
            <select className={selectCls} value={form.ori} onChange={(e) => set("ori")(e.target.value)}>
              <option value="auto">Auto (fewest tiles)</option>
              <option value="0">Along room length</option>
              <option value="1">Rotated 90°</option>
            </select>
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <Field label="Grout joint (mm)" value={form.jt} onChange={set("jt")} />
            <Field label="Thickness (mm)" value={form.tk} onChange={set("tk")} />
            <Field label="Pieces per box" value={form.pb} onChange={set("pb")} />
            <Field label="Waste (%)" value={form.ws} onChange={set("ws")} />
          </div>
          <Field label="Price per box (₱, optional)" value={form.pr} onChange={set("pr")} placeholder="0" />

          <h2 className="mb-2.5 mt-4 font-display font-semibold">Adhesive</h2>
          <div className="grid grid-cols-2 gap-2.5">
            <Field label="Coverage (kg/m², blank = auto)" value={form.ac} onChange={set("ac")} placeholder="Auto" />
            <Field label="Bag size (kg)" value={form.ab} onChange={set("ab")} />
          </div>
        </section>

        {/* ---------- Results ---------- */}
        <section aria-live="polite">
          {!est ? (
            <div className={`${card} py-12 text-center text-mute`}>
              Enter the room length and width, and the tile size, to see your estimate.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat big className="col-span-2 sm:row-span-2" label="Boxes to buy" value={est.boxes} note={`${est.perBox} pieces per box`} />
              <Stat label="Tiles to buy" value={est.total} note={`${est.pieces} in layout, ${est.cuts} cut`} />
              <Stat label="Room area" value={est.area} decimals={2} note={`m² · ${est.sqft.toFixed(1)} sq ft`} />
              <Stat label="Adhesive" value={est.bags} note={`bags of ${est.bagKg} kg · ${est.cov} kg/m²${est.isAuto ? " (auto)" : ""}`} />
              <Stat label="Grout" value={est.grout} decimals={1} note="kg, includes 10% extra" />
              {est.price > 0 && (
                <Stat className="col-span-2 sm:col-span-4" label="Tile cost" value={est.cost} prefix="₱" note={`${est.boxes} boxes × ₱${est.price.toLocaleString("en-PH")}`} />
              )}
              <div className={`${card} col-span-2 sm:col-span-4`}>
                <h2 className="mb-2 font-display font-semibold">Your layout</h2>
                {!est.square && (
                  <p className="mb-3 text-xs text-mute">
                    {est.rotated ? "Tiles rotated 90°" : "Tiles laid along the room length"}
                    {est.saved > 0 && form.ori === "auto" && ` · saves ${est.saved} tiles vs the other direction`}
                  </p>
                )}
                <LayoutDrawing e={est} />
                <div className="mt-3 flex gap-4 text-xs text-mute">
                  <span><i className="mr-1.5 inline-block size-2.5 rounded-sm bg-[var(--tile)]" />Whole tile</span>
                  <span><i className="mr-1.5 inline-block size-2.5 rounded-sm bg-[var(--cut)]" />Cut tile</span>
                </div>
              </div>
            </div>
          )}
          <p className="mx-1 mt-3 max-w-[70ch] text-xs text-mute">
            Estimates only. Adhesive coverage depends on the trowel notch and the floor, and grout on the tile and joint size. Check the product bag or ask your supplier before you order.
          </p>
        </section>
      </main>
    </>
  );
}