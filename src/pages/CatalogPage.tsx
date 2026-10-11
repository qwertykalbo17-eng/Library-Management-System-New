import React, { useState, useMemo, useEffect } from 'react';
import { Book, Category } from '../types';
import { db } from '../db/libraryDatabase';
import {
  Search,
  Filter,
  ArrowUpDown,
  BookOpen,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RotateCcw,
} from 'lucide-react';

interface CatalogPageProps {
  onSelectBook: (book: Book) => void;
}

export const CatalogPage: React.FC<CatalogPageProps> = ({ onSelectBook }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [booksError, setBooksError] = useState('');

  useEffect(() => {
    let active = true;

    const loadCatalog = async () => {
      try {
        const [loadedBooks, loadedCategories] = await Promise.all([db.getBooks(), db.getCategories()]);
        if (!active) return;
        setBooks(loadedBooks);
        setCategories(loadedCategories);
        setBooksError('');
      } catch (e) {
        if (active) setBooksError(e instanceof Error ? e.message : 'Could not load the catalog.');
      } finally {
        if (active) setLoadingBooks(false);
      }
    };

    loadCatalog();
    // Reload when a book is borrowed or returned so copy counts stay current
    const onChange = () => loadCatalog();
    window.addEventListener('library:changed', onChange);
    return () => {
      active = false;
      window.removeEventListener('library:changed', onChange);
    };
  }, []);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAvailability, setSelectedAvailability] = useState<string>('all');
  const [selectedAuthor, setSelectedAuthor] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popular');

  // Unique authors list for filter
  const uniqueAuthors = useMemo(() => {
    const authors = Array.from(new Set(books.map((b) => b.author.split('&')[0].trim())));
    return authors.sort();
  }, [books]);

  // Filter & Sort logic
  const filteredBooks = useMemo(() => {
    return books
      .filter((book) => {
        // Query search: title, author, isbn, category, description, shelf_location
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesTitle = book.title.toLowerCase().includes(q);
          const matchesAuthor = book.author.toLowerCase().includes(q);
          const matchesIsbn = book.isbn.toLowerCase().includes(q);
          const matchesCategory = book.category.toLowerCase().includes(q);
          const matchesDesc = book.description.toLowerCase().includes(q);
          const matchesShelf = book.shelf_location.toLowerCase().includes(q);

          if (
            !matchesTitle &&
            !matchesAuthor &&
            !matchesIsbn &&
            !matchesCategory &&
            !matchesDesc &&
            !matchesShelf
          ) {
            return false;
          }
        }

        // Category filter
        if (selectedCategory !== 'all' && book.category !== selectedCategory) {
          return false;
        }

        // Author filter
        if (selectedAuthor !== 'all' && !book.author.includes(selectedAuthor)) {
          return false;
        }

        // Availability filter
        if (selectedAvailability === 'available') {
          return book.available_copies > 0;
        }
        if (selectedAvailability === 'limited') {
          return book.available_copies > 0 && book.available_copies <= 2;
        }
        if (selectedAvailability === 'unavailable') {
          return book.available_copies === 0;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'popular') return b.borrow_count - a.borrow_count;
        if (sortBy === 'title-asc') return a.title.localeCompare(b.title);
        if (sortBy === 'title-desc') return b.title.localeCompare(a.title);
        if (sortBy === 'year-desc') return b.publication_year - a.publication_year;
        if (sortBy === 'copies-desc') return b.available_copies - a.available_copies;
        return 0;
      });
  }, [books, searchQuery, selectedCategory, selectedAvailability, selectedAuthor, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedAvailability('all');
    setSelectedAuthor('all');
    setSortBy('popular');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-900 uppercase tracking-widest">
          <span>Digital Catalog</span>
          <span>·</span>
          <span>Delas Alas Learning Resource Center</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif-display">
              Senior High School Library Catalog
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Search and verify print book resources, shelf call numbers, and real-time copy availability.
            </p>
          </div>
          <div className="text-xs text-slate-500 font-medium tabular-nums">
            Showing <strong className="text-slate-900">{filteredBooks.length}</strong> of{' '}
            <strong className="text-slate-900">{books.length}</strong> cataloged titles
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, author name, ISBN (e.g. 978-...), category, or shelf code..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 p-1"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Segmented Buttons (Interactive filter controls) */}
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Filter by Senior High Track & Category:
          </span>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
              }`}
            >
              All Categories
            </button>
            {categories.map((c) => (
              <button
                key={c.category_id}
                onClick={() => setSelectedCategory(c.category_name)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  selectedCategory === c.category_name
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
                }`}
              >
                {c.category_name}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Filter Dropdowns & Sorting */}
        <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Availability filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Availability
            </label>
            <select
              value={selectedAvailability}
              onChange={(e) => setSelectedAvailability(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-900"
            >
              <option value="all">All Availability Statuses</option>
              <option value="available">Available Now</option>
              <option value="limited">Limited Copies (≤ 2)</option>
              <option value="unavailable">Currently Borrowed / Out of Stock</option>
            </select>
          </div>

          {/* Author filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Author
            </label>
            <select
              value={selectedAuthor}
              onChange={(e) => setSelectedAuthor(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-900 truncate"
            >
              <option value="all">All Authors</option>
              {uniqueAuthors.map((author) => (
                <option key={author} value={author}>
                  {author}
                </option>
              ))}
            </select>
          </div>

          {/* Sort order */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-900"
            >
              <option value="popular">Most Frequently Borrowed</option>
              <option value="title-asc">Title: A to Z</option>
              <option value="title-desc">Title: Z to A</option>
              <option value="year-desc">Publication Year: Newest First</option>
              <option value="copies-desc">Available Copies: Highest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Book Grid */}
      {loadingBooks ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-sm text-slate-500">
          Loading catalog…
        </div>
      ) : booksError ? (
        <div className="bg-red-50 rounded-xl border border-red-200 p-6 text-center text-sm text-red-700">
          Could not load the catalog: {booksError}
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">No matching books found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              We couldn't find any resources matching your search terms or filters. Check your spelling or reset filters to view all catalog items.
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => {
            const isAvail = book.available_copies > 0;
            const isLimited = book.available_copies > 0 && book.available_copies <= 2;

            return (
              <div
                key={book.book_id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-5 flex gap-4">
                  {/* Cover */}
                  <div className="w-24 h-32 shrink-0 overflow-hidden rounded-md border border-slate-100 shadow-xs bg-slate-900">
                    {book.cover_image ? (
                      <img
                        src={book.cover_image}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="w-full h-full p-2 text-white flex flex-col justify-between text-[10px]">
                        <span className="text-[9px] font-mono text-amber-300">
                          {book.shelf_location}
                        </span>
                        <BookOpen className="w-6 h-6 text-amber-400 opacity-80" />
                        <span className="text-[8px] text-slate-400">Delas Alas</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="text-[11px] font-bold text-blue-900 uppercase tracking-wider truncate">
                      {book.category}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-blue-950 transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-1">By {book.author}</p>

                    {/* Metadata line (Anti-slop clean unboxed) */}
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1">
                      <span>{book.publication_year}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-slate-600">{book.shelf_location}</span>
                    </div>

                    {/* Stock badge */}
                    <div className="pt-2">
                      {!isAvail ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600">
                          <XCircle className="w-3.5 h-3.5" />
                          Currently Borrowed
                        </span>
                      ) : isLimited ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 tabular-nums">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Limited ({book.available_copies} of {book.total_copies})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 tabular-nums">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Available ({book.available_copies} copies)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-mono">
                    ISBN: {book.isbn.slice(-8)}
                  </span>
                  <button
                    onClick={() => onSelectBook(book)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-blue-900 hover:text-white bg-blue-50 hover:bg-blue-900 rounded-md transition-colors cursor-pointer"
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};