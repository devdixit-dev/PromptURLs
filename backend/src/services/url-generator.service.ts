const models = {
  chatgpt: {
    base: "https://chatgpt.com/?q=",
  },
  claude: {
    base: "https://claude.ai/new?q=",
  },
  gemini: {
    base: "https://gemini.google.com/search?q=",
  },
  grok: {
    base: "https://grok.com/?q=",
  },
};

type ProviderKey = keyof typeof models;
type GeneratedUrls = Record<ProviderKey, string>;

function UrlGenerator(text: string) {
  if (!text || typeof text !== "string") {
    throw new Error("Query text must be a string");
  }

  const encodedQuery = encodeURIComponent(text);

  return (Object.keys(models) as ProviderKey[]).reduce((acc, key) => {
    acc[key] = `${models[key].base}${encodedQuery}`;
    return acc;
  }, {} as GeneratedUrls);
}

export default UrlGenerator;
