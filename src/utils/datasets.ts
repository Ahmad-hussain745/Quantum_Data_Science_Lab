import { Dataset, ColumnMetadata, ColumnStats, DatasetRow } from "../types";

// Generates Titanic dataset
function generateTitanic(): DatasetRow[] {
  const sexWeights = { male: 0.2, female: 0.74 };
  const pclassWeights = { 1: 0.63, 2: 0.47, 3: 0.24 };
  
  const rows: DatasetRow[] = [];
  const namesMale = ["John Smith", "William Carter", "Thomas Andrews", "Charles Alworth", "Edward Ryan", "George Wright", "Henry Thorne", "Richard Knight", "James Bradley", "Albert Cole"];
  const namesFemale = ["Mary Alice", "Florence Nightingale", "Elizabeth Ward", "Margaret Brown", "Helen Loraine", "Anna Ward", "Emily Borie", "Clara Barton", "Sarah Benson", "Catherine Webb"];
  
  for (let i = 0; i < 60; i++) {
    const isMale = i % 2 === 0;
    const sex = isMale ? "male" : "female";
    const pclass = (i % 3) + 1; // 1, 2, 3
    const name = isMale ? namesMale[i % namesMale.length] : namesFemale[i % namesFemale.length];
    
    // Deterministic survival logic with some random noise for real ML modeling
    const survivalProb = (sexWeights[sex] + pclassWeights[pclass as 1 | 2 | 3]) / 1.5;
    const survived = (i * 17) % 100 < survivalProb * 100 ? 1 : 0;
    
    const baseAge = pclass === 1 ? 38 : pclass === 2 ? 29 : 24;
    const age = Math.round(baseAge + ((i * 7) % 25) - 10);
    const sibSp = (i % 4) === 0 ? 1 : 0;
    const parch = (i % 5) === 0 ? 1 : 0;
    const fare = Math.round((pclass === 1 ? 80 : pclass === 2 ? 25 : 8) + ((i * 13) % 15));

    rows.push({
      Survived: survived,
      Pclass: pclass,
      Name: `${name} #${i+1}`,
      Sex: sex,
      Age: age,
      SibSp: sibSp,
      Parch: parch,
      Fare: fare,
    });
  }
  return rows;
}

// Generates Iris dataset
function generateIris(): DatasetRow[] {
  const species = ["setosa", "versicolor", "virginica"];
  const rows: DatasetRow[] = [];
  
  for (let i = 0; i < 60; i++) {
    const spIndex = Math.floor(i / 20);
    const sp = species[spIndex];
    
    let sepalLength = 0, sepalWidth = 0, petalLength = 0, petalWidth = 0;
    
    // Iris measurements with distinct clustering distributions
    if (sp === "setosa") {
      sepalLength = 5.0 + ((i * 3) % 8) * 0.1;
      sepalWidth = 3.4 + ((i * 5) % 6) * 0.1;
      petalLength = 1.4 + ((i * 7) % 4) * 0.1;
      petalWidth = 0.2 + ((i * 9) % 3) * 0.1;
    } else if (sp === "versicolor") {
      sepalLength = 5.9 + ((i * 3) % 10) * 0.1;
      sepalWidth = 2.7 + ((i * 5) % 5) * 0.1;
      petalLength = 4.2 + ((i * 7) % 8) * 0.1;
      petalWidth = 1.3 + ((i * 9) % 4) * 0.1;
    } else { // virginica
      sepalLength = 6.5 + ((i * 3) % 12) * 0.1;
      sepalWidth = 2.9 + ((i * 5) % 6) * 0.1;
      petalLength = 5.5 + ((i * 7) % 10) * 0.1;
      petalWidth = 2.0 + ((i * 9) % 5) * 0.1;
    }
    
    rows.push({
      SepalLength: parseFloat(sepalLength.toFixed(1)),
      SepalWidth: parseFloat(sepalWidth.toFixed(1)),
      PetalLength: parseFloat(petalLength.toFixed(1)),
      PetalWidth: parseFloat(petalWidth.toFixed(1)),
      Species: sp
    });
  }
  return rows;
}

// Generates California Housing dataset
function generateCaliforniaHousing(): DatasetRow[] {
  const rows: DatasetRow[] = [];
  for (let i = 0; i < 60; i++) {
    // Generate logical relationship: higher income -> higher house value
    const medInc = parseFloat((2.0 + ((i * 11) % 8) * 0.8).toFixed(2));
    const houseAge = Math.round(15 + ((i * 7) % 35));
    const aveRooms = parseFloat((4.0 + medInc * 0.4 + ((i * 3) % 3) * 0.3).toFixed(1));
    const aveBedrms = parseFloat((1.0 + ((i * 2) % 3) * 0.1).toFixed(1));
    const population = Math.round(400 + ((i * 17) % 25) * 100);
    const aveOccup = parseFloat((2.2 + ((i * 5) % 4) * 0.3).toFixed(1));
    
    // Predictable house value with some random error
    const medHouseValue = parseFloat((medInc * 55 + houseAge * 0.8 - population * 0.01 + 100 + ((i * 19) % 40)).toFixed(1));
    
    rows.push({
      MedInc: medInc,
      HouseAge: houseAge,
      AveRooms: aveRooms,
      AveBedrms: aveBedrms,
      Population: population,
      AveOccup: aveOccup,
      MedHouseValue: medHouseValue
    });
  }
  return rows;
}

// Generates Mall Customers dataset with 5 clear clusters for segmentation
function generateMallCustomers(): DatasetRow[] {
  const rows: DatasetRow[] = [];
  
  // 5 clusters:
  // 1. Low Income, Low Spending (Sensible/Poor)
  // 2. Low Income, High Spending (Careless)
  // 3. Medium Income, Medium Spending (Standard)
  // 4. High Income, Low Spending (Careful)
  // 5. High Income, High Spending (Target/Premium)
  
  const clusterDefinitions = [
    { income: [20, 35], spending: [10, 35], gender: "Female" },
    { income: [20, 38], spending: [65, 95], gender: "Male" },
    { income: [45, 65], spending: [40, 60], gender: "Female" },
    { income: [75, 110], spending: [10, 35], gender: "Male" },
    { income: [75, 120], spending: [70, 95], gender: "Female" }
  ];
  
  for (let i = 0; i < 60; i++) {
    const clusterIdx = i % 5;
    const def = clusterDefinitions[clusterIdx];
    
    const incomeBase = def.income[0];
    const incomeRange = def.income[1] - def.income[0];
    const annualIncome = Math.round(incomeBase + ((i * 13) % (incomeRange + 1)));
    
    const spendingBase = def.spending[0];
    const spendingRange = def.spending[1] - def.spending[0];
    const spendingScore = Math.round(spendingBase + ((i * 19) % (spendingRange + 1)));
    
    const age = Math.round(18 + ((i * 9) % 52));
    const gender = def.gender;
    
    rows.push({
      CustomerID: 1000 + i + 1,
      Gender: gender,
      Age: age,
      AnnualIncome: annualIncome,
      SpendingScore: spendingScore
    });
  }
  return rows;
}

// Computes stats and types dynamically for a given row set
export function buildDataset(name: string, rows: DatasetRow[]): Dataset {
  if (rows.length === 0) {
    return { name, rows: [], columns: [], metadata: [], stats: {} };
  }
  
  const columns = Object.keys(rows[0]);
  
  const metadata: ColumnMetadata[] = columns.map(col => {
    // Infer column type
    const values = rows.map(r => r[col]);
    const nonNullValues = values.filter(v => v !== undefined && v !== null && v !== "");
    
    let type: "numeric" | "categorical" | "boolean" = "categorical";
    if (nonNullValues.every(v => typeof v === "boolean" || v === 1 || v === 0) && col === "Survived") {
      type = "boolean";
    } else if (nonNullValues.every(v => !isNaN(Number(v)) && typeof v !== "boolean")) {
      type = "numeric";
    } else if (nonNullValues.every(v => typeof v === "boolean")) {
      type = "boolean";
    }
    
    const missingCount = rows.length - nonNullValues.length;
    const uniqueValues = new Set(nonNullValues).size;
    
    return {
      name: col,
      type,
      missingCount,
      uniqueValues
    };
  });
  
  const stats: { [colName: string]: ColumnStats } = {};
  
  columns.forEach(col => {
    const meta = metadata.find(m => m.name === col);
    if (!meta) return;
    
    const colValues = rows.map(r => r[col]).filter(v => v !== undefined && v !== null && v !== "");
    
    if (meta.type === "numeric") {
      const nums = colValues.map(v => Number(v));
      const n = nums.length;
      if (n === 0) return;
      
      const mean = nums.reduce((sum, v) => sum + v, 0) / n;
      
      const sorted = [...nums].sort((a, b) => a - b);
      const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)];
      const min = sorted[0];
      const max = sorted[n - 1];
      
      // Variance & StdDev
      const variance = nums.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (n - 1 || 1);
      const stdDev = Math.sqrt(variance);
      
      // Skewness
      let skewness = 0;
      if (stdDev > 0 && n > 2) {
        const sumCubed = nums.reduce((sum, v) => sum + Math.pow(v - mean, 3), 0);
        skewness = (n * sumCubed) / ((n - 1) * (n - 2) * Math.pow(stdDev, 3));
      }
      
      // Kurtosis
      let kurtosis = 0;
      if (stdDev > 0 && n > 3) {
        const sumFourth = nums.reduce((sum, v) => sum + Math.pow(v - mean, 4), 0);
        const term1 = (n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3));
        const term2 = sumFourth / Math.pow(stdDev, 4);
        const term3 = (3 * Math.pow(n - 1, 2)) / ((n - 2) * (n - 3));
        kurtosis = term1 * term2 - term3;
      }
      
      stats[col] = {
        mean: parseFloat(mean.toFixed(3)),
        median: parseFloat(median.toFixed(3)),
        min: parseFloat(min.toFixed(3)),
        max: parseFloat(max.toFixed(3)),
        stdDev: parseFloat(stdDev.toFixed(3)),
        variance: parseFloat(variance.toFixed(3)),
        skewness: parseFloat(skewness.toFixed(3)),
        kurtosis: parseFloat(kurtosis.toFixed(3))
      };
    } else {
      // Categorical / Boolean frequency mapping
      const freq: { [v: string]: number } = {};
      colValues.forEach(val => {
        const strVal = String(val);
        freq[strVal] = (freq[strVal] || 0) + 1;
      });
      stats[col] = {
        frequencyMap: freq
      };
    }
  });
  
  return {
    name,
    rows,
    columns,
    metadata,
    stats
  };
}

// Export preloaded datasets
export const preloadedDatasets: { [key: string]: () => Dataset } = {
  Titanic: () => buildDataset("Titanic Passengers", generateTitanic()),
  Iris: () => buildDataset("Iris Flowers", generateIris()),
  CaliforniaHousing: () => buildDataset("California Housing", generateCaliforniaHousing()),
  MallCustomers: () => buildDataset("Mall Customer Segmentation", generateMallCustomers())
};
