import { useCallback, useSyncExternalStore } from "react";

const UNSET = Symbol("unset");

export type StorageAdapter<Value> = {
  getItem: (key: string) => Value | null;
  setItem: (key: string, value: Value) => void;
  removeItem: (key: string) => void;
};

export interface Atom<Value, Update = Value> {
  key: symbol;
  read?: (get: <T>(atom: Atom<T, unknown>) => T) => Value;
  write?: (
    get: <T>(atom: Atom<T, unknown>) => T,
    set: <T, U>(atom: Atom<T, U>, update: U) => void,
    update: Update,
  ) => void;
  init?: Value;
  value: Value | typeof UNSET;
  storage?: { key: string; adapter?: StorageAdapter<Value> };
}

type AtomValue<A extends Atom<unknown, unknown>> = A extends Atom<infer Value, unknown> ? Value : never;
type AtomUpdate<A extends Atom<unknown, unknown>> = A extends Atom<unknown, infer Update> ? Update : never;

const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function ensureValue<Value>(atom: Atom<Value, unknown>) {
  if (atom.value === UNSET && Object.prototype.hasOwnProperty.call(atom, "init")) {
    atom.value = atom.init as Value;
  }
}

function getAtomValue<Value>(atom: Atom<Value, unknown>): Value {
  if (atom.read) {
    return atom.read(getAtomValue);
  }

  ensureValue(atom);
  return atom.value as Value;
}

function setPrimitiveValue<Value>(atom: Atom<Value, unknown>, update: Value | ((prev: Value) => Value)) {
  ensureValue(atom);
  const previousValue = atom.value as Value;
  const next = typeof update === "function" ? (update as (prev: Value) => Value)(previousValue) : update;
  atom.value = next;
  if (atom.storage?.adapter) {
    atom.storage.adapter.setItem(atom.storage.key, next);
  }
  notifyListeners();
}

function writeAtom<Value, Update>(atom: Atom<Value, Update>, update: Update) {
  if (atom.write) {
    const setter = <T, U>(targetAtom: Atom<T, U>, value: U) => {
      writeAtom(targetAtom as Atom<unknown, unknown>, value as unknown);
    };
    atom.write((target) => getAtomValue(target), setter, update);
    return;
  }

  setPrimitiveValue(atom, update as unknown as Value);
}

export function atom<Value>(initialValue: Value): Atom<Value>;
export function atom<Value, Update>(
  initialValue: Value,
  write: (
    get: <T>(target: Atom<T, unknown>) => T,
    set: <T, U>(target: Atom<T, U>, update: U) => void,
    update: Update,
  ) => void,
): Atom<Value, Update>;
export function atom<Value, Update>(
  read: (get: <T>(target: Atom<T, unknown>) => T) => Value,
  write?: (
    get: <T>(target: Atom<T, unknown>) => T,
    set: <T, U>(target: Atom<T, U>, update: U) => void,
    update: Update,
  ) => void,
): Atom<Value, Update>;
export function atom<Value, Update>(
  initialValueOrRead: Value | ((get: <T>(target: Atom<T, unknown>) => T) => Value),
  write?: (
    get: <T>(target: Atom<T, unknown>) => T,
    set: <T, U>(target: Atom<T, U>, update: U) => void,
    update: Update,
  ) => void,
): Atom<Value, Update> {
  const baseAtom: Atom<Value, Update> = {
    key: Symbol("atom"),
    value: UNSET,
  };

  if (typeof initialValueOrRead === "function") {
    baseAtom.read = initialValueOrRead as (get: <T>(target: Atom<T, unknown>) => T) => Value;
  } else {
    baseAtom.init = initialValueOrRead;
  }

  if (write) {
    baseAtom.write = write;
  }

  return baseAtom;
}

export function useAtomValue<A extends Atom<unknown, unknown>>(targetAtom: A): AtomValue<A> {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => getAtomValue(targetAtom),
    () => getAtomValue(targetAtom),
  );
}

export function useSetAtom<A extends Atom<unknown, unknown>>(targetAtom: A) {
  return useCallback(
    (update: AtomUpdate<A>) => {
      writeAtom(targetAtom, update);
    },
    [targetAtom],
  );
}
