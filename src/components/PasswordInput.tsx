import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Set to true to hide the lock icon on the left (it is shown by default). */
  hideLock?: boolean;
}

/** A password box with a lock icon on the left and an eye button on the right. */
export const PasswordInput: React.FC<PasswordInputProps> = ({ style, hideLock, ...props }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative w-full">
      {!hideLock && (
        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
      )}
      <input
        {...props}
        type={visible ? 'text' : 'password'}
        style={{ ...style, paddingRight: '2.75rem' }}
        // Turns off the browser's saved-password suggestions and key icon
        autoComplete="new-password"
        data-lpignore="true"
        data-1p-ignore="true"
        data-form-type="other"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1.5 text-slate-500 hover:text-slate-800 rounded cursor-pointer"
        aria-label={visible ? 'Hide password' : 'Show password'}
        title={visible ? 'Hide password' : 'Show password'}
      >
        {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
};