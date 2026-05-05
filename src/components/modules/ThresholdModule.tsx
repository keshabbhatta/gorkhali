import { useState } from 'react';
import { useProcessing } from '../../hooks/useProcessing';
import ImageViewer from '../ImageViewer';
import Slider from '../Slider';
import ProcessButton from '../ProcessButton';
import ErrorBanner from '../ErrorBanner';

interface Props { image: string }

type Mode = 'binary' | 'adaptive' | 'otsu';

const modes: { id: Mode; label: string; desc: string }[] = [
  { id: 'binary', label: 'Binary', desc: 'Fixed threshold: pixel > T → 255' },
  { id: 'adaptive', label: 'Adaptive', desc: 'Local threshold per region' },
  { id: 'otsu', label: "Otsu's Method", desc: 'Auto-computes optimal threshold' },
];

export default function ThresholdModule({ image }: Props) {
  const [mode, setMode] = useState<Mode>('otsu');
  const [threshold, setThreshold] = useState(127);
  const [blockSize, setBlockSize] = useState(11);
  const [c, setC] = useState(2);
  const [adaptMethod, setAdaptMethod] = useState<'gaussian' | 'mean'>('gaussian');
  const { loading, error, result, process } = useProcessing(image);

  function apply() {
    if (mode === 'binary') process('/threshold/binary', { threshold });
    else if (mode === 'adaptive') process('/threshold/adaptive', { block_size: blockSize, C: c, method: adaptMethod });
    else process('/threshold/otsu');
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl">
        <p className="text-sm font-semibold text-slate-200 mb-1">Thresholding</p>
        <p className="text-xs text-slate-400 leading-relaxed">
          Thresholding converts grayscale images to binary (black/white). Binary uses a fixed cutoff. Adaptive adjusts per local region (good for uneven lighting). Otsu automatically finds the optimal threshold by minimizing intra-class variance.
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

      {mode === 'binary' && (
        <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
          <Slider label="Threshold Value" min={0} max={255} value={threshold} onChange={setThreshold} />
        </div>
      )}

      {mode === 'adaptive' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
          <Slider label="Block Size" min={3} max={51} step={2} value={blockSize} onChange={setBlockSize} unit="px" />
          <Slider label="Constant C" min={-10} max={20} value={c} onChange={setC} />
          <div className="sm:col-span-2">
            <p className="text-xs text-slate-300 font-medium mb-2">Method</p>
            <div className="flex gap-2">
              {(['gaussian', 'mean'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setAdaptMethod(m)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${adaptMethod === m ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                >
                  {m === 'gaussian' ? 'Gaussian' : 'Mean'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <ProcessButton onClick={apply} loading={loading} />
        {result?.threshold_value !== undefined && (
          <span className="text-sm text-slate-300 bg-slate-700/60 px-3 py-2 rounded-lg">
            Otsu threshold: <span className="text-yellow-400 font-mono font-bold">{result.threshold_value.toFixed(0)}</span>
          </span>
        )}
      </div>

      {error && <ErrorBanner message={error} />}
      {result?.result && <ImageViewer original={image} processed={result.result} label={modes.find(m => m.id === mode)?.label} />}
    </div>
  );
}
