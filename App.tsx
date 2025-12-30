
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { SearchForm } from './components/SearchForm';
import { ResultCard } from './components/ResultCard';
import { GeminiService } from './services/geminiService';
import { historyService } from './services/historyService';
import { SearchResponse, SearchEngine, HistoryRecord, SearchResult, US_STATES } from './types';

const App: React.FC = () => {
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [pcData, setPcData] = useState<SearchResponse | null>(null);
  const [mobileData, setMobileData] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [targetSite, setTargetSite] = useState('');
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      const selected = await window.aistudio.hasSelectedApiKey();
      setHasKey(selected);
    };
    checkKey();
    setHistory(historyService.getHistory());
  }, []);

  const handleOpenSelectKey = async () => {
    try {
      await window.aistudio.openSelectKey();
      // Assume success after triggering as per instructions
      setHasKey(true);
    } catch (e) {
      console.error("Failed to open key selector", e);
    }
  };

  const getCoordinates = (): Promise<{ latitude: number, longitude: number } | undefined> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(undefined);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        () => resolve(undefined),
        { timeout: 5000 }
      );
    });
  };

  const handleSearch = async (website: string, keywords: string, state: string, engine: SearchEngine) => {
    if (!hasKey) {
      setError("Please configure your Gemini API Key before starting an audit.");
      return;
    }

    setLoading(true);
    setError(null);
    setPcData(null);
    setMobileData(null);
    
    const normalizedTarget = website.toLowerCase()
      .replace(/^(https?:\/\/)?(www\.)?/, '')
      .split('/')[0]; 
    
    setTargetSite(normalizedTarget);
    
    try {
      let coords: { latitude: number, longitude: number } | undefined;
      if (state === US_STATES[0]) {
        coords = await getCoordinates();
      }

      const gemini = new GeminiService();
      
      const [pcResult, mobileResult] = await Promise.all([
        gemini.analyzeOrganicRank(website, keywords, state, engine, 'Desktop', undefined, coords),
        gemini.analyzeOrganicRank(website, keywords, state, engine, 'Mobile', undefined, coords)
      ]);

      setPcData(pcResult);
      setMobileData(mobileResult);

      const newRecord: HistoryRecord = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        website,
        keywords,
        state,
        engine,
        targetRank: pcResult.targetRank,
        summary: `PC: #${pcResult.targetRank || 'N/A'} | Mob: #${mobileResult.targetRank || 'N/A'}`,
        useLocation: state === US_STATES[0]
      };

      setHistory(historyService.saveRecord(newRecord));
      setShowHistory(false);
    } catch (err: any) {
      const errMsg = err.message || '';
      if (errMsg.includes("Requested entity was not found")) {
        setHasKey(false);
        setError("Your API Key session has expired or is invalid. Please re-select a valid key.");
        await handleOpenSelectKey();
      } else {
        setError(errMsg || 'Audit failed. Check API connectivity.');
      }
    } finally {
      setLoading(false);
    }
  };

  const isMatchingTarget = (url: string) => {
    if (!targetSite) return false;
    return url.toLowerCase().includes(targetSite);
  };

  const renderRankList = (results: SearchResult[]) => {
    const list = [];
    for (let i = 0; i < results.length; i++) {
      const current = results[i];
      const prev = results[i - 1];
      
      if (prev && current.rank - prev.rank > 1) {
        list.push(
          <div key={`gap-${current.rank}`} className="flex flex-col items-center py-6 group">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-2">Positions {prev.rank + 1}—{current.rank - 1} Filtered</div>
            <div className="flex gap-1.5 opacity-20 group-hover:opacity-40 transition-opacity">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-900"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-900"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-900"></span>
            </div>
          </div>
        );
        if (current.rank > 40) {
           list.push(
             <div key={`neigh-header-${current.rank}`} className="px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl mb-4 text-center">
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Target Neighborhood Cluster</span>
             </div>
           );
        }
      }
      
      list.push(
        <ResultCard 
          key={`${current.rank}-${current.url}`} 
          result={current} 
          isTarget={isMatchingTarget(current.url)} 
        />
      );
    }
    return list;
  };

  const renderRankColumn = (data: SearchResponse, title: string, icon: React.ReactNode) => (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 px-8 py-8 bg-white rounded-[40px] border border-slate-200 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
        <div className="absolute -top-6 -right-6 p-4 opacity-5 scale-[2] group-hover:rotate-12 transition-transform duration-700">
           {icon}
        </div>
        <div className="flex items-center gap-4">
          <div className="p-5 bg-indigo-600 text-white rounded-3xl shadow-lg shadow-indigo-200">
            {icon}
          </div>
          <div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{title} Audit</h3>
            <p className="text-4xl font-black text-slate-900 tracking-tighter">
              Rank <span className="text-indigo-600">{data.targetRank ? `#${data.targetRank}` : 'N/A'}</span>
            </p>
          </div>
        </div>

        {data.searchUrl && (
          <a 
            href={data.searchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all hover:text-indigo-600"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View Live SERP Page
          </a>
        )}
      </div>
      
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-200">
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Organic Ranking Sequence</span>
           <span className="text-[10px] font-bold text-slate-300">Top 40 + Neighborhood</span>
        </div>
        {renderRankList(data.results)}
      </div>
    </div>
  );

  return (
    <Layout onSwitchKey={handleOpenSelectKey}>
      <div className="space-y-16 max-w-7xl mx-auto pb-32 px-4">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-3 bg-indigo-50 px-5 py-2 rounded-full border border-indigo-100 shadow-sm">
             <span className="relative flex h-2 w-2">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
             </span>
             <span className="text-[11px] font-black text-indigo-700 uppercase tracking-[0.2em]">Real-Time Search Grounding Engine</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[0.9] lg:leading-[1.1]">
            Dual <span className="text-indigo-600">Organic</span> Comparison
          </h1>
          <p className="text-xl md:text-2xl text-slate-500 font-medium leading-relaxed max-w-3xl mx-auto">
            Auditing Top 40 listings and <span className="text-indigo-600 font-bold underline decoration-indigo-200 underline-offset-8">+/- 5 result neighborhood</span> for pure organic ranking verification.
          </p>
        </div>

        <SearchForm 
          onSearch={handleSearch} 
          isLoading={loading} 
          hasKey={hasKey} 
          onOpenKeySelector={handleOpenSelectKey}
        />

        {error && (
          <div className="bg-rose-50 border border-rose-200 p-10 rounded-[40px] text-rose-700 font-black shadow-lg flex items-start gap-6 animate-in fade-in slide-in-from-top-6">
            <div className="p-3 bg-rose-100 rounded-2xl text-rose-600">
               <svg className="w-8 h-8 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth={2} /></svg>
            </div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight mb-1">Audit Alert</h3>
              <p className="text-sm opacity-80">{error}</p>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center gap-10 py-32">
            <div className="relative">
              <div className="w-32 h-32 border-8 border-indigo-50 border-t-indigo-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 text-indigo-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                 </div>
              </div>
            </div>
            <div className="flex flex-col items-center text-center space-y-3">
               <p className="text-base font-black text-slate-900 uppercase tracking-[0.4em] animate-pulse">Scanning Global SERPs...</p>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest max-w-sm">Comparing Top 40 and extracting Target Neighborhood (Target +/- 5) up to Rank 100</p>
            </div>
          </div>
        )}

        {!showHistory && pcData && mobileData ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 animate-in fade-in slide-in-from-bottom-12">
            {renderRankColumn(pcData, 'Desktop PC', (
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            ))}

            {renderRankColumn(mobileData, 'Mobile', (
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            ))}
          </div>
        ) : !loading && !showHistory && (
          <div className="py-56 text-center text-slate-200 border-8 border-dashed border-slate-100 rounded-[80px] transition-all hover:bg-slate-50/50 group">
            <div className="mb-8 p-6 bg-slate-50 rounded-full inline-block group-hover:scale-110 transition-transform">
               <svg className="w-20 h-20 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
               </svg>
            </div>
            <p className="font-black uppercase tracking-[0.5em] text-xl text-slate-300">Awaiting Comparative Audit</p>
            <div className="flex justify-center gap-6 mt-6">
               <span className="text-[11px] font-black bg-white shadow-sm border border-slate-100 px-4 py-2 rounded-2xl text-slate-400 uppercase tracking-widest">Desktop Logic</span>
               <span className="text-[11px] font-black bg-white shadow-sm border border-slate-100 px-4 py-2 rounded-2xl text-slate-400 uppercase tracking-widest">Mobile Logic</span>
            </div>
          </div>
        )}

        {showHistory && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6">
            <div className="flex items-center justify-between">
              <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Audit Archive</h2>
              <button onClick={() => setShowHistory(false)} className="text-indigo-600 font-black text-sm uppercase tracking-widest px-8 py-4 bg-white border border-indigo-100 rounded-2xl hover:bg-indigo-50 transition-all shadow-md">Back to Audit</button>
            </div>
            <div className="bg-white rounded-[56px] border border-slate-200 overflow-hidden shadow-2xl shadow-slate-200/40">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-12 py-10 text-[11px] font-black uppercase text-slate-400 tracking-[0.3em]">Target Profile</th>
                    <th className="px-12 py-10 text-[11px] font-black uppercase text-slate-400 tracking-[0.3em]">Comparative Ranking</th>
                    <th className="px-12 py-10 text-[11px] font-black uppercase text-slate-400 tracking-[0.3em]">Audit Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-12 py-10">
                        <span className="font-black text-slate-900 text-xl block group-hover:text-indigo-600 transition-colors">{record.website}</span>
                        <span className="text-sm text-slate-400 font-bold uppercase tracking-tight mt-1 inline-block">{record.keywords}</span>
                      </td>
                      <td className="px-12 py-10">
                        <span className="text-base font-black text-indigo-700 bg-indigo-50/50 px-5 py-3 rounded-2xl border border-indigo-100 shadow-sm inline-block">
                          {record.summary}
                        </span>
                      </td>
                      <td className="px-12 py-10 text-sm text-slate-400 font-bold uppercase tracking-widest">{new Date(record.timestamp).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {history.length === 0 && (
                <div className="py-32 text-center text-slate-200 font-black uppercase tracking-[0.4em] text-lg">Empty Archive</div>
              )}
            </div>
          </div>
        )}
        
        {!loading && !showHistory && history.length > 0 && (
          <div className="text-center pt-16 border-t border-slate-100">
            <button onClick={() => setShowHistory(true)} className="group text-slate-400 hover:text-indigo-600 font-black text-xs uppercase tracking-[0.3em] transition-all flex items-center gap-3 mx-auto px-10 py-4 rounded-3xl hover:bg-white hover:shadow-xl hover:shadow-slate-200/50">
              <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Access Audit Archive ({history.length})
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default App;
