'use client';

import { useState, useEffect, use } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSurvey, getSurveyResponses, Survey, Response } from '@/lib/firestore';
import { useAuth } from '@/contexts/AuthContext';

export default function SurveyResults({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  const resolvedParams = typeof params === 'object' && !('then' in params) ? params : use(params);
  const surveyId = resolvedParams.id;
  
  const { data: session, status } = useSession();
  const { user } = useAuth();
  const router = useRouter();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'individual'>('summary');

  useEffect(() => {
    // Fetch survey and responses
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch the survey
        const surveyData = await getSurvey(surveyId);
        console.log('Survey data:', surveyData);
        console.log('Current user ID:', user?.uid, 'Current user email:', user?.email);
        
        if (!surveyData) {
          setError('Survey not found');
          setLoading(false);
          return;
        }
        
        // Check if the current user is the survey creator
        // Handle both uid and email for backwards compatibility
        const hasPermission = 
          surveyData.createdBy === user?.uid || 
          surveyData.createdBy === user?.email;
          
        if (!hasPermission) {
          console.log('Permission denied - createdBy:', surveyData.createdBy);
          setError('You do not have permission to view these results');
          setLoading(false);
          return;
        }
        
        setSurvey(surveyData);
        
        // Fetch responses for this survey
        const responseData = await getSurveyResponses(surveyId);
        console.log('Response data:', responseData);
        setResponses(responseData);
        
      } catch (err) {
        console.error('Error fetching survey results:', err);
        setError('Failed to load survey results');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [surveyId, user]);

  // Generate summary statistics for multiple choice questions
  const generateSummary = () => {
    const summary: Record<string, Record<string, number>> = {};

    survey?.questions.forEach((question) => {
      if (question.type === 'multipleChoice' && question.options) {
        summary[question.id] = {};
        
        // Initialize with zero counts
        question.options.forEach((option) => {
          summary[question.id][option] = 0;
        });
        
        // Count responses
        responses.forEach((response) => {
          const answer = response.answers.find((a) => a.questionId === question.id);
          if (answer && typeof answer.answer === 'string') {
            summary[question.id][answer.answer] = (summary[question.id][answer.answer] || 0) + 1;
          }
        });
      }
    });

    return summary;
  };

  const summary = generateSummary();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <h2 className="text-xl font-semibold text-red-600 mb-4">{error}</h2>
        <button
          onClick={() => router.push('/dashboard')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-md transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <h2 className="text-xl font-semibold mb-4">Please sign in to view survey results</h2>
        <button
          onClick={() => router.push('/login')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-md transition-colors"
        >
          Sign In
        </button>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <h2 className="text-xl font-semibold mb-4">Survey not found</h2>
        <button
          onClick={() => router.push('/dashboard')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-md transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{survey.title} - Results</h1>
        <Link
          href={`/surveys/${surveyId}`}
          target="_blank"
          className="text-indigo-600 hover:text-indigo-800 flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
          View Survey
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <span className="text-sm text-gray-500">Total Responses</span>
            <p className="text-2xl font-bold">{responses.length}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Last Response</span>
            <p className="text-md font-medium">
              {responses.length > 0
                ? new Date(responses[0].createdAt).toLocaleDateString()
                : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex border-b border-gray-200">
          <button
            className={`py-3 px-6 font-medium text-sm ${
              activeTab === 'summary'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('summary')}
          >
            Summary
          </button>
          <button
            className={`py-3 px-6 font-medium text-sm ${
              activeTab === 'individual'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('individual')}
          >
            Individual Responses
          </button>
        </div>
      </div>

      {activeTab === 'summary' ? (
        <div>
          {survey.questions.map((question) => (
            <div key={question.id} className="bg-white rounded-lg shadow mb-6 p-6">
              <h3 className="text-lg font-medium mb-4">{question.question}</h3>
              
              {question.type === 'multipleChoice' ? (
                <div>
                  {question.options?.map((option) => {
                    const count = summary[question.id]?.[option] || 0;
                    const percentage = responses.length
                      ? Math.round((count / responses.length) * 100)
                      : 0;
                    
                    return (
                      <div key={option} className="mb-3">
                        <div className="flex justify-between mb-1">
                          <span>{option}</span>
                          <span>
                            {count} ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-indigo-600 h-2.5 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-3">
                  {responses.length > 0 ? (
                    responses.map((response, index) => {
                      const answer = response.answers.find(
                        (a) => a.questionId === question.id
                      );
                      return (
                        <div
                          key={index}
                          className="p-3 bg-gray-50 rounded-md text-gray-700"
                        >
                          {answer?.answer as string}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-500">No responses yet</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div>
          {responses.length > 0 ? (
            responses.map((response, index) => (
              <div key={response.id} className="bg-white rounded-lg shadow mb-6 p-6">
                <div className="flex justify-between mb-4">
                  <h3 className="font-medium">Response #{index + 1}</h3>
                  <div>
                    <span className="text-sm text-gray-500 mr-3">
                      User: {response.respondentEmail || 'Anonymous'}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(response.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {survey.questions.map((question) => {
                    const answer = response.answers.find(
                      (a) => a.questionId === question.id
                    );
                    return (
                      <div key={question.id}>
                        <p className="font-medium mb-1">{question.question}</p>
                        <p className="bg-gray-50 p-3 rounded-md">
                          {answer?.answer as string}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-500">No responses yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}