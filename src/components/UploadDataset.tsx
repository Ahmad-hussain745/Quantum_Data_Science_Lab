import React, { useState, useRef, useMemo, useEffect } from "react";
import { Dataset } from "../types";
import { preloadedDatasets, buildDataset } from "../utils/datasets";
import * as XLSX from "xlsx";
import { 
  Upload, 
  FileSpreadsheet, 
  Layers, 
  Info, 
  Check, 
  Sparkles, 
  ArrowRight,
  Search,
  ArrowUpDown,
  Download,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  FileJson,
  SlidersHorizontal,
  Table2,
  Trash2
} from "lucide-react";

interface UploadDatasetProps {
  activeDataset: Dataset;
  onDatasetChange: (dataset: Dataset) => void;
  onProceed: () => void;
}

export default function UploadDataset({ activeDataset, onDatasetChange, onProceed }: UploadDatasetProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- INTERACTIVE PREVIEW & ROW SIZE CONTROLS ---
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [customRowsInput, setCustomRowsInput] = useState<string>("10");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showColumnsConfig, setShowColumnsConfig] = useState<boolean>(false);

  // --- SYNTHETIC DATA GENERATOR STATES ---
  const [synthType, setSynthType] = useState<"churn" | "medical" | "energy" | "fraud">("churn");
  const [synthRows, setSynthRows] = useState<number>(500);
  const [synthNoise, setSynthNoise] = useState<number>(0.05);

  // Initialize/Sync visible columns when dataset changes
  useEffect(() => {
    if (activeDataset && activeDataset.columns) {
      setVisibleColumns(activeDataset.columns);
    }
    setCurrentPage(1);
  }, [activeDataset]);

  const handleDatasetSelect = (key: string) => {
    setError(null);
    setSuccess(null);
    const loadFn = preloadedDatasets[key];
    if (loadFn) {
      onDatasetChange(loadFn());
      setSuccess(`Dataset "${key}" loaded successfully!`);
    }
  };

  const parseCSV = (text: string): any[] => {
    const lines: string[] = [];
    let row = [""];
    let inQuotes = false;

    // Robust RFC-4180 CSV Parser
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          row[row.length - 1] += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        row.push("");
      } else if ((char === "\r" || char === "\n") && !inQuotes) {
        if (char === "\r" && nextChar === "\n") {
          i++;
        }
        lines.push(JSON.stringify(row));
        row = [""];
      } else {
        row[row.length - 1] += char;
      }
    }
    if (row.length > 1 || row[0] !== "") {
      lines.push(JSON.stringify(row));
    }

    if (lines.length < 2) {
      throw new Error("Dataset must contain at least a header row and one data row.");
    }

    const headers = JSON.parse(lines[0]).map((h: string) => h.trim());
    const parsedRows: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = JSON.parse(lines[i]);
      if (values.length !== headers.length) continue; // Skip misaligned rows

      const rowObj: any = {};
      headers.forEach((header: string, index: number) => {
        const rawVal = values[index]?.trim();
        if (rawVal === "" || rawVal === undefined || rawVal === null) {
          rowObj[header] = null;
        } else if (!isNaN(Number(rawVal))) {
          rowObj[header] = Number(rawVal);
        } else if (rawVal.toLowerCase() === "true") {
          rowObj[header] = true;
        } else if (rawVal.toLowerCase() === "false") {
          rowObj[header] = false;
        } else {
          rowObj[header] = rawVal;
        }
      });
      parsedRows.push(rowObj);
    }

    return parsedRows;
  };

  const handleFileUpload = (file: File) => {
    setError(null);
    setSuccess(null);
    if (!file.name.endsWith(".csv")) {
      setError("Please upload a standard CSV (.csv) file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsedRows = parseCSV(text);
        if (parsedRows.length === 0) {
          setError("No valid rows were parsed from the CSV file.");
          return;
        }

        const name = file.name.replace(".csv", "") + " Upload";
        const ds = buildDataset(name, parsedRows);
        onDatasetChange(ds);
        setSuccess(`Custom dataset parsed with ${parsedRows.length} rows and ${ds.columns.length} columns!`);
      } catch (err: any) {
        setError(err.message || "Failed to parse CSV file.");
      }
    };
    reader.onerror = () => {
      setError("Failed to read the uploaded file.");
    };
    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // --- FILTER & SORT LOGIC FOR ACTIVE PREVIEW ---
  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return activeDataset.rows;
    const lowerQuery = searchQuery.toLowerCase();
    return activeDataset.rows.filter(row => {
      return Object.values(row).some(val => {
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(lowerQuery);
      });
    });
  }, [activeDataset.rows, searchQuery]);

  const sortedRows = useMemo(() => {
    if (!sortColumn) return filteredRows;
    const sorted = [...filteredRows];
    sorted.sort((a, b) => {
      const valA = a[sortColumn];
      const valB = b[sortColumn];
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (typeof valA === "number" && typeof valB === "number") {
        return sortDirection === "asc" ? valA - valB : valB - valA;
      }
      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      if (strA < strB) return sortDirection === "asc" ? -1 : 1;
      if (strA > strB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredRows, sortColumn, sortDirection]);

  const paginatedRows = useMemo(() => {
    const limit = rowsPerPage === -1 ? sortedRows.length : rowsPerPage;
    if (limit <= 0) return sortedRows;
    const startIndex = (currentPage - 1) * limit;
    return sortedRows.slice(startIndex, startIndex + limit);
  }, [sortedRows, currentPage, rowsPerPage]);

  const totalPages = useMemo(() => {
    const limit = rowsPerPage === -1 ? sortedRows.length : rowsPerPage;
    if (limit <= 0) return 1;
    return Math.ceil(sortedRows.length / limit);
  }, [sortedRows.length, rowsPerPage]);

  const handleRowsPerPageDropdownChange = (val: string) => {
    if (val === "all") {
      setRowsPerPage(-1);
    } else if (val === "custom") {
      const num = parseInt(customRowsInput, 10);
      setRowsPerPage(isNaN(num) ? 10 : num);
    } else {
      const num = parseInt(val, 10);
      setRowsPerPage(num);
      setCustomRowsInput(val);
    }
    setCurrentPage(1);
  };

  const handleCustomRowsChange = (val: string) => {
    setCustomRowsInput(val);
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0) {
      setRowsPerPage(num);
    } else if (val === "") {
      setRowsPerPage(1);
    }
    setCurrentPage(1);
  };

  const handleSort = (colName: string) => {
    if (sortColumn === colName) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(colName);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const toggleColumnVisibility = (colName: string) => {
    if (visibleColumns.includes(colName)) {
      if (visibleColumns.length > 1) {
        setVisibleColumns(prev => prev.filter(c => c !== colName));
      } else {
        setError("Table preview must contain at least one column.");
        setTimeout(() => setError(null), 3500);
      }
    } else {
      setVisibleColumns(prev => [...prev, colName]);
    }
  };

  // --- CLEAN DATA EXPORT ENGINE ---
  const handleExportCSV = () => {
    try {
      const headers = activeDataset.columns;
      const csvDelimiter = ",";
      const csvRows = [headers.join(csvDelimiter)];

      activeDataset.rows.forEach(row => {
        const values = headers.map(header => {
          const val = row[header];
          if (val === null || val === undefined) return "";
          const str = String(val);
          if (str.includes(csvDelimiter) || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        });
        csvRows.push(values.join(csvDelimiter));
      });

      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      const cleanFileName = activeDataset.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      link.setAttribute("download", `${cleanFileName}_cleaned.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSuccess(`Successfully exported cleaned dataset to CSV! (${activeDataset.rows.length} rows)`);
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError("Failed to export to CSV: " + err.message);
    }
  };

  const handleExportJSON = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activeDataset.rows, null, 2));
      const link = document.createElement("a");
      link.setAttribute("href", dataStr);
      const cleanFileName = activeDataset.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      link.setAttribute("download", `${cleanFileName}_cleaned.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSuccess(`Successfully exported cleaned dataset to JSON! (${activeDataset.rows.length} rows)`);
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError("Failed to export to JSON: " + err.message);
    }
  };

  const handleExportExcel = () => {
    try {
      const worksheet = XLSX.utils.json_to_sheet(activeDataset.rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Cleaned_Dataset");
      
      const cleanFileName = activeDataset.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      XLSX.writeFile(workbook, `${cleanFileName}_cleaned.xlsx`);

      setSuccess(`Successfully exported cleaned dataset to Excel workbook! (${activeDataset.rows.length} rows)`);
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError("Failed to export to Excel: " + err.message);
    }
  };

  const handleGenerateSyntheticDataset = (type: string, rowCount: number, noiseLevel: number) => {
    setError(null);
    setSuccess(null);
    try {
      const rows: any[] = [];
      if (type === "churn") {
        for (let i = 0; i < rowCount; i++) {
          const tenure = Math.floor(Math.random() * 72) + 1;
          const contract = tenure > 24 ? "Two year" : tenure > 12 ? "One year" : "Month-to-month";
          const monthlyCharges = parseFloat((Math.random() * 90 + 20).toFixed(2));
          const totalCharges = parseFloat((monthlyCharges * tenure * (0.95 + Math.random() * 0.1)).toFixed(2));
          const supportTickets = Math.floor(Math.random() * 5) + (contract === "Month-to-month" ? 1 : 0);
          
          const z = -2.0 + (supportTickets * 0.8) - (tenure * 0.05) + (monthlyCharges * 0.01) + (Math.random() * noiseLevel * 2 - noiseLevel);
          const prob = 1 / (1 + Math.exp(-z));
          const churn = prob > 0.5 ? 1 : 0;
          
          rows.push({
            CustomerID: `CUST_${1000 + i}`,
            TenureMonths: tenure,
            ContractType: contract,
            MonthlyCharges: monthlyCharges,
            TotalCharges: totalCharges,
            SupportTickets: supportTickets,
            PaperlessBilling: Math.random() > 0.4 ? "Yes" : "No",
            InternetService: Math.random() > 0.7 ? "Fiber Optic" : Math.random() > 0.4 ? "DSL" : "No",
            Churn: churn
          });
        }
        const ds = buildDataset("Synthetic Telecom Churn", rows);
        onDatasetChange(ds);
        setSuccess(`Successfully generated and loaded E-Commerce Churn dataset with ${rowCount} rows!`);
      } else if (type === "medical") {
        for (let i = 0; i < rowCount; i++) {
          const age = Math.floor(Math.random() * 50) + 18;
          const bmi = parseFloat((Math.random() * 20 + 16).toFixed(1));
          const children = Math.floor(Math.random() * 5);
          const smoker = Math.random() > 0.85 ? "Yes" : "No";
          const region = ["Northeast", "Northwest", "Southeast", "Southwest"][Math.floor(Math.random() * 4)];
          
          let charges = 1200 + (age * 250) + (bmi * 120) + (children * 400);
          if (smoker === "Yes") {
            charges += 15000 + (bmi > 30 ? 10000 : 0);
          }
          const noise = (Math.random() * 2 - 1) * 2000 * (1 + noiseLevel);
          charges = parseFloat(Math.max(1000, charges + noise).toFixed(2));

          rows.push({
            MemberID: `MEM_${1000 + i}`,
            Age: age,
            BMI: bmi,
            Children: children,
            Smoker: smoker,
            Region: region,
            PremiumCharges: charges
          });
        }
        const ds = buildDataset("Synthetic Medical Cost", rows);
        onDatasetChange(ds);
        setSuccess(`Successfully generated and loaded Medical Insurance Cost dataset with ${rowCount} rows!`);
      } else if (type === "energy") {
        const now = Date.now();
        for (let i = 0; i < rowCount; i++) {
          const timestamp = new Date(now - (rowCount - i) * 60000).toISOString().slice(0, 16).replace("T", " ");
          const baseVoltage = 220 + Math.sin(i / 10) * 5;
          const baseAmpere = 15 + Math.cos(i / 12) * 3;
          let temp = 45 + Math.sin(i / 15) * 8 + (baseAmpere * 0.4);
          
          let anomaly = 0;
          const isAnomalyTriggered = Math.random() < (0.02 + noiseLevel * 0.05);
          let voltage = parseFloat((baseVoltage + (Math.random() * 2 - 1) * 2).toFixed(2));
          let ampere = parseFloat((baseAmpere + (Math.random() * 2 - 1) * 0.5).toFixed(2));
          
          if (isAnomalyTriggered) {
            anomaly = 1;
            voltage = parseFloat((voltage * (Math.random() > 0.5 ? 1.25 : 0.75)).toFixed(2));
            ampere = parseFloat((ampere * 1.8).toFixed(2));
            temp += 25 + Math.random() * 15;
          }
          
          temp = parseFloat(temp.toFixed(1));

          rows.push({
            Timestamp: timestamp,
            VoltageV: voltage,
            AmpereA: ampere,
            CoreTempC: temp,
            FanSpeedRPM: anomaly ? 0 : Math.floor(temp * 40 + Math.random() * 100),
            Anomaly: anomaly
          });
        }
        const ds = buildDataset("Synthetic IoT Anomalies", rows);
        onDatasetChange(ds);
        setSuccess(`Successfully generated and loaded Smart Energy IoT dataset with ${rowCount} rows!`);
      } else if (type === "fraud") {
        const now = Date.now();
        const categories = ["Groceries", "Dining", "Gas Station", "Online Tech", "Luxury Apparel", "Crypto", "ATM Cash-out"];
        for (let i = 0; i < rowCount; i++) {
          const timestamp = new Date(now - (rowCount - i) * 120000).toISOString().slice(0, 16).replace("T", " ");
          const dist = parseFloat((Math.random() * 15 + 0.5).toFixed(2));
          const amount = parseFloat((Math.random() * 120 + 5).toFixed(2));
          const cat = categories[Math.floor(Math.random() * 4)];
          
          let isFraud = 0;
          let finalAmount = amount;
          let finalDist = dist;
          let finalCat = cat;
          
          const isFraudTriggered = Math.random() < (0.015 + noiseLevel * 0.04);
          if (isFraudTriggered) {
            isFraud = 1;
            finalAmount = parseFloat((Math.random() * 800 + 400).toFixed(2));
            finalDist = parseFloat((Math.random() * 300 + 80).toFixed(2));
            finalCat = categories[Math.floor(Math.random() * 3) + 4];
          }

          rows.push({
            TxID: `TX_${10000 + i}`,
            Timestamp: timestamp,
            AmountUSD: finalAmount,
            Category: finalCat,
            DistanceFromHomeMiles: finalDist,
            DeclinedBefore: Math.random() > (isFraud ? 0.3 : 0.95) ? "Yes" : "No",
            IsFraud: isFraud
          });
        }
        const ds = buildDataset("Synthetic Transaction Fraud", rows);
        onDatasetChange(ds);
        setSuccess(`Successfully generated and loaded Financial Transaction Fraud dataset with ${rowCount} rows!`);
      }
    } catch (err: any) {
      setError("Failed to generate dataset: " + err.message);
    }
  };

  return (
    <div className="flex flex-col gap-6" id="upload-dataset-module">
      
      {/* SECTION 1: TWO COLUMNS (Upload panel + Inferred schema overview) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left side: Upload & Options */}
        <div className="lg:col-span-7 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-md flex flex-col gap-5">
          <div>
            <h2 className="font-display font-semibold text-white text-base flex items-center gap-2">
              <Upload className="w-4 h-4 text-indigo-400" />
              Upload & Select Dataset
            </h2>
            <p className="text-slate-400 text-xs">Load preloaded gold standards or import a custom CSV file to explore predictive models</p>
          </div>

          {/* Preloaded Grid */}
          <div>
            <label className="block text-[9px] font-mono font-bold text-slate-500 uppercase mb-2">Preloaded Dataset Options</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" id="preloaded-datasets-grid">
              {[
                { key: "Titanic", label: "Titanic Survival", desc: "Mixed Columns (Classification)" },
                { key: "Iris", label: "Iris Flowers", desc: "Measurements (Clustering / Classification)" },
                { key: "CaliforniaHousing", label: "California Housing", desc: "Continuous Values (Regression)" },
                { key: "MallCustomers", label: "Mall Customer Segments", desc: "Demographics (Clustering)" },
              ].map((item) => {
                const isActive = activeDataset.name.toLowerCase().includes(item.key.toLowerCase());
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleDatasetSelect(item.key)}
                    className={`p-3 text-left rounded-xl border transition-all duration-150 flex flex-col justify-between h-20 group cursor-pointer ${
                      isActive
                        ? "bg-indigo-600/15 border-indigo-500/50 shadow-sm"
                        : "bg-slate-950/40 border-slate-850 hover:bg-slate-950/60 hover:border-slate-800"
                    }`}
                  >
                    <div className="flex justify-between items-start w-full gap-1">
                      <span className={`font-sans text-xs font-semibold ${isActive ? "text-indigo-300" : "text-slate-300"}`}>
                        {item.label}
                      </span>
                      {isActive && (
                        <span className="w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center text-white p-0.5 shrink-0">
                          <Check className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] text-slate-500 font-mono truncate leading-none mt-1 group-hover:text-slate-400">
                      {item.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Drag & Drop uploader */}
          <div>
            <label className="block text-[9px] font-mono font-bold text-slate-500 uppercase mb-2">Or Upload Custom File</label>
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 h-36 ${
                dragActive
                  ? "border-indigo-500 bg-indigo-950/20"
                  : "border-slate-800 hover:border-slate-700 bg-slate-950/20"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                className="hidden"
              />
              <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-850 flex items-center justify-center text-indigo-400 shadow-sm">
                <Upload className="w-4 h-4" />
              </div>
              <div>
                <p className="text-slate-200 font-sans text-xs font-semibold">Upload custom CSV</p>
                <p className="text-slate-500 text-[9px] mt-1">Drag & drop or click to browse</p>
              </div>
            </div>
          </div>

          {/* Synthetic Data Generator Section */}
          <div className="border-t border-slate-800/60 pt-5 flex flex-col gap-4">
            <div>
              <label className="block text-[9px] font-mono font-bold text-indigo-400 uppercase mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-indigo-400 animate-pulse" />
                Or Generate High-Fidelity Synthetic Dataset
              </label>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Need a specific mathematical sandbox? Instantly generate high-quality simulated data tailored for predictive modeling, regression, or anomaly algorithms.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[9px] font-mono font-bold text-slate-500 uppercase mb-1.5">Scenario Type</label>
                <select
                  value={synthType}
                  onChange={(e) => setSynthType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg py-1.5 px-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="churn">E-Commerce Churn (Classification)</option>
                  <option value="medical">Medical Cost (Regression)</option>
                  <option value="energy">Smart Energy IoT (Anomalies)</option>
                  <option value="fraud">CC Transactions (Fraud Detection)</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-mono font-bold text-slate-500 uppercase mb-1.5">Volume Size</label>
                <select
                  value={synthRows}
                  onChange={(e) => setSynthRows(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg py-1.5 px-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="150">150 Rows (Fast Play)</option>
                  <option value="500">500 Rows (Balanced)</option>
                  <option value="1200">1200 Rows (Production Size)</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-mono font-bold text-slate-500 uppercase mb-1.5">Outlier / Noise</label>
                <select
                  value={synthNoise}
                  onChange={(e) => setSynthNoise(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg py-1.5 px-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="0">0% (Clean Math)</option>
                  <option value="0.05">5% (Subtle Noise)</option>
                  <option value="0.15">15% (Heavy Outliers)</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleGenerateSyntheticDataset(synthType, synthRows, synthNoise)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate & Load {synthType === "churn" ? "Telecom Churn" : synthType === "medical" ? "Medical Cost" : synthType === "energy" ? "Smart Energy IoT" : "Transaction Fraud"} Dataset</span>
            </button>
          </div>

          {error && (
            <div className="bg-rose-950/20 border border-rose-900/40 text-rose-300 p-3 rounded-xl text-xs flex gap-2">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-emerald-950/20 border border-emerald-900/40 text-emerald-300 p-3 rounded-xl text-xs flex gap-2">
              <Check className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-400" />
              <span>{success}</span>
            </div>
          )}
        </div>

        {/* Right side: Info Card */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 shadow-md flex flex-col gap-4 h-full justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-300 font-sans text-xs font-semibold">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Active Dataset Schema</span>
              </div>

              <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-850 flex flex-col gap-3 font-mono text-[11px] text-slate-400">
                <div>
                  <span className="text-slate-500 block text-[9px] font-sans">Name</span>
                  <span className="font-sans font-medium text-slate-200 block truncate">{activeDataset.name}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div>
                    <span className="text-slate-500 block text-[9px] font-sans">Row Count</span>
                    <span className="text-slate-200 font-semibold font-mono">{activeDataset.rows.length} rows</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] font-sans">Column Count</span>
                    <span className="text-slate-200 font-semibold font-mono">{activeDataset.columns.length} cols</span>
                  </div>
                </div>
              </div>

              {/* List columns */}
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider block">Features & Target Inferred</span>
                <div className="max-h-48 overflow-y-auto border border-slate-850 rounded-xl p-2 bg-slate-950/20 flex flex-wrap gap-1.5 scrollbar-thin">
                  {activeDataset.metadata.map((meta) => (
                    <span
                      key={meta.name}
                      className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300 font-mono flex items-center gap-1.5"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${meta.type === "numeric" ? "bg-amber-400" : meta.type === "boolean" ? "bg-indigo-400" : "bg-teal-400"}`} />
                      {meta.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={onProceed}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-xs font-semibold py-2.5 rounded-xl shadow-lg shadow-emerald-600/10 hover:shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-4"
            >
              <span>Proceed to Data Validation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: FULL-WIDTH INTERACTIVE DATASET EXPLORER AND EXPORT CENTER */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-md flex flex-col gap-6" id="dataset-explorer-section">
        
        {/* Header Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-850 pb-5">
          <div>
            <h3 className="font-display font-semibold text-white text-base flex items-center gap-2">
              <Table2 className="w-4 h-4 text-emerald-400" />
              Interactive Dataset Explorer
            </h3>
            <p className="text-slate-400 text-xs mt-0.5">
              Live view of the worked-on dataset. Cleaned, engineered, and preprocessed states are updated here in real-time.
            </p>
          </div>

          {/* Export Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase mr-1">Export Active Cleaned Data:</span>
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-200 hover:text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
              title="Download RFC-4180 Escaped Clean CSV File"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>CSV</span>
            </button>
            <button
              onClick={handleExportJSON}
              className="px-3 py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-200 hover:text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
              title="Download Cleaned Structured JSON Array"
            >
              <FileJson className="w-3.5 h-3.5 text-yellow-400" />
              <span>JSON</span>
            </button>
            <button
              onClick={handleExportExcel}
              className="px-3 py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-200 hover:text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
              title="Download Authentic Excel Workbook File"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Excel</span>
            </button>
          </div>
        </div>

        {/* Dynamic Display controls & Limit settings */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          {/* Row count selectors */}
          <div className="md:col-span-5 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-xs">Rows to Display:</span>
              <select
                value={rowsPerPage === -1 ? "all" : visibleColumns.length && [5, 10, 25, 50, 100, 250].includes(rowsPerPage) ? String(rowsPerPage) : "custom"}
                onChange={(e) => handleRowsPerPageDropdownChange(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 py-1.5 px-2.5 cursor-pointer font-semibold focus:outline-none focus:border-indigo-500"
              >
                <option value="5">5 rows</option>
                <option value="10">10 rows</option>
                <option value="25">25 rows</option>
                <option value="50">50 rows</option>
                <option value="100">100 rows</option>
                <option value="250">250 rows</option>
                <option value="all">All rows ({activeDataset.rows.length})</option>
                <option value="custom">Custom count...</option>
              </select>
            </div>

            {/* Custom Input (jetna rows mai dakna chahta ho to oh enter kare) */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-slate-500">Custom count:</span>
              <input
                type="number"
                min="1"
                max={activeDataset.rows.length}
                value={customRowsInput}
                onChange={(e) => handleCustomRowsChange(e.target.value)}
                placeholder="e.g. 15"
                className="w-16 bg-slate-950 border border-slate-800 rounded-lg py-1 px-2 text-xs text-slate-200 text-center font-semibold focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Search bar */}
          <div className="md:col-span-4 relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search across all columns..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 pl-9 pr-3 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Column Toggle Controls */}
          <div className="md:col-span-3 flex justify-end">
            <button
              onClick={() => setShowColumnsConfig(!showColumnsConfig)}
              className={`px-3 py-1.5 border rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                showColumnsConfig
                  ? "bg-indigo-600/10 border-indigo-500/50 text-indigo-400"
                  : "bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Columns Toggle ({visibleColumns.length}/{activeDataset.columns.length})</span>
            </button>
          </div>
        </div>

        {/* Column config drawer */}
        {showColumnsConfig && (
          <div className="bg-slate-950/50 border border-slate-850 p-4 rounded-xl animate-fade-in space-y-2">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">Toggle Table Feature Visibility</span>
            <div className="flex flex-wrap gap-2">
              {activeDataset.columns.map((col) => {
                const isVisible = visibleColumns.includes(col);
                const colMeta = activeDataset.metadata.find(m => m.name === col);
                return (
                  <button
                    key={col}
                    onClick={() => toggleColumnVisibility(col)}
                    className={`px-2.5 py-1 text-[10px] rounded-md font-mono border transition flex items-center gap-1.5 cursor-pointer ${
                      isVisible
                        ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-300 font-semibold"
                        : "bg-slate-950/20 border-slate-900 text-slate-500"
                    }`}
                  >
                    {isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    <span>{col}</span>
                    <span className={`w-1 h-1 rounded-full ${colMeta?.type === "numeric" ? "bg-amber-400" : "bg-teal-400"}`} />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Live Data Table Container */}
        <div className="border border-slate-850 rounded-xl overflow-hidden bg-slate-950/20">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left border-collapse table-auto">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-850">
                  <th className="px-4 py-3 text-[10px] font-mono font-bold text-slate-400 w-12 text-center">#</th>
                  {activeDataset.columns
                    .filter(col => visibleColumns.includes(col))
                    .map((col) => {
                      const isSorted = sortColumn === col;
                      return (
                        <th
                          key={col}
                          onClick={() => handleSort(col)}
                          className={`px-4 py-3 text-[10px] font-mono font-bold text-slate-400 cursor-pointer hover:bg-slate-900 transition-all select-none ${
                            isSorted ? "bg-slate-900 text-indigo-300" : ""
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="truncate">{col}</span>
                            <ArrowUpDown className={`w-3 h-3 shrink-0 ${isSorted ? "text-indigo-400" : "text-slate-600"}`} />
                          </div>
                        </th>
                      );
                    })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/60 text-slate-300 text-xs">
                {paginatedRows.length === 0 ? (
                  <tr>
                    <td colSpan={visibleColumns.length + 1} className="px-4 py-12 text-center text-slate-500 italic font-mono">
                      No matching records found in this search slice.
                    </td>
                  </tr>
                ) : (
                  paginatedRows.map((row, index) => {
                    const globalIndex = (currentPage - 1) * (rowsPerPage === -1 ? sortedRows.length : rowsPerPage) + index + 1;
                    return (
                      <tr key={index} className="hover:bg-slate-900/40 transition even:bg-slate-950/10">
                        <td className="px-4 py-2.5 text-[10px] font-mono text-slate-500 text-center border-r border-slate-850/40 bg-slate-950/20">
                          {globalIndex}
                        </td>
                        {activeDataset.columns
                          .filter(col => visibleColumns.includes(col))
                          .map((col) => {
                            const val = row[col];
                            return (
                              <td key={col} className="px-4 py-2.5 font-sans truncate max-w-[200px]" title={String(val)}>
                                {val === null || val === undefined ? (
                                  <span className="text-slate-600 italic text-[10px] font-mono">null</span>
                                ) : typeof val === "boolean" ? (
                                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                                    val ? "bg-emerald-950/30 text-emerald-400 border border-emerald-900/30" : "bg-rose-950/30 text-rose-400 border border-rose-900/30"
                                  }`}>
                                    {String(val)}
                                  </span>
                                ) : (
                                  String(val)
                                )}
                              </td>
                            );
                          })}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer stats & Pagination controls */}
          <div className="bg-slate-950/60 px-4 py-3 flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-slate-850 text-xs text-slate-400 font-mono">
            <div>
              <span>Showing </span>
              <span className="text-slate-200 font-semibold font-sans">{paginatedRows.length}</span>
              <span> of </span>
              <span className="text-slate-200 font-semibold font-sans">{sortedRows.length}</span>
              <span> records</span>
              {searchQuery && (
                <span className="text-indigo-400 text-[10px] ml-1">
                  (filtered from {activeDataset.rows.length} total)
                </span>
              )}
            </div>

            {rowsPerPage !== -1 && totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-1 rounded bg-slate-900 border border-slate-850 hover:bg-slate-850 disabled:opacity-30 disabled:hover:bg-slate-900 text-slate-300 transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2 text-slate-300 text-[11px]">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1 rounded bg-slate-900 border border-slate-850 hover:bg-slate-850 disabled:opacity-30 disabled:hover:bg-slate-900 text-slate-300 transition cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Informative Synchronicity Note */}
        <div className="bg-indigo-950/15 border border-indigo-900/40 p-4 rounded-xl flex gap-3">
          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5 animate-pulse" />
          <div className="text-xs text-slate-400 leading-normal">
            <strong className="text-indigo-300 font-semibold">Real-Time Data Synchronicity:</strong> Since this sandbox implements a full-stack active state engine, any missing value cleaning, duplicate removals, outlier trimming, continuous feature scaling, or custom engineered columns that you create in the other modules will instantly reflect in this explorer table. You can re-visit this page at any step in your data science pipeline to preview the active state and download your completely cleaned, high-fidelity dataset as a CSV, JSON, or Excel file!
          </div>
        </div>

      </div>

    </div>
  );
}

