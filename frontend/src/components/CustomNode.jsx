import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Code2, Zap, FileCode, AlertCircle, ArrowUpRight } from 'lucide-react';

const CustomNode = memo(({ data, selected }) => {
  const { name, file, lineNumber, className, isAsync, impactState, hopDistance } = data;

  // Determine container styling based on impactState
  let containerClasses = 'bg-[#151821] border-[#2A2F3C] opacity-100';
  let glowStyle = '';
  let borderStyle = 'border';

  if (impactState === 'target') {
    containerClasses = 'bg-[#1E1B2E] border-[#7C3AED] opacity-100 shadow-[0_0_24px_rgba(124,58,237,0.6)]';
    borderStyle = 'border-2';
  } else if (impactState === 'hop1') {
    containerClasses = 'bg-[#2A2015] border-[#F59E0B] opacity-100 shadow-[0_0_20px_rgba(245,158,11,0.55)]';
    borderStyle = 'border-2';
  } else if (impactState === 'hop2+') {
    containerClasses = 'bg-[#251C15] border-[#F59E0B]/70 shadow-[0_0_14px_rgba(245,158,11,0.35)]';
    borderStyle = 'border-2';
  } else if (impactState === 'dimmed') {
    containerClasses = 'bg-[#151821]/40 border-[#262A36]/40 opacity-20 filter grayscale-[40%]';
  } else if (selected) {
    containerClasses = 'bg-[#1E1B2E] border-[#7C3AED] opacity-100 shadow-[0_0_18px_rgba(124,58,237,0.45)]';
  }

  // Dynamic opacity calculation for hop2+ distance fading
  const dynamicStyle = {};
  if (impactState === 'hop2+' && hopDistance) {
    dynamicStyle.opacity = Math.max(0.4, 0.95 - (hopDistance - 2) * 0.2);
  }

  return (
    <div
      style={dynamicStyle}
      className={`relative px-3.5 py-2.5 rounded-lg ${borderStyle} transition-all duration-300 cursor-pointer min-w-[240px] max-w-[300px] ${containerClasses}`}
    >
      {/* Top Handle for incoming calls */}
      <Handle
        type="target"
        position={Position.Top}
        className={`w-2.5 h-2.5 !border-2 !border-[#0B0D12] ${
          impactState === 'target' || impactState === 'hop1' || impactState === 'hop2+'
            ? '!bg-[#F59E0B]'
            : '!bg-[#7C3AED]'
        }`}
      />

      {/* Top Bar: File & Line / Hop Badge */}
      <div className="flex items-center justify-between text-[11px] mb-1.5 gap-2">
        <div className="flex items-center gap-1.5 truncate text-[#9CA3AF]">
          <FileCode className="w-3 h-3 text-[#22D3EE] shrink-0" />
          <span className="truncate font-mono">{file}</span>
        </div>

        {impactState === 'target' ? (
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#7C3AED] text-white font-bold tracking-wide">
            TARGET
          </span>
        ) : impactState === 'hop1' ? (
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#F59E0B] text-black font-bold flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" /> Hop 1
          </span>
        ) : impactState === 'hop2+' ? (
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#F59E0B]/20 border border-[#F59E0B]/50 text-[#F59E0B] font-bold">
            Hop {hopDistance}
          </span>
        ) : (
          lineNumber > 0 && (
            <span className="text-[10px] text-[#6B7280] font-mono shrink-0">
              L{lineNumber}
            </span>
          )
        )}
      </div>

      {/* Function Name (Monospace) */}
      <div className="flex items-center gap-2 mb-1">
        <Code2
          className={`w-4 h-4 shrink-0 ${
            impactState === 'hop1' || impactState === 'hop2+'
              ? 'text-[#F59E0B]'
              : 'text-[#7C3AED]'
          }`}
        />
        <span className="font-code font-semibold text-sm text-[#E5E7EB] truncate">
          {name}
        </span>
      </div>

      {/* Metadata Badges */}
      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
        {className && (
          <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-[#22D3EE]/10 text-[#22D3EE] border border-[#22D3EE]/20 truncate">
            {className}
          </span>
        )}
        {isAsync && (
          <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20 flex items-center gap-1">
            <Zap className="w-2.5 h-2.5 fill-current" />
            async
          </span>
        )}
      </div>

      {/* Bottom Handle for outgoing calls */}
      <Handle
        type="source"
        position={Position.Bottom}
        className={`w-2.5 h-2.5 !border-2 !border-[#0B0D12] ${
          impactState === 'target' || impactState === 'hop1' || impactState === 'hop2+'
            ? '!bg-[#F59E0B]'
            : '!bg-[#22D3EE]'
        }`}
      />
    </div>
  );
});

CustomNode.displayName = 'CustomNode';

export default CustomNode;
