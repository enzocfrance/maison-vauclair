type IconProps = {
  className?: string;
};

function Icon({
  className,
  strokeWidth,
  path,
}: IconProps & { strokeWidth: number; path: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      className={className}
    >
      <path d={path} />
    </svg>
  );
}

export function ArrowRightIcon({ className }: IconProps) {
  return (
    <Icon
      className={className}
      strokeWidth={1.5}
      path="M4 12h16M14 6l6 6-6 6"
    />
  );
}

export function ArrowLeftIcon({ className }: IconProps) {
  return (
    <Icon
      className={className}
      strokeWidth={1.5}
      path="M20 12H4M10 6l-6 6 6 6"
    />
  );
}

export function CheckIcon({ className }: IconProps) {
  return <Icon className={className} strokeWidth={2} path="M5 12l5 5 9-10" />;
}

export function PlusIcon({ className }: IconProps) {
  return <Icon className={className} strokeWidth={2} path="M12 5v14M5 12h14" />;
}
