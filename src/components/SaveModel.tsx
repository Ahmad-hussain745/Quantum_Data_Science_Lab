import React, { useState, useEffect } from "react";
import { SavedModelRun, Dataset } from "../types";
import * as XLSX from "xlsx";
import { 
  AlertCircle, 
  ArrowRight, 
  Download, 
  Save, 
  HardDrive, 
  Trash2, 
  CheckCircle,
  FileSpreadsheet,
  FileJson,
  Sparkles,
  Layers
} from "lucide-react";

interface SaveModelProps {
  activeChampion: SavedModelRun | null;
  activeDataset: Dataset;
  onProceed: () => void;
}

export default function SaveModel({ activeChampion, activeDataset, onProceed }: SaveModelProps) {
  const [modelLabel, setModelLabel] = useState("");
  const [description, setDescription] = useState("");
  const [savedModelsList, setSavedModelsList] = useState<SavedModelRun[]>([]);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sync label when activeChampion changes
  useEffect(() => {
    if (activeChampion) {
      setModelLabel(activeChampion.name.replace(/\s+/g, "_") + "_saved");
      setDescription(`Locked model trained on target variable ${activeChampion.target} with predictors: ${activeChampion.predictors.join(", ")}`);
    }
  }, [activeChampion]);

  // Load saved models from localstorage on load
  const loadSavedModels = () => {
    try {
      const stored = localStorage.getItem("quantum_ds_saved_models");
      if (stored) {
        setSavedModelsList(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load local saved models:", e);
    }
  };

  useEffect(() => {
    loadSavedModels();
  }, []);

  // Save Model to Localstorage
  const handleSaveModel = () => {
    if (!activeChampion || !modelLabel) return;

    const runToSave: SavedModelRun = {
      ...activeChampion,
      name: modelLabel,
      description: description,
      timestamp: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    try {
      const currentList = [...savedModelsList];
      // Avoid duplicate names by filtering out existing ones
      const filtered = currentList.filter(m => m.name !== modelLabel);
      const updated = [runToSave, ...filtered];

      localStorage.setItem("quantum_ds_saved_models", JSON.stringify(updated));
      setSavedModelsList(updated);
      setSuccess(`Model "${modelLabel}" serialized and stored in local workspace storage!`);
      setTimeout(() => setSuccess(null), 4000);
    } catch (e) {
      console.error("Failed to save model:", e);
    }
  };

  // Download Weights Config JSON
  const handleDownloadJSON = () => {
    if (!activeChampion) return;

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activeChampion, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${modelLabel || "weights_config"}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Delete saved model
  const handleDeleteModel = (id: string) => {
    const updated = savedModelsList.filter((m) => m.id !== id);
    localStorage.setItem("quantum_ds_saved_models", JSON.stringify(updated));
    setSavedModelsList(updated);
  };

  // --- CLEAN DATA DATASET EXPORT ENGINE ---
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

      setSuccess(`Successfully exported cleaned active dataset to CSV! (${activeDataset.rows.length} rows)`);
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError("Failed to export to CSV: " + err.message);
      setTimeout(() => setError(null), 4000);
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

      setSuccess(`Successfully exported cleaned active dataset to JSON! (${activeDataset.rows.length} rows)`);
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError("Failed to export to JSON: " + err.message);
      setTimeout(() => setError(null), 4000);
    }
  };

  const handleExportExcel = () => {
    try {
      const worksheet = XLSX.utils.json_to_sheet(activeDataset.rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Cleaned_Dataset");
      
      const cleanFileName = activeDataset.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      XLSX.writeFile(workbook, `${cleanFileName}_cleaned.xlsx`);

      setSuccess(`Successfully exported cleaned active dataset to Excel workbook! (${activeDataset.rows.length} rows)`);
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError("Failed to export to Excel: " + err.message);
      setTimeout(() => setError(null), 4000);
    }
  };

  return (
    <div className="flex flex-col gap-6" id="save-model-module">
      
      {/* SECTION 1: CLEAN DATASET EXPORT PANEL (MAIN REQUESTED FEATURE) */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-md flex flex-col gap-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="font-display font-semibold text-white text-base flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              Clean Dataset Export Center
            </h2>
            <p className="text-slate-400 text-xs">Download your fully cleaned, preprocessed, and engineered active dataset in high-fidelity formats</p>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 px-3.5 py-1.5 rounded-xl text-xs font-mono text-slate-300">
            Active: <strong className="text-white">{activeDataset.name}</strong> ({activeDataset.rows.length} rows × {activeDataset.columns.length} columns)
          </div>
        </div>

        {error && (
          <div className="bg-rose-950/20 border border-rose-900/40 text-rose-300 p-3 rounded-xl text-xs flex gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* CSV Download Card */}
          <div className="bg-slate-950/40 border border-slate-850 p-5 rounded-xl hover:border-slate-700 transition flex flex-col justify-between h-40">
            <div>
              <span className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mb-3">
                <Download className="w-3.5 h-3.5 text-indigo-400" />
              </span>
              <h4 className="text-slate-200 text-xs font-semibold">Standard CSV Format</h4>
              <p className="text-slate-500 text-[10px] mt-1">RFC-4180 compliant comma-separated file with full quotes escaping.</p>
            </div>
            <button
              onClick={handleExportCSV}
              className="w-full mt-3 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Download CSV File</span>
            </button>
          </div>

          {/* JSON Download Card */}
          <div className="bg-slate-950/40 border border-slate-850 p-5 rounded-xl hover:border-slate-700 transition flex flex-col justify-between h-40">
            <div>
              <span className="w-7 h-7 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center mb-3">
                <FileJson className="w-3.5 h-3.5 text-yellow-400" />
              </span>
              <h4 className="text-slate-200 text-xs font-semibold">Structured JSON Array</h4>
              <p className="text-slate-500 text-[10px] mt-1">Beautifully structured JSON array representing high-fidelity rows and cells.</p>
            </div>
            <button
              onClick={handleExportJSON}
              className="w-full mt-3 px-3 py-1.5 bg-yellow-600/10 hover:bg-yellow-600/20 border border-yellow-500/30 text-yellow-400 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Download JSON Data</span>
            </button>
          </div>

          {/* Excel Download Card */}
          <div className="bg-slate-950/40 border border-slate-850 p-5 rounded-xl hover:border-slate-700 transition flex flex-col justify-between h-40">
            <div>
              <span className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-3">
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              </span>
              <h4 className="text-slate-200 text-xs font-semibold">Authentic Excel Workbook</h4>
              <p className="text-slate-500 text-[10px] mt-1">Properly formatted Excel worksheet file ready to be opened in Microsoft Office.</p>
            </div>
            <button
              onClick={handleExportExcel}
              className="w-full mt-3 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Download Excel File</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: MODEL WEIGHTS SERIALIZATION & LOCAL STORAGE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Save Settings Form */}
        <div className="lg:col-span-7 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-md flex flex-col gap-6">
          <div>
            <h2 className="font-display font-semibold text-white text-base flex items-center gap-2">
              <Save className="w-4 h-4 text-indigo-400" />
              Serialize & Persist Model Weights
            </h2>
            <p className="text-slate-400 text-xs">Save the current weights, biases, and optimizer configurations to browser storage or download JSON matrices</p>
          </div>

          {success && (
            <div className="bg-emerald-950/20 border border-emerald-900/40 text-emerald-300 p-3.5 rounded-xl text-xs flex gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{success}</span>
            </div>
          )}

          {!activeChampion ? (
            <div className="bg-slate-950/30 border border-dashed border-slate-800 rounded-xl p-8 text-center flex flex-col items-center gap-3">
              <AlertCircle className="w-5 h-5 text-slate-500 animate-pulse" />
              <div>
                <h4 className="text-slate-300 text-xs font-semibold">No Active Model to Serialize</h4>
                <p className="text-slate-500 text-[10px] mt-1 max-w-xs leading-normal">
                  To save and download trained neural models or prediction matrices, first go to the AutoML Training or Deep Learning modules and click "Train Model", then select it as the champion.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-[8px] font-mono font-bold text-slate-500 uppercase mb-1">Model Namespace Name</label>
                <input
                  type="text"
                  value={modelLabel}
                  onChange={(e) => setModelLabel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-slate-200 font-sans focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[8px] font-mono font-bold text-slate-500 uppercase mb-1">Model Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-slate-200 font-sans focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                <button
                  onClick={handleSaveModel}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <HardDrive className="w-4 h-4" />
                  <span>Save to Workspace DB</span>
                </button>

                <button
                  onClick={handleDownloadJSON}
                  className="bg-slate-950 hover:bg-slate-900 text-slate-200 border border-slate-850 font-sans text-xs font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Weights JSON</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Persistent Registry List */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 shadow-md flex flex-col gap-4 h-full justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-300 font-sans text-xs font-semibold">
                <HardDrive className="w-4 h-4 text-emerald-400" />
                <span>Workspace Local Storage Registry</span>
              </div>

              <div className="max-h-[220px] overflow-y-auto space-y-2 scrollbar-thin" id="saved-models-registry-list">
                {savedModelsList.length === 0 ? (
                  <p className="text-slate-500 text-center py-8 text-xs italic font-sans">
                    No serialized models found in this local browser registry.
                  </p>
                ) : (
                  savedModelsList.map((model) => (
                    <div key={model.id} className="bg-slate-950/40 border border-slate-850 rounded-xl p-3 flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0 font-sans">
                        <span className="font-semibold text-xs text-slate-200 block truncate" title={model.name}>{model.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono block mt-0.5 truncate">{model.description}</span>
                        <span className="text-[9px] text-slate-500 font-mono block mt-1.5">{model.timestamp}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteModel(model.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 transition cursor-pointer shrink-0"
                        title="Remove serialized config"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <button
              onClick={onProceed}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-xs font-semibold py-2.5 rounded-xl shadow-lg shadow-emerald-600/10 hover:shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-4"
            >
              <span>Proceed to Interactive Prediction</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
