import React from 'react';
import {
  X,
  Code2,
  FileCode,
  Zap,
  Layers,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export default function NodeDetailPanel({
  node,
  impactData,
  isImpactLoading,
  impactError,
  onClose,
  onSelectNode,
}) {
  if (!node) {
    return (
      <aside className="w-80 bg-[#151821] border-l border-[#262A36] p-4 flex flex-col items-center justify-center text-center select-none z-10 shrink-0">
        <div className="w-12 h-12 rounded-full bg-[#1C202B] border border-[#262A36] flex items-center justify-center text-[#9CA3AF] mb-3 shadow-[0_0_12px_rgba(0,0,0,0.3)]">
          <Code2 className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-medium text-[#E5E7EB] mb-1">No Function Selected</h3>
        <p className="text-xs text-[#9CA3AF] leading-relaxed">
          Click any function node in the graph or select from the left sidebar to inspect details and trace its blast radius.
        </p>
      </aside>
    );
  }

  const directCount = impactData?.dependents
    ? impactData.dependents.filter((d) => d.hop_distance === 1).length
    : 0;
  const totalCount = impactData?.total_dependents || 0;

  return (
    <aside className="w-80 bg-[#151821] border-l border-[#262A36] flex flex-col select-none z-10 shrink-0 h-full overflow-hidden">
      {/* Panel Header */}
      <div className="h-12 px-4 border-b border-[#262A36] flex items-center justify-between shrink-0 bg-[#151821]">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#E5E7EB]">
          <Layers className="w-4 h-4 text-[#7C3AED]" />
          <span>Impact Inspector</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onClose}
            title="Clear Selection / Reset View"
            className="p-1 text-[#9CA3AF] hover:text-white rounded hover:bg-[#232836] transition-colors flex items-center gap-1 text-[11px] font-mono"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
          <button
            onClick={onClose}
            className="p-1 text-[#9CA3AF] hover:text-white rounded hover:bg-[#232836] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        {/* Selected Target Function Header */}
        <div className="bg-[#1C202B] p-3.5 rounded-lg border border-[#7C3AED]/40 space-y-2 shadow-[0_0_14px_rgba(124,58,237,0.15)]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#7C3AED] bg-[#7C3AED]/10 px-2 py-0.5 rounded border border-[#7C3AED]/30 font-bold">
              Target Function
            </span>
            {node.is_async && (
              <span className="text-[10px] font-mono text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-0.5 rounded border border-[#F59E0B]/30 flex items-center gap-1">
                <Zap className="w-2.5 h-2.5 fill-current" />
                async
              </span>
            )}
          </div>
          <h2 className="font-code text-base font-bold text-[#E5E7EB] break-all leading-tight">
            {node.name}
          </h2>
          {node.class_name && (
            <div className="text-xs text-[#22D3EE] font-mono pt-0.5">
              class {node.class_name}
            </div>
          )}
          <div className="text-[11px] text-[#9CA3AF] font-mono flex items-center gap-1.5 pt-1 border-t border-[#262A36]">
            <FileCode className="w-3.5 h-3.5 text-[#22D3EE] shrink-0" />
            <span className="truncate">{node.file}</span>
            <span className="text-[#6B7280]">L{node.line_number}</span>
          </div>
        </div>

        {/* Impact Tracing Header Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[#1C202B] p-2.5 rounded-lg border border-[#262A36] text-center">
            <span className="text-[10px] font-mono text-[#9CA3AF] block uppercase">Direct Callers</span>
            <span className="text-lg font-bold font-mono text-[#F59E0B]">{directCount}</span>
          </div>
          <div className="bg-[#1C202B] p-2.5 rounded-lg border border-[#262A36] text-center">
            <span className="text-[10px] font-mono text-[#9CA3AF] block uppercase">Total Blast Radius</span>
            <span className="text-lg font-bold font-mono text-[#E5E7EB]">{totalCount}</span>
          </div>
        </div>

        {/* Loading State: Tracing Impact & Synthesizing AI */}
        {isImpactLoading && (
          <div className="bg-[#1C202B] p-4 rounded-lg border border-[#7C3AED]/30 text-center space-y-3 shadow-[0_0_14px_rgba(124,58,237,0.1)]">
            <div className="w-8 h-8 mx-auto border-2 border-[#7C3AED]/30 border-t-[#7C3AED] rounded-full animate-spin" />
            <div className="space-y-1">
              <span className="text-xs font-semibold text-[#E5E7EB] flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#7C3AED] animate-pulse" />
                Tracing Impact & AI Synthesis...
              </span>
              <p className="text-[11px] text-[#9CA3AF] font-mono">
                Computing AST dependency hops & generating summary...
              </p>
            </div>
          </div>
        )}

        {/* AI Impact Explanation Card */}
        {!isImpactLoading && impactData && (
          impactData.explanation ? (
            <div className="bg-[#1C202B] p-3.5 rounded-lg border border-[#7C3AED]/40 space-y-2 shadow-[0_0_16px_rgba(124,58,237,0.18)]">
              <div className="flex items-center justify-between border-b border-[#262A36] pb-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#E5E7EB]">
                  <Sparkles className="w-4 h-4 text-[#7C3AED]" />
                  <span>AI Impact Synthesis</span>
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#7C3AED]/15 text-[#22D3EE] border border-[#7C3AED]/30 font-bold">
                  Claude AI
                </span>
              </div>
              <p className="text-xs text-[#E5E7EB] leading-relaxed font-sans pt-0.5">
                {impactData.explanation}
              </p>
            </div>
          ) : impactData.explanation_status ? (
            <div className="bg-[#1C202B] p-3 rounded-lg border border-[#262A36] text-[11px] text-[#9CA3AF] flex items-start gap-2 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-[#6B7280] shrink-0 mt-0.5" />
              <span>
                {(() => {
                  const status = impactData.explanation_status;
                  const lower = String(status).toLowerCase();
                  if (
                    lower.includes('credit') ||
                    lower.includes('billing') ||
                    lower.includes('balance') ||
                    lower.includes('quota') ||
                    lower.includes('insufficient') ||
                    lower.includes('402')
                  ) {
                    return 'AI explanation temporarily unavailable. Deterministic impact analysis is still active.';
                  }
                  if (
                    lower.includes('req_') ||
                    lower.includes('invalid_request_error') ||
                    lower.includes('anthropic api error:')
                  ) {
                    return 'AI explanation unavailable (Anthropic API error). Deterministic impact analysis is active.';
                  }
                  return status;
                })()}
              </span>
            </div>
          ) : null
        )}

        {/* Impact Analysis Error */}
        {impactError && (
          <div className="bg-rose-500/10 p-3 rounded-lg border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold">Impact Analysis Error</strong>
              <span>{impactError}</span>
            </div>
          </div>
        )}

        {/* Impact Tracing Results */}
        {!isImpactLoading && impactData && (
          <>
            {/* Positive Safe State: No Dependents Found */}
            {impactData.dependents.length === 0 ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-lg space-y-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Safe to Modify in Isolation</span>
                </div>
                <p className="text-[#9CA3AF] text-[11px] leading-relaxed">
                  No other internal functions currently call or depend on <code className="text-[#E5E7EB] font-code">{node.name}</code>. Modifying this symbol will not break downstream functions.
                </p>
              </div>
            ) : (
              /* Impacted Functions List (What Breaks) */
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-[#9CA3AF] font-medium px-1">
                  <span className="flex items-center gap-1.5 font-semibold text-[#E5E7EB]">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B]" />
                    What Breaks ({impactData.dependents.length})
                  </span>
                  <span className="text-[10px] font-mono text-[#6B7280]">Sorted by distance</span>
                </div>

                <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
                  {impactData.dependents.map((dep) => {
                    const isHop1 = dep.hop_distance === 1;
                    return (
                      <button
                        key={dep.id}
                        onClick={() => onSelectNode(dep.id)}
                        className={`w-full text-left p-2.5 rounded-lg border transition-all hover:translate-x-0.5 ${
                          isHop1
                            ? 'bg-[#2A2015] border-[#F59E0B]/50 hover:border-[#F59E0B]'
                            : 'bg-[#1C202B] border-[#262A36] hover:border-[#4B5265]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                              isHop1
                                ? 'bg-[#F59E0B] text-black'
                                : 'bg-[#F59E0B]/20 border border-[#F59E0B]/40 text-[#F59E0B]'
                            }`}
                          >
                            Hop {dep.hop_distance} {isHop1 ? '• Direct Caller' : '• Transitive'}
                          </span>
                          <span className="text-[10px] text-[#6B7280] font-mono">
                            L{dep.line_number}
                          </span>
                        </div>
                        <div className="font-code text-xs font-semibold text-[#E5E7EB] truncate">
                          {dep.name}
                        </div>
                        <div className="text-[10px] font-mono text-[#9CA3AF] truncate mt-0.5">
                          {dep.file}
                          {dep.class_name && <span className="text-[#22D3EE]"> ({dep.class_name})</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* Docstring Card */}
        {node.docstring && (
          <div className="space-y-1 pt-2 border-t border-[#262A36]">
            <label className="text-[11px] text-[#9CA3AF] font-medium block">
              Docstring
            </label>
            <div className="text-[11px] text-[#9CA3AF] bg-[#0B0D12] p-2.5 rounded border border-[#262A36] font-mono leading-relaxed whitespace-pre-wrap">
              {node.docstring}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
