let isNodeEnvironment = typeof require !== 'undefined';

/**
 *  Main application entry point.
 *  Handles initial data acquisition and processing.
 */
function executeProgram() {
  let rawData = acquireSourceData();
  const lineSegments = rawData.split('\n');

  let countElements = Number.parseInt(lineSegments[0]);
  const numericValues = lineSegments.slice(1, countElements + 1).map( (segment) => {
    // Convert each string segment to an integer
    return Number.parseInt(segment);
  });

  // Output the result of the LIS calculation
  console.log(findLongestIncreasingSubsequence(numericValues));
}

/**
 * Calculates the length of the Longest Increasing Subsequence (LIS)
 * using a dynamic programming approach with binary search.
 * @param {Array<number>} inputArray - The sequence of numbers to process.
 * @returns {number} The length of the LIS.
 */
function findLongestIncreasingSubsequence(inputArray) {
  // dpArray stores the smallest tail of all increasing subsequences of length i+1.
  let dpArray = [inputArray[0]];

  for (let idx = 1; idx < inputArray.length; idx++) {
    const currentVal = inputArray[idx];
    // Find the position to insert currentVal to maintain sorted order in dpArray
    dpArray[locateInsertionPoint(dpArray, currentVal) + 1] = currentVal;
    logDiagnostic(dpArray); // Log the state of the DP array
  }
  return dpArray.length;
}

/**
 * Performs a binary search to find the index 'i' in a sorted array 'dataSequence'
 * such that dataSequence[i] < targetValue and targetValue <= dataSequence[i+1].
 * Returns -1 if targetValue is less than or equal to the first element.
 * @param {Array<number>} dataSequence - The sorted array to search within.
 * @param {number} targetValue - The value to search for.
 * @returns {number} The index 'i' or -1.
 */
function locateInsertionPoint(dataSequence, targetValue) {
  let lowBound = 0, highBound = dataSequence.length;

  if (dataSequence.length === 0 || targetValue <= dataSequence[0]) {
    return -1;
  }

  while (lowBound + 1 < highBound) {
    let midPoint = Math.floor((lowBound + highBound + 1) / 2);
    if (dataSequence[midPoint] < targetValue) {
      lowBound = midPoint;
    } else {
      highBound = midPoint;
    }
    logDiagnostic({ minIdx: lowBound, maxIdx: highBound });
  }
  return lowBound;
}

/**
 * Obtains input data based on the execution environment (Node.js or browser).
 * @returns {string} The raw input data as a string.
 */
function acquireSourceData() {
  if (!isNodeEnvironment) {
    return document.getElementById('dataInputBox').value;
  }
  return require('fs').readFileSync('/dev/stdin').toString();
}

/**
 * Logs diagnostic messages, typically to console.warn,
 * only if not running in a browser environment.
 * @param {*} messageContent - The content to log.
 */
function logDiagnostic(messageContent) {
  if (!isNodeEnvironment) {
    console.warn(messageContent);
  }
}

// Execute the main program if running in a Node.js environment.
if (isNodeEnvironment) {
  executeProgram();
}