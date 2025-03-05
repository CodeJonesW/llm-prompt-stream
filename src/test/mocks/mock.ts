const markdownPrompt = `Please format your response in valid Markdown, adhering to the following:
				- Use headings with "#" for levels (e.g., "#", "##", "###").
				- Mark the end of unordered lists with a new line.
				- Mark headings and subheadings with a new line.
				- Do not use numbers in headings.
				- Do not bold or italicize text.
				Ensure the Markdown is clean and easy to copy into any Markdown editor.`;

export const mock_messages = [
  {
    role: "system",
    content: `You are an expert in the field of programming`,
  },
  { role: "user", content: `teach me how to unit testing of streams` },
  {
    role: "system",
    content: `You are passionate about explaining sub points of the user's goal in detail`,
  },
  {
    role: "system",
    content: `Outline detailed plan to achieve the goal.`,
  },
  {
    role: "system",
    content: markdownPrompt,
  },
];
