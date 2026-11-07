import { useState, useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

export function ProjectProgressSlider({ initialValue, onSave, onCancel }) {
  const [value, setValue] = useState(initialValue);

  return (
    <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm animate-in fade-in zoom-in duration-200">
      <input
        type="number"
        min="0"
        max="100"
        className="w-12 h-6 text-xs border border-gray-200 rounded text-center focus:ring-1 focus:ring-blue-500 outline-none"
        value={value}
        onChange={(e) => {
          const val = Math.min(100, Math.max(0, Number(e.target.value)));
          setValue(val);
        }}
      />
      <input
        type="range"
        min="0"
        max="100"
        className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
      />
      <div className="flex gap-1">
        <button
          onClick={() => onSave(value)}
          className="bg-green-100 text-green-700 p-1 rounded hover:bg-green-200 transition-colors"
          title="Save"
        >
          <CheckCircle size={14} />
        </button>
        <button
          onClick={onCancel}
          className="bg-red-100 text-red-700 p-1 rounded hover:bg-red-200 transition-colors"
          title="Cancel"
        >
          <XCircle size={14} />
        </button>
      </div>
    </div>
  );
}
