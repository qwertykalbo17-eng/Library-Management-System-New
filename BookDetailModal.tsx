import React, { useState } from 'react';
import { Book } from '../types';
import { useAuth } from '../context/AuthContext';
import { db, SYSTEM_CURRENT_DATE } from '../db/libraryDatabase';
import {
  X,
  BookOpen,
  MapPin,
  Calendar,
  Layers,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

interface BookDetailModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
  onBorrowSuccess: () => void;
  onNavigateLogin: () => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  book,
  isOpen,
  onClose,
  onBorrowSuccess,
  onNavigateLogin,
}) => {
  const { role, currentStudent } = useAuth();
  const [showBorrowConfirm, setShowBorrowConfirm] = useState(false);
  const [borrowingError, setBorrowingError] = useState<string | null>(null);
  const [borrowingSuccess, setBorrowingSuccess] = useState<string | null>(null);
  const [notes, setNotes] = useState('Senior High School research checkout');

  if (!isOpen || !book) return null;

  // Calculate 7-day due date
  const borrowDateObj = new Date(SYSTEM_CURRENT_DATE);
  const dueDateObj = new Date(SYSTEM_CURRENT_DATE);
  dueDateObj.setDate(dueDateObj.getDate() + 7);
  const formattedBorrowDate = borrowDateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedDueDate = dueDateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const isAvailable = book.available_copies > 0;
  const isLimited = book.available_copies > 0 && book.available_copies <= 2;

  // Check if current student already has this book borrowed
  const studentHasActiveBorrow =
    currentStudent &&
    db
      .getTransactionsForStudent(currentStudent.student_id)
      .some((t) => t.book_id === book.book_id && t.return_date === null);

  const handleConfirmBorrow = () => {
    if (!currentStudent) return;
    setBorrowingError(null);

    const res = db.borrowBook(currentStudent.student_id, book.book_id, notes);
    if (!res.success) {
      setBorrowingError(res.message);
    } else {
      setBorrowingSuccess(res.message);
      setTimeout(() => {
        onBorrowSuccess();
        setShowBorrowConfirm(false);
        setBorrowingSuccess(null);
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
      <div
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border border-slate-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-900 text-white rounded-t-xl">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
              {book.category} Resource
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-xs text-slate-300 font-mono">{book.shelf_location}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Book Cover / Visual Container */}
            <div className="w-full sm:w-44 shrink-0">
              {book.cover_image ? (
                <img
                  src={book.cover_image}
                  alt={book.title}
                  className="w-full sm:w-44 h-60 object-cover rounded-lg shadow-md border border-slate-200"
                />
              ) : (
                <div className="w-full sm:w-44 h-60 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-800 text-white p-4 rounded-lg flex flex-col justify-between shadow-md border border-slate-700">
                  <div className="text-[10px] uppercase font-mono text-amber-300 tracking-wider">
                    {book.shelf_location}
                  </div>
                  <div>
                    <BookOpen className="w-8 h-8 text-amber-400 mb-2 opacity-80" />
                    <p className="text-xs font-bold leading-snug line-clamp-3 text-white">
                      {book.title}
                    </p>
                    <p className="text-[10px] text-slate-300 mt-1 line-clamp-1">{book.author}</p>
                  </div>
                  <div className="text-[9px] text-slate-400 border-t border-slate-700/60 pt-1">
                    Delas Alas SHS Collection
                  </div>
                </div>
              )}

              {/* Status Badge */}
              <div className="mt-3 text-center">
                {!isAvailable ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-md text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-red-600" />
                    Currently Unavailable
                  </span>
                ) : isLimited ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Limited Copies ({book.available_copies} left)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    Available for Checkout
                  </span>
                )}
              </div>
            </div>

            {/* Book Details */}
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                  {book.title}
                </h3>
                <p className="text-sm font-medium text-slate-600 mt-1">By {book.author}</p>
              </div>

              {/* Clean Metadata List (Anti-slop zero-pill) */}
              <div className="flex flex-wrap items-center gap-y-1 gap-x-2 text-xs text-slate-500 pb-2 border-b border-slate-100">
                <span>ISBN: <strong className="text-slate-700 font-mono">{book.isbn}</strong></span>
                <span aria-hidden="true">·</span>
                <span>Year: <strong className="text-slate-700">{book.publication_year}</strong></span>
                <span aria-hidden="true">·</span>
                <span>Publisher: <strong className="text-slate-700">{book.publisher}</strong></span>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-slate-400 mb-1">
                  Description & Scope
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {book.description}
                </p>
              </div>

              {/* Inventory Specifications */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Shelf Location</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-900" />
                    {book.shelf_location}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Copy Inventory</span>
                  <span className="font-semibold text-slate-800 tabular-nums block mt-0.5">
                    {book.available_copies} available of {book.total_copies} total
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Borrowing Flow Confirmation Drawer */}
          {showBorrowConfirm ? (
            <div className="border border-blue-200 bg-blue-50/50 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-blue-200">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-900" />
                  <h4 className="text-sm font-bold text-slate-900">
                    Confirm Senior High School Borrowing Transaction
                  </h4>
                </div>
                <span className="text-xs font-mono text-blue-900 bg-blue-100 px-2 py-0.5 rounded">
                  7-Day Loan
                </span>
              </div>

              {borrowingError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{borrowingError}</span>
                </div>
              )}

              {borrowingSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{borrowingSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-400 text-[11px] block">Borrower Student</span>
                  <span className="font-bold text-slate-900 block mt-0.5">
                    {currentStudent?.full_name}
                  </span>
                  <span className="text-slate-500 font-mono text-[10px]">
                    {currentStudent?.student_id} · {currentStudent?.strand} ({currentStudent?.grade_level})
                  </span>
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-400 text-[11px] block">Loan Schedule</span>
                  <span className="font-semibold text-slate-800 block mt-0.5">
                    Issued: {formattedBorrowDate}
                  </span>
                  <span className="font-bold text-amber-700 block">
                    Due Date: {formattedDueDate}
                  </span>
                </div>
              </div>

              {/* Policy terms */}
              <div className="text-[11px] text-slate-500 bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                <p className="font-semibold text-slate-700">Official Campus Borrowing Policy:</p>
                <p>• Students are accountable for maintaining books in good physical condition.</p>
                <p>• Please return or renew on or before the due date to ensure availability for fellow students.</p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowBorrowConfirm(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-md transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmBorrow}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-950 rounded-md transition-colors cursor-pointer shadow-xs"
                >
                  Confirm Borrowing
                </button>
              </div>
            </div>
          ) : (
            /* Action Button Bar */
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                {studentHasActiveBorrow ? (
                  <span className="text-amber-700 font-medium">
                    You currently have an active borrowed copy of this resource.
                  </span>
                ) : isAvailable ? (
                  <span>Eligible for 7-day loan with active student registration.</span>
                ) : (
                  <span className="text-red-600 font-medium">
                    All copies are currently borrowed. Check back soon.
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-md transition-colors cursor-pointer text-center"
                >
                  Close
                </button>

                {role === 'guest' ? (
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateLogin();
                    }}
                    className="w-full sm:w-auto px-5 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-950 rounded-md transition-colors whitespace-nowrap cursor-pointer text-center shadow-xs"
                  >
                    Login to Borrow Book
                  </button>
                ) : role === 'student' ? (
                  <button
                    disabled={!isAvailable || !!studentHasActiveBorrow}
                    onClick={() => setShowBorrowConfirm(true)}
                    className={`w-full sm:w-auto px-5 py-2 text-xs font-bold rounded-md transition-colors whitespace-nowrap cursor-pointer shadow-xs ${
                      !isAvailable || studentHasActiveBorrow
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-blue-900 text-white hover:bg-blue-950'
                    }`}
                  >
                    {!isAvailable
                      ? 'Currently Unavailable'
                      : studentHasActiveBorrow
                      ? 'Already Borrowed'
                      : 'Borrow Book'}
                  </button>
                ) : (
                  <div className="text-xs font-medium text-slate-500 italic">
                    (Admin Mode: view only)
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
