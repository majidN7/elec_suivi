"use client";

import { useState, type ReactNode } from "react";

export function ListeTabs({
  localeLabel,
  regionaleLabel,
  localeContent,
  regionaleContent,
}: {
  localeLabel: string;
  regionaleLabel: string;
  localeContent: ReactNode;
  regionaleContent: ReactNode;
}) {
  const [active, setActive] = useState<"LOCALE" | "REGIONALE">("LOCALE");

  return (
    <div>
      <div className="mb-4 inline-flex items-center gap-0.5 rounded-lg bg-slate-100 p-0.5 text-sm">
        {(
          [
            { key: "LOCALE" as const, label: localeLabel },
            { key: "REGIONALE" as const, label: regionaleLabel },
          ]
        ).map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActive(key)}
            className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors ${
              active === key
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div hidden={active !== "LOCALE"}>{localeContent}</div>
      <div hidden={active !== "REGIONALE"}>{regionaleContent}</div>
    </div>
  );
}
