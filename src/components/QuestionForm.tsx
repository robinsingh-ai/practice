'use client';

import { useState } from 'react';
import { Question } from '@/lib/firestore';

interface QuestionFormProps {
  onSave: (question: Question) => void;
  onCancel: () => void;
  editQuestion?: Question;
}

export default function QuestionForm({ onSave, onCancel, editQuestion }: QuestionFormProps) {
  const [questionType, setQuestionType] = useState<'text' | 'multipleChoice'>(
    editQuestion?.type || 'text'
  );
  const [questionText, setQuestionText] = useState(editQuestion?.question || '');
  const [options, setOptions] = useState<string[]>(
    editQuestion?.options && editQuestion.options.length > 0 
      ? editQuestion.options 
      : ['']
  );

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 1) {
      const newOptions = [...options];
      newOptions.splice(index, 1);
      setOptions(newOptions);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Validate the question text is not empty
    if (!questionText.trim()) {
      alert('Question text cannot be empty');
      return;
    }
    
    // For multiple choice, ensure there's at least one non-empty option
    if (questionType === 'multipleChoice') {
      const validOptions = options.filter(opt => opt.trim() !== '');
      if (validOptions.length === 0) {
        alert('Please add at least one option for multiple choice questions');
        return;
      }
    }
    
    const question: Question = {
      id: editQuestion?.id || Date.now().toString(),
      type: questionType,
      question: questionText.trim(),
      options: questionType === 'multipleChoice' 
        ? options.filter(opt => opt.trim() !== '') 
        : undefined
    };
    
    onSave(question);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h3 className="text-lg font-medium mb-4">
        {editQuestion ? 'Edit Question' : 'Add New Question'}
      </h3>
      
      <div className="question-form-content">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Question Type</label>
          <div className="flex gap-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                name="questionType"
                value="text"
                checked={questionType === 'text'}
                onChange={() => setQuestionType('text')}
              />
              <span className="ml-2">Text Answer</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                name="questionType"
                value="multipleChoice"
                checked={questionType === 'multipleChoice'}
                onChange={() => setQuestionType('multipleChoice')}
              />
              <span className="ml-2">Multiple Choice</span>
            </label>
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="questionText" className="block text-sm font-medium mb-2">
            Question Text
          </label>
          <input
            id="questionText"
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Enter your question"
            required
          />
        </div>
        
        {questionType === 'multipleChoice' && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Answer Options</label>
            {options.map((option, index) => (
              <div key={index} className="flex mb-2">
                <input
                  type="text"
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => handleRemoveOption(index)}
                  className="ml-2 text-red-500 hover:text-red-700 p-2"
                  disabled={options.length <= 1}
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddOption}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              + Add Another Option
            </button>
          </div>
        )}
        
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleSubmit()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Save Question
          </button>
        </div>
      </div>
    </div>
  );
} 