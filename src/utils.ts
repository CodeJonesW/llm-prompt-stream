import fs from "fs";
import path from "path";

export const streamPrompt = (source: AsyncIterable<string>) => {
  let buffer = "";
  let inCodeBlock = false;
  let codeBlockBuffer = "";
  let tableBuffer = "";
  let inTable = false;

  const isTableRow = (line: string) => {
    const trimmed = line.trim();
    return (
      trimmed.startsWith("|") &&
      trimmed.endsWith("|") &&
      trimmed.length > 1
    );
  };

  const isFenceLine = (line: string) => line.trimStart().startsWith("```");

  try {
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        const emit = (text: string) => {
          if (text) controller.enqueue(encoder.encode(text));
        };

        const flushTable = () => {
          if (tableBuffer) {
            emit(tableBuffer);
            tableBuffer = "";
            inTable = false;
          }
        };

        const processLine = (line: string) => {
          // Inside a code block: accumulate until closing fence
          if (inCodeBlock) {
            codeBlockBuffer += line;
            if (isFenceLine(line) && codeBlockBuffer !== line) {
              // This is the closing fence — emit the entire code block
              inCodeBlock = false;
              flushTable();
              emit(codeBlockBuffer);
              codeBlockBuffer = "";
            }
            return;
          }

          // Opening code fence
          if (isFenceLine(line)) {
            flushTable();
            inCodeBlock = true;
            codeBlockBuffer = line;
            return;
          }

          // Table row
          if (isTableRow(line)) {
            inTable = true;
            tableBuffer += line;
            return;
          }

          // Non-table line while we were accumulating a table
          if (inTable) {
            flushTable();
          }

          emit(line);
        };

        for await (const content of source) {
          if (!content) continue;
          buffer += content;

          // Process all complete lines (ending with \n)
          let newlineIdx: number;
          while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
            const line = buffer.slice(0, newlineIdx + 1);
            buffer = buffer.slice(newlineIdx + 1);
            processLine(line);
          }
        }

        // Process any remaining partial line
        if (buffer) {
          processLine(buffer);
        }

        // Flush any remaining buffered content
        if (inCodeBlock && codeBlockBuffer) {
          emit(codeBlockBuffer);
        }
        flushTable();

        emit("event: done\n\n");
        controller.close();
      },
    });
    return stream;
  } catch (e) {
    console.log(e);
  }
};

export async function readStream(
  stream: ReadableStream,
  createFile: boolean = false,
  outputFilename: string = "response.md",
  logInfo: boolean = false
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
      if (logInfo) {
        console.log(chunk);
      }
      fullResponse += chunk;
      if (createFile && fileStream) {
        fileStream.write(chunk);
      }
    }
  }
  if (fileStream) {
    fileStream.end();
  }
  if (logInfo) {
    console.log("Full Stream Response: ", fullResponse);
  }
  return fullResponse;
}
