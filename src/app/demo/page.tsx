"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LogoMark } from "@/components/brand/logo";
import { useHydrated } from "@/hooks/use-hydrated";
import { DEMO_USER } from "@/lib/mock/seed";
import { useAppStore } from "@/store/app-store";
import { useSession } from "@/store/session-store";

/** One-click entry into the interactive demo with the sample workspaces. */
export default function DemoPage() {
  const hydrated = useHydrated();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    useAppStore.getState().seed();
    if (!useSession.getState().user) useSession.getState().signIn(DEMO_USER);
    useSession.getState().setOnboarded(true);
    router.replace("/app");
  }, [hydrated, router]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-[#0b1020] text-white">
      <LogoMark size={44} className="animate-pulse" />
      <p className="text-sm text-white/60">Preparing your demo workspace…</p>
    </div>
  );
}
