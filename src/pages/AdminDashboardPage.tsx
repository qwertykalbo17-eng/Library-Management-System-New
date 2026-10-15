import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, SYSTEM_CURRENT_DATE, BorrowRequest } from '../db/libraryDatabase';
import { AdminBorrowRequestsPanel } from './AdminBorrowRequestsPanel';
import { useLibraryData } from '../db/useLibraryData';
import { Book, Student, BorrowingTransaction, Category } from '../types';
import {
  BookOpen,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  RotateCcw,
  Download,
  FileSpreadsheet,
  Settings,
  ShieldCheck,
  TrendingUp,
  X,
  Layers,
  Save,
  Check,
} from 'lucide-react';

interface AdminDashboardPageProps {
  onNavigate: (tab: string) => void;
}

const EMPTY_ADMIN_DATA = {
  books: [] as Book[],
  students: [] as Student[],
  transactions: [] as BorrowingTransaction[],
  categories: [] as Category[],
  requests: [] as BorrowRequest[],
  metrics: db.computeDashboardMetrics([], [], []),
};

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigate }) => {
  const { role, adminName } = useAuth();

  // Tab navigation inside Admin Console
  const [activeTab, setActiveTab] = useState<
    'overview' | 'books' | 'students' | 'requests' | 'circulation' | 'reports' | 'settings'
  >('overview');

  // Data loading (everything the console needs, loaded together from Supabase)
  const {
    data: adminData,
    loading: dataLoading,
    error: dataError,
    reload: triggerRefresh,
  } = useLibraryData(
    async () => {
      if (role !== 'admin') return EMPTY_ADMIN_DATA;
      const [books, students, transactions, categories, requests] = await Promise.all([
        db.getBooks(),
        db.getStudents(),
        db.getTransactions(),
        db.getCategories(),
        db.getBorrowRequests(),
      ]);
      const metrics = db.computeDashboardMetrics(books, students, transactions);
      return { books, students, transactions, categories, requests, metrics };
    },
    [role],
    EMPTY_ADMIN_DATA
  );
  const { books, students, transactions, categories, requests, metrics } = adminData;
  const pendingRequestCount = requests.filter((r) => r.status === 'Pending').length;

  // Book search & modal states
  const [bookSearch, setBookSearch] = useState('');
  const [bookCategoryFilter, setBookCategoryFilter] = useState('all');
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [bookFormError, setBookFormError] = useState<string | null>(null);

  // Student search & modal states
  const [studentSearch, setStudentSearch] = useState('');
  const [studentStrandFilter, setStudentStrandFilter] = useState('all');
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentFormError, setStudentFormError] = useState<string | null>(null);

  // Circulation filter states & Walk-in Checkout modal
  const [txnSearch, setTxnSearch] = useState('');
  const [txnStatusFilter, setTxnStatusFilter] = useState('all');
  const [walkinModalOpen, setWalkinModalOpen] = useState(false);
  const [walkinStudentId, setWalkinStudentId] = useState('');
  const [walkinBookId, setWalkinBookId] = useState('');
  const [walkinError, setWalkinError] = useState<string | null>(null);
  const [walkinSuccess, setWalkinSuccess] = useState<string | null>(null);

  // Action status notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Protect Admin Route
  if (role !== 'admin') {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-xl border border-red-200 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-red-600 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Restricted Administrator Area</h2>
        <p className="text-xs text-slate-600">
          This portal is reserved strictly for authorized Delas Alas Campus library personnel.
        </p>
        <button
          onClick={() => onNavigate('login-admin')}
          className="px-4 py-2 text-xs font-semibold text-white bg-blue-900 rounded-md"
        >
          Sign In as Administrator
        </button>
      </div>
    );
  }

  // --- Handlers: Book Management ---
  const handleOpenAddBook = () => {
    setEditingBook(null);
    setBookFormError(null);
    setBookModalOpen(true);
  };

  const handleOpenEditBook = (b: Book) => {
    setEditingBook(b);
    setBookFormError(null);
    setBookModalOpen(true);
  };

  const handleDeleteBook = async (bookId: string) => {
    if (window.confirm('Are you sure you want to delete this book from the catalog?')) {
      const res = await db.deleteBook(bookId);
      if (!res.success) {
        alert(res.message);
      } else {
        showToast(res.message);
        triggerRefresh();
      }
    }
  };

  const handleSaveBook = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const author = formData.get('author') as string;
    const isbn = formData.get('isbn') as string;
    const category = formData.get('category') as string;
    const publisher = formData.get('publisher') as string;
    const publication_year = Number(formData.get('publication_year'));
    const description = formData.get('description') as string;
    const shelf_location = formData.get('shelf_location') as string;
    const total_copies = Number(formData.get('total_copies'));
    const available_copies = Number(formData.get('available_copies'));

    if (!title || !author || !shelf_location) {
      setBookFormError('Please fill in all required fields.');
      return;
    }

    if (available_copies > total_copies) {
      setBookFormError('Available copies cannot exceed total copies count.');
      return;
    }

    const res = editingBook
      ? await db.updateBook({
          ...editingBook,
          title,
          author,
          isbn,
          category,
          publisher,
          publication_year,
          description,
          shelf_location,
          total_copies,
          available_copies,
        })
      : await db.addBook({
          title,
          author,
          isbn,
          category,
          publisher,
          publication_year,
          description,
          shelf_location,
          total_copies,
          available_copies,
          cover_image: '',
        });

    if (!res.success) {
      setBookFormError(res.message);
      return;
    }

    showToast(res.message);
    setBookModalOpen(false);
    triggerRefresh();
  };

  // --- Handlers: Student Management ---
  const handleToggleStudent = async (studentId: string) => {
    const res = await db.toggleStudentStatus(studentId);
    if (!res.success) {
      alert(res.error || 'Could not change the account status.');
      return;
    }
    showToast('Student account status updated.');
    triggerRefresh();
  };

  const handleOpenEditStudent = (s: Student) => {
    setEditingStudent(s);
    setStudentFormError(null);
    setStudentModalOpen(true);
  };

  const handleSaveStudent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingStudent) return;
    const formData = new FormData(e.currentTarget);
    const full_name = (formData.get('full_name') as string).trim();
    const grade_level = formData.get('grade_level') as 'Grade 11' | 'Grade 12';
    const strand = formData.get('strand') as 'STEM' | 'ABM' | 'HUMSS' | 'GAS' | 'TVL-ICT' | 'TVL-HE';
    const section = (formData.get('section') as string).trim();
    const contact_number = (formData.get('contact_number') as string).trim();

    if (!full_name || !section) {
      setStudentFormError('Please provide the student name and section.');
      return;
    }

    const res = await db.updateStudent({
      ...editingStudent,
      full_name,
      grade_level,
      strand,
      section,
      contact_number,
    });
    if (!res.success) {
      setStudentFormError(res.error || 'Failed to update student.');
      return;
    }
    showToast('Student record updated successfully.');

    setStudentModalOpen(false);
    triggerRefresh();
  };

  // --- Handlers: Circulation & Returns ---
  const handleProcessReturn = async (transactionId: string) => {
    const res = await db.returnBook(transactionId);
    if (!res.success) {
      alert(res.message);
    } else {
      showToast('Book return processed and inventory updated.');
      triggerRefresh();
    }
  };

  const handleWalkinCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setWalkinError(null);
    setWalkinSuccess(null);

    if (!walkinStudentId.trim() || !walkinBookId.trim()) {
      setWalkinError('Please select both a valid Student ID and Book ID.');
      return;
    }

    const res = await db.borrowBook(walkinStudentId.trim(), walkinBookId.trim(), 'Circulation Desk walk-in checkout');
    if (!res.success) {
      setWalkinError(res.message);
    } else {
      setWalkinSuccess(res.message);
      showToast('Circulation checkout successfully completed.');
      setTimeout(() => {
        setWalkinModalOpen(false);
        setWalkinSuccess(null);
        triggerRefresh();
      }, 1400);
    }
  };

  // --- Handlers: Export CSV Report ---
  const handleExportCSV = (type: 'transactions' | 'inventory') => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    if (type === 'transactions') {
      csvContent += 'Transaction ID,Student ID,Student Name,Book Title,Borrow Date,Due Date,Return Date,Status\n';
      transactions.forEach((t) => {
        const student = students.find((s) => s.student_id === t.student_id);
        const book = books.find((b) => b.book_id === t.book_id);
        const row = [
          t.transaction_id,
          t.student_id,
          `"${student?.full_name || 'N/A'}"`,
          `"${book?.title || 'N/A'}"`,
          t.borrow_date,
          t.due_date,
          t.return_date || 'Active',
          t.status,
        ].join(',');
        csvContent += row + '\n';
      });
    } else {
      csvContent += 'Book ID,Title,Author,Category,ISBN,Shelf Location,Available Copies,Total Copies,Total Borrows\n';
      books.forEach((b) => {
        const row = [
          b.book_id,
          `"${b.title}"`,
          `"${b.author}"`,
          `"${b.category}"`,
          b.isbn,
          b.shelf_location,
          b.available_copies,
          b.total_copies,
          b.borrow_count,
        ].join(',');
        csvContent += row + '\n';
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MMSC_Library_${type}_report_${SYSTEM_CURRENT_DATE}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Downloaded ${type} CSV report.`);
  };

  // Filtered lists
  const filteredBooks = books.filter((b) => {
    const q = bookSearch.toLowerCase();
    const match =
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.isbn.toLowerCase().includes(q) ||
      b.shelf_location.toLowerCase().includes(q);
    const catMatch = bookCategoryFilter === 'all' || b.category === bookCategoryFilter;
    return match && catMatch;
  });

  const filteredStudents = students.filter((s) => {
    const q = studentSearch.toLowerCase();
    const match =
      s.full_name.toLowerCase().includes(q) ||
      s.student_id.toLowerCase().includes(q) ||
      s.section.toLowerCase().includes(q);
    const strandMatch = studentStrandFilter === 'all' || s.strand === studentStrandFilter;
    return match && strandMatch;
  });

  const filteredTransactions = transactions.filter((t) => {
    const q = txnSearch.toLowerCase();
    const student = students.find((s) => s.student_id === t.student_id);
    const book = books.find((b) => b.book_id === t.book_id);
    const match =
      t.transaction_id.toLowerCase().includes(q) ||
      t.student_id.toLowerCase().includes(q) ||
      (student && student.full_name.toLowerCase().includes(q)) ||
      (book && book.title.toLowerCase().includes(q));

    if (txnStatusFilter === 'all') return match;
    if (txnStatusFilter === 'Active') return match && t.return_date === null;
    if (txnStatusFilter === 'Overdue') return match && t.status === 'Overdue';
    if (txnStatusFilter === 'Returned') return match && t.return_date !== null;
    return match;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-lg shadow-xl border border-slate-700 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {dataError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
          Could not load library data: {dataError}
        </div>
      )}
      {dataLoading && (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500">
          Loading library data…
        </div>
      )}

      {/* Admin Top Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Authorized Library Personnel Console
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500 font-mono">Delas Alas Campus</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif-display">
            Library Administration & Research Hub
          </h1>
          <p className="text-xs text-slate-500">
            Current Operator: <strong className="text-slate-800">{adminName}</strong> · School Year 2026–2027
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExportCSV('transactions')}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Circulation</span>
          </button>
          <button
            onClick={() => {
              setWalkinStudentId('');
              setWalkinBookId('');
              setWalkinError(null);
              setWalkinSuccess(null);
              setWalkinModalOpen(true);
            }}
            className="px-4 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-950 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Process Walk-In Checkout</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Titles
          </span>
          <div className="text-2xl font-black text-slate-900 font-mono tabular-nums mt-1">
            {metrics.totalTitles}
          </div>
          <p className="text-[10px] text-slate-500">{metrics.totalCopies} total copies</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Available Books
          </span>
          <div className="text-2xl font-black text-emerald-700 font-mono tabular-nums mt-1">
            {metrics.availableCopies}
          </div>
          <p className="text-[10px] text-slate-500">Ready for checkout</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Borrowed Books
          </span>
          <div className="text-2xl font-black text-blue-900 font-mono tabular-nums mt-1">
            {metrics.activeBorrowedCount}
          </div>
          <p className="text-[10px] text-slate-500">Active student loans</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Overdue Books
          </span>
          <div className="text-2xl font-black text-red-600 font-mono tabular-nums mt-1">
            {metrics.overdueCount}
          </div>
          <p className="text-[10px] text-slate-500">Requiring recall</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            SHS Students
          </span>
          <div className="text-2xl font-black text-slate-900 font-mono tabular-nums mt-1">
            {metrics.registeredStudents}
          </div>
          <p className="text-[10px] text-slate-500">Enrolled & registered</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Circulations
          </span>
          <div className="text-2xl font-black text-slate-900 font-mono tabular-nums mt-1">
            {metrics.totalTransactions}
          </div>
          <p className="text-[10px] text-slate-500">{metrics.returnedCount} returned</p>
        </div>
      </div>

      {/* Waiting borrow requests */}
      {pendingRequestCount > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-amber-900">
                {pendingRequestCount} borrow request{pendingRequestCount === 1 ? '' : 's'} waiting for approval
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                Students cannot pick up their books until you approve the request.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('requests')}
            className="px-3 py-1.5 text-xs font-bold text-amber-900 bg-white border border-amber-200 hover:bg-amber-100 rounded-md transition-colors cursor-pointer shrink-0"
          >
            Review Requests
          </button>
        </div>
      )}

      {/* Admin Internal Navigation Tabs (Interactive Segmented Control) */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto text-xs font-semibold text-slate-600">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-3 transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'overview'
              ? 'border-blue-900 text-blue-900 font-bold'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          Research & Analytics Overview
        </button>
        <button
          onClick={() => setActiveTab('books')}
          className={`pb-3 px-3 transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'books'
              ? 'border-blue-900 text-blue-900 font-bold'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          Book Management ({books.length})
        </button>
        <button
          onClick={() => setActiveTab('students')}
          className={`pb-3 px-3 transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'students'
              ? 'border-blue-900 text-blue-900 font-bold'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          Student Accounts ({students.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-3 px-3 transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'requests'
              ? 'border-blue-900 text-blue-900 font-bold'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          Borrow Requests ({pendingRequestCount} pending)
        </button>
        <button
          onClick={() => setActiveTab('circulation')}
          className={`pb-3 px-3 transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'circulation'
              ? 'border-blue-900 text-blue-900 font-bold'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          Borrowing & Circulation Ledger ({transactions.length})
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 px-3 transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'reports'
              ? 'border-blue-900 text-blue-900 font-bold'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          Reports & Statistics
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 px-3 transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'settings'
              ? 'border-blue-900 text-blue-900 font-bold'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          System Tools
        </button>
      </div>

      {/* --- BORROW REQUESTS (approve / decline) --- */}
      {activeTab === 'requests' && (
        <AdminBorrowRequestsPanel requests={requests} books={books} students={students} />
      )}

      {/* --- TAB 1: OVERVIEW & RESEARCH ANALYTICS --- */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strand Borrowing Distribution */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Borrowing Distribution by Senior High Strand
                </h3>
                <TrendingUp className="w-4 h-4 text-blue-900" />
              </div>
              <p className="text-xs text-slate-500">
                Measurement supporting research assessment on system usage across academic specializations.
              </p>

              <div className="space-y-3 pt-2">
                {Object.entries(metrics.strandDistribution).map(([strand, count]: [string, number]) => {
                  const percentage =
                    metrics.totalTransactions > 0
                      ? Math.round((count / metrics.totalTransactions) * 100)
                      : 0;

                  return (
                    <div key={strand} className="space-y-1 text-xs">
                      <div className="flex justify-between font-medium">
                        <span className="text-slate-800">{strand} Track</span>
                        <span className="text-slate-500 tabular-nums">
                          {count} transaction{count === 1 ? '' : 's'} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-blue-900 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Most Borrowed Resources */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Top Circulated Learning Resources
                </h3>
                <BookOpen className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-xs text-slate-500">
                Most utilized DepEd core and applied textbooks at Delas Alas Campus.
              </p>

              <div className="divide-y divide-slate-100">
                {metrics.topBooks.map((b, idx) => (
                  <div key={b.book_id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 truncate pr-3">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[10px] shrink-0">
                        {idx + 1}
                      </span>
                      <div className="truncate">
                        <p className="font-bold text-slate-900 truncate">{b.title}</p>
                        <p className="text-slate-400 text-[11px] truncate">
                          {b.category} · Shelf {b.shelf_location}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-blue-900 shrink-0 tabular-nums">
                      {b.borrow_count} borrows
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Research Alignment Notice */}
          <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-5 text-xs text-slate-700 space-y-2">
            <span className="font-bold text-blue-950 uppercase tracking-wider block">
              Official Research Study Alignment
            </span>
            <p className="leading-relaxed">
              “ASSESSMENT OF THE EFFECTIVENESS OF LIBRARY MANAGEMENT SYSTEM AMONG SENIOR HIGH SCHOOL STUDENTS OF MY MESSIAH SCHOOL OF CAVITE, INC. – DELAS ALAS CAMPUS SCHOOL YEAR 2026–2027”
            </p>
            <p className="text-slate-500 text-[11px]">
              The metrics compiled above provide live institutional operational data for analyzing Efficiency (turnaround velocity), Accuracy (synchronized book copies & zero misplaced manual cards), and User Satisfaction across student tracks.
            </p>
          </div>
        </div>
      )}

            {/* --- TAB 2: BOOK MANAGEMENT --- */}
      {activeTab === 'books' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={bookSearch}
                  onChange={(e) => setBookSearch(e.target.value)}
                  placeholder="Search book title, author, ISBN, shelf..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <select
                value={bookCategoryFilter}
                onChange={(e) => setBookCategoryFilter(e.target.value)}
                className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.category_id} value={c.category_name}>
                    {c.category_name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleOpenAddBook}
              className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-950 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Book Resource</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Book ID</th>
                    <th className="py-3 px-4">Title & Author</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">ISBN</th>
                    <th className="py-3 px-4">Shelf Call</th>
                    <th className="py-3 px-4 text-center">Copies (Avail / Total)</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBooks.map((b) => (
                    <tr key={b.book_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{b.book_id}</td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block line-clamp-1">{b.title}</span>
                        <span className="text-slate-500 text-[11px] block">By {b.author}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-700">{b.category}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{b.isbn}</td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-700">
                        {b.shelf_location}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`font-mono font-bold tabular-nums ${
                            b.available_copies === 0
                              ? 'text-red-600'
                              : b.available_copies <= 2
                              ? 'text-amber-600'
                              : 'text-emerald-700'
                          }`}
                        >
                          {b.available_copies} / {b.total_copies}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditBook(b)}
                            className="p-1.5 text-blue-900 hover:bg-blue-50 rounded transition-colors"
                            title="Edit Book Details"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteBook(b.book_id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete Book"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 3: STUDENT MANAGEMENT --- */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Search student name, ID, section..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <select
                value={studentStrandFilter}
                onChange={(e) => setStudentStrandFilter(e.target.value)}
                className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              >
                <option value="all">All Strands</option>
                <option value="STEM">STEM</option>
                <option value="ABM">ABM</option>
                <option value="HUMSS">HUMSS</option>
                <option value="GAS">GAS</option>
                <option value="TVL-ICT">TVL-ICT</option>
                <option value="TVL-HE">TVL-HE</option>
              </select>
            </div>

            <p className="text-[11px] text-slate-500 w-full sm:w-auto sm:max-w-xs sm:text-right">
              Students register themselves on the sign-up page. New accounts appear here as Inactive until you activate them.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Student ID</th>
                    <th className="py-3 px-4">Full Name</th>
                    <th className="py-3 px-4">Grade & Strand</th>
                    <th className="py-3 px-4">Section</th>
                    <th className="py-3 px-4">Username</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((s) => (
                    <tr key={s.student_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-blue-900 text-[11px]">
                        {s.student_id}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900">{s.full_name}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {s.grade_level} · <strong className="font-semibold">{s.strand}</strong>
                      </td>
                      <td className="py-3 px-4 text-slate-700">{s.section}</td>
                      <td className="py-3 px-4 text-slate-500 text-[11px] truncate max-w-xs">{s.username}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border ${
                            s.account_status === 'Active'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}
                        >
                          {s.account_status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5">
                        <button
                          onClick={() => handleOpenEditStudent(s)}
                          className="px-2.5 py-1 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleStudent(s.student_id)}
                          className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                            s.account_status === 'Active'
                              ? 'bg-red-50 text-red-700 hover:bg-red-100'
                              : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                          }`}
                        >
                          {s.account_status === 'Active' ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 4: CIRCULATION & BORROWING --- */}
      {activeTab === 'circulation' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={txnSearch}
                  onChange={(e) => setTxnSearch(e.target.value)}
                  placeholder="Search transaction ID, student name, book title..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <select
                value={txnStatusFilter}
                onChange={(e) => setTxnStatusFilter(e.target.value)}
                className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              >
                <option value="all">All Statuses</option>
                <option value="Active">Active Loans</option>
                <option value="Overdue">Overdue Only</option>
                <option value="Returned">Returned</option>
              </select>
            </div>

            <button
              onClick={() => {
                setWalkinStudentId('');
                setWalkinBookId('');
                setWalkinError(null);
                setWalkinSuccess(null);
                setWalkinModalOpen(true);
              }}
              className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-950 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Process Checkout</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Txn ID</th>
                    <th className="py-3 px-4">Student Name & ID</th>
                    <th className="py-3 px-4">Book Title</th>
                    <th className="py-3 px-4">Issued</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Return Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Circulation Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransactions.map((t) => {
                    const student = students.find((s) => s.student_id === t.student_id);
                    const book = books.find((b) => b.book_id === t.book_id);
                    const isReturned = t.return_date !== null;

                    return (
                      <tr key={t.transaction_id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                          {t.transaction_id}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 block">{student?.full_name || 'Unknown'}</span>
                          <span className="text-slate-500 font-mono text-[11px]">{t.student_id}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-900 line-clamp-1">
                            {book?.title || 'Unknown Title'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">{t.borrow_date}</td>
                        <td className="py-3 px-4 font-mono font-semibold text-slate-800">{t.due_date}</td>
                        <td className="py-3 px-4 font-mono text-slate-600">
                          {t.return_date || <span className="text-slate-400 italic">Active</span>}
                        </td>
                        <td className="py-3 px-4">
                          {isReturned ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Returned
                            </span>
                          ) : t.status === 'Overdue' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                              <AlertTriangle className="w-3 h-3 text-red-600" />
                              Overdue
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              <Clock className="w-3 h-3 text-blue-600" />
                              Active
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {!isReturned ? (
                            <button
                              onClick={() => handleProcessReturn(t.transaction_id)}
                              className="px-3 py-1 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-950 rounded transition-colors inline-flex items-center gap-1 cursor-pointer"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Process Return</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-medium">Cleared</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 5: REPORTS & EXPORTS --- */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Circulation & Transaction Ledger
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Full dataset of historical student loans, due dates, return timestamps, and overdue flags for research empirical tabulation.
                </p>
              </div>
              <button
                onClick={() => handleExportCSV('transactions')}
                className="w-full py-2.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-950 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Download Circulation CSV Report</span>
              </button>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-900 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Catalog Inventory & Stock Report
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Detailed inventory analysis showing ISBNs, call numbers, total vs available copy counts, and popularity metrics.
                </p>
              </div>
              <button
                onClick={() => handleExportCSV('inventory')}
                className="w-full py-2.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Download Inventory CSV Report</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 6: SETTINGS & DATA RESET --- */}
      {activeTab === 'settings' && (
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6 max-w-2xl">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-900" />
              <span>System Information</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Library records are stored in your Supabase database and shared by every computer that uses this system.
            </p>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 space-y-2">
            <span className="font-bold block">Data storage</span>
            <p className="leading-relaxed">
              Books, students, loans and notifications are saved online. The old "reset to sample data" tool was removed because it could erase real circulation records. To clear test data, use the Supabase Table Editor.
            </p>
          </div>
        </div>
      )}

      {/* --- MODAL: ADD / EDIT BOOK --- */}
      {bookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white rounded-t-xl">
              <h3 className="font-bold text-sm text-white">
                {editingBook ? 'Edit Book Details' : 'Add New Book Resource'}
              </h3>
              <button
                onClick={() => setBookModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBook} className="p-5 space-y-4 text-xs">
              {bookFormError && (
                <div className="p-2.5 bg-red-50 text-red-700 rounded border border-red-200">
                  {bookFormError}
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">Book Title *</label>
                <input
                  name="title"
                  defaultValue={editingBook?.title}
                  required
                  placeholder="e.g. General Biology 1 & 2 for Senior High"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Author(s) *</label>
                <input
                  name="author"
                  defaultValue={editingBook?.author}
                  required
                  placeholder="e.g. Dr. Maria Elena Santos, Ph.D."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">ISBN Number (optional)</label>
                  <input
                    name="isbn"
                    defaultValue={editingBook?.isbn}
                    placeholder="e.g. 978-971-06-4421-5"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category / Track *</label>
                  <select
                    name="category"
                    defaultValue={editingBook?.category || 'STEM'}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-slate-900"
                  >
                    {categories.map((c) => (
                      <option key={c.category_id} value={c.category_name}>
                        {c.category_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Publisher</label>
                  <input
                    name="publisher"
                    defaultValue={editingBook?.publisher || 'Vibal Publishing'}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Publication Year</label>
                  <input
                    type="number"
                    name="publication_year"
                    defaultValue={editingBook?.publication_year || 2024}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Shelf Call # *</label>
                  <input
                    name="shelf_location"
                    defaultValue={editingBook?.shelf_location || 'SHS-STEM-01A'}
                    required
                    placeholder="e.g. SHS-STEM-01A"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Total Copies</label>
                  <input
                    type="number"
                    min="1"
                    name="total_copies"
                    defaultValue={editingBook?.total_copies || 5}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Available Copies</label>
                  <input
                    type="number"
                    min="0"
                    name="available_copies"
                    defaultValue={editingBook ? editingBook.available_copies : 5}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={editingBook?.description}
                  placeholder="Overview of subject competencies and topics covered..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setBookModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-blue-900 hover:bg-blue-950 rounded shadow-xs"
                >
                  Save Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: EDIT STUDENT --- */}
      {studentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white rounded-t-xl">
              <h3 className="font-bold text-sm text-white">Edit Student Record</h3>
              <button
                onClick={() => setStudentModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="p-5 space-y-4 text-xs">
              {studentFormError && (
                <div className="p-2.5 bg-red-50 text-red-700 rounded border border-red-200">
                  {studentFormError}
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Username (cannot be changed)
                </label>
                <input
                  name="student_id"
                  defaultValue={editingStudent?.student_id}
                  readOnly
                  className="w-full p-2 bg-slate-100 border border-slate-200 rounded text-slate-500 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Student Full Name *</label>
                <input
                  name="full_name"
                  defaultValue={editingStudent?.full_name}
                  required
                  placeholder="e.g. Juan De La Cruz"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Grade Level *</label>
                  <select
                    name="grade_level"
                    defaultValue={editingStudent?.grade_level || 'Grade 11'}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-slate-900"
                  >
                    <option value="Grade 11">Grade 11</option>
                    <option value="Grade 12">Grade 12</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Strand / Track *</label>
                  <select
                    name="strand"
                    defaultValue={editingStudent?.strand || 'STEM'}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-slate-900"
                  >
                    <option value="STEM">STEM</option>
                    <option value="ABM">ABM</option>
                    <option value="HUMSS">HUMSS</option>
                    <option value="GAS">GAS</option>
                    <option value="TVL-ICT">TVL-ICT</option>
                    <option value="TVL-HE">TVL-HE</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Homeroom Section *</label>
                  <input
                    name="section"
                    defaultValue={editingStudent?.section || 'St. Jude'}
                    required
                    placeholder="e.g. Newton"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Contact Number</label>
                  <input
                    name="contact_number"
                    defaultValue={editingStudent?.contact_number || '0917-000-0000'}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStudentModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-blue-900 hover:bg-blue-950 rounded shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: PROCESS WALK-IN CHECKOUT --- */}
      {walkinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white rounded-t-xl">
              <h3 className="font-bold text-sm text-white">Process Walk-In Loan Checkout</h3>
              <button
                onClick={() => setWalkinModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleWalkinCheckout} className="p-5 space-y-4 text-xs">
              {walkinError && (
                <div className="p-2.5 bg-red-50 text-red-700 rounded border border-red-200">
                  {walkinError}
                </div>
              )}
              {walkinSuccess && (
                <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded border border-emerald-200">
                  {walkinSuccess}
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Select Borrower Student:
                </label>
                <select
                  value={walkinStudentId}
                  onChange={(e) => setWalkinStudentId(e.target.value)}
                  required
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-slate-900 font-mono"
                >
                  <option value="">-- Choose Enrolled Student --</option>
                  {students.map((s) => (
                    <option key={s.student_id} value={s.student_id}>
                      {s.student_id} · {s.full_name} ({s.strand})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Select Book Resource:
                </label>
                <select
                  value={walkinBookId}
                  onChange={(e) => setWalkinBookId(e.target.value)}
                  required
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-slate-900 truncate"
                >
                  <option value="">-- Choose Book in Catalog --</option>
                  {books.map((b) => (
                    <option key={b.book_id} value={b.book_id} disabled={b.available_copies <= 0}>
                      {b.title} ({b.available_copies} available)
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-blue-50 text-blue-900 rounded text-[11px] space-y-1">
                <span className="font-semibold block">Loan Terms:</span>
                <p>• Standard 7 calendar days loan period.</p>
                <p>• Librarian desk checkouts are approved immediately and the stock goes down right away.</p>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setWalkinModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-blue-900 hover:bg-blue-950 rounded shadow-xs"
                >
                  Confirm Checkout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};