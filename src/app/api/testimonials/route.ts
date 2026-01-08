export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Review from '@/lib/models/Review.model';

export async function GET() {
  await dbConnect();
  
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: reviews });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  await dbConnect();
  
  try {
    const body = await request.json();
    const { name, review, location } = body;

    if (!name || !review || !location) {
      return NextResponse.json(
        { success: false, message: 'Name, review, and location are required' },
        { status: 400 }
      );
    }

    const newReview = await Review.create(body);
    return NextResponse.json({ success: true, data: newReview }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
