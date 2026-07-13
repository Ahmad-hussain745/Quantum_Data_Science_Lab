import React, { useMemo } from "react";
import { SavedModelRun } from "../types";
import { AlertCircle, ArrowRight, Award, CheckCircle2, Star, TableProperties } from "lucide-react";

interface BestModelSelectionProps {
  modelRuns: SavedModelRun[];
  activeChampion: SavedModelRun | null;
  onSelectChampion: (model: SavedModelRun) => void;
  onProceed: () => void;
}

export default function BestModelSelection({ modelRuns, activeChampion, onSelectChampion, onProceed }: BestModelSelectionProps) {

  // Automatically find the best model based on accuracy (for classification) or R2 (for regression)
  const autoChampion = useMemo(() => {
    if (modelRuns.length === 0) return null;

    let bestModel = modelRuns[0];
    let bestScore = -Infinity;

    modelRuns.forEach((run) => {
      let score = 0;
      if (run.type === "Classification") {
        score = run.metrics.accuracy || 0;
      } else {
        score = run.metrics.r2 || 0;
      }

      if (score > bestScore) {
        bestScore = score;
        bestModel = run;
      }
    });

    return bestModel;
  }, [modelRuns]);

  // Handle auto locking on load if no active champion is selected yet
  React.useEffect(() => {
    if (autoChampion && !activeChampion) {
      onSelectChampion(autoChampion);
    }
  }, [autoChampion, activeChampion, onSelectChampion]);

  if (modelRuns.length === 0) {
    return (
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center flex flex-col items-center gap-4 max-w-xl mx-auto">
        <div className="w-12 h-12 rounded-full bg-slate-950/50 border border-slate-850 flex items-center justify-center text-slate-500">
          <AlertCircle className="w-6 h-6 text-slate-500 animate-pulse" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-white text-base">Run Registry is Empty</h3>
          <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
            Please navigate to Step 7 (Model Training) and execute one or more training runs. Multiple runs will be compiled in this leaderboard to compare performance scores.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6" id="best-model-selection-module">
      {/* Champion locked card */}
      {activeChampion && (
        <div className="bg-gradient-to-r from-indigo-950/40 to-slate-900/30 border border-indigo-500/30 rounded-2xl p-5 md:p-6 shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex gap-3">
            <div className="w-11 h-11 bg-indigo-500/10 rounded-xl border border-indigo-500/30 flex items-center justify-center shrink-0 text-indigo-400">
              <Star className="w-5 h-5 text-indigo-400 fill-indigo-400/20" />
            </div>
            <div>
              <span className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-widest block">Active Champion Model Locked</span>
              <h3 className="font-display font-semibold text-white text-sm mt-0.5">{activeChampion.name}</h3>
              <p className="text-[10px] text-slate-400 mt-1 font-mono">
                Predictors: [<strong>{activeChampion.predictors.join(", ")}</strong>] · Intercept: <strong>{activeChampion.intercept}</strong>
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-center shrink-0 self-stretch sm:self-auto justify-between border-t sm:border-0 border-slate-800/50 pt-3 sm:pt-0">
            <div className="text-right">
              <span className="text-[9px] font-mono text-slate-500 uppercase block">Target Variable</span>
              <span className="text-xs font-semibold text-indigo-300 font-mono">{activeChampion.target}</span>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div className="text-right">
              <span className="text-[9px] font-mono text-slate-500 uppercase block">Score Metric</span>
              <span className="text-sm font-bold text-emerald-400 font-mono">
                {activeChampion.type === "Classification" 
                  ? `Acc: ${((activeChampion.metrics.accuracy || 0.8) * 100).toFixed(1)}%`
                  : `R²: ${(activeChampion.metrics.r2 || 0).toFixed(4)}`}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard registry table */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-md flex flex-col gap-5">
        <div>
          <h2 className="font-display font-semibold text-white text-base flex items-center gap-2">
            <TableProperties className="w-4 h-4 text-indigo-400" />
            Model Selection Leaderboard
          </h2>
          <p className="text-slate-400 text-xs">All model versions trained during this session. Select a champion version to deploy or test</p>
        </div>

        <div className="overflow-x-auto border border-slate-850 rounded-xl" id="leaderboard-table-wrapper">
          <table className="w-full text-left font-sans text-xs">
            <thead className="bg-slate-950/50 border-b border-slate-800 text-[9px] font-mono font-bold text-slate-500 uppercase">
              <tr>
                <th className="p-3">Rank / Status</th>
                <th className="p-3">Model Label</th>
                <th className="p-3">Target</th>
                <th className="p-3">Type</th>
                <th className="p-3 text-right">Performance Score</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {modelRuns.map((run, idx) => {
                const isAutoChampion = autoChampion?.id === run.id;
                const isSelectedChampion = activeChampion?.id === run.id;
                const scoreStr = run.type === "Classification"
                  ? `Accuracy: ${((run.metrics.accuracy || 0) * 100).toFixed(1)}%`
                  : `R²: ${(run.metrics.r2 || 0).toFixed(4)}`;

                return (
                  <tr key={run.id} className={`border-b border-slate-900/50 hover:bg-slate-900/30 ${
                    isSelectedChampion ? "bg-indigo-950/10" : ""
                  }`}>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-500 font-bold">#{idx + 1}</span>
                        {isAutoChampion && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[8px] font-mono font-bold uppercase flex items-center gap-0.5 shrink-0">
                            <Star className="w-2.5 h-2.5 fill-amber-500" /> Best Performance
                          </span>
                        )}
                        {isSelectedChampion && (
                          <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[8px] font-mono font-bold uppercase flex items-center gap-0.5 shrink-0">
                            Active
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 font-medium text-slate-200">
                      <div>
                        <span className="block">{run.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono mt-0.5 font-light">Trained: {run.timestamp}</span>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-slate-400">{run.target}</td>
                    <td className="p-3">
                      <span className={`text-[8px] uppercase font-mono font-bold px-1.5 py-0.5 rounded ${
                        run.type === "Classification" ? "bg-emerald-950 text-emerald-400 border border-emerald-900/30" : "bg-purple-950 text-purple-400 border border-purple-900/30"
                      }`}>
                        {run.type}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-200">
                      {scoreStr}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onSelectChampion(run)}
                        className={`px-3 py-1 rounded-lg text-[10px] font-semibold transition cursor-pointer ${
                          isSelectedChampion
                            ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
                            : "bg-slate-950 hover:bg-slate-900 text-slate-300 border border-slate-800"
                        }`}
                      >
                        {isSelectedChampion ? "Locked" : "Select Champion"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <button
          onClick={onProceed}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-xs font-semibold py-2.5 rounded-xl shadow-lg shadow-emerald-600/10 hover:shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
        >
          <span>Proceed to Save Model</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
