import { useRef, useState, DragEvent } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { uploadImage } from '../utils/api';

interface Props {
  onImageLoaded: (dataUrl: string, width: number, height: number) => void;
}

export default function ImageUpload({ onImageLoaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    if (!file.type.match(/image\/(jpeg|png|webp|bmp)/)) {
      setError('Please upload a JPG, PNG, WebP, or BMP image.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await uploadImage(file);
      onImageLoaded(data.image, data.width, data.height);
    } catch {
      setError('Upload failed. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[420px] p-8">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`
          relative w-full max-w-lg border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200
          ${dragging ? 'border-blue-400 bg-blue-950/30 scale-[1.02]' : 'border-slate-600 hover:border-blue-500 hover:bg-slate-800/50'}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/bmp"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        <div className="flex flex-col items-center gap-4">
          <div className={`p-4 rounded-full transition-colors ${dragging ? 'bg-blue-500/20' : 'bg-slate-700/50'}`}>
            {loading ? (
              <div className="w-10 h-10 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className={`w-10 h-10 ${dragging ? 'text-blue-400' : 'text-slate-400'}`} />
            )}
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-200">
              {loading ? 'Uploading...' : 'Drop an image here'}
            </p>
            <p className="text-sm text-slate-400 mt-1">or click to browse — JPG, PNG, WebP, BMP</p>
          </div>
        </div>
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-400 bg-red-950/30 border border-red-800/50 px-4 py-2 rounded-lg">{error}</p>
      )}

      <div className="mt-8 grid grid-cols-3 gap-3 w-full max-w-lg">
        {[
          'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?w=400',
          'https://images.pexels.com/photos/1629236/pexels-photo-1629236.jpeg?w=400',
          'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?w=400',
        ].map((url, i) => (
          <button
            key={i}
            onClick={async () => {
              setLoading(true);
              setError(null);
              try {
                const res = await fetch(url);
                const blob = await res.blob();
                const file = new File([blob], `sample${i}.jpg`, { type: 'image/jpeg' });
                await handleFile(file);
              } catch {
                setError('Could not load sample image.');
                setLoading(false);
              }
            }}
            className="group relative overflow-hidden rounded-xl aspect-video bg-slate-700 hover:ring-2 hover:ring-blue-500 transition-all"
          >
            <img src={url} alt={`Sample ${i+1}`} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
              <ImageIcon className="w-5 h-5 text-white" />
            </div>
          </button>
        ))}
      </div>
      <p className="text-xs text-slate-500 mt-3">Or try a sample image above</p>
    </div>
  );
}
