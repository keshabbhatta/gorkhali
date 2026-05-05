import { Download, RefreshCw, ZoomIn } from 'lucide-react';
import { useState } from 'react';

interface Props {
  original: string;
  processed?: string;
  label?: string;
  extraImages?: { label: string; src: string }[];
}

export default function ImageViewer({ original, processed, label = 'Processed', extraImages }: Props) {
  const [zoom, setZoom] = useState<string | null>(null);
  const [split, setSplit] = useState(50);
  const [mode, setMode] = useState<'sidebyside' | 'split' | 'overlay'>('sidebyside');

  function downloadImage(src: string, name: string) {
    const a = document.createElement('a');
    a.href = src;
    a.download = name;
    a.click();
  }

  const showSplit = processed && mode !== 'sidebyside';

  return (
    <div className="flex flex-col gap-4">
      {processed && (
        <div className="flex items-center gap-2 flex-wrap">
          {(['sidebyside', 'split', 'overlay'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${mode === m ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
            >
              {m === 'sidebyside' ? 'Side by Side' : m === 'split' ? 'Slider Split' : 'Toggle'}
            </button>
          ))}
        </div>
      )}

      {mode === 'sidebyside' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ImagePanel
            src={original}
            label="Original"
            onZoom={() => setZoom(original)}
            onDownload={() => downloadImage(original, 'original.png')}
          />
          {processed && (
            <ImagePanel
              src={processed}
              label={label}
              onZoom={() => setZoom(processed)}
              onDownload={() => downloadImage(processed, 'processed.png')}
            />
          )}
        </div>
      )}

      {mode === 'split' && processed && (
        <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-700">
          <div className="relative select-none">
            <img src={processed} alt="processed" className="w-full block" />
            <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}>
              <img src={original} alt="original" className="w-full block" />
            </div>
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg cursor-col-resize"
              style={{ left: `${split}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                <RefreshCw className="w-4 h-4 text-slate-800" />
              </div>
            </div>
            <input
              type="range" min={0} max={100} value={split}
              onChange={(e) => setSplit(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-col-resize"
            />
          </div>
          <div className="flex justify-between px-4 py-2 bg-slate-800/80 text-xs text-slate-400">
            <span>Original</span>
            <span>{label}</span>
          </div>
        </div>
      )}

      {mode === 'overlay' && processed && (
        <OverlayToggle original={original} processed={processed} label={label} />
      )}

      {extraImages && extraImages.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
          {extraImages.map((img) => (
            <ImagePanel
              key={img.label}
              src={img.src}
              label={img.label}
              onZoom={() => setZoom(img.src)}
              onDownload={() => downloadImage(img.src, `${img.label.toLowerCase()}.png`)}
            />
          ))}
        </div>
      )}

      {zoom && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setZoom(null)}
        >
          <img src={zoom} alt="zoom" className="max-w-full max-h-full rounded-xl shadow-2xl" />
        </div>
      )}
    </div>
  );
}

function ImagePanel({ src, label, onZoom, onDownload }: {
  src: string; label: string; onZoom: () => void; onDownload: () => void;
}) {
  return (
    <div className="rounded-xl overflow-hidden bg-slate-900 border border-slate-700/60 group">
      <div className="relative">
        <img src={src} alt={label} className="w-full object-contain max-h-72 bg-slate-950" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
          <button onClick={onZoom} className="p-2 bg-slate-800/80 rounded-lg hover:bg-slate-700 transition-colors">
            <ZoomIn className="w-4 h-4 text-white" />
          </button>
          <button onClick={onDownload} className="p-2 bg-slate-800/80 rounded-lg hover:bg-slate-700 transition-colors">
            <Download className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
      <div className="px-3 py-2 bg-slate-800/50">
        <span className="text-xs font-medium text-slate-300">{label}</span>
      </div>
    </div>
  );
}

function OverlayToggle({ original, processed, label }: { original: string; processed: string; label: string }) {
  const [show, setShow] = useState<'original' | 'processed'>('original');
  return (
    <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-900">
      <img
        src={show === 'original' ? original : processed}
        alt={show}
        className="w-full object-contain max-h-72 transition-all duration-200 bg-slate-950"
      />
      <div className="flex border-t border-slate-700">
        {(['original', 'processed'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setShow(s)}
            className={`flex-1 py-2 text-xs font-medium transition-colors ${show === s ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
          >
            {s === 'original' ? 'Original' : label}
          </button>
        ))}
      </div>
    </div>
  );
}
