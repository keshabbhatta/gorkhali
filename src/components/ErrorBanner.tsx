import { AlertCircle } from 'lucide-react';

export default function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-red-950/40 border border-red-800/50 rounded-xl text-sm text-red-300">
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}
