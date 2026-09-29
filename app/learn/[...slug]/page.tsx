import fs from "fs/promises";
import path from "path";
import { compileMDX } from "next-mdx-remote/rsc";

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
  });

  return (
    <main
      className="

        /* --- Prose --- */
        prose
        dark:prose-invert
        max-w-none

        prose-h1:border-b
        prose-h1:border-gray-800
        prose-h1:pb-3

        prose-h2:border-b
        prose-h2:border-gray-800
        prose-h2:pb-2

        prose-h3:border-b
        prose-h3:border-gray-800
        prose-h3:pb-2


        /* --- Content --- */
        p-10
      "
    >
      {content}
    </main>
  );
}
