import type { Metadata } from "next";
import { EmbedWidget } from "@/components/embed/EmbedWidget";
import { isValidCompanyId } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Booking widget",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{ companyId?: string; showStaff?: string }>;
};

export default async function WidgetPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const companyId = params.companyId ?? "";
  const showStaff = params.showStaff !== "false";

  if (!isValidCompanyId(companyId)) {
    return (
      <div className="p-6 text-center text-sm text-neutral-600">
        Missing or invalid companyId parameter.
      </div>
    );
  }

  return <EmbedWidget companyId={companyId} showStaff={showStaff} />;
}
