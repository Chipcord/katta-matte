"use client";

import { usePathname } from "next/navigation";
import SidebarLink from "./SidebarLink";

type Lesson = {
  title: string;
  href: string;
};

export default function SidebarChapter({
  title,
  lessons,
}: {
  title: string;
  lessons: Lesson[];
}) {
  const pathname = usePathname();

  const isCurrentChapter = lessons.some(
    (lesson) => lesson.href === pathname
  );

  return (
    <details
      open={isCurrentChapter}
      className="group"
    >
      <summary
        className="
          cursor-pointer
          list-none
          font-bold
          px-2
          py-1
          mb-1
          hover:bg-[var(--sidebar-hover)]
          rounded-md
        "
      >
        <span
          className="
            inline-block
            w-2
            h-2
            mr-2
            border-r-2
            border-b-2
            border-[var(--sidebar-foreground)]
            rotate-[-45deg]
            rounded-[1px]
            group-open:rotate-45
          "
        />

        {title}
      </summary>

      <div>
        {lessons.map((lesson) => (
          <SidebarLink key={lesson.href} href={lesson.href}>
            {lesson.title}
          </SidebarLink>
        ))}
      </div>
    </details>
  );
}
