"use client";
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface InteractiveChartProps {
  data: any[];
  type: 'bar' | 'pie' | 'line';
  title: string;
  onDataPointClick?: (data: any) => void;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'];

const InteractiveChart: React.FC<InteractiveChartProps> = ({ 
  data, 
  type, 
  title, 
  onDataPointClick 
}) => {
  const [hoveredData, setHoveredData] = useState(null);

  const handleClick = (data: any) => {
    onDataPointClick?.(data);
    // Audio feedback
    if ('speechSynthesis' in window) {
      const text = `${data.name}: ${data.value}`;
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold">{label}</p>
          <p className="text-blue-600">
            {`Value: ${payload[0].value}`}
          </p>
        </div>
      );
    }
    return null;
  };

  if (type === 'bar') {
    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} onClick={handleClick}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="value" 
              fill="#3B82F6"
              radius={[4, 4, 0, 0]}
              cursor="pointer"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === 'pie') {
    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              onClick={handleClick}
              cursor="pointer"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} onClick={handleClick}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#3B82F6" 
            strokeWidth={3}
            dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
            activeDot={{ r: 8, stroke: '#3B82F6', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default InteractiveChart;
