"use client";

import {
  ArrowUpRight,
  Check,
  Copy,
  Github,
  Rocket,
  Sparkles,
  TerminalSquare,
  X,
} from "lucide-react";
import Image, { StaticImageData } from "next/image";
import { useMemo, useState } from "react";

import chatgpt from "./assets/chatgpt.svg";
import claude from "./assets/claude.svg";
import gemini from "./assets/gemini.svg";
import grok from "./assets/grok.png";

const ICON_SIZE = 40;

type Provider = {
  key: "chatgpt" | "claude" | "gemini" | "grok";
  name: string;
  state: string;
  isEnabled: boolean;
  image: StaticImageData | null;
  url: string;
  generatedUrl: string;
  iconClassName?: string;
};

const providers: Provider[] = [
  {
    key: "chatgpt",
    name: "ChatGPT",
    state: "Ready",
    isEnabled: true,
    image: chatgpt,
    url: "chat.openai.com",
    generatedUrl: "https://chatgpt.com",
    iconClassName: "scale-[1.2]",
  },
  {
    key: "claude",
    name: "Claude",
    state: "Ready",
    isEnabled: true,
    image: claude,
    url: "claude.ai",
    generatedUrl: "https://claude.ai",
  },
  {
    key: "gemini",
    name: "Gemini",
    state: "Ready",
    isEnabled: true,
    image: gemini,
    url: "gemini.google.com",
    generatedUrl: "https://gemini.google.com",
  },
  {
    key: "grok",
    name: "Grok",
    state: "Ready",
    isEnabled: true,
    image: grok,
    url: "grok.x.ai",
    generatedUrl: "https://grok.com",
  },
];

const stats = [
  { label: "Providers", value: "4" },
  { label: "Link Modes", value: "Open/Copy/Save" },
  { label: "Latency", value: "~120ms" },
];

/*
Reusable provider icon component
Ensures consistent sizing across the app
*/
const ProviderIcon = ({
  src,
  alt,
  className = "",
}: {
  src: StaticImageData | null;
  alt: string;
  className?: string;
}) => {
  if (!src) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white/10 text-xs text-white">
        ?
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={ICON_SIZE}
      height={ICON_SIZE}
      className={`h-10 w-10 object-contain opacity-90 ${className}`}
    />
  );
};

const backendBaseUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";
const LOCAL_USER_ID_KEY = "prompturls_user_id";
const LOCAL_PROMPT_HISTORY_KEY = "prompturls_prompt_history";

const normalizeUrl = (value: string) =>
  /^https?:\/\//i.test(value) ? value : `https://${value}`;

const getSessionUserId = () => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(LOCAL_USER_ID_KEY);
};

const setSessionUserId = (userId: string) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCAL_USER_ID_KEY, userId);
};

const getOrCreateSessionUserId = () => {
  const existingUserId = getSessionUserId();
  if (existingUserId) return existingUserId;

  const nextUserId =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  setSessionUserId(nextUserId);
  return nextUserId;
};

const appendPromptToSessionHistory = (prompt: string) => {
  if (typeof window === "undefined") return;
  const rawHistory = window.localStorage.getItem(LOCAL_PROMPT_HISTORY_KEY);
  const parsedHistory = rawHistory ? (JSON.parse(rawHistory) as string[]) : [];
  const nextHistory = [...parsedHistory, prompt];
  window.localStorage.setItem(
    LOCAL_PROMPT_HISTORY_KEY,
    JSON.stringify(nextHistory)
  );
};

const toProviderUrls = (data: unknown) => {
  if (Array.isArray(data)) {
    return {
      chatgpt: data[0],
      claude: data[1],
      gemini: data[2],
      grok: data[3],
    } as const;
  }

  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    return {
      chatgpt: obj.chatgpt,
      claude: obj.claude,
      gemini: obj.gemini ?? obj.google,
      grok: obj.grok,
    } as const;
  }

  return {
    chatgpt: undefined,
    claude: undefined,
    gemini: undefined,
    grok: undefined,
  } as const;
};

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [cards, setCards] = useState<Provider[]>(providers);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeCardsCount = useMemo(
    () => cards.filter((card) => card.isEnabled).length,
    [cards]
  );

  const generatedCount = useMemo(
    () => cards.filter((card) => card.isEnabled && card.state === "Generated").length,
    [cards]
  );

  const handleGenerate = async () => {
    const promptText = prompt.trim();
    if (!promptText || isGenerating) return;

    try {
      setIsGenerating(true);
      setError(null);
      setCards((prev) => prev.map((card) => ({ ...card, state: "Loading..." })));

      const response = await fetch(`${backendBaseUrl}/api/root/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: promptText,
          userId: getOrCreateSessionUserId(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const payload = (await response.json()) as {
        data?: unknown;
        userId?: string;
      };

      if (payload.userId && typeof payload.userId === "string") {
        setSessionUserId(payload.userId);
      }

      appendPromptToSessionHistory(promptText);
      const generatedByProvider = toProviderUrls(payload?.data);

      setCards((prev) =>
        prev.map((card) => {
          const nextUrl = generatedByProvider[card.key];
          const validUrl = typeof nextUrl === "string" ? nextUrl : card.generatedUrl;
          return {
            ...card,
            generatedUrl: validUrl,
            state: typeof nextUrl === "string" ? "Generated" : "Unavailable",
          };
        })
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to generate URLs";
      setError(message);
      setCards((prev) => prev.map((card) => ({ ...card, state: "Ready" })));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpen = (url: string) => {
    if (typeof window === "undefined") return;
    window.open(normalizeUrl(url), "_blank", "noopener,noreferrer");
  };

  const handleCopy = async (url: string) => {
    const value = normalizeUrl(url);
    if (!navigator?.clipboard) return;
    await navigator.clipboard.writeText(value);
  };

  const handleToggleProvider = (key: Provider["key"]) => {
    setCards((prev) =>
      prev.map((card) =>
        card.key === key ? { ...card, isEnabled: !card.isEnabled } : card
      )
    );
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-8 sm:px-8 md:px-12 md:py-12">
      {/* HERO SECTION */}
      <section className="flex flex-col animate-float-in gap-8 md:grid-cols-[1.35fr_1fr] md:gap-10">
        <div className="rounded-3xl p-6 sm:p-8 md:p-10">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs text-white/85">
            <Sparkles size={14} />
            Prompt Routing Studio
          </div>

          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl">
            Build shareable AI prompt URLs with a clean, pro workflow.
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-relaxed text-(--text-muted) sm:text-base">
            Write once, launch everywhere. Craft prompts, generate destination
            URLs, and move between models without context switching.
          </p>

          <div className="mt-7 grid gap-20 sm:grid-cols-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center justify-center rounded-full border-b-2 px-4 py-3"
              >
                <p className="text-lg font-semibold text-white">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs uppercase tracking-wide text-(--text-muted)">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* PROMPT INPUT */}
        <div
          className="animate-float-in rounded-3xl p-6 sm:p-8"
          style={{ animationDelay: "0.12s" }}
        >
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm uppercase tracking-[0.2em] text-white/70">
              Input
            </h2>
            <TerminalSquare size={16} className="text-white/80" />
          </div>

          <textarea
            placeholder="Paste or write your prompt here..."
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            className="min-h-44 w-full resize-none rounded-lg border border-white/20 bg-[#0b0d12]/80 p-4 text-sm text-white outline-none transition focus:border-white/45"
          />

          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-[#0f1115] transition hover:-translate-y-px hover:bg-[#f0f2f5] disabled:cursor-not-allowed disabled:opacity-60 hover:cursor-pointer"
            >
              <Rocket size={15} />
              {isGenerating ? "Generating..." : "Generate URLs"}
            </button>
          </div>
          {error ? (
            <p className="mt-3 text-center text-xs text-red-300">{error}</p>
          ) : null}
        </div>
      </section>

      {/* PROVIDER CARDS */}
      <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((provider, idx) => (
          <article
            key={provider.name}
            className="glass soft-shadow animate-float-in rounded-2xl p-5"
            style={{ animationDelay: `${0.2 + idx * 0.07}s` }}
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-medium text-white">
                  {provider.name}
                </h3>
                <p className="mt-1 text-xs text-(--text-muted)">
                  {provider.url}
                </p>
              </div>

              <ProviderIcon
                src={provider.image}
                alt={`${provider.name} icon`}
                className={provider.iconClassName}
              />
            </div>

            <div className="mb-4 inline-flex rounded-full border uppercase border-white/20 bg-white/5 px-2.5 py-1 text-[11px] text-white/80">
              {provider.isEnabled ? provider.state : "Off"}
            </div>

            <div className="flex justify-between gap-2">
              <button
                onClick={() => handleOpen(provider.generatedUrl)}
                disabled={!provider.isEnabled}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-[#11141b] transition hover:bg-[#f1f3f8] hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ArrowUpRight size={14} />
                Open
              </button>

              <button
                onClick={() => handleCopy(provider.generatedUrl)}
                disabled={!provider.isEnabled}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/25 px-3 py-1.5 text-xs text-white transition hover:bg-white/12 hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Copy size={13} />
                Copy
              </button>

              <button
                onClick={() => handleToggleProvider(provider.key)}
                aria-label={`${provider.name} ${
                  provider.isEnabled ? "disable" : "enable"
                }`}
                className={`relative inline-flex h-7 w-14 items-center rounded-full border transition hover:cursor-pointer ${
                  provider.isEnabled
                    ? "border-emerald-300/50 bg-emerald-400/20"
                    : "border-white/25 bg-white/10"
                }`}
              >
                <Check
                  size={11}
                  className={`absolute left-1.5 transition ${
                    provider.isEnabled ? "text-emerald-200" : "text-white/35"
                  }`}
                />
                <X
                  size={11}
                  className={`absolute right-1.5 transition ${
                    provider.isEnabled ? "text-white/35" : "text-rose-200"
                  }`}
                />
                <span
                  className={`absolute h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                    provider.isEnabled ? "translate-x-8" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </article>
        ))}
      </section>
      <p className="mt-8 flex justify-center text-xs text-(--text-muted)">
        Generated links: {generatedCount}/{activeCardsCount}
      </p>

      {/* REQUEST FORM */}
      <section
        className="animate-float-in mt-7 rounded-3xl p-6 sm:p-8"
        style={{ animationDelay: "0.5s" }}
      >
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Request a New Model
            </h2>
            <p className="mt-1 text-sm text-(--text-muted)">
              Share the model details and we will add support to PromptURLs.
            </p>
          </div>

          <div className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs uppercase tracking-wider text-white/80">
            Request Form
          </div>
        </div>

        <form className="grid gap-4 md:grid-cols-2">
          <input
            type="text"
            placeholder="Your full name"
            className="w-full rounded-xl border border-white/20 bg-[#0b0d12]/80 px-4 py-3 text-sm text-white outline-none focus:border-white/45"
          />

          <input
            type="text"
            placeholder="Model name"
            className="w-full rounded-xl border border-white/20 bg-[#0b0d12]/80 px-4 py-3 text-sm text-white outline-none focus:border-white/45"
          />

          <input
            type="text"
            placeholder="Provider"
            className="w-full rounded-xl border border-white/20 bg-[#0b0d12]/80 px-4 py-3 text-sm text-white outline-none focus:border-white/45"
          />

          <select className="w-full rounded-xl border border-white/20 bg-[#0b0d12]/80 px-4 py-3 text-sm text-white outline-none focus:border-white/45">
            <option>Normal</option>
            <option>High</option>
            <option>Critical</option>
          </select>

          <textarea
            placeholder="Request details..."
            className="min-h-32 w-full resize-none rounded-xl border border-white/20 bg-[#0b0d12]/80 px-4 py-3 text-sm text-white outline-none md:col-span-2 focus:border-white/45"
          />

          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-[#0f1115] transition hover:-translate-y-px hover:bg-[#f0f2f5] hover:cursor-pointer md:col-span-2"
          >
            Submit Request
          </button>
        </form>
      </section>

      {/* FOOTER */}
      <footer className="animate-float-in mt-7 flex flex-col items-start justify-between gap-3 rounded-2xl px-5 py-4 text-sm text-(--text-muted) sm:flex-row sm:items-center">
        <p>
          Developed by{" "}
          <a
            href="https://www.linkedin.com/in/devershdixit/"
            target="_blank"
            className="text-white"
          >
            Dev Dixit
          </a>
        </p>

        <a
          href="https://github.com/devdixit-dev"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-white transition hover:bg-white/12"
        >
          <Github size={15} />
          GitHub
        </a>
      </footer>
    </main>
  );
}
