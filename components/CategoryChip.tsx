// components/CategoryChip.tsx

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Heart, KeyRound, Lie, Moon, RotateCcw, ShieldQuestion, UserRoundX } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

type CategoryChipVariant = "display" | "selectable";
type CategoryChipTone = "default" | "active";

const categoryIcons: Record<string, LucideIcon> = {
  "I still love them": Heart,
  "I lied": Lie,
  "I miss someone": Moon,
  "I regret it": RotateCcw,
  "I am scared": ShieldQuestion,
  "I feel alone": Moon,
  "I am pretending": UserRoundX,
  "I never told anyone": KeyRound,
  "I wish I could go back": RotateCcw,
  "I cannot forgive myself": ShieldQuestion,
  Other: KeyRound
};

const toneClasses: Record<CategoryChipTone, string> = {
  default:
    "border-white/10 bg-white/[0.045] text-zinc-300 hover:border-veil-300/35 hover:bg-white/[0.075] hover:text-white",
  active:
    "border-confession-pink/45 bg-confession-pink/14 text-pink-100 shadow-glow-pink"
};

type SharedCategoryChipProps = {
  category: string;
  variant?: CategoryChipVariant;
  active?: boolean;
  icon?: ReactNode;
  className?: string;
};

type DisplayCategoryChipProps = SharedCategoryChipProps & {
  variant?: "display";
};

type SelectableCategoryChipProps = SharedCategoryChipProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
    variant: "selectable";
  };

export type CategoryChipProps =
  | DisplayCategoryChipProps
  | SelectableCategoryChipProps;

function getChipClassName({
  active = false,
  className
}: Pick<SharedCategoryChipProps, "active" | "className">) {
  return twMerge(
    clsx(
      "inline-flex min-h-9 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition duration-200",
      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-veil-300",
      toneClasses[active ? "active" : "default"],
      className
    )
  );
}

function CategoryIcon({
  category,
  icon
}: Pick<SharedCategoryChipProps, "category" | "icon">) {
  if (icon) {
    return <span className="shrink-0">{icon}</span>;
  }

  const Icon = categoryIcons[category] ?? KeyRound;

  return <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />;
}

export function CategoryChip(props: CategoryChipProps) {
  const {
    category,
    variant = "display",
    active = false,
    icon,
    className
  } = props;

  const content = (
    <>
      <CategoryIcon category={category} icon={icon} />
      <span>{category}</span>
    </>
  );

  if (variant === "selectable") {
    const {
      category: _category,
      variant: _variant,
      active: _active,
      icon: _icon,
      className: _className,
      type = "button",
      ...buttonProps
    } = props;

    return (
      <button
        type={type}
        aria-pressed={active}
        className={getChipClassName({ active, className })}
        {...buttonProps}
      >
        {content}
      </button>
    );
  }

  return (
    <span className={getChipClassName({ active, className })}>
      {content}
    </span>
  );
}