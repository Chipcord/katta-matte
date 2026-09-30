import fs from "fs/promises";
import path from "path";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import Link from "next/link";

export default async function HomePage() {
  const filePath = path.join(
    process.cwd(),
    "content",
    "home.mdx"
  );

  const source = await fs.readFile(filePath, "utf8");

  const { content } = await compileMDX({
    source,
    components: { Link },
    options: {
      mdxOptions: {
        remarkPlugins: [remarkMath],
        rehypePlugins: [rehypeKatex],
      },
    },
  });

  return (
    <div className="flex justify-center">
      <main
        className="
          prose
          max-w-5xl
          p-10

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

          prose-p:text-[var(--foreground)]

          prose-a:text-[var(--link)]

          prose-code:text-[var(--code-foreground)]
          prose-code:bg-[var(--code-background)]

          prose-pre:bg-[var(--code-background)]
          prose-pre:text-[var(--code-foreground)]

          prose-blockquote:text-[var(--muted)]
          prose-blockquote:not-italic
          [&_:is(blockquote,p)::before]:content-['']
          [&_:is(blockquote,p)::after]:content-['']

          prose-hr:border-[var(--border)]

          prose-li:text-[var(--foreground)]
          prose-strong:text-[var(--foreground)]

          [&_.katex]:text-[var(--foreground)]
          [&_.katex-display]:my-6
          [&_.katex-display]:rounded-lg
          [&_.katex-display]:bg-[var(--code-background)]
          [&_.katex-display]:p-6
        "
      >
        {content}
      </main>
    </div>
  );
}
