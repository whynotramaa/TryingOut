"use client";
import { Send, Loader2 } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

export default function CompletionPage() {
    const [prompt, setPrompt] = useState("");
    const [completion, setCompletion] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const complete = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!prompt.trim()) return;

        setIsLoading(true);
        setError(null);
        const currentPrompt = prompt;
        setPrompt("");

        try {
            const response = await fetch("/api/completion", {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({ prompt: currentPrompt }),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "OOPS! Something went wrong");
            }

            setCompletion(data.text);
        } catch (error) {
            console.error("Error -> ", error);
            setError(
                error instanceof Error ? error.message : "Something went wrong"
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
            <div className="w-full max-w-3xl space-y-6">
                {/* Header */}
                <div className="text-center space-y-2 mb-8">
                    <h1 className="text-3xl font-bold">AI Completion</h1>
                    <p className="text-gray-400 text-sm">
                        Ask me anything and I will help you
                    </p>
                </div>

                {/* Response Area */}
                <div className="min-h-[300px] bg-white/5 rounded-3xl border border-white/10 p-6 backdrop-blur-sm">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-300 text-sm">
                            {error}
                        </div>
                    )}

                    {isLoading && (
                        <div className="flex items-center justify-center h-full">
                            <div className="flex items-center gap-3 text-gray-400">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span className="text-sm">
                                    Generating response...
                                </span>
                            </div>
                        </div>
                    )}

                    {!isLoading && completion && (
                        <div className="prose prose-invert max-w-none">
                            <div className="whitespace-pre-wrap text-gray-100 leading-relaxed">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {completion}
                                </ReactMarkdown>
                            </div>
                        </div>
                    )}

                    {!isLoading && !completion && !error && (
                        <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                            Your response will appear here
                        </div>
                    )}
                </div>

                {/* Input Form */}
                <form onSubmit={complete} className="relative">
                    <div className="relative flex items-center bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm overflow-hidden focus-within:border-white/30 transition-colors">
                        <input
                            type="text"
                            placeholder="How can I help you today?"
                            className="flex-1 px-6 py-5 bg-transparent text-white placeholder-gray-500 focus:outline-none text-sm"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !prompt.trim()}
                            className="m-2 flex items-center gap-2 bg-white text-black font-semibold rounded-2xl px-6 py-3 text-sm hover:bg-gray-200 transition-colors disabled:opacity-50  cursor-pointer disabled:cursor-not-allowed disabled:hover:bg-white"
                        >
                            <span>Send</span>
                            <Send className="h-4 w-4" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
