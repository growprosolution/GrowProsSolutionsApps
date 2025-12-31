
import React, { useState } from 'react';
import { US_STATES, SEARCH_ENGINES, SearchEngine } from '../types';

interface SearchFormProps {
  onSearch: (website: string, keywords: string, state: string, engine: SearchEngine) => void;
  isLoading: boolean;
  hasKey: boolean | null;
  isAiStudio: boolean;
  manualKey: string;
  onSaveKey: (key: string) => void;
  onClearKey: () => void;
  onOpenKeySelector: () => void;
}

export const SearchForm: React.FC<SearchFormProps> = ({ 
  onSearch, isLoading, hasKey, isAiStudio, manualKey, onSaveKey, onClearKey, onOpenKeySelector 
}) => {
  const [website, setWebsite] = useState('');
  const [keywords, setKeywords] = useState('');
  const [state, setState] = useState(US_STATES[0]);
  const [engine, setEngine] = useState<SearchEngine>('Google');
  const [tempKey, setTempKey] = useState(manualKey);
  const [showKeyInput, setShowKeyInput] = useState(!hasKey && !isAiStudio);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!website || !keywords) return;
    onSearch(website, keywords, state, engine);
  };

  return (
    <div className="bg-white rounded-[40px] shadow-2xl border border-slate-200 p-8 md:p-10 space-y-10">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Target Domain</label>
            <input
              type="text"
              placeholder="example.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none transition-all font-bold"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Keywords</label>
            <input
              type="text"
              placeholder="seo tools"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none transition-all font-bold"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Engine</label>
            <select
              value={engine}
              onChange={(e) => setEngine(e.target.value as SearchEngine)}
              className="w-full px-6 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-bold appearance-none cursor-pointer"
            >
              {SEARCH_ENGINES.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Geo-Location</label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-bold appearance-none cursor-pointer"
            >
              {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button
            type="submit"
            disabled={isLoading || !hasKey}
            className={`w-full h-14 rounded-2xl font-black uppercase tracking-widest transition-all ${
              isLoading || !hasKey ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl'
            }`}
          >
            {isLoading ? 'Running Audit...' : 'Start Search'}
          </button>
        </div>
      </form>

      {/* API Key Configuration Section */}
      <div className={`p-8 rounded-3xl border transition-all ${hasKey ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-200'}`}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${hasKey ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-500'}`}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" strokeWidth={2}/></svg>
            </div>
            <div>
              <h4 className="font-black text-sm uppercase tracking-tight text-slate-800">
                {hasKey ? 'API Key Active' : 'API Key Required'}
              </h4>
              <p className="text-xs text-slate-500 font-medium">
                {hasKey ? 'Securely stored in your local browser only.' : 'Standalone mode: Enter your Gemini API key to proceed.'}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            {!isAiStudio && (
              <button 
                onClick={() => setShowKeyInput(!showKeyInput)}
                className="px-6 py-2.5 rounded-xl bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
              >
                {showKeyInput ? 'Cancel' : (hasKey ? 'Change Key' : 'Enter Key')}
              </button>
            )}
            {isAiStudio && (
              <button 
                onClick={onOpenKeySelector}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg transition-all"
              >
                Select AI Studio Key
              </button>
            )}
            {hasKey && !isAiStudio && (
              <button 
                onClick={onClearKey}
                className="px-6 py-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all"
              >
                Clear Key
              </button>
            )}
          </div>
        </div>

        {showKeyInput && !isAiStudio && (
          <div className="mt-8 pt-8 border-t border-slate-200/60 animate-in fade-in slide-in-from-top-4">
            <div className="flex flex-col md:flex-row gap-4">
              <input 
                type="password"
                placeholder="AIza..."
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                className="flex-grow px-6 py-4 rounded-2xl border border-slate-200 outline-none focus:border-indigo-500 font-mono text-sm"
              />
              <button 
                onClick={() => {
                  onSaveKey(tempKey);
                  setShowKeyInput(false);
                }}
                className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all"
              >
                Save to Browser
              </button>
            </div>
            <p className="mt-4 text-[10px] text-slate-400 leading-relaxed max-w-2xl italic">
              * Security Note: Your key is saved in <strong>localStorage</strong> (your browser's private vault). It never touches our servers. The connection is direct between you and Google.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
