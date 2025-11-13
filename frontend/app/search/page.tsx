'use client';

import { SearchBar } from '@/components/search/SearchBar';
import { SearchResults } from '@/components/search/SearchResults';

export default function SearchPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Поиск</h1>
        <SearchBar showSuggestions={false} />
      </div>

      <SearchResults />
    </div>
  );
}

