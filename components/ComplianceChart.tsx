import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface ComplianceChartProps {
  percentage: number;
}

export const ComplianceChart: React.FC<ComplianceChartProps> = ({ percentage }) => {
  const data = [
    { name: 'Taken', value: percentage },
    { name: 'Remaining', value: 100 - percentage },
  ];
  
  const COLORS = ['#0ea5e9', '#e2e8f0']; // Sky 500, Slate 200

  // Color logic based on score
  let scoreColor = "text-sky-500";
  if (percentage < 50) scoreColor = "text-red-500";
  else if (percentage < 80) scoreColor = "text-yellow-500";
  else scoreColor = "text-green-500";

  return (
    <div className="relative w-32 h-32 mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={60}
            startAngle={90}
            endAngle={-270}
            paddingAngle={0}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index === 0 && percentage < 50 ? '#ef4444' : index === 0 && percentage < 80 ? '#eab308' : index === 0 ? '#22c55e' : '#e2e8f0'} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-2xl font-black ${percentage < 50 ? 'text-red-500' : percentage < 80 ? 'text-yellow-500' : 'text-green-500'}`}>
          {percentage}%
        </span>
        <span className="text-[10px] text-slate-400 font-medium uppercase">Adherence</span>
      </div>
    </div>
  );
};