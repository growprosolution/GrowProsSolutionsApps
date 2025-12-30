
import React, { useState } from 'react';
import { US_STATES, SEARCH_ENGINES, SearchEngine } from '../types';

interface SearchFormProps {
  onSearch: (website: string, keywords: string, state: string, engine: SearchEngine) => void;
  isLoading: boolean;
  hasKey: boolean | null;
  onOpenKeySelector: () => void;
}

export const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading, hasKey, onOpenKeySelector }) => {
  const [website, setWebsite] = useState('');
  const [keywords, setKeywords] = useState('');
  const [state, setState] = useState(US_STATES[0]);
  const [engine, setEngine] = useState<SearchEngine>('Google');
  const [showInstructions, setShowInstructions] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!website || !keywords) return;
    onSearch(website, keywords, state, engine);
  };

  return (
    <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200 border border-slate-200 p-8 md:p-10 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20"></div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Row 1: Primary Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Target Domain</label>
            <input
              type="text"
              placeholder="example.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300 shadow-sm"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Search Keywords</label>
            <input
              type="text"
              placeholder="buy led grow lights"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300 shadow-sm"
              required
            />
          </div>
        </div>

        {/* Row 2: Configs and Action */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Engine</label>
            <select
              value={engine}
              onChange={(e) => setEngine(e.target.value as SearchEngine)}
              className="w-full px-6 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-bold text-slate-800 cursor-pointer appearance-none shadow-sm"
            >
              {SEARCH_ENGINES.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Geo-Context</label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className={`w-full px-6 py-4 rounded-2xl border transition-all font-black text-xs uppercase tracking-widest cursor-pointer appearance-none shadow-sm ${
                state === "Native IP / Current Location" 
                  ? 'bg-indigo-600 text-white border-indigo-600' 
                  : 'bg-slate-50 text-slate-800 border-slate-200'
              }`}
            >
              {US_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={isLoading || !hasKey}
            className={`w-full h-14 rounded-2xl transition-all flex items-center justify-center gap-3 active:scale-95 font-black text-sm uppercase tracking-widest ${
              isLoading || !hasKey
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-200'
            }`}
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin"></div>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Search</span>
              </>
            )}
          </button>
        </div>

        {/* Row 3: API Status & Instructions */}
        <div className="pt-6 border-t border-slate-100">
          <div className={`flex flex-col md:flex-row items-center gap-6 p-6 rounded-3xl border transition-all ${
            hasKey 
              ? 'bg-emerald-50/30 border-emerald-100' 
              : 'bg-rose-50/30 border-rose-100 animate-pulse'
          }`}>
            <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${
              hasKey ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
            }`}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            
            <div className="flex-grow space-y-1">
              <div className="flex items-center gap-2">
                <h4 className={`text-xs font-black uppercase tracking-widest ${hasKey ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {hasKey ? 'AI Engine Ready' : 'API Configuration Required'}
                </h4>
                {hasKey && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>}
              </div>
              <p className="text-xs font-bold text-slate-500">
                {hasKey 
                  ? 'High-depth search grounding is active for competitive organic analysis.' 
                  : 'Please configure a paid Google Gemini API key to enable live search retrieval.'}
              </p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button 
                type="button"
                onClick={() => setShowInstructions(!showInstructions)}
                className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors"
              >
                {showInstructions ? 'Hide Help' : 'Instructions'}
              </button>
              <button 
                type="button"
                onClick={onOpenKeySelector}
                className={`flex-grow md:flex-grow-0 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  hasKey 
                    ? 'bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50' 
                    : 'bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-100'
                }`}
              >
                {hasKey ? 'Change API Key' : 'Set API Key'}
              </button>
            </div>
          </div>

          {/* Collapsible Instructions */}
          {showInstructions && (
            <div className="mt-4 p-6 bg-slate-50 rounded-3xl border border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
              <h5 className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-3">Setup Guide</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <ul className="space-y-2 text-[11px] text-slate-600 font-bold leading-relaxed">
                  <li className="flex gap-2">
                    <span className="text-indigo-500">01.</span>
                    Use a key from a <strong>Paid Project</strong> (Tier 1+) to avoid rate limits.
                  </li>
                  <li className="flex gap-2">
                    <span className="text-indigo-500">02.</span>
                    Ensure <strong>Billing</strong> is enabled on your Google Cloud Console.
                  </li>
                </ul>
                <div className="flex flex-col justify-center border-l border-slate-200 pl-6">
                   <a 
                     href="https://ai.google.dev/gemini-api/docs/billing" 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 hover:underline"
                   >
                     GCP Billing Docs
                     <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" strokeWidth={2}/></svg>
                   </a>
                   <p className="text-[9px] text-slate-400 mt-2 font-medium">Free-tier keys may fail during search grounding.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};
