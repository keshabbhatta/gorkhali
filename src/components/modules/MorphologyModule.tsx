import { useState } from 'react';
import { useProcessing } from '../../hooks/useProcessing';
import ImageViewer from '../ImageViewer';
import Slider from '../Slider';
import ProcessButton from '../ProcessButton';
import ErrorBanner from '../ErrorBanner';

interface Props { image: string }

type Op = 'erosion' | 'dilation' | 'opening' | 'closing';
type Shape = 'rect' | 'ellipse' | 'cross';

const ops: { id: Op; label: string; desc: string; effect: string }[] = [
  { id: 'erosion', label: 'Erosion', desc: 'Shrinks bright regions, removes noise', effect: 'Removes small objects' },
  { id: 'dilation', label: 'Dilation', desc: 'Expands bright regions, fills gaps', effect: 'Fills holes' },
  { id: 'opening', label: 'Opening', desc: 'Erosion → Dilation (removes small objects)', effect: 'Smooths contours' },
  { id: 'closing', label: 'Closing', desc: 'Dilation → Erosion (closes small holes)', effect: 'Fills small gaps' },
];

export default function MorphologyModule({ image }: Props) {
  const [op, setOp] = useState<Op>('erosion');
  const [kernel, setKernel] = useState(5);
  const [shape, setShape] = useState<Shape>('rect');
  const { loading, error, result, process } = useProcessing(image);

  function apply() {
    process(`/morphology/${op}`, { kernel, shape });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl">
        <p className="text-sm font-semibold text-slate-200 mb-1">Morphological Processing</p>
        <p className="text-xs text-slate-400 leading-relaxed">
          Morphological operations process image structure using a structuring element (kernel). They work on binary or grayscale images and are fundamental for shape analysis, noise removal, and feature extraction.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {ops.map((o) => (
          <button
            key={o.id}
            onClick={() => setOp(o.id)}
            className={`p-3 rounded-xl border text-left transition-all ${op === o.id ? 'border-blue-500 bg-blue-950/40 text-blue-300' : 'border-slate-700 text-slate-300 hover:border-slate-600 hover:bg-slate-800/50'}`}
          >
            <p className="text-sm font-semibold">{o.label}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{o.desc}</p>
            <p className="text-[11px] text-emerald-500 mt-0.5">→ {o.effect}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
        <Slider label="Kernel Size" min={3} max={21} step={2} value={kernel} onChange={setKernel} unit="px" />
        <div>
          <p className="text-xs text-slate-300 font-medium mb-2">Kernel Shape</p>
          <div className="flex gap-2">
            {(['rect', 'ellipse', 'cross'] as Shape[]).map((s) => (
              <button
                key={s}
                onClick={() => setShape(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${shape === s ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ProcessButton onClick={apply} loading={loading} />
      {error && <ErrorBanner message={error} />}
      {result?.result && <ImageViewer original={image} processed={result.result} label={ops.find(o => o.id === op)?.label} />}
    </div>
  );
}
