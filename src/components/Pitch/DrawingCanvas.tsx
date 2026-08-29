import React, { useState, useRef } from 'react';
import { DrawingElement, Point, ToolMode } from '../../types';

interface DrawingCanvasProps {
  drawings: DrawingElement[];
  activeTool: ToolMode;
  currentColor: string;
  currentStrokeWidth: number;
  onAddDrawing: (drawing: DrawingElement) => void;
  onDeleteDrawing: (id: string) => void;
  containerBounds: { width: number; height: number };
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  drawings,
  activeTool,
  currentColor,
  currentStrokeWidth,
  onAddDrawing,
  onDeleteDrawing,
  containerBounds,
}) => {
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [textPrompt, setTextPrompt] = useState<{ open: boolean; point: Point; value: string } | null>(null);

  const isDrawingTool = activeTool !== 'select';

  // Helper to convert screen pixel to 0-100% percentage
  const getPercentPoint = (clientX: number, clientY: number, target: HTMLElement): Point => {
    const rect = target.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    return {
      x: Math.max(0, Math.min(100, Number(x.toFixed(2)))),
      y: Math.max(0, Math.min(100, Number(y.toFixed(2)))),
    };
  };

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDrawingTool) return;
    if (activeTool === 'eraser') return;

    if (activeTool === 'text_note') {
      const pt = getPercentPoint(e.clientX, e.clientY, e.currentTarget as unknown as HTMLElement);
      setTextPrompt({ open: true, point: pt, value: '' });
      return;
    }

    const startPt = getPercentPoint(e.clientX, e.clientY, e.currentTarget as unknown as HTMLElement);
    setIsDrawing(true);
    setCurrentPoints([startPt]);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDrawing) return;

    const pt = getPercentPoint(e.clientX, e.clientY, e.currentTarget as unknown as HTMLElement);

    if (activeTool === 'freehand') {
      // Freehand appends points
      setCurrentPoints((prev) => [...prev, pt]);
    } else {
      // Vector tools keep [startPoint, currentPoint]
      setCurrentPoints((prev) => (prev.length > 0 ? [prev[0], pt] : [pt]));
    }
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);

    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (err) {}

    if (currentPoints.length >= 2) {
      const newDrawing: DrawingElement = {
        id: `draw-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        tool: activeTool,
        color: currentColor,
        strokeWidth: currentStrokeWidth,
        points: currentPoints,
        isCompleted: true,
      };
      onAddDrawing(newDrawing);
    }
    setCurrentPoints([]);
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textPrompt && textPrompt.value.trim()) {
      const newDrawing: DrawingElement = {
        id: `draw-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        tool: 'text_note',
        color: currentColor,
        strokeWidth: currentStrokeWidth,
        points: [textPrompt.point],
        text: textPrompt.value.trim(),
        fontSize: 14,
        isCompleted: true,
      };
      onAddDrawing(newDrawing);
    }
    setTextPrompt(null);
  };

  // SVG Path Generators for Dynamic Soccer Tactical Arrows
  const renderTacticalElement = (el: DrawingElement, isPreview: boolean = false) => {
    if (!el.points || el.points.length === 0) return null;
    const pts = el.points;
    const p1 = pts[0];
    const p2 = pts[pts.length - 1];

    const stroke = el.color || '#ffffff';
    const strokeWidth = el.strokeWidth || 3;
    const markerId = `arrowhead-${el.id || (isPreview ? 'preview' : 'draw')}`;
    
    // Scale arrowhead proportionally to strokeWidth
    const markerSize = Math.max(3.5, Math.min(8, strokeWidth * 1.6));

    // Handle Eraser click
    const handleElementClick = (e: React.MouseEvent) => {
      if (activeTool === 'eraser') {
        e.stopPropagation();
        onDeleteDrawing(el.id);
      }
    };

    switch (el.tool) {
      case 'arrow_run': {
        // Solid Running Arrow
        return (
          <g key={el.id} className={activeTool === 'eraser' ? 'cursor-pointer hover:opacity-50' : ''} onClick={handleElementClick}>
            <defs>
              <marker
                id={markerId}
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth={markerSize}
                markerHeight={markerSize}
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill={stroke} />
              </marker>
            </defs>
            <line
              x1={`${p1.x}%`}
              y1={`${p1.y}%`}
              x2={`${p2.x}%`}
              y2={`${p2.y}%`}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              markerEnd={`url(#${markerId})`}
            />
          </g>
        );
      }

      case 'arrow_pass': {
        // Dashed Passing Arrow
        const dashPattern = strokeWidth <= 2 ? '4,3' : '6,4';
        return (
          <g key={el.id} className={activeTool === 'eraser' ? 'cursor-pointer hover:opacity-50' : ''} onClick={handleElementClick}>
            <defs>
              <marker
                id={markerId}
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth={markerSize}
                markerHeight={markerSize}
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill={stroke} />
              </marker>
            </defs>
            <line
              x1={`${p1.x}%`}
              y1={`${p1.y}%`}
              x2={`${p2.x}%`}
              y2={`${p2.y}%`}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeDasharray={dashPattern}
              strokeLinecap="round"
              markerEnd={`url(#${markerId})`}
            />
          </g>
        );
      }

      case 'arrow_curve': {
        // Curved Overlapping Arrow (Quadratic Bezier Curve)
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        // Arc offset perpendicular
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const ctrlX = midX - dy * 0.3;
        const ctrlY = midY + dx * 0.3;

        return (
          <g key={el.id} className={activeTool === 'eraser' ? 'cursor-pointer hover:opacity-50' : ''} onClick={handleElementClick}>
            <defs>
              <marker
                id={markerId}
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth={markerSize}
                markerHeight={markerSize}
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill={stroke} />
              </marker>
            </defs>
            <path
              d={`M ${p1.x} ${p1.y} Q ${ctrlX} ${ctrlY} ${p2.x} ${p2.y}`}
              fill="none"
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              markerEnd={`url(#${markerId})`}
              vectorEffect="non-scaling-stroke"
            />
          </g>
        );
      }

      case 'arrow_dribble': {
        // Wavy Dribbling Line / Conduzione Palla
        const count = 6;
        let pathD = `M ${p1.x} ${p1.y}`;
        const dx = (p2.x - p1.x) / count;
        const dy = (p2.y - p1.y) / count;
        const perpX = -(p2.y - p1.y) / 12;
        const perpY = (p2.x - p1.x) / 12;

        for (let i = 0; i < count; i++) {
          const currX = p1.x + dx * i;
          const currY = p1.y + dy * i;
          const nextX = p1.x + dx * (i + 1);
          const nextY = p1.y + dy * (i + 1);
          const sign = i % 2 === 0 ? 1 : -1;
          const cX = (currX + nextX) / 2 + perpX * sign;
          const cY = (currY + nextY) / 2 + perpY * sign;
          pathD += ` Q ${cX} ${cY} ${nextX} ${nextY}`;
        }

        return (
          <g key={el.id} className={activeTool === 'eraser' ? 'cursor-pointer hover:opacity-50' : ''} onClick={handleElementClick}>
            <defs>
              <marker
                id={markerId}
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth={markerSize}
                markerHeight={markerSize}
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill={stroke} />
              </marker>
            </defs>
            <path
              d={pathD}
              fill="none"
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              markerEnd={`url(#${markerId})`}
            />
          </g>
        );
      }

      case 'arrow_press': {
        // Pressing Arrow with Stop-Bar (T-Bar)
        return (
          <g key={el.id} className={activeTool === 'eraser' ? 'cursor-pointer hover:opacity-50' : ''} onClick={handleElementClick}>
            <line
              x1={`${p1.x}%`}
              y1={`${p1.y}%`}
              x2={`${p2.x}%`}
              y2={`${p2.y}%`}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeLinecap="square"
            />
            {/* T-Bar head */}
            <circle cx={`${p2.x}%`} cy={`${p2.y}%`} r={Math.max(2.5, strokeWidth * 1.4)} fill={stroke} />
          </g>
        );
      }

      case 'line_measure': {
        // Straight line / Tactical connection line
        return (
          <g key={el.id} className={activeTool === 'eraser' ? 'cursor-pointer hover:opacity-50' : ''} onClick={handleElementClick}>
            <line
              x1={`${p1.x}%`}
              y1={`${p1.y}%`}
              x2={`${p2.x}%`}
              y2={`${p2.y}%`}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            {/* End point dots */}
            <circle cx={`${p1.x}%`} cy={`${p1.y}%`} r={Math.max(1.5, strokeWidth * 0.9)} fill={stroke} />
            <circle cx={`${p2.x}%`} cy={`${p2.y}%`} r={Math.max(1.5, strokeWidth * 0.9)} fill={stroke} />
          </g>
        );
      }

      case 'freehand': {
        // Smooth freehand path
        const d = pts.reduce((acc, point, index) => {
          return index === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`;
        }, '');

        return (
          <path
            key={el.id}
            d={d}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={activeTool === 'eraser' ? 'cursor-pointer hover:opacity-50' : ''}
            onClick={handleElementClick}
          />
        );
      }

      case 'zone_box': {
        const left = Math.min(p1.x, p2.x);
        const top = Math.min(p1.y, p2.y);
        const width = Math.abs(p2.x - p1.x);
        const height = Math.abs(p2.y - p1.y);

        return (
          <rect
            key={el.id}
            x={`${left}%`}
            y={`${top}%`}
            width={`${width}%`}
            height={`${height}%`}
            fill={stroke}
            fillOpacity="0.22"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray="4,4"
            rx="4"
            className={activeTool === 'eraser' ? 'cursor-pointer hover:opacity-50' : ''}
            onClick={handleElementClick}
          />
        );
      }

      case 'zone_circle': {
        const centerX = (p1.x + p2.x) / 2;
        const centerY = (p1.y + p2.y) / 2;
        const radiusX = Math.abs(p2.x - p1.x) / 2;
        const radiusY = Math.abs(p2.y - p1.y) / 2;

        return (
          <ellipse
            key={el.id}
            cx={`${centerX}%`}
            cy={`${centerY}%`}
            rx={`${radiusX}%`}
            ry={`${radiusY}%`}
            fill={stroke}
            fillOpacity="0.22"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray="4,4"
            className={activeTool === 'eraser' ? 'cursor-pointer hover:opacity-50' : ''}
            onClick={handleElementClick}
          />
        );
      }

      case 'text_note': {
        return (
          <g key={el.id} className={activeTool === 'eraser' ? 'cursor-pointer hover:opacity-50' : ''} onClick={handleElementClick}>
            <text
              x={`${p1.x}%`}
              y={`${p1.y}%`}
              fill={stroke}
              fontSize="13"
              fontWeight="bold"
              paintOrder="stroke"
              stroke="#0f172a"
              strokeWidth="3"
              strokeLinejoin="round"
              className="select-none font-sans"
            >
              {el.text}
            </text>
          </g>
        );
      }

      default:
        return null;
    }
  };

  return (
    <>
      <svg
        id="tactical-drawing-svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className={`absolute inset-0 w-full h-full z-25 ${
          isDrawingTool ? 'cursor-crosshair' : 'pointer-events-none'
        } ${activeTool === 'eraser' ? 'cursor-pointer pointer-events-auto' : ''}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Render all existing drawings */}
        {drawings.map((draw) => renderTacticalElement(draw))}

        {/* Render currently drawn active preview */}
        {isDrawing && currentPoints.length > 0 && (
          renderTacticalElement(
            {
              id: 'temp-preview',
              tool: activeTool,
              color: currentColor,
              strokeWidth: currentStrokeWidth,
              points: currentPoints,
            },
            true
          )
        )}
      </svg>

      {/* Text Annotation Dialog Overlay */}
      {textPrompt && textPrompt.open && (
        <div
          style={{ left: `${textPrompt.point.x}%`, top: `${textPrompt.point.y}%` }}
          className="absolute z-50 -translate-x-1/2 -translate-y-full mb-2 bg-slate-900 border border-slate-700 p-2 rounded-lg shadow-2xl animate-in fade-in zoom-in-95 duration-150"
        >
          <form onSubmit={handleTextSubmit} className="flex items-center gap-1.5">
            <input
              id="input-tactical-text"
              type="text"
              autoFocus
              placeholder="Scrivi nota tattica..."
              value={textPrompt.value}
              onChange={(e) => setTextPrompt({ ...textPrompt, value: e.target.value })}
              className="px-2.5 py-1 bg-slate-800 border border-slate-600 rounded text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 w-44"
            />
            <button
              type="submit"
              className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-semibold"
            >
              OK
            </button>
            <button
              type="button"
              onClick={() => setTextPrompt(null)}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs"
            >
              ✕
            </button>
          </form>
        </div>
      )}
    </>
  );
};
