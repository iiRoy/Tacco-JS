function processInputData(rawData) {
  const lineValues = rawData.split("\n");
  const dataLength = parseInt(lineValues[0], 10);
  const dataElements = [];

  for (let idx = 0; idx < dataLength; idx++) {
    dataElements.push(parseInt(lineValues[idx + 1], 10));
  }

  const grandTotal = dataElements.reduce((acc, val) => acc + val, 0);

  // Memoization tables for recursive DP
  // cacheA stores results for 2-color combinations (R/G)
  const cacheA = Array(dataLength);
  // cacheB stores results for 3-color combinations (R/G/B)
  const cacheB = Array(dataLength);

  for (let idx = 0; idx < dataLength; idx++) {
    cacheA[idx] = Array(grandTotal + 1).fill(null);
    cacheB[idx] = Array(grandTotal + 1).fill(null);
  }

  const MOD_VAL = 998244353;

  // Helper for modular exponentiation to avoid overflow for 3^N
  function modularExponent(base, exp, mod) {
    let res = 1;
    base %= mod;
    while (exp > 0) {
      if (exp % 2 === 1) res = (res * base) % mod;
      base = (base * base) % mod;
      exp = Math.floor(exp / 2);
    }
    return res;
  }

  // Recursive function to count ways for 2 colors (R and G)
  // `indexPosition` refers to the current item being considered (from dataElements)
  // `currentSumValue` is the target sum for items colored 'R'
  function calculatePairs(indexPosition, currentSumValue) {
    if (currentSumValue === 0) {
      return 1; // One way to get sum 0 (by selecting no items)
    }
    if (indexPosition < 0) {
      return 0; // No items left to consider, and sum is not 0
    }

    if (cacheA[indexPosition][currentSumValue] !== null) {
      return cacheA[indexPosition][currentSumValue];
    }

    let resultCount = 0;
    // Option 1: Current item is colored 'G' (not included in R-sum)
    resultCount = calculatePairs(indexPosition - 1, currentSumValue);

    // Option 2: Current item is colored 'R' (included in R-sum)
    if (currentSumValue >= dataElements[indexPosition]) {
      resultCount += calculatePairs(indexPosition - 1, currentSumValue - dataElements[indexPosition]);
    }

    cacheA[indexPosition][currentSumValue] = resultCount;
    return resultCount;
  }

  // Recursive function to count ways for 3 colors (R, G, and B)
  // `indexPosition` refers to the current item being considered
  // `currentSumValue` is the target sum for items colored 'R'
  function calculateTriples(indexPosition, currentSumValue) {
    if (currentSumValue === 0) {
      return 1; // One way to get R-sum 0 (by coloring no item as R)
    }
    if (indexPosition < 0) {
      return 0; // No items left to consider, and R-sum is not 0
    }

    if (cacheB[indexPosition][currentSumValue] !== null) {
      return cacheB[indexPosition][currentSumValue];
    }

    let resultCount = 0;
    // Option 1: Current item is colored 'G' or 'B' (2 ways, not included in R-sum)
    resultCount = 2 * calculateTriples(indexPosition - 1, currentSumValue);

    // Option 2: Current item is colored 'R' (1 way, included in R-sum)
    if (currentSumValue >= dataElements[indexPosition]) {
      resultCount += calculateTriples(indexPosition - 1, currentSumValue - dataElements[indexPosition]);
    }

    cacheB[indexPosition][currentSumValue] = resultCount;
    return resultCount;
  }

  // Calculate total possible colorings (3^N) modulo MOD_VAL
  const overallPower = modularExponent(3, dataLength, MOD_VAL);
  let partialSumAlpha = 0; // Corresponds to 'sum' in original
  let partialSumBeta = 0;  // Corresponds to 'sum1' in original

  // Sum up results for calculateTriples for sums from floor(S/2) to S
  for (let sVal = Math.floor(grandTotal / 2); sVal <= grandTotal; sVal++) {
    partialSumAlpha = (partialSumAlpha + calculateTriples(dataLength - 1, sVal));
  }

  // Get result for calculatePairs if S is even and s=S/2
  if (grandTotal % 2 === 0) {
    partialSumBeta = calculatePairs(dataLength - 1, grandTotal / 2);
  }

  // Apply the final inclusion-exclusion formula
  let finalOutcome = (overallPower - 3 * partialSumAlpha + 3 * partialSumBeta);

  // Ensure result is positive before applying final modulo
  finalOutcome = (finalOutcome % MOD_VAL + MOD_VAL) % MOD_VAL;

  console.log(finalOutcome);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));