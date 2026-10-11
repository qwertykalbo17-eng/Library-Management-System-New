import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../db/libraryDatabase';
import { NotificationItem } from '../types';
import { MMSCLogo } from './MMSCLogo';
import {
  BookOpen,
  Bell,
  Menu,
  X,
  LogOut,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Info,
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onOpenResearchModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  onOpenResearchModal,
}) => {
  const { role, currentStudent, adminName, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (role === 'student' && currentStudent) {
      setNotifications(db.getNotifications(currentStudent.student_id));
    } else {
      setNotifications([]);
    }
  }, [role, currentStudent, currentTab]);

  // Click outside listener for notification popover
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAsRead = (notifId: string) => {
    db.markNotificationAsRead(notifId);
    if (currentStudent) {
      setNotifications(db.getNotifications(currentStudent.student_id));
    }
  };

  const handleMarkAllRead = () => {
    if (currentStudent) {
      db.markAllNotificationsAsRead(currentStudent.student_id);
      setNotifications(db.getNotifications(currentStudent.student_id));
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top micro-bar with research badge and campus mark */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 truncate">
            <span className="font-semibold text-amber-400 tracking-wide uppercase text-[11px]">
              My Messiah School of Cavite
            </span>
            <span className="hidden sm:inline text-slate-500">·</span>
            <span className="hidden sm:inline text-slate-300">Delas Alas Campus</span>
            <span className="hidden md:inline text-slate-500">·</span>
            <span className="hidden md:inline text-slate-400">Senior High School Library System</span>
          </div>

          <button
            onClick={onOpenResearchModal}
            className="flex items-center gap-1.5 text-[11px] text-amber-300 hover:text-amber-200 font-medium transition-colors whitespace-nowrap cursor-pointer ml-2"
          >
            <Info className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Research Context SY 2026–2027</span>
            <span className="sm:hidden">Research Info</span>
          </button>
        </div>
      </div>

      {/* Main Top Bar Contract: Zone 1 (Brand) - Zone 2 (Nav links) - Zone 3 (Actions) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark */}
        <div
          onClick={() => onNavigate(role === 'student' ? 'student-dashboard' : role === 'admin' ? 'admin-dashboard' : 'home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <MMSCLogo className="w-10 h-10" />
          <div className="flex flex-col">
            <span className="text-base font-bold text-slate-900 leading-tight tracking-tight group-hover:text-blue-900 transition-colors">
              MMSC Library Portal
            </span>
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Delas Alas Campus
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Domain & Role Specific) */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-sm font-medium text-slate-600">
          {role === 'guest' && (
            <>
              <button
                onClick={() => onNavigate('home')}
                className={`px-3 py-2 rounded-md transition-colors whitespace-nowrap ${
                  currentTab === 'home'
                    ? 'text-blue-900 font-semibold bg-slate-100'
                    : 'hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => onNavigate('about')}
                className={`px-3 py-2 rounded-md transition-colors whitespace-nowrap ${
                  currentTab === 'about'
                    ? 'text-blue-900 font-semibold bg-slate-100'
                    : 'hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                About the Library
              </button>
              <button
                onClick={() => onNavigate('catalog')}
                className={`px-3 py-2 rounded-md transition-colors whitespace-nowrap ${
                  currentTab === 'catalog'
                    ? 'text-blue-900 font-semibold bg-slate-100'
                    : 'hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Library Catalog
              </button>
            </>
          )}

          {role === 'student' && (
            <>
              <button
                onClick={() => onNavigate('student-dashboard')}
                className={`px-3 py-2 rounded-md transition-colors whitespace-nowrap ${
                  currentTab === 'student-dashboard'
                    ? 'text-blue-900 font-semibold bg-slate-100'
                    : 'hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => onNavigate('catalog')}
                className={`px-3 py-2 rounded-md transition-colors whitespace-nowrap ${
                  currentTab === 'catalog'
                    ? 'text-blue-900 font-semibold bg-slate-100'
                    : 'hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Search Catalog
              </button>
              <button
                onClick={() => onNavigate('my-books')}
                className={`px-3 py-2 rounded-md transition-colors whitespace-nowrap ${
                  currentTab === 'my-books'
                    ? 'text-blue-900 font-semibold bg-slate-100'
                    : 'hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                My Borrowed Books
              </button>
              <button
                onClick={() => onNavigate('history')}
                className={`px-3 py-2 rounded-md transition-colors whitespace-nowrap ${
                  currentTab === 'history'
                    ? 'text-blue-900 font-semibold bg-slate-100'
                    : 'hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Borrowing History
              </button>
              <button
                onClick={() => onNavigate('student-profile')}
                className={`px-3 py-2 rounded-md transition-colors whitespace-nowrap ${
                  currentTab === 'student-profile'
                    ? 'text-blue-900 font-semibold bg-slate-100'
                    : 'hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Student Profile
              </button>
            </>
          )}

          {role === 'admin' && (
            <>
              <button
                onClick={() => onNavigate('admin-dashboard')}
                className={`px-3 py-2 rounded-md transition-colors whitespace-nowrap ${
                  currentTab === 'admin-dashboard'
                    ? 'text-blue-900 font-semibold bg-slate-100'
                    : 'hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Admin Overview
              </button>
              <button
                onClick={() => onNavigate('catalog')}
                className={`px-3 py-2 rounded-md transition-colors whitespace-nowrap ${
                  currentTab === 'catalog'
                    ? 'text-blue-900 font-semibold bg-slate-100'
                    : 'hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Catalog View
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: Primary Actions & User Status */}
        <div className="flex items-center gap-3">
          {role === 'guest' ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('login')}
                className="px-4 py-2 text-sm font-semibold text-slate-800 hover:text-blue-950 bg-slate-100 hover:bg-slate-200/80 rounded-md transition-colors whitespace-nowrap cursor-pointer"
              >
                Student Login
              </button>
              <button
                onClick={() => onNavigate('login-admin')}
                className="hidden sm:inline-flex px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-blue-950 rounded-md transition-colors whitespace-nowrap cursor-pointer shadow-xs"
              >
                Admin Portal
              </button>
            </div>
          ) : role === 'student' && currentStudent ? (
            <div className="flex items-center gap-3">
              {/* Notifications Popover */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-bold text-white bg-amber-600 rounded-full tabular-nums animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Library Notifications
                      </span>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[11px] text-blue-800 hover:underline font-medium cursor-pointer"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-500">
                          No notifications at this time.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.notification_id}
                            className={`p-3 text-xs transition-colors flex items-start gap-2.5 ${
                              n.is_read ? 'bg-white opacity-80' : 'bg-blue-50/60 font-medium'
                            }`}
                          >
                            <span className="mt-0.5 shrink-0">
                              {n.notification_type === 'borrow' && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              )}
                              {n.notification_type === 'return' && (
                                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                              )}
                              {n.notification_type === 'due_soon' && (
                                <Clock className="w-4 h-4 text-amber-600" />
                              )}
                              {n.notification_type === 'overdue' && (
                                <AlertTriangle className="w-4 h-4 text-red-600" />
                              )}
                              {n.notification_type === 'announcement' && (
                                <Info className="w-4 h-4 text-slate-600" />
                              )}
                            </span>
                            <div className="flex-1">
                              <p className="text-slate-800 leading-snug">{n.message}</p>
                              <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                                <span>
                                  {new Date(n.created_at).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </span>
                                {!n.is_read && (
                                  <button
                                    onClick={() => handleMarkAsRead(n.notification_id)}
                                    className="text-blue-800 hover:underline font-medium cursor-pointer"
                                  >
                                    Mark read
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Student Identity Pill */}
              <div
                onClick={() => onNavigate('student-profile')}
                className="flex items-center gap-2 pl-2 cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-xs">
                  {currentStudent.full_name.charAt(0)}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-900 group-hover:text-blue-900 transition-colors truncate max-w-[130px]">
                    {currentStudent.full_name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {currentStudent.strand} · {currentStudent.grade_level}
                  </span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="p-2 text-slate-500 hover:text-red-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Admin identity */
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-md text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                <span className="hidden sm:inline">Admin Mode</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-red-700 bg-slate-100 hover:bg-slate-200/80 rounded-md transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Exit</span>
              </button>
            </div>
          )}

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {role === 'guest' && (
            <>
              <button
                onClick={() => {
                  onNavigate('home');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                  currentTab === 'home' ? 'bg-slate-100 text-blue-900 font-bold' : 'text-slate-700'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => {
                  onNavigate('about');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                  currentTab === 'about' ? 'bg-slate-100 text-blue-900 font-bold' : 'text-slate-700'
                }`}
              >
                About the Library
              </button>
              <button
                onClick={() => {
                  onNavigate('catalog');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                  currentTab === 'catalog' ? 'bg-slate-100 text-blue-900 font-bold' : 'text-slate-700'
                }`}
              >
                Library Catalog
              </button>
              <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                <button
                  onClick={() => {
                    onNavigate('login');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 text-sm font-semibold text-center text-white bg-blue-900 rounded-md"
                >
                  Student Login
                </button>
                <button
                  onClick={() => {
                    onNavigate('login-admin');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 text-xs font-semibold text-center text-slate-800 bg-slate-100 rounded-md"
                >
                  Admin Portal Login
                </button>
              </div>
            </>
          )}

          {role === 'student' && (
            <>
              <button
                onClick={() => {
                  onNavigate('student-dashboard');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Dashboard
              </button>
              <button
                onClick={() => {
                  onNavigate('catalog');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Search Catalog
              </button>
              <button
                onClick={() => {
                  onNavigate('my-books');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                My Borrowed Books
              </button>
              <button
                onClick={() => {
                  onNavigate('history');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Borrowing History
              </button>
              <button
                onClick={() => {
                  onNavigate('student-profile');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Student Profile
              </button>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-red-600 font-medium"
              >
                Sign Out
              </button>
            </>
          )}

          {role === 'admin' && (
            <>
              <button
                onClick={() => {
                  onNavigate('admin-dashboard');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-slate-700"
              >
                Admin Overview
              </button>
              <button
                onClick={() => {
                  onNavigate('catalog');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-slate-700"
              >
                Catalog View
              </button>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-red-600 font-medium"
              >
                Exit Admin Mode
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
};
