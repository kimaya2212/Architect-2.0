import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const base =
  "inline-flex items-center justify-center gap-2 font-medium rounded-md transition-colors duration-150 focus-ring disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap select-none";

const variants = {
  primary:
    "bg-ac-accent text-ac-accent-text hover:bg-ac-accent-hover border border-transparent",
  secondary:
    "bg-ac-elevated text-ac-text border border-ac-line hover:border-ac-line-strong hover:bg-ac-surface",
  ghost:
    "bg-transparent text-ac-text-secondary hover:text-ac-text hover:bg-ac-elevated border border-transparent",
  danger:
    "bg-transparent text-ac-danger border border-ac-line hover:bg-[color-mix(in_srgb,var(--ac-danger)_14%,transparent)] hover:border-ac-danger",
  outline:
    "bg-transparent text-ac-text border border-ac-line-strong hover:bg-ac-elevated",
};

const sizes = {
  sm: "h-8 px-3 text-[13px] min-w-8",
  md: "h-10 px-4 text-[14px] min-w-10",
  lg: "h-11 px-5 text-[15px] min-w-11",
  icon: "h-9 w-9 p-0",
  "icon-sm": "h-8 w-8 p-0",
};

export const Button = React.forwardRef(
  ({ className, variant = "secondary", size = "md", loading = false, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
