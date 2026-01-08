import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { name, email, username, password } = await request.json();

    // Validate required fields
    if (!name || !email || !username || !password) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Import the User model dynamically
    const UserModel = (await import('@/lib/models/User.model')).default || require('@/lib/models/User.model');

    // Check if user already exists
    const existingUser = await UserModel.findOne({ $or: [{ email }, { username }] });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User with this email or username already exists' },
        { status: 409 }
      );
    }

    // Create new user (Note: In production, you should hash the password using bcrypt)
    const newUser = new UserModel({
      name,
      email,
      username,
      password // TODO: Hash password with bcrypt before storing
    });

    await newUser.save();

    // Return success
    return NextResponse.json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        username: newUser.username
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Registration error:', error);
    console.error('Error details:', error.message, error.stack);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
