// A reusable number input. Props are like Vue props; `onChange` replaces v-model's emit.
type Props = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
};

export default function Field({ label, value, onChange, placeholder }: Props) {
  return (
    <label className="mb-3 block text-xs text-mute">
      {label}
      <input
        type="number"
        inputMode="decimal"
        min="0"
        step="any"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-transparent bg-field px-3 py-3 text-base text-ink transition hover:border-line focus:border-accent focus:bg-transparent focus:outline-none"
      />
    </label>
  );
}