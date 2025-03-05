export const generateMockMarkdown = () => {
  let mockMarkdown = "";
  for (let i = 1; i <= 10000; i++) {
    if (i % 10 === 1) {
      mockMarkdown += `# Heading ${Math.ceil(i / 10)}\n\n`; // Every 10 lines, add a heading
    } else if (i % 5 === 0) {
      mockMarkdown += `- Bullet point ${i}\n`; // Every 5th line is a bullet point
    } else {
      mockMarkdown += `Line ${i}: This is a **mock** line for testing purposes.\n`;
    }
  }
  return mockMarkdown;
};
