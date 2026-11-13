"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/app-store";
import { useSession } from "@/store/session-store";

/** True once both persisted stores have rehydrated from localStorage on the client. */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const check = () => {
      if (useAppStore.persist.hasHydrated() && useSession.persist.hasHydrated()) setHydrated(true);
    };
    check();
    const a = useAppStore.persist.onFinishHydration(check);
    const b = useSession.persist.onFinishHydration(check);
    return () => {
      a();
      b();
    };
  }, []);
  return hydrated;
}
