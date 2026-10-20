type BoxDialProps = {
  count: number;
  capacity: number;
  /** Spoken description; omit it when another dial on the page already speaks. */
  label?: string;
  className?: string;
};

/**
 * The box as a watch dial: one index per place, set like the hours from noon.
 * Each product fills an index; the count sits in the middle.
 */
export function BoxDial({ count, capacity, label, className }: BoxDialProps) {
  const isOver = count > capacity;

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      {...(label
        ? { role: "img", "aria-label": label }
        : { "aria-hidden": true })}
    >
      <circle
        cx="50"
        cy="50"
        r="47"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      />
      {Array.from({ length: capacity }, (_, index) => (
        <rect
          key={index}
          x="48"
          y="9"
          width="4"
          height="13"
          stroke="currentColor"
          strokeWidth="1"
          transform={`rotate(${(index * 360) / capacity} 50 50)`}
          className={`transition-[fill] duration-200 motion-reduce:transition-none ${
            index < count ? "fill-current" : "fill-white"
          }`}
        />
      ))}
      <text
        x="50"
        y="51"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="22"
        className={`font-light tabular-nums ${isOver ? "fill-accent" : "fill-current"}`}
      >
        {count}/{capacity}
      </text>
    </svg>
  );
}
