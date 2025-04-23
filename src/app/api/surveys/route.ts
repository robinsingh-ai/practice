import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { getUserSurveys, createSurvey } from '@/lib/firestore';

// GET /api/surveys - Get all surveys for the authenticated user
export async function GET(req: NextRequest) {
  try {
    console.log('GET /api/surveys - Getting user surveys');
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      console.log('User not authenticated');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userEmail = session.user.email;
    if (!userEmail) {
      console.log('User email not found in session');
      return NextResponse.json({ error: 'User email not found' }, { status: 400 });
    }

    console.log('Fetching surveys for user:', userEmail);
    const surveys = await getUserSurveys(userEmail);
    console.log(`Found ${surveys.length} surveys`);
    
    return NextResponse.json(surveys);
  } catch (error) {
    console.error('Error fetching surveys:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch surveys',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// POST /api/surveys - Create a new survey
export async function POST(req: NextRequest) {
  try {
    console.log('POST /api/surveys - Creating a new survey');
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      console.log('User not authenticated');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userEmail = session.user.email;
    if (!userEmail) {
      console.log('User email not found in session');
      return NextResponse.json({ error: 'User email not found' }, { status: 400 });
    }

    const data = await req.json();
    console.log('Received data:', JSON.stringify({
      title: data.title,
      description: data.description?.substring(0, 20) + '...',
      questionsCount: data.questions?.length || 0
    }));
    
    const { title, description, questions } = data;

    if (!title || !description || !questions || !Array.isArray(questions) || questions.length === 0) {
      console.log('Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields: title, description, questions' },
        { status: 400 }
      );
    }

    // Process data before sending to Firestore to avoid undefined values
    const surveyData = {
      title: title.trim(),
      description: description.trim(),
      questions: questions.map((q: any) => ({
        id: q.id,
        type: q.type,
        question: q.question.trim(),
        options: q.type === 'multipleChoice' && q.options 
          ? q.options.filter((opt: string) => opt && opt.trim() !== '') 
          : []
      })),
      createdBy: userEmail,
    };

    console.log('Creating survey with data:', JSON.stringify({
      title: surveyData.title,
      questionsCount: surveyData.questions.length,
      createdBy: surveyData.createdBy
    }));
    
    const surveyId = await createSurvey(surveyData);
    console.log('Survey created with ID:', surveyId);

    return NextResponse.json({ 
      id: surveyId, 
      title, 
      description, 
      questions, 
      createdBy: userEmail 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating survey:', error);
    return NextResponse.json({ 
      error: 'Failed to create survey',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 