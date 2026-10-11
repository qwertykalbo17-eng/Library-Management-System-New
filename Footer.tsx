import React from 'react';
import { BookOpen, MapPin, Clock, Phone, Mail, ShieldAlert, FileText } from 'lucide-react';
import { MMSCLogo } from './MMSCLogo';

interface FooterProps {
  onOpenResearchModal: () => void;
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenResearchModal, onNavigate }) => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-sm">
      {/* Top Academic Accent Line */}
      <div className="h-1 bg-gradient-to-r from-blue-900 via-amber-500 to-blue-900" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Column 1: School Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <MMSCLogo className="w-11 h-11" />
              <div>
                <h4 className="text-white font-bold text-base leading-snug">
                  My Messiah School of Cavite, Inc.
                </h4>
                <p className="text-amber-400 text-xs font-semibold uppercase tracking-wider">
                  Delas Alas Campus
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Official Library Management System supporting Senior High School academic excellence,
              curriculum learning resources, and scholarly inquiry for SY 2026–2027.
            </p>
            <div className="pt-2">
              <button
                onClick={onOpenResearchModal}
                className="inline-flex items-center gap-2 text-xs text-amber-300 hover:text-amber-200 bg-slate-900 px-3 py-1.5 rounded border border-slate-800 transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>View Research Study Details</span>
              </button>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h5 className="text-white font-semibold text-xs tracking-wider uppercase">
              Library Navigation
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Home Landing Page
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  About the Delas Alas Library
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('catalog')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Search Digital Catalog
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('login')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Student Portal Access
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('login-admin')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Authorized Personnel Console
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Hours & Circulation Desk */}
          <div className="space-y-3">
            <h5 className="text-white font-semibold text-xs tracking-wider uppercase">
              Delas Alas Library Hours
            </h5>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-medium">Monday – Friday</p>
                  <p className="text-slate-400">7:30 AM – 5:00 PM (Regular Study Hours)</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-300 font-medium">Saturday & Sunday</p>
                  <p className="text-slate-400">Closed for Weekend Sanitization</p>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 pt-1">
                Standard Senior High School borrowing duration is 7 calendar days per resource.
              </p>
            </div>
          </div>

          {/* Column 4: Contact & Location */}
          <div className="space-y-3">
            <h5 className="text-white font-semibold text-xs tracking-wider uppercase">
              School Contact & Information
            </h5>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Delas Alas Campus, My Messiah School of Cavite, Inc., Cavite, Philippines
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-mono text-slate-300">
                  (046) 419-XXXX [Official School Contact Placeholder]
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-slate-300">
                  library.delasalas@mymessiah.ph.education [Official School Email]
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Research Study Formal Citation Block */}
        <div className="border-t border-slate-900 pt-6 pb-6">
          <div className="bg-slate-900/80 rounded-lg p-4 border border-slate-800 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <span className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">
                Senior High School Research Study Information
              </span>
              <span className="text-slate-400 font-mono text-[11px]">School Year 2026–2027</span>
            </div>
            <p className="text-slate-300 font-medium leading-relaxed italic">
              “ASSESSMENT OF THE EFFECTIVENESS OF LIBRARY MANAGEMENT SYSTEM AMONG SENIOR HIGH SCHOOL STUDENTS OF MY MESSIAH SCHOOL OF CAVITE, INC. – DELAS ALAS CAMPUS SCHOOL YEAR 2026–2027”
            </p>
            <p className="text-slate-400 text-[11px] mt-2">
              System dimension evaluation metrics: Efficiency in book discovery & processing · Accuracy in inventory and circulation records · User Satisfaction among Senior High School students.
            </p>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026–2027 My Messiah School of Cavite, Inc. – Delas Alas Campus. All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span>Senior High School DepEd K-12 Aligned</span>
            <span>·</span>
            <span>Delas Alas Campus Learning Resource Center</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
