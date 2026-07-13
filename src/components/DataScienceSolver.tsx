import React, { useState } from "react";
import { 
  Cpu, 
  Code2, 
  BookOpen, 
  Sparkles, 
  Copy, 
  Check, 
  Download, 
  Terminal, 
  Play, 
  ArrowRight, 
  Settings, 
  FileCode, 
  Network, 
  Search, 
  CheckCircle2, 
  Layers, 
  Bot,
  Loader2
} from "lucide-react";
import { Dataset } from "../types";

interface DataScienceSolverProps {
  dataset: Dataset;
}

export default function DataScienceSolver({ dataset }: DataScienceSolverProps) {
  // Core Tabs
  const [activeTab, setActiveTab] = useState<"boilerplates" | "architectures" | "ai_custom">("boilerplates");
  
  // Boilerplate states
  const [problemType, setProblemType] = useState<"classification" | "regression" | "forecasting" | "clustering" | "nlp" | "anomaly">("classification");
  const [language, setLanguage] = useState<"python" | "r" | "pyspark" | "sql">("python");
  const [tuningFramework, setTuningFramework] = useState<"grid_search" | "random_search" | "optuna">("optuna");
  const [includePipeline, setIncludePipeline] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  // Custom AI Code states
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [aiOutput, setAiOutput] = useState<string>("");
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Auto-generate standard industry boilerplate codes
  const getBoilerplateCode = (): string => {
    const table_name = dataset.name.toLowerCase().replace(/\s+/g, "_");
    const numCols = dataset.metadata.filter(m => m.type === "numeric").map(m => m.name);
    const catCols = dataset.metadata.filter(m => m.type !== "numeric").map(m => m.name);
    const target = numCols.length > 0 ? numCols[numCols.length - 1] : "target";
    const features = dataset.columns.filter(col => col !== target);
    const tsTargetClassification = catCols.length > 0 ? catCols[0] : target;

    if (language === "python") {
      switch (problemType) {
        case "classification":
          return `import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, StratifiedKFold
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.metrics import classification_report, roc_auc_score, confusion_matrix
import xgboost as xgb
${tuningFramework === "optuna" ? "import optuna\nimport logging" : ""}

# 1. Load active dataset: ${dataset.name}
print("Loading dataset: ${dataset.name}...")
df = pd.read_csv("dataset_${table_name}.csv")

# 2. Separate Features and Target Vector
target_col = "${tsTargetClassification}"
X = df.drop(columns=[target_col])
y = df[target_col]

# 3. Define Preprocessing Pipelines
numeric_features = ${JSON.stringify(numCols.filter(c => c !== tsTargetClassification))}
categorical_features = ${JSON.stringify(catCols.filter(c => c !== tsTargetClassification))}

numeric_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='median')),
    ('scaler', StandardScaler())
])

categorical_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='most_frequent')),
    ('onehot', OneHotEncoder(handle_unknown='ignore'))
])

preprocessor = ColumnTransformer(
    transformers=[
        ('num', numeric_transformer, numeric_features),
        ('cat', categorical_transformer, categorical_features)
    ]
)

# 4. Create complete Training Pipeline
model_pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('classifier', xgb.XGBClassifier(
        use_label_encoder=False, 
        eval_metric='logloss',
        random_state=42
    ))
])

# 5. Split data into train & test
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)

${tuningFramework === "optuna" ? `# 6. Optuna Hyperparameter Optimization
def objective(trial):
    params = {
        'classifier__n_estimators': trial.suggest_int('n_estimators', 50, 400),
        'classifier__max_depth': trial.suggest_int('max_depth', 3, 10),
        'classifier__learning_rate': trial.suggest_float('learning_rate', 0.01, 0.2, log=True),
        'classifier__subsample': trial.suggest_float('subsample', 0.6, 1.0),
        'classifier__colsample_bytree': trial.suggest_float('colsample_bytree', 0.6, 1.0)
    }
    
    # Set hyperparams on pipeline
    model_pipeline.set_params(**params)
    
    # 5-Fold Stratified Cross Validation
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    scores = []
    for train_idx, val_idx in cv.split(X_train, y_train):
        X_tr, X_val = X_train.iloc[train_idx], X_train.iloc[val_idx]
        y_tr, y_val = y_train.iloc[train_idx], y_train.iloc[val_idx]
        
        model_pipeline.fit(X_tr, y_tr)
        preds = model_pipeline.predict_proba(X_val)[:, 1]
        scores.append(roc_auc_score(y_val, preds))
        
    return np.mean(scores)

print("Starting Optuna Study optimization...")
optuna.logging.set_verbosity(optuna.logging.WARNING)
study = optuna.create_study(direction="maximize")
study.optimize(objective, n_trials=20)

print(f"Best ROC-AUC score: {study.best_value:.4f}")
print("Best parameters found:", study.best_params)

# Update pipeline with best parameters
best_params = {f'classifier__{k}': v for k, v in study.best_params.items()}
model_pipeline.set_params(**best_params)
` : `# 6. Standard Grid-Search CV Optimization
from sklearn.model_selection import GridSearchCV

param_grid = {
    'classifier__n_estimators': [100, 200],
    'classifier__max_depth': [4, 6],
    'classifier__learning_rate': [0.05, 0.1]
}

print("Running GridSearchCV hyperparameter optimization...")
grid_search = GridSearchCV(model_pipeline, param_grid, cv=5, scoring='roc_auc', n_jobs=-1)
grid_search.fit(X_train, y_train)
model_pipeline = grid_search.best_estimator_
print(f"Best grid-search CV score: {grid_search.best_score_:.4f}")`}

# 7. Final Fit and Evaluation on Held-out test set
print("Fitting final pipeline with optimized parameters...")
model_pipeline.fit(X_train, y_train)

preds = model_pipeline.predict(X_test)
probs = model_pipeline.predict_proba(X_test)[:, 1]

print("\\n" + "="*50)
print("FINAL CLASSIFICATION METRICS (HELD-OUT SET)")
print("="*50)
print(classification_report(y_test, preds))
print(f"Out-of-sample ROC-AUC: {roc_auc_score(y_test, probs):.4f}")
print("Confusion Matrix:")
print(confusion_matrix(y_test, preds))
`;

        case "regression":
          return `import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, KFold
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
from sklearn.ensemble import GradientBoostingRegressor
${tuningFramework === "optuna" ? "import optuna\nimport logging" : ""}

# 1. Load active dataset: ${dataset.name}
df = pd.read_csv("dataset_${table_name}.csv")

# 2. Separate Features and Target continuous variable
target_col = "${target}"
X = df.drop(columns=[target_col])
y = df[target_col]

numeric_features = ${JSON.stringify(numCols.filter(c => c !== target))}
categorical_features = ${JSON.stringify(catCols)}

numeric_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='median')),
    ('scaler', StandardScaler())
])

categorical_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='most_frequent')),
    ('onehot', OneHotEncoder(handle_unknown='ignore'))
])

preprocessor = ColumnTransformer(
    transformers=[
        ('num', numeric_transformer, numeric_features),
        ('cat', categorical_transformer, categorical_features)
    ]
)

model_pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('regressor', GradientBoostingRegressor(random_state=42))
])

# Split datasets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

${tuningFramework === "optuna" ? `# Optuna Hyperparameter Optimization
def objective(trial):
    params = {
        'regressor__n_estimators': trial.suggest_int('n_estimators', 50, 300),
        'regressor__max_depth': trial.suggest_int('max_depth', 3, 8),
        'regressor__learning_rate': trial.suggest_float('learning_rate', 0.01, 0.15, log=True),
        'regressor__min_samples_split': trial.suggest_int('min_samples_split', 2, 10)
    }
    model_pipeline.set_params(**params)
    
    cv = KFold(n_splits=5, shuffle=True, random_state=42)
    scores = []
    for train_idx, val_idx in cv.split(X_train):
        X_tr, X_val = X_train.iloc[train_idx], X_train.iloc[val_idx]
        y_tr, y_val = y_train.iloc[train_idx], y_train.iloc[val_idx]
        
        model_pipeline.fit(X_tr, y_tr)
        preds = model_pipeline.predict(X_val)
        scores.append(r2_score(y_val, preds))
        
    return np.mean(scores)

print("Starting Optuna Study optimization...")
optuna.logging.set_verbosity(optuna.logging.WARNING)
study = optuna.create_study(direction="maximize")
study.optimize(objective, n_trials=15)

print("Best R2 Score on Cross-Validation:", study.best_value)
best_params = {f'regressor__{k}': v for k, v in study.best_params.items()}
model_pipeline.set_params(**best_params)
` : `# Grid-Search CV Optimization
from sklearn.model_selection import GridSearchCV

param_grid = {
    'regressor__n_estimators': [100, 150],
    'regressor__max_depth': [4, 6],
    'regressor__learning_rate': [0.05, 0.1]
}

grid_search = GridSearchCV(model_pipeline, param_grid, cv=5, scoring='r2', n_jobs=-1)
grid_search.fit(X_train, y_train)
model_pipeline = grid_search.best_estimator_`}

# Final Evaluation
model_pipeline.fit(X_train, y_train)
preds = model_pipeline.predict(X_test)

print("\\n" + "="*50)
print("FINAL REGRESSION METRICS")
print("="*50)
print(f"R-squared Score: {r2_score(y_test, preds):.4f}")
print(f"Mean Absolute Error (MAE): {mean_absolute_error(y_test, preds):.4f}")
print(f"Root Mean Squared Error (RMSE): {np.sqrt(mean_squared_error(y_test, preds)):.4f}")
`;

        case "forecasting":
          return `import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from statsmodels.tsa.statespace.sarimax import SARIMAX
from statsmodels.tsa.stattools import adfuller
from pmdarima import auto_arima

# 1. Load dataset & parse temporal indexes
df = pd.read_csv("dataset_${table_name}.csv")

# Assume first categorical/datetime feature represents index
time_col = "${catCols.length > 0 ? catCols[0] : 'Date'}"
target_col = "${target}"

df[time_col] = pd.to_datetime(df[time_col], errors='coerce')
df = df.dropna(subset=[time_col]).sort_values(time_col)
df.set_index(time_col, inplace=True)
df = df.asfreq('D').fillna(method='ffill')  # Resample to daily frequency

print("Inspecting time-series stationarity...")
res = adfuller(df[target_col].dropna())
print(f"ADF Statistic: {res[0]:.4f}")
print(f"p-value: {res[1]:.4f}")

# 2. Automated Hyperparameter Search using Auto-ARIMA (Akaike Information Criterion)
print("Fitting auto_arima parameter search pipeline...")
auto_model = auto_arima(
    df[target_col], 
    seasonal=True, 
    m=7,              # Assuming weekly seasonality structure
    stepwise=True, 
    suppress_warnings=True, 
    error_action="ignore", 
    trace=True
)

print(auto_model.summary())

# 3. Train optimal SARIMAX model
order = auto_model.order
seasonal_order = auto_model.seasonal_order

model = SARIMAX(
    df[target_col],
    order=order,
    seasonal_order=seasonal_order,
    enforce_stationarity=False,
    enforce_invertibility=False
)

results = model.fit(disp=False)
print(results.summary())

# 4. Out-of-sample Forecast for next 30 days
forecast_steps = 30
forecast = results.get_forecast(steps=forecast_steps)
forecast_mean = forecast.predicted_mean
confidence_intervals = forecast.conf_int()

print("\\n" + "="*50)
print(f"SARIMAX FORECAST FOR NEXT {forecast_steps} PERIODS")
print("="*50)
print(pd.DataFrame({
    'Point Forecast': forecast_mean,
    'Lower Limit': confidence_intervals.iloc[:, 0],
    'Upper Limit': confidence_intervals.iloc[:, 1]
}))
`;

        case "clustering":
          return `import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans, DBSCAN
from sklearn.decomposition import PCA
from sklearn.metrics import silhouette_score
import matplotlib.pyplot as plt

# 1. Load active dataset
df = pd.read_csv("dataset_${table_name}.csv")

# 2. Slice and Preprocess Numeric Vectors for Distance calculation
num_cols = ${JSON.stringify(numCols)}
X = df[num_cols].dropna()

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# 3. Select K-means Cluster Count via Silhouette Optimization
best_k = 2
best_score = -1
scores = []

for k in range(2, 9):
    kmeans = KMeans(n_clusters=k, init='k-means++', random_state=42, n_init=10)
    labels = kmeans.fit_predict(X_scaled)
    score = silhouette_score(X_scaled, labels)
    scores.append((k, score))
    if score > best_score:
        best_score = score
        best_k = k

print("Silhouette Analysis for cluster selections (K=2..8):")
for k, sc in scores:
    print(f"K = {k} | Average Silhouette Score = {sc:.4f}")

print(f"Optimal clusters based on max Silhouette: K={best_k} (Score: {best_score:.4f})")

# 4. Fit final Segmenter and join cluster categories back to original dataframe
kmeans_optimal = KMeans(n_clusters=best_k, init='k-means++', random_state=42)
df['Cluster_ID'] = kmeans_optimal.fit_predict(X_scaled)

# 5. Output Cluster centroids with descriptive profiling
cluster_profiles = df.groupby('Cluster_ID')[num_cols].mean()
print("\\n" + "="*50)
print("CLUSTER PROFILE CHARACTERIZATION (CENTROIDS)")
print("="*50)
print(cluster_profiles)
`;

        case "nlp":
          return `import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, accuracy_score
import nltk
from nltk.corpus import stopwords
import string

# 1. Ensure pre-requisites are downloaded
nltk.download('stopwords', quiet=True)

# 2. Load dataset
df = pd.read_csv("dataset_${table_name}.csv")

# Assume first text or categorical field represents rich content
text_col = "${catCols.length > 0 ? catCols[0] : 'Text_Column'}"
target_col = "${target}"

# 3. Text Preprocessing function
stop_words = set(stopwords.words('english'))

def text_cleaner(text):
    if not isinstance(text, str):
        return ""
    text = text.lower()
    # Strip punctuation
    text = "".join([c for c in text if c not in string.punctuation])
    # Filter stopwords
    tokens = text.split()
    tokens = [t for t in tokens if t not in stop_words]
    return " ".join(tokens)

print("Preprocessing and cleaning text vectors...")
df['clean_text'] = df[text_col].apply(text_cleaner)

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    df['clean_text'], df[target_col], test_size=0.2, random_state=42, stratify=df[target_col]
)

# 4. Formulate Pipeline: TF-IDF Vectorizer + Multinomial Naive Bayes classifier
nlp_pipeline = Pipeline([
    ('tfidf', TfidfVectorizer(max_features=5000, ngram_range=(1, 2))),
    ('classifier', MultinomialNB(alpha=0.1))
])

print("Fitting Text Pipeline on training corpus...")
nlp_pipeline.fit(X_train, y_train)

# 5. Evaluate classifier performance
preds = nlp_pipeline.predict(X_test)
print("\\n" + "="*50)
print("TEXT CLASSIFIER DISCRIMINATION REPORT")
print("="*50)
print(classification_report(y_test, preds))
`;

        case "anomaly":
          return `import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import numpy as np

# 1. Load data
df = pd.read_csv("dataset_${table_name}.csv")
num_cols = ${JSON.stringify(numCols)}

# Preprocess 
X = df[num_cols].dropna()
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# 2. Fit Isolation Forest Unsupervised Anomaly Engine
# contamination parameter controls expected noise ratio in enterprise distributions
contamination_ratio = 0.05 
print(f"Initializing Isolation Forest model with expected anomaly contamination = {contamination_ratio * 100}%...")

model = IsolationForest(
    n_estimators=150, 
    contamination=contamination_ratio, 
    random_state=42, 
    n_jobs=-1
)

df['Anomaly_Flag'] = model.fit_predict(X_scaled)
df['Anomaly_Score'] = model.decision_function(X_scaled)

# Isolation Forest marks anomalies with -1, normal instances with 1
df['Anomaly_Flag'] = df['Anomaly_Flag'].apply(lambda x: 1 if x == -1 else 0)

print("\\n" + "="*50)
print("UNSUPERVISED OUTLIER FRAUD SUMMARY")
print("="*50)
anomaly_count = df['Anomaly_Flag'].sum()
print(f"Total Rows Scanned: {len(df)}")
print(f"Flagged Anomalies Identified: {anomaly_count} ({anomaly_count / len(df) * 100:.2f}%)")

# Compare feature averages between normal vs anomalous records
print("\\nMean Profiling (Anomalies vs Normal Population):")
print(df.groupby('Anomaly_Flag')[num_cols].mean())
`;
      }
    } else if (language === "r") {
      return `# R Stats Language Script for ${problemType.toUpperCase()}
# Active Dataset: ${dataset.name}

library(tidyverse)
library(caret)
library(xgboost)

# 1. Load active dataset
df <- read_csv("dataset_${table_name}.csv")

# 2. Slice variables
target_var <- "${target}"
features <- setdiff(names(df), target_var)

# Preprocessing Recipe with caret
pre_proc_val <- preProcess(df[, num_cols], method = c("center", "scale", "medianImpute"))
df_transformed <- predict(pre_proc_val, df)

# Train Test Splits
set.seed(42)
train_index <- createDataPartition(df[[target_var]], p = 0.8, list = FALSE)
train_set <- df_transformed[train_index, ]
test_set <- df_transformed[-train_index, ]

# 3. Model Training
fit_control <- trainControl(
  method = "repeatedcv",
  number = 5,
  repeats = 3,
  search = "random"
)

print("Fitting Random Forest Model using caret...")
model_fit <- train(
  as.formula(paste(target_var, "~ .")),
  data = train_set,
  method = "rf",
  trControl = fit_control,
  tuneLength = 10
)

print(model_fit)
predictions <- predict(model_fit, test_set)
postResample(predictions, test_set[[target_var]])
`;
    } else if (language === "pyspark") {
      return `from pyspark.sql import SparkSession
from pyspark.ml.feature import VectorAssembler, StandardScaler, StringIndexer, OneHotEncoder
from pyspark.ml import Pipeline
from pyspark.ml.classification import GBTClassifier
from pyspark.ml.evaluation import BinaryClassificationEvaluator

# 1. Initialize Distributed Spark Context
spark = SparkSession.builder \\
    .appName("QuantumDataScienceSuite_${table_name}") \\
    .getOrCreate()

# 2. Read distributed CSV path
df = spark.read.csv("dataset_${table_name}.csv", header=True, inferSchema=True)

# Define column names
numeric_cols = ${JSON.stringify(numCols)}
categorical_cols = ${JSON.stringify(catCols)}
target_col = "${target}"

# 3. Distributed Pipeline Stages
stages = []
for cat_col in categorical_cols:
    indexer = StringIndexer(inputCol=cat_col, outputCol=cat_col+"_index", handleInvalid="keep")
    encoder = OneHotEncoder(inputCol=cat_col+"_index", outputCol=cat_col+"_vec")
    stages += [indexer, encoder]

# Assemble numeric and categorical vectors
assembler_inputs = [c + "_vec" for c in categorical_cols] + numeric_cols
assembler = VectorAssembler(inputCols=assembler_inputs, outputCol="raw_features")
scaler = StandardScaler(inputCol="raw_features", outputCol="features")

stages += [assembler, scaler]

# 4. GBT Classifier model
gbt = GBTClassifier(labelCol=target_col, featuresCol="features", maxIter=25)
stages += [gbt]

pipeline = Pipeline(stages=stages)

# Split 80-20
train, test = df.randomSplit([0.8, 0.2], seed=42)

# Fit Distributed Model
print("Fitting parallel Spark GBT model...")
model = pipeline.fit(train)

predictions = model.transform(test)
evaluator = BinaryClassificationEvaluator(labelCol=target_col, rawPredictionCol="rawPrediction")
auc = evaluator.evaluate(predictions)

print(f"Distributed Model Area Under ROC: {auc:.4f}")
`;
    } else {
      // SQL Machine Learning
      return `-- Google BigQuery ML / Postgres SQL script for Model Training
-- Table name: ${table_name}

-- 1. Create Linear/Logistic classification model inside database server
CREATE OR REPLACE MODEL \`quantum_ds_project.ml_model_${problemType}_${table_name}\`
OPTIONS(
  model_type='${problemType === "classification" ? "LOGISTIC_REG" : "LINEAR_REG"}',
  input_label_cols=['${target}'],
  auto_class_weights=TRUE,
  data_split_method='RANDOM',
  data_split_eval_fraction=0.20
) AS
SELECT
  ${dataset.columns.join(",\n  ")}
FROM
  \`quantum_ds_project.dataset_${table_name}\`
WHERE
  ${target} IS NOT NULL;

-- 2. Inspect trained weights, intercept, and variable influence immediately
SELECT * FROM ML.WEIGHTS(MODEL \`quantum_ds_project.ml_model_${problemType}_${table_name}\`);

-- 3. Run prediction across all rows inside BigQuery
SELECT
  predicted_${target},
  ${target},
  probability
FROM
  ML.PREDICT(MODEL \`quantum_ds_project.ml_model_${problemType}_${table_name}\`,
    (SELECT * FROM \`quantum_ds_project.dataset_${table_name}\`));
`;
    }
  };

  // Trigger copy-to-clipboard action
  const handleCopy = () => {
    navigator.clipboard.writeText(getBoilerplateCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download code as script file
  const handleDownload = () => {
    const code = getBoilerplateCode();
    const ext = language === "python" ? "py" : language === "r" ? "R" : language === "pyspark" ? "py" : "sql";
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `quantum_ds_pipeline_${problemType}_${dataset.name.toLowerCase().replace(/\s+/g, "_")}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Submit dynamic prompt to Gemini server
  const handleRunAiQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim() || aiLoading) return;

    setAiLoading(true);
    setAiError(null);
    setAiOutput("");

    // Prepare contextual information about dataset
    let datasetContext = `Dataset: ${dataset.name} (${dataset.rows.length} rows)\nColumns:\n`;
    dataset.metadata.forEach(m => {
      datasetContext += `- ${m.name} (${m.type}, unique: ${m.uniqueValues})\n`;
    });

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          datasetSummary: datasetContext,
          columns: dataset.columns,
          query: `Write a customized, professional, and detailed data science code or design architecture for this request: "${aiPrompt}". 
Please ensure your output is structured, includes complete code lines, is written in Python/R where appropriate, explains key steps, and does not contain placeholders.`,
          taskType: "query"
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to query Gemini server.");
      }

      setAiOutput(data.result);
    } catch (err: any) {
      setAiError(err.message || "Failed to connect to the Gemini AI Engine.");
    } finally {
      setAiLoading(false);
    }
  };

  // Pre-configured custom architecture recipes
  const architectures = [
    {
      title: "Credit Scoring & Risk Model",
      desc: "Solve credit default problems with XGBoost, target imbalance (SMOTE), and model credit variables.",
      pipeline: [
        "Load loan portfolio details with numerical values (DTI, credit limits, balances)",
        "Overcome target imbalances using Synthetic Minority Over-sampling Technique (SMOTE)",
        "Fit an extreme gradient boosted classifier with grid-search cross-validation",
        "Construct confusion matrices, credit scoring probability bands, and risk thresholds"
      ]
    },
    {
      title: "Customer Churn & Retention Machine",
      desc: "Address customer churn issues. Conduct survival analysis or binary classification pipelines.",
      pipeline: [
        "Feature engineer billing patterns, support ticket frequency, and usage slopes",
        "Encode categorical profiles using target encoding to maintain signal value",
        "Train Logistic Regression (for interpretability) and Random Forest (for classification accuracy)",
        "Obtain probability scores and export decile rank buckets to focus marketing reach"
      ]
    },
    {
      title: "Demand & Sales Forecasting",
      desc: "Forecast retail store inventories and product demands over time using seasonal models.",
      pipeline: [
        "Check series stationarity via Augmented Dickey-Fuller (ADF) and compute lags",
        "Decompose data into additive/multiplicative seasonality components",
        "Formulate Prophet or SARIMAX time models with covariate features (holidays, discounts)",
        "Verify model errors via mean absolute percentage error (MAPE) metrics"
      ]
    },
    {
      title: "Clustering & Market Segmentation",
      desc: "Identify customer segments by clustering transactional and behavioral records.",
      pipeline: [
        "Impute null metrics and standardize distributions with StandardScaler",
        "Perform Principal Component Analysis (PCA) to project high-dimensional data points",
        "Iterate K-Means clustering algorithm across multiple seeds, calculating silhoutte indices",
        "Compute centroid means and label groups with distinct persona categories (e.g., 'VIPs')"
      ]
    }
  ];

  return (
    <div className="flex flex-col gap-6 animate-fade-in" id="enterprise-data-science-solver-module">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">Enterprise Data Science Solver Suite</h2>
            <p className="text-xs text-slate-400 mt-1">Generate production-grade machine learning code, pipelines, and strategic architectures instantly</p>
          </div>
        </div>

        {/* TABS SELECTOR */}
        <div className="flex items-center bg-slate-950/60 p-1 rounded-xl border border-slate-850">
          <button
            onClick={() => setActiveTab("boilerplates")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "boilerplates" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Interactive Code Generator</span>
          </button>
          <button
            onClick={() => setActiveTab("architectures")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "architectures" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Problem Architecture Guides</span>
          </button>
          <button
            onClick={() => setActiveTab("ai_custom")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "ai_custom" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Auto-Solver Workspace</span>
          </button>
        </div>
      </div>

      {/* ACTIVE VIEW CONTENT */}
      {activeTab === "boilerplates" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* OPTIONS SIDEBAR */}
          <div className="lg:col-span-4 bg-slate-950/20 border border-slate-800/80 rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-slate-850 pb-3 mb-1">
              <Settings className="w-4 h-4 text-slate-400" />
              <h3 className="text-white font-bold text-xs uppercase tracking-wider">Pipeline Configurations</h3>
            </div>

            {/* PROBLEM TYPE */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">Data Science Task</label>
              <select
                value={problemType}
                onChange={(e) => setProblemType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-xs text-slate-300 font-sans focus:outline-none focus:border-indigo-500"
              >
                <option value="classification">Binary / Multi-Class Classification</option>
                <option value="regression">Continuous Variable Regression</option>
                <option value="forecasting">Time Series Seasonal Forecasting</option>
                <option value="clustering">Unsupervised Customer Segmentation</option>
                <option value="nlp">NLP Sentiment & Text Categorization</option>
                <option value="anomaly">Outlier & Financial Fraud Detection</option>
              </select>
            </div>

            {/* LANGUAGE */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">Programming Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-xs text-slate-300 font-sans focus:outline-none focus:border-indigo-500"
              >
                <option value="python">Python (Scikit-Learn, Pandas, XGBoost)</option>
                <option value="r">R Language (tidyverse, caret, randomForest)</option>
                <option value="pyspark">PySpark (Big Data Spark Pipelines)</option>
                <option value="sql">SQL / BigQuery ML (In-Database Training)</option>
              </select>
            </div>

            {/* OPTUNA / TUNING */}
            {language === "python" && (problemType === "classification" || problemType === "regression") && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">Hyperparameter Optimization</label>
                <select
                  value={tuningFramework}
                  onChange={(e) => setTuningFramework(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-xs text-slate-300 font-sans focus:outline-none focus:border-indigo-500"
                >
                  <option value="optuna">Optuna Study (Bayesian Optimization)</option>
                  <option value="grid_search">GridSearchCV (Exhaustive Sweep)</option>
                  <option value="random_search">RandomizedSearchCV (Fast Search)</option>
                </select>
              </div>
            )}

            {/* FEATURES AND INFOMESSAGE */}
            <div className="mt-4 border-t border-slate-850 pt-4 flex flex-col gap-3">
              <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-slate-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>ACTIVE DATASET CONTEXT MET</span>
              </div>
              
              <div className="text-[11px] font-sans text-slate-400 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-850/40">
                This code automatically binds to your active dataset: <strong className="text-white">"{dataset.name}"</strong> with <strong className="text-indigo-400">{dataset.columns.length} columns</strong> and <strong className="text-indigo-400">{dataset.rows.length} records</strong>. No placeholders are used.
              </div>
            </div>

          </div>

          {/* CODE OUTPUT PANEL */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 flex flex-col gap-3">
              
              <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-slate-400" />
                  <h4 className="text-white font-bold text-xs uppercase tracking-wider font-mono">
                    {language === "python" ? "pipeline_training.py" : language === "r" ? "pipeline_training.R" : language === "pyspark" ? "distributed_spark.py" : "database_training.sql"}
                  </h4>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="p-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-[10px] font-mono font-bold flex items-center gap-1 transition cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied!" : "Copy Code"}</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-mono font-bold flex items-center gap-1 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Script</span>
                  </button>
                </div>
              </div>

              {/* CODE BLOCK CONTAINER */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 overflow-x-auto max-h-[440px] scrollbar-thin">
                <pre className="text-slate-300 font-mono text-[11px] leading-relaxed select-all">
                  <code>{getBoilerplateCode()}</code>
                </pre>
              </div>

              <span className="text-[10px] font-mono text-slate-500 leading-normal text-center mt-1">
                💡 Standard Python code templates are fully compatible with Jupyter, Colab, and standard command line scripts.
              </span>

            </div>
          </div>

        </div>
      )}

      { activeTab === "architectures" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="architecture-guides-deck">
          {architectures.map((arch, idx) => (
            <div key={idx} className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-white font-bold text-sm">{arch.title}</h3>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">{arch.desc}</p>
                </div>
                <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/25">
                  <Layers className="w-4 h-4" />
                </div>
              </div>

              <div className="flex flex-col gap-2.5 border-t border-slate-850 pt-4">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Enterprise Solution Pipeline Steps:</span>
                
                {arch.pipeline.map((step, sIdx) => (
                  <div key={sIdx} className="flex gap-2.5 items-start text-xs text-slate-300">
                    <span className="w-4 h-4 rounded-full bg-indigo-950/50 text-[10px] font-mono font-bold text-indigo-400 flex items-center justify-center mt-0.5 shrink-0">
                      {sIdx + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      { activeTab === "ai_custom" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* USER PROMPT INTERACTIVE COLUMN */}
          <div className="lg:col-span-5 bg-slate-950/20 border border-slate-800/80 rounded-2xl p-5 flex flex-col gap-4">
            <div>
              <span className="text-[10px] uppercase font-mono font-bold text-amber-400 tracking-wider">Dynamic Workspace</span>
              <h3 className="font-semibold text-white text-sm">Describe Your Data Science Problem</h3>
              <p className="text-slate-400 text-xs mt-1">Provide any specific business goals or custom requirements, and our Gemini agent will design a complete codebase architecture for you</p>
            </div>

            <form onSubmit={handleRunAiQuery} className="flex flex-col gap-3">
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g., Create a neural network model in PyTorch to classify churn, including custom metrics, logging, and an early-stopping training callback..."
                className="w-full h-36 bg-slate-950 border border-slate-850 rounded-xl p-3 text-xs text-slate-300 font-sans focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
                spellCheck={false}
              />
              <button
                type="submit"
                disabled={!aiPrompt.trim() || aiLoading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-950/50 transition cursor-pointer"
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Analyzing & Designing Architecture...</span>
                  </>
                ) : (
                  <>
                    <Bot className="w-4 h-4" />
                    <span>Run AI Solver Pipeline</span>
                  </>
                )}
              </button>
            </form>

            <div className="border-t border-slate-850 pt-4 flex flex-col gap-2 bg-indigo-950/15 p-3.5 rounded-xl border border-indigo-900/30">
              <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider block">Suggested Prompts to try:</span>
              <button 
                onClick={() => setAiPrompt("Build a complete Customer Churn pipeline using LightGBM with optuna hyperparameter search, stratified K-fold cross-validation, and an ROC curve evaluation graph.")}
                className="text-left text-xs text-slate-400 hover:text-slate-200 transition underline cursor-pointer"
              >
                1. LightGBM Churn with Optuna & Stratified-KFold
              </button>
              <button 
                onClick={() => setAiPrompt("Write a PyTorch Multi-Layer Perceptron (MLP) for continuous target regression, complete with DataLoader setup, training epoch loops, and Loss visualization plots.")}
                className="text-left text-xs text-slate-400 hover:text-slate-200 transition underline cursor-pointer"
              >
                2. PyTorch Regression MLP Neural Network
              </button>
              <button 
                onClick={() => setAiPrompt("Implement an anomaly detection pipeline using Local Outlier Factor (LOF) and One-Class SVM. Compare performance metrics and visualize outliers on PCA projected clusters.")}
                className="text-left text-xs text-slate-400 hover:text-slate-200 transition underline cursor-pointer"
              >
                3. LOF and One-Class SVM Outliers comparison
              </button>
            </div>
          </div>

          {/* SYSTEM RESPONSE OUTLINE */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            
            {aiOutput ? (
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <h4 className="text-white font-bold text-xs uppercase tracking-wider font-mono">Custom Solved Pipeline Architecture</h4>
                  </div>
                  
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(aiOutput);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="p-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-[10px] font-mono font-bold flex items-center gap-1 transition cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied!" : "Copy Output"}</span>
                  </button>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 overflow-y-auto max-h-[440px] text-xs text-slate-300 space-y-4 scrollbar-thin whitespace-pre-wrap font-sans">
                  {aiOutput}
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-4 h-full min-h-[300px]">
                <div className="p-3 bg-slate-950 text-indigo-400 rounded-2xl border border-slate-800/50">
                  <Bot className="w-8 h-8 opacity-60 text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">No Custom Solution Compiled</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">Input your custom business objective or script requirements in the input panel and trigger the solver to begin</p>
                </div>
              </div>
            )}

            {aiError && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/25 text-rose-300 rounded-xl text-xs font-mono">
                ⚠️ Error: {aiError}
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
