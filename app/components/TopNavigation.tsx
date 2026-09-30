"use client"

import Link from "next/link";

export default function TopNavigation() {
  return (
    <nav className="w-full h-16 static">

      <div className="fixed z-10 bg-[var(--muted)] border-b border-[var(--border)] w-full h-16 p-5 flex items-center justify-between">
        <Link href={"../../../"}>KattaMatte</Link>
        <Link href={"https://chip-studios.vercel.app/"}>© hm</Link>
      </div>
    </nav>
  );
}
