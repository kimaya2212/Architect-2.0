import React from "react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ds/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ac-base px-6 text-center">
      <div className="absolute inset-0 bg-grid bg-radial-fade opacity-30" />
      <div className="relative animate-fade-up">
        <Logo />
        <div className="mt-10 font-mono text-[64px] font-semibold tracking-tight text-ac-text">404</div>
        <h1 className="mt-2 text-[20px] font-semibold text-ac-text">This page went off-script</h1>
        <p className="mt-2 max-w-sm text-[14px] text-ac-text-muted">The page you're after doesn't exist, or it moved. Let's get you back to building.</p>
        <div className="mt-6 flex items-center justify-center gap-2">
          <Link to="/home"><Button variant="primary" size="md">Go to Home</Button></Link>
          <Link to="/"><Button variant="secondary" size="md">Back to landing</Button></Link>
        </div>
      </div>
    </div>
  );
}
