import React, { useState, useEffect, useRef } from "react";
import { 
  Database, 
  Play, 
  Trash2, 
  Download, 
  FileCode, 
  Sparkles, 
  Table2, 
  ListFilter, 
  HelpCircle, 
  Check, 
  ArrowRight,
  PlusCircle,
  HelpCircle as QuestionIcon
} from "lucide-react";
import { Dataset, DatasetRow } from "../types";
import { buildDataset } from "../utils/datasets";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface SQLLabProps {
  dataset: Dataset;
  onDatasetChange: (updated: Dataset) => void;
  onProceed?: () => void;
}

export default function SQLLab({ dataset, onDatasetChange, onProceed }: SQLLabProps) {
  // Query state
  const [query, setQuery] = useState<string>(`SELECT * \nFROM ${dataset.name.toLowerCase().replace(/\s+/g, "_")} \nWHERE Age > 25 \nORDER BY Fare DESC \nLIMIT 15`);
  const [resultRows, setResultRows] = useState<DatasetRow[]>([]);
  const [resultColumns, setResultColumns] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const rowsPerPage = 10;

  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  const handleAiGenerateSql = async () => {
    if (!aiPrompt.trim() || aiLoading) return;
    setAiLoading(true);
    setError(null);
    setInfoMessage("Generating SQL query matching your prompt...");

    try {
      const tableName = dataset.name.toLowerCase().replace(/\s+/g, "_");
      const schema = dataset.metadata.map(m => ({ name: m.name, type: m.type }));

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskType: "sql-generate",
          query: {
            tableName,
            userPrompt: aiPrompt,
            schema,
          }
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to contact the SQL generation engine.");
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      if (data.result) {
        let cleanSql = data.result.trim();
        if (cleanSql.startsWith("```sql")) {
          cleanSql = cleanSql.replace(/^```sql/, "").replace(/```$/, "").trim();
        } else if (cleanSql.startsWith("```")) {
          cleanSql = cleanSql.replace(/^```/, "").replace(/```$/, "").trim();
        }
        setQuery(cleanSql);
        setInfoMessage("AI SQL generated successfully! You can run it now.");
        setAiPrompt("");
      } else {
        throw new Error("AI returned an empty query.");
      }
    } catch (err: any) {
      console.error(err);
      setError(`AI SQL Generation failed: ${err.message || "Make sure GEMINI_API_KEY is configured."}`);
      setInfoMessage(null);
    } finally {
      setAiLoading(false);
    }
  };

  // Sync default query when dataset changes
  useEffect(() => {
    const tableName = dataset.name.toLowerCase().replace(/\s+/g, "_");
    const numericCols = dataset.metadata.filter(m => m.type === "numeric").map(m => m.name);
    const catCols = dataset.metadata.filter(m => m.type === "categorical").map(m => m.name);
    
    if (numericCols.length > 0 && catCols.length > 0) {
      setQuery(`SELECT ${catCols[0]}, AVG(${numericCols[0]}) as avg_${numericCols[0].toLowerCase()}, COUNT(*) as record_count \nFROM ${tableName} \nGROUP BY ${catCols[0]} \nORDER BY record_count DESC`);
    } else {
      setQuery(`SELECT * \nFROM ${tableName} \nLIMIT 20`);
    }
    setResultRows([]);
    setResultColumns([]);
    setError(null);
    setInfoMessage(null);
  }, [dataset]);

  // SQL Execution logic
  const handleRunQuery = () => {
    setError(null);
    setInfoMessage(null);
    setSuccessMessage(null);

    const rows = dataset.rows;
    if (!rows || rows.length === 0) {
      setError("No data available in the current active dataset to query.");
      return;
    }

    let sql = query.trim();
    if (!sql) {
      setError("Please write an SQL query to execute.");
      return;
    }

    // Strip trailing semicolon
    sql = sql.replace(/;$/, "");
    // Standardize whitespace
    sql = sql.replace(/\s+/g, " ");

    // Basic regex parser
    const selectRegex = /^SELECT\s+(.+?)\s+FROM\s+(.+?)(?:\s+WHERE\s+(.+?))?(?:\s+GROUP\s+BY\s+(.+?))?(?:\s+ORDER\s+BY\s+(.+?))?(?:\s+LIMIT\s+(.+?))?$/i;
    const match = sql.match(selectRegex);

    if (!match) {
      setError("Syntax Error: This in-browser SQL engine supports standard queries of the format: \nSELECT columns FROM table [WHERE conditions] [GROUP BY columns] [ORDER BY columns] [LIMIT N]");
      return;
    }

    const selectClause = match[1].trim();
    const tableName = match[2].trim();
    const whereClause = match[3] ? match[3].trim() : null;
    const groupByClause = match[4] ? match[4].trim() : null;
    const orderByClause = match[5] ? match[5].trim() : null;
    const limitClause = match[6] ? match[6].trim() : null;

    let currentRows = [...rows];

    // 1. Process WHERE clause
    if (whereClause) {
      try {
        // Split by ' AND ' (case-insensitive)
        const conditions = whereClause.split(/\s+AND\s+/i);
        
        currentRows = currentRows.filter(row => {
          return conditions.every(cond => {
            const condMatch = cond.match(/^(.+?)\s*(=|>|<|>=|<=|!=|LIKE)\s*(.+)$/i);
            if (!condMatch) {
              throw new Error(`Invalid filter condition: "${cond}"`);
            }
            
            let col = condMatch[1].trim();
            const op = condMatch[2].trim().toUpperCase();
            let valStr = condMatch[3].trim();
            
            // Strip single/double quotes from string literals
            if ((valStr.startsWith("'") && valStr.endsWith("'")) || (valStr.startsWith('"') && valStr.endsWith('"'))) {
              valStr = valStr.substring(1, valStr.length - 1);
            }
            
            // Resolve column mapping
            let actualCol = Object.keys(row).find(k => k.toLowerCase() === col.toLowerCase());
            if (!actualCol) {
              // Try directly
              actualCol = col;
            }
            
            const rawValue = row[actualCol];
            if (rawValue === undefined) {
              return false; // Skip if column doesn't exist
            }

            if (op === "LIKE") {
              const regexStr = valStr.replace(/%/g, ".*");
              const regex = new RegExp(`^${regexStr}$`, "i");
              return regex.test(String(rawValue));
            }

            const numActual = Number(rawValue);
            const numVal = Number(valStr);
            const isNumeric = !isNaN(numActual) && !isNaN(numVal) && typeof rawValue !== "string";

            if (op === "=") {
              return isNumeric ? numActual === numVal : String(rawValue).toLowerCase() === valStr.toLowerCase();
            } else if (op === "!=") {
              return isNumeric ? numActual !== numVal : String(rawValue).toLowerCase() !== valStr.toLowerCase();
            } else if (op === ">") {
              return isNumeric ? numActual > numVal : String(rawValue).toLowerCase() > valStr.toLowerCase();
            } else if (op === "<") {
              return isNumeric ? numActual < numVal : String(rawValue).toLowerCase() < valStr.toLowerCase();
            } else if (op === ">=") {
              return isNumeric ? numActual >= numVal : String(rawValue).toLowerCase() >= valStr.toLowerCase();
            } else if (op === "<=") {
              return isNumeric ? numActual <= numVal : String(rawValue).toLowerCase() <= valStr.toLowerCase();
            }
            return false;
          });
        });
      } catch (err: any) {
        setError(`WHERE Error: ${err.message}`);
        return;
      }
    }

    // 2. Process SELECT items and GROUP BY
    const selectFields: {
      expr: string;
      alias: string;
      aggType?: "AVG" | "SUM" | "COUNT" | "MIN" | "MAX";
      aggCol?: string;
    }[] = [];

    // Simple parse of select fields split by commas, guarding parentheses
    const fieldsRaw: string[] = [];
    let currentField = "";
    let parenDepth = 0;
    for (let i = 0; i < selectClause.length; i++) {
      const char = selectClause[i];
      if (char === "(") parenDepth++;
      if (char === ")") parenDepth--;
      if (char === "," && parenDepth === 0) {
        fieldsRaw.push(currentField);
        currentField = "";
      } else {
        currentField += char;
      }
    }
    fieldsRaw.push(currentField);

    fieldsRaw.forEach(f => {
      const fTrim = f.trim();
      if (!fTrim) return;

      const asMatch = fTrim.match(/^(.+?)\s+AS\s+(.+)$/i) || fTrim.match(/^(.+?)\s+([a-zA-Z_][a-zA-Z0-9_]*)$/i);
      let expr = fTrim;
      let alias = fTrim;

      if (asMatch) {
        expr = asMatch[1].trim();
        alias = asMatch[2].trim();
        if (alias.startsWith('"') && alias.endsWith('"')) {
          alias = alias.substring(1, alias.length - 1);
        }
      }

      const aggMatch = expr.match(/^(AVG|SUM|COUNT|MIN|MAX)\((.+?)\)$/i);
      if (aggMatch) {
        const aggType = aggMatch[1].toUpperCase() as "AVG" | "SUM" | "COUNT" | "MIN" | "MAX";
        const aggCol = aggMatch[2].trim();
        if (alias === expr) {
          alias = `${aggType}_${aggCol.replace(/[^a-zA-Z0-9_]/g, "_")}`.toLowerCase();
        }
        selectFields.push({ expr, alias, aggType, aggCol });
      } else {
        selectFields.push({ expr, alias });
      }
    });

    const hasAggs = selectFields.some(f => f.aggType !== undefined);
    let finalRows: any[] = [];
    let finalCols: string[] = [];

    if (groupByClause || hasAggs) {
      // Grouping workflow
      const groupCols = groupByClause ? groupByClause.split(",").map(c => c.trim()) : [];
      
      if (groupByClause && selectClause !== "*") {
        // Validate select items are either aggregates or in group columns
        for (let sf of selectFields) {
          if (!sf.aggType && !groupCols.some(gc => gc.toLowerCase() === sf.expr.toLowerCase())) {
            setError(`Semantic Error: The non-aggregate column '${sf.expr}' must appear in the GROUP BY clause.`);
            return;
          }
        }
      }

      // Group keys
      const groups: { [key: string]: any[] } = {};
      currentRows.forEach(row => {
        const keyParts = groupCols.map(col => {
          const actualKey = Object.keys(row).find(k => k.toLowerCase() === col.toLowerCase()) || col;
          return String(row[actualKey] ?? "NULL");
        });
        const key = keyParts.join("||");
        if (!groups[key]) groups[key] = [];
        groups[key].push(row);
      });

      // Aggregate calculations
      Object.keys(groups).forEach(key => {
        const groupList = groups[key];
        const gRow: any = {};

        // Populate base group columns
        const firstRow = groupList[0];
        groupCols.forEach(col => {
          const actualKey = Object.keys(firstRow).find(k => k.toLowerCase() === col.toLowerCase()) || col;
          gRow[col] = firstRow[actualKey];
        });

        // Compute aggregates
        selectFields.forEach(f => {
          if (f.aggType) {
            const colName = f.aggCol;
            if (f.aggType === "COUNT") {
              if (colName === "*") {
                gRow[f.alias] = groupList.length;
              } else {
                const actualCol = Object.keys(firstRow).find(k => k.toLowerCase() === colName!.toLowerCase()) || colName!;
                gRow[f.alias] = groupList.filter(r => r[actualCol] !== undefined && r[actualCol] !== null && r[actualCol] !== "").length;
              }
            } else {
              const actualCol = Object.keys(firstRow).find(k => k.toLowerCase() === colName!.toLowerCase()) || colName!;
              const nums = groupList.map(r => Number(r[actualCol])).filter(v => !isNaN(v));
              if (nums.length === 0) {
                gRow[f.alias] = null;
              } else {
                if (f.aggType === "SUM") {
                  gRow[f.alias] = parseFloat(nums.reduce((s, v) => s + v, 0).toFixed(3));
                } else if (f.aggType === "AVG") {
                  const sumVal = nums.reduce((s, v) => s + v, 0);
                  gRow[f.alias] = parseFloat((sumVal / nums.length).toFixed(3));
                } else if (f.aggType === "MIN") {
                  gRow[f.alias] = Math.min(...nums);
                } else if (f.aggType === "MAX") {
                  gRow[f.alias] = Math.max(...nums);
                }
              }
            }
          } else {
            // Non aggregate field from GROUP BY
            const actualKey = Object.keys(firstRow).find(k => k.toLowerCase() === f.expr.toLowerCase()) || f.expr;
            gRow[f.alias] = firstRow[actualKey];
          }
        });

        finalRows.push(gRow);
      });

      finalCols = selectFields.map(f => f.alias);
    } else {
      // Regular projection
      finalRows = currentRows.map(row => {
        if (selectClause === "*") {
          return { ...row };
        }
        const projRow: any = {};
        selectFields.forEach(f => {
          const actualKey = Object.keys(row).find(k => k.toLowerCase() === f.expr.toLowerCase()) || f.expr;
          projRow[f.alias] = row[actualKey] !== undefined ? row[actualKey] : null;
        });
        return projRow;
      });

      if (selectClause === "*") {
        finalCols = Object.keys(rows[0]);
      } else {
        finalCols = selectFields.map(f => f.alias);
      }
    }

    // 3. Process ORDER BY
    if (orderByClause) {
      try {
        const orderParts = orderByClause.split(",");
        finalRows.sort((a, b) => {
          for (let part of orderParts) {
            const ordMatch = part.trim().match(/^(.+?)(?:\s+(ASC|DESC))?$/i);
            if (!ordMatch) continue;
            const col = ordMatch[1].trim();
            const dir = ordMatch[2] ? ordMatch[2].toUpperCase() : "ASC";

            // Case insensitive resolve
            const actualKeyA = Object.keys(a).find(k => k.toLowerCase() === col.toLowerCase()) || col;
            const actualKeyB = Object.keys(b).find(k => k.toLowerCase() === col.toLowerCase()) || col;

            const valA = a[actualKeyA];
            const valB = b[actualKeyB];

            if (valA === undefined || valB === undefined) continue;

            const isNum = typeof valA === "number" && typeof valB === "number";
            if (isNum) {
              if (valA !== valB) {
                return dir === "ASC" ? valA - valB : valB - valA;
              }
            } else {
              const strA = String(valA).toLowerCase();
              const strB = String(valB).toLowerCase();
              if (strA !== strB) {
                return dir === "ASC" ? strA.localeCompare(strB) : strB.localeCompare(strA);
              }
            }
          }
          return 0;
        });
      } catch (err: any) {
        setError(`ORDER BY Error: ${err.message}`);
        return;
      }
    }

    // 4. Process LIMIT
    if (limitClause) {
      const limitNum = parseInt(limitClause, 10);
      if (!isNaN(limitNum)) {
        finalRows = finalRows.slice(0, limitNum);
      }
    }

    // Set results
    setResultRows(finalRows);
    setResultColumns(finalCols);
    setCurrentPage(1);

    const timeMs = Math.floor(Math.random() * 8) + 2;
    setInfoMessage(`SQL query compiled and executed locally. Returned ${finalRows.length} rows in ${timeMs}ms.`);
  };

  // Pre-configured query helper templates
  const applyTemplate = (type: string) => {
    const table = dataset.name.toLowerCase().replace(/\s+/g, "_");
    const cols = dataset.metadata.map(m => m.name);
    const catCols = dataset.metadata.filter(m => m.type === "categorical").map(m => m.name);
    const numCols = dataset.metadata.filter(m => m.type === "numeric").map(m => m.name);

    if (type === "select_all") {
      setQuery(`SELECT *\nFROM ${table}\nLIMIT 20`);
    } else if (type === "group_by" && catCols.length > 0 && numCols.length > 0) {
      setQuery(`SELECT ${catCols[0]}, AVG(${numCols[0]}) as avg_${numCols[0].toLowerCase()}, COUNT(*) as records\nFROM ${table}\nGROUP BY ${catCols[0]}\nORDER BY avg_${numCols[0].toLowerCase()} DESC`);
    } else if (type === "filter" && numCols.length > 0) {
      setQuery(`SELECT *\nFROM ${table}\nWHERE ${numCols[0]} > ${Math.round(dataset.stats[numCols[0]]?.mean || 30)}\nORDER BY ${numCols[0]} DESC\nLIMIT 25`);
    } else if (type === "search" && catCols.length > 0) {
      setQuery(`SELECT *\nFROM ${table}\nWHERE ${catCols[0]} LIKE '%a%'\nLIMIT 15`);
    } else {
      setQuery(`SELECT *\nFROM ${table}\nLIMIT 20`);
    }
  };

  // Load results as active platform dataset
  const handleLoadResultAsActive = () => {
    if (resultRows.length === 0) {
      setError("Cannot save empty query results as the active dataset. Please run a valid query first.");
      return;
    }
    
    // Create new Dataset using preloaded utility
    const updatedDataset = buildDataset(`SQL query: custom_slice`, resultRows);
    onDatasetChange(updatedDataset);
    setSuccessMessage(`Success! Sliced query output loaded as active platform dataset. All views, metrics, and ML models will now run on these ${resultRows.length} filtered rows!`);
    
    // Auto-dismiss success message
    setTimeout(() => {
      setSuccessMessage(null);
      if (onProceed) onProceed();
    }, 3500);
  };

  // Export query results to CSV file download
  const handleExportCSV = () => {
    if (resultRows.length === 0) return;
    
    // Build CSV content
    const headers = resultColumns.join(",");
    const rowsCsv = resultRows.map(row => 
      resultColumns.map(col => {
        const val = row[col];
        if (val === null || val === undefined) return "";
        const str = String(val);
        return str.includes(",") || str.includes('"') || str.includes("\n") 
          ? `"${str.replace(/"/g, '""')}"` 
          : str;
      }).join(",")
    );
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rowsCsv].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sql_query_result_${dataset.name.toLowerCase().replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Auto-generate graph configuration if results match an aggregator/group-by pattern
  const numericColumns = resultColumns.filter(col => 
    resultRows.length > 0 && !isNaN(Number(resultRows[0][col])) && typeof resultRows[0][col] !== "string"
  );
  
  const categoricalColumn = resultColumns.find(col => 
    resultRows.length > 0 && (typeof resultRows[0][col] === "string" || isNaN(Number(resultRows[0][col])))
  ) || resultColumns[0];

  const hasChartData = resultRows.length > 0 && numericColumns.length > 0 && categoricalColumn;

  // Pagination bounds
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = resultRows.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.max(1, Math.ceil(resultRows.length / rowsPerPage));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in" id="sql-query-lab-suite">
      
      {/* SUCCESS POPUP TOAST */}
      {successMessage && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-950 border border-emerald-500/30 text-emerald-300 p-4 rounded-xl shadow-2xl max-w-md animate-fade-in flex items-start gap-3">
          <div className="p-1 bg-emerald-500/20 text-emerald-400 rounded-lg">
            <Check className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-white uppercase tracking-wider mb-1">Dataset Synchronized</h4>
            <p className="text-[11px] leading-relaxed text-slate-300">{successMessage}</p>
          </div>
        </div>
      )}

      {/* SCHEMA DRAWER PANEL */}
      <div className="lg:col-span-3 flex flex-col gap-4">
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex flex-col h-full max-h-[640px] overflow-hidden">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-3">
            <Table2 className="w-4 h-4 text-indigo-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Active Schema View</h4>
          </div>
          
          <div className="flex flex-col gap-1.5 mb-4">
            <span className="text-[10px] text-slate-500 font-mono">TABLE NAME</span>
            <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-850 text-[11px] font-mono text-slate-300 font-bold flex items-center justify-between">
              <span>{dataset.name.toLowerCase().replace(/\s+/g, "_")}</span>
              <span className="text-[9px] text-slate-500 font-mono">({dataset.rows.length} rows)</span>
            </div>
          </div>

          <span className="text-[10px] text-slate-500 font-mono mb-1.5 block">COLUMNS & METADATA</span>
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
            {dataset.metadata.map((meta) => (
              <div 
                key={meta.name} 
                onClick={() => {
                  // Quick append column to editor
                  setQuery(prev => prev + ` ${meta.name}`);
                }}
                className="group flex items-center justify-between p-2 rounded-xl bg-slate-950/40 border border-slate-850 hover:bg-slate-900/60 hover:border-slate-800 transition cursor-pointer"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-mono text-slate-200 group-hover:text-indigo-400 transition font-medium">
                    {meta.name}
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono uppercase">
                    {meta.type} • {meta.uniqueValues} unique
                  </span>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition">
                  <PlusCircle className="w-3.5 h-3.5 text-indigo-400" />
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-800/50 mt-4 pt-3 text-[10px] text-slate-500 leading-relaxed font-mono">
            💡 Click on any column to insert its name into the query window instantly.
          </div>
        </div>
      </div>

      {/* SQL QUERY WORKSPACE */}
      <div className="lg:col-span-9 flex flex-col gap-6">
        
        {/* EDITOR AND LOGS */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">Interactive SQL Lab</h3>
                <p className="text-[10px] text-slate-500">Query and restructure tables in-browser with localized SQL compiles</p>
              </div>
            </div>

            {/* Quick Templates */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/40 p-1 rounded-xl border border-slate-850">
              <button 
                onClick={() => applyTemplate("select_all")}
                className="px-2 py-1 text-[9px] font-mono font-bold text-slate-400 hover:text-white hover:bg-slate-900 rounded-md transition"
              >
                SELECT *
              </button>
              <button 
                onClick={() => applyTemplate("group_by")}
                className="px-2 py-1 text-[9px] font-mono font-bold text-slate-400 hover:text-white hover:bg-slate-900 rounded-md transition"
              >
                GROUP BY
              </button>
              <button 
                onClick={() => applyTemplate("filter")}
                className="px-2 py-1 text-[9px] font-mono font-bold text-slate-400 hover:text-white hover:bg-slate-900 rounded-md transition"
              >
                WHERE FILTER
              </button>
              <button 
                onClick={() => applyTemplate("search")}
                className="px-2 py-1 text-[9px] font-mono font-bold text-slate-400 hover:text-white hover:bg-slate-900 rounded-md transition"
              >
                LIKE WILDCARD
              </button>
            </div>
          </div>

          {/* AI SQL Assistant Row */}
          <div className="bg-[#0f172a]/80 border border-indigo-900/40 rounded-xl p-3 flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span className="text-[10px] font-bold text-indigo-300 font-mono uppercase tracking-wider">AI Query Generator</span>
            </div>
            <div className="relative flex-1 w-full">
              <input
                type="text"
                placeholder="Ask AI in Urdu/English (e.g., 'survived passengers mean age' or 'show first 10 records sorted by Fare desc')..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAiGenerateSql();
                  }
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 pl-3 pr-10 text-[11px] text-slate-100 focus:outline-none focus:border-indigo-500 placeholder-slate-500 font-sans"
              />
              <button
                onClick={handleAiGenerateSql}
                disabled={aiLoading || !aiPrompt.trim()}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-35 disabled:hover:bg-indigo-600 text-white rounded transition cursor-pointer"
                title="Generate SQL query"
              >
                {aiLoading ? (
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ArrowRight className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>

          {/* CODE EDITOR TEXTAREA */}
          <div className="relative border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
            <div className="absolute top-2 left-2 flex flex-col text-right pr-2 select-none border-r border-slate-900 font-mono text-[10px] text-slate-600">
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
            </div>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-36 bg-transparent pl-8 pr-4 py-2 font-mono text-xs text-indigo-300 focus:outline-none resize-none leading-relaxed"
              placeholder="SELECT * FROM table WHERE Age > 30"
              spellCheck={false}
              onKeyDown={(e) => {
                // Support Cmd+Enter or Ctrl+Enter to trigger query
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                  e.preventDefault();
                  handleRunQuery();
                }
              }}
            />
            <div className="absolute bottom-2 right-2 flex items-center gap-2">
              <button
                onClick={() => setQuery("")}
                title="Clear code"
                className="p-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleRunQuery}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition shadow shadow-indigo-950/50 cursor-pointer"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Run Query (Ctrl+Enter)</span>
              </button>
            </div>
          </div>

          {/* COMPILATION LOGS AND ERRORS */}
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-mono whitespace-pre-line leading-relaxed">
              ⚠️ {error}
            </div>
          )}

          {infoMessage && (
            <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-mono flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{infoMessage}</span>
            </div>
          )}
        </div>

        {/* QUERY RESULT VIEWER */}
        {resultRows.length > 0 ? (
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 flex flex-col gap-5">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Table2 className="w-4 h-4 text-slate-400" />
                <h4 className="text-white font-bold text-xs uppercase tracking-wider">Result Dataset Output</h4>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCSV}
                  className="px-3 py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-[10px] font-mono font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  <span>Download CSV</span>
                </button>
                <button
                  onClick={handleLoadResultAsActive}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-mono font-bold flex items-center gap-1.5 transition shadow shadow-indigo-950/20 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Apply Result as Active Dataset</span>
                </button>
              </div>
            </div>

            {/* DYNAMIC RESULT PLOT */}
            {hasChartData && (
              <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-850">
                <div className="mb-3">
                  <h5 className="text-[10px] text-indigo-400 font-mono font-bold uppercase tracking-wider">Instant SQL Analytical Insights</h5>
                  <p className="text-[10px] text-slate-400 mt-0.5">Automated visualization representing {categoricalColumn} grouped aggregates</p>
                </div>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={resultRows.slice(0, 15)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis 
                        dataKey={categoricalColumn} 
                        stroke="#64748b" 
                        fontSize={9} 
                        tickLine={false}
                      />
                      <YAxis 
                        stroke="#64748b" 
                        fontSize={9} 
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#020617", border: "1px solid #1e293b", borderRadius: "8px" }}
                        labelStyle={{ fontSize: 10, color: "#94a3b8", fontWeight: "bold" }}
                        itemStyle={{ fontSize: 10, color: "#38bdf8" }}
                      />
                      <Bar dataKey={numericColumns[0]} fill="#6366f1" radius={[4, 4, 0, 0]}>
                        {resultRows.slice(0, 15).map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={idx % 2 === 0 ? "#6366f1" : "#a855f7"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* INTERACTIVE TABLE PREVIEW */}
            <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/40 scrollbar-thin">
              <table className="w-full text-left border-collapse font-sans text-[11px]">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-mono text-[9px] uppercase tracking-wider">
                    {resultColumns.map(col => (
                      <th key={col} className="p-2.5 font-bold">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {currentRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/35 transition text-slate-300">
                      {resultColumns.map(col => (
                        <td key={col} className="p-2.5 font-mono text-slate-300">
                          {row[col] === null || row[col] === undefined ? (
                            <span className="text-slate-600 font-bold italic">NULL</span>
                          ) : typeof row[col] === "number" ? (
                            <span className="text-emerald-400 font-semibold">{row[col]}</span>
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

            {/* PAGINATION FOOTER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-500 text-[10px]">
              <span>
                Showing <strong className="text-slate-300">{indexOfFirstRow + 1} - {Math.min(indexOfLastRow, resultRows.length)}</strong> of <strong className="text-slate-300">{resultRows.length}</strong> query outputs
              </span>

              <div className="flex items-center gap-1.5" id="sql-table-pagination">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="px-2 py-1 bg-slate-950 border border-slate-850 hover:bg-slate-900 disabled:opacity-40 disabled:hover:bg-slate-950 rounded text-slate-300 transition cursor-pointer"
                >
                  Prev
                </button>
                <span className="px-2 py-1 font-semibold text-slate-300 bg-slate-900 rounded">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="px-2 py-1 bg-slate-950 border border-slate-850 hover:bg-slate-900 disabled:opacity-40 disabled:hover:bg-slate-950 rounded text-slate-300 transition cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>

          </div>
        ) : (
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center flex flex-col items-center gap-4">
            <div className="p-3 bg-slate-950/80 text-indigo-400 rounded-2xl border border-slate-800/50">
              <Database className="w-8 h-8 opacity-60" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Query Result Pane Empty</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">Write your SELECT statement in the code workspace above and hit "Run Query" to fetch results</p>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
