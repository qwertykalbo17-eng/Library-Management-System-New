import React from 'react';
import { useAuth } from '../context/AuthContext';
import { db, SYSTEM_CURRENT_DATE } from '../db/libraryDatabase';
import { useLibraryData } from '../db/useLibraryData';
import { Book, BorrowingTransaction } from '../types';
import {
  BookOpen,
  Search,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  ArrowRight,
  BookMarked,
  RotateCcw,
  User,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

interface StudentDashboardPageProps {
  onNavigate: (tab: string) => void;
  onInitiateReturn: (txn: BorrowingTransaction, book: Book) => void;
  onSelectBook: (book: Book) => void;
}

export const StudentDashboardPage: React.FC<StudentDashboardPageProps> = ({
  onNavigate,
  onInitiateReturn,
  onSelectBook,
}) => {
  const { currentStudent } = useAuth();

  const { data, loading, error } = useLibraryData(
    async () => {
      if (!currentStudent) return { transactions: [] as BorrowingTransaction[], books: [] as Book[] };
      const [transactions, books] = await Promise.all([
        db.getTransactionsForStudent(currentStudent.student_id),
        db.getBooks(),
      ]);
      return { transactions, books };
    },
    [currentStudent?.student_id],
    { transactions: [] as BorrowingTransaction[], books: [] as Book[] }
  );

  if (!currentStudent) return null;

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 text-sm text-slate-500">Loading your library records…</div>;
  }
  if (error) {
    return <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 text-sm text-red-700">Could not load your records: {error}</div>;
  }

  const transactions = data.transactions;
  const allBooks = data.books;
  const metrics = db.computeStudentMetrics(transactions);

  // Currently active borrowed transactions
  const activeTransactions = transactions.filter((t) => t.return_date === null);
  const recentHistory = transactions.filter((t) => t.return_date !== null).slice(0, 3);

  // Today reference
  const todayMs = new Date(SYSTEM_CURRENT_DATE).getTime();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Student Welcome Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="relative">
            <img
              src={
                currentStudent.avatar ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
              }
              alt={currentStudent.full_name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-amber-300 shadow-xs"
            />
            <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider">
                Senior High School Student
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {currentStudent.account_status}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Welcome back, {currentStudent.full_name}!
            </h1>

            {/* Unboxed Metadata Line (anti-slop rule) */}
            <div className="flex flex-wrap items-center gap-y-1 gap-x-2 text-xs text-slate-500 font-medium">
              <span>ID: <strong className="text-slate-800 font-mono">{currentStudent.student_id}</strong></span>
              <span aria-hidden="true">·</span>
              <span>Track: <strong className="text-slate-800">{currentStudent.strand}</strong></span>
              <span aria-hidden="true">·</span>
              <span>{currentStudent.grade_level}</span>
              <span aria-hidden="true">·</span>
              <span>Section: <strong className="text-slate-800">{currentStudent.section}</strong></span>
            </div>
          </div>
        </div>

        {/* Quick Date Indicator */}
        <div className="border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5 font-semibold text-slate-800 mb-1">
            <Calendar className="w-4 h-4 text-blue-900" />
            <span>Academic Calendar SY 2026–2027</span>
          </div>
          <p>Delas Alas Campus · 1st Semester</p>
        </div>
      </div>

      {/* Overdue Alert Banner if present */}
      {metrics.overdue > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-xs sm:text-sm font-bold text-red-900">
              Action Required: You have {metrics.overdue} overdue library book(s)
            </h4>
            <p className="text-xs text-red-700 mt-0.5">
              Please return overdue items immediately to the Delas Alas Circulation Desk to restore your clear borrowing standing.
            </p>
          </div>
          <button
            onClick={() => onNavigate('my-books')}
            className="px-3 py-1.5 text-xs font-bold text-red-700 hover:text-red-900 bg-white border border-red-200 rounded-md transition-colors cursor-pointer shrink-0"
          >
            View Overdue Items
          </button>
        </div>
      )}

      {/* Dashboard Statistics Grid (with tabular numerals) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">
              Currently Borrowed
            </span>
            <BookOpen className="w-4 h-4 text-blue-900" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums font-mono">
            {metrics.currentlyBorrowed}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Maximum 3 allowed concurrently</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Due Soon</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 tabular-nums font-mono">
            {metrics.dueSoon}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Due within the next 48 hours</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Overdue Books</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-red-600 tabular-nums font-mono">
            {metrics.overdue}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Past scheduled return date</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Total Borrowed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums font-mono">
            {metrics.totalBorrowed}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Cumulative checkouts this school year</p>
        </div>
      </div>

      {/* Quick Actions Navigation Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Student Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <button
            onClick={() => onNavigate('catalog')}
            className="p-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-lg text-slate-800 hover:text-blue-900 flex flex-col items-center gap-2 text-center transition-colors cursor-pointer group"
          >
            <Search className="w-5 h-5 text-blue-900 group-hover:scale-110 transition-transform" />
            <span className="font-semibold">Search Books</span>
          </button>
          <button
            onClick={() => onNavigate('catalog')}
            className="p-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-lg text-slate-800 hover:text-blue-900 flex flex-col items-center gap-2 text-center transition-colors cursor-pointer group"
          >
            <BookMarked className="w-5 h-5 text-blue-900 group-hover:scale-110 transition-transform" />
            <span className="font-semibold">Browse Catalog</span>
          </button>
          <button
            onClick={() => onNavigate('catalog')}
            className="p-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-lg text-slate-800 hover:text-blue-900 flex flex-col items-center gap-2 text-center transition-colors cursor-pointer group"
          >
            <BookOpen className="w-5 h-5 text-blue-900 group-hover:scale-110 transition-transform" />
            <span className="font-semibold">Borrow a Book</span>
          </button>
          <button
            onClick={() => onNavigate('my-books')}
            className="p-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-lg text-slate-800 hover:text-blue-900 flex flex-col items-center gap-2 text-center transition-colors cursor-pointer group"
          >
            <Clock className="w-5 h-5 text-blue-900 group-hover:scale-110 transition-transform" />
            <span className="font-semibold">My Borrowed Books</span>
          </button>
          <button
            onClick={() => onNavigate('history')}
            className="p-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-lg text-slate-800 hover:text-blue-900 flex flex-col items-center gap-2 text-center transition-colors cursor-pointer group"
          >
            <Calendar className="w-5 h-5 text-blue-900 group-hover:scale-110 transition-transform" />
            <span className="font-semibold">Borrowing History</span>
          </button>
          <button
            onClick={() => onNavigate('student-profile')}
            className="p-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-lg text-slate-800 hover:text-blue-900 flex flex-col items-center gap-2 text-center transition-colors cursor-pointer group"
          >
            <User className="w-5 h-5 text-blue-900 group-hover:scale-110 transition-transform" />
            <span className="font-semibold">My Profile</span>
          </button>
        </div>
      </div>

      {/* Active Borrowed Books Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-lg font-bold text-slate-900 font-serif-display">
              Currently Borrowed Books
            </h3>
            <p className="text-xs text-slate-500">
              Active resources checked out to your student ID at Delas Alas Campus.
            </p>
          </div>
          {activeTransactions.length > 0 && (
            <button
              onClick={() => onNavigate('my-books')}
              className="text-xs font-semibold text-blue-900 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Manage All ({activeTransactions.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {activeTransactions.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <BookOpen className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-slate-800">
              You have no books currently checked out.
            </p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Search our digital catalog to borrow DepEd Senior High School curriculum textbooks, research guides, and literature.
            </p>
            <button
              onClick={() => onNavigate('catalog')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-950 rounded-md transition-colors shadow-xs cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Browse Catalog</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeTransactions.map((txn) => {
              const book = allBooks.find((b) => b.book_id === txn.book_id);
              if (!book) return null;

              const dueMs = new Date(txn.due_date).getTime();
              const daysRemaining = Math.ceil((dueMs - todayMs) / (1000 * 60 * 60 * 24));

              return (
                <div
                  key={txn.transaction_id}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="flex gap-4">
                    <div className="w-16 h-22 shrink-0 bg-slate-900 rounded overflow-hidden border border-slate-200">
                      {book.cover_image ? (
                        <img
                          src={book.cover_image}
                          alt={book.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full p-1 text-[8px] font-mono text-amber-300 flex items-center justify-center text-center">
                          {book.shelf_location}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider truncate">
                          {book.category}
                        </span>
                        {/* Status Badge */}
                        {txn.status === 'Overdue' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                            Overdue ({Math.abs(daysRemaining)}d past)
                          </span>
                        ) : txn.status === 'Due Soon' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Due in {daysRemaining} day{daysRemaining === 1 ? '' : 's'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {daysRemaining} days left
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                        {book.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-1">By {book.author}</p>

                      <div className="pt-1 text-[11px] text-slate-400 flex items-center gap-2">
                        <span>Borrowed: {txn.borrow_date}</span>
                        <span>·</span>
                        <span className="font-semibold text-slate-700">Due: {txn.due_date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono text-[11px]">
                      Shelf: {book.shelf_location}
                    </span>
                    <button
                      onClick={() => onInitiateReturn(txn, book)}
                      className="px-3.5 py-1.5 text-xs font-semibold text-blue-900 hover:text-white bg-blue-50 hover:bg-blue-900 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Return Book</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent History Overview */}
      {recentHistory.length > 0 && (
        <div className="space-y-3 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Recent Completed Returns</h3>
            <button
              onClick={() => onNavigate('history')}
              className="text-xs font-semibold text-blue-900 hover:underline cursor-pointer"
            >
              View Full History
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 shadow-xs">
            {recentHistory.map((txn) => {
              const book = allBooks.find((b) => b.book_id === txn.book_id);
              return (
                <div
                  key={txn.transaction_id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <h5 className="font-bold text-slate-900">{book?.title || 'Book Title'}</h5>
                    <p className="text-slate-500">By {book?.author}</p>
                  </div>
                  <div className="flex items-center gap-4 text-slate-500">
                    <span className="font-mono text-[11px]">
                      Returned on {txn.return_date || 'N/A'}
                    </span>
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      Cleared
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};