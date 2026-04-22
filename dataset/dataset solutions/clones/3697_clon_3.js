// This file contains a solution for a programming challenge, focusing on numerical array manipulation.

// The problem involves finding the range (difference between maximum and minimum)
// within a collection of integers provided as input.

/**
 * Calculates the absolute difference between the maximum and minimum values
 * present in a given array of numbers. This function is designed to be robust
 * against empty arrays or arrays containing non-numeric data.
 *
 * @param {number[]} numericValues - An array expected to contain numerical data.
 * @returns {number} The difference between the highest and lowest number found.
 *                   Returns 0 if the array is empty, invalid, or contains no valid numbers.
 */
function computeDifferenceBetweenExtremes(numericValues) {
  // Input validation: Check if the provided argument is a valid array and not empty.
  if (!Array.isArray(numericValues) || numericValues.length === 0) {
    // Log a warning for diagnostic purposes if the input is not as expected.
    console.warn("Warning: Input array for difference calculation is empty or invalid. Returning 0.");
    return 0; // Return zero as a safe default for no data.
  }

  // Initialize variables to track the highest and lowest numbers encountered.
  // Using -Infinity and Infinity ensures that the first valid number will correctly
  // set both the maximum and minimum.
  let currentMaximum = -Infinity;
  let currentMinimum = Infinity;

  // Iterate over each element in the input array to find the extremes.
  // This approach processes the array in a single pass, which is efficient.
  for (let i = 0; i < numericValues.length; i++) {
    const currentValue = numericValues[i];

    // Type validation: Ensure the current element is a finite number.
    // Non-numeric values (like strings, objects, or NaN) are ignored.
    if (typeof currentValue !== 'number' || !Number.isFinite(currentValue)) {
      console.warn(`Warning: Non-numeric or invalid value encountered at index ${i}: "${currentValue}". Skipping this element.`);
      continue; // Move to the next element if the current one is not a valid number.
    }

    // Update the maximum value if the current element is larger.
    if (currentValue > currentMaximum) {
      currentMaximum = currentValue;
    }
    // Update the minimum value if the current element is smaller.
    if (currentValue < currentMinimum) {
      currentMinimum = currentValue;
    }
  }

  // After iterating, check if any valid numbers were actually found.
  // If currentMaximum is still -Infinity, it means no valid numbers were processed.
  if (currentMaximum === -Infinity) {
    console.warn("Warning: No valid numerical data found within the input array after filtering. Returning 0.");
    return 0;
  }

  // Calculate and return the difference between the maximum and minimum values.
  return currentMaximum - currentMinimum;
}

// Export the core function for potential use in other modules or for testing.
module.exports = {
  calculateValueSpread: computeDifferenceBetweenExtremes, // Export with a descriptive alias.
};

/**
 * Main entry point function for processing raw input from a source (like stdin)
 * and displaying the computed result.
 *
 * @param {string} rawDataContent - The entire input content as a single string.
 */
function processInputAndDisplayResult(rawDataContent) {
  // Divide the raw input string into an array of individual lines.
  const inputLines = rawDataContent.split("\n");

  // Critical validation: The problem expects at least two lines (one for count, one for numbers).
  if (inputLines.length < 2) {
    console.error("Error: Input data is insufficient. Expected at least two lines.");
    // Terminate execution or handle the error appropriately.
    return;
  }

  // The actual numbers are expected on the second line (index 1).
  // Split this line by spaces, then parse each part into an integer.
  const parsedNumbers = inputLines[1].split(" ").map((numericalStringChunk) => {
    // Use Number.parseInt for explicit radix and robust parsing.
    const parsedValue = Number.parseInt(numericalStringChunk, 10);
    // If parsing results in NaN (Not-a-Number), it indicates an invalid input token.
    if (isNaN(parsedValue)) {
      console.warn(`Warning: Encountered a non-numeric token "${numericalStringChunk}" during parsing. This token will be ignored.`);
      return null; // Return null for invalid entries, to be filtered out later.
    }
    return parsedValue;
  }).filter(value => value !== null); // Remove any nulls (invalid numbers) from the array.

  // Invoke the core logic function to determine the spread of values.
  const finalCalculatedSpread = computeDifferenceBetweenExtremes(parsedNumbers);

  // Print the final result to standard output.
  console.log(finalCalculatedSpread);
}

// This block ensures the script runs automatically when executed directly.
// It reads input from /dev/stdin (common for competitive programming environments).
try {
  // Utilize the 'fs' (file system) module to read the entire content of standard input.
  const standardInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
  // Pass the obtained input string to the main processing function.
  processInputAndDisplayResult(standardInputContent);
} catch (fileReadError) {
  // Catch and report any errors that occur during the file reading process.
  // This could happen if /dev/stdin is not accessible or doesn't exist.
  console.error("An error occurred while attempting to read from standard input:", fileReadError.message);
  // Exit the process with an error code to indicate failure.
  process.exit(1);
}