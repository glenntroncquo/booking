import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LocationUnavailable } from "@/components/booking/LocationUnavailable";
import { SalonBooking } from "@/components/booking/SalonBooking";
import {
  buildCompanyMetadata,
  dedupe,
  parseList,
  resolveCompany,
  resolveLocationPin,
  unverifiedLocationMetadata,
} from "@/lib/booking";

type PageProps = {
  params: Promise<{ companyId: string; locationKey: string }>;
  /** service is a short alias for serviceIds. No treatmentId / priceOptionId. */
  searchParams: Promise<{
    staff?: string | string[];
    staffIds?: string | string[];
    staffSlugs?: string | string[];
    service?: string | string[];
    serviceIds?: string | string[];
    serviceVariantIds?: string | string[];
  }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { companyId, locationKey } = await params;
  const company = await resolveCompany(companyId);
  if (!company) {
    return { title: "Pagina niet gevonden", robots: { index: false } };
  }

  const pin = await resolveLocationPin(company.id, locationKey);
  if (pin.status === "found") {
    return buildCompanyMetadata(company, { location: pin.location });
  }

  return unverifiedLocationMetadata(company);
}

export default async function LocationBookingPage({
  params,
  searchParams,
}: PageProps) {
  const { companyId, locationKey } = await params;
  const { staff, staffIds, staffSlugs, service, serviceIds, serviceVariantIds } =
    await searchParams;

  const company = await resolveCompany(companyId);
  if (!company) {
    notFound();
  }

  const pin = await resolveLocationPin(company.id, locationKey);
  if (pin.status === "invalid" || pin.status === "missing") {
    notFound();
  }
  if (pin.status === "unavailable") {
    return <LocationUnavailable companyName={company.name} />;
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
    <div className="booking-shell">
      <SalonBooking
        companyId={company.id}
        preselectedLocationId={pin.location.id}
        preselectedLocationSlug={pin.location.slug ?? undefined}
        preselectedStaffIds={preselectedStaffIds}
        preselectedStaffSlugs={preselectedStaffSlugs}
        preselectedServiceIds={preselectedServiceIds}
        preselectedServiceVariantIds={preselectedServiceVariantIds}
      />
    </div>
  );
}
