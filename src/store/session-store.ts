"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { SessionUser } from "@/types";

/**
 * MOCK AUTHENTICATION — demo only.
 *
 * No password is ever stored or transmitted. In production this store is
 * replaced by an httpOnly, Secure, SameSite=Lax session cookie issued by the
 * API (see docs/ARCHITECTURE.md → Authentication), and the client only keeps
 * the non-sensitive profile returned by `GET /v1/me`.
 */
interface SessionState {
  user: SessionUser | null;
  onboarded: boolean;
  signIn: (user: SessionUser) => void;
  signOut: () => void;
  updateProfile: (patch: Partial<Pick<SessionUser, "name" | "email">>) => void;
  setOnboarded: (v: boolean) => void;
}

export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      onboarded: true,
      signIn: (user) => set({ user }),
      signOut: () => set({ user: null }),
      updateProfile: (patch) => set((s) => (s.user ? { user: { ...s.user, ...patch } } : s)),
      setOnboarded: (onboarded) => set({ onboarded }),
    }),
    { name: "nexaflow-session-v1", storage: createJSONStorage(() => localStorage) },
  ),
);
