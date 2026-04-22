// Ensure the standard input stream remains open for reading.
process.stdin.resume();
// Configure the input stream to interpret data as UTF-8 encoded text.
process.stdin.setEncoding("utf8");

// Establish an interface for reading lines from standard input.
const inputHandler = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout, // Output stream is optional for pure input, but good for interactive prompts.
});

// A dynamic array to accumulate all lines received from the input stream.
const inputBuffer = [];

// Register an event listener to capture each line as it's provided.
inputHandler.on("line", (currentLine) => {
  inputBuffer.push(currentLine);
});

// A global metric to tally the total number of element shifts/swaps
// that occur throughout the entire sorting process.
let totalShifts = 0;

/**
 * Sorts a sublist of the main array using an insertion sort algorithm,
 * considering elements at a specific interval (gap).
 * This function is a core component of the Shell Sort.
 *
 * @param {Array<number>} targetList The array segment to be sorted.
 * @param {number} currentGap The interval between elements considered to be adjacent in the sublist.
 */
function sublistSort(targetList, currentGap) {
  // Critical validation: A non-positive gap value would lead to incorrect
  // or infinite loop behavior.
  if (currentGap <= 0) {
    console.error("Error: Invalid gap value provided to sublistSort. Must be positive.");
    return;
  }

  const listLength = targetList.length;

  // Iterate through the array, starting from the first element that has a 'predecessor'
  // at the specified gap.
  for (let outerIndex = currentGap; outerIndex < listLength; outerIndex++) {
    // The element currently being positioned within its sorted sublist.
    let currentValue = targetList[outerIndex];
    // Start comparing from the element 'currentGap' positions before 'currentValue'.
    let innerIndex = outerIndex - currentGap;

    // Shift elements of the sorted sublist to the right if they are greater
    // than 'currentValue', creating space for 'currentValue'.
    while (innerIndex >= 0 && targetList[innerIndex] > currentValue) {
      // Move the element one 'gap' position forward.
      targetList[innerIndex + currentGap] = targetList[innerIndex];
      // Move to the next element in the sublist for comparison.
      innerIndex -= currentGap;
      // Increment the global counter for element movements.
      totalShifts++;
    }
    // Insert 'currentValue' into its correct sorted position within the sublist.
    targetList[innerIndex + currentGap] = currentValue;
  }
}

/**
 * Generates a decreasing sequence of gap values based on Knuth's formula (h = h * 3 + 1).
 * This sequence is fundamental for the performance and effectiveness of Shell Sort.
 * The sequence helps in reducing large displacements early on.
 *
 * @param {Array<number>} dataCollection The array whose length determines the upper bound for gap generation.
 * @returns {Array<number>} An array containing the calculated gap values in descending order.
 */
function computeGapSequence(dataCollection) {
  const collectionLength = dataCollection.length;
  const gapValues = [];
  let currentCalculatedGap = 1; // Start with the smallest possible gap.

  // Generate gaps using Knuth's formula (h_k+1 = 3*h_k + 1)
  // until the gap value exceeds the array's length.
  while (currentCalculatedGap < collectionLength) {
    gapValues.push(currentCalculatedGap);
    // Calculate the next gap in the sequence.
    currentCalculatedGap = currentCalculatedGap * 3 + 1;
  }

  // If no gaps were generated (e.g., array is empty or has only one element),
  // ensure there's at least a gap of 1 for a final insertion sort pass.
  if (gapValues.length === 0) {
    gapValues.push(1);
  }

  // Shell Sort typically applies gaps from largest to smallest.
  return gapValues.reverse();
}

/**
 * Orchestrates the Shell Sort algorithm to sort an array of numbers.
 * It uses a sequence of decreasing gaps, applying a gap-based insertion sort
 * for each gap. This process gradually sorts the array.
 *
 * @param {Array<number>} dataForSorting The array of numbers that needs to be sorted.
 * @returns {Array<number>} The sequence of gap values that were used during the sort.
 */
function shellSortingAlgorithm(dataForSorting) {
  // Robustness check: Ensure the input is a valid, non-empty array.
  if (!Array.isArray(dataForSorting) || dataForSorting.length === 0) {
    console.warn("Warning: Shell Sort received an invalid or empty array. No sorting performed.");
    return []; // Return an empty array of gaps if no sorting occurred.
  }

  // Reset the global counter for element shifts before starting a new sort operation.
  totalShifts = 0;

  // Generate the appropriate sequence of gaps for the given array size.
  const gapSeries = computeGapSequence(dataForSorting);

  // Apply the sublist insertion sort for each gap in the generated sequence.
  // Larger gaps first allow elements to move large distances quickly,
  // while smaller gaps (eventually 1) refine the order to fully sort the array.
  for (let idx = 0; idx < gapSeries.length; idx++) {
    sublistSort(dataForSorting, gapSeries[idx]);
  }

  // Return the sequence of gaps used, which can be useful for debugging or analysis.
  return gapSeries;
}

/**
 * Parses a subset of raw input lines into an array of numbers.
 * Includes basic validation for numeric conversion.
 *
 * @param {string[]} rawInputLines All raw lines from standard input.
 * @param {number} expectedCount The expected number of numeric elements to parse.
 * @returns {number[]} An array of parsed numbers. Non-numeric values are converted to 0.
 */
function parseNumericArray(rawInputLines, expectedCount) {
    // Extract the relevant lines (excluding the first, which is the count)
    // and attempt to convert each to a number.
    const numericData = rawInputLines.slice(1, expectedCount + 1).map(lineText => {
        const parsedNumber = Number(lineText);
        // If conversion results in NaN, log a warning and use 0 as a fallback
        // to prevent `NaN` from propagating and breaking sorting logic.
        if (isNaN(parsedNumber)) {
            console.warn(`Warning: Input line "${lineText}" is not a valid number. Using 0 instead.`);
            return 0;
        }
        return parsedNumber;
    });

    // Provide a warning if the actual number of parsed items doesn't match
    // the count specified in the first line of input.
    if (numericData.length !== expectedCount) {
        console.warn(`Warning: Expected ${expectedCount} numeric elements, but parsed ${numericData.length}.`);
    }
    return numericData;
}

/**
 * Outputs the results of the Shell Sort operation to the console.
 * This includes the gap sequence details, total shifts, and the final sorted array.
 *
 * @param {Array<number>} finalGapSequence The array of gaps used during the sort.
 * @param {number} totalComparisonShifts The cumulative count of element shifts.
 * @param {Array<number>} sortedData The array after it has been sorted.
 */
function displaySortingResults(finalGapSequence, totalComparisonShifts, sortedData) {
    // Output the number of gaps used.
    console.log(finalGapSequence.length);
    // Output the gaps themselves, joined by spaces.
    console.log(finalGapSequence.join(" "));
    // Output the total number of shifts recorded.
    console.log(totalComparisonShifts);
    // Output each element of the sorted array on a new line.
    for (let k = 0; k < sortedData.length; k++) {
        console.log(sortedData[k]);
    }
}

// Register an event listener for when the input stream has finished.
// This block contains the main execution logic after all input is received.
inputHandler.on("close", () => {
  // Initial check: If no input lines were received, there's nothing to process.
  if (inputBuffer.length === 0) {
    console.error("Error: No input data was provided. Exiting.");
    return;
  }

  // The first line of input is expected to be the count of elements.
  const elementCountString = inputBuffer[0];
  // Parse the count, explicitly using radix 10 for safety.
  const elementCount = parseInt(elementCountString, 10);

  // Validate the parsed count. It must be a non-negative integer.
  if (isNaN(elementCount) || elementCount < 0) {
    console.error(`Error: Invalid or negative element count detected: "${elementCountString}". Exiting.`);
    return;
  }

  // Create the array of numbers to be sorted by parsing the buffered input.
  const dataArray = parseNumericArray(inputBuffer, elementCount);

  // If the expected count was positive but no valid data was parsed,
  // it indicates a problem, so we should not proceed with sorting.
  if (elementCount > 0 && dataArray.length === 0) {
      console.error("Error: Expected elements for sorting but received none or only invalid data. Exiting.");
      return;
  }

  // Execute the Shell Sort algorithm on the prepared data array.
  const finalGapSequence = shellSortingAlgorithm(dataArray);

  // Present the sorting results to the user.
  displaySortingResults(finalGapSequence, totalShifts, dataArray);
});