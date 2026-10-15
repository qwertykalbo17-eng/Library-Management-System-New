import React, { useState } from 'react';
import { Hourglass, XCircle } from 'lucide-react';
import { db, BorrowRequest } from '../db/libraryDatabase';
import { Book } from '../types';

interface PendingRequestsPanelProps {
  requests: BorrowRequest[];
  books: Book[];
}

const formatWhen = (iso: string) =>
  new Date(iso).toLocaleString('en-PH', {
    timeZone: 'Asia/Manila',
    dateStyle: 'medium',
    timeStyle: 'short',
  });

/** Student view: borrow requests waiting for the librarian, plus recently declined ones. */
export const PendingRequestsPanel: React.FC<PendingRequestsPanelProps> = ({ requests, books }) => {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pending = requests.filter((r) => r.status === 'Pending');
  const declined = requests.filter((r) => r.status === 'Rejected').slice(0, 3);

  if (pending.length === 0 && declined.length === 0) return null;

  const bookOf = (id: string) => books.find((b) => b.book_id === id);

  const cancel = async (r: BorrowRequest) => {
    setBusyId(r.request_id);
    setError(null);
    const res = await db.cancelBorrowRequest(r.request_id);
    setBusyId(null);
    if (!res.success) setError(res.message);
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="p-2.5 bg-red-50 text-red-700 rounded border border-red-200 text-xs">{error}</div>
      )}

      {pending.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-amber-800">
            <Hourglass className="w-4 h-4" />
            <h3 className="text-xs sm:text-sm font-bold">
              Pending Approval ({pending.length})
            </h3>
          </div>
          <p className="text-xs text-amber-800">
            The librarian must approve these requests before you can pick up the books. You will get a notification once they are approved.
          </p>

          <div className="space-y-2">
            {pending.map((r) => {
              const book = bookOf(r.book_id);
              return (
                <div
                  key={r.request_id}
                  className="bg-white border border-amber-200 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm">
                        {book?.title ?? 'Unknown book'}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-bold border border-amber-200 text-[11px]">
                        <Hourglass className="w-3 h-3" />
                        Pending
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {book ? `By ${book.author} · Shelf ${book.shelf_location} · ` : ''}
                      {r.request_id} · Requested {formatWhen(r.requested_at)}
                    </p>
                  </div>
                  <button
                    onClick={() => cancel(r)}
                    disabled={busyId === r.request_id}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-red-700 bg-slate-100 hover:bg-red-50 disabled:opacity-60 rounded-md transition-colors cursor-pointer shrink-0"
                  >
                    {busyId === r.request_id ? 'Cancelling…' : 'Cancel Request'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {declined.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-red-800">
            <XCircle className="w-4 h-4" />
            <h3 className="text-xs sm:text-sm font-bold">Recently Declined</h3>
          </div>
          {declined.map((r) => {
            const book = bookOf(r.book_id);
            return (
              <p key={r.request_id} className="text-xs text-red-700">
                <strong>{book?.title ?? 'Unknown book'}</strong> was not approved
                {r.decision_note ? `. Reason: ${r.decision_note}` : '.'}
              </p>
            );
          })}
        </div>
      )}
    </div>
  );
};