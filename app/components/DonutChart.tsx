'use client';

import { useMemo } from "react";

interface DonutChartProps {
  segments: { value: number; color: string; label: string }[];
  size?: number;
  strokeWidth?: number;
}

export default function DonutChart({ segments, size = 120, strokeWidth = 24 }: DonutChartProps) {
  const radius = useMemo(() => (size - strokeWidth) / 2, [size, strokeWidth]);
  const circumference = useMemo(() => radius * 2 * Math.PI, [radius]);
  const total = useMemo(() => segments.reduce((sum, s) => sum + s.value, 0), [segments]);

  const renderedSegments = useMemo(() => {
    let offset = 0;
    return segments.map((segment, i) => {
      const segmentLength = total > 0 ? (segment.value / total) * circumference : 0;
      const rotation = total > 0 ? (offset / total) * 360 : 0;
      offset += segment.value;
      return (
        {
          i,
          dasharray: `${segmentLength} ${circumference - segmentLength}`,
          rotation,
          segment,
          segmentLength,
        }
      );
    });
  }, [segments, total, circumference]);

  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
        {total === 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="var(--color-border-light)"
            strokeWidth={strokeWidth}
          />
        )}
        {renderedSegments.map(({ i, dasharray, rotation, segment }) => (
          <circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={segment.color}
            strokeWidth={strokeWidth}
            strokeDasharray={dasharray}
            strokeLinecap="butt"
            transform={`rotate(${rotation - 90} ${size / 2} ${size / 2})`}
            className="transition-all duration-500"
          />
        ))}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius - strokeWidth / 2}
          fill="var(--color-surface)"
          className="rounded-full"
        />
        {total >= 0 && (
          <text
            x="50%"
            y="50%"
            dominantBaseline="central"
            textAnchor="middle"
            className="fill-text-darkest text-sm font-semibold"
            style={{ fontSize: size * 0.18 }}
          >
            {total}
          </text>
        )}
      </svg>
      <div className="flex-1 space-y-2">
        {segments.map((segment, i) => (
          <div key={i} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: segment.color }} />
              <span className="text-sm text-text-secondary">{segment.label}</span>
            </div>
            <span className="text-sm font-medium text-text-darkest">{segment.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProgressRing({ value, max, color = "accent" }: { value: number; max: number; color?: string }) {
  const colorMap: Record<string, string> = {
    accent: "var(--color-accent)",
    success: "var(--color-success)",
    info: "var(--color-info)",
    warning: "var(--color-warning)",
    error: "var(--color-error)",
  };

  const size = 80;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = max > 0 ? Math.min(value / max, 1) : 0;
  const dasharray = `${progress * circumference} ${circumference - progress * circumference}`;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="var(--color-border)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={colorMap[color] ?? colorMap.accent}
          strokeWidth={strokeWidth}
          strokeDasharray={dasharray}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className="text-xs font-semibold text-text-darkest">
        {Math.round(progress * 100)}%
      </span>
    </div>
  );
}
