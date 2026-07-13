import React, { useState, useRef } from "react";
import { Dataset } from "../types";
import { preloadedDatasets, buildDataset } from "../utils/datasets";
import { Upload, FileSpreadsheet, Layers, Info, Check, Sparkles } from "lucide-react";

interface DatasetSelectorProps {
  activeDataset: Dataset;
  onDatasetChange: (dataset: Dataset) => void;
}

export default function DatasetSelector({ activeDataset, onDatasetChange }: DatasetSelectorProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDatasetSelect = (key: string) => {
    setError(null);
    const loadFn = preloadedDatasets[key];
    if (loadFn) {
      onDatasetChange(loadFn());
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

  return (
    <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-md flex flex-col gap-6" id="dataset-selector-card">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Layers className="w-4 h-4 text-indigo-400" id="dataset-manager-icon" />
          <h2 className="font-display font-semibold text-white text-base" id="dataset-manager-title">Dataset Catalog</h2>
        </div>
        <p className="text-slate-400 text-xs" id="dataset-manager-desc">Choose a gold-standard dataset or drop your own file to start analysis</p>
      </div>

      {/* Preloaded buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" id="preloaded-datasets-grid">
        {[
          { key: "Titanic", label: "Titanic Survival", desc: "Mixed / Logistic Sandbox" },
          { key: "Iris", label: "Iris Flowers", desc: "Clustering / Multi-class" },
          { key: "CaliforniaHousing", label: "CA Housing Prices", desc: "Regression Sandbox" },
          { key: "MallCustomers", label: "Mall Customer Segments", desc: "Clustering Sandbox" },
        ].map((item) => {
          const isActive = activeDataset.name.toLowerCase().includes(item.key.toLowerCase());
          return (
            <button
              key={item.key}
              onClick={() => handleDatasetSelect(item.key)}
              id={`dataset-btn-${item.key}`}
              className={`p-3 text-left rounded-xl border transition-all duration-200 flex flex-col justify-between group h-20 cursor-pointer ${
                isActive
                  ? "bg-indigo-600/10 border-indigo-500/40 shadow-sm"
                  : "bg-slate-950/40 border-slate-800/60 hover:bg-slate-950/60 hover:border-slate-800"
              }`}
            >
              <div className="flex justify-between items-start w-full gap-1">
                <span className={`font-sans text-xs font-semibold ${isActive ? "text-indigo-300" : "text-slate-300"}`}>
                  {item.label}
                </span>
                {isActive && (
                  <span className="w-3.5 h-3.5 bg-indigo-600 rounded-full flex items-center justify-center text-white p-0.5 shrink-0">
                    <Check className="w-2.5 h-2.5" />
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-500 font-mono tracking-tight leading-none group-hover:text-slate-400">
                {item.desc}
              </span>
            </button>
          );
        })}
      </div>

      {/* Drag & Drop uploader */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        id="file-dropzone"
        className={`border border-dashed rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
          dragActive
            ? "border-indigo-500 bg-indigo-950/20"
            : "border-slate-800/80 hover:border-slate-700 bg-slate-950/20"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
          className="hidden"
          id="csv-file-input"
        />
        <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400">
          <Upload className="w-5 h-5" />
        </div>
        <div>
          <p className="text-slate-200 font-sans text-xs font-semibold">Upload custom CSV</p>
          <p className="text-slate-500 text-[10px] mt-1">Drag & drop or browse from local drive</p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-950/30 border border-rose-900/50 text-rose-300 p-3 rounded-xl text-xs flex gap-2" id="upload-error-alert">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Active dataset statistics brief */}
      <div className="bg-slate-950/30 rounded-xl p-4 border border-slate-800/80 flex flex-col gap-3" id="dataset-brief-card">
        <div className="flex items-center gap-2 text-slate-300 font-sans text-xs font-semibold">
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>Active Dataset Brief</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-400 font-mono text-[11px]" id="dataset-brief-metrics">
          <div>
            <span className="text-slate-500 block text-[9px] font-sans">Name</span>
            <span className="font-sans font-medium text-slate-200 break-all truncate block">{activeDataset.name}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[9px] font-sans">Row Count</span>
            <span className="text-slate-200 font-semibold">{activeDataset.rows.length} records</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[9px] font-sans">Dimensions</span>
            <span className="text-slate-200 font-semibold">
              {activeDataset.columns.length} columns
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[9px] font-sans">Data Load</span>
            <span className="text-emerald-400 flex items-center gap-1 font-sans text-[10px] font-semibold">
              <Sparkles className="w-3 h-3 text-emerald-500" /> VALIDATED
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
