import { useState } from 'react';
import { useProcessing } from '../../hooks/useProcessing';
import ImageViewer from '../ImageViewer';
import ProcessButton from '../ProcessButton';
import ErrorBanner from '../ErrorBanner';

interface Props { image: string }

type Mode = 'contours' | 'shapes' | 'bounding-boxes';

const modes: { id: Mode; label: string; desc: string }[] = [
  { id: 'contours', label: 'Contour Detection', desc: 'Find and outline object boundaries' },
  { id: 'shapes', label: 'Shape Recognition', desc: 'Classify circles, rectangles, polygons' },
  { id: 'bounding-boxes', label: 'Bounding Boxes', desc: 'Enclose detected objects in boxes' },
];

export default function FeaturesModule({ image }: Props) {
  const [mode, setMode] = useState<Mode>('contours');
  const { loading, error, result, process } = useProcessing(image);

  function apply() {
    process(`/features/${mode}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl">
        <p className="text-sm font-semibold text-slate-200 mb-1">Feature Extraction & Object Detection</p>
        <p className="text-xs text-slate-400 leading-relaxed">
          Contours are curves joining all continuous points with the same color/intensity. Shape detection approximates contour polygons to identify geometric primitives. Bounding boxes wrap detected objects.
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

      {result?.result && (
        <div className="flex flex-col gap-4">
          <ImageViewer original={image} processed={result.result} label={modes.find(m => m.id === mode)?.label} />

          {mode === 'contours' && result.count !== undefined && (
            <div className="flex items-center gap-2 px-4 py-3 bg-emerald-950/30 border border-emerald-800/40 rounded-xl">
              <span className="text-3xl font-bold text-emerald-400 tabular-nums">{result.count}</span>
              <span className="text-sm text-slate-300">contours detected</span>
            </div>
          )}

          {mode === 'bounding-boxes' && result.count !== undefined && (
            <div className="flex items-center gap-2 px-4 py-3 bg-sky-950/30 border border-sky-800/40 rounded-xl">
              <span className="text-3xl font-bold text-sky-400 tabular-nums">{result.count}</span>
              <span className="text-sm text-slate-300">objects found</span>
            </div>
          )}

          {mode === 'shapes' && result.shapes && result.shapes.length > 0 && (
            <div className="rounded-xl border border-slate-700/60 overflow-hidden">
              <div className="px-4 py-2 bg-slate-800/80 text-xs font-semibold text-slate-300 border-b border-slate-700/60">
                Detected Shapes ({result.shapes.length})
              </div>
              <div className="divide-y divide-slate-700/40 max-h-48 overflow-y-auto">
                {result.shapes.map((s, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-2 text-xs hover:bg-slate-800/30">
                    <span className="text-slate-200 font-medium">{s.shape}</span>
                    <span className="text-slate-400 font-mono">
                      {s.x},{s.y} — {s.w}×{s.h} — {s.area.toLocaleString()}px²
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
