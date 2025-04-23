import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getSurvey, updateSurvey, deleteSurvey } from '@/lib/firestore';

// GET /api/surveys/[id] - Get a specific survey
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // This endpoint is public, no authentication required
    // because surveys can be shared with anyone
    
    const surveyId = params.id;
    
    if (!surveyId) {
      return NextResponse.json({ error: 'Survey ID is required' }, { status: 400 });
    }
    
    const survey = await getSurvey(surveyId);
    
    if (!survey) {
      return NextResponse.json({ error: 'Survey not found' }, { status: 404 });
    }
    
    return NextResponse.json(survey);
  } catch (error) {
    console.error('Error fetching survey:', error);
    return NextResponse.json({ error: 'Failed to fetch survey' }, { status: 500 });
  }
}

// PUT /api/surveys/[id] - Update a specific survey
export async function PUT(
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
    const data = await req.json();
    const { title, description, questions } = data;
    
    // Find the survey first to check ownership
    const existingSurvey = await getSurvey(surveyId);
    
    if (!existingSurvey) {
      return NextResponse.json({ error: 'Survey not found' }, { status: 404 });
    }
    
    // Check if the user owns this survey
    if (existingSurvey.createdBy !== userEmail) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }
    
    // Update the survey
    await updateSurvey(surveyId, { title, description, questions });
    
    // Return updated survey
    const updatedSurvey = await getSurvey(surveyId);
    
    return NextResponse.json(updatedSurvey);
  } catch (error) {
    console.error('Error updating survey:', error);
    return NextResponse.json({ error: 'Failed to update survey' }, { status: 500 });
  }
}

// DELETE /api/surveys/[id] - Delete a specific survey
export async function DELETE(
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
    const existingSurvey = await getSurvey(surveyId);
    
    if (!existingSurvey) {
      return NextResponse.json({ error: 'Survey not found' }, { status: 404 });
    }
    
    // Check if the user owns this survey
    if (existingSurvey.createdBy !== userEmail) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }
    
    // Delete the survey
    await deleteSurvey(surveyId);
    
    return NextResponse.json({ message: 'Survey deleted successfully' });
  } catch (error) {
    console.error('Error deleting survey:', error);
    return NextResponse.json({ error: 'Failed to delete survey' }, { status: 500 });
  }
} 