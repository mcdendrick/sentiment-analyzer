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
    const ip = headersList.get('x-forwarded-for') || 'unknown';
    
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
          content: `You are a sentiment analysis expert. Analyze the following text and provide:
1. Overall sentiment (must be exactly one of: "Positive", "Negative", "Neutral")
2. Confidence score (0-1)
3. Category (must be exactly one of: "Product Quality", "Customer Service", "Pricing", "Usability")
4. Key phrases (exactly 3 key phrases)

Respond in JSON format with the following structure:
{
  "overallSentiment": "Positive" | "Negative" | "Neutral",
  "confidence": number,
  "category": "Product Quality" | "Customer Service" | "Pricing" | "Usability",
  "keyPhrases": string[]
}`
        },
        {
          role: "user",
          content: text
        }
      ],
      model: "gpt-3.5-turbo",
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const result = JSON.parse(content);
    
    // Validate the response structure
    if (!['Positive', 'Negative', 'Neutral'].includes(result.overallSentiment)) {
      throw new Error('Invalid sentiment value');
    }

    if (!['Product Quality', 'Customer Service', 'Pricing', 'Usability'].includes(result.category)) {
      throw new Error('Invalid category value');
    }

    if (typeof result.confidence !== 'number' || result.confidence < 0 || result.confidence > 1) {
      throw new Error('Invalid confidence value');
    }

    if (!Array.isArray(result.keyPhrases) || result.keyPhrases.length === 0) {
      result.keyPhrases = [];
    }

    console.log('API Response:', result);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return NextResponse.json(
      { error: 'Failed to analyze sentiment' },
      { status: 500 }
    );
  }
}