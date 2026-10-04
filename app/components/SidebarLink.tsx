"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SidebarLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isSelected = pathname === href;

  return (
    <Link
      href={href}
      className={`
        block
        p-1.5
        pl-3
        rounded-md
        border-l-3
        ml-3
        ${
          isSelected
            ? "border-[var(--sidebar-selected-accent)] bg-[var(--sidebar-selected)] rounded-l-xs"
            : "border-transparent hover:bg-[var(--sidebar-hover)]"
        }
      `}
    >
      {children}
    </Link>
  );
}
