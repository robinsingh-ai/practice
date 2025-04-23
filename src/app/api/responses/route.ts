import { NextRequest, NextResponse } from 'next/server';
import { getSurvey, submitResponse } from '@/lib/firestore';

// POST /api/responses - Submit a survey response
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { surveyId, answers, respondentEmail } = data;
    
    if (!surveyId || !answers || !Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: surveyId, answers' },
        { status: 400 }
      );
    }
    
    // Verify that the survey exists
    const survey = await getSurvey(surveyId);
    
    if (!survey) {
      return NextResponse.json({ error: 'Survey not found' }, { status: 404 });
    }
    
    // Create the response in Firestore
    const responseId = await submitResponse({
      surveyId,
      answers,
      respondentEmail,
    });
    
    return NextResponse.json({ 
      id: responseId,
      surveyId,
      answers,
      respondentEmail
    }, { status: 201 });
  } catch (error) {
    console.error('Error submitting response:', error);
    return NextResponse.json({ error: 'Failed to submit response' }, { status: 500 });
  }
} 