import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    // To avoid credit card requirements for the prototype, we simulate an API response 
    // tailored to the local startup ecosystem. 
    const mockDatabase = [
      {
        name: "GreenBite Cloud Kitchen",
        company: "GreenBite Ltd.",
        email: "founder@greenbite.in",
        stage: "Ready for manufacturing",
        vision: `Looking to scale our ${query} operations across Gujarat. Need help with shelf-life extension.`,
      },
      {
        name: "Aarav Patel",
        company: "Sip & Sparkle Beverages",
        email: "aarav.p@sipsparkle.com",
        stage: "Have a recipe",
        vision: `Developing a low-sugar organic ${query}. Looking for R&D testing and nutritional labeling.`,
      },
      {
        name: "Priya Sharma",
        company: "NutriCrunch Snacks",
        email: "hello@nutricrunch.in",
        stage: "Just an idea",
        vision: `Want to create a high-protein ${query} snack for the fitness market. Need concept development.`,
      }
    ];

    // Simulate network delay for realism
    await new Promise(resolve => setTimeout(resolve, 1500));

    return NextResponse.json({ results: mockDatabase });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}