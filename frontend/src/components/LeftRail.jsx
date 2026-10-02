import React, { useState, useMemo } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FileCode,
  Code2,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Filter,
} from 'lucide-react';

// Utility to build directory & file tree structure from flat nodes array
function buildTreeFromNodes(nodes, filterText) {
  if (!nodes || nodes.length === 0) return [];

  const lowerFilter = (filterText || '').toLowerCase().trim();

  // Filter nodes first
  const filteredNodes = nodes.filter((node) => {
    if (!lowerFilter) return true;
    return (
      node.name.toLowerCase().includes(lowerFilter) ||
      node.file.toLowerCase().includes(lowerFilter) ||
      (node.class_name && node.class_name.toLowerCase().includes(lowerFilter))
    );
  });

  // Group by file path
  const fileGroups = {};
  filteredNodes.forEach((node) => {
    const file = node.file || 'root';
    if (!fileGroups[file]) {
      fileGroups[file] = [];
    }
    fileGroups[file].push(node);
  });

  return fileGroups;
}

export default function LeftRail({ rawNodes, selectedNodeId, onSelectNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [collapsedFiles, setCollapsedFiles] = useState({});

  const fileGroups = useMemo(() => {
    return buildTreeFromNodes(rawNodes, filterText);
  }, [rawNodes, filterText]);

  const toggleFile = (file) => {
    setCollapsedFiles((prev) => ({
      ...prev,
      [file]: !prev[file],
    }));
  };

  if (collapsed) {
    return (
      <div className="w-10 bg-[#161B22] border-r border-[#30363D] flex flex-col items-center py-2 select-none z-10 shrink-0">
        <button
          onClick={() => setCollapsed(false)}
          title="Expand Explorer"
          className="p-1.5 text-[#8B949E] hover:text-[#F0F6FC] rounded hover:bg-[#21262D] transition-colors"
        >
          <PanelLeftOpen className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const fileList = Object.keys(fileGroups);

  return (
    <aside className="w-64 bg-[#161B22] border-r border-[#30363D] flex flex-col select-none z-10 shrink-0 h-full">
      {/* Explorer Header */}
      <div className="h-9 px-3 border-b border-[#30363D] flex items-center justify-between text-xs font-semibold text-[#8B949E] tracking-wider uppercase">
        <div className="flex items-center gap-1.5">
          <Folder className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span>Explorer</span>
        </div>
        <button
          onClick={() => setCollapsed(true)}
          title="Collapse Explorer"
          className="p-1 text-[#8B949E] hover:text-[#F0F6FC] rounded hover:bg-[#21262D] transition-colors"
        >
          <PanelLeftClose className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Symbol Filter Input */}
      <div className="p-2 border-b border-[#30363D]">
        <div className="relative">
          <Search className="w-3 h-3 text-[#6E7681] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Filter symbols..."
            className="w-full h-6 pl-7 pr-2 bg-[#0D1117] border border-[#30363D] focus:border-[#38BDF8] focus:outline-none text-[11px] font-mono text-[#F0F6FC] rounded placeholder:text-[#6E7681]"
          />
        </div>
      </div>

      {/* File & Function Tree */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-1 text-xs">
        {!rawNodes || rawNodes.length === 0 ? (
          <div className="p-4 text-center text-xs font-mono text-[#6E7681]">
            No codebase loaded.
          </div>
        ) : fileList.length === 0 ? (
          <div className="p-4 text-center text-xs font-mono text-[#6E7681]">
            No matching symbols.
          </div>
        ) : (
          fileList.map((file) => {
            const nodes = fileGroups[file];
            const isFileCollapsed = collapsedFiles[file] === true;

            return (
              <div key={file} className="space-y-0.5">
                {/* File Header Row */}
                <button
                  onClick={() => toggleFile(file)}
                  className="w-full text-left px-1.5 py-1 flex items-center justify-between text-[11px] font-mono text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#21262D] rounded transition-colors"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    {isFileCollapsed ? (
                      <ChevronRight className="w-3.5 h-3.5 shrink-0 text-[#6E7681]" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 shrink-0 text-[#38BDF8]" />
                    )}
                    <FileCode className="w-3.5 h-3.5 shrink-0 text-[#8B949E]" />
                    <span className="truncate text-[#C9D1D9]">{file}</span>
                  </div>
                  <span className="text-[10px] bg-[#0D1117] text-[#6E7681] px-1 py-0.2 rounded border border-[#30363D]">
                    {nodes.length}
                  </span>
                </button>

                {/* Functions under File */}
                {!isFileCollapsed && (
                  <div className="ml-3 pl-1.5 border-l border-[#30363D] space-y-0.5">
                    {nodes.map((node) => {
                      const isSelected = selectedNodeId === node.id;
                      return (
                        <button
                          key={node.id}
                          onClick={() => onSelectNode(node.id)}
                          className={`w-full text-left px-2 py-1 rounded text-xs font-code flex items-center justify-between transition-all ${
                            isSelected
                              ? 'bg-[#21262D] text-[#38BDF8] border-l-2 border-[#8B5CF6] font-semibold'
                              : 'text-[#C9D1D9] hover:bg-[#21262D]/60 hover:text-[#F0F6FC]'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <Code2
                              className={`w-3 h-3 shrink-0 ${
                                isSelected ? 'text-[#38BDF8]' : 'text-[#8B5CF6]'
                              }`}
                            />
                            <span className="truncate">{node.name}</span>
                          </div>
                          {node.class_name && (
                            <span className="text-[10px] text-[#6E7681] font-mono truncate max-w-[60px]">
                              {node.class_name}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
