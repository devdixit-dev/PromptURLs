const models = {
  chatgpt: "https://chatgpt.com/?q=",
  claude: "https://claude.ai/new?q=",
  gemini: "https://gemini.google.com/search?q=",
  grok: "https://grok.com/?q=",
} as const;

export function generatePromptUrls(prompt: string) {
  const query = encodeURIComponent(prompt);
  return Object.fromEntries(
    Object.entries(models).map(([provider, base]) => [provider, `${base}${query}`]),
  ) as Record<keyof typeof models, string>;
}
