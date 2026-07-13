import { KMeansResult, RegressionResult, StatisticalTestResult, ClusterPoint, Centroid, DatasetRow } from "../types";

// Standard normal cumulative distribution function (approximation)
function normalCDF(z: number): number {
  // Abramowitz and Stegun approximation
  const t = 1.0 / (1.0 + 0.2316419 * Math.abs(z));
  const d = 0.39894228 * Math.exp(-z * z / 2.0);
  const p = d * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  const ans = 1.0 - p;
  return z >= 0 ? ans : 1.0 - ans;
}

// Student-T distribution two-tailed p-value approximation
function tDistributionTwoTailedPValue(tStat: number, df: number): number {
  const absT = Math.abs(tStat);
  // Large degrees of freedom converges to normal distribution
  if (df > 30) {
    const z = absT * (1 - 1 / (4 * df));
    return 2 * (1 - normalCDF(z));
  }
  
  // Refined polynomial approximation for t-distribution tail area
  const x = df / (df + absT * absT);
  // Incomplete beta function approximation for tail area
  let p = 0;
  if (df === 1) {
    p = 1 - (2 / Math.PI) * Math.atan(absT);
  } else if (df === 2) {
    p = 1 - absT / Math.sqrt(2 + absT * absT);
  } else {
    // Standard normal-based approximation for intermediate df
    const tSquare = tStat * tStat;
    const a = tSquare / df;
    const b = (df + 1) / 2;
    // Approximating using normal transformation
    const z = absT * Math.sqrt(df) / Math.sqrt(df + tSquare);
    const zScaled = z * (1 - 1 / (4 * df));
    p = 2 * (1 - normalCDF(zScaled));
  }
  
  return Math.max(0, Math.min(1, p));
}

// 1. PEARSON CORRELATION & P-VALUE
export function calculateCorrelation(
  x: number[],
  y: number[]
): StatisticalTestResult {
  const n = x.length;
  if (n < 3) {
    return {
      type: "correlation",
      statisticName: "Pearson r",
      statisticValue: 0,
      pValue: 1,
      interpretation: "Insufficient sample size (requires at least 3 samples)."
    };
  }

  const meanX = x.reduce((sum, v) => sum + v, 0) / n;
  const meanY = y.reduce((sum, v) => sum + v, 0) / n;

  let num = 0;
  let denX = 0;
  let denY = 0;

  for (let i = 0; i < n; i++) {
    const diffX = x[i] - meanX;
    const diffY = y[i] - meanY;
    num += diffX * diffY;
    denX += diffX * diffX;
    denY += diffY * diffY;
  }

  if (denX === 0 || denY === 0) {
    return {
      type: "correlation",
      statisticName: "Pearson r",
      statisticValue: 0,
      pValue: 1,
      interpretation: "Zero variance detected in one of the variables."
    };
  }

  const r = num / Math.sqrt(denX * denY);
  const rClamped = Math.max(-0.9999, Math.min(0.9999, r));

  // Compute correlation t-statistic: t = r * sqrt((n-2) / (1-r^2))
  const tStat = rClamped * Math.sqrt((n - 2) / (1 - rClamped * rClamped));
  const df = n - 2;
  const pValue = tDistributionTwoTailedPValue(tStat, df);

  let interpretation = "";
  if (pValue > 0.05) {
    interpretation = `No statistically significant correlation (r = ${r.toFixed(3)}, p = ${pValue.toFixed(4)} > 0.05).`;
  } else {
    const strength = Math.abs(r) > 0.7 ? "strong" : Math.abs(r) > 0.4 ? "moderate" : "weak";
    const direction = r > 0 ? "positive" : "negative";
    interpretation = `Statistically significant, ${strength} ${direction} correlation (r = ${r.toFixed(3)}, p = ${pValue.toFixed(4)} < 0.05).`;
  }

  return {
    type: "correlation",
    statisticName: "Pearson correlation coefficient (r)",
    statisticValue: parseFloat(r.toFixed(4)),
    pValue: parseFloat(pValue.toFixed(5)),
    interpretation
  };
}

// 2. INDEPENDENT WELCH'S T-TEST
export function calculateTTest(
  groupA: number[],
  groupB: number[],
  labelA: string = "Group A",
  labelB: string = "Group B"
): StatisticalTestResult {
  const nA = groupA.length;
  const nB = groupB.length;

  if (nA < 2 || nB < 2) {
    return {
      type: "ttest",
      statisticName: "Welch t-statistic",
      statisticValue: 0,
      pValue: 1,
      interpretation: "Both groups must have at least 2 samples to perform a T-test."
    };
  }

  const meanA = groupA.reduce((sum, v) => sum + v, 0) / nA;
  const meanB = groupB.reduce((sum, v) => sum + v, 0) / nB;

  const varA = groupA.reduce((sum, v) => sum + Math.pow(v - meanA, 2), 0) / (nA - 1 || 1);
  const varB = groupB.reduce((sum, v) => sum + Math.pow(v - meanB, 2), 0) / (nB - 1 || 1);

  if (varA === 0 && varB === 0) {
    return {
      type: "ttest",
      statisticName: "Welch t-statistic",
      statisticValue: 0,
      pValue: 1,
      interpretation: "Both groups have zero variance."
    };
  }

  // Welch's t-test formulas
  const standardError = Math.sqrt(varA / nA + varB / nB);
  const tStat = (meanA - meanB) / standardError;

  // Satterthwaite approximation for degrees of freedom
  const numDf = Math.pow(varA / nA + varB / nB, 2);
  const denDf = Math.pow(varA / nA, 2) / (nA - 1) + Math.pow(varB / nB, 2) / (nB - 1);
  const df = numDf / (denDf || 1e-10);

  const pValue = tDistributionTwoTailedPValue(tStat, df);

  let interpretation = "";
  if (pValue > 0.05) {
    interpretation = `No significant difference between ${labelA} (mean: ${meanA.toFixed(2)}) and ${labelB} (mean: ${meanB.toFixed(2)}) (t = ${tStat.toFixed(3)}, p = ${pValue.toFixed(4)} > 0.05).`;
  } else {
    const direction = meanA > meanB ? "higher" : "lower";
    interpretation = `Significant difference detected: ${labelA} (mean: ${meanA.toFixed(2)}) is significantly ${direction} than ${labelB} (mean: ${meanB.toFixed(2)}) (t = ${tStat.toFixed(3)}, p = ${pValue.toFixed(4)} < 0.05).`;
  }

  return {
    type: "ttest",
    statisticName: "Welch's t-statistic",
    statisticValue: parseFloat(tStat.toFixed(4)),
    pValue: parseFloat(pValue.toFixed(5)),
    interpretation
  };
}

// 3. K-MEANS CLUSTERING (2D)
export function runKMeans(
  x: number[],
  y: number[],
  K: number
): KMeansResult {
  const n = x.length;
  if (n === 0 || K <= 0) {
    return { points: [], centroids: [], inertia: 0 };
  }

  // Normalize inputs to z-scores to make clustering scale-independent, but preserve original scales for rendering
  const meanX = x.reduce((s, v) => s + v, 0) / n;
  const meanY = y.reduce((s, v) => s + v, 0) / n;
  const stdX = Math.sqrt(x.reduce((s, v) => s + Math.pow(v - meanX, 2), 0) / n) || 1;
  const stdY = Math.sqrt(y.reduce((s, v) => s + Math.pow(v - meanY, 2), 0) / n) || 1;

  const normalizedPoints = x.map((xv, idx) => ({
    x: (xv - meanX) / stdX,
    y: (y[idx] - meanY) / stdY,
    origX: xv,
    origY: y[idx],
    cluster: 0
  }));

  // Smart Centroid Initialization (K-Means++)
  const centroids: { x: number; y: number }[] = [];
  // Pick first centroid randomly
  const firstIdx = Math.floor(Math.random() * n);
  centroids.push({ x: normalizedPoints[firstIdx].x, y: normalizedPoints[firstIdx].y });

  for (let k = 1; k < K; k++) {
    // For each point, find closest distance to existing centroids
    const distSq = normalizedPoints.map(p => {
      let minDist = Infinity;
      centroids.forEach(c => {
        const d = Math.pow(p.x - c.x, 2) + Math.pow(p.y - c.y, 2);
        if (d < minDist) minDist = d;
      });
      return minDist;
    });

    // Pick next centroid based on weighted probability of distance
    const totalDistSq = distSq.reduce((s, d) => s + d, 0);
    let randVal = Math.random() * totalDistSq;
    let selectedIdx = 0;
    for (let i = 0; i < n; i++) {
      randVal -= distSq[i];
      if (randVal <= 0) {
        selectedIdx = i;
        break;
      }
    }
    centroids.push({ x: normalizedPoints[selectedIdx].x, y: normalizedPoints[selectedIdx].y });
  }

  // Iterate Lloyd's Algorithm
  const maxIterations = 30;
  let iterations = 0;
  let changed = true;

  while (changed && iterations < maxIterations) {
    changed = false;
    iterations++;

    // Assignment Step
    normalizedPoints.forEach(p => {
      let minDist = Infinity;
      let closestCluster = 0;
      centroids.forEach((c, idx) => {
        const d = Math.pow(p.x - c.x, 2) + Math.pow(p.y - c.y, 2);
        if (d < minDist) {
          minDist = d;
          closestCluster = idx;
        }
      });
      if (p.cluster !== closestCluster) {
        p.cluster = closestCluster;
        changed = true;
      }
    });

    // Update Step
    centroids.forEach((c, clusterIdx) => {
      const assigned = normalizedPoints.filter(p => p.cluster === clusterIdx);
      if (assigned.length > 0) {
        c.x = assigned.reduce((sum, p) => sum + p.x, 0) / assigned.length;
        c.y = assigned.reduce((sum, p) => sum + p.y, 0) / assigned.length;
      }
    });
  }

  // Compute final inertia
  let inertia = 0;
  normalizedPoints.forEach(p => {
    const c = centroids[p.cluster];
    inertia += Math.pow(p.x - c.x, 2) + Math.pow(p.y - c.y, 2);
  });

  // Scale centroids and points back to actual display scales
  const scaledPoints: ClusterPoint[] = normalizedPoints.map(p => ({
    x: p.origX,
    y: p.origY,
    cluster: p.cluster
  }));

  const scaledCentroids: Centroid[] = centroids.map((c, idx) => ({
    x: c.x * stdX + meanX,
    y: c.y * stdY + meanY,
    cluster: idx
  }));

  return {
    points: scaledPoints,
    centroids: scaledCentroids,
    inertia: parseFloat(inertia.toFixed(4))
  };
}

// 4. MULTIPLIER REGRESSION SANDBOX (LINEAR / LOGISTIC GRADIENT DESCENT)
export function trainRegression(
  rows: DatasetRow[],
  predictors: string[],
  target: string,
  isClassification: boolean
): RegressionResult {
  const n = rows.length;
  const p = predictors.length;

  // Extract clean numerical arrays
  const Y = rows.map(r => Number(r[target]));
  const X: number[][] = rows.map(r => predictors.map(pred => Number(r[pred])));

  // 1. Z-Score Normalization of Predictors (vital for Gradient Descent)
  const means = predictors.map((_, colIdx) => {
    return X.reduce((sum, row) => sum + row[colIdx], 0) / n;
  });
  const stds = predictors.map((_, colIdx) => {
    const variance = X.reduce((sum, row) => sum + Math.pow(row[colIdx] - means[colIdx], 2), 0) / n;
    return Math.sqrt(variance) || 1;
  });

  const normalizedX = X.map(row => {
    return row.map((val, colIdx) => (val - means[colIdx]) / stds[colIdx]);
  });

  // 2. Initialize weights and intercept
  const weights = new Array(p).fill(0);
  let intercept = 0;

  // Learning config
  const alpha = 0.05;
  const iterations = 1000;

  if (isClassification) {
    // LOGISTIC REGRESSION (Sigmoid Function)
    const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));

    for (let iter = 0; iter < iterations; iter++) {
      let gradIntercept = 0;
      const gradWeights = new Array(p).fill(0);

      for (let i = 0; i < n; i++) {
        // Compute dot product
        let z = intercept;
        for (let j = 0; j < p; j++) {
          z += weights[j] * normalizedX[i][j];
        }
        const pred = sigmoid(z);
        const error = pred - Y[i];

        gradIntercept += error;
        for (let j = 0; j < p; j++) {
          gradWeights[j] += error * normalizedX[i][j];
        }
      }

      // Update parameters
      intercept -= (alpha * gradIntercept) / n;
      for (let j = 0; j < p; j++) {
        weights[j] -= (alpha * gradWeights[j]) / n;
      }
    }

    // De-normalize weights back to actual unscaled coordinate system
    // w_orig = w_norm / std
    // intercept_orig = intercept_norm - sum(w_norm * mean / std)
    const originalWeights: { [feature: string]: number } = {};
    let offsetSum = 0;
    predictors.forEach((pred, j) => {
      const origW = weights[j] / stds[j];
      originalWeights[pred] = parseFloat(origW.toFixed(4));
      offsetSum += weights[j] * means[j] / stds[j];
    });
    const originalIntercept = parseFloat((intercept - offsetSum).toFixed(4));

    // Predictions & Confusion Matrix
    let tp = 0, fp = 0, fn = 0, tn = 0;
    const finalPredictions = rows.map((r, i) => {
      let z = originalIntercept;
      predictors.forEach(pred => {
        z += originalWeights[pred] * Number(r[pred]);
      });
      const probability = sigmoid(z);
      const predictedVal = probability >= 0.5 ? 1 : 0;
      const actualVal = Y[i] >= 0.5 ? 1 : 0;

      if (actualVal === 1 && predictedVal === 1) tp++;
      else if (actualVal === 0 && predictedVal === 1) fp++;
      else if (actualVal === 1 && predictedVal === 0) fn++;
      else tn++;

      return {
        actual: actualVal,
        predicted: parseFloat(probability.toFixed(3)),
        index: i + 1
      };
    });

    const accuracy = (tp + tn) / n;

    return {
      weights: originalWeights,
      intercept: originalIntercept,
      accuracy: parseFloat(accuracy.toFixed(4)),
      predictions: finalPredictions,
      isClassification: true,
      confusionMatrix: { tp, fp, fn, tn }
    };

  } else {
    // MULTIPLE LINEAR REGRESSION
    for (let iter = 0; iter < iterations; iter++) {
      let gradIntercept = 0;
      const gradWeights = new Array(p).fill(0);

      for (let i = 0; i < n; i++) {
        let pred = intercept;
        for (let j = 0; j < p; j++) {
          pred += weights[j] * normalizedX[i][j];
        }
        const error = pred - Y[i];

        gradIntercept += error;
        for (let j = 0; j < p; j++) {
          gradWeights[j] += error * normalizedX[i][j];
        }
      }

      // Update parameters
      intercept -= (alpha * gradIntercept) / n;
      for (let j = 0; j < p; j++) {
        weights[j] -= (alpha * gradWeights[j]) / n;
      }
    }

    // De-normalize parameters
    const originalWeights: { [feature: string]: number } = {};
    let offsetSum = 0;
    predictors.forEach((pred, j) => {
      const origW = weights[j] / stds[j];
      originalWeights[pred] = parseFloat(origW.toFixed(4));
      offsetSum += weights[j] * means[j] / stds[j];
    });
    const originalIntercept = parseFloat((intercept - offsetSum).toFixed(4));

    // R2 Calculation
    const meanY = Y.reduce((s, v) => s + v, 0) / n;
    let sumSquaredResiduals = 0;
    let totalSumSquares = 0;

    const finalPredictions = rows.map((r, i) => {
      let pred = originalIntercept;
      predictors.forEach(predCol => {
        pred += originalWeights[predCol] * Number(r[predCol]);
      });

      sumSquaredResiduals += Math.pow(Y[i] - pred, 2);
      totalSumSquares += Math.pow(Y[i] - meanY, 2);

      return {
        actual: Y[i],
        predicted: parseFloat(pred.toFixed(3)),
        index: i + 1
      };
    });

    const r2 = totalSumSquares > 0 ? 1 - (sumSquaredResiduals / totalSumSquares) : 0;

    return {
      weights: originalWeights,
      intercept: originalIntercept,
      r2: parseFloat(Math.max(0, r2).toFixed(4)),
      predictions: finalPredictions,
      isClassification: false
    };
  }
}
