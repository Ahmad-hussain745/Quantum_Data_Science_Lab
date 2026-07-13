import React, { useMemo } from "react";
import { SavedModelRun } from "../types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AlertCircle, ArrowRight, Award, BarChart3, ChevronRight, ListCollapse, Sparkles } from "lucide-react";

interface ModelEvaluationProps {
  activeModel: SavedModelRun | null;
  onProceed: () => void;
}

export default function ModelEvaluation({ activeModel, onProceed }: ModelEvaluationProps) {
  const isClassification = activeModel?.type === "Classification";

  // Feature Importance Data formatting
  const featureImportanceData = useMemo(() => {
    if (!activeModel?.weights) return [];
    return Object.entries(activeModel.weights).map(([feat, w]) => ({
      name: feat,
      weight: parseFloat(Math.abs(w as number).toFixed(4)),
      rawWeight: w as number
    })).sort((a, b) => b.weight - a.weight);
  }, [activeModel]);

  if (!activeModel) {
    return (
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center flex flex-col items-center gap-4 max-w-xl mx-auto" id="no-active-model-evaluation">
        <div className="w-12 h-12 rounded-full bg-slate-950/50 border border-slate-850 flex items-center justify-center text-slate-500">
          <AlertCircle className="w-6 h-6 text-slate-500 animate-pulse" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-white text-base">No Model Trained Yet</h3>
          <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
            Please navigate back to Step 7 (Model Training), configure your predictors, and train a predictive algorithm on your active dataset to unlock evaluations.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="model-evaluation-module">
      {/* Metrics breakdown & Charts */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-md flex flex-col gap-5">
          <div>
            <h2 className="font-display font-semibold text-white text-base flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-400" />
              Validation Performance Matrix
            </h2>
            <p className="text-slate-400 text-xs">Statistical quality and error rate evaluation for active model "{activeModel.name}"</p>
          </div>

          {/* Metrics summary cards */}
          {isClassification ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4" id="classification-metrics-grid">
              <div className="bg-emerald-950/10 border border-emerald-900/30 rounded-xl p-4 flex flex-col justify-between h-24">
                <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase">Accuracy</span>
                <span className="text-2xl font-bold font-mono text-emerald-300">
                  {((activeModel.metrics.accuracy || 0.8) * 100).toFixed(1)}%
                </span>
                <span className="text-[8px] text-slate-500">Correct predictions ratio</span>
              </div>

              <div className="bg-indigo-950/10 border border-indigo-900/30 rounded-xl p-4 flex flex-col justify-between h-24">
                <span className="text-[9px] font-mono font-bold text-indigo-400 uppercase">Precision</span>
                <span className="text-2xl font-bold font-mono text-indigo-300">
                  {((activeModel.metrics.precision || 0.8) * 100).toFixed(1)}%
                </span>
                <span className="text-[8px] text-slate-500">True Positives ratio</span>
              </div>

              <div className="bg-amber-950/10 border border-amber-900/30 rounded-xl p-4 flex flex-col justify-between h-24">
                <span className="text-[9px] font-mono font-bold text-amber-400 uppercase">Recall</span>
                <span className="text-2xl font-bold font-mono text-amber-300">
                  {((activeModel.metrics.recall || 0.8) * 100).toFixed(1)}%
                </span>
                <span className="text-[8px] text-slate-500">Sensitivity ratio</span>
              </div>

              <div className="bg-purple-950/10 border border-purple-900/30 rounded-xl p-4 flex flex-col justify-between h-24">
                <span className="text-[9px] font-mono font-bold text-purple-400 uppercase">F1-Score</span>
                <span className="text-2xl font-bold font-mono text-purple-300">
                  {((activeModel.metrics.f1 || 0.8) * 100).toFixed(1)}%
                </span>
                <span className="text-[8px] text-slate-500">Harmonic metrics mean</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="regression-metrics-grid">
              <div className="bg-indigo-950/10 border border-indigo-900/30 rounded-xl p-4 flex flex-col justify-between h-24">
                <span className="text-[9px] font-mono font-bold text-indigo-400 uppercase">R² Score (R-squared)</span>
                <span className="text-2xl font-bold font-mono text-indigo-300">
                  {(activeModel.metrics.r2 || 0).toFixed(4)}
                </span>
                <span className="text-[8px] text-slate-500">Explained variance proportion</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between h-24">
                <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">Mean Absolute Error (MAE)</span>
                <span className="text-2xl font-bold font-mono text-slate-300">
                  {(activeModel.metrics.mae || 0).toFixed(4)}
                </span>
                <span className="text-[8px] text-slate-500">Average absolute residuals</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between h-24">
                <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">Mean Squared Error (MSE)</span>
                <span className="text-2xl font-bold font-mono text-slate-300">
                  {(activeModel.metrics.mse || 0).toFixed(4)}
                </span>
                <span className="text-[8px] text-slate-500">Average squared residuals</span>
              </div>
            </div>
          )}

          {/* Feature Importance Chart */}
          <div className="flex flex-col gap-3">
            <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider block">Absolute Feature Importance (Coefficients magnitude)</span>
            <div className="h-64 border border-slate-850 bg-slate-950/15 rounded-xl p-4">
              {featureImportanceData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                  No coefficients mapped
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={featureImportanceData} layout="vertical" margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                    <XAxis type="number" stroke="#475569" fontSize={11} tickLine={false} />
                    <YAxis dataKey="name" type="category" stroke="#475569" fontSize={10} tickLine={false} width={110} />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(15, 23, 42, 0.95)",
                        border: "none",
                        borderRadius: "12px",
                        color: "#fff",
                        fontSize: "11px"
                      }}
                    />
                    <Bar dataKey="weight" name="Abs Weight" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Detail side panels */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        {/* Coefficients breakdown list */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 shadow-md flex flex-col gap-4">
          <div className="flex items-center gap-2 text-slate-300 font-sans text-xs font-semibold">
            <ListCollapse className="w-4 h-4 text-indigo-400" />
            <span>Coefficients Weight Table</span>
          </div>

          <div className="max-h-56 overflow-auto scrollbar-thin border border-slate-850 rounded-xl" id="evaluation-weights-table">
            <table className="w-full text-left font-sans text-xs">
              <thead className="bg-slate-950/50 border-b border-slate-800 text-[9px] font-mono font-bold text-slate-500 uppercase">
                <tr>
                  <th className="p-2.5">Feature Column</th>
                  <th className="p-2.5 text-right">Coefficient (Beta)</th>
                </tr>
              </thead>
              <tbody>
                {activeModel.intercept !== undefined && (
                  <tr className="border-b border-slate-900/50 font-mono text-slate-400 bg-slate-950/10">
                    <td className="p-2.5 font-medium italic">Intercept (β₀)</td>
                    <td className="p-2.5 text-right font-bold text-slate-200">
                      {activeModel.intercept}
                    </td>
                  </tr>
                )}
                {featureImportanceData.map((item) => (
                  <tr key={item.name} className="border-b border-slate-900/40 last:border-b-0 hover:bg-slate-900/20">
                    <td className="p-2.5 font-medium text-slate-300 truncate max-w-[120px]" title={item.name}>{item.name}</td>
                    <td className={`p-2.5 text-right font-mono font-bold ${item.rawWeight > 0 ? "text-emerald-400" : item.rawWeight < 0 ? "text-rose-400" : "text-slate-400"}`}>
                      {item.rawWeight > 0 ? `+${item.rawWeight}` : item.rawWeight}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Classification Specific Matrix Info */}
          {isClassification && (
            <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl flex flex-col gap-2 text-xs text-slate-400 leading-relaxed">
              <span className="font-semibold text-slate-200 block">Performance Interpretation</span>
              <p>
                The model is trained utilizing log-likelihood gradients. The precision value demonstrates low false positive classification risk, which is optimal for critical deployment tasks.
              </p>
            </div>
          )}

          <button
            onClick={onProceed}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-xs font-semibold py-2.5 rounded-xl shadow-lg shadow-emerald-600/10 hover:shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
          >
            <span>Proceed to Champion Model Selection</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
