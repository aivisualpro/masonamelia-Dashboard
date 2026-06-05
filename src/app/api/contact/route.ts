export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Contact from '@/lib/models/Contact.model';

export async function GET() {
  await dbConnect();
  
  try {
    // Assuming there's only one contact info document, get the first one
    let contact = await Contact.findOne();

    // Auto-backfill new fields on legacy documents
    if (contact) {
      const defaults: Record<string, string> = {
        team_hero_title: 'Meet the Team',
        team_hero_description: 'Meet the aviation experts and passionate professionals behind Mason Amelia. Our mission is to elevate your flight experience through transparency, expertise, and personalized service.',
        higher_hero_title_white: "We're More Than Brokers —",
        higher_hero_title_blue: "We're Storytellers",
        higher_hero_description: "If Your Broker Isn't Crafting a Marketing Plan as Compelling as the Aircraft Itself, They're Not Truly Selling It",
        higher_vision_title: 'Looking for Higher on YouTube',
        higher_vision_subtitle: "When you partner with Mason Amelia, you're not just getting a brokerage—you're getting a full-service, marketing-driven strategy to maximize visibility and find the right buyer.",
        higher_vision_body1: "At Mason Amelia, we're more than brokers; we're storytellers. While there are many brokers out there, few live truer to the aviation lifestyle than our founder, Jesse Adams, who started the YouTube channel, Looking for Higher, which now serves as Mason Amelia's video marketing platform. On the channel, you will find insights on the true experience of aircraft ownership from transitioning into a turbine to the freedom of flying family across the country.",
        higher_vision_body2: "Every video we create tells the unique story of each aircraft we represent, bringing its personality and capabilities to life in ways that resonate with prospective buyers. This storytelling approach is powerful and essential in today's market, where a listing alone doesn't cut it. If Your Broker Isn't Crafting a Marketing Plan as Compelling as the Aircraft Itself, They're Not Truly Selling It",
        skynet_hero_title_white: 'Mason Amelia Pricing Intelligence —',
        skynet_hero_title_blue: 'Powered by SkyNet',
        skynet_hero_description: 'No guesswork. No lag. Real-time market intelligence that gives our clients the sharpest edge; Fast, factual, and unbeatable.',
        skynet_advantage_title_white: 'Unlock',
        skynet_advantage_title_blue: "SkyNet's Data Advantage",
        skynet_advantage_description: '\u201CHold on, John Connor!\u201D because Mason Amelia\u2019s proprietary aircraft pricing app, SkyNet, employs a proprietary means of collecting, analyzing, and presenting transaction data. With no MLS substitute, this private data is the lifeblood that empowers our buyers and sellers. Simply put, SkyNet ensures every decision is powered by data and backed by Mason Amelia\u2019s experience.',
        skynet_timeline_title_white: 'The Evolution of SkyNet:',
        skynet_timeline_title_blue: 'A Timeline of Innovation',
        acquisition_hero_title_white: 'The Right Aircraft ',
        acquisition_hero_title_blue: 'Changes Everything',
        acquisition_hero_description: 'We take a consultative approach, learning your mission, analyzing the market, and guiding your acquisition from your first call to first flight.',
        brokerage_hero_title_white: 'A Strategic Hands-On Approach ',
        brokerage_hero_title_blue: 'to Selling Your Aircraft',
        brokerage_hero_description: 'Your aircraft deserves to stand out. We highlight its strengths and handle every phase with intent, precision, and the relentless pursuit of perfection.',
        insurance_hero_title_white: 'Aircraft ',
        insurance_hero_title_blue: 'Insurance',
        insurance_hero_description: 'Our trusted partners at Titan Insurance specialize exclusively in high-end owner-flown piston and turbine aircraft, backed by decades of aviation insurance expertise. Get a tailored quote today.',
      };
      const updates: Record<string, string> = {};
      for (const [key, val] of Object.entries(defaults)) {
        if (!(contact as any)[key]) updates[key] = val;
      }
      if (Object.keys(updates).length > 0) {
        contact = await Contact.findByIdAndUpdate(contact._id, { $set: updates }, { new: true });
      }
    }

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
