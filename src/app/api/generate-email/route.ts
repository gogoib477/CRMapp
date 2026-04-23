import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { name, company, stage, vision } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.log("❌ BACKEND ERROR: Missing GEMINI_API_KEY in .env.local");
      return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
    }

    const prompt = `You are a sales executive at Foodsure. Write a short, friendly outbound email to a lead.
    Lead Name: ${name}
    Lead Company: ${company ? company : 'their company'}
    Product Stage: ${stage}
    Their Vision: "${vision}"
    Goal: Acknowledge their vision and ask for a 15-minute call. Keep it under 150 words.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const data = await response.json();

    if (data.error) {
      console.log("❌ GOOGLE API ERROR:", data.error.message);
      return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    const emailDraft = data.candidates[0].content.parts[0].text;
    console.log("✅ SUCCESS! Draft generated.");
    
    return NextResponse.json({ draft: emailDraft });

  } catch (error: any) {
    console.log("❌ SERVER CRASH:", error.message);
    return NextResponse.json({ error: "Server crashed" }, { status: 500 });
  }
}