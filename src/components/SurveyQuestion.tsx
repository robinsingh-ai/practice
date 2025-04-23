'use client';

import { Question } from '@/lib/firestore';
import { useState } from 'react';

interface SurveyQuestionProps {
  question: Question;
  onChange: (questionId: string, answer: string | string[]) => void;
  value: string | string[];
}

export default function SurveyQuestion({ question, onChange, value }: SurveyQuestionProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(
    Array.isArray(value) ? value : []
  );
  
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(question.id, e.target.value);
  };
  
  const handleOptionChange = (option: string) => {
    onChange(question.id, option);
  };

  return (
    <div className="mb-8 bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4">{question.question}</h3>
      
      {question.type === 'text' ? (
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          rows={3}
          value={value as string}
          onChange={handleTextChange}
          placeholder="Type your answer here..."
        ></textarea>
      ) : (
        <div className="space-y-2">
          {question.options?.map((option, index) => (
            <label key={index} className="flex items-start">
              <input
                type="radio"
                name={`question-${question.id}`}
                value={option}
                checked={(value as string) === option}
                onChange={() => handleOptionChange(option)}
                className="mt-1 mr-3"
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
} 