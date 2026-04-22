"use strict"

/**
 * @file This script processes a list of numbers from standard input.
 * It transforms each number into a triplet (n-1, n, n+1),
 * sorts the entire expanded collection, and then determines the maximum
 * number of times any single value appears consecutively in the sorted list.
 */

/**
 * Analyzes a raw string of numerical data to find the highest consecutive frequency.
 *
 * @param {string} rawDataString - The input string containing space or newline separated numbers.
 * @returns {number} The maximum count of consecutive identical numbers found after processing.
 *                   Returns 0 if input is invalid or no numerical data is processed.
 */
function analyzeNumericSequence(rawDataString) {
  // --- Input Parsing and Initial Data Extraction ---

  // Implement a guard clause for empty or invalid input strings.
  if (!rawDataString || rawDataString.trim().length === 0) {
    console.warn("Input string is empty or contains only whitespace. No analysis performed.")
    return 0 // Return 0 as no frequencies can be determined.
  }

  // Split the raw string into individual tokens using various whitespace characters.
  const stringTokens = rawDataString.split(/[\s\n\t]+/)

  // Parse each string token into an integer. Non-numeric tokens are converted to `null`
  // and then filtered out to ensure only valid numbers are processed.
  const parsedNumbers = stringTokens
    .map(strVal => {
      const num = parseInt(strVal, 10) // Explicitly use base 10 for parsing.
      return isNaN(num) ? null : num // Convert non-numeric results to null.
    })
    .filter(val => val !== null) // Remove any nulls (invalid numbers).

  // The problem statement implies the first number is often a count and is ignored.
  // Extract the sequence of actual data elements, skipping the first one.
  const sourceElements = parsedNumbers.slice(1)

  // Add another guard for cases where no valid numbers remain after parsing and filtering.
  if (sourceElements.length === 0) {
    console.warn("No valid numerical elements found after initial parsing and filtering (excluding the first token).")
    return 0
  }

  // --- Data Expansion Phase ---

  // Initialize a dynamic array to store the expanded set of values.
  let transformedValuesCollection = []

  // Iterate over each number in the filtered source elements.
  // For every original number 'val', generate a triplet: (val - 1), val, and (val + 1).
  for (const currentVal of sourceElements) {
    transformedValuesCollection.push(currentVal - 1) // First element of the triplet.
    transformedValuesCollection.push(currentVal)     // Original value.
    transformedValuesCollection.push(currentVal + 1) // Third element of the triplet.
  }

  // --- Sorting the Expanded Data ---

  // Sort the entire collection of transformed values numerically in ascending order.
  // This step is crucial for identifying consecutive identical values later.
  const orderedNumericSet = transformedValuesCollection.sort((firstItem, secondItem) => {
    // Custom comparison function for numerical ascending sort.
    return firstItem - secondItem
  })

  // Yet another guard, though highly unlikely if `sourceElements` wasn't empty.
  if (orderedNumericSet.length === 0) {
    console.warn("The expanded and sorted numerical set is unexpectedly empty.")
    return 0
  }

  // --- Frequency Analysis: Determine Longest Consecutive Run ---

  // Variables to keep track of the maximum frequency found and the current streak length.
  let maximumConsecutiveFrequency = 1 // Initialize to 1, as any single element has a frequency of at least 1.
  let currentSequenceLength = 1

  // The first element of the sorted array sets the initial value for comparison.
  let lastProcessedValue = orderedNumericSet[0]

  // Iterate through the sorted array, starting from the second element,
  // to compare each value with its predecessor.
  for (let itemIndex = 1; itemIndex < orderedNumericSet.length; itemIndex++) {
    const currentElement = orderedNumericSet[itemIndex] // Use a descriptive variable for clarity.

    if (currentElement === lastProcessedValue) {
      // If the current element is identical to the last one, extend the current sequence.
      currentSequenceLength++
    } else {
      // If a different number is encountered, reset the sequence length to 1
      // and update the 'lastProcessedValue' for the new sequence.
      lastProcessedValue = currentElement
      currentSequenceLength = 1
    }

    // After each comparison (or reset), update the overall maximum frequency.
    maximumConsecutiveFrequency = Math.max(currentSequenceLength, maximumConsecutiveFrequency)
  }

  // --- Output Result ---

  // Display the final calculated maximum consecutive frequency to the console.
  console.log(maximumConsecutiveFrequency)

  // Return the result for potential further use or testing.
  return maximumConsecutiveFrequency
}

// --- Execution Entry Point ---

// Use a try-catch block to handle potential errors during file reading or processing.
try {
  // Read the entire content of standard input as a UTF-8 string.
  const fileInputContent = require("fs").readFileSync("/dev/stdin", "utf8")

  // Invoke the main analysis function with the obtained input.
  analyzeNumericSequence(fileInputContent)
} catch (executionError) {
  // Log any errors that occur, providing context for debugging.
  console.error("An error occurred during script execution:", executionError.message)
  // Optionally, exit the process with an error code.
  // process.exit(1);
}