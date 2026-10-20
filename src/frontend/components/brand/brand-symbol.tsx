import type { BrandMarkProps } from "./brand-mark";

/** The dial alone. Not called Symbol, which would shadow JavaScript's Symbol. Generated from docs/logos/vauclair-symbole.svg. */
export function BrandSymbol({
  className,
  monochrome = false,
  label = "Maison Vauclair",
  decorative = false,
}: BrandMarkProps) {
  const accent = monochrome ? "currentColor" : "#D52B1E";
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      {...(decorative
        ? { "aria-hidden": true }
        : { role: "img", "aria-label": label })}
      className={className}
    >
      <g aria-hidden="true">
        <circle
          cx="50"
          cy="50"
          r="47"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <line
          x1="70"
          y1="15.36"
          x2="72"
          y2="11.89"
          stroke="currentColor"
          strokeWidth="1.1"
        />
        <line
          x1="84.64"
          y1="30"
          x2="88.11"
          y2="28"
          stroke="currentColor"
          strokeWidth="1.1"
        />
        <line
          x1="87.5"
          y1="50"
          x2="94"
          y2="50"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <line
          x1="84.64"
          y1="70"
          x2="88.11"
          y2="72"
          stroke="currentColor"
          strokeWidth="1.1"
        />
        <line
          x1="70"
          y1="84.64"
          x2="72"
          y2="88.11"
          stroke="currentColor"
          strokeWidth="1.1"
        />
        <line
          x1="50"
          y1="87.5"
          x2="50"
          y2="94"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <line
          x1="30"
          y1="84.64"
          x2="28"
          y2="88.11"
          stroke="currentColor"
          strokeWidth="1.1"
        />
        <line
          x1="15.36"
          y1="70"
          x2="11.89"
          y2="72"
          stroke="currentColor"
          strokeWidth="1.1"
        />
        <line
          x1="12.5"
          y1="50"
          x2="6"
          y2="50"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <line
          x1="15.36"
          y1="30"
          x2="11.89"
          y2="28"
          stroke="currentColor"
          strokeWidth="1.1"
        />
        <line
          x1="30"
          y1="15.36"
          x2="28"
          y2="11.89"
          stroke="currentColor"
          strokeWidth="1.1"
        />
        <polygon
          points="25,24 33,24 53,70.4 73,24 75,24 50,82"
          fill="currentColor"
        />
        <circle cx="50" cy="8.5" r="3" fill={accent} />
      </g>
    </svg>
  );
}
