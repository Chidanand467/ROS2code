import { useState, useCallback } from 'react';

interface AIHelperProps {
  lessonTitle: string;
  onClose: () => void;
}

type AIMode = 'explain' | 'stuck' | 'error';

export function AIHelper({ lessonTitle, onClose }: AIHelperProps) {
  const [mode, setMode] = useState<AIMode>('explain');
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const prompts: Record<AIMode, { title: string; description: string; placeholder: string; buttonText: string }> = {
    explain: {
      title: 'Explain This to Me',
      description: 'Get a simple, plain-English explanation of the current topic.',
      placeholder: 'What specifically would you like explained?',
      buttonText: 'Explain Simply',
    },
    stuck: {
      title: "I'm Stuck",
      description: 'Get a step-by-step hint without revealing the full answer.',
      placeholder: 'What are you stuck on?',
      buttonText: 'Give Me a Hint',
    },
    error: {
      title: 'What Does This Error Mean?',
      description: 'Paste a ROS2 error message and get a plain-English explanation.',
      placeholder: 'Paste the error message here...',
      buttonText: 'Explain Error',
    },
  };

  const handleSubmit = useCallback(async () => {
    setLoading(true);
    setResponse('');

    const promptMap: Record<AIMode, string> = {
      explain: `You are a friendly ROS2 tutor. Explain the concept of "${lessonTitle}" in simple, plain English as if explaining to a complete beginner. Use everyday analogies (restaurants, kitchens, phones, etc.). Keep it under 200 words. Do not use jargon without defining it first. The user specifically asks: ${input || 'Explain the main concept simply.'}`,
      stuck: `You are a helpful ROS2 tutor. The user is learning about "${lessonTitle}" and is stuck. They say: "${input}". Give them a step-by-step HINT that points them in the right direction WITHOUT revealing the full answer. Keep it under 150 words. Be encouraging.`,
      error: `You are a ROS2 debugging expert. A beginner encountered this error while learning about "${lessonTitle}":\n\n${input}\n\nExplain in plain English: 1) What the error means 2) The most likely cause 3) How to fix it step by step. Keep it under 200 words. Be encouraging - errors are normal when learning!`,
    };

    try {
      const apiKey = (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) || '';
      if (!apiKey) {
        setResponse('AI features require a Gemini API key. For now, try re-reading the lesson theory section or searching the ROS2 documentation at docs.ros.org.');
        setLoading(false);
        return;
      }

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptMap[mode] }] }],
            generationConfig: { maxOutputTokens: 300, temperature: 0.7 },
          }),
        }
      );

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      setResponse(text || 'Could not generate a response. Please try again.');
    } catch {
      setResponse('Could not connect to the AI service. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [mode, input, lessonTitle]);

  const currentPrompt = prompts[mode];

  return (
    <div className="bg-surface-900 border border-primary-500/30 rounded-xl p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-primary-400 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.87-.34-1.703-.956-2.348z" /></svg>
          AI Learning Assistant
        </h3>
        <button onClick={onClose} className="text-surface-500 hover:text-surface-300 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        {(Object.keys(prompts) as AIMode[]).map(m => (
          <button
            key={m}
            onClick={() => { setMode(m); setResponse(''); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              mode === m ? 'bg-primary-500/20 text-primary-400' : 'bg-surface-800 text-surface-400 hover:text-surface-200'
            }`}
          >
            {prompts[m].title}
          </button>
        ))}
      </div>

      <p className="text-surface-400 text-sm mb-3">{currentPrompt.description}</p>

      <textarea
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder={currentPrompt.placeholder}
        className="w-full bg-surface-800 border border-surface-700 rounded-lg p-3 text-sm text-surface-200 placeholder-surface-600 resize-none h-20 focus:outline-none focus:border-primary-500/50 transition-colors"
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="mt-3 w-full py-2.5 bg-primary-600 hover:bg-primary-500 disabled:bg-surface-700 text-surface-50 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            Thinking...
          </>
        ) : (
          currentPrompt.buttonText
        )}
      </button>

      {response && (
        <div className="mt-4 bg-surface-800/50 border border-surface-700 rounded-lg p-4">
          <p className="text-surface-300 text-sm whitespace-pre-wrap">{response}</p>
        </div>
      )}
    </div>
  );
}
