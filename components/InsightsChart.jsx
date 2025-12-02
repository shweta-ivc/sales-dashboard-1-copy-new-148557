'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';

export default function InsightsChart() {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('funneldatas')
          .select('stage, value, expected_revenue');
          
        if (error) throw error;
        
        // Process data for chart
        const processedData = data.reduce((acc, item) => {
          const existingStage = acc.find(d => d.stage === item.stage);
          if (existingStage) {
            existingStage.dealCount += 1;
            existingStage.totalValue += parseFloat(item.value);
            existingStage.expectedRevenue += parseFloat(item.expected_revenue);
          } else {
            acc.push({
              stage: item.stage,
              dealCount: 1,
              totalValue: parseFloat(item.value),
              expectedRevenue: parseFloat(item.expected_revenue)
            });
          }
          return acc;
        }, []);
        
        setChartData(processedData);
      } catch (error) {
        console.error('Error fetching chart data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [supabase]);

  if (loading) {
    return <div>Loading chart data...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Funnel Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="stage" />
            <YAxis />
            <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
            <Legend />
            <Bar dataKey="totalValue" fill="#3b82f6" name="Total Value" />
            <Bar dataKey="expectedRevenue" fill="#10b981" name="Expected Revenue" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}