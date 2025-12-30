
export interface SearchResult {
  rank: number;
  url: string;
  title: string;
  description: string;
  keywords: string[];
  isTarget?: boolean;
}

export interface SearchResponse {
  targetRank: number | null;
  results: SearchResult[];
  summary: string;
  sources: { title: string; uri: string }[];
  searchUrl?: string;
}

export interface HistoryRecord {
  id: string;
  timestamp: number;
  website: string;
  keywords: string;
  state: string;
  engine: SearchEngine;
  targetRank: number | null;
  summary: string;
  useLocation?: boolean;
}

export type SearchEngine = 'Google' | 'Bing' | 'Yahoo' | 'DuckDuckGo';

export const SEARCH_ENGINES: SearchEngine[] = ['Google' , 'Bing', 'Yahoo', 'DuckDuckGo'];

export const US_STATES = [
  "Native IP / Current Location",
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", 
  "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", 
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", 
  "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", 
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", 
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", 
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", 
  "Wisconsin", "Wyoming"
];
