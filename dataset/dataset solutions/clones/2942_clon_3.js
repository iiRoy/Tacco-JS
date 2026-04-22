'use strict';
((dataSource) => {
  // Define a constant for the large prime modulus.
  const PRIME_MODULO = 1000000007;

  // Helper function to perform modular addition, ensuring positive result.
  const performModularAddition = (val1, val2, mod) => (val1 + val2) % mod;

  // Helper function for modular multiplication, carefully handling potential overflows
  // by splitting numbers, similar to the original code's intent for large intermediate products.
  const performModularMultiplication = (factorA, factorB, mod) => {
      // Using a split point of 2^16 (65536) for intermediate calculations.
      const SPLIT_POINT = 65536;

      let aHigh = Math.floor(factorA / SPLIT_POINT);
      let aLow = factorA % SPLIT_POINT;

      let bHigh = Math.floor(factorB / SPLIT_POINT);
      let bLow = factorB % SPLIT_POINT;

      // Calculate (aHigh * SPLIT_POINT + aLow) * (bHigh * SPLIT_POINT + bLow) % mod
      // = (aHigh * bHigh * SPLIT_POINT^2 + aHigh * bLow * SPLIT_POINT + aLow * bHigh * SPLIT_POINT + aLow * bLow) % mod
      let termPart1 = (aHigh * bHigh) % mod;
      termPart1 = (termPart1 * SPLIT_POINT) % mod;
      termPart1 = (termPart1 * SPLIT_POINT) % mod;

      let termPart2 = (aHigh * bLow) % mod;
      termPart2 = (termPart2 * SPLIT_POINT) % mod;

      let termPart3 = (aLow * bHigh) % mod;
      termPart3 = (termPart3 * SPLIT_POINT) % mod;

      let termPart4 = (aLow * bLow) % mod;

      let computedResult = (termPart1 + termPart2 + termPart3 + termPart4) % mod;
      return (computedResult + mod) % mod; // Ensure final result is positive
  };

  // Process the raw string input into numerical dimensions and counts.
  const processInputData = (rawData) => {
    const rawTokens = rawData.trim().split(/\s+/).map(str => Number.parseInt(str, 10));

    // Guard clause: ensure minimum required input tokens.
    if (rawTokens.length < 3) {
      console.error("Input error: Expected at least three numerical values.");
      return null;
    }

    const firstDimension = rawTokens[0];
    const secondDimension = rawTokens[1];
    const selectionCount = rawTokens[2];

    // Ensure non-negative dimensions.
    if (firstDimension < 0 || secondDimension < 0) {
        console.error("Input error: Dimensions cannot be negative.");
        return null;
    }
    
    // Normalize dimensions to ensure `minDimension` is always the smaller one.
    const minDimension = Math.min(firstDimension, secondDimension);
    const maxDimension = Math.max(firstDimension, secondDimension);
    
    return {
      minDim: minDimension,
      maxDim: maxDimension,
      selectK: selectionCount
    };
  };

  const parsedParams = processInputData(dataSource);
  if (!parsedParams) {
      // If input parsing failed, exit.
      return;
  }

  const { minDim: gridRows, maxDim: gridCols, selectK: pickCount } = parsedParams;

  // Early exit for invalid 'pickCount' values based on combinatorics.
  if (pickCount < 2) {
      console.log(0); // (N*M-2)C(K-2) will be 0 if K-2 < 0
      return;
  }

  let finalAccumulatedValue = 0; // The main result accumulator before combinatorics.

  // --- Segment 1: Iteration for 'diagonal' lengths from 1 to gridRows-1 ---
  // This covers scenarios where the 'diagonal' fits entirely within the smaller dimension.
  for (let currentD = 1; currentD < gridRows; currentD++) {
    const dPlus1 = currentD + 1;
    const dPlus2 = currentD + 2;
    const dPlus3 = currentD + 3;

    // Calculate component terms
    const termX = (dPlus1 * dPlus2 * dPlus3) / 6;
    const termY = ((gridRows - currentD - 1) + (gridCols - currentD - 1)) * (dPlus1 * dPlus2) / 2;
    const termZ = (gridRows - currentD - 1) * (gridCols - currentD - 1) * dPlus1;
    const termW = (gridRows - currentD) * gridCols + (gridCols - currentD) * gridRows;

    // Combine terms and add to accumulator
    let iterationSum = performModularAddition(performModularAddition(termX, termY, PRIME_MODULO), termZ, PRIME_MODULO);
    iterationSum = performModularMultiplication(iterationSum, 2, PRIME_MODULO);
    iterationSum = performModularAddition(iterationSum, -termW, PRIME_MODULO);
    
    finalAccumulatedValue = performModularAddition(finalAccumulatedValue, performModularMultiplication(currentD, iterationSum, PRIME_MODULO), PRIME_MODULO);
  }

  // --- Segment 2: Iteration for 'diagonal' lengths from gridRows to gridCols-1 ---
  // This covers scenarios where the 'diagonal' spans the full smaller dimension but not the larger.
  for (let currentD = gridRows; currentD < gridCols; currentD++) {
    const N_val = gridRows;
    const N_plus1 = N_val + 1;
    const N_plus2 = N_val + 2;

    // Calculate component terms
    const termX_prime = (N_val * N_plus1 * N_plus2) / 6;
    const termY_prime = (gridCols - currentD - 1) * (N_val * N_plus1) / 2;
    const termW_prime = (gridCols - currentD) * N_val;

    // Combine terms and add to accumulator. Note: terms for C and D were implicitly zero in original.
    let iterationSum_prime = performModularAddition(termX_prime, termY_prime, PRIME_MODULO);
    iterationSum_prime = performModularMultiplication(iterationSum_prime, 2, PRIME_MODULO);
    iterationSum_prime = performModularAddition(iterationSum_prime, -termW_prime, PRIME_MODULO);

    finalAccumulatedValue = performModularAddition(finalAccumulatedValue, performModularMultiplication(currentD, iterationSum_prime, PRIME_MODULO), PRIME_MODULO);
  }

  // --- Segment 3: Iteration for 'diagonal' lengths from gridCols to gridRows+gridCols-2 ---
  // This covers scenarios where the 'diagonal' extends beyond both dimensions.
  for (let currentD = gridCols; currentD <= (gridRows + gridCols - 2); currentD++) {
    const effectiveDimension = gridRows + gridCols - 1 - currentD;
    const effDimPlus1 = effectiveDimension + 1;
    const effDimPlus2 = effectiveDimension + 2;

    // Calculate component terms
    const termX_doublePrime = (effectiveDimension * effDimPlus1 * effDimPlus2) / 6;

    // Combine terms and add to accumulator. Note: terms for B, C, D were implicitly zero in original.
    let iterationSum_doublePrime = performModularMultiplication(termX_doublePrime, 2, PRIME_MODULO);
    
    finalAccumulatedValue = performModularAddition(finalAccumulatedValue, performModularMultiplication(currentD, iterationSum_doublePrime, PRIME_MODULO), PRIME_MODULO);
  }

  // Calculate the combinatorial factor: (gridRows * gridCols - 2) C (pickCount - 2)
  const totalCellsMinus2 = (gridRows * gridCols) - 2;
  const kMinus2 = pickCount - 2;

  // Handle edge cases for combinations (nCk)
  if (kMinus2 < 0 || kMinus2 > totalCellsMinus2) {
      console.log(0); // Combination is 0 if k < 0 or k > n
      return;
  }
  if (kMinus2 === 0 || kMinus2 === totalCellsMinus2) {
      // nC0 = 1, nCn = 1. No further multiplication needed for this factor.
      console.log((finalAccumulatedValue + PRIME_MODULO) % PRIME_MODULO);
      return;
  }

  // Compute the numerator for the combination: P(n, k) = n! / (n-k)!
  let combinatoricsNumerator = 1;
  for (let i = 0; i < kMinus2; i++) {
    combinatoricsNumerator = performModularMultiplication(combinatoricsNumerator, (totalCellsMinus2 - i), PRIME_MODULO);
  }

  // Compute the denominator for the combination: k!
  let combinatoricsDenominator = 1;
  for (let i = 1; i <= kMinus2; i++) {
    combinatoricsDenominator = performModularMultiplication(combinatoricsDenominator, i, PRIME_MODULO);
  }

  // Use the Extended Euclidean Algorithm to find the modular multiplicative inverse of the denominator.
  // This is required for division in modular arithmetic: (A / B) % M = (A * B^-1) % M
  let r_current = PRIME_MODULO;
  let r_previous = combinatoricsDenominator;
  let s_current = 0;
  let s_previous = 1;
  let t_current = 1;
  let t_previous = 0;

  while (r_previous !== 0) {
      const quotient = Math.floor(r_current / r_previous);
      
      const r_next = r_current % r_previous;
      const s_next = s_current - quotient * s_previous;
      const t_next = t_current - quotient * t_previous;
      
      r_current = r_previous;
      r_previous = r_next;
      
      s_current = s_previous;
      s_previous = s_next;
      
      t_current = t_previous;
      t_previous = t_next;
  }

  // The modular inverse is t_current (from the iteration where r_previous became 0)
  // Ensure the inverse is positive within the modulo range.
  const modularInverse = (t_current % PRIME_MODULO + PRIME_MODULO) % PRIME_MODULO;

  // Final calculation: (finalAccumulatedValue * combinatoricsNumerator * modularInverse) % PRIME_MODULO
  let finalCalculatedAnswer = performModularMultiplication(finalAccumulatedValue, combinatoricsNumerator, PRIME_MODULO);
  finalCalculatedAnswer = performModularMultiplication(finalCalculatedAnswer, modularInverse, PRIME_MODULO);
  
  // Output the final, normalized result.
  console.log((finalCalculatedAnswer + PRIME_MODULO) % PRIME_MODULO);

})(require('node:fs').readFileSync('/dev/stdin', { encoding: 'utf8', flag: 'r' }));