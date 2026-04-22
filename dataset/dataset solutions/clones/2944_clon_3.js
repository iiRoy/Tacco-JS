'use strict';

// This immediately-invoked function expression (IIFE) encapsulates the core logic.
// It takes raw input data as a string, processes it, performs calculations, and logs the result.
(function(rawInputString) {

  // --- Input Acquisition and Initial Parameter Setup ---

  // Validate the existence and type of the input string.
  if (!rawInputString || typeof rawInputString !== 'string') {
    console.error("Execution Aborted: No valid input string was provided.");
    return; // Halt execution if input is invalid.
  }

  // Parse the input string into an array of numerical values.
  // Original: input.trim().split(/\s+/).map(x=>x-0);
  // Clone: More explicit parsing with parseInt, includes basic validation.
  const parsedNumericValues = rawInputString
    .trim() // Remove any leading or trailing whitespace.
    .split(/\s+/) // Split the string by one or more whitespace characters.
    .map(strVal => {
      const num = parseInt(strVal, 10); // Convert string part to a base-10 integer.
      if (isNaN(num)) {
        console.error(`Error: Found non-numeric input '${strVal}'. All inputs must be integers.`);
        throw new Error("Invalid input format detected."); // Terminate on bad data.
      }
      return num;
    });

  // Verify that a sufficient number of parameters were provided.
  if (parsedNumericValues.length < 3) {
    console.error("Execution Aborted: Insufficient input parameters. Expected at least three integers.");
    return;
  }

  // Extract and order the primary dimensions (N and M in original code).
  // Original: const N=Math.min(input[0],input[1]); const M=Math.max(input[0],input[1]);
  // Clone: Uses an explicit conditional check instead of Math.min/max.
  let primaryDimension, secondaryDimension;
  if (parsedNumericValues[0] <= parsedNumericValues[1]) {
    primaryDimension = parsedNumericValues[0];
    secondaryDimension = parsedNumericValues[1];
  } else {
    primaryDimension = parsedNumericValues[1];
    secondaryDimension = parsedNumericValues[0];
  }

  // Extract the selection count (K in original code).
  const selectionQuantity = parsedNumericValues[2];

  // Define the large prime modulus for all arithmetic operations.
  // Original: const E=Math.pow(10,9)+7;
  // Clone: Written out for clarity, renamed.
  const largePrimeModulus = 1_000_000_000 + 7; // A common modulus in competitive programming.

  // Initialize the aggregate sum variable.
  let computedTotal = BigInt(0); // Using BigInt to prevent overflow before modulo.

  // --- Helper Functions for Modular Arithmetic ---

  // Performs modular addition: (a + b) % mod
  const performModularAddition = (valA, valB, modulus) => {
    return (valA + valB) % BigInt(modulus);
  };

  // Performs modular multiplication: (a * b) % mod
  const performModularMultiplication = (valA, valB, modulus) => {
    return (BigInt(valA) * BigInt(valB)) % BigInt(modulus);
  };

  // Implements the Extended Euclidean Algorithm to find the modular multiplicative inverse.
  // This is used for modular division (a / b % mod = a * (b^-1) % mod).
  // Original: The logic was embedded directly in the loop.
  // Clone: Extracted into a reusable, named function with clearer variable names.
  function findModularMultiplicativeInverse(numberToInvert, modulus) {
    if (numberToInvert === 0 || modulus === 0) {
      throw new Error("Modular inverse cannot be computed for zero.");
    }
    // Ensure number is within the range [0, modulus-1]
    let currentA = BigInt(numberToInvert);
    let currentB = BigInt(modulus);
    let prevX = BigInt(0);
    let currX = BigInt(1);

    currentA %= currentB;
    if (currentA < 0) currentA += currentB;

    while (currentA > 1) {
      const quotient = currentB / currentA;
      let tempA = currentA;
      currentA = currentB % currentA;
      currentB = tempA;

      let tempX = prevX;
      prevX = currX - quotient * prevX;
      currX = tempX;
    }

    if (currX < 0) {
      currX += BigInt(modulus);
    }
    return currX;
  }

  // --- First Calculation Phase (Distances from 1 to primaryDimension - 1) ---
  // This loop processes terms where 'd' is less than 'N'.
  // Original: for(let d=1;d<=N-1;d++){ ... }
  // Clone: Renamed loop variable, expanded intermediate calculations.
  for (let currentIterationDistance = 1; currentIterationDistance <= primaryDimension - 1; ++currentIterationDistance) {
    // Pre-calculate common terms to improve readability and potentially performance.
    const onePlusDist = BigInt(currentIterationDistance + 1);
    const twoPlusDist = BigInt(currentIterationDistance + 2);
    const primaryMinusDistMinusOne = BigInt(primaryDimension - currentIterationDistance - 1);
    const secondaryMinusDistMinusOne = BigInt(secondaryDimension - currentIterationDistance - 1);

    // Calculate term Alpha (corresponding to 'A' in original)
    // Original: (1/6)*(d+1)*(d+2)*(d*3)  -> Simplified: (d+1)*(d+2)*d / 2
    const termAlpha = (onePlusDist * twoPlusDist * BigInt(currentIterationDistance)) / BigInt(2);

    // Calculate term Beta (corresponding to 'B' in original)
    // Original: ((N-d-1)+(M-d-1))*(1/2)*(d+1)*(d+2)
    const termBeta = (primaryMinusDistMinusOne + secondaryMinusDistMinusOne) * onePlusDist * twoPlusDist / BigInt(2);

    // Calculate term Gamma (corresponding to 'C' in original)
    // Original: (N-d-1)*(M-d-1)*(d+1)
    const termGamma = primaryMinusDistMinusOne * secondaryMinusDistMinusOne * onePlusDist;

    // Calculate term Delta (corresponding to 'D' in original)
    // Original: (N-d)+(M-d)
    const termDelta = BigInt(primaryDimension - currentIterationDistance) + BigInt(secondaryDimension - currentIterationDistance);

    // Combine terms and update the total sum.
    // Original: ans+=d*((A+B+C)*2-D); ans%=E;
    const combinedAlphaBetaGamma = termAlpha + termBeta + termGamma;
    const innerExpression = (combinedAlphaBetaGamma * BigInt(2)) - termDelta;
    const termForAddition = performModularMultiplication(BigInt(currentIterationDistance), innerExpression, largePrimeModulus);
    computedTotal = performModularAddition(computedTotal, termForAddition, largePrimeModulus);
  }


  // --- Second Calculation Phase (Distances from primaryDimension to secondaryDimension - 1) ---
  // This loop processes terms where 'd' is between 'N' and 'M'.
  // Original: for(let d=N;d<=M-1;d++){ ... }
  // Clone: Simplified zero terms, re-arranged calculations.
  for (let currentIterationDistance = primaryDimension; currentIterationDistance <= secondaryDimension - 1; ++currentIterationDistance) {
    // Term Alpha remains constant for this block, based on primaryDimension.
    // Original: (1/6)*(N)*(N+1)*(N+2)
    const constAlphaFactor = BigInt(primaryDimension) * BigInt(primaryDimension + 1) * BigInt(primaryDimension + 2) / BigInt(6);

    // Term Beta calculation.
    // Original: (M-d-1)*(1/2)*(N)*(N+1)
    const secondaryMinusDistMinusOne = BigInt(secondaryDimension - currentIterationDistance - 1);
    const primaryTimesPrimaryPlusOne = BigInt(primaryDimension) * BigInt(primaryDimension + 1);
    const termBeta = secondaryMinusDistMinusOne * primaryTimesPrimaryPlusOne / BigInt(2);

    // Term Gamma was 0 in the original, so it's implicitly omitted.
    // Original: C=0;
    // We explicitly acknowledge its absence by not including it in the sum.

    // Term Delta calculation.
    // Original: (M-d)
    const termDelta = BigInt(secondaryDimension - currentIterationDistance);

    // Combine terms and update the total sum.
    // Original: ans+=d*((A+B+C)*2-D); ans%=E;
    const combinedAlphaBeta = constAlphaFactor + termBeta;
    const innerExpression = (combinedAlphaBeta * BigInt(2)) - termDelta;
    const termForAddition = performModularMultiplication(BigInt(currentIterationDistance), innerExpression, largePrimeModulus);
    computedTotal = performModularAddition(computedTotal, termForAddition, largePrimeModulus);
  }


  // --- Third Calculation Phase (Distances from secondaryDimension to primaryDimension + secondaryDimension - 2) ---
  // This loop processes terms where 'd' is greater than or equal to 'M'.
  // Original: for(let d=M;d<=N+M-2;d++){ ... }
  // Clone: Renamed variables, removed explicit zero terms.
  for (let currentIterationDistance = secondaryDimension; currentIterationDistance <= primaryDimension + secondaryDimension - 2; ++currentIterationDistance) {
    // Calculate 'reverseDistanceFactor' (corresponds to 'a' in original).
    // Original: a=N+M-1-d;
    const reverseDistanceFactor = BigInt(primaryDimension + secondaryDimension - 1 - currentIterationDistance);

    // Term Alpha calculation based on 'reverseDistanceFactor'.
    // Original: (1/6)*(a)*(a+1)*(a+2)
    const termAlphaRev = reverseDistanceFactor * (reverseDistanceFactor + BigInt(1)) * (reverseDistanceFactor + BigInt(2)) / BigInt(6);

    // Terms Beta, Gamma, Delta were all 0 in the original.
    // Original: B=0; C=0; D=0;
    // The expression simplifies to just `d * (A*2)`.
    const innerExpression = termAlphaRev * BigInt(2);
    const termForAddition = performModularMultiplication(BigInt(currentIterationDistance), innerExpression, largePrimeModulus);
    computedTotal = performModularAddition(computedTotal, termForAddition, largePrimeModulus);
  }


  // --- Final Combinatorial-like Factor Application ---
  // The original comment indicated (N*M-2)C(K-2), but the implementation
  // calculates (ans * (N*M-2-K)^(K-2)) / ((K-2)! mod E).
  // We are cloning the observed behavior, not correcting the mathematical intent.

  // Add a guard clause for the selection quantity.
  // The loop runs for `i < K-2`. If `K-2` is <= 0, the loop does not execute.
  if (selectionQuantity < 2) {
    // No further operations are needed if K-2 is not positive.
    // The problem context implies K >= 2 for this part of the calculation.
  } else {
    // Pre-calculate the constant multiplier for each step.
    const constantFactorToMultiply = BigInt(primaryDimension * secondaryDimension - 2 - selectionQuantity);
    const iterationsCount = selectionQuantity - 2;

    // Iterate to apply the 'combinatorial' factor.
    // Original: for(let i=0;i<K-2;i++){ ... }
    for (let loopIterationIndex = 0; loopIterationIndex < iterationsCount; ++loopIterationIndex) {
      // Multiply the running total by the constant factor.
      // Original: ans*=(N*M-2-K); ans%=E;
      computedTotal = performModularMultiplication(computedTotal, constantFactorToMultiply, largePrimeModulus);

      // Compute the modular inverse for the current divisor (loopIterationIndex + 1).
      // Original: Embedded complex Euclidean algorithm logic.
      const currentDivisorTerm = BigInt(loopIterationIndex + 1);
      const inverseOfDivisor = findModularMultiplicativeInverse(currentDivisorTerm, largePrimeModulus);

      // Apply the modular division (multiplication by the inverse).
      // Original: ans=(x[x.length-2]*ans)%E;
      computedTotal = performModularMultiplication(computedTotal, inverseOfDivisor, largePrimeModulus);
    }
  }

  // Output the final result. Convert BigInt back to Number for standard output.
  console.log(Number(computedTotal));

// Read input from standard input using Node.js 'fs' module.
})(require('fs').readFileSync('/dev/stdin','utf8'));