import { DatasetRow } from "../types";

export interface StreamConfig {
  type: "iot" | "fraud" | "titanic" | "iris";
  interval: number;
}

// 1. GENERATE SINGLE STREAMING IOT ROW
export function generateStreamingIoTRow(index: number): DatasetRow {
  // Simulate temperature fluctuating with optional spikes
  const isAnomaly = Math.random() < 0.08;
  const tempBase = 65.0 + Math.sin(index / 10) * 8.0;
  const temperature = parseFloat((tempBase + (isAnomaly ? Math.random() * 25 + 15 : Math.random() * 3 - 1.5)).toFixed(2));
  
  // Vibration
  const vibBase = 45.0 + Math.cos(index / 5) * 5.0;
  const vibration = parseFloat((vibBase + (isAnomaly ? Math.random() * 30 + 10 : Math.random() * 2 - 1.0)).toFixed(2));
  
  // Pressure
  const pressure = parseFloat((120.0 + Math.sin(index / 8) * 12.0 + (isAnomaly ? Math.random() * 40 - 20 : Math.random() * 4 - 2)).toFixed(1));
  
  // Power Draw
  const powerDraw = parseFloat((4.5 + Math.sin(index / 15) * 1.5 + (isAnomaly ? Math.random() * 2.5 + 1.5 : Math.random() * 0.4 - 0.2)).toFixed(2));
  
  // Load percentage
  const currentLoad = Math.min(100, Math.max(10, Math.round(70 + Math.sin(index / 12) * 20 + (isAnomaly ? 15 : Math.random() * 8 - 4))));

  // Status
  let status = "OPTIMAL";
  if (temperature > 85 || vibration > 70 || currentLoad > 95) {
    status = "CRITICAL";
  } else if (temperature > 75 || vibration > 55 || currentLoad > 85) {
    status = "WARNING";
  }

  return {
    PacketID: 2000 + index,
    Timestamp: new Date().toLocaleTimeString(),
    "Temperature (°C)": temperature,
    "Vibration (Hz)": vibration,
    "Pressure (PSI)": pressure,
    "Power Draw (kW)": powerDraw,
    "Current Load (%)": currentLoad,
    Status: status,
    Anomaly: isAnomaly ? 1 : 0
  };
}

// 2. GENERATE SINGLE STREAMING FRAUD ROW
export function generateStreamingFraudRow(index: number): DatasetRow {
  const isAnomaly = Math.random() < 0.06;
  const amount = isAnomaly 
    ? parseFloat((Math.random() * 800 + 400).toFixed(2)) 
    : parseFloat((Math.random() * 80 + 5).toFixed(2));
  
  const distance = isAnomaly
    ? parseFloat((Math.random() * 350 + 80).toFixed(1))
    : parseFloat((Math.random() * 12 + 0.1).toFixed(2));
  
  const merchantCategories = ["Groceries", "Dining", "Gas Station", "Online Tech", "Luxury Apparel", "Crypto Broker", "ATM Cash-out"];
  const category = isAnomaly 
    ? merchantCategories[Math.floor(Math.random() * 2) + 5] // Crypto or ATM
    : merchantCategories[Math.floor(Math.random() * 5)];
  
  const failedAttempts = isAnomaly 
    ? Math.floor(Math.random() * 3) + 1 
    : (Math.random() < 0.03 ? 1 : 0);
    
  const age = Math.round(18 + Math.random() * 62);
  
  let riskScore = Math.round((amount / 1000) * 30 + (distance / 400) * 40 + failedAttempts * 20 + Math.random() * 10);
  riskScore = Math.min(100, Math.max(0, riskScore));
  
  let classification = "LOW";
  if (riskScore > 75 || isAnomaly) {
    classification = "SUSPICIOUS";
  } else if (riskScore > 40) {
    classification = "MEDIUM";
  }

  return {
    TxID: 50000 + index,
    Timestamp: new Date().toLocaleTimeString(),
    "Amount (USD)": amount,
    "Distance (km)": distance,
    MerchantCategory: category,
    "Failed PIN Attempts": failedAttempts,
    CardholderAge: age,
    RiskScore: riskScore,
    Status: classification,
    Fraud: isAnomaly ? 1 : 0
  };
}

// 3. GENERATE SINGLE STREAMING TITANIC ROW
export function generateStreamingTitanicRow(index: number): DatasetRow {
  const isMale = Math.random() < 0.52;
  const sex = isMale ? "male" : "female";
  const pclass = Math.floor(Math.random() * 3) + 1;
  const namesMale = ["Arthur Pendelton", "Sebastian Vance", "Walter Sterling", "Julian Vance", "Lucas Montgomery", "Charles Sterling"];
  const namesFemale = ["Clara Oswald", "Dorothy Gale", "Beatrice Prior", "Rose Dawson", "Eleanor Vance", "Victoria Thorne"];
  const name = isMale 
    ? namesMale[Math.floor(Math.random() * namesMale.length)] 
    : namesFemale[Math.floor(Math.random() * namesFemale.length)];
  
  const survivalProb = (sex === "female" ? 0.75 : 0.20) + (pclass === 1 ? 0.15 : pclass === 2 ? 0.0 : -0.15);
  const survived = Math.random() < survivalProb ? 1 : 0;
  
  const age = Math.round((pclass === 1 ? 38 : pclass === 2 ? 29 : 24) + (Math.random() * 20 - 10));
  const fare = Math.round((pclass === 1 ? 85 : pclass === 2 ? 28 : 9) + (Math.random() * 15 - 5));

  return {
    Survived: survived,
    Pclass: pclass,
    Name: `${name} (Virtual #${index})`,
    Sex: sex,
    Age: Math.max(1, age),
    SibSp: Math.random() < 0.15 ? 1 : 0,
    Parch: Math.random() < 0.1 ? 1 : 0,
    Fare: Math.max(0, fare),
  };
}

// 4. GENERATE SINGLE STREAMING IRIS ROW
export function generateStreamingIrisRow(index: number): DatasetRow {
  const speciesList = ["setosa", "versicolor", "virginica"];
  const sp = speciesList[index % 3];
  
  let sepalLength = 0, sepalWidth = 0, petalLength = 0, petalWidth = 0;
  
  if (sp === "setosa") {
    sepalLength = 5.0 + Math.random() * 0.8 - 0.4;
    sepalWidth = 3.4 + Math.random() * 0.6 - 0.3;
    petalLength = 1.4 + Math.random() * 0.4 - 0.2;
    petalWidth = 0.2 + Math.random() * 0.15 - 0.07;
  } else if (sp === "versicolor") {
    sepalLength = 5.9 + Math.random() * 1.0 - 0.5;
    sepalWidth = 2.7 + Math.random() * 0.5 - 0.25;
    petalLength = 4.2 + Math.random() * 0.8 - 0.4;
    petalWidth = 1.3 + Math.random() * 0.3 - 0.15;
  } else {
    sepalLength = 6.5 + Math.random() * 1.2 - 0.6;
    sepalWidth = 2.9 + Math.random() * 0.5 - 0.25;
    petalLength = 5.5 + Math.random() * 1.0 - 0.5;
    petalWidth = 2.0 + Math.random() * 0.4 - 0.2;
  }

  return {
    SepalLength: parseFloat(sepalLength.toFixed(1)),
    SepalWidth: parseFloat(sepalWidth.toFixed(1)),
    PetalLength: parseFloat(petalLength.toFixed(1)),
    PetalWidth: parseFloat(petalWidth.toFixed(1)),
    Species: sp
  };
}
