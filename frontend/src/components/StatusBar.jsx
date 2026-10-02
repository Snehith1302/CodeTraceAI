import React from 'react';
import { Layers, GitFork, AlertTriangle, Terminal } from 'lucide-react';

export default function StatusBar({
  projectPath,
  stats,
  warningsCount,
  selectedNode,
}) {
  return (
    <footer className="h-6 bg-[#161B22] border-t border-[#30363D] px-3 flex items-center justify-between text-[11px] font-mono text-[#8B949E] select-none shrink-0 z-20">
      {/* Left: Project Workspace Context */}
      <div className="flex items-center gap-3 shrink-0 truncate">
        <div className="flex items-center gap-1 text-[#C9D1D9] truncate">
          <Terminal className="w-3 h-3 text-[#38BDF8] shrink-0" />
          <span className="truncate">
            {projectPath ? `workspace: ${projectPath}` : 'No active workspace'}
          </span>
        </div>

        {warningsCount > 0 && (
          <div className="flex items-center gap-1 text-[#F59E0B] px-1.5 py-0.2 rounded bg-[#F59E0B]/10 border border-[#F59E0B]/20">
            <AlertTriangle className="w-3 h-3" />
            <span>{warningsCount} syntax warning(s)</span>
          </div>
        )}
      </div>

      {/* Middle: Selection & Stats */}
      <div className="hidden md:flex items-center gap-4 text-[#8B949E]">
        {selectedNode ? (
          <div className="text-[#38BDF8] flex items-center gap-1 truncate">
            <span>Selected:</span>
            <strong className="text-[#F0F6FC] font-code">{selectedNode.name}</strong>
            <span className="text-[#6E7681]">({selectedNode.file})</span>
          </div>
        ) : (
          <span className="text-[#6E7681]">No symbol selected</span>
        )}

        {stats && (
          <div className="flex items-center gap-3 border-l border-[#30363D] pl-3">
            <span className="flex items-center gap-1">
              <Layers className="w-3 h-3 text-[#38BDF8]" />
              <span>Nodes: <strong className="text-[#F0F6FC]">{stats.total_nodes}</strong></span>
            </span>
            <span className="flex items-center gap-1">
              <GitFork className="w-3 h-3 text-[#8B5CF6]" />
              <span>Calls: <strong className="text-[#F0F6FC]">{stats.total_calls}</strong></span>
            </span>
          </div>
        )}
      </div>

      {/* Right: Keyboard Shortcuts Hint */}
      <div className="flex items-center gap-3 shrink-0 text-[#6E7681]">
        <span className="hidden sm:inline">
          <kbd className="text-[#8B949E] bg-[#21262D] px-1 py-0.2 rounded border border-[#30363D]">
            /
          </kbd>{' '}
          Search
        </span>
        <span className="hidden sm:inline">
          <kbd className="text-[#8B949E] bg-[#21262D] px-1 py-0.2 rounded border border-[#30363D]">
            Esc
          </kbd>{' '}
          Clear View
        </span>
      </div>
    </footer>
  );
}
