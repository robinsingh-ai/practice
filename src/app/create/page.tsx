'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import QuestionForm from '@/components/QuestionForm';
import { Question, createSurvey } from '@/lib/firestore';

export default function CreateSurvey() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
    }
  }, [authLoading, user, router]);

  const handleAddQuestion = () => {
    setShowQuestionForm(true);
    setEditingQuestionIndex(null);
  };

  const handleEditQuestion = (index: number) => {
    setEditingQuestionIndex(index);
    setShowQuestionForm(true);
  };

  const handleDeleteQuestion = (index: number) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };

  const handleSaveQuestion = (question: Question) => {
    const newQuestions = [...questions];
    
    if (editingQuestionIndex !== null) {
      // Update existing question
      newQuestions[editingQuestionIndex] = question;
    } else {
      // Add new question
      newQuestions.push(question);
    }
    
    setQuestions(newQuestions);
    setShowQuestionForm(false);
    setEditingQuestionIndex(null);
  };

  const handleCancelQuestion = () => {
    setShowQuestionForm(false);
    setEditingQuestionIndex(null);
  };

  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === questions.length - 1)
    ) {
      return;
    }

    const newQuestions = [...questions];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    [newQuestions[index], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[index]];
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!user) {
      setError('You must be logged in to create a survey');
      return;
    }
    
    if (!user.uid) {
      setError('User ID not found');
      return;
    }
    
    if (questions.length === 0) {
      setError('Please add at least one question to your survey');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Ensure all required fields are present and valid
      const surveyData = {
        title: title.trim(),
        description: description.trim(),
        questions: questions.map(q => ({
          ...q,
          question: q.question.trim(),
          options: q.type === 'multipleChoice' 
            ? (q.options ? q.options.filter(opt => opt.trim() !== '') : [])
            : undefined
        })),
        createdBy: user.uid
      };
      
      await createSurvey(surveyData);
      router.push('/dashboard');
    } catch (error) {
      console.error('Error creating survey:', error);
      setError('Failed to create survey. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Create a New Survey</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Survey Title
            </label>
            <input
              id="title"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter survey title"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              id="description"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter survey description"
              rows={3}
              required
            ></textarea>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Survey Questions</h2>
            {!showQuestionForm && (
              <button
                type="button"
                onClick={handleAddQuestion}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
              >
                Add Question
              </button>
            )}
          </div>
          
          {showQuestionForm && (
            <QuestionForm
              onSave={handleSaveQuestion}
              onCancel={handleCancelQuestion}
              editQuestion={editingQuestionIndex !== null ? questions[editingQuestionIndex] : undefined}
            />
          )}
          
          {questions.length === 0 && !showQuestionForm ? (
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
              <p className="text-gray-500 mb-4">No questions added yet</p>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
              >
                Add Your First Question
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div key={question.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex justify-between">
                    <div>
                      <span className="text-sm text-gray-500">
                        {question.type === 'text' ? 'Text Question' : 'Multiple Choice'}
                      </span>
                      <h3 className="font-medium">{question.question}</h3>
                      
                      {question.type === 'multipleChoice' && question.options && (
                        <ul className="mt-2 ml-5 list-disc text-gray-600">
                          {question.options.map((option, i) => (
                            <li key={i}>{option}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleMoveQuestion(index, 'up')}
                        disabled={index === 0}
                        className={`p-1 ${index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveQuestion(index, 'down')}
                        disabled={index === questions.length - 1}
                        className={`p-1 ${index === questions.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEditQuestion(index)}
                        className="p-1 text-blue-500 hover:text-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteQuestion(index)}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || questions.length === 0}
            className={`px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 ${
              (isSubmitting || questions.length === 0) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Creating...' : 'Create Survey'}
          </button>
        </div>
      </form>
    </div>
  );
} 