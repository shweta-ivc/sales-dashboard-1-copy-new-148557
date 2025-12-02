'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { toast } from 'sonner';

export default function FunnelTable() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('funneldatas')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setDeals(data);
    } catch (error) {
      toast.error('Failed to load deals');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteDeal = async (id) => {
    try {
      const { error } = await supabase
        .from('funneldatas')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success('Deal deleted successfully');
      fetchDeals(); // Refresh the table
    } catch (error) {
      toast.error('Failed to delete deal');
      console.error(error);
    }
  };

  const getStageColor = (stage) => {
    switch (stage.toLowerCase()) {
      case 'prospecting': return 'bg-blue-100 text-blue-800';
      case 'qualification': return 'bg-yellow-100 text-yellow-800';
      case 'proposal': return 'bg-purple-100 text-purple-800';
      case 'negotiation': return 'bg-orange-100 text-orange-800';
      case 'closed won': return 'bg-green-100 text-green-800';
      case 'closed lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold">Sales Pipeline</h2>
        <Link href="/funnel/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Deal
          </Button>
        </Link>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Expected Revenue</TableHead>
            <TableHead>Close Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deals.map((deal) => (
            <TableRow key={deal.id}>
              <TableCell className="font-medium">{deal.company_name}</TableCell>
              <TableCell>
                <div>{deal.contact_name}</div>
                <div className="text-sm text-gray-500">{deal.contact_email}</div>
              </TableCell>
              <TableCell>
                <Badge className={getStageColor(deal.stage)}>{deal.stage}</Badge>
              </TableCell>
              <TableCell>${parseFloat(deal.value).toLocaleString()}</TableCell>
              <TableCell>${parseFloat(deal.expected_revenue).toLocaleString()}</TableCell>
              <TableCell>
                {new Date(deal.expected_close_date).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Link href={`/funnel/${deal.id}`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => deleteDeal(deal.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}