
import React, { useState } from 'react';
import { US_STATES, SEARCH_ENGINES, SearchEngine } from '../types';

interface SearchFormProps {
  onSearch: (website: string, keywords: string, state: string, engine: SearchEngine) => void;
  isLoading: boolean;
}

export const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading }) => {
  const [website, setWebsite] = useState('');
  const [keywords, setKeywords] = useState('');
  const [state, setState] = useState(US_STATES[0]);
  const [engine, setEngine] = useState<SearchEngine>('Google');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!website || !keywords) return;
    onSearch(website, keywords, state, engine);
  };

  return (
    <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200 border border-slate-200 p-8 md:p-10 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20"></div>
      <form onSubmit={handleSubmit} className="space-y-6">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-2">
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
            disabled={isLoading}
            className={`w-full h-14 rounded-2xl transition-all flex items-center justify-center gap-3 active:scale-95 font-black text-sm uppercase tracking-widest ${
              isLoading 
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
      </form>
    </div>
  );
};
