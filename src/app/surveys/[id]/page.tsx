'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import SurveyQuestion from '@/components/SurveyQuestion';
import { getSurvey, Survey, Answer, submitResponse } from '@/lib/firestore';
import { useAuth } from '@/contexts/AuthContext';

export default function SurveyPage({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = typeof params === 'object' && !('then' in params) ? params : use(params);
  const surveyId = resolvedParams.id;
  const { user } = useAuth();
  
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        console.log('Fetching survey with ID:', surveyId);
        const surveyData = await getSurvey(surveyId);
        
        if (!surveyData) {
          setError('Survey not found');
          return;
        }
        
        setSurvey(surveyData);
        
        // Initialize answers
        const initialAnswers: Record<string, string | string[]> = {};
        surveyData.questions.forEach((question) => {
          initialAnswers[question.id] = question.type === 'text' ? '' : '';
        });
        setAnswers(initialAnswers);
      } catch (error) {
        console.error('Error fetching survey:', error);
        setError('Failed to load survey');
      } finally {
        setLoading(false);
      }
    };

    fetchSurvey();
  }, [surveyId]);

  const handleAnswerChange = (questionId: string, answer: string | string[]) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!survey) return;
    
    // Check if all questions are answered
    const unansweredQuestions = survey.questions.filter((q) => {
      const answer = answers[q.id];
      return !answer || (typeof answer === 'string' && answer.trim() === '');
    });
    
    if (unansweredQuestions.length > 0) {
      alert('Please answer all questions before submitting.');
      return;
    }
    
    // For anonymous surveys, we don't require login
    // But if the user is logged in, we'll store their email
    if (!user) {
      const proceed = confirm('You are not logged in. Continue anonymously?');
      if (!proceed) {
        router.push('/login?redirect=' + encodeURIComponent(`/surveys/${surveyId}`));
        return;
      }
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare submission data
      const formattedAnswers: Answer[] = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer,
      }));
      
      await submitResponse({
        surveyId,
        answers: formattedAnswers,
        respondentEmail: user?.email || undefined,
      });
      
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting response:', error);
      alert('Failed to submit response. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8 text-center">
        <h1 className="text-2xl font-bold mb-4 text-red-600">{error}</h1>
        <button
          onClick={() => router.push('/')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-md transition-colors"
        >
          Back to Home
        </button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8 text-center">
        <svg
          className="w-16 h-16 text-green-500 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          ></path>
        </svg>
        <h1 className="text-2xl font-bold mb-4">Thank You!</h1>
        <p className="text-gray-600 mb-6">
          Your response has been successfully submitted.
        </p>
        <button
          onClick={() => router.push('/')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-md transition-colors"
        >
          Back to Home
        </button>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Survey Not Found</h1>
        <button
          onClick={() => router.push('/')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-md transition-colors"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h1 className="text-2xl font-bold mb-2">{survey.title}</h1>
        <p className="text-gray-600">{survey.description}</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        {survey.questions.map((question) => (
          <SurveyQuestion
            key={question.id}
            question={question}
            onChange={handleAnswerChange}
            value={answers[question.id] || ''}
          />
        ))}
        
        <div className="flex justify-end mb-8">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Response'}
          </button>
        </div>
      </form>
    </div>
  );
} 