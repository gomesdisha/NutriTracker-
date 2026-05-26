import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function GrowthTrendChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis allowDecimals={false} domain={[0, (dataMax) => Math.max(5, dataMax + 2)]} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="severe" stroke="#dc3545" strokeWidth={2} dot />
        <Line type="monotone" dataKey="moderate" stroke="#ffc107" strokeWidth={2} dot />
        <Line type="monotone" dataKey="normal" stroke="#198754" strokeWidth={2} dot />
      </LineChart>
    </ResponsiveContainer>
  );
}

