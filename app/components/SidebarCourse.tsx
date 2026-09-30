"use client";

import { usePathname } from "next/navigation";

export default function SidebarCourse({
  course,
  children,
}: {
  course: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const currentCourse = pathname.split("/")[2];

  if (currentCourse !== course) {
    return null;
  }

  return <>{children}</>;
}
