//just using  the skyscanner api here 

import { NextRequest, NextResponse } from 'next/server';
import { skyscannerAPI, FlightSearchParams } from '@/lib/skyscanner-api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { origin, destination, departureDate, passengers, cabinClass } = body;
    
    if (!origin || !destination || !departureDate || !passengers) {
      return NextResponse.json(
        { error: 'Missing required fields: origin, destination, departureDate, passengers' },
        { status: 400 }
      );
    }

    // Prepare search parameters
    const searchParams: FlightSearchParams = {
      origin: origin,
      destination: destination,
      departureDate: departureDate,
      returnDate: body.returnDate,
      passengers: {
        adults: passengers.adults || 1,
        children: passengers.children || 0,
        infants: passengers.infants || 0
      },
      cabinClass: cabinClass || 'economy',
      currency: body.currency || 'USD',
      locale: body.locale || 'en-US',
      maxPrice: body.maxPrice,
      stops: body.stops
    };

    // Search for flights
    const flightResults = await skyscannerAPI.searchFlights(searchParams);

    return NextResponse.json(flightResults);

  } catch (error) {
    console.error('Flight search API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to search flights', 
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const locale = searchParams.get('locale') || 'en-US';

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }

    // Get airport suggestions
    const airports = await skyscannerAPI.getAirportSuggestions(query, locale);

    return NextResponse.json({ airports });

  } catch (error) {
    console.error('Airport search API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to search airports',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}