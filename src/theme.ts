// Dark mode: adds a toggle button and recolors the existing pages when dark.
const STORAGE_KEY = 'library:theme';

const rules: string[] = [];
const bg = (cls: string, color: string) =>
  rules.push(`html.dark [class~="${cls}"]{background-color:${color}}`);
const hoverBg = (cls: string, color: string) =>
  rules.push(`html.dark [class~="hover:${cls}"]:hover{background-color:${color}}`);
const text = (cls: string, color: string) =>
  rules.push(`html.dark [class~="text-${cls}"]{color:${color}}`);
const border = (cls: string, color: string) =>
  rules.push(`html.dark [class~="border-${cls}"]{border-color:${color}}`);

// Surfaces
bg('bg-white', '#131c31');
['95', '90', '80'].forEach((n) => bg(`bg-white/${n}`, `rgba(19,28,49,0.${n})`));
bg('bg-slate-50', '#182238');
bg('bg-slate-50/80', 'rgba(24,34,56,0.8)');
bg('bg-slate-50/50', 'rgba(24,34,56,0.5)');
bg('bg-slate-100', '#1f2b45');
bg('bg-slate-100/70', 'rgba(31,43,69,0.7)');
bg('bg-slate-200', '#2a3856');
bg('bg-blue-50', 'rgba(59,130,246,0.14)');
bg('bg-blue-100', 'rgba(59,130,246,0.22)');
bg('bg-emerald-50', 'rgba(16,185,129,0.14)');
bg('bg-emerald-100', 'rgba(16,185,129,0.22)');
bg('bg-amber-50', 'rgba(245,158,11,0.14)');
bg('bg-amber-100', 'rgba(245,158,11,0.22)');
bg('bg-red-50', 'rgba(239,68,68,0.14)');
bg('bg-red-100', 'rgba(239,68,68,0.22)');

// Hover surfaces
hoverBg('bg-white', '#1a2540');
hoverBg('bg-slate-50', '#1f2b45');
hoverBg('bg-slate-50/80', '#1f2b45');
hoverBg('bg-slate-100', '#263450');
hoverBg('bg-slate-200', '#2f3f60');
hoverBg('bg-blue-50', 'rgba(59,130,246,0.22)');
hoverBg('bg-blue-100', 'rgba(59,130,246,0.3)');
hoverBg('bg-red-50', 'rgba(239,68,68,0.22)');

// Text
['slate-900', 'slate-800'].forEach((c) => text(c, '#f1f5f9'));
text('slate-700', '#e2e8f0');
text('slate-600', '#cbd5e1');
text('slate-500', '#a3b1c6');
text('slate-400', '#8a9bb4');
['blue-950', 'blue-900', 'blue-800', 'blue-700', 'blue-600'].forEach((c) => text(c, '#93c5fd'));
['emerald-900', 'emerald-800', 'emerald-700', 'emerald-600'].forEach((c) => text(c, '#6ee7b7'));
['amber-900', 'amber-800', 'amber-700', 'amber-600'].forEach((c) => text(c, '#fcd34d'));
['red-900', 'red-800', 'red-700', 'red-600'].forEach((c) => text(c, '#fca5a5'));

// Borders
border('slate-100', '#1e2a42');
border('slate-200', '#2a3752');
border('slate-300', '#3b4a68');
border('blue-200', 'rgba(96,165,250,0.35)');
border('emerald-200', 'rgba(52,211,153,0.35)');
border('amber-200', 'rgba(251,191,36,0.35)');
border('amber-300', 'rgba(251,191,36,0.45)');
border('red-200', 'rgba(248,113,113,0.4)');
border('red-300', 'rgba(248,113,113,0.5)');
rules.push('html.dark [class~="divide-slate-100"] > *{border-color:#1e2a42}');
rules.push('html.dark [class~="divide-slate-200"] > *{border-color:#2a3752}');

// Keep white text white on hover, and dark text on yellow buttons
rules.push('html.dark [class~="hover:text-white"]:hover{color:#ffffff}');
rules.push('html.dark [class~="bg-amber-400"],html.dark [class~="bg-amber-300"]{color:#0f172a}');

// Page + form fields
rules.push('html.dark{color-scheme:dark}');
rules.push('html.dark body{background-color:#0b1220;color:#e2e8f0}');
rules.push('html.dark #root > [class~="min-h-screen"]{background-color:#0b1220}');
rules.push('html.dark input,html.dark select,html.dark textarea{color:#f1f5f9}');
rules.push('html.dark input::placeholder,html.dark textarea::placeholder{color:#64748b}');
rules.push('html.dark option{background-color:#131c31;color:#f1f5f9}');

// Toggle button
rules.push(
  '#theme-toggle{position:fixed;right:16px;bottom:16px;z-index:9999;width:44px;height:44px;border-radius:9999px;border:1px solid #cbd5e1;background:#ffffff;color:#0f172a;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.18);cursor:pointer}',
  '#theme-toggle:hover{transform:scale(1.06)}',
  'html.dark #theme-toggle{background:#1e293b;color:#fcd34d;border-color:#334155}'
);

const MOON =
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';
const SUN =
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>';

const readSaved = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'dark';
  } catch {
    return false;
  }
};

const save = (dark: boolean) => {
  try {
    localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light');
  } catch {
    /* storage unavailable: the choice just won't be remembered */
  }
};

const apply = (dark: boolean, button?: HTMLButtonElement) => {
  document.documentElement.classList.toggle('dark', dark);
  if (button) {
    button.innerHTML = dark ? SUN : MOON;
    button.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
    button.setAttribute('aria-label', button.title);
  }
};

const style = document.createElement('style');
style.textContent = rules.join('\n');
document.head.appendChild(style);

// Apply the saved choice right away so the page doesn't flash white
apply(readSaved());

const mountButton = () => {
  if (document.getElementById('theme-toggle')) return;
  const button = document.createElement('button');
  button.id = 'theme-toggle';
  button.type = 'button';
  apply(document.documentElement.classList.contains('dark'), button);
  button.addEventListener('click', () => {
    const next = !document.documentElement.classList.contains('dark');
    apply(next, button);
    save(next);
  });
  document.body.appendChild(button);
};

if (document.body) mountButton();
else document.addEventListener('DOMContentLoaded', mountButton);

export {};