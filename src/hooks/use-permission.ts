"use client";

import { useWorkspaceData } from "@/store/app-store";
import { useSession } from "@/store/session-store";
import type { PermissionKey } from "@/types";

/**
 * UI-level permission check. This only hides controls — the API must enforce
 * the same matrix server-side on every request (never trust the client).
 */
export function useCan(key: PermissionKey) {
  const role = useSession((s) => s.user?.role);
  const permissions = useWorkspaceData().permissions;
  if (!role) return false;
  return permissions[role]?.[key] ?? false;
}
