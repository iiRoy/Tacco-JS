// This script processes a list of numeric values representing heights
// and determines how many structures are visible when viewed from the left.

/**
 * Initiates the data processing pipeline for a given raw input string.
 * It handles input parsing, validation, and delegates the core calculation.
 *
 * @param {string} rawInputString - The complete raw input as a single string,
 *                                  typically read from a file or standard input.
 */
function initiateDataProcessing(rawInputString) {
  // Perform initial validation on the input string to prevent errors.
  if (!rawInputString || typeof rawInputString !== 'string' || rawInputString.trim() === '') {
    console.error("Error: Received an invalid or empty input string for processing.");
    return; // Exit the function if input is not valid.
  }

  // Split the entire input content into an array of individual lines.
  const inputSegments = rawInputString.split('\n');

  // The problem statement implies the actual data is on the second line (index 1).
  // Check if the expected data line exists.
  const targetDataLineIndex = 1;
  if (inputSegments.length <= targetDataLineIndex) {
    console.error(`Error: Expected data line at index ${targetDataLineIndex} is missing.`);
    console.log(0); // If no data line, no visible structures.
    return;
  }

  const heightStringData = inputSegments[targetDataLineIndex];

  // If the specific data line is empty or just whitespace, no structures to count.
  if (heightStringData.trim() === '') {
    console.log(0);
    return;
  }

  // Parse the space-separated values from the target line into an array of numbers.
  // We trim each value to handle potential extra spaces and filter out any non-numeric results.
  const parsedHeightsCollection = heightStringData
                                  .split(' ')
                                  .map(item => Number(item.trim())) // Convert each string part to a number.
                                  .filter(num => !isNaN(num));      // Remove any elements that failed to parse as a number.

  // If, after parsing and filtering, there are no valid height measurements, output 0.
  if (parsedHeightsCollection.length === 0) {
    console.log(0);
    return;
  }

  // Call a dedicated helper function to perform the core logic of counting visible items.
  const totalVisibleStructures = countVisibleElements(parsedHeightsCollection);

  // Output the final computed count to the standard output.
  console.log(totalVisibleStructures);
}

/**
 * Calculates the number of structures visible from the left in a given array of heights.
 * A structure is considered visible if its height is greater than or equal to
 * the tallest structure encountered so far from the left.
 *
 * @param {number[]} structureElevationData - An array of numeric values representing structure heights.
 * @returns {number} The total count of visible structures.
 */
function countVisibleElements(structureElevationData) {
  let observableStructuresCounter = 0; // This variable will store the final count.
  // Initialize the highest point encountered with the smallest possible safe integer
  // to ensure the first element is always counted as visible (unless it's negative,
  // which heights typically aren't, but this is robust).
  let highestPointReachedSoFar = Number.MIN_SAFE_INTEGER;

  // Iterate through the array of structure heights using a traditional for loop.
  // This provides explicit control over the index.
  for (let currentIdx = 0; currentIdx < structureElevationData.length; currentIdx++) {
    const currentStructureHeight = structureElevationData[currentIdx];

    // Check if the current structure is taller than or equal to any previously encountered structure.
    if (currentStructureHeight >= highestPointReachedSoFar) {
      observableStructuresCounter++; // Increment the counter if it's visible.
      highestPointReachedSoFar = currentStructureHeight; // Update the new highest point seen.
    }
  }

  return observableStructuresCounter;
}

// The entry point for execution: Read data from standard input and pass it
// to the main processing function.
initiateDataProcessing(require("fs").readFileSync("/dev/stdin","utf-8"));