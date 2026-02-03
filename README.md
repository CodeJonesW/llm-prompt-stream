# llm-prompt-stream

A provider-agnostic, markdown-aware stream buffer for LLM responses. The core problem it solves: when you stream LLM responses token-by-token, markdown syntax can break mid-render. This library buffers content intelligently and only flushes complete markdown elements.

Works with any LLM provider — OpenAI, Anthropic, Google, or any source that produces an async iterable of strings.

## Key Architecture

- **`streamPrompt(source)`** — Takes any `AsyncIterable<string>` and returns a `ReadableStream`. Buffers chunks and splits on markdown boundaries so you never get a half-rendered heading or broken code block.
- **`readStream(stream)`** — Consumes a `ReadableStream`, optionally writes to a file, and returns the full response as a string. Supports a `logInfo` flag for console output.

## Markdown Constructs Handled

- **Headings** (`#`, `##`, `###`, `####`) — split before each heading
- **Bullet lists** (`- ` and `* `) — split before each item
- **Numbered lists** (`1. `, `2. `, etc.) — split before each item
- **Code blocks** (triple-backtick fences) — buffered and emitted as a single complete chunk
- **Tables** (`|`-delimited rows) — consecutive table rows are buffered and emitted together
- **Blockquotes** (`> ` prefix) — split correctly at blockquote boundaries

## Tech Stack

TypeScript, tsup (dual ESM/CJS build), Vitest for testing. Zero runtime dependencies.

## Installation

```sh
npm install llm-prompt-stream
```

## Usage

### With OpenAI

```ts
import OpenAI from "openai";
import { streamPrompt, readStream } from "llm-prompt-stream";

const openai = new OpenAI({ apiKey: "your-key" });

async function run() {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    stream: true,
    messages: [{ role: "user", content: "Explain closures in JS" }],
  });

  // Extract text from OpenAI chunks and pass as AsyncIterable<string>
  async function* textChunks() {
    for await (const chunk of completion) {
      const text = chunk.choices[0]?.delta?.content;
      if (text) yield text;
    }
  }

  const stream = streamPrompt(textChunks());
  const response = await readStream(stream!);
  console.log(response);
}

run();
```

### With Anthropic

```ts
import Anthropic from "@anthropic-ai/sdk";
import { streamPrompt, readStream } from "llm-prompt-stream";

const client = new Anthropic({ apiKey: "your-key" });

async function run() {
  const stream = client.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [{ role: "user", content: "Explain closures in JS" }],
  });

  async function* textChunks() {
    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        yield event.delta.text;
      }
    }
  }

  const mdStream = streamPrompt(textChunks());
  const response = await readStream(mdStream!);
  console.log(response);
}

run();
```

### Generic AsyncIterable

```ts
import { streamPrompt, readStream } from "llm-prompt-stream";

async function* mySource(): AsyncIterable<string> {
  yield "# Hello\n\n";
  yield "This is ";
  yield "streamed markdown.\n";
}

const stream = streamPrompt(mySource());
const response = await readStream(stream!);
console.log(response);
```

### Saving Response to a File

```ts
import { streamPrompt, readStream } from "llm-prompt-stream";

// ... set up your source as above
const stream = streamPrompt(source());
await readStream(stream!, true, "output.md");
console.log("Response saved to output.md!");
```

## Running Tests

```sh
npm test
```

## License

This project is licensed under the MIT License.

## Contributing

Contributions are welcome! Feel free to open an issue or submit a PR.

1. Fork the repo
2. Clone it: `git clone https://github.com/yourusername/llm-prompt-stream.git`
3. Install dependencies: `npm install`
4. Make changes & commit
5. Submit a pull request
