import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User.model';

export const dynamic = "force-dynamic";

export async function GET() {
  const start = Date.now();
  console.log("TEST-DB: Starting connection test...");
  
  try {
    // 1. Test Connection
    const conn = await dbConnect();
    const connectTime = Date.now() - start;
    console.log(`TEST-DB: Connected in ${connectTime}ms`);

    // 2. Test Query (Count users)
    const userCount = await User.countDocuments();
    const queryTime = Date.now() - start - connectTime;
    console.log(`TEST-DB: Query successful. Users: ${userCount}`);

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      stats: {
        connectTime: `${connectTime}ms`,
        queryTime: `${queryTime}ms`,
        userCount
      },
      env: {
        mongo_defined: !!process.env.MONGO_URL,
      }
    });

  } catch (error: any) {
    console.error("TEST-DB: Failed", error);
    return NextResponse.json({
      success: false,
      message: 'Database connection failed',
      error: error.message,
      stack: error.stack,
      duration: `${Date.now() - start}ms`
    }, { status: 500 });
  }
}
