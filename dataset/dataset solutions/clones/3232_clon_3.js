"use strict"; // Enforce strict parsing and error handling for robust code execution

/**
 * Utility function to ensure a binary string has a specific length by padding with leading zeros.
 * This function enhances readability and reusability for binary string formatting.
 * @param {string} binaryStringValue - The binary string to be padded.
 * @param {number} requiredLength - The target length for the binary string.
 * @returns {string} The padded binary string, or the original if already long enough.
 */
const ensurePaddedBinaryString = (binaryStringValue, requiredLength) => {
  // Leverage built-in String.prototype.padStart for efficient and clean padding.
  return binaryStringValue.padStart(requiredLength, '0');
};

/**
 * Computes the count of numbers from the input array that have a bit *different*
 * from the candidate bit at a given position. This is a core part of the scoring mechanism.
 * @param {string} currentCandidateBit - The specific bit ('0' or '1') from the constructed candidate number (X).
 * @param {number} countOfOnesAtPosition - The total count of '1's at this bit position across all original input numbers (A).
 * @param {number} totalInputElements - The total number of input elements (N) in the original array.
 * @returns {number} The quantity of input elements whose bit at this position differs from the candidate bit.
 */
const tallyDifferingBits = (currentCandidateBit, countOfOnesAtPosition, totalInputElements) => {
  if (currentCandidateBit === '0') {
    // If our candidate bit is '0', we contribute to the score for every input element that has a '1' at this position.
    return countOfOnesAtPosition;
  } else { // The candidate bit is '1'
    // If our candidate bit is '1', we contribute to the score for every input element that has a '0' at this position.
    return totalInputElements - countOfOnesAtPosition;
  }
};

/**
 * The primary function responsible for solving the bitwise optimization problem.
 * It encapsulates all stages: input processing, data transformation, core calculation, and output.
 * @param {string} rawProblemInput - The raw string content read from standard input.
 */
const solveBitwiseMaximization = (rawProblemInput) => {
  // Define a constant for the fixed binary length to improve maintainability.
  const GLOBAL_SETTINGS = {
    FIXED_BINARY_DIGIT_COUNT: 50, // All numbers are normalized to this bit length.
  };

  // --- PHASE 1: Input Parsing and Initial Data Setup ---

  // Step 1.1: Extract all numerical tokens from the raw input string.
  // Trim whitespace, split by any whitespace sequence, and convert each part to a Number.
  const parsedNumericTokens = rawProblemInput
    .trim() // Remove leading/trailing whitespace
    .split(/\s+/) // Split by one or more whitespace characters
    .map(Number); // Convert each string token to a number

  // Step 1.2: Implement robust input validation (Guard Clauses).
  // Ensure the minimum required number of tokens (N and K) are present.
  if (parsedNumericTokens.length < 2) {
    console.error("Error: Not enough input data. Expected at least two numbers (N and K).");
    return; // Exit if input is invalid.
  }

  // Step 1.3: Assign the first two tokens to their logical variables.
  const numberOfElements = parsedNumericTokens[0]; // Corresponds to the original 'N'
  const inputUpperLimitValue = parsedNumericTokens[1]; // Corresponds to the original 'K'

  // More validation for key input parameters.
  if (numberOfElements <= 0) {
    console.error("Error: The count of elements (N) must be a positive integer.");
    return;
  }
  if (inputUpperLimitValue < 0) {
      console.error("Error: The upper limit value (K) cannot be negative.");
      return;
  }

  // Step 1.4: Convert the input upper limit (K) into its binary string representation, padded to the fixed length.
  let paddedUpperLimitBinaryString = ensurePaddedBinaryString(
    inputUpperLimitValue.toString(2),
    GLOBAL_SETTINGS.FIXED_BINARY_DIGIT_COUNT
  );

  // Step 1.5: Extract the remaining tokens which represent the data array 'A'.
  const rawInputDataArray = parsedNumericTokens.slice(2, 2 + numberOfElements);

  // Validate that the number of data elements matches N.
  if (rawInputDataArray.length < numberOfElements) {
    console.error(`Error: Expected ${numberOfElements} data elements, but only ${rawInputDataArray.length} were found.`);
    return;
  }

  // Step 1.6: Transform each element of the data array into a padded binary string.
  const transformedBinaryDataArray = rawInputDataArray.map(num =>
    ensurePaddedBinaryString(num.toString(2), GLOBAL_SETTINGS.FIXED_BINARY_DIGIT_COUNT)
  );

  // --- PHASE 2: Pre-computation of Bit Frequencies ---

  // Step 2.1: Initialize an array to hold the frequency of '1's at each bit position.
  // This array is analogous to the original 'digSum'.
  const oneBitCountsPerPosition = Array(GLOBAL_SETTINGS.FIXED_BINARY_DIGIT_COUNT).fill(0);

  // Step 2.2: Populate the frequency array by iterating through all transformed binary data strings.
  for (let bitPosition = 0; bitPosition < GLOBAL_SETTINGS.FIXED_BINARY_DIGIT_COUNT; bitPosition++) {
    for (let dataEntryIndex = 0; dataEntryIndex < numberOfElements; dataEntryIndex++) {
      if (transformedBinaryDataArray[dataEntryIndex][bitPosition] === '1') {
        oneBitCountsPerPosition[bitPosition]++;
      }
    }
  }

  // --- PHASE 3: Core Logic - Optimal Candidate Search and Score Maximization ---

  let overallHighestScore = 0; // This variable will store the maximum score found, equivalent to original 'counterMax'.

  // Step 3.1: Calculate the effective upper boundary for candidate numbers.
  // This is K + 1. Candidate numbers X must be strictly less than this value.
  const effectiveNumericalUpperLimit = parseInt(paddedUpperLimitBinaryString, 2) + 1;
  const effectiveBinaryUpperLimitString = ensurePaddedBinaryString(
    effectiveNumericalUpperLimit.toString(2),
    GLOBAL_SETTINGS.FIXED_BINARY_DIGIT_COUNT
  ); // This string corresponds to the original 'M'.

  // Step 3.2: Identify all bit positions where the 'effectiveBinaryUpperLimitString' has a '1'.
  // These are the "pivot" points where we can decrement a bit to create a smaller number.
  const oneBitIndicesInEffectiveLimit = []; // Analogous to the original 'a'.
  for (let currentIdx = 0; currentIdx < effectiveBinaryUpperLimitString.length; currentIdx++) {
    if (effectiveBinaryUpperLimitString[currentIdx] === '1') {
      oneBitIndicesInEffectiveLimit.push(currentIdx);
    }
  }

  // Step 3.3: Iterate through each identified "pivot" bit position.
  // For each pivot, construct a candidate binary number (X) and calculate its score.
  for (const pivotBitLoc of oneBitIndicesInEffectiveLimit) { // Iterating through original 'a' elements.
    const currentCandidateBinaryDigits = Array(GLOBAL_SETTINGS.FIXED_BINARY_DIGIT_COUNT); // Represents the candidate 'X'.

    // Part A: Copy the prefix bits directly from 'effectiveBinaryUpperLimitString' (M).
    // These bits are identical to M up to the pivot point.
    for (let p = 0; p < pivotBitLoc; p++) {
      currentCandidateBinaryDigits[p] = effectiveBinaryUpperLimitString[p];
    }

    // Part B: At the pivot bit position, set the digit to '0'.
    // This crucial step ensures that the constructed candidate number is strictly less than M (K+1).
    currentCandidateBinaryDigits[pivotBitLoc] = '0';

    // Part C: For all subsequent bit positions (after the pivot), choose '0' or '1' to maximize the score.
    // The optimal choice is to pick the bit that maximizes the number of differences with the input array elements.
    for (let s = pivotBitLoc + 1; s < GLOBAL_SETTINGS.FIXED_BINARY_DIGIT_COUNT; s++) {
      const onesCountHere = oneBitCountsPerPosition[s];
      const zerosCountHere = numberOfElements - onesCountHere;

      // To maximize the sum of XOR-like differences, if '0's are more frequent than '1's
      // among the input numbers (A) at this position, we should choose '1' for our candidate X.
      // (zerosCountHere > onesCountHere) simplifies to (numberOfElements - onesCountHere > onesCountHere),
      // which further simplifies to (numberOfElements > 2 * onesCountHere) or (2 * onesCountHere < numberOfElements).
      currentCandidateBinaryDigits[s] = (2 * onesCountHere < numberOfElements) ? '1' : '0';
    }

    const finalCandidateBinaryString = currentCandidateBinaryDigits.join(''); // The complete candidate X as a string.

    // Step 3.4: Calculate the score for the currently constructed candidate X.
    let currentCandidateCalculatedScore = 0; // Analogous to the original 'counter'.
    for (let bitIdx = 0; bitIdx < GLOBAL_SETTINGS.FIXED_BINARY_DIGIT_COUNT; bitIdx++) {
      // Calculate the weight of the current bit position using bit shifting for efficiency.
      const positionalWeight = 1 << (GLOBAL_SETTINGS.FIXED_BINARY_DIGIT_COUNT - 1 - bitIdx); // Equivalent to Math.pow(2, 49-i).
      const candidateBitValue = finalCandidateBinaryString[bitIdx];

      // Utilize the helper function to determine the count of input elements
      // that contribute to the score at this specific bit position.
      const contributingElementsCount = tallyDifferingBits(
        candidateBitValue,
        oneBitCountsPerPosition[bitIdx],
        numberOfElements
      );
      currentCandidateCalculatedScore += contributingElementsCount * positionalWeight;
    }

    // Step 3.5: Update the overall maximum score if the current candidate yields a higher score.
    overallHighestScore = Math.max(overallHighestScore, currentCandidateCalculatedScore);
  }

  // --- PHASE 4: Output the Final Result ---
  console.log(overallHighestScore);
};

// --- Execution Entry Point (Standard Input Handling) ---
// Read the entire content of standard input synchronously.
// Specify 'utf8' encoding to ensure correct text interpretation.
const standardInputData = require("fs").readFileSync("/dev/stdin", { encoding: "utf8" });

// Initiate the problem-solving process with the data acquired from stdin.
solveBitwiseMaximization(standardInputData);