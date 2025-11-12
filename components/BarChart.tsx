import React from 'react';
import { BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface BarChartProps {
  data: { name: string; value: number }[];
}

const BarChart: React.FC<BarChartProps> = ({ data }) => {
  return (
    <ReBarChart
      width={500}
      height={300}
      data={data}
      margin={{ top: 20, right: 30, left: 30, bottom: 5 }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="value" fill="#8884d8" />
    </ReBarChart>
  );
};

export default BarChart;