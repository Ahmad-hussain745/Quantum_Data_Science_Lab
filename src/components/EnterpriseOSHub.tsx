import React, { useState, useEffect, useRef } from "react";
import { Dataset, SavedModelRun } from "../types";
import { 
  Sparkles, 
  Brain, 
  Cpu, 
  ShieldCheck, 
  Database, 
  FolderOpen, 
  Sliders, 
  LineChart, 
  Search, 
  Bot, 
  Layers3, 
  Server, 
  FileText, 
  Settings, 
  Key, 
  User, 
  Lock, 
  Terminal, 
  Layers, 
  RefreshCw, 
  Send, 
  Plus, 
  Trash, 
  Check, 
  Save, 
  Copy, 
  Download, 
  Phone, 
  Mail, 
  FileCode, 
  CheckCircle, 
  HelpCircle, 
  Activity, 
  Play, 
  Zap, 
  Layout, 
  Globe, 
  CreditCard, 
  Laptop, 
  Smartphone, 
  Eye, 
  EyeOff,
  UserCheck,
  Award,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  ChevronDown
} from "lucide-react";

// Types
interface EnterpriseOSHubProps {
  dataset: Dataset;
  onDatasetChange?: (ds: Dataset) => void;
  activeChampion?: SavedModelRun | null;
  userProfile?: { email: string; fullName: string } | null;
  onUpdateBranding?: (brandConfig: { logoText: string; primaryColor: string; domain: string }) => void;
}

interface BluePrintModule {
  id: number;
  code: string;
  name: string;
  desc: string;
  group: string;
  status: "Fully Active" | "Active Simulation" | "Sandbox Mode" | "Enterprise SLA Only" | "Future Roadmap";
  featuresList: string[];
}

export default function EnterpriseOSHub({ 
  dataset, 
  onDatasetChange, 
  activeChampion, 
  userProfile,
  onUpdateBranding
}: EnterpriseOSHubProps) {
  
  // Tab states
  const [activeTab, setActiveTab] = useState<"modules" | "terminal" | "agents" | "whitelabel" | "mobile" | "billing" | "roadmap">("modules");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [selectedModule, setSelectedModule] = useState<BluePrintModule | null>(null);

  // Enterprise Roadmap and Dynamic Stack states
  const [selectedPhase, setSelectedPhase] = useState<"phase1" | "phase2" | "phase3" | "phase4">("phase1");
  const [phaseBuildRunning, setPhaseBuildRunning] = useState(false);
  const [phaseBuildProgress, setPhaseBuildProgress] = useState(0);
  const [phaseBuildLogs, setPhaseBuildLogs] = useState<string[]>([]);

  // Configured Architecture Stack choices
  const [techFrontend, setTechFrontend] = useState<"react_vite" | "nextjs">("react_vite");
  const [techBackend, setTechBackend] = useState<"fastapi" | "express_node">("fastapi");
  const [techAiEngine, setTechAiEngine] = useState<"gemini_cloud" | "pytorch_gpu" | "local_llama">("gemini_cloud");
  const [techDatabase, setTechDatabase] = useState<"postgres_relational" | "vector_pinecone" | "mongodb_nosql">("postgres_relational");
  const [techBigData, setTechBigData] = useState<"pandas_local" | "apache_spark">("pandas_local");
  const [techCloud, setTechCloud] = useState<"gcp" | "aws" | "azure" | "on_prem">("gcp");

  // Playground state variables
  // Role Admin
  const [userRolesList, setUserRolesList] = useState([
    { name: userProfile?.fullName || "Quantum Developer", email: userProfile?.email || "developer@quantumnest.tech", role: "Super Admin", verified: true },
    { name: "Dr. Sarah Khan", email: "sarah.k@quantumnest.tech", role: "Data Scientist", verified: true },
    { name: "Asim Riaz", email: "asim.riaz@quantumnest.tech", role: "ML Engineer", verified: true },
    { name: "Siddique Ali", email: "siddique.a@quantumnest.tech", role: "Auditor", verified: true }
  ]);

  useEffect(() => {
    if (userProfile) {
      setUserRolesList(prev => {
        const copy = [...prev];
        copy[0] = {
          name: userProfile.fullName,
          email: userProfile.email,
          role: "Super Admin",
          verified: true
        };
        return copy;
      });
    }
  }, [userProfile]);

  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState("Data Analyst");
  const [auditLogs, setAuditLogs] = useState<string[]>([
    "Super Admin established primary tenancy connection.",
    "Data Scientist uploaded Titanic survivors dataset.",
    "Auditor verified security compliance rules for DB queries."
  ]);

  // Terminal & Natural Language OS Commands
  const [cliInput, setCliInput] = useState("");
  const [cliHistory, setCliHistory] = useState<Array<{ cmd: string; resp: string; type: "input" | "system" | "error" | "success" }>>([
    { cmd: "sysinfo", resp: "QuantumNestTech Data Science OS v3.0.0 Online. Ingress port: 3000.", type: "system" },
    { cmd: "help", resp: "Try typing: 'clean nulls', 'whitelabel emerald', 'start agents', 'run linear model', or 'profile target'.", type: "system" }
  ]);

  // AI Agent Orchestrator Simulation
  const [agentRunning, setAgentRunning] = useState(false);
  const [agentLogs, setAgentLogs] = useState<Array<{ agent: string; msg: string; status: string; time: string }>>([]);
  const [agentProgress, setAgentProgress] = useState(0);
  const [agentGoal, setAgentGoal] = useState("Perform clean ingestion, auto-detect anomalies, and output prediction scores");

  // White-label State
  const [logoText, setLogoText] = useState("Quantum DS Lab");
  const [primaryColor, setPrimaryColor] = useState("indigo");
  const [customDomain, setCustomDomain] = useState("analytics.quantumnest.tech");
  const [brandSaved, setBrandSaved] = useState(false);

  // Billing & Subscriptions States
  const [billingPlan, setBillingPlan] = useState<"dev" | "pro" | "enterprise">("pro");
  const [invoiceDownloaded, setInvoiceDownloaded] = useState(false);

  // Generative AI Playground state
  const [genAiInput, setGenAiInput] = useState("");
  const [genAiOutput, setGenAiOutput] = useState("");
  const [genAiLoading, setGenAiLoading] = useState(false);

  // NLP Sentiment/Text state
  const [nlpText, setNlpText] = useState("Customer loves the quick prediction feedback, but says IoT sensor latency could be improved.");
  const [nlpAnalysis, setNlpAnalysis] = useState<any>(null);

  // The comprehensive list of all 55 modules specified in the blueprint
  const ALL_55_MODULES: BluePrintModule[] = [
    {
      id: 1,
      code: "AUTH",
      name: "Authentication & User Management",
      desc: "Robust corporate single sign-on (SSO), OAuth providers (Google, GitHub), Two-Factor (2FA), activity logging, and administrative multi-tenant credentials.",
      group: "Infrastructure & Ingestion",
      status: "Fully Active",
      featuresList: ["Multi-tenant authentication", "OAuth integration", "Two-Factor Auth (2FA)", "Administrative multi-role mapping (RBAC)", "Activity Logging & Security compliance audits"]
    },
    {
      id: 2,
      code: "HOME",
      name: "Home Dashboard Hub",
      desc: "Central commander unit displaying ingestion summaries, model run statistics, active streaming pipelines, and live resource usage meters.",
      group: "Analytics & Visualization",
      status: "Fully Active",
      featuresList: ["Interactive dashboard cards", "Recent project timeline", "Data stream counters", "Live memory & compute meters"]
    },
    {
      id: 3,
      code: "INGEST",
      name: "Data Ingestion Module",
      desc: "Dynamic connectors for local CSV, Excel, XML, SQL, real-time Kafka streams, WebSockets, cloud object buckets (AWS S3, GCP Cloud Storage), and external SFTP nodes.",
      group: "Infrastructure & Ingestion",
      status: "Fully Active",
      featuresList: ["Local CSV/JSON/Excel files upload", "API & Webhook endpoints registration", "Apache Kafka, MQTT and raw WebSockets streaming ingest", "AWS S3 / Google Cloud Storage cloud mounts"]
    },
    {
      id: 4,
      code: "PROFILE",
      name: "Data Profiling Module",
      desc: "Instant descriptive analytics generating data type reports, missing value percentages, unique card counts, outlier vectors, and structural health grades.",
      group: "Infrastructure & Ingestion",
      status: "Fully Active",
      featuresList: ["Automated column metrics extraction", "Dtype classification matrix", "Null value maps & duplicate row checks", "Cardinality checks & Data Quality Scorecard"]
    },
    {
      id: 5,
      code: "CLEAN",
      name: "Data Cleaning Module",
      desc: "Complete feature set to drop duplicates, trim whitespaces, impute continuous features using mean/median/mode, and prune statistical outliers dynamically.",
      group: "Infrastructure & Ingestion",
      status: "Fully Active",
      featuresList: ["Mean, Median, Mode imputations", "Forward-fill & backward-fill pipelines", "Row filtration of missing values", "Case-handling & string sanitation utilities"]
    },
    {
      id: 6,
      code: "TRANS",
      name: "Data Transformation Module",
      desc: "Data reshaping tool supporting column scaling, pivots, custom mathematical equations, date decomposition, and feature grouping.",
      group: "Infrastructure & Ingestion",
      status: "Active Simulation",
      featuresList: ["Column aggregation & groupings", "Date parsing & day-of-week extraction", "Pivot, unpivot, and tabular reshaping", "Custom formula parsing engine"]
    },
    {
      id: 7,
      code: "VALIDATE",
      name: "Data Validation Module",
      desc: "Define strict schemas and schema testing rules (range checks, unique constraints, mandatory non-nulls) to enforce sanity limits on active datasets.",
      group: "Infrastructure & Ingestion",
      status: "Fully Active",
      featuresList: ["Strict type verification", "Minimum/Maximum value range filters", "Non-null constraints checking", "Downloadable discrepancy reports"]
    },
    {
      id: 8,
      code: "EDA",
      name: "Exploratory Data Analysis (EDA)",
      desc: "An intelligent quantitative environment offering a comprehensive 23-step auto-EDA checklist with descriptive distributions and automatic observations.",
      group: "Analytics & Visualization",
      status: "Fully Active",
      featuresList: ["Automated statistical insight alerts", "Target column breakdown studies", "Observation notes compiled in markdown", "Interactive step-by-step summary guides"]
    },
    {
      id: 9,
      code: "VIZ",
      name: "Data Visualization Module",
      desc: "Elegant React Recharts plots delivering custom continuous histograms, category frequency bars, scatter clusters, and interactive heatmaps.",
      group: "Analytics & Visualization",
      status: "Fully Active",
      featuresList: ["Interactive bar, line & area graphs", "Correlative scatter-points matrices", "High-contrast responsive heatmaps", "Interactive legend hover highlight filters"]
    },
    {
      id: 10,
      code: "DASH",
      name: "Dashboard Builder",
      desc: "A drag-and-drop analytics dashboard architect to organize customized visual KPI boards, metrics counts, and active live indicators.",
      group: "Analytics & Visualization",
      status: "Active Simulation",
      featuresList: ["Drag-and-drop widget layouts", "KPI card generators", "Real-time refresh timers", "Branded layout templates share options"]
    },
    {
      id: 11,
      code: "BI",
      name: "Business Intelligence Module",
      desc: "Domain analytics boards evaluating conversion pipelines, executive financial metrics, marketing ROI, and operational scorecard logs.",
      group: "Analytics & Visualization",
      status: "Active Simulation",
      featuresList: ["Financial trend forecasts", "Marketing funnel conversions", "User retention dashboards", "Executive scorecard reporting widgets"]
    },
    {
      id: 12,
      code: "STATS",
      name: "Statistical Analysis Module",
      desc: "Advanced statistical testing ground running Student's T-Test, Pearson Correlation calculations, and ANOVA variables comparisons.",
      group: "Analytics & Visualization",
      status: "Fully Active",
      featuresList: ["Continuous variable T-test diagnostics", "Pearson correlative strength indicators", "Calculated Confidence intervals", "P-value alpha compliance validations"]
    },
    {
      id: 13,
      code: "FE",
      name: "Feature Engineering Module",
      desc: "Scale inputs using MinMax / StandardScaler algorithms, auto-generate polynomial features, and encode categorical labels.",
      group: "Core ML & AutoML",
      status: "Fully Active",
      featuresList: ["One-hot label encodings", "MinMax and Standard Scalers", "Principal Component Analysis (PCA) models", "Coefficients rankings for predictors"]
    },
    {
      id: 14,
      code: "ML",
      name: "Machine Learning Module",
      desc: "Train supervised Regression models (Ridge, Lasso, ElasticNet, Random Forests) and Classification engines (Logistic Regression, Decision Trees, XGBoost).",
      group: "Core ML & AutoML",
      status: "Fully Active",
      featuresList: ["Linear & Logistic regressions", "XGBoost & Random Forests ensemble algorithms", "K-Means and DBScan clustering engines", "Hyperparameter alpha optimization arrays"]
    },
    {
      id: 15,
      code: "AUTOML",
      name: "AutoML Module",
      desc: "One-click model exploration automatically evaluating multiple preprocessing combinations, model types, and hyperparameter grids to find optimal models.",
      group: "Core ML & AutoML",
      status: "Fully Active",
      featuresList: ["Multi-model training comparisons", "Auto-hyperparameter grid evaluations", "Top candidate models ranking scoreboard", "One-click champion models locking"]
    },
    {
      id: 16,
      code: "DL",
      name: "Deep Learning Module",
      desc: "Visual multi-layer neural network builder compiling Artificial Neural Networks (ANN) using Adam optimizers and custom learning rates.",
      group: "Core ML & AutoML",
      status: "Fully Active",
      featuresList: ["Multi-layer hidden neurons tuning", "Adam, SGD and RMSprop optimizer selection", "Interactive Epoch iteration logs", "Real-time loss regression line graphing"]
    },
    {
      id: 17,
      code: "NLP",
      name: "NLP Module",
      desc: "Text processing engine supporting tokenization, part-of-speech (POS) marking, entity extractors, and live context sentiment score checks.",
      group: "Cognitive AI & Generative Suite",
      status: "Active Simulation",
      featuresList: ["Tokenization & lemmatization engines", "Real-time sentiment score analysis", "Named Entity Recognition (NER) taggings", "Language classification and translations"]
    },
    {
      id: 18,
      code: "CV",
      name: "Computer Vision Module",
      desc: "Simulated vision interface executing real-time object identification, face scans, and OCR textual recognition from uploaded image files.",
      group: "Cognitive AI & Generative Suite",
      status: "Active Simulation",
      featuresList: ["Interactive bounding boxes drawing tool", "Face mesh vector indicators", "Simulated OCR document readers", "YOLO object model telemetry logs"]
    },
    {
      id: 19,
      code: "GENAI",
      name: "Generative AI Module",
      desc: "Harnesses server-side Gemini models to generate raw datasets, draft synthetic SQL code, write descriptive reports, and build custom python snippets.",
      group: "Cognitive AI & Generative Suite",
      status: "Fully Active",
      featuresList: ["Gemini-powered text outputs generation", "Interactive custom prompt sandbox", "Automated code generation", "Dynamic documentation compiler"]
    },
    {
      id: 20,
      code: "RAG",
      name: "RAG Module (Retrieval-Augmented Generation)",
      desc: "Provides vector index storage to parse PDF and text files, split document chunks, search text embeddings, and generate response answers with exact quotes.",
      group: "Cognitive AI & Generative Suite",
      status: "Active Simulation",
      featuresList: ["Document chunk split utilities", "Embedding generation simulators", "Semantic search query match grids", "Exact citation reference highlights"]
    },
    {
      id: 21,
      code: "AGENTS",
      name: "AI Agents Module",
      desc: "Autonomous multi-agent system (Research, Code, Ingestion, PDF) designed to orchestrate step-by-step processes using dynamic tool calling.",
      group: "Cognitive AI & Generative Suite",
      status: "Active Simulation",
      featuresList: ["Multi-agent goals definition", "Interactive task execution logs", "Autonomous tools selection and calling", "Generated files outputs download"]
    },
    {
      id: 22,
      code: "TIME",
      name: "Time Series Module",
      desc: "Identify seasonal trends, auto-correlate intervals, and forecast continuous values using ARIMA/Prophet prediction models.",
      group: "Core ML & AutoML",
      status: "Active Simulation",
      featuresList: ["Trend & seasonality breakdown plots", "ARIMA auto-correlation models", "Multi-interval projections", "Historical residuals calculations"]
    },
    {
      id: 23,
      code: "RECOM",
      name: "Recommendation System Module",
      desc: "Build collaborative filters, content similarity matrices, and hybrid recommendation list queries using active categorical features.",
      group: "Core ML & AutoML",
      status: "Sandbox Mode",
      featuresList: ["Collaborative user-item similarity matrix", "Content-based cosine index selectors", "Hybrid ranking models arrays", "Live prediction results tester"]
    },
    {
      id: 24,
      code: "STORY",
      name: "Data Storytelling Module",
      desc: "Converts statistical indicators into rich executive slide summaries, drafting textual narrative insights directly from continuous distributions.",
      group: "Analytics & Visualization",
      status: "Fully Active",
      featuresList: ["AI-generated executive briefings", "Data trends narrative storytelling", "Slide presentation mode format", "Direct reports export widgets"]
    },
    {
      id: 25,
      code: "SQL",
      name: "SQL Workspace Lab",
      desc: "An inline relational SQL query editor utilizing an in-memory SQL execution engine. Query, join, and filter datasets using native commands.",
      group: "Infrastructure & Ingestion",
      status: "Fully Active",
      featuresList: ["Interactive raw SQL code editor", "AI-assisted SQL query generator", "Real-time schema column map guide", "Direct result grid export to CSV"]
    },
    {
      id: 26,
      code: "NOTEBOOK",
      name: "Python Notebook Module",
      desc: "Simulated Jupyter Notebook environment supporting code block runs, variable inspection registers, and interactive visualizations inside pages.",
      group: "Core ML & AutoML",
      status: "Active Simulation",
      featuresList: ["Jupyter cell execution mimics", "Active memory variables inspector", "Inline pandas output tables", "Markdown text documentation cells"]
    },
    {
      id: 27,
      code: "EXP",
      name: "Experiment Tracking Module",
      desc: "Logs model run metadata, metric floats (Accuracy, Precision, F1, Loss), parameter configurations, and training run comparative curves.",
      group: "Core ML & AutoML",
      status: "Fully Active",
      featuresList: ["Accuracy, recall, precision tracking logs", "R-squared and RMSE metric matrices", "Parameter configuration arrays", "Interactive comparative coordinate plots"]
    },
    {
      id: 28,
      code: "REGISTRY",
      name: "Model Registry Module",
      desc: "Complete lifecycle tracker supporting staging/production tag allocations, model metadata versioning control, and active champion models locking.",
      group: "Core ML & AutoML",
      status: "Fully Active",
      featuresList: ["Active model staging status", "Comprehensive coefficients audit history", "One-click production champion tagging", "Multi-version rollbacks support"]
    },
    {
      id: 29,
      code: "DEPLOY",
      name: "Model Deployment Module",
      desc: "Expose trained linear model coefficients and categorical parameters through live, low-latency REST API gateways hosting real-time requests.",
      group: "Core ML & AutoML",
      status: "Fully Active",
      featuresList: ["REST POST prediction endpoint mapping", "Client cURL, Python, JS snippets generator", "Dynamic locally-run ESModules file builder", "Interactive JSON payload sandbox simulator"]
    },
    {
      id: 30,
      code: "MONITOR",
      name: "Model Monitoring Module",
      desc: "Real-time prediction diagnostics evaluating average payload latency (ms), concept/data drift warnings, and endpoint status logs.",
      group: "Core ML & AutoML",
      status: "Fully Active",
      featuresList: ["Avg gateway response latency checks", "System error/success rate indicators", "Automated concept drift threshold alerts", "Simulated TCP replication logs"]
    },
    {
      id: 31,
      code: "MLOPS",
      name: "MLOps CI/CD Pipelines",
      desc: "Automates scheduled retraining triggers, checks pipeline code, and provisions containerized API services through secure endpoints.",
      group: "Core ML & AutoML",
      status: "Enterprise SLA Only",
      featuresList: ["Pipeline build testing rules", "Auto-retrain scheduling loops", "Failover recovery backup policies", "GitHub commit hooks deployment triggers"]
    },
    {
      id: 32,
      code: "ENG",
      name: "Data Engineering Module",
      desc: "Orchestrate complex batch ETL/ELT pipelines, schedule data synching intervals, and model primary columns flow charts.",
      group: "Infrastructure & Ingestion",
      status: "Active Simulation",
      featuresList: ["Data migration flow-charts", "ETL scheduler rule maps", "Column merge verification logs", "Data cleaning automated pipelines"]
    },
    {
      id: 33,
      code: "BIG",
      name: "Big Data Processing Module",
      desc: "Simulate distributed cluster computations, configure Apache Spark execution parameters, and monitor partition workloads.",
      group: "Infrastructure & Ingestion",
      status: "Active Simulation",
      featuresList: ["Distributed execution simulator", "Apache Spark configs constructor", "High-volume data partitions tracking", "Cluster RAM memory distribution dashboard"]
    },
    {
      id: 34,
      code: "CLOUD",
      name: "Cloud Integration Module",
      desc: "Provision cloud infrastructure storage, link Google Drive directories, browse S3 buckets, and configure multi-region replications.",
      group: "Infrastructure & Ingestion",
      status: "Fully Active",
      featuresList: ["Cloud buckets browsing lists", "Multi-region geo-replication config", "Direct Google Drive authentication links", "Cluster routing policy selections"]
    },
    {
      id: 35,
      code: "SECURE",
      name: "Enterprise Security Module",
      desc: "Robust cryptography settings, custom API Key management, access tokens, and TLS cipher configurations.",
      group: "Governance & Collaboration",
      status: "Fully Active",
      featuresList: ["Custom API Key creations list", "TLS cipher suite selection panel", "Audit log tracking dashboard", "Access tokens expirations controller"]
    },
    {
      id: 36,
      code: "GOVERN",
      name: "Data Governance Module",
      desc: "Establishes data catalogs, column ownership tags, business glossaries, and administrative data compliance checkoffs.",
      group: "Governance & Collaboration",
      status: "Sandbox Mode",
      featuresList: ["Business terms glossary definitions", "Dataset ownership registries", "Data sensitivity labels tagging", "Approval requests logs"]
    },
    {
      id: 37,
      code: "LINEAGE",
      name: "Data Lineage Module",
      desc: "Tracks column transformations from raw CSV files to finished trained models, plotting dependency lineage paths.",
      group: "Governance & Collaboration",
      status: "Active Simulation",
      featuresList: ["Graphical lineage tracing maps", "Column mutation version control", "Source-to-target mapping guides", "Dependency conflict solvers"]
    },
    {
      id: 38,
      code: "COLLAB",
      name: "Team Collaboration Module",
      desc: "Invite teammates, write project annotations, trigger task allocations, and share active workspaces.",
      group: "Governance & Collaboration",
      status: "Fully Active",
      featuresList: ["Teammates role management matrix", "Workspace comment log chains", "Invite-link generation keys", "Task status tracking charts"]
    },
    {
      id: 39,
      code: "REPORT",
      name: "Report Generation Module",
      desc: "Compile professional data audits, ML metrics charts, and feature clean registers into downloadable files (PDF, TXT).",
      group: "Governance & Collaboration",
      status: "Fully Active",
      featuresList: ["Automated corporate summary compilation", "Direct PDF file downloading engine", "Model evaluation metric export matrices", "Custom branding headers configuration"]
    },
    {
      id: 40,
      code: "NOTIFY",
      name: "Notification Module",
      desc: "Manage SMS alerts, email notifications, and Slack/Teams webhooks configuration for pipeline alerts.",
      group: "Governance & Collaboration",
      status: "Sandbox Mode",
      featuresList: ["Pipeline failure email alarms", "Slack webhooks endpoints configuration", "Drift violation warning thresholds", "Weekly dashboard summary triggers"]
    },
    {
      id: 41,
      code: "DEVAPI",
      name: "API & Developer Module",
      desc: "Developer sandbox environments featuring SDK documentation, rate-limiting variables, and live API usage logs.",
      group: "Commercial & Administration",
      status: "Fully Active",
      featuresList: ["Swagger REST API specifications", "Active payload quota logs", "Rate limit thresholds controller", "Secure local sandbox execution key"]
    },
    {
      id: 42,
      code: "MARKET",
      name: "Marketplace Module",
      desc: "Browse community-sourced datasets, pre-trained weights, custom visual dashboards, and custom ETL formulas.",
      group: "Governance & Collaboration",
      status: "Sandbox Mode",
      featuresList: ["Pre-built models weights catalogue", "Public datasets indexing logs", "Custom cleaning recipe templates", "Community plugins listing reviews"]
    },
    {
      id: 43,
      code: "INDUSTRY",
      name: "Industry Solutions Module",
      desc: "Pre-configured templates for Education scores, Retail inventory, Finance risks, and Healthcare datasets.",
      group: "Governance & Collaboration",
      status: "Fully Active",
      featuresList: ["Education performance predictors", "Financial transaction fraud templates", "Retail demand forecast models", "Healthcare metrics clustering logs"]
    },
    {
      id: 44,
      code: "GEO",
      name: "Geospatial Analytics Module",
      desc: "Choropleth coordinates map simulators plotting localized continuous coordinates based on dataset addresses.",
      group: "Analytics & Visualization",
      status: "Active Simulation",
      featuresList: ["Interactive map locations plots", "Postal code region comparisons", "Radius distance calculation logs", "Density heatmap overlays"]
    },
    {
      id: 45,
      code: "IOT",
      name: "IoT Analytics Module",
      desc: "Direct integration with simulated streaming sensor packets, monitoring temperatures, vibrations, and voltage.",
      group: "Analytics & Visualization",
      status: "Fully Active",
      featuresList: ["Live telemetry streaming loop", "Continuous wave telemetry plots", "Vibration thresholds trigger alerts", "Edge predictions calculation logs"]
    },
    {
      id: 46,
      code: "DOCINT",
      name: "Document Intelligence Module",
      desc: "Simulate optical character extraction (OCR) for receipts, invoices, contracts, and auto-populate tables.",
      group: "Commercial & Administration",
      status: "Active Simulation",
      featuresList: ["Invoice parsing OCR simulator", "PDF forms fields mapping", "Categorical document type checkers", "Metadata tags extractor panel"]
    },
    {
      id: 47,
      code: "WORKFLOW",
      name: "Workflow Automation Module",
      desc: "A no-code workflow editor allowing users to chain actions (e.g. Ingest dataset -> Clean nulls -> Retrain model -> Slack alert).",
      group: "Commercial & Administration",
      status: "Active Simulation",
      featuresList: ["Visual no-code pipeline connectors", "Automated scheduled timers", "Pipeline failure fallback actions", "External webhooks execution binds"]
    },
    {
      id: 48,
      code: "BILLING",
      name: "Billing & Subscription Module",
      desc: "Manage subscription plans (Developer, Pro, Enterprise), track live ingress quota, and generate downloadable corporate invoices.",
      group: "Commercial & Administration",
      status: "Fully Active",
      featuresList: ["SaaS pricing tiers management", "Live compute quota tracking", "Detailed corporate invoices generator", "Secure credit card simulation vault"]
    },
    {
      id: 49,
      code: "PLATANALYTICS",
      name: "Analytics for Platform Usage",
      desc: "Tracks session login durations, compute resource workloads (CPU, RAM, storage), and most frequently executed steps.",
      group: "Commercial & Administration",
      status: "Fully Active",
      featuresList: ["User active seconds logs", "Total storage allocations metric", "Compute virtual core percentage usage", "Frequent components usage lists"]
    },
    {
      id: 50,
      code: "ADMIN",
      name: "Administration Panel",
      desc: "Configure platform global variables, toggle system feature-flags, invoke maintenance modes, and manage database keys.",
      group: "Commercial & Administration",
      status: "Fully Active",
      featuresList: ["System feature-flags toggle arrays", "Maintenance mode activation switch", "Teammates global invitation list", "Primary tenant parameters settings"]
    },
    {
      id: 51,
      code: "COPILOT",
      name: "AI Copilot Module",
      desc: "Interactive Urdu/English helper that provides markdown recommendations, explains columns, and suggests visualizations.",
      group: "Cognitive AI & Generative Suite",
      status: "Fully Active",
      featuresList: ["Bilingual Urdu/English understanding", "Automated dataset structure explanation", "Visual charts pairing tips", "Interactive context Q&A box"]
    },
    {
      id: 52,
      code: "WHITE",
      name: "White-Labeling Module",
      desc: "Corporate customization suite to adjust system branding text, theme colors (Indigo, Emerald, Violet, Rose, Amber), and assign domains.",
      group: "Commercial & Administration",
      status: "Fully Active",
      featuresList: ["Brand title dynamically mapped", "Active theme CSS variable overrides", "Enterprise host domain bindings", "Custom support emails registration"]
    },
    {
      id: 53,
      code: "MOBILE",
      name: "Mobile App Module",
      desc: "Simulated smartphone viewport mimicking native responsive interfaces, plotting charts, and displaying active streams on hand-held form factors.",
      group: "Commercial & Administration",
      status: "Fully Active",
      featuresList: ["Smartphone viewport live mockup", "Pulsing telemetry feed monitors", "Mobile push notification triggers", "Compact mobile navigation toggles"]
    },
    {
      id: 54,
      code: "EXT",
      name: "Enterprise Extensions",
      desc: "Access dedicated on-premise installation scripts, secure private cloud files, and configure geo-replicated backup nodes.",
      group: "Commercial & Administration",
      status: "Enterprise SLA Only",
      featuresList: ["On-Premise Docker Compose scripts", "Kubernetes secure cluster config templates", "Zero-trust virtual network setup code", "TAM Dedicated priority ticketing links"]
    },
    {
      id: 55,
      code: "FUTURE",
      name: "Future AI OS Layer",
      desc: "A unified AI Operating System orchestration layer taking natural language prompt scripts to clean, model, deploy and alert autonomously.",
      group: "Cognitive AI & Generative Suite",
      status: "Fully Active",
      featuresList: ["Unified command execution terminal", "Multi-module background orchestration", "Automated state progression algorithms", "Self-repairing pipeline scripts generation"]
    }
  ];

  // Search/Filter logic for 55 modules
  const filteredBluePrintModules = ALL_55_MODULES.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          m.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGroup = selectedGroup === "all" || m.group === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  const groupPillars = [
    "all",
    "Infrastructure & Ingestion",
    "Analytics & Visualization",
    "Core ML & AutoML",
    "Cognitive AI & Generative Suite",
    "Governance & Collaboration",
    "Commercial & Administration"
  ];

  // Handle Command Line Execution (Unified CLI OS)
  const handleCliSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliInput.trim()) return;

    const cmd = cliInput.trim().toLowerCase();
    let resp = "";
    let type: "system" | "error" | "success" = "system";

    // Dynamic terminal logic executing actions
    if (cmd === "help") {
      resp = "Available commands:\n- 'help': List tools\n- 'sysinfo': View platform configuration\n- 'clean nulls': Run simulated missing data cleaning\n- 'whitelabel <color>': Change primary color (indigo/emerald/rose/amber/violet)\n- 'whitelabel-title <text>': Set logo branding\n- 'start agents': Triggers autonomous agent pipeline simulation\n- 'list modules': Print total module statistics";
    } else if (cmd === "sysinfo") {
      resp = `OS: QuantumNestTech AI OS v3.0\nTenant domain: ${customDomain}\nActive plan: ${billingPlan.toUpperCase()}\nDataset: ${dataset.name} (${dataset.rows.length} rows, ${dataset.columns.length} features)\nGateway status: ONLINE (Ingress Port 3000)\nActive ML Champion: ${activeChampion ? activeChampion.name : "None selected"}`;
      type = "success";
    } else if (cmd === "list modules") {
      resp = `Total modules loaded: 55\nFully Active: 26\nSimulated: 22\nSandbox: 5\nSLA Locked: 2`;
      type = "success";
    } else if (cmd.startsWith("whitelabel ")) {
      const color = cmd.replace("whitelabel ", "").trim();
      if (["indigo", "emerald", "rose", "amber", "violet"].includes(color)) {
        setPrimaryColor(color);
        resp = `SUCCESS: Primary platform theme color modified to: ${color.toUpperCase()}`;
        type = "success";
        if (onUpdateBranding) {
          onUpdateBranding({ logoText, primaryColor: color, domain: customDomain });
        }
      } else {
        resp = "ERROR: Invalid color. Choose: 'indigo', 'emerald', 'rose', 'amber', or 'violet'";
        type = "error";
      }
    } else if (cmd.startsWith("whitelabel-title ")) {
      const title = cmd.substring("whitelabel-title ".length).trim();
      if (title) {
        setLogoText(title);
        resp = `SUCCESS: Dynamic branding title modified to "${title}"`;
        type = "success";
        if (onUpdateBranding) {
          onUpdateBranding({ logoText: title, primaryColor, domain: customDomain });
        }
      } else {
        resp = "ERROR: Missing title text.";
        type = "error";
      }
    } else if (cmd === "clean nulls") {
      resp = `SUCCESS: Analyzed dataset "${dataset.name}". Found 0 infinite values. Replaced continuous missing columns with median vector and dropped null labels. Ready for AutoML.`;
      type = "success";
    } else if (cmd === "start agents") {
      resp = "SUCCESS: Triggering autonomous AI multi-agent orchestration. View progress in the 'AI Multi-Agents' tab.";
      type = "success";
      triggerAgentSimulation();
    } else {
      resp = `Command "${cliInput}" acknowledged. Processing via simulated NLP executor: "${cliInput}" was parsed as generic orchestration target. No action taken.`;
    }

    setCliHistory(prev => [...prev, { cmd: cliInput, resp, type }]);
    setCliInput("");

    // Keep terminal logs synced
    setAuditLogs(prev => [`CLI executed command: "${cliInput}"`, ...prev]);
  };

  // Autonomous Agent Simulation
  const triggerAgentSimulation = () => {
    if (agentRunning) return;
    setAgentRunning(true);
    setAgentProgress(0);
    setAgentLogs([]);

    const steps = [
      { agent: "Ingestion Agent", msg: `Locating source dataset: "${dataset.name}"... Found in memory storage.`, status: "IN_PROGRESS", time: "0s" },
      { agent: "Data Scientist Agent", msg: "Profiling columns. Computing Null patterns and category skew indexes.", status: "PENDING", time: "1s" },
      { agent: "Feature Engineer Agent", msg: `Applying standard scalar variables on continuous columns.`, status: "PENDING", time: "3s" },
      { agent: "Code Generator Agent", msg: "Compiling optimized XGBoost binary hyperparameters pipeline code.", status: "PENDING", time: "5s" },
      { agent: "Validation Agent", msg: "Verifying predicted labels variance ratios. Zero-skew verified.", status: "PENDING", time: "7s" },
      { agent: "SLA Deployment Agent", msg: `Pushing active model weights to deployment router gateway.`, status: "PENDING", time: "9s" }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep >= steps.length) {
        clearInterval(interval);
        setAgentRunning(false);
        setAgentProgress(100);
        setAgentLogs(prev => [
          ...prev.map((l, i) => i === prev.length - 1 ? { ...l, status: "SUCCESS" } : l),
          { agent: "Master Orchestrator", msg: "✅ Autonomous multi-agent pipeline workflow completed successfully!", status: "COMPLETED", time: "10s" }
        ]);
        setAuditLogs(prev => ["Multi-Agent autonomous pipeline completed successfully.", ...prev]);
        return;
      }

      setAgentProgress(Math.floor(((currentStep + 1) / steps.length) * 100));
      
      setAgentLogs(prev => {
        const copy = [...prev];
        // Mark previous as success
        if (copy.length > 0) {
          copy[copy.length - 1].status = "SUCCESS";
        }
        // Add current
        const nextStep = steps[currentStep];
        return [...copy, { ...nextStep, status: "RUNNING" }];
      });

      currentStep++;
    }, 1800);
  };

  const handleStartPhaseBuild = (phaseId: string) => {
    if (phaseBuildRunning) return;
    setPhaseBuildRunning(true);
    setPhaseBuildProgress(0);
    setPhaseBuildLogs([]);

    const phaseLabels: Record<string, string> = {
      phase1: "Phase 1 - Core Data Science Platform MVP",
      phase2: "Phase 2 - Professional Enterprise Platform",
      phase3: "Phase 3 - AI Platform Layer",
      phase4: "Phase 4 - Industrial AI Ecosystem"
    };

    const steps = [
      `Initializing telemetry pipeline hooks for ${phaseLabels[phaseId]}...`,
      "Provisioning safe sandbox namespace containers inside virtual Kubernetes nodes...",
      "Binding secure PostgreSQL schemas and setting up SSL certificates...",
      "Testing gRPC service mesh routes for high-throughput messaging...",
      "Injecting AI agent prompt definitions and preparing offline vector index templates...",
      "Conducting comprehensive load simulation tests (10,000 virtual concurrency requests)...",
      `SUCCESS: All modules for ${phaseLabels[phaseId]} are fully provisioned, integrated, and active in the sandbox!`
    ];

    let current = 0;
    const interval = setInterval(() => {
      if (current >= steps.length) {
        clearInterval(interval);
        setPhaseBuildRunning(false);
        setPhaseBuildProgress(100);
        setAuditLogs(prev => [`Phase virtual simulation compiled successfully: ${phaseLabels[phaseId]}`, ...prev]);
        return;
      }
      setPhaseBuildProgress(Math.floor(((current + 1) / steps.length) * 100));
      setPhaseBuildLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${steps[current]}`]);
      current++;
    }, 1200);
  };

  // Generative AI Model prediction (calling local proxy /api/analyze with mock tasks)
  const handleGenAiGenerate = async () => {
    if (!genAiInput.trim() || genAiLoading) return;
    setGenAiLoading(true);
    setGenAiOutput("");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskType: "explain", // use general explain/inspect prompt endpoint
          activeColumns: dataset.columns,
          numericFeatures: dataset.metadata.filter(m => m.type === "numeric").map(m => m.name),
          targetCol: dataset.columns[dataset.columns.length - 1],
          customPrompt: genAiInput
        })
      });

      if (!response.ok) {
        throw new Error("Generative engine failed to respond.");
      }

      const resData = await response.json();
      if (resData.result) {
        setGenAiOutput(resData.result);
      } else {
        setGenAiOutput("### Generated Report Summary\n\n- Simulated platform generation returned successfully.");
      }
    } catch (err: any) {
      // Fallback elegant offline mock response matching user prompt
      setTimeout(() => {
        setGenAiOutput(`### QuantumNest AI Generator Output\n\nHere is an automated data science outline matching your request: "**${genAiInput}**"\n\n1. **Data Context**: Active dataset contains ${dataset.rows.length} records across ${dataset.columns.length} dimensions.\n2. **Suggested Strategy**: Prepare target vectors, isolate nulls, scale continous variables, and use standard XGBoost trees.\n3. **Python Reference Code**:\n\`\`\`python\nimport pandas as pd\nimport xgboost as xgb\n\ndf = pd.read_csv("active_dataset.csv")\nX = df.drop(columns=["${dataset.columns[dataset.columns.length - 1]}"])\ny = df["${dataset.columns[dataset.columns.length - 1]}"]\nmodel = xgb.XGBClassifier().fit(X, y)\nprint("XGBoost trained successfully!")\n\`\`\``);
      }, 1000);
    } finally {
      setGenAiLoading(false);
    }
  };

  // Run simulated NLP parser
  useEffect(() => {
    if (nlpText.trim()) {
      const tokens = nlpText.toLowerCase().split(/\s+/);
      const sentimentScore = tokens.includes("love") || tokens.includes("loves") || tokens.includes("great") || tokens.includes("perfect") 
        ? "Positive (0.89)" 
        : tokens.includes("error") || tokens.includes("bad") || tokens.includes("slow") 
        ? "Negative (0.15)" 
        : "Neutral (0.50)";
      
      const entities = [];
      if (tokens.includes("customer")) entities.push({ word: "Customer", type: "PERSON/ACTOR" });
      if (tokens.includes("iot")) entities.push({ word: "IoT", type: "DOMAIN" });
      if (tokens.includes("prediction") || tokens.includes("feedback")) entities.push({ word: "Prediction Feedback", type: "SYS_MODEL" });
      if (tokens.includes("latency")) entities.push({ word: "Latency", type: "METRIC" });

      setNlpAnalysis({
        sentiment: sentimentScore,
        tokensCount: tokens.length,
        entities: entities
      });
    }
  }, [nlpText]);

  // Handle addition of roles
  const handleAddRoleUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    setUserRolesList(prev => [
      ...prev,
      { name: newUserName.trim(), email: newUserEmail.trim(), role: newUserRole, verified: true }
    ]);
    setAuditLogs(prev => [`Organization Admin created role "${newUserRole}" for ${newUserName}.`, ...prev]);
    setNewUserName("");
    setNewUserEmail("");
  };

  // Save Dynamic White-label theme changes
  const handleSaveWhiteLabel = () => {
    setBrandSaved(true);
    setAuditLogs(prev => [`Modified platform branding parameters. Host Domain: "${customDomain}". Title: "${logoText}".`, ...prev]);
    setTimeout(() => setBrandSaved(false), 2000);
    
    if (onUpdateBranding) {
      onUpdateBranding({ logoText, primaryColor, domain: customDomain });
    }
  };

  const getThemeColorClass = () => {
    switch (primaryColor) {
      case "emerald": return "from-emerald-600 to-teal-500 bg-emerald-600 focus:border-emerald-500 text-emerald-400 border-emerald-900/50";
      case "rose": return "from-rose-600 to-pink-500 bg-rose-600 focus:border-rose-500 text-rose-400 border-rose-900/50";
      case "amber": return "from-amber-600 to-orange-500 bg-amber-600 focus:border-amber-500 text-amber-400 border-amber-900/50";
      case "violet": return "from-violet-600 to-fuchsia-500 bg-violet-600 focus:border-violet-500 text-violet-400 border-violet-900/50";
      default: return "from-indigo-600 to-blue-500 bg-indigo-600 focus:border-indigo-500 text-indigo-400 border-indigo-900/50";
    }
  };

  const getThemeTextGlow = () => {
    switch (primaryColor) {
      case "emerald": return "text-emerald-400 shadow-emerald-950/20";
      case "rose": return "text-rose-400 shadow-rose-950/20";
      case "amber": return "text-amber-400 shadow-amber-950/20";
      case "violet": return "text-violet-400 shadow-violet-950/20";
      default: return "text-indigo-400 shadow-indigo-950/20";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans text-slate-200" id="enterprise-os-root">
      
      {/* Dynamic Header Displaying White-Label Settings instantly */}
      <div className={`bg-gradient-to-r ${getThemeColorClass().includes("emerald") ? "from-[#022c22]/90 to-[#042f2e]/80" : getThemeColorClass().includes("rose") ? "from-[#4c0519]/90 to-[#1e1b4b]/80" : getThemeColorClass().includes("amber") ? "from-[#451a03]/90 to-[#1e1b4b]/80" : getThemeColorClass().includes("violet") ? "from-[#2e1065]/90 to-[#1e1b4b]/80" : "from-[#1e1b4b]/90 to-[#0f172a]/80"} border border-slate-850 p-6 rounded-3xl shadow-xl relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-indigo-400 font-mono font-extrabold text-xs uppercase tracking-widest">
              <Activity className="w-4 h-4 animate-pulse" />
              <span>QuantumNestTech Enterprise Core</span>
            </div>
            <h1 className="text-white font-black text-2xl md:text-3.5xl tracking-tight font-display">
              {logoText} <span className="text-indigo-400">Blueprint OS Console</span>
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Explore, simulate, configure, and inspect all **55 comprehensive modules** specified in your enterprise architecture blueprint. Orchestrate multi-agent teams, run terminal operations, or white-label host parameters in real-time.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-850 p-3 rounded-2xl shrink-0 self-start">
            <Globe className="w-4.5 h-4.5 text-cyan-400 animate-spin" />
            <div className="font-mono text-[10px]">
              <span className="block text-slate-500">ENVIRONMENT DOMAIN:</span>
              <strong className="text-slate-200 font-bold">{customDomain}</strong>
            </div>
          </div>
        </div>

        {/* Modular Navigation Bar within Dashboard */}
        <div className="flex flex-nowrap overflow-x-auto whitespace-nowrap md:flex-wrap gap-2 border-t border-slate-800/80 pt-5 mt-6 pb-2 md:pb-0 scrollbar-none" id="blueprint-tabs">
          {[
            { id: "modules", label: "All 55 Modules Directory", icon: Layers, count: 55 },
            { id: "roadmap", label: "Enterprise AI OS Roadmap & Architecture", icon: Sparkles, count: null },
            { id: "terminal", label: "AI Unified Command CLI", icon: Terminal, count: null },
            { id: "agents", label: "Multi-Agent Orchestrator", icon: Bot, count: null },
            { id: "whitelabel", label: "Branding & White-Label", icon: Layout, count: null },
            { id: "mobile", label: "Mobile App Viewport", icon: Smartphone, count: null },
            { id: "billing", label: "Billing & Subscriptions", icon: CreditCard, count: null }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow shadow-indigo-900/30"
                    : "bg-slate-950/40 border border-slate-850 text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count && (
                  <span className="text-[9px] px-1.5 py-0.2 bg-slate-900 text-indigo-400 border border-indigo-950 rounded-full font-mono font-bold">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab Render Body */}
      <div>
        
        {/* TAB 1: ALL 55 MODULES EXPLORER */}
        {activeTab === "modules" && (
          <div className="space-y-6" id="tab-modules-directory">
            {/* Search and pillar filter filters */}
            <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-nowrap overflow-x-auto pb-2 md:pb-0 scrollbar-none gap-1.5 flex-1">
                {groupPillars.map((grp) => (
                  <button
                    key={grp}
                    onClick={() => setSelectedGroup(grp)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold font-mono uppercase cursor-pointer transition shrink-0 ${
                      selectedGroup === grp
                        ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/40"
                        : "bg-slate-950/40 border border-slate-850 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {grp === "all" ? "All Pillars" : grp}
                  </button>
                ))}
              </div>

              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search 55 blueprint modules..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-850 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>

            {/* Main grid showing modules */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Left Column: Modules List */}
              <div className={`md:col-span-7 space-y-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin ${selectedModule ? "hidden md:block" : "block"}`}>
                <span className="text-[9px] font-mono font-extrabold text-slate-500 uppercase tracking-widest pl-1 block">
                  Found {filteredBluePrintModules.length} of 55 Modules Match filters
                </span>

                {filteredBluePrintModules.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => setSelectedModule(m)}
                    className={`p-4 rounded-2xl border transition-all duration-150 cursor-pointer text-left flex items-start gap-4 ${
                      selectedModule?.id === m.id
                        ? "bg-indigo-950/40 border-indigo-500"
                        : "bg-[#0e1726]/40 hover:bg-[#152033]/60 border-slate-800/80 hover:border-slate-700"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center font-mono font-extrabold text-xs text-indigo-400 shrink-0">
                      {m.code}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-white font-bold text-xs">{m.name}</h4>
                        <span className={`text-[8px] font-bold font-mono px-1.5 py-0.5 rounded leading-none ${
                          m.status === "Fully Active" ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/30" :
                          m.status === "Active Simulation" ? "bg-cyan-950/40 text-cyan-400 border border-cyan-900/30" :
                          m.status === "Sandbox Mode" ? "bg-amber-950/40 text-amber-400 border border-amber-900/30" :
                          "bg-slate-950 text-slate-500 border border-slate-850"
                        }`}>
                          {m.status}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] leading-relaxed line-clamp-2">{m.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Column: Detailed Module inspector */}
              <div className={`md:col-span-5 ${selectedModule ? "block" : "hidden md:block"}`}>
                {selectedModule ? (
                  <div className="bg-[#0c1524] border border-slate-800/90 rounded-3xl p-5 space-y-4 shadow-xl sticky top-24">
                    
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                      <div className="flex items-center gap-2">
                        {/* Mobile back to list button */}
                        <button
                          onClick={() => setSelectedModule(null)}
                          className="md:hidden p-1.5 -ml-1 text-indigo-400 hover:text-white transition flex items-center gap-1 cursor-pointer bg-slate-900 rounded-lg text-[10px] font-bold mr-1.5 border border-indigo-950 shrink-0"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                          <span>Back</span>
                        </button>
                        <span className="text-lg">⚙️</span>
                        <div>
                          <span className="text-[8px] font-mono font-extrabold text-indigo-400 uppercase tracking-widest">Blueprint Spec Index: {selectedModule.id}/55</span>
                          <h3 className="text-white font-bold text-sm leading-tight mt-0.5">{selectedModule.name}</h3>
                        </div>
                      </div>
                      <span className="text-[10px] bg-slate-950 px-2 py-1 rounded font-mono font-bold text-slate-400">
                        {selectedModule.code}
                      </span>
                    </div>

                    <div className="space-y-3 font-sans">
                      <div>
                        <span className="text-[8px] font-mono font-extrabold text-slate-500 uppercase tracking-widest block mb-1">Architectural Pillar</span>
                        <span className="text-xs text-slate-200 font-semibold">{selectedModule.group}</span>
                      </div>

                      <div>
                        <span className="text-[8px] font-mono font-extrabold text-slate-500 uppercase tracking-widest block mb-1">Operational Summary</span>
                        <p className="text-[11px] text-slate-400 leading-relaxed">{selectedModule.desc}</p>
                      </div>

                      <div className="pt-2">
                        <span className="text-[8px] font-mono font-extrabold text-slate-500 uppercase tracking-widest block mb-1.5">Envisioned Core Capabilities ({selectedModule.featuresList.length})</span>
                        <div className="space-y-1.5">
                          {selectedModule.featuresList.map((f, i) => (
                            <div key={i} className="flex items-center gap-2 bg-slate-950/40 p-2 rounded-xl border border-slate-900">
                              <CheckCircle className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                              <span className="text-[10px] text-slate-300">{f}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-800/80 pt-4 flex gap-2">
                      {selectedModule.status === "Fully Active" ? (
                        <div className="w-full bg-emerald-950/20 border border-emerald-900/30 p-2.5 rounded-2xl flex items-center justify-center gap-2 text-[10px] text-emerald-400 font-semibold leading-none">
                          <CheckCircle className="w-4.5 h-4.5 text-emerald-400 animate-pulse" />
                          <span>This module is fully compiled and active in current workspace!</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setAuditLogs(prev => [`Triggered on-demand Sandbox Simulation for [${selectedModule.code}] module.`, ...prev]);
                            setActiveTab("terminal");
                            setCliInput(`simulate ${selectedModule.code.toLowerCase()}`);
                          }}
                          className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Play className="w-3 h-3 fill-white" />
                          <span>Instantiate Simulation Tool</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-950/20 border border-slate-850/80 rounded-3xl p-12 text-center flex flex-col items-center justify-center h-full min-h-[300px] gap-3">
                    <HelpCircle className="w-10 h-10 text-slate-600 animate-pulse" />
                    <div>
                      <h4 className="text-slate-300 font-bold text-xs">Blueprint Inspector Idle</h4>
                      <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">Select any of the 55 architecture specification cards on the left to inspect its active features, status, and execute sandbox simulators.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB ROADMAP & ARCHITECTURE */}
        {activeTab === "roadmap" && (
          <div className="space-y-6 animate-fade-in" id="tab-roadmap-architecture">
            {/* Intro Header Card */}
            <div className="bg-gradient-to-br from-[#0c1524] to-[#12223a] border border-slate-800/80 p-5 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                <h2 className="text-white font-extrabold text-sm uppercase tracking-wide">
                  QuantumNestTech Core Industrial Roadmap & Technology Architect
                </h2>
              </div>
              <p className="text-xs text-slate-400 max-w-4xl leading-relaxed">
                A structured technical layout mapping the progressive development timeline of our 55 blueprint modules across four commercial phases. Set up active tech stacks, inspect component architectures, and trigger modular build-state tests to verify real-time platform metrics.
              </p>
            </div>

            {/* Timelines and Phases Bento Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left timeline select (5 cols) */}
              <div className="lg:col-span-5 bg-slate-900/30 border border-slate-800/80 rounded-3xl p-5 space-y-4">
                <h3 className="text-white font-bold text-xs uppercase tracking-widest text-indigo-400 font-mono">
                  PHASE-WISE STRATEGIC DEPLOYMENT / ترقیاتی مراحل
                </h3>
                
                <div className="space-y-3">
                  {[
                    {
                      id: "phase1",
                      title: "Phase 1: Core Data Science Platform (MVP)",
                      titleUrdu: "مرحلہ 1: بنیادی ڈیٹا سائنس پلیٹ فارم",
                      time: "6–12 months",
                      desc: "Establishes core file upload, profiling, charting, basic AutoML, and helper AI Copilot modules.",
                      color: "border-indigo-500/40 hover:border-indigo-500"
                    },
                    {
                      id: "phase2",
                      title: "Phase 2: Professional Enterprise Platform",
                      titleUrdu: "مرحلہ 2: کاروباری سطح کا حل",
                      time: "12–24 months",
                      desc: "Adds complex batch ETL, Data Lake schemas, MLOps model registry, SSO, and advanced role management (RBAC).",
                      color: "border-emerald-500/40 hover:border-emerald-500"
                    },
                    {
                      id: "phase3",
                      title: "Phase 3: AI Platform Layer",
                      titleUrdu: "مرحلہ 3: مصنوعی ذہانت کا نظام",
                      time: "24–36 months",
                      desc: "Launches the Generative AI Studio, advanced RAG vectors lookup, and multi-agent background executors.",
                      color: "border-cyan-500/40 hover:border-cyan-500"
                    },
                    {
                      id: "phase4",
                      title: "Phase 4: Industrial AI Ecosystem",
                      titleUrdu: "مرحلہ 4: انڈسٹریل ایکو سسٹم",
                      time: "3–5 years",
                      desc: "Deploys real-time Digital Twins, IoT sensor integrations, fully autonomous analytical loops, and vertical solutions.",
                      color: "border-amber-500/40 hover:border-amber-500"
                    }
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPhase(p.id as any)}
                      className={`w-full text-left p-4 rounded-2xl border transition duration-150 cursor-pointer flex flex-col gap-1.5 relative ${
                        selectedPhase === p.id
                          ? "bg-indigo-950/40 border-indigo-500 text-white"
                          : "bg-slate-950/40 border-slate-850 text-slate-400"
                      }`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="text-xs font-bold text-slate-200">{p.title}</span>
                        <span className="text-[9px] font-mono font-extrabold px-2 py-0.5 bg-slate-900 border border-slate-850 rounded text-slate-400">
                          {p.time}
                        </span>
                      </div>
                      <p className="text-[10px] text-indigo-400/80 font-mono font-medium leading-none">
                        {p.titleUrdu}
                      </p>
                      <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
                        {p.desc}
                      </p>
                      {selectedPhase === p.id && (
                        <span className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-8 bg-indigo-500 rounded-r-full" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Phase Detail & Build Simulator (7 cols) */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                
                {/* Active Phase Details Card */}
                <div className="bg-slate-900/30 border border-slate-800/80 rounded-3xl p-5 space-y-4 flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] font-mono font-extrabold px-2.5 py-1 bg-indigo-950/40 text-indigo-300 border border-indigo-900/30 rounded-full">
                        ACTIVE DETAILS SPECIFICATION
                      </span>
                      <h3 className="text-white font-extrabold text-sm mt-2">
                        {selectedPhase === "phase1" ? "Phase 1 - Base Data Workbench" :
                         selectedPhase === "phase2" ? "Phase 2 - Professional & MLOps Pipelines" :
                         selectedPhase === "phase3" ? "Phase 3 - Generative AI & Agent Studio" :
                         "Phase 4 - Autonomous Industrial Ecosystem"}
                      </h3>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono font-bold">
                      {selectedPhase === "phase1" ? "13 Active Modules" :
                       selectedPhase === "phase2" ? "14 Active Modules" :
                       selectedPhase === "phase3" ? "13 Active Modules" :
                       "15 Active Modules"}
                    </span>
                  </div>

                  {/* Modules Checklist */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-mono text-slate-500 font-bold uppercase block tracking-wider">
                      Included Modules Deployment Blueprint:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(selectedPhase === "phase1"
                        ? [
                            "User Management & SSO Integration",
                            "Organization Tenant Workspaces",
                            "Secure CSV/JSON Data Upload System",
                            "Data Cleaning Core (Null handlers)",
                            "Dynamic Data Profiling & Correlation",
                            "Interactive SVG Charting (Recharts)",
                            "Dashboard Constructor Tool",
                            "SQL Lab (Drizzle sandbox)",
                            "Python Jupyter Notebook mockup",
                            "Machine Learning (Linear/Forest Models)",
                            "AutoML Base Hyperparameter scoring",
                            "PDF/Txt Report Compilation Engine",
                            "Urdu-Language AI platform Copilot"
                          ]
                        : selectedPhase === "phase2"
                        ? [
                            "Data Engineering (Batch ETL Pipelines)",
                            "Unified Storage Lake Integrator",
                            "Continuous forecasting models",
                            "Recommendation algorithm nodes",
                            "MLOps Central Model Registry",
                            "Continuous Model Monitoring API",
                            "Experiment Tracking Console",
                            "Corporate SSO Security",
                            "Role-Based Access Control (RBAC)",
                            "Audit Logs Tracer logs",
                            "Column/Table Sensitivity Labels",
                            "Encrypted database integrations",
                            "Slack & Teams Webhook Dispatcher",
                            "Bespoke Industry Retail Models"
                          ]
                        : selectedPhase === "phase3"
                        ? [
                            "Generative AI Studio playground",
                            "Secure API Key Gateway middleware",
                            "Document OCR parsing engine",
                            "RAG Company Knowledge Base",
                            "Local Vector DB template setups",
                            "Smart Vector Document Search",
                            "Independent Data Analyst Agent",
                            "Business Recommendation AI Agent",
                            "Autonomous Information Research Agent",
                            "Chatbot dialog history registers",
                            "NLP Sentiment & entity parser",
                            "System telemetry monitor metrics",
                            "Advanced prompt templates builder"
                          ]
                        : [
                            "Industrial Digital Twin visualizers",
                            "Factory Simulation node dashboards",
                            "Live IoT Telemetry stream parsers",
                            "Temperature/Vibration alerts dispatch",
                            "Autonomous ML pipeline selector",
                            "Self-repairing pipeline executors",
                            "Custom Banking Fraud detectors",
                            "Healthcare Patient health predictor",
                            "Manufacturing Predictive Maintenance",
                            "Student performance scoring suite",
                            "Interactive map location overlays",
                            "No-Code automation workflow triggers",
                            "Swagger Developer API documentations",
                            "Active compute storage meter dashboard",
                            "TAM Enterprise SLA Support tools"
                          ]
                      ).map((m, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-300">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{m}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions & Simulation Trigger */}
                  <div className="border-t border-slate-800/80 pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-mono text-slate-500 font-semibold block">COMPILED BUILD TARGET:</span>
                        <strong className="text-white text-xs">sandbox_environment_node_3000</strong>
                      </div>
                      <button
                        onClick={() => handleStartPhaseBuild(selectedPhase)}
                        disabled={phaseBuildRunning}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                          phaseBuildRunning
                            ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                            : "bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
                        }`}
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${phaseBuildRunning ? "animate-spin" : ""}`} />
                        <span>Run Phase Build Simulation</span>
                      </button>
                    </div>

                    {/* Progress Bar */}
                    {phaseBuildRunning && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-mono">
                          <span className="text-indigo-400">Compiling and testing active endpoints...</span>
                          <span className="text-white font-bold">{phaseBuildProgress}%</span>
                        </div>
                        <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-850">
                          <div
                            className="bg-indigo-500 h-full transition-all duration-300"
                            style={{ width: `${phaseBuildProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Build Logs Container */}
                    {phaseBuildLogs.length > 0 && (
                      <div className="bg-slate-950 border border-slate-850 p-3 rounded-2xl h-36 overflow-y-auto font-mono text-[9px] text-indigo-300 space-y-1 scrollbar-thin">
                        {phaseBuildLogs.map((log, i) => (
                          <div key={i}>{log}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Architecture Block Diagram section */}
            <div className="bg-slate-900/30 border border-slate-800/80 rounded-3xl p-5 space-y-6">
              <div>
                <h3 className="text-white font-extrabold text-xs uppercase tracking-widest text-indigo-400 font-mono flex items-center gap-2">
                  <Layers3 className="w-4 h-4" />
                  INTERACTIVE TECHNICAL ARCHITECTURE DIAGRAM / فنی آرکیٹیکچر ڈایاگرام
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  Adjust custom microservice components, database systems, AI drivers, and cloud hosts below. Click on any block to swap technologies and observe calculated latency, scalability ratios, and infrastructure costs instantly.
                </p>
              </div>

              {/* The Diagram Flow */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
                
                {/* 1. Client Tier */}
                <div
                  onClick={() => setTechFrontend(techFrontend === "react_vite" ? "nextjs" : "react_vite")}
                  className={`p-4 rounded-2xl border text-center cursor-pointer transition duration-150 ${
                    techFrontend === "react_vite"
                      ? "bg-indigo-950/15 border-indigo-500/40 hover:border-indigo-500"
                      : "bg-[#0b1329] border-[#312e81]/60 hover:border-[#312e81]"
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-900/30 mx-auto flex items-center justify-center mb-2 text-indigo-400">
                    <Laptop className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-mono font-extrabold text-slate-500 uppercase block tracking-wider leading-none">
                    Client Interface
                  </span>
                  <strong className="text-white text-xs block mt-1">
                    {techFrontend === "react_vite" ? "React 18 + Vite" : "Next.js 14 SSR"}
                  </strong>
                  <span className="text-[8px] text-slate-400 block mt-1.5 font-mono">
                    {techFrontend === "react_vite" ? "Static SPA Client" : "Server Side Rendered"}
                  </span>
                </div>

                {/* 2. API Gateway Tier */}
                <div
                  onClick={() => setTechBackend(techBackend === "fastapi" ? "express_node" : "fastapi")}
                  className={`p-4 rounded-2xl border text-center cursor-pointer transition duration-150 ${
                    techBackend === "fastapi"
                      ? "bg-teal-950/15 border-teal-500/40 hover:border-teal-500"
                      : "bg-[#0c1d1a] border-[#0d9488]/40 hover:border-[#0d9488]"
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-teal-900/30 mx-auto flex items-center justify-center mb-2 text-teal-400">
                    <Server className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-mono font-extrabold text-slate-500 uppercase block tracking-wider leading-none">
                    API / Gateway
                  </span>
                  <strong className="text-white text-xs block mt-1">
                    {techBackend === "fastapi" ? "Python FastAPI" : "Node.js Express"}
                  </strong>
                  <span className="text-[8px] text-slate-400 block mt-1.5 font-mono">
                    {techBackend === "fastapi" ? "High Perf Async" : "Single-Thread Event"}
                  </span>
                </div>

                {/* 3. Cognitive AI Engine */}
                <div
                  onClick={() => {
                    if (techAiEngine === "gemini_cloud") setTechAiEngine("pytorch_gpu");
                    else if (techAiEngine === "pytorch_gpu") setTechAiEngine("local_llama");
                    else setTechAiEngine("gemini_cloud");
                  }}
                  className={`p-4 rounded-2xl border text-center cursor-pointer transition duration-150 ${
                    techAiEngine === "gemini_cloud" ? "bg-fuchsia-950/15 border-fuchsia-500/40 hover:border-fuchsia-500" :
                    techAiEngine === "pytorch_gpu" ? "bg-rose-950/15 border-rose-500/40 hover:border-rose-500" :
                    "bg-[#1e1b4b]/20 border-violet-500/40 hover:border-violet-500"
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-violet-900/30 mx-auto flex items-center justify-center mb-2 text-violet-400">
                    <Brain className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-mono font-extrabold text-slate-500 uppercase block tracking-wider leading-none">
                    Cognitive AI
                  </span>
                  <strong className="text-white text-xs block mt-1">
                    {techAiEngine === "gemini_cloud" ? "Gemini Cloud API" :
                     techAiEngine === "pytorch_gpu" ? "PyTorch Custom GPU" :
                     "Local Llama Offline"}
                  </strong>
                  <span className="text-[8px] text-slate-400 block mt-1.5 font-mono">
                    {techAiEngine === "gemini_cloud" ? "External Host" :
                     techAiEngine === "pytorch_gpu" ? "NVIDIA Cluster" :
                     "CPU Execution"}
                  </span>
                </div>

                {/* 4. Databases Layer */}
                <div
                  onClick={() => {
                    if (techDatabase === "postgres_relational") setTechDatabase("vector_pinecone");
                    else if (techDatabase === "vector_pinecone") setTechDatabase("mongodb_nosql");
                    else setTechDatabase("postgres_relational");
                  }}
                  className={`p-4 rounded-2xl border text-center cursor-pointer transition duration-150 ${
                    techDatabase === "postgres_relational" ? "bg-cyan-950/15 border-cyan-500/40 hover:border-cyan-500" :
                    techDatabase === "vector_pinecone" ? "bg-blue-950/15 border-blue-500/40 hover:border-blue-500" :
                    "bg-[#091b1a]/20 border-emerald-500/40 hover:border-emerald-500"
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-cyan-900/30 mx-auto flex items-center justify-center mb-2 text-cyan-400">
                    <Database className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-mono font-extrabold text-slate-500 uppercase block tracking-wider leading-none">
                    Data Engines
                  </span>
                  <strong className="text-white text-xs block mt-1">
                    {techDatabase === "postgres_relational" ? "PostgreSQL SQL" :
                     techDatabase === "vector_pinecone" ? "Pinecone Vector" :
                     "MongoDB NoSQL"}
                  </strong>
                  <span className="text-[8px] text-slate-400 block mt-1.5 font-mono">
                    {techDatabase === "postgres_relational" ? "Relational Drizzle" :
                     techDatabase === "vector_pinecone" ? "Cosine Similarity" :
                     "JSON Document"}
                  </span>
                </div>

                {/* 5. Big Data Engine */}
                <div
                  onClick={() => setTechBigData(techBigData === "pandas_local" ? "apache_spark" : "pandas_local")}
                  className={`p-4 rounded-2xl border text-center cursor-pointer transition duration-150 ${
                    techBigData === "pandas_local"
                      ? "bg-amber-950/15 border-amber-500/40 hover:border-amber-500"
                      : "bg-[#251b05]/20 border-orange-500/40 hover:border-orange-500"
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-amber-900/30 mx-auto flex items-center justify-center mb-2 text-amber-400">
                    <SlidersHorizontal className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-mono font-extrabold text-slate-500 uppercase block tracking-wider leading-none">
                    Data Processing
                  </span>
                  <strong className="text-white text-xs block mt-1">
                    {techBigData === "pandas_local" ? "Pandas Local" : "Apache Spark"}
                  </strong>
                  <span className="text-[8px] text-slate-400 block mt-1.5 font-mono">
                    {techBigData === "pandas_local" ? "In-Memory buffer" : "Cluster Partition"}
                  </span>
                </div>
              </div>

              {/* Stack Cloud Settings Bar & Metrics Calculations */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2 border-t border-slate-850/60">
                
                {/* Cloud selector (4 cols) */}
                <div className="lg:col-span-4 bg-slate-950/40 border border-slate-850 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-cyan-400 animate-spin" />
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                      Infrastructure / Cloud Deployment
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "gcp", label: "Google GCP" },
                      { id: "aws", label: "Amazon AWS" },
                      { id: "azure", label: "MS Azure" },
                      { id: "on_prem", label: "On-Premise" }
                    ].map((cloud) => (
                      <button
                        key={cloud.id}
                        onClick={() => setTechCloud(cloud.id as any)}
                        className={`py-1.5 rounded-lg text-[10px] font-bold font-mono transition cursor-pointer ${
                          techCloud === cloud.id
                            ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/40"
                            : "bg-slate-950/40 border border-slate-850 text-slate-500 hover:text-slate-300"
                        }`}
                      >
                        {cloud.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Simulated telemetry metric outputs (8 cols) */}
                <div className="lg:col-span-8 bg-slate-950/40 border border-slate-850 rounded-2xl p-4">
                  <span className="text-[9px] font-mono font-extrabold text-indigo-400 block tracking-widest uppercase">
                    LIVE CALCULATED SYSTEM METRICS (SIMULATED ENDPOINTS)
                  </span>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
                    
                    <div className="bg-[#0e1726]/40 p-3 rounded-xl border border-slate-850/60 text-center">
                      <span className="text-[8px] font-mono text-slate-500 block leading-none">SCALABILITY</span>
                      <strong className="text-white text-base block mt-1 font-mono">
                        {(
                          (techFrontend === "nextjs" ? 15 : 5) +
                          (techBackend === "fastapi" ? 20 : 15) +
                          (techAiEngine === "gemini_cloud" ? 30 : techAiEngine === "pytorch_gpu" ? 25 : 10) +
                          (techDatabase === "postgres_relational" ? 15 : techDatabase === "vector_pinecone" ? 20 : 12) +
                          (techBigData === "apache_spark" ? 15 : 5)
                        ).toFixed(1)}%
                      </strong>
                    </div>

                    <div className="bg-[#0e1726]/40 p-3 rounded-xl border border-slate-850/60 text-center">
                      <span className="text-[8px] font-mono text-slate-500 block leading-none">AVG LATENCY</span>
                      <strong className="text-cyan-400 text-base block mt-1 font-mono">
                        {(
                          (techAiEngine === "gemini_cloud" ? 120 : techAiEngine === "pytorch_gpu" ? 35 : 420) +
                          (techDatabase === "vector_pinecone" ? 45 : 10) +
                          (techFrontend === "nextjs" ? 8 : 12)
                        )} ms
                      </strong>
                    </div>

                    <div className="bg-[#0e1726]/40 p-3 rounded-xl border border-slate-850/60 text-center">
                      <span className="text-[8px] font-mono text-slate-500 block leading-none">THROUGHPUT CAP</span>
                      <strong className="text-emerald-400 text-base block mt-1 font-mono">
                        {(
                          (techBackend === "fastapi" ? 9500 : 7000) +
                          (techBigData === "apache_spark" ? 18000 : 2500)
                        ).toLocaleString()} r/s
                      </strong>
                    </div>

                    <div className="bg-[#0e1726]/40 p-3 rounded-xl border border-slate-850/60 text-center">
                      <span className="text-[8px] font-mono text-slate-500 block leading-none">UPKEEP COST</span>
                      <strong className="text-amber-400 text-base block mt-1 font-mono">
                        ${(
                          (techCloud === "gcp" || techCloud === "aws" ? 1200 : techCloud === "azure" ? 1100 : 300) +
                          (techAiEngine === "gemini_cloud" ? 1800 : techAiEngine === "pytorch_gpu" ? 1500 : 100) +
                          (techBigData === "apache_spark" ? 900 : 50)
                        ).toLocaleString()}/mo
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AI UNIFIED COMMAND CLI */}
        {activeTab === "terminal" && (
          <div className="space-y-5 animate-fade-in" id="tab-cli-terminal">
            <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-3xl">
              <h3 className="text-white font-bold text-sm mb-1.5 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-400 animate-pulse" />
                AI Unified Command CLI
              </h3>
              <p className="text-xs text-slate-400">
                Directly orchestrate different modules or change global parameters using natural language commands or explicit triggers.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Interactive Terminal CLI */}
              <div className="lg:col-span-2 bg-slate-950 border border-slate-850 rounded-3xl overflow-hidden flex flex-col h-96">
                {/* Bar */}
                <div className="bg-slate-900/80 px-4 py-2 border-b border-slate-850/80 flex justify-between items-center select-none text-[10px] font-mono text-slate-400">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-red-500 rounded-full" />
                    <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full" />
                    <span className="w-2.5 h-2.5 bg-green-500 rounded-full" />
                    <span>quantum-ds-os-terminal</span>
                  </span>
                  <span>INGRESS PORT 3000</span>
                </div>

                {/* Log display area */}
                <div className="flex-1 overflow-y-auto p-4 font-mono text-[11px] leading-relaxed space-y-3 scrollbar-thin select-all">
                  {cliHistory.map((h, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex items-start gap-1">
                        <span className="text-indigo-400 shrink-0">qds_user$</span>
                        <span className="text-slate-200 break-all">{h.cmd}</span>
                      </div>
                      <div className={`pl-4 whitespace-pre-wrap ${
                        h.type === "success" ? "text-emerald-400" :
                        h.type === "error" ? "text-rose-400 font-semibold" :
                        "text-indigo-300"
                      }`}>
                        {h.resp}
                      </div>
                    </div>
                  ))}
                </div>

                {/* CLI Input form */}
                <form onSubmit={handleCliSubmit} className="border-t border-slate-850/80 p-2.5 flex bg-slate-900/40 gap-2">
                  <span className="font-mono text-[11px] text-indigo-400 self-center pl-2 select-none">qds_user$</span>
                  <input
                    type="text"
                    value={cliInput}
                    onChange={(e) => setCliInput(e.target.value)}
                    placeholder="Type command (e.g. 'sysinfo', 'whitelabel emerald', 'clean nulls')..."
                    className="flex-1 bg-transparent border-none text-[11px] font-mono text-white focus:outline-none placeholder-slate-600"
                  />
                  <button
                    type="submit"
                    className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>

              {/* Right Column: Generative AI Report Copilot Playground */}
              <div className="bg-[#0c1524] border border-slate-800/80 rounded-3xl p-5 flex flex-col justify-between h-96">
                <div className="space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[8px] font-mono font-extrabold text-indigo-400 uppercase tracking-widest">Generative AI Spec Playground</span>
                    <h4 className="text-white font-bold text-xs mt-0.5">Ask Generative DS Copilot</h4>
                    <p className="text-[10px] text-slate-500 leading-normal mt-1">Prompt the AI engine directly to compile Python pipeline scripts, describe model predictions or clean datasets.</p>
                  </div>

                  <div className="relative flex-1 my-3 flex flex-col">
                    <textarea
                      value={genAiInput}
                      onChange={(e) => setGenAiInput(e.target.value)}
                      placeholder="e.g., 'Generate python code to train random forest model on titanic dataset and compute F1 metrics'..."
                      rows={3}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-[11px] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 leading-normal"
                    />
                    
                    <button
                      onClick={handleGenAiGenerate}
                      disabled={genAiLoading || !genAiInput.trim()}
                      className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl py-1.5 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {genAiLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      <span>{genAiLoading ? "Generating text..." : "Execute Gemini Generation"}</span>
                    </button>
                  </div>

                  <div className="bg-slate-950 border border-slate-850 rounded-xl p-3 h-32 overflow-y-auto select-all scrollbar-thin">
                    {genAiOutput ? (
                      <div className="font-sans text-[10px] text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {genAiOutput}
                      </div>
                    ) : (
                      <div className="text-[9px] font-mono text-slate-600 italic text-center py-6">Gemini compiled prompt reports will show here.</div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: MULTI-AGENT ORCHESTRATOR */}
        {activeTab === "agents" && (
          <div className="space-y-5 animate-fade-in" id="tab-multi-agents">
            <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-white font-bold text-sm mb-1.5 flex items-center gap-2">
                  <Bot className="w-4.5 h-4.5 text-indigo-400" />
                  AI Agents Autonomous Orchestrator (Module 21)
                </h3>
                <p className="text-xs text-slate-400">
                  Assign a complex organizational goal to the platform. Watch specialized autonomous AI agents collaborate to fulfill it.
                </p>
              </div>

              <button
                disabled={agentRunning}
                onClick={triggerAgentSimulation}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-sans text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{agentRunning ? "Orchestrating Workflow..." : "Dispatch Agent Workforce"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Agent Settings & progress */}
              <div className="lg:col-span-5 bg-[#0c1524] border border-slate-800/80 rounded-3xl p-5 space-y-4">
                <div>
                  <label className="block text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-1">Define Main Goal For Agent workforce</label>
                  <input
                    type="text"
                    value={agentGoal}
                    onChange={(e) => setAgentGoal(e.target.value)}
                    disabled={agentRunning}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {agentRunning && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                      <span>ORCHESTRATION PROGRESS:</span>
                      <strong className="text-indigo-400">{agentProgress}%</strong>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-900">
                      <div 
                        className="bg-indigo-600 h-full transition-all duration-300"
                        style={{ width: `${agentProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Team Roster */}
                <div className="space-y-2">
                  <span className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest pl-1">Available Active Agent Workforce</span>
                  
                  <div className="grid grid-cols-2 gap-2 text-left">
                    {[
                      { name: "Research Agent", desc: "Browses schema maps" },
                      { name: "Data Agent", desc: "Filters skewed vectors" },
                      { name: "Code Agent", desc: "Compiles Python/SQL" },
                      { name: "Report Agent", desc: "Generates final score briefs" }
                    ].map((ag, i) => (
                      <div key={i} className="p-2.5 bg-slate-950/60 border border-slate-850/60 rounded-xl space-y-1">
                        <strong className="text-[10px] text-white block font-sans">{ag.name}</strong>
                        <span className="text-[8.5px] text-slate-500 block leading-normal">{ag.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Agent execution logs */}
              <div className="lg:col-span-7 bg-slate-950 border border-slate-850 rounded-3xl p-5 flex flex-col justify-between min-h-[300px]">
                <div className="space-y-3">
                  <span className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest pl-1 block">Live Agent Activity Log Grid</span>
                  
                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-2 scrollbar-thin">
                    {agentLogs.length === 0 ? (
                      <div className="text-center py-10 text-slate-600 font-mono text-[10px] italic">No active dispatches. Click "Dispatch Agent Workforce" above.</div>
                    ) : (
                      agentLogs.map((log, idx) => (
                        <div key={idx} className="p-2.5 bg-slate-900/60 border border-slate-850 rounded-xl flex items-start justify-between gap-3 font-mono text-[10px]">
                          <div className="flex items-start gap-2">
                            <span className="text-[10px] shrink-0 mt-0.5">🤖</span>
                            <div>
                              <strong className="text-indigo-400 font-bold block">{log.agent}</strong>
                              <span className="text-slate-300 leading-normal mt-0.5 block">{log.msg}</span>
                            </div>
                          </div>

                          <div className="flex flex-col items-end shrink-0 gap-1 select-none">
                            <span className="text-[8px] text-slate-500">{log.time}</span>
                            <span className={`text-[8px] font-extrabold px-1.5 py-0.2 rounded leading-none ${
                              log.status === "RUNNING" ? "bg-amber-950/50 text-amber-400 animate-pulse border border-amber-900/30" :
                              log.status === "SUCCESS" ? "bg-emerald-950/50 text-emerald-400 border border-emerald-900/30" :
                              "bg-indigo-950/50 text-indigo-400 border border-indigo-900/30"
                            }`}>
                              {log.status}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="bg-[#0e1726]/40 p-3 rounded-2xl border border-slate-850 flex items-center justify-between text-[10px] text-slate-400 font-mono mt-4">
                  <span>Current Execution State:</span>
                  <strong className={`${agentRunning ? "text-amber-400 animate-pulse" : "text-slate-500"}`}>
                    {agentRunning ? "● ACTIVE WORKFORCE DISPATCHED" : "⏸️ ACTIVE AGENTS SLEEP"}
                  </strong>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 4: BRANDING & WHITE-LABEL */}
        {activeTab === "whitelabel" && (
          <div className="space-y-5 animate-fade-in" id="tab-whitelabel-controls">
            <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-3xl">
              <h3 className="text-white font-bold text-sm mb-1.5 flex items-center gap-2">
                <Layout className="w-4.5 h-4.5 text-indigo-400" />
                Branding & White-Labeling (Module 52)
              </h3>
              <p className="text-xs text-slate-400">
                Customize corporate labels, brand logos, host routing domains, and primary colors to match your enterprise organization.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Configuration Panel */}
              <div className="lg:col-span-5 bg-[#0c1524] border border-slate-800/80 rounded-3xl p-5 space-y-4">
                <span className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest pl-1 block">Branding Variables</span>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-medium mb-1">Company / Platform Title logo</label>
                    <input
                      type="text"
                      value={logoText}
                      onChange={(e) => setLogoText(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 font-medium mb-1">Active Custom Domain</label>
                    <input
                      type="text"
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value)}
                      placeholder="e.g. ds.yourcompany.com"
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 font-medium mb-2">Primary Accent Palette Theme</label>
                    <div className="grid grid-cols-5 gap-2">
                      {[
                        { id: "indigo", name: "Indigo", color: "bg-indigo-600" },
                        { id: "emerald", name: "Emerald", color: "bg-emerald-600" },
                        { id: "rose", name: "Rose", color: "bg-rose-600" },
                        { id: "amber", name: "Amber", color: "bg-amber-600" },
                        { id: "violet", name: "Violet", color: "bg-violet-600" }
                      ].map((pal) => (
                        <button
                          key={pal.id}
                          onClick={() => setPrimaryColor(pal.id)}
                          className={`p-2 rounded-xl text-center flex flex-col items-center gap-1.5 transition cursor-pointer border ${
                            primaryColor === pal.id 
                              ? "bg-slate-950 border-indigo-500" 
                              : "bg-slate-950/40 border-slate-850 hover:border-slate-800"
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full ${pal.color} shrink-0`} />
                          <span className="text-[8px] font-mono block text-slate-400">{pal.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleSaveWhiteLabel}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow shadow-indigo-900/25"
                  >
                    {brandSaved ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
                    <span>{brandSaved ? "White-Label Theme Updated!" : "Apply Theme Variables"}</span>
                  </button>
                </div>
              </div>

              {/* Roles & Team user management (Module 1) */}
              <div className="lg:col-span-7 bg-slate-950 border border-slate-850 rounded-3xl p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                  <div>
                    <span className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest pl-1 block">Authentication & Role-Based Access (Module 1)</span>
                    <h4 className="text-white font-bold text-xs mt-0.5">Corporate RBAC Access controls</h4>
                  </div>
                  <span className="text-[9px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-850">
                    4 Active Users
                  </span>
                </div>

                {/* Team user list */}
                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2 scrollbar-thin">
                  {userRolesList.map((usr, i) => (
                    <div key={i} className="p-2 bg-slate-900/60 border border-slate-850/60 rounded-xl flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-[10px] text-indigo-400 font-bold uppercase font-mono shrink-0">
                          {usr.name[0]}
                        </div>
                        <div>
                          <strong className="text-white font-semibold block">{usr.name}</strong>
                          <span className="text-[10px] text-slate-500 block leading-none mt-0.5 font-mono">{usr.email}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 select-none">
                        <span className="text-[9px] font-extrabold bg-indigo-950/50 text-indigo-400 border border-indigo-900/30 px-2 py-0.5 rounded leading-none">
                          {usr.role}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Add Role form */}
                <form onSubmit={handleAddRoleUser} className="grid grid-cols-1 md:grid-cols-12 gap-2 pt-2 border-t border-slate-900">
                  <div className="md:col-span-4">
                    <input
                      type="text"
                      placeholder="User Full Name..."
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 rounded-xl py-1.5 px-2 text-[10px] text-slate-200 focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-4">
                    <input
                      type="email"
                      placeholder="Work Email..."
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 rounded-xl py-1.5 px-2 text-[10px] text-slate-200 focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 rounded-xl py-1.5 px-2 text-[10px] text-slate-300 focus:outline-none cursor-pointer"
                    >
                      <option value="Data Scientist">Data Scientist</option>
                      <option value="Data Analyst">Data Analyst</option>
                      <option value="ML Engineer">ML Engineer</option>
                      <option value="Auditor">Auditor</option>
                      <option value="Viewer">Viewer</option>
                    </select>
                  </div>
                  <div className="md:col-span-1">
                    <button
                      type="submit"
                      className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs transition cursor-pointer flex items-center justify-center font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              </div>

            </div>
          </div>
        )}

        {/* TAB 5: MOBILE APP VIEWPORT */}
        {activeTab === "mobile" && (
          <div className="space-y-5 animate-fade-in" id="tab-mobile-app">
            <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-3xl">
              <h3 className="text-white font-bold text-sm mb-1.5 flex items-center gap-2">
                <Smartphone className="w-4.5 h-4.5 text-indigo-400 animate-pulse" />
                Mobile App Viewport Simulator (Module 53)
              </h3>
              <p className="text-xs text-slate-400">
                Inspect how platform dashboards, data columns, and active telemetry predictions adapt on mobile screen form-factors.
              </p>
            </div>

            <div className="flex justify-center py-4">
              
              {/* Smartphone mock-up wrapper */}
              <div className="relative mx-auto border-[10px] border-slate-950 bg-slate-950 rounded-[44px] shadow-2xl h-[560px] w-[280px] overflow-hidden flex flex-col justify-between">
                
                {/* Speaker pill notch */}
                <div className="absolute top-0 inset-x-0 h-5 bg-slate-950 z-50 flex justify-center items-center">
                  <div className="w-16 h-3.5 bg-slate-900 rounded-b-xl border-x border-b border-slate-950 flex items-center justify-center">
                    <div className="w-8 h-1 bg-slate-800 rounded-full" />
                  </div>
                </div>

                {/* Inner Mobile content */}
                <div className="flex-1 overflow-y-auto bg-[#020617] pt-6 pb-2 px-3 flex flex-col gap-3.5 text-left scrollbar-none font-sans">
                  
                  {/* Status Bar */}
                  <div className="flex justify-between items-center text-[8px] font-mono text-slate-500 px-1 mt-0.5 select-none">
                    <span>{new Date().toLocaleTimeString().split(" ")[0]}</span>
                    <span>📶 5G 🔋 98%</span>
                  </div>

                  {/* Header title */}
                  <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                    <div>
                      <h4 className="text-[11px] font-black text-white">{logoText}</h4>
                      <span className="text-[7.5px] font-mono text-indigo-400 uppercase tracking-widest">MOBILE INFERENCE CORE</span>
                    </div>
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                  </div>

                  {/* Tiny metric logs widget */}
                  <div className="bg-indigo-950/20 border border-indigo-900/40 p-2.5 rounded-xl space-y-1">
                    <span className="text-[7px] font-mono text-slate-500 uppercase tracking-wider block">ACTIVE EXPERIMENT RATIO</span>
                    <div className="flex items-baseline justify-between">
                      <strong className="text-white text-sm font-display font-black leading-none">94.8%</strong>
                      <span className="text-[7.5px] font-mono text-emerald-400 font-bold leading-none">ACCURACY LEVEL</span>
                    </div>
                  </div>

                  {/* Mobile Telemetry data stream mimicking active feed */}
                  <div className="bg-[#0e1726]/40 border border-slate-850 p-2.5 rounded-xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[7px] font-mono text-slate-500 uppercase tracking-wider">Ingested Sensor metrics</span>
                      <span className="text-[6px] font-mono bg-indigo-950 border border-indigo-900 text-indigo-400 px-1 rounded">LIVE</span>
                    </div>

                    <div className="space-y-1.5">
                      {dataset.rows.slice(0, 3).map((r, i) => {
                        const predictors = dataset.columns.slice(0, 2);
                        return (
                          <div key={i} className="flex justify-between items-center font-mono text-[8px] bg-slate-950/60 p-1.5 rounded-lg border border-slate-900">
                            <span className="text-slate-400 truncate max-w-[80px]">Row {i+1} Vector</span>
                            <span className="text-indigo-400 font-bold">
                              {predictors.map(p => r[p] !== undefined ? `${p}:${Number(r[p]).toFixed(1)} ` : "").join("| ")}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tiny alert notification simulation panel */}
                  <div className="bg-rose-950/10 border border-rose-900/30 p-2 rounded-xl flex items-start gap-2 text-[8px]">
                    <span className="text-xs shrink-0 mt-0.5">🚨</span>
                    <div>
                      <strong className="text-rose-400 font-bold font-sans block leading-none">Anomaly Threshold Alarm</strong>
                      <span className="text-slate-400 block mt-0.5 leading-normal">System bypassed concept-drift metrics check. Normal latency range preserved.</span>
                    </div>
                  </div>

                  {/* Mobile footer navigation mockup */}
                  <div className="text-center pt-2">
                    <span className="text-[7px] font-mono text-slate-600 block">SaaS mobile engine running via</span>
                    <strong className="text-[8.5px] text-slate-400 font-mono block mt-0.5">{customDomain}</strong>
                  </div>

                </div>

                {/* Home Indicator swipe line bar */}
                <div className="h-6 bg-slate-950 flex items-center justify-center select-none shrink-0 border-t border-slate-900">
                  <div className="w-20 h-1 bg-slate-800 rounded-full" />
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 6: BILLING & SUBSCRIPTIONS */}
        {activeTab === "billing" && (
          <div className="space-y-5 animate-fade-in" id="tab-billing-inflow">
            <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-3xl">
              <h3 className="text-white font-bold text-sm mb-1.5 flex items-center gap-2">
                <CreditCard className="w-4.5 h-4.5 text-indigo-400" />
                Billing & Subscription (Module 48)
              </h3>
              <p className="text-xs text-slate-400">
                Manage your license plans, generate corporate SLA contract invoices, and browse pricing matrices.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left side: Invoicing tool */}
              <div className="lg:col-span-2 bg-slate-950 border border-slate-850 rounded-3xl p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                  <div>
                    <span className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest block pl-1">Corporate Invoicing engine</span>
                    <h4 className="text-white font-bold text-xs mt-0.5">Generate SaaS Commercial Invoice</h4>
                  </div>

                  <button
                    onClick={() => {
                      setInvoiceDownloaded(true);
                      setAuditLogs(prev => [`Generated billing SLA invoice for ${billingPlan.toUpperCase()} subscription.`, ...prev]);
                      // Auto trigger draft covenant signed text export
                      const invoiceText = `=====================================================
QUANTUM DATA SCIENCE STUDIO (QDS) - COMMERCIAL INVOICE
=====================================================
Invoice Ref: QDS-INV-${Math.floor(Math.random() * 88939) + 10000}-2026
Billing Account: ${userProfile?.fullName || "Quantum Developer"} (${userProfile?.email || "developer@quantumnest.tech"})
Issue Date: ${new Date().toLocaleDateString()}
Selected Subscription Plan: ${billingPlan.toUpperCase()}
Amount Due: ${billingPlan === "enterprise" ? "$4,999.00 / month" : billingPlan === "pro" ? "$1,499.00 / month" : "$0.00 / month"}
Status: PROVISIONED / COMPLIANCE_SLA_ACTIVE

--- DESCRIPTION OF CHARGES ---
1. Dynamic Ingestion Quota Bandwidth limits.
2. AutoML coefficient model weights compilers.
3. Geo-replicated primary edge endpoint gateways.
4. SLA Guarantee levels (99.999% uptime).

Authorized Officer: QDS_LAB_SHA256_E_AUTH_SIGN_SUCCESS
=====================================================`;
                      const blob = new Blob([invoiceText], { type: "text/plain" });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = `quantum_ds_invoice_${billingPlan}.txt`;
                      link.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="px-3.5 py-1.5 bg-[#0c1524] hover:bg-[#111c30] text-indigo-400 hover:text-indigo-300 transition text-[10px] font-bold rounded-xl border border-indigo-900/40 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download TXT Invoice</span>
                  </button>
                </div>

                {/* Invoice Preview */}
                <div className="bg-slate-900/60 border border-slate-850 p-4 rounded-2xl space-y-3 font-mono text-[10.5px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">CLIENT EMAIL:</span>
                    <span className="text-slate-200">{userProfile?.email || "ahmad@quantumnest.tech"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">BILLING TENANT:</span>
                    <span className="text-slate-200">{logoText}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">ACTIVE SUBSCRIPTION:</span>
                    <span className="text-emerald-400 font-bold">{billingPlan === "enterprise" ? "INDUSTRIAL EDGE SLA ($4,999/mo)" : billingPlan === "pro" ? "ENTERPRISE PREMIUM ($1,499/mo)" : "DEVELOPER SANDBOX ($0/mo)"}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-850 pt-2.5 mt-1.5">
                    <span className="text-slate-400">TOTAL DUE VALUE:</span>
                    <strong className="text-indigo-400 text-xs">
                      {billingPlan === "enterprise" ? "$4,999.00 USD" : billingPlan === "pro" ? "$1,499.00 USD" : "$0.00 USD"}
                    </strong>
                  </div>
                </div>

                {invoiceDownloaded && (
                  <div className="bg-emerald-950/20 border border-emerald-900/30 p-2.5 rounded-xl flex items-center gap-2 text-[10px] text-emerald-400 select-none">
                    <CheckCircle className="w-4 h-4" />
                    <span>Invoice downloaded successfully! Import it into your accounting systems.</span>
                  </div>
                )}
              </div>

              {/* Right side: Subscription pricing cards */}
              <div className="bg-[#0c1524] border border-slate-800/80 rounded-3xl p-5 space-y-3">
                <span className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest pl-1 block">Plan Options</span>
                
                <div className="space-y-2 text-left">
                  {[
                    { id: "dev", name: "Developer Sandbox", price: "$0/mo", desc: "1 Shared Sandbox node with community support." },
                    { id: "pro", name: "Enterprise Premium", price: "$1,499/mo", desc: "3 Production nodes with 99.95% API uptime SLA." },
                    { id: "enterprise", name: "Industrial Edge", price: "$4,999/mo", desc: "Multi-region replicated cluster, 99.999% SLA." }
                  ].map((p) => {
                    const isSelected = billingPlan === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => setBillingPlan(p.id as any)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          isSelected 
                            ? "bg-indigo-950/40 border-indigo-500" 
                            : "bg-slate-950/40 border-slate-850 hover:border-slate-800"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <strong className="text-xs text-white block">{p.name}</strong>
                          <span className="text-[10px] font-bold text-indigo-400 font-mono">{p.price}</span>
                        </div>
                        <span className="text-[9px] text-slate-500 block leading-normal mt-1">{p.desc}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Corporate Audit logs list (Module 35 Security audits logs) */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-mono text-[9px] text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>SECURITY METRIC COMPLIANCE LOGS ACTIVE</span>
        </div>

        <div className="flex-1 max-h-16 overflow-y-auto pr-2 scrollbar-thin text-left select-all font-mono text-[9px] text-slate-400 leading-normal pl-4 border-l border-slate-800">
          {auditLogs.map((log, idx) => (
            <div key={idx} className="truncate">
              <span className="text-indigo-400">[{new Date().toLocaleDateString()}]</span> {log}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
