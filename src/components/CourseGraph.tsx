"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  MarkerType,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  type Edge,
  type OnSelectionChangeParams,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { CourseNode } from "@/components/course-node";
import { NodeDetailsPanel } from "@/components/NodeDetailsPanel";
import {
  prepareGraph,
  type CourseEdgeData,
  type CourseNodeData,
} from "@/lib/graphLayout";
import type { ConceptMapModule } from "@/types/course";

const nodeTypes = { courseNode: CourseNode };

function styleEdges(rawEdges: Edge<CourseEdgeData>[]): Edge<CourseEdgeData>[] {
  return rawEdges.map((edge) => {
    const edgeType = edge.data?.edgeType ?? "connects";
    const color = edgeType === "prerequisite" ? "#8b9cf8" : "#c4cff9";
    return {
      ...edge,
      style:
        edgeType === "prerequisite"
          ? { stroke: color, strokeWidth: 2.5 }
          : { stroke: color, strokeWidth: 1.5, strokeDasharray: "8 6" },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 18,
        height: 18,
        color,
      },
    };
  });
}

interface CourseGraphInnerProps {
  conceptMap: ConceptMapModule[];
  className?: string;
  height?: string;
  previewMode?: boolean;
}

function CourseGraphInner({
  conceptMap,
  className,
  height = "min-h-[70vh]",
  previewMode = false,
}: CourseGraphInnerProps) {
  const [selectedModule, setSelectedModule] = useState<ConceptMapModule | null>(
    null
  );
  const { fitView } = useReactFlow();

  const prepared = useMemo(() => prepareGraph(conceptMap), [conceptMap]);
  const styledEdges = useMemo(
    () => styleEdges(prepared.edges),
    [prepared.edges]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(prepared.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(styledEdges);

  useEffect(() => {
    setNodes(prepared.nodes);
    setEdges(styledEdges);
    const timer = setTimeout(() => fitView({ padding: 0.2, duration: 400 }), 80);
    return () => clearTimeout(timer);
  }, [prepared.nodes, styledEdges, setNodes, setEdges, fitView]);

  const selectModule = useCallback((data: CourseNodeData) => {
    setSelectedModule({
      id: data.id,
      module: data.module,
      description: data.description,
      learning_points: data.learning_points ?? [],
      exam_priority_note: data.exam_priority_note ?? "",
      importance: data.importance,
      difficulty: data.difficulty,
      prerequisites: data.prerequisites,
      connects_to: data.connects_to,
      likely_exam_relevance: data.likely_exam_relevance,
      estimated_mastery_hours: data.estimated_mastery_hours,
    });
  }, []);

  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes }: OnSelectionChangeParams) => {
      if (selectedNodes.length === 0) {
        setSelectedModule(null);
        return;
      }
      selectModule(selectedNodes[0].data as CourseNodeData);
    },
    [selectModule]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node<CourseNodeData>) => {
      selectModule(node.data);
    },
    [selectModule]
  );

  const onPaneClick = useCallback(() => {
    setSelectedModule(null);
  }, []);

  return (
    <div
      className={`relative overflow-hidden rounded-3xl ${height} ${className ?? ""}`}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onNodeClick={previewMode ? undefined : onNodeClick}
        onPaneClick={previewMode ? undefined : onPaneClick}
        onSelectionChange={previewMode ? undefined : onSelectionChange}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={!previewMode}
        panOnDrag={!previewMode}
        zoomOnScroll={!previewMode}
        zoomOnPinch={!previewMode}
        fitView
        minZoom={0.2}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
        className="bg-[#eef2ff]/40"
      >
        <Background gap={20} size={1} color="#c8d4ff" />
        {!previewMode && (
          <>
            <Controls
              showInteractive={false}
              className="!glass-strong !rounded-2xl !border-white/80 !shadow-lg"
            />
            <MiniMap
              nodeColor={(n) => {
                const imp = (n.data as CourseNodeData).importance;
                if (imp === "core") return "#8b9cf8";
                if (imp === "advanced") return "#d4a8ff";
                return "#b8c5f5";
              }}
              maskColor="rgba(244, 247, 255, 0.75)"
              className="!glass-strong !rounded-2xl !border-white/80"
            />
          </>
        )}
      </ReactFlow>

      {!previewMode && (
        <NodeDetailsPanel
          module={selectedModule}
          onClose={() => setSelectedModule(null)}
        />
      )}

      <div className="glass-pill pointer-events-none absolute bottom-4 left-4 z-10 flex flex-wrap gap-4 rounded-2xl px-4 py-2.5 text-xs font-bold text-muted-foreground">
        <span className="flex items-center gap-2">
          <span className="h-0.5 w-6 rounded bg-primary" />
          Prerequisite
        </span>
        <span className="flex items-center gap-2">
          <span className="h-0.5 w-6 rounded border-t-2 border-dashed border-primary/50" />
          Connects to
        </span>
      </div>
    </div>
  );
}

interface CourseGraphProps {
  conceptMap: ConceptMapModule[];
  className?: string;
  height?: string;
  /** Landing page: static visual, no slide-over panel */
  previewMode?: boolean;
}

export function CourseGraph(props: CourseGraphProps) {
  return (
    <ReactFlowProvider>
      <CourseGraphInner {...props} />
    </ReactFlowProvider>
  );
}
