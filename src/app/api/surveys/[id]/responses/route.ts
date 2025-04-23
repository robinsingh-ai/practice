import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { getSurvey, getSurveyResponses } from '@/lib/firestore';

// GET /api/surveys/[id]/responses - Get all responses for a survey
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const userEmail = session.user.email;
    if (!userEmail) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 });
    }
    
    const surveyId = params.id;
    
    // Find the survey first to check ownership
    const survey = await getSurvey(surveyId);
    
    if (!survey) {
      return NextResponse.json({ error: 'Survey not found' }, { status: 404 });
    }
    
    // Check if the user owns this survey
    if (survey.createdBy !== userEmail) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }
    
    // Get all responses for this survey from Firestore
    const responses = await getSurveyResponses(surveyId);
    
    return NextResponse.json(responses);
  } catch (error) {
    console.error('Error fetching responses:', error);
    return NextResponse.json({ error: 'Failed to fetch responses' }, { status: 500 });
  }
} 