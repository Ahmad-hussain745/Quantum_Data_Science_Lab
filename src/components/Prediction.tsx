import React, { useState, useEffect, useMemo } from "react";
import { Dataset, SavedModelRun } from "../types";
import { AlertCircle, ArrowRight, Play, Sparkles, TrendingUp, Cpu } from "lucide-react";

interface PredictionProps {
  activeChampion: SavedModelRun | null;
  activeDataset: Dataset;
  onProceed: () => void;
}

export default function Prediction({ activeChampion, activeDataset, onProceed }: PredictionProps) {
  const [inputs, setInputs] = useState<{ [key: string]: number }>({});
  const [prediction, setPrediction] = useState<number | null>(null);
  const [probability, setProbability] = useState<number | null>(null);

  // Derive boundaries (min/max) for slider inputs
  const featureBounds = useMemo(() => {
    const bounds: { [feat: string]: { min: number; max: number; mean: number } } = {};
    
    activeDataset.metadata.forEach((m) => {
      if (m.type === "numeric") {
        const vals = activeDataset.rows.map(r => Number(r[m.name])).filter(v => !isNaN(v));
        bounds[m.name] = {
          min: vals.length > 0 ? Math.min(...vals) : 0,
          max: vals.length > 0 ? Math.max(...vals) : 100,
          mean: vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 50
        };
      }
    });

    return bounds;
  }, [activeDataset]);

  // Set default inputs when predictors change
  useEffect(() => {
    if (activeChampion) {
      const defaultInputs: { [key: string]: number } = {};
      activeChampion.predictors.forEach((feat) => {
        const b = featureBounds[feat];
        defaultInputs[feat] = b ? parseFloat(b.mean.toFixed(2)) : 0;
      });
      setInputs(defaultInputs);
      setPrediction(null);
      setProbability(null);
    }
  }, [activeChampion, featureBounds]);

  const handleInputChange = (feat: string, val: number) => {
    setInputs((prev) => ({
      ...prev,
      [feat]: val,
    }));
  };

  const handleRunInference = () => {
    if (!activeChampion) return;

    let linearCombo = activeChampion.intercept || 0;
    activeChampion.predictors.forEach((feat) => {
      const weight = activeChampion.weights[feat] || 0;
      const inputVal = inputs[feat] || 0;
      linearCombo += weight * inputVal;
    });

    if (activeChampion.type === "Classification") {
      // Apply logistic sigmoid function: 1 / (1 + e^-z)
      const sigmoid = 1 / (1 + Math.exp(-linearCombo));
      setProbability(sigmoid);
      setPrediction(sigmoid >= 0.5 ? 1 : 0);
    } else {
      // Linear prediction
      setPrediction(parseFloat(linearCombo.toFixed(4)));
      setProbability(null);
    }
  };

  if (!activeChampion) {
    return (
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center flex flex-col items-center gap-4 max-w-xl mx-auto">
        <div className="w-12 h-12 rounded-full bg-slate-950/50 border border-slate-850 flex items-center justify-center text-slate-500">
          <AlertCircle className="w-6 h-6 text-slate-500 animate-pulse" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-white text-base">Inference Sandbox Locked</h3>
          <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
            Please navigate to Step 9 (Best Model Selection) and active your locked champion model to load dynamic input forms in this playground.
          </p>
        </div>
      </div>
    );
  }

  const isClassification = activeChampion.type === "Classification";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="prediction-module">
      {/* Inputs Configuration Forms */}
      <div className="lg:col-span-7 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-md flex flex-col gap-6">
        <div>
          <h2 className="font-display font-semibold text-white text-base flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-400" />
            Dynamic Inference Playground
          </h2>
          <p className="text-slate-400 text-xs">Simulate model outputs by tuning predictive vector parameters in real-time</p>
        </div>

        <div className="flex flex-col gap-5">
          {activeChampion.predictors.map((feat) => {
            const bounds = featureBounds[feat] || { min: 0, max: 100, mean: 50 };
            const currentVal = inputs[feat] ?? bounds.mean;
            return (
              <div key={feat} className="bg-slate-950/30 border border-slate-850 p-4 rounded-xl flex flex-col gap-2.5">
                <div className="flex justify-between items-center text-xs font-sans">
                  <span className="font-semibold text-slate-300">{feat}</span>
                  <span className="font-mono font-bold text-indigo-400 bg-indigo-950/40 border border-indigo-900/30 rounded px-2.5 py-0.5">
                    {currentVal}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-500 font-mono w-10 text-left">{bounds.min.toFixed(1)}</span>
                  <input
                    type="range"
                    min={bounds.min}
                    max={bounds.max}
                    step={(bounds.max - bounds.min) / 100 || 1}
                    value={currentVal}
                    onChange={(e) => handleInputChange(feat, parseFloat(e.target.value))}
                    className="flex-1 h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <span className="text-[10px] text-slate-500 font-mono w-10 text-right">{bounds.max.toFixed(1)}</span>
                </div>
              </div>
            );
          })}

          <button
            onClick={handleRunInference}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs font-semibold py-3 rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 transition flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Execute Real-time Inference</span>
          </button>
        </div>
      </div>

      {/* Inference Output / Speedometer Card */}
      <div className="lg:col-span-5 flex flex-col gap-5">
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-md flex-1 flex flex-col gap-5 justify-between">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-slate-300 font-sans text-xs font-semibold">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Inference Results Console</span>
            </div>

            {prediction === null ? (
              <div className="py-12 border border-dashed border-slate-850 rounded-xl flex flex-col items-center justify-center text-slate-500 text-xs text-center p-4">
                <Cpu className="w-8 h-8 text-slate-700 mb-2 animate-pulse" />
                <span>Configure features and click "Execute Real-time Inference" to solve linear equations</span>
              </div>
            ) : (
              <div className="bg-slate-950 border border-slate-850 rounded-xl p-5 flex flex-col gap-4 items-center text-center animate-fade-in">
                <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">PREDICTED OUTCOME</span>

                {isClassification ? (
                  <>
                    <div className="relative flex items-center justify-center w-28 h-28">
                      {/* Probability Ring */}
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="56" cy="56" r="48" className="stroke-slate-800" strokeWidth="6" fill="transparent" />
                        <circle cx="56" cy="56" r="48" className="stroke-indigo-500" strokeWidth="6" fill="transparent"
                          strokeDasharray={2 * Math.PI * 48}
                          strokeDashoffset={2 * Math.PI * 48 * (1 - (probability || 0))}
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center justify-center">
                        <span className="text-xl font-bold font-mono text-white">{((probability || 0) * 100).toFixed(0)}%</span>
                        <span className="text-[8px] font-mono uppercase text-slate-500">Confidence</span>
                      </div>
                    </div>

                    <div>
                      <span className={`text-lg font-bold uppercase tracking-tight px-3 py-1 rounded-lg ${
                        prediction === 1 ? "bg-emerald-950 text-emerald-400 border border-emerald-900/40" : "bg-rose-950/60 text-rose-400 border border-rose-900/40"
                      }`}>
                        {prediction === 1 ? "POSITIVE (1)" : "NEGATIVE (0)"}
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-2 font-sans">
                        Target Threshold locked at 0.5 probability
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="py-4">
                      <span className="text-4xl font-extrabold tracking-tight text-indigo-400 font-mono">
                        {prediction}
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-1.5 font-sans">
                        Solved output for target metric "{activeChampion.target}"
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <button
            onClick={onProceed}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-xs font-semibold py-2.5 rounded-xl shadow-lg shadow-emerald-600/10 hover:shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-4"
          >
            <span>Proceed to Deployment</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
