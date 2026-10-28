import React, { useEffect, useRef, useState } from 'react';
import { MMSCLogo } from './components/MMSCLogo';
import './animations.css';

const SPLASH_KEY = 'library:splashSeen';

/** True only the first time the home page opens in this browser tab. */
export const shouldShowSplash = (): boolean => {
  try {
    return sessionStorage.getItem(SPLASH_KEY) !== '1';
  } catch {
    return true;
  }
};

/** Opening animation: logo pops in, glows, then the screen fades away. */
export const IntroSplash: React.FC = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    try {
      sessionStorage.setItem(SPLASH_KEY, '1');
    } catch {
      /* ignore */
    }
    const t = setTimeout(() => setVisible(false), 2300);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <div className="splash" aria-hidden="true">
      <MMSCLogo className="splash-logo w-24 h-24" />
      <div className="splash-title">
        <p className="text-sm font-bold tracking-wide">My Messiah School of Cavite, Inc.</p>
        <p className="text-[11px] text-amber-300 uppercase tracking-widest mt-1">
          Delas Alas Campus · Library
        </p>
      </div>
      <div className="splash-bar" />
    </div>
  );
};

/** Fades and slides its content in when it scrolls into view. */
export const Reveal: React.FC<{
  children: React.ReactNode;
  delay?: number;
  className?: string;
}> = ({ children, delay = 0, className = '' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${shown ? 'in-view' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};