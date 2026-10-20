import type { Appellation } from "@/shared/catalog/appellation";

type AppellationStampProps = {
  appellation: Appellation;
};

/**
 * A round hallmark, like a mark struck into metal. Where it is shown, it
 * replaces the appellation in the name, so screen readers read it too.
 */
export function AppellationStamp({ appellation }: AppellationStampProps) {
  return (
    <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-ink text-[0.5rem] leading-none font-semibold tracking-[0.06em] text-ink uppercase">
      {appellation}
    </span>
  );
}
