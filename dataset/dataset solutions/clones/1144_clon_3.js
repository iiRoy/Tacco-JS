const environmentConfig = {
  isNode: typeof require !== 'undefined',
  debugMode: false, // Set to true for verbose diagnostic output
  inputElementId: 'sourceData' // ID of the HTML element for input in browser
};

/**
 * Retrieves raw textual data from the appropriate source based on the execution environment.
 * In a browser, it fetches content from a specific DOM element.
 * In Node.js, it reads from standard input.
 * @returns {string | null} The raw input string, or null if an error occurs.
 */
function fetchRawDataSource() {
  if (!environmentConfig.isNode) {
    const inputElement = document.getElementById(environmentConfig.inputElementId);
    if (inputElement) {
      return inputElement.value;
    } else {
      emitDiagnosticMessage(`Error: HTML element with ID '${environmentConfig.inputElementId}' not found.`);
      return null;
    }
  } else {
    try {
      // Using '/dev/stdin' is specific to Unix-like systems. For Windows, '0' or a file path might be needed.
      return require('fs').readFileSync('/dev/stdin').toString().trim();
    } catch (err) {
      emitDiagnosticMessage(`Node.js input error: ${err.message}`);
      return null;
    }
  }
}

/**
 * Outputs diagnostic information to the console if debugMode is enabled.
 * @param {any} message - The message or object to log.
 */
function emitDiagnosticMessage(message) {
  if (environmentConfig.debugMode) {
    console.warn("[DIAGNOSTIC]:", message);
  }
}

/**
 * Determines the length of the Longest Increasing Subsequence (LIS) within a given array of numbers.
 * This implementation uses an efficient O(N log N) approach based on maintaining
 * an array of minimal ending elements for all increasing subsequences of various lengths.
 * @param {number[]} dataSequence - The array of numbers to analyze.
 * @returns {number} The length of the LIS.
 */
function determineLongestAscendingSubsequenceLength(dataSequence) {
  // Guard against invalid or empty input sequences.
  if (!dataSequence || dataSequence.length === 0) {
    emitDiagnosticMessage("Empty or invalid data sequence provided for LIS calculation.");
    return 0;
  }

  // `minimalEndings` stores the smallest ending element of an increasing subsequence of a given length.
  // minimalEndings[i] holds the smallest tail of all increasing subsequences of length i+1.
  const minimalEndings = [dataSequence[0]];

  // Iterate through the remaining elements of the sequence.
  for (let sequenceIndex = 1; sequenceIndex < dataSequence.length; ++sequenceIndex) {
    const currentElement = dataSequence[sequenceIndex];

    // Find the correct position for the current element in `minimalEndings`.
    // The `findAppropriatePosition` function returns the index `k` such that
    // `minimalEndings[k]` is the smallest element >= `currentElement`.
    // If all elements in `minimalEndings` are smaller, it returns `minimalEndings.length`.
    const insertionPoint = findAppropriatePosition(minimalEndings, currentElement);

    if (insertionPoint === minimalEndings.length) {
      // If `currentElement` is greater than all elements in `minimalEndings`,
      // it extends the longest subsequence found so far.
      minimalEndings.push(currentElement);
    } else {
      // Otherwise, `currentElement` can potentially form a new increasing subsequence
      // of the same length but with a smaller ending element, which is more favorable
      // for future extensions.
      minimalEndings[insertionPoint] = currentElement;
    }
  }

  // The length of `minimalEndings` directly corresponds to the LIS length.
  return minimalEndings.length;
}

/**
 * Performs a binary search on an `orderedCollection` to find the index where `valueToLocate`
 * should be inserted to maintain sorted order, specifically finding the first element
 * that is greater than or equal to `valueToLocate`.
 * This is equivalent to `std::lower_bound` in C++ or `bisect_left` in Python.
 * @param {number[]} orderedCollection - A sorted array of numbers (typically `minimalEndings` from LIS).
 * @param {number} valueToLocate - The value to find the insertion point for.
 * @returns {number} The index `k` such that `orderedCollection[k]` is the first element
 *                   greater than or equal to `valueToLocate`. Returns `orderedCollection.length`
 *                   if `valueToLocate` is greater than all elements.
 */
function findAppropriatePosition(orderedCollection, valueToLocate) {
  let lowBound = 0;
  let highBound = orderedCollection.length; // The search space includes `length` as a potential insertion point

  while (lowBound < highBound) {
    const midIndex = Math.floor(lowBound + (highBound - lowBound) / 2); // Avoids potential overflow for very large bounds

    if (orderedCollection[midIndex] < valueToLocate) {
      // If the middle element is less than `valueToLocate`,
      // we need to search in the right half (midIndex + 1 to highBound).
      lowBound = midIndex + 1;
    } else {
      // If the middle element is greater than or equal to `valueToLocate`,
      // it could be our target or the target is in the left half (lowBound to midIndex).
      highBound = midIndex;
    }
  }
  // At the end of the loop, `lowBound` (and `highBound`) will be the insertion point.
  return lowBound;
}

/**
 * Main execution function that orchestrates input processing and LIS calculation.
 */
function processInputAndCalculateLIS() {
  const sourceTextContent = fetchRawDataSource();

  if (sourceTextContent === null || sourceTextContent.trim() === '') {
    emitDiagnosticMessage("Input source was empty or could not be retrieved. Aborting.");
    return;
  }

  const parsedLines = sourceTextContent.split('\n');

  // Validate that there's at least one line for the count.
  if (parsedLines.length === 0) {
    emitDiagnosticMessage("Input content has no lines.");
    return;
  }

  const expectedCount = parseInt(parsedLines[0], 10);
  // Ensure the parsed count is a valid number.
  if (isNaN(expectedCount) || expectedCount < 0) {
    emitDiagnosticMessage(`Invalid expected count: ${parsedLines[0]}. Must be a non-negative integer.`);
    return;
  }

  // Extract and parse the numerical values from the subsequent lines.
  const numericalValues = parsedLines
    .slice(1, expectedCount + 1) // Take lines from index 1 up to (and including) expectedCount
    .map(val => Number(val));    // Convert each string to a number

  // Add a validation step for the number of elements read.
  if (numericalValues.length !== expectedCount) {
    emitDiagnosticMessage(`Warning: Expected ${expectedCount} numbers, but found ${numericalValues.length}. Processing available data.`);
    // Optionally, could throw an error or truncate/pad numericalValues here.
    // For this clone, we'll proceed with what was parsed.
  }

  // Calculate the LIS length.
  const resultLength = determineLongestAscendingSubsequenceLength(numericalValues);

  // Output the final result.
  console.log(resultLength);
}

// Entry point for execution, conditional on environment.
if (environmentConfig.isNode) {
  processInputAndCalculateLIS();
} else {
  // For browser environments, provide a placeholder or attach to a DOM event.
  // For example, if there's a button to trigger calculation:
  // document.getElementById('calculateButton').addEventListener('click', processInputAndCalculateLIS);
  // Or, if it should run on page load after input is available:
  // window.onload = processInputAndCalculateLIS;
  // For this example, we'll just define the functions.
}