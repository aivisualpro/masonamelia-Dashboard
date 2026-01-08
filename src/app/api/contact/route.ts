export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Contact from '@/lib/models/Contact.model';

export async function GET() {
  await dbConnect();
  
  try {
    // Assuming there's only one contact info document, get the first one
    const contact = await Contact.findOne();
    return NextResponse.json({ success: true, data: contact });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  await dbConnect();
  
  try {
    const body = await request.json();
    
    // Check if a document already exists
    let contact = await Contact.findOne();
    
    if (contact) {
      // Update existing
      contact = await Contact.findByIdAndUpdate(contact._id, body, {
        new: true,
        runValidators: true
      });
    } else {
      // Create new
      contact = await Contact.create(body);
    }
    
    return NextResponse.json({ success: true, data: contact }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
