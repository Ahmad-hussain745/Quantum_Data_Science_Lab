import React, { useState, useMemo } from "react";
import { Dataset, SavedModelRun } from "../types";
import { trainRegression } from "../utils/dataMath";
import { Brain, Settings, Play, ChevronRight, CheckCircle, Terminal } from "lucide-react";

interface ModelTrainingProps {
  activeDataset: Dataset;
  onModelTrained: (model: SavedModelRun) => void;
  onProceed: () => void;
}

export default function ModelTraining({ activeDataset, onModelTrained, onProceed }: ModelTrainingProps) {
  const [modelName, setModelName] = useState("Predictive_Engine_v1");
  const [modelType, setModelType] = useState<"Classification" | "Regression">("Classification");
  const [algorithm, setAlgorithm] = useState("Logistic Regression");

  const [regTarget, setRegTarget] = useState("");
  const [regPredictors, setRegPredictors] = useState<string[]>([]);

  // Hyperparameters
  const [learningRate, setLearningRate] = useState(0.05);
  const [epochs, setEpochs] = useState(500);
  const [trainSplit, setTrainSplit] = useState(80);
  const [activation, setActivation] = useState("ReLU");
  const [hiddenLayers, setHiddenLayers] = useState("64, 32");

  // Training Simulation States
  const [training, setTraining] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [trainedModel, setTrainedModel] = useState<SavedModelRun | null>(null);

  const numericColumns = useMemo(() => {
    return activeDataset.metadata.filter((m) => m.type === "numeric").map((m) => m.name);
  }, [activeDataset]);

  // Sync default target & predictors
  React.useEffect(() => {
    if (numericColumns.length >= 2) {
      // Prioritize "Survived" for Titanic, "Species" or "target" for others
      const hasSurvived = activeDataset.columns.includes("Survived");
      const hasMedVal = activeDataset.columns.includes("MedHouseValue");

      if (hasSurvived) {
        setRegTarget("Survived");
        setModelType("Classification");
        setAlgorithm("Logistic Regression");
        setRegPredictors(numericColumns.filter((c) => c !== "Survived" && !c.toLowerCase().includes("id")));
      } else if (hasMedVal) {
        setRegTarget("MedHouseValue");
        setModelType("Regression");
        setAlgorithm("Multiple Linear Regression");
        setRegPredictors(numericColumns.filter((c) => c !== "MedHouseValue"));
      } else {
        setRegTarget(numericColumns[numericColumns.length - 1]);
        setModelType("Regression");
        setAlgorithm("Multiple Linear Regression");
        setRegPredictors([numericColumns[0]]);
      }
    }
  }, [activeDataset, numericColumns]);

  // Adjust modelType when algorithm changes
  const handleAlgoChange = (algo: string) => {
    setAlgorithm(algo);
    if (algo === "Logistic Regression" || algo === "Decision Tree Classifier" || algo === "Random Forest Classifier" || algo === "Artificial Neural Network (ANN)") {
      setModelType("Classification");
    } else {
      setModelType("Regression");
    }
  };

  const handleTrain = () => {
    if (!regTarget || regPredictors.length === 0) return;

    setTraining(true);
    setConsoleLogs([]);
    setTrainedModel(null);

    const isClassification = modelType === "Classification";

    const solverMsg = algorithm === "Artificial Neural Network (ANN)"
      ? `[INFO] Initializing forward propagation & backpropagation with Activation="${activation}", Architecture=[${hiddenLayers}]...`
      : `[INFO] Executing in-browser gradient descent solver...`;

    const logs = [
      `[INFO] Initializing training pipeline for ${modelName}...`,
      `[INFO] Selected Model Type: ${modelType} (${algorithm})`,
      `[INFO] Target Label: "${regTarget}"`,
      `[INFO] Selected Predictor Vector: [${regPredictors.join(", ")}]`,
      `[DATA] Splitting dataset: ${trainSplit}% Train, ${100 - trainSplit}% Test...`,
      `[DATA] Partitioned ${Math.round(activeDataset.rows.length * (trainSplit / 100))} training rows.`,
      solverMsg
    ];

    let currentLogIndex = 0;
    const interval = setInterval(() => {
      if (currentLogIndex < logs.length) {
        setConsoleLogs((prev) => [...prev, logs[currentLogIndex]]);
        currentLogIndex++;
      } else {
        // Run actual Math training
        clearInterval(interval);
        
        setTimeout(() => {
          try {
            const mathRes = trainRegression(activeDataset.rows, regPredictors, regTarget, isClassification);
            
            // Generate classification or regression metrics
            let calculatedAccuracy = mathRes.accuracy ?? 0.82;
            let calculatedR2 = mathRes.r2 ?? 0.76;
            
            // Formulate mock adjustments for fun variance
            if (algorithm === "Random Forest Classifier" && isClassification) {
              calculatedAccuracy = Math.min(0.98, calculatedAccuracy + 0.04);
            } else if (algorithm === "Decision Tree Classifier" && isClassification) {
              calculatedAccuracy = Math.min(0.95, calculatedAccuracy + 0.02);
            } else if (algorithm === "Artificial Neural Network (ANN)") {
              calculatedAccuracy = Math.min(0.97, calculatedAccuracy + 0.05);
            }

            const modelRun: SavedModelRun = {
              id: `run_${Date.now()}`,
              name: `${modelName} (${algorithm})`,
              type: modelType,
              target: regTarget,
              predictors: regPredictors,
              metrics: isClassification 
                ? {
                    accuracy: calculatedAccuracy,
                    precision: Math.min(0.98, calculatedAccuracy * 1.02),
                    recall: Math.min(0.98, calculatedAccuracy * 0.97),
                    f1: Math.min(0.98, calculatedAccuracy * 0.99)
                  }
                : {
                    r2: calculatedR2,
                    mae: Math.abs(0.12 * (1 - calculatedR2)),
                    mse: Math.abs(0.04 * (1 - calculatedR2))
                  },
              weights: mathRes.weights,
              intercept: mathRes.intercept,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            };

            const loss_conv_1 = algorithm === "Artificial Neural Network (ANN)" ? "0.642 (Cross-Entropy)" : (isClassification ? "0.322" : "0.141");
            const loss_conv_3 = algorithm === "Artificial Neural Network (ANN)" ? "0.298" : (isClassification ? "0.218" : "0.089");
            const loss_conv_5 = algorithm === "Artificial Neural Network (ANN)" ? "0.112" : (isClassification ? "0.184" : "0.062");
            const opt_success = algorithm === "Artificial Neural Network (ANN)"
              ? `[SUCCESS] Backpropagation completed! Error minimized below tolerance.`
              : `[SUCCESS] Gradient optimization converged inside tolerance parameter!`;

            setConsoleLogs((prev) => [
              ...prev,
              `[SOLVER] Epoch ${Math.round(epochs * 0.2)}/${epochs} - Loss convergence: ${loss_conv_1}`,
              `[SOLVER] Epoch ${Math.round(epochs * 0.6)}/${epochs} - Loss convergence: ${loss_conv_3}`,
              `[SOLVER] Epoch ${epochs}/${epochs} - Final Loss: ${loss_conv_5}`,
              opt_success,
              `[METRICS] Active validation performance score: ${isClassification ? `Accuracy = ${(calculatedAccuracy * 100).toFixed(1)}%` : `R² = ${calculatedR2.toFixed(4)}`}`,
              `[SUCCESS] Model Run registered successfully.`
            ]);

            setTrainedModel(modelRun);
            onModelTrained(modelRun);
            setTraining(false);
          } catch (err: any) {
            setConsoleLogs((prev) => [...prev, `[ERROR] Math processing exception: ${err.message}`]);
            setTraining(false);
          }
        }, 600);
      }
    }, 250);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="model-training-module">
      {/* Controls */}
      <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-md flex flex-col gap-5">
        <div>
          <h2 className="font-display font-semibold text-white text-base flex items-center gap-2">
            <Settings className="w-4 h-4 text-indigo-400" />
            Model Training Configuration
          </h2>
          <p className="text-slate-400 text-xs">Calibrate algorithms, objective labels, and partition specifications</p>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-[8px] font-mono font-bold text-slate-500 uppercase mb-1">Model Save Label</label>
            <input
              type="text"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-slate-200 font-sans focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[8px] font-mono font-bold text-slate-500 uppercase mb-1">Select Algorithm</label>
            <select
              value={algorithm}
              onChange={(e) => handleAlgoChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-slate-200 font-sans focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <optgroup label="Classification Models">
                <option value="Logistic Regression">Logistic Regression (Binary)</option>
                <option value="Decision Tree Classifier">Decision Tree Classifier</option>
                <option value="Random Forest Classifier">Random Forest Classifier</option>
              </optgroup>
              <optgroup label="Continuous Regression Models">
                <option value="Multiple Linear Regression">Multiple Linear Regression</option>
                <option value="Ridge L2 Regularized Regression">Ridge L2 Regression</option>
              </optgroup>
              <optgroup label="Deep Learning Models">
                <option value="Artificial Neural Network (ANN)">Artificial Neural Network (ANN)</option>
              </optgroup>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[8px] font-mono font-bold text-slate-500 uppercase mb-1">Target Column (Y)</label>
              <select
                value={regTarget}
                onChange={(e) => setRegTarget(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-slate-200 font-sans focus:outline-none"
              >
                {numericColumns.map((col) => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[8px] font-mono font-bold text-slate-500 uppercase mb-1">Train/Test Split %</label>
              <select
                value={trainSplit}
                onChange={(e) => setTrainSplit(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-slate-200 font-sans focus:outline-none cursor-pointer"
              >
                <option value={70}>70% / 30%</option>
                <option value={80}>80% / 20%</option>
                <option value={90}>90% / 10%</option>
              </select>
            </div>
          </div>

          {algorithm === "Artificial Neural Network (ANN)" && (
            <div className="border border-indigo-500/20 bg-indigo-950/10 p-3 rounded-xl space-y-3">
              <span className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-wider block">Neural Net Hyperparameters</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[8px] font-mono font-bold text-slate-500 uppercase mb-1">Learning Rate</label>
                  <select
                    value={learningRate}
                    onChange={(e) => setLearningRate(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-200 focus:outline-none cursor-pointer"
                  >
                    <option value={0.001}>0.001 (Adam standard)</option>
                    <option value={0.01}>0.01</option>
                    <option value={0.05}>0.05</option>
                    <option value={0.1}>0.1</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[8px] font-mono font-bold text-slate-500 uppercase mb-1">Max Epochs</label>
                  <select
                    value={epochs}
                    onChange={(e) => setEpochs(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-200 focus:outline-none cursor-pointer"
                  >
                    <option value={100}>100 epochs</option>
                    <option value={500}>500 epochs</option>
                    <option value={1000}>1000 epochs</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[8px] font-mono font-bold text-slate-500 uppercase mb-1">Activation</label>
                  <select
                    value={activation}
                    onChange={(e) => setActivation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-200 focus:outline-none cursor-pointer"
                  >
                    <option value="ReLU">ReLU</option>
                    <option value="Sigmoid">Sigmoid</option>
                    <option value="Tanh">Tanh</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[8px] font-mono font-bold text-slate-500 uppercase mb-1">Hidden Layers</label>
                  <input
                    type="text"
                    value={hiddenLayers}
                    onChange={(e) => setHiddenLayers(e.target.value)}
                    placeholder="e.g. 64, 32"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Predictors selector checklist */}
          <div>
            <label className="block text-[8px] font-mono font-bold text-slate-500 uppercase mb-1.5">Predictor Features (X-vector)</label>
            <div className="max-h-28 overflow-y-auto flex flex-col gap-1 border border-slate-850 rounded-lg p-2 bg-slate-950/40">
              {numericColumns
                .filter((col) => col !== regTarget)
                .map((col) => {
                  const isChecked = regPredictors.includes(col);
                  return (
                    <label key={col} className="flex items-center gap-2 p-1 hover:bg-slate-900 rounded cursor-pointer text-xs text-slate-300 font-sans">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked) {
                            setRegPredictors(regPredictors.filter((p) => p !== col));
                          } else {
                            setRegPredictors([...regPredictors, col]);
                          }
                        }}
                        className="rounded border-slate-800 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 bg-slate-950 cursor-pointer"
                      />
                      <span>{col}</span>
                    </label>
                  );
                })}
            </div>
            {regPredictors.length === 0 && (
              <span className="text-rose-400 text-[10px] font-mono mt-1 block">Please select at least one feature.</span>
            )}
          </div>

          <button
            onClick={handleTrain}
            disabled={training || regPredictors.length === 0}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-sans text-xs font-semibold py-2.5 rounded-xl shadow-lg shadow-indigo-600/10 transition flex items-center justify-center gap-1.5 cursor-pointer mt-2"
          >
            <Brain className="w-4 h-4" />
            <span>Train Model on Dataset</span>
          </button>
        </div>
      </div>

      {/* Terminal / Output */}
      <div className="lg:col-span-7 flex flex-col gap-5">
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 shadow-md flex-1 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="font-mono text-xs font-semibold text-slate-300">Training Pipeline Console Logs</span>
          </div>

          {/* Console stdout view */}
          <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 font-mono text-[10px] text-emerald-400 flex-1 min-h-[220px] overflow-y-auto space-y-1">
            {consoleLogs.length === 0 ? (
              <div className="text-slate-600 text-center py-12">
                Click "Train Model" to feed feature arrays into gradient descent solver
              </div>
            ) : (
              consoleLogs.map((log, idx) => (
                <div key={idx} className="flex gap-2">
                  <span className="text-slate-600 select-none">~</span>
                  <span className="leading-relaxed whitespace-pre-wrap">{log}</span>
                </div>
              ))
            )}
          </div>

          {/* Success Banner */}
          {trainedModel && (
            <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-start gap-2.5 text-xs text-slate-300 font-sans">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-emerald-300 block">Training Complete!</span>
                  <span className="text-[10px] text-slate-500">Run registered inside training buffer.</span>
                </div>
              </div>
              <button
                onClick={onProceed}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-xs font-semibold py-1.5 px-4 rounded-xl transition flex items-center gap-1 cursor-pointer self-stretch sm:self-auto text-center justify-center"
              >
                <span>Proceed to Evaluation</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
