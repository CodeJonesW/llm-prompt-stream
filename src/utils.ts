import OpenAI from "openai";
import * as dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

export const openAIKey = process.env.OPENAI_API_KEY;

export const streamPrompt = (completion: any) => {
  let buffer = "";
  let rawTotalResponse = "";
  let totalFormattedResponse = "";

  try {
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        for await (const chunk of completion) {
          let content = chunk.choices[0]?.delta?.content;

          if (content) {
            rawTotalResponse += content;
            buffer += content;

            let lines = buffer.split(/(?=\n|^#{1,4}|\s-\s|\n\s\*\s|\n\d+\.\s)/);
            buffer = "";

            lines.forEach((line, index) => {
              if (index === lines.length - 1 && !line.endsWith("\n")) {
                buffer = line;
              } else {
                totalFormattedResponse += line;
                controller.enqueue(encoder.encode(line));
              }
            });
          }
        }

        if (buffer) {
          totalFormattedResponse += buffer;
          controller.enqueue(encoder.encode(buffer));
        }

        controller.enqueue(encoder.encode(`event: done\n\n`));

        controller.close();
      },
    });
    return stream;
  } catch (e) {
    console.log(e);
  }
};

export const setUpCompletionForStream = async (
  OPENAI_API_KEY: any,
  messages: any = []
) => {
  const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
  const completion = await openai.chat.completions.create({
    stream: true,
    messages: messages,
    model: "gpt-4o-mini",
  });
  return completion;
};

export function* parseMarkdownToCompletions(markdown: string) {
  const lines = markdown.split("\n");
  for (const line of lines) {
    if (line.trim()) {
      yield { choices: [{ delta: { content: line + "\n" } }] };
    }
  }
  yield { choices: [{ delta: { content: "" } }] };
}

export async function readStream(
  stream: ReadableStream,
  createFile: boolean = false,
  outputFilename: string = "response.md"
): Promise<string> {
  if (!stream || !(stream instanceof ReadableStream)) {
    throw new Error("❌ Invalid stream provided to readStream.");
  }

  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let fullResponse = "";

  const filePath = path.resolve(outputFilename);
  let fileStream = null;
  if (createFile) {
    fileStream = fs.createWriteStream(filePath, { encoding: "utf-8" });
  }

  let done = false;
  while (!done) {
    const { value, done: readerDone } = await reader.read();
    done = readerDone;

    if (value) {
      const chunk = decoder.decode(value, { stream: true });
      fullResponse += chunk;
      if (createFile && fileStream) {
        fileStream.write(chunk);
      }
    }
  }
  if (fileStream) {
    fileStream.end();
  }
  return fullResponse;
}
