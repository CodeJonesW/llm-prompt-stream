import { describe, it, expect } from "vitest";
import { streamPrompt, readStream } from "../index";
import { generateMockMarkdown } from "./mocks/mockMd";

async function* stringChunks(text: string, chunkSize = 80): AsyncIterable<string> {
  for (let i = 0; i < text.length; i += chunkSize) {
    yield text.slice(i, i + chunkSize);
  }
}

describe("streamPrompt", () => {
  it("should process basic markdown (headings, bullets, numbered lists)", async () => {
    const md = generateMockMarkdown();
    const stream = streamPrompt(stringChunks(md));
    expect(stream).toBeInstanceOf(ReadableStream);

    const result = await readStream(stream as ReadableStream);
    expect(result).toContain("- Bullet point");
    expect(result).toContain("# Heading ");
    expect(result).toContain("event: done");
  });

  it("should emit code blocks as complete chunks", async () => {
    const md = [
      "Some intro text.\n",
      "```js\n",
      "const x = 1;\n",
      "```\n",
      "After code.\n",
    ].join("");

    const chunks: string[] = [];
    const stream = streamPrompt(stringChunks(md, 10))!;
    const reader = stream.getReader();
    const decoder = new TextDecoder();

    let done = false;
    while (!done) {
      const { value, done: d } = await reader.read();
      done = d;
      if (value) chunks.push(decoder.decode(value, { stream: true }));
    }

    // Find the chunk containing the code block — it should have both opening and closing fences
    const codeChunk = chunks.find((c) => c.includes("```js"));
    expect(codeChunk).toBeDefined();
    expect(codeChunk).toContain("```js");
    expect(codeChunk).toContain("const x = 1;");
    expect(codeChunk).toContain("```");
  });

  it("should emit table rows as a single chunk", async () => {
    const md = [
      "## Table\n\n",
      "| A | B |\n",
      "|---|---|\n",
      "| 1 | 2 |\n",
      "| 3 | 4 |\n",
      "\nAfter table.\n",
    ].join("");

    const chunks: string[] = [];
    const stream = streamPrompt(stringChunks(md, 10))!;
    const reader = stream.getReader();
    const decoder = new TextDecoder();

    let done = false;
    while (!done) {
      const { value, done: d } = await reader.read();
      done = d;
      if (value) chunks.push(decoder.decode(value, { stream: true }));
    }

    // Find the chunk that contains table rows — all rows should be together
    const tableChunk = chunks.find(
      (c) => c.includes("| A | B |") && c.includes("| 3 | 4 |")
    );
    expect(tableChunk).toBeDefined();
  });

  it("should handle blockquotes", async () => {
    const md = [
      "# Title\n\n",
      "> This is a quote.\n",
      "> Second line of quote.\n",
      "\nNormal text.\n",
    ].join("");

    const stream = streamPrompt(stringChunks(md, 10));
    const result = await readStream(stream as ReadableStream);
    expect(result).toContain("> This is a quote.");
    expect(result).toContain("> Second line of quote.");
    expect(result).toContain("event: done");
  });

  it("should end the stream with event: done", async () => {
    async function* simple(): AsyncIterable<string> {
      yield "Hello world.\n";
    }

    const stream = streamPrompt(simple());
    const result = await readStream(stream as ReadableStream);
    expect(result).toContain("event: done");
  });
});
