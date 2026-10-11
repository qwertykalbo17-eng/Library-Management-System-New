import { useEffect, useRef, useState } from 'react';
import type { DependencyList } from 'react';

/** Fired by the database layer after any change (borrow, return, edit...) so open pages reload. */
export const LIBRARY_CHANGED = 'library:changed';

/**
 * Loads data from Supabase for a page.
 * - `loader` is async and returns everything the page needs.
 * - The page reloads when `deps` change and whenever the library data changes.
 */
export function useLibraryData<T>(loader: () => Promise<T>, deps: DependencyList, initial: T) {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  useEffect(() => {
    const onChange = () => setTick((t) => t + 1);
    window.addEventListener(LIBRARY_CHANGED, onChange);
    return () => window.removeEventListener(LIBRARY_CHANGED, onChange);
  }, []);

  useEffect(() => {
    let active = true;
    loaderRef
      .current()
      .then((result) => {
        if (!active) return;
        setData(result);
        setError(null);
      })
      .catch((e: unknown) => {
        if (!active) return;
        setError(e instanceof Error ? e.message : 'Could not load data. Please try again.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  return { data, loading, error, reload: () => setTick((t) => t + 1) };
}