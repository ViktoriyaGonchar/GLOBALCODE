'use client';

import { useState, useEffect, useRef } from 'react';
import { searchApi, SearchResult } from '@/lib/api/search';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SearchBarProps {
  onSelect?: (result: SearchResult) => void;
  showSuggestions?: boolean;
}

export function SearchBar({ onSelect, showSuggestions = true }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (query.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    timeoutRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await searchApi.globalSearch(query, 5);
        if (response.success && response.data) {
          setSuggestions(response.data);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowDropdown(false);
    }
  };

  const handleSelect = (result: SearchResult) => {
    if (onSelect) {
      onSelect(result);
    } else {
      router.push(result.url);
    }
    setShowDropdown(false);
    setQuery('');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'project':
        return '📁';
      case 'topic':
        return '💬';
      case 'user':
        return '👤';
      case 'course':
        return '📚';
      default:
        return '🔍';
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="relative">
        <Input
          type="text"
          placeholder="Поиск проектов, тем, пользователей, курсов..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowDropdown(true);
            }
          }}
          className="w-full pr-10"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          🔍
        </button>
      </form>

      {showSuggestions && showDropdown && (query.length >= 2 || suggestions.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">
              Поиск...
            </div>
          ) : suggestions.length > 0 ? (
            <div className="py-2">
              {suggestions.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleSelect(result)}
                  className="w-full text-left px-4 py-3 hover:bg-accent transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl">{getTypeIcon(result.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{result.title}</p>
                      {result.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {result.description}
                        </p>
                      )}
                      {result.author && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {result.author.username}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
              <div className="border-t px-4 py-2">
                <Link
                  href={`/search?q=${encodeURIComponent(query)}`}
                  className="text-sm text-primary hover:underline"
                >
                  Показать все результаты →
                </Link>
              </div>
            </div>
          ) : query.length >= 2 ? (
            <div className="p-4 text-center text-muted-foreground">
              Ничего не найдено
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

