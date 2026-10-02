import React from 'react';
import {
  X,
  Code2,
  FileCode,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Info,
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
      <aside className="w-72 bg-[#161B22] border-l border-[#30363D] p-4 flex flex-col items-center justify-center text-center select-none z-10 shrink-0 h-full">
        <div className="w-10 h-10 rounded bg-[#21262D] border border-[#30363D] flex items-center justify-center text-[#8B949E] mb-2">
          <Code2 className="w-5 h-5" />
        </div>
        <h3 className="text-xs font-semibold text-[#F0F6FC] mb-1">No Symbol Selected</h3>
        <p className="text-[11px] text-[#8B949E] leading-relaxed font-mono">
          Select a function node in the dependency graph or left explorer to inspect callers and blast radius.
        </p>
      </aside>
    );
  }

  const directCount = impactData?.dependents
    ? impactData.dependents.filter((d) => d.hop_distance === 1).length
    : 0;
  const totalCount = impactData?.total_dependents || 0;

  return (
    <aside className="w-80 bg-[#161B22] border-l border-[#30363D] flex flex-col select-none z-10 shrink-0 h-full overflow-hidden text-xs">
      {/* Inspector Panel Header */}
      <div className="h-9 px-3 border-b border-[#30363D] flex items-center justify-between shrink-0 bg-[#161B22]">
        <div className="flex items-center gap-1.5 font-semibold text-[#8B949E] uppercase tracking-wider text-[11px]">
          <Info className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span>Inspector</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onClose}
            title="Reset selection [Esc]"
            className="p-1 text-[#8B949E] hover:text-[#F0F6FC] rounded hover:bg-[#21262D] transition-colors flex items-center gap-1 text-[11px] font-mono"
          >
            <RotateCcw className="w-3 h-3 text-[#8B5CF6]" />
            <span>Reset</span>
          </button>
          <button
            onClick={onClose}
            className="p-1 text-[#8B949E] hover:text-[#F0F6FC] rounded hover:bg-[#21262D] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Content Scroll Container */}
      <div className="p-3 space-y-3 flex-1 overflow-y-auto">
        {/* Selected Symbol Metadata */}
        <div className="bg-[#21262D] p-3 rounded border border-[#30363D] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8B5CF6] font-bold">
              FUNCTION
            </span>
            {node.is_async && (
              <span className="text-[10px] font-mono text-[#F59E0B] flex items-center gap-0.5">
                <Zap className="w-2.5 h-2.5 fill-current" />
                async
              </span>
            )}
          </div>

          <h2 className="font-code text-sm font-bold text-[#F0F6FC] break-all leading-snug">
            {node.name}
          </h2>

          {node.class_name && (
            <div className="text-[11px] text-[#38BDF8] font-mono">
              class {node.class_name}
            </div>
          )}

          <div className="text-[11px] text-[#8B949E] font-mono flex items-center gap-1 pt-1.5 border-t border-[#30363D]">
            <FileCode className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
            <span className="truncate">{node.file}</span>
            <span className="text-[#6E7681] shrink-0">:L{node.line_number}</span>
          </div>
        </div>

        {/* Impact Metrics Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[#21262D] p-2 rounded border border-[#30363D] text-center">
            <span className="text-[10px] font-mono text-[#8B949E] block uppercase">Direct Callers</span>
            <span className="text-base font-bold font-mono text-[#F59E0B]">{directCount}</span>
          </div>
          <div className="bg-[#21262D] p-2 rounded border border-[#30363D] text-center">
            <span className="text-[10px] font-mono text-[#8B949E] block uppercase">Blast Radius</span>
            <span className="text-base font-bold font-mono text-[#F0F6FC]">{totalCount}</span>
          </div>
        </div>

        {/* Loading State */}
        {isImpactLoading && (
          <div className="bg-[#21262D] p-3 rounded border border-[#30363D] text-center space-y-2">
            <div className="w-4 h-4 mx-auto border-2 border-[#8B5CF6]/30 border-t-[#8B5CF6] rounded-full animate-spin" />
            <div className="text-[11px] font-mono text-[#8B949E]">
              Tracing AST dependency hops...
            </div>
          </div>
        )}

        {/* AI Impact Synthesis Section */}
        {!isImpactLoading && impactData && (
          impactData.explanation ? (
            <div className="bg-[#21262D] p-3 rounded border border-[#8B5CF6]/40 space-y-1.5">
              <div className="flex items-center justify-between border-b border-[#30363D] pb-1.5">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#F0F6FC]">
                  <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6]" />
                  <span>AI Impact Synthesis</span>
                </div>
                <span className="text-[9px] font-mono text-[#38BDF8]">
                  Claude AI
                </span>
              </div>
              <p className="text-[11px] text-[#C9D1D9] leading-relaxed font-sans pt-0.5">
                {impactData.explanation}
              </p>
            </div>
          ) : (
            <div className="bg-[#21262D] p-2.5 rounded border border-[#30363D] text-[11px] text-[#8B949E] font-mono flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#6E7681] shrink-0 mt-0.5" />
              <span>
                AI explanation unavailable. Deterministic impact analysis remains active.
              </span>
            </div>
          )
        )}

        {/* Impact Analysis Error */}
        {impactError && (
          <div className="bg-[#21262D] p-2.5 rounded border border-[#F85149]/40 text-xs text-[#F85149] flex items-start gap-1.5 font-mono">
            <AlertTriangle className="w-3.5 h-3.5 text-[#F85149] shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold">Impact Error</strong>
              <span>{impactError}</span>
            </div>
          </div>
        )}

        {/* Impact Tracing Results (What Breaks / Safe State) */}
        {!isImpactLoading && impactData && (
          <>
            {/* Safe State: No Dependents */}
            {impactData.dependents.length === 0 ? (
              <div className="bg-[#21262D] border border-[#10B981]/40 p-3 rounded space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 text-[#10B981] font-semibold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>SAFE TO MODIFY IN ISOLATION</span>
                </div>
                <p className="text-[#8B949E] text-[11px] leading-relaxed font-mono">
                  No internal functions currently depend on this symbol.
                </p>
              </div>
            ) : (
              /* Impacted Dependents List */
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-[#8B949E] font-medium px-0.5">
                  <span className="flex items-center gap-1 font-semibold text-[#F0F6FC]">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B]" />
                    WHAT BREAKS ({impactData.dependents.length})
                  </span>
                  <span className="text-[10px] font-mono text-[#6E7681]">By hop distance</span>
                </div>

                <div className="space-y-1 max-h-[260px] overflow-y-auto pr-0.5">
                  {impactData.dependents.map((dep) => {
                    const isHop1 = dep.hop_distance === 1;
                    return (
                      <button
                        key={dep.id}
                        onClick={() => onSelectNode(dep.id)}
                        className={`w-full text-left p-2 rounded border transition-colors ${
                          isHop1
                            ? 'bg-[#21262D] border-[#F59E0B]/50 hover:border-[#F59E0B]'
                            : 'bg-[#161B22] border-[#30363D] hover:border-[#484F58]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-0.5 text-[10px] font-mono">
                          <span
                            className={`font-bold ${
                              isHop1 ? 'text-[#F59E0B]' : 'text-[#8B949E]'
                            }`}
                          >
                            Hop {dep.hop_distance} {isHop1 ? '• Direct' : '• Transitive'}
                          </span>
                          <span className="text-[#6E7681]">L{dep.line_number}</span>
                        </div>
                        <div className="font-code text-xs font-semibold text-[#F0F6FC] truncate">
                          {dep.name}
                        </div>
                        <div className="text-[10px] font-mono text-[#8B949E] truncate mt-0.5">
                          {dep.file}
                          {dep.class_name && <span className="text-[#38BDF8]"> ({dep.class_name})</span>}
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
          <div className="space-y-1 pt-2 border-t border-[#30363D]">
            <label className="text-[10px] text-[#8B949E] font-mono uppercase block font-semibold">
              Docstring
            </label>
            <div className="text-[11px] text-[#8B949E] bg-[#0D1117] p-2 rounded border border-[#30363D] font-mono leading-relaxed whitespace-pre-wrap">
              {node.docstring}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
