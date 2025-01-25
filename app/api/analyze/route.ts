import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { headers } from 'next/headers';

// Rate limiting map
const rateLimit = new Map();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    // Add validation here, before any other operations
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }

    // Get IP address for rate limiting
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') ?? 'unknown';
    
    // Basic rate limiting
    const now = Date.now();
    const lastRequest = rateLimit.get(ip) || 0;
    if (now - lastRequest < 1000) { // 1 request per second
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }
    rateLimit.set(ip, now);

    const { text } = await req.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Analyze sentiment using OpenAI
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a sentiment analysis expert. Analyze the following text and provide: \n1. Overall sentiment (positive/negative/neutral)\n2. Confidence score (0-1)\n3. Category (Product Quality/Customer Service/Pricing/Usability)\n4. Key phrases (up to 3)\n\nRespond in JSON format only."
        },
        {
          role: "user",
          content: text
        }
      ],
      model: "gpt-3.5-turbo",
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const result = JSON.parse(content);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return NextResponse.json(
      { error: 'Failed to analyze sentiment' },
      { status: 500 }
    );
  }
}