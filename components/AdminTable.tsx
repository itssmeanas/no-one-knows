// components/AdminTable.tsx

import type { ReactNode } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Card } from "@/components/ui/Card";

export type AdminTableColumn<Row> = {
  key: string;
  header: ReactNode;
  render: (row: Row) => ReactNode;
  className?: string;
  headerClassName?: string;
};

export type AdminTableProps<Row> = {
  columns: ReadonlyArray<AdminTableColumn<Row>>;
  rows: ReadonlyArray<Row>;
  getRowKey: (row: Row) => string;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
};

export function AdminTable<Row>({
  columns,
  rows,
  getRowKey,
  emptyTitle = "No results found",
  emptyDescription = "Try changing your filters or search terms.",
  className
}: AdminTableProps<Row>) {
  if (rows.length === 0) {
    return (
      <Card variant="glass" className={className}>
        <div className="py-10 text-center">
          <h2 className="font-serif text-2xl font-semibold text-white">
            {emptyTitle}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-400">
            {emptyDescription}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="glass" padding="none" className={twMerge(clsx("overflow-hidden", className))}>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.035]">
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={twMerge(
                    clsx(
                      "whitespace-nowrap px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400",
                      column.headerClassName
                    )
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-white/10">
            {rows.map((row) => (
              <tr
                key={getRowKey(row)}
                className="bg-transparent transition hover:bg-white/[0.035]"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={twMerge(
                      clsx(
                        "align-top px-5 py-4 text-zinc-300",
                        column.className
                      )
                    )}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}