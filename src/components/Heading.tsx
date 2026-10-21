import clsx from "clsx";

type HeadingProps = {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p";
  size?: "mega" | "xl" | "lg" | "md" | "sm" | "xs";
  children: React.ReactNode;
  className?: string;
  id?: string;
};

/** Condensed display heading on the fluid scale defined in globals.css (.t-*). */
export function Heading({ as: Comp = "h1", className, children, size = "lg", id }: HeadingProps) {
  return (
    <Comp id={id} className={clsx("font-display uppercase balance", `t-${size}`, className)}>
      {children}
    </Comp>
  );
}

/** Mono page-furniture label: "01 — The rack". */
export function Kicker({
  index,
  children,
  className,
}: {
  index?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={clsx("kicker flex items-center gap-3", className)}>
      {index ? (
        <span className="inline-grid min-w-[2.4em] place-items-center bg-ink px-1.5 py-0.5 text-paper">{index}</span>
      ) : null}
      <span>{children}</span>
    </p>
  );
}
