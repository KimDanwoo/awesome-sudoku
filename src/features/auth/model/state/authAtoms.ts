import { User } from "@entities/auth/model/types";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

const AUTH_STORAGE_KEY = "sudoku-auth:user";

export const authUserAtom = atomWithStorage<User | null>(AUTH_STORAGE_KEY, null);
export const authLoadingAtom = atom(true);
export const authIsAuthenticatedAtom = atom((get) => Boolean(get(authUserAtom)));

export const setAuthUserAtom = atom(null, (_get, set, user: User | null) => {
  set(authUserAtom, user);
  set(authLoadingAtom, false);
});

export const setAuthLoadingAtom = atom(null, (_get, set, isLoading: boolean) => {
  set(authLoadingAtom, isLoading);
});

export const logoutAuthAtom = atom(null, (_get, set) => {
  set(authUserAtom, null);
  set(authLoadingAtom, false);
});
