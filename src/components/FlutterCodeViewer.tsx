import React, { useState } from 'react';
import { FLUTTER_CODEBASE, FlutterFile } from '../data/flutterSourceCode';
import {
  Code,
  Copy,
  Check,
  FileCode,
  Download,
  FolderTree,
  Terminal,
  Cpu,
  Smartphone,
  Monitor,
} from 'lucide-react';

export const FlutterCodeViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<FlutterFile>(FLUTTER_CODEBASE[1]); // account.dart default
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([selectedFile.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadAllZip = () => {
    // Generates a bundled JSON or text archive of all Flutter files
    const bundle = FLUTTER_CODEBASE.map(
      (f) => `// ==========================================\n// FILE: ${f.path}\n// ==========================================\n\n${f.code}\n`
    ).join('\n\n');

    const blob = new Blob([bundle], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mbudget_flutter_project_bundle.dart.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Architecture Banner */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Code size={18} />
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Flutter & Dart Clean Architecture Codebase
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1.5 max-w-2xl leading-relaxed">
              Production-ready cross-platform codebase supporting Android, iOS, macOS, Windows,
              and Linux. Features SQLite FFI, Provider state management, fl_chart visualizations,
              and Google Drive OAuth 2.0 sync.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadAllZip}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-semibold transition-colors shadow-sm"
            >
              <Download size={14} />
              <span>Download Project Bundle</span>
            </button>
          </div>
        </div>

        {/* Supported Platforms Strip */}
        <div className="flex flex-wrap items-center gap-3 pt-4 mt-4 border-t border-slate-800/80 text-xs text-slate-400">
          <span className="text-slate-500">Target Platforms:</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-slate-300">
            <Smartphone size={13} className="text-emerald-400" /> Android / iOS
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-slate-300">
            <Monitor size={13} className="text-blue-400" /> macOS / Windows / Linux (Desktop FFI)
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-slate-300">
            <Cpu size={13} className="text-purple-400" /> Provider + SQLite + fl_chart
          </span>
        </div>
      </div>

      {/* Code Browser Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: File Tree Navigator */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 pb-2 border-b border-slate-800">
            <FolderTree size={15} className="text-emerald-400" />
            <span>Project Explorer</span>
          </div>

          <div className="space-y-1">
            {FLUTTER_CODEBASE.map((file) => {
              const isSelected = selectedFile.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-xl text-xs transition-colors ${
                    isSelected
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-medium'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileCode size={14} className={isSelected ? 'text-emerald-400' : 'text-slate-500'} />
                    <span className="font-mono truncate">{file.filename}</span>
                  </div>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-500">
                    {file.category}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Code Editor & Viewer */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
          {/* File Header */}
          <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold text-white tracking-wide">
                {selectedFile.path}
              </span>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                {selectedFile.description}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadFile}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium transition-colors"
                title="Download this file"
              >
                <Download size={13} />
                <span className="hidden sm:inline">Download</span>
              </button>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-xs font-medium transition-colors"
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Code Body with Line Numbers */}
          <div className="p-4 overflow-x-auto bg-[#080d1a] font-mono text-xs leading-relaxed text-slate-200 flex-1 max-h-[600px] overflow-y-auto">
            <table className="w-full border-collapse">
              <tbody>
                {selectedFile.code.split('\n').map((line, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40">
                    <td className="w-10 select-none text-right pr-4 text-slate-600 font-mono text-[11px] align-top">
                      {idx + 1}
                    </td>
                    <td className="whitespace-pre text-slate-300 font-mono text-[12px]">{line}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
