"use strict";

function primeGenerator(limitValue) {
  const isComposite = new Array(limitValue + 1).fill(false);
  if (limitValue >= 0) isComposite[0] = true;
  if (limitValue >= 1) isComposite[1] = true;

  for (let currentPrimeCandidate = 2; currentPrimeCandidate * currentPrimeCandidate <= limitValue; currentPrimeCandidate++) {
    if (!isComposite[currentPrimeCandidate]) {
      for (let multiple = currentPrimeCandidate * currentPrimeCandidate; multiple <= limitValue; multiple += currentPrimeCandidate)
        isComposite[multiple] = true;
    }
  }

  const generatedPrimes = [];
  for (let number = 2; number <= limitValue; number++) {
    if (!isComposite[number]) {
      generatedPrimes.push(number);
    }
  }
  return generatedPrimes;
}

function determineFactorialPrimeExponents(upperLimit) {
  const primeList = primeGenerator(upperLimit);
  const primePowerAccumulations = new Map();

  for (const pVal of primeList) {
    let currentMultiple = pVal;
    let totalExponentContribution = 0;
    while (currentMultiple <= upperLimit) {
      totalExponentContribution += Math.floor(upperLimit / currentMultiple);
      if (upperLimit / currentMultiple < pVal) break;
      currentMultiple *= pVal;
    }
    primePowerAccumulations.set(pVal, totalExponentContribution);
  }
  return primePowerAccumulations;
}

function assessThresholdCompliance(minimumThreshold, sourcePowerMap) {
  let compliantCount = 0;
  for (const powerVal of sourcePowerMap.values()) {
    if (powerVal >= minimumThreshold) {
      compliantCount++;
    }
  }
  return compliantCount;
}

function executeComputation(rawInputData) {
  const ultimateBound = parseInt(rawInputData.trim().split(/\s+/)[0], 10);

  const primePowerAccumulations = determineFactorialPrimeExponents(ultimateBound);

  const relevantThresholds = [74, 24, 14, 4, 2];
  const exponentCategorySummaries = new Map();
  for (const threshold of relevantThresholds) {
    exponentCategorySummaries.set(threshold, assessThresholdCompliance(threshold, primePowerAccumulations));
  }

  const countAbove74 = exponentCategorySummaries.get(74) || 0;
  const countAbove24 = exponentCategorySummaries.get(24) || 0;
  const countAbove14 = exponentCategorySummaries.get(14) || 0;
  const countAbove4 = exponentCategorySummaries.get(4) || 0;
  const countAbove2 = exponentCategorySummaries.get(2) || 0;

  let resultAggregate = 0;

  // Pattern 1: p^74
  resultAggregate += countAbove74;

  // Pattern 2: p1^24 * p2^2 (p1 != p2)
  resultAggregate += countAbove24 * Math.max(0, countAbove2 - 1);

  // Pattern 3: p1^14 * p2^4 (p1 != p2)
  resultAggregate += countAbove14 * Math.max(0, countAbove4 - 1);

  // Pattern 4: p1^4 * p2^4 * p3^2 (p1, p2, p3 distinct)
  // C(countAbove4, 2) * (countAbove2 - 2)
  if (countAbove4 >= 2 && countAbove2 >= 3) {
    resultAggregate += (countAbove4 * (countAbove4 - 1) / 2) * (countAbove2 - 2);
  }

  console.log(resultAggregate);
}

executeComputation(require("fs").readFileSync("/dev/stdin", "utf8"));