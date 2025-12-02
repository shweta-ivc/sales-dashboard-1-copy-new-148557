'use client';

import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import FunnelForm from '@/components/FunnelForm';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function FunnelDetailPage() {
  const [user, setUser] = useState(null);
  const [initialData, setInitialData] = useState(null);
  const router = useRouter();
  const { id } = useParams();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      } else {
        setUser(user);
        
        // Fetch funnel data if editing
        if (id !== 'new') {
          const { data, error } = await supabase
            .from('funneldatas')
            .select('*')
            .eq('id', id)
            .single();
            
          if (error) {
            console.error('Error fetching funnel data:', error);
          } else {
            setInitialData(data);
          }
        }
      }
    };

    getUser();
  }, [id, router, supabase]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4">
          <div className="container mx-auto">
            <h1 className="text-2xl font-bold mb-4">
              {id === 'new' ? 'Create New Deal' : 'Edit Deal'}
            </h1>
            <FunnelForm initialData={initialData} />
          </div>
        </main>
      </div>
    </div>
  );
}