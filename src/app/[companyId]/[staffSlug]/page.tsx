import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SalonBooking } from "@/components/booking/SalonBooking";
import { buildCompanyMetadata, resolveCompany } from "@/lib/booking";
import { isValidCompanyId, isValidSlug } from "@/lib/constants";

type PageProps = {
  params: Promise<{ companyId: string; staffSlug: string }>;
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

export default async function StaffBookingPage({ params }: PageProps) {
  const { companyId, staffSlug } = await params;

  const company = await resolveCompany(companyId);
  if (!company) {
    notFound();
  }

  const preselectedStaffIds = isValidCompanyId(staffSlug) ? [staffSlug] : [];
  const preselectedStaffSlugs =
    !isValidCompanyId(staffSlug) && isValidSlug(staffSlug) ? [staffSlug] : [];

  if (preselectedStaffIds.length === 0 && preselectedStaffSlugs.length === 0) {
    notFound();
  }

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
