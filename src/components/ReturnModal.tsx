import React, { useState } from 'react';
import { BorrowingTransaction, Book } from '../types';
import { db, SYSTEM_CURRENT_DATE } from '../db/libraryDatabase';
import { X, CheckCircle2, RotateCcw, AlertTriangle } from 'lucide-react';

interface ReturnModalProps {
  transaction: BorrowingTransaction | null;
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
  onReturnSuccess: () => void;
}

export const ReturnModal: React.FC<ReturnModalProps> = ({
  transaction,
  book,
  isOpen,
  onClose,
  onReturnSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !transaction || !book) return null;

  const returnDateObj = new Date(SYSTEM_CURRENT_DATE);
  const formattedReturnDate = returnDateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const isOverdue = transaction.status === 'Overdue';

  const handleConfirmReturn = async () => {
    if (loading) return;
    setLoading(true);
    setErrorMessage(null);

    const res = await db.returnBook(transaction.transaction_id);
    if (!res.success) {
      setErrorMessage(res.message);
      setLoading(false);
    } else {
      setSuccessMessage('Book successfully returned.');
      setTimeout(() => {
        onReturnSuccess();
        setSuccessMessage(null);
        setLoading(false);
        onClose();
      }, 1400);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
      <div
        className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm sm:text-base text-white">
              Return Book to Delas Alas Library
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5">
          {successMessage ? (
            <div className="py-6 text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-slate-900">
                Book successfully returned.
              </h4>
              <p className="text-xs text-slate-500">
                Library inventory and student borrowing ledger updated in real time.
              </p>
            </div>
          ) : (
            <>
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {isOverdue && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Overdue Return Notice:</span>
                    <p className="text-red-700 mt-0.5">
                      This item is returned past the scheduled due date. It will be cleared with no penalty and recorded in transaction history.
                    </p>
                  </div>
                </div>
              )}

              {/* Book Details Summary */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px] block">Book Resource</span>
                  <p className="font-bold text-slate-900 text-sm">{book.title}</p>
                  <p className="text-slate-500 text-xs">By {book.author}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px]">Date Borrowed</span>
                    <p className="font-semibold text-slate-700">{transaction.borrow_date}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Due Date</span>
                    <p className={`font-semibold ${isOverdue ? 'text-red-600' : 'text-slate-700'}`}>
                      {transaction.due_date}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-400 text-[11px]">Return Date</span>
                  <p className="font-bold text-emerald-800 text-sm">{formattedReturnDate} (Today)</p>
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                By confirming, you verify that the physical book copy has been handed to or scanned at
                the Delas Alas Campus Library Circulation Desk.
              </p>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-md transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleConfirmReturn}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-950 disabled:opacity-60 rounded-md transition-colors cursor-pointer shadow-xs"
                >
                  {loading ? 'Processing...' : 'Confirm Return'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};