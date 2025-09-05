import { CSSProperties, ElementType, ReactNode } from "react";
import clsx from "clsx";

type BoundedProps<T extends ElementType = "section"> = {
  as?: T;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

export function Bounded<T extends ElementType = "section">({
  as: Comp = "section" as T,
  className,
  children,
  ...restProps
}: BoundedProps<T>) {
  return (
    <Comp
      className={clsx(
        "px-6 ~py-10/16 [.header+&]:pt-44 [.header+&]:md:pt-32",
        className,
      )}
      {...restProps}
    >
      <div className="mx-auto w-full max-w-6xl">{children}</div>
    </Comp>
  );
}
