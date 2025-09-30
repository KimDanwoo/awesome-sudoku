"use client";

import { AuthState, User } from "@entities/auth/model/types";
import { useAtomValue, useSetAtom } from "jotai";
import { useMemo } from "react";

import {
  authIsAuthenticatedAtom,
  authLoadingAtom,
  authUserAtom,
  logoutAuthAtom,
  setAuthLoadingAtom,
  setAuthUserAtom,
} from "./authAtoms";

interface AuthActions {
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

type AuthStore = AuthState & AuthActions;

function useAuthState(): AuthState {
  const user = useAtomValue(authUserAtom);
  const isLoading = useAtomValue(authLoadingAtom);
  const isAuthenticated = useAtomValue(authIsAuthenticatedAtom);

  return useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated,
    }),
    [user, isLoading, isAuthenticated],
  );
}

function useAuthActions(): AuthActions {
  const setUser = useSetAtom(setAuthUserAtom);
  const setLoading = useSetAtom(setAuthLoadingAtom);
  const logout = useSetAtom(logoutAuthAtom);

  return useMemo(
    () => ({
      setUser,
      setLoading,
      logout,
    }),
    [logout, setLoading, setUser],
  );
}

export function useAuthStore(): AuthStore;
export function useAuthStore<T>(selector: (store: AuthStore) => T): T;
export function useAuthStore<T>(selector?: (store: AuthStore) => T) {
  const state = useAuthState();
  const actions = useAuthActions();

  const store = useMemo(() => ({ ...state, ...actions }), [actions, state]);

  if (selector) {
    return selector(store);
  }

  return store;
}
