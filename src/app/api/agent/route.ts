// app/api/agent/route.ts -> routing agent & restaurant + co-working spaces required
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface TravelCategoryOutput {
  category: string;
  reasoning: string;
}

interface AgentResponse {
  agent_name: string;
  response: string;
  category: string;
}

// Agent configurations
const AGENTS = {
  information: {
    name: "Digital Travel Agent",
    systemPrompt: `You are a specialist in visa, tax, and in-country government regulations for digital nomad travelers. 
    You provide help with visas, tax, and regulations guidance to digital nomad travelers. 
    Seek further information from user if unsure, and keep answers concise and helpful.
    Focus on practical, actionable advice for remote workers and digital nomads.`
  },
  transport: {
    name: "Transport Agent", 
    systemPrompt: `You are a specialist in arranging accommodation and travel.
    You provide help with travel arrangements including searching flights/trains, checking accommodation availability, 
    helping to share alternate routes and hidden gems within a destination. 
    Keep your answers concise but comprehensive. Focus on practical travel solutions.`
  },
  dining: {
    name: "Dining Agent",
    systemPrompt: `You are a specialist in food availability in different regions of the world.
    You provide help with eating options while traveling. You take into account the dietary preferences 
    of the traveler, and suggest suitable options based on price feedback from the user.
    Keep responses practical and budget-conscious.`
  }
};

async function classifyTravelQuery(message: string): Promise<TravelCategoryOutput> {
  const classificationPrompt = `
    You are a classifier. Based on the user's travel question, classify it into one of the following:
    - "information": if it's about visas, taxes, or in-country regulations.
    - "transport": if it's about travel, accommodation, routes, or how to get around.
    - "dining": if it's about food, dietary restrictions, or restaurants.

    User query: "${message}"

    Respond in JSON format with:
    {
      "category": "information|transport|dining",
      "reasoning": "explain your classification decision"
    }
  `;

  try {
    const completion = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      temperature: 0.1,
      messages: [
        {
          role: "user",
          content: classificationPrompt
        }
      ]
    });

    const result = completion.content[0].type === 'text' ? completion.content[0].text : null;
    if (!result) throw new Error("No classification result");
    
    return JSON.parse(result) as TravelCategoryOutput;
  } catch (error) {
    console.error("Classification error:", error);
    // Default fallback
    return {
      category: "information",
      reasoning: "Failed to classify, defaulting to information category"
    };
  }
}

async function runSpecialistAgent(category: string, message: string): Promise<string> {
  const agent = AGENTS[category as keyof typeof AGENTS];
  if (!agent) {
    throw new Error(`Unknown agent category: ${category}`);
  }

  try {
    const completion = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 500,
      temperature: 0.7,
      system: agent.systemPrompt,
      messages: [
        {
          role: "user",
          content: message
        }
      ]
    });

    return completion.content[0].type === 'text' ? completion.content[0].text : "I apologize, but I couldn't generate a response.";
  } catch (error) {
    console.error(`Error with ${agent.name}:`, error);
    throw new Error(`Failed to get response from ${agent.name}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    // Step 1: Classify the query
    const classification = await classifyTravelQuery(message);
    
    // Step 2: Route to appropriate specialist agent
    const response = await runSpecialistAgent(classification.category, message);
    
    // Step 3: Return structured response
    const agentResponse: AgentResponse = {
      agent_name: AGENTS[classification.category as keyof typeof AGENTS].name,
      response: response,
      category: classification.category
    };

    return NextResponse.json(agentResponse);
    
  } catch (error) {
    console.error('Agent API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process your travel query. Please try again.' },
      { status: 500 }
    );
  }
}

// Handle CORS for development
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}