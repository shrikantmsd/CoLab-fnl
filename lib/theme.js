'use client';
import { useState, useEffect } from 'react';

// ── Theme palettes ───────────────────────────────────────────────────────
// Both objects share the exact same keys on purpose: any component that
// switches from a hardcoded `const T = {...}` to `const T = useTheme()`
// needs zero other changes — every `T.xxx` reference just resolves to a
// different hex value depending on which theme is active.
//
// Semantic colors (green/amber/red/blue/purple = success/warning/danger/
// info/special) are intentionally IDENTICAL across both themes — "red means
// problem" shouldn't change meaning when someone switches their skin.
// Only the structural/brand colors (navy, mid, bg, text, border, etc.)
// actually differ between themes.

export const THEMES = {
  classic: {
    name: 'classic',
    label: 'Classic',
    navy:  '#1A3D6B', mid:  '#2B579A', light: '#EEF4FF',
    text:  '#1F2937', muted:'#6B7280', dim:  '#9CA3AF',
    bg:    '#F0F4F8', white:'#FFFFFF', border:'#E5E7EB',
    green: '#166534', greenBg:'#DCFCE7', greenBorder:'#86EFAC',
    amber: '#92400E', amberBg:'#FEF3C7', amberBorder:'#FCD34D',
    red:   '#991B1B', redBg:  '#FEE2E2', redBorder:  '#FCA5A5',
    blue:  '#1E40AF', blueBg: '#DBEAFE', blueBorder: '#93C5FD',
    purple:'#7C3AED', purpleBg:'#EDE9FE', purpleBorder:'#C4B5FD',
    lime: '#2B579A', // Volt-only signature accent; falls back to `mid` here so
                      // any component using T.lime never breaks under Classic
    fontFamily: "'Segoe UI', Tahoma, sans-serif",
  },
  volt: {
    name: 'volt',
    label: 'Volt',
    navy:  '#0A0A0A', mid:  '#83AF3B', light: '#F5F5F8',
    text:  '#14151A', muted:'#6B7280', dim:  '#9CA3AF',
    bg:    '#F5F5F8', white:'#FFFFFF', border:'#E4E4E7',
    green: '#166534', greenBg:'#DCFCE7', greenBorder:'#86EFAC',
    amber: '#92400E', amberBg:'#FEF3C7', amberBorder:'#FCD34D',
    red:   '#991B1B', redBg:  '#FEE2E2', redBorder:  '#FCA5A5',
    blue:  '#1E40AF', blueBg: '#DBEAFE', blueBorder: '#93C5FD',
    purple:'#7C3AED', purpleBg:'#EDE9FE', purpleBorder:'#C4B5FD',
    lime: '#D7FE03', // the signature Volt accent — spotlight cards, CTAs, rings
    fontFamily: "'Urbanist', 'Segoe UI', sans-serif",
  },
};

const STORAGE_KEY = 'raisa_theme';
const EVENT_NAME = 'raisa-theme-change';

export function getActiveThemeName() {
  if (typeof window === 'undefined') return 'classic';
  try { return localStorage.getItem(STORAGE_KEY) || 'classic'; } catch { return 'classic'; }
}

export function setActiveThemeName(name) {
  if (!THEMES[name]) return;
  try {
    localStorage.setItem(STORAGE_KEY, name);
    window.dispatchEvent(new Event(EVENT_NAME));
  } catch { /* localStorage unavailable — theme just won't persist this session */ }
}

// React hook: returns the current theme's palette object, and re-renders
// the component whenever the theme changes (including changes made from a
// different mounted component, e.g. Settings).
export function useTheme() {
  const [themeName, setThemeName] = useState(getActiveThemeName());

  useEffect(() => {
    setThemeName(getActiveThemeName()); // sync after hydration
    const onChange = () => setThemeName(getActiveThemeName());
    window.addEventListener(EVENT_NAME, onChange);
    window.addEventListener('storage', onChange); // cross-tab sync
    return () => {
      window.removeEventListener(EVENT_NAME, onChange);
      window.removeEventListener('storage', onChange);
    };
  }, []);

  return THEMES[themeName] || THEMES.classic;
}
