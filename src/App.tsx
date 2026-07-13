import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { preloadedDatasets, buildDataset } from "./utils/datasets";
import { SavedModelRun, Dataset } from "./types";
import { 
  generateStreamingIoTRow, 
  generateStreamingFraudRow, 
  generateStreamingTitanicRow, 
  generateStreamingIrisRow 
} from "./utils/streaming";

// Component Modules
import UserLogin from "./components/UserLogin";
import UploadDataset from "./components/UploadDataset";
import DataValidation from "./components/DataValidation";
import DataPreprocessing from "./components/DataPreprocessing";
import InteractiveCharts from "./components/InteractiveCharts";
import DescriptiveStats from "./components/DescriptiveStats";
import AICopilot from "./components/AICopilot";
import EnterpriseEDA from "./components/EnterpriseEDA";
import FeatureEngineering from "./components/FeatureEngineering";
import ModelTraining from "./components/ModelTraining";
import ModelEvaluation from "./components/ModelEvaluation";
import BestModelSelection from "./components/BestModelSelection";
import SaveModel from "./components/SaveModel";
import Prediction from "./components/Prediction";
import Deployment from "./components/Deployment";
import ReportsMonitoring from "./components/ReportsMonitoring";
import MachineLearningSandbox from "./components/MachineLearningSandbox";
import DataConversion from "./components/DataConversion";
import AnomalyDetector from "./components/AnomalyDetector";
import SQLLab from "./components/SQLLab";
import DataScienceSolver from "./components/DataScienceSolver";
import DSMethodology from "./components/DSMethodology";
import EnterpriseOSHub from "./components/EnterpriseOSHub";

// Icons and Component Modules
import {
  Brain,
  Database,
  ShieldCheck,
  ShieldAlert,
  Settings,
  BarChart3,
  Layers,
  Activity,
  Star,
  Save,
  Cpu,
  Server,
  FileText,
  LogIn,
  CheckCircle,
  Lock,
  LogOut,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Info,
  ArrowLeft,
  Grid,
  Sparkles,
  Code2,
  Workflow,
  UserCheck,
  RefreshCw,
  X,
  Menu,
  Home,
  FolderOpen,
  CheckCircle2,
  BarChart4,
  Eraser,
  Hammer,
  LineChart,
  Search,
  Bot,
  Layers3,
  Award,
  Lightbulb,
  Play,
  Download,
  MessageSquare,
  Sliders,
  Globe,
  CreditCard,
  ExternalLink,
  Key
} from "lucide-react";
import StatisticalTesting from "./components/StatisticalTesting";

// User-friendly Categories/Phases for simplifying the workspace
const CATEGORIES = [
  { id: "all", label: "All Modules", emoji: "🎛️" },
  { id: "data_prep", label: "Data Prep & Clean", emoji: "📁" },
  { id: "eda_stats", label: "Exploratory Analytics", emoji: "📊" },
  { id: "machine_learning", label: "Machine Learning Model", emoji: "🤖" },
  { id: "production", label: "Predict & Deploy", emoji: "🔮" },
  { id: "support", label: "AI & Preferences", emoji: "⚙️" }
];

// Interactive Guided Workflows to walk beginners step-by-step
const PATHWAYS = [
  {
    id: "predictive_ml",
    title: "Predictive Machine Learning Journey",
    subtitle: "Recommended for building and evaluating classic predictive models",
    emoji: "🎯",
    color: "from-indigo-600/10 to-blue-600/10 border-indigo-500/30 text-indigo-400",
    steps: [
      { id: "datasets", label: "1. Upload & Ingest" },
      { id: "profiling", label: "2. Profile Features" },
      { id: "automl", label: "3. Train Model" },
      { id: "prediction", label: "4. Run Inference" }
    ]
  },
  {
    id: "data_clean_eda",
    title: "Deep Data Exploratory & Cleaning Journey",
    subtitle: "Recommended for uncovering raw mathematical patterns, cleaning data, and checking distributions",
    emoji: "🧹",
    color: "from-emerald-600/10 to-teal-600/10 border-emerald-500/30 text-emerald-400",
    steps: [
      { id: "datasets", label: "1. Upload & Ingest" },
      { id: "cleaning", label: "2. Clean Anomalies" },
      { id: "visualization", label: "3. Visualize Plots" },
      { id: "eda", label: "4. Run Full EDA" }
    ]
  },
  {
    id: "edge_telemetry",
    title: "Enterprise Edge IoT & Monitoring",
    subtitle: "Recommended for streaming sensor data, anomaly diagnostics, and report downloads",
    emoji: "📡",
    color: "from-amber-600/10 to-rose-600/10 border-amber-500/30 text-amber-400",
    steps: [
      { id: "datasets", label: "1. Set Up Feed" },
      { id: "anomalies", label: "2. Isolate Anomalies" },
      { id: "deployment", label: "3. Deploy Endpoint" },
      { id: "reports", label: "4. Export Report" }
    ]
  }
];

// Flat modules list mapped with respective category properties
const MODULES_LIST = [
  {
    id: "home",
    label: "Home",
    desc: "Main dashboard hub and modules overview",
    icon: Home,
    color: "text-blue-400",
    emoji: "⚡",
    category: "all"
  },
  {
    id: "datasets",
    label: "Datasets & Upload",
    desc: "Upload CSV, Excel, or JSON and preview instantly.",
    icon: FolderOpen,
    color: "text-amber-400",
    emoji: "📁",
    category: "data_prep"
  },
  {
    id: "sqllab",
    label: "SQL Query Lab",
    desc: "Query, slice, and group records inside your active dataset using interactive in-browser SQL.",
    icon: Database,
    color: "text-indigo-400",
    emoji: "💾",
    category: "data_prep"
  },
  {
    id: "validation",
    label: "Data Validation",
    desc: "Check dataset quality and structure for issues.",
    icon: ShieldCheck,
    color: "text-emerald-400",
    emoji: "✅",
    category: "data_prep"
  },
  {
    id: "profiling",
    label: "Data Profiling",
    desc: "Missing values, dtypes, duplicates, statistics.",
    icon: BarChart4,
    color: "text-cyan-400",
    emoji: "📊",
    category: "data_prep"
  },
  {
    id: "cleaning",
    label: "Data Cleaning",
    desc: "Handle missing values, duplicates, outliers.",
    icon: Eraser,
    color: "text-rose-400",
    emoji: "🧹",
    category: "data_prep"
  },
  {
    id: "engineering",
    label: "Feature Engineering",
    desc: "Encoding, scaling, PCA, feature selection.",
    icon: Sliders,
    color: "text-indigo-400",
    emoji: "🔧",
    category: "eda_stats"
  },
  {
    id: "visualization",
    label: "Visualization",
    desc: "Histograms, correlation matrix, scatter plots.",
    icon: LineChart,
    color: "text-orange-400",
    emoji: "📈",
    category: "eda_stats"
  },
  {
    id: "eda",
    label: "EDA",
    desc: "Full statistical summary and distributions.",
    icon: Search,
    color: "text-teal-400",
    emoji: "🔍",
    category: "eda_stats"
  },
  {
    id: "automl",
    label: "AutoML Training",
    desc: "Train classification/regression models in one click.",
    icon: Bot,
    color: "text-yellow-400",
    emoji: "🤖",
    category: "machine_learning"
  },
  {
    id: "deeplearning",
    label: "Deep Learning",
    desc: "Train an Artificial Neural Network (ANN).",
    icon: Layers3,
    color: "text-purple-400",
    emoji: "🧠",
    category: "machine_learning"
  },
  {
    id: "ml_workbench",
    label: "ML Lifecycle Sandbox",
    desc: "Run unsupervised clustering, ensemble models, and time-series forecasting.",
    icon: Cpu,
    color: "text-violet-400",
    emoji: "🔬",
    category: "machine_learning"
  },
  {
    id: "solver",
    label: "Data Science Auto-Solver",
    desc: "Generate production-grade machine learning code, pipelines, and strategic architectures instantly.",
    icon: Code2,
    color: "text-amber-400",
    emoji: "⚙️",
    category: "machine_learning"
  },
  {
    id: "methodology",
    label: "Platform Methodology",
    desc: "Discover which DS problems are solved, how they are solved, and explore the Auto-Method pipeline.",
    icon: Workflow,
    color: "text-indigo-400",
    emoji: "🧭",
    category: "machine_learning"
  },
  {
    id: "anomalies",
    label: "Anomaly & Fraud Detection",
    desc: "Isolate anomalous behavior, flag fraud indices, and purge outlier vectors.",
    icon: ShieldAlert,
    color: "text-rose-400",
    emoji: "🚨",
    category: "machine_learning"
  },
  {
    id: "evaluation",
    label: "Model Evaluation",
    desc: "Confusion matrix, ROC curve, regression metrics.",
    icon: Award,
    color: "text-pink-400",
    emoji: "📐",
    category: "production"
  },
  {
    id: "explainability",
    label: "Explainability",
    desc: "Understand feature importance behind predictions.",
    icon: Lightbulb,
    color: "text-sky-400",
    emoji: "💡",
    category: "production"
  },
  {
    id: "prediction",
    label: "Prediction",
    desc: "Run predictions on new data with a trained model.",
    icon: Play,
    color: "text-emerald-500",
    emoji: "🔮",
    category: "production"
  },
  {
    id: "deployment",
    label: "Model Deployment",
    desc: "Deploy champion models to production API endpoints instantly.",
    icon: Server,
    color: "text-indigo-400",
    emoji: "🚀",
    category: "production"
  },
  {
    id: "reports",
    label: "Reports",
    desc: "Generate and download a PDF dataset report.",
    icon: FileText,
    color: "text-slate-400",
    emoji: "📄",
    category: "production"
  },
  {
    id: "export",
    label: "Export Center",
    desc: "Download all datasets, models, and reports.",
    icon: Download,
    color: "text-indigo-500",
    emoji: "⬇️",
    category: "production"
  },
  {
    id: "conversion",
    label: "Data Conversion",
    desc: "Interconvert datasets across CSV, JSON, Excel, XML, SQL, and Markdown.",
    icon: RefreshCw,
    color: "text-violet-400",
    emoji: "🔄",
    category: "data_prep"
  },
  {
    id: "chatbot",
    label: "Chatbot",
    desc: "Ask questions about your dataset in plain English.",
    icon: MessageSquare,
    color: "text-pink-500",
    emoji: "💬",
    category: "support"
  },
  {
    id: "settings",
    label: "Settings",
    desc: "Manage your account and preferences.",
    icon: Settings,
    color: "text-slate-500",
    emoji: "⚙️",
    category: "support"
  },
  {
    id: "enterprise_os",
    label: "Enterprise OS Blueprint",
    desc: "Interactive console to inspect, configure, simulate, and toggle all 55 modules of QuantumNestTech AI OS.",
    icon: Workflow,
    color: "text-indigo-400",
    emoji: "🌐",
    category: "support"
  }
];

const MODULES_SEQUENCE = [
  "datasets", "validation", "profiling", "cleaning", "engineering",
  "visualization", "eda", "automl", "deeplearning", "ml_workbench", "anomalies", "evaluation",
  "explainability", "prediction", "deployment", "reports", "export", "conversion", "chatbot", "enterprise_os", "settings"
];

export default function App() {
  // Mobile sidebar menu active state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // White-label customizer state
  const [brandingLogoText, setBrandingLogoText] = useState("Quantum DS Lab");
  const [brandingColor, setBrandingColor] = useState("indigo");
  const [brandingDomain, setBrandingDomain] = useState("analytics.quantumnest.tech");

  const handleUpdateBranding = (brandConfig: { logoText: string; primaryColor: string; domain: string }) => {
    setBrandingLogoText(brandConfig.logoText);
    setBrandingColor(brandConfig.primaryColor);
    setBrandingDomain(brandConfig.domain);
  };

  // Session States
  const [userProfile, setUserProfile] = useState<{ email: string; fullName: string } | null>(() => {
    const saved = localStorage.getItem("quantum_ds_active_session");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [uid, setUid] = useState<string | null>(() => {
    const saved = localStorage.getItem("quantum_ds_active_session");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.email || null;
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // Dataset States
  const [activeDataset, setActiveDataset] = useState(() => preloadedDatasets.Titanic());

  // Model states across modules
  const [modelRuns, setModelRuns] = useState<SavedModelRun[]>([]);
  const [activeChampion, setActiveChampion] = useState<SavedModelRun | null>(null);

  // Real-time Dashboard Simulator states
  const [simulatingTraining, setSimulatingTraining] = useState(false);
  const [simulationEpochs, setSimulationEpochs] = useState<any[]>([
    { epoch: 1, loss: 0.92, accuracy: 0.52, valLoss: 0.95, valAccuracy: 0.50 },
    { epoch: 2, loss: 0.78, accuracy: 0.61, valLoss: 0.81, valAccuracy: 0.59 },
    { epoch: 3, loss: 0.62, accuracy: 0.72, valLoss: 0.68, valAccuracy: 0.70 },
    { epoch: 4, loss: 0.49, accuracy: 0.79, valLoss: 0.54, valAccuracy: 0.78 },
    { epoch: 5, loss: 0.38, accuracy: 0.84, valLoss: 0.44, valAccuracy: 0.82 },
    { epoch: 6, loss: 0.31, accuracy: 0.88, valLoss: 0.38, valAccuracy: 0.86 },
    { epoch: 7, loss: 0.25, accuracy: 0.91, valLoss: 0.32, valAccuracy: 0.89 },
    { epoch: 8, loss: 0.21, accuracy: 0.93, valLoss: 0.29, valAccuracy: 0.91 },
    { epoch: 9, loss: 0.18, accuracy: 0.95, valLoss: 0.26, valAccuracy: 0.93 },
    { epoch: 10, loss: 0.15, accuracy: 0.96, valLoss: 0.24, valAccuracy: 0.94 },
  ]);
  const [currentSimStep, setCurrentSimStep] = useState(10);
  const [activeMetricTab, setActiveMetricTab] = useState<"loss" | "accuracy">("loss");

  // Effect to run epoch training simulation
  useEffect(() => {
    let interval: any;
    if (simulatingTraining) {
      setCurrentSimStep(1);
      interval = setInterval(() => {
        setCurrentSimStep(prev => {
          if (prev >= 10) {
            setSimulatingTraining(false);
            clearInterval(interval);
            return 10;
          }
          return prev + 1;
        });
      }, 700); // 700ms per epoch for smooth simulation feel
    }
    return () => clearInterval(interval);
  }, [simulatingTraining]);

  // Real-time Streaming States
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamType, setStreamType] = useState<"iot" | "fraud" | "titanic" | "iris">("iot");
  
  // Enterprise SaaS Settings & Licensing States
  const [settingsTab, setSettingsTab] = useState<"general" | "licensing" | "clusters">("general");
  const [saasPlan, setSaasPlan] = useState<"developer" | "premium" | "industrial">("premium");
  const [licenseKey, setLicenseKey] = useState("QDS_E_LIC_8872_X92_BETA");
  const [apiClusterRegion, setApiClusterRegion] = useState("eu-central-1");
  const [routingPolicy, setRoutingPolicy] = useState("latency");
  const [replicationFactor, setReplicationFactor] = useState(3);
  const [maxInvocations, setMaxInvocations] = useState(500000);
  const [streamInterval, setStreamInterval] = useState(1500); // ms
  const [streamIndex, setStreamIndex] = useState(0);
  const [streamingLog, setStreamingLog] = useState<{ id: string; timestamp: string; message: string; type: "info" | "alert" | "success" }[]>([]);

  // Stream Switch Handler
  const handleStreamTypeChange = (type: "iot" | "fraud" | "titanic" | "iris") => {
    setStreamType(type);
    setIsStreaming(false);
    
    let firstRow: any = null;
    let datasetName = "";
    
    switch (type) {
      case "iot":
        firstRow = generateStreamingIoTRow(1);
        datasetName = "Real-Time Industrial IoT Stream";
        break;
      case "fraud":
        firstRow = generateStreamingFraudRow(1);
        datasetName = "Real-Time Credit Transactions Stream";
        break;
      case "titanic":
        firstRow = generateStreamingTitanicRow(1);
        datasetName = "Real-Time Titanic Virtual Ingestion";
        break;
      case "iris":
        firstRow = generateStreamingIrisRow(1);
        datasetName = "Real-Time Botanical Lab Stream";
        break;
    }

    const initialDS = buildDataset(datasetName, [firstRow]);
    setActiveDataset(initialDS);
    setStreamIndex(1);
    setStreamingLog([{
      id: "initial",
      timestamp: new Date().toLocaleTimeString(),
      message: `Initialized real-time ${type.toUpperCase()} stream. Press Start to stream packets live!`,
      type: "info"
    }]);
  };

  // Streaming Effect Loop
  useEffect(() => {
    if (!isStreaming) return;

    const intervalId = setInterval(() => {
      setStreamIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        
        let newRow: any = null;
        let datasetName = "";
        
        switch (streamType) {
          case "iot":
            newRow = generateStreamingIoTRow(nextIndex);
            datasetName = "Real-Time Industrial IoT Stream";
            break;
          case "fraud":
            newRow = generateStreamingFraudRow(nextIndex);
            datasetName = "Real-Time Credit Transactions Stream";
            break;
          case "titanic":
            newRow = generateStreamingTitanicRow(nextIndex);
            datasetName = "Real-Time Titanic Virtual Ingestion";
            break;
          case "iris":
            newRow = generateStreamingIrisRow(nextIndex);
            datasetName = "Real-Time Botanical Lab Stream";
            break;
        }

        if (newRow) {
          setActiveDataset((prevDataset) => {
            const isMatchingStream = 
              (streamType === "iot" && prevDataset.name === "Real-Time Industrial IoT Stream") ||
              (streamType === "fraud" && prevDataset.name === "Real-Time Credit Transactions Stream") ||
              (streamType === "titanic" && prevDataset.name === "Real-Time Titanic Virtual Ingestion") ||
              (streamType === "iris" && prevDataset.name === "Real-Time Botanical Lab Stream");
            
            const currentRows = isMatchingStream ? [...prevDataset.rows] : [];
            
            // Limit rows to avoid local memory limits on prolonged stream
            if (currentRows.length >= 100) {
              currentRows.shift();
            }
            
            const updatedRows = [...currentRows, newRow];
            return buildDataset(datasetName, updatedRows);
          });

          // Compute prediction if champion exists
          let predictionMsg = "";
          if (activeChampion) {
            let linearCombo = activeChampion.intercept;
            let hasAllFeatures = true;
            activeChampion.predictors.forEach((feat) => {
              if (newRow[feat] !== undefined) {
                linearCombo += (activeChampion.weights[feat] || 0) * Number(newRow[feat]);
              } else {
                hasAllFeatures = false;
              }
            });

            if (hasAllFeatures) {
              let score = 0;
              let prob: number | null = null;
              if (activeChampion.type === "Classification") {
                const p = 1 / (1 + Math.exp(-linearCombo));
                prob = p;
                score = p >= 0.5 ? 1 : 0;
                predictionMsg = `🤖 AutoML Score: ${score === 1 ? "Positive (Class 1)" : "Negative (Class 0)"} [Prob: ${(p * 100).toFixed(1)}%]`;
              } else {
                score = parseFloat(linearCombo.toFixed(3));
                predictionMsg = `🤖 AutoML Score: ${score}`;
              }
            }
          }

          let logMsg = "";
          let logType: "info" | "alert" | "success" = "info";

          if (streamType === "iot") {
            logMsg = `Packet #${newRow.PacketID}: Temp=${newRow["Temperature (°C)"]}°C, Vib=${newRow["Vibration (Hz)"]}Hz. ${newRow.Status === "CRITICAL" ? "🚨 CRITICAL FAULT!" : ""}`;
            logType = newRow.Status === "CRITICAL" ? "alert" : newRow.Status === "WARNING" ? "info" : "success";
          } else if (streamType === "fraud") {
            logMsg = `Tx #${newRow.TxID}: Amount=$${newRow["Amount (USD)"]}, Dist=${newRow["Distance (km)"]}km. ${newRow.Status === "SUSPICIOUS" ? "⚠️ SUSPICIOUS TX!" : ""}`;
            logType = newRow.Status === "SUSPICIOUS" ? "alert" : "success";
          } else if (streamType === "titanic") {
            logMsg = `Virtual Passenger: ${newRow.Name}, Fare=$${newRow.Fare}. survived=${newRow.Survived}`;
            logType = newRow.Survived === 1 ? "success" : "info";
          } else {
            logMsg = `Iris Plant: ${newRow.Species}, SepalL=${newRow.SepalLength}cm, PetalL=${newRow.PetalLength}cm`;
            logType = "success";
          }

          if (predictionMsg) {
            logMsg += ` | ${predictionMsg}`;
          }

          setStreamingLog((prevLogs) => {
            const newLogs = [{
              id: `${nextIndex}-${Date.now()}`,
              timestamp: new Date().toLocaleTimeString(),
              message: logMsg,
              type: logType
            }, ...prevLogs];
            return newLogs.slice(0, 15);
          });
        }

        return nextIndex;
      });
    }, streamInterval);

    return () => clearInterval(intervalId);
  }, [isStreaming, streamType, streamInterval, activeChampion]);

  // Active module ID mapping (e.g. "home", "datasets", etc.)
  const [activeModuleId, setActiveModuleId] = useState<string>("home");

  // Auto close mobile sidebar when transitioning modules
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [activeModuleId]);

  // View state: "home" | "module"
  const [viewMode, setViewMode] = useState<"home" | "module">("home");

  // --- USER EXPERIENCE SIMPLIFICATION STATES ---
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activePathwayId, setActivePathwayId] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    data_prep: true,
    eda_stats: true,
    machine_learning: true,
    production: true,
    support: true
  });

  const toggleCategory = (catId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  // Local warning toast state
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  // EDA local view tab: "plotter" | "descriptive" | "copilot" | "enterprise"
  const [edaView, setEdaView] = useState<"plotter" | "descriptive" | "copilot" | "enterprise">("enterprise");

  const numericCount = useMemo(() => {
    return activeDataset.metadata.filter((m) => m.type === "numeric").length;
  }, [activeDataset]);

  const categoricalCount = useMemo(() => {
    return activeDataset.metadata.filter((m) => m.type !== "numeric").length;
  }, [activeDataset]);

  // Real-time Workspace Load from localStorage
  useEffect(() => {
    if (!uid) return;
    const loadWorkspace = () => {
      try {
        const savedConfig = localStorage.getItem(`quantum_ds_workspace_${uid}`);
        if (savedConfig) {
          const data = JSON.parse(savedConfig);
          if (data.brandingLogoText) setBrandingLogoText(data.brandingLogoText);
          if (data.brandingColor) setBrandingColor(data.brandingColor);
          if (data.brandingDomain) setBrandingDomain(data.brandingDomain);
          if (data.saasPlan) setSaasPlan(data.saasPlan);
          if (data.licenseKey) setLicenseKey(data.licenseKey);
          if (data.apiClusterRegion) setApiClusterRegion(data.apiClusterRegion);
          if (data.activePathwayId) setActivePathwayId(data.activePathwayId);
          if (data.activeModuleId) setActiveModuleId(data.activeModuleId);
        }
      } catch (err) {
        console.warn("Could not load workspace configuration from localStorage", err);
      }
    };
    loadWorkspace();
  }, [uid]);

  // Real-time Workspace Save to localStorage (with a debounce to avoid rate limits)
  useEffect(() => {
    if (!uid) return;
    const saveWorkspace = () => {
      try {
        localStorage.setItem(`quantum_ds_workspace_${uid}`, JSON.stringify({
          brandingLogoText,
          brandingColor,
          brandingDomain,
          saasPlan,
          licenseKey,
          apiClusterRegion,
          activePathwayId,
          activeModuleId,
          updatedAt: new Date().toISOString()
        }));
      } catch (err) {
        console.warn("Could not save workspace configuration to localStorage", err);
      }
    };

    const timer = setTimeout(() => {
      saveWorkspace();
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    uid,
    brandingLogoText,
    brandingColor,
    brandingDomain,
    saasPlan,
    licenseKey,
    apiClusterRegion,
    activePathwayId,
    activeModuleId
  ]);

  const handleLogin = (email: string, fullName: string) => {
    const profile = { email, fullName };
    setUserProfile(profile);
    setUid(email);
    localStorage.setItem("quantum_ds_active_session", JSON.stringify(profile));
    setActiveModuleId("home");
    setViewMode("home");
  };

  const handleLogout = () => {
    setUserProfile(null);
    setUid(null);
    localStorage.removeItem("quantum_ds_active_session");
    setActiveModuleId("home");
    setViewMode("home");
    setModelRuns([]);
    setActiveChampion(null);
  };

  const advanceModule = () => {
    const currentIndex = MODULES_SEQUENCE.indexOf(activeModuleId);
    if (currentIndex !== -1 && currentIndex < MODULES_SEQUENCE.length - 1) {
      const nextModuleId = MODULES_SEQUENCE[currentIndex + 1];
      setActiveModuleId(nextModuleId);
      setViewMode("module");
    } else {
      setActiveModuleId("home");
      setViewMode("home");
    }
  };

  // Register trained model run
  const handleModelTrained = (run: SavedModelRun) => {
    setModelRuns((prev) => [run, ...prev]);
    setActiveChampion(run);
  };

  const handleResetWorkflow = () => {
    setActiveModuleId("home");
    setModelRuns([]);
    setActiveChampion(null);
    setViewMode("home");
  };

  // Render the Settings Panel internally
  const renderSettingsPanel = () => {
    // SLA Dynamic text generator based on plan choice
    const getSLADescription = () => {
      switch (saasPlan) {
        case "developer":
          return {
            name: "Developer Sandbox Tier",
            price: "$0 / month (Testing limits)",
            bandwidth: "50 GB Inflow/mo",
            sla: "No SLA Guarantee (Best effort support)",
            nodes: "1 Shared Sandbox Node",
            features: ["Single-user sandbox access", "Standard AutoML classification", "Transient local storage caching", "Best-effort community support"]
          };
        case "premium":
          return {
            name: "Enterprise Premium SaaS Tier",
            price: "$1,499 / month (Billed Annually)",
            bandwidth: "10 TB Stream Ingestion/mo",
            sla: "99.95% API Uptime SLA Guarantee",
            nodes: "3 Load-Balanced Production Nodes",
            features: ["Multi-tenant team workspaces", "Unsupervised clustering & deep ANN models", "Apache Kafka & Secure WebSocket ingress", "24/7 dedicated DevOps engineer support desk"]
          };
        case "industrial":
          return {
            name: "Industrial Edge Real-Time SLA Tier",
            price: "$4,999 / month (Premium Edge SLA)",
            bandwidth: "Unlimited real-time telemetry pipelines",
            sla: "99.999% High-Availability Edge SLA",
            nodes: "Multi-Region Geo-Replicated Cluster",
            features: ["Dual-active primary edge servers", "Physical MQTT / Industrial SCADA socket handlers", "Zero-latency predictive edge score caches", "Dedicated TAM (Technical Account Manager) & on-site setups"]
          };
      }
    };

    const currentSLA = getSLADescription();

    // Trigger contract sign download
    const handleSignContract = () => {
      const contractText = `=====================================================
QUANTUM DATA SCIENCE STUDIO (QDS) - COMMERCIAL SLA COVENANT
=====================================================
Tenant ID: QDS-T-${userProfile?.fullName.toUpperCase().replace(/\s+/g, "-")}-2026
Authorized Officer: ${userProfile?.fullName}
Registered email: ${userProfile?.email}
Selected SaaS Tier: ${currentSLA.name}
Contract Value: ${currentSLA.price}
Guaranteed Service SLA: ${currentSLA.sla}
Default Ingestion Limit: ${currentSLA.bandwidth}
Secure License Key: ${licenseKey}

--- COVENANT CONDITIONS ---
1. Quantum DS Lab guarantees ${currentSLA.sla} for prediction gateways.
2. Inflow streams through Apache Kafka, WebSockets, or MQTT brokers are allocated a default cap of ${currentSLA.bandwidth}.
3. Customer assumes full compliance for the physical edge nodes deployed in active regional clusters.
4. SLA credits are governed by Standard Appendix A-4 multi-region failover protocols.

Signed Digitally: QDS_LAB_SHA256_E_AUTH_SIGN_SUCCESS
Timestamp: ${new Date().toUTCString()}
=====================================================`;

      const blob = new Blob([contractText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `qds_sla_covenant_${saasPlan}.txt`;
      link.click();
      URL.revokeObjectURL(url);

      setWarningMessage(`Commercial SLA Agreement for ${currentSLA.name} signed & exported successfully!`);
      setTimeout(() => setWarningMessage(null), 4000);
    };

    return (
      <div className="space-y-6 animate-fade-in font-sans text-slate-200" id="settings-panel">
        
        {/* Main Header Card */}
        <div className="bg-gradient-to-r from-slate-900/90 to-[#0e1726]/80 border border-slate-850 p-6 rounded-2xl shadow-md space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-indigo-400 font-mono font-bold text-xs uppercase tracking-wider">
                <Settings className="w-4 h-4 text-indigo-400" />
                <span>Commercial Operations & Cloud Console</span>
              </div>
              <h3 className="text-white font-bold text-lg font-display">Enterprise Deployment & SaaS Monetization Control</h3>
              <p className="text-xs text-slate-400 max-w-2xl">
                Configure your multi-tenant parameters, pick corporate SLAs, sign premium commercial licensing agreements, and monitor your geo-replicated deployment nodes in real time.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-indigo-950/40 border border-indigo-900/30 p-2.5 rounded-xl font-mono text-[10px] text-indigo-300 leading-none shrink-0 self-start">
              <span>LICENSE STATUS: </span>
              <strong className="text-emerald-400 animate-pulse">ACTIVE ENTERPRISE</strong>
            </div>
          </div>

          {/* Settings Sub-Tabs selection */}
          <div className="flex border-t border-slate-800/80 pt-4 gap-2" id="settings-sub-navigation">
            <button
              onClick={() => setSettingsTab("general")}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition flex items-center gap-1.5 ${
                settingsTab === "general"
                  ? "bg-indigo-600 text-white shadow shadow-indigo-900/20"
                  : "bg-slate-950/40 border border-slate-850 text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>⚙️ General Workspace Config</span>
            </button>
            <button
              onClick={() => setSettingsTab("licensing")}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition flex items-center gap-1.5 ${
                settingsTab === "licensing"
                  ? "bg-indigo-600 text-white shadow shadow-indigo-900/20"
                  : "bg-slate-950/40 border border-slate-850 text-slate-400 hover:text-slate-200"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>💳 SaaS Plan & Commercial License</span>
            </button>
            <button
              onClick={() => setSettingsTab("clusters")}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition flex items-center gap-1.5 ${
                settingsTab === "clusters"
                  ? "bg-indigo-600 text-white shadow shadow-indigo-900/20"
                  : "bg-slate-950/40 border border-slate-850 text-slate-400 hover:text-slate-200"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>🌐 Multi-Tenant Clusters & HA</span>
            </button>
          </div>
        </div>

        {/* Tab content rendering */}
        {settingsTab === "general" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            {/* Active Workspace Stats */}
            <div className="bg-[#0e1726]/40 border border-slate-800/80 p-6 rounded-2xl space-y-4">
              <h4 className="text-white font-bold text-sm border-b border-slate-850 pb-2 flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                Active Sandbox Statistics
              </h4>
              <div className="space-y-3 font-sans">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">User Profile Name:</span>
                  <span className="text-white font-semibold">{userProfile?.fullName}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Profile Access Level:</span>
                  <span className="px-2 py-0.5 bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 text-[10px] font-mono rounded font-bold">ENTERPRISE ADMIN</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Loaded Dataset:</span>
                  <span className="text-emerald-400 font-semibold font-mono">{activeDataset.name}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Dataset Dimensions:</span>
                  <span className="text-white font-mono">{activeDataset.rows.length} rows × {activeDataset.columns.length} cols</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Simulated Training Runs:</span>
                  <span className="text-indigo-400 font-semibold">{modelRuns.length} models trained</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Active Champion algorithm:</span>
                  <span className="text-amber-400 font-semibold">{activeChampion ? activeChampion.algorithm : "None Locked"}</span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="bg-[#0e1726]/40 border border-slate-800/80 p-6 rounded-2xl space-y-4">
              <h4 className="text-white font-bold text-sm border-b border-slate-850 pb-2 flex items-center gap-2">
                <Database className="w-4 h-4 text-rose-400" />
                Destructive Reset Controls
              </h4>
              <p className="text-xs text-slate-400 leading-normal">
                Resetting will clear all currently preprocessed dataset variables, discard trained model leaderboards, and lock subsequent pipelines to re-initialize your baseline diagnostics.
              </p>
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleResetWorkflow}
                  className="w-full py-2.5 px-4 bg-rose-600/10 hover:bg-rose-600 border border-rose-500/30 text-rose-300 hover:text-white rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4 animate-spin-hover" />
                  <span>Reset Sandbox Workspace</span>
                </button>
                
                <button
                  onClick={() => {
                    setActiveDataset(preloadedDatasets.Titanic());
                    setWarningMessage("Dataset successfully restored to Titanic's baseline defaults.");
                    setTimeout(() => setWarningMessage(null), 3000);
                  }}
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span>Restore Titanic Default Dataset</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Commercial SaaS Plans & Licensing */}
        {settingsTab === "licensing" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
            {/* SaaS Tiers selector - 5 cols */}
            <div className="lg:col-span-5 bg-[#0e1726]/40 border border-slate-800/80 p-6 rounded-2xl flex flex-col justify-between gap-5">
              <div className="space-y-4">
                <h4 className="text-white font-bold text-sm border-b border-slate-855 pb-2 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-indigo-400" />
                  Select Commercial SaaS License Tier
                </h4>

                <div className="space-y-3">
                  {([
                    { id: "developer", label: "Developer Sandbox Free", price: "$0 / mo", desc: "For pre-production local scoring" },
                    { id: "premium", label: "Enterprise Premium Core", price: "$1,499 / mo", desc: "99.95% API SLA & Kafka tunnels" },
                    { id: "industrial", label: "Industrial Edge Real-Time", price: "$4,999 / mo", desc: "99.999% SLA, MQTT edge nodes" }
                  ] as const).map((tier) => (
                    <button
                      key={tier.id}
                      onClick={() => setSaasPlan(tier.id)}
                      className={`w-full p-4 rounded-xl border text-left cursor-pointer transition flex items-center justify-between gap-3 ${
                        saasPlan === tier.id
                          ? "bg-indigo-600/10 border-indigo-500 shadow-sm"
                          : "bg-slate-950/30 border-slate-850 hover:bg-slate-900/40 hover:border-slate-800"
                      }`}
                    >
                      <div className="space-y-0.5">
                        <span className="block text-xs font-bold text-white">{tier.label}</span>
                        <span className="block text-[10px] text-slate-400 leading-tight">{tier.desc}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="block text-xs font-bold font-mono text-indigo-400">{tier.price}</span>
                        {saasPlan === tier.id && (
                          <span className="inline-block px-1.5 py-0.5 bg-indigo-500 text-[8px] font-mono font-bold uppercase rounded leading-none text-white mt-1">
                            SELECTED
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                    🔐 Tenant API Authorization License Key
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={licenseKey}
                      onChange={(e) => setLicenseKey(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs font-mono text-indigo-300 focus:outline-none focus:border-indigo-500 pr-10"
                    />
                    <Key className="absolute right-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                  </div>
                  <span className="text-[9px] text-slate-500 leading-normal block">
                    Use this key to authorize production REST requests or SSE event listener channels on standard edge sockets.
                  </span>
                </div>
              </div>

              {/* Invoiced limits visualization */}
              <div className="bg-slate-950/40 border border-slate-850 p-3 rounded-xl space-y-2.5 font-mono text-[10px]">
                <div className="flex justify-between text-slate-400">
                  <span>API Request Counter Limit:</span>
                  <span className="text-white font-bold">{saasPlan === "developer" ? "10,000 / mo" : saasPlan === "premium" ? "5,000,000 / mo" : "Unlimited"}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                    style={{ width: saasPlan === "developer" ? "85%" : saasPlan === "premium" ? "15%" : "2%" }}
                  />
                </div>
                <div className="flex justify-between items-center text-[9px] text-slate-500">
                  <span>Usage: {saasPlan === "developer" ? "8,500 scored rows (85%)" : saasPlan === "premium" ? "750,000 scored rows (15%)" : "1.2M scored rows"}</span>
                  <span className="text-indigo-400">Auto-Renews in 18 days</span>
                </div>
              </div>
            </div>

            {/* SLA Document & Sign contract - 7 cols */}
            <div className="lg:col-span-7 bg-[#0e1726]/40 border border-slate-800/80 p-6 rounded-2xl flex flex-col justify-between gap-4">
              <div className="space-y-4">
                <h4 className="text-white font-bold text-sm border-b border-slate-855 pb-2 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    Premium Service Level Agreement (SLA) Covenant
                  </span>
                  <span className="text-[8px] bg-indigo-950/50 text-indigo-400 border border-indigo-900/40 px-2 py-0.5 rounded uppercase font-bold font-mono">
                    SECURED CONTRACT
                  </span>
                </h4>

                <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 font-mono text-[10px] text-slate-300 space-y-3 leading-normal max-h-72 overflow-y-auto select-all">
                  <div className="border-b border-slate-900 pb-1.5 text-center text-xs font-bold text-white tracking-wide">
                    SaaS DEPLOYMENT AGREEMENT & SLA
                  </div>
                  <p>
                    <strong className="text-indigo-300">PROVIDER:</strong> Quantum Data Science Studio LLC ("QDS")<br />
                    <strong className="text-indigo-300">CLIENT ADMIN:</strong> {userProfile?.fullName} ({userProfile?.email})<br />
                    <strong className="text-indigo-300">ACTIVE SUBSCRIPTION TIER:</strong> {currentSLA.name}<br />
                    <strong className="text-indigo-300">COMMITMENT FEE:</strong> {currentSLA.price}
                  </p>
                  <p>
                    <strong>1. AVAILABILITY & CORE SLAS:</strong> QDS guarantees a performance reliability SLA of <strong className="text-emerald-400">{currentSLA.sla}</strong> on primary API scoring gateways. Outages falling below this threshold trigger service invoice credits under Chapter 12 of the Commercial Code.
                  </p>
                  <p>
                    <strong>2. DEPLOYMENT CAPABILITIES:</strong> Client is provisioned <strong className="text-indigo-300">{currentSLA.nodes}</strong>. Live ingestion throughput is restricted to <strong className="text-indigo-300">{currentSLA.bandwidth}</strong>.
                  </p>
                  <p>
                    <strong>3. ACTIVE FEATURES:</strong> This tier unlocks access to:
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-[9.5px]">
                    {currentSLA.features.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                  <p className="text-[9px] text-slate-500 italic">
                    By downloading or signing this covenant digitally, the Client agrees to full terms of licensing guidelines, data privacy vectors, and high-availability server provisions.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleSignContract}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold font-sans transition flex items-center justify-center gap-2 cursor-pointer shadow shadow-emerald-900/20"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Sign & Download Digital SLA Contract</span>
                </button>
                <button
                  onClick={() => {
                    setWarningMessage("Standard SLA support desk notified. An enterprise manager will contact you in under 15 minutes.");
                    setTimeout(() => setWarningMessage(null), 4000);
                  }}
                  className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Request Customized SLA Terms
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Multi-Tenant Regional Clusters & High Availability */}
        {settingsTab === "clusters" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
            {/* Cluster config form - 5 cols */}
            <div className="lg:col-span-5 bg-[#0e1726]/40 border border-slate-800/80 p-6 rounded-2xl flex flex-col justify-between gap-5">
              <div className="space-y-4">
                <h4 className="text-white font-bold text-sm border-b border-slate-855 pb-2 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-400" />
                  Cloud Deployment Region
                </h4>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[9px] font-mono font-bold text-slate-500 uppercase mb-1">
                      Target Cloud Data Center (Edge)
                    </label>
                    <select
                      value={apiClusterRegion}
                      onChange={(e) => {
                        setApiClusterRegion(e.target.value);
                        setWarningMessage(`Production routing cluster changed to ${e.target.value.toUpperCase()}. Provisioning active routes...`);
                        setTimeout(() => setWarningMessage(null), 3000);
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 font-semibold text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="eu-central-1">🇩🇪 Frankfurt (eu-central-1) - Primary EU Node</option>
                      <option value="us-west-2">🇺🇸 Oregon (us-west-2) - Primary NA Node</option>
                      <option value="ap-northeast-1">🇯🇵 Tokyo (ap-northeast-1) - Primary AP Node</option>
                      <option value="sa-east-1">🇧🇷 São Paulo (sa-east-1) - LATAM Gateway</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-mono font-bold text-slate-500 uppercase mb-1">
                      Cluster Ingress Routing Policy
                    </label>
                    <select
                      value={routingPolicy}
                      onChange={(e) => setRoutingPolicy(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 font-semibold text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="latency">Geo-Location Lowest Latency routing</option>
                      <option value="round_robin">Weighted Round-Robin (Equi-load balanced)</option>
                      <option value="least_conn">Least Connections (Failover friendly)</option>
                    </select>
                  </div>

                  {/* Replication Factor Slider */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-mono font-bold text-slate-500 uppercase">Cluster Replica Factor:</span>
                      <span className="text-indigo-400 font-mono font-bold">{replicationFactor} Database Replicas</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={replicationFactor}
                      onChange={(e) => setReplicationFactor(Number(e.target.value))}
                      className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                    <div className="flex justify-between text-[8px] text-slate-500 font-mono">
                      <span>Low HA (1 replica)</span>
                      <span>Extreme HA (5 replicas)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Node health statuses list */}
              <div className="space-y-2 border-t border-slate-855 pt-4 font-sans text-xs">
                <span className="block text-[9px] font-mono font-bold text-slate-500 uppercase">
                  Active Edge Node Health (Live TLS Heartbeats)
                </span>
                
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="bg-slate-950/50 p-2 border border-slate-850 rounded-lg flex items-center justify-between">
                    <span className="text-slate-300 font-mono">qds-node-01a</span>
                    <span className="text-emerald-400 font-bold font-mono">● 100% HEALTHY</span>
                  </div>
                  <div className="bg-slate-950/50 p-2 border border-slate-850 rounded-lg flex items-center justify-between">
                    <span className="text-slate-300 font-mono">qds-node-01b</span>
                    <span className="text-emerald-400 font-bold font-mono">● 100% HEALTHY</span>
                  </div>
                  <div className="bg-slate-950/50 p-2 border border-slate-850 rounded-lg flex items-center justify-between">
                    <span className="text-slate-300 font-mono">qds-node-replica</span>
                    <span className="text-indigo-400 font-bold font-mono">● SYNCED (3ms lag)</span>
                  </div>
                  <div className="bg-slate-950/50 p-2 border border-slate-850 rounded-lg flex items-center justify-between">
                    <span className="text-slate-300 font-mono">load-balancer</span>
                    <span className="text-emerald-400 font-bold font-mono">● ACTIVE (TLS 1.3)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cluster console & Latency Simulator - 7 cols */}
            <div className="lg:col-span-7 bg-[#0e1726]/40 border border-slate-800/80 p-6 rounded-2xl flex flex-col justify-between gap-4">
              <div className="space-y-4">
                <h4 className="text-white font-bold text-sm border-b border-slate-855 pb-2 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-indigo-400" />
                    Distributed Ingress Gateway Logs
                  </span>
                  <span className="text-[8px] bg-emerald-950/50 text-emerald-400 border border-emerald-900/40 px-2 py-0.5 rounded uppercase font-bold font-mono">
                    ONLINE
                  </span>
                </h4>

                {/* Simulated log console */}
                <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 font-mono text-[10px] text-slate-300 space-y-1.5 max-h-64 overflow-y-auto select-all leading-relaxed">
                  <div>[{new Date().toLocaleTimeString()}] INFO: Load balancer routing policy set to {routingPolicy.toUpperCase()} via Region: {apiClusterRegion.toUpperCase()}.</div>
                  <div className="text-emerald-400">[{new Date().toLocaleTimeString()}] SUCCESS: Verified TCP handshakes across all {replicationFactor} distributed database replicas.</div>
                  <div>[{new Date().toLocaleTimeString()}] INFO: Ingress TCP listener established on port 443 with TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384 cipher.</div>
                  <div>[{new Date().toLocaleTimeString()}] INFO: Active sync pipeline replicating dataset: "{activeDataset.name}" across nodes...</div>
                  <div className="text-indigo-400">[{new Date().toLocaleTimeString()}] STATUS: Replication lag between {apiClusterRegion.toUpperCase()} and backup failover stands at 14.5ms (well within SLA limits).</div>
                  <div>[{new Date().toLocaleTimeString()}] INFO: Health probe check successful for all backend edge docker containers. CPU load is 4.8%. Memory is 22%.</div>
                  <div className="text-slate-500 italic">[{new Date().toLocaleTimeString()}] INFO: Monitoring stream dynamically scores edge payloads using champion: "{activeChampion ? activeChampion.name : "Unassigned"}"...</div>
                </div>

                <div className="p-3 bg-slate-950/30 border border-slate-850 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-slate-400">Average Routing Latency:</span>
                  <strong className="text-emerald-400 font-mono">11.8 ms (Optimized)</strong>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setWarningMessage("Executing live regional latency test across all primary DNS nodes...");
                    setTimeout(() => {
                      setWarningMessage("Ping Successful: eu-central-1 (8ms) | us-west-2 (16ms) | ap-northeast-1 (28ms). All nodes fully functional.");
                    }, 1500);
                  }}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold font-sans transition flex items-center justify-center gap-2 cursor-pointer shadow shadow-indigo-900/20"
                >
                  <Activity className="w-4 h-4" />
                  <span>Run Live Regional Latency Test</span>
                </button>
                <button
                  onClick={() => {
                    setWarningMessage("Configuring multi-region load balancer bypass. Access routes directly bound to target edge nodes.");
                    setTimeout(() => setWarningMessage(null), 3000);
                  }}
                  className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Bypass Load Balancer
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  };

  const renderActiveModule = () => {
    switch (activeModuleId) {
      case "datasets":
        return (
          <UploadDataset
            activeDataset={activeDataset}
            onDatasetChange={setActiveDataset}
            onProceed={advanceModule}
          />
        );
      case "sqllab":
        return (
          <SQLLab
            dataset={activeDataset}
            onDatasetChange={setActiveDataset}
            onProceed={advanceModule}
          />
        );
      case "validation":
        return (
          <DataValidation
            activeDataset={activeDataset}
            onDatasetChange={setActiveDataset}
            onProceed={advanceModule}
          />
        );
      case "profiling":
        return (
          <div className="flex flex-col gap-6 animate-fade-in">
            <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl">
              <h3 className="text-white font-bold text-sm mb-1.5">Descriptive Statistics & Profiling</h3>
              <p className="text-xs text-slate-400">View continuous metrics, quantiles, mode distributions, and general information about categorical features.</p>
            </div>
            <DescriptiveStats dataset={activeDataset} />
            <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl mt-4">
              <h3 className="text-white font-bold text-sm mb-1.5">Statistical Testing Workbench</h3>
              <p className="text-xs text-slate-400">Perform pairwise T-Tests and run feature-to-feature Pearson correlations.</p>
            </div>
            <StatisticalTesting dataset={activeDataset} />
          </div>
        );
      case "cleaning":
        return (
          <DataPreprocessing
            activeDataset={activeDataset}
            onDatasetChange={setActiveDataset}
            onProceed={advanceModule}
          />
        );
      case "engineering":
        return (
          <FeatureEngineering
            activeDataset={activeDataset}
            onDatasetChange={setActiveDataset}
            onProceed={advanceModule}
          />
        );
      case "visualization":
        return (
          <div className="flex flex-col gap-6 animate-fade-in">
            <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl">
              <h3 className="text-white font-bold text-sm mb-1.5">Advanced Visual Plotter</h3>
              <p className="text-xs text-slate-400">Generate fully customizable histograms, cross-tabulations, and correlation matrices.</p>
            </div>
            <InteractiveCharts dataset={activeDataset} />
          </div>
        );
      case "eda":
        return (
          <div className="flex flex-col gap-6 animate-fade-in" id="eda-module-view">
            <div className="flex justify-between items-center bg-slate-900/40 border border-slate-800/80 p-3 rounded-2xl" id="eda-workbench-nav">
              <div className="font-sans text-xs text-slate-400">
                EDA Mode: <strong className="text-white font-semibold capitalize">{edaView === "enterprise" ? "Enterprise 23-Step Auto-EDA" : edaView}</strong>
              </div>
              <div className="bg-slate-950/50 p-1 rounded-xl border border-slate-800/80 flex items-center gap-1" id="eda-view-tabs">
                <button
                  onClick={() => setEdaView("enterprise")}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition cursor-pointer ${
                    edaView === "enterprise" ? "bg-[#1d293d] text-[#38bdf8]" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Enterprise Suite (23-Steps)
                </button>
                <button
                  onClick={() => setEdaView("plotter")}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition cursor-pointer ${
                    edaView === "plotter" ? "bg-[#1d293d] text-[#38bdf8]" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Visual Plotter
                </button>
                <button
                  onClick={() => setEdaView("descriptive")}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition cursor-pointer ${
                    edaView === "descriptive" ? "bg-[#1d293d] text-[#38bdf8]" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Descriptive Stats
                </button>
                <button
                  onClick={() => setEdaView("copilot")}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition cursor-pointer ${
                    edaView === "copilot" ? "bg-[#1d293d] text-[#38bdf8]" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  AI Copilot
                </button>
              </div>
            </div>

            {edaView === "enterprise" ? (
              <EnterpriseEDA dataset={activeDataset} />
            ) : edaView === "plotter" ? (
              <InteractiveCharts dataset={activeDataset} />
            ) : edaView === "descriptive" ? (
              <DescriptiveStats dataset={activeDataset} />
            ) : (
              <AICopilot dataset={activeDataset} />
            )}
          </div>
        );
      case "automl":
        return (
          <ModelTraining
            activeDataset={activeDataset}
            onModelTrained={handleModelTrained}
            onProceed={advanceModule}
          />
        );
      case "deeplearning":
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-gradient-to-r from-indigo-950/40 via-indigo-900/10 to-transparent border border-indigo-500/20 p-5 rounded-2xl">
              <h3 className="text-indigo-400 font-bold text-sm mb-1.5">Deep Learning Core</h3>
              <p className="text-xs text-slate-400">Configure and train an Artificial Neural Network (ANN) with custom hidden layer architectures, activation functions (ReLU, Sigmoid, Tanh), and optimization epochs.</p>
            </div>
            <ModelTraining
              activeDataset={activeDataset}
              onModelTrained={handleModelTrained}
              onProceed={advanceModule}
            />
          </div>
        );
      case "ml_workbench":
        return (
          <MachineLearningSandbox
            dataset={activeDataset}
          />
        );
      case "solver":
        return (
          <DataScienceSolver
            dataset={activeDataset}
          />
        );
      case "methodology":
        return (
          <DSMethodology
            dataset={activeDataset}
          />
        );
      case "anomalies":
        return (
          <AnomalyDetector
            activeDataset={activeDataset}
            onDatasetChange={setActiveDataset}
            onProceed={advanceModule}
          />
        );
      case "evaluation":
        return (
          <ModelEvaluation
            activeModel={activeChampion}
            onProceed={advanceModule}
          />
        );
      case "explainability":
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl">
              <h3 className="text-white font-bold text-sm mb-1.5">Model Explainability & Feature Importance</h3>
              <p className="text-xs text-slate-400">Review relative coefficient weights and Gini importance metrics on features contributing to correct classification outputs.</p>
            </div>
            <BestModelSelection
              modelRuns={modelRuns}
              activeChampion={activeChampion}
              onSelectChampion={setActiveChampion}
              onProceed={advanceModule}
            />
          </div>
        );
      case "prediction":
        return (
          <Prediction
            activeChampion={activeChampion}
            activeDataset={activeDataset}
            onProceed={advanceModule}
          />
        );
      case "deployment":
        return (
          <Deployment
            activeChampion={activeChampion}
            onProceed={advanceModule}
          />
        );
      case "reports":
        return (
          <ReportsMonitoring
            activeChampion={activeChampion}
            activeDataset={activeDataset}
            onResetWorkflow={handleResetWorkflow}
            isStreaming={isStreaming}
            setIsStreaming={setIsStreaming}
            streamType={streamType}
            setStreamType={setStreamType}
            streamInterval={streamInterval}
            setStreamInterval={setStreamInterval}
          />
        );
      case "export":
        return (
          <SaveModel
            activeChampion={activeChampion}
            activeDataset={activeDataset}
            onProceed={advanceModule}
          />
        );
      case "conversion":
        return (
          <DataConversion dataset={activeDataset} />
        );
      case "chatbot":
        return (
          <AICopilot dataset={activeDataset} />
        );
      case "enterprise_os":
        return (
          <EnterpriseOSHub
            dataset={activeDataset}
            onDatasetChange={setActiveDataset}
            activeChampion={activeChampion}
            userProfile={userProfile}
            onUpdateBranding={handleUpdateBranding}
          />
        );
      case "settings":
        return renderSettingsPanel();
      default:
        return (
          <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800/80">
            <p className="text-sm text-slate-400">Component mapping in progress...</p>
          </div>
        );
    }
  };

  // Memoized search and category filter for simplified visual grids
  const filteredModules = useMemo(() => {
    return MODULES_LIST.filter((m) => {
      // Exclude home from core grid render
      if (m.id === "home") return false;

      // Category match
      if (activeCategory !== "all" && m.category !== activeCategory) {
        return false;
      }

      // Keyword match
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        return (
          m.label.toLowerCase().includes(q) ||
          m.desc.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [activeCategory, searchQuery]);

  // 1. NOT LOGGED IN - FULL SCREEN AUTH SPLASH PAGE
  if (!userProfile) {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden" id="auth-root-container">
        {/* Decorative ambient background glows */}
        <div className="absolute top-[-10%] left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="w-full max-w-md space-y-8 z-10" id="auth-inner-box">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-6 flex items-center justify-center">
              {/* Outer pulsing ring */}
              <div className="absolute inset-0 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 animate-pulse" />
              {/* Spinning quantum particles */}
              <div className="absolute inset-1.5 rounded-xl border border-dashed border-cyan-400/40 animate-[spin_8s_linear_infinite]" />
              {/* Main inner badge */}
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 border border-indigo-400/20">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-amber-400 animate-bounce" />
            </div>
            
            <h1 className="font-display font-extrabold text-white text-3.5xl tracking-tight leading-none animate-fade-in" id="branding-title">
              {brandingLogoText}
            </h1>
            <span className="inline-block mt-3 px-3 py-0.5 bg-slate-900 border border-slate-800 rounded-full text-[10px] text-slate-400 font-mono leading-none font-semibold">
              ✨ ENTERPRISE LABORATORY v3.0
            </span>
            <p className="text-slate-400 text-xs mt-4 font-sans max-w-sm mx-auto leading-relaxed">
              An advanced, high-performance sandbox for end-to-end automated machine learning, data profiling, feature engineering, and predictive pipelines.
            </p>
          </div>

          <UserLogin onLogin={handleLogin} savedSession={userProfile} />
        </div>
      </div>
    );
  }

  // 2. LOGGED IN - CORE SIDEBAR AND WORKSPACE SYSTEM (Perfect Match of User's Image layout)
  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-indigo-500/30 relative overflow-x-hidden" id="app-workspace-root">
      
      {/* MOBILE SIDEBAR OVERLAY DRAWER BACKDROP */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          id="mobile-sidebar-backdrop"
        />
      )}

      {/* LEFT SIDEBAR PANEL */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#090e1a] border-r border-slate-850/80 flex flex-col shrink-0 h-screen transition-transform duration-200 ease-in-out
        lg:sticky lg:translate-x-0
        ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `} id="app-sidebar">
        {/* Logo Branding */}
        <div className="p-5 border-b border-slate-850/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-indigo-400/30 shrink-0">
              <Brain className="w-4.5 h-4.5 text-white animate-pulse" />
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-cyan-400 rounded-full border border-[#090e1a] animate-ping" />
            </div>
            <div>
              <h1 className="font-display font-extrabold text-white text-sm tracking-tight leading-none">
                {brandingLogoText}
              </h1>
              <p className="text-[9px] text-slate-500 font-mono mt-1 uppercase tracking-wider leading-none">Enterprise Suite</p>
            </div>
          </div>

          {/* Close button inside sidebar on mobile screens */}
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-900 transition cursor-pointer"
            id="mobile-sidebar-close-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Container with navigation, streaming console, and bento widgets */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-thin flex flex-col" id="sidebar-scrollable-content">
          <nav className="space-y-3.5" id="sidebar-navigation">
            {/* Home Button */}
            <button
              onClick={() => {
                setActiveModuleId("home");
                setViewMode("home");
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-all duration-150 cursor-pointer border ${
                activeModuleId === "home"
                  ? "bg-[#1d293d] border-[#1e293b] text-[#38bdf8]"
                  : "text-slate-400 hover:text-slate-200 hover:bg-[#111827]/40 border-transparent"
              }`}
              id="sidebar-link-home"
            >
              <div className="w-4 h-4 flex items-center justify-center shrink-0 text-blue-400">
                <Home className="w-full h-full" />
              </div>
              <span>Home Dashboard Hub</span>
            </button>

            {/* Divider */}
            <div className="h-[1px] bg-slate-850/60 mx-1" />

            {/* Categorized Folders */}
            {CATEGORIES.filter(cat => cat.id !== "all").map((cat) => {
              const isExpanded = !!expandedCategories[cat.id];
              const catModules = MODULES_LIST.filter(m => m.category === cat.id);
              const hasActiveModuleInCat = catModules.some(m => m.id === activeModuleId);

              return (
                <div key={cat.id} className="space-y-1">
                  {/* Category Header Toggle */}
                  <button
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-[9px] font-mono font-bold tracking-wider uppercase transition cursor-pointer ${
                      hasActiveModuleInCat 
                        ? "text-indigo-400 bg-indigo-950/20" 
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span>{cat.emoji}</span>
                      <span>{cat.label}</span>
                      <span className="text-[8px] bg-slate-900 border border-slate-850 text-slate-400 px-1.5 rounded-full font-mono">{catModules.length}</span>
                    </span>
                    {isExpanded ? <ChevronUp className="w-3 h-3 text-slate-500" /> : <ChevronDown className="w-3 h-3 text-slate-500" />}
                  </button>

                  {/* Category Sub-items */}
                  {isExpanded && (
                    <div className="pl-1 space-y-0.5 border-l border-slate-850/60 ml-2.5 pt-1">
                      {catModules.map((module) => {
                        const isCurrent = activeModuleId === module.id;
                        const Icon = module.icon;

                        return (
                          <button
                            key={module.id}
                            onClick={() => {
                              setActiveModuleId(module.id);
                              setViewMode("module");
                              setMobileMenuOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all duration-150 cursor-pointer border ${
                              isCurrent
                                ? "bg-[#1d293d] border-[#1e293b] text-[#38bdf8]"
                                : "text-slate-400 hover:text-slate-200 hover:bg-[#111827]/20 border-transparent"
                            }`}
                            id={`sidebar-link-${module.id}`}
                          >
                            <div className={`w-3.5 h-3.5 flex items-center justify-center shrink-0 ${module.color}`}>
                              <Icon className="w-full h-full" />
                            </div>
                            <span className="truncate">{module.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Divider */}
          <div className="h-[1px] bg-slate-850/60 mx-1" />

          {/* 📡 REAL-TIME IoT & PREDICTIVE STREAMING CONSOLE */}
          <div className="bg-slate-950/40 border border-slate-850/60 p-3 rounded-xl space-y-2.5 shadow-sm font-sans flex flex-col" id="sidebar-streaming-console">
            <div className="flex items-center justify-between border-b border-slate-850/60 pb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isStreaming ? "bg-emerald-400" : "bg-slate-500"}`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${isStreaming ? "bg-emerald-500" : "bg-slate-500"}`}></span>
                </span>
                <span className="text-[10px] font-mono font-extrabold uppercase text-slate-300 tracking-wider">
                  {isStreaming ? "📡 STREAMING ACTIVE" : "⏸️ STREAM PAUSED"}
                </span>
              </div>
              
              <button
                onClick={() => setIsStreaming(!isStreaming)}
                className={`p-1 px-2 rounded-lg text-[9px] font-mono font-extrabold transition cursor-pointer flex items-center gap-1 leading-none ${
                  isStreaming 
                    ? "bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 border border-rose-500/30" 
                    : "bg-emerald-600 text-white hover:bg-emerald-500 border border-transparent"
                }`}
              >
                <span>{isStreaming ? "PAUSE" : "START"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2 text-[10px]">
              {/* Stream Selector */}
              <div>
                <label className="block text-[8px] font-mono font-bold text-slate-500 uppercase mb-0.5">Simulated Industry Feed</label>
                <select
                  value={streamType}
                  onChange={(e) => handleStreamTypeChange(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-1.5 py-1 text-slate-300 font-medium focus:outline-none focus:border-indigo-500 text-[10px] cursor-pointer"
                >
                  <option value="iot">🏭 Industrial IoT Sensors</option>
                  <option value="fraud">💳 Credit Card Transactions</option>
                  <option value="titanic">🚢 Virtual Titanic inflow</option>
                  <option value="iris">🌸 Iris Botanical Lab</option>
                </select>
              </div>

              {/* Ingestion Speed */}
              <div className="flex justify-between items-center gap-1.5">
                <span className="text-[8px] font-mono font-bold text-slate-500 uppercase">Ingestion Speed</span>
                <div className="flex gap-1" id="stream-speed-tabs">
                  {([
                    { label: "0.5s", ms: 500 },
                    { label: "1.5s", ms: 1500 },
                    { label: "3s", ms: 3000 }
                  ]).map((speed) => (
                    <button
                      key={speed.label}
                      onClick={() => setStreamInterval(speed.ms)}
                      className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold transition cursor-pointer ${
                        streamInterval === speed.ms 
                          ? "bg-indigo-600 text-white" 
                          : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-850"
                      }`}
                    >
                      {speed.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ingested row count */}
              <div className="flex justify-between items-center border-t border-slate-850/80 pt-1.5 mt-0.5">
                <span className="text-[9px] font-medium text-slate-400">Total Ingested Matrix:</span>
                <span className="font-mono font-bold text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 px-1.5 py-0.5 rounded leading-none">
                  {activeDataset.rows.length} rows
                </span>
              </div>

              {/* Small Scrolling Live Log window */}
              <div className="mt-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[8px] font-mono font-bold text-slate-500 uppercase flex items-center gap-1">
                    <Activity className="w-2.5 h-2.5 text-indigo-400 animate-pulse" />
                    Live Ingest Telemetry
                  </span>
                  {activeChampion && (
                    <span className="text-[7px] font-mono text-amber-400 bg-amber-950/20 px-1 rounded border border-amber-900/30 leading-none">
                      ML SCORING ACTIVE
                    </span>
                  )}
                </div>
                <div className="bg-slate-950 border border-slate-850/80 rounded p-1.5 h-16 overflow-y-auto font-mono text-[8px] space-y-1 scrollbar-thin select-all">
                  {streamingLog.length === 0 ? (
                    <div className="text-slate-600 text-center py-2 italic">Waiting for feed start...</div>
                  ) : (
                    streamingLog.map((log) => (
                      <div key={log.id} className="leading-tight transition duration-150 flex items-start gap-1">
                        <span className="text-indigo-400 shrink-0 select-none">[{log.timestamp.split(" ")[0]}]</span>
                        <span className={`break-all ${
                          log.type === "alert" 
                            ? "text-rose-400 font-semibold animate-pulse" 
                            : log.type === "success" 
                            ? "text-emerald-400" 
                            : "text-slate-300"
                        }`}>
                          {log.message}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-[1px] bg-slate-850/60 mx-1" />

          {/* BENTO BOX 1: ACTIVE DATASET HUB */}
          <div className="bg-slate-950/40 border border-slate-850/60 p-3 rounded-xl space-y-2.5 shadow-sm" id="sidebar-dataset-card">
            <div className="flex items-center justify-between border-b border-slate-850/60 pb-1.5">
              <div className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <h3 className="text-white text-[11px] font-bold font-sans">Active Dataset Hub</h3>
              </div>
              <span className="text-[7px] font-mono text-emerald-400 bg-emerald-950/30 border border-emerald-900/40 px-1.5 py-0.5 rounded uppercase leading-none font-extrabold animate-pulse">
                LOADED
              </span>
            </div>

            <div className="space-y-2">
              <div>
                <span className="text-[7.5px] font-mono font-bold text-slate-500 uppercase block tracking-wider">Dataset Name</span>
                <span className="text-[11px] font-bold text-slate-100 block truncate">{activeDataset.name}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 bg-slate-900/30 border border-slate-850/60 rounded-lg p-1.5 font-mono text-center">
                <div>
                  <span className="text-[6.5px] text-slate-500 uppercase block leading-none mb-0.5">Rows</span>
                  <span className="text-[10px] font-black text-indigo-400">{activeDataset.rows.length}</span>
                </div>
                <div>
                  <span className="text-[6.5px] text-slate-500 uppercase block leading-none mb-0.5">Numeric</span>
                  <span className="text-[10px] font-black text-cyan-400">
                    {activeDataset.metadata.filter(m => m.type === "numeric").length}
                  </span>
                </div>
                <div>
                  <span className="text-[6.5px] text-slate-500 uppercase block leading-none mb-0.5">Categoric</span>
                  <span className="text-[10px] font-black text-violet-400">
                    {activeDataset.metadata.filter(m => m.type !== "numeric").length}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[8px] text-slate-400 bg-slate-900/10 p-1 rounded-lg border border-slate-850/40">
                <span className="truncate">Schema: {activeDataset.metadata.length} features mapped</span>
              </div>

              <div className="flex gap-1 pt-0.5">
                <button
                  onClick={() => {
                    setActiveModuleId("cleaning");
                    setViewMode("module");
                    setMobileMenuOpen(false);
                  }}
                  className="flex-1 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 text-[8px] font-bold py-1 rounded transition text-center cursor-pointer font-mono uppercase"
                >
                  🧼 Clean
                </button>
                <button
                  onClick={() => {
                    setActiveModuleId("eda");
                    setViewMode("module");
                    setMobileMenuOpen(false);
                  }}
                  className="flex-1 bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-400 border border-cyan-500/20 text-[8px] font-bold py-1 rounded transition text-center cursor-pointer font-mono uppercase"
                >
                  📊 Auto-EDA
                </button>
              </div>
            </div>
          </div>

          {/* BENTO BOX 2: CHAMPION ML PREDICTOR STATUS */}
          <div className="bg-slate-950/40 border border-slate-850/60 p-3 rounded-xl space-y-2.5 shadow-sm" id="sidebar-champion-card">
            <div className="flex items-center justify-between border-b border-slate-850/60 pb-1.5">
              <div className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <h3 className="text-white text-[11px] font-bold font-sans">Champion Model</h3>
              </div>
              <span className="text-[7px] font-mono text-indigo-400 bg-indigo-950/30 border border-indigo-900/40 px-1.5 py-0.5 rounded uppercase leading-none font-bold">
                Predictor
              </span>
            </div>

            {activeChampion ? (
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="p-1 bg-gradient-to-tr from-amber-600 to-yellow-400 rounded shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[6.5px] font-mono font-bold text-amber-400 uppercase tracking-wider block leading-none mb-0.5">Deployed</span>
                    <h4 className="text-[10px] font-black text-slate-100 truncate">{activeChampion.name}</h4>
                    <p className="text-[8px] text-slate-500 truncate font-mono mt-0.5">Dataset: {activeChampion.datasetName}</p>
                  </div>
                </div>

                {/* Performance Gauge */}
                <div className="bg-slate-900/30 border border-slate-850/60 rounded-lg p-2 space-y-1">
                  <div className="flex justify-between items-center text-[8px]">
                    <span className="text-slate-400 font-medium">Performance</span>
                    <span className="font-mono font-bold text-amber-400">
                      {activeChampion.metrics.accuracy ? `Acc: ${(activeChampion.metrics.accuracy * 100).toFixed(1)}%` : activeChampion.metrics.r2 ? `R²: ${activeChampion.metrics.r2.toFixed(3)}` : "Ready"}
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${(activeChampion.metrics.accuracy || 0.85) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setActiveModuleId("prediction");
                      setViewMode("module");
                      setMobileMenuOpen(false);
                    }}
                    className="flex-1 bg-amber-600/10 hover:bg-amber-600/20 text-amber-400 border border-amber-500/20 text-[8px] font-bold py-1 rounded transition text-center cursor-pointer font-mono uppercase"
                  >
                    🎯 Predict
                  </button>
                  <button
                    onClick={() => {
                      setActiveModuleId("deployment");
                      setViewMode("module");
                      setMobileMenuOpen(false);
                    }}
                    className="flex-1 bg-violet-600/10 hover:bg-violet-600/20 text-violet-400 border border-violet-500/20 text-[8px] font-bold py-1 rounded transition text-center cursor-pointer font-mono uppercase"
                  >
                    🚀 Deploy
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 py-1 text-center">
                <p className="text-slate-400 text-[8.5px] leading-relaxed max-w-xs mx-auto">
                  No active model is marked as champion. Train a model inside AutoML.
                </p>
                <button
                  onClick={() => {
                    setActiveModuleId("automl");
                    setViewMode("module");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-[8px] font-bold py-1 rounded transition text-center cursor-pointer font-mono uppercase tracking-wider"
                >
                  🤖 AutoML Engine
                </button>
              </div>
            )}
          </div>

          {/* BENTO BOX 3: PLATFORM INFRASTRUCTURE */}
          <div className="bg-slate-950/40 border border-slate-850/60 p-3 rounded-xl space-y-2 shadow-sm" id="sidebar-health-card">
            <div className="flex items-center justify-between border-b border-slate-850/60 pb-1.5">
              <div className="flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                <h3 className="text-white text-[11px] font-bold font-sans">SaaS Platform</h3>
              </div>
              <span className="text-[7px] font-mono text-cyan-400 bg-cyan-950/30 border border-cyan-900/40 px-1.5 py-0.5 rounded uppercase leading-none font-bold">
                Secure
              </span>
            </div>

            <div className="space-y-1 text-[8.5px]">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Plan:</span>
                <span className="font-mono font-bold text-slate-200 capitalize">{saasPlan}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Region:</span>
                <span className="font-mono font-bold text-indigo-400 uppercase">{apiClusterRegion}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Domain:</span>
                <span className="font-mono font-bold text-slate-300 truncate max-w-[90px]">{brandingDomain}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Database:</span>
                <span className="font-mono font-bold text-emerald-400 flex items-center gap-1">
                  <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
                  Sync
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setActiveModuleId("enterprise_os");
                setViewMode("module");
                setMobileMenuOpen(false);
              }}
              className="w-full bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white text-[8px] font-bold py-1 rounded transition text-center cursor-pointer font-mono uppercase tracking-wider mt-1"
            >
              ⚙️ SaaS licensing
            </button>
          </div>
        </div>
      </aside>

      {/* RIGHT WORKSPACE COLUMN */}
      <div className="flex-1 flex flex-col min-w-0" id="right-workspace-col">
        
        {/* TOP HEADER PANEL */}
        <header className="bg-slate-900/40 backdrop-blur-md border-b border-slate-850 py-4 px-4 md:px-6 flex items-center justify-between sticky top-0 z-40" id="main-header">
          {/* Active step or path name indicator */}
          <div className="flex items-center gap-3.5" id="header-brand-logo">
            {/* Hamburger Menu Toggle Button on Mobile */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 -ml-1 text-slate-400 hover:text-white transition cursor-pointer hover:bg-slate-900 rounded-lg shrink-0"
              id="mobile-sidebar-toggle-btn"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="font-sans text-xs text-slate-400">
              {viewMode === "home" ? (
                <span className="font-medium text-slate-400">Dashboard Hub / Home</span>
              ) : (
                <div className="flex items-center gap-1.5 text-slate-500">
                  <span>Dashboard Hub</span>
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <span className="text-indigo-400 font-semibold">
                    {MODULES_LIST.find((m) => m.id === activeModuleId)?.label}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right side user badge & red Logout button */}
          <div className="flex items-center gap-4" id="header-session-badges">
            {userProfile && (
              <div className="flex items-center gap-4" id="user-badge">
                <span className="text-slate-300 text-xs font-medium">
                  Hi, {userProfile.fullName}
                </span>
                <button
                  onClick={handleLogout}
                  className="border border-rose-600 hover:bg-rose-600 text-rose-500 hover:text-white px-3.5 py-1.5 rounded text-xs transition cursor-pointer font-bold leading-none"
                  id="logout-btn"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Floating alert warnings for locked state */}
        <AnimatePresence>
          {warningMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4"
              id="locked-alert-toast"
            >
              <div className="bg-slate-900 border border-indigo-500 text-indigo-200 px-4 py-3.5 rounded-xl shadow-2xl flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5 animate-bounce" />
                <div className="flex-1 font-sans text-xs">
                  <p className="text-slate-300 leading-normal">{warningMessage}</p>
                </div>
                <button onClick={() => setWarningMessage(null)} className="p-1 text-slate-400 hover:text-white transition">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MAIN BODY CANVAS */}
        <main className="flex-1 p-3 sm:p-5 md:p-8 overflow-y-auto max-w-[1536px] w-full mx-auto" id="app-main-content">
          <AnimatePresence mode="wait">
            {viewMode === "home" ? (
              
              // ==================== A. DASHBOARD HOME VIEW ====================
              <motion.div
                key="home-dashboard"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.18 }}
                className="space-y-6 sm:space-y-8 relative overflow-visible"
                id="home-dashboard-stage"
              >
                {/* Ambient Decorative Glow Elements */}
                <div className="absolute top-[-100px] left-1/4 w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse" />
                <div className="absolute top-[200px] right-1/4 w-[280px] h-[280px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse" />

                {/* RESTORED MAJESTIC CENTERED WELCOME HEADER */}
                <div className="text-center space-y-4 pt-4 sm:pt-8 max-w-3xl mx-auto relative z-10 animate-fade-in" id="welcome-header-container">
                  {/* Majestic Centered Logo with Ambient Glow */}
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto flex items-center justify-center group" id="centered-welcome-logo">
                    {/* Ring 1 - Outer Rotating Dashed Ring */}
                    <div className="absolute inset-0 rounded-full border border-dashed border-indigo-500/30 animate-[spin_16s_linear_infinite]" />
                    {/* Ring 2 - Inner Gradient Pulsing Aura */}
                    <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-indigo-500/10 to-cyan-500/5 blur-sm animate-pulse" />
                    {/* Ring 3 - Solid High-Tech Boundary */}
                    <div className="absolute inset-3 rounded-2xl bg-[#090d16] border border-slate-800 flex items-center justify-center shadow-2xl transition-all duration-500 group-hover:border-indigo-500/50" />
                    {/* Core Badge */}
                    <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-indigo-400/30 group-hover:scale-105 transition-transform duration-300">
                      <Brain className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </div>
                    {/* Interactive Sparks */}
                    <Sparkles className="absolute -top-1 -right-1 w-5 sm:w-6 h-5 sm:h-6 text-amber-400 animate-bounce" />
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#030712] animate-ping" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <span className="text-indigo-400 font-mono font-black text-[10px] sm:text-[11px] uppercase tracking-[0.2em] bg-indigo-950/40 border border-indigo-500/20 p-2 px-4 rounded-full block leading-none shadow-sm shadow-indigo-500/5 backdrop-blur-sm">
                        WELCOME BACK, {userProfile.fullName.toUpperCase()}
                      </span>
                      <span className="text-emerald-400 font-mono font-bold text-[9px] uppercase tracking-wider bg-emerald-950/40 border border-emerald-500/20 px-2 py-1 rounded-full flex items-center gap-1 leading-none shadow-sm shadow-emerald-500/5 backdrop-blur-sm">
                        <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
                        ONLINE
                      </span>
                    </div>
                    
                    <h1 className="font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 text-3xl sm:text-4xl md:text-5xl tracking-tight leading-tight pt-1 filter drop-shadow-sm" id="dashboard-title">
                      {brandingLogoText}
                    </h1>
                    
                    <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed pt-0.5 font-sans font-medium">
                      Simplify end-to-end data science workloads. Prepare raw data, build deep AI predictors, and run live-telemetry evaluation within an integrated workspace.
                    </p>
                  </div>
                </div>

                {/* HIGH-TECH DYNAMIC SYSTEM KPI PANEL */}
                <div className="flex flex-wrap gap-4 w-full relative z-10 animate-fade-in" id="dashboard-kpis-container">
                  
                  {/* KPI 1: Telemetry Rate */}
                  <div className="flex-grow flex-shrink-0 basis-[calc(50%-8px)] lg:basis-[calc(25%-12px)] bg-gradient-to-b from-[#0e1322]/80 to-[#070b16]/90 border border-slate-800/60 p-4.5 rounded-2xl relative overflow-hidden group hover:border-indigo-500/20 transition-all duration-300 shadow-md">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">COGNITIVE INFLOW</span>
                      <Activity className={`w-4 h-4 text-blue-400 ${isStreaming ? "animate-pulse" : ""}`} />
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg sm:text-xl font-black text-white font-mono tracking-tight">
                        {isStreaming ? "1,248 /s" : "0 /s"}
                      </span>
                      {isStreaming && (
                        <span className="text-[8.5px] font-mono font-black text-emerald-400 bg-emerald-950/40 p-0.5 px-1.5 rounded-full border border-emerald-500/20">
                          LIVE
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-1 leading-none font-medium">Real-time signals processing</span>
                  </div>

                  {/* KPI 2: Pipeline Processing Power */}
                  <div className="flex-grow flex-shrink-0 basis-[calc(50%-8px)] lg:basis-[calc(25%-12px)] bg-gradient-to-b from-[#0e1322]/80 to-[#070b16]/90 border border-slate-800/60 p-4.5 rounded-2xl relative overflow-hidden group hover:border-violet-500/20 transition-all duration-300 shadow-md">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">COMPUTATIONAL LOAD</span>
                      <Cpu className="w-4 h-4 text-violet-400" />
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg sm:text-xl font-black text-white font-mono tracking-tight">42.8 GFLOPS</span>
                      <span className="text-[8.5px] font-mono font-black text-violet-400 bg-violet-950/40 p-0.5 px-1.5 rounded-full border border-violet-500/20">
                        94%
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-1 leading-none font-medium">AutoML model search engine</span>
                  </div>

                  {/* KPI 3: Loaded Dataset Records */}
                  <div className="flex-grow flex-shrink-0 basis-[calc(50%-8px)] lg:basis-[calc(25%-12px)] bg-gradient-to-b from-[#0e1322]/80 to-[#070b16]/90 border border-slate-800/60 p-4.5 rounded-2xl relative overflow-hidden group hover:border-emerald-500/20 transition-all duration-300 shadow-md">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">ROWS INDEXED</span>
                      <Database className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg sm:text-xl font-black text-white font-mono tracking-tight">
                        {activeDataset.rows.length.toLocaleString()}
                      </span>
                      <span className="text-[8.5px] font-mono font-bold text-slate-400 bg-slate-900/60 p-0.5 px-1.5 rounded-full border border-slate-800">
                        {activeDataset.metadata.length} features
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-1 leading-none font-medium">Active memory buffer allocation</span>
                  </div>

                  {/* KPI 4: API SLA Guarantee */}
                  <div className="flex-grow flex-shrink-0 basis-[calc(50%-8px)] lg:basis-[calc(25%-12px)] bg-gradient-to-b from-[#0e1322]/80 to-[#070b16]/90 border border-slate-800/60 p-4.5 rounded-2xl relative overflow-hidden group hover:border-cyan-500/20 transition-all duration-300 shadow-md">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">SLA UPTIME RATE</span>
                      <Globe className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg sm:text-xl font-black text-white font-mono tracking-tight">99.982%</span>
                      <span className="text-[8.5px] font-mono font-black text-cyan-400 bg-cyan-950/40 p-0.5 px-1.5 rounded-full border border-cyan-500/20">
                        OPTIMAL
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-1 leading-none font-medium">Enterprise multi-region clusters</span>
                  </div>

                </div>

                {/* ACTIVE WORKSPACE STATUS CONTROL DECK */}
                <div className="space-y-4" id="home-bento-deck-container">
                  <div className="flex items-center justify-between border-b border-[#141b2e] pb-2.5">
                    <div className="flex items-center gap-2">
                      <Grid className="w-4 h-4 text-indigo-400 shrink-0" />
                      <h2 className="text-white font-bold text-xs sm:text-sm font-sans tracking-tight">Active Workspace Control Deck</h2>
                    </div>
                    <span className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-widest bg-slate-900/40 border border-slate-800 px-2 py-0.5 rounded">STATUS CONTROL</span>
                  </div>

                  <div className="flex flex-wrap gap-5 w-full items-stretch relative z-10" id="bento-deck-grid">
                    
                    {/* BENTO BOX 1: ACTIVE DATASET HUB */}
                    <div className="flex-grow flex-shrink-0 basis-full md:basis-[calc(50%-10px)] lg:basis-[calc(25%-15px)] bg-gradient-to-b from-[#0e1322]/90 to-[#070b16]/95 border border-slate-800/80 p-5 rounded-2xl space-y-4 shadow-[0_12px_40px_rgba(0,0,0,0.5)] relative overflow-hidden group hover:border-indigo-500/30 transition-all duration-300" id="bento-dataset-card">
                      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
                      <div className="flex items-center justify-between border-b border-slate-850/60 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-blue-500/10 rounded-lg border border-blue-500/20">
                            <Database className="w-4 h-4 text-blue-400" />
                          </div>
                          <h3 className="text-white text-xs font-bold font-sans tracking-tight">Active Dataset Hub</h3>
                        </div>
                        <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1 leading-none shadow-sm">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          LOADED
                        </span>
                      </div>

                      <div className="space-y-3.5">
                        <div className="bg-[#05070c] p-2.5 rounded-xl border border-slate-900/80">
                          <span className="text-[8px] font-mono font-black text-slate-500 uppercase block tracking-wider mb-0.5">Dataset Name</span>
                          <span className="text-xs font-bold text-slate-100 block truncate font-sans">{activeDataset.name}</span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 py-2 bg-[#05070c]/60 border border-slate-900 rounded-xl p-2 font-mono text-center">
                          <div className="border-r border-slate-900/60">
                            <span className="text-[8px] text-slate-500 uppercase block font-semibold mb-0.5">Rows</span>
                            <span className="text-xs font-extrabold text-indigo-400">{activeDataset.rows.length}</span>
                          </div>
                          <div className="border-r border-slate-900/60">
                            <span className="text-[8px] text-slate-500 uppercase block font-semibold mb-0.5">Numeric</span>
                            <span className="text-xs font-extrabold text-cyan-400 font-sans font-bold">
                              {activeDataset.metadata.filter(m => m.type === "numeric").length}
                            </span>
                          </div>
                          <div>
                            <span className="text-[8px] text-slate-500 uppercase block font-semibold mb-0.5">Categoric</span>
                            <span className="text-xs font-extrabold text-violet-400 font-sans font-bold">
                              {activeDataset.metadata.filter(m => m.type !== "numeric").length}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 bg-[#050811] p-2 rounded-xl border border-slate-900/60 font-mono">
                          <span className="truncate">Source schema: {activeDataset.metadata.length} features mapped</span>
                        </div>

                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => {
                              setActiveModuleId("cleaning");
                              setViewMode("module");
                            }}
                            className="flex-1 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold py-2 rounded-xl transition-all duration-200 text-center cursor-pointer font-mono uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98]"
                          >
                            🧼 Clean
                          </button>
                          <button
                            onClick={() => {
                              setActiveModuleId("eda");
                              setViewMode("module");
                            }}
                            className="flex-1 bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-400 border border-cyan-500/20 text-[10px] font-bold py-2 rounded-xl transition-all duration-200 text-center cursor-pointer font-mono uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98]"
                          >
                            📊 Auto-EDA
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* BENTO BOX 2: CHAMPION ML PREDICTOR STATUS */}
                    <div className="flex-grow flex-shrink-0 basis-full md:basis-[calc(50%-10px)] lg:basis-[calc(25%-15px)] bg-gradient-to-b from-[#0e1322]/90 to-[#070b16]/95 border border-slate-800/80 p-5 rounded-2xl space-y-4 shadow-[0_12px_40px_rgba(0,0,0,0.5)] relative overflow-hidden group hover:border-amber-500/30 transition-all duration-300" id="bento-champion-card">
                      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
                      <div className="flex items-center justify-between border-b border-slate-850/60 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-amber-500/10 rounded-lg border border-amber-500/20">
                            <Award className="w-4 h-4 text-amber-400" />
                          </div>
                          <h3 className="text-white text-xs font-bold font-sans tracking-tight">Active Champion Model</h3>
                        </div>
                        <span className="text-[9px] font-mono font-bold text-amber-400 bg-amber-950/40 border border-amber-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1 leading-none shadow-sm">
                          CHAMPION
                        </span>
                      </div>

                      {activeChampion ? (
                        <div className="space-y-3.5">
                          <div className="flex items-start gap-3 bg-[#05070c] p-2.5 rounded-xl border border-slate-900/80">
                            <div className="p-2 bg-gradient-to-tr from-amber-600 to-yellow-400 rounded-lg shrink-0 mt-0.5 shadow-md">
                              <Bot className="w-4 h-4 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="text-[8px] font-mono font-bold text-amber-400 uppercase tracking-wider block">Selected Predictor</span>
                              <h4 className="text-xs font-black text-slate-100 truncate font-sans">{activeChampion.name}</h4>
                              <p className="text-[9px] text-slate-500 truncate font-mono mt-0.5">Dataset: {activeChampion.datasetName}</p>
                            </div>
                          </div>

                          {/* Performance Gauge */}
                          <div className="bg-[#05070c]/60 border border-slate-900 rounded-xl p-3 space-y-2 shadow-inner">
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="text-slate-400 font-medium">Model Performance</span>
                              <span className="font-mono font-bold text-amber-400">
                                {activeChampion.metrics.accuracy ? `Acc: ${(activeChampion.metrics.accuracy * 100).toFixed(1)}%` : activeChampion.metrics.r2 ? `R²: ${activeChampion.metrics.r2.toFixed(3)}` : "Ready"}
                              </span>
                            </div>
                            <div className="w-full bg-[#030509] h-2 rounded-full overflow-hidden border border-slate-900">
                              <div 
                                className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full transition-all duration-500"
                                style={{ width: `${(activeChampion.metrics.accuracy || 0.85) * 100}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={() => {
                                setActiveModuleId("prediction");
                                setViewMode("module");
                              }}
                              className="flex-1 bg-amber-600/10 hover:bg-amber-600/20 text-amber-400 border border-amber-500/20 text-[10px] font-bold py-2 rounded-xl transition-all duration-200 text-center cursor-pointer font-mono uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98]"
                            >
                              🎯 Predict
                            </button>
                            <button
                              onClick={() => {
                                setActiveModuleId("deployment");
                                setViewMode("module");
                              }}
                              className="flex-1 bg-violet-600/10 hover:bg-violet-600/20 text-violet-400 border border-violet-500/20 text-[10px] font-bold py-2 rounded-xl transition-all duration-200 text-center cursor-pointer font-mono uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98]"
                            >
                              🚀 Deploy
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4 py-2 text-center">
                          <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto">
                            No active model is marked as the workspace champion. Train, tune, and deploy a predictor inside AutoML Sandbox.
                          </p>
                          <button
                            onClick={() => {
                              setActiveModuleId("automl");
                              setViewMode("module");
                            }}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold py-2 px-4 rounded-xl transition-all duration-200 text-center cursor-pointer font-mono uppercase tracking-wider hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-indigo-600/15"
                          >
                            🤖 Run AutoML Engine
                          </button>
                        </div>
                      )}
                    </div>

                    {/* BENTO BOX 3: LIVE TELEMETRY CONSOLE AT WORK */}
                    <div className="flex-grow flex-shrink-0 basis-full md:basis-[calc(50%-10px)] lg:basis-[calc(25%-15px)] bg-gradient-to-b from-[#0e1322]/90 to-[#070b16]/95 border border-slate-800/80 p-5 rounded-2xl space-y-4 shadow-[0_12px_40px_rgba(0,0,0,0.5)] relative overflow-hidden group hover:border-rose-500/30 transition-all duration-300" id="bento-telemetry-card">
                      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-rose-500/30 to-transparent" />
                      <div className="flex items-center justify-between border-b border-slate-850/60 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-rose-500/10 rounded-lg border border-rose-500/20">
                            <Activity className="w-4 h-4 text-rose-400 shrink-0" />
                          </div>
                          <h3 className="text-white text-xs font-bold font-sans tracking-tight">Live Telemetry Stream</h3>
                        </div>
                        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border transition-colors ${
                          isStreaming 
                            ? "text-emerald-400 bg-emerald-950/40 border-emerald-500/20" 
                            : "text-slate-400 bg-slate-900/40 border-slate-800"
                        }`}>
                          <span className={`h-1 w-1 rounded-full ${isStreaming ? "bg-emerald-400 animate-ping" : "bg-slate-500"}`} />
                          {isStreaming ? "LIVE" : "PAUSED"}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-[10px] bg-slate-950/40 px-2.5 py-2 rounded-xl border border-slate-900/80">
                          <span className="text-slate-400">Selected Feed</span>
                          <span className="font-mono font-bold text-slate-200">
                            {streamType === "iot" ? "Industrial IoT" : streamType === "fraud" ? "Credit Fraud" : streamType === "titanic" ? "Titanic Inflow" : "Botanical Lab"}
                          </span>
                        </div>

                        {/* Scrolling terminal view */}
                        <div className="bg-[#05070d] border border-slate-900 rounded-xl p-3 h-20 overflow-y-auto font-mono text-[9px] space-y-1.5 shadow-inner scrollbar-thin scrollbar-thumb-slate-800">
                          {streamingLog.length === 0 ? (
                            <div className="text-slate-600 text-center py-4 italic font-sans">Waiting for incoming signals...</div>
                          ) : (
                            streamingLog.slice(-3).map((log) => (
                              <div key={log.id} className="leading-relaxed flex items-start gap-1.5 border-b border-slate-900/20 pb-1 last:border-0 last:pb-0">
                                <span className="text-indigo-400/80 shrink-0 font-bold">[{log.timestamp.split(" ")[0]}]</span>
                                <span className={`break-all ${log.type === "alert" ? "text-rose-400 font-bold" : log.type === "success" ? "text-emerald-400" : "text-slate-300"}`}>
                                  {log.message}
                                </span>
                              </div>
                            ))
                          )}
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => setIsStreaming(!isStreaming)}
                            className={`flex-1 text-[10px] font-bold py-2 rounded-xl transition-all duration-200 text-center cursor-pointer font-mono uppercase tracking-wider border hover:scale-[1.02] active:scale-[0.98] ${
                              isStreaming 
                                ? "bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border-rose-500/20" 
                                : "bg-emerald-600 hover:bg-emerald-500 text-white border-transparent"
                            }`}
                          >
                            {isStreaming ? "⏸️ Pause" : "▶️ Start Stream"}
                          </button>
                          <button
                            onClick={() => {
                              setActiveModuleId("reports");
                              setViewMode("module");
                            }}
                            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white px-3.5 rounded-xl transition-all duration-200 cursor-pointer text-[10px] font-mono font-bold uppercase hover:scale-[1.02] active:scale-[0.98]"
                          >
                            Hub
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* BENTO BOX 4: WHITE-LABEL CLOUD INFRASTRUCTURE HEALTH */}
                    <div className="flex-grow flex-shrink-0 basis-full md:basis-[calc(50%-10px)] lg:basis-[calc(25%-15px)] bg-gradient-to-b from-[#0e1322]/90 to-[#070b16]/95 border border-slate-800/80 p-5 rounded-2xl space-y-4 shadow-[0_12px_40px_rgba(0,0,0,0.5)] relative overflow-hidden group hover:border-violet-500/30 transition-all duration-300" id="bento-health-card">
                      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
                      <div className="flex items-center justify-between border-b border-[#141b2e] pb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-violet-500/10 rounded-lg border border-violet-500/20">
                            <Server className="w-4 h-4 text-violet-400" />
                          </div>
                          <h3 className="text-white text-xs font-bold font-sans tracking-tight">Platform Infrastructure</h3>
                        </div>
                        <span className="text-[9px] font-mono font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-500/20 px-2 py-0.5 rounded-full flex items-center gap-1 leading-none shadow-sm">
                          SECURE SYNC
                        </span>
                      </div>

                      <div className="space-y-2 text-[11px] font-medium font-sans">
                        <div className="flex justify-between items-center py-1.5 border-b border-slate-900/50">
                          <span className="text-slate-400">Enterprise SaaS Tier</span>
                          <span className="font-mono font-black text-indigo-400 uppercase tracking-wider text-[10px] bg-indigo-950/40 border border-indigo-900/50 px-2 py-0.5 rounded-md">{saasPlan}</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5 border-b border-slate-900/50">
                          <span className="text-slate-400">Active API Region</span>
                          <span className="font-mono font-bold text-slate-200 uppercase">{apiClusterRegion}</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5 border-b border-slate-900/50">
                          <span className="text-slate-400">Branding Domain</span>
                          <span className="font-mono font-bold text-slate-300 truncate max-w-[130px]">{brandingDomain}</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5">
                          <span className="text-slate-400">Firebase Firestore</span>
                          <span className="font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Synchronized
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setActiveModuleId("enterprise_os");
                          setViewMode("module");
                        }}
                        className="w-full bg-[#05070d] hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-[10px] font-bold py-2 rounded-xl transition-all duration-200 text-center cursor-pointer font-mono uppercase tracking-wider hover:scale-[1.01] active:scale-[0.99]"
                      >
                        ⚙️ Customize Workspace
                      </button>
                    </div>

                  </div>
                </div>
                    
                    {/* INTERACTIVE STEP-BY-STEP JOURNEY PATHWAYS */}
                    <div className="space-y-4" id="guided-pathways-container">
                      <div className="flex items-center justify-between border-b border-[#141b2e] pb-2.5">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                          <h2 className="text-white font-bold text-xs sm:text-sm font-sans tracking-tight">Interactive Step-by-Step Journeys</h2>
                        </div>
                        <span className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-widest bg-slate-900/40 border border-slate-800 px-2 py-0.5 rounded">WIZARDS</span>
                      </div>

                      <div className="flex flex-wrap gap-4" id="guided-pathways-grid">
                        {PATHWAYS.map((p) => {
                          const isActive = activePathwayId === p.id;
                          return (
                            <div
                              key={p.id}
                              onClick={() => {
                                setActivePathwayId(p.id);
                                setActiveModuleId(p.steps[0].id);
                                setViewMode("module");
                              }}
                              className={`flex-grow flex-shrink-0 basis-full sm:basis-[calc(50%-8px)] md:basis-[calc(33.33%-11px)] p-5 rounded-2xl border text-left transition-all duration-300 cursor-pointer flex flex-col justify-between h-40 relative overflow-hidden group ${
                                isActive
                                  ? "bg-gradient-to-br from-[#101426] via-[#090e18] to-indigo-950/20 border-indigo-500/80 shadow-[0_0_25px_rgba(99,102,241,0.12)] ring-1 ring-indigo-500/20"
                                  : "bg-gradient-to-b from-[#0e1322]/50 to-[#070b16]/50 hover:bg-gradient-to-b hover:from-[#141c30]/70 hover:to-[#0b1022]/70 border-slate-800/80 hover:border-indigo-500/30 shadow-md"
                              }`}
                            >
                              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-full blur-xl group-hover:scale-150 transition-transform duration-500 opacity-70" />
                              
                              <div>
                                <div className="flex items-center justify-between mb-2.5">
                                  <span className="text-2xl leading-none">{p.emoji}</span>
                                  <span className="text-[9px] font-mono font-bold text-indigo-400 bg-indigo-950/50 border border-indigo-900/40 px-2.5 py-0.5 rounded-full uppercase leading-none">
                                    {p.steps.length} Steps
                                  </span>
                                </div>
                                <h3 className="text-white font-bold text-xs sm:text-[13px] tracking-tight group-hover:text-indigo-400 transition-colors duration-200 leading-snug">
                                  {p.title}
                                </h3>
                                <p className="text-slate-400 text-[10px] mt-1 leading-normal line-clamp-2">
                                  {p.subtitle}
                                </p>
                              </div>

                              <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase text-indigo-400 mt-3 group-hover:translate-x-1.5 transition-transform duration-250">
                                <span>Launch Journey</span>
                                <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* CORE ML ENGINE METRICS & SYNAPSE SIMULATOR PANEL */}
                    <div className="bg-gradient-to-b from-[#0e1322]/90 to-[#070b16]/95 border border-slate-800/80 p-5 sm:p-6 rounded-2xl space-y-6 shadow-[0_12px_45px_rgba(0,0,0,0.6)] relative overflow-hidden group" id="ml-engine-simulator-card">
                      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900/60 pb-4">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-gradient-to-tr from-indigo-600/15 to-violet-500/10 rounded-xl border border-indigo-500/20">
                            <Workflow className="w-5 h-5 text-indigo-400" />
                          </div>
                          <div>
                            <h2 className="text-white font-extrabold text-sm sm:text-base font-sans tracking-tight">
                              ML Engine Performance Analyzer
                            </h2>
                            <p className="text-slate-400 text-[10px] sm:text-xs font-sans font-medium">
                              Simulate deep learning epoch iterations and monitor artificial synapse weights.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-mono font-black px-2.5 py-1 rounded-full flex items-center gap-1.5 border transition-all ${
                            simulatingTraining 
                              ? "text-yellow-400 bg-yellow-950/40 border-yellow-500/30 animate-pulse" 
                              : "text-slate-400 bg-slate-900/60 border-slate-800"
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${simulatingTraining ? "bg-yellow-400 animate-ping" : "bg-slate-500"}`} />
                            {simulatingTraining ? `TRAINING EPOCH ${currentSimStep}/10` : "ENGINE STANDBY"}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        
                        {/* LEFT: EPOCH CHART RECORDER */}
                        <div className="md:col-span-7 space-y-4">
                          <div className="flex items-center justify-between bg-[#05070c]/60 p-1 rounded-xl border border-slate-900">
                            <span className="text-[10px] font-mono font-bold text-slate-400 pl-3 uppercase tracking-wider">Metrics Monitor</span>
                            <div className="flex gap-1">
                              <button
                                onClick={() => setActiveMetricTab("loss")}
                                className={`px-3 py-1 rounded-lg text-[10px] font-bold font-mono transition-all ${
                                  activeMetricTab === "loss" 
                                    ? "bg-indigo-600 text-white shadow-sm" 
                                    : "text-slate-400 hover:text-slate-200"
                                }`}
                              >
                                Loss Curve
                              </button>
                              <button
                                onClick={() => setActiveMetricTab("accuracy")}
                                className={`px-3 py-1 rounded-lg text-[10px] font-bold font-mono transition-all ${
                                  activeMetricTab === "accuracy" 
                                    ? "bg-indigo-600 text-white shadow-sm" 
                                    : "text-slate-400 hover:text-slate-200"
                                }`}
                              >
                                Accuracy Trend
                              </button>
                            </div>
                          </div>

                          {/* Interactive Chart Area */}
                          <div className="bg-[#05070d] border border-slate-900 rounded-xl p-4 h-48 flex flex-col justify-between relative overflow-hidden shadow-inner">
                            {/* Grid Guidelines */}
                            <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none opacity-20">
                              <div className="border-b border-slate-800 w-full" />
                              <div className="border-b border-slate-800 w-full" />
                              <div className="border-b border-slate-800 w-full" />
                              <div className="w-full" />
                            </div>

                            {/* Live SVG Line Chart */}
                            <div className="w-full h-32 relative z-10 mt-2">
                              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                                <defs>
                                  {/* Line Glow Filters */}
                                  <filter id="chart-glow" x="-20%" y="-20%" width="140%" height="140%">
                                    <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#6366f1" floodOpacity="0.4" />
                                  </filter>
                                  <filter id="val-glow" x="-20%" y="-20%" width="140%" height="140%">
                                    <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#14b8a6" floodOpacity="0.4" />
                                  </filter>
                                </defs>
                                
                                {/* Coordinates calculation & lines rendering */}
                                {(() => {
                                  const points = simulationEpochs.slice(0, currentSimStep).map((ep, idx) => {
                                    const x = (idx / 9) * 100; // percent
                                    const val = activeMetricTab === "loss" ? ep.loss : ep.accuracy;
                                    const y = 100 - (val * 90);
                                    return { x, y, val, ...ep };
                                  });

                                  const valPoints = simulationEpochs.slice(0, currentSimStep).map((ep, idx) => {
                                    const x = (idx / 9) * 100;
                                    const val = activeMetricTab === "loss" ? ep.valLoss : ep.valAccuracy;
                                    const y = 100 - (val * 90);
                                    return { x, y, val };
                                  });

                                  if (points.length === 0) return null;

                                  const pathD = points.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x}% ${p.y}%`).join(" ");
                                  const valPathD = valPoints.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x}% ${p.y}%`).join(" ");

                                  return (
                                    <>
                                      {/* Fill under Training line */}
                                      <path
                                        d={`${pathD} L ${points[points.length - 1].x}% 100% L 0% 100% Z`}
                                        fill="url(#gradient-chart-fill)"
                                        className="opacity-5 transition-all duration-300"
                                      />
                                      <defs>
                                        <linearGradient id="gradient-chart-fill" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.15" />
                                          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                                        </linearGradient>
                                      </defs>

                                      {/* Validation Path (Cyan) */}
                                      <path
                                        d={valPathD}
                                        fill="none"
                                        stroke="#14b8a6"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        filter="url(#val-glow)"
                                        className="transition-all duration-300"
                                      />

                                      {/* Training Path (Indigo) */}
                                      <path
                                        d={pathD}
                                        fill="none"
                                        stroke="#6366f1"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        filter="url(#chart-glow)"
                                        className="transition-all duration-300"
                                      />

                                      {/* Training Coordinate Nodes */}
                                      {points.map((p, idx) => (
                                        <g key={`node-${idx}`} className="group/node cursor-pointer">
                                          <circle
                                            cx={`${p.x}%`}
                                            cy={`${p.y}%`}
                                            r={idx === points.length - 1 ? "5" : "3"}
                                            className="fill-[#090d16] stroke-indigo-400 stroke-2 hover:r-6 transition-all duration-250"
                                          />
                                        </g>
                                      ))}
                                    </>
                                  );
                                })()}
                              </svg>
                            </div>

                            {/* Legend and Stats footer inside graph */}
                            <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 border-t border-slate-900/80 pt-2 z-10">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                  <span className="w-2.5 h-0.5 bg-indigo-500 rounded" />
                                  <span>Training</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="w-2.5 h-0.5 bg-cyan-400 rounded" />
                                  <span>Validation (SLA)</span>
                                </div>
                              </div>
                              <span>Range: {activeMetricTab === "loss" ? "1.00 ➔ 0.15" : "0.50 ➔ 0.96"}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setSimulatingTraining(true)}
                              disabled={simulatingTraining}
                              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer ${
                                simulatingTraining 
                                  ? "bg-slate-900/60 border border-slate-800 text-slate-500 cursor-not-allowed" 
                                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/15 hover:scale-[1.01] active:scale-[0.99]"
                              }`}
                            >
                              <Play className="w-3.5 h-3.5" />
                              <span>{simulatingTraining ? "Simulating Neural Network..." : "⚡ Run Epoch Simulation"}</span>
                            </button>
                            <button
                              onClick={() => {
                                setCurrentSimStep(10);
                                setSimulatingTraining(false);
                              }}
                              className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                            >
                              Reset
                            </button>
                          </div>
                        </div>

                        {/* RIGHT: DEEP NEURAL SYNAPSE TOPOLOGY */}
                        <div className="md:col-span-5 flex flex-col justify-between space-y-4">
                          <div className="bg-[#05070c]/40 border border-slate-900 rounded-xl p-4 flex flex-col justify-between h-full space-y-3 relative overflow-hidden">
                            <div className="flex items-center justify-between border-b border-slate-900/60 pb-2">
                              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Neural Synapse Map</span>
                              <span className="text-[9px] font-mono text-indigo-400 font-semibold uppercase">Feedforward ANN</span>
                            </div>

                            {/* Neural Grid Visualization */}
                            <div className="relative w-full h-32 flex items-center justify-between px-3" id="neural-synapse-grid">
                              {/* Synapse Synaptic Connections SVG Background */}
                              <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                                {(() => {
                                  const inputYs = [15, 38, 62, 85];
                                  const hiddenYs = [10, 26, 42, 58, 74, 90];
                                  const outputYs = [35, 65];

                                  const connections: any[] = [];
                                  
                                  // Connect Input to Hidden
                                  inputYs.forEach((iy, iIdx) => {
                                    hiddenYs.forEach((hy, hIdx) => {
                                      connections.push({
                                        x1: "15%", y1: `${iy}%`,
                                        x2: "50%", y2: `${hy}%`,
                                        id: `conn-in-hid-${iIdx}-${hIdx}`,
                                        active: simulatingTraining && (iIdx + hIdx + currentSimStep) % 3 === 0
                                      });
                                    });
                                  });

                                  // Connect Hidden to Output
                                  hiddenYs.forEach((hy, hIdx) => {
                                    outputYs.forEach((oy, oIdx) => {
                                      connections.push({
                                        x1: "50%", y1: `${hy}%`,
                                        x2: "85%", y2: `${oy}%`,
                                        id: `conn-hid-out-${hIdx}-${oIdx}`,
                                        active: simulatingTraining && (hIdx + oIdx + currentSimStep) % 2 === 0
                                      });
                                    });
                                  });

                                  return connections.map((c) => (
                                    <line
                                      key={c.id}
                                      x1={c.x1}
                                      y1={c.y1}
                                      x2={c.x2}
                                      y2={c.y2}
                                      stroke={c.active ? "#a78bfa" : "#1e293b"}
                                      strokeWidth={c.active ? "1.5" : "0.5"}
                                      className={`transition-all duration-300 ${c.active ? "opacity-100" : "opacity-20"}`}
                                    />
                                  ));
                                })()}
                              </svg>

                              {/* Layer 1: Input Nodes */}
                              <div className="flex flex-col justify-between h-full py-1 z-10">
                                {[1, 2, 3, 4].map((n) => (
                                  <div
                                    key={`input-node-${n}`}
                                    className={`w-3 h-3 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
                                      simulatingTraining 
                                        ? "bg-indigo-950 border-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.5)] scale-110" 
                                        : "bg-[#090d16] border-slate-700"
                                    }`}
                                  />
                                ))}
                              </div>

                              {/* Layer 2: Hidden Nodes */}
                              <div className="flex flex-col justify-between h-full py-0 z-10">
                                {[1, 2, 3, 4, 5, 6].map((n) => (
                                  <div
                                    key={`hidden-node-${n}`}
                                    className={`w-2.5 h-2.5 rounded-full border-2 transition-all duration-300 ${
                                      simulatingTraining 
                                        ? "bg-violet-950 border-violet-400 shadow-[0_0_8px_rgba(139,92,246,0.5)] scale-110" 
                                        : "bg-[#090d16] border-slate-700"
                                    }`}
                                  />
                                ))}
                              </div>

                              {/* Layer 3: Output Predictor Nodes */}
                              <div className="flex flex-col justify-between h-full py-6 z-10">
                                {[1, 2].map((n) => (
                                  <div
                                    key={`output-node-${n}`}
                                    className={`w-3.5 h-3.5 rounded-xl border-2 transition-all duration-300 flex items-center justify-center ${
                                      simulatingTraining 
                                        ? "bg-emerald-950 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.6)] scale-110" 
                                        : "bg-[#090d16] border-slate-700"
                                    }`}
                                  >
                                    <span className="text-[6px] font-mono text-emerald-400 font-black">Y</span>
                                  </div>
                                ))}
                              </div>

                            </div>

                            {/* Info text */}
                            <div className="bg-[#05070d]/80 border border-slate-900 rounded-xl p-2 text-center font-sans">
                              <span className="text-slate-400 text-[10px] leading-relaxed block font-medium">
                                Synaptic weights auto-correct through gradient descent optimization matrices.
                              </span>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* SEARCH & FILTERS CONTROLS */}
                    <div className="space-y-4" id="home-modules-explorer">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#141b2e] pb-3.5">
                        <div className="flex items-center gap-2">
                          <Grid className="w-4 h-4 text-indigo-400 shrink-0" />
                          <h2 className="text-white font-bold text-xs sm:text-sm font-sans tracking-tight">Workspace Modules Explorer</h2>
                        </div>
                        
                        {/* Search Bar Input */}
                        <div className="relative w-full sm:w-64" id="home-search-container">
                          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
                          <input
                            type="text"
                            placeholder="Search workspace modules..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#05070c]/80 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/20 transition-all duration-200 shadow-inner"
                          />
                          {searchQuery && (
                            <button
                              onClick={() => setSearchQuery("")}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Category tabs list */}
                      <div className="flex flex-wrap gap-1.5" id="home-category-tabs">
                        {CATEGORIES.map((cat) => {
                          const isActive = activeCategory === cat.id;
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => setActiveCategory(cat.id)}
                              className={`px-3.5 py-1.5 rounded-xl text-[11px] font-bold cursor-pointer transition-all duration-200 flex items-center gap-1.5 border tracking-tight ${
                                isActive
                                  ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white border-indigo-400/30 shadow-md shadow-indigo-600/15"
                                  : "bg-slate-900/40 hover:bg-slate-800/40 border-slate-800/60 text-slate-400 hover:text-slate-200"
                              }`}
                            >
                              <span className="text-sm leading-none">{cat.emoji}</span>
                              <span>{cat.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* FILTERED MODULE CARDS GRID */}
                      <div id="dashboard-modules-grid-section">
                        {filteredModules.length === 0 ? (
                          <div className="text-center py-12 bg-[#0c101b]/60 border border-slate-800 rounded-2xl">
                            <p className="text-slate-400 text-xs font-mono">🔍 No workspace modules match "{searchQuery}" in this category.</p>
                            <button
                              onClick={() => {
                                setActiveCategory("all");
                                setSearchQuery("");
                              }}
                              className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 font-bold underline cursor-pointer"
                            >
                              Reset All Filters
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-4" id="dashboard-modules-grid">
                            {filteredModules.map((module) => {
                              const catMeta = CATEGORIES.find(c => c.id === module.category);
                              return (
                                <div
                                  key={module.id}
                                  id={`module-card-${module.id}`}
                                  onClick={() => {
                                    setActiveModuleId(module.id);
                                    setViewMode("module");
                                  }}
                                  className="flex-grow flex-shrink-0 basis-full sm:basis-[calc(50%-8px)] md:basis-[calc(33.33%-11px)] lg:basis-[calc(25%-12px)] xl:basis-[calc(20%-13px)] bg-gradient-to-b from-[#0c101b]/80 to-[#070b13]/85 hover:from-[#111728]/95 hover:to-[#090e1a]/95 border border-slate-800/80 hover:border-indigo-500/35 p-5 rounded-2xl transition-all duration-300 cursor-pointer group flex flex-col justify-between h-36 relative overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-indigo-500/5 hover:-translate-y-0.5"
                                >
                                  {/* Dynamic category-colored accent glow on hover */}
                                  <div className="absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-slate-800/40 to-transparent" />

                                  {/* Emoji or icon and category tag */}
                                  <div className="flex justify-between items-start">
                                    <div className="text-2xl leading-none transition-transform duration-300 group-hover:scale-110">{module.emoji}</div>
                                    <span className="text-[8.5px] font-mono font-black text-indigo-400 bg-indigo-950/40 border border-indigo-900/40 px-2 py-0.5 rounded-full uppercase tracking-wider leading-none">
                                      {catMeta?.label || "SYSTEM"}
                                    </span>
                                  </div>

                                  {/* Title and description */}
                                  <div className="space-y-1 font-sans mt-3">
                                    <span className="block text-[13px] font-extrabold tracking-tight text-slate-100 group-hover:text-indigo-400 transition-colors duration-200">
                                      {module.label}
                                    </span>
                                    <p className="text-slate-400 text-[10px] leading-relaxed line-clamp-2 font-medium">
                                      {module.desc}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
              </motion.div>
            ) : (
              
              // ==================== B. SEPARATE PAGE MODULE WORKSPACE ====================
              <motion.div
                key="module-workspace"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.18 }}
                className="space-y-6"
                id="module-workspace-stage"
              >
                {/* Back button breadcrumb bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-b from-[#0e1322]/90 to-[#070b16]/95 border border-slate-800/80 p-5 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.5)] relative overflow-hidden" id="module-back-bar">
                  <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => {
                        setActiveModuleId("home");
                        setViewMode("home");
                      }}
                      className="p-2.5 px-4 rounded-xl bg-[#05070d] border border-slate-800 hover:border-slate-700 hover:bg-slate-900/50 text-slate-300 hover:text-white transition-all duration-200 flex items-center gap-2 cursor-pointer text-xs font-bold font-mono uppercase tracking-wider group hover:scale-[1.02] active:scale-[0.98]"
                      id="back-to-hub-btn"
                    >
                      <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:-translate-x-1 transition-transform duration-200" />
                      <span>Back to Dashboard</span>
                    </button>

                    <div className="hidden sm:block h-6 w-[1px] bg-slate-800" />

                    <h2 className="text-white font-extrabold text-sm tracking-tight truncate flex items-center gap-2" id="active-module-title">
                      <span className="text-indigo-400">⚡</span>
                      {MODULES_LIST.find((m) => m.id === activeModuleId)?.label} Module
                    </h2>
                  </div>

                  {/* Active dataset indicator */}
                  <div className="text-[10px] bg-indigo-950/40 border border-indigo-900/40 px-3.5 py-2 rounded-xl text-indigo-400 font-mono flex items-center gap-1.5 shadow-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                    <span>Active Dataset:</span>
                    <strong className="text-slate-200 font-bold">{activeDataset.name}</strong> 
                    <span className="text-slate-500 font-normal">({activeDataset.rows.length} rows)</span>
                  </div>
                </div>

                {/* --- PATHWAY TOUR WIZARD STEPPER --- */}
                {(() => {
                  const currentPathway = PATHWAYS.find(p => p.id === activePathwayId);
                  const currentStepIndex = currentPathway ? currentPathway.steps.findIndex(s => s.id === activeModuleId) : -1;
                  
                  if (!currentPathway || currentStepIndex === -1) return null;

                  return (
                    <div className="w-full bg-[#0d1527] border border-slate-800/80 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm" id="pathway-wizard-banner">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl leading-none">{currentPathway.emoji}</span>
                        <div>
                          <div className="text-[8px] font-mono font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5 leading-none">
                            <span>ACTIVE GUIDED TOUR:</span>
                            <span className="bg-indigo-950 border border-indigo-900/60 px-1.5 py-0.5 rounded text-indigo-300 font-mono text-[9px] leading-none">
                              Step {currentStepIndex + 1} of {currentPathway.steps.length}
                            </span>
                          </div>
                          <h4 className="text-white font-bold text-xs mt-1">{currentPathway.title}</h4>
                        </div>
                      </div>

                      {/* Stepper Steps Tracker bubbles */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {currentPathway.steps.map((step, idx) => {
                          const isCompleted = idx < currentStepIndex;
                          const isActive = idx === currentStepIndex;
                          return (
                            <React.Fragment key={step.id}>
                              {idx > 0 && <div className={`h-[1px] w-2 sm:w-4 ${isCompleted ? "bg-indigo-500" : "bg-slate-800"}`} />}
                              <button
                                onClick={() => {
                                  setActiveModuleId(step.id);
                                  setViewMode("module");
                                }}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition flex items-center gap-1 cursor-pointer ${
                                  isActive
                                    ? "bg-indigo-600 text-white shadow shadow-indigo-600/30 ring-1 ring-indigo-400"
                                    : isCompleted
                                    ? "bg-indigo-950/40 border border-indigo-900/40 text-indigo-300"
                                    : "bg-slate-950/40 border border-slate-850 text-slate-500 hover:text-slate-300"
                                }`}
                              >
                                <span>{step.label}</span>
                              </button>
                            </React.Fragment>
                          );
                        })}
                      </div>

                      {/* Wizard Controls */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          disabled={currentStepIndex === 0}
                          onClick={() => {
                            const prevStepId = currentPathway.steps[currentStepIndex - 1].id;
                            setActiveModuleId(prevStepId);
                          }}
                          className="p-1.5 px-3 rounded-lg bg-slate-950 border border-slate-850 text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <span>⬅️ Prev</span>
                        </button>
                        <button
                          disabled={currentStepIndex === currentPathway.steps.length - 1}
                          onClick={() => {
                            const nextStepId = currentPathway.steps[currentStepIndex + 1].id;
                            setActiveModuleId(nextStepId);
                          }}
                          className="p-1.5 px-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-30 disabled:pointer-events-none text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <span>Next Step ➡️</span>
                        </button>
                        <button
                          onClick={() => setActivePathwayId(null)}
                          className="p-1.5 px-2 rounded-lg bg-slate-950/85 border border-slate-850 hover:border-slate-800 text-slate-400 hover:text-rose-400 text-[10px] transition cursor-pointer flex items-center gap-1"
                          title="Exit Guided Journey"
                        >
                          <span>Exit</span>
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* Workspace Canvas Area */}
                <div className="bg-slate-900/10 min-h-[500px]" id="active-module-stage-canvas">
                  {renderActiveModule()}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ELEGANT, AESTHETIC DESIGN FOOTER & TERMINATION SECTION */}
          <footer className="mt-16 sm:mt-24 border-t border-slate-900/60 pt-8 sm:pt-12 pb-12 relative overflow-visible" id="app-footer">
            {/* Elegant fading accent finishing line */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
            
            {/* Ambient background accent glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[300px] h-[100px] bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none -z-10" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center max-w-7xl mx-auto px-4">
              
              {/* Column 1: Core Meta & Status */}
              <div className="space-y-3 text-left">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-600/10 rounded-lg border border-indigo-500/20">
                    <Brain className="w-4 h-4 text-indigo-400" />
                  </div>
                  <span className="font-sans font-black text-white text-xs tracking-wider uppercase">
                    {brandingLogoText}
                  </span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed max-w-xs font-sans font-medium">
                  The ultimate enterprise AutoML & live-telemetry sandbox. Streamlining feature engineering, training pipelines, and real-time inference workflows.
                </p>
              </div>

              {/* Column 2: System Status & Live Telemetry Meter */}
              <div className="flex flex-col items-center justify-center space-y-2.5 py-4 border-y border-slate-900/40 md:border-y-0 md:border-x md:border-slate-900/40 px-6">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                    AI WORKSPACE COGNITIVE ENGINE
                  </span>
                </div>
                <div className="flex items-center gap-3 bg-[#05070d]/60 border border-slate-900 rounded-xl p-2 px-3.5 shadow-inner">
                  <div className="flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-[10px] font-mono font-medium text-slate-500">Node</span>
                    <span className="text-[10px] font-mono font-bold text-indigo-300">v18.1.0</span>
                  </div>
                  <div className="h-3 w-[1px] bg-slate-800" />
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[10px] font-mono font-bold text-emerald-400">Secure AES-256</span>
                  </div>
                </div>
              </div>

              {/* Column 3: SaaS Suite & Brand Verification */}
              <div className="flex flex-col items-end justify-center space-y-2.5 text-right">
                <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400 font-bold bg-[#0e1322]/40 border border-slate-900/50 p-1.5 px-3 rounded-full">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  <span>SaaS Region: <strong className="text-cyan-300 uppercase">{apiClusterRegion}</strong></span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono font-bold text-slate-500 block">SAAS ENTERPRISE SUITE v3.5</span>
                  <span className="text-[9px] font-mono font-medium text-indigo-400/80 block mt-0.5">
                    © {new Date().getFullYear()} {brandingDomain}. All rights reserved.
                  </span>
                </div>
              </div>

            </div>

            {/* Extra artistic thin divider and tagline centered at the very end */}
            <div className="mt-8 text-center" id="footer-termination">
              <span className="inline-block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-[0.35em] bg-[#05070c]/50 p-2 px-6 rounded-full border border-slate-900/60 shadow-inner">
                ⚡ PRECISE DATA SCIENCE • UNIFIED EXECUTION ⚡
              </span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
