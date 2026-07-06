"use client";

import { useState, useMemo } from "react";
import Reveal from "@/components/ui/reveal";
import workflowsData from "@/data/workflows.json";

interface WfNodeRaw {
  id: string;
  label: string;
  type: "input" | "process" | "ai" | "output" | "storage";
}

interface WfEdgeRaw {
  from: string;
  to: string;
}

interface WorkflowRaw {
  id: string;
  label: string;
  desc: string;
  nodes: WfNodeRaw[];
  edges: WfEdgeRaw[];
}

interface LayoutNode extends WfNodeRaw {
  x: number;
  y: number;
  layer: number;
}

const NODE_W = 180;
const NODE_H = 44;
const COL_GAP = 70;
const ROW_GAP = 42;
const PAD_X = 40;
const PAD_Y = 60;

function autoLayout(workflow: WorkflowRaw): { nodes: LayoutNode[]; width: number; height: number } {
  const { nodes, edges } = workflow;

  const outMap = new Map<string, string[]>();
  const inMap = new Map<string, string[]>();
  nodes.forEach((n) => {
    outMap.set(n.id, []);
    inMap.set(n.id, []);
  });
  edges.forEach((e) => {
    outMap.get(e.from)?.push(e.to);
    inMap.get(e.to)?.push(e.from);
  });

  const nodeLayer = new Map<string, number>();

  function assignLayer(id: string, visited = new Set<string>()): number {
    if (nodeLayer.has(id)) return nodeLayer.get(id)!;
    if (visited.has(id)) return 0;
    visited.add(id);

    const parents = inMap.get(id) || [];
    if (parents.length === 0) {
      const children = outMap.get(id) || [];
      if (children.length === 0) {
        nodeLayer.set(id, 0);
        return 0;
      }
      const childLayers = children.map((c) => assignLayer(c, new Set(visited)));
      const minChildLayer = Math.min(...childLayers);
      const layer = Math.max(0, minChildLayer - 1);
      nodeLayer.set(id, layer);
      return layer;
    }

    const parentLayers = parents.map((p) => assignLayer(p, new Set(visited)));
    const layer = Math.max(...parentLayers) + 1;
    nodeLayer.set(id, layer);
    return layer;
  }

  nodes.forEach((n) => assignLayer(n.id));

  const maxLayer = Math.max(...nodeLayer.values());
  const layers: string[][] = Array.from({ length: maxLayer + 1 }, () => []);
  nodes.forEach((n) => {
    layers[nodeLayer.get(n.id) || 0].push(n.id);
  });

  const maxInLayer = Math.max(...layers.map((l) => l.length));
  const canvasW = layers.length * (NODE_W + COL_GAP) - COL_GAP + PAD_X * 2;

  const nodeY = new Map<string, number>();

  layers.forEach((layer, li) => {
    if (li === 0) {
      const totalH = layer.length * (NODE_H + ROW_GAP) - ROW_GAP;
      const startY = (maxInLayer * (NODE_H + ROW_GAP) - ROW_GAP - totalH) / 2;
      layer.forEach((id, idx) => {
        nodeY.set(id, PAD_Y + startY + idx * (NODE_H + ROW_GAP));
      });
    } else {
      layer.forEach((id) => {
        const parents = inMap.get(id) || [];
        const children = outMap.get(id) || [];
        if (parents.length > 0) {
          const parentY = parents.reduce((sum, p) => sum + (nodeY.get(p) || 0), 0) / parents.length;
          nodeY.set(id, parentY);
        } else if (children.length > 0) {
          const childY = children.reduce((sum, c) => sum + (nodeY.get(c) || 0), 0) / children.length;
          nodeY.set(id, childY);
        } else {
          nodeY.set(id, PAD_Y + (maxInLayer * (NODE_H + ROW_GAP) - ROW_GAP) / 2 - NODE_H / 2);
        }
      });

      const sorted = [...layer].sort((a, b) => (nodeY.get(a) || 0) - (nodeY.get(b) || 0));
      const minGap = NODE_H + ROW_GAP;
      for (let i = 1; i < sorted.length; i++) {
        const prevY = nodeY.get(sorted[i - 1]) || 0;
        const curY = nodeY.get(sorted[i]) || 0;
        if (curY - prevY < minGap) {
          nodeY.set(sorted[i], prevY + minGap);
        }
      }

      if (sorted.length > 1) {
        const firstY = nodeY.get(sorted[0]) || 0;
        const lastY = nodeY.get(sorted[sorted.length - 1]) || 0;
        const totalH = lastY - firstY;
        const canvasMid = PAD_Y + (maxInLayer * (NODE_H + ROW_GAP) - ROW_GAP) / 2;
        const layerMid = firstY + totalH / 2;
        const shift = canvasMid - layerMid;
        sorted.forEach((id) => {
          nodeY.set(id, (nodeY.get(id) || 0) + shift);
        });
      }
    }
  });

  const layoutNodes: LayoutNode[] = nodes.map((n) => ({
    ...n,
    x: PAD_X + (nodeLayer.get(n.id) || 0) * (NODE_W + COL_GAP),
    y: nodeY.get(n.id) || 0,
    layer: nodeLayer.get(n.id) || 0,
  }));

  const maxY = Math.max(...layoutNodes.map((n) => n.y + NODE_H));
  const canvasH = maxY + PAD_Y;

  return { nodes: layoutNodes, width: canvasW, height: canvasH };
}

const iconColors: Record<string, string> = {
  input: "bg-green-500/10 text-green-500",
  process: "bg-blue-400/10 text-blue-400",
  ai: "bg-accent/15 text-accent",
  output: "bg-purple-500/10 text-purple-500",
  storage: "bg-orange-500/10 text-orange-500",
};

function NodeIcon({ type }: { type: string }) {
  const icons: Record<string, JSX.Element> = {
    input: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
      </svg>
    ),
    process: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      </svg>
    ),
    ai: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2a4 4 0 014 4v1a4 4 0 01-8 0V6a4 4 0 014-4zM6 10h12l1 10H5L6 10z" />
        <circle cx="9" cy="15" r="1" fill="currentColor" />
        <circle cx="15" cy="15" r="1" fill="currentColor" />
      </svg>
    ),
    output: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
      </svg>
    ),
    storage: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3M21 5v14c0 1.66-4 3-9 3s-9-1.34-9-3V5" />
      </svg>
    ),
  };
  return icons[type] || icons.process;
}

function WorkflowDiagram({ workflow }: { workflow: WorkflowRaw }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const { nodes: layoutNodes, width, height } = useMemo(() => autoLayout(workflow), [workflow]);
  const nodeMap = useMemo(() => new Map(layoutNodes.map((n) => [n.id, n])), [layoutNodes]);

  function getEdgePath(from: LayoutNode, to: LayoutNode): string {
    const x1 = from.x + NODE_W;
    const y1 = from.y + NODE_H / 2;
    const x2 = to.x;
    const y2 = to.y + NODE_H / 2;
    const midX = Math.round((x1 + x2) / 2);
    if (y1 === y2) return `M${x1},${y1} L${x2},${y2}`;
    return `M${x1},${y1} H${midX} V${y2} H${x2}`;
  }

  return (
    <div className="overflow-x-auto overflow-y-hidden pb-3 scrollbar-thin">
      <div
        className="relative mx-auto bg-[radial-gradient(circle,var(--line)_1px,transparent_1px)] bg-[size:24px_24px]"
        style={{ width, height }}
      >
        <svg
          className="absolute top-0 left-0"
          style={{ width, height, overflow: "visible" }}
          viewBox={`0 0 ${width} ${height}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id="wfGlow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {workflow.edges.map((edge, i) => {
            const a = nodeMap.get(edge.from);
            const b = nodeMap.get(edge.to);
            if (!a || !b) return null;
            const active = hovered === edge.from || hovered === edge.to;
            const d = getEdgePath(a, b);
            return (
              <g key={i}>
                <path
                  d={d}
                  fill="none"
                  stroke={active ? "#c6a565" : "rgba(180,175,165,0.45)"}
                  strokeWidth={active ? 2 : 1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-300"
                />
                {active && (
                  <circle r="3" fill="#c6a565" filter="url(#wfGlow)">
                    <animateMotion dur="1.2s" repeatCount="indefinite" path={d} />
                  </circle>
                )}
              </g>
            );
          })}
        </svg>

        <div className="absolute inset-0" style={{ width, height }}>
          {layoutNodes.map((n) => (
            <div
              key={n.id}
              className={`absolute flex items-center gap-2.5 bg-card border border-line px-4 h-[44px] w-[180px] whitespace-nowrap transition-all duration-300 cursor-default ${
                hovered === n.id
                  ? "border-accent shadow-[0_0_24px_rgba(198,165,101,0.08)] z-10"
                  : ""
              }`}
              style={{ left: n.x, top: n.y }}
              onMouseEnter={() => setHovered(n.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <div
                className={`w-7 h-7 rounded-[5px] flex items-center justify-center shrink-0 transition-all duration-300 ${
                  hovered === n.id ? "bg-accent text-bg" : iconColors[n.type]
                }`}
              >
                <NodeIcon type={n.type} />
              </div>
              <span className="font-mono text-xs tracking-[0.02em] text-fg font-medium">
                {n.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function WorkflowVisual() {
  const [active, setActive] = useState(0);
  const workflows = workflowsData as WorkflowRaw[];

  return (
    <section id="workflows" className="section-line">
      <div className="section-head">
        <Reveal>
          <div className="eyebrow">How I Build</div>
        </Reveal>
        <Reveal delay={0.08}>
          <h2>Workflow patterns.</h2>
        </Reveal>
        <Reveal delay={0.16}>
          <p>
            The architectures behind the systems I design — from retrieval pipelines
            to multi-agent orchestration to event-driven automations.
          </p>
        </Reveal>
      </div>

      <Reveal delay={0.2}>
        <div className="flex mb-8 border border-line overflow-x-auto w-fit scrollbar-none max-md:w-full">
          {workflows.map((w, i) => (
            <button
              key={w.id}
              className={`font-mono text-xs tracking-wider py-3.5 px-7 border-r border-line cursor-pointer transition-all duration-300 flex items-center gap-2.5 whitespace-nowrap shrink-0 ${
                active === i
                  ? "bg-fg text-bg hover:bg-fg"
                  : "bg-bg text-muted hover:text-fg hover:bg-bg-alt"
              }`}
              onClick={() => setActive(i)}
            >
              <span className="text-[10px] opacity-50">{String(i + 1).padStart(2, "0")}</span>
              {w.label}
            </button>
          ))}
        </div>
      </Reveal>

      <Reveal delay={0.28}>
        <div className="border border-line bg-bg-alt overflow-hidden">
          <div className="flex items-center gap-4 py-4 px-7 border-b border-line bg-card max-md:flex-col max-md:items-start max-md:gap-1.5">
            <span className="font-mono text-xs tracking-[0.06em] text-accent uppercase shrink-0">
              {workflows[active].label}
            </span>
            <span className="text-[13px] text-muted leading-relaxed">
              {workflows[active].desc}
            </span>
          </div>
          <WorkflowDiagram workflow={workflows[active]} />
        </div>
      </Reveal>
    </section>
  );
}
