import React, { useState, useEffect } from 'react';
import { Activity, Search, Play, FolderGit2, AlertTriangle, Layers, GitFork, RotateCcw } from 'lucide-react';
import { healthCheck } from '../utils/api';

export default function TopBar({
  onIngest,
  isIngesting,
  stats,
  warningsCount,
  searchQuery,
  onSearchChange,
  projectId,
  selectedNodeId,
  onClearSelection,
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
    if (inputPath) {
      onIngest(inputPath);
    }
  };

  return (
    <header className="h-16 bg-[#151821] border-b border-[#262A36] px-4 flex items-center justify-between gap-4 select-none shrink-0 z-20">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-lg bg-[#7C3AED]/15 border border-[#7C3AED]/40 flex items-center justify-center text-[#7C3AED] shadow-[0_0_12px_rgba(124,58,237,0.3)]">
          <Activity className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h1 className="font-bold text-base text-[#E5E7EB] tracking-tight flex items-center gap-2">
            CodeTrace <span className="text-[#22D3EE] text-xs font-mono px-1.5 py-0.5 rounded bg-[#22D3EE]/10 border border-[#22D3EE]/20">AI</span>
          </h1>
          <p className="text-[10px] text-[#9CA3AF] font-mono">X-Ray Codebase Analyzer</p>
        </div>
      </div>

      {/* Ingest Path Form */}
      <form onSubmit={handleSubmit} className="flex-1 max-w-xl flex items-center gap-2">
        <div className="relative flex-1">
          <FolderGit2 className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={inputPath}
            onChange={(e) => setInputPath(e.target.value)}
            placeholder="Enter GitHub URL (e.g. https://github.com/user/repo) or local path..."
            className="w-full h-9 pl-9 pr-3 bg-[#0B0D12] border border-[#262A36] focus:border-[#7C3AED] focus:outline-none text-xs font-mono text-[#E5E7EB] rounded-md transition-colors placeholder:text-[#6B7280]"
          />
        </div>
        <button
          type="submit"
          disabled={isIngesting || !inputPath.trim()}
          className="h-9 px-4 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:bg-[#2A2F3C] text-white text-xs font-medium rounded-md flex items-center gap-2 transition-all shadow-md hover:shadow-[0_0_12px_rgba(124,58,237,0.4)] disabled:cursor-not-allowed shrink-0"
        >
          {isIngesting ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Scanning...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Analyze</span>
            </>
          )}
        </button>

        {selectedNodeId && (
          <button
            type="button"
            onClick={onClearSelection}
            className="h-9 px-3 bg-[#1C202B] hover:bg-[#232836] border border-[#7C3AED]/40 text-[#E5E7EB] text-xs font-mono rounded-md flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
            title="Reset impact tracing view"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#7C3AED]" />
            <span>Reset View</span>
          </button>
        )}
      </form>

      {/* Search Input & Stats */}
      <div className="flex items-center gap-4 shrink-0">
        {projectId && (
          <div className="relative w-48 hidden lg:block">
            <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search function..."
              className="w-full h-8 pl-8 pr-2 bg-[#0B0D12] border border-[#262A36] focus:border-[#22D3EE] focus:outline-none text-xs font-mono text-[#E5E7EB] rounded-md transition-colors"
            />
          </div>
        )}

        {/* Stats Badges */}
        {stats && (
          <div className="hidden xl:flex items-center gap-2 text-[11px] font-mono">
            <div className="flex items-center gap-1 px-2 py-1 rounded bg-[#1C202B] border border-[#262A36] text-[#9CA3AF]">
              <Layers className="w-3 h-3 text-[#22D3EE]" />
              <span>Nodes: <strong className="text-[#E5E7EB]">{stats.total_nodes}</strong></span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded bg-[#1C202B] border border-[#262A36] text-[#9CA3AF]">
              <GitFork className="w-3 h-3 text-[#7C3AED]" />
              <span>Calls: <strong className="text-[#E5E7EB]">{stats.total_calls}</strong></span>
            </div>
            {warningsCount > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 rounded bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#F59E0B]">
                <AlertTriangle className="w-3 h-3" />
                <span>Warnings: <strong>{warningsCount}</strong></span>
              </div>
            )}
          </div>
        )}

        {/* API Health Status */}
        <div className="flex items-center gap-1.5 text-[11px] font-mono px-2 py-1 rounded bg-[#0B0D12] border border-[#262A36]">
          <span
            className={`w-2 h-2 rounded-full ${
              apiStatus === 'online'
                ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]'
            }`}
          />
          <span className="text-[#9CA3AF] capitalize">{apiStatus}</span>
        </div>
      </div>
    </header>
  );
}
