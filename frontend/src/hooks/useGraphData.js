import { useState, useCallback } from 'react';
import { ingestProject, fetchGraph, fetchImpact } from '../utils/api';
import { formatGraphForReactFlow } from '../utils/graphFormat';

export function useGraphData() {
  const [projectId, setProjectId] = useState(null);
  const [projectPath, setProjectPath] = useState('');
  const [rawGraphData, setRawGraphData] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [stats, setStats] = useState(null);

  // Selection & Impact State
  const [selectedNode, setSelectedNode] = useState(null);
  const [impactData, setImpactData] = useState(null);
  const [isImpactLoading, setIsImpactLoading] = useState(false);
  const [impactError, setImpactError] = useState(null);

  // Status & UI State
  const [isIngesting, setIsIngesting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Perform project ingestion
  const handleIngest = useCallback(async (pathInput) => {
    if (!pathInput || !pathInput.trim()) {
      setError('Please provide a valid project folder path.');
      return;
    }

    setIsIngesting(true);
    setError(null);
    setSelectedNode(null);
    setImpactData(null);
    setImpactError(null);

    try {
      const ingestRes = await ingestProject(pathInput.trim());
      setProjectId(ingestRes.project_id);
      setProjectPath(ingestRes.path);
      setWarnings(ingestRes.warnings || []);
      setStats(ingestRes.stats || null);

      // Fetch complete graph
      setIsLoading(true);
      const graphRes = await fetchGraph(ingestRes.project_id);
      setRawGraphData(graphRes);

      const formatted = formatGraphForReactFlow(graphRes);
      setNodes(formatted.nodes);
      setEdges(formatted.edges);
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Failed to ingest project.';
      setError(msg);
    } finally {
      setIsIngesting(false);
      setIsLoading(false);
    }
  }, []);

  // Clear selection and impact tracing
  const clearSelection = useCallback(() => {
    setSelectedNode(null);
    setImpactData(null);
    setIsImpactLoading(false);
    setImpactError(null);
  }, []);

  // Handle selecting a function node and tracing impact
  const selectNode = useCallback(
    async (nodeId) => {
      if (!nodeId) {
        clearSelection();
        return;
      }

      if (!rawGraphData || !rawGraphData.nodes) return;
      const found = rawGraphData.nodes.find((n) => n.id === nodeId);
      if (!found) return;

      setSelectedNode(found);
      setImpactData(null);
      setImpactError(null);
      setIsImpactLoading(true);

      if (!projectId) {
        setIsImpactLoading(false);
        return;
      }

      try {
        const impactRes = await fetchImpact(nodeId, projectId);
        setImpactData(impactRes);
      } catch (err) {
        const msg = err.response?.data?.detail || err.message || 'Failed to analyze function impact.';
        setImpactError(msg);
      } finally {
        setIsImpactLoading(false);
      }
    },
    [rawGraphData, projectId, clearSelection]
  );

  return {
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
  };
}
