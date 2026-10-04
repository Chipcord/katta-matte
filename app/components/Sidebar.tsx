import fs from "fs";
import path from "path";
import SidebarChapter from "./SidebarChapter";
import SidebarCourse from "./SidebarCourse";

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
    <nav
      className="
        text-[var(--sidebar-foreground)]
        border-r
        border-[var(--border)]
        pt-5
        h-screen
        cursor-default
        pt-20
      "
    >
      {courses.map((course) => {
        const coursePath = path.join(contentPath, course);

        const chapters = fs
          .readdirSync(coursePath, { withFileTypes: true })
          .filter((item) => item.isDirectory());

        return (
          <SidebarCourse key={course} course={course}>
            <div>
              <h2 className="text-2xl font-bold p-2 pl-5 mb-1 border-b border-[var(--border)]">
                {course + " Matte"}
              </h2>

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
                  <SidebarChapter
                    key={chapter.name}
                    title={chapterTitle}
                    lessons={lessons.map((lesson) => {
                      const filePath = path.join(
                        chapterPath,
                        lesson
                      );

                      const title = getLessonTitle(filePath);

                      const lessonName = lesson.replace(
                        ".mdx",
                        ""
                      );

                      return {
                        title,
                        href: `/learn/${course}/${chapter.name}/${lessonName}`,
                      };
                    })}
                  />
                );
              })}
            </div>
          </SidebarCourse>
        );
      })}
    </nav>
  );
}
