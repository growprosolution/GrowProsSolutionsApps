
import { HistoryRecord } from "../types";

const STORAGE_KEY = 'organic_rank_history';

export const historyService = {
  getHistory: (): HistoryRecord[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveRecord: (record: HistoryRecord) => {
    const history = historyService.getHistory();
    const updated = [record, ...history].slice(0, 50); // Keep last 50
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  clearHistory: () => {
    localStorage.removeItem(STORAGE_KEY);
  },

  exportToCSV: (history: HistoryRecord[]) => {
    const headers = ['Timestamp', 'Website', 'Keywords', 'Engine', 'State', 'Target Rank', 'Summary'];
    const rows = history.map(h => [
      new Date(h.timestamp).toLocaleString(),
      h.website,
      h.keywords,
      h.engine,
      h.state,
      h.targetRank || 'Not Found',
      h.summary.replace(/"/g, '""')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `seo_search_history_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
