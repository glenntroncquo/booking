import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookingShell } from "@/components/booking/BookingShell";
import {
  buildCompanyMetadata,
  dedupe,
  parseList,
  resolveCompany,
} from "@/lib/booking";
import { parseDepositReturn } from "@/lib/deposit";

type PageProps = {
  params: Promise<{ companyId: string }>;
  /** service is a short alias for serviceIds. No treatmentId / priceOptionId. */
  searchParams: Promise<{
    staff?: string | string[];
    staffIds?: string | string[];
    staffSlugs?: string | string[];
    service?: string | string[];
    serviceIds?: string | string[];
    serviceVariantIds?: string | string[];
    deposit?: string | string[];
    checkout?: string | string[];
    session_id?: string | string[];
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

/** Company-only embed: no location is forwarded. The widget shows a location picker when needed. */
export default async function CompanyBookingPage({
  params,
  searchParams,
}: PageProps) {
  const { companyId } = await params;
  const {
    staff,
    staffIds,
    staffSlugs,
    service,
    serviceIds,
    serviceVariantIds,
    deposit,
    checkout,
    session_id,
  } = await searchParams;

  const company = await resolveCompany(companyId);
  if (!company) {
    notFound();
  }

  const preselectedStaffIds = dedupe([
    ...parseList(staff),
    ...parseList(staffIds),
  ]);
  const preselectedStaffSlugs = dedupe(parseList(staffSlugs));
  const preselectedServiceIds = dedupe([
    ...parseList(service),
    ...parseList(serviceIds),
  ]);
  const preselectedServiceVariantIds = dedupe(parseList(serviceVariantIds));

  return (
    <BookingShell
      company={company}
      depositReturn={parseDepositReturn({ deposit, checkout, session_id })}
      preselectedStaffIds={preselectedStaffIds}
      preselectedStaffSlugs={preselectedStaffSlugs}
      preselectedServiceIds={preselectedServiceIds}
      preselectedServiceVariantIds={preselectedServiceVariantIds}
    />
  );
}
