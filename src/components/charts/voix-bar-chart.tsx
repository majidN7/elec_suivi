"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type DataPoint = { nom: string; voix: number; couleur: string };

export function VoixBarChart({ data }: { data: DataPoint[] }) {
  const height = Math.max(160, data.length * 44);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 8, right: 32, bottom: 8, left: 8 }}
        barCategoryGap={12}
      >
        <CartesianGrid horizontal={false} stroke="#e2e8f0" />
        <XAxis
          type="number"
          tick={{ fontSize: 12, fill: "#64748b" }}
          axisLine={{ stroke: "#cbd5e1" }}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="nom"
          width={140}
          tick={{ fontSize: 12, fill: "#334155" }}
          axisLine={{ stroke: "#cbd5e1" }}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: "#f1f5f9" }}
          contentStyle={{
            fontSize: 12,
            borderRadius: 8,
            border: "1px solid #e2e8f0",
          }}
        />
        <Bar dataKey="voix" radius={[0, 4, 4, 0]} maxBarSize={28}>
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.couleur} />
          ))}
          <LabelList
            dataKey="voix"
            position="right"
            style={{ fontSize: 12, fill: "#334155" }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
