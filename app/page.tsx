import fs from "fs/promises";
import path from "path";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkMath from "remark-math";
import remarkMdx from "remark-mdx";
import rehypeKatex from "rehype-katex";
import Link from "next/link";
import Graph from "@/app/components/math/Graph";


export default async function HomePage() {
  const filePath = path.join(
    process.cwd(),
    "content",
    "home.mdx"
  );

  const source = await fs.readFile(filePath, "utf8");

  const { content } = await compileMDX({
    source,
    components: {
      Link,
      Graph,
    },
    options: {
      mdxOptions: {
        remarkPlugins: [
          remarkMdx,
          remarkMath,
        ],
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

          /* Headings */
          prose-headings:text-foreground

          prose-h1:border-b-(length:--content-border-width)
          prose-h1:border-(--border)
          prose-h1:pb-3

          prose-h2:border-b-(length:--content-border-width)
          prose-h2:border-(--border)
          prose-h2:pb-2

          prose-h3:border-b-(length:--content-border-width)
          prose-h3:border-(--border)
          prose-h3:pb-2

          /* Body */
          prose-p:text-foreground
          prose-strong:text-foreground

          /* Links */
          prose-a:text-(--link)

          /* Code */
          prose-code:text-(--block-foreground)
          prose-code:bg-(--block-background)

          prose-pre:bg-(--block-background)
          prose-pre:text-(--block-foreground)
          prose-pre:whitespace-pre-wrap
          prose-pre:wrap-break-word

          /* Blockquotes */
          prose-blockquote:text-(--muted)
          prose-blockquote:not-italic
          [&_:is(blockquote,p)::before]:content-['']
          [&_:is(blockquote,p)::after]:content-['']

          /* Borders */
          prose-hr:border-(length:--content-border-width)
          prose-hr:border-(--border)

          /* Lists */
          prose-li:text-foreground

          /* Math */
          [&_.katex]:text-(--foreground-accent)
          [&_.katex-display]:my-6
          [&_.katex-display]:rounded-lg
          [&_.katex-display]:bg-(--block-background)
          [&_.katex-display]:p-6
          [&_.katex-display_.katex]:text-(--block-foreground-accent)

          /* Buttons */
          [&_.button]:text-foreground
          [&_.button]:no-underline
          [&_.button-accent]:text-foreground
          [&_.button-accent]:no-underline
        "
      >
        {content}

        <div className="h-[10vw]"></div>
      </main>
    </div>
  );
}
