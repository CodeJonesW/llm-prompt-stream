export const generateMockMarkdown = () => {
  let mockMarkdown = "";
  for (let i = 1; i <= 10000; i++) {
    if (i % 10 === 1) {
      mockMarkdown += `# Heading ${Math.ceil(i / 10)}\n\n`;
    } else if (i % 5 === 0) {
      mockMarkdown += `- Bullet point ${i}\n`;
    } else {
      mockMarkdown += `Line ${i}: This is a **mock** line for testing purposes.\n`;
    }
  }

  // Code block section
  mockMarkdown += `\n## Code Example\n\n`;
  mockMarkdown += "```typescript\n";
  mockMarkdown += `function hello() {\n`;
  mockMarkdown += `  console.log("Hello, world!");\n`;
  mockMarkdown += `}\n`;
  mockMarkdown += "```\n\n";

  // Table section
  mockMarkdown += `## Data Table\n\n`;
  mockMarkdown += `| Name | Value | Description |\n`;
  mockMarkdown += `|------|-------|-------------|\n`;
  mockMarkdown += `| Alpha | 1 | First item |\n`;
  mockMarkdown += `| Beta | 2 | Second item |\n`;
  mockMarkdown += `| Gamma | 3 | Third item |\n\n`;

  // Blockquote section
  mockMarkdown += `## Notable Quotes\n\n`;
  mockMarkdown += `> This is a blockquote.\n`;
  mockMarkdown += `> It spans multiple lines.\n\n`;
  mockMarkdown += `Some text after the blockquote.\n`;

  return mockMarkdown;
};
