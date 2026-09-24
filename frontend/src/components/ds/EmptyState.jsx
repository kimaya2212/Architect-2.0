import React from "react";
import { cn } from "@/lib/utils";

export function EmptyState({ icon: Icon, title, description, action, className, testId }) {
  return (
    <div
      className={cn("flex flex-col items-center justify-center text-center py-16 px-6", className)}
      data-testid={testId}
    >
      {Icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[12px] border border-ac-line bg-ac-elevated">
          <Icon className="h-5 w-5 text-ac-text-secondary" strokeWidth={1.5} />
        </div>
      )}
      <h3 className="text-[16px] font-semibold text-ac-text tracking-[-0.01em]">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-[14px] text-ac-text-muted leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
