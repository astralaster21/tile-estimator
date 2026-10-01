// Pure math. No React in here, so it's easy to read and test.
// (Think of it like a plain helper/composable file in Vue.)

export type Form = {
  unit: "m" | "ft";
  len: string; wid: string;          // room
  tw: string; th: string;            // tile size in cm
  jt: string; tk: string;            // grout joint + tile thickness in mm
  pb: string; ws: string; pr: string; // pieces per box, waste %, price per box
  ac: string; ab: string;            // adhesive kg/m2 (blank = auto), bag kg
  ori: "auto" | "0" | "1";           // layout direction
};

// Inputs are strings because that's what <input> gives us while typing.
export const defaults: Form = {
  unit: "m", len: "4", wid: "3", tw: "60", th: "60", jt: "3", tk: "9",
  pb: "4", ws: "10", pr: "", ac: "", ab: "25", ori: "auto",
};

export const presets = ["30x30", "40x40", "60x60", "80x80", "30x60"];

const n = (s: string) => {
  const v = parseFloat(s);
  return isNaN(v) ? 0 : v;
};

export function calculate(f: Form) {
  const k = f.unit === "ft" ? 0.3048 : 1;
  const L = n(f.len) * k, W = n(f.wid) * k, j = n(f.jt) / 1000;
  const tw = n(f.tw) / 100, th = n(f.th) / 100;
  if (L <= 0 || W <= 0 || tw <= 0 || th <= 0) return null;

  // How many tiles fit if tile side `a` runs along the room length?
  const lay = (a: number, b: number) => {
    const cols = Math.ceil((L + j) / (a + j) - 1e-9);
    const rows = Math.ceil((W + j) / (b + j) - 1e-9);
    const fc = Math.floor((L + j) / (a + j) + 1e-9);
    const fr = Math.floor((W + j) / (b + j) + 1e-9);
    return { cols, rows, fc, fr, pieces: cols * rows };
  };
  const A = lay(tw, th), B = lay(th, tw);
  const rotated = tw !== th && (f.ori === "1" || (f.ori === "auto" && B.pieces < A.pieces));
  const P = rotated ? B : A;
  const [dw, dh] = rotated ? [th, tw] : [tw, th];

  const pieces = P.pieces;
  const cuts = pieces - P.fc * P.fr;
  const total = Math.ceil(pieces * (1 + n(f.ws) / 100));
  const perBox = Math.max(1, n(f.pb));
  const boxes = Math.ceil(total / perBox);
  const area = L * W;

  // Rule-of-thumb adhesive coverage by tile size (kg per m2)
  const side = Math.max(tw, th) * 100;
  const autoCov = side <= 30 ? 4 : side <= 45 ? 5 : side <= 60 ? 6 : 7.5;
  const cov = n(f.ac) > 0 ? n(f.ac) : autoCov;
  const bagKg = Math.max(1, n(f.ab));
  const bags = Math.ceil((area * cov) / bagKg);

  const a = tw * 1000, b = th * 1000;
  const grout = Math.max(0.1, area * ((a + b) / (a * b)) * n(f.tk) * (j * 1000) * 1.6 * 1.1);

  return {
    L, W, dw, dh, j, area, sqft: area * 10.7639,
    cols: P.cols, rows: P.rows, fc: P.fc, fr: P.fr,
    pieces, cuts, total, boxes, perBox, bags, bagKg, cov, isAuto: !(n(f.ac) > 0), grout,
    cost: boxes * n(f.pr), price: n(f.pr),
    rotated, saved: Math.abs(A.pieces - B.pieces), square: tw === th,
  };
}

export type Estimate = NonNullable<ReturnType<typeof calculate>>;