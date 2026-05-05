import { useState } from 'react';
import { useProcessing } from '../../hooks/useProcessing';
import ImageViewer from '../ImageViewer';
import ProcessButton from '../ProcessButton';
import ErrorBanner from '../ErrorBanner';

interface Props { image: string }

type Mode = 'show' | 'equalize' | 'stretch';

const modes: { id: Mode; label: string; desc: string }[] = [
  { id: 'show', label: 'View Histogram', desc: 'Display pixel intensity distribution' },
  { id: 'equalize', label: 'Equalization', desc: 'Spread intensity levels uniformly' },
  { id: 'stretch', label: 'Contrast Stretch', desc: 'Expand range to full 0–255' },
];

export default function HistogramModule({ image }: Props) {
  const [mode, setMode] = useState<Mode>('show');
  const { loading, error, result, process } = useProcessing(image);

  function apply() {
    if (mode === 'show') process('/histogram/show');
    else if (mode === 'equalize') process('/histogram/equalize');
    else process('/histogram/stretch');
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl">
        <p className="text-sm font-semibold text-slate-200 mb-1">Histogram-Based Enhancement</p>
        <p className="text-xs text-slate-400 leading-relaxed">
          A histogram shows the distribution of pixel intensities (0=black to 255=white). Equalization redistributes intensities to improve contrast. Contrast stretching linearly scales the range.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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

      {result && (
        <div className="flex flex-col gap-4">
          {result.histogram && (
            <div className="rounded-xl overflow-hidden border border-slate-700/60 bg-slate-900">
              <img src={result.histogram} alt="histogram" className="w-full" />
              <div className="px-3 py-2 bg-slate-800/50 text-xs text-slate-400">Pixel Intensity Distribution</div>
            </div>
          )}

          {result.result && mode === 'stretch' && (
            <ImageViewer original={image} processed={result.result} label="Contrast Stretched" />
          )}

          {result.result && mode === 'equalize' && (
            <>
              <ImageViewer original={image} processed={result.result} label="Equalized" />
              {result.before_histogram && result.after_histogram && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl overflow-hidden border border-slate-700/60 bg-slate-900">
                    <img src={result.before_histogram} alt="before hist" className="w-full" />
                    <div className="px-3 py-2 bg-slate-800/50 text-xs text-slate-400">Before Equalization</div>
                  </div>
                  <div className="rounded-xl overflow-hidden border border-slate-700/60 bg-slate-900">
                    <img src={result.after_histogram} alt="after hist" className="w-full" />
                    <div className="px-3 py-2 bg-slate-800/50 text-xs text-slate-400">After Equalization</div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
