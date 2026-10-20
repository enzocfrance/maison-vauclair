import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { orderRepository } from "@/backend/container";
import { welcomeCardFor } from "@/backend/welcome/welcome-card";
import { ArrowLeftIcon } from "@/frontend/components/icons";
import { PrintButton } from "@/frontend/team/print-button";
import { teamTexts } from "@/frontend/team/team-texts";
import { WelcomeCardView } from "@/frontend/welcome/welcome-card-view";
import { teamPath } from "@/shared/i18n/routes";

type CardPageProps = {
  params: Promise<{ orderId: string }>;
};

export async function generateMetadata({
  params,
}: CardPageProps): Promise<Metadata> {
  const { orderId } = await params;
  return { title: `${teamTexts.cardPage.title} ${orderId}` };
}

export default async function CardPage({ params }: CardPageProps) {
  const { orderId } = await params;
  const order = await orderRepository.findById(orderId);
  const card = order ? welcomeCardFor(order) : null;
  if (!card) notFound();

  return (
    <main id="content" className="flex-1 px-4 py-8 print:p-0">
      <div className="mx-auto mb-6 flex w-full max-w-[105mm] flex-wrap items-center justify-between gap-4 print:hidden">
        <Link
          href={teamPath("order", { orderId })}
          className="flex min-h-11 items-center gap-2 text-sm"
        >
          <ArrowLeftIcon className="size-5" />
          <span className="link-draw">{teamTexts.cardPage.back}</span>
        </Link>
        <PrintButton label={teamTexts.cardPage.print} />
      </div>
      <WelcomeCardView card={card} />
    </main>
  );
}
