import React, { useState, useMemo } from "react";
import { Dataset, StatisticalTestResult } from "../types";
import { buildDataset } from "../utils/datasets";
import { calculateCorrelation, calculateTTest } from "../utils/dataMath";
import { AlertTriangle, CheckCircle, HelpCircle, RefreshCw, BarChart2, Activity, Play, ArrowRight, ShieldCheck, Info } from "lucide-react";

interface DataValidationProps {
  activeDataset: Dataset;
  onDatasetChange: (dataset: Dataset) => void;
  onProceed: () => void;
}

export default function DataValidation({ activeDataset, onDatasetChange, onProceed }: DataValidationProps) {
  const [running, setRunning] = useState(false);
  const [validated, setValidated] = useState(false);
  const [dupesCount, setDupesCount] = useState<number | null>(null);

  // Stats Testing States
  const [testType, setTestType] = useState<"correlation" | "ttest">("correlation");
  const [statVarX, setStatVarX] = useState("");
  const [statVarY, setStatVarY] = useState("");
  const [testResult, setTestResult] = useState<StatisticalTestResult | null>(null);

  const numericColumns = useMemo(() => {
    return activeDataset.metadata.filter((m) => m.type === "numeric").map((m) => m.name);
  }, [activeDataset]);

  const categoricalColumns = useMemo(() => {
    return activeDataset.metadata.filter((m) => m.type === "categorical").map((m) => m.name);
  }, [activeDataset]);

  // Run initial calculations on load
  const runDiagnostics = () => {
    setRunning(true);
    setValidated(false);
    setTimeout(() => {
      // Deduce duplicates
      const rowStrings = activeDataset.rows.map(r => JSON.stringify(r));
      const uniqueRows = new Set(rowStrings);
      const dupes = activeDataset.rows.length - uniqueRows.size;
      setDupesCount(dupes);

      // Setup default variables for testing
      if (numericColumns.length >= 2) {
        setStatVarX(numericColumns[0]);
        setStatVarY(numericColumns[1]);
      }

      setRunning(false);
      setValidated(true);
    }, 1000);
  };

  React.useEffect(() => {
    runDiagnostics();
  }, [activeDataset]);

  const handleDeduplicate = () => {
    const rowStrings = activeDataset.rows.map(r => JSON.stringify(r));
    const uniqueRowObjects = activeDataset.rows.filter((_, idx) => {
      const str = JSON.stringify(activeDataset.rows[idx]);
      return rowStrings.indexOf(str) === idx;
    });

    const dedupedDs = buildDataset(activeDataset.name + " (Cleaned)", uniqueRowObjects);
    onDatasetChange(dedupedDs);
    setDupesCount(0);
  };

  // Run Statistical Validation
  const handleRunStatisticalTest = () => {
    if (!statVarX || !statVarY) return;

    if (testType === "correlation") {
      const xVals = activeDataset.rows.map((r) => Number(r[statVarX])).filter((v) => !isNaN(v));
      const yVals = activeDataset.rows.map((r) => Number(r[statVarY])).filter((v) => !isNaN(v));
      const res = calculateCorrelation(xVals, yVals);
      setTestResult(res);
    } else {
      // Split Group Y by Boolean / Category X
      const groupAValues: number[] = [];
      const groupBValues: number[] = [];

      // Categorize Group Y based on categorical/boolean Var X
      const categories = Array.from(new Set(activeDataset.rows.map(r => String(r[statVarX]))));
      const catA = categories[0] || "Group A";
      const catB = categories[1] || "Group B";

      activeDataset.rows.forEach(r => {
        const xVal = String(r[statVarX]);
        const yVal = Number(r[statVarY]);
        if (!isNaN(yVal)) {
          if (xVal === catA) groupAValues.push(yVal);
          else groupBValues.push(yVal);
        }
      });

      const res = calculateTTest(groupAValues, groupBValues, catA, catB);
      setTestResult(res);
    }
  };

  // Health calculation
  const validationSummary = useMemo(() => {
    let healthScore = 100;
    const warnings: string[] = [];

    // Duplicate penalty
    if (dupesCount && dupesCount > 0) {
      healthScore -= 15;
      warnings.push(`Detected ${dupesCount} duplicate records in the dataset.`);
    }

    // Missing values check
    let totalMissing = 0;
    activeDataset.metadata.forEach(m => {
      if (m.missingCount > 0) {
        totalMissing += m.missingCount;
        healthScore -= Math.min(10, m.missingCount * 2);
        warnings.push(`Column "${m.name}" has ${m.missingCount} missing value(s).`);
      }
    });

    // Zero variance penalty (ID or single-value columns)
    activeDataset.metadata.forEach(m => {
      if (m.uniqueValues === 1) {
        healthScore -= 10;
        warnings.push(`Zero Variance: Column "${m.name}" has only 1 unique value.`);
      }
      if (m.uniqueValues === activeDataset.rows.length && m.type === "numeric" && m.name.toLowerCase().includes("id")) {
        warnings.push(`Identifier Column: "${m.name}" represents unique record keys.`);
      }
    });

    healthScore = Math.max(10, healthScore);

    return { healthScore, warnings, totalMissing };
  }, [activeDataset, dupesCount]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="data-validation-module">
      {/* Left Columns: Diagnostics Report */}
      <div className="lg:col-span-7 flex flex-col gap-5">
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-md flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display font-semibold text-white text-base flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                Structural Diagnostics Report
              </h2>
              <p className="text-slate-400 text-xs">Automated health evaluation for formatting and integrity</p>
            </div>
            <button
              onClick={runDiagnostics}
              disabled={running}
              className="p-2 rounded-lg border border-slate-800 hover:bg-slate-900 transition text-[10px] font-mono flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${running ? "animate-spin" : ""}`} />
              Re-Scan
            </button>
          </div>

          {running ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <span className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-slate-400 font-mono text-xs">Executing diagnostics checks...</span>
            </div>
          ) : (
            <>
              {/* Health Score Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950/40 border border-slate-850 p-4 rounded-xl items-center">
                <div className="text-center sm:text-left">
                  <span className="text-[9px] font-mono font-bold text-slate-500 uppercase block mb-1">Health Score</span>
                  <span className={`text-4xl font-extrabold tracking-tight font-mono ${
                    validationSummary.healthScore > 80 ? "text-emerald-400" : validationSummary.healthScore > 50 ? "text-amber-400" : "text-rose-400"
                  }`}>
                    {validationSummary.healthScore}%
                  </span>
                </div>
                <div className="sm:col-span-2 text-xs text-slate-400 border-t sm:border-t-0 sm:border-l border-slate-850 pt-3 sm:pt-0 sm:pl-4 leading-relaxed">
                  {validationSummary.healthScore > 80 ? (
                    <span className="text-emerald-300 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> Dataset is in optimal state!
                    </span>
                  ) : (
                    <span className="text-amber-300 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" /> Warnings require preprocessing.
                    </span>
                  )}
                  <span className="block mt-1 font-sans text-[11px] text-slate-400">
                    Total records checked: <strong>{activeDataset.rows.length}</strong>. Missing properties: <strong>{validationSummary.totalMissing}</strong>.
                  </span>
                </div>
              </div>

              {/* Actionables list */}
              <div className="flex flex-col gap-2.5">
                <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider block">Integrity Checks Detail</span>
                
                <div className="max-h-56 overflow-y-auto space-y-2 pr-1" id="warnings-list-scroll">
                  {validationSummary.warnings.length === 0 ? (
                    <div className="bg-emerald-950/10 border border-emerald-900/30 text-emerald-400 p-3 rounded-xl text-xs flex gap-2">
                      <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>Zero integrity concerns detected! The dataset is clean and validated for model calculations.</span>
                    </div>
                  ) : (
                    validationSummary.warnings.map((warn, index) => (
                      <div key={index} className="bg-amber-950/15 border border-amber-900/30 text-amber-300 p-3 rounded-xl text-xs flex gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400 animate-pulse" />
                        <span className="font-sans leading-relaxed">{warn}</span>
                      </div>
                    ))
                  )}
                </div>

                {dupesCount !== null && dupesCount > 0 && (
                  <button
                    onClick={handleDeduplicate}
                    className="mt-2 bg-indigo-600/10 border border-indigo-500/30 hover:bg-indigo-600/20 text-indigo-300 font-sans text-xs font-semibold py-2 px-4 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer self-start"
                  >
                    <span>Execute Automatic Deduplication</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right Column: Statistical Validation */}
      <div className="lg:col-span-5 flex flex-col gap-5">
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 shadow-md flex flex-col gap-4">
          <div>
            <h3 className="font-display font-semibold text-white text-sm flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-400" />
              Statistical Significance Verification
            </h3>
            <p className="text-slate-400 text-[11px] mt-0.5">Test feature relevance or differences using mathematical validation</p>
          </div>

          {/* Test setup */}
          <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-850 flex flex-col gap-3">
            <div>
              <label className="block text-[9px] font-mono font-bold text-slate-500 uppercase mb-1">Validation Test Mode</label>
              <div className="bg-slate-900 p-1 rounded-lg border border-slate-800 flex items-center" id="stat-test-tabs">
                <button
                  type="button"
                  onClick={() => {
                    setTestType("correlation");
                    setTestResult(null);
                  }}
                  className={`flex-1 text-center py-1 rounded text-[10px] font-semibold transition-all cursor-pointer ${
                    testType === "correlation" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Pearson Correlation
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTestType("ttest");
                    setTestResult(null);
                  }}
                  className={`flex-1 text-center py-1 rounded text-[10px] font-semibold transition-all cursor-pointer ${
                    testType === "ttest" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Welch T-Test
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[9px] font-mono font-bold text-slate-500 uppercase mb-1">
                  {testType === "ttest" ? "Binary Grouping (X)" : "Continuous (X)"}
                </label>
                <select
                  value={statVarX}
                  onChange={(e) => {
                    setStatVarX(e.target.value);
                    setTestResult(null);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1 px-2.5 text-xs text-slate-200 font-sans cursor-pointer focus:outline-none"
                >
                  <option value="">-- Choose --</option>
                  {testType === "correlation"
                    ? numericColumns.map((c) => <option key={c} value={c}>{c}</option>)
                    : categoricalColumns.concat(
                        activeDataset.columns.filter((c) => {
                          const uniq = new Set(activeDataset.rows.map(r => r[c]));
                          return uniq.size === 2;
                        })
                      ).map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-mono font-bold text-slate-500 uppercase mb-1">Continuous Outcome (Y)</label>
                <select
                  value={statVarY}
                  onChange={(e) => {
                    setStatVarY(e.target.value);
                    setTestResult(null);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1 px-2.5 text-xs text-slate-200 font-sans cursor-pointer focus:outline-none"
                >
                  <option value="">-- Choose --</option>
                  {numericColumns.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <button
              onClick={handleRunStatisticalTest}
              disabled={!statVarX || !statVarY}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-sans text-xs font-semibold py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3 h-3 fill-white" />
              <span>Validate Hypothesis Significance</span>
            </button>
          </div>

          {/* Test Result Display */}
          {testResult ? (
            <div className="bg-slate-950/40 border border-slate-850 rounded-xl p-3 flex flex-col gap-2 font-sans text-xs">
              <span className="font-mono text-[9px] text-slate-500 uppercase font-bold tracking-wider">{testResult.statisticName}</span>
              <div className="flex justify-between items-center text-[11px] border-b border-slate-850/50 pb-2">
                <span className="text-slate-400">Statistic Value: <strong className="font-mono text-slate-200">{testResult.statisticValue}</strong></span>
                <span className="text-slate-400">P-Value: <strong className={`font-mono ${testResult.pValue < 0.05 ? "text-emerald-400" : "text-rose-400"}`}>{testResult.pValue}</strong></span>
              </div>
              <p className="text-slate-300 text-[11px] leading-normal flex gap-1.5 items-start">
                <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                <span>{testResult.interpretation}</span>
              </p>
            </div>
          ) : (
            <div className="border border-dashed border-slate-850 rounded-xl p-6 text-center text-slate-500 text-[11px] font-sans">
              Run test to verify significance of feature relationships
            </div>
          )}

          <button
            onClick={onProceed}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-xs font-semibold py-2.5 rounded-xl shadow-lg shadow-emerald-600/10 hover:shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
          >
            <span>Proceed to Data Preprocessing</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
