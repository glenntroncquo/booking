import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookingShell } from "@/components/booking/BookingShell";
import { isValidCompanyId } from "@/lib/constants";
import { getCompanyById } from "@/lib/supabase/company";

type PageProps = {
  params: Promise<{ companyId: string }>;
};

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

export default async function CompanyBookingPage({ params }: PageProps) {
  const { companyId } = await params;

  if (!isValidCompanyId(companyId)) {
    notFound();
  }

  const company = await getCompanyById(companyId);
  if (!company) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#FEFEFE] px-4 py-8">
      <BookingShell companyId={companyId} />
    </div>
  );
}
