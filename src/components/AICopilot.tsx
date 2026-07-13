import React, { useState, useEffect, useRef } from "react";
import { Dataset, CopilotMessage } from "../types";
import { Sparkles, Send, Loader2, RefreshCw, AlertTriangle, MessageSquare, ArrowRight, HelpCircle } from "lucide-react";

interface AICopilotProps {
  dataset?: Dataset | null;
}

// Highly reliable, elegant in-line custom Markdown to HTML React Component
function CustomMarkdown({ text }: { text: string }) {
  const lines = text.split("\n");

  return (
    <div className="space-y-2.5 font-sans text-xs text-slate-300 leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // 1. Headers
        if (trimmed.startsWith("###")) {
          return <h4 key={idx} className="font-semibold text-white text-xs mt-3 mb-1 uppercase tracking-wider">{trimmed.replace("###", "").trim()}</h4>;
        }
        if (trimmed.startsWith("##")) {
          return <h3 key={idx} className="font-semibold text-white text-sm mt-4 mb-2 border-b border-slate-800 pb-1">{trimmed.replace("##", "").trim()}</h3>;
        }
        if (trimmed.startsWith("#")) {
          return <h2 key={idx} className="font-bold text-white text-base mt-4 mb-2">{trimmed.replace("#", "").trim()}</h2>;
        }

        // 2. Unordered lists
        if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
          const content = trimmed.substring(1).trim();
          return (
            <div key={idx} className="flex gap-2 pl-2">
              <span className="text-indigo-400 font-bold">•</span>
              <span>{parseBold(content)}</span>
            </div>
          );
        }

        // 3. Ordered lists
        const numMatch = trimmed.match(/^(\d+)\.\s(.*)/);
        if (numMatch) {
          return (
            <div key={idx} className="flex gap-2 pl-2">
              <span className="text-indigo-400 font-bold font-mono">{numMatch[1]}.</span>
              <span>{parseBold(numMatch[2])}</span>
            </div>
          );
        }

        // 4. Code / Equation blocks
        if (trimmed.startsWith("`") && trimmed.endsWith("`")) {
          return (
            <pre key={idx} className="bg-slate-950 border border-slate-850 rounded-lg p-2 font-mono text-[10px] text-slate-200 my-2 overflow-x-auto leading-normal">
              {trimmed.replace(/`/g, "")}
            </pre>
          );
        }

        // Default paragraph
        if (trimmed === "") {
          return <div key={idx} className="h-1.5" />;
        }

        return <p key={idx}>{parseBold(trimmed)}</p>;
      })}
    </div>
  );
}

// Helper to replace **bold** syntax in line strings
function parseBold(text: string) {
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return <strong key={index} className="font-bold text-white">{part}</strong>;
    }
    return part;
  });
}

export default function AICopilot({ dataset }: AICopilotProps) {
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Suggested questions
  const suggestions = dataset ? [
    { label: "Executive Dataset Summary", task: "general", text: "Create an executive summary and outline the target formulation." },
    { label: "Feature Engineering Ideas", task: "ml-recommend", text: "What feature engineering splits would maximize accuracy here?" },
    { label: "Correlations Analysis", task: "query", text: "Analyze the correlation matrix of this dataset. What are the strongest positive/negative correlations?" },
  ] : [
    { label: "Explain Machine Learning", task: "query", text: "Explain what is machine learning and describe its 3 primary categories." },
    { label: "Write a Python script", task: "query", text: "Write a complete, commented Python script using pandas and scikit-learn to train a simple classifier." },
    { label: "Describe Neural Networks", task: "query", text: "Explain what artificial neural networks are, how backpropagation works, and what deep learning means." }
  ];

  // Auto-generate deep summary context
  const getDatasetSummaryContext = (): string => {
    if (!dataset) return "No active dataset is loaded.";
    let summaryText = `Dataset Name: ${dataset.name}\nTotal Records: ${dataset.rows.length}\nTotal Columns: ${dataset.columns.length}\n\n`;
    
    dataset.metadata.forEach((meta) => {
      const stats = dataset.stats[meta.name];
      summaryText += `Column: ${meta.name}\n- Type: ${meta.type}\n- Missing Count: ${meta.missingCount}\n- Unique Values: ${meta.uniqueValues}\n`;
      if (meta.type === "numeric" && stats) {
        summaryText += `- Mean: ${stats.mean}\n- Median: ${stats.median}\n- StdDev: ${stats.stdDev}\n- Skewness: ${stats.skewness}\n- Kurtosis: ${stats.kurtosis}\n`;
      } else if (stats?.frequencyMap) {
        const top3 = Object.entries(stats.frequencyMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([k, v]) => `${k} (${v})`)
          .join(", ");
        summaryText += `- Top distributions: ${top3}\n`;
      }
      summaryText += `\n`;
    });

    return summaryText;
  };

  const handleSendMessage = async (userQuery: string, taskType: string = "query") => {
    if (!userQuery.trim() || loading) return;

    setError(null);
    const userMsg: CopilotMessage = {
      id: Math.random().toString(),
      role: "user",
      text: userQuery,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const summaryCtx = getDatasetSummaryContext();
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          datasetSummary: summaryCtx,
          columns: dataset?.columns || [],
          query: userQuery,
          taskType,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch response from Gemini.");
      }

      const aiMsg: CopilotMessage = {
        id: Math.random().toString(),
        role: "assistant",
        text: data.result,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setError(err.message || "Failed to communicate with AI Copilot.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="ai-copilot-workspace">
      {/* Suggestions panel */}
      <div className="lg:col-span-4 bg-slate-950/20 p-6 rounded-2xl border border-slate-800/80 flex flex-col gap-4">
        <div>
          <span className="text-[10px] uppercase font-mono font-bold text-indigo-400 tracking-wider">Quick Actions</span>
          <h3 className="font-display font-semibold text-white text-base">Copilot Analytical Prompts</h3>
          <p className="text-slate-400 text-xs">
            {dataset 
              ? "Run pre-configured advanced workflows with the Chief Data Scientist Agent" 
              : "Explore computer science and machine learning topics instantly"
            }
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(s.text, s.task)}
              disabled={loading}
              className="p-3 text-left rounded-xl bg-slate-950/55 border border-slate-850 hover:border-slate-800 hover:bg-slate-900/40 transition duration-150 disabled:opacity-50 flex justify-between items-center group cursor-pointer"
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-sans text-xs font-semibold text-slate-200">{s.label}</span>
                <span className="text-[10px] text-slate-500 group-hover:text-slate-400 truncate max-w-[200px]">{s.text}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors shrink-0" />
            </button>
          ))}
        </div>

        <div className="mt-auto border-t border-slate-850 pt-4 flex flex-col gap-2 text-slate-400 text-xs leading-relaxed font-sans bg-slate-950/40 p-4 rounded-xl">
          <div className="flex items-center gap-1.5 text-indigo-400 font-semibold text-xs font-mono">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>How does Copilot work?</span>
          </div>
          <span>
            {dataset 
              ? "The copilot dynamically generates custom statistical representations of your columns, distribution shapes, and missing value logs, passing them securely to our server-side LLM for expert insights."
              : "The copilot acts as a versatile general-purpose AI model that can answer any questions, write and debug code, and discuss complex machine learning architectures."
            }
          </span>
        </div>
      </div>

      {/* Chat panel */}
      <div className="lg:col-span-8 bg-slate-900/40 rounded-2xl border border-slate-800/80 shadow-md flex flex-col h-[460px]" id="chat-panel-box">
        {/* Chat header */}
        <div className="p-4 border-b border-slate-850 flex justify-between items-center bg-slate-950/40 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-950/50 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-white text-sm">Copilot Workspace</h3>
              <p className="text-slate-400 text-[10px] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" /> Gemini Server Active
              </p>
            </div>
          </div>

          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-slate-200 transition text-[10px] font-mono flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Clear Console
            </button>
          )}
        </div>

        {/* Chat body */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4" id="chat-body-scroller">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs text-center gap-2">
              <MessageSquare className="w-8 h-8 text-slate-650 mb-1" />
              <span>
                {dataset 
                  ? "Ask the data science copilot questions about correlations, skewness, modeling ideas, or any general question!"
                  : "Ask any programming, machine learning, science, or general knowledge question!"
                }
              </span>
            </div>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 max-w-[85%] ${m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                <div
                  className={`rounded-2xl p-4 shadow-sm text-xs ${
                    m.role === "user"
                      ? "bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-600/10"
                      : "bg-slate-950 border border-slate-800/80 text-slate-200 rounded-tl-none"
                  }`}
                >
                  {m.role === "user" ? (
                    <p className="font-sans leading-relaxed whitespace-pre-wrap">{m.text}</p>
                  ) : (
                    <CustomMarkdown text={m.text} />
                  )}
                  <span className={`text-[9px] mt-1.5 block text-right font-mono leading-none ${m.role === "user" ? "text-indigo-200/90" : "text-slate-500"}`}>
                    {m.timestamp}
                  </span>
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="flex gap-2 items-center text-slate-400 text-xs pl-2 bg-slate-950/50 p-3 rounded-xl border border-slate-850 max-w-[200px]">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
              <span className="font-sans">Computing response...</span>
            </div>
          )}

          {error && (
            <div className="bg-rose-950/30 border border-rose-900/50 text-rose-300 p-4 rounded-xl text-xs flex gap-2" id="copilot-api-error">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400 animate-bounce" />
              <div className="flex-1">
                <span className="font-bold">Execution Error: </span>
                <span>{error}</span>
                <p className="text-[10px] text-rose-400 font-sans mt-1">Please ensure your GEMINI_API_KEY is properly saved in the Settings &gt; Secrets panel.</p>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Chat input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(input);
          }}
          className="p-3 border-t border-slate-850 bg-slate-950/40 flex gap-2 rounded-b-2xl"
          id="chat-input-form"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder={dataset 
              ? "Ask a question about the dataset or any general question..." 
              : "Ask any question (e.g., Explain Neural Networks, write code, etc.)..."
            }
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl py-2 px-3.5 text-xs text-slate-200 font-sans focus:outline-none focus:border-indigo-500"
            id="chat-text-input"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="w-10 h-10 shrink-0 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/15 hover:shadow-indigo-600/30 transition duration-150 cursor-pointer"
            id="chat-submit-btn"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
