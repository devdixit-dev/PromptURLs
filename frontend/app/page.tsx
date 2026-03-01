export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-10 p-10">

      {/* Header */}
      <h1 className="text-4xl font-bold text-center">
        PromptURLs
      </h1>

      {/* Prompt Input */}
      <div className="w-full max-w-xl">
        <input
          type="text"
          placeholder="Type your prompt to make sharable links"
          className="w-full h-30 items-start border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 gap-6">

        {/* Card 1 */}
        <div className="border rounded-xl p-6 flex flex-col gap-4 shadow-sm">
          <h2 className="text-xl font-semibold">ChatGPT</h2>

          <div className="flex gap-2">
            <button className="px-3 py-2 bg-black text-white rounded-lg">
              Open
            </button>
            <button className="px-3 py-2 border rounded-lg">
              Copy
            </button>
            <button className="px-3 py-2 border rounded-lg">
              Save
            </button>
          </div>
        </div>

        {/* Card 2 */}
        <div className="border rounded-xl p-6 flex flex-col gap-4 shadow-sm">
          <h2 className="text-xl font-semibold">Claude</h2>

          <div className="flex gap-2">
            <button className="px-3 py-2 bg-black text-white rounded-lg">
              Open
            </button>
            <button className="px-3 py-2 border rounded-lg">
              Copy
            </button>
            <button className="px-3 py-2 border rounded-lg">
              Save
            </button>
          </div>
        </div>

        {/* Card 3 */}
        <div className="border rounded-xl p-6 flex flex-col gap-4 shadow-sm">
          <h2 className="text-xl font-semibold">Gemini</h2>

          <div className="flex gap-2">
            <button className="px-3 py-2 bg-black text-white rounded-lg">
              Open
            </button>
            <button className="px-3 py-2 border rounded-lg">
              Copy
            </button>
            <button className="px-3 py-2 border rounded-lg">
              Save
            </button>
          </div>
        </div>

        {/* Card 4 */}
        <div className="border rounded-xl p-6 flex flex-col gap-4 shadow-sm">
          <h2 className="text-xl font-semibold">Grok</h2>

          <div className="flex gap-2">
            <button className="px-3 py-2 bg-black text-white rounded-lg">
              Open
            </button>
            <button className="px-3 py-2 border rounded-lg">
              Copy
            </button>
            <button className="px-3 py-2 border rounded-lg">
              Save
            </button>
          </div>
        </div>

      </div>

    </main>
  );
}