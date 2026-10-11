import React from 'react';
import { useAuth } from '../context/AuthContext';
import { db, SYSTEM_CURRENT_DATE } from '../db/libraryDatabase';
import { useLibraryData } from '../db/useLibraryData';
import { Book, BorrowingTransaction } from '../types';
import {
  BookOpen,
  RotateCcw,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Search,
  MapPin,
} from 'lucide-react';

interface MyBorrowedBooksPageProps {
  onNavigate: (tab: string) => void;
  onInitiateReturn: (txn: BorrowingTransaction, book: Book) => void;
}

export const MyBorrowedBooksPage: React.FC<MyBorrowedBooksPageProps> = ({
  onNavigate,
  onInitiateReturn,
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
    return <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 text-sm text-slate-500">Loading your borrowed books…</div>;
  }
  if (error) {
    return <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 text-sm text-red-700">Could not load your books: {error}</div>;
  }

  const transactions = data.transactions;
  const allBooks = data.books;
  const activeTransactions = transactions.filter((t) => t.return_date === null);
  const todayMs = new Date(SYSTEM_CURRENT_DATE).getTime();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-900 uppercase tracking-widest mb-1">
            <span>Circulation Ledger</span>
            <span>·</span>
            <span>Senior High School</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif-display">
            My Currently Borrowed Books
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Monitor active loans, scheduled due dates, and initiate returns to the Delas Alas Circulation Desk.
          </p>
        </div>

        <button
          onClick={() => onNavigate('catalog')}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-950 rounded-lg transition-colors shadow-xs cursor-pointer"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Browse More Books</span>
        </button>
      </div>

      {activeTransactions.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">No active book loans</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Your account is completely clear with zero pending returns. Visit the catalog to check out learning resources.
            </p>
          </div>
          <button
            onClick={() => onNavigate('catalog')}
            className="px-4 py-2 text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors cursor-pointer"
          >
            Explore Library Catalog
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Book Title & Author</th>
                  <th className="py-3 px-4">Shelf Location</th>
                  <th className="py-3 px-4">Borrow Date</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Days Remaining</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeTransactions.map((txn) => {
                  const book = allBooks.find((b) => b.book_id === txn.book_id);
                  if (!book) return null;

                  const dueMs = new Date(txn.due_date).getTime();
                  const diffDays = Math.ceil((dueMs - todayMs) / (1000 * 60 * 60 * 24));

                  return (
                    <tr key={txn.transaction_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-14 shrink-0 bg-slate-900 rounded overflow-hidden">
                            {book.cover_image ? (
                              <img
                                src={book.cover_image}
                                alt={book.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[7px] text-amber-300 font-mono">
                                {book.shelf_location}
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 line-clamp-1">
                              {book.title}
                            </span>
                            <span className="text-slate-500 block text-[11px]">By {book.author}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-mono text-slate-700">
                        {book.shelf_location}
                      </td>
                      <td className="py-4 px-4 text-slate-600 font-mono">
                        {txn.borrow_date}
                      </td>
                      <td className="py-4 px-4 font-mono font-semibold text-slate-800">
                        {txn.due_date}
                      </td>
                      <td className="py-4 px-4">
                        {diffDays < 0 ? (
                          <span className="text-red-700 font-bold tabular-nums">
                            {Math.abs(diffDays)} day{Math.abs(diffDays) === 1 ? '' : 's'} overdue
                          </span>
                        ) : diffDays <= 2 ? (
                          <span className="text-amber-700 font-bold tabular-nums">
                            {diffDays} day{diffDays === 1 ? '' : 's'} remaining
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-semibold tabular-nums">
                            {diffDays} days remaining
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {txn.status === 'Overdue' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-red-50 text-red-700 font-bold border border-red-200 text-[11px]">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Overdue
                          </span>
                        ) : txn.status === 'Due Soon' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-50 text-amber-800 font-bold border border-amber-200 text-[11px]">
                            <Clock className="w-3.5 h-3.5" />
                            Due Soon
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Borrowed
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => onInitiateReturn(txn, book)}
                          className="px-3 py-1.5 text-xs font-semibold text-blue-900 hover:text-white bg-blue-50 hover:bg-blue-900 rounded-md transition-colors cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Return Book</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {activeTransactions.map((txn) => {
              const book = allBooks.find((b) => b.book_id === txn.book_id);
              if (!book) return null;

              const dueMs = new Date(txn.due_date).getTime();
              const diffDays = Math.ceil((dueMs - todayMs) / (1000 * 60 * 60 * 24));

              return (
                <div
                  key={txn.transaction_id}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3"
                >
                  <div className="flex gap-3">
                    <div className="w-16 h-22 shrink-0 bg-slate-900 rounded overflow-hidden">
                      {book.cover_image ? (
                        <img
                          src={book.cover_image}
                          alt={book.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[7px] text-amber-300 font-mono">
                          {book.shelf_location}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 text-sm line-clamp-2">
                        {book.title}
                      </h4>
                      <p className="text-xs text-slate-500">By {book.author}</p>
                      <div className="mt-1 text-[11px] text-slate-400 font-mono">
                        Shelf: {book.shelf_location}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <div>
                      <span className="text-slate-400 text-[10px]">Borrowed</span>
                      <p className="font-semibold text-slate-800">{txn.borrow_date}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">Due Date</span>
                      <p className="font-bold text-slate-900">{txn.due_date}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      {txn.status === 'Overdue' ? (
                        <span className="text-red-700 font-bold text-xs">
                          {Math.abs(diffDays)}d Overdue
                        </span>
                      ) : txn.status === 'Due Soon' ? (
                        <span className="text-amber-700 font-bold text-xs">
                          Due in {diffDays} day{diffDays === 1 ? '' : 's'}
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-semibold text-xs">
                          {diffDays} days left
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => onInitiateReturn(txn, book)}
                      className="px-4 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-950 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Return Book</span>
                    </button>
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