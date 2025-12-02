'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const funnelSchema = z.object({
  company_name: z.string().min(1, 'Company name is required'),
  contact_name: z.string().min(1, 'Contact name is required'),
  contact_email: z.string().email('Invalid email address'),
  stage: z.string().min(1, 'Stage is required'),
  value: z.number().positive('Value must be positive'),
  probability: z.number().min(0).max(100),
  expected_revenue: z.number().positive('Expected revenue must be positive'),
  creation_date: z.string(),
  expected_close_date: z.string(),
  team_member: z.string().min(1, 'Team member is required'),
  progress_to_won: z.number().min(0).max(100),
  last_interacted_on: z.string(),
  next_step: z.string().min(1, 'Next step is required'),
});

export default function FunnelForm({ initialData }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm({
    resolver: zodResolver(funnelSchema),
    defaultValues: {
      company_name: '',
      contact_name: '',
      contact_email: '',
      stage: '',
      value: 0,
      probability: 0,
      expected_revenue: 0,
      creation_date: new Date().toISOString().split('T')[0],
      expected_close_date: '',
      team_member: '',
      progress_to_won: 0,
      last_interacted_on: new Date().toISOString().split('T')[0],
      next_step: ''
    }
  });

  // Set initial values when editing
  useEffect(() => {
    if (isEditing) {
      Object.keys(initialData).forEach(key => {
        if (key !== 'id' && key !== 'created_by' && key !== 'created_at' && key !== 'updated_at') {
          setValue(key, initialData[key]);
        }
      });
    }
  }, [initialData, isEditing, setValue]);

  // Auto-calculate expected revenue based on value and probability
  const value = watch('value');
  const probability = watch('probability');
  
  useEffect(() => {
    if (value && probability) {
      setValue('expected_revenue', (value * probability / 100));
    }
  }, [value, probability, setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (isEditing) {
        // Update existing record
        const { error } = await supabase
          .from('funneldatas')
          .update({
            ...data,
            value: parseFloat(data.value),
            probability: parseFloat(data.probability),
            expected_revenue: parseFloat(data.expected_revenue),
            progress_to_won: parseFloat(data.progress_to_won),
            creation_date: new Date(data.creation_date).toISOString(),
            expected_close_date: new Date(data.expected_close_date).toISOString(),
            last_interacted_on: new Date(data.last_interacted_on).toISOString(),
          })
          .eq('id', initialData.id);
          
        if (error) throw error;
        toast.success('Deal updated successfully');
      } else {
        // Create new record
        const { error } = await supabase
          .from('funneldatas')
          .insert([{
            ...data,
            value: parseFloat(data.value),
            probability: parseFloat(data.probability),
            expected_revenue: parseFloat(data.expected_revenue),
            progress_to_won: parseFloat(data.progress_to_won),
            creation_date: new Date(data.creation_date).toISOString(),
            expected_close_date: new Date(data.expected_close_date).toISOString(),
            last_interacted_on: new Date(data.last_interacted_on).toISOString(),
          }]);
          
        if (error) throw error;
        toast.success('Deal created successfully');
      }
      
      router.push('/funnel');
    } catch (error) {
      toast.error(isEditing ? 'Failed to update deal' : 'Failed to create deal');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="company_name">Company Name *</Label>
            <Input
              id="company_name"
              {...register('company_name')}
              placeholder="Enter company name"
            />
            {errors.company_name && (
              <p className="text-sm text-red-500 mt-1">{errors.company_name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="contact_name">Contact Name *</Label>
            <Input
              id="contact_name"
              {...register('contact_name')}
              placeholder="Enter contact name"
            />
            {errors.contact_name && (
              <p className="text-sm text-red-500 mt-1">{errors.contact_name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="contact_email">Contact Email *</Label>
            <Input
              id="contact_email"
              type="email"
              {...register('contact_email')}
              placeholder="Enter contact email"
            />
            {errors.contact_email && (
              <p className="text-sm text-red-500 mt-1">{errors.contact_email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="stage">Stage *</Label>
            <Select onValueChange={(value) => setValue('stage', value)} value={watch('stage')}>
              <SelectTrigger>
                <SelectValue placeholder="Select stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Prospecting">Prospecting</SelectItem>
                <SelectItem value="Qualification">Qualification</SelectItem>
                <SelectItem value="Proposal">Proposal</SelectItem>
                <SelectItem value="Negotiation">Negotiation</SelectItem>
                <SelectItem value="Closed Won">Closed Won</SelectItem>
                <SelectItem value="Closed Lost">Closed Lost</SelectItem>
              </SelectContent>
            </Select>
            {errors.stage && (
              <p className="text-sm text-red-500 mt-1">{errors.stage.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="team_member">Team Member *</Label>
            <Input
              id="team_member"
              {...register('team_member')}
              placeholder="Enter team member name"
            />
            {errors.team_member && (
              <p className="text-sm text-red-500 mt-1">{errors.team_member.message}</p>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="value">Deal Value ($) *</Label>
            <Input
              id="value"
              type="number"
              {...register('value', { valueAsNumber: true })}
              placeholder="Enter deal value"
            />
            {errors.value && (
              <p className="text-sm text-red-500 mt-1">{errors.value.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="probability">Probability (%)</Label>
            <Input
              id="probability"
              type="number"
              min="0"
              max="100"
              {...register('probability', { valueAsNumber: true })}
              placeholder="Enter probability"
            />
            {errors.probability && (
              <p className="text-sm text-red-500 mt-1">{errors.probability.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="expected_revenue">Expected Revenue ($)</Label>
            <Input
              id="expected_revenue"
              type="number"
              readOnly
              {...register('expected_revenue', { valueAsNumber: true })}
              placeholder="Calculated automatically"
            />
          </div>

          <div>
            <Label htmlFor="creation_date">Creation Date</Label>
            <Input
              id="creation_date"
              type="date"
              {...register('creation_date')}
            />
          </div>

          <div>
            <Label htmlFor="expected_close_date">Expected Close Date *</Label>
            <Input
              id="expected_close_date"
              type="date"
              {...register('expected_close_date')}
            />
            {errors.expected_close_date && (
              <p className="text-sm text-red-500 mt-1">{errors.expected_close_date.message}</p>
            )}
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="next_step">Next Step *</Label>
        <Textarea
          id="next_step"
          {...register('next_step')}
          placeholder="Describe the next step"
          className="min-h-[100px]"
        />
        {errors.next_step && (
          <p className="text-sm text-red-500 mt-1">{errors.next_step.message}</p>
        )}
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Deal' : 'Create Deal')}
        </Button>
      </div>
    </form>
  );
}