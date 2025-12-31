
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { SearchForm } from './components/SearchForm';
import { ResultCard } from './components/ResultCard';
import { GeminiService } from './services/geminiService';
import { historyService } from './services/historyService';
import { SearchResponse, SearchEngine, HistoryRecord, SearchResult, US_STATES } from './types';

const App: React.FC = () => {
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [isAiStudio, setIsAiStudio] = useState<boolean>(false);
  const [manualKey, setManualKey] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [pcData, setPcData] = useState<SearchResponse | null>(null);
  const [mobileData, setMobileData] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [targetSite, setTargetSite] = useState('');
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      // 1. 优先检查 AI Studio 环境
      if (typeof window !== 'undefined' && (window as any).aistudio) {
        setIsAiStudio(true);
        try {
          const selected = await (window as any).aistudio.hasSelectedApiKey();
          setHasKey(selected);
        } catch (e) {
          setHasKey(false);
        }
      } else {
        setIsAiStudio(false);
        // 2. 检查环境变量
        const envKey = process.env.API_KEY;
        // 3. 检查本地存储
        const savedKey = localStorage.getItem('user_gemini_key');
        
        if (envKey) {
          setHasKey(true);
        } else if (savedKey) {
          setManualKey(savedKey);
          setHasKey(true);
        } else {
          setHasKey(false);
        }
      }
    };
    checkKey();
    setHistory(historyService.getHistory());
  }, []);

  const handleSaveManualKey = (key: string) => {
    if (key.startsWith('AIza')) {
      localStorage.setItem('user_gemini_key', key);
      setManualKey(key);
      setHasKey(true);
      setError(null);
    } else {
      setError("Invalid API Key format. Should start with 'AIza'.");
    }
  };

  const handleClearKey = () => {
    localStorage.removeItem('user_gemini_key');
    setManualKey('');
    setHasKey(false);
  };

  const handleOpenSelectKey = async () => {
    if (isAiStudio && (window as any).aistudio) {
      try {
        await (window as any).aistudio.openSelectKey();
        setHasKey(true);
      } catch (e) {
        console.error("Failed to open key selector", e);
      }
    }
  };

  const handleSearch = async (website: string, keywords: string, state: string, engine: SearchEngine) => {
    if (!hasKey) {
      setError("API Key is missing. Please set it in the configuration area below.");
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
      const gemini = new GeminiService(manualKey);
      
      const [pcResult, mobileResult] = await Promise.all([
        gemini.analyzeOrganicRank(website, keywords, state, engine, 'Desktop'),
        gemini.analyzeOrganicRank(website, keywords, state, engine, 'Mobile')
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
      };

      setHistory(historyService.saveRecord(newRecord));
    } catch (err: any) {
      setError(err.message || 'Audit failed.');
    } finally {
      setLoading(false);
    }
  };

  const renderRankColumn = (data: SearchResponse, title: string, icon: React.ReactNode) => (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 px-8 py-8 bg-white rounded-[40px] border border-slate-200 shadow-xl relative overflow-hidden group">
        <div className="flex items-center gap-4">
          <div className="p-5 bg-indigo-600 text-white rounded-3xl shadow-lg">
            {icon}
          </div>
          <div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{title} Audit</h3>
            <p className="text-4xl font-black text-slate-900 tracking-tighter">
              Rank <span className="text-indigo-600">{data.targetRank ? `#${data.targetRank}` : 'N/A'}</span>
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col gap-4">
        {data.results.map(r => (
          <ResultCard 
            key={`${r.rank}-${r.url}`} 
            result={r} 
            isTarget={r.url.toLowerCase().includes(targetSite)} 
          />
        ))}
      </div>
    </div>
  );

  return (
    <Layout onSwitchKey={isAiStudio ? handleOpenSelectKey : undefined}>
      <div className="space-y-16 max-w-7xl mx-auto pb-32 px-4">
        <div className="text-center space-y-6">
          <h1 className="text-5xl md:text-8xl font-black text-slate-900 tracking-tighter">
            Organic <span className="text-indigo-600">Audit</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto">
            Professional keyword ranking analysis with Google Search Grounding.
          </p>
        </div>

        <SearchForm 
          onSearch={handleSearch} 
          isLoading={loading} 
          hasKey={hasKey} 
          isAiStudio={isAiStudio}
          manualKey={manualKey}
          onSaveKey={handleSaveManualKey}
          onClearKey={handleClearKey}
          onOpenKeySelector={handleOpenSelectKey}
        />

        {error && (
          <div className="bg-rose-50 border border-rose-200 p-8 rounded-3xl text-rose-700 font-bold flex items-center gap-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth={2} /></svg>
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-32 flex flex-col items-center gap-6">
            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="font-black text-slate-400 uppercase tracking-widest animate-pulse">Analyzing SERPs...</p>
          </div>
        ) : pcData && mobileData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {renderRankColumn(pcData, 'Desktop', (
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeWidth={2}/></svg>
            ))}
            {renderRankColumn(mobileData, 'Mobile', (
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" strokeWidth={2}/></svg>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default App;
