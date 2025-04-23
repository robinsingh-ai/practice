import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from './firebase';

export interface Question {
  id: string;
  type: 'text' | 'multipleChoice';
  question: string;
  options?: string[];
}

export interface Survey {
  id?: string;
  title: string;
  description: string;
  questions: Question[];
  createdBy: string;
  createdAt?: Timestamp;
}

export interface Answer {
  questionId: string;
  answer: string | string[];
}

export interface Response {
  id?: string;
  surveyId: string;
  answers: Answer[];
  respondentEmail?: string;
  createdAt?: Timestamp;
}

// Helper to convert Firestore data to our models
const surveyConverter = {
  toFirestore: (survey: Survey): DocumentData => {
    // Ensure all questions have required fields and filter out empty options
    const sanitizedQuestions = survey.questions.map(q => ({
      id: q.id,
      type: q.type,
      question: q.question,
      // Only include options for multiple choice questions, and ensure it's never undefined
      ...(q.type === 'multipleChoice' && {
        options: q.options && q.options.length > 0 ? q.options : []
      })
    }));

    return {
      title: survey.title,
      description: survey.description,
      questions: sanitizedQuestions,
      createdBy: survey.createdBy,
      createdAt: survey.createdAt || Timestamp.now()
    };
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot): Survey => {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      title: data.title || '',
      description: data.description || '',
      questions: Array.isArray(data.questions) ? data.questions : [],
      createdBy: data.createdBy || '',
      createdAt: data.createdAt
    };
  }
};

const responseConverter = {
  toFirestore: (response: Response): DocumentData => {
    return {
      surveyId: response.surveyId,
      answers: response.answers || [],
      respondentEmail: response.respondentEmail || null,
      createdAt: response.createdAt || Timestamp.now()
    };
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot): Response => {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      surveyId: data.surveyId || '',
      answers: Array.isArray(data.answers) ? data.answers : [],
      respondentEmail: data.respondentEmail || null,
      createdAt: data.createdAt
    };
  }
};

// Survey functions
export async function createSurvey(survey: Survey): Promise<string> {
  try {
    const surveysCol = collection(db, 'surveys');
    const docRef = await addDoc(surveysCol, surveyConverter.toFirestore(survey));
    return docRef.id;
  } catch (error) {
    console.error('Error creating survey:', error);
    throw error;
  }
}

export async function getSurvey(id: string): Promise<Survey | null> {
  try {
    const docRef = doc(db, 'surveys', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Survey;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting survey:', error);
    return null;
  }
}

export async function getUserSurveys(userId: string): Promise<Survey[]> {
  try {
    const surveysCol = collection(db, 'surveys');
    const q = query(surveysCol, where('createdBy', '==', userId), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Survey));
  } catch (error) {
    console.error('Error getting user surveys:', error);
    return [];
  }
}

export async function updateSurvey(id: string, survey: Partial<Survey>): Promise<void> {
  try {
    const docRef = doc(db, 'surveys', id);
    // Remove id from update data if it exists
    const { id: _, ...updateData } = survey;
    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('Error updating survey:', error);
    throw error;
  }
}

export async function deleteSurvey(id: string): Promise<void> {
  try {
    const docRef = doc(db, 'surveys', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting survey:', error);
    throw error;
  }
}

// Response functions
export async function submitResponse(response: Response): Promise<string> {
  try {
    const responsesCol = collection(db, 'responses');
    const docRef = await addDoc(responsesCol, responseConverter.toFirestore(response));
    return docRef.id;
  } catch (error) {
    console.error('Error submitting response:', error);
    throw error;
  }
}

export async function getSurveyResponses(surveyId: string): Promise<Response[]> {
  try {
    const responsesCol = collection(db, 'responses');
    const q = query(responsesCol, where('surveyId', '==', surveyId), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Response));
  } catch (error) {
    console.error('Error getting survey responses:', error);
    return [];
  }
}

export async function countSurveyResponses(surveyId: string): Promise<number> {
  try {
    const responsesCol = collection(db, 'responses');
    const q = query(responsesCol, where('surveyId', '==', surveyId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.size;
  } catch (error) {
    console.error('Error counting survey responses:', error);
    return 0;
  }
} 