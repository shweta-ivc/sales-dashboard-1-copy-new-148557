'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, ShoppingCart, TrendingUp } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function DashboardStats() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    dealsWon: 0,
    pipelineValue: 0,
    conversionRate: 0
  });
  
  const supabase = createClient();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch funnel data for stats calculation
        const { data, error } = await supabase
          .from('funneldatas')
          .select('*');
          
        if (error) throw error;
        
        // Calculate stats
        const totalRevenue = data
          .filter(item => item.stage === 'Closed Won')
          .reduce((sum, item) => sum + parseFloat(item.expected_revenue), 0);
          
        const dealsWon = data.filter(item => item.stage === 'Closed Won').length;
        const pipelineValue = data.reduce((sum, item) => sum + parseFloat(item.value), 0);
        const conversionRate = data.length > 0 
          ? Math.round((dealsWon / data.length) * 100) 
          : 0;
        
        setStats({
          totalRevenue,
          dealsWon,
          pipelineValue,
          conversionRate
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, [supabase]);

  const statItems = [
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: <DollarSign className="h-4 w-4 text-blue-500" />,
      change: "+12% from last month"
    },
    {
      title: "Deals Won",
      value: stats.dealsWon,
      icon: <ShoppingCart className="h-4 w-4 text-green-500" />,
      change: "+8% from last month"
    },
    {
      title: "Pipeline Value",
      value: `$${stats.pipelineValue.toLocaleString()}`,
      icon: <TrendingUp className="h-4 w-4 text-purple-500" />,
      change: "+5% from last month"
    },
    {
      title: "Conversion Rate",
      value: `${stats.conversionRate}%`,
      icon: <Users className="h-4 w-4 text-orange-500" />,
      change: "+2% from last month"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statItems.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            {stat.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}