import React, { useState, useEffect, useRef } from 'react';
import { Search, Play, RotateCcw, Terminal, FolderGit2 } from 'lucide-react';
import { healthCheck } from '../utils/api';

export default function TopBar({
  onIngest,
  isIngesting,
  stats,
  searchQuery,
  onSearchChange,
  projectId,
  projectPath,
  selectedNodeId,
  onClearSelection,
  searchInputRef,
}) {
  const [inputPath, setInputPath] = useState('');
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    healthCheck()
      .then(() => setApiStatus('online'))
      .catch(() => setApiStatus('offline'));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputPath && inputPath.trim()) {
      onIngest(inputPath.trim());
    }
  };

  return (
    <header className="h-11 bg-[#161B22] border-b border-[#30363D] px-3 flex items-center justify-between gap-3 select-none shrink-0 z-20 text-xs">
      {/* Left: Product Brand & Project Context */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2 font-mono font-semibold tracking-tight">
          <Terminal className="w-4 h-4 text-[#8B5CF6]" />
          <span className="text-[#F0F6FC]">CodeTrace</span>
          <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/20 font-medium">
            AI
          </span>
        </div>

        {projectPath && (
          <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#0D1117] border border-[#30363D] text-[11px] font-mono text-[#8B949E] max-w-[220px] truncate">
            <FolderGit2 className="w-3.5 h-3.5 text-[#6E7681] shrink-0" />
            <span className="truncate text-[#C9D1D9]">{projectPath}</span>
          </div>
        )}
      </div>

      {/* Middle: Path / URL Ingest Form */}
      <form onSubmit={handleSubmit} className="flex-1 max-w-xl flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={inputPath}
            onChange={(e) => setInputPath(e.target.value)}
            placeholder="Repository URL or local path (e.g. https://github.com/... or C:\path...)"
            className="w-full h-7 pl-3 pr-3 bg-[#0D1117] border border-[#30363D] focus:border-[#8B5CF6] focus:outline-none text-xs font-mono text-[#F0F6FC] rounded transition-colors placeholder:text-[#6E7681]"
          />
        </div>
        <button
          type="submit"
          disabled={isIngesting || !inputPath.trim()}
          className="h-7 px-3 bg-[#21262D] hover:bg-[#30363D] border border-[#30363D] text-[#F0F6FC] font-medium rounded flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          {isIngesting ? (
            <>
              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Play className="w-3 h-3 text-[#38BDF8]" />
              <span>Analyze</span>
            </>
          )}
        </button>
      </form>

      {/* Right: Symbol Search & Reset & Status */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Symbol Search Input */}
        {projectId && (
          <div className="relative w-44 hidden sm:block">
            <Search className="w-3 h-3 text-[#6E7681] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search symbol [/]"
              className="w-full h-7 pl-7 pr-7 bg-[#0D1117] border border-[#30363D] focus:border-[#38BDF8] focus:outline-none text-xs font-mono text-[#F0F6FC] rounded transition-colors placeholder:text-[#6E7681]"
            />
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-mono text-[#6E7681] bg-[#21262D] px-1 py-0.2 rounded border border-[#30363D] pointer-events-none">
              /
            </kbd>
          </div>
        )}

        {/* Reset View Action */}
        {selectedNodeId && (
          <button
            type="button"
            onClick={onClearSelection}
            className="h-7 px-2.5 bg-[#21262D] hover:bg-[#30363D] border border-[#30363D] text-[#C9D1D9] text-xs font-mono rounded flex items-center gap-1 transition-colors shrink-0"
            title="Reset selection [Esc]"
          >
            <RotateCcw className="w-3 h-3 text-[#8B5CF6]" />
            <span>Reset</span>
          </button>
        )}

        {/* Backend Health Status */}
        <div className="flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 rounded bg-[#0D1117] border border-[#30363D] text-[#8B949E]">
          <span
            className={`w-2 h-2 rounded-full ${
              apiStatus === 'online' ? 'bg-[#10B981]' : 'bg-[#F85149]'
            }`}
          />
          <span className="capitalize">{apiStatus}</span>
        </div>
      </div>
    </header>
  );
}
