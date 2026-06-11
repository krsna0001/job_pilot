'use client';

interface MatchScoreGaugeProps {
  score: number;
  size?: "sm" | "md";
}

export default function MatchScoreGauge({ score, size = "sm" }: MatchScoreGaugeProps) {
  const clamped = Math.min(100, Math.max(0, score));
  const color =
    clamped >= 75 ? "bg-success" :
    clamped >= 50 ? "bg-warning" :
    "bg-error";

  const bgColor =
    clamped >= 75 ? "bg-success/15" :
    clamped >= 50 ? "bg-warning/15" :
    "bg-error/15";

  const labelClass =
    clamped >= 75 ? "text-success" :
    clamped >= 50 ? "text-warning" :
    "text-error";

  const height = size === "md" ? "h-2.5" : "h-1.5";
  const fontSize = size === "md" ? "text-sm" : "text-[10px]";

  return (
    <div className={`flex items-center gap-2 ${fontSize} font-semibold ${labelClass}`}>
      <div className={`flex-1 rounded-full ${bgColor} ${height} overflow-hidden`}>
        <div
          className={`${height} rounded-full ${color} transition-all duration-700 ease-out`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      <span className="tabular-nums w-8 text-right">{clamped}%</span>
    </div>
  );
}
