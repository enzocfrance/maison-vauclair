import { Seal } from "@/frontend/components/brand";

type MessageCardProps = {
  message: string;
  /** Shown when the buyer left no message. */
  emptyLabel: string;
  lang: string;
};

/** The card slipped into the box, shown as the object itself: A6, a fine rule, a seal. */
export function MessageCard({ message, emptyLabel, lang }: MessageCardProps) {
  return (
    <div
      lang={lang}
      className="flex aspect-[105/148] w-full max-w-[18rem] flex-col items-center justify-between border border-ink bg-white px-7 pt-12 pb-7"
    >
      <p
        className={`my-auto text-center text-lg leading-relaxed font-light italic ${
          message ? "text-ink" : "text-muted"
        }`}
      >
        {message || emptyLabel}
      </p>
      <Seal decorative className="size-12 text-ink" />
    </div>
  );
}
