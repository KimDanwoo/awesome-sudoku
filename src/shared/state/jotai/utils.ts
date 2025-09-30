import { atom, type Atom, type StorageAdapter } from "./index";

type StorageLike<Value> = StorageAdapter<Value>;

export function createJSONStorage<Value>(getStorage: () => Storage | undefined): StorageLike<Value> {
  return {
    getItem: (key: string) => {
      const storage = getStorage();
      if (!storage) return null;
      try {
        const item = storage.getItem(key);
        return item ? (JSON.parse(item) as Value) : null;
      } catch {
        return null;
      }
    },
    setItem: (key: string, value: Value) => {
      const storage = getStorage();
      if (!storage) return;
      storage.setItem(key, JSON.stringify(value));
    },
    removeItem: (key: string) => {
      const storage = getStorage();
      if (!storage) return;
      storage.removeItem(key);
    },
  };
}

const defaultStorage = createJSONStorage<unknown>(() => {
  if (typeof window === "undefined") {
    return undefined;
  }
  return window.localStorage;
});

export function atomWithStorage<Value>(
  key: string,
  initialValue: Value,
  storage?: StorageLike<Value>,
) {
  const resolvedStorage = storage ?? (defaultStorage as StorageLike<Value>);
  const baseAtom = atom(initialValue) as Atom<Value>;
  const storedValue = resolvedStorage.getItem(key);

  if (storedValue !== null) {
    baseAtom.value = storedValue;
  } else {
    resolvedStorage.setItem(key, initialValue);
  }

  baseAtom.storage = { key, adapter: resolvedStorage };

  return baseAtom;
}
