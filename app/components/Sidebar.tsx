import fs from "fs";
import path from "path";
import Link from "next/link";

const contentPath = path.join(process.cwd(), "content", "learn");

function getLessonTitle(filePath: string) {
  const content = fs.readFileSync(filePath, "utf8");

  const match = content.match(/^# (.+)$/m);

  return match ? match[1] : path.basename(filePath, ".mdx");
}

function getChapterTitle(chapterPath: string) {
  const metadataPath = path.join(chapterPath, "_chapter.json");

  const metadata = JSON.parse(
    fs.readFileSync(metadataPath, "utf8")
  );

  return metadata.title;
}

export default function Sidebar() {
  const courses = fs.readdirSync(contentPath);

  return (
    <nav>
      {courses.map((course) => {
        const coursePath = path.join(contentPath, course);

        const chapters = fs
          .readdirSync(coursePath, { withFileTypes: true })
          .filter((item) => item.isDirectory());

        return (
          <div key={course}>
            <h2>{course}</h2>

            {chapters.map((chapter) => {
              const chapterPath = path.join(
                coursePath,
                chapter.name
              );

              const chapterTitle =
                getChapterTitle(chapterPath);

              const lessons = fs
                .readdirSync(chapterPath)
                .filter((file) => file.endsWith(".mdx"))
                .sort();

              return (
                <div key={chapter.name}>
                  <h3>{chapterTitle}</h3>

                  {lessons.map((lesson) => {
                    const filePath = path.join(
                      chapterPath,
                      lesson
                    );

                    const title = getLessonTitle(filePath);

                    const lessonName = lesson.replace(
                      ".mdx",
                      ""
                    );

                    return (
                      <div key={lesson}>
                        <Link
                          href={`/learn/${course}/${chapter.name}/${lessonName}`}
                        >
                          {title}
                        </Link>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}
