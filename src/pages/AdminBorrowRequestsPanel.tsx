import React, { useState } from 'react';
import { Check, X, Hourglass, CheckCircle2, XCircle } from 'lucide-react';
import { db, BorrowRequest } from '../db/libraryDatabase';
import { Book, Student } from '../types';

interface AdminBorrowRequestsPanelProps {
  requests: BorrowRequest[];
  books: Book[];
  students: Student[];
}

const formatWhen = (iso: string) =>
  new Date(iso).toLocaleString('en-PH', {
    timeZone: 'Asia/Manila',
    dateStyle: 'medium',
    timeStyle: 'short',
  });

/** Librarian view: approve or decline student borrow requests. */
export const AdminBorrowRequestsPanel: React.FC<AdminBorrowRequestsPanelProps> = ({
  requests,
  books,
  students,
}) => {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [decliningId, setDecliningId] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const pending = requests.filter((r) => r.status === 'Pending').reverse(); // oldest first
  const handled = requests.filter((r) => r.status !== 'Pending').slice(0, 15);

  const bookOf = (id: string) => books.find((b) => b.book_id === id);
  const studentOf = (username: string) => students.find((s) => s.student_id === username);

  const approve = async (r: BorrowRequest) => {
    setBusyId(r.request_id);
    setMessage(null);
    const res = await db.approveBorrow(r.request_id);
    setBusyId(null);
    setMessage({ ok: res.success, text: res.message });
  };

  const confirmDecline = async (r: BorrowRequest) => {
    setBusyId(r.request_id);
    setMessage(null);
    const res = await db.rejectBorrow(r.request_id, reason);
    setBusyId(null);
    setMessage({ ok: res.success, text: res.message });
    if (res.success) {
      setDecliningId(null);
      setReason('');
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`p-3 rounded-lg border text-xs font-medium ${
            message.ok
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-700 border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-2">
          <Hourglass className="w-4 h-4 text-amber-600" />
          <h3 className="text-sm font-bold text-slate-900">
            Pending Borrow Requests ({pending.length})
          </h3>
        </div>

        {pending.length === 0 ? (
          <p className="p-8 text-center text-xs text-slate-500">
            No requests are waiting. New requests from students will appear here.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Request</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Book</th>
                  <th className="py-3 px-4">Copies Left</th>
                  <th className="py-3 px-4">Requested</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pending.map((r) => {
                  const book = bookOf(r.book_id);
                  const student = studentOf(r.student_id);
                  const busy = busyId === r.request_id;
                  const declining = decliningId === r.request_id;
                  return (
                    <React.Fragment key={r.request_id}>
                      <tr className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                          {r.request_id}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 block">
                            {student?.full_name ?? r.student_id}
                          </span>
                          <span className="text-slate-500 text-[11px]">
                            {r.student_id}
                            {student ? ` · ${student.strand} · ${student.grade_level}` : ''}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 block line-clamp-1">
                            {book?.title ?? 'Unknown book'}
                          </span>
                          <span className="text-slate-500 text-[11px] font-mono">
                            {book?.shelf_location ?? ''}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          {book ? (
                            <span
                              className={
                                book.available_copies > 0
                                  ? 'text-emerald-700 font-semibold'
                                  : 'text-red-700 font-bold'
                              }
                            >
                              {book.available_copies} / {book.total_copies}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                          {formatWhen(r.requested_at)}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => approve(r)}
                            disabled={busy}
                            className="px-3 py-1.5 mr-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 rounded-md transition-colors cursor-pointer inline-flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            {busy && !declining ? 'Working…' : 'Approve'}
                          </button>
                          <button
                            onClick={() => {
                              setDecliningId(declining ? null : r.request_id);
                              setReason('');
                            }}
                            disabled={busy}
                            className="px-3 py-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-60 rounded-md transition-colors cursor-pointer inline-flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            Decline
                          </button>
                        </td>
                      </tr>

                      {declining && (
                        <tr className="bg-red-50/60">
                          <td colSpan={6} className="py-3 px-4">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                              <input
                                type="text"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Reason for declining (optional)"
                                className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700"
                              />
                              <button
                                onClick={() => confirmDecline(r)}
                                disabled={busy}
                                className="px-4 py-2 text-xs font-bold text-white bg-red-700 hover:bg-red-800 disabled:opacity-60 rounded-md cursor-pointer"
                              >
                                {busy ? 'Declining…' : 'Confirm Decline'}
                              </button>
                              <button
                                onClick={() => {
                                  setDecliningId(null);
                                  setReason('');
                                }}
                                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {handled.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Recently Handled</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <tbody className="divide-y divide-slate-100">
                {handled.map((r) => {
                  const book = bookOf(r.book_id);
                  const student = studentOf(r.student_id);
                  return (
                    <tr key={r.request_id}>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{r.request_id}</td>
                      <td className="py-3 px-4 text-slate-800">
                        {student?.full_name ?? r.student_id}
                      </td>
                      <td className="py-3 px-4 text-slate-800">{book?.title ?? 'Unknown book'}</td>
                      <td className="py-3 px-4">
                        {r.status === 'Approved' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                            <CheckCircle2 className="w-3 h-3" />
                            Approved
                          </span>
                        ) : r.status === 'Rejected' ? (
                          <span className="inline-flex items-center gap-1 text-red-700 font-semibold bg-red-50 px-2 py-0.5 rounded border border-red-200 text-[11px]">
                            <XCircle className="w-3 h-3" />
                            Declined
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-600 font-semibold bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                            Cancelled
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {r.decided_at ? formatWhen(r.decided_at) : ''}
                        {r.decision_note ? ` · ${r.decision_note}` : ''}
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