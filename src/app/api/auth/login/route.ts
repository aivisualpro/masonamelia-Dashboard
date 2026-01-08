import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_KEY = process.env.JWT_KEY || 'masonAmelia';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Import the User model dynamically
    const UserModel = (await import('@/lib/models/User.model')).default || require('@/lib/models/User.model');

    // Find user by email
    const user = await UserModel.findOne({ email });

    if (!user) {
      console.log(`Login failed for ${email}: User not found`);
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check password (plain text comparison for now - you should use bcrypt in production)
    if (user.password !== password) {
      console.log(`Login failed for ${email}: Password mismatch`);
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email,
        name: user.name 
      },
      JWT_KEY,
      { expiresIn: '7d' }
    );

    // Return success with user data and token
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username
      },
      token
    });

  } catch (error: any) {
    console.error('Login error:', error);
    console.error('Error details:', error.message, error.stack);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
