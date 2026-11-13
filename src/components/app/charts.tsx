"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency, formatNumber } from "@/lib/utils";

/**
 * Chart conventions (validated palette in globals.css → --chart-1..5):
 *  - one y-axis per chart, 2px lines, 4px rounded bar ends, recessive grid
 *  - a legend whenever there are ≥2 series; tooltip on every chart
 *  - series colour follows the entity, never its rank
 */

export const SERIES = {
  revenue: "var(--chart-1)",
  expenses: "var(--chart-4)",
  invoiced: "var(--chart-3)",
  collected: "var(--chart-2)",
  customers: "var(--chart-3)",
  churn: "var(--chart-5)",
} as const;

export type ValueFormat = "currency" | "number" | "percent";
const fmt = (v: number, f: ValueFormat, compact = false) =>
  f === "currency" ? formatCurrency(v, "USD", { compact }) : f === "percent" ? `${v.toFixed(1)}%` : formatNumber(v, compact);

interface TooltipPayload {
  name?: string | number;
  value?: number | string;
  color?: string;
  dataKey?: string | number;
  payload?: Record<string, unknown>;
}

function ChartTooltip({
  active,
  payload,
  label,
  format,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string | number;
  format: ValueFormat;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="min-w-[150px] rounded-lg border border-border bg-popover px-3 py-2.5 text-xs shadow-pop">
      {label !== undefined && <p className="mb-1.5 font-medium text-foreground">{label}</p>}
      <ul className="space-y-1">
        {payload.map((p) => (
          <li key={String(p.dataKey)} className="flex items-center gap-2">
            <span className="size-2 rounded-full" style={{ background: p.color }} aria-hidden />
            <span className="text-muted-foreground">{p.name}</span>
            <span className="ml-auto pl-3 font-semibold text-foreground tabular">{fmt(Number(p.value), format)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LegendRow({ payload, order }: { payload?: { value: string; color?: string }[]; order?: string[] }) {
  const sorted = order ? [...(payload ?? [])].sort((a, b) => order.indexOf(a.value) - order.indexOf(b.value)) : payload;
  return (
    <ul className="flex flex-wrap justify-end gap-4 pb-2 text-xs text-muted-foreground">
      {sorted?.map((p) => (
        <li key={p.value} className="flex items-center gap-1.5">
          <span className="h-0.5 w-3 rounded-full" style={{ background: p.color }} aria-hidden />
          {p.value}
        </li>
      ))}
    </ul>
  );
}

const axisProps = {
  tickLine: false,
  axisLine: false,
  tickMargin: 8,
  fontSize: 11,
} as const;

export interface SeriesDef {
  key: string;
  name: string;
  color: string;
}

export function TrendAreaChart({
  data,
  xKey,
  series,
  format = "currency",
  height = 280,
}: {
  data: Record<string, string | number>[];
  xKey: string;
  series: SeriesDef[];
  format?: ValueFormat;
  height?: number;
}) {
  return (
    <div style={{ height }} role="img" aria-label={`Area chart of ${series.map((s) => s.name).join(" and ")}`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 6, bottom: 0, left: 0 }}>
          <defs>
            {series.map((s) => (
              <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color} stopOpacity={0.22} />
                <stop offset="100%" stopColor={s.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="0" />
          <XAxis dataKey={xKey} {...axisProps} />
          <YAxis {...axisProps} width={52} tickFormatter={(v: number) => fmt(v, format, true)} />
          <Tooltip content={<ChartTooltip format={format} />} cursor={{ stroke: "var(--chart-axis)", strokeDasharray: "3 3" }} />
          {series.length > 1 && <Legend verticalAlign="top" content={<LegendRow order={series.map((s) => s.name)} />} />}
          {series.map((s) => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={s.color}
              strokeWidth={2}
              fill={`url(#grad-${s.key})`}
              activeDot={{ r: 4.5, strokeWidth: 2, stroke: "var(--card)" }}
              animationDuration={900}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function GroupedBarChart({
  data,
  xKey,
  series,
  format = "currency",
  height = 280,
}: {
  data: Record<string, string | number>[];
  xKey: string;
  series: SeriesDef[];
  format?: ValueFormat;
  height?: number;
}) {
  return (
    <div style={{ height }} role="img" aria-label={`Bar chart of ${series.map((s) => s.name).join(" and ")}`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 6, bottom: 0, left: 0 }} barGap={2} barCategoryGap="22%">
          <CartesianGrid vertical={false} />
          <XAxis dataKey={xKey} {...axisProps} />
          <YAxis {...axisProps} width={52} tickFormatter={(v: number) => fmt(v, format, true)} />
          <Tooltip content={<ChartTooltip format={format} />} cursor={{ fill: "var(--muted)", opacity: 0.6 }} />
          {series.length > 1 && <Legend verticalAlign="top" content={<LegendRow order={series.map((s) => s.name)} />} />}
          {series.map((s) => (
            <Bar key={s.key} dataKey={s.key} name={s.name} fill={s.color} radius={[4, 4, 0, 0]} maxBarSize={22} animationDuration={800} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TrendLineChart({
  data,
  xKey,
  series,
  format = "number",
  height = 260,
  domain,
}: {
  data: Record<string, string | number>[];
  xKey: string;
  series: SeriesDef[];
  format?: ValueFormat;
  height?: number;
  domain?: [number, number];
}) {
  return (
    <div style={{ height }} role="img" aria-label={`Line chart of ${series.map((s) => s.name).join(" and ")}`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 6, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey={xKey} {...axisProps} />
          <YAxis {...axisProps} width={44} domain={domain ?? ["auto", "auto"]} tickFormatter={(v: number) => fmt(v, format, true)} />
          <Tooltip content={<ChartTooltip format={format} />} cursor={{ stroke: "var(--chart-axis)", strokeDasharray: "3 3" }} />
          {series.length > 1 && <Legend verticalAlign="top" content={<LegendRow order={series.map((s) => s.name)} />} />}
          {series.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={s.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4.5, strokeWidth: 2, stroke: "var(--card)" }}
              animationDuration={900}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Donut + labelled legend (identity is never colour-alone). */
export function DonutChart({
  data,
  format = "number",
  centerLabel,
  centerValue,
  height = 200,
}: {
  data: { name: string; value: number; color: string }[];
  format?: ValueFormat;
  centerLabel: string;
  centerValue: string;
  height?: number;
}) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  return (
    <div className="@container">
    <div className="flex flex-col items-center gap-5 @[27rem]:flex-row">
      <div className="relative shrink-0" style={{ height, width: height }} role="img" aria-label={`Donut chart: ${data.map((d) => `${d.name} ${fmt(d.value, format)}`).join(", ")}`}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<ChartTooltip format={format} />} />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="68%"
              outerRadius="100%"
              paddingAngle={2}
              stroke="var(--card)"
              strokeWidth={2}
              cornerRadius={4}
              animationDuration={900}
            >
              {data.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-xl font-semibold tracking-tight tabular">{centerValue}</span>
          <span className="text-[11px] text-muted-foreground">{centerLabel}</span>
        </div>
      </div>
      <ul className="w-full min-w-0 space-y-2.5 text-sm">
        {data.map((d) => (
          <li key={d.name} className="flex min-w-0 items-center gap-2.5">
            <span className="size-2.5 shrink-0 rounded-[3px]" style={{ background: d.color }} aria-hidden />
            <span className="truncate text-muted-foreground">{d.name}</span>
            <span className="ml-auto font-medium whitespace-nowrap tabular">{fmt(d.value, format, true)}</span>
            <span className="w-10 shrink-0 text-right text-xs text-muted-foreground tabular">{Math.round((d.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
    </div>
  );
}
