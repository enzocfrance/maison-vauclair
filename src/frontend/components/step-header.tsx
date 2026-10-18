import Link from "next/link";
import { ArrowLeftIcon } from "./icons";

type StepHeaderProps = {
  backHref: string;
  backLabel: string;
  eyebrow: string;
  title: string;
};

export function StepHeader({
  backHref,
  backLabel,
  eyebrow,
  title,
}: StepHeaderProps) {
  return (
    <div className="border-b border-line">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-2 px-3 py-2.5 sm:px-5">
        <Link
          href={backHref}
          className="-ml-1 flex size-11 shrink-0 items-center justify-center"
        >
          <ArrowLeftIcon className="size-[1.375rem]" />
          <span className="sr-only">{backLabel}</span>
        </Link>
        <div className="flex flex-col gap-0.5">
          <p className="label-caps text-muted">{eyebrow}</p>
          <h1 className="text-2xl font-light tracking-[-0.02em]">{title}</h1>
        </div>
      </div>
    </div>
  );
}
