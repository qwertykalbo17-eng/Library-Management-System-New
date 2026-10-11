import { Student, Book, BorrowingTransaction, Category, NotificationItem } from '../types';
import { INITIAL_BOOKS, INITIAL_STUDENTS, INITIAL_TRANSACTIONS, INITIAL_CATEGORIES, INITIAL_NOTIFICATIONS } from './initialData';

const STORAGE_KEYS = {
  BOOKS: 'mmsc_lms_books_v1',
  STUDENTS: 'mmsc_lms_students_v1',
  TRANSACTIONS: 'mmsc_lms_transactions_v1',
  CATEGORIES: 'mmsc_lms_categories_v1',
  NOTIFICATIONS: 'mmsc_lms_notifications_v1',
};

// Current system anchor date for School Year 2026-2027
export const SYSTEM_CURRENT_DATE = '2026-10-01';

class LibraryDatabase {
  private getStorage<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) return defaultValue;
      return JSON.parse(data) as T;
    } catch (e) {
      console.warn(`Error reading localStorage key ${key}`, e);
      return defaultValue;
    }
  }

  private setStorage<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`Error writing to localStorage key ${key}`, e);
    }
  }

  constructor() {
    this.initializeIfEmpty();
  }

  public initializeIfEmpty(): void {
    if (!localStorage.getItem(STORAGE_KEYS.BOOKS)) {
      this.setStorage(STORAGE_KEYS.BOOKS, INITIAL_BOOKS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
      this.setStorage(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
      this.setStorage(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
      this.setStorage(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      this.setStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    }
  }

  public resetToDefault(): void {
    this.setStorage(STORAGE_KEYS.BOOKS, INITIAL_BOOKS);
    this.setStorage(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    this.setStorage(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
    this.setStorage(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    this.setStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  }

  // --- BOOKS ---
  public getBooks(): Book[] {
    return this.getStorage<Book[]>(STORAGE_KEYS.BOOKS, INITIAL_BOOKS);
  }

  public getBook(id: string): Book | undefined {
    return this.getBooks().find((b) => b.book_id === id);
  }

  public addBook(book: Omit<Book, 'book_id' | 'borrow_count' | 'created_at'>): Book {
    const books = this.getBooks();
    const newBook: Book = {
      ...book,
      book_id: `BOK-2026-${String(books.length + 1).padStart(3, '0')}`,
      borrow_count: 0,
      created_at: new Date().toISOString().split('T')[0],
    };
    books.unshift(newBook);
    this.setStorage(STORAGE_KEYS.BOOKS, books);
    return newBook;
  }

  public updateBook(updated: Book): void {
    const books = this.getBooks().map((b) => (b.book_id === updated.book_id ? updated : b));
    this.setStorage(STORAGE_KEYS.BOOKS, books);
  }

  public deleteBook(bookId: string): { success: boolean; message: string } {
    // Check if book has active borrowing transactions
    const activeTxns = this.getTransactions().filter(
      (t) => t.book_id === bookId && t.return_date === null
    );
    if (activeTxns.length > 0) {
      return {
        success: false,
        message: `Cannot delete book. There are currently ${activeTxns.length} active copy/copies borrowed by students.`,
      };
    }
    const books = this.getBooks().filter((b) => b.book_id !== bookId);
    this.setStorage(STORAGE_KEYS.BOOKS, books);
    return { success: true, message: 'Book deleted successfully from library catalog.' };
  }

  // --- STUDENTS ---
  public getStudents(): Student[] {
    return this.getStorage<Student[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
  }

  public getStudent(id: string): Student | undefined {
    const cleaned = id.trim().toUpperCase();
    return this.getStudents().find(
      (s) => s.student_id.toUpperCase() === cleaned || s.email.toLowerCase() === id.trim().toLowerCase()
    );
  }

  public addStudent(studentData: Omit<Student, 'created_at'>): { success: boolean; student?: Student; error?: string } {
    const students = this.getStudents();
    const cleanId = studentData.student_id.trim().toUpperCase();
    if (students.some((s) => s.student_id.toUpperCase() === cleanId)) {
      return { success: false, error: 'A student with this Student ID already exists.' };
    }
    if (students.some((s) => s.email.toLowerCase() === studentData.email.trim().toLowerCase())) {
      return { success: false, error: 'A student with this email address already exists.' };
    }

    const newStudent: Student = {
      ...studentData,
      student_id: cleanId,
      created_at: new Date().toISOString().split('T')[0],
      avatar:
        studentData.avatar ||
        `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80`,
    };
    students.unshift(newStudent);
    this.setStorage(STORAGE_KEYS.STUDENTS, students);
    return { success: true, student: newStudent };
  }

  public updateStudent(updated: Student): void {
    const students = this.getStudents().map((s) => (s.student_id === updated.student_id ? updated : s));
    this.setStorage(STORAGE_KEYS.STUDENTS, students);
  }

  public toggleStudentStatus(studentId: string): void {
    const students = this.getStudents().map((s) => {
      if (s.student_id === studentId) {
        const nextStatus = s.account_status === 'Active' ? 'Inactive' : 'Active';
        return { ...s, account_status: nextStatus as 'Active' | 'Inactive' };
      }
      return s;
    });
    this.setStorage(STORAGE_KEYS.STUDENTS, students);
  }

  // --- TRANSACTIONS ---
  public getTransactions(): BorrowingTransaction[] {
    const transactions = this.getStorage<BorrowingTransaction[]>(
      STORAGE_KEYS.TRANSACTIONS,
      INITIAL_TRANSACTIONS
    );
    // Recalculate dynamic statuses based on system current date
    const today = new Date(SYSTEM_CURRENT_DATE).getTime();

    return transactions.map((t) => {
      if (t.return_date !== null) {
        return { ...t, status: 'Returned' };
      }
      const dueDate = new Date(t.due_date).getTime();
      const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        return { ...t, status: 'Overdue' };
      } else if (diffDays <= 2) {
        return { ...t, status: 'Due Soon' };
      } else {
        return { ...t, status: 'Borrowed' };
      }
    });
  }

  public getTransactionsForStudent(studentId: string): BorrowingTransaction[] {
    return this.getTransactions().filter((t) => t.student_id === studentId);
  }

  public borrowBook(
    studentId: string,
    bookId: string,
    notes: string = 'Senior High School student checkout'
  ): { success: boolean; transaction?: BorrowingTransaction; message: string } {
    const student = this.getStudent(studentId);
    if (!student) {
      return { success: false, message: 'Student account not found in library records.' };
    }
    if (student.account_status !== 'Active') {
      return { success: false, message: 'Student library borrowing privileges are currently inactive or suspended.' };
    }

    const book = this.getBook(bookId);
    if (!book) {
      return { success: false, message: 'Book resource not found in catalog.' };
    }
    if (book.available_copies <= 0) {
      return { success: false, message: 'Sorry, this book is currently out of stock. All copies are checked out.' };
    }

    // Check if student already has this book actively borrowed
    const existingActive = this.getTransactions().find(
      (t) => t.student_id === studentId && t.book_id === bookId && t.return_date === null
    );
    if (existingActive) {
      return {
        success: false,
        message: 'You already have an active borrowed copy of this book. Please return it before borrowing another copy.',
      };
    }

    // Calculate dates: 7 days standard borrowing duration
    const borrowDate = SYSTEM_CURRENT_DATE;
    const dueObj = new Date(SYSTEM_CURRENT_DATE);
    dueObj.setDate(dueObj.getDate() + 7);
    const dueDate = dueObj.toISOString().split('T')[0];

    const transactions = this.getTransactions();
    const newTxn: BorrowingTransaction = {
      transaction_id: `TXN-2026-${String(transactions.length + 8801)}`,
      student_id: studentId,
      book_id: bookId,
      borrow_date: borrowDate,
      due_date: dueDate,
      return_date: null,
      status: 'Borrowed',
      notes,
    };

    transactions.unshift(newTxn);
    this.setStorage(STORAGE_KEYS.TRANSACTIONS, transactions);

    // Update book copies and borrow count
    const updatedBook: Book = {
      ...book,
      available_copies: Math.max(0, book.available_copies - 1),
      borrow_count: book.borrow_count + 1,
    };
    this.updateBook(updatedBook);

    // Add notification
    this.addNotification({
      student_id: studentId,
      message: `Borrowing Confirmed: You borrowed "${book.title}". Please return to Delas Alas Library on or before ${dueDate}.`,
      notification_type: 'borrow',
      is_read: false,
    });

    return {
      success: true,
      transaction: newTxn,
      message: `Successfully borrowed "${book.title}". Due date: ${dueDate}.`,
    };
  }

  public returnBook(
    transactionId: string
  ): { success: boolean; message: string; returnDate?: string } {
    const transactions = this.getTransactions();
    const txnIndex = transactions.findIndex((t) => t.transaction_id === transactionId);

    if (txnIndex === -1) {
      return { success: false, message: 'Transaction record not found.' };
    }

    const txn = transactions[txnIndex];
    if (txn.return_date !== null) {
      return { success: false, message: 'This book has already been marked as returned.' };
    }

    const returnDate = SYSTEM_CURRENT_DATE;
    const updatedTxn: BorrowingTransaction = {
      ...txn,
      return_date: returnDate,
      status: 'Returned',
    };
    transactions[txnIndex] = updatedTxn;
    this.setStorage(STORAGE_KEYS.TRANSACTIONS, transactions);

    // Increment book available copies
    const book = this.getBook(txn.book_id);
    if (book) {
      const updatedBook: Book = {
        ...book,
        available_copies: Math.min(book.total_copies, book.available_copies + 1),
      };
      this.updateBook(updatedBook);

      // Add student notification
      this.addNotification({
        student_id: txn.student_id,
        message: `Book Successfully Returned: "${book.title}" was received and cleared by Delas Alas Campus Library.`,
        notification_type: 'return',
        is_read: false,
      });
    }

    return {
      success: true,
      returnDate,
      message: `Book successfully returned. Records have been updated.`,
    };
  }

  // --- CATEGORIES ---
  public getCategories(): Category[] {
    return this.getStorage<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  }

  public addCategory(cat: Omit<Category, 'category_id'>): Category {
    const cats = this.getCategories();
    const newCat: Category = {
      ...cat,
      category_id: `cat-${Date.now().toString(36)}`,
    };
    cats.push(newCat);
    this.setStorage(STORAGE_KEYS.CATEGORIES, cats);
    return newCat;
  }

  // --- NOTIFICATIONS ---
  public getNotifications(studentId?: string): NotificationItem[] {
    const all = this.getStorage<NotificationItem[]>(
      STORAGE_KEYS.NOTIFICATIONS,
      INITIAL_NOTIFICATIONS
    );
    if (!studentId) return all;
    return all.filter((n) => n.student_id === studentId || n.student_id === 'all');
  }

  public addNotification(
    notif: Omit<NotificationItem, 'notification_id' | 'created_at'>
  ): NotificationItem {
    const all = this.getStorage<NotificationItem[]>(
      STORAGE_KEYS.NOTIFICATIONS,
      INITIAL_NOTIFICATIONS
    );
    const newNotif: NotificationItem = {
      ...notif,
      notification_id: `NOTIF-2026-${Date.now().toString().slice(-4)}`,
      created_at: new Date().toISOString(),
    };
    all.unshift(newNotif);
    this.setStorage(STORAGE_KEYS.NOTIFICATIONS, all);
    return newNotif;
  }

  public markNotificationAsRead(notifId: string): void {
    const all = this.getStorage<NotificationItem[]>(
      STORAGE_KEYS.NOTIFICATIONS,
      INITIAL_NOTIFICATIONS
    );
    const updated = all.map((n) => (n.notification_id === notifId ? { ...n, is_read: true } : n));
    this.setStorage(STORAGE_KEYS.NOTIFICATIONS, updated);
  }

  public markAllNotificationsAsRead(studentId: string): void {
    const all = this.getStorage<NotificationItem[]>(
      STORAGE_KEYS.NOTIFICATIONS,
      INITIAL_NOTIFICATIONS
    );
    const updated = all.map((n) => {
      if (n.student_id === studentId || n.student_id === 'all') {
        return { ...n, is_read: true };
      }
      return n;
    });
    this.setStorage(STORAGE_KEYS.NOTIFICATIONS, updated);
  }

  // --- METRICS & REPORTS ---
  public getDashboardMetrics() {
    const books = this.getBooks();
    const students = this.getStudents();
    const transactions = this.getTransactions();

    const totalBooks = books.reduce((acc, b) => acc + b.total_copies, 0);
    const availableBooks = books.reduce((acc, b) => acc + b.available_copies, 0);
    const activeBorrowed = transactions.filter((t) => t.return_date === null);
    const overdueTransactions = activeBorrowed.filter((t) => t.status === 'Overdue');
    const dueSoonTransactions = activeBorrowed.filter((t) => t.status === 'Due Soon');
    const returnedTransactions = transactions.filter((t) => t.return_date !== null);

    // Strand distribution of borrowing
    const strandMap: Record<string, number> = {
      STEM: 0,
      ABM: 0,
      HUMSS: 0,
      GAS: 0,
      'TVL-ICT': 0,
      'TVL-HE': 0,
    };

    transactions.forEach((txn) => {
      const student = students.find((s) => s.student_id === txn.student_id);
      if (student && strandMap[student.strand] !== undefined) {
        strandMap[student.strand] += 1;
      }
    });

    // Most borrowed books
    const topBooks = [...books].sort((a, b) => b.borrow_count - a.borrow_count).slice(0, 5);

    return {
      totalTitles: books.length,
      totalCopies: totalBooks,
      availableCopies: availableBooks,
      borrowedCopies: totalBooks - availableBooks,
      registeredStudents: students.length,
      totalTransactions: transactions.length,
      activeBorrowedCount: activeBorrowed.length,
      overdueCount: overdueTransactions.length,
      dueSoonCount: dueSoonTransactions.length,
      returnedCount: returnedTransactions.length,
      strandDistribution: strandMap,
      topBooks,
    };
  }

  public getStudentMetrics(studentId: string) {
    const txns = this.getTransactionsForStudent(studentId);
    const active = txns.filter((t) => t.return_date === null);
    const dueSoon = active.filter((t) => t.status === 'Due Soon');
    const overdue = active.filter((t) => t.status === 'Overdue');
    const returned = txns.filter((t) => t.return_date !== null);

    return {
      currentlyBorrowed: active.length,
      dueSoon: dueSoon.length,
      overdue: overdue.length,
      totalBorrowed: txns.length,
      returned: returned.length,
    };
  }
}

export const db = new LibraryDatabase();
