
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  onSwitchKey?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, onSwitchKey }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-100 flex flex-col">
      <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg shadow-indigo-200 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800">OrganicRank<span className="text-indigo-600">Pro</span></span>
          </div>
          <div className="flex items-center gap-4">
             <button 
              onClick={onSwitchKey}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest rounded-lg transition-all border border-slate-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              Manage API Key
            </button>
            <nav className="hidden lg:flex gap-6 text-sm font-medium text-slate-500">
              <a href="#" className="hover:text-indigo-600 transition-colors">API Status</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Support</a>
            </nav>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto w-full px-4 py-8 flex-grow">
        {children}
      </main>
      <footer className="mt-auto py-12 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">© 2024 OrganicRank Pro. Optimized for High-Depth Search.</p>
          <div className="flex gap-4">
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-medium border border-emerald-200">Dedicated Quota Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
