
import React from 'react';
import { SearchResult } from '../types';

interface ResultCardProps {
  result: SearchResult;
  isTarget: boolean;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result, isTarget }) => {
  return (
    <div className={`group relative flex items-start gap-6 p-6 rounded-3xl border transition-all duration-300 ${
      isTarget 
        ? 'bg-indigo-600 border-indigo-600 shadow-2xl shadow-indigo-200/50 scale-[1.02] z-10' 
        : 'bg-white border-slate-100 hover:border-indigo-200 hover:shadow-md'
    }`}>
      {/* Rank Indicator */}
      <div className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl tracking-tighter shadow-sm transition-transform group-hover:scale-105 ${
        isTarget ? 'bg-white text-indigo-600' : 'bg-slate-50 text-slate-400'
      }`}>
        #{result.rank}
      </div>
      
      {/* Content */}
      <div className="flex-grow min-w-0 space-y-1">
        <h3 className={`font-black text-base truncate ${isTarget ? 'text-white' : 'text-slate-900'}`}>
          <a 
            href={result.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:opacity-80 transition-opacity decoration-indigo-300 decoration-2 underline-offset-4"
          >
            {result.title}
          </a>
        </h3>
        <a 
          href={result.url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className={`text-[11px] font-bold truncate opacity-70 tracking-tight block hover:underline transition-all ${
            isTarget ? 'text-indigo-100' : 'text-slate-400'
          }`}
        >
          {result.url}
        </a>
        {result.description && (
          <p className={`text-xs leading-relaxed line-clamp-2 mt-2 ${isTarget ? 'text-indigo-50/80' : 'text-slate-500'}`}>
            {result.description}
          </p>
        )}
      </div>

      {/* Target Badge */}
      {isTarget && (
        <div className="hidden sm:flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-xl border border-white/20 ml-2">
          <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
          <span className="text-[9px] font-black uppercase text-white tracking-[0.1em]">Target</span>
        </div>
      )}
    </div>
  );
};
