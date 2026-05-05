import { Layers, Palette, Sun, BarChart2, Wind, Scan, Sliders, Grid2x2 as Grid, Scissors, Target, Upload } from 'lucide-react';
import { ModuleId } from '../types';

const modules: { id: ModuleId; label: string; icon: React.ElementType; group: string }[] = [
  { id: 'upload', label: 'Upload Image', icon: Upload, group: 'Start' },
  { id: 'colorspaces', label: 'Color Spaces', icon: Palette, group: 'Fundamentals' },
  { id: 'brightness', label: 'Brightness & Contrast', icon: Sun, group: 'Fundamentals' },
  { id: 'histogram', label: 'Histogram', icon: BarChart2, group: 'Fundamentals' },
  { id: 'noise', label: 'Noise & Filtering', icon: Wind, group: 'Spatial Processing' },
  { id: 'edges', label: 'Edge Detection', icon: Scan, group: 'Spatial Processing' },
  { id: 'threshold', label: 'Thresholding', icon: Sliders, group: 'Spatial Processing' },
  { id: 'morphology', label: 'Morphology', icon: Grid, group: 'Advanced' },
  { id: 'segmentation', label: 'Segmentation', icon: Scissors, group: 'Advanced' },
  { id: 'features', label: 'Feature Extraction', icon: Target, group: 'Advanced' },
];

const groups = ['Start', 'Fundamentals', 'Spatial Processing', 'Advanced'];

interface Props {
  active: ModuleId;
  onSelect: (id: ModuleId) => void;
  hasImage: boolean;
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ active, onSelect, hasImage, collapsed, onToggle }: Props) {
  return (
    <aside
      className={`flex-shrink-0 flex flex-col bg-slate-900 border-r border-slate-700/60 transition-all duration-300 ${collapsed ? 'w-14' : 'w-56'}`}
    >
      <div className="flex items-center justify-between px-3 py-4 border-b border-slate-700/60">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold">
    <span className="text-white">GOR</span>
    <span className="text-red-500">KHALI</span>
  </span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors ml-auto"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <Layers className="w-4 h-4" />
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          )}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-2 scrollbar-thin">
        {groups.map((group) => {
          const items = modules.filter((m) => m.group === group);
          return (
            <div key={group}>
              {!collapsed && (
                <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  {group}
                </p>
              )}
              {items.map((m) => {
                const Icon = m.icon;
                const isActive = active === m.id;
                const disabled = m.id !== 'upload' && !hasImage;
                return (
                  <button
                    key={m.id}
                    onClick={() => !disabled && onSelect(m.id)}
                    disabled={disabled}
                    title={collapsed ? m.label : undefined}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2 text-sm transition-all duration-150
                      ${collapsed ? 'justify-center' : ''}
                      ${isActive ? 'bg-blue-600/20 text-blue-400 border-r-2 border-blue-500' : ''}
                      ${disabled ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-800 cursor-pointer'}
                      ${!isActive && !disabled ? 'text-slate-300' : ''}
                    `}
                  >
                    <Icon className={`flex-shrink-0 w-4 h-4 ${isActive ? 'text-blue-400' : ''}`} />
                    {!collapsed && <span className="truncate">{m.label}</span>}
                  </button>
                );
              })}
              {!collapsed && <div className="mx-3 my-1 border-t border-slate-800" />}
            </div>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="px-3 py-3 border-t border-slate-700/60">
          <div className="px-3 py-2 bg-slate-800/60 rounded-lg text-[10px] text-slate-500 leading-relaxed">
            Powered by OpenCV + NumPy
          </div>
        </div>
      )}
    </aside>
  );
}
