import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { orderRepository } from "@/backend/container";
import { ArrowLeftIcon } from "@/frontend/components/icons";
import { PreparationSheet } from "@/frontend/team/preparation-sheet";
import { PrintButton } from "@/frontend/team/print-button";
import { teamTexts } from "@/frontend/team/team-texts";
import { teamPath } from "@/shared/i18n/routes";

type SheetPageProps = {
  params: Promise<{ orderId: string }>;
};

export async function generateMetadata({
  params,
}: SheetPageProps): Promise<Metadata> {
  const { orderId } = await params;
  return { title: `${teamTexts.sheet.title} ${orderId}` };
}

export default async function SheetPage({ params }: SheetPageProps) {
  const { orderId } = await params;
  const order = await orderRepository.findById(orderId);
  if (!order) notFound();

  return (
    <main id="content" className="flex-1 px-4 py-8 print:p-0">
      <div className="mx-auto mb-6 flex w-full max-w-[210mm] flex-wrap items-center justify-between gap-4 print:hidden">
        <Link
          href={teamPath("orders")}
          className="flex min-h-11 items-center gap-2 text-sm underline-offset-4 hover:underline"
        >
          <ArrowLeftIcon className="size-5" />
          {teamTexts.sheet.back}
        </Link>
        <PrintButton label={teamTexts.sheet.print} />
      </div>
      <PreparationSheet order={order} />
    </main>
  );
}
