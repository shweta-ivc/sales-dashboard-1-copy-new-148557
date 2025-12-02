import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { hash } from 'bcryptjs';

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account with provided credentials
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: john_doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: password123
 *               location:
 *                 type: string
 *                 example: New York
 *               time:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-01-01T12:00:00Z"
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2023-01-01"
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User created successfully
 *       400:
 *         description: Bad request - missing or invalid data
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
      username, 
      email, 
      password, 
      location, 
      time, 
      date 
    } = body;
    
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Username, email, and password are required' },
        { status: 400 }
      );
    }
    
    const supabase = createClient();
    
    // Hash the password
    const hashedPassword = await hash(password, 10);
    
    // Insert user data into the database
    const { data, error } = await supabase
      .from('loginsignupdatas')
      .insert([
        {
          username,
          email,
          password_hash: hashedPassword,
          location: location || null,
          time: time ? new Date(time).toISOString() : null,
          date: date || null
        }
      ])
      .select();
      
    if (error) {
      console.error('Registration error:', error);
      
      // Check for specific error types
      if (error.code === '23505') {
        // Unique constraint violation
        if (error.message.includes('email')) {
          return NextResponse.json(
            { error: 'An account with this email already exists' },
            { status: 400 }
          );
        }
        if (error.message.includes('username')) {
          return NextResponse.json(
            { error: 'This username is already taken' },
            { status: 400 }
          );
        }
      }
      
      return NextResponse.json(
        { error: 'Failed to create account' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { message: 'User created successfully' },
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