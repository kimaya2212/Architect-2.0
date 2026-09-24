import React from "react";
import { Logo } from "@/components/brand/Logo";

export function PageSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ac-base">
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <Logo showWord={false} size={28} />
        <div className="h-1 w-32 overflow-hidden rounded-full bg-ac-elevated">
          <div className="h-full w-1/2 animate-[shimmer_1.2s_infinite] rounded-full bg-ac-accent" />
        </div>
      </div>
    </div>
  );
}
