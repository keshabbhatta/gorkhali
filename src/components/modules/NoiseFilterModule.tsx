import { useState } from 'react';
import { useProcessing } from '../../hooks/useProcessing';
import ImageViewer from '../ImageViewer';
import Slider from '../Slider';
import ProcessButton from '../ProcessButton';
import ErrorBanner from '../ErrorBanner';

interface Props { image: string }

type FilterType = 'noise-gaussian' | 'noise-salt' | 'mean' | 'median' | 'gaussian-blur';

const filters: { id: FilterType; label: string; desc: string }[] = [
  { id: 'noise-gaussian', label: 'Gaussian Noise', desc: 'Random noise with normal distribution' },
  { id: 'noise-salt', label: 'Salt & Pepper', desc: 'Random black and white pixels' },
  { id: 'mean', label: 'Mean Filter', desc: 'Averages pixel neighborhood' },
  { id: 'median', label: 'Median Filter', desc: 'Replaces with median value' },
  { id: 'gaussian-blur', label: 'Gaussian Blur', desc: 'Weighted smooth blurring' },
];

export default function NoiseFilterModule({ image }: Props) {
  const [type, setType] = useState<FilterType>('noise-gaussian');
  const [sigma, setSigma] = useState(25);
  const [amount, setAmount] = useState(0.05);
  const [kernel, setKernel] = useState(5);
  const { loading, error, result, process } = useProcessing(image);

  function apply() {
    if (type === 'noise-gaussian') {
      process('/filter/noise', { type: 'gaussian', sigma });
    } else if (type === 'noise-salt') {
      process('/filter/noise', { type: 'salt', amount });
    } else if (type === 'mean') {
      process('/filter/mean', { kernel });
    } else if (type === 'median') {
      process('/filter/median', { kernel });
    } else {
      process('/filter/gaussian', { kernel, sigma });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl">
        <p className="text-sm font-semibold text-slate-200 mb-1">Noise Addition & Filtering</p>
        <p className="text-xs text-slate-400 leading-relaxed">
          Noise corrupts images during capture or transmission. Spatial filters remove noise by considering neighboring pixels. Median filter excels at removing salt & pepper noise while preserving edges.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setType(f.id)}
            className={`p-3 rounded-xl border text-left transition-all ${type === f.id ? 'border-blue-500 bg-blue-950/40 text-blue-300' : 'border-slate-700 text-slate-300 hover:border-slate-600 hover:bg-slate-800/50'}`}
          >
            <p className="text-sm font-semibold">{f.label}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{f.desc}</p>
          </button>
        ))}
      </div>

      <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
        {type === 'noise-gaussian' && (
          <Slider label="Noise Sigma" min={5} max={100} value={sigma} onChange={setSigma} />
        )}
        {type === 'noise-salt' && (
          <Slider label="Noise Amount" min={0.01} max={0.3} step={0.01} value={amount} onChange={setAmount} />
        )}
        {(type === 'mean' || type === 'median' || type === 'gaussian-blur') && (
          <Slider label="Kernel Size" min={3} max={21} step={2} value={kernel} onChange={setKernel} unit="px" />
        )}
      </div>

      <ProcessButton onClick={apply} loading={loading} />
      {error && <ErrorBanner message={error} />}
      {result?.result && <ImageViewer original={image} processed={result.result} label={filters.find(f => f.id === type)?.label} />}
    </div>
  );
}
