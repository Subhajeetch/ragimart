// Component made by AI


"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type CSSProperties,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BarDatum {
  /** X-axis label */
  label: string;
  /** Numeric value */
  value: number;
  /** Optional bar fill — defaults to hsl(var(--primary)) */
  color?: string;
}

export interface BarChartProps {
  data: BarDatum[];
  /** Card title */
  title?: string;
  /** Card subtitle / description */
  description?: string;
  /** Unit appended to tooltip value, e.g. "$", "ms", "%" */
  unit?: string;
  /** Number of y-axis grid lines (default: 4) */
  yTicks?: number;
  /** Extra class names on the outer card */
  className?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

/** Round max up to a "nice" number so grid lines land on clean values */
function niceMax(rawMax: number): number {
  const padded = rawMax * 1.02;
  const magnitude = Math.pow(10, Math.floor(Math.log10(padded)));
  return Math.ceil(padded / magnitude) * magnitude;
}

function formatAxisLabel(v: number): string {
  if (v >= 1_000_000) return `${+(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${+(v / 1_000).toFixed(1)}k`;
  return String(v);
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────

interface TooltipProps {
  label: string;
  value: number;
  color: string;
  unit: string;
  visible: boolean;
  /** Anchor X relative to containerRef */
  anchorX: number;
  /** Anchor Y relative to containerRef (top of bar) */
  anchorY: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

function Tooltip({
  label,
  value,
  color,
  unit,
  visible,
  anchorX,
  anchorY,
  containerRef,
}: TooltipProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ left: 0, top: 0 });

  useEffect(() => {
    if (!visible || !ref.current || !containerRef.current) return;
    const cw = containerRef.current.offsetWidth;
    const tt = ref.current.getBoundingClientRect();
    const GAP = 10;

    let left = anchorX - tt.width / 2;
    let top = anchorY - tt.height - GAP;

    // Clamp horizontal within container
    if (left < 4) left = 4;
    if (left + tt.width > cw - 4) left = cw - tt.width - 4;

    // Flip below if not enough room above
    if (top < 4) top = anchorY + GAP;

    setPos({ left, top });
  }, [visible, anchorX, anchorY, containerRef]);

  const style: CSSProperties = {
    position: "absolute",
    left: pos.left,
    top: pos.top,
    pointerEvents: "none",
    zIndex: 50,
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0) scale(1)" : "translateY(5px) scale(0.96)",
    transition: "opacity 0.15s ease, transform 0.15s ease",
  };

  return (
    <div
      ref={ref}
      role="tooltip"
      style={style}
      className="rounded-lg border border-border bg-popover px-3 py-2.5 shadow-md text-popover-foreground"
    >
      <div className="flex items-center gap-2 mb-1">
        <span
          className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm"
          style={{ backgroundColor: color }}
        />
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <div className="text-lg font-semibold tracking-tight leading-none">
        {value.toLocaleString()}
        {unit && (
          <span className="ml-1 text-sm font-normal text-muted-foreground">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Y-Axis Grid ─────────────────────────────────────────────────────────────

interface YAxisGridProps {
  maxValue: number;
  ticks: number;
  chartHeight: number;
  chartWidth: number;
  paddingLeft: number;
  paddingTop: number;
}

function YAxisGrid({
  maxValue,
  ticks,
  chartHeight,
  chartWidth,
  paddingLeft,
  paddingTop,
}: YAxisGridProps) {
  return (
    <g>
      {Array.from({ length: ticks + 1 }, (_, i) => {
        const value = (maxValue / ticks) * i;
        const y = paddingTop + chartHeight - (value / maxValue) * chartHeight;
        const isZero = i === 0;
        return (
          <g key={i}>
            <line
              x1={paddingLeft - 6}
              x2={paddingLeft + chartWidth}
              y1={y}
              y2={y}
              stroke="hsl(var(--border))"
              strokeWidth={isZero ? 1.2 : 0.8}
              strokeDasharray={isZero ? undefined : "4 4"}
              opacity={isZero ? 0.9 : 0.45}
            />
            <text
              x={paddingLeft - 10}
              y={y + 4}
              textAnchor="end"
              fontSize={10}
              fill="currentColor"
              opacity={0.6}
              style={{ fontFamily: "inherit", userSelect: "none" }}
            >
              {formatAxisLabel(Math.round(value))}
            </text>
          </g>
        );
      })}
    </g>
  );
}

// ─── Single Bar ───────────────────────────────────────────────────────────────

interface BarProps {
  datum: BarDatum;
  index: number;
  /** Pixel height of the bar (already computed) */
  barPxHeight: number;
  barWidth: number;
  x: number;
  /** SVG y of the bar top (final resting position) */
  barTopY: number;
  /** Bottom of the chart area (starting point for animation) */
  chartBottomY: number;
  gap: number;
  isActive: boolean;
  isMobile: boolean;
  onActivate: (index: number, anchorX: number, anchorY: number) => void;
  onDeactivate: () => void;
  /** Whether the mount animation has fired */
  animated: boolean;
}

function Bar({
  datum,
  index,
  barPxHeight,
  barWidth,
  x,
  barTopY,
  chartBottomY,
  gap,
  isActive,
  isMobile,
  onActivate,
  onDeactivate,
  animated,
}: BarProps) {
  const color = datum.color ?? "hsl(var(--primary))";

  // Start collapsed at the bottom; after `animated` flips true the CSS
  // transition carries them upward.
  const animY = animated ? barTopY : chartBottomY;
  const animH = animated ? barPxHeight : 0;

  const handleActivate = useCallback(
    (e: React.SyntheticEvent) => {
      e.stopPropagation();
      onActivate(index, x + barWidth / 2, barTopY);
    },
    [index, x, barWidth, barTopY, onActivate]
  );

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent) => {
      if (!isMobile) handleActivate(e);
    },
    [isMobile, handleActivate]
  );

  const handleMouseLeave = useCallback(() => {
    if (!isMobile) onDeactivate();
  }, [isMobile, onDeactivate]);

  // Transition delay staggers bars from left to right on mount
  const transitionDelay = `${index * 45}ms`;
  const transition = `height 0.52s cubic-bezier(0.34, 1.4, 0.64, 1) ${transitionDelay}, y 0.52s cubic-bezier(0.34, 1.4, 0.64, 1) ${transitionDelay}, opacity 0.15s ease`;

  return (
    <g
      role="img"
      aria-label={`${datum.label}: ${datum.value}`}
      style={{ cursor: "pointer" }}
      onClick={handleActivate}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Wide transparent hit area for easy tapping */}
      <rect
        x={x - gap / 2}
        y={0}
        width={barWidth + gap}
        height={chartBottomY + 28}
        fill="transparent"
      />

      {/* Background track — full height of chart area */}
      <rect
        x={x}
        y={0}
        width={barWidth}
        height={chartBottomY + 28}
        rx={4}
        fill="none"
        opacity={0}
      />

      {/* Active ring */}
      {isActive && (
        <rect
          x={x - 2}
          y={animY - 3}
          width={barWidth + 4}
          height={animH + 5}
          rx={6}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          opacity={0.4}
        />
      )}

      {/* Bar fill — animates from bottom up */}
      <rect
        x={x}
        y={animY}
        width={barWidth}
        height={animH}
        rx={4}
        fill={color}
        opacity={isActive ? 1 : 0.83}
        style={{ transition, filter: isActive ? "brightness(1.12)" : "none" }}
      />

      {/* X-axis label */}
      <text
        x={x + barWidth / 2}
        y={chartBottomY + 20}
        textAnchor="middle"
        fontSize={11}
        fill="currentColor"
        opacity={0.6}
        style={{ fontFamily: "inherit", userSelect: "none" }}
      >
        {datum.label}
      </text>
    </g>
  );
}

// ─── BarChart ─────────────────────────────────────────────────────────────────

export function BarChart({
  data = [],
  title,
  description,
  unit = "",
  yTicks = 4,
  className,
}: BarChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [svgWidth, setSvgWidth] = useState(0);
  const [svgHeight, setSvgHeight] = useState(0);
  const [animated, setAnimated] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [tooltipAnchor, setTooltipAnchor] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  // Detect touch-only device
  useEffect(() => {
    setIsMobile(window.matchMedia("(hover: none)").matches);
  }, []);

  // Measure SVG width and height via ResizeObserver
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      if (entry) {
        setSvgWidth(entry.contentRect.width);
        setSvgHeight(entry.contentRect.height);
      }
    });
    ro.observe(el);
    setSvgWidth(el.offsetWidth);
    setSvgHeight(el.offsetHeight);
    return () => ro.disconnect();
  }, []);

  // Trigger bottom-up entrance animation after first paint
  useEffect(() => {
    if (svgWidth === 0 || svgHeight === 0) return;
    const id = requestAnimationFrame(() => {
      // One extra frame so the "collapsed" state is painted first
      requestAnimationFrame(() => setAnimated(true));
    });
    return () => cancelAnimationFrame(id);
  }, [svgWidth, svgHeight]);

  // Dismiss tooltip on outside click
  useEffect(() => {
    const dismiss = () => setActiveIndex(null);
    document.addEventListener("click", dismiss);
    return () => document.removeEventListener("click", dismiss);
  }, []);

  const handleActivate = useCallback(
    (index: number, anchorX: number, anchorY: number) => {
      setActiveIndex(index);
      setTooltipAnchor({ x: anchorX, y: anchorY });
    },
    []
  );

  const handleDeactivate = useCallback(() => {
    setActiveIndex(null);
  }, []);

  if (!data.length) return null;

  // ── Layout constants ───────────────────────────────────────────────────────
  const PAD_LEFT = 44;
  const PAD_TOP = 12;
  const PAD_BOTTOM = 32;
  const PAD_RIGHT = 8;
  const HORIZONTAL_PADDING = 16; // px-2 = 0.5rem each side = 16px total

  // Use actual container height, fallback to calculated height
  // Account for horizontal padding in width calculation
  const chartContainerWidth = Math.max(0, svgWidth - HORIZONTAL_PADDING);
  const actualSvgHeight = Math.max(180, svgHeight > 0 ? svgHeight : Math.round(chartContainerWidth * 0.42));
  const chartWidth = Math.max(0, chartContainerWidth - PAD_LEFT - PAD_RIGHT);
  const chartHeight = Math.max(0, actualSvgHeight - PAD_TOP - PAD_BOTTOM);
  const chartBottomY = PAD_TOP + chartHeight; // absolute SVG Y of x-axis

  const n = data.length;
  const gap = Math.max(4, Math.round((chartWidth / n) * 0.22));
  const barWidth = Math.max(8, Math.floor((chartWidth - gap * (n - 1)) / n));

  const rawMax = Math.max(...data.map((d) => d.value), 1);
  const maxValue = niceMax(rawMax);

  // ── Active bar data ────────────────────────────────────────────────────────
  const activeBar = activeIndex !== null ? data[activeIndex] : null;

  return (
    <div
      className={cn(
        "w-full h-175 rounded-xl border border-border bg-card text-card-foreground shadow-sm",
        className
      )}
    >
      {/* Header */}
      {(title || description) && (
        <div className="px-4 pt-5 pb-2">
          {title && (
            <h3 className="text-base font-semibold leading-none tracking-tight">
              {title}
            </h3>
          )}
          {description && (
            <p className="mt-1.5 text-sm text-foreground">{description}</p>
          )}
        </div>
      )}

      {/* SVG + Tooltip wrapper */}
      <div
        ref={containerRef}
        className="relative px-0.5 pt-2 pb-2 flex-1 w-full h-[calc(100%-5rem)] min-w-0 overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {svgWidth > 0 && (
          <>
            <svg
              ref={svgRef}
              width={chartContainerWidth}
              height={actualSvgHeight}
              viewBox={`0 0 ${chartContainerWidth} ${actualSvgHeight}`}
              aria-label={title ?? "Bar chart"}
              style={{ display: "block", overflow: "hidden" }}
            >
              {/* Grid lines & y-axis labels */}
              <YAxisGrid
                maxValue={maxValue}
                ticks={yTicks}
                chartHeight={chartHeight}
                chartWidth={chartWidth}
                paddingLeft={PAD_LEFT}
                paddingTop={PAD_TOP}
              />

              {/* Bars */}
              {data.map((datum, i) => {
                const barPxHeight =
                  maxValue > 0 ? (datum.value / maxValue) * chartHeight : 0;
                const barTopY = chartBottomY - barPxHeight;
                const x = PAD_LEFT + i * (barWidth + gap);

                return (
                  <Bar
                    key={`${datum.label}-${i}`}
                    datum={datum}
                    index={i}
                    barPxHeight={barPxHeight}
                    barWidth={barWidth}
                    x={x}
                    barTopY={barTopY}
                    chartBottomY={chartBottomY}
                    gap={gap}
                    isActive={activeIndex === i}
                    isMobile={isMobile}
                    onActivate={handleActivate}
                    onDeactivate={handleDeactivate}
                    animated={animated}
                  />
                );
              })}
            </svg>

            {/* HTML tooltip — crisp text, smart clamping */}
            <Tooltip
              label={activeBar?.label ?? ""}
              value={activeBar?.value ?? 0}
              color={activeBar?.color ?? "hsl(var(--primary))"}
              unit={unit}
              visible={activeIndex !== null}
              anchorX={tooltipAnchor.x}
              anchorY={tooltipAnchor.y}
              containerRef={containerRef}
            />
          </>
        )}
      </div>
    </div>
  );
}