import { describe, it, expect, vi } from "vitest";
import {
  streamPrompt,
  setUpCompletionForStream,
  parseMarkdownToCompletions,
  readStream,
} from "../index";
import { generateMockMarkdown } from "./mocks/mockMd";

vi.mock("openai", () => {
  return {
    default: class {
      chat = {
        completions: {
          create: vi.fn().mockResolvedValue({
            async *[Symbol.asyncIterator]() {
              yield* parseMarkdownToCompletions(generateMockMarkdown());
            },
          }),
        },
      };
    },
  };
});

describe("streamPrompt", () => {
  it("should process streamed data correctly", async () => {
    const mockCompletion = await setUpCompletionForStream({
      OPENAI_API_KEY: "test-key",
    });
    const stream = streamPrompt(mockCompletion);
    expect(stream).toBeInstanceOf(ReadableStream);
    const result = await readStream(stream as ReadableStream);
    expect(result).toContain("- Bullet point");
    expect(result).toContain("# Heading ");
    expect(result).toContain("event: done");
  });
});
