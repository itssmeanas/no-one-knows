// components/ui/Button.tsx

import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import type { LinkProps } from "next/link";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-veil-300 disabled:pointer-events-none disabled:opacity-50";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-white text-ink-950 shadow-glow-pink hover:-translate-y-0.5 hover:bg-zinc-100",
  secondary:
    "border border-white/12 bg-white/[0.06] text-zinc-100 shadow-inner-secret backdrop-blur hover:-translate-y-0.5 hover:border-veil-300/40 hover:bg-white/[0.09]",
  ghost:
    "bg-transparent text-zinc-300 hover:bg-white/[0.06] hover:text-white",
  danger:
    "border border-rose-400/30 bg-rose-500/12 text-rose-100 shadow-inner-secret hover:-translate-y-0.5 hover:border-rose-300/50 hover:bg-rose-500/18"
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-10 px-4 py-2 text-sm",
  md: "min-h-12 px-5 py-3 text-sm",
  lg: "min-h-14 px-7 py-4 text-base"
};

type SharedButtonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

type NativeButtonProps = SharedButtonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: never;
  };

type LinkButtonProps = SharedButtonProps &
  LinkProps & {
    href: LinkProps["href"];
    type?: never;
    disabled?: never;
  };

export type ButtonProps = NativeButtonProps | LinkButtonProps;

function getButtonClassName({
  variant = "primary",
  size = "md",
  className
}: Pick<SharedButtonProps, "variant" | "size" | "className">) {
  return twMerge(clsx(baseClasses, variantClasses[variant], sizeClasses[size], className));
}

export function Button(props: ButtonProps) {
  const { children, variant = "primary", size = "md", className } = props;

  if ("href" in props) {
    const { href, replace, scroll, shallow, prefetch, locale, ...linkProps } = props;

    return (
      <Link
        href={href}
        replace={replace}
        scroll={scroll}
        shallow={shallow}
        prefetch={prefetch}
        locale={locale}
        className={getButtonClassName({ variant, size, className })}
        {...linkProps}
      >
        {children}
      </Link>
    );
  }

  const { type = "button", ...buttonProps } = props;

  return (
    <button
      type={type}
      className={getButtonClassName({ variant, size, className })}
      {...buttonProps}
    >
      {children}
    </button>
  );
}