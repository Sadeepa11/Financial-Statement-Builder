import React from 'react';

const STEPS = [
  { label: 'Upload Data', icon: '📁' },
  { label: 'Map Accounts', icon: '🗂️' },
  { label: 'Statements', icon: '📊' },
  { label: 'Notes', icon: '📝' },
  { label: 'Export', icon: '📤' },
];

interface Props { current: number; onClick: (i: number) => void; }

export default function Stepper({ current, onClick }: Props) {
  return (
    <div className="flex items-center justify-center py-6 px-4 bg-white border-b border-slate-200">
      {STEPS.map((step, i) => (
        <React.Fragment key={i}>
          <button
            onClick={() => onClick(i)}
            className={`flex flex-col items-center gap-1 px-3 cursor-pointer transition-all ${
              i === current
                ? 'opacity-100'
                : i < current
                ? 'opacity-70 hover:opacity-90'
                : 'opacity-40 cursor-not-allowed'
            }`}
            disabled={i > current}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold border-2 transition-all ${
                i < current
                  ? 'bg-green-500 border-green-500 text-white'
                  : i === current
                  ? 'bg-blue-700 border-blue-700 text-white'
                  : 'bg-white border-slate-300 text-slate-400'
              }`}
            >
              {i < current ? '✓' : step.icon}
            </div>
            <span
              className={`text-xs font-medium whitespace-nowrap ${
                i === current ? 'text-blue-700' : i < current ? 'text-green-600' : 'text-slate-400'
              }`}
            >
              {step.label}
            </span>
          </button>
          {i < STEPS.length - 1 && (
            <div
              className={`flex-1 h-0.5 mx-1 transition-all ${i < current ? 'bg-green-400' : 'bg-slate-200'}`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
