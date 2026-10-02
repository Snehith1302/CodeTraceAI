import React, { useEffect, useRef } from 'react';
import TopBar from './components/TopBar';
import LeftRail from './components/LeftRail';
import GraphCanvas from './components/GraphCanvas';
import NodeDetailPanel from './components/NodeDetailPanel';
import StatusBar from './components/StatusBar';
import { useGraphData } from './hooks/useGraphData';
import { AlertCircle, AlertTriangle, X } from 'lucide-react';

export default function App() {
  const {
    projectId,
    projectPath,
    rawGraphData,
    nodes,
    edges,
    warnings,
    stats,
    selectedNode,
    impactData,
    isImpactLoading,
    impactError,
    isIngesting,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    handleIngest,
    selectNode,
    clearSelection,
    setError,
  } = useGraphData();

  const searchInputRef = useRef(null);

  // Global Keyboard Shortcuts (/ for search focus, Escape for clearing selection)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      } else if (e.key === 'Escape') {
        clearSelection();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [clearSelection]);

  return (
    <div className="w-screen h-screen bg-[#0D1117] text-[#F0F6FC] flex flex-col overflow-hidden select-none">
      {/* Top IDE Command Bar */}
      <TopBar
        onIngest={handleIngest}
        isIngesting={isIngesting}
        stats={stats}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        projectId={projectId}
        projectPath={projectPath}
        selectedNodeId={selectedNode ? selectedNode.id : null}
        onClearSelection={clearSelection}
        searchInputRef={searchInputRef}
      />

      {/* Non-blocking Error & Warning Banners */}
      {error && (
        <div className="bg-[#F85149]/10 border-b border-[#F85149]/30 px-3 py-1.5 flex items-center justify-between text-xs text-[#F85149] z-30 font-mono">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="p-0.5 hover:bg-[#F85149]/20 rounded text-[#F85149] transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {warnings && warnings.length > 0 && !error && (
        <div className="bg-[#F59E0B]/10 border-b border-[#F59E0B]/20 px-3 py-1 flex items-center justify-between text-[11px] text-[#F59E0B] z-30 font-mono">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>
              AST Parsing Warning: {warnings.length} file(s) had syntax errors (e.g.{' '}
              {warnings[0].file})
            </span>
          </div>
        </div>
      )}

      {/* Main Workspace Grid (Left Explorer | Center Graph | Right Inspector) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Repository & Function Explorer */}
        <LeftRail
          rawNodes={rawGraphData ? rawGraphData.nodes : []}
          selectedNodeId={selectedNode ? selectedNode.id : null}
          onSelectNode={selectNode}
        />

        {/* Center Dependency Graph Visualization */}
        <GraphCanvas
          initialNodes={nodes}
          initialEdges={edges}
          selectedNodeId={selectedNode ? selectedNode.id : null}
          impactData={impactData}
          onSelectNode={selectNode}
          searchQuery={searchQuery}
        />

        {/* Right Impact Inspector Panel */}
        <NodeDetailPanel
          node={selectedNode}
          impactData={impactData}
          isImpactLoading={isImpactLoading}
          impactError={impactError}
          onClose={clearSelection}
          onSelectNode={selectNode}
        />
      </div>

      {/* Bottom IDE Status Bar */}
      <StatusBar
        projectPath={projectPath}
        stats={stats}
        warningsCount={warnings ? warnings.length : 0}
        selectedNode={selectedNode}
      />
    </div>
  );
}
