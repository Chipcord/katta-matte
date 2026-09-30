import fs from "fs";
import path from "path";
import Link from "next/link";

const contentPath = path.join(
  process.cwd(),
  "content",
  "learn"
);

function getTopics() {
  const topics: string[] = [];

  const courses = fs
    .readdirSync(contentPath, { withFileTypes: true })
    .filter((item) => item.isDirectory())
    .sort((a, b) =>
      a.name.localeCompare(b.name, undefined, {
        numeric: true,
      })
    );

  for (const course of courses) {
    const coursePath = path.join(
      contentPath,
      course.name
    );

    const chapters = fs
      .readdirSync(coursePath, { withFileTypes: true })
      .filter((item) => item.isDirectory())
      .sort((a, b) =>
        a.name.localeCompare(b.name, undefined, {
          numeric: true,
        })
      );

    for (const chapter of chapters) {
      const chapterPath = path.join(
        coursePath,
        chapter.name
      );

      const lessons = fs
        .readdirSync(chapterPath)
        .filter((file) => file.endsWith(".mdx"))
        .sort((a, b) =>
          a.localeCompare(b, undefined, {
            numeric: true,
          })
        );

      for (const lesson of lessons) {
        const lessonName = lesson.replace(".mdx", "");

        topics.push(
          `/learn/${course.name}/${chapter.name}/${lessonName}`
        );
      }
    }
  }

  return topics;
}

export default function TopicNavigation({
  currentPath,
}: {
  currentPath: string;
}) {
  const topics = getTopics();

  const currentIndex = topics.indexOf(currentPath);

  const previousTopic =
    currentIndex > 0
      ? topics[currentIndex - 1]
      : null;

  const nextTopic =
    currentIndex >= 0 &&
    currentIndex < topics.length - 1
      ? topics[currentIndex + 1]
      : null;

  return (
    <nav
      className={`flex p-10 ${
        previousTopic && nextTopic
          ? "gap-3"
          : "justify-between"
      }`}
    >
      {previousTopic && (
        <Link
          className="text-center p-3 border shadow-sm border-[var(--border)] bg-[var(--button)] hover:bg-[var(--button-hover)] h-full w-full rounded-lg"
          href={previousTopic}
        >
          Forrige
        </Link>
      )}

      {nextTopic && (
        <Link
          className="text-center p-3 border shadow-sm border-[var(--border)] bg-[var(--button)] hover:bg-[var(--button-hover)] h-full w-full rounded-lg"
          href={nextTopic}
        >
          Neste
        </Link>
      )}
    </nav>
  );
}
