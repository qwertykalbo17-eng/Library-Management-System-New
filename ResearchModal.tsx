import React from 'react';
import { X, CheckCircle, Zap, ShieldCheck, HeartHandshake, School, BookOpen } from 'lucide-react';
import { MMSCLogo } from './MMSCLogo';

interface ResearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResearchModal: React.FC<ResearchModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-900 text-white rounded-t-xl">
          <div className="flex items-center gap-3.5 pr-6">
            <MMSCLogo className="w-12 h-12" />
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                Academic Research Information & Framework
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                My Messiah School of Cavite, Inc. – Delas Alas Campus
              </h3>
              <p className="text-xs text-slate-300">Senior High School Department · School Year 2026–2027</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 text-sm text-slate-700">
          {/* Research Title Card */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-4">
            <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block mb-1">
              Official Research Study Title
            </span>
            <p className="text-slate-900 font-semibold leading-relaxed text-sm sm:text-base">
              “ASSESSMENT OF THE EFFECTIVENESS OF LIBRARY MANAGEMENT SYSTEM AMONG SENIOR HIGH SCHOOL STUDENTS OF MY MESSIAH SCHOOL OF CAVITE, INC. – DELAS ALAS CAMPUS SCHOOL YEAR 2026–2027”
            </p>
          </div>

          {/* Research Purpose */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500">
              Main System Purpose
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              This Library Management System transforms traditional, manual logbook library operations
              at the Delas Alas Campus into a centralized, highly reliable digital platform for Senior
              High School students and library faculty. The system serves as the primary artifact for evaluating
              operational outcomes under three core assessment dimensions:
            </p>
          </div>

          {/* Evaluation Dimensions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center mb-2">
                <Zap className="w-4 h-4" />
              </div>
              <h5 className="font-bold text-slate-900 text-xs mb-1">1. Efficiency</h5>
              <p className="text-[11px] text-slate-600 leading-snug">
                Accelerates book discovery, stock queries, checkout workflows, and returns tracking, eliminating manual waiting times.
              </p>
            </div>

            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-900 flex items-center justify-center mb-2">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h5 className="font-bold text-slate-900 text-xs mb-1">2. Accuracy</h5>
              <p className="text-[11px] text-slate-600 leading-snug">
                Guarantees zero discrepancies in book copy counts, automated due-date schedules, and real-time student circulation records.
              </p>
            </div>

            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center mb-2">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <h5 className="font-bold text-slate-900 text-xs mb-1">3. User Satisfaction</h5>
              <p className="text-[11px] text-slate-600 leading-snug">
                Provides Senior High School students with clear, accessible, and intuitive interfaces optimized for desktop and mobile devices.
              </p>
            </div>
          </div>

          {/* Scope Note */}
          <div className="border-t border-slate-100 pt-4 text-xs text-slate-500 space-y-1">
            <p>
              <strong className="text-slate-700">Target Respondents:</strong> Senior High School students across STEM, ABM, HUMSS, GAS, and TVL strands of My Messiah School of Cavite, Inc. – Delas Alas Campus.
            </p>
            <p>
              <strong className="text-slate-700">Official Campus:</strong> Delas Alas Campus Learning Resource Center.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-xl flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
          >
            Close Overview
          </button>
        </div>
      </div>
    </div>
  );
};
