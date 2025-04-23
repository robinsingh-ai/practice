'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getUserSurveys, Survey, countSurveyResponses } from '@/lib/firestore';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [surveys, setSurveys] = useState<(Survey & { responseCount: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !user) {
      console.log('User not authenticated, redirecting to sign in');
      router.push('/auth/signin');
      return;
    }

    // Fetch user's surveys when authenticated
    if (user) {
      const fetchSurveys = async () => {
        try {
          console.log('Fetching surveys for user:', user.email);
          
          if (!user.email) {
            setError('User email not found');
            setLoading(false);
            return;
          }
          
          const surveyDocs = await getUserSurveys(user.email);
          console.log(`Found ${surveyDocs.length} surveys`);
          
          // Get response counts for each survey
          const surveysWithCount = await Promise.all(
            surveyDocs.map(async (survey) => {
              try {
                const responseCount = survey.id 
                  ? await countSurveyResponses(survey.id)
                  : 0;
                
                return {
                  ...survey,
                  responseCount
                };
              } catch (countError) {
                console.error('Error getting response counts:', countError);
                return {
                  ...survey,
                  responseCount: 0
                };
              }
            })
          );
          
          setSurveys(surveysWithCount);
        } catch (error) {
          console.error('Error fetching surveys:', error);
          setError(error instanceof Error ? error.message : 'Failed to load surveys');
        } finally {
          setLoading(false);
        }
      };

      fetchSurveys();
    }
  }, [user, authLoading, router]);

  // Function to safely format date
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    try {
      if (timestamp.toDate) {
        return timestamp.toDate().toLocaleDateString();
      }
      return 'N/A';
    } catch (e) {
      return 'N/A';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <p className="font-bold">Error loading surveys</p>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Your Surveys</h1>
        <Link
          href="/create"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
        >
          Create New Survey
        </Link>
      </div>

      {surveys.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <h3 className="text-lg font-medium mb-2">No surveys yet</h3>
          <p className="text-gray-600 mb-4">Create your first survey to get started.</p>
          <Link
            href="/create"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
          >
            Create a Survey
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {surveys.map((survey) => (
            <div key={survey.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-medium mb-2">{survey.title}</h3>
                <p className="text-gray-600 mb-4">{survey.description}</p>
                <div className="flex justify-between text-sm text-gray-500 mb-4">
                  <span>
                    Created: {formatDate(survey.createdAt)}
                  </span>
                  <span>{survey.responseCount} responses</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href={`/surveys/${survey.id}/results`}
                    className="text-center bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded hover:bg-gray-50"
                  >
                    View Results
                  </Link>
                  <Link
                    href={`/surveys/${survey.id}`}
                    className="text-center bg-indigo-600 text-white px-3 py-2 rounded hover:bg-indigo-700"
                  >
                    Share
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 