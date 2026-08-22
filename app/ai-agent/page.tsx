'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/lib/auth/context';
import { Bot, Send, Sparkles, FileText, CheckCircle2, AlertCircle, Cpu, Download, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function AiAgentContent() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState<'CHAT' | 'EXTRACT' | 'ZK_PLAN'>('CHAT');

  // Tab 1: Chat State
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    {
      role: 'assistant',
      content: 'Hello! I am your EduPass AI Mobility Agent powered by Groq Llama 8B. How can I assist with your international university transfer, credit mapping, or ZK proof claims today?',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Tab 2: Extract & Evaluate State
  const [rawText, setRawText] = useState(
    'Stanford University MS in Computer Science Admissions: Applicants must hold a Bachelor of Science in Computer Science or related field with a minimum CGPA of 3.5 / 4.0 (or 8.5/10.0 equivalent) and at least 120 credit units, including coursework in Data Structures, Database Systems, and Computer Systems.'
  );
  const [extractedResult, setExtractedResult] = useState<any | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);

  // Send Chat Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isSending) return;

    const userText = inputMessage.trim();
    setInputMessage('');
    const updatedHistory = [...messages, { role: 'user' as const, content: userText }];
    setMessages(updatedHistory);
    setIsSending(true);

    try {
      const res = await fetch(`${API_BASE}/ai-agent/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: userText,
          history: updatedHistory.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages([...updatedHistory, { role: 'assistant', content: data.reply }]);
      }
    } catch (err) {
      console.error('Error sending chat to AI Mobility Agent:', err);
    } finally {
      setIsSending(false);
    }
  };

  // Extract & Evaluate
  const handleExtractAndEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim()) return;

    setExtractError(null);
    setExtractedResult(null);
    setIsExtracting(true);

    try {
      const res = await fetch(`${API_BASE}/ai-agent/extract-and-evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ raw_admission_text: rawText }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Extraction failed.');
      }

      const data = await res.json();
      setExtractedResult(data);
    } catch (err: any) {
      setExtractError(err.message || 'Error executing AI extraction.');
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E5E4DF] text-[#131313] font-mono selection:bg-[#FF5C00] selection:text-black">
      <Header />

      <main className="max-w-[1280px] mx-auto px-6 md:px-10 py-16 space-y-8">
        
        {/* Banner Header */}
        <div className="bg-[#131313] text-white border-2 border-[#131313] p-8 md:p-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="bg-[#FF5C00] text-[#131313] text-[10px] font-bold px-3 py-1 uppercase flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>GROQ LLAMA 8B ACTIVE</span>
              </span>
              <span className="text-xs uppercase text-gray-300">STUDENT: <strong>{user?.full_name}</strong></span>
            </div>

            <h1 className="font-anton text-3xl md:text-5xl uppercase tracking-tight text-white">
              AI MOBILITY AGENT STUDIO (MODULES 26–30)
            </h1>
            <p className="text-xs uppercase text-gray-300 max-w-2xl">
              AI requirement parser, credential gap evaluator, and ZK proof planner powered by Groq Llama 8B (`llama-3.1-8b-instant`).
            </p>
          </div>
        </div>

        {/* Sub-Tabs Switcher */}
        <div className="flex flex-wrap border-2 border-[#131313] bg-[#E2E1DC]">
          <button
            onClick={() => setActiveTab('CHAT')}
            className={`flex-1 min-w-[160px] py-4 text-xs font-bold uppercase transition-colors border-r border-[#131313] flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'CHAT' ? 'bg-[#131313] text-[#FF5C00]' : 'text-[#131313] hover:text-[#FF5C00]'
            }`}
          >
            <Bot className="w-4 h-4 text-[#FF5C00]" />
            <span>1. AI MOBILITY ADVISOR CHAT (MOD 26)</span>
          </button>

          <button
            onClick={() => setActiveTab('EXTRACT')}
            className={`flex-1 min-w-[160px] py-4 text-xs font-bold uppercase transition-colors border-r border-[#131313] flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'EXTRACT' ? 'bg-[#131313] text-[#FF5C00]' : 'text-[#131313] hover:text-[#FF5C00]'
            }`}
          >
            <FileText className="w-4 h-4 text-[#FF5C00]" />
            <span>2. SMART REQUIREMENT EXTRACTOR & GAP ANALYSIS (MODS 27–29)</span>
          </button>

          <button
            onClick={() => setActiveTab('ZK_PLAN')}
            className={`flex-1 min-w-[160px] py-4 text-xs font-bold uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'ZK_PLAN' ? 'bg-[#131313] text-[#FF5C00]' : 'text-[#131313] hover:text-[#FF5C00]'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-[#FF5C00]" />
            <span>3. ZK PROOF PACKAGE PLANNER (MOD 30)</span>
          </button>
        </div>

        {/* TAB 1: AI MOBILITY ADVISOR CHAT */}
        {activeTab === 'CHAT' && (
          <div className="bg-[#E2E1DC] border-2 border-[#131313] p-6 space-y-6">
            <div className="border-b border-[#131313] pb-3 flex justify-between items-center">
              <span className="font-bold text-xs uppercase text-[#131313] flex items-center gap-2">
                <Bot className="w-4 h-4 text-[#FF5C00]" />
                <span>CHAT WITH GROQ LLAMA 8B AI ADVISOR</span>
              </span>
              <span className="text-[10px] text-gray-600 uppercase font-bold">MODEL: LLAMA-3.1-8B-INSTANT</span>
            </div>

            {/* Chat Messages Box */}
            <div className="bg-[#EAE9E4] border border-[#131313] p-4 min-h-[360px] max-h-[500px] overflow-y-auto space-y-4 font-mono text-xs">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`p-4 border max-w-[85%] ${
                    m.role === 'user'
                      ? 'ml-auto bg-[#131313] text-white border-[#131313]'
                      : 'mr-auto bg-white text-[#131313] border-[#131313]'
                  }`}
                >
                  <span className="text-[9px] font-bold block uppercase mb-1 opacity-70">
                    {m.role === 'user' ? 'YOU (STUDENT)' : '🤖 GROQ LLAMA 8B AGENT'}
                  </span>
                  <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                </div>
              ))}
              {isSending && (
                <div className="p-4 bg-white text-[#131313] border border-[#131313] text-xs font-bold uppercase animate-pulse">
                  GROQ LLAMA 8B IS THINKING...
                </div>
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about CGPA conversion, US/ECTS credit mapping, or ZK proof claims..."
                className="flex-1 bg-[#EAE9E4] px-4 py-3.5 border border-[#131313] text-xs font-mono focus:outline-none focus:border-[#FF5C00]"
              />
              <button
                type="submit"
                disabled={isSending || !inputMessage.trim()}
                className="bg-[#131313] hover:bg-[#FF5C00] text-white hover:text-black font-mono font-bold text-xs uppercase px-8 py-3.5 border border-[#131313] transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>SEND</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: SMART ADMISSION EXTRACTOR & GAP ANALYSIS */}
        {activeTab === 'EXTRACT' && (
          <div className="space-y-6">
            <div className="bg-[#E2E1DC] border-2 border-[#131313] p-6 space-y-4">
              <label className="block text-xs font-bold uppercase text-[#131313]">
                PASTE RAW UNIVERSITY ADMISSION POSTING OR JOB REQUIREMENT TEXT *
              </label>

              <form onSubmit={handleExtractAndEvaluate} className="space-y-4">
                <textarea
                  rows={5}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Paste admission requirement text here..."
                  className="w-full bg-[#EAE9E4] p-4 border border-[#131313] font-mono text-xs focus:outline-none focus:border-[#FF5C00]"
                />

                <button
                  type="submit"
                  disabled={isExtracting}
                  className="w-full bg-[#131313] hover:bg-[#FF5C00] text-white hover:text-black font-mono font-bold text-xs uppercase py-4 border border-[#131313] transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-[#FF5C00]" />
                  <span>{isExtracting ? 'PARSING WITH GROQ LLAMA 8B...' : 'EXTRACT REQUIREMENTS & EVALUATE ELIGIBILITY'}</span>
                </button>
              </form>
            </div>

            {extractError && (
              <div className="bg-red-100 border border-red-500 text-red-900 p-4 text-xs font-mono uppercase flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{extractError}</span>
              </div>
            )}

            {extractedResult && (
              <div className="space-y-6">
                
                {/* Match Verdict Card */}
                <div className="bg-[#131313] text-white border-2 border-[#131313] p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="space-y-2">
                    <span className="text-[#FF5C00] font-bold text-xs uppercase block">
                      [ ADMISSION ELIGIBILITY VERDICT ]
                    </span>
                    <h2 className="font-anton text-2xl md:text-3xl uppercase text-white">
                      {extractedResult.evaluation.verdict}
                    </h2>
                  </div>

                  <div className="bg-[#1A1A1A] p-4 border border-gray-800 text-center shrink-0">
                    <span className="text-[10px] text-gray-400 font-bold block uppercase">MATCH SCORE</span>
                    <span className="font-anton text-4xl text-[#FF5C00]">{extractedResult.evaluation.match_score}%</span>
                  </div>
                </div>

                {/* Structured Requirements Table */}
                <div className="bg-[#E2E1DC] border-2 border-[#131313] p-6 space-y-4 text-xs font-mono">
                  <span className="font-bold text-xs uppercase text-[#131313] block">
                    EXTRACTED STRUCTURED REQUIREMENTS (MODULE 27)
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#EAE9E4] p-4 border border-[#131313]">
                    <div>
                      <span className="text-gray-600 text-[10px] block uppercase font-bold">MINIMUM CGPA / GPA</span>
                      <span className="font-bold text-[#FF5C00] text-sm">{extractedResult.extracted_requirements.min_cgpa_or_gpa}</span>
                    </div>

                    <div>
                      <span className="text-gray-600 text-[10px] block uppercase font-bold">REQUIRED CREDIT UNITS</span>
                      <span className="font-bold text-[#131313] text-sm">{extractedResult.extracted_requirements.min_credits_required} UNITS</span>
                    </div>

                    <div>
                      <span className="text-gray-600 text-[10px] block uppercase font-bold">PREREQUISITE COURSES</span>
                      <span className="font-bold text-[#131313] text-sm">
                        {extractedResult.extracted_requirements.prerequisite_courses.join(', ')}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* TAB 3: ZK PROOF PACKAGE PLANNER */}
        {activeTab === 'ZK_PLAN' && (
          <div className="bg-[#E2E1DC] border-2 border-[#131313] p-6 md:p-8 space-y-6">
            <div className="border-b border-[#131313] pb-4 flex justify-between items-center">
              <div>
                <h2 className="font-anton text-2xl uppercase text-[#131313]">
                  RECOMMENDED ZK PROOF CLAIMS PACKAGE (MODULE 30)
                </h2>
                <p className="text-xs text-gray-600 uppercase">
                  Auto-planned mathematical proof claims satisfying admission criteria without leaking raw transcript PII.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-[#131313] text-white p-6 border-2 border-[#131313] flex justify-between items-center">
                <div>
                  <span className="bg-[#FF5C00] text-[#131313] text-[9px] font-bold px-2 py-0.5 uppercase">CLAIM 1: MIN_CGPA</span>
                  <h3 className="font-anton text-2xl uppercase mt-1 text-white">MINIMUM CGPA THRESHOLD PROOF</h3>
                  <p className="text-xs text-gray-300 mt-1">Proves CGPA &gt;= 3.5 / 8.5 without revealing exact GPA score.</p>
                </div>
                <span className="bg-green-500 text-black text-[10px] font-bold px-3 py-1 uppercase">100% PROVABLE</span>
              </div>

              <div className="bg-[#131313] text-white p-6 border-2 border-[#131313] flex justify-between items-center">
                <div>
                  <span className="bg-[#FF5C00] text-[#131313] text-[9px] font-bold px-2 py-0.5 uppercase">CLAIM 2: MIN_CREDITS</span>
                  <h3 className="font-anton text-2xl uppercase mt-1 text-white">CREDIT HOURS COMPLETION PROOF</h3>
                  <p className="text-xs text-gray-300 mt-1">Proves total completed credit units &gt;= 120 without revealing subject list.</p>
                </div>
                <span className="bg-green-500 text-black text-[10px] font-bold px-3 py-1 uppercase">100% PROVABLE</span>
              </div>

              <div className="bg-[#131313] text-white p-6 border-2 border-[#131313] flex justify-between items-center">
                <div>
                  <span className="bg-[#FF5C00] text-[#131313] text-[9px] font-bold px-2 py-0.5 uppercase">CLAIM 3: DEGREE_VERIFIED</span>
                  <h3 className="font-anton text-2xl uppercase mt-1 text-white">ACCREDITED DEGREE ISSUANCE PROOF</h3>
                  <p className="text-xs text-gray-300 mt-1">Proves degree issued by accredited institution backed by on-chain commitment hash.</p>
                </div>
                <span className="bg-green-500 text-black text-[10px] font-bold px-3 py-1 uppercase">100% PROVABLE</span>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default function AiAgentPage() {
  return (
    <ProtectedRoute allowedRoles={['STUDENT']}>
      <AiAgentContent />
    </ProtectedRoute>
  );
}
