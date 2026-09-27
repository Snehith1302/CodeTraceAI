/**
 * Formats raw backend JSON graph data (nodes & edges) into React Flow compatible node and edge objects
 * with an automatic multi-column / layer layout by file module.
 */
export function formatGraphForReactFlow(backendData) {
  if (!backendData || !backendData.nodes) {
    return { nodes: [], edges: [] };
  }

  const { nodes: rawNodes, edges: rawEdges } = backendData;

  // Group nodes by file path to create distinct module columns/clusters
  const fileGroups = {};
  rawNodes.forEach((node) => {
    const file = node.file || 'root';
    if (!fileGroups[file]) {
      fileGroups[file] = [];
    }
    fileGroups[file].push(node);
  });

  const files = Object.keys(fileGroups);
  const NODE_WIDTH = 260;
  const NODE_HEIGHT = 90;
  const GAP_X = 80;
  const GAP_Y = 35;
  const COLS = Math.max(1, Math.ceil(Math.sqrt(files.length)));

  const formattedNodes = [];

  files.forEach((file, fileIdx) => {
    const col = fileIdx % COLS;
    const row = Math.floor(fileIdx / COLS);

    const groupNodes = fileGroups[file];
    const groupStartX = col * (NODE_WIDTH + GAP_X);
    const groupStartY = row * (groupNodes.length * (NODE_HEIGHT + GAP_Y) + 120);

    groupNodes.forEach((node, idx) => {
      formattedNodes.push({
        id: node.id,
        type: 'custom',
        position: {
          x: groupStartX,
          y: groupStartY + idx * (NODE_HEIGHT + GAP_Y),
        },
        data: {
          id: node.id,
          name: node.name,
          file: node.file,
          lineNumber: node.line_number,
          className: node.class_name,
          isAsync: node.is_async,
          docstring: node.docstring,
        },
      });
    });
  });

  const formattedEdges = (rawEdges || []).map((edge, index) => ({
    id: `e-${edge.source}->${edge.target}-${index}`,
    source: edge.source,
    target: edge.target,
    type: 'smoothstep',
    animated: false,
    style: {
      stroke: '#3A4153',
      strokeWidth: 1.5,
    },
    markerEnd: {
      type: 'arrowclosed',
      width: 14,
      height: 14,
      color: '#3A4153',
    },
  }));

  return { nodes: formattedNodes, edges: formattedEdges };
}
