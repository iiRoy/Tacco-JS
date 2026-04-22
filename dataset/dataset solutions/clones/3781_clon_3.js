// This module provides functions for combinatorial calculations modulo a prime number,
// and solves a specific problem related to forming a target sum 'k' using two component sizes 'a' and 'b',
// within a total budget 'n'.

// --- Global Configuration and Caching ---
const MODULUS_VALUE = 998244353; // A common prime modulus used in competitive programming.

// Caches for precomputed factorials and their modular inverses.
// These are essential for efficient calculation of combinations (nCr).
const factorialCache = [1, 1];
const inverseFactorialCache = [1, 1];

/**
 * Multiplies an arbitrary number of arguments modulo MODULUS_VALUE.
 * This function handles potential intermediate overflows for large numbers by
 * using a trick involving 16-bit splits, which is faster than BigInt for JavaScript numbers
 * within certain ranges.
 * @param {number} initialProduct The first number in the multiplication chain.
 * @param {number[]} otherFactors Remaining numbers to multiply.
 * @returns {number} The product of all arguments modulo MODULUS_VALUE.
 */
function multiplyMod(initialProduct, ...otherFactors) {
  let currentProduct = initialProduct;
  for (const factor of otherFactors) {
    // This optimization prevents overflow before the modulo operation,
    // especially when dealing with numbers that might exceed 2^53 (JS's safe integer limit)
    // but are still representable as standard numbers.
    // It splits 'currentProduct' into two 16-bit parts.
    currentProduct = (currentProduct >>> 16) * factor % MODULUS_VALUE * 0x10000 + (currentProduct & 0xFFFF) * factor;
    currentProduct %= MODULUS_VALUE; // Apply modulo after recombination.
  }
  return currentProduct;
}

/**
 * Computes (base ^ exponent) % MODULUS_VALUE using binary exponentiation (exponentiation by squaring).
 * @param {number} base The base number.
 * @param {number} exponent The exponent.
 * @returns {number} (base ^ exponent) % MODULUS_VALUE.
 */
function powerModulus(base, exponent) {
  let resultPower = 1;
  let currentBase = base; // Use a distinct variable name for the base that changes in the loop.

  while (exponent > 0) {
    // If the current bit of the exponent is 1, multiply it with the result.
    if (exponent & 1) {
      resultPower = multiplyMod(resultPower, currentBase);
    }
    // Square the base for the next iteration.
    currentBase = multiplyMod(currentBase, currentBase);
    // Move to the next bit of the exponent.
    exponent >>>= 1;
  }
  return resultPower;
}

/**
 * Precomputes factorials up to 'maxVal' modulo MODULUS_VALUE and stores them in factorialCache.
 * @param {number} maxVal The maximum value for which to compute the factorial.
 * @returns {number} The factorial of maxVal modulo MODULUS_VALUE.
 */
function calculateFactorialMod(maxVal) {
  // Ensure the cache is populated up to maxVal.
  for (let idx = factorialCache.length; idx <= maxVal; idx++) {
    factorialCache[idx] = multiplyMod(factorialCache[idx - 1], idx);
  }
  return factorialCache[maxVal];
}

/**
 * Precomputes modular inverse factorials up to 'maxVal' and stores them in inverseFactorialCache.
 * This uses Fermat's Little Theorem (a^(p-2) % p) for the largest value, then back-calculates.
 * @param {number} maxVal The maximum value for which to compute the inverse factorial.
 */
function calculateInverseFactorialMod(maxVal) {
  // First, ensure the factorial for maxVal is computed.
  if (!factorialCache[maxVal]) {
    calculateFactorialMod(maxVal);
  }

  // Calculate (maxVal!)^(-1) % MODULUS_VALUE using powerModulus (Fermat's Little Theorem).
  inverseFactorialCache[maxVal] = powerModulus(factorialCache[maxVal], MODULUS_VALUE - 2);

  // Back-calculate inverse factorials: (n-1)!^(-1) = n!^(-1) * n
  let currentN = maxVal;
  while (currentN > 1 && !inverseFactorialCache[currentN - 1]) {
    inverseFactorialCache[currentN - 1] = multiplyMod(inverseFactorialCache[currentN], currentN);
    currentN--;
  }
}

/**
 * Computes nCr (n choose r) modulo MODULUS_VALUE.
 * nCr = n! / (r! * (n-r)!) = n! * (r!)^(-1) * ((n-r)!)^(-1)
 * @param {number} totalItems The total number of items (n).
 * @param {number} chosenItems The number of items to choose (r).
 * @returns {number} nCr modulo MODULUS_VALUE. Returns 0 if n < r or r < 0.
 */
function combinationsMod(totalItems, chosenItems) {
  // Guard clauses for invalid inputs.
  if (chosenItems < 0 || chosenItems > totalItems) {
    return 0;
  }
  if (chosenItems === 0 || chosenItems === totalItems) {
    return 1;
  }
  if (chosenItems === 1 || chosenItems === totalItems - 1) {
    return totalItems % MODULUS_VALUE;
  }

  // Ensure inverse factorials are computed up to 'totalItems'.
  if (!inverseFactorialCache[totalItems]) {
    calculateInverseFactorialMod(totalItems);
  }

  // Calculate nCr using precomputed factorials and inverse factorials.
  return multiplyMod(
    factorialCache[totalItems],
    inverseFactorialCache[chosenItems],
    inverseFactorialCache[totalItems - chosenItems]
  );
}

/**
 * The main function to process input and solve the problem.
 * It determines the number of ways to partition 'totalElements' into groups
 * where each group is either 'firstComponentSize', 'secondComponentSize', or 'combinedComponentSize'.
 * @param {string} rawInputString The input string containing space-separated numbers.
 */
function processInputData(rawInputString) {
  // Input parsing: Split the string, convert to numbers, and validate.
  const parsedNumericValues = rawInputString.split(" ").map(val => parseInt(val.trim(), 10));

  // Ensure we have enough input values.
  if (parsedNumericValues.length < 4) {
    console.error("Error: Insufficient input values. Expected at least 4 numbers.");
    console.log(0); // Default output for invalid input.
    return;
  }

  // Extract problem parameters.
  const totalElements = parsedNumericValues[0]; // n
  const firstComponentSize = parsedNumericValues[1]; // a
  const secondComponentSize = parsedNumericValues[2]; // b
  const targetSum = parsedNumericValues[3]; // k

  // Basic validation for component sizes and target sum.
  if (firstComponentSize <= 0 || secondComponentSize <= 0) {
    console.log(0);
    return;
  }
  if (targetSum < 0) {
    console.log(0);
    return;
  }

  const combinedComponentSize = firstComponentSize + secondComponentSize; // c = a + b

  // --- Step 1: Find initial combinations that sum up to 'targetSum' ---
  // We're looking for (countA * firstComponentSize) + (countB * secondComponentSize) = targetSum
  // where countA + countB = maxCombinedGroups (or some other relation)
  // The original code uses 'j' for maxCombinedGroups, which represents the number of 'c' groups.
  // So, k = (j*c) + (rem_a*a) + (rem_b*b)
  // This initial search is for combinations where k = i*c + remaining_part.
  // The 'i' here is the number of 'combinedComponentSize' groups.
  // It finds initial solutions where `remaining_part` is purely `a` or purely `b`.

  let maxPossibleCombinedGroups = Math.floor(targetSum / combinedComponentSize);
  let initialSolutionsFound = false;
  let currentCombinations = []; // Stores pairs [count_of_a, count_of_b]

  // Loop downwards from the maximum possible 'combinedComponentSize' groups.
  // This aims to find solutions with fewer 'c' groups first, which might be a heuristic.
  let currentNumCombinedGroups = maxPossibleCombinedGroups;
  while (currentNumCombinedGroups >= 0) {
    const remainingTargetValue = targetSum - (currentNumCombinedGroups * combinedComponentSize);

    // Check if the remaining value can be formed purely by 'firstComponentSize'
    if (remainingTargetValue >= 0 && remainingTargetValue % firstComponentSize === 0) {
      const countA = remainingTargetValue / firstComponentSize;
      currentCombinations.push(countA, 0); // Store [count_a, count_b]
      initialSolutionsFound = true;
    }

    // Check if the remaining value can be formed purely by 'secondComponentSize'
    // Ensure we don't duplicate (e.g., if remainingTargetValue is 0, both checks might pass).
    // The original code pushed both, so we will too.
    if (remainingTargetValue >= 0 && remainingTargetValue % secondComponentSize === 0) {
      const countB = remainingTargetValue / secondComponentSize;
      currentCombinations.push(0, countB); // Store [count_a, count_b]
      initialSolutionsFound = true;
    }

    // The original code broke after the first set of solutions for a given 'i'.
    // We'll mimic this behavior for 'f'.
    if (initialSolutionsFound) {
        break;
    }
    currentNumCombinedGroups--;
  }

  // If no initial combination was found, print 0 and exit.
  if (!initialSolutionsFound) {
    console.log(0);
    return;
  }

  // The 'j' from the original code after the initial loop.
  // It holds the value of 'i' (currentNumCombinedGroups) where the first solution was found.
  let baseCombinedGroupsCount = currentNumCombinedGroups;

  // --- Step 2: Iteratively generate and count valid partitions ---
  let finalResultAccumulator = 0;

  // Pre-calculate ratios for adding combined groups in terms of individual components.
  // If 'c' is divisible by 'a', then 'c/a' units of 'a' components are equivalent to one 'c' group.
  const firstComponentEquivalentRatio = (combinedComponentSize % firstComponentSize === 0)
    ? combinedComponentSize / firstComponentSize
    : 0;
  const secondComponentEquivalentRatio = (combinedComponentSize % secondComponentSize === 0)
    ? combinedComponentSize / secondComponentSize
    : 0;

  // Main loop: Iterate while there are combinations to process and baseCombinedGroupsCount is non-negative.
  // This loop explores different numbers of 'combinedComponentSize' groups.
  while (currentCombinations.length > 0 && baseCombinedGroupsCount >= 0) {
    const nextIterationCombinations = [];
    const seenCombinationsTracker = new Set(); // Using Set for better uniqueness tracking.

    for (let idx = 0; idx < currentCombinations.length; idx += 2) {
      const currentCountA = currentCombinations[idx];
      const currentCountB = currentCombinations[idx + 1];

      // Create a unique key for the current combination.
      const combinationKey = `${currentCountA}_${currentCountB}`;

      // Skip if this combination has already been processed in the current 'baseCombinedGroupsCount' iteration.
      if (seenCombinationsTracker.has(combinationKey)) {
        continue;
      }
      seenCombinationsTracker.add(combinationKey);

      // Validate the current combination: counts must be non-negative.
      if (currentCountA < 0 || currentCountB < 0) {
        // This should ideally not happen if initial combinations are non-negative.
        continue;
      }

      // The total number of items used for this specific combination (a's, b's, and c's).
      const totalItemsUsed = baseCombinedGroupsCount + currentCountA + currentCountB;
      if (totalItemsUsed > totalElements) {
        continue;
      }

      // Calculate the number of ways to choose these elements.
      // This is nCr(n, j) * nCr(n-j, countA) * nCr(n-j-countA, countB)
      // where j is baseCombinedGroupsCount.
      const waysToChooseC = combinationsMod(totalElements, baseCombinedGroupsCount);
      const waysToChooseA = combinationsMod(totalElements - baseCombinedGroupsCount, currentCountA);
      const waysToChooseB = combinationsMod(totalElements - baseCombinedGroupsCount - currentCountA, currentCountB);

      // Accumulate the product into the final result.
      const currentCombinationWays = multiplyMod(waysToChooseC, waysToChooseA, waysToChooseB);
      finalResultAccumulator = (finalResultAccumulator + currentCombinationWays) % MODULUS_VALUE;

      // Generate new combinations for the next iteration (i.e., for baseCombinedGroupsCount - 1).
      // These new combinations represent the current set plus one more 'c' group (split into a and b),
      // or one more 'a' group that sums to 'c', or one more 'b' group that sums to 'c'.
      // When 'baseCombinedGroupsCount' decrements, it means one 'c' group is "disassembled".
      // This disassembled 'c' group must be accounted for by increasing the counts of 'a' and 'b' components.
      // A 'c' group can be replaced by:
      // 1. One 'a' group and one 'b' group.
      // 2. 'firstComponentEquivalentRatio' 'a' groups (if 'c' is a multiple of 'a').
      // 3. 'secondComponentEquivalentRatio' 'b' groups (if 'c' is a multiple of 'b').

      nextIterationCombinations.push(currentCountA + 1, currentCountB + 1);

      if (firstComponentEquivalentRatio > 0) {
        nextIterationCombinations.push(currentCountA + firstComponentEquivalentRatio, currentCountB);
      }
      if (secondComponentEquivalentRatio > 0) {
        nextIterationCombinations.push(currentCountA, currentCountB + secondComponentEquivalentRatio);
      }
    }

    currentCombinations = nextIterationCombinations; // Update combinations for the next iteration.
    baseCombinedGroupsCount--; // Decrement the number of 'c' groups.
  }

  console.log(finalResultAccumulator);
}

// --- Main execution block ---
// Read input from standard input and pass it to the main processing function.
try {
  // Using a more robust way to read input, ensuring it's trimmed and handled.
  const fileContent = require("fs").readFileSync("/dev/stdin", "utf8").trim();
  processInputData(fileContent);
} catch (error) {
  // Provide basic error handling for file reading or parsing.
  console.error("An error occurred during input processing:", error.message);
  console.log(0); // Output 0 on error as a safe default.
}