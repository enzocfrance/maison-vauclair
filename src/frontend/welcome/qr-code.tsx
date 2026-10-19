import type { WelcomeCard } from "@/shared/welcome";

type QrCodeProps = {
  matrix: WelcomeCard["qr"];
  label: string;
  className?: string;
};

/** Quiet zone around the modules, so phones find the code on the printed card. */
const margin = 3;

export function QrCode({ matrix, label, className }: QrCodeProps) {
  const extent = matrix.size + margin * 2;
  return (
    <svg
      role="img"
      aria-label={label}
      viewBox={`${-margin} ${-margin} ${extent} ${extent}`}
      shapeRendering="crispEdges"
      className={className}
    >
      <rect
        x={-margin}
        y={-margin}
        width={extent}
        height={extent}
        fill="#ffffff"
      />
      <path d={matrix.path} fill="currentColor" />
    </svg>
  );
}
