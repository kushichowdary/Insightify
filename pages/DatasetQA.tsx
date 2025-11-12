import React, { useState, useEffect, useRef } from 'react';
import Card from '../components/Card';
import Icon from '../components/Icon';
import { queryDataset } from '../services/geminiService';
import { ChatMessage } from '../types';

const DatasetQA: React.FC<{ addAlert: (message: string, type: 'success' | 'error' | 'info') => void }> = ({ addAlert }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState('Amazon Electronics Reviews Q2');
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      { sender: 'ai', text: `I'm ready to answer questions about the '${selectedDataset}' dataset. What would you like to know?` }
    ]);
  }, [selectedDataset]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await queryDataset(selectedDataset, input);
      const aiMessage: ChatMessage = { sender: 'ai', text: response.answer };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      addAlert(`Failed to get answer: ${errorMessage}`, 'error');
      const aiErrorMessage: ChatMessage = { sender: 'ai', text: "Sorry, I encountered an error while trying to answer your question." };
      setMessages(prev => [...prev, aiErrorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const sampleQuestions = [
    "What are the main complaints about Headphones C?",
    "Summarize the reviews for Smartphone A.",
    "Which product has the best battery life according to the reviews?",
  ];

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto animate-fade-in-up">
      <div className="text-center mb-6">
          <Icon name="question-circle" className="text-4xl text-brand-primary mb-2" />
          <h2 className="text-3xl font-bold text-light-text dark:text-dark-text">Dataset Q&A</h2>
          <p className="text-light-text-secondary dark:text-dark-text-secondary">Ask natural language questions about your data.</p>
      </div>
      
      <Card className="flex-grow flex flex-col p-0">
        <div className="flex-grow p-6 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.sender === 'ai' && <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-white flex-shrink-0"><Icon name="robot" /></div>}
              <div className={`max-w-md p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-brand-primary text-white rounded-br-none' : 'bg-slate-100 dark:bg-slate-800 text-light-text dark:text-dark-text rounded-bl-none'}`}>
                <p className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />') }}></p>
              </div>
            </div>
          ))}
          {isLoading && (
             <div className="flex items-end gap-2 justify-start">
               <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-white flex-shrink-0"><Icon name="robot" /></div>
               <div className="max-w-md p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-light-text dark:text-dark-text rounded-bl-none">
                 <div className="flex items-center gap-2">
                   <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                   <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                   <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                 </div>
               </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        <div className="p-4 border-t border-light-border dark:border-dark-border">
          <div className="flex flex-wrap gap-2 mb-2">
            {sampleQuestions.map(q => (
              <button key={q} onClick={() => setInput(q)} className="text-xs px-3 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-full text-light-text-secondary dark:text-dark-text-secondary transition-colors">
                {q}
              </button>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about the dataset..."
              className="flex-grow p-3 border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none bg-light-surface/50 dark:bg-black/20 text-light-text dark:text-white placeholder-gray-500 transition-all"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-6 py-3 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-primary-hover disabled:bg-slate-500 dark:disabled:bg-slate-700 transition-all flex items-center justify-center shadow-lg shadow-magenta-500/30 hover:shadow-glow-magenta"
            >
              <Icon name="paper-plane" />
            </button>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default DatasetQA;
