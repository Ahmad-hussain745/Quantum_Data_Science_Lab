import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Dataset, DatasetRow } from "../types";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
  LineChart,
  Line
} from "recharts";
import {
  ShieldAlert,
  Sliders,
  Play,
  CheckCircle,
  Clock,
  Terminal,
  Trash2,
  Download,
  Sparkles,
  Info,
  Layers,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle
} from "lucide-react";

interface AnomalyDetectorProps {
  activeDataset: Dataset;
  onDatasetChange: (updated: Dataset) => void;
  onProceed?: () => void;
}

// Minimalist Isolation Tree Node interface for our real forest
interface ITreeNode {
  feature?: string;
  splitValue?: number;
  left?: ITreeNode;
  right?: ITreeNode;
  size: number;
}

export default function AnomalyDetector({
  activeDataset,
  onDatasetChange,
  onProceed
}: AnomalyDetectorProps) {
  const numericColumns = useMemo(() => {
    return activeDataset.metadata.filter((m) => m.type === "numeric").map((m) => m.name);
  }, [activeDataset]);

  // Detector States
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [xAxisFeature, setXAxisFeature] = useState<string>("");
  const [yAxisFeature, setYAxisFeature] = useState<string>("");
  const [contamination, setContamination] = useState<number>(5); // percentage (1-20%)
  const [algorithm, setAlgorithm] = useState<"isolation_forest" | "robust_zscore">("isolation_forest");
  const [treeCount, setTreeCount] = useState<number>(30);

  // Simulation & Logs States
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [logs, setLogs] = useState<string[]>([]);

  // Result States
  const [anomalyScores, setAnomalyScores] = useState<number[]>([]);
  const [flaggedIndices, setFlaggedIndices] = useState<Set<number>>(new Set());
  const [stats, setStats] = useState<{
    anomalyCount: number;
    normalCount: number;
    avgScore: number;
    maxScore: number;
  } | null>(null);

  // Set default features
  useEffect(() => {
    if (numericColumns.length >= 2) {
      setSelectedFeatures(numericColumns.slice(0, Math.min(4, numericColumns.length)));
      setXAxisFeature(numericColumns[0]);
      setYAxisFeature(numericColumns[1]);
    } else if (numericColumns.length === 1) {
      setSelectedFeatures([numericColumns[0]]);
      setXAxisFeature(numericColumns[0]);
      setYAxisFeature(numericColumns[0]);
    }
    // reset previous run results
    setAnomalyScores([]);
    setFlaggedIndices(new Set());
    setStats(null);
  }, [activeDataset, numericColumns]);

  // Euler-Mascheroni constant approximation helper for BST path length
  const c = (n: number): number => {
    if (n <= 1) return 0;
    if (n === 2) return 1;
    return 2 * (Math.log(n - 1) + 0.5772156649) - (2 * (n - 1)) / n;
  };

  // Build a single Isolation Tree recursively
  const buildITree = (data: DatasetRow[], currentDepth: number, maxDepth: number, features: string[]): ITreeNode => {
    const size = data.length;
    if (currentDepth >= maxDepth || size <= 1) {
      return { size };
    }

    // Select random feature
    const feature = features[Math.floor(Math.random() * features.length)];
    const values = data.map(d => Number(d[feature] ?? 0));
    const min = Math.min(...values);
    const max = Math.max(...values);

    if (min === max) {
      return { size };
    }

    // Random split value
    const splitValue = min + Math.random() * (max - min);

    const leftData = data.filter(d => Number(d[feature] ?? 0) < splitValue);
    const rightData = data.filter(d => Number(d[feature] ?? 0) >= splitValue);

    return {
      feature,
      splitValue,
      size,
      left: buildITree(leftData, currentDepth + 1, maxDepth, features),
      right: buildITree(rightData, currentDepth + 1, maxDepth, features)
    };
  };

  // Evaluate path length of a row in an Isolation Tree
  const pathLength = (row: DatasetRow, node: ITreeNode, currentDepth: number): number => {
    if (!node.left || !node.right || !node.feature || node.splitValue === undefined) {
      return currentDepth + c(node.size);
    }
    const val = Number(row[node.feature] ?? 0);
    if (val < node.splitValue) {
      return pathLength(row, node.left, currentDepth + 1);
    } else {
      return pathLength(row, node.right, currentDepth + 1);
    }
  };

  // Main Anomaly Analysis Execution
  const handleAnalyze = () => {
    if (selectedFeatures.length === 0) {
      setLogs(["[ERROR] No analysis features selected. Please select at least one numeric feature."]);
      return;
    }

    setIsAnalyzing(true);
    setProgress(10);
    setLogs([
      `[INFO] Starting Unsupervised Anomaly Detection pipeline...`,
      `[INFO] Selected Algorithm: ${algorithm === "isolation_forest" ? "Isolation Forest (IForest)" : "Robust Multi-column Z-Score"}`,
      `[INFO] Target Features: [${selectedFeatures.join(", ")}]`,
      `[INFO] Contamination Factor: ${contamination}% (Tolerance: ${100 - contamination}%)`,
      `[DATA] Total dataset size to analyze: ${activeDataset.rows.length} records.`
    ]);

    let timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(timer);
          return 90;
        }
        return prev + 15;
      });
    }, 150);

    setTimeout(() => {
      try {
        const rows = activeDataset.rows;
        const n = rows.length;
        let scores: number[] = [];

        if (algorithm === "isolation_forest") {
          // --- ISOLATION FOREST IMPLEMENTATION ---
          setLogs(prev => [
            ...prev,
            `[ENGINE] Initializing Forest with ${treeCount} randomized decision trees...`,
            `[ENGINE] Max Tree Depth limit set to ${Math.ceil(Math.log2(Math.max(2, n)))} nodes.`
          ]);

          const maxDepth = Math.ceil(Math.log2(Math.max(2, n)));
          const forest: ITreeNode[] = [];

          // Generate trees
          for (let i = 0; i < treeCount; i++) {
            forest.push(buildITree(rows, 0, maxDepth, selectedFeatures));
          }

          setLogs(prev => [
            ...prev,
            `[ENGINE] Successfully grown ${treeCount} trees. Computing anomaly index for each record...`
          ]);

          // Compute path lengths and anomaly scores
          const avgC = c(n);
          scores = rows.map(row => {
            let totalPathLength = 0;
            forest.forEach(tree => {
              totalPathLength += pathLength(row, tree, 0);
            });
            const meanPathLength = totalPathLength / treeCount;
            // s(x, n) = 2 ^ (- E(h(x)) / c(n))
            return avgC > 0 ? Math.pow(2, -meanPathLength / avgC) : 0.5;
          });

        } else {
          // --- ROBUST MULTIVARIATE Z-SCORE ---
          setLogs(prev => [
            ...prev,
            `[ENGINE] Calculating robust means and standard deviations...`
          ]);

          // Calculate mean and std for each feature
          const featureStats = selectedFeatures.map(feat => {
            const vals = rows.map(r => Number(r[feat] ?? 0));
            const mean = vals.reduce((s, v) => s + v, 0) / n;
            const variance = vals.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / n;
            const std = Math.sqrt(variance) || 1e-5;
            return { feat, mean, std };
          });

          // Composite standard normalized score
          scores = rows.map(row => {
            let sumZ = 0;
            featureStats.forEach(({ feat, mean, std }) => {
              const val = Number(row[feat] ?? 0);
              const z = Math.abs((val - mean) / std);
              sumZ += z * z; // squared distance / multivariate distance
            });
            // Normalize to a 0.0 - 1.0 interval score approximation
            const rawDist = Math.sqrt(sumZ / selectedFeatures.length);
            return Math.min(1.0, rawDist / 3.5); // scaled so that standard z=3.5 maps close to 1.0
          });
        }

        // Determine dynamic threshold based on contamination percentile
        const sortedScores = [...scores].sort((a, b) => b - a);
        const thresholdIdx = Math.floor(n * (contamination / 100));
        const scoreThreshold = sortedScores[Math.max(0, Math.min(n - 1, thresholdIdx))];

        const flagged = new Set<number>();
        scores.forEach((score, idx) => {
          if (score >= scoreThreshold) {
            flagged.add(idx);
          }
        });

        const anomalyCount = flagged.size;
        const normalCount = n - anomalyCount;
        const avgScore = scores.reduce((s, v) => s + v, 0) / n;
        const maxScore = Math.max(...scores);

        clearInterval(timer);
        setProgress(100);
        setIsAnalyzing(false);

        setAnomalyScores(scores);
        setFlaggedIndices(flagged);
        setStats({
          anomalyCount,
          normalCount,
          avgScore,
          maxScore
        });

        setLogs(prev => [
          ...prev,
          `[SUCCESS] Anomaly scoring completed!`,
          `[RESULTS] Outliers flagged: ${anomalyCount} (Contamination target: ${contamination}%)`,
          `[RESULTS] Normal points: ${normalCount}`,
          `[RESULTS] Cutoff Score: ${scoreThreshold.toFixed(4)}`
        ]);

      } catch (err: any) {
        clearInterval(timer);
        setIsAnalyzing(false);
        setLogs(prev => [...prev, `[FATAL] Anomaly analysis failed: ${err.message}`]);
      }
    }, 800);
  };

  // Filter Outliers out of the dataset entirely
  const handlePurgeAnomalies = () => {
    if (flaggedIndices.size === 0) return;
    
    const originalCount = activeDataset.rows.length;
    const cleanRows = activeDataset.rows.filter((_, idx) => !flaggedIndices.has(idx));
    
    // Recompute metadata missing counts & stats
    const updatedDataset: Dataset = {
      ...activeDataset,
      rows: cleanRows,
      name: `${activeDataset.name} (Anomalies Cleaned)`
    };

    onDatasetChange(updatedDataset);
    
    setLogs(prev => [
      ...prev,
      `[CLEANUP] Purged ${originalCount - cleanRows.length} outlier rows.`,
      `[CLEANUP] Current Active Row Count is now: ${cleanRows.length}.`,
      `[SUCCESS] Active workspace dataset has been refreshed.`
    ]);

    // reset results list since indices are now stale
    setAnomalyScores([]);
    setFlaggedIndices(new Set());
    setStats(null);
  };

  // Combined data specifically prepared for Scatter Plotting
  const scatterPlotData = useMemo(() => {
    if (anomalyScores.length === 0) return [];
    return activeDataset.rows.map((row, idx) => ({
      x: Number(row[xAxisFeature] ?? 0),
      y: Number(row[yAxisFeature] ?? 0),
      score: anomalyScores[idx],
      isAnomaly: flaggedIndices.has(idx),
      index: idx
    }));
  }, [activeDataset, anomalyScores, flaggedIndices, xAxisFeature, yAxisFeature]);

  // Outlier distribution data for binned histogram chart
  const distributionData = useMemo(() => {
    if (anomalyScores.length === 0) return [];
    const bins = Array(10).fill(0);
    anomalyScores.forEach(score => {
      const bIdx = Math.min(9, Math.floor(score * 10));
      bins[bIdx]++;
    });
    return bins.map((count, i) => ({
      range: `${(i / 10).toFixed(1)}-${((i + 1) / 10).toFixed(1)}`,
      count
    }));
  }, [anomalyScores]);

  // Selected Outliers list
  const outlierList = useMemo(() => {
    if (anomalyScores.length === 0) return [];
    return activeDataset.rows
      .map((row, idx) => ({
        row,
        idx,
        score: anomalyScores[idx]
      }))
      .filter(item => flaggedIndices.has(item.idx))
      .sort((a, b) => b.score - a.score);
  }, [activeDataset, anomalyScores, flaggedIndices]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* Upper Module Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-rose-500/20 bg-slate-950 p-6 md:p-8 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-rose-600/10 via-fuchsia-600/5 to-transparent pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-[10px] font-mono font-semibold text-rose-400 uppercase tracking-widest">Advanced ML Suite</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-sans font-bold tracking-tight text-white">
              Unsupervised Anomaly & Fraud Detector
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl font-sans">
              Isolate anomalous behavior, flag multi-dimensional fraud indices, and purge outlier vectors instantly using recursive in-browser <strong className="text-slate-200">Isolation Forests (IForest)</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Side Controls Column */}
        <div className="lg:col-span-1 space-y-6">
          
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-5 backdrop-blur-xl">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
              <Sliders className="w-3.5 h-3.5 text-rose-400" />
              Engine Configuration
            </h3>

            {/* Algorithm picker */}
            <div className="space-y-2">
              <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase">Detection Algorithm</label>
              <select
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-1 focus:ring-rose-500 focus:outline-none cursor-pointer"
              >
                <option value="isolation_forest">Isolation Forest (Non-linear)</option>
                <option value="robust_zscore">Robust Z-Score (Distance-based)</option>
              </select>
            </div>

            {/* Contamination Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-mono font-bold text-slate-500 uppercase">
                <span>Contamination Ratio</span>
                <span className="text-rose-400">{contamination}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                value={contamination}
                onChange={(e) => setContamination(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
              <div className="flex justify-between text-[9px] text-slate-500">
                <span>1% (Tight)</span>
                <span>20% (Aggressive)</span>
              </div>
            </div>

            {/* Tree Count (only for Isolation Forest) */}
            {algorithm === "isolation_forest" && (
              <div className="space-y-2">
                <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase">Forest Trees Density</label>
                <select
                  value={treeCount}
                  onChange={(e) => setTreeCount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-1 focus:ring-rose-500 focus:outline-none cursor-pointer"
                >
                  <option value={15}>15 Trees (Fast)</option>
                  <option value={30}>30 Trees (Balanced)</option>
                  <option value={50}>50 Trees (Robust)</option>
                </select>
              </div>
            )}

            {/* Analysis Feature Checklist */}
            <div className="space-y-2 pt-2 border-t border-slate-800/60">
              <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase mb-2">Analysis Dimensions (X-Vector)</label>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {numericColumns.map(col => {
                  const isChecked = selectedFeatures.includes(col);
                  return (
                    <label key={col} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-950/40 border border-slate-800/40 hover:bg-slate-950 text-xs text-slate-300 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked) {
                            setSelectedFeatures(prev => prev.filter(f => f !== col));
                          } else {
                            setSelectedFeatures(prev => [...prev, col]);
                          }
                        }}
                        className="rounded border-slate-800 text-rose-500 focus:ring-rose-500 h-3.5 w-3.5"
                      />
                      <span className="truncate font-mono text-[11px]">{col}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Execution Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAnalyze}
              disabled={isAnalyzing || selectedFeatures.length === 0}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-fuchsia-600 hover:from-rose-500 hover:to-fuchsia-500 text-xs font-bold text-white shadow-lg shadow-rose-500/10 transition-all duration-150 cursor-pointer disabled:opacity-50"
            >
              {isAnalyzing ? "Growing Isolation Forest..." : "Run Outlier Analysis"}
            </motion.button>
          </div>

          {/* Clean / Filter Actions panel */}
          {stats && stats.anomalyCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-rose-500/20 bg-rose-950/5 p-4 space-y-3"
            >
              <h4 className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                Data Cleansing Actions
              </h4>
              <p className="text-[11px] text-slate-400 font-sans">
                Eradicate the {stats.anomalyCount} identified outliers instantly from your active dataset to prevent model bias during future steps.
              </p>
              <button
                onClick={handlePurgeAnomalies}
                className="w-full py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-[11px] font-bold text-white shadow transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Purge All Anomalies
              </button>
            </motion.div>
          )}

        </div>

        {/* Right Side Plots & Details Column */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Dashboard Tabs / Progress */}
          <AnimatePresence>
            {isAnalyzing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3"
              >
                <div className="flex justify-between text-xs font-semibold text-slate-300">
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-rose-400" />
                    Executing algorithm kernels...
                  </span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-rose-500 to-fuchsia-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Initial state placeholder */}
          {!stats && !isAnalyzing && (
            <div className="text-center py-24 border border-slate-800 border-dashed rounded-3xl bg-slate-900/10 text-slate-500 space-y-3">
              <ShieldAlert className="w-12 h-12 mx-auto text-slate-700 animate-pulse" />
              <h3 className="text-sm font-semibold text-slate-300">Analysis Engine Ready</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Configure your dimensions and run the outlier detection model to discover anomalies, view distributions, and prune noisy records.
              </p>
            </div>
          )}

          {/* Statistics Summary Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in">
              <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl">
                <span className="text-[9px] font-mono text-slate-500 block uppercase">Total Flagged</span>
                <span className="text-2xl font-bold text-rose-400 font-mono">{stats.anomalyCount}</span>
                <span className="text-[9px] text-rose-500/80 block mt-1">{( (stats.anomalyCount / activeDataset.rows.length) * 100).toFixed(1)}% of rows</span>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl">
                <span className="text-[9px] font-mono text-slate-500 block uppercase">Clean Records</span>
                <span className="text-2xl font-bold text-emerald-400 font-mono">{stats.normalCount}</span>
                <span className="text-[9px] text-slate-500 block mt-1">Normal distributions</span>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl">
                <span className="text-[9px] font-mono text-slate-500 block uppercase">Average Score</span>
                <span className="text-2xl font-bold text-white font-mono">{stats.avgScore.toFixed(3)}</span>
                <span className="text-[9px] text-slate-500 block mt-1">Theoretical baseline</span>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl">
                <span className="text-[9px] font-mono text-slate-500 block uppercase">Max Anomaly Score</span>
                <span className="text-2xl font-bold text-fuchsia-400 font-mono">{stats.maxScore.toFixed(3)}</span>
                <span className="text-[9px] text-slate-500 block mt-1">Most isolated index</span>
              </div>
            </div>
          )}

          {/* Charts Row */}
          {stats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
              
              {/* Scatter Plot */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5 space-y-4">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-rose-400" />
                    2D Outliers Cluster Plot
                  </h3>
                  
                  {/* Scatter axis toggles */}
                  <div className="flex gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800/80">
                    <select
                      value={xAxisFeature}
                      onChange={(e) => setXAxisFeature(e.target.value)}
                      className="bg-transparent text-[10px] text-slate-300 font-mono focus:outline-none"
                    >
                      {numericColumns.map(f => <option key={f} value={f}>X: {f}</option>)}
                    </select>
                    <select
                      value={yAxisFeature}
                      onChange={(e) => setYAxisFeature(e.target.value)}
                      className="bg-transparent text-[10px] text-slate-300 font-mono focus:outline-none"
                    >
                      {numericColumns.map(f => <option key={f} value={f}>Y: {f}</option>)}
                    </select>
                  </div>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis
                        type="number"
                        dataKey="x"
                        name={xAxisFeature}
                        stroke="#64748b"
                        tick={{ fontSize: 9 }}
                        label={{ value: xAxisFeature, position: "insideBottomRight", offset: -5, fontSize: 8, fill: "#64748b" }}
                      />
                      <YAxis
                        type="number"
                        dataKey="y"
                        name={yAxisFeature}
                        stroke="#64748b"
                        tick={{ fontSize: 9 }}
                        label={{ value: yAxisFeature, angle: -90, position: "insideLeft", fontSize: 8, fill: "#64748b" }}
                      />
                      <Tooltip
                        cursor={{ strokeDasharray: "3 3" }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg space-y-1 shadow-xl">
                                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded block ${data.isAnomaly ? "bg-rose-500/10 border border-rose-500/20 text-rose-400" : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"}`}>
                                  {data.isAnomaly ? "ANOMALOUS OUTLIER" : "NORMAL POINT"}
                                </span>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  <div>X ({xAxisFeature}): <strong className="text-white">{data.x}</strong></div>
                                  <div>Y ({yAxisFeature}): <strong className="text-white">{data.y}</strong></div>
                                  <div>Score: <strong className="text-rose-400">{data.score.toFixed(4)}</strong></div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Scatter name="Normal" data={scatterPlotData.filter(d => !d.isAnomaly)} fill="#10b981" opacity={0.6} />
                      <Scatter name="Anomaly" data={scatterPlotData.filter(d => d.isAnomaly)} fill="#ef4444" opacity={0.95} />
                      <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 10 }} />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Score Distribution Chart */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5 space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-fuchsia-400" />
                  Isolation Score Distribution Curve
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={distributionData} margin={{ top: 10, right: 10, bottom: 10, left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="range" stroke="#64748b" tick={{ fontSize: 9 }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 9 }} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-slate-950 border border-slate-800 p-2 rounded-lg text-xs font-mono text-slate-300 shadow">
                                Range: <strong className="text-white">{payload[0].payload.range}</strong>
                                <br />
                                Count: <strong className="text-fuchsia-400">{payload[0].value}</strong> rows
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="count" fill="#d946ef">
                        {distributionData.map((entry, index) => {
                          // Color higher scores (outliers) bright red
                          const color = index >= 7 ? "#f43f5e" : "#8b5cf6";
                          return <Cell key={`cell-${index}`} fill={color} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          )}

          {/* Outliers inspection table */}
          {stats && stats.anomalyCount > 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/30 overflow-hidden space-y-2 animate-fade-in">
              <div className="px-5 py-3 border-b border-slate-800/80 flex justify-between items-center bg-slate-900/60">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  Detailed Outlier Audit Trail
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  Showing top {Math.min(10, stats.anomalyCount)} anomalous vectors
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-800 text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400">
                    <tr>
                      <th className="px-4 py-2.5 font-mono font-bold text-[10px]">Row Index</th>
                      <th className="px-4 py-2.5 font-mono font-bold text-[10px]">Score Index</th>
                      {selectedFeatures.slice(0, 3).map(f => (
                        <th key={f} className="px-4 py-2.5 font-mono font-bold text-[10px]">{f}</th>
                      ))}
                      <th className="px-4 py-2.5 font-mono font-bold text-[10px] text-right">Reasoning Tag</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 bg-slate-950/25">
                    {outlierList.slice(0, 10).map((item) => (
                      <tr key={item.idx} className="hover:bg-rose-950/10">
                        <td className="px-4 py-2 font-mono text-rose-400">#{item.idx + 1}</td>
                        <td className="px-4 py-2 font-mono">
                          <span className="inline-block px-1.5 py-0.5 rounded bg-rose-500/15 border border-rose-500/30 text-rose-400 font-semibold text-[10px]">
                            {item.score.toFixed(4)}
                          </span>
                        </td>
                        {selectedFeatures.slice(0, 3).map(f => (
                          <td key={f} className="px-4 py-2 text-slate-300 font-mono text-[11px]">
                            {item.row[f] === null || item.row[f] === undefined ? "NULL" : String(item.row[f])}
                          </td>
                        ))}
                        <td className="px-4 py-2 text-right">
                          <span className="text-[9px] font-mono font-bold uppercase tracking-wide bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/20">
                            {item.score > 0.65 ? "Critically Isolated" : "High Variance Outlier"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Execution terminal logs */}
          {(logs.length > 0) && (
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 font-mono text-[11px] leading-relaxed text-slate-400 space-y-1.5 max-h-60 overflow-y-auto shadow-inner">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-2 border-b border-slate-800/60 pb-1 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                Detection Engine Kernel Terminal
              </span>
              {logs.map((log, lIdx) => {
                let color = "text-slate-400";
                if (log.includes("[SUCCESS]")) color = "text-emerald-400 font-semibold";
                else if (log.includes("[FATAL]") || log.includes("[ERROR]")) color = "text-rose-400 font-semibold";
                else if (log.includes("[INFO]")) color = "text-sky-400";
                else if (log.includes("[ENGINE]")) color = "text-violet-400";
                else if (log.includes("[RESULTS]")) color = "text-amber-400 font-semibold";
                return (
                  <div key={lIdx} className={color}>
                    {log}
                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
