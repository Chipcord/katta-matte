import fs from "fs/promises";
import path from "path";
import { compileMDX } from "next-mdx-remote/rsc";
import TopicNavigation from "@/app/components/TopicNavigation";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

export default async function LearnPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;

  const filePath = path.join(
    process.cwd(),
    "content",
    "learn",
    ...slug
  ) + ".mdx";

  const source = await fs.readFile(filePath, "utf8");

  const { content } = await compileMDX({
      source,
      options: {
        mdxOptions: {
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
        },
      },
    });

  const currentPath = `/learn/${slug.join("/")}`;

  return (
    <>
      <main
        className="
          prose
          max-w-none
          p-10

          /* Headings */
          prose-headings:text-[var(--foreground)]

          prose-h1:border-b
          prose-h1:border-[var(--border)]
          prose-h1:pb-3

          prose-h2:border-b
          prose-h2:border-[var(--border)]
          prose-h2:pb-2

          prose-h3:border-b
          prose-h3:border-[var(--border)]
          prose-h3:pb-2

          /* Body */
          prose-p:text-[var(--foreground)]

          /* Links */
          prose-a:text-[var(--link)]

          /* Code */
          prose-code:text-[var(--code-foreground)]
          prose-code:bg-[var(--code-background)]

          prose-pre:bg-[var(--code-background)]
          prose-pre:text-[var(--code-foreground)]

          /* Muted */
          prose-blockquote:text-[var(--muted)]

          /* Borders */
          prose-hr:border-[var(--border)]

          /* Math */
          [&_.katex]:text-[var(--foreground)]
          [&_.katex-display]:my-6
          [&_.katex-display]:rounded-lg
          [&_.katex-display]:bg-[var(--code-background)]
          [&_.katex-display]:p-6
        "
      >
        {content}
      </main>
      <TopicNavigation currentPath={currentPath} />
    </>
  );
}
