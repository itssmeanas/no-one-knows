// components/ui/Card.tsx

import type { HTMLAttributes, ReactNode } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

type CardVariant = "default" | "glass" | "elevated" | "danger";
type CardPadding = "none" | "sm" | "md" | "lg";

const variantClasses: Record<CardVariant, string> = {
  default: "border border-white/10 bg-white/[0.045] shadow-inner-secret",
  glass:
    "glass-panel",
  elevated:
    "border border-white/10 bg-white/[0.07] shadow-[0_24px_80px_rgba(0,0,0,0.38)] backdrop-blur-xl",
  danger:
    "border border-rose-400/25 bg-rose-500/10 shadow-[0_24px_80px_rgba(127,29,29,0.2)]"
};

const paddingClasses: Record<CardPadding, string> = {
  none: "p-0",
  sm: "p-4",
  md: "p-5 sm:p-6",
  lg: "p-6 sm:p-8"
};

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
};

export function Card({
  children,
  variant = "default",
  padding = "md",
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={twMerge(
        clsx(
          "rounded-4xl",
          variantClasses[variant],
          paddingClasses[padding],
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export type CardHeaderProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function CardHeader({ children, className, ...props }: CardHeaderProps) {
  return (
    <div className={twMerge(clsx("mb-5 space-y-2", className))} {...props}>
      {children}
    </div>
  );
}

export type CardTitleProps = HTMLAttributes<HTMLHeadingElement> & {
  children: ReactNode;
};

export function CardTitle({ children, className, ...props }: CardTitleProps) {
  return (
    <h2
      className={twMerge(
        clsx(
          "font-serif text-2xl font-semibold tracking-tight text-white",
          className
        )
      )}
      {...props}
    >
      {children}
    </h2>
  );
}

export type CardDescriptionProps = HTMLAttributes<HTMLParagraphElement> & {
  children: ReactNode;
};

export function CardDescription({
  children,
  className,
  ...props
}: CardDescriptionProps) {
  return (
    <p
      className={twMerge(clsx("text-sm leading-6 text-zinc-400", className))}
      {...props}
    >
      {children}
    </p>
  );
}

export type CardContentProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function CardContent({ children, className, ...props }: CardContentProps) {
  return (
    <div className={twMerge(clsx("space-y-5", className))} {...props}>
      {children}
    </div>
  );
}

export type CardFooterProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function CardFooter({ children, className, ...props }: CardFooterProps) {
  return (
    <div
      className={twMerge(
        clsx(
          "mt-6 flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between",
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
}