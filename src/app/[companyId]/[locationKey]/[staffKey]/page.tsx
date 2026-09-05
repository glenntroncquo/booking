import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SalonBooking } from "@/components/booking/SalonBooking";
import {
  buildCompanyMetadata,
  classifyRouteKey,
  dedupe,
  locationEmbedFromKey,
  parseList,
  resolveCompany,
  staffEmbedFromKey,
} from "@/lib/booking";

type PageProps = {
  params: Promise<{
    companyId: string;
    locationKey: string;
    staffKey: string;
  }>;
  /** service is a short alias for serviceIds. No treatmentId / priceOptionId. */
  searchParams: Promise<{
    service?: string | string[];
    serviceIds?: string | string[];
    serviceVariantIds?: string | string[];
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

export default async function LocationStaffBookingPage({
  params,
  searchParams,
}: PageProps) {
  const { companyId, locationKey, staffKey } = await params;
  const { service, serviceIds, serviceVariantIds } = await searchParams;

  const company = await resolveCompany(companyId);
  if (!company) {
    notFound();
  }

  const location = classifyRouteKey(locationKey);
  const staff = classifyRouteKey(staffKey);
  if (!location || !staff) {
    notFound();
  }

  const preselectedServiceIds = dedupe([
    ...parseList(service),
    ...parseList(serviceIds),
  ]);
  const preselectedServiceVariantIds = dedupe(parseList(serviceVariantIds));

  return (
    <div className="booking-shell">
      <SalonBooking
        companyId={company.id}
        {...locationEmbedFromKey(location)}
        {...staffEmbedFromKey(staff)}
        preselectedServiceIds={preselectedServiceIds}
        preselectedServiceVariantIds={preselectedServiceVariantIds}
      />
    </div>
  );
}
