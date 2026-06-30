import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SalonBooking } from "@/components/booking/SalonBooking";
import {
  buildCompanyMetadata,
  dedupe,
  parseList,
  resolveCompany,
} from "@/lib/booking";

type PageProps = {
  params: Promise<{ companyId: string }>;
  searchParams: Promise<{
    staff?: string | string[];
    staffIds?: string | string[];
    staffSlugs?: string | string[];
  }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { companyId } = await params;
  const company = await resolveCompany(companyId);
  if (!company) {
    return { title: "Pagina niet gevonden", robots: { index: false } };
  }

  return buildCompanyMetadata(company);
}

export default async function CompanyBookingPage({
  params,
  searchParams,
}: PageProps) {
  const { companyId } = await params;
  const { staff, staffIds, staffSlugs } = await searchParams;

  const company = await resolveCompany(companyId);
  if (!company) {
    notFound();
  }

  const preselectedStaffIds = dedupe([
    ...parseList(staff),
    ...parseList(staffIds),
  ]);
  const preselectedStaffSlugs = dedupe(parseList(staffSlugs));

  return (
    <div className="booking-shell">
      <SalonBooking
        companyId={company.id}
        preselectedStaffIds={preselectedStaffIds}
        preselectedStaffSlugs={preselectedStaffSlugs}
      />
    </div>
  );
}
