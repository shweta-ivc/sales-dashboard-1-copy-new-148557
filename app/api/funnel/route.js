import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * @swagger
 * /api/funnel:
 *   get:
 *     summary: Get all funnel data
 *     description: Returns a list of all sales funnel entries
 *     tags:
 *       - Funnel
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   company_name:
 *                     type: string
 *                   contact_name:
 *                     type: string
 *                   contact_email:
 *                     type: string
 *                   stage:
 *                     type: string
 *                   value:
 *                     type: number
 *                   probability:
 *                     type: number
 *                   expected_revenue:
 *                     type: number
 *                   creation_date:
 *                     type: string
 *                     format: date-time
 *                   expected_close_date:
 *                     type: string
 *                     format: date-time
 *                   team_member:
 *                     type: string
 *                   progress_to_won:
 *                     type: number
 *                   last_interacted_on:
 *                     type: string
 *                     format: date-time
 *                   next_step:
 *                     type: string
 *                   created_by:
 *                     type: string
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                   updated_at:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized
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
export async function GET() {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('funneldatas')
      .select('*');
      
    if (error) {
      console.error('Error fetching funnel data:', error);
      return NextResponse.json(
        { error: 'Failed to fetch funnel data' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data);
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
 * /api/funnel:
 *   post:
 *     summary: Create new funnel entry
 *     description: Adds a new sales opportunity to the funnel
 *     tags:
 *       - Funnel
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - company_name
 *               - contact_name
 *               - contact_email
 *               - stage
 *               - value
 *               - probability
 *               - expected_revenue
 *               - creation_date
 *               - expected_close_date
 *               - team_member
 *               - progress_to_won
 *               - last_interacted_on
 *               - next_step
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
 *                 example: Prospecting
 *               value:
 *                 type: number
 *                 example: 50000
 *               probability:
 *                 type: number
 *                 example: 30
 *               expected_revenue:
 *                 type: number
 *                 example: 15000
 *               creation_date:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-01-15T00:00:00Z"
 *               expected_close_date:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-03-15T00:00:00Z"
 *               team_member:
 *                 type: string
 *                 example: Jane Doe
 *               progress_to_won:
 *                 type: number
 *                 example: 30
 *               last_interacted_on:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-01-20T00:00:00Z"
 *               next_step:
 *                 type: string
 *                 example: Schedule demo call
 *     responses:
 *       201:
 *         description: Funnel entry created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Funnel entry created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *       400:
 *         description: Bad request - missing or invalid data
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
export async function POST(request) {
  try {
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
    
    // Validate required fields
    if (!company_name || !contact_name || !contact_email || !stage || 
        !value || !probability === undefined || !expected_revenue || 
        !creation_date || !expected_close_date || !team_member || 
        progress_to_won === undefined || !last_interacted_on || !next_step) {
      return NextResponse.json(
        { error: 'All fields are required' },
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
    
    // Insert funnel data
    const { data, error } = await supabase
      .from('funneldatas')
      .insert([
        {
          company_name,
          contact_name,
          contact_email,
          stage,
          value: parseFloat(value),
          probability: parseFloat(probability),
          expected_revenue: parseFloat(expected_revenue),
          creation_date: new Date(creation_date).toISOString(),
          expected_close_date: new Date(expected_close_date).toISOString(),
          team_member,
          progress_to_won: parseFloat(progress_to_won),
          last_interacted_on: new Date(last_interacted_on).toISOString(),
          next_step,
          created_by: user.id
        }
      ])
      .select();
      
    if (error) {
      console.error('Error creating funnel entry:', error);
      return NextResponse.json(
        { error: 'Failed to create funnel entry' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { message: 'Funnel entry created successfully', data: data[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}