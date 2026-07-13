import React, { useState, useEffect } from "react";
import { 
  HelpCircle, 
  Workflow, 
  Settings2, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  Cpu, 
  Code2, 
  Database, 
  LineChart, 
  Layers, 
  Bot,
  Zap,
  RefreshCw,
  Search,
  BookOpen,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { Dataset } from "../types";

interface DSMethodologyProps {
  dataset: Dataset;
}

type ProblemCategory = "classification" | "regression" | "forecasting" | "clustering" | "anomaly" | "nlp";

export default function DSMethodology({ dataset }: DSMethodologyProps) {
  const [activeTab, setActiveTab] = useState<"problems" | "workflow" | "auto_method">("problems");
  const [selectedProblem, setSelectedProblem] = useState<ProblemCategory>("classification");
  
  // AutoML Simulation States
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState(0);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);
  const [simMetrics, setSimMetrics] = useState<{ name: string; value: string }[]>([]);

  // 1. Data Science problems solved guide
  const problemDetails: Record<ProblemCategory, {
    title: string;
    description: string;
    urduDesc: string;
    useCase: string;
    autoAlgorithm: string;
    keyMetrics: string[];
    steps: string[];
  }> = {
    classification: {
      title: "Classification (Binary & Multi-class)",
      description: "Predicting categorical classes or labels (e.g., Yes/No, Spam/Ham, Fraud/Normal, High/Medium/Low risk).",
      urduDesc: "Is ka maqsad data ko mukhtalif categories ya groups mein taqseem karna hota hai (maslan: Customer Churn hoga ya nahi).",
      useCase: "Customer Churn Prediction, Loan Default Approval, Email Spam Filter.",
      autoAlgorithm: "Auto-tuned XGBoost & LightGBM Classifier with Stratified K-Fold CV.",
      keyMetrics: ["Accuracy", "ROC-AUC Score", "Precision & Recall", "F1-Score", "Confusion Matrix"],
      steps: [
        "Identifies categorical columns and maps them to numerical target indices.",
        "Imputes missing categorical variables with Mode and applies One-Hot Encoding.",
        "Splits data with Stratification to maintain target class ratios.",
        "Triggers Bayesian Optimization (Optuna) over max_depth, learning_rate, and subsamples.",
        "Validates model using Out-of-Fold cross-validation and displays the ROC Curve."
      ]
    },
    regression: {
      title: "Continuous Variable Regression",
      description: "Predicting continuous numeric values or target variables based on input features.",
      urduDesc: "Is ka maqsad aik continuous number ki peshangoi karna hota hai (maslan: Ghar ki qeemat, ya Sales volume).",
      useCase: "House Price Valuation, Profit & Revenue Forecasts, Temperature Estimations.",
      autoAlgorithm: "Automated Gradient Boosting Regressor (GBM) with Bayesian Tuning.",
      keyMetrics: ["R-Squared (R²)", "Root Mean Squared Error (RMSE)", "Mean Absolute Error (MAE)", "Residual Plots"],
      steps: [
        "Selects the optimal continuous numeric target vector.",
        "Standardizes numeric features using StandardScaler to ensure distance-based models perform correctly.",
        "Filters multicollinear features using Variance Inflation Factor (VIF).",
        "Optimizes learning rate, estimator count, and split fractions.",
        "Calculates residuals and plots normal distributions of error terms."
      ]
    },
    forecasting: {
      title: "Time-Series Seasonal Forecasting",
      description: "Predicting future steps of a variable indexed strictly by temporal or date sequences.",
      urduDesc: "Waqt ke sath badalte data ke trends aur patterns ko samajhna aur aane wale dino ki peshangoi karna.",
      useCase: "Retail Product Inventory Demand, Stock Market Trendlines, Monthly Website Traffic.",
      autoAlgorithm: "Auto-ARIMA / SARIMAX with additive seasonal decomposition (Periodicity = 7/30).",
      keyMetrics: ["MAPE (Mean Absolute Percentage Error)", "AIC / BIC (Information Criteria)", "Stationarity (ADF p-value)"],
      steps: [
        "Detects and parses the datetime field, indexing the dataframe chronologically.",
        "Tests for stationarity using the Augmented Dickey-Fuller (ADF) calculation.",
        "Determines optimal p, d, q parameters automatically minimizing AIC/BIC.",
        "Calculates seasonal parameters (P, D, Q, S) to handle periodic/weekly loops.",
        "Projects point forecasts with 95% Confidence Intervals into future timeline horizons."
      ]
    },
    clustering: {
      title: "Unsupervised Clustering & Segmentation",
      description: "Grouping unlabeled data points based on feature similarities and relative proximity.",
      urduDesc: "Bina kisi target label ke data ke darmiyan similarities dekh kar groups banana (maslan: VIP Customers).",
      useCase: "Market Audience Segmentation, Behavioral Clustering, Recommendation Groupings.",
      autoAlgorithm: "K-Means++ & DBSCAN optimized via Silhouette & Elbow Heuristics.",
      keyMetrics: ["Silhouette Index Score", "Inertia (Elbow Method)", "PCA Variance Ratio (2D Projection)"],
      steps: [
        "Normalizes numeric variables to avoid dimension weight bias.",
        "Applies Principal Component Analysis (PCA) to project high-dimensional data into 2D spaces.",
        "Sweeps Cluster Count (K=2 to 8) tracking Silhouette Scores in real-time.",
        "Selects optimal K which maximizes the Silhouette metric.",
        "Extracts and profiles centroid averages to describe the behavior of each cluster group."
      ]
    },
    anomaly: {
      title: "Anomaly & Fraud Detection",
      description: "Identifying rare patterns or outlier observations that deviate significantly from standard normal data.",
      urduDesc: "Data mein ghair-mamooli ya suspicious patterns ko dhoondna (maslan: Fraud ya servers par unusual traffic).",
      useCase: "Financial Transaction Credit Fraud, Sensor Failure Alerts, System Security Intrusions.",
      autoAlgorithm: "Isolation Forest & One-Class Support Vector Machine (SVM).",
      keyMetrics: ["Contamination Ratio", "Decision Scores (Decision Boundaries)", "Feature Outlier Profiles"],
      steps: [
        "Calculates multivariate distance matrices across normal distributions.",
        "Fits an Isolation Forest with randomized tree splits to isolate anomalous data paths quickly.",
        "Applies a pre-set or user-defined Contamination ratio (default 5%) of anticipated outliers.",
        "Labels records as normal (0) or anomaly (1) and generates continuous anomaly decision scores.",
        "Profiles high-scoring anomalies to show which variables contributed most to the flagged status."
      ]
    },
    nlp: {
      title: "NLP Sentiment & Text Categorization",
      description: "Processing rich text records to classify sentiment polarities or categorical text topics.",
      urduDesc: "Text data (reviews, comments) ke andar mojood emotion aur categories ko samajhna.",
      useCase: "Customer Support Ticket Routing, Product Review Sentiment Analysis, News Classification.",
      autoAlgorithm: "TF-IDF N-gram Vectorization + Multinomial Naive Bayes Pipeline.",
      keyMetrics: ["Vocabulary Size", "Accuracy Score", "Precision & F1-Score per Sentiment class"],
      steps: [
        "Strips punctuation, lowercases strings, and filters out common stop words.",
        "Tokenizes text sequences and extracts dynamic TF-IDF unigram and bigram vocabularies.",
        "Applies a Naive Bayes or Logistic Regression model over high-dimensional text vectors.",
        "Calculates probability metrics for class labels.",
        "Displays top predictive terms/words contributing to positive or negative polarities."
      ]
    }
  };

  // Automated Pipeline simulation steps
  const runSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSimulationStep(1);
    setSimulationLogs(["Initializing Automated ML Pipeline...", "Active dataset detected: " + dataset.name]);
    setSimMetrics([]);
  };

  useEffect(() => {
    if (!isSimulating) return;

    let timer: NodeJS.Timeout;
    const updateSimulation = () => {
      setSimulationStep((prev) => {
        const next = prev + 1;
        if (next > 6) {
          setIsSimulating(false);
          // Set final results
          if (selectedProblem === "classification") {
            setSimMetrics([
              { name: "Model Accuracy", value: "94.2%" },
              { name: "ROC-AUC Score", value: "0.965" },
              { name: "Best Hyperparameters", value: "learning_rate: 0.08, max_depth: 5" }
            ]);
          } else if (selectedProblem === "regression") {
            setSimMetrics([
              { name: "R-squared (R²)", value: "0.891" },
              { name: "RMSE Error", value: "14.2" },
              { name: "Best Hyperparameters", value: "n_estimators: 180, learning_rate: 0.1" }
            ]);
          } else if (selectedProblem === "forecasting") {
            setSimMetrics([
              { name: "MAPE Error", value: "6.4%" },
              { name: "ADF p-value", value: "0.002 (Stationary)" },
              { name: "Optimal Order", value: "SARIMAX(2,1,1)(1,0,1)[7]" }
            ]);
          } else if (selectedProblem === "clustering") {
            setSimMetrics([
              { name: "Silhouette Score", value: "0.582" },
              { name: "Optimal Clusters (K)", value: "3" },
              { name: "PCA Variance Explained", value: "76.4%" }
            ]);
          } else if (selectedProblem === "anomaly") {
            setSimMetrics([
              { name: "Flagged Anomalies", value: "5.0% of total rows" },
              { name: "Isolation Forest Score", value: "-0.14 avg" },
              { name: "Primary Driver Var", value: dataset.columns[0] || "Variable" }
            ]);
          } else {
            setSimMetrics([
              { name: "Vocabulary Size", value: "2,450 tokens" },
              { name: "Classification Accuracy", value: "91.5%" },
              { name: "Algorithm", value: "TF-IDF + Naive Bayes" }
            ]);
          }
          return 6;
        }

        // Add step logs
        const logMap: Record<ProblemCategory, string[]> = {
          classification: [
            "Data Profiling: Scanning target vectors, validating class labels and balance.",
            "Preprocessing: Scaling numeric vectors; applying categorical One-Hot encoders.",
            "Cross-Validation: Splitting data into 5 Stratified Train/Test Folds.",
            "AutoML Optimization: Running Optuna Bayesian hyperparameter search.",
            "Evaluation: Scoring final prediction matrices and plotting confusion indicators."
          ],
          regression: [
            "Data Profiling: Verifying normal distribution parameters of continuous target.",
            "Preprocessing: Imputing null cells; scale transformation with StandardScaler.",
            "Feature Engineering: Correlating variables to prune redundant signals.",
            "Model Tuning: Running Grid Search on Gradient Boosting parameters.",
            "Evaluation: Assessing R² coefficient and residual distribution profiles."
          ],
          forecasting: [
            "Temporal Verification: Chronologically indexing dates, resampling gaps.",
            "Statistical Test: Running Dickey-Fuller stationarity validation.",
            "Autocorrelation: Calculating Autocorrelation (ACF) and Partial Autocorrelation (PACF) values.",
            "Auto-Model Search: Minimizing Information Criteria (AIC) parameters.",
            "Forecasting: Simulating 30-day out-of-sample forward projections."
          ],
          clustering: [
            "Scaling Matrix: Centering data points using dynamic StandardScaler.",
            "Dimensionality Reduction: Running Principal Component Analysis (PCA) for visual rendering.",
            "Sweeping K-Clusters: Measuring silhouette index for cluster ranges.",
            "Centroid Extraction: Finding average center points of all clusters.",
            "Label Generation: Tagging rows with discrete Cluster Groups."
          ],
          anomaly: [
            "Matrix Verification: Computing standard dispersion of numerical arrays.",
            "Isolation Pathing: Constructing randomized path trees to isolate anomalies.",
            "Contamination Tuning: Setting expected outlier density percentage threshold.",
            "Decision Flagging: Marking suspicious vectors as outlier anomalies.",
            "Profiling Drivers: Inspecting feature variances for anomalous populations."
          ],
          nlp: [
            "Text Cleaning: Lowercasing, pruning string punctuation characters.",
            "Token Processing: Filtering common English linguistic stop-words.",
            "Feature Extraction: Generating dynamic TF-IDF unigram and bigram vocabularies.",
            "Training Loop: Fitting multinomial distribution classifiers over sparse matrices.",
            "Performance Scoring: Estimating precision score vectors for predictions."
          ]
        };

        const stepsList = logMap[selectedProblem];
        setSimulationLogs((prevLogs) => [
          ...prevLogs,
          `[Step ${prev - 0}] ${stepsList[prev - 1]}`
        ]);

        return next;
      });
    };

    timer = setInterval(updateSimulation, 1200);
    return () => clearInterval(timer);
  }, [isSimulating, selectedProblem, dataset]);

  return (
    <div className="flex flex-col gap-6 animate-fade-in" id="ds-methodology-guide-system">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20">
            <Workflow className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">Platform Methodology & Auto-Solver Guide</h2>
            <p className="text-xs text-slate-400 mt-1">Discover how our core system automatically engineers, models, and solves complex business problems step-by-step</p>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex items-center bg-slate-950/60 p-1 rounded-xl border border-slate-850">
          <button
            onClick={() => {
              setActiveTab("problems");
              setIsSimulating(false);
              setSimulationStep(0);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "problems" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Problems Solved</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("workflow");
              setIsSimulating(false);
              setSimulationStep(0);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "workflow" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>How it Solves (Workflow)</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("auto_method");
              setIsSimulating(false);
              setSimulationStep(0);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "auto_method" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Auto-Method Simulator</span>
          </button>
        </div>
      </div>

      {/* 1. PROBLEMS SOLVED TAB */}
      {activeTab === "problems" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* PROBLEM CATEGORY SELECTOR */}
          <div className="lg:col-span-4 flex flex-col gap-2 bg-slate-950/20 border border-slate-800/80 rounded-2xl p-4">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase px-1 pb-1">Select Problem Category</span>
            {(Object.keys(problemDetails) as ProblemCategory[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedProblem(cat)}
                className={`w-full text-left p-3 rounded-xl border text-xs font-semibold transition cursor-pointer flex items-center justify-between ${
                  selectedProblem === cat 
                    ? "bg-indigo-600/10 border-indigo-500/40 text-indigo-300" 
                    : "bg-slate-900/40 border-slate-850 text-slate-400 hover:border-slate-800 hover:text-slate-200"
                }`}
              >
                <div className="flex flex-col">
                  <span>{problemDetails[cat].title.split(" (")[0]}</span>
                  <span className="text-[10px] font-normal text-slate-500 mt-0.5 max-w-[200px] truncate">{problemDetails[cat].useCase}</span>
                </div>
                <ArrowRight className={`w-3.5 h-3.5 transition ${selectedProblem === cat ? "translate-x-1 text-indigo-400" : "text-slate-600"}`} />
              </button>
            ))}
          </div>

          {/* DETAILED ANALYSIS */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 flex flex-col gap-5">
              
              {/* HEADER */}
              <div className="border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
                    <Zap className="w-4 h-4" />
                  </div>
                  <h3 className="text-white font-bold text-md">{problemDetails[selectedProblem].title}</h3>
                </div>
                <p className="text-slate-300 text-xs mt-2 leading-relaxed">{problemDetails[selectedProblem].description}</p>
                
                {/* ROMAN URDU HELP */}
                <div className="bg-indigo-950/20 border border-indigo-900/30 p-3 rounded-xl mt-3.5 flex gap-2">
                  <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-slate-300 italic font-sans leading-relaxed">
                    <strong>Roman Urdu:</strong> {problemDetails[selectedProblem].urduDesc}
                  </p>
                </div>
              </div>

              {/* AUTOMATION DETAILS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* PIPELINE & STEPS */}
                <div className="flex flex-col gap-3">
                  <h4 className="text-white font-bold text-xs uppercase tracking-wider font-mono text-slate-400">Automated Pipeline Actions:</h4>
                  <div className="flex flex-col gap-2.5">
                    {problemDetails[selectedProblem].steps.map((step, idx) => (
                      <div key={idx} className="flex gap-2 items-start text-[11px] text-slate-300 leading-relaxed">
                        <span className="w-4 h-4 rounded-full bg-slate-900 text-[10px] font-mono text-slate-400 flex items-center justify-center shrink-0 mt-0.5 border border-slate-800">
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ALGORITHM AND METRICS */}
                <div className="flex flex-col gap-4 bg-slate-950/40 border border-slate-850/60 p-4 rounded-xl">
                  
                  {/* AUTO-ALGO */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Heuristic Auto-Method Engine:</span>
                    <span className="text-xs text-white font-semibold flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                      {problemDetails[selectedProblem].autoAlgorithm}
                    </span>
                  </div>

                  {/* KEY METRICS */}
                  <div className="flex flex-col gap-2 border-t border-slate-850 pt-3">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Core Validation Metrics:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {problemDetails[selectedProblem].keyMetrics.map((met, mIdx) => (
                        <span key={mIdx} className="px-2 py-1 bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[10px] rounded-md">
                          {met}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* RELEVANT BUSINESS USECASE */}
                  <div className="flex flex-col gap-1.5 border-t border-slate-850 pt-3 text-[11px]">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Common Industry Use Case:</span>
                    <span className="text-slate-300 font-sans italic">{problemDetails[selectedProblem].useCase}</span>
                  </div>

                </div>

              </div>

            </div>
          </div>

        </div>
      )}

      {/* 2. HOW IT SOLVES (WORKFLOW) TAB */}
      {activeTab === "workflow" && (
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 flex flex-col gap-6">
          <div>
            <h3 className="text-white font-bold text-sm">Automated Machine Learning Lifecycle</h3>
            <p className="text-slate-400 text-xs mt-1">How the application ingests, preprocesses, trains, validates, and deploys files automatically</p>
          </div>

          {/* VISUAL WORKFLOW TIMELINE */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative mt-2">
            
            {/* STEP 1 */}
            <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl flex flex-col gap-2.5 relative">
              <div className="absolute top-3 right-3 text-[10px] font-mono font-bold text-indigo-400 bg-indigo-950/50 px-1.5 py-0.5 rounded border border-indigo-900/50">STEP 1</div>
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 mb-1">
                <Database className="w-4 h-4" />
              </div>
              <h4 className="text-white font-bold text-xs">Profile & Diagnostic</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                The platform scans the uploaded CSV or database variables. It categorizes numeric versus text features and estimates missing-cell proportions.
              </p>
            </div>

            {/* STEP 2 */}
            <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl flex flex-col gap-2.5 relative">
              <div className="absolute top-3 right-3 text-[10px] font-mono font-bold text-indigo-400 bg-indigo-950/50 px-1.5 py-0.5 rounded border border-indigo-900/50">STEP 2</div>
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 mb-1">
                <RefreshCw className="w-4 h-4" />
              </div>
              <h4 className="text-white font-bold text-xs">Clean & Transform</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Automatically imputes missing items (via continuous median/categorical modes), resamples time periods, and encodes high-cardinality categories.
              </p>
            </div>

            {/* STEP 3 */}
            <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl flex flex-col gap-2.5 relative">
              <div className="absolute top-3 right-3 text-[10px] font-mono font-bold text-indigo-400 bg-indigo-950/50 px-1.5 py-0.5 rounded border border-indigo-900/50">STEP 3</div>
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 mb-1">
                <Settings2 className="w-4 h-4" />
              </div>
              <h4 className="text-white font-bold text-xs">Auto-Tune & Fit</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Creates validation slices and invokes Optuna-based Bayesian iterations. Searches hyperparameter spaces to fit the best model structure.
              </p>
            </div>

            {/* STEP 4 */}
            <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl flex flex-col gap-2.5 relative">
              <div className="absolute top-3 right-3 text-[10px] font-mono font-bold text-indigo-400 bg-indigo-950/50 px-1.5 py-0.5 rounded border border-indigo-900/50">STEP 4</div>
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 mb-1">
                <LineChart className="w-4 h-4" />
              </div>
              <h4 className="text-white font-bold text-xs">Score & Deploy</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Compiles predictions, plots ROC/Residual curves, calculates Feature Importances, and exports fully functional scripts and endpoints.
              </p>
            </div>

          </div>

          {/* DETAILED UNDER-THE-HOOD INFO */}
          <div className="bg-slate-950/30 border border-slate-850 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
            <div className="flex gap-3">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 self-start mt-0.5 shrink-0">
                <CheckCircle2 className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <h4 className="text-white font-bold text-xs">Zero-Configuration Out-of-the-Box (Auto-Pilot Mode)</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  Every pipeline runs directly inside your web application container or exports standalone standard Python code. There is absolutely no external software installation required to generate reliable business models.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 3. AUTO METHOD TAB */}
      {activeTab === "auto_method" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* CONTROL & TRIGGER COLUMN */}
          <div className="lg:col-span-5 bg-slate-950/20 border border-slate-800/80 rounded-2xl p-5 flex flex-col gap-4">
            <div>
              <span className="text-[10px] uppercase font-mono font-bold text-amber-400 tracking-wider">Automated AutoML</span>
              <h3 className="font-semibold text-white text-sm">Auto-Solver Pipeline Simulator</h3>
              <p className="text-slate-400 text-xs mt-1">
                Select a problem category, and run a simulated AutoML training iteration to observe how the platform configures, runs metrics, and solves problems automatically.
              </p>
            </div>

            {/* PROBLEM SELECTOR FOR SIMULATOR */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">Target Problem Model</label>
              <select
                value={selectedProblem}
                onChange={(e) => {
                  setSelectedProblem(e.target.value as any);
                  setIsSimulating(false);
                  setSimulationStep(0);
                  setSimulationLogs([]);
                  setSimMetrics([]);
                }}
                disabled={isSimulating}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-xs text-slate-300 font-sans focus:outline-none focus:border-indigo-500 disabled:opacity-50"
              >
                <option value="classification">Classification Pipeline (Churn, Defaults)</option>
                <option value="regression">Regression Pipeline (Prices, Continuous Targets)</option>
                <option value="forecasting">Time Series Seasonal Forecasting (SARIMAX)</option>
                <option value="clustering">Clustering Segmentations (PCA & KMeans)</option>
                <option value="anomaly">Anomaly & Fraud Engine (Isolation Forest)</option>
                <option value="nlp">Natural Language Processing Pipeline (Text Naive Bayes)</option>
              </select>
            </div>

            {/* RUN BUTTON */}
            <button
              onClick={runSimulation}
              disabled={isSimulating}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-950/50 transition cursor-pointer"
            >
              {isSimulating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Auto-Solver Tuning (Step {simulationStep}/5)...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 text-emerald-400" />
                  <span>Execute Auto-Solver Simulation</span>
                </>
              )}
            </button>

            {/* SUMMARY CONTEXT BLOCK */}
            <div className="border-t border-slate-850 pt-4 flex flex-col gap-2 bg-indigo-950/15 p-3.5 rounded-xl border border-indigo-900/30 text-[11px]">
              <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider block">Simulator Context:</span>
              <p className="text-slate-300 leading-relaxed">
                This simulator showcases how the core analytical engines analyze data properties, choose parameters, find optimized convergence points, and yield evaluation reports dynamically.
              </p>
            </div>
          </div>

          {/* SIMULATOR OUTPUT LOGS */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 flex flex-col gap-4">
              
              {/* TOP HEADER */}
              <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-amber-400 animate-bounce" />
                  <h4 className="text-white font-bold text-xs uppercase tracking-wider font-mono">Live Pipeline Console Output</h4>
                </div>
                {isSimulating && (
                  <span className="text-[10px] font-mono text-emerald-400 animate-pulse bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-900/30">
                    ● ACTIVE TUNING
                  </span>
                )}
              </div>

              {/* SIMULATION VISUAL LOGGER */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 h-56 overflow-y-auto font-mono text-[11px] leading-relaxed flex flex-col gap-2 scrollbar-thin text-slate-300">
                {simulationLogs.length === 0 ? (
                  <div className="text-slate-500 italic h-full flex items-center justify-center">
                    No active simulation has been triggered yet. Click 'Execute Auto-Solver' to begin the workflow visualization.
                  </div>
                ) : (
                  simulationLogs.map((log, idx) => (
                    <div key={idx} className="border-l-2 border-indigo-500/40 pl-2.5 py-0.5 animate-fade-in text-slate-300">
                      {log}
                    </div>
                  ))
                )}
                {isSimulating && (
                  <div className="flex items-center gap-1.5 text-indigo-400 text-[10px] italic mt-1.5 pl-2.5 animate-pulse">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Running algorithmic diagnostics...</span>
                  </div>
                )}
              </div>

              {/* TARGET RESULTS METRIC BLOCKS */}
              {simMetrics.length > 0 && (
                <div className="border-t border-slate-850 pt-4 flex flex-col gap-3">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Automated Pipeline Metrics Yielded:</span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {simMetrics.map((met, idx) => (
                      <div key={idx} className="bg-slate-950/60 border border-slate-850 p-3 rounded-xl flex flex-col gap-1">
                        <span className="text-[9px] font-mono text-slate-400 uppercase tracking-tight">{met.name}</span>
                        <span className="text-xs text-indigo-300 font-bold font-mono">{met.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      )}

    </div>
  );
}
