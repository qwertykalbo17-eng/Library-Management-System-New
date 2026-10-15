export type MyBooksFilter = 'all' | 'due-soon' | 'overdue';

const KEY = 'library:myBooksFilter';

/** Called by the dashboard right before it opens "My Borrowed Books". */
export const setMyBooksFilter = (filter: MyBooksFilter) => {
  try {
    sessionStorage.setItem(KEY, filter);
  } catch {
    /* ignore */
  }
};

/** Read by "My Borrowed Books" when it opens. */
export const readMyBooksFilter = (): MyBooksFilter => {
  try {
    const v = sessionStorage.getItem(KEY);
    if (v === 'due-soon' || v === 'overdue') return v;
  } catch {
    /* ignore */
  }
  return 'all';
};

export const clearMyBooksFilter = () => {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
};