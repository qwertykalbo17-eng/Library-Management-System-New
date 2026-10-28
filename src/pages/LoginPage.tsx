import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { MMSCLogo } from '../components/MMSCLogo';
import { Student } from '../types';
import { PasswordInput } from '../components/PasswordInput';

interface LoginPageProps {
  initialMode?: 'student' | 'admin';
  onNavigate: (tab: string) => void;
}

const GRADES: Student['grade_level'][] = ['Grade 11', 'Grade 12'];
const STRANDS: Student['strand'][] = ['STEM', 'ABM', 'HUMSS', 'GAS', 'TVL-ICT', 'TVL-HE'];

const inputClass =
  'w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white';
const iconInputClass = `${inputClass} pl-9`;
const labelClass = 'text-xs font-bold text-slate-700 block mb-1';

const emptySignUp = {
  full_name: '',
  username: '',
  grade_level: 'Grade 11' as Student['grade_level'],
  strand: 'STEM' as Student['strand'],
  section: '',
  contact_number: '',
  password: '',
  confirm_password: '',
};

export const LoginPage: React.FC<LoginPageProps> = ({ initialMode = 'student', onNavigate }) => {
  const { loginAsStudent, loginAsAdmin, signUpStudent } = useAuth();
  const [mode, setMode] = useState<'student' | 'admin' | 'signup'>(initialMode);

  // Sign-in form
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Sign-up form
  const [form, setForm] = useState(emptySignUp);

  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  const switchMode = (next: 'student' | 'admin' | 'signup') => {
    setMode(next);
    setError(null);
    setNotice(null);
  };

  const setField = (key: keyof typeof emptySignUp, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (!username.trim() || !password.trim()) {
      setError(
        mode === 'admin'
          ? 'Please enter your administrator username and password.'
          : 'Please enter both your username and password.'
      );
      return;
    }

    setLoading(true);
    const res =
      mode === 'admin'
        ? await loginAsAdmin(username, password)
        : await loginAsStudent(username, password);
    setLoading(false);

    if (!res.success) {
      setError(res.error || 'Invalid username or password. Please try again.');
      return;
    }
    onNavigate(mode === 'admin' ? 'admin-dashboard' : 'student-dashboard');
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    const uname = form.username.trim().toLowerCase();

    if (!form.full_name.trim() || !uname || !form.section.trim() || !form.password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!/^[a-z0-9_.]{3,30}$/.test(uname)) {
      setError('Username must be 3–30 characters: lowercase letters, numbers, dots or underscores only.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (form.password !== form.confirm_password) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const res = await signUpStudent({
      username: uname,
      password: form.password,
      full_name: form.full_name,
      grade_level: form.grade_level,
      strand: form.strand,
      section: form.section,
      contact_number: form.contact_number,
    });
    setLoading(false);

    if (!res.success) {
      setError(res.error || 'Could not create your account. Please try again.');
      return;
    }

    setForm(emptySignUp);
    setUsername(uname);
    setPassword('');
    setMode('student');
    setNotice(res.message || 'Account created successfully.');
  };

  const tabClass = (active: boolean) =>
    `flex-1 py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
      active ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
    }`;

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      {/* Branding */}
      <div className="text-center space-y-2">
        <MMSCLogo className="w-20 h-20 mx-auto" />
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-serif-display">
          My Messiah School of Cavite, Inc.
        </h1>
        <p className="text-xs font-semibold text-blue-900 uppercase tracking-wider">
          Delas Alas Campus · Library Management System
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-md space-y-6">
        {/* Tabs */}
        <div className="flex rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => switchMode('student')}
            className={tabClass(mode === 'student' || mode === 'signup')}
          >
            Senior High Student
          </button>
          <button type="button" onClick={() => switchMode('admin')} className={tabClass(mode === 'admin')}>
            Authorized Personnel
          </button>
        </div>

        {notice && (
          <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-xs rounded-lg flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-snug">{notice}</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {mode === 'signup' ? (
          /* ---------- SIGN UP ---------- */
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Create a Student Account</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                New accounts are reviewed and activated by the school library before you can borrow books.
              </p>
            </div>

            <div>
              <label className={labelClass}>Full Name</label>
              <input
                type="text"
                value={form.full_name}
                onChange={(e) => setField('full_name', e.target.value)}
                placeholder="e.g. Jasmine Alcantara"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Username</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setField('username', e.target.value)}
                  placeholder="e.g. jasmine.alcantara"
                  autoCapitalize="none"
                  className={iconInputClass}
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Lowercase letters, numbers, dots and underscores (3–30 characters).
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Grade Level</label>
                <select
                  value={form.grade_level}
                  onChange={(e) => setField('grade_level', e.target.value)}
                  className={inputClass}
                >
                  {GRADES.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Strand</label>
                <select
                  value={form.strand}
                  onChange={(e) => setField('strand', e.target.value)}
                  className={inputClass}
                >
                  {STRANDS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Section</label>
                <input
                  type="text"
                  value={form.section}
                  onChange={(e) => setField('section', e.target.value)}
                  placeholder="e.g. Newton"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Contact No. (optional)</label>
                <input
                  type="tel"
                  value={form.contact_number}
                  onChange={(e) => setField('contact_number', e.target.value)}
                  placeholder="09XX XXX XXXX"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <PasswordInput
                  value={form.password}
                  onChange={(e) => setField('password', e.target.value)}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  className={iconInputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <PasswordInput
                  value={form.confirm_password}
                  onChange={(e) => setField('confirm_password', e.target.value)}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  className={iconInputClass}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 text-xs sm:text-sm font-bold text-white bg-blue-900 hover:bg-blue-950 disabled:opacity-60 rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{loading ? 'Creating account...' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-center text-xs text-slate-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => switchMode('student')}
                className="text-blue-900 font-semibold hover:underline cursor-pointer"
              >
                Sign in
              </button>
            </p>
          </form>
        ) : (
          /* ---------- SIGN IN ---------- */
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className={labelClass}>{mode === 'student' ? 'Username' : 'Administrator Username'}</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={mode === 'student' ? 'e.g. jasmine.alcantara' : 'e.g. librarian'}
                  autoCapitalize="none"
                  className={iconInputClass}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">Password</label>
                {mode === 'student' && (
                  <button
                    type="button"
                    onClick={() => setForgotPasswordOpen(true)}
                    className="text-[11px] text-blue-900 hover:underline font-medium cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <PasswordInput
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your confidential password"
                  autoComplete="current-password"
                  className={iconInputClass}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 text-xs sm:text-sm font-bold text-white bg-blue-900 hover:bg-blue-950 disabled:opacity-60 rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>
                {loading ? 'Authenticating...' : mode === 'student' ? 'Sign In to Student Portal' : 'Access Admin Console'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {mode === 'student' && (
              <p className="text-center text-xs text-slate-600">
                New student?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className="text-blue-900 font-semibold hover:underline cursor-pointer"
                >
                  Create an account
                </button>
              </p>
            )}
          </form>
        )}
      </div>

      {/* Forgot Password Dialog */}
      {forgotPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 space-y-4 border border-slate-200">
            <h3 className="font-bold text-base text-slate-900">Forgot Password Assistance</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              For student account security and official school record integrity, student passwords are reset
              in person at the <strong>Delas Alas Campus Library Circulation Desk</strong> upon verification
              of your Senior High School student ID card.
            </p>
            <div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-900">
              <span className="font-semibold block mb-0.5">Campus Circulation Desk:</span>
              <p>2nd Floor SHS Building, Delas Alas Campus (7:30 AM – 5:00 PM)</p>
            </div>
            <button
              onClick={() => setForgotPasswordOpen(false)}
              className="w-full py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
};