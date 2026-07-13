import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import * as XLSX from "xlsx";
import { Dataset } from "../types";
import {
  RefreshCw,
  FileCode,
  Binary,
  Download,
  Search,
  FileText,
  Sliders,
  Upload,
  Clipboard,
  Check,
  FileSpreadsheet,
  Database,
  Code,
  Table,
  Plus,
  Trash,
  History,
  ArrowRightLeft,
  Settings2,
  Copy,
  Info,
  Sparkles
} from "lucide-react";

interface DataConversionProps {
  dataset?: Dataset;
}

interface ConversionHistoryItem {
  id: string;
  timestamp: string;
  fileName: string;
  fromFormat: string;
  toFormat: string;
  rowCount: number;
  colCount: number;
  sizeBytes: number;
}

export default function DataConversion({ dataset }: DataConversionProps) {
  // Input & Output states
  const [inputText, setInputText] = useState<string>("");
  const [outputText, setOutputText] = useState<string>("");
  
  // Format configurations
  const [inputFormat, setInputFormat] = useState<string>("csv");
  const [outputFormat, setOutputFormat] = useState<string>("json");
  const [csvDelimiter, setCsvDelimiter] = useState<string>(",");
  const [jsonIndent, setJsonIndent] = useState<number>(2);
  const [sqlTableName, setSqlTableName] = useState<string>("my_table");
  const [includeHeaders, setIncludeHeaders] = useState<boolean>(true);

  // Parse results for preview
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // UI state
  const [activeTab, setActiveTab] = useState<"converter" | "batch" | "history">("converter");
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [conversionTimeMs, setConversionTimeMs] = useState<number | null>(null);
  const [history, setHistory] = useState<ConversionHistoryItem[]>([]);

  // Drag and drop / file upload state
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Batch upload state
  const [batchFiles, setBatchFiles] = useState<{ id: string; name: string; size: number; status: "pending" | "done" | "error"; format: string }[]>([]);

  // Load App's active dataset if present
  const handleLoadActiveDataset = () => {
    if (!dataset || !dataset.rows || dataset.rows.length === 0) {
      setErrorMsg("No active dataset loaded in workspace.");
      return;
    }
    
    try {
      if (inputFormat === "json") {
        setInputText(JSON.stringify(dataset.rows, null, jsonIndent));
      } else {
        // Convert dataset back to CSV
        const headers = dataset.columns || Object.keys(dataset.rows[0]);
        const csvRows = [headers.join(csvDelimiter)];
        
        dataset.rows.forEach(row => {
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
        
        setInputText(csvRows.join("\n"));
      }
      setSuccessMsg(`Successfully loaded active workspace dataset: "${dataset.name}"`);
      setErrorMsg(null);
    } catch (e: any) {
      setErrorMsg("Failed to load active workspace dataset: " + e.message);
    }
  };

  // Run initial auto-load when the dataset props or layout changes
  useEffect(() => {
    if (dataset && inputText === "") {
      handleLoadActiveDataset();
    }
  }, [dataset]);

  // Robust parsing of CSV strings (correctly respects quotes and commas inside quotes)
  const parseCSV = (text: string, delimiter: string = ","): any[] => {
    const lines = text.split(/\r?\n/);
    if (lines.length === 0 || !lines[0].trim()) return [];

    const result: any[] = [];
    const headers: string[] = [];

    // Helper to parse line respecting quotes
    const parseLine = (line: string): string[] => {
      const row: string[] = [];
      let insideQuote = false;
      let currentVal = "";

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          insideQuote = !insideQuote;
        } else if (char === delimiter && !insideQuote) {
          row.push(currentVal.trim());
          currentVal = "";
        } else {
          currentVal += char;
        }
      }
      row.push(currentVal.trim());
      return row.map(v => v.replace(/^"|"$/g, '').replace(/""/g, '"'));
    };

    const firstRow = parseLine(lines[0]);
    if (firstRow.length === 0) return [];

    firstRow.forEach((h, i) => {
      headers.push(h || `Column_${i + 1}`);
    });

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const values = parseLine(lines[i]);
      const obj: any = {};
      headers.forEach((header, index) => {
        const val = values[index] !== undefined ? values[index] : "";
        // Try to parse numbers
        if (val !== "" && !isNaN(Number(val))) {
          obj[header] = Number(val);
        } else if (val.toLowerCase() === "true") {
          obj[header] = true;
        } else if (val.toLowerCase() === "false") {
          obj[header] = false;
        } else {
          obj[header] = val;
        }
      });
      result.push(obj);
    }

    return result;
  };

  // Convert to target format
  const handleConvert = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    if (!inputText.trim()) {
      setErrorMsg("Please paste or upload some input data first.");
      return;
    }

    const startTime = performance.now();
    try {
      let dataToConvert: any[] = [];

      // 1. Parsing input based on selected format
      if (inputFormat === "json") {
        try {
          const parsed = JSON.parse(inputText);
          dataToConvert = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e: any) {
          throw new Error("Invalid JSON input: " + e.message);
        }
      } else if (inputFormat === "csv") {
        dataToConvert = parseCSV(inputText, csvDelimiter);
        if (dataToConvert.length === 0) {
          throw new Error("Empty or invalid CSV input.");
        }
      } else if (inputFormat === "xml") {
        dataToConvert = parseXMLToJSON(inputText);
      } else {
        throw new Error("Please upload an Excel file directly using the file picker below.");
      }

      // Update state for visual table preview
      if (dataToConvert.length > 0) {
        const headers = Object.keys(dataToConvert[0]);
        setParsedHeaders(headers);
        setParsedData(dataToConvert);
      } else {
        setParsedHeaders([]);
        setParsedData([]);
      }

      // 2. Generating output based on selected format
      let resultStr = "";
      if (outputFormat === "json") {
        resultStr = JSON.stringify(dataToConvert, null, jsonIndent);
      } else if (outputFormat === "csv") {
        if (dataToConvert.length === 0) {
          resultStr = "";
        } else {
          const headers = Object.keys(dataToConvert[0]);
          const csvLines = [headers.join(csvDelimiter)];
          dataToConvert.forEach(row => {
            const line = headers.map(h => {
              const val = row[h];
              if (val === null || val === undefined) return "";
              const str = String(val);
              if (str.includes(csvDelimiter) || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
              }
              return str;
            });
            csvLines.push(line.join(csvDelimiter));
          });
          resultStr = csvLines.join("\n");
        }
      } else if (outputFormat === "excel") {
        resultStr = "[BINARY WORKBOOK DATA GENERATED] - Click 'Download Excel File' below to save directly as authentic .xlsx workbook.";
      } else if (outputFormat === "xml") {
        resultStr = convertJSONToXML(dataToConvert);
      } else if (outputFormat === "markdown") {
        resultStr = convertJSONToMarkdown(dataToConvert);
      } else if (outputFormat === "sql") {
        resultStr = convertJSONToSQL(dataToConvert, sqlTableName);
      } else if (outputFormat === "html") {
        resultStr = convertJSONToHTML(dataToConvert);
      }

      setOutputText(resultStr);
      setConversionTimeMs(Math.round(performance.now() - startTime));

      // Append to local audit history
      const sizeBytes = new Blob([resultStr]).size;
      const historyItem: ConversionHistoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        fileName: `converted_${Date.now().toString().slice(-4)}`,
        fromFormat: inputFormat.toUpperCase(),
        toFormat: outputFormat.toUpperCase(),
        rowCount: dataToConvert.length,
        colCount: dataToConvert.length > 0 ? Object.keys(dataToConvert[0]).length : 0,
        sizeBytes
      };
      setHistory(prev => [historyItem, ...prev].slice(0, 15));
      setSuccessMsg(`Conversion completed successfully in ${Math.round(performance.now() - startTime)}ms!`);

    } catch (e: any) {
      setErrorMsg(e.message || "An unexpected conversion error occurred.");
      setOutputText("");
    }
  };

  // XML Parser (Basic client-side XML to JSON parsing helper)
  const parseXMLToJSON = (xmlStr: string): any[] => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlStr, "text/xml");
      const errorNode = xmlDoc.querySelector("parsererror");
      if (errorNode) {
        throw new Error(errorNode.textContent || "XML parsing error");
      }

      const rows: any[] = [];
      // Look for repeating child nodes (e.g., <row>, <item>, <record> or child nodes of root)
      const root = xmlDoc.documentElement;
      const items = root.children;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const obj: any = {};
        const colNodes = item.children;
        
        if (colNodes.length > 0) {
          for (let j = 0; j < colNodes.length; j++) {
            const col = colNodes[j];
            const val = col.textContent || "";
            if (val !== "" && !isNaN(Number(val))) {
              obj[col.nodeName] = Number(val);
            } else if (val.toLowerCase() === "true") {
              obj[col.nodeName] = true;
            } else if (val.toLowerCase() === "false") {
              obj[col.nodeName] = false;
            } else {
              obj[col.nodeName] = val;
            }
          }
          rows.push(obj);
        } else {
          // Flatten text elements if direct parents
          const val = item.textContent || "";
          obj["value"] = val;
          rows.push(obj);
        }
      }
      return rows;
    } catch (e: any) {
      throw new Error("Invalid XML input format: " + e.message);
    }
  };

  // Convert JSON to XML helper
  const convertJSONToXML = (arr: any[]): string => {
    if (arr.length === 0) return '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n</root>';
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n';
    arr.forEach(row => {
      xml += '  <row>\n';
      Object.keys(row).forEach(key => {
        const safeKey = key.replace(/[^a-zA-Z0-9_]/g, "_");
        const val = row[key] === null || row[key] === undefined ? "" : escapeXml(String(row[key]));
        xml += `    <${safeKey}>${val}</${safeKey}>\n`;
      });
      xml += '  </row>\n';
    });
    xml += '</root>';
    return xml;
  };

  const escapeXml = (unsafe: string): string => {
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    });
  };

  // Convert JSON to Markdown table
  const convertJSONToMarkdown = (arr: any[]): string => {
    if (arr.length === 0) return "No data available";
    const headers = Object.keys(arr[0]);
    let md = `| ${headers.join(" | ")} |\n`;
    md += `| ${headers.map(() => "---").join(" | ")} |\n`;
    
    arr.forEach(row => {
      const line = headers.map(h => {
        const val = row[h];
        return val === null || val === undefined ? "" : String(val).replace(/\|/g, "\\|");
      });
      md += `| ${line.join(" | ")} |\n`;
    });
    return md;
  };

  // Convert JSON to SQL Insert script
  const convertJSONToSQL = (arr: any[], tableName: string): string => {
    if (arr.length === 0) return `-- No data to generate SQL inserts`;
    const headers = Object.keys(arr[0]);
    const columnsStr = headers.map(h => `\`${h}\``).join(", ");
    
    const lines = arr.map(row => {
      const valuesStr = headers.map(h => {
        const val = row[h];
        if (val === null || val === undefined) return "NULL";
        if (typeof val === "number") return val;
        if (typeof val === "boolean") return val ? 1 : 0;
        return `'${String(val).replace(/'/g, "''")}'`;
      }).join(", ");
      return `INSERT INTO \`${tableName}\` (${columnsStr}) VALUES (${valuesStr});`;
    });
    
    return `-- Table: ${tableName}\n-- Generated Rows: ${arr.length}\n\n` + lines.join("\n");
  };

  // Convert JSON to HTML Table
  const convertJSONToHTML = (arr: any[]): string => {
    if (arr.length === 0) return "<table></table>";
    const headers = Object.keys(arr[0]);
    let html = `<table class="min-w-full divide-y divide-slate-800 border border-slate-800 text-left text-xs text-slate-300">\n`;
    html += `  <thead class="bg-slate-900">\n    <tr>\n`;
    headers.forEach(h => {
      html += `      <th class="px-4 py-2 font-mono font-bold text-slate-400 border border-slate-800">${h}</th>\n`;
    });
    html += `    </tr>\n  </thead>\n`;
    html += `  <tbody class="divide-y divide-slate-800">\n`;
    arr.forEach(row => {
      html += `    <tr class="hover:bg-slate-950/50">\n`;
      headers.forEach(h => {
        const val = row[h] === null || row[h] === undefined ? "" : String(row[h]);
        html += `      <td class="px-4 py-2 border border-slate-800">${val}</td>\n`;
      });
      html += `    </tr>\n`;
    });
    html += `  </tbody>\n</table>`;
    return html;
  };

  // Copy to clipboard
  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // File uploading handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;
    processUploadedFile(files[0]);
  };

  const processUploadedFile = (file: File) => {
    const extension = file.name.split(".").pop()?.toLowerCase();
    const reader = new FileReader();

    if (extension === "xlsx" || extension === "xls") {
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const json = XLSX.utils.sheet_to_json(worksheet);
          
          setInputFormat("excel");
          setInputText(`[EXCEL WORKBOOK LOADED: ${file.name}]\n- Sheets found: ${workbook.SheetNames.join(", ")}\n- Selected Sheet: "${firstSheetName}"\n- Extracted Rows count: ${json.length}`);
          
          setParsedHeaders(json.length > 0 ? Object.keys(json[0]) : []);
          setParsedData(json);
          setErrorMsg(null);
          setSuccessMsg(`Successfully extracted ${json.length} rows from Excel sheet "${firstSheetName}"!`);
        } catch (err: any) {
          setErrorMsg("Failed to parse Excel workbook: " + err.message);
        }
      };
      reader.readAsArrayBuffer(file);
    } else if (extension === "json") {
      reader.onload = (e) => {
        try {
          const rawText = e.target?.result as string;
          setInputText(rawText);
          setInputFormat("json");
          const parsed = JSON.parse(rawText);
          const dataToConvert = Array.isArray(parsed) ? parsed : [parsed];
          setParsedHeaders(dataToConvert.length > 0 ? Object.keys(dataToConvert[0]) : []);
          setParsedData(dataToConvert);
          setSuccessMsg(`Successfully uploaded and parsed JSON file "${file.name}"!`);
        } catch (err: any) {
          setErrorMsg("Failed to parse JSON file: " + err.message);
        }
      };
      reader.readAsText(file);
    } else {
      // Treat as text / CSV
      reader.onload = (e) => {
        const rawText = e.target?.result as string;
        setInputText(rawText);
        setInputFormat("csv");
        // detect delimiter
        let delimiter = ",";
        if (rawText.includes(";")) delimiter = ";";
        else if (rawText.includes("\t")) delimiter = "\t";
        setCsvDelimiter(delimiter);
        
        try {
          const parsed = parseCSV(rawText, delimiter);
          setParsedHeaders(parsed.length > 0 ? Object.keys(parsed[0]) : []);
          setParsedData(parsed);
          setSuccessMsg(`Successfully uploaded and parsed CSV file "${file.name}"!`);
        } catch (err: any) {
          setErrorMsg("CSV file read successfully, but parsed with warnings: " + err.message);
        }
      };
      reader.readAsText(file);
    }
  };

  // Drag and drop events
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
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  // Handle actual file downloading (JSON, CSV, MD, XML, HTML, SQL or Excel)
  const handleDownload = () => {
    if (outputFormat === "excel") {
      if (parsedData.length === 0) {
        setErrorMsg("Please convert or load a valid dataset to write an Excel workbook.");
        return;
      }
      try {
        const worksheet = XLSX.utils.json_to_sheet(parsedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
        XLSX.writeFile(workbook, `converted_dataset_${Date.now().toString().slice(-5)}.xlsx`);
        setSuccessMsg("Native Excel workbook (.xlsx) download initialized!");
      } catch (e: any) {
        setErrorMsg("Failed to generate native Excel file: " + e.message);
      }
      return;
    }

    if (!outputText) return;
    const extensionsMap: Record<string, string> = {
      json: "json",
      csv: "csv",
      xml: "xml",
      markdown: "md",
      sql: "sql",
      html: "html"
    };

    const ext = extensionsMap[outputFormat] || "txt";
    const blob = new Blob([outputText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `converted_dataset_${Date.now().toString().slice(-5)}.${ext}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Batch conversions simulate
  const handleBatchUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles = Array.from(files).map((f: File) => ({
      id: Math.random().toString(),
      name: f.name,
      size: f.size,
      status: "pending" as const,
      format: f.name.split(".").pop()?.toUpperCase() || "UNKNOWN"
    }));
    setBatchFiles(prev => [...prev, ...newFiles]);
  };

  const runBatchConversion = () => {
    if (batchFiles.length === 0) return;
    setBatchFiles(prev => prev.map(f => ({ ...f, status: "done" })));
    setSuccessMsg(`Successfully batch converted ${batchFiles.length} files to ${outputFormat.toUpperCase()}!`);
  };

  const clearBatch = () => {
    setBatchFiles([]);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-violet-500/20 bg-slate-950 p-6 md:p-8 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 via-fuchsia-600/5 to-transparent pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-[10px] font-mono font-semibold text-violet-400 uppercase tracking-widest">Advanced Utility</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-sans font-bold tracking-tight text-white">
              Data Converter Hub
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl font-sans">
              Interconvert datasets flawlessly across premium formats. Seamless support for <strong className="text-slate-300">CSV, JSON, XML, Excel (.xlsx), SQL Inserts, Markdown, and HTML tables</strong>.
            </p>
          </div>

          {dataset && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLoadActiveDataset}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white shadow-lg shadow-violet-500/20 transition-all duration-200 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 animate-spin-slow" />
              Load Active ({dataset.name})
            </motion.button>
          )}
        </div>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Sidebar Controls Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-5 backdrop-blur-xl">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
              <Settings2 className="w-3.5 h-3.5 text-violet-400" />
              Conversion Schema
            </h3>

            {/* Input Format */}
            <div className="space-y-2">
              <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase">From Format</label>
              <div className="grid grid-cols-2 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => { setInputFormat("csv"); if (outputFormat === "csv") setOutputFormat("json"); }}
                  className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${inputFormat === "csv" ? "bg-violet-600 text-white shadow" : "text-slate-400 hover:text-slate-200"}`}
                >
                  CSV
                </button>
                <button
                  onClick={() => { setInputFormat("json"); if (outputFormat === "json") setOutputFormat("csv"); }}
                  className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${inputFormat === "json" ? "bg-violet-600 text-white shadow" : "text-slate-400 hover:text-slate-200"}`}
                >
                  JSON
                </button>
              </div>
              <div className="flex gap-1 bg-slate-950/40 px-2 py-1 rounded border border-slate-800/60 text-[9px] text-slate-500">
                <Info className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                <span>Choose "CSV" or "JSON" to type/paste raw string, or drop any supported file to auto-detect.</span>
              </div>
            </div>

            {/* Transfer Icon */}
            <div className="flex justify-center">
              <div className="p-1.5 rounded-full bg-slate-800 border border-slate-700 text-violet-400">
                <ArrowRightLeft className="w-4 h-4 rotate-90 lg:rotate-0" />
              </div>
            </div>

            {/* Output Format */}
            <div className="space-y-2">
              <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase">To Target Format</label>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-1 focus:ring-violet-500 focus:outline-none"
              >
                <option value="json">JSON Array</option>
                <option value="csv">CSV Sheet</option>
                <option value="excel">Excel Sheet (.xlsx)</option>
                <option value="xml">XML Document</option>
                <option value="markdown">Markdown Table</option>
                <option value="sql">SQL Insert Statements</option>
                <option value="html">HTML Table Element</option>
              </select>
            </div>

            {/* Contextual Options */}
            <AnimatePresence mode="popLayout">
              {outputFormat === "csv" && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-3 pt-3 border-t border-slate-800/60"
                >
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">CSV Options</span>
                  <div className="space-y-2">
                    <label className="block text-[9px] font-mono text-slate-500">Delimiter</label>
                    <select
                      value={csvDelimiter}
                      onChange={(e) => setCsvDelimiter(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-300 focus:outline-none"
                    >
                      <option value=",">Comma (,)</option>
                      <option value=";">Semicolon (;)</option>
                      <option value="&#9;">Tab (\t)</option>
                      <option value="|">Pipe (|)</option>
                    </select>
                  </div>
                </motion.div>
              )}

              {outputFormat === "json" && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-3 pt-3 border-t border-slate-800/60"
                >
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">JSON Options</span>
                  <div className="space-y-2">
                    <label className="block text-[9px] font-mono text-slate-500">JSON Indentation</label>
                    <select
                      value={jsonIndent}
                      onChange={(e) => setJsonIndent(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-300 focus:outline-none"
                    >
                      <option value={2}>2 Spaces Indent</option>
                      <option value={4}>4 Spaces Indent</option>
                      <option value={0}>Minified (Compact)</option>
                    </select>
                  </div>
                </motion.div>
              )}

              {outputFormat === "sql" && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-3 pt-3 border-t border-slate-800/60"
                >
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">SQL Options</span>
                  <div className="space-y-2">
                    <label className="block text-[9px] font-mono text-slate-500">Table Name</label>
                    <input
                      type="text"
                      value={sqlTableName}
                      onChange={(e) => setSqlTableName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Run Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleConvert}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-xs font-bold text-white shadow-lg transition-all duration-150 cursor-pointer"
            >
              Process Conversion
            </motion.button>
          </div>

          {/* Quick Stats Panel */}
          {parsedData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-3"
            >
              <h4 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">Metadata Audit</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/50">
                  <span className="text-[9px] font-mono text-slate-500 block">Total Rows</span>
                  <span className="text-base font-bold text-white font-mono">{parsedData.length}</span>
                </div>
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/50">
                  <span className="text-[9px] font-mono text-slate-500 block">Total Columns</span>
                  <span className="text-base font-bold text-white font-mono">{parsedHeaders.length}</span>
                </div>
              </div>
              {conversionTimeMs !== null && (
                <div className="text-[10px] font-mono text-slate-400 flex justify-between items-center bg-slate-950/20 px-2 py-1 rounded">
                  <span>Latency</span>
                  <span className="text-emerald-400 font-semibold">{conversionTimeMs}ms</span>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Workspace Display */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Tabs */}
          <div className="flex border-b border-slate-800">
            <button
              onClick={() => setActiveTab("converter")}
              className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${activeTab === "converter" ? "border-violet-500 text-white" : "border-transparent text-slate-400 hover:text-slate-200"}`}
            >
              Workspace Editor
            </button>
            <button
              onClick={() => setActiveTab("batch")}
              className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${activeTab === "batch" ? "border-violet-500 text-white" : "border-transparent text-slate-400 hover:text-slate-200"}`}
            >
              Batch File Processing
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${activeTab === "history" ? "border-violet-500 text-white" : "border-transparent text-slate-400 hover:text-slate-200"}`}
            >
              History Logs
            </button>
          </div>

          {/* Feedback messages */}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center gap-2"
            >
              <span className="shrink-0">⚠️</span>
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs flex items-center gap-2"
            >
              <span className="shrink-0">✅</span>
              <span>{successMsg}</span>
            </motion.div>
          )}

          {/* Tab 1: Workspace Editor */}
          {activeTab === "converter" && (
            <div className="space-y-6">
              
              {/* Drag and Drop Upload Zone */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${dragActive ? "border-violet-500 bg-violet-500/5" : "border-slate-800 hover:border-slate-700 bg-slate-900/20"}`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUpload}
                  accept=".csv,.json,.xlsx,.xls,.txt"
                  className="hidden"
                />
                <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2 animate-bounce" />
                <p className="text-xs text-slate-300 font-sans">
                  Drag & Drop any <strong className="text-violet-400">CSV, JSON, or Excel (.xlsx)</strong> file here, or click to browse
                </p>
                <p className="text-[10px] text-slate-500 mt-1">
                  Maximum file size: 50MB
                </p>
              </div>

              {/* Side by side code editors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Input Editor */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Input Raw Data</span>
                    <button
                      onClick={() => setInputText("")}
                      className="text-[9px] font-mono text-rose-400 hover:underline"
                    >
                      Clear Raw
                    </button>
                  </div>
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={
                      inputFormat === "json"
                        ? '[\n  {"name": "Alice", "age": 25},\n  {"name": "Bob", "age": 30}\n]'
                        : 'name,age\nAlice,25\nBob,30'
                    }
                    className="w-full h-80 bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-slate-300 focus:outline-none focus:border-slate-700 resize-none shadow-inner"
                  />
                </div>

                {/* Output Editor */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Converted Output</span>
                    <div className="flex gap-3">
                      <button
                        onClick={handleCopy}
                        disabled={!outputText}
                        className="text-[10px] font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1 disabled:opacity-50"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {isCopied ? "Copied!" : "Copy Output"}
                      </button>
                      <button
                        onClick={handleDownload}
                        disabled={outputFormat !== "excel" && !outputText}
                        className="text-[10px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 disabled:opacity-50"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download File
                      </button>
                    </div>
                  </div>
                  <textarea
                    readOnly
                    value={outputText}
                    placeholder="Output results will appear here after clicking Process Conversion."
                    className="w-full h-80 bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-slate-400 focus:outline-none resize-none shadow-inner"
                  />
                </div>

              </div>

              {/* Table Preview */}
              {parsedData.length > 0 && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/30 overflow-hidden space-y-2">
                  <div className="px-5 py-3 border-b border-slate-800/80 flex justify-between items-center bg-slate-900/60">
                    <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Table className="w-4 h-4 text-violet-400" />
                      Visual Parsed Preview (First 5 Rows)
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      Matches {parsedHeaders.length} columns cleanly
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-800 text-left text-xs">
                      <thead className="bg-slate-950 text-slate-400">
                        <tr>
                          {parsedHeaders.map(h => (
                            <th key={h} className="px-4 py-2.5 font-mono font-bold border-r border-slate-800/40">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50 bg-slate-950/25">
                        {parsedData.slice(0, 5).map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-900/30">
                            {parsedHeaders.map((col, cIdx) => (
                              <td key={cIdx} className="px-4 py-2 border-r border-slate-800/40 text-slate-300">
                                {row[col] === null || row[col] === undefined ? (
                                  <span className="text-slate-600 font-mono italic">NULL</span>
                                ) : (
                                  String(row[col])
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Tab 2: Batch Processing */}
          {activeTab === "batch" && (
            <div className="space-y-6">
              
              {/* Batch Upload Area */}
              <div className="border border-slate-800 bg-slate-900/20 p-8 rounded-2xl space-y-4 text-center">
                <FileCode className="w-12 h-12 text-violet-400 mx-auto" />
                <h3 className="text-sm font-bold text-white">Batch Convert Files</h3>
                <p className="text-xs text-slate-400 max-w-lg mx-auto">
                  Drag and drop multiple CSV or JSON files. They will be processed and prepared for export as a batch package or single sheets.
                </p>
                
                <div className="flex justify-center gap-3 pt-2">
                  <input
                    type="file"
                    id="batch-uploader"
                    multiple
                    accept=".csv,.json"
                    onChange={handleBatchUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="batch-uploader"
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-all cursor-pointer border border-slate-700"
                  >
                    Select Multiple Files
                  </label>
                  {batchFiles.length > 0 && (
                    <button
                      onClick={runBatchConversion}
                      className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white transition-all cursor-pointer"
                    >
                      Convert Batch ({batchFiles.length} files)
                    </button>
                  )}
                </div>
              </div>

              {/* Batch Files List */}
              {batchFiles.length > 0 && (
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Files in Queue</span>
                    <button
                      onClick={clearBatch}
                      className="text-[10px] text-rose-400 hover:underline font-mono"
                    >
                      Clear Queue
                    </button>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {batchFiles.map(file => (
                      <div key={file.id} className="flex justify-between items-center bg-slate-900/80 p-3 rounded-xl border border-slate-800/60">
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-slate-400" />
                          <div>
                            <span className="text-xs font-semibold text-slate-200 block">{file.name}</span>
                            <span className="text-[9px] text-slate-500 font-mono">
                              {(file.size / 1024).toFixed(1)} KB &bull; {file.format}
                            </span>
                          </div>
                        </div>
                        <div>
                          {file.status === "pending" ? (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400">
                              Pending
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                              Converted
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Tab 3: History Audit Logs */}
          {activeTab === "history" && (
            <div className="space-y-4">
              {history.length === 0 ? (
                <div className="text-center py-12 border border-slate-800 rounded-2xl bg-slate-900/10 text-slate-500">
                  <History className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                  <p className="text-xs">No conversions completed in this session yet.</p>
                  <p className="text-[10px] text-slate-600 mt-1">Converted records will show up here dynamically.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Session Conversions List</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {history.map(item => (
                      <div key={item.id} className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{item.fileName}</span>
                            <span className="text-[9px] font-mono font-bold bg-violet-600/20 text-violet-400 border border-violet-600/30 px-1.5 py-0.5 rounded">
                              {item.fromFormat} &rarr; {item.toFormat}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono space-x-3">
                            <span>Rows: <strong className="text-slate-200">{item.rowCount}</strong></span>
                            <span>Cols: <strong className="text-slate-200">{item.colCount}</strong></span>
                            <span>Size: <strong className="text-slate-200">{(item.sizeBytes / 1024).toFixed(2)} KB</strong></span>
                            <span>Time: <strong className="text-slate-500">{item.timestamp}</strong></span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            // Quick copy output if selected
                            handleCopy();
                          }}
                          className="text-[10px] font-bold text-violet-400 hover:underline inline-flex items-center gap-1 self-start sm:self-auto cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          Copy Data
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
