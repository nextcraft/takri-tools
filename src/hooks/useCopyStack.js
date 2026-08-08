import { useState, useEffect, useCallback } from 'react';

export const MAX_STACK = 108;
export const STORAGE_KEY = 'takri-copy-stack';

function loadStack() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, MAX_STACK);
  } catch {
    return [];
  }
}

function saveStack(stack) {
  try {
    if (stack.length === 0) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stack));
    }
  } catch {
    // quota or private mode — ignore
  }
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * @typedef {'takri' | 'devanagari' | 'roman'} CopyScript
 * @typedef {'sentence' | 'line' | 'word' | 'character'} CopyGranularity
 *
 * @typedef {Object} CopyStackEntry
 * @property {string} id
 * @property {string} text
 * @property {CopyScript} script
 * @property {CopyGranularity} granularity
 * @property {string} label
 * @property {number} copiedAt
 * @property {string} [romanHint]
 */

/**
 * @param {Omit<CopyStackEntry, 'id' | 'copiedAt'> & { id?: string; copiedAt?: number }} entry
 */
export function useCopyStack() {
  const [stack, setStack] = useState(loadStack);

  useEffect(() => {
    saveStack(stack);
  }, [stack]);

  const pushCopy = useCallback((entry) => {
    const newEntry = {
      id: entry.id ?? makeId(),
      text: entry.text,
      script: entry.script,
      granularity: entry.granularity,
      label: entry.label,
      copiedAt: entry.copiedAt ?? Date.now(),
      ...(entry.romanHint ? { romanHint: entry.romanHint } : {}),
    };

    setStack((prev) => [newEntry, ...prev].slice(0, MAX_STACK));
  }, []);

  const clearStack = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // private mode — ignore
    }
    setStack([]);
  }, []);

  return {
    stack,
    pushCopy,
    clearStack,
    count: stack.length,
  };
}
