import React from 'react';
import { Wrench, RefreshCw } from 'lucide-react';
import { MMSCLogo } from '../components/MMSCLogo';
import { MAINTENANCE_MESSAGE, MAINTENANCE_BACK_AT } from '../config';

export const MaintenancePage: React.FC = () => (
  <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center px-4">
    <div className="max-w-md w-full text-center space-y-6">
      <div className="flex justify-center">
        <MMSCLogo className="w-16 h-16" />
      </div>

      <div className="w-14 h-14 rounded-full bg-amber-400/15 text-amber-300 flex items-center justify-center mx-auto">
        <Wrench className="w-7 h-7" />
      </div>

      <div className="space-y-2">
        <p className="text-xs font-bold text-amber-300 uppercase tracking-widest">
          My Messiah School of Cavite, Inc. · Delas Alas Campus
        </p>
        <h1 className="text-2xl sm:text-3xl font-extrabold">Under Maintenance</h1>
        <p className="text-sm text-slate-300 leading-relaxed">{MAINTENANCE_MESSAGE}</p>
        {MAINTENANCE_BACK_AT && (
          <p className="text-xs font-semibold text-amber-300">{MAINTENANCE_BACK_AT}</p>
        )}
      </div>

      <button
        onClick={() => window.location.reload()}
        className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer"
      >
        <RefreshCw className="w-4 h-4" />
        <span>Try Again</span>
      </button>

      <p className="text-[11px] text-slate-500">Senior High School Library Management System</p>
    </div>
  </div>
);