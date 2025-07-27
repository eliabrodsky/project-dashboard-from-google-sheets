

import React, { useState } from 'react';
import Card from './shared/Card';
import { AiSummary } from '../types';
import { processMeetingNotes } from '../services/geminiService';
import { Bot, Loader2, Wand2, CheckCircle, AlertTriangle, Check } from 'lucide-react';

interface MeetingNotesProcessorProps {
  onSummaryApproved: (summary: AiSummary) => void;
}

const MeetingNotesProcessor: React.FC<MeetingNotesProcessorProps> = ({ onSummaryApproved }) => {
  const [notes, setNotes] = useState('');
  const [summary, setSummary] = useState<AiSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPosted, setIsPosted] = useState(false);

  const handleProcessNotes = async () => {
    if (!notes.trim()) {
      setError('Meeting notes cannot be empty.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setSummary(null);
    setIsPosted(false);
    try {
      const result = await processMeetingNotes(notes);
      setSummary(result);
    } catch (err) {
      setError('Failed to process notes. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleApprove = () => {
    if (summary) {
      onSummaryApproved(summary);
      setIsPosted(true);
      setSummary(null); // Clear summary after posting
    }
  };

  return (
    <Card>
      <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
        <Bot size={22} className="mr-2 text-brand-primary" />
        AI-Powered Meeting Analysis
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="meeting-notes" className="block text-sm font-medium text-gray-700 mb-1">
            Paste Meeting Notes Here
          </label>
          <textarea
            id="meeting-notes"
            rows={12}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary"
            value={notes}
            onChange={(e) => { setNotes(e.target.value); setIsPosted(false); }}
            placeholder="Paste raw meeting notes, transcripts, or summaries..."
          />
          <div className="mt-4 flex space-x-2">
            <button
              onClick={handleProcessNotes}
              disabled={isLoading || !notes}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-primary hover:bg-brand-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:bg-gray-400"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Wand2 size={20} className="mr-2" />
                  Generate Insights
                </>
              )}
            </button>
            {summary && !isPosted && (
               <button
                  onClick={handleApprove}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-status-green hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <Check size={20} className="mr-2" />
                  Approve & Post
                </button>
            )}
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-800 mb-2">AI Summary & Action Items</h3>
          <div className="h-[320px] overflow-y-auto p-3 bg-gray-50 rounded-md border">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <Loader2 size={32} className="animate-spin mb-2" />
                <p>Gemini is thinking...</p>
              </div>
            )}
            {isPosted && (
               <div className="flex flex-col items-center justify-center h-full text-green-600">
                <CheckCircle size={32} className="mb-2" />
                <p className="font-semibold">Insights posted successfully!</p>
              </div>
            )}
            {!isLoading && !summary && !isPosted && (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 text-center p-4">
                <p>Generate insights from your meeting notes to see an AI-generated summary appear here.</p>
              </div>
            )}
            {summary && (
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold text-gray-700">Overall Health</h4>
                  <p className="p-2 bg-blue-100 text-blue-800 rounded-md mt-1">{summary.overall_health}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700">Executive Summary</h4>
                  <p className="text-gray-600 mt-1">{summary.executive_summary}</p>
                </div>
                <div>
                    <h4 className="font-semibold text-gray-700">Area Updates & Issues</h4>
                    <ul className="space-y-2 mt-1">
                        {summary.area_updates.map((update, index) => (
                            <li key={index} className="p-2 border-l-4 border-gray-300 bg-white">
                                <p className="font-medium">{update.area_name}</p>
                                <p className="text-gray-600">{update.progress_update}</p>
                                {update.identified_issues.length > 0 && (
                                    <div className="mt-1">
                                        {update.identified_issues.map((issue, i) => (
                                           <p key={i} className="text-xs text-red-600 flex items-center"><AlertTriangle size={12} className="mr-1"/>{issue}</p>
                                        ))}
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700">Action Items</h4>
                  <ul className="space-y-2 mt-1">
                    {summary.action_items.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle size={16} className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                        <p className="text-gray-600">
                          <span className="font-medium text-gray-800">{item.owner}:</span> {item.task}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MeetingNotesProcessor;
