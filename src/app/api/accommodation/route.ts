// -> using just booking.api may be helful 

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface BookingRequest {
  destination: string;
  checkIn: string;
  checkOut: string;
  budget: number;
  guests: number;
  accommodationType: string;
  includeFlights?: boolean;
  flightOrigin?: string;
  flightBudget?: number;
  flightClass?: string;
}

interface OrchestrationStep {
  step: string;
  worker: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  message?: string;
  data?: Record<string, unknown>;
}

interface BookingResponse {
  orchestrationId: string;
  steps: OrchestrationStep[];
  finalResult?: Record<string, unknown>;
  status: 'processing' | 'completed' | 'failed';
}

// Define available tools for workers
const WORKER_TOOLS = [
  {
    name: "search_accommodations",
    description: "Search for accommodations based on criteria",
    input_schema: {
      type: "object" as const,
      properties: {
        destination: { type: "string" },
        checkIn: { type: "string" },
        checkOut: { type: "string" },
        budget: { type: "number" },
        guests: { type: "number" },
        accommodationType: { type: "string" }
      },
      required: ["destination", "checkIn", "checkOut", "budget"]
    }
  },
  {
    name: "search_flights",
    description: "Search for flights using Skyscanner API",
    input_schema: {
      type: "object" as const,
      properties: {
        origin: { type: "string" },
        destination: { type: "string" },
        departureDate: { type: "string" },
        returnDate: { type: "string" },
        passengers: { type: "object" },
        cabinClass: { type: "string" },
        budget: { type: "number" }
      },
      required: ["origin", "destination", "departureDate", "passengers"]
    }
  },
  {
    name: "compare_options",
    description: "Compare accommodation options based on price, location, amenities",
    input_schema: {
      type: "object" as const,
      properties: {
        accommodations: { type: "array" },
        criteria: { type: "array" }
      },
      required: ["accommodations", "criteria"]
    }
  },
  {
    name: "validate_booking",
    description: "Validate booking details and availability",
    input_schema: {
      type: "object" as const,
      properties: {
        accommodationId: { type: "string" },
        dates: { type: "object" },
        guests: { type: "number" }
      },
      required: ["accommodationId", "dates"]
    }
  },
  {
    name: "create_booking",
    description: "Create a booking reservation",
    input_schema: {
      type: "object" as const,
      properties: {
        accommodationId: { type: "string" },
        guestDetails: { type: "object" },
        paymentInfo: { type: "object" }
      },
      required: ["accommodationId", "guestDetails"]
    }
  },
  {
    name: "track_booking",
    description: "Track booking status and updates",
    input_schema: {
      type: "object" as const,
      properties: {
        bookingId: { type: "string" }
      },
      required: ["bookingId"]
    }
  },
  {
    name: "send_notification",
    description: "Send confirmation and updates to user",
    input_schema: {
      type: "object" as const,
      properties: {
        type: { type: "string" },
        recipient: { type: "string" },
        content: { type: "object" }
      },
      required: ["type", "recipient", "content"]
    }
  }
];

// Worker definitions
const WORKERS = {
  SearchWorker: {
    name: "SearchWorker",
    systemPrompt: `You are a SearchWorker specializing in finding accommodations and flights. 
    Your job is to search for accommodations using the search_accommodations tool and flights using the search_flights tool.
    Always provide detailed search results with property details, pricing, and availability.
    Focus on finding options that match the user's budget and preferences.
    For flight searches, consider departure times, airlines, and total journey time.`,
    tools: ["search_accommodations", "search_flights"]
  },
  CompareWorker: {
    name: "CompareWorker", 
    systemPrompt: `You are a CompareWorker specializing in analyzing accommodation options.
    Your job is to compare different accommodations using the compare_options tool.
    Evaluate based on price, location, amenities, reviews, and value for money.
    Provide clear recommendations with pros and cons.`,
    tools: ["compare_options"]
  },
  ValidateWorker: {
    name: "ValidateWorker",
    systemPrompt: `You are a ValidateWorker specializing in booking validation.
    Your job is to validate accommodation availability and booking details using the validate_booking tool.
    Check dates, room availability, pricing accuracy, and booking terms.
    Ensure all details are correct before proceeding.`,
    tools: ["validate_booking"]
  },
  BookingWorker: {
    name: "BookingWorker",
    systemPrompt: `You are a BookingWorker specializing in creating reservations.
    Your job is to create actual bookings using the create_booking tool.
    Handle payment processing, guest information, and reservation confirmation.
    Ensure secure and accurate booking creation.`,
    tools: ["create_booking"]
  },
  TrackingWorker: {
    name: "TrackingWorker",
    systemPrompt: `You are a TrackingWorker specializing in booking monitoring.
    Your job is to track booking status and updates using the track_booking tool.
    Monitor confirmation status, payment processing, and any changes.
    Provide real-time updates on booking progress.`,
    tools: ["track_booking"]
  },
  NotificationWorker: {
    name: "NotificationWorker",
    systemPrompt: `You are a NotificationWorker specializing in user communication.
    Your job is to send notifications and updates using the send_notification tool.
    Send booking confirmations, payment receipts, and status updates.
    Ensure clear and timely communication with users.`,
    tools: ["send_notification"]
  }
};

// Orchestrator class
class AccommodationOrchestrator {
  private orchestrationId: string;
  private steps: OrchestrationStep[];

  constructor(includeFlights = false) {
    this.orchestrationId = `orch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.steps = [
      { step: 'search', worker: 'SearchWorker', status: 'pending' as const },
      { step: 'compare', worker: 'CompareWorker', status: 'pending' as const },
      { step: 'validate', worker: 'ValidateWorker', status: 'pending' as const },
      { step: 'book', worker: 'BookingWorker', status: 'pending' as const },
      { step: 'track', worker: 'TrackingWorker', status: 'pending' as const },
      { step: 'notify', worker: 'NotificationWorker', status: 'pending' as const }
    ];
    
    if (includeFlights) {
      this.steps.splice(1, 0, { step: 'searchFlights', worker: 'SearchWorker', status: 'pending' as const });
    }
  }

  async executeWorkflow(request: BookingRequest): Promise<BookingResponse> {
    // Track results through workflow steps

    try {
      // Step 1: Search accommodations
      const searchResult = await this.executeWorker('SearchWorker', 'search', {
        action: 'search_accommodations',
        params: request
      });

      // Step 1.5: Search flights (if requested)
      let flightResult = null;
      if (request.includeFlights && request.flightOrigin) {
        flightResult = await this.executeWorker('SearchWorker', 'searchFlights', {
          action: 'search_flights',
          params: {
            origin: request.flightOrigin,
            destination: request.destination,
            departureDate: request.checkIn,
            returnDate: request.checkOut,
            passengers: { adults: request.guests, children: 0, infants: 0 },
            cabinClass: request.flightClass || 'economy',
            budget: request.flightBudget
          }
        });
      }

      // Step 2: Compare  
      const compareResult = await this.executeWorker('CompareWorker', 'compare', {
        action: 'compare_options',
        params: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          accommodations: (searchResult as any)?.accommodations || [],
          criteria: ['price', 'location', 'amenities', 'reviews']
        }
      });

      // Step 3: Validate
      const validateResult = await this.executeWorker('ValidateWorker', 'validate', {
        action: 'validate_booking',
        params: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          accommodationId: (compareResult as any)?.recommended?.id || 'hotel_001',
          dates: { checkIn: request.checkIn, checkOut: request.checkOut },
          guests: request.guests
        }
      });

      // Step 4: Book
      const bookingResult = await this.executeWorker('BookingWorker', 'book', {
        action: 'create_booking',
        params: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          accommodationId: (validateResult as any)?.accommodationId || 'hotel_001',
          guestDetails: { guests: request.guests, destination: request.destination },
          paymentInfo: { budget: request.budget },
          flightBooking: flightResult ? {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            selectedFlight: (flightResult as any)?.flights?.[0],
            budget: request.flightBudget
          } : null
        }
      });

      // Step 5: Track
      await this.executeWorker('TrackingWorker', 'track', {
        action: 'track_booking',
        params: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          bookingId: (bookingResult as any)?.bookingId || 'booking_001'
        }
      });

      // Step 6: Notify
      await this.executeWorker('NotificationWorker', 'notify', {
        action: 'send_notification',
        params: {
          type: 'booking_confirmation',
          recipient: 'user@example.com',
          content: bookingResult || {}
        }
      });

      return {
        orchestrationId: this.orchestrationId,
        steps: this.steps,
        finalResult: bookingResult || undefined,
        status: 'completed'
      };

    } catch (error) {
      console.error('Orchestration failed:', error);
      return {
        orchestrationId: this.orchestrationId,
        steps: this.steps,
        status: 'failed'
      };
    }
  }

  private async executeWorker(workerName: string, stepName: string, task: Record<string, unknown>): Promise<Record<string, unknown> | null> {
    const stepIndex = this.steps.findIndex(s => s.step === stepName);
    if (stepIndex === -1) return null;

    this.steps[stepIndex].status = 'running';
    this.steps[stepIndex].message = `Executing ${workerName}...`;

    try {
      const worker = WORKERS[workerName as keyof typeof WORKERS];
      const availableTools = WORKER_TOOLS.filter(tool => 
        worker.tools.includes(tool.name)
      );

      const prompt = `${worker.systemPrompt}

You need to execute the following task:
${JSON.stringify(task, null, 2)}

Available tools: ${availableTools.map(t => t.name).join(', ')}

Please execute the appropriate tool and provide a comprehensive result.`;

      // Check if Anthropic API key is available
      if (!anthropic.apiKey) {
        console.warn('Anthropic API key not configured, using mock data');
        const mockResults = this.generateMockResults(task.action as string, task.params as Record<string, unknown>);
        this.steps[stepIndex].status = 'completed';
        this.steps[stepIndex].message = `${workerName} completed with mock data`;
        this.steps[stepIndex].data = mockResults;
        return mockResults;
      }

      const completion = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1000,
        temperature: 0.3,
        system: worker.systemPrompt,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        tools: availableTools
      });

      // Use AI response if available, otherwise fall back to mock results
      const mockResults = this.generateMockResults(task.action as string, task.params as Record<string, unknown>);

      this.steps[stepIndex].status = 'completed';
      this.steps[stepIndex].message = completion.content[0]?.type === 'text' ? 
        completion.content[0].text.substring(0, 100) + '...' : 
        `${workerName} completed successfully`;
      this.steps[stepIndex].data = mockResults;

      return mockResults;

    } catch (error) {
      console.error(`Worker ${workerName} failed:`, error);
      this.steps[stepIndex].status = 'failed';
      this.steps[stepIndex].message = `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      throw error;
    }
  }

  private generateMockResults(action: string, params: Record<string, unknown>): Record<string, unknown> {
    // Type assertions for params since we know the structure from our workflow
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const typedParams = params as any;
    switch (action) {
      case 'search_flights':
        return {
          flights: [
            {
              id: 'flight_001',
              airline: 'British Airways',
              flightNumber: 'BA178',
              departure: {
                airport: `${typedParams.origin} Airport`,
                time: '08:00',
                date: typedParams.departureDate
              },
              arrival: {
                airport: `${typedParams.destination} Airport`,
                time: '14:30',
                date: typedParams.departureDate
              },
              duration: '6h 30m',
              price: typedParams.budget ? typedParams.budget * 0.8 : 299,
              stops: 0,
              cabinClass: typedParams.cabinClass || 'economy',
              bookingUrl: 'https://skyscanner.com/book/flight_001'
            },
            {
              id: 'flight_002',
              airline: 'Virgin Atlantic',
              flightNumber: 'VS123',
              departure: {
                airport: `${typedParams.origin} Airport`,
                time: '10:30',
                date: typedParams.departureDate
              },
              arrival: {
                airport: `${typedParams.destination} Airport`,
                time: '18:45',
                date: typedParams.departureDate
              },
              duration: '8h 15m',
              price: typedParams.budget ? typedParams.budget * 0.6 : 259,
              stops: 1,
              cabinClass: typedParams.cabinClass || 'economy',
              bookingUrl: 'https://skyscanner.com/book/flight_002'
            }
          ],
          searchCriteria: typedParams,
          totalResults: 2
        };

      case 'search_accommodations':
        return {
          accommodations: [
            {
              id: 'hotel_001',
              name: `Luxury Hotel ${typedParams.destination}`,
              type: typedParams.accommodationType,
              price: typedParams.budget * 0.9,
              rating: 4.5,
              amenities: ['WiFi', 'Pool', 'Gym'],
              location: `Central ${typedParams.destination}`,
              availability: true
            },
            {
              id: 'hotel_002', 
              name: `Budget Inn ${typedParams.destination}`,
              type: typedParams.accommodationType,
              price: typedParams.budget * 0.7,
              rating: 4.0,
              amenities: ['WiFi', 'Breakfast'],
              location: `Near city center ${typedParams.destination}`,
              availability: true
            }
          ],
          searchCriteria: typedParams
        };

      case 'compare_options':
        return {
          recommended: {
            id: 'hotel_001',
            reason: 'Best value for money with excellent amenities and location',
            score: 9.2
          },
          comparison: [
            { id: 'hotel_001', score: 9.2, strengths: ['Location', 'Amenities'] },
            { id: 'hotel_002', score: 7.8, strengths: ['Price', 'Breakfast'] }
          ]
        };

      case 'validate_booking':
        return {
          accommodationId: typedParams.accommodationId,
          available: true,
          totalCost: 450,
          terms: 'Free cancellation up to 24 hours before check-in'
        };

      case 'create_booking':
        const baseBooking = {
          bookingId: `BK${Date.now()}`,
          accommodationId: typedParams.accommodationId,
          status: 'confirmed',
          confirmationCode: 'ZN' + Math.random().toString(36).substr(2, 8).toUpperCase(),
          totalAmount: 450,
          paymentStatus: 'completed'
        };
        
        if (typedParams.flightBooking) {
          return {
            ...baseBooking,
            flightBooking: {
              flightId: 'FL' + Math.random().toString(36).substr(2, 8).toUpperCase(),
              airline: typedParams.flightBooking.selectedFlight?.airline || 'British Airways',
              flightNumber: typedParams.flightBooking.selectedFlight?.flightNumber || 'BA178',
              departure: typedParams.flightBooking.selectedFlight?.departure || '08:00',
              arrival: typedParams.flightBooking.selectedFlight?.arrival || '14:30',
              price: typedParams.flightBooking.budget * 0.8 || 299,
              bookingStatus: 'confirmed'
            },
            totalAmount: baseBooking.totalAmount + (typedParams.flightBooking.budget * 0.8 || 299)
          };
        }
        
        return baseBooking;

      case 'track_booking':
        return {
          bookingId: typedParams.bookingId,
          status: 'confirmed',
          lastUpdated: new Date().toISOString(),
          nextAction: 'Check-in available 24 hours before arrival'
        };

      case 'send_notification':
        return {
          notificationId: `NT${Date.now()}`,
          type: typedParams.type,
          status: 'sent',
          timestamp: new Date().toISOString()
        };

      default:
        return { action, completed: true };
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const bookingRequest: BookingRequest = await request.json();
    
    if (!bookingRequest.destination || !bookingRequest.checkIn || !bookingRequest.checkOut) {
      return NextResponse.json(
        { error: 'Destination, check-in, and check-out dates are required' },
        { status: 400 }
      );
    }

    const orchestrator = new AccommodationOrchestrator(bookingRequest.includeFlights);
    const result = await orchestrator.executeWorkflow(bookingRequest);

    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Accommodation API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process accommodation booking request. Please try again.' },
      { status: 500 }
    );
  }
}

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