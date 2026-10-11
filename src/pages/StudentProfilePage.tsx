import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../db/libraryDatabase';
import {
  User,
  ShieldCheck,
  Mail,
  Phone,
  School,
  CheckCircle2,
  Lock,
  Save,
  AlertCircle,
} from 'lucide-react';

export const StudentProfilePage: React.FC = () => {
  const { currentStudent, refreshStudentData } = useAuth();

  const [contactNumber, setContactNumber] = useState(currentStudent?.contact_number || '');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!currentStudent) return null;

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudent) return;

    setSaving(true);
    setSaveError(null);
    const res = await db.updateStudent({
      ...currentStudent,
      contact_number: contactNumber.trim(),
    });
    setSaving(false);

    if (!res.success) {
      setSaveError(res.error || 'Could not save your changes. Please try again.');
      return;
    }

    await refreshStudentData();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-900 uppercase tracking-widest mb-1">
          <span>Student Account & Profile</span>
          <span>·</span>
          <span>Delas Alas Campus</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif-display">
          Senior High School Student Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Manage your verified contact details and view official school enrollment records.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Avatar / Identity Column */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs text-center space-y-4">
            <div className="relative inline-block">
              <img
                src={
                  currentStudent.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
                }
                alt={currentStudent.full_name}
                className="w-24 h-24 rounded-full object-cover mx-auto border-2 border-amber-300 shadow-md"
              />
              <span className="absolute bottom-0 right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
            </div>

            <div>
              <h3 className="font-bold text-base text-slate-900 leading-tight">
                {currentStudent.full_name}
              </h3>
              <p className="text-xs font-mono text-slate-500 mt-1">
                {currentStudent.student_id}
              </p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Account Status: {currentStudent.account_status}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-left text-xs text-slate-500 space-y-2">
              <div className="flex justify-between">
                <span>Enrolled Track:</span>
                <strong className="text-slate-800 font-semibold">{currentStudent.strand}</strong>
              </div>
              <div className="flex justify-between">
                <span>Grade Level:</span>
                <strong className="text-slate-800 font-semibold">{currentStudent.grade_level}</strong>
              </div>
              <div className="flex justify-between">
                <span>Homeroom Section:</span>
                <strong className="text-slate-800 font-semibold">{currentStudent.section}</strong>
              </div>
            </div>
          </div>

          {/* Security Notice Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-[11px] uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-blue-900" />
              <span>School Record Governance</span>
            </div>
            <p className="leading-relaxed text-[11px]">
              Core demographic data (Student ID, Grade, Strand, Section) are officially verified and locked by the <strong>Delas Alas Campus Registrar & Library Administration</strong>.
            </p>
          </div>
        </div>

        {/* Right Details / Editable Preferences Column */}
        <div className="md:col-span-2 space-y-6">
          <form
            onSubmit={handleSavePreferences}
            className="bg-white rounded-xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-6"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">
                Contact & Notification Preferences
              </h3>
              {savedSuccess && (
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 animate-fade-in">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Changes saved successfully</span>
                </div>
              )}
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              {saveError && (
                <div className="p-2.5 bg-red-50 text-red-700 rounded border border-red-200 text-xs">
                  {saveError}
                </div>
              )}

              {/* Contact Number */}
              <div>
                <label className="font-bold text-slate-700 block mb-1 text-xs">
                  Student SMS / Mobile Contact
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="e.g. 0917-555-1042"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                  />
                </div>
              </div>

              {/* Locked Fields Preview */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Official School Registrar Records (Read-Only):
                </span>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                    <span className="text-slate-400 text-[11px] block">Student ID Number</span>
                    <span className="font-bold font-mono text-slate-800 mt-0.5 block flex items-center gap-1.5">
                      <Lock className="w-3 h-3 text-slate-400" />
                      {currentStudent.student_id}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                    <span className="text-slate-400 text-[11px] block">Senior High Strand</span>
                    <span className="font-bold text-slate-800 mt-0.5 block flex items-center gap-1.5">
                      <Lock className="w-3 h-3 text-slate-400" />
                      {currentStudent.strand} Track
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                    <span className="text-slate-400 text-[11px] block">Grade Level</span>
                    <span className="font-bold text-slate-800 mt-0.5 block flex items-center gap-1.5">
                      <Lock className="w-3 h-3 text-slate-400" />
                      {currentStudent.grade_level}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                    <span className="text-slate-400 text-[11px] block">Class Section</span>
                    <span className="font-bold text-slate-800 mt-0.5 block flex items-center gap-1.5">
                      <Lock className="w-3 h-3 text-slate-400" />
                      {currentStudent.section}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-950 disabled:opacity-60 rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Saving…' : 'Save Contact Preferences'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};