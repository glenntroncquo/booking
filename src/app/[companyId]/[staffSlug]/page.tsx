import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SalonBooking } from "@/components/booking/SalonBooking";
import { resolveCompany } from "@/lib/booking";
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
    return { title: "Page not found", robots: { index: false } };
  }

  return {
    title: `Book at ${company.name}`,
    description: company.description ?? `Book an appointment at ${company.name}.`,
    robots: { index: true, follow: true },
  };
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
    <div className="min-h-screen bg-white px-4 py-8">
      <SalonBooking
        companyId={company.id}
        preselectedStaffIds={preselectedStaffIds}
        preselectedStaffSlugs={preselectedStaffSlugs}
      />
    </div>
  );
}
