/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { testSupabaseConnection } from './supabaseTest';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ResearchModal } from './components/ResearchModal';
import { BookDetailModal } from './components/BookDetailModal';
import { ReturnModal } from './components/ReturnModal';

import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { CatalogPage } from './pages/CatalogPage';
import { LoginPage } from './pages/LoginPage';
import { StudentDashboardPage } from './pages/StudentDashboardPage';
import { MyBorrowedBooksPage } from './pages/MyBorrowedBooksPage';
import { BorrowingHistoryPage } from './pages/BorrowingHistoryPage';
import { StudentProfilePage } from './pages/StudentProfilePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

import { Book, BorrowingTransaction } from './types';
import { db } from './db/libraryDatabase';

function MainApp() {
  const { role, currentStudent } = useAuth();

  // Supabase connection test
  useEffect(() => {
    testSupabaseConnection();
  }, []);


  // Navigation tab state
  const [currentTab, setCurrentTab] = useState<string>('home');

  // Modals state
  const [researchModalOpen, setResearchModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [returnTxn, setReturnTxn] = useState<{
    transaction: BorrowingTransaction;
    book: Book;
  } | null>(null);

  // Key to force refresh of child components on state modifications
  const [refreshKey, setRefreshKey] = useState(0);
  const triggerRefresh = () => setRefreshKey((k) => k + 1);

  // Auto-route on role changes
  useEffect(() => {
    if (role === 'student' && (currentTab === 'home' || currentTab === 'login' || currentTab === 'login-admin')) {
      setCurrentTab('student-dashboard');
    } else if (role === 'admin' && (currentTab === 'home' || currentTab === 'login' || currentTab === 'login-admin')) {
      setCurrentTab('admin-dashboard');
    } else if (role === 'guest' && (currentTab === 'student-dashboard' || currentTab === 'my-books' || currentTab === 'history' || currentTab === 'student-profile' || currentTab === 'admin-dashboard')) {
      setCurrentTab('home');
    }
  }, [role]);

  // Handlers
    const handleSelectBook = async (book: Book) => {
    // Show the book right away, then update it with the latest copy counts
    setSelectedBook(book);
    try {
      const freshBook = await db.getBook(book.book_id);
      if (freshBook) setSelectedBook(freshBook);
    } catch {
      // keep the book we already have
    }
  };

  const handleInitiateReturn = (txn: BorrowingTransaction, book: Book) => {
    setReturnTxn({ transaction: txn, book });
  };

  const handleBorrowSuccess = () => {
    triggerRefresh();
  };

  const handleReturnSuccess = () => {
    triggerRefresh();
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans selection:bg-amber-100 selection:text-slate-900">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onNavigate={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenResearchModal={() => setResearchModalOpen(true)}
      />

      {/* Main Page Content Area */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <HomePage
            onNavigate={(tab) => {
              setCurrentTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSelectBook={handleSelectBook}
            onOpenResearchModal={() => setResearchModalOpen(true)}
          />
        )}

        {currentTab === 'about' && (
          <AboutPage
            onNavigate={(tab) => {
              setCurrentTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenResearchModal={() => setResearchModalOpen(true)}
          />
        )}

        {currentTab === 'catalog' && (
          <CatalogPage key={refreshKey} onSelectBook={handleSelectBook} />
        )}

        {currentTab === 'login' && (
          <LoginPage
            initialMode="student"
            onNavigate={(tab) => {
              setCurrentTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentTab === 'login-admin' && (
          <LoginPage
            initialMode="admin"
            onNavigate={(tab) => {
              setCurrentTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentTab === 'student-dashboard' && (
          <StudentDashboardPage
            key={refreshKey}
            onNavigate={(tab) => {
              setCurrentTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onInitiateReturn={handleInitiateReturn}
            onSelectBook={handleSelectBook}
          />
        )}

        {currentTab === 'my-books' && (
          <MyBorrowedBooksPage
            key={refreshKey}
            onNavigate={(tab) => {
              setCurrentTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onInitiateReturn={handleInitiateReturn}
          />
        )}

        {currentTab === 'history' && (
          <BorrowingHistoryPage
            key={refreshKey}
            onNavigate={(tab) => {
              setCurrentTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentTab === 'student-profile' && <StudentProfilePage key={refreshKey} />}

        {currentTab === 'admin-dashboard' && (
          <AdminDashboardPage
            key={refreshKey}
            onNavigate={(tab) => {
              setCurrentTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </main>

      {/* Official Footer */}
      <Footer
        onOpenResearchModal={() => setResearchModalOpen(true)}
        onNavigate={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Modal 1: Academic Research Framework Modal */}
      <ResearchModal
        isOpen={researchModalOpen}
        onClose={() => setResearchModalOpen(false)}
      />

      {/* Modal 2: Book Details & Borrowing Confirmation */}
      <BookDetailModal
        book={selectedBook}
        isOpen={selectedBook !== null}
        onClose={() => setSelectedBook(null)}
        onBorrowSuccess={handleBorrowSuccess}
        onNavigateLogin={() => {
          setCurrentTab('login');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Modal 3: Return Book Confirmation Modal */}
      <ReturnModal
        transaction={returnTxn ? returnTxn.transaction : null}
        book={returnTxn ? returnTxn.book : null}
        isOpen={returnTxn !== null}
        onClose={() => setReturnTxn(null)}
        onReturnSuccess={handleReturnSuccess}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
