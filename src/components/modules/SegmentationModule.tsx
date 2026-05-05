import { useState } from 'react';
import { useProcessing } from '../../hooks/useProcessing';
import ImageViewer from '../ImageViewer';
import Slider from '../Slider';
import ProcessButton from '../ProcessButton';
import ErrorBanner from '../ErrorBanner';

interface Props { image: string }

type Mode = 'threshold' | 'kmeans';

const modes: { id: Mode; label: string; desc: string }[] = [
  { id: 'threshold', label: 'Threshold-Based', desc: 'Separates using Otsu binarization + color map' },
  { id: 'kmeans', label: 'K-Means Clustering', desc: 'Groups pixels into K color clusters' },
];

export default function SegmentationModule({ image }: Props) {
  const [mode, setMode] = useState<Mode>('threshold');
  const [k, setK] = useState(3);
  const { loading, error, result, process } = useProcessing(image);

  function apply() {
    if (mode === 'threshold') process('/segment/threshold');
    else process('/segment/kmeans', { k });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl">
        <p className="text-sm font-semibold text-slate-200 mb-1">Image Segmentation</p>
        <p className="text-xs text-slate-400 leading-relaxed">
          Segmentation partitions an image into meaningful regions. Threshold-based segmentation creates binary masks. K-Means groups pixels by color similarity, reducing the image to K representative colors.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
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

      {mode === 'kmeans' && (
        <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
          <Slider label="Number of Clusters (K)" min={2} max={8} value={k} onChange={setK} />
        </div>
      )}

      <ProcessButton onClick={apply} loading={loading} />
      {error && <ErrorBanner message={error} />}

      {result?.result && (
        <ImageViewer
          original={image}
          processed={result.result}
          label={mode === 'threshold' ? 'Segmented (JET colormap)' : `K-Means (K=${k})`}
          extraImages={result.mask ? [{ label: 'Binary Mask', src: result.mask }] : undefined}
        />
      )}
    </div>
  );
}
