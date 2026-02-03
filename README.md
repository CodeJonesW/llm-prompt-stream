# llm-prompt-stream

A Node.js/TypeScript library that streams OpenAI API responses while keeping markdown formatting intact. The core problem it solves: when you stream LLM responses token-by-token, markdown syntax can break mid-render. This library buffers content intelligently and only flushes complete markdown elements.

## Key Architecture

- **`streamPrompt()`** — The main function. Takes an OpenAI completion stream, buffers chunks, and splits on markdown boundaries (headings, bullet points, numbered lists, newlines) using a lookahead regex. Returns a `ReadableStream`.
- **`setUpCompletionForStream()`** — Sets up the OpenAI client and creates a streaming completion with `gpt-4o-mini`.
- **`createCompletionAndStream()`** — Convenience wrapper combining setup + streaming.
- **`readStream()`** — Consumes a stream, optionally writes to a file, and returns the full response as a string. Supports a `logInfo` flag for console output.
- **`parseMarkdownToCompletions()`** — A generator that converts markdown into mock OpenAI chunks for testing.

## Tech Stack

TypeScript, tsup (dual ESM/CJS build), Vitest for testing, OpenAI SDK.

## Installation

Install via npm:

```sh
npm install llm-prompt-stream
```

## Usage

### Basic Example: Streaming an OpenAI Completion

```ts
import { createCompletionAndStream, readStream } from "llm-prompt-stream";

const openAIKey = "your-api-key";

const messages = [
  { role: "system", content: "You are a helpful assistant." },
  { role: "user", content: "Tell me a fun fact!" },
];

async function run() {
  const stream = await createCompletionAndStream(openAIKey, messages);
  const response = await readStream(stream);
  console.log("Full Response:", response);
}

run();
```

### Saving Streamed Response to a Markdown File

```ts
import { createCompletionAndStream, readStream } from "llm-prompt-stream";

const openAIKey = "your-api-key";
const messages = [{ role: "user", content: "Give me a summary of AI." }];

async function run() {
  const stream = await createCompletionAndStream(openAIKey, messages);
  await readStream(stream, true, "output.md");
  console.log("Response saved to output.md!");
}

run();
```

## Current State

- Stable with a clear public API exported from `src/index.ts` via `src/utils.ts`
- Basic test coverage mocking the OpenAI SDK with a 10,000-line markdown generator
- Published as a package with type definitions
- Dual format output (ESM + CommonJS) for broad compatibility

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
