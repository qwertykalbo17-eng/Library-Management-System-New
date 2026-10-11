import { supabase } from '../supabaseClient';
import { Student, Book, BorrowingTransaction, Category, NotificationItem } from '../types';
import { LIBRARY_CHANGED } from './useLibraryData';

/**
 * Library data layer, backed by Supabase.
 *
 * Differences from the old localStorage version:
 * - every method is async (use `await`)
 * - `student_id` in the app is the student's USERNAME; the database uses the Supabase user id internally
 * - borrowing and returning run inside the database (borrow_book / return_book) so stock stays correct
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;

const DAY_MS = 1000 * 60 * 60 * 24;

/** Today's date in the Philippines (YYYY-MM-DD). */
const todayManila = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });

/** Kept under its old name so existing pages still compile. It is now the REAL current date. */
export const SYSTEM_CURRENT_DATE = todayManila();

const txnLabel = (n: number) => `TXN-${String(n).padStart(5, '0')}`;
const txnNumber = (id: string) => Number(id.replace(/\D/g, ''));

const computeStatus = (returnDate: string | null, dueDate: string): BorrowingTransaction['status'] => {
  if (returnDate) return 'Returned';
  const diffDays = Math.ceil((new Date(dueDate).getTime() - new Date(todayManila()).getTime()) / DAY_MS);
  if (diffDays < 0) return 'Overdue';
  if (diffDays <= 2) return 'Due Soon';
  return 'Borrowed';
};

const mapBook = (r: Row): Book => ({
  book_id: r.id,
  title: r.title ?? '',
  author: r.author ?? '',
  isbn: r.isbn ?? '',
  category: r.category ?? '',
  publisher: r.publisher ?? '',
  publication_year: r.publication_year ?? 0,
  description: r.description ?? '',
  shelf_location: r.shelf_location ?? '',
  total_copies: r.total_copies ?? 0,
  available_copies: r.available_copies ?? 0,
  cover_image: r.cover_image ?? '',
  borrow_count: r.borrow_count ?? 0,
  created_at: String(r.created_at ?? '').split('T')[0],
});

const mapStudent = (r: Row): Student => ({
  student_id: r.username,
  username: r.username,
  full_name: r.full_name,
  grade_level: r.grade_level,
  strand: r.strand,
  section: r.section ?? '',
  email: '',
  account_status: r.account_status,
  avatar: r.avatar ?? undefined,
  contact_number: r.contact_number ?? undefined,
  created_at: String(r.created_at ?? '').split('T')[0],
});

const mapTransaction = (r: Row, usernames: Map<string, string>): BorrowingTransaction => ({
  transaction_id: txnLabel(r.txn_no),
  student_id: usernames.get(r.student_id) ?? r.student_id,
  book_id: r.book_id,
  borrow_date: r.borrow_date,
  due_date: r.due_date,
  return_date: r.return_date ?? null,
  status: computeStatus(r.return_date ?? null, r.due_date),
  notes: r.notes ?? undefined,
});

const mapCategory = (r: Row): Category => ({
  category_id: r.id,
  category_name: r.category_name,
  description: r.description ?? '',
  shelf_code: r.shelf_code ?? '',
});

const mapNotification = (r: Row, usernames: Map<string, string>): NotificationItem => ({
  notification_id: r.id,
  student_id: r.student_id ? usernames.get(r.student_id) ?? r.student_id : 'all',
  message: r.message,
  notification_type: r.notification_type,
  is_read: !!r.is_read,
  created_at: r.created_at,
});

const check = (error: { message: string } | null) => {
  if (error) throw new Error(error.message);
};

class LibraryDatabase {
  /** Tells open pages to reload their data. */
  private notify() {
    if (typeof window !== 'undefined') window.dispatchEvent(new Event(LIBRARY_CHANGED));
  }

  /** Maps Supabase user ids to usernames (admins see everyone, students only themselves). */
  private async usernameMap(): Promise<Map<string, string>> {
    const { data, error } = await supabase.from('students').select('id, username');
    check(error);
    return new Map((data ?? []).map((s: Row) => [s.id as string, s.username as string]));
  }

  // --- BOOKS ---
  public async getBooks(): Promise<Book[]> {
    const { data, error } = await supabase.from('library_books').select('*').order('title');
    check(error);
    return (data ?? []).map(mapBook);
  }

  public async getBook(id: string): Promise<Book | undefined> {
    const { data, error } = await supabase.from('library_books').select('*').eq('id', id).maybeSingle();
    check(error);
    return data ? mapBook(data) : undefined;
  }

  public async addBook(
    book: Omit<Book, 'book_id' | 'borrow_count' | 'created_at'>
  ): Promise<{ success: boolean; message: string; book?: Book }> {
    const { data, error } = await supabase
      .from('library_books')
      .insert({
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        category: book.category,
        publisher: book.publisher,
        publication_year: book.publication_year,
        description: book.description,
        shelf_location: book.shelf_location,
        total_copies: book.total_copies,
        available_copies: book.available_copies,
        cover_image: book.cover_image || null,
      })
      .select('*')
      .single();
    if (error) return { success: false, message: error.message };
    this.notify();
    return { success: true, message: 'New book added to library catalog.', book: mapBook(data) };
  }

  public async updateBook(updated: Book): Promise<{ success: boolean; message: string }> {
    const { error } = await supabase
      .from('library_books')
      .update({
        title: updated.title,
        author: updated.author,
        isbn: updated.isbn,
        category: updated.category,
        publisher: updated.publisher,
        publication_year: updated.publication_year,
        description: updated.description,
        shelf_location: updated.shelf_location,
        total_copies: updated.total_copies,
        available_copies: updated.available_copies,
        cover_image: updated.cover_image || null,
      })
      .eq('id', updated.book_id);
    if (error) return { success: false, message: error.message };
    this.notify();
    return { success: true, message: 'Book resource updated successfully.' };
  }

  public async deleteBook(bookId: string): Promise<{ success: boolean; message: string }> {
    const { count, error: countErr } = await supabase
      .from('library_transactions')
      .select('id', { count: 'exact', head: true })
      .eq('book_id', bookId)
      .is('return_date', null);
    if (countErr) return { success: false, message: countErr.message };
    if ((count ?? 0) > 0) {
      return {
        success: false,
        message: `Cannot delete book. There are currently ${count} active copy/copies borrowed by students.`,
      };
    }
    const { error } = await supabase.from('library_books').delete().eq('id', bookId);
    if (error) {
      return {
        success: false,
        message: error.message.includes('foreign key')
          ? 'Cannot delete this book because it has borrowing history. Set its copies to 0 instead.'
          : error.message,
      };
    }
    this.notify();
    return { success: true, message: 'Book deleted successfully from library catalog.' };
  }

  // --- STUDENTS ---
  /** Librarians get everyone; a student only gets their own record. */
  public async getStudents(): Promise<Student[]> {
    const { data, error } = await supabase.from('students').select('*').order('created_at', { ascending: false });
    check(error);
    return (data ?? []).map(mapStudent);
  }

  public async getStudent(username: string): Promise<Student | undefined> {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('username', username.trim().toLowerCase())
      .maybeSingle();
    check(error);
    return data ? mapStudent(data) : undefined;
  }

  /**
   * Students can only change their contact number (the database blocks the rest).
   * Librarians can change name, grade, strand, section and contact number.
   */
  public async updateStudent(updated: Student): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
      .from('students')
      .update({
        full_name: updated.full_name,
        grade_level: updated.grade_level,
        strand: updated.strand,
        section: updated.section,
        contact_number: updated.contact_number ?? null,
      })
      .eq('username', updated.student_id);
    if (error) return { success: false, error: error.message };
    this.notify();
    return { success: true };
  }

  public async toggleStudentStatus(username: string): Promise<{ success: boolean; error?: string }> {
    const student = await this.getStudent(username);
    if (!student) return { success: false, error: 'Student not found.' };
    const next = student.account_status === 'Active' ? 'Inactive' : 'Active';
    const { error } = await supabase.from('students').update({ account_status: next }).eq('username', student.student_id);
    if (error) return { success: false, error: error.message };
    this.notify();
    return { success: true };
  }

  // --- TRANSACTIONS ---
  /** Librarians get every transaction; a student only gets their own. */
  public async getTransactions(): Promise<BorrowingTransaction[]> {
    const [{ data, error }, names] = await Promise.all([
      supabase.from('library_transactions').select('*').order('created_at', { ascending: false }),
      this.usernameMap(),
    ]);
    check(error);
    return (data ?? []).map((r: Row) => mapTransaction(r, names));
  }

  public async getTransactionsForStudent(username: string): Promise<BorrowingTransaction[]> {
    const all = await this.getTransactions();
    return all.filter((t) => t.student_id === username);
  }

  public async borrowBook(
    studentUsername: string,
    bookId: string,
    notes: string = 'Senior High School student checkout'
  ): Promise<{ success: boolean; transaction?: BorrowingTransaction; message: string }> {
    const student = await this.getStudent(studentUsername);
    if (!student) return { success: false, message: 'Student account not found in library records.' };

    const { data: row } = await supabase
      .from('students')
      .select('id')
      .eq('username', student.student_id)
      .maybeSingle();
    if (!row) return { success: false, message: 'Student account not found in library records.' };

    const { data, error } = await supabase.rpc('borrow_book', {
      p_book_id: bookId,
      p_student_id: row.id,
      p_notes: notes,
    });
    if (error) return { success: false, message: error.message };

    const res = data as Row;
    if (!res?.success) return { success: false, message: res?.message ?? 'Could not complete the checkout.' };

    this.notify();
    return {
      success: true,
      message: res.message,
      transaction: {
        transaction_id: txnLabel(res.txn_no),
        student_id: student.student_id,
        book_id: bookId,
        borrow_date: res.borrow_date,
        due_date: res.due_date,
        return_date: null,
        status: computeStatus(null, res.due_date),
        notes,
      },
    };
  }

  public async returnBook(
    transactionId: string
  ): Promise<{ success: boolean; message: string; returnDate?: string }> {
    const { data, error } = await supabase.rpc('return_book', { p_txn_no: txnNumber(transactionId) });
    if (error) return { success: false, message: error.message };

    const res = data as Row;
    if (!res?.success) return { success: false, message: res?.message ?? 'Could not process the return.' };

    this.notify();
    return { success: true, message: res.message, returnDate: res.return_date };
  }

  // --- CATEGORIES ---
  /** If the categories table is empty, categories are taken from the books themselves. */
  public async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase.from('library_categories').select('*').order('category_name');
    check(error);
    if (data && data.length > 0) return data.map(mapCategory);

    const { data: books, error: booksErr } = await supabase.from('library_books').select('category');
    check(booksErr);
    const names = Array.from(new Set((books ?? []).map((b: Row) => b.category).filter(Boolean))).sort() as string[];
    return names.map((name) => ({ category_id: name, category_name: name, description: '', shelf_code: '' }));
  }

  public async addCategory(
    cat: Omit<Category, 'category_id'>
  ): Promise<{ success: boolean; message: string; category?: Category }> {
    const { data, error } = await supabase
      .from('library_categories')
      .insert({ category_name: cat.category_name, description: cat.description, shelf_code: cat.shelf_code })
      .select('*')
      .single();
    if (error) return { success: false, message: error.message };
    this.notify();
    return { success: true, message: 'Category added.', category: mapCategory(data) };
  }

  // --- NOTIFICATIONS ---
  public async getNotifications(studentUsername?: string): Promise<NotificationItem[]> {
    const [{ data, error }, names] = await Promise.all([
      supabase.from('library_notifications').select('*').order('created_at', { ascending: false }),
      this.usernameMap(),
    ]);
    check(error);
    const all: NotificationItem[] = (data ?? []).map((r: Row) => mapNotification(r, names));
    if (!studentUsername) return all;
    return all.filter((n) => n.student_id === studentUsername || n.student_id === 'all');
  }

  /** Librarians only. Use student_id 'all' for an announcement to everyone. */
  public async addNotification(
    notif: Omit<NotificationItem, 'notification_id' | 'created_at'>
  ): Promise<{ success: boolean; message: string }> {
    let studentUuid: string | null = null;
    if (notif.student_id !== 'all') {
      const { data: row } = await supabase
        .from('students')
        .select('id')
        .eq('username', notif.student_id)
        .maybeSingle();
      if (!row) return { success: false, message: 'Student not found.' };
      studentUuid = row.id;
    }
    const { error } = await supabase.from('library_notifications').insert({
      student_id: studentUuid,
      message: notif.message,
      notification_type: notif.notification_type,
      is_read: notif.is_read,
    });
    if (error) return { success: false, message: error.message };
    this.notify();
    return { success: true, message: 'Notification sent.' };
  }

  public async markNotificationAsRead(notifId: string): Promise<void> {
    const { error } = await supabase.from('library_notifications').update({ is_read: true }).eq('id', notifId);
    check(error);
    this.notify();
  }

  public async markAllNotificationsAsRead(_studentUsername?: string): Promise<void> {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    const { error } = await supabase
      .from('library_notifications')
      .update({ is_read: true })
      .eq('student_id', auth.user.id)
      .eq('is_read', false);
    check(error);
    this.notify();
  }

  // --- METRICS & REPORTS ---
  /** Pure calculation: pass in data you already loaded, so nothing is fetched twice. */
  public computeDashboardMetrics(books: Book[], students: Student[], transactions: BorrowingTransaction[]) {
    const totalBooks = books.reduce((acc, b) => acc + b.total_copies, 0);
    const availableBooks = books.reduce((acc, b) => acc + b.available_copies, 0);
    const activeBorrowed = transactions.filter((t) => t.return_date === null);
    const overdueTransactions = activeBorrowed.filter((t) => t.status === 'Overdue');
    const dueSoonTransactions = activeBorrowed.filter((t) => t.status === 'Due Soon');
    const returnedTransactions = transactions.filter((t) => t.return_date !== null);

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

  public async getDashboardMetrics() {
    const [books, students, transactions] = await Promise.all([
      this.getBooks(),
      this.getStudents(),
      this.getTransactions(),
    ]);
    return this.computeDashboardMetrics(books, students, transactions);
  }

  public computeStudentMetrics(studentTransactions: BorrowingTransaction[]) {
    const active = studentTransactions.filter((t) => t.return_date === null);
    return {
      currentlyBorrowed: active.length,
      dueSoon: active.filter((t) => t.status === 'Due Soon').length,
      overdue: active.filter((t) => t.status === 'Overdue').length,
      totalBorrowed: studentTransactions.length,
      returned: studentTransactions.filter((t) => t.return_date !== null).length,
    };
  }

  public async getStudentMetrics(username: string) {
    return this.computeStudentMetrics(await this.getTransactionsForStudent(username));
  }
}

export const db = new LibraryDatabase();