import React, { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, FileText, Code2, PanelLeftClose, PanelLeftOpen, Search } from 'lucide-react';

export default function LeftRail({ rawNodes, selectedNodeId, onSelectNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [openFiles, setOpenFiles] = useState({});

  // Group nodes by file path
  const groupedFiles = useMemo(() => {
    if (!rawNodes) return {};
    const filtered = rawNodes.filter((node) => {
      if (!filterText) return true;
      const q = filterText.toLowerCase();
      return (
        node.name.toLowerCase().includes(q) ||
        node.file.toLowerCase().includes(q) ||
        (node.class_name && node.class_name.toLowerCase().includes(q))
      );
    });

    const groups = {};
    filtered.forEach((node) => {
      const file = node.file || 'root';
      if (!groups[file]) {
        groups[file] = [];
      }
      groups[file].push(node);
    });
    return groups;
  }, [rawNodes, filterText]);

  const toggleFile = (file) => {
    setOpenFiles((prev) => ({
      ...prev,
      [file]: prev[file] === undefined ? false : !prev[file],
    }));
  };

  if (collapsed) {
    return (
      <div className="w-12 bg-[#151821] border-r border-[#262A36] flex flex-col items-center py-3 select-none z-10 shrink-0">
        <button
          onClick={() => setCollapsed(false)}
          title="Expand left rail"
          className="p-2 text-[#9CA3AF] hover:text-white rounded hover:bg-[#232836] transition-colors"
        >
          <PanelLeftOpen className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <aside className="w-72 bg-[#151821] border-r border-[#262A36] flex flex-col select-none z-10 shrink-0 h-full">
      {/* Rail Header */}
      <div className="h-10 px-3 border-b border-[#262A36] flex items-center justify-between text-xs font-semibold text-[#E5E7EB]">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#22D3EE]" />
          <span>Project Functions</span>
        </div>
        <button
          onClick={() => setCollapsed(true)}
          title="Collapse left rail"
          className="p-1 text-[#9CA3AF] hover:text-white rounded hover:bg-[#232836] transition-colors"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      {/* Local Filter Bar */}
      <div className="p-2 border-b border-[#262A36]">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Filter files & symbols..."
            className="w-full h-7 pl-8 pr-2 bg-[#0B0D12] border border-[#262A36] focus:border-[#7C3AED] focus:outline-none text-[11px] font-mono text-[#E5E7EB] rounded"
          />
        </div>
      </div>

      {/* File Tree List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {!rawNodes || rawNodes.length === 0 ? (
          <div className="p-4 text-center text-xs text-[#6B7280]">
            No project loaded. Enter a path above to scan.
          </div>
        ) : Object.keys(groupedFiles).length === 0 ? (
          <div className="p-4 text-center text-xs text-[#6B7280]">
            No matching functions found.
          </div>
        ) : (
          Object.entries(groupedFiles).map(([file, nodes]) => {
            const isOpen = openFiles[file] !== false;
            return (
              <div key={file} className="rounded overflow-hidden">
                {/* File Header */}
                <button
                  onClick={() => toggleFile(file)}
                  className="w-full text-left px-2 py-1.5 flex items-center justify-between text-xs font-mono text-[#9CA3AF] hover:text-[#E5E7EB] hover:bg-[#1C202B] rounded transition-colors"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    {isOpen ? (
                      <ChevronDown className="w-3.5 h-3.5 shrink-0 text-[#22D3EE]" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 shrink-0 text-[#6B7280]" />
                    )}
                    <span className="truncate">{file}</span>
                  </div>
                  <span className="text-[10px] bg-[#0B0D12] text-[#6B7280] px-1.5 py-0.5 rounded border border-[#262A36]">
                    {nodes.length}
                  </span>
                </button>

                {/* Functions in File */}
                {isOpen && (
                  <div className="ml-3 pl-2 border-l border-[#262A36] my-1 space-y-0.5">
                    {nodes.map((node) => {
                      const isSelected = selectedNodeId === node.id;
                      return (
                        <button
                          key={node.id}
                          onClick={() => onSelectNode(node.id)}
                          className={`w-full text-left px-2 py-1 rounded text-xs font-code flex items-center justify-between group transition-all ${
                            isSelected
                              ? 'bg-[#7C3AED]/20 text-[#22D3EE] border border-[#7C3AED]/50 font-semibold'
                              : 'text-[#D1D5DB] hover:bg-[#1C202B] hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <Code2 className={`w-3 h-3 shrink-0 ${isSelected ? 'text-[#22D3EE]' : 'text-[#7C3AED]'}`} />
                            <span className="truncate">{node.name}</span>
                          </div>
                          {node.class_name && (
                            <span className="text-[9px] text-[#9CA3AF] font-sans truncate max-w-[70px]">
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
