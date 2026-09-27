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
import { Network } from 'lucide-react';

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
              strokeWidth: 2.5,
              opacity: 1.0,
            },
            markerEnd: {
              type: 'arrowclosed',
              width: 14,
              height: 14,
              color: '#F59E0B',
            },
          };
        } else {
          return {
            ...edge,
            type: 'smoothstep',
            animated: false,
            style: {
              stroke: '#262A36',
              strokeWidth: 1,
              opacity: 0.1,
            },
            markerEnd: {
              type: 'arrowclosed',
              width: 10,
              height: 10,
              color: '#262A36',
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
          stroke: '#3A4153',
          strokeWidth: 1.5,
          opacity: 1.0,
        },
        markerEnd: {
          type: 'arrowclosed',
          width: 14,
          height: 14,
          color: '#3A4153',
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
        fitView({ duration: 400, padding: 0.3 });
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
      <Background variant="dots" color="#262A36" gap={24} size={1.5} />
      <Controls />
      <MiniMap
        nodeColor={(node) => {
          const state = node.data?.impactState;
          if (state === 'target') return '#7C3AED';
          if (state === 'hop1' || state === 'hop2+') return '#F59E0B';
          if (state === 'dimmed') return '#151821';
          return '#2A2F3C';
        }}
        maskColor="rgba(11, 13, 18, 0.75)"
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
      <div className="flex-1 bg-[#0B0D12] flex flex-col items-center justify-center p-6 select-none relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-[#7C3AED]_1px,transparent_1px] [background-size:24px_24px]" />
        <div className="relative z-10 max-w-md text-center bg-[#151821] p-8 rounded-xl border border-[#262A36] shadow-2xl backdrop-blur-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#7C3AED]/10 border border-[#7C3AED]/30 flex items-center justify-center text-[#7C3AED] shadow-[0_0_24px_rgba(124,58,237,0.3)]">
            <Network className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-[#E5E7EB] mb-2">
            Ready to Analyze Codebase
          </h2>
          <p className="text-xs text-[#9CA3AF] leading-relaxed mb-6">
            Enter a public GitHub repository URL or local Python folder path in the top bar to scan AST function calls, construct a dependency graph, and trace blast radiuses.
          </p>
          <div className="p-3 bg-[#0B0D12] rounded border border-[#262A36] text-[11px] font-mono text-[#22D3EE] text-left mb-2 space-y-1">
            <div>GitHub URL: <span className="text-[#9CA3AF]">https://github.com/Snehith1302/CodeTraceAI</span></div>
            <div>Local Path: <span className="text-[#9CA3AF]">C:\path\to\project\backend</span></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full bg-[#0B0D12] relative overflow-hidden">
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
