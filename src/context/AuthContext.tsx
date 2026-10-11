import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Student, UserRole } from '../types';

// Supabase Auth needs an email, so one is built from the username behind the scenes.
// Students never see or type it. Change this if sign-up says the email is invalid.
const LOGIN_EMAIL_DOMAIN = 'mmsc-library.com';

export interface SignUpInput {
  username: string;
  password: string;
  full_name: string;
  grade_level: Student['grade_level'];
  strand: Student['strand'];
  section: string;
  contact_number?: string;
}

type AuthResult = { success: boolean; error?: string };
type SignUpResult = { success: boolean; error?: string; message?: string };

interface AuthContextType {
  role: UserRole;
  currentStudent: Student | null;
  adminName: string | null;
  loading: boolean;
  loginAsStudent: (username: string, password: string) => Promise<AuthResult>;
  loginAsAdmin: (username: string, password: string) => Promise<AuthResult>;
  signUpStudent: (input: SignUpInput) => Promise<SignUpResult>;
  logout: () => Promise<void>;
  /** @deprecated Demo accounts no longer exist. Kept only so older pages still compile. */
  switchDemoStudent: (studentId: string) => void;
  refreshStudentData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INVALID_CREDENTIALS = 'Invalid username or password. Please try again.';
const INACTIVE_ACCOUNT =
  'Your account is pending approval or has been deactivated. Please contact the Delas Alas Campus Library Desk.';

type ProfileResult =
  | { ok: true; role: 'student'; student: Student }
  | { ok: true; role: 'admin'; adminName: string }
  | { ok: false; reason: 'inactive' | 'no_profile' | 'error' };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapStudent = (row: Record<string, any>): Student => ({
  student_id: row.username,
  username: row.username,
  full_name: row.full_name,
  grade_level: row.grade_level,
  strand: row.strand,
  section: row.section ?? '',
  email: '',
  account_status: row.account_status,
  avatar: row.avatar ?? undefined,
  contact_number: row.contact_number ?? undefined,
  created_at: String(row.created_at).split('T')[0],
});

/** Looks up who a signed-in Supabase user is: an admin, or a student profile. */
const loadProfile = async (userId: string): Promise<ProfileResult> => {
  const { data: admin, error: adminErr } = await supabase
    .from('admins')
    .select('full_name')
    .eq('id', userId)
    .maybeSingle();
  if (adminErr) return { ok: false, reason: 'error' };
  if (admin) return { ok: true, role: 'admin', adminName: admin.full_name };

  const { data: row, error: studentErr } = await supabase
    .from('students')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (studentErr) return { ok: false, reason: 'error' };
  if (!row) return { ok: false, reason: 'no_profile' };

  const student = mapStudent(row);
  if (student.account_status !== 'Active') return { ok: false, reason: 'inactive' };
  return { ok: true, role: 'student', student };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('guest');
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [adminName, setAdminName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // While a login/sign-up call is running it handles state itself,
  // so the auth listener must not race with it.
  const busy = useRef(false);

  const reset = () => {
    setRole('guest');
    setCurrentStudent(null);
    setAdminName(null);
  };

  const apply = (p: Extract<ProfileResult, { ok: true }>) => {
    if (p.role === 'student') {
      setRole('student');
      setCurrentStudent(p.student);
      setAdminName(null);
    } else {
      setRole('admin');
      setCurrentStudent(null);
      setAdminName(p.adminName);
    }
  };

  // Restore the session on page load and react to sign-out / token changes
  useEffect(() => {
    let active = true;

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        reset();
        setLoading(false);
        return;
      }
      if (busy.current) return;
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        // Defer: calling Supabase directly inside this callback can deadlock
        setTimeout(async () => {
          if (!active) return;
          if (!session?.user) {
            reset();
            setLoading(false);
            return;
          }
          const profile = await loadProfile(session.user.id);
          if (!active) return;
          if (profile.ok) {
            apply(profile);
          } else {
            await supabase.auth.signOut();
            reset();
          }
          setLoading(false);
        }, 0);
      }
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const signInWithUsername = async (
    username: string,
    password: string,
    expected: 'student' | 'admin'
  ): Promise<AuthResult> => {
    busy.current = true;
    try {
      const uname = username.trim().toLowerCase();

      // Supabase signs in with email, so find the email that belongs to this username
      const { data: email, error: lookupErr } = await supabase.rpc('get_login_email', {
        p_username: uname,
      });
      if (lookupErr || !email) return { success: false, error: INVALID_CREDENTIALS };

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.user) {
        if (error?.code === 'email_not_confirmed') {
          return {
            success: false,
            error:
              'This account still needs confirmation. Please contact the Delas Alas Campus Library Desk.',
          };
        }
        return { success: false, error: INVALID_CREDENTIALS };
      }

      const profile = await loadProfile(data.user.id);
      if (!profile.ok) {
        await supabase.auth.signOut();
        reset();
        return {
          success: false,
          error:
            profile.reason === 'inactive'
              ? INACTIVE_ACCOUNT
              : profile.reason === 'no_profile'
              ? 'No library profile is linked to this account. Please contact the library desk.'
              : 'Could not load your account. Please try again.',
        };
      }

      // A student must not get in through the admin tab, and vice versa
      if (profile.role !== expected) {
        await supabase.auth.signOut();
        reset();
        return { success: false, error: INVALID_CREDENTIALS };
      }

      apply(profile);
      return { success: true };
    } finally {
      busy.current = false;
    }
  };

  const loginAsStudent = (username: string, password: string) =>
    signInWithUsername(username, password, 'student');

  const loginAsAdmin = (username: string, password: string) =>
    signInWithUsername(username, password, 'admin');

  const signUpStudent = async (input: SignUpInput): Promise<SignUpResult> => {
    busy.current = true;
    try {
      const username = input.username.trim().toLowerCase();

      // Username must be free
      const { data: existing } = await supabase.rpc('get_login_email', { p_username: username });
      if (existing) {
        return { success: false, error: 'That username is already taken. Please choose another one.' };
      }

      // The database trigger turns this metadata into a student profile (status: Inactive)
      const { data, error } = await supabase.auth.signUp({
        email: `${username}@${LOGIN_EMAIL_DOMAIN}`,
        password: input.password,
        options: {
          data: {
            username,
            full_name: input.full_name.trim(),
            grade_level: input.grade_level,
            strand: input.strand,
            section: input.section.trim(),
            contact_number: input.contact_number?.trim() ?? '',
          },
        },
      });

      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('already registered') || msg.includes('already been registered')) {
          return { success: false, error: 'That username is already taken. Please choose another one.' };
        }
        if (msg.includes('database error')) {
          return {
            success: false,
            error: 'This username is already registered, or some details are invalid.',
          };
        }
        if (msg.includes('password')) {
          return { success: false, error: error.message };
        }
        return { success: false, error: 'Could not create your account. Please try again.' };
      }

      // New accounts wait for librarian approval, so never keep them signed in
      if (data.session) await supabase.auth.signOut();
      reset();

      return {
        success: true,
        message:
          'Account created! The Delas Alas Campus Library will review and activate it. You can sign in once it is approved.',
      };
    } finally {
      busy.current = false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    reset();
  };

  const switchDemoStudent = (_studentId: string) => {
    console.warn('switchDemoStudent is no longer supported. Sign in with a real account instead.');
  };

  const refreshStudentData = async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;
    const profile = await loadProfile(data.user.id);
    if (profile.ok) apply(profile);
  };

  // Avoid flashing the login page on refresh while the saved session is being restored
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-slate-500">
        Loading…
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        role,
        currentStudent,
        adminName,
        loading,
        loginAsStudent,
        loginAsAdmin,
        signUpStudent,
        logout,
        switchDemoStudent,
        refreshStudentData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};