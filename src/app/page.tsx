import { notFound, redirect } from "next/navigation";
import { isValidCompanyId } from "@/lib/constants";

type PageProps = {
  searchParams: Promise<{ companyId?: string }>;
};

export default async function HomePage({ searchParams }: PageProps) {
  const { companyId } = await searchParams;

  if (companyId && isValidCompanyId(companyId)) {
    redirect(`/${companyId}`);
  }

  notFound();
}
