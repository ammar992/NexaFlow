/** Tiny dependency-free SVG chart primitives for marketing visuals. */

export function smoothPath(points: number[], w: number, h: number, pad = 2) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const span = max - min || 1;
  const step = (w - pad * 2) / (points.length - 1);
  const xy = points.map((p, i) => [pad + i * step, pad + (h - pad * 2) * (1 - (p - min) / span)] as const);
  let d = `M${xy[0][0]},${xy[0][1]}`;
  for (let i = 1; i < xy.length; i++) {
    const [x0, y0] = xy[i - 1];
    const [x1, y1] = xy[i];
    const cx = (x0 + x1) / 2;
    d += ` C${cx},${y0} ${cx},${y1} ${x1},${y1}`;
  }
  return { line: d, area: `${d} L${xy[xy.length - 1][0]},${h} L${xy[0][0]},${h} Z`, last: xy[xy.length - 1] };
}

export function Sparkline({
  points,
  width = 120,
  height = 36,
  color = "#8B72FF",
  id,
}: {
  points: number[];
  width?: number;
  height?: number;
  color?: string;
  id: string;
}) {
  const { line, area, last } = smoothPath(points, width, height, 3);
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden className="block overflow-visible">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.32" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <circle cx={last[0]} cy={last[1]} r="3" fill={color} stroke="#11182B" strokeWidth="1.5" />
    </svg>
  );
}

export function Ring({ value, size = 56, stroke = 6, color = "#8B72FF" }: { value: number; size?: number; stroke?: number; color?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} stroke="rgb(255 255 255 / 0.08)" strokeWidth={stroke} fill="none" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={color}
        strokeWidth={stroke}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - value / 100)}
      />
    </svg>
  );
}

export function Bars({ values, color = "#5A9CFF", height = 64 }: { values: number[]; color?: string; height?: number }) {
  const max = Math.max(...values);
  return (
    <div className="flex items-end gap-[3px]" style={{ height }} aria-hidden>
      {values.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-[3px]"
          style={{ height: `${(v / max) * 100}%`, background: i === values.length - 1 ? color : `${color}55` }}
        />
      ))}
    </div>
  );
}
