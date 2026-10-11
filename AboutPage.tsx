import React from 'react';
import { BookOpen, ShieldCheck, CheckCircle2, Clock, MapPin, Award, Users, FileText } from 'lucide-react';
import { MMSCLogo } from '../components/MMSCLogo';

interface AboutPageProps {
  onNavigate: (tab: string) => void;
  onOpenResearchModal: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate, onOpenResearchModal }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-8 space-y-3">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-900 uppercase tracking-widest">
          <span>Institutional Overview</span>
          <span>·</span>
          <span>Delas Alas Campus</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight font-serif-display">
          About the School Library
        </h1>
        <p className="text-base text-slate-600 leading-relaxed max-w-3xl">
          The Learning Resource Center of My Messiah School of Cavite, Inc. – Delas Alas Campus
          serves as the academic heart of the Senior High School community, fostering research,
          information literacy, and scholastic excellence.
        </p>
      </div>

      {/* Main Narrative Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6 text-sm text-slate-700 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">
              1. Institutional Vision & Mission
            </h2>
            <p>
              My Messiah School of Cavite, Inc. – Delas Alas Campus is committed to delivering
              holistic, values-grounded, and academically rigorous education. Within this commitment,
              the Library Management System was established to ensure that every Senior High School
              student—regardless of whether they are pursuing STEM, ABM, HUMSS, GAS, or TVL tracks—enjoys
              equitable, rapid, and transparent access to quality learning resources.
            </p>
            <p>
              The library collection strictly aligns with the Department of Education (DepEd) K-12
              Senior High School curriculum standards, incorporating required core textbooks, specialized
              applied subject references, peer-reviewed journals, and Filipiniana literature.
            </p>
          </section>

          <section className="space-y-3 pt-2">
            <h2 className="text-lg font-bold text-slate-900">
              2. Digital Library System & Transition
            </h2>
            <p>
              In School Year 2026–2027, the Delas Alas Campus upgraded from manual paper circulation
              ledgers to this institutional Library Management System. This digital transformation
              empowers students to independently verify title availability from any browser, monitor
              borrowing timelines, and avoid overdue liabilities through real-time notifications.
            </p>
            <p>
              Simultaneously, library personnel are equipped with computerized circulation tools that
              maintain synchronized stock levels, track overdue books without clerical lag, and generate
              evidence-based reports on reading and borrowing habits.
            </p>
          </section>

          <section className="space-y-3 pt-2">
            <h2 className="text-lg font-bold text-slate-900">
              3. Senior High School Circulation Guidelines
            </h2>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2 text-xs">
              <p className="font-semibold text-slate-900">Circulation Policies:</p>
              <ul className="list-disc list-inside space-y-1.5 text-slate-600">
                <li>
                  <strong className="text-slate-800">Borrowing Limit:</strong> Maximum of 3 books per student at any given time.
                </li>
                <li>
                  <strong className="text-slate-800">Loan Duration:</strong> Standard 7 calendar days. Eligible for a single 7-day renewal if the book has no pending student reservations.
                </li>
                <li>
                  <strong className="text-slate-800">Care of Materials:</strong> Students are responsible for preserving book conditions, avoiding marking, dog-earing, or physical damage.
                </li>
                <li>
                  <strong className="text-slate-800">Account Clearance:</strong> All borrowed materials must be cleared prior to periodic grading clearances and quarterly examination release.
                </li>
              </ul>
            </div>
          </section>
        </div>

        {/* Sidebar Information Card */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <MMSCLogo className="w-12 h-12" />
              <div>
                <h4 className="font-bold text-sm leading-tight">My Messiah School of Cavite</h4>
                <p className="text-[11px] text-amber-400 font-semibold uppercase">Delas Alas Campus</p>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-3 text-xs space-y-3">
              <div>
                <span className="text-slate-400 block text-[11px]">Campus Facility</span>
                <span className="font-medium text-slate-200">
                  2nd Floor, Senior High School Wing, Delas Alas Campus, Cavite
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Academic Year</span>
                <span className="font-medium text-slate-200">School Year 2026–2027</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Administration</span>
                <span className="font-medium text-slate-200">
                  Head Librarian: Mrs. Elena Santos, RL [Faculty Placeholder]
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onOpenResearchModal}
                className="w-full py-2 px-3 text-xs font-semibold text-center text-amber-300 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors cursor-pointer"
              >
                Research Study Framework
              </button>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              Need Assistance?
            </h4>
            <p className="text-slate-600">
              Senior High School students needing help with research citations, catalog searching, or
              borrowing renewals may approach the Circulation Desk or log in to their student portal.
            </p>
            <button
              onClick={() => onNavigate('login')}
              className="w-full py-2 text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded transition-colors text-center cursor-pointer"
            >
              Sign In to Student Portal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
