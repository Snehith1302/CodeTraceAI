import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Code2, Zap, FileCode, ArrowUpRight } from 'lucide-react';

const CustomNode = memo(({ data, selected }) => {
  const { name, file, lineNumber, className, isAsync, impactState, hopDistance } = data;

  // Determine rectangular container styling based on impactState
  let containerClasses = 'bg-[#161B22] border-[#30363D] opacity-100';
  let borderStyle = 'border';

  if (impactState === 'target') {
    containerClasses = 'bg-[#161B22] border-[#8B5CF6] opacity-100';
    borderStyle = 'border-2';
  } else if (impactState === 'hop1') {
    containerClasses = 'bg-[#161B22] border-[#F59E0B] opacity-100';
    borderStyle = 'border-2';
  } else if (impactState === 'hop2+') {
    containerClasses = 'bg-[#161B22] border-[#D97706] opacity-90';
    borderStyle = 'border';
  } else if (impactState === 'dimmed') {
    containerClasses = 'bg-[#0D1117] border-[#21262D] opacity-25';
  } else if (selected) {
    containerClasses = 'bg-[#161B22] border-[#8B5CF6] opacity-100';
    borderStyle = 'border-2';
  }

  // Handle color based on state
  const handleColor =
    impactState === 'target'
      ? '!bg-[#8B5CF6]'
      : impactState === 'hop1' || impactState === 'hop2+'
      ? '!bg-[#F59E0B]'
      : '!bg-[#38BDF8]';

  return (
    <div
      className={`relative px-3 py-2 rounded ${borderStyle} transition-all cursor-pointer min-w-[220px] max-w-[280px] select-none ${containerClasses}`}
    >
      {/* Incoming Calls Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className={`w-2 h-2 !border !border-[#0D1117] ${handleColor}`}
      />

      {/* Top Header Row: File & Line / Hop Badge */}
      <div className="flex items-center justify-between text-[11px] mb-1 gap-2">
        <div className="flex items-center gap-1 truncate text-[#8B949E] font-mono">
          <FileCode className="w-3 h-3 text-[#38BDF8] shrink-0" />
          <span className="truncate">{file}</span>
          {lineNumber > 0 && <span className="text-[#6E7681]">:{lineNumber}</span>}
        </div>

        {impactState === 'target' ? (
          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[#8B5CF6] text-white font-bold tracking-wider uppercase">
            TARGET
          </span>
        ) : impactState === 'hop1' ? (
          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[#F59E0B] text-black font-bold flex items-center gap-0.5">
            <ArrowUpRight className="w-2.5 h-2.5" /> Hop 1
          </span>
        ) : impactState === 'hop2+' ? (
          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[#21262D] border border-[#F59E0B]/50 text-[#F59E0B] font-semibold">
            Hop {hopDistance}
          </span>
        ) : null}
      </div>

      {/* Function Title (Monospace) */}
      <div className="flex items-center gap-1.5">
        <Code2
          className={`w-3.5 h-3.5 shrink-0 ${
            impactState === 'hop1' || impactState === 'hop2+'
              ? 'text-[#F59E0B]'
              : impactState === 'target'
              ? 'text-[#8B5CF6]'
              : 'text-[#38BDF8]'
          }`}
        />
        <span className="font-code font-semibold text-xs text-[#F0F6FC] truncate">
          {name}
        </span>
      </div>

      {/* Class Name & Async Metadata Badges */}
      {(className || isAsync) && (
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap text-[10px] font-mono">
          {className && (
            <span className="px-1 py-0.2 rounded bg-[#0D1117] text-[#8B949E] border border-[#30363D] truncate max-w-[150px]">
              class {className}
            </span>
          )}
          {isAsync && (
            <span className="px-1 py-0.2 rounded bg-[#0D1117] text-[#F59E0B] border border-[#F59E0B]/30 flex items-center gap-0.5">
              <Zap className="w-2.5 h-2.5 fill-current" />
              async
            </span>
          )}
        </div>
      )}

      {/* Outgoing Calls Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className={`w-2 h-2 !border !border-[#0D1117] ${handleColor}`}
      />
    </div>
  );
});

CustomNode.displayName = 'CustomNode';

export default CustomNode;
