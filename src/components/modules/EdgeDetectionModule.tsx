import { useState } from 'react';
import { useProcessing } from '../../hooks/useProcessing';
import ImageViewer from '../ImageViewer';
import Slider from '../Slider';
import ProcessButton from '../ProcessButton';
import ErrorBanner from '../ErrorBanner';

interface Props { image: string }

type Mode = 'compare' | 'sobel' | 'laplacian' | 'canny';

const modes: { id: Mode; label: string; desc: string }[] = [
  { id: 'compare', label: 'Compare All', desc: 'Side-by-side comparison' },
  { id: 'sobel', label: 'Sobel', desc: 'Gradient-based, directional' },
  { id: 'laplacian', label: 'Laplacian', desc: 'Second derivative operator' },
  { id: 'canny', label: 'Canny', desc: 'Optimal, multi-stage detector' },
];

export default function EdgeDetectionModule({ image }: Props) {
  const [mode, setMode] = useState<Mode>('compare');
  const [t1, setT1] = useState(100);
  const [t2, setT2] = useState(200);
  const [ksize, setKsize] = useState(3);
  const { loading, error, result, process } = useProcessing(image);

  function apply() {
    if (mode === 'compare') process('/edge/compare');
    else if (mode === 'sobel') process('/edge/sobel', { ksize });
    else if (mode === 'laplacian') process('/edge/laplacian');
    else process('/edge/canny', { threshold1: t1, threshold2: t2 });
  }

  const extras = result && mode === 'compare' ? [
    { label: 'Sobel', src: result.sobel! },
    { label: 'Laplacian', src: result.laplacian! },
    { label: 'Canny', src: result.canny! },
  ] : undefined;

  return (
    <div className="flex flex-col gap-6">
      <div className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl">
        <p className="text-sm font-semibold text-slate-200 mb-1">Edge Detection</p>
        <p className="text-xs text-slate-400 leading-relaxed">
          Edges are boundaries between regions of different intensity. Sobel computes gradients in X and Y. Laplacian uses the second derivative. Canny applies hysteresis thresholding for clean, thin edges.
        </p>
      </div>

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

      {mode === 'canny' && (
        <div className="grid grid-cols-2 gap-4 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
          <Slider label="Low Threshold" min={10} max={300} value={t1} onChange={setT1} />
          <Slider label="High Threshold" min={50} max={400} value={t2} onChange={setT2} />
        </div>
      )}
      {mode === 'sobel' && (
        <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
          <Slider label="Kernel Size" min={1} max={7} step={2} value={ksize} onChange={setKsize} unit="px" />
        </div>
      )}

      <ProcessButton onClick={apply} loading={loading} />
      {error && <ErrorBanner message={error} />}

      {result && mode !== 'compare' && result.result && (
        <ImageViewer original={image} processed={result.result} label={modes.find(m => m.id === mode)?.label} />
      )}
      {result && mode === 'compare' && extras && (
        <div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <img src={image} alt="original" className="rounded-xl w-full object-contain max-h-48 bg-slate-950" />
            <div className="flex items-center justify-center text-slate-400 text-sm bg-slate-800/40 rounded-xl border border-slate-700/50 p-4 text-center">
              Select individual mode to compare with original
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {extras.map(img => (
              <div key={img.label} className="rounded-xl overflow-hidden bg-slate-900 border border-slate-700/60">
                <img src={img.src} alt={img.label} className="w-full object-contain max-h-48 bg-slate-950" />
                <div className="px-3 py-2 bg-slate-800/50 text-xs font-medium text-slate-300">{img.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
