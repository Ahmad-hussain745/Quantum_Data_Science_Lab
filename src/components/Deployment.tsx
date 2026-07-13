import React, { useState, useEffect } from "react";
import { SavedModelRun } from "../types";
import { 
  AlertCircle, 
  ArrowRight, 
  Check, 
  Copy, 
  Globe, 
  Play, 
  Server, 
  RefreshCw, 
  Download, 
  Cpu, 
  FileCode, 
  Code2, 
  Terminal 
} from "lucide-react";

interface DeploymentProps {
  activeChampion: SavedModelRun | null;
  onProceed: () => void;
}

export default function Deployment({ activeChampion, onProceed }: DeploymentProps) {
  const [deployed, setDeployed] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"curl" | "python" | "js">("curl");

  // ESModule and Framework Exports Tab
  const [activeESMTab, setActiveESMTab] = useState<"esm" | "react" | "cjs" | "html">("esm");
  const [copiedESM, setCopiedESM] = useState(false);

  // API Testing Playground States
  const [jsonBody, setJsonBody] = useState("");
  const [apiResponse, setApiResponse] = useState("");
  const [callingAPI, setCallingAPI] = useState(false);

  const modelEndpoint = activeChampion 
    ? `https://api.quantum-ds.studio/v1/predict/${activeChampion.name.toLowerCase()}`
    : `https://api.quantum-ds.studio/v1/predict/model_v1`;

  // Sync JSON Request Body template based on active model predictors
  useEffect(() => {
    if (activeChampion) {
      const bodyObj: { [key: string]: number } = {};
      activeChampion.predictors.forEach((feat) => {
        bodyObj[feat] = 25.0; // dummy default value
      });
      setJsonBody(JSON.stringify({ features: bodyObj }, null, 2));
      setApiResponse("");
    }
  }, [activeChampion]);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const handleCopyESM = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedESM(true);
    setTimeout(() => setCopiedESM(false), 1500);
  };

  const handleSendRequest = () => {
    if (!deployed) {
      setApiResponse(JSON.stringify({ error: "Gateway Exception: Selected deployment endpoint is OFFLINE." }, null, 2));
      return;
    }

    setCallingAPI(true);
    setApiResponse("");

    setTimeout(() => {
      try {
        const parsed = JSON.parse(jsonBody);
        const featObj = parsed.features || {};

        let linearCombo = activeChampion?.intercept || 0;
        activeChampion?.predictors.forEach((feat) => {
          const w = activeChampion.weights[feat] || 0;
          const v = featObj[feat] || 0;
          linearCombo += w * v;
        });

        let outputVal = 0;
        let p: number | null = null;

        if (activeChampion?.type === "Classification") {
          p = 1 / (1 + Math.exp(-linearCombo));
          outputVal = p >= 0.5 ? 1 : 0;
        } else {
          outputVal = parseFloat(linearCombo.toFixed(4));
        }

        const successResponse = {
          status: "SUCCESS",
          timestamp: new Date().toISOString(),
          latency_ms: Math.floor(Math.random() * 15) + 8,
          model_ref: activeChampion?.name,
          predictions: {
            score: outputVal,
            probability: p !== null ? parseFloat(p.toFixed(4)) : undefined,
            label: p !== null ? (p >= 0.5 ? "POSITIVE_CLASS_1" : "NEGATIVE_CLASS_0") : "CONTINUOUS_VALUE"
          }
        };

        setApiResponse(JSON.stringify(successResponse, null, 2));
      } catch (err: any) {
        setApiResponse(JSON.stringify({ status: "MALFORMED_REQUEST", error: err.message }, null, 2));
      }
      setCallingAPI(false);
    }, 800);
  };

  if (!activeChampion) {
    return (
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center flex flex-col items-center gap-4 max-w-xl mx-auto">
        <div className="w-12 h-12 rounded-full bg-slate-950/50 border border-slate-850 flex items-center justify-center text-slate-500">
          <AlertCircle className="w-6 h-6 text-slate-500 animate-pulse" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-white text-base">API Gateways Locked</h3>
          <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
            Please navigate to Step 9 (Best Model Selection) and select a champion model to activate server deployment gateways.
          </p>
        </div>
      </div>
    );
  }

  // Define Standard Code blocks for Remote API
  const curlCode = `curl -X POST "${modelEndpoint}" \\
  -H "Content-Type: application/json" \\
  -d '${jsonBody}'`;

  const pythonCode = `import requests

url = "${modelEndpoint}"
payload = ${JSON.stringify(activeChampion.predictors.reduce((acc: any, f) => { acc[f] = 25.0; return acc; }, {}), null, 4)}

response = requests.post(url, json={"features": payload})
print(response.json())`;

  const jsCode = `const url = "${modelEndpoint}";
const payload = {
  features: ${JSON.stringify(activeChampion.predictors.reduce((acc: any, f) => { acc[f] = 25.0; return acc; }, {}), null, 4)}
};

fetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload)
})
.then(res => res.json())
.then(data => console.log(data));`;

  // === DYNAMIC NATIVE CODE GENERATORS (ESModules, React Hooks, etc.) ===
  const cleanModelName = activeChampion.name.replace(/\s+/g, "_").toLowerCase();
  
  const esmCode = `/**
 * ${activeChampion.name} - Native ECMAScript 6 Module (ESModule)
 * Generated dynamically by Quantum DS Lab.
 * Integrate in client or server-side ESModule workspaces with high-performance linear equations.
 */

export const metadata = {
  name: "${activeChampion.name}",
  type: "${activeChampion.type}",
  predictors: ${JSON.stringify(activeChampion.predictors, null, 2)},
  target: "${activeChampion.target}",
  intercept: ${activeChampion.intercept},
  timestamp: "${new Date().toLocaleDateString()}"
};

const weights = ${JSON.stringify(activeChampion.weights, null, 2)};
const intercept = ${activeChampion.intercept};

/**
 * Predicts output value based on input features vector.
 * @param {Object} features - Key-value pair of features (e.g. ${JSON.stringify(activeChampion.predictors.reduce((acc: any, f) => { acc[f] = 25.0; return acc; }, {}))})
 * @returns {Object} Prediction outputs.
 */
export function predict(features) {
  let linearCombo = intercept;
  for (const feature of metadata.predictors) {
    const val = features[feature] !== undefined ? Number(features[feature]) : 0;
    linearCombo += (weights[feature] || 0) * val;
  }

  if (metadata.type === "Classification") {
    const probability = 1 / (1 + Math.exp(-linearCombo));
    const score = probability >= 0.5 ? 1 : 0;
    return {
      score,
      probability,
      label: score === 1 ? "Positive (1)" : "Negative (0)"
    };
  } else {
    return {
      score: Number(linearCombo.toFixed(5))
    };
  }
}
`;

  const reactHookCode = `/**
 * use${activeChampion.name.replace(/[^a-zA-Z0-9]/g, "")}Predict.ts
 * Custom React Hook ESModule integration.
 * Paste directly into your React / Vite typescript app.
 */

import { useState, useCallback } from 'react';

export const metadata = {
  name: "${activeChampion.name}",
  type: "${activeChampion.type}",
  predictors: ${JSON.stringify(activeChampion.predictors, null, 2)},
  target: "${activeChampion.target}"
};

const weights: Record<string, number> = ${JSON.stringify(activeChampion.weights, null, 2)};
const intercept = ${activeChampion.intercept};

export function useModelPredict() {
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const calculate = useCallback((features: Record<string, number>) => {
    setLoading(true);
    let linearCombo = intercept;
    for (const feature of metadata.predictors) {
      const value = features[feature] !== undefined ? Number(features[feature]) : 0;
      linearCombo += (weights[feature] || 0) * value;
    }

    let result;
    if (metadata.type === "Classification") {
      const probability = 1 / (1 + Math.exp(-linearCombo));
      const score = probability >= 0.5 ? 1 : 0;
      result = {
        score,
        probability,
        label: score === 1 ? "Positive (1)" : "Negative (0)"
      };
    } else {
      result = {
        score: Number(linearCombo.toFixed(5))
      };
    }
    setPrediction(result);
    setLoading(false);
    return result;
  }, []);

  return { prediction, calculate, loading, metadata };
}
`;

  const cjsCode = `/**
 * ${activeChampion.name} - CommonJS Module (NodeJS compatibility format)
 * Generated dynamically by Quantum DS Lab.
 */

const metadata = {
  name: "${activeChampion.name}",
  type: "${activeChampion.type}",
  predictors: ${JSON.stringify(activeChampion.predictors, null, 2)},
  target: "${activeChampion.target}",
  intercept: ${activeChampion.intercept}
};

const weights = ${JSON.stringify(activeChampion.weights, null, 2)};
const intercept = ${activeChampion.intercept};

function predict(features) {
  let linearCombo = intercept;
  for (const feature of metadata.predictors) {
    const val = features[feature] !== undefined ? Number(features[feature]) : 0;
    linearCombo += (weights[feature] || 0) * val;
  }

  if (metadata.type === "Classification") {
    const probability = 1 / (1 + Math.exp(-linearCombo));
    const score = probability >= 0.5 ? 1 : 0;
    return {
      score,
      probability,
      label: score === 1 ? "Positive (1)" : "Negative (0)"
    };
  } else {
    return {
      score: Number(linearCombo.toFixed(5))
    };
  }
}

module.exports = {
  metadata,
  predict
};
`;

  const htmlCode = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Embedded Champion Model Predictor</title>
</head>
<body style="background: #020617; color: #f1f5f9; font-family: system-ui, sans-serif; padding: 2rem; max-width: 600px; margin: auto;">

  <h2 style="color: #6366f1;">🤖 Embedded Prediction Engine</h2>
  <p>Model: <strong>${activeChampion.name} (${activeChampion.type})</strong></p>
  
  <div style="background: #0f172a; border: 1px solid #334155; padding: 1.5rem; border-radius: 12px; margin-top: 1.5rem;">
    <h3 style="margin-top: 0; font-size: 1rem; color: #38bdf8;">Quick Input Values</h3>
    <form id="predictionForm" style="display: flex; flex-direction: column; gap: 1rem;">
      ${activeChampion.predictors.map(p => `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <label for="${p}" style="font-size: 0.85rem; font-family: monospace;">${p}:</label>
        <input type="number" id="${p}" name="${p}" value="25.0" step="0.1" style="background: #020617; border: 1px solid #475569; color: white; padding: 0.4rem; border-radius: 6px; width: 100px;">
      </div>
      `).join("")}
      <button type="submit" style="background: #6366f1; color: white; border: none; padding: 0.6rem; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 0.5rem;">Calculate Local Inference</button>
    </form>
    
    <div style="margin-top: 1.5rem; border-top: 1px solid #334155; padding-top: 1rem;">
      <span style="font-size: 0.75rem; color: #94a3b8; font-family: monospace;">INFERENCE OUTPUT:</span>
      <pre id="outputConsole" style="background: #020617; padding: 1rem; border-radius: 8px; color: #34d399; font-size: 0.9rem; font-family: monospace; overflow-x: auto;">// Submit details to run calculations</pre>
    </div>
  </div>

  <!-- SELF-CONTAINED EMBEDDED MODEL ENGINE -->
  <script>
    (function() {
      window.ModelPredictor = {
        name: "${activeChampion.name}",
        type: "${activeChampion.type}",
        predictors: ${JSON.stringify(activeChampion.predictors)},
        predict: function(features) {
          const weights = ${JSON.stringify(activeChampion.weights)};
          const intercept = ${activeChampion.intercept};
          
          let linearCombo = intercept;
          for (const feature of this.predictors) {
            const value = features[feature] !== undefined ? Number(features[feature]) : 0;
            linearCombo += (weights[feature] || 0) * value;
          }
          
          if (this.type === "Classification") {
            const probability = 1 / (1 + Math.exp(-linearCombo));
            const score = probability >= 0.5 ? 1 : 0;
            return {
              score: score,
              probability: Number(probability.toFixed(5)),
              label: score === 1 ? "Positive (1)" : "Negative (0)"
            };
          } else {
            return {
              score: Number(linearCombo.toFixed(5))
            };
          }
        }
      };
    })();

    // Intercept form submission
    document.getElementById("predictionForm").addEventListener("submit", function(e) {
      e.preventDefault();
      const features = {};
      ${activeChampion.predictors.map(p => `
      features["${p}"] = parseFloat(document.getElementById("${p}").value || 0);
      `).join("")}
      
      const prediction = window.ModelPredictor.predict(features);
      document.getElementById("outputConsole").textContent = JSON.stringify(prediction, null, 2);
    });
  </script>
</body>
</html>`;

  const getESMCodeContent = () => {
    switch (activeESMTab) {
      case "esm": return esmCode;
      case "react": return reactHookCode;
      case "cjs": return cjsCode;
      case "html": return htmlCode;
    }
  };

  const handleDownloadESMFile = () => {
    const code = getESMCodeContent();
    let extension = "js";
    let type = "text/javascript";
    
    if (activeESMTab === "react") {
      extension = "ts";
      type = "text/typescript";
    } else if (activeESMTab === "html") {
      extension = "html";
      type = "text/html";
    } else if (activeESMTab === "cjs") {
      extension = "cjs";
      type = "text/javascript";
    }

    const dataStr = `data:${type};charset=utf-8,` + encodeURIComponent(code);
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    
    const baseName = activeESMTab === "react" 
      ? `use${activeChampion.name.replace(/[^a-zA-Z0-9]/g, "")}Predict`
      : `${cleanModelName}_${activeESMTab}`;
      
    link.setAttribute("download", `${baseName}.${extension}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6" id="deployment-module">
      
      {/* Grid containing Remote Gateway API and interactive Request Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Settings & Code snippets */}
        <div className="lg:col-span-7 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-md flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display font-semibold text-white text-base flex items-center gap-2">
                <Server className="w-4 h-4 text-indigo-400" />
                API Deployment Gateway
              </h2>
              <p className="text-slate-400 text-xs">Expose champion model weights through an asynchronous RESTful microservice</p>
            </div>

            <div className="flex items-center gap-3 shrink-0" id="deployment-toggle-wrapper">
              <span className={`text-[10px] font-mono font-bold uppercase ${deployed ? "text-emerald-400" : "text-rose-400"}`}>
                {deployed ? "● GATEWAY LIVE" : "● OFFLINE"}
              </span>
              <button
                onClick={() => setDeployed(!deployed)}
                className={`w-10 h-5 rounded-full p-0.5 transition duration-200 focus:outline-none cursor-pointer ${
                  deployed ? "bg-emerald-500" : "bg-slate-850 border border-slate-800"
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition duration-200 transform ${
                  deployed ? "translate-x-5" : "translate-x-0"
                }`} />
              </button>
            </div>
          </div>

          {/* Copyable code console */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center bg-slate-950/50 p-1 rounded-xl border border-slate-850" id="deployment-code-tabs">
              <div className="flex gap-1">
                {(["curl", "python", "js"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold transition cursor-pointer uppercase ${
                      activeTab === t ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => handleCopy(activeTab === "curl" ? curlCode : activeTab === "python" ? pythonCode : jsCode, 1)}
                className="p-1 px-2.5 rounded bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-400 hover:text-white transition text-[10px] font-mono flex items-center gap-1 cursor-pointer"
              >
                {copiedIndex === 1 ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedIndex === 1 ? "Copied!" : "Copy code"}</span>
              </button>
            </div>

            <pre className="bg-slate-950 border border-slate-850 rounded-xl p-4 font-mono text-[10px] text-indigo-300 overflow-x-auto leading-relaxed max-h-52">
              <code>
                {activeTab === "curl" ? curlCode : activeTab === "python" ? pythonCode : jsCode}
              </code>
            </pre>
          </div>
        </div>

        {/* Gateway Playground Sandbox */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 shadow-md flex-1 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-slate-300 font-sans text-xs font-semibold">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>Gateway Request Sandbox</span>
            </div>

            <div className="grid grid-cols-1 gap-3 flex-1">
              <div>
                <label className="block text-[8px] font-mono font-bold text-slate-500 uppercase mb-1">Request JSON Payload</label>
                <textarea
                  value={jsonBody}
                  onChange={(e) => setJsonBody(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 font-mono text-[10px] text-indigo-400 focus:outline-none focus:border-indigo-500 leading-normal"
                />
              </div>

              <button
                onClick={handleSendRequest}
                disabled={callingAPI}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-sans text-xs font-semibold py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {callingAPI ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                <span>Send Post Request</span>
              </button>

              <div>
                <label className="block text-[8px] font-mono font-bold text-slate-500 uppercase mb-1">HTTP Response Payload</label>
                <pre className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 font-mono text-[9px] text-emerald-400 leading-normal max-h-36 overflow-y-auto">
                  <code>{apiResponse || "// Send request to receive HTTP JSON state"}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- NEW FEAUTRE: NATIVE ESMODULES & FRAMEWORK INTEGRATIONS EXPORTER --- */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-md flex flex-col gap-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="font-display font-semibold text-white text-sm flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Client-Side ESModules & Framework Integration Codes
            </h2>
            <p className="text-slate-400 text-xs">Run prediction weights directly inside your apps locally with zero network latency</p>
          </div>
          <div className="bg-[#0c1524] border border-cyan-900/40 px-3 py-1.5 rounded-xl flex items-center gap-1 text-[10px] font-mono text-cyan-300">
            <Code2 className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>NATIVE OFFLINE ES6 EXPORT ENGINE ACTIVE</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Format Selection list */}
          <div className="lg:col-span-4 flex flex-col gap-2">
            <span className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest pl-1">Choose Export Target</span>
            
            <button
              onClick={() => setActiveESMTab("esm")}
              className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex items-start gap-3 cursor-pointer ${
                activeESMTab === "esm"
                  ? "bg-slate-950 border-cyan-500/50 text-white shadow-md shadow-cyan-950/10"
                  : "bg-slate-950/40 border-slate-850 hover:border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileCode className="w-4 h-4 shrink-0 mt-0.5 text-cyan-400" />
              <div>
                <strong className="block text-[11px]">Plain ESModule (.js)</strong>
                <span className="text-[9px] text-slate-500 block mt-0.5 leading-normal">Standard ES6 import/export format with linear equations.</span>
              </div>
            </button>

            <button
              onClick={() => setActiveESMTab("react")}
              className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex items-start gap-3 cursor-pointer ${
                activeESMTab === "react"
                  ? "bg-slate-950 border-cyan-500/50 text-white shadow-md shadow-cyan-950/10"
                  : "bg-slate-950/40 border-slate-850 hover:border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <Code2 className="w-4 h-4 shrink-0 mt-0.5 text-indigo-400" />
              <div>
                <strong className="block text-[11px]">React Hook (.ts)</strong>
                <span className="text-[9px] text-slate-500 block mt-0.5 leading-normal">Typed react state hook useModelPredict() for active state integration.</span>
              </div>
            </button>

            <button
              onClick={() => setActiveESMTab("cjs")}
              className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex items-start gap-3 cursor-pointer ${
                activeESMTab === "cjs"
                  ? "bg-slate-950 border-cyan-500/50 text-white shadow-md shadow-cyan-950/10"
                  : "bg-slate-950/40 border-slate-850 hover:border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <Terminal className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <div>
                <strong className="block text-[11px]">CommonJS Module (.cjs)</strong>
                <span className="text-[9px] text-slate-500 block mt-0.5 leading-normal">Legacy Node.js backend integration using require() modules.</span>
              </div>
            </button>

            <button
              onClick={() => setActiveESMTab("html")}
              className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex items-start gap-3 cursor-pointer ${
                activeESMTab === "html"
                  ? "bg-slate-950 border-cyan-500/50 text-white shadow-md shadow-cyan-950/10"
                  : "bg-slate-950/40 border-slate-850 hover:border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <Globe className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <div>
                <strong className="block text-[11px]">Standalone Embedded HTML</strong>
                <span className="text-[9px] text-slate-500 block mt-0.5 leading-normal">Single file self-contained interactive web page tool.</span>
              </div>
            </button>
          </div>

          {/* Code Viewer Panel */}
          <div className="lg:col-span-8 flex flex-col gap-2.5">
            <div className="flex justify-between items-center bg-slate-950/50 p-1.5 rounded-xl border border-slate-850">
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider pl-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
                <span>DYNAMIC INTEGRATION SOURCE CODE</span>
              </span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => handleCopyESM(getESMCodeContent())}
                  className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white transition text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {copiedESM ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedESM ? "Copied!" : "Copy Code"}</span>
                </button>
                <button
                  onClick={handleDownloadESMFile}
                  className="px-2.5 py-1 rounded bg-cyan-600/10 hover:bg-cyan-600/20 border border-cyan-500/30 text-cyan-400 transition text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download File</span>
                </button>
              </div>
            </div>

            <pre className="bg-slate-950 border border-slate-850 rounded-xl p-4 font-mono text-[10px] text-cyan-300 overflow-x-auto leading-relaxed max-h-80 select-all scrollbar-thin">
              <code>{getESMCodeContent()}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Main bottom transition proceeds */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex justify-between items-center shadow-md">
        <span className="text-xs text-slate-400">Step 10 of 11: Real-time API Integration Code Exporter</span>
        <button
          onClick={onProceed}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-xs font-semibold py-2.5 px-6 rounded-xl shadow-lg shadow-emerald-600/10 hover:shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>Proceed to Reports & Monitoring</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
}
