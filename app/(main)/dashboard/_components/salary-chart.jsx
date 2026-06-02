"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function SalaryChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              return (
                <div className="bg-background border rounded-lg p-2 shadow-md">
                  <p className="font-medium">{label}</p>
                  {payload.map((item) => (
                    <p key={item.name} className="text-sm">
                      {item.name}: ${item.value}K
                    </p>
                  ))}
                </div>
              );
            }
            return null;
          }}
        />
        <Bar dataKey="min" fill="#38bdf8" name="Min Salary (K)" />
        <Bar dataKey="median" fill="#8b5cf6" name="Median Salary (K)" />
        <Bar dataKey="max" fill="#f43f5e" name="Max Salary (K)" />
      </BarChart>
    </ResponsiveContainer>
  );
}
