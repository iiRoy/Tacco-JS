'use strict';
(function(rawInputString){
  // --- Input Data Processing and Essential Constants Initialization ---
  // Step 1: Clean and parse the raw input string into an array of integers.
  // This involves removing whitespace, splitting by spaces, and converting each part to a base-10 number.
  let processedNumericData = rawInputString.trim().split(/\s+/).map(strValue => parseInt(strValue, 10));

  // Step 2: Implement a basic guard clause for input validity.
  // Ensure the input contains at least the three expected numeric parameters.
  if (processedNumericData.length < 3 || processedNumericData.some(isNaN)) {
      console.error("Input processing error: Expected at least three valid numbers.");
      return; // Terminate execution if input is malformed or insufficient.
  }

  // Step 3: Assign descriptive names to the problem's primary dimensions and selection count.
  // The first dimension is the smaller of the first two input numbers.
  const firstDimensionSize = Math.min(processedNumericData[0], processedNumericData[1]); // Corresponds to 'N'
  // The second dimension is the larger of the first two input numbers.
  const secondDimensionSize = Math.max(processedNumericData[0], processedNumericData[1]); // Corresponds to 'M'
  // The number of items to select for combinatorial calculation.
  const selectionCount = processedNumericData[2]; // Corresponds to 'K'

  // Step 4: Define the large prime modulus, crucial for all modular arithmetic operations.
  const primeModulus = Math.pow(10, 9) + 7; // Corresponds to 'E'

  // Step 5: Introduce a reusable helper function for modular arithmetic.
  // This ensures that all intermediate and final results remain positive within the modulus range.
  const getPositiveModulo = (value, modulus) => (value % modulus + modulus) % modulus;

  // Initialize the primary accumulator for the first part of the calculation.
  let cumulativeSum = 0; // Corresponds to 'ans'

  // --- Phase 1: Iterative Summation for Specific Configurations ---
  // This section involves three distinct loops, each calculating contributions to the cumulative sum
  // based on different ranges of an iteration variable, representing varying geometric or combinatorial cases.

  // Loop A: Iteration for `currentIterationLength` from 1 up to `firstDimensionSize - 1`.
  // This loop handles scenarios where `currentIterationLength` is less than the smaller dimension.
  for(let currentIterationLength = 1; currentIterationLength <= firstDimensionSize - 1; ++currentIterationLength){
    // Calculate four distinct sub-terms (analogous to A, B, C, D in the original code).
    // These terms are derived from a specific formula related to the problem's geometric structure.
    let subTermAlpha = (1.0 / 6.0) * (currentIterationLength + 1) * (currentIterationLength + 2) * (currentIterationLength + 3);
    let subTermBeta = ((firstDimensionSize - currentIterationLength - 1) + (secondDimensionSize - currentIterationLength - 1)) * (0.5) * (currentIterationLength + 1) * (currentIterationLength + 2);
    let subTermGamma = (firstDimensionSize - currentIterationLength - 1) * (secondDimensionSize - currentIterationLength - 1) * (currentIterationLength + 1);
    let subTermDelta = (firstDimensionSize - currentIterationLength) * secondDimensionSize + (secondDimensionSize - currentIterationLength) * firstDimensionSize;

    // Aggregate the current iteration's contribution and apply the modulus.
    let iterationContribution = currentIterationLength * ((subTermAlpha + subTermBeta + subTermGamma) * 2 - subTermDelta);
    cumulativeSum = getPositiveModulo(cumulativeSum + iterationContribution, primeModulus);
  }
  // console.log("Intermediate sum after Loop A:", cumulativeSum); // For debugging purposes

  // Loop B: Iteration for `currentIterationLength` from `firstDimensionSize` up to `secondDimensionSize - 1`.
  // This loop addresses configurations where `currentIterationLength` is between the two dimensions.
  for(let currentIterationLength = firstDimensionSize; currentIterationLength <= secondDimensionSize - 1; ++currentIterationLength){
    // Recalculate sub-terms, noting some simplify to zero in this range.
    let subTermP = (1.0 / 6.0) * firstDimensionSize * (firstDimensionSize + 1) * (firstDimensionSize + 2);
    let subTermQ = (secondDimensionSize - currentIterationLength - 1) * (0.5) * firstDimensionSize * (firstDimensionSize + 1);
    // Explicitly define terms that become zero for clarity and structural consistency.
    const subTermR_zero = 0;
    let subTermS_simplified = (secondDimensionSize - currentIterationLength) * firstDimensionSize;

    // Update the cumulative sum with the current iteration's value.
    let currentIterationValue = currentIterationLength * ((subTermP + subTermQ + subTermR_zero) * 2 - subTermS_simplified);
    cumulativeSum = getPositiveModulo(cumulativeSum + currentIterationValue, primeModulus);
  }
  // console.log("Intermediate sum after Loop B:", cumulativeSum);

  // Loop C: Iteration for `currentIterationLength` from `secondDimensionSize` up to `firstDimensionSize + secondDimensionSize - 2`.
  // This final loop covers scenarios where `currentIterationLength` exceeds both dimensions.
  for(let currentIterationLength = secondDimensionSize; currentIterationLength <= firstDimensionSize + secondDimensionSize - 2; ++currentIterationLength){
    // Introduce an adjusted dimension variable for this specific formula.
    let adjustedDimensionParameter = firstDimensionSize + secondDimensionSize - 1 - currentIterationLength;
    let subTermX = (1.0 / 6.0) * (adjustedDimensionParameter) * (adjustedDimensionParameter + 1) * (adjustedDimensionParameter + 2);
    // All other sub-terms are zero in this configuration.
    const subTermY_zero = 0;
    const subTermZ_zero = 0;
    const subTermW_zero = 0;

    // Add the contribution from this iteration to the total.
    let currentIterativeResult = currentIterationLength * ((subTermX + subTermY_zero + subTermZ_zero) * 2 - subTermW_zero);
    cumulativeSum = getPositiveModulo(cumulativeSum + currentIterativeResult, primeModulus);
  }
  // console.log("Intermediate sum after Loop C:", cumulativeSum);

  // --- Phase 2: Combinatorial Factor Multiplication (Numerator Part) ---
  // This section involves multiplying the `cumulativeSum` by a permutation-like term (N*M-2)P(K-2).
  // This is equivalent to multiplying by (N*M-2) * (N*M-3) * ... * (N*M-K+1).

  // Calculate the base value for the permutation.
  const totalGridCellsMinusTwo = firstDimensionSize * secondDimensionSize - 2;
  // Determine the number of factors to include in the permutation product.
  const numberOfFactors = selectionCount - 2; // Corresponds to K-2

  // Implement a guard clause for edge cases of `selectionCount`.
  if (numberOfFactors < 0) {
      // If K < 2, the combinatorial term is typically zero or undefined.
      // Assuming it implies a zero result in this context.
      cumulativeSum = 0;
  } else {
      for(let factorIndex = 0; factorIndex < numberOfFactors; ++factorIndex){
          // Each factor decreases by 1 in sequence.
          let currentPermutationFactor = totalGridCellsMinusTwo - factorIndex;
          cumulativeSum = getPositiveModulo(cumulativeSum * currentPermutationFactor, primeModulus);
      }
  }
  // console.log("Sum after permutation numerator:", cumulativeSum);

  // --- Phase 3: Denominator Calculation and Modular Inverse via Extended Euclidean Algorithm ---
  // This part computes the factorial of (K-2) and then finds its modular multiplicative inverse
  // with respect to `primeModulus`.

  let factorialDenominator = 1; // Corresponds to 'denominator'
  // Calculate (K-2)! modulo `primeModulus`.
  for(let loopIterator = 1; loopIterator <= numberOfFactors; ++loopIterator){
    factorialDenominator = getPositiveModulo(factorialDenominator * loopIterator, primeModulus);
  }
  // console.log("Calculated factorial denominator:", factorialDenominator);

  // Find the modular multiplicative inverse of `factorialDenominator` modulo `primeModulus`.
  // We use the Extended Euclidean Algorithm to find `inv` such that `(factorialDenominator * inv) % primeModulus = 1`.
  let modularInverseFactor; // Corresponds to 'F'

  // Guard against a zero factorial (which would indicate an invalid or trivial case for inverse).
  if (factorialDenominator === 0) {
      // In a real scenario, this might be an error or indicate a specific problem edge case.
      // For competitive programming, it usually implies the result is 0 or needs special handling.
      // For this problem, factorialDenominator will not be 0 unless numberOfFactors is negative,
      // which is handled by the guard above.
      modularInverseFactor = 0;
  } else {
      // Standard iterative Extended Euclidean Algorithm implementation.
      let mCurrent = primeModulus;
      let aCurrent = factorialDenominator;
      let yCoeff = 0, xCoeff = 1; // Bezout coefficients for the current iteration

      if (mCurrent === 1) modularInverseFactor = 0; // Trivial case for modulus 1

      while (aCurrent > 1) {
          let quotient = Math.floor(aCurrent / mCurrent);
          let tempMod = mCurrent;

          mCurrent = aCurrent % mCurrent;
          aCurrent = tempMod;

          let tempCoeff = yCoeff;
          yCoeff = xCoeff - quotient * yCoeff;
          xCoeff = tempCoeff;
      }
      modularInverseFactor = getPositiveModulo(xCoeff, primeModulus);
  }
  // console.log("Computed modular inverse factor:", modularInverseFactor);

  // --- Phase 4: Final Multiplication and Result Output ---
  // The final step is to multiply `cumulativeSum` by `modularInverseFactor`.
  // This multiplication needs careful handling to prevent potential JavaScript number precision issues
  // if `cumulativeSum * modularInverseFactor` exceeds 2^53 before the final modulo.
  // A splitting technique is employed for safety.

  const largeValueSplitPoint = 100000; // A chosen power of 10 to split numbers

  // Split `cumulativeSum` into a high part and a low part.
  let sumHighPart = Math.floor(cumulativeSum / largeValueSplitPoint);
  let sumLowPart = cumulativeSum % largeValueSplitPoint;

  // Perform modular multiplication on each part separately.
  // (sumHighPart * largeValueSplitPoint * modularInverseFactor + sumLowPart * modularInverseFactor) % primeModulus
  let resultFromHighPart = getPositiveModulo(sumHighPart * modularInverseFactor, primeModulus);
  let resultFromLowPart = getPositiveModulo(sumLowPart * modularInverseFactor, primeModulus);

  // Recombine the modular results.
  let finalCalculatedResult = getPositiveModulo(resultFromHighPart * largeValueSplitPoint + resultFromLowPart, primeModulus);

  // Ensure the final answer is explicitly positive, even if intermediate modulo operations were negative.
  finalCalculatedResult = getPositiveModulo(finalCalculatedResult, primeModulus);

  // Print the final result to standard output.
  console.log(finalCalculatedResult);

})(require('fs').readFileSync('/dev/stdin','utf8'));