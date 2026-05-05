import { useState } from 'react';
import { useProcessing } from '../../hooks/useProcessing';
import ImageViewer from '../ImageViewer';
import ProcessButton from '../ProcessButton';
import ErrorBanner from '../ErrorBanner';

interface Props { image: string }

type Mode = 'grayscale' | 'hsv' | 'channels' | 'rgb';

const modes: { id: Mode; label: string; desc: string }[] = [
  { id: 'grayscale', label: 'Grayscale', desc: 'Remove color info, keep luminance' },
  { id: 'hsv', label: 'HSV', desc: 'Hue, Saturation, Value color model' },
  { id: 'channels', label: 'RGB Channels', desc: 'Separate R, G, B components' },
  { id: 'rgb', label: 'RGB (display)', desc: 'Show raw RGB channel data' },
];

export default function ColorSpacesModule({ image }: Props) {
  const [mode, setMode] = useState<Mode>('grayscale');
  const { loading, error, result, process } = useProcessing(image);

  async function apply() {
    if (mode === 'channels') {
      await process('/color/channels');
    } else {
      await process(`/color/${mode}`);
    }
  }

  const extras = result && mode === 'channels' ? [
    { label: 'Red Channel', src: result.red! },
    { label: 'Green Channel', src: result.green! },
    { label: 'Blue Channel', src: result.blue! },
  ] : undefined;

  return (
    <div className="flex flex-col gap-6">
      <InfoBox
        title="Color Space Conversion"
        text="Images can be represented in different color spaces. Each space has unique properties useful for specific tasks — grayscale simplifies processing, HSV makes color filtering easier."
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`p-3 rounded-xl border text-left transition-all ${mode === m.id ? 'border-blue-500 bg-blue-950/40 text-blue-300' : 'border-slate-700 text-slate-300 hover:border-slate-600 hover:bg-slate-800/50'}`}
          >
            <p className="text-sm font-semibold">{m.label}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{m.desc}</p>
          </button>
        ))}
      </div>

      <ProcessButton onClick={apply} loading={loading} />
      {error && <ErrorBanner message={error} />}

      {result && mode !== 'channels' && result.result && (
        <ImageViewer original={image} processed={result.result} label={modes.find(m => m.id === mode)?.label} />
      )}
      {result && mode === 'channels' && extras && (
        <div>
          <p className="text-sm text-slate-400 mb-3">Individual channel representations:</p>
          <ImageViewer original={image} extraImages={extras} />
        </div>
      )}
    </div>
  );
}

function InfoBox({ title, text }: { title: string; text: string }) {
  return (
    <div className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl">
      <p className="text-sm font-semibold text-slate-200 mb-1">{title}</p>
      <p className="text-xs text-slate-400 leading-relaxed">{text}</p>
    </div>
  );
}
