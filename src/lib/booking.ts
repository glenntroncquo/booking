import { isValidCompanyId, isValidSlug } from "@/lib/constants";
import {
  getCompanyById,
  getCompanyBySlug,
  type PublicCompany,
} from "@/lib/supabase/company";

export function parseList(value?: string | string[]): string[] {
  if (!value) return [];
  const raw = Array.isArray(value) ? value : [value];
  return raw
    .flatMap((entry) => entry.split(","))
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function dedupe(values: string[]): string[] {
  return Array.from(new Set(values));
}

export async function resolveCompany(
  identifier: string,
): Promise<PublicCompany | null> {
  if (isValidCompanyId(identifier)) {
    return getCompanyById(identifier);
  }
  if (isValidSlug(identifier)) {
    return getCompanyBySlug(identifier);
  }
  return null;
}
