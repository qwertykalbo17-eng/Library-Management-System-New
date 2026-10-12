import React from 'react';
import { BookOpen, Search, ArrowRight, ShieldCheck, Zap, HeartHandshake, CheckCircle2, BookMarked, Users, Sparkles, Clock, MapPin } from 'lucide-react';
import { db } from '../db/libraryDatabase';
import { useLibraryData } from '../db/useLibraryData';
import { Book } from '../types';
import { MMSCLogo } from '../components/MMSCLogo';

interface HomePageProps {
  onNavigate: (tab: string) => void;
  onSelectBook: (book: Book) => void;
  onOpenResearchModal: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onSelectBook,
  onOpenResearchModal,
}) => {
  const { data: allBooks, loading } = useLibraryData(
    () => db.getBooks(),
    [],
    [] as Book[]
  );

  // Show the 3 most borrowed books. If none have been borrowed yet, they appear alphabetically.
  const featuredBooks = [...allBooks]
    .sort((a, b) => b.borrow_count - a.borrow_count || a.title.localeCompare(b.title))
    .slice(0, 3);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 text-white">
        {/* Subtle patterned overlay with academic library imagery */}
        <div className="absolute inset-0 opacity-20 mix-blend-overlay">
          <img
            src="/src/assets/images/hero_school_library_1790866107403.jpg"
            alt="School Library Reading Hall"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6">
              {/* Official Institution Kicker */}
              <div className="flex items-center gap-3">
                <MMSCLogo className="w-12 h-12" />
                <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs text-amber-300 backdrop-blur-xs">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="font-semibold uppercase tracking-wider text-[11px]">
                    My Messiah School of Cavite, Inc. · Delas Alas Campus
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight font-serif-display">
                  Senior High School Library Management System
                </h1>
                <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl font-normal">
                  An official institutional digital platform developed to streamline resource discovery,
                  book circulation, availability tracking, and academic research support for Senior High School
                  students (SY 2026–2027).
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onNavigate('catalog')}
                  className="px-6 py-3 text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>Browse Library Catalog</span>
                </button>
                <button
                  onClick={() => onNavigate('login')}
                  className="px-6 py-3 text-sm font-semibold text-white bg-blue-900/90 hover:bg-blue-800 border border-blue-700/60 rounded-lg transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <span>Student Portal Login</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Research Title Badge */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <div className="truncate pr-4">
                  <span className="text-amber-400 font-semibold uppercase text-[10px] block">
                    Research Assessment System SY 2026–2027
                  </span>
                  <span className="truncate italic">
                    Assessing Efficiency · Accuracy · User Satisfaction
                  </span>
                </div>
                <button
                  onClick={onOpenResearchModal}
                  className="text-amber-300 hover:text-white underline whitespace-nowrap text-xs cursor-pointer font-medium"
                >
                  Learn More
                </button>
              </div>
            </div>

            {/* Right Visual Column (Featured Photo & Quick Status) */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-800/80">
                <img
                  src="/src/assets/images/hero_school_library_1790866107403.jpg"
                  alt="Delas Alas Campus Library"
                  className="w-full h-80 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-6 flex flex-col justify-end">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Delas Alas Campus Learning Center</span>
                  </div>
                  <h3 className="text-white font-bold text-lg">
                    Modern Academic Learning Space
                  </h3>
                  <p className="text-slate-300 text-xs mt-1">
                    Equipped with print collections, quiet reading carrels, and digital catalog workstations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brief System Explanation / Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
          <span className="text-xs font-bold text-blue-900 uppercase tracking-widest">
            Institutional Purpose & Evaluation
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Transforming School Library Operations
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Developed specifically for Senior High School students at My Messiah School of Cavite,
            Inc. – Delas Alas Campus, this system addresses traditional paper logbook limitations
            through three empirical dimensions:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">1. Operational Efficiency</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Provides instantaneous catalog search by title, author, or strand; live copy availability counts; and rapid 1-click checkout and return confirmations.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-900 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">2. Record Accuracy</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Eliminates logbook record loss, automatically tracks 7-day loan due dates, flags overdue items, and maintains synchronized student borrowing ledgers.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-900 flex items-center justify-center mb-4">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">3. User Satisfaction</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tailored specifically for Senior High School students across STEM, ABM, HUMSS, GAS, and TVL with clean, legible typography and responsive accessibility.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Resources Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-blue-900 uppercase tracking-widest block mb-1">
              Curriculum Collections
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Featured Senior High School Resources
            </h2>
          </div>
          <button
            onClick={() => onNavigate('catalog')}
            className="text-xs font-bold text-blue-900 hover:text-blue-950 flex items-center gap-1.5 cursor-pointer group"
          >
            <span>View Complete Catalog ({allBooks.length} Titles)</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading && (
            <p className="text-sm text-slate-500 col-span-3">Loading featured resources…</p>
          )}
          {featuredBooks.map((book) => (
            <div
              key={book.book_id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between"
            >
              <div className="p-5 flex gap-4">
                <div className="w-24 h-32 shrink-0 overflow-hidden rounded-md border border-slate-100 shadow-xs">
                  {book.cover_image ? (
                    <img
                      src={book.cover_image}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-900 text-amber-300 p-2 text-[10px] font-mono flex items-center justify-center text-center">
                      {book.shelf_location}
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-1.5 min-w-0">
                  <div className="text-[11px] font-bold text-blue-900 uppercase tracking-wider">
                    {book.category}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                    {book.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-1">{book.author}</p>

                  <div className="pt-2 text-xs text-slate-500 flex items-center gap-2">
                    <span className="font-mono text-[11px] text-slate-700">{book.shelf_location}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-semibold text-emerald-700">
                      {book.available_copies} available
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-mono">
                  ISBN: {book.isbn ? book.isbn.slice(-8) : 'N/A'}
                </span>
                <button
                  onClick={() => onSelectBook(book)}
                  className="px-3 py-1.5 text-xs font-semibold text-blue-900 hover:text-white bg-blue-50 hover:bg-blue-900 rounded-md transition-colors cursor-pointer"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Library Services Section */}
      <section className="bg-slate-100/70 border-y border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-blue-900 uppercase tracking-widest">
              Student Support
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Delas Alas Campus Library Services
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Structured to support the academic journey of Senior High School students in their coursework,
              capstone projects, and practical research inquiries.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="w-9 h-9 rounded-lg bg-blue-900 text-white flex items-center justify-center mb-3">
                <BookMarked className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">
                DepEd SHS Textbooks
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Core and applied subject textbooks for STEM, ABM, HUMSS, GAS, and TVL tracks aligned with current learning competencies.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="w-9 h-9 rounded-lg bg-blue-900 text-white flex items-center justify-center mb-3">
                <Search className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">
                Practical Research Reference
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Dedicated research manuals, qualitative & quantitative methodology guides, and previous student thesis archives.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="w-9 h-9 rounded-lg bg-blue-900 text-white flex items-center justify-center mb-3">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">
                Circulation & Reserve
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Streamlined 7-day borrowing cycle with automated SMS/digital reminders and straightforward return confirmations.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="w-9 h-9 rounded-lg bg-blue-900 text-white flex items-center justify-center mb-3">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">
                Study Carrels & Assistance
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Comfortable quiet zones for individual review and reference librarians ready to assist with citation formatting and literature search.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Operational Information & Campus Hours */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-slate-900 rounded-2xl p-6 sm:p-10 text-white border border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                Delas Alas Campus Desk
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold leading-tight">
                Visiting the School Library
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                The Delas Alas Campus Library is situated on the 2nd Floor of the Senior High School
                Building. All enrolled SHS students are automatically registered and can borrow up to
                3 books concurrently using their student credentials.
              </p>

              <div className="pt-2 flex flex-wrap gap-4 text-xs">
                <div className="bg-slate-800/80 px-4 py-2.5 rounded-lg border border-slate-700">
                  <span className="text-slate-400 block text-[11px]">Regular Hours</span>
                  <span className="font-semibold text-white">Mon – Fri: 7:30 AM – 5:00 PM</span>
                </div>
                <div className="bg-slate-800/80 px-4 py-2.5 rounded-lg border border-slate-700">
                  <span className="text-slate-400 block text-[11px]">Loan Policy</span>
                  <span className="font-semibold text-amber-300">7 Calendar Days / Resource</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Quick Student Actions
              </h4>
              <div className="space-y-2.5">
                <button
                  onClick={() => onNavigate('catalog')}
                  className="w-full py-2.5 px-4 text-xs font-semibold text-left text-slate-200 bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>Search Book by Strand or Subject</span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                </button>
                <button
                  onClick={() => onNavigate('login')}
                  className="w-full py-2.5 px-4 text-xs font-semibold text-left text-slate-200 bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>Access Student Account Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                </button>
                <button
                  onClick={onOpenResearchModal}
                  className="w-full py-2.5 px-4 text-xs font-semibold text-left text-slate-200 bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>Read 2026–2027 Research Context</span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};