import React, { useState, useEffect } from 'react';
import { useRouteStore } from '../stores/routeStore';
import {
  fetchGeminiRouteBriefing,
  askGeminiAboutRoute,
  getGeminiApiKey,
  setGeminiApiKey,
  type GeminiRouteBriefing,
} from '../services/geminiService';
import {
  Sparkles,
  Key,
  Check,
  Send,
  Loader2,
  HelpCircle,
  Droplets,
  RotateCw,
} from 'lucide-react';

export const GeminiRouteBriefingCard: React.FC = () => {
  const { mode, routes, selectedRouteId, simulatedHour, sunMetrics } = useRouteStore();
  const activeRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];

  const [briefing, setBriefing] = useState<GeminiRouteBriefing | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(getGeminiApiKey());
  const [keySaved, setKeySaved] = useState(false);

  // Interactive Q&A state
  const [customQuestion, setCustomQuestion] = useState('');
  const [qaAnswer, setQaAnswer] = useState<string | null>(null);
  const [isQaLoading, setIsQaLoading] = useState(false);

  const isDark = mode === 'night' || mode === 'heatmap';

  const loadBriefing = async () => {
    if (!activeRoute) return;
    setIsLoading(true);
    try {
      const data = await fetchGeminiRouteBriefing(activeRoute, mode, simulatedHour, sunMetrics);
      setBriefing(data);
    } catch (e) {
      console.warn('Briefing error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBriefing();
    setQaAnswer(null);
  }, [activeRoute?.id, mode, Math.round(simulatedHour * 2) / 2]);

  const handleSaveKey = () => {
    setGeminiApiKey(apiKeyInput);
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2000);
    setShowKeyModal(false);
    loadBriefing();
  };

  const handleAsk = async (question: string) => {
    if (!activeRoute || !question.trim() || isQaLoading) return;
    setCustomQuestion(question);
    setIsQaLoading(true);
    setQaAnswer(null);
    try {
      const answer = await askGeminiAboutRoute(question, activeRoute, mode, simulatedHour);
      setQaAnswer(answer);
    } catch (e) {
      setQaAnswer('Unable to retrieve AI response at this moment.');
    } finally {
      setIsQaLoading(false);
    }
  };

  if (!activeRoute) return null;

  const quickPrompts = mode === 'night'
    ? [
        'Is this corridor safe for solo female commuters after 9 PM?',
        'Where are active police or CISF security posts?',
        'Are there any unlit alleys on this path?',
      ]
    : [
        'How can I stay in colonnade shade the entire way?',
        'Where is the closest free drinking water pyaau?',
        'What is the heat exposure risk across Mandi House?',
      ];

  return (
    <div
      className={`rounded-xl p-3.5 border shadow-xl transition-all duration-300 relative overflow-hidden ${
        isDark
          ? 'bg-gradient-to-b from-[#141824] to-[#0f121a] border-[#2a3347] text-[#f1f5f9]'
          : 'bg-gradient-to-b from-blue-50/70 to-slate-50 border-blue-200/80 text-slate-900'
      }`}
    >
      {/* Top Accent Gradient Bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-inherit/40">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs tracking-tight">Gemini Route Co-Pilot</span>
              <span className="font-mono text-[9px] px-1.5 py-0.2 rounded font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                {briefing?.modelUsed || 'Gemini 2.5 Flash'}
              </span>
            </div>
            <span className={`text-[10px] block font-mono ${isDark ? 'text-[#8a95aa]' : 'text-slate-500'}`}>
              Google Gemini Micro-Climate & Safety Synthesis
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={loadBriefing}
            disabled={isLoading}
            className={`p-1 rounded transition-colors cursor-pointer ${
              isDark ? 'hover:bg-[#202738] text-[#8a95aa]' : 'hover:bg-blue-100 text-slate-600'
            }`}
            title="Re-run Gemini AI Analysis"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
          </button>
          <button
            onClick={() => setShowKeyModal(!showKeyModal)}
            className={`p-1 rounded transition-colors cursor-pointer ${
              getGeminiApiKey()
                ? 'text-emerald-400 bg-emerald-500/10'
                : isDark
                ? 'hover:bg-[#202738] text-[#8a95aa]'
                : 'hover:bg-blue-100 text-slate-600'
            }`}
            title="Configure Gemini API Key"
          >
            <Key className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* API Key Modal / Drawer */}
      {showKeyModal && (
        <div className={`p-2.5 mb-3 rounded-lg border text-[11px] ${
          isDark ? 'bg-[#181e2e] border-[#313c54]' : 'bg-white border-blue-200'
        }`}>
          <div className="font-bold mb-1 flex items-center justify-between">
            <span>Google Gemini API Key</span>
            <span className="text-[10px] font-mono font-normal text-slate-400">Optional</span>
          </div>
          <p className="text-[10px] text-slate-400 mb-2 leading-relaxed">
            Enter your Google Gemini API key to call the live <code className="text-blue-400">gemini-2.5-flash</code> API. If empty, the app runs on a pre-calibrated local contextual engine.
          </p>
          <div className="flex gap-1.5">
            <input
              type="password"
              placeholder="AIzaSy..."
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              className={`flex-1 px-2 py-1 rounded text-[11px] font-mono border outline-none ${
                isDark ? 'bg-[#0f121a] border-[#313c54] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
            <button
              onClick={handleSaveKey}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium text-[11px] flex items-center gap-1 cursor-pointer"
            >
              {keySaved ? <Check className="w-3 h-3 text-emerald-300" /> : 'Save'}
            </button>
          </div>
        </div>
      )}

      {/* Main AI Content */}
      {isLoading ? (
        <div className="py-4 flex flex-col items-center justify-center gap-2 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
          <span className="text-[11px] font-mono">Gemini is synthesizing micro-climate & safety telemetry...</span>
        </div>
      ) : briefing ? (
        <div className="space-y-2.5">
          {/* Headline Quote */}
          <div className="italic text-[11px] font-medium leading-snug text-blue-400 flex items-start gap-1.5">
            <span className="text-base leading-none">“</span>
            <span>{briefing.headlineQuote}</span>
          </div>

          {/* Narrative Briefing */}
          <p className={`text-[11px] leading-relaxed ${isDark ? 'text-[#c2cbd8]' : 'text-slate-700'}`}>
            {briefing.briefing}
          </p>

          {/* Actionable Bullet Points */}
          {briefing.advisories.length > 0 && (
            <div className={`p-2 rounded-lg space-y-1.5 text-[10px] font-sans ${
              isDark ? 'bg-[#10141e]/80 border border-[#232b3d]' : 'bg-white/80 border border-blue-100'
            }`}>
              <span className="font-mono uppercase font-bold text-[9px] tracking-wider text-slate-400 block mb-0.5">
                Actionable AI Advisories
              </span>
              {briefing.advisories.map((adv, idx) => (
                <div key={idx} className="flex items-start gap-1.5 leading-tight">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1 shrink-0" />
                  <span className={isDark ? 'text-[#d6deeb]' : 'text-slate-800'}>{adv}</span>
                </div>
              ))}
            </div>
          )}

          {/* Hydration / Water Hut Alert if applicable */}
          {briefing.hydrationTip && (
            <div className={`p-2 rounded-lg flex items-start gap-2 text-[10px] ${
              isDark ? 'bg-[#0f243a] border border-[#1e4976] text-[#7dd3fc]' : 'bg-blue-50 border border-blue-200 text-blue-900'
            }`}>
              <Droplets className="w-3.5 h-3.5 text-sky-400 mt-0.5 shrink-0" />
              <span>{briefing.hydrationTip}</span>
            </div>
          )}

          {/* Interactive "Ask Gemini" Section */}
          <div className="pt-2 border-t border-inherit/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className={`font-mono text-[9px] uppercase tracking-wider font-bold ${
                isDark ? 'text-[#8a95aa]' : 'text-slate-500'
              }`}>
                Ask Gemini about this route
              </span>
              <HelpCircle className="w-3 h-3 text-slate-400" />
            </div>

            {/* Quick Prompt Chips */}
            <div className="flex flex-wrap gap-1">
              {quickPrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleAsk(p)}
                  disabled={isQaLoading}
                  className={`text-[9px] font-mono px-2 py-1 rounded-full border transition-all cursor-pointer text-left ${
                    isDark
                      ? 'bg-[#181e2e] hover:bg-[#20273c] border-[#2d374d] text-[#9ca3af] hover:text-white'
                      : 'bg-white hover:bg-blue-50 border-blue-200 text-slate-600 hover:text-blue-900'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Answer Display */}
            {isQaLoading && (
              <div className="p-2 rounded bg-blue-500/10 border border-blue-500/20 text-[10px] flex items-center gap-2 text-blue-400 font-mono">
                <Loader2 className="w-3 h-3 animate-spin shrink-0" />
                <span>Gemini is answering your question...</span>
              </div>
            )}

            {qaAnswer && !isQaLoading && (
              <div className={`p-2.5 rounded-lg text-[10px] leading-relaxed border space-y-1 ${
                isDark ? 'bg-[#161d2c] border-[#29364f] text-[#e2e8f0]' : 'bg-white border-blue-300 text-slate-800 shadow-sm'
              }`}>
                <div className="font-semibold text-blue-400 flex items-center gap-1 font-mono text-[9px]">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>Q: {customQuestion}</span>
                </div>
                <p>{qaAnswer}</p>
              </div>
            )}

            {/* Custom Input */}
            <div className="flex gap-1.5 pt-0.5">
              <input
                type="text"
                placeholder="Ask e.g. Is it well-lit near the subway?"
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAsk(customQuestion)}
                className={`flex-1 px-2.5 py-1 rounded-lg text-[10px] border outline-none ${
                  isDark ? 'bg-[#0f121a] border-[#2d374d] text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
              />
              <button
                onClick={() => handleAsk(customQuestion)}
                disabled={isQaLoading || !customQuestion.trim()}
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-[10px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Send className="w-3 h-3" />
                <span className="hidden sm:inline">Ask</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
