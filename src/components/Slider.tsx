interface Props {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (v: number) => void;
  unit?: string;
}

export default function Slider({ label, min, max, step = 1, value, onChange, unit = '' }: Props) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-slate-300 font-medium">{label}</span>
        <span className="text-blue-400 font-mono tabular-nums">{value}{unit}</span>
      </div>
      <div className="relative h-5 flex items-center">
        <div className="absolute h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute w-full opacity-0 cursor-pointer h-5"
        />
        <div
          className="absolute w-4 h-4 bg-blue-500 rounded-full shadow-lg pointer-events-none border-2 border-white transition-all"
          style={{ left: `calc(${pct}% - 8px)` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-slate-500">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}
