import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Lazy-initialized Gemini API Client
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not defined. Please configure it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Data science AI assistant route
app.post("/api/analyze", async (req, res) => {
  try {
    const { datasetSummary, columns, query, taskType } = req.body;

    const summaryCtx = datasetSummary || "No active dataset is loaded.";
    const activeColumns = columns || [];

    const ai = getGeminiClient();
    
    let prompt = "";
    if (taskType === "general") {
      prompt = `You are an expert Chief Data Scientist. Analyze the following dataset summary information and provide:
1. A brief executive summary of what this dataset appears to represent.
2. 3 key actionable business or analytical insights from the columns and data stats.
3. Recommendations for 2 advanced machine learning formulations (e.g., Target variable, feature engineering ideas, which algorithms to try).
4. Potential data issues to watch out for (e.g., missing values, skewness, outliers, leakage).

Dataset Columns: ${JSON.stringify(activeColumns)}
Dataset Metrics & Stats:
${summaryCtx}

Please format your response in professional, beautiful Markdown with clear headings. Do not include verbose introductory or concluding pleasantries. Go straight to the professional analysis.`;
    } else if (taskType === "query") {
      prompt = `You are a highly versatile, expert AI assistant and data scientist. The user has asked the following question:
      
"${query}"

${summaryCtx && summaryCtx !== "No active dataset is loaded." ? `
The user is working with a dataset. Here is some metadata and context about their active dataset:
Dataset Columns: ${JSON.stringify(activeColumns)}
Dataset Summary Context:
${summaryCtx}

Please incorporate details from this dataset summary if their question is related to it. If their question is general (such as writing general code, explaining computer science concepts, or any general knowledge question like math, geography, science, history, translation, etc.), answer their question directly, accurately, and thoroughly.
` : `
There is currently no active dataset loaded. This is a general query (such as explaining computer science/programming concepts, writing code, answering general knowledge, science, math, history, or anything else). Answer the user's question directly, accurately, and comprehensively.
`}

Provide a detailed, professional response in beautiful Markdown. Do not include verbose introductory or concluding pleasantries. Go straight to the response.`;
    } else if (taskType === "ml-recommend") {
      prompt = `You are a machine learning engineering specialist. Recommend a rigorous predictive modeling pipeline for this dataset based on this summary:

Dataset Columns: ${JSON.stringify(activeColumns)}
Dataset Metrics & Stats:
${summaryCtx}

Provide:
1. Target Variable Selection: Recommendations on what targets would be interesting (classification or regression).
2. Feature Engineering: 3 concrete ideas for creating new features from existing columns (e.g., polynomial combinations, ratios, encoding, datetime splits).
3. Modeling Algorithms: Specific recommended models (e.g., LightGBM, Random Forest, XGBoost) and why.
4. Validation Strategy: What validation split/scheme (e.g., Stratified K-Fold, TimeSeriesSplit) is appropriate here and how to evaluate.

Format in clean, structured Markdown.`;
    } else if (taskType === "sql-generate") {
      const { tableName, userPrompt, schema } = query;
      prompt = `You are an expert SQL database engineer. Generate a single SQL SELECT query for a table named "${tableName}" based on this user request:
"${userPrompt}"

Available Table Columns and Schema Info:
${JSON.stringify(schema)}

CRITICAL Dialect and Format rules:
1. Respond with ONLY the plain, raw SQL query text. Do NOT wrap it in Markdown codeblocks (no \`\`\`sql blocks). Do NOT add explanations, introductory text, or concluding notes.
2. The table name in the FROM clause must be exactly "${tableName}".
3. Match column names case-sensitively and exactly to the provided list.
4. The generated query must only use standard select keywords: SELECT, FROM, WHERE, GROUP BY, ORDER BY, LIMIT.`;
    } else {
      prompt = `Perform a general data science inspection of this dataset:
      Columns: ${JSON.stringify(activeColumns)}
      Details: ${summaryCtx}`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        temperature: 0.2,
      },
    });

    res.json({ result: response.text });
  } catch (error: any) {
    console.error("Gemini API call failed:", error);
    res.status(500).json({ 
      error: error.message || "Failed to generate AI analysis. Check your GEMINI_API_KEY secret." 
    });
  }
});

// Configure Vite or serve built assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
