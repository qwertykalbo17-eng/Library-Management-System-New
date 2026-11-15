import React, { useState } from 'react';
import { KeyRound, UserPlus } from 'lucide-react';
import { db } from '../db/libraryDatabase';
import { useLibraryData } from '../db/useLibraryData';
import { PasswordInput } from '../components/PasswordInput';

const inputCls =
  'w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 bg-white';

export const AdminAccountsPanel: React.FC = () => {
  const { data: isHead } = useLibraryData(() => db.isHeadAdmin(), [], false);

  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [adminMsg, setAdminMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [studentId, setStudentId] = useState('');
  const [newPass, setNewPass] = useState('');
  const [resetMsg, setResetMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const createAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await db.createAdminAccount(username, fullName, password);
    setAdminMsg({ ok: r.success, text: r.message });
    if (r.success) {
      setUsername('');
      setFullName('');
      setPassword('');
    }
  };

  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await db.resetStudentPassword(studentId, newPass);
    setResetMsg({ ok: r.success, text: r.message });
    if (r.success) {
      setStudentId('');
      setNewPass('');
    }
  };

  const msgCls = (ok: boolean) =>
    `text-xs font-medium ${ok ? 'text-emerald-700' : 'text-red-600'}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Reset student password */}
      <form onSubmit={resetPassword} className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-blue-900" /> Reset Student Password
        </h3>
        <p className="text-xs text-slate-500">
          Passwords can't be viewed. Set a new one and tell the student.
        </p>
        <input
          className={inputCls}
          placeholder="Student username"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          required
        />
        <PasswordInput
          value={newPass}
          onChange={(e) => setNewPass(e.target.value)}
                    placeholder="New password (min 8 characters)"
          className={`${inputCls} pl-9`}
          required
        />
        <button className="px-4 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg cursor-pointer">
          Set New Password
        </button>
        {resetMsg && <p className={msgCls(resetMsg.ok)}>{resetMsg.text}</p>}
      </form>

      {/* Create admin: head librarian only */}
      {isHead && (
        <form onSubmit={createAdmin} className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-blue-900" /> Create Admin Account
          </h3>
          <p className="text-xs text-slate-500">Only the head librarian sees this.</p>
          <input
            className={inputCls}
            placeholder="Username (lowercase)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            className={inputCls}
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password (min 8 characters)"
            className={`${inputCls} pl-9`}
            required
          />
          <button className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg cursor-pointer">
            Create Admin
          </button>
          {adminMsg && <p className={msgCls(adminMsg.ok)}>{adminMsg.text}</p>}
        </form>
      )}
    </div>
  );
};