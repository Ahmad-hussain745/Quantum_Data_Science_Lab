export interface DatasetRow {
  [key: string]: any;
}

export interface ColumnMetadata {
  name: string;
  type: "numeric" | "categorical" | "boolean";
  missingCount: number;
  uniqueValues: number;
}

export interface Dataset {
  name: string;
  rows: DatasetRow[];
  columns: string[];
  metadata: ColumnMetadata[];
  stats: {
    [columnName: string]: ColumnStats;
  };
}

export interface ColumnStats {
  mean?: number;
  median?: number;
  min?: number;
  max?: number;
  stdDev?: number;
  variance?: number;
  skewness?: number;
  kurtosis?: number;
  frequencyMap?: { [value: string]: number };
}

export interface RegressionResult {
  weights: { [feature: string]: number };
  intercept: number;
  r2?: number; // For Linear
  accuracy?: number; // For Logistic
  predictions: { actual: number; predicted: number; index: number }[];
  isClassification: boolean;
  confusionMatrix?: {
    tp: number;
    fp: number;
    fn: number;
    tn: number;
  };
}

export interface ClusterPoint {
  x: number;
  y: number;
  cluster: number;
}

export interface Centroid {
  x: number;
  y: number;
  cluster: number;
}

export interface KMeansResult {
  points: ClusterPoint[];
  centroids: Centroid[];
  inertia: number;
}

export interface StatisticalTestResult {
  type: "correlation" | "ttest" | "anova";
  statisticName: string;
  statisticValue: number;
  pValue: number;
  interpretation: string;
}

export interface CopilotMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
}

export interface SavedModelRun {
  id: string;
  name: string;
  description?: string;
  type: "Classification" | "Regression";
  target: string;
  predictors: string[];
  metrics: {
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1?: number;
    r2?: number;
    mae?: number;
    mse?: number;
  };
  weights: { [feature: string]: number };
  intercept: number;
  timestamp: string;
}
