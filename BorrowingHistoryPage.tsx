import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../db/libraryDatabase';
import {
  Calendar,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  BookOpen,
  Filter,
} from 'lucide-react';

interface BorrowingHistoryPageProps {
  onNavigate: (tab: string) => void;
}

export const BorrowingHistoryPage: React.FC<BorrowingHistoryPageProps> = ({ onNavigate }) => {
  const { currentStudent } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Returned' | 'Borrowed' | 'Overdue'>('all');

  const transactions = useMemo(() => {
    if (!currentStudent) return [];
    return db.getTransactionsForStudent(currentStudent.student_id);
  }, [currentStudent]);

  const allBooks = useMemo(() => db.getBooks(), []);

  const filtered = useMemo(() => {
    return transactions.filter((txn) => {
      const book = allBooks.find((b) => b.book_id === txn.book_id);
      const titleMatch = book?.title.toLowerCase().includes(searchQuery.toLowerCase().trim()) ?? false;
      const authorMatch = book?.author.toLowerCase().includes(searchQuery.toLowerCase().trim()) ?? false;
      const idMatch = txn.transaction_id.toLowerCase().includes(searchQuery.toLowerCase().trim());

      if (searchQuery.trim() && !titleMatch && !authorMatch && !idMatch) {
        return false;
      }

      if (statusFilter !== 'all') {
        if (statusFilter === 'Returned') {
          return txn.return_date !== null;
        }
        if (statusFilter === 'Borrowed') {
          return txn.return_date === null && txn.status === 'Borrowed';
        }
        if (statusFilter === 'Overdue') {
          return txn.return_date === null && txn.status === 'Overdue';
        }
      }

      return true;
    });
  }, [transactions, allBooks, searchQuery, statusFilter]);

  if (!currentStudent) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-900 uppercase tracking-widest mb-1">
            <span>Historical Ledger</span>
            <span>·</span>
            <span>Senior High School</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif-display">
            Borrowing History
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Complete archive of checked-out books, scheduled due dates, and return records for SY 2026–2027.
          </p>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Student ID: <strong className="text-slate-800">{currentStudent.student_id}</strong>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by book title or transaction ID..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
            Status:
          </span>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs w-full sm:w-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 font-semibold rounded-md transition-colors cursor-pointer ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              All ({transactions.length})
            </button>
            <button
              onClick={() => setStatusFilter('Returned')}
              className={`px-3 py-1 font-semibold rounded-md transition-colors cursor-pointer ${
                statusFilter === 'Returned' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Returned
            </button>
            <button
              onClick={() => setStatusFilter('Borrowed')}
              className={`px-3 py-1 font-semibold rounded-md transition-colors cursor-pointer ${
                statusFilter === 'Borrowed' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter('Overdue')}
              className={`px-3 py-1 font-semibold rounded-md transition-colors cursor-pointer ${
                statusFilter === 'Overdue' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Overdue
            </button>
          </div>
        </div>
      </div>

      {/* History Table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="text-sm font-bold text-slate-800">No transaction records found</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No borrowing transactions match your current search and filter criteria.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Txn ID</th>
                  <th className="py-3 px-4">Book Title & Author</th>
                  <th className="py-3 px-4">Borrow Date</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Return Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((txn) => {
                  const book = allBooks.find((b) => b.book_id === txn.book_id);
                  const isReturned = txn.return_date !== null;

                  return (
                    <tr key={txn.transaction_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
                        {txn.transaction_id}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block line-clamp-1">
                          {book?.title || 'Unknown Resource'}
                        </span>
                        <span className="text-slate-500 text-[11px] block">
                          By {book?.author || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700">
                        {txn.borrow_date}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700">
                        {txn.due_date}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold">
                        {isReturned ? (
                          <span className="text-emerald-700">{txn.return_date}</span>
                        ) : (
                          <span className="text-slate-400 italic">Pending Return</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {isReturned ? (
                          <span className="inline-flex items-center gap-1 text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Returned
                          </span>
                        ) : txn.status === 'Overdue' ? (
                          <span className="inline-flex items-center gap-1 text-red-700 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-200 text-[11px]">
                            <AlertTriangle className="w-3 h-3 text-red-600" />
                            Overdue
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-blue-800 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-[11px]">
                            <Clock className="w-3 h-3 text-blue-600" />
                            Active Loan
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px] max-w-xs truncate">
                        {txn.notes || 'Standard checkout'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
