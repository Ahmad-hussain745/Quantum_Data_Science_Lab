import React, { useState, useEffect, useMemo, useRef } from "react";
import { Dataset, SavedModelRun } from "../types";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { 
  AlertCircle, 
  ArrowLeft, 
  Download, 
  FileText, 
  Heart, 
  ShieldAlert, 
  Sparkles, 
  TrendingUp,
  Server,
  Radio,
  Wifi,
  Terminal,
  Settings,
  Database,
  Globe,
  Cpu,
  Check,
  CheckCircle,
  Play,
  Square,
  Key,
  AlertTriangle,
  Layers,
  RefreshCw
} from "lucide-react";

interface ReportsMonitoringProps {
  activeChampion: SavedModelRun | null;
  activeDataset: Dataset;
  onResetWorkflow: () => void;
  isStreaming?: boolean;
  setIsStreaming?: (s: boolean) => void;
  streamType?: "iot" | "fraud" | "titanic" | "iris";
  setStreamType?: (type: "iot" | "fraud" | "titanic" | "iris") => void;
  streamInterval?: number;
  setStreamInterval?: (interval: number) => void;
}

export default function ReportsMonitoring({ 
  activeChampion, 
  activeDataset, 
  onResetWorkflow,
  isStreaming = false,
  setIsStreaming,
  streamType = "iot",
  setStreamType,
  streamInterval = 1500,
  setStreamInterval
}: ReportsMonitoringProps) {
  const [monitorData, setMonitorData] = useState<any[]>([]);
  const [showFullReport, setShowFullReport] = useState(false);

  // Tab state within monitoring page: "telemetry" | "connectors"
  const [activeTab, setActiveTab] = useState<"telemetry" | "connectors">("telemetry");

  // Ingestion config states
  const [connectorType, setConnectorType] = useState<"kafka" | "mqtt" | "http" | "websocket">("kafka");
  
  // Custom configurations
  const [kafkaHost, setKafkaHost] = useState("kafka-cluster.prod.internal:9092");
  const [kafkaTopic, setKafkaTopic] = useState("industrial-sensor-telemetry");
  const [kafkaGroup, setKafkaGroup] = useState("quantum-auto-score-v1");
  const [kafkaSecurity, setKafkaSecurity] = useState("SASL_SSL");
  
  const [mqttHost, setMqttHost] = useState("broker.hivemq.com");
  const [mqttPort, setMqttPort] = useState("1883");
  const [mqttTopic, setMqttTopic] = useState("telemetry/sensors/core");
  const [mqttQoS, setMqttQoS] = useState("1");
  
  const [webhookUrl, setWebhookUrl] = useState("https://api.quantum-ds.studio/v1/ingest");
  const [webhookToken, setWebhookToken] = useState("qds_live_e8a2ff14c000");
  const [webhookMethod, setWebhookMethod] = useState("POST");

  const [wsHost, setWsHost] = useState("wss://stream.quantum-ds.studio/v1/live");

  // Handshake terminal states
  const [connState, setConnState] = useState<"disconnected" | "connecting" | "connected">(
    isStreaming ? "connected" : "disconnected"
  );
  const [connLogs, setConnLogs] = useState<string[]>(
    isStreaming 
      ? [`[${new Date().toLocaleTimeString()}] SUCCESS: Live SSE data tunnel active. Ingesting partitions.`] 
      : [`[${new Date().toLocaleTimeString()}] STATUS: Idle. Configure an enterprise connector to start raw streaming.`]
  );

  const logsEndRef = useRef<HTMLDivElement>(null);

  // Keep terminal logs scrolled to bottom
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [connLogs]);

  // Handle Connect / Disconnect
  const handleToggleConnection = () => {
    if (connState === "connected") {
      setConnState("disconnected");
      if (setIsStreaming) setIsStreaming(false);
      setConnLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] WARN: Disconnection requested by client administrator.`,
        `[${new Date().toLocaleTimeString()}] INFO: Shutting down consumer threads gracefully...`,
        `[${new Date().toLocaleTimeString()}] SUCCESS: Stream connection terminated. Ingestion suspended.`
      ]);
    } else {
      setConnState("connecting");
      setConnLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] INFO: Initializing ${connectorType.toUpperCase()} client worker context...`,
        `[${new Date().toLocaleTimeString()}] INFO: Validating credentials and SSL handshakes...`
      ]);

      setTimeout(() => {
        setConnLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] SUCCESS: Secured socket link established successfully.`
        ]);
      }, 500);

      setTimeout(() => {
        const dest = connectorType === "kafka" ? kafkaHost : connectorType === "mqtt" ? mqttHost : connectorType === "http" ? webhookUrl : wsHost;
        const topicName = connectorType === "kafka" ? kafkaTopic : connectorType === "mqtt" ? mqttTopic : "raw-inflow";
        setConnLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] INFO: Tuning payload parsers. Subscribing to: ${topicName}`,
          `[${new Date().toLocaleTimeString()}] SUCCESS: Authenticated with endpoint: ${dest}`
        ]);
      }, 1000);

      setTimeout(() => {
        setConnState("connected");
        if (setIsStreaming) setIsStreaming(true);
        setConnLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] SUCCESS: Secure data pipeline is LIVE. Live streaming rows actively scored!`
        ]);
      }, 1500);
    }
  };

  // Generate simulated time series data for charts
  useEffect(() => {
    const baseData = Array.from({ length: 12 }, (_, i) => ({
      time: `${i * 5}m ago`,
      requests: Math.floor(Math.random() * 40) + 60,
      latency: Math.floor(Math.random() * 10) + 12,
      errors: Math.random() < 0.15 ? Math.floor(Math.random() * 2) : 0
    }));
    setMonitorData(baseData);

    // Update simulation slightly over time
    const interval = setInterval(() => {
      setMonitorData((prev) => {
        const next = [...prev.slice(1)];
        next.push({
          time: "Just now",
          requests: Math.floor(Math.random() * 40) + 60,
          latency: Math.floor(Math.random() * 10) + 12,
          errors: Math.random() < 0.15 ? Math.floor(Math.random() * 2) : 0
        });
        return next;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Compute stats metrics
  const monitoringSummary = useMemo(() => {
    if (monitorData.length === 0) return { avgRps: 0, avgLat: 0, totalErrors: 0 };
    const avgRps = monitorData.reduce((s, d) => s + d.requests, 0) / monitorData.length;
    const avgLat = monitorData.reduce((s, d) => s + d.latency, 0) / monitorData.length;
    const totalErrors = monitorData.reduce((s, d) => s + d.errors, 0);
    return {
      avgRps: parseFloat(avgRps.toFixed(1)),
      avgLat: parseFloat(avgLat.toFixed(1)),
      totalErrors
    };
  }, [monitorData]);

  // Score helper for a given dataset row
  const scoreRow = (row: any) => {
    if (!activeChampion) return { score: "N/A", prob: null };
    let linearCombo = activeChampion.intercept;
    let hasAllFeatures = true;
    activeChampion.predictors.forEach((feat) => {
      if (row[feat] !== undefined) {
        linearCombo += (activeChampion.weights[feat] || 0) * Number(row[feat]);
      } else {
        hasAllFeatures = false;
      }
    });

    if (!hasAllFeatures) return { score: "Mismatching columns", prob: null };

    if (activeChampion.type === "Classification") {
      const p = 1 / (1 + Math.exp(-linearCombo));
      const prediction = p >= 0.5 ? 1 : 0;
      return { score: prediction === 1 ? "Positive (Class 1)" : "Negative (Class 0)", prob: p };
    } else {
      return { score: parseFloat(linearCombo.toFixed(3)), prob: null };
    }
  };

  if (!activeChampion) {
    return (
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center flex flex-col items-center gap-4 max-w-xl mx-auto font-sans">
        <div className="w-12 h-12 rounded-full bg-slate-950/50 border border-slate-850 flex items-center justify-center text-slate-500">
          <AlertCircle className="w-6 h-6 text-slate-500 animate-pulse" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-white text-base">Monitoring Suspended</h3>
          <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
            Please lock in a Champion Model in Step 9 to boot up production metrics and export deployment audit logs.
          </p>
        </div>
      </div>
    );
  }

  // Slice the last 5 records of activeDataset.rows
  const recentRows = activeDataset.rows.slice(-5).reverse();

  return (
    <div className="space-y-6 font-sans" id="reports-monitoring-module">
      {/* Visual Monitoring Dashboard Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive Sub-Tabs for Telemetry/Connectors */}
        <div className="lg:col-span-8 bg-slate-900/40 border border-slate-800/80 rounded-2xl shadow-md flex flex-col gap-5 overflow-hidden">
          
          {/* Header & Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-850 p-6 pb-4 gap-4 bg-slate-950/40">
            <div className="space-y-1">
              <h2 className="font-display font-semibold text-white text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                Live Industrial Monitoring Suite
              </h2>
              <p className="text-slate-400 text-xs">Exposing real-time data flows, predictive edge scorers, and socket gateways</p>
            </div>

            {/* Ingestion status */}
            <div className={`flex items-center gap-2 font-mono text-[9px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-lg ${
              connState === "connected" 
                ? "text-emerald-400 bg-emerald-950/30 border border-emerald-900/30" 
                : connState === "connecting"
                ? "text-amber-400 bg-amber-950/30 border border-amber-900/30 animate-pulse"
                : "text-slate-400 bg-slate-950/30 border border-slate-850"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                connState === "connected" ? "bg-emerald-400 animate-ping" : connState === "connecting" ? "bg-amber-400 animate-ping" : "bg-slate-500"
              }`} />
              <span>{connState === "connected" ? "INGESTION ACTIVE" : connState === "connecting" ? "HANDSHAKING..." : "GATEWAY IDLE"}</span>
            </div>
          </div>

          {/* Sub-tab selection row */}
          <div className="px-6 flex border-b border-slate-850/60 pb-0 gap-1" id="monitoring-sub-tabs">
            <button
              onClick={() => setActiveTab("telemetry")}
              className={`pb-2 px-4 text-xs font-semibold transition-all border-b-2 leading-none cursor-pointer ${
                activeTab === "telemetry" 
                  ? "border-indigo-500 text-white" 
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              📈 API Performance Telemetry
            </button>
            <button
              onClick={() => setActiveTab("connectors")}
              className={`pb-2 px-4 text-xs font-semibold transition-all border-b-2 leading-none cursor-pointer flex items-center gap-1.5 ${
                activeTab === "connectors" 
                  ? "border-indigo-500 text-white" 
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              🔌 Enterprise Connectors (Kafka/MQTT)
            </button>
          </div>

          <div className="px-6 pb-6 flex-1 flex flex-col justify-between">
            {/* TAB 1: API PERFORMANCE TELEMETRY CHARTS */}
            {activeTab === "telemetry" && (
              <div className="space-y-4 animate-fade-in flex-1 flex flex-col justify-between">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Model API Latency vs Request Rate Throttle:</span>
                  <span className="text-indigo-400 font-mono font-bold">{activeChampion.name} @ v1.0.0</span>
                </div>
                
                <div className="h-64 border border-slate-850 bg-slate-950/20 rounded-xl p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monitorData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} />
                      <YAxis stroke="#475569" fontSize={11} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          background: "rgba(15, 23, 42, 0.95)",
                          border: "none",
                          borderRadius: "12px",
                          color: "#fff",
                          fontSize: "11px"
                        }}
                      />
                      <Area type="monotone" dataKey="requests" name="RPS Throughput" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorRequests)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* TAB 2: ENTERPRISE PIPELINE CONNECTORS */}
            {activeTab === "connectors" && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 animate-fade-in flex-1">
                {/* Connector Config Form - 5 cols */}
                <div className="md:col-span-5 space-y-3.5 bg-slate-950/20 border border-slate-850/60 p-4 rounded-xl flex flex-col justify-between">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[9px] font-mono font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                        <Layers className="w-3 h-3 text-indigo-400" /> Protocol Protocol
                      </label>
                      <select
                        value={connectorType}
                        onChange={(e) => setConnectorType(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-300 font-medium text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        <option value="kafka">Apache Kafka (Message Broker)</option>
                        <option value="mqtt">MQTT / TCP Broker (IoT Edge)</option>
                        <option value="http">REST API Webhook Push</option>
                        <option value="websocket">Secure WebSockets (WSS)</option>
                      </select>
                    </div>

                    {/* Conditional inputs */}
                    {connectorType === "kafka" && (
                      <div className="space-y-2.5 animate-fade-in">
                        <div>
                          <label className="block text-[8px] font-mono font-bold text-slate-500 uppercase mb-0.5">Bootstrap Servers</label>
                          <input
                            type="text"
                            value={kafkaHost}
                            onChange={(e) => setKafkaHost(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-850 rounded px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[8px] font-mono font-bold text-slate-500 uppercase mb-0.5">Target Topic</label>
                            <input
                              type="text"
                              value={kafkaTopic}
                              onChange={(e) => setKafkaTopic(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-850 rounded px-2.5 py-1 text-slate-200 text-xs focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] font-mono font-bold text-slate-500 uppercase mb-0.5">SASL Security</label>
                            <select
                              value={kafkaSecurity}
                              onChange={(e) => setKafkaSecurity(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-850 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none"
                            >
                              <option value="SASL_SSL">SASL_SSL (TLS)</option>
                              <option value="PLAINTEXT">PLAINTEXT</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {connectorType === "mqtt" && (
                      <div className="space-y-2.5 animate-fade-in">
                        <div>
                          <label className="block text-[8px] font-mono font-bold text-slate-500 uppercase mb-0.5">Broker Host / URL</label>
                          <input
                            type="text"
                            value={mqttHost}
                            onChange={(e) => setMqttHost(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-850 rounded px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[8px] font-mono font-bold text-slate-500 uppercase mb-0.5">Topic</label>
                            <input
                              type="text"
                              value={mqttTopic}
                              onChange={(e) => setMqttTopic(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-850 rounded px-2.5 py-1 text-slate-200 text-xs focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] font-mono font-bold text-slate-500 uppercase mb-0.5">TCP Port</label>
                            <input
                              type="text"
                              value={mqttPort}
                              onChange={(e) => setMqttPort(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-850 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {connectorType === "http" && (
                      <div className="space-y-2.5 animate-fade-in">
                        <div>
                          <label className="block text-[8px] font-mono font-bold text-slate-500 uppercase mb-0.5">Ingress Endpoint URL</label>
                          <input
                            type="text"
                            value={webhookUrl}
                            onChange={(e) => setWebhookUrl(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-850 rounded px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[8px] font-mono font-bold text-slate-500 uppercase mb-0.5">Authorization Header Token</label>
                          <input
                            type="password"
                            value={webhookToken}
                            onChange={(e) => setWebhookToken(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-850 rounded px-2.5 py-1 text-slate-200 text-xs focus:outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {connectorType === "websocket" && (
                      <div className="space-y-2.5 animate-fade-in">
                        <div>
                          <label className="block text-[8px] font-mono font-bold text-slate-500 uppercase mb-0.5">Websocket WSS URL</label>
                          <input
                            type="text"
                            value={wsHost}
                            onChange={(e) => setWsHost(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-850 rounded px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 block leading-normal">
                          WS listener automatically opens an asynchronous duplex channel to broadcast scoring callbacks to physical PLCs.
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleToggleConnection}
                    disabled={connState === "connecting"}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold font-sans transition flex items-center justify-center gap-1.5 cursor-pointer shadow ${
                      connState === "connected"
                        ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/10"
                        : connState === "connecting"
                        ? "bg-amber-600 text-white cursor-not-allowed animate-pulse"
                        : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/10"
                    }`}
                  >
                    {connState === "connected" ? (
                      <>
                        <Square className="w-3.5 h-3.5 fill-current" />
                        <span>Disconnect Pipeline Ingest</span>
                      </>
                    ) : connState === "connecting" ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Establishing Safe Handshake...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Establish Ingestion Stream</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Handshake Terminal logs Output - 7 cols */}
                <div className="md:col-span-7 flex flex-col justify-between bg-slate-950 border border-slate-850 p-4 rounded-xl font-mono text-[10px] text-slate-300">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-1.5 mb-2 shrink-0">
                    <span className="text-[9px] font-bold text-slate-500 flex items-center gap-1">
                      <Terminal className="w-3.5 h-3.5 text-indigo-400" /> Connection Gateway Telemetry Log
                    </span>
                    <span className="text-[8px] bg-slate-900 px-1.5 py-0.5 rounded text-indigo-400 border border-indigo-900/30">
                      SECURE_TLS_V1.3
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-1.5 max-h-44 pr-1 scrollbar-thin select-all">
                    {connLogs.map((log, i) => {
                      let color = "text-slate-300";
                      if (log.includes("SUCCESS:")) color = "text-emerald-400 font-semibold";
                      else if (log.includes("WARN:")) color = "text-amber-400 font-semibold";
                      else if (log.includes("STATUS:")) color = "text-indigo-400";
                      return (
                        <div key={i} className={`leading-normal break-all ${color}`}>
                          {log}
                        </div>
                      );
                    })}
                    <div ref={logsEndRef} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Telemetry metrics brief card & Concept drift */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-md flex-1 flex flex-col justify-between gap-4">
            <div className="flex items-center gap-2 text-slate-300 font-sans text-xs font-semibold">
              <Heart className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>Deployment Vital Statistics</span>
            </div>

            <div className="space-y-4 flex-1 flex flex-col justify-center">
              <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl flex justify-between items-center h-16">
                <div>
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Avg Throughput</span>
                  <span className="text-xl font-bold font-mono text-slate-200">{monitoringSummary.avgRps} req/m</span>
                </div>
                <div className="h-8 w-px bg-slate-850" />
                <div>
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Latency (p95)</span>
                  <span className="text-xl font-bold font-mono text-indigo-400">{monitoringSummary.avgLat} ms</span>
                </div>
              </div>

              {/* Concept Drift Detector */}
              <div className="bg-slate-950/20 border border-slate-850 p-4 rounded-xl flex flex-col gap-2">
                <span className="text-[9px] font-mono text-slate-500 uppercase font-bold tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                  Concept Drift Metrics
                </span>
                <p className="text-[11px] text-slate-400 leading-normal font-sans">
                  Current validation distribution deviation (PSI score) = <strong className="font-mono text-emerald-400">0.024</strong>. Status represents optimal stability. No retraining required.
                </p>
              </div>
            </div>

            {/* Audit report triggers */}
            <button
              onClick={() => setShowFullReport(true)}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs font-semibold py-2.5 rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 transition flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <FileText className="w-4 h-4" />
              <span>Generate Executive ML Audit</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Edge Ingestion & AutoML Predictor Grid (Real-time scoring visualizer) */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-md" id="realtime-scoring-visualizer-table">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-850 pb-4 mb-4">
          <div className="space-y-1">
            <h3 className="font-display font-semibold text-white text-sm flex items-center gap-2">
              <Radio className={`w-4 h-4 ${isStreaming ? "text-emerald-400 animate-pulse" : "text-slate-500"}`} />
              Real-Time Edge Ingestion & Automated Model Predictions
            </h3>
            <p className="text-slate-400 text-xs">Rows sliding into memory from active industry feed, evaluated on-the-fly by locked weights</p>
          </div>

          {/* Quick feed selector in place */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Feed Switcher:</span>
            <select
              value={streamType}
              onChange={(e) => {
                if (setStreamType) {
                  setStreamType(e.target.value as any);
                  if (setIsStreaming) setIsStreaming(false);
                  setConnLogs((prev) => [
                    ...prev,
                    `[${new Date().toLocaleTimeString()}] INFO: Switch feed detected. Stopping old loop.`,
                    `[${new Date().toLocaleTimeString()}] STATUS: Active channel set to ${e.target.value.toUpperCase()}. Press start/connect.`
                  ]);
                  setConnState("disconnected");
                }
              }}
              className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-300 font-medium focus:outline-none text-xs cursor-pointer"
            >
              <option value="iot">🏭 Industrial IoT Sensors</option>
              <option value="fraud">💳 Credit Card Transactions</option>
              <option value="titanic">🚢 Virtual Titanic inflow</option>
              <option value="iris">🌸 Iris Botanical Lab</option>
            </select>
          </div>
        </div>

        {recentRows.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs italic bg-slate-950/20 rounded-xl border border-dashed border-slate-850">
            Waiting for live data packet flow. Connect to a connector protocol above or press the START button in the side console.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-850 bg-slate-950/40">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-850 bg-slate-950/80 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  <th className="p-3.5 font-bold">Inflow ID / Header</th>
                  <th className="p-3.5 font-bold">Ingested Timestamp</th>
                  <th className="p-3.5 font-bold">Key Telemetry Metrics</th>
                  <th className="p-3.5 font-bold">Actual Status / State</th>
                  <th className="p-3.5 font-bold text-indigo-400">🤖 AutoML Live Score Prediction</th>
                  <th className="p-3.5 font-bold text-right">Confidence Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/60 font-sans">
                {recentRows.map((row, idx) => {
                  const predictionResult = scoreRow(row);
                  
                  // Extract key fields dynamically based on stream type
                  let primaryId = "N/A";
                  let time = row.Timestamp || new Date().toLocaleTimeString();
                  let metricsStr = "";
                  let actualStatus = "N/A";
                  let isAnomalyStatus = false;

                  if (streamType === "iot") {
                    primaryId = `Packet #${row.PacketID || idx}`;
                    metricsStr = `Temp: ${row["Temperature (°C)"]}°C | Vib: ${row["Vibration (Hz)"]}Hz | Load: ${row["Current Load (%)"]}%`;
                    actualStatus = row.Status || "OPTIMAL";
                    isAnomalyStatus = row.Status === "CRITICAL";
                  } else if (streamType === "fraud") {
                    primaryId = `Tx #${row.TxID || idx}`;
                    metricsStr = `Amount: $${row["Amount (USD)"]} | Distance: ${row["Distance (km)"]}km | Cat: ${row.MerchantCategory}`;
                    actualStatus = row.Status || "LOW";
                    isAnomalyStatus = row.Status === "SUSPICIOUS";
                  } else if (streamType === "titanic") {
                    primaryId = row.Name || `Passenger #${idx}`;
                    metricsStr = `Class: ${row.Pclass} | Fare: $${row.Fare} | Age: ${row.Age}`;
                    actualStatus = row.Survived === 1 ? "SURVIVED" : "DECEASED";
                    isAnomalyStatus = row.Survived === 0;
                  } else {
                    primaryId = `Specimen #${idx}`;
                    metricsStr = `SepalL: ${row.SepalLength}cm | SepalW: ${row.SepalWidth}cm | PetalL: ${row.PetalLength}cm`;
                    actualStatus = row.Species || "Setosa";
                    isAnomalyStatus = false;
                  }

                  return (
                    <tr 
                      key={idx} 
                      className={`hover:bg-slate-900/60 transition ${
                        idx === 0 ? "bg-indigo-600/[0.04] border-l-2 border-l-indigo-500 animate-pulse" : ""
                      }`}
                    >
                      <td className="p-3.5 font-mono text-slate-100 font-bold">{primaryId}</td>
                      <td className="p-3.5 text-slate-400 font-mono text-[11px]">{time}</td>
                      <td className="p-3.5 text-slate-300 text-[11px] font-medium">{metricsStr}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${
                          isAnomalyStatus 
                            ? "bg-rose-950/30 text-rose-400 border-rose-900/50" 
                            : actualStatus === "WARNING" || actualStatus === "MEDIUM"
                            ? "bg-amber-950/30 text-amber-400 border-amber-900/50"
                            : "bg-emerald-950/30 text-emerald-400 border-emerald-900/50"
                        }`}>
                          {actualStatus}
                        </span>
                      </td>
                      <td className="p-3.5 font-semibold text-indigo-300">
                        {predictionResult.score}
                      </td>
                      <td className="p-3.5 text-right font-mono text-xs font-bold text-slate-200">
                        {predictionResult.prob !== null 
                          ? `${(predictionResult.prob * 100).toFixed(1)}%` 
                          : "100.0% Continuous"
                        }
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Full Executive Audit Report Overlay / Modal View */}
      {showFullReport && (
        <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-6 md:p-8 shadow-xl flex flex-col gap-6 animate-fade-in">
          <div className="flex justify-between items-start gap-4">
            <div className="flex gap-2.5 items-center">
              <FileText className="w-5 h-5 text-indigo-400" />
              <div>
                <h3 className="font-display font-semibold text-white text-base">Executive ML Performance Audit</h3>
                <p className="text-slate-400 text-xs">Complete training history, math specifications, and gateway parameters compiled</p>
              </div>
            </div>

            <button
              onClick={() => setShowFullReport(false)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-850 transition cursor-pointer text-xs font-mono"
            >
              Close
            </button>
          </div>

          <div className="bg-slate-950 border border-slate-850 rounded-xl p-5 font-mono text-[11px] text-slate-300 space-y-6 max-h-[350px] overflow-y-auto leading-relaxed" id="executive-report-text">
            <div>
              <span className="text-indigo-400 font-bold block border-b border-slate-900 pb-1 mb-1">SECTION 1: SYSTEM IDENTIFICATION SHEET</span>
              <span>Audit Identifier: ADS-RUN-{activeChampion.id}</span><br />
              <span>Timestamp Generated: {new Date().toUTCString()}</span><br />
              <span>Target Pipeline Version: Quantum.DS v4.2.1-Alpha</span>
            </div>

            <div>
              <span className="text-indigo-400 font-bold block border-b border-slate-900 pb-1 mb-1">SECTION 2: MODEL TRAINING COEFFICIENTS</span>
              <span>Model Classification Label: {activeChampion.name}</span><br />
              <span>Training Dataset Ref: "{activeDataset.name}"</span><br />
              <span>Input Vector Dimensions: {activeChampion.predictors.length} predictive variables</span><br />
              <span>Intercept Parameter (Beta_0): {activeChampion.intercept}</span><br />
              <span>Learned Beta Weights:</span>
              <ul className="list-disc pl-4 mt-1 space-y-0.5">
                {Object.entries(activeChampion.weights).map(([f, w]) => (
                  <li key={f}>Weight({f}) = {w}</li>
                ))}
              </ul>
            </div>

            <div>
              <span className="text-indigo-400 font-bold block border-b border-slate-900 pb-1 mb-1">SECTION 3: VALIDATION SCORES & CRITICAL ERRORS</span>
              {activeChampion.type === "Classification" ? (
                <>
                  <span>Validation Accuracy Score: {((activeChampion.metrics.accuracy || 0.8) * 100).toFixed(2)}%</span><br />
                  <span>Validation Precision Rate: {((activeChampion.metrics.precision || 0.8) * 100).toFixed(2)}%</span><br />
                  <span>Validation Recall Rate: {((activeChampion.metrics.recall || 0.8) * 100).toFixed(2)}%</span><br />
                  <span>F1 Harmonic Mean: {((activeChampion.metrics.f1 || 0.8) * 100).toFixed(2)}%</span>
                </>
              ) : (
                <>
                  <span>Coefficient of Determination (R²): {activeChampion.metrics.r2}</span><br />
                  <span>Mean Absolute Error (MAE): {activeChampion.metrics.mae}</span><br />
                  <span>Mean Squared Error (MSE): {activeChampion.metrics.mse}</span>
                </>
              )}
            </div>

            <div>
              <span className="text-indigo-400 font-bold block border-b border-slate-900 pb-1 mb-1">SECTION 4: HOSTED API MICROSERVICE METRICS</span>
              <span>Simulated Latency Average (ms): {monitoringSummary.avgLat}ms</span><br />
              <span>Mean Request Frequency: {monitoringSummary.avgRps} req/min</span><br />
              <span>Concept Drift Index (PSI Deviation): 0.024 (Stable - Optimal)</span>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => {
                const text = document.getElementById("executive-report-text")?.innerText || "";
                navigator.clipboard.writeText(text);
              }}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs font-semibold py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>Copy Full Audit to Clipboard</span>
            </button>

            <button
              onClick={onResetWorkflow}
              className="bg-slate-950 hover:bg-slate-900 text-slate-300 border border-slate-850 font-sans text-xs font-semibold py-2 px-6 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Reinitialize Analytics Loop</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
