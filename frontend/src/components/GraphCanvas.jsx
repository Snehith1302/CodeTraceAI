import React, { useMemo, useEffect, useCallback } from 'react';
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import CustomNode from './CustomNode';
import { Network, Terminal, Search, RotateCcw } from 'lucide-react';

const nodeTypes = {
  custom: CustomNode,
};

function GraphCanvasContent({
  initialNodes = [],
  initialEdges = [],
  selectedNodeId,
  impactData,
  onSelectNode,
  searchQuery,
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { fitView } = useReactFlow();

  // Compute impact lookup map
  const impactMap = useMemo(() => {
    if (!impactData) return null;
    const map = {};
    if (impactData.target_function_id) {
      map[impactData.target_function_id] = { isTarget: true, hopDistance: 0 };
    }
    if (impactData.dependents) {
      impactData.dependents.forEach((dep) => {
        map[dep.id] = { isTarget: false, hopDistance: dep.hop_distance };
      });
    }
    return map;
  }, [impactData]);

  // Sync ReactFlow nodes & edges with dynamic impact highlighting
  useEffect(() => {
    const updatedNodes = initialNodes.map((node) => {
      let impactState = 'default';
      let hopDistance = null;

      if (impactMap) {
        if (impactMap[node.id]) {
          const info = impactMap[node.id];
          if (info.isTarget) {
            impactState = 'target';
          } else if (info.hopDistance === 1) {
            impactState = 'hop1';
            hopDistance = 1;
          } else {
            impactState = 'hop2+';
            hopDistance = info.hopDistance;
          }
        } else {
          impactState = 'dimmed';
        }
      } else if (selectedNodeId) {
        if (node.id === selectedNodeId) {
          impactState = 'target';
        } else {
          impactState = 'dimmed';
        }
      }

      const isSearchMatched =
        searchQuery &&
        (node.data.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          node.data.file.toLowerCase().includes(searchQuery.toLowerCase()));

      return {
        ...node,
        selected: node.id === selectedNodeId,
        data: {
          ...node.data,
          impactState,
          hopDistance,
          isSearchMatched,
        },
      };
    });

    const updatedEdges = initialEdges.map((edge) => {
      let isActiveImpactEdge = false;

      if (impactMap) {
        // Edge is active if both source and target are in the impact circuit
        isActiveImpactEdge = Boolean(impactMap[edge.source] && impactMap[edge.target]);
      }

      if (impactMap) {
        if (isActiveImpactEdge) {
          return {
            ...edge,
            type: 'smoothstep',
            animated: true,
            style: {
              stroke: '#F59E0B',
              strokeWidth: 2,
              opacity: 1.0,
            },
            markerEnd: {
              type: 'arrowclosed',
              width: 12,
              height: 12,
              color: '#F59E0B',
            },
          };
        } else {
          return {
            ...edge,
            type: 'smoothstep',
            animated: false,
            style: {
              stroke: '#21262D',
              strokeWidth: 1,
              opacity: 0.15,
            },
            markerEnd: {
              type: 'arrowclosed',
              width: 8,
              height: 8,
              color: '#21262D',
            },
          };
        }
      }

      // Default state when no impact analysis is active
      return {
        ...edge,
        type: 'smoothstep',
        animated: false,
        style: {
          stroke: '#30363D',
          strokeWidth: 1.5,
          opacity: 0.9,
        },
        markerEnd: {
          type: 'arrowclosed',
          width: 12,
          height: 12,
          color: '#30363D',
        },
      };
    });

    setNodes(updatedNodes);
    setEdges(updatedEdges);
  }, [initialNodes, initialEdges, selectedNodeId, impactMap, searchQuery, setNodes, setEdges]);

  // Auto fitView when node selection changes
  useEffect(() => {
    if (selectedNodeId) {
      setTimeout(() => {
        fitView({ duration: 300, padding: 0.25 });
      }, 50);
    }
  }, [selectedNodeId, fitView]);

  const handleNodeClick = useCallback(
    (_, node) => {
      onSelectNode(node.id);
    },
    [onSelectNode]
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={handleNodeClick}
      fitView
      attributionPosition="bottom-right"
    >
      <Background variant="dots" color="#30363D" gap={20} size={1} />
      <Controls />
      <MiniMap
        nodeColor={(node) => {
          const state = node.data?.impactState;
          if (state === 'target') return '#8B5CF6';
          if (state === 'hop1' || state === 'hop2+') return '#F59E0B';
          if (state === 'dimmed') return '#0D1117';
          return '#21262D';
        }}
        maskColor="rgba(13, 17, 23, 0.85)"
      />
    </ReactFlow>
  );
}

export default function GraphCanvas({
  initialNodes = [],
  initialEdges = [],
  selectedNodeId,
  impactData,
  onSelectNode,
  searchQuery,
}) {
  if (!initialNodes || initialNodes.length === 0) {
    return (
      <div className="flex-1 bg-[#0D1117] flex flex-col items-center justify-center p-6 select-none relative overflow-hidden">
        <div className="max-w-md w-full bg-[#161B22] p-6 rounded border border-[#30363D] space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#F0F6FC] border-b border-[#30363D] pb-3">
            <Network className="w-4 h-4 text-[#8B5CF6]" />
            <span>Codebase Dependency Analysis</span>
          </div>

          <p className="text-xs text-[#8B949E] leading-relaxed">
            Enter a Python repository URL or local directory path in the top bar to parse AST symbols, construct a NetworkX call graph, and trace blast radiuses.
          </p>

          <div className="p-3 bg-[#0D1117] rounded border border-[#30363D] text-[11px] font-mono text-[#8B949E] space-y-1.5">
            <div className="flex items-center justify-between text-[#C9D1D9]">
              <span>Sample Repository URLs</span>
            </div>
            <div className="text-[#38BDF8] truncate">https://github.com/Snehith1302/CodeTraceAI</div>
            <div className="text-[#38BDF8] truncate">C:\path\to\project\backend</div>
          </div>

          <div className="pt-2 border-t border-[#30363D] flex items-center justify-between text-[11px] font-mono text-[#6E7681]">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.2 bg-[#21262D] rounded border border-[#30363D] text-[#8B949E]">
                /
              </kbd>
              Focus Search
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.2 bg-[#21262D] rounded border border-[#30363D] text-[#8B949E]">
                Esc
              </kbd>
              Clear View
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full bg-[#0D1117] relative overflow-hidden">
      <ReactFlowProvider>
        <GraphCanvasContent
          initialNodes={initialNodes}
          initialEdges={initialEdges}
          selectedNodeId={selectedNodeId}
          impactData={impactData}
          onSelectNode={onSelectNode}
          searchQuery={searchQuery}
        />
      </ReactFlowProvider>
    </div>
  );
}
