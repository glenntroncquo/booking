import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";

export type PublicCompany = {
  id: string;
  name: string;
  description?: string | null;
  city?: string | null;
  postal_code?: string | null;
  street?: string | null;
};

export async function getCompanyById(
  companyId: string,
): Promise<PublicCompany | null> {
  if (!SUPABASE_ANON_KEY) {
    return null;
  }

  const response = await fetch(`${SUPABASE_URL}/functions/v1/get-company-by-id`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ company_id: companyId }),
    next: { revalidate: 60 },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    return null;
  }

  return response.json() as Promise<PublicCompany>;
}
