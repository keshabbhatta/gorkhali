import { useState, useEffect, useRef } from 'react';
import { useProcessing } from '../../hooks/useProcessing';
import ImageViewer from '../ImageViewer';
import Slider from '../Slider';
import ProcessButton from '../ProcessButton';
import ErrorBanner from '../ErrorBanner';

interface Props { image: string }

export default function BrightnessModule({ image }: Props) {
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(1.0);
  const { loading, error, result, process } = useProcessing(image);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function apply() {
    process('/adjust/brightness-contrast', { brightness, contrast });
  }

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => apply(), 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [brightness, contrast]);

  return (
    <div className="flex flex-col gap-6">
      <div className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl">
        <p className="text-sm font-semibold text-slate-200 mb-1">Brightness & Contrast</p>
        <p className="text-xs text-slate-400 leading-relaxed">
          Brightness adds or subtracts a constant from all pixel values. Contrast scales the pixel values — values above 1.0 increase contrast, below 1.0 decrease it. Formula: <code className="bg-slate-700 px-1 rounded text-[11px]">output = α × input + β</code>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
        <Slider
          label="Brightness (β)"
          min={-100}
          max={100}
          value={brightness}
          onChange={setBrightness}
        />
        <Slider
          label="Contrast (α)"
          min={0.1}
          max={3.0}
          step={0.05}
          value={contrast}
          onChange={setContrast}
        />
      </div>

      <div className="flex items-center gap-3">
        <ProcessButton onClick={apply} loading={loading} label="Apply Now" />
        <button
          onClick={() => { setBrightness(0); setContrast(1.0); }}
          className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm rounded-xl transition-colors"
        >
          Reset
        </button>
      </div>

      {error && <ErrorBanner message={error} />}

      {result?.result && (
        <ImageViewer original={image} processed={result.result} label="Adjusted" />
      )}
    </div>
  );
}
