export interface Student {
  student_id: string;
  username?: string;
  full_name: string;
  grade_level: 'Grade 11' | 'Grade 12';
  strand: 'STEM' | 'ABM' | 'HUMSS' | 'GAS' | 'TVL-ICT' | 'TVL-HE';
  section: string;
  email: string;
  password?: string;
  account_status: 'Active' | 'Inactive' | 'Suspended';
  avatar?: string;
  created_at: string;
  contact_number?: string;
}

export interface Book {
  book_id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  publisher: string;
  publication_year: number;
  description: string;
  shelf_location: string;
  total_copies: number;
  available_copies: number;
  cover_image: string;
  borrow_count: number;
  created_at: string;
}

export interface BorrowingTransaction {
  transaction_id: string;
  student_id: string;
  book_id: string;
  borrow_date: string;
  due_date: string;
  return_date: string | null;
  status: 'Borrowed' | 'Due Soon' | 'Overdue' | 'Returned';
  notes?: string;
}

export interface Category {
  category_id: string;
  category_name: string;
  description: string;
  shelf_code: string;
}

export interface NotificationItem {
  notification_id: string;
  student_id: string | 'all';
  message: string;
  notification_type: 'borrow' | 'return' | 'due_soon' | 'overdue' | 'announcement';
  is_read: boolean;
  created_at: string;
}

export type UserRole = 'guest' | 'student' | 'admin';

export interface AuthSession {
  role: UserRole;
  student: Student | null;
  adminName?: string;
}
