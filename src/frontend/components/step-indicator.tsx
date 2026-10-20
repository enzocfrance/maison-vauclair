type StepIndicatorProps = {
  /** 1 = size, 2 = filling, 3 = delivery. */
  current: 1 | 2 | 3;
  labels: readonly [string, string, string];
  label: string;
};

/** « 01 Taille — 02 Composition — 03 Livraison », with a 1 px progress rule. */
export function StepIndicator({ current, labels, label }: StepIndicatorProps) {
  return (
    <div>
      <div className="mx-auto w-full max-w-6xl px-5">
        <ol
          aria-label={label}
          className="flex flex-wrap items-center gap-x-2.5 gap-y-1 py-3 text-xs sm:gap-x-4 sm:text-[0.8125rem]"
        >
          {labels.map((text, index) => {
            const step = index + 1;
            const isCurrent = step === current;
            return (
              <li
                key={text}
                aria-current={isCurrent ? "step" : undefined}
                className={`flex items-center gap-2.5 sm:gap-4 ${isCurrent ? "text-ink" : "text-muted"}`}
              >
                {index > 0 && (
                  <span aria-hidden="true" className="text-muted">
                    —
                  </span>
                )}
                <span className="flex items-baseline gap-1.5">
                  <span className="font-light tabular-nums">
                    {String(step).padStart(2, "0")}
                  </span>
                  <span className={isCurrent ? "font-medium" : undefined}>
                    {text}
                  </span>
                </span>
              </li>
            );
          })}
        </ol>
      </div>
      <div aria-hidden="true" className="h-px bg-line">
        <div
          className="h-px bg-ink [view-transition-name:step-progress]"
          style={{ width: `${(current / labels.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
