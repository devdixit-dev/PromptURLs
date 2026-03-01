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
  },
  huggingFace: {
    base: `https://huggingface.co/chat/?q=`
  },
  leeChat: {
    base: `https://chat.mistral.ai/chat?q=`
  },
  perplexity: {
    base: `https://www.perplexity.ai/search?q=`
  }
}

function main(model, text) {
  if (!model || typeof model !== "string") {
    throw new Error("Model name must be a string");
  }

  if(!models[model]) throw new Error("Unsupported model");

  if(model in models) {
    const urls = Object.values(models).map(model => `${model.base}${encodeURIComponent(text)}`);
    return urls
  }
}

const model = "chatgpt";
const text = "What is JavaScript ?"

console.log(main(model, text));