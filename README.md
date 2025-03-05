# 📜 llm-prompt-stream

A lightweight Node.js module for streaming OpenAI responses with Markdown formatting and file saving support.

## 🚀 Features

- ✅ **Streaming OpenAI responses** in real-time.
- ✅ **Markdown support** for structured responses.
- ✅ **Write streamed responses to a file**.
- ✅ **Mock data support** for testing.

## 📦 Installation

Install via npm:

\`\`\`sh
npm install llm-prompt-stream
\`\`\`

## 🔧 Usage

### **Basic Example: Streaming an OpenAI Completion**

\`\`\`ts
import { createCompletionAndStream, readStream } from "llm-prompt-stream";

// Your OpenAI API key
const openAIKey = "your-api-key";

const messages = [
{ role: "system", content: "You are a helpful assistant." },
{ role: "user", content: "Tell me a fun fact!" }
];

async function run() {
const stream = await createCompletionAndStream(openAIKey, messages);
const response = await readStream(stream);
console.log("Full Response:", response);
}

run();
\`\`\`

---

### **Saving Streamed Response to a Markdown File**

\`\`\`ts
import { createCompletionAndStream, readStream } from "llm-prompt-stream";

const openAIKey = "your-api-key";
const messages = [{ role: "user", content: "Give me a summary of AI." }];

async function run() {
const stream = await createCompletionAndStream(openAIKey, messages);
await readStream(stream, true, "output.md");
console.log("Response saved to output.md!");
}

run();
\`\`\`

---

## 🛠 API Reference

### \`createCompletionAndStream(openAIKey: string, messages: any[])\`

Creates an OpenAI streaming completion.

- **\`openAIKey\`** - Your OpenAI API key.
- **\`messages\`** - Array of message objects for the chat completion.

Returns: A **\`ReadableStream\`** containing the OpenAI response.

---

### \`readStream(stream: ReadableStream, createFile?: boolean, outputFilename?: string)\`

Reads and processes a streamed response.

- **\`stream\`** - The OpenAI response stream.
- **\`createFile\`** _(optional)_ - If \`true\`, writes response to a file.
- **\`outputFilename\`** _(optional)_ - Filename for the saved response (default: \`response.md\`).

Returns: A **string** containing the full response.

---

## 🧪 Running Tests

To run tests locally:

\`\`\`sh
npm test
\`\`\`

---

## 📜 License

This project is licensed under the **MIT License**.

---

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a PR.

1. Fork the repo
2. Clone it: \`git clone https://github.com/yourusername/llm-prompt-stream.git\`
3. Install dependencies: \`npm install\`
4. Make changes & commit
5. Submit a pull request!

---

## ⭐ Support

If you like this package, give it a ⭐ on GitHub!
