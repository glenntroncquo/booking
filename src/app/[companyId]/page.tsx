import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SalonBooking } from "@/components/booking/SalonBooking";
import { isValidCompanyId } from "@/lib/constants";
import { getCompanyById } from "@/lib/supabase/company";

type PageProps = {
  params: Promise<{ companyId: string }>;
  searchParams: Promise<{ staff?: string | string[] }>;
};

function parseStaffIds(staff?: string | string[]): string[] {
  if (!staff) return [];
  const raw = Array.isArray(staff) ? staff : [staff];
  return raw
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter(Boolean);
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { companyId } = await params;
  if (!isValidCompanyId(companyId)) {
    return { title: "Page not found", robots: { index: false } };
  }

  const company = await getCompanyById(companyId);
  if (!company) {
    return { title: "Page not found", robots: { index: false } };
  }

  return {
    title: `Book at ${company.name}`,
    description: company.description ?? `Book an appointment at ${company.name}.`,
    robots: { index: true, follow: true },
  };
}

export default async function CompanyBookingPage({
  params,
  searchParams,
}: PageProps) {
  const { companyId } = await params;
  const { staff } = await searchParams;

  if (!isValidCompanyId(companyId)) {
    notFound();
  }

  const company = await getCompanyById(companyId);
  if (!company) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white px-4 py-8">
      <SalonBooking
        companyId={companyId}
        preselectedStaffIds={parseStaffIds(staff)}
      />
    </div>
  );
}
