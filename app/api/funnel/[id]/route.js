import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * @swagger
 * /api/funnel/{id}:
 *   put:
 *     summary: Update funnel entry
 *     description: Updates an existing sales opportunity in the funnel
 *     tags:
 *       - Funnel
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the funnel entry to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               company_name:
 *                 type: string
 *                 example: Acme Corp
 *               contact_name:
 *                 type: string
 *                 example: John Smith
 *               contact_email:
 *                 type: string
 *                 format: email
 *                 example: john@acme.com
 *               stage:
 *                 type: string
 *                 example: Qualification
 *               value:
 *                 type: number
 *                 example: 75000
 *               probability:
 *                 type: number
 *                 example: 50
 *               expected_revenue:
 *                 type: number
 *                 example: 37500
 *               creation_date:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-01-15T00:00:00Z"
 *               expected_close_date:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-04-15T00:00:00Z"
 *               team_member:
 *                 type: string
 *                 example: Jane Doe
 *               progress_to_won:
 *                 type: number
 *                 example: 50
 *               last_interacted_on:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-02-01T00:00:00Z"
 *               next_step:
 *                 type: string
 *                 example: Send proposal
 *     responses:
 *       200:
 *         description: Funnel entry updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Funnel entry updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *       400:
 *         description: Bad request - invalid data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       404:
 *         description: Funnel entry not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    const {
      company_name,
      contact_name,
      contact_email,
      stage,
      value,
      probability,
      expected_revenue,
      creation_date,
      expected_close_date,
      team_member,
      progress_to_won,
      last_interacted_on,
      next_step
    } = body;
    
    const supabase = createClient();
    
    // Get the current user ID
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Prepare update data (only include fields that are provided)
    const updateData = {};
    
    if (company_name !== undefined) updateData.company_name = company_name;
    if (contact_name !== undefined) updateData.contact_name = contact_name;
    if (contact_email !== undefined) updateData.contact_email = contact_email;
    if (stage !== undefined) updateData.stage = stage;
    if (value !== undefined) updateData.value = parseFloat(value);
    if (probability !== undefined) updateData.probability = parseFloat(probability);
    if (expected_revenue !== undefined) updateData.expected_revenue = parseFloat(expected_revenue);
    if (creation_date !== undefined) updateData.creation_date = new Date(creation_date).toISOString();
    if (expected_close_date !== undefined) updateData.expected_close_date = new Date(expected_close_date).toISOString();
    if (team_member !== undefined) updateData.team_member = team_member;
    if (progress_to_won !== undefined) updateData.progress_to_won = parseFloat(progress_to_won);
    if (last_interacted_on !== undefined) updateData.last_interacted_on = new Date(last_interacted_on).toISOString();
    if (next_step !== undefined) updateData.next_step = next_step;
    
    // Update funnel data
    const { data, error } = await supabase
      .from('funneldatas')
      .update(updateData)
      .eq('id', id)
      .eq('created_by', user.id) // Ensure user owns this record
      .select();
      
    if (error) {
      console.error('Error updating funnel entry:', error);
      
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Funnel entry not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to update funnel entry' },
        { status: 500 }
      );
    }
    
    if (data.length === 0) {
      return NextResponse.json(
        { error: 'Funnel entry not found or unauthorized' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: 'Funnel entry updated successfully', data: data[0] }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/funnel/{id}:
 *   delete:
 *     summary: Delete funnel entry
 *     description: Removes a sales opportunity from the funnel
 *     tags:
 *       - Funnel
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the funnel entry to delete
 *     responses:
 *       200:
 *         description: Funnel entry deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Funnel entry deleted successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       404:
 *         description: Funnel entry not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }
    
    const supabase = createClient();
    
    // Get the current user ID
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Delete funnel data
    const { error } = await supabase
      .from('funneldatas')
      .delete()
      .eq('id', id)
      .eq('created_by', user.id); // Ensure user owns this record
      
    if (error) {
      console.error('Error deleting funnel entry:', error);
      
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Funnel entry not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to delete funnel entry' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ message: 'Funnel entry deleted successfully' });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}