// app/archive/ArchiveFilters.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CategoryChip } from "@/components/CategoryChip";
import { confessionCategories } from "@/lib/categories";
import type { ConfessionCategory } from "@/lib/types";

export type ArchiveFiltersProps = {
  selectedCategory: ConfessionCategory | null;
};

function getCategoryHref(pathname: string, category: ConfessionCategory | null): string {
  if (!category) {
    return pathname;
  }

  const searchParams = new URLSearchParams();
  searchParams.set("category", category);

  return `${pathname}?${searchParams.toString()}`;
}

export function ArchiveFilters({ selectedCategory }: ArchiveFiltersProps) {
  const pathname = usePathname();

  return (
    <section
      aria-label="Archive filters"
      className="rounded-4xl border border-white/10 bg-white/[0.035] p-4 shadow-inner-secret backdrop-blur"
    >
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-300">
            Filter by room
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Choose the kind of truth you want to read.
          </p>
        </div>

        {selectedCategory ? (
          <Link
            href={getCategoryHref(pathname, null)}
            className="text-sm font-medium text-veil-300 transition hover:text-white"
          >
            Clear filter
          </Link>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href={getCategoryHref(pathname, null)}>
          <CategoryChip category="All confessions" active={!selectedCategory} />
        </Link>

        {confessionCategories.map((category) => (
          <Link key={category} href={getCategoryHref(pathname, category)}>
            <CategoryChip category={category} active={selectedCategory === category} />
          </Link>
        ))}
      </div>
    </section>
  );
}