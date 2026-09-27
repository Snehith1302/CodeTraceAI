import React from 'react';
import TopBar from './components/TopBar';
import LeftRail from './components/LeftRail';
import GraphCanvas from './components/GraphCanvas';
import NodeDetailPanel from './components/NodeDetailPanel';
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

  return (
    <div className="w-screen h-screen bg-[#0B0D12] text-[#E5E7EB] flex flex-col overflow-hidden">
      {/* Top Header Navigation Bar */}
      <TopBar
        onIngest={handleIngest}
        isIngesting={isIngesting}
        stats={stats}
        warningsCount={warnings ? warnings.length : 0}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        projectId={projectId}
        selectedNodeId={selectedNode ? selectedNode.id : null}
        onClearSelection={clearSelection}
      />

      {/* Non-blocking Error / Warning Banners */}
      {error && (
        <div className="bg-rose-500/15 border-b border-rose-500/30 px-4 py-2 flex items-center justify-between text-xs text-rose-300 z-30">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="p-1 hover:bg-rose-500/20 rounded text-rose-400 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {warnings && warnings.length > 0 && !error && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 flex items-center justify-between text-xs text-amber-300 z-30 font-mono">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Parsing Warning: {warnings.length} file(s) had syntax errors (e.g.{' '}
              {warnings[0].file})
            </span>
          </div>
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Rail File & Symbol Browser */}
        <LeftRail
          rawNodes={rawGraphData ? rawGraphData.nodes : []}
          selectedNodeId={selectedNode ? selectedNode.id : null}
          onSelectNode={selectNode}
        />

        {/* Main Graph Visualization Canvas */}
        <GraphCanvas
          initialNodes={nodes}
          initialEdges={edges}
          selectedNodeId={selectedNode ? selectedNode.id : null}
          impactData={impactData}
          onSelectNode={selectNode}
          searchQuery={searchQuery}
        />

        {/* Right-side Node Impact Inspector Panel */}
        <NodeDetailPanel
          node={selectedNode}
          impactData={impactData}
          isImpactLoading={isImpactLoading}
          impactError={impactError}
          onClose={clearSelection}
          onSelectNode={selectNode}
        />
      </div>
    </div>
  );
}
