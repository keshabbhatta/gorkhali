import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Image as ImageIcon } from 'lucide-react';
import Sidebar from './components/Sidebar';
import ImageUpload from './components/ImageUpload';
import ColorSpacesModule from './components/modules/ColorSpacesModule';
import BrightnessModule from './components/modules/BrightnessModule';
import HistogramModule from './components/modules/HistogramModule';
import NoiseFilterModule from './components/modules/NoiseFilterModule';
import EdgeDetectionModule from './components/modules/EdgeDetectionModule';
import ThresholdModule from './components/modules/ThresholdModule';
import MorphologyModule from './components/modules/MorphologyModule';
import SegmentationModule from './components/modules/SegmentationModule';
import FeaturesModule from './components/modules/FeaturesModule';
import { ModuleId } from './types';
import { checkHealth } from './utils/api';

const MODULE_INFO: Record<Exclude<ModuleId, 'upload'>, { title: string; subtitle: string }> = {
  colorspaces: { title: 'Color Spaces', subtitle: 'Convert between RGB, Grayscale, HSV and explore channel separation' },
  brightness: { title: 'Brightness & Contrast', subtitle: 'Adjust pixel intensity with real-time slider control' },
  histogram: { title: 'Histogram Enhancement', subtitle: 'Visualize and improve pixel intensity distribution' },
  noise: { title: 'Noise & Spatial Filtering', subtitle: 'Add noise and apply mean, median, Gaussian filters' },
  edges: { title: 'Edge Detection', subtitle: 'Compare Sobel, Laplacian, and Canny edge detectors' },
  threshold: { title: 'Thresholding', subtitle: 'Binary, adaptive, and automatic Otsu thresholding' },
  morphology: { title: 'Morphological Processing', subtitle: 'Erosion, dilation, opening, and closing operations' },
  segmentation: { title: 'Image Segmentation', subtitle: 'Partition images into meaningful regions' },
  features: { title: 'Feature Extraction', subtitle: 'Detect contours, shapes, and bounding boxes' },
};

type BackendStatus = 'checking' | 'online' | 'offline';

export default function App() {
  const [activeModule, setActiveModule] = useState<ModuleId>('upload');
  const [image, setImage] = useState<string | null>(null);
  const [imgDims, setImgDims] = useState<{ w: number; h: number } | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [backendStatus, setBackendStatus] = useState<BackendStatus>('checking');

  useEffect(() => {
    checkHealth().then((ok) => setBackendStatus(ok ? 'online' : 'offline'));
    const interval = setInterval(() => {
      checkHealth().then((ok) => setBackendStatus(ok ? 'online' : 'offline'));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  function handleImageLoaded(dataUrl: string, w: number, h: number) {
    setImage(dataUrl);
    setImgDims({ w, h });
    setActiveModule('colorspaces');
  }

  const moduleInfo = activeModule !== 'upload' ? MODULE_INFO[activeModule] : null;

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden font-sans">
      <Sidebar
        active={activeModule}
        onSelect={setActiveModule}
        hasImage={!!image}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((v) => !v)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-6 py-3 border-b border-slate-700/60 bg-slate-900/80 backdrop-blur-sm flex-shrink-0">
          <div>
            {moduleInfo ? (
              <>
                <h1 className="text-lg font-bold text-white leading-none">{moduleInfo.title}</h1>
                <p className="text-xs text-slate-400 mt-0.5">{moduleInfo.subtitle}</p>
              </>
            ) : (
              <>
                <h1 className="text-lg font-bold text-white leading-none">OpenCV Image Processing Lab</h1>
                <p className="text-xs text-slate-400 mt-0.5">Interactive educational platform for computer vision</p>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            {image && imgDims && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-800/60 rounded-lg border border-slate-700/50">
                <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-slate-300 font-mono">{imgDims.w} × {imgDims.h}</span>
              </div>
            )}
            {image && (
              <button
                onClick={() => { setImage(null); setImgDims(null); setActiveModule('upload'); }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs rounded-lg transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" />
                New Image
              </button>
            )}
            <BackendBadge status={backendStatus} />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto p-6">
            {backendStatus === 'offline' && (
              <div className="mb-6 flex items-start gap-3 px-5 py-4 bg-amber-950/40 border border-amber-700/50 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-300">Backend Not Connected</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Start the Python backend:{' '}
                    <code className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-300">cd backend && ./start.sh</code>
                    {' '}or{' '}
                    <code className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-300">uvicorn main:app --port 8000</code>
                  </p>
                </div>
              </div>
            )}

            {activeModule === 'upload' && (
              <ImageUpload onImageLoaded={handleImageLoaded} />
            )}
            {activeModule !== 'upload' && !image && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="p-5 bg-slate-800/50 rounded-full mb-4">
                  <ImageIcon className="w-10 h-10 text-slate-500" />
                </div>
                <p className="text-slate-300 font-medium">No image loaded</p>
                <p className="text-slate-500 text-sm mt-1">Upload an image first to use this module</p>
                <button
                  onClick={() => setActiveModule('upload')}
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-xl transition-colors"
                >
                  Go to Upload
                </button>
              </div>
            )}
            {image && activeModule === 'colorspaces' && <ColorSpacesModule image={image} />}
            {image && activeModule === 'brightness' && <BrightnessModule image={image} />}
            {image && activeModule === 'histogram' && <HistogramModule image={image} />}
            {image && activeModule === 'noise' && <NoiseFilterModule image={image} />}
            {image && activeModule === 'edges' && <EdgeDetectionModule image={image} />}
            {image && activeModule === 'threshold' && <ThresholdModule image={image} />}
            {image && activeModule === 'morphology' && <MorphologyModule image={image} />}
            {image && activeModule === 'segmentation' && <SegmentationModule image={image} />}
            {image && activeModule === 'features' && <FeaturesModule image={image} />}
          </div>
        </main>
      </div>
    </div>
  );
}

function BackendBadge({ status }: { status: BackendStatus }) {
  if (status === 'checking') {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-700/60 rounded-lg text-xs text-slate-400">
        <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />
        Checking
      </div>
    );
  }
  if (status === 'online') {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-950/40 border border-emerald-800/40 rounded-lg text-xs text-emerald-400">
        <CheckCircle className="w-3.5 h-3.5" />
        Backend Online
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-red-950/30 border border-red-800/40 rounded-lg text-xs text-red-400">
      <XCircle className="w-3.5 h-3.5" />
      Backend Offline
    </div>
  );
}
