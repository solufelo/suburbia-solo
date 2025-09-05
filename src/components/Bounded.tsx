import { CSSProperties, ReactNode, createElement } from "react";
import clsx from "clsx";

type BoundedProps<T extends keyof React.JSX.IntrinsicElements = "section"> = {
  as?: T;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
} & Omit<React.JSX.IntrinsicElements[T], "as" | "className" | "style" | "children">;

export function Bounded<T extends keyof React.JSX.IntrinsicElements = "section">({
  as,
  className,
  children,
  ...restProps
}: BoundedProps<T>) {
  const element = as || "section";
  return createElement(
    element,
    {
      className: clsx(
        "px-6 ~py-10/16 [.header+&]:pt-44 [.header+&]:md:pt-32",
        className,
      ),
      ...restProps,
    },
    <div className="mx-auto w-full max-w-6xl">{children}</div>
  );
}
