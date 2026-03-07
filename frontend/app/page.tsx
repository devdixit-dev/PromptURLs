import type { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "PromptURLs | Generate AI Prompt Links",
  description:
    "Create and manage prompt URLs for ChatGPT, Claude, Gemini and Grok with persistent prompt history.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "PromptURLs | Generate AI Prompt Links",
    description:
      "Create and manage prompt URLs for ChatGPT, Claude, Gemini and Grok with persistent prompt history.",
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "PromptURLs | Generate AI Prompt Links",
    description:
      "Create and manage prompt URLs for ChatGPT, Claude, Gemini and Grok with persistent prompt history.",
  },
};

export default function Page() {
  return <HomeClient />;
}
