const models = {
  chatgpt: {
    base: `https://chatgpt.com/?q=`
  },
  claude: {
    base: `https://claude.ai/new?q=`
  },
  google: {
    base: `https://www.google.com/search?q=`
  },
  grok: {
    base: `https://grok.com/?q=`
  }
}

function UrlGenerator(text: string) {
  if (!text || typeof text !== "string") {
    throw new Error("Query text must be a string");
  }

  const encodedQuery = encodeURIComponent(text);

  return Object.values(models).map((provider) => {
    return `${provider.base}${encodedQuery}`;
  });
}

export default UrlGenerator;