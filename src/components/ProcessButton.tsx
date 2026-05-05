import { Play, Loader } from 'lucide-react';

interface Props {
  onClick: () => void;
  loading: boolean;
  disabled?: boolean;
  label?: string;
}

export default function ProcessButton({ onClick, loading, disabled, label = 'Apply' }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all duration-150 shadow-lg shadow-blue-900/30 active:scale-95"
    >
      {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
      {loading ? 'Processing...' : label}
    </button>
  );
}
