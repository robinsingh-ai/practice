'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Only show auth-dependent UI after component has mounted to prevent hydration errors
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to Waterlily Survey</h1>
      <p className="text-xl mb-8 max-w-2xl">
        Create beautiful surveys, share them with anyone, and analyze responses easily.
      </p>

      <div className="flex flex-col md:flex-row gap-4">
        {mounted && (
          user ? (
            <>
              <Link
                href="/create"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Create a Survey
              </Link>
              <Link
                href="/dashboard"
                className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                View Your Surveys
              </Link>
            </>
          ) : (
            <Link
              href="/auth/signin"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Sign In to Get Started
            </Link>
          )
        )}
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        <div className="border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="mb-4 text-indigo-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Create Surveys</h3>
          <p className="text-gray-600">
            Design custom surveys with multiple question types and styling options.
          </p>
        </div>

        <div className="border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="mb-4 text-indigo-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Share Instantly</h3>
          <p className="text-gray-600">
            Share your survey with a unique link via email, social media, or embed on your website.
          </p>
        </div>

        <div className="border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="mb-4 text-indigo-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Analyze Results</h3>
          <p className="text-gray-600">
            View comprehensive reports and export data to gain valuable insights.
          </p>
        </div>
      </div>
    </div>
  );
}
