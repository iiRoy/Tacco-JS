// Function to remove duplicate elements from a collection of items.
// Employs a temporary tracking mechanism to ensure uniqueness.
function deduplicateCollection(sourceList) {
  // Guard clause: If the input list is null, undefined, or not an array, return an empty array.
  if (!Array.isArray(sourceList)) {
    return [];
  }

  const uniqueElementsTracker = new Map(); // Using a Map for efficient tracking of seen elements.
  const resultAccumulator = []; // This will store our unique items.

  // Iterate over each item in the provided list.
  for (let idx = 0; idx < sourceList.length; idx++) {
    const currentItem = sourceList[idx];

    // If the current item has not been recorded in our tracker, it's unique so far.
    if (!uniqueElementsTracker.has(currentItem)) {
      uniqueElementsTracker.set(currentItem, true); // Mark it as seen.
      resultAccumulator.push(currentItem); // Add it to our unique results.
    }
  }

  return resultAccumulator; // Return the list containing only unique elements.
}

// Main processing routine for numerical data.
// It determines the count of numbers within a specified range that are NOT multiples of two given divisors.
function ProcessInputData(rawDataSegments) {
  // Input validation: Ensure rawDataSegments is an array and has at least 4 elements.
  if (!Array.isArray(rawDataSegments) || rawDataSegments.length < 4) {
    console.error("Error: Insufficient input data provided.");
    return; // Exit if input is invalid.
  }

  // Parse numerical parameters from the raw input strings.
  // Using Number() for conversion and adding checks for validity.
  const startRange = Number(rawDataSegments[0]);
  const endRange = Number(rawDataSegments[1]);
  const divisorOne = Number(rawDataSegments[2]);
  const divisorTwo = Number(rawDataSegments[3]);

  // Further validation for parsed numbers.
  if (isNaN(startRange) || isNaN(endRange) || isNaN(divisorOne) || isNaN(divisorTwo)) {
    console.error("Error: Invalid numerical input detected.");
    return;
  }
  if (startRange > endRange) {
    console.error("Error: Start of range cannot be greater than end of range.");
    return;
  }
  // Divisor checks to prevent division by zero or illogical operations.
  if (divisorOne === 0 || divisorTwo === 0) {
    console.error("Error: Divisors cannot be zero.");
    return;
  }

  // Collection to store all multiples of divisorOne and divisorTwo found within the range.
  const identifiedMultiples = [];

  // --- Process for Divisor One (C) ---
  // Calculate the first multiple of divisorOne that is greater than or equal to startRange.
  let initialMultiplierForC = Math.ceil(startRange / divisorOne);
  let currentMultipleValueC = initialMultiplierForC * divisorOne;

  // Iterate and collect multiples of divisorOne until the end of the range is exceeded.
  while (currentMultipleValueC <= endRange) {
    identifiedMultiples.push(currentMultipleValueC);
    currentMultipleValueC += divisorOne; // Move to the next multiple.
  }

  // --- Process for Divisor Two (D) ---
  // Calculate the first multiple of divisorTwo that is greater than or equal to startRange.
  let initialMultiplierForD = Math.ceil(startRange / divisorTwo);
  let currentMultipleValueD = initialMultiplierForD * divisorTwo;

  // Iterate and collect multiples of divisorTwo until the end of the range is exceeded.
  while (currentMultipleValueD <= endRange) {
    identifiedMultiples.push(currentMultipleValueD);
    currentMultipleValueD += divisorTwo; // Move to the next multiple.
  }

  // Remove any duplicate multiples that might have been added (e.g., multiples of both C and D).
  const distinctMultiplesSet = deduplicateCollection(identifiedMultiples);

  // Calculate the total number of integers within the specified range [startRange, endRange].
  const totalElementsInRange = endRange - startRange + 1;

  // The final result is the total elements minus those that are multiples of C or D.
  const finalResultCount = totalElementsInRange - distinctMultiplesSet.length;

  // Output the computed result.
  console.log(finalResultCount);
}

// Entry point: Read input from standard input, process it, and initiate the main calculation.
// The input is expected to be a string, which is then trimmed and split by newline or space characters.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\n|\s/));