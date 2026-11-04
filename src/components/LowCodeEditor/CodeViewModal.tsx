import React, { useState } from 'react';
import { Check, Copy, Download, FileJson, Upload, X } from 'lucide-react';
import { PuzzleLevel } from '../../types/puzzle';
import { exportLevelToJson, importLevelFromJson } from '../../services/storage';

interface CodeViewModalProps {
  level: PuzzleLevel;
  onImportLevel: (level: PuzzleLevel) => void;
  onClose: () => void;
}

export const CodeViewModal: React.FC<CodeViewModalProps> = ({
  level,
  onImportLevel,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [importText, setImportText] = useState('');
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const jsonString = exportLevelToJson(level);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${level.title.toLowerCase().replace(/\s+/g, '_')}_puzzle.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDoImport = () => {
    setErrorMsg(null);
    const imported = importLevelFromJson(importText);
    if (imported) {
      onImportLevel(imported);
      onClose();
    } else {
      setErrorMsg('Invalid Puzzle JSON format! Please check the structure.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FileJson className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Low-Code Puzzle JSON Engine</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 my-3">
          <button
            onClick={() => setActiveTab('export')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'export'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Export JSON Spec
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'import'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Import Custom Level
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'export' ? (
          <div className="flex-1 flex flex-col gap-3 overflow-hidden">
            <div className="relative flex-1 rounded-xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-indigo-300 overflow-y-auto select-text">
              <pre>{jsonString}</pre>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy JSON'}</span>
              </button>

              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow transition"
              >
                <Download className="w-4 h-4" />
                <span>Download .json File</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-3">
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Paste custom puzzle JSON content here..."
              className="w-full flex-1 rounded-xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none min-h-[220px]"
            />

            {errorMsg && <p className="text-xs text-red-400 font-semibold">{errorMsg}</p>}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={handleDoImport}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition"
              >
                <Upload className="w-4 h-4" />
                <span>Import & Load Level</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
