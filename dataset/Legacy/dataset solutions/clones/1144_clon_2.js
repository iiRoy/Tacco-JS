// This JavaScript program calculates the length of the Longest Increasing Subsequence (LIS)
// for a given array of integers. It supports both browser and Node.js environments
// for input retrieval and diagnostic logging.

/**
 * The primary execution function that orchestrates input reading, LIS calculation,
 * and result output.
 */
function executeProgram() {
  // Retrieve the raw input data, which could be from a DOM element or standard input.
  var rawData = retrieveSourceData();
  // Split the multi-line input string into an array of individual line strings.
  var lineSegments = rawData.split('\n');

  // Parse the first line to determine the total count of numbers to process.
  var countElements = Number.parseInt(lineSegments[0], 10);
  // Extract the actual numeric values from the subsequent lines, converting them to integers.
  var numericValues = lineSegments.slice(1, countElements + 1).map(function(strVal) {
    return Number.parseInt(strVal, 10);
  });
  
  // Compute the LIS length for the extracted numbers and print the result to the console.
  console.log(findLongestIncreasingSubsequence(numericValues));
}

/**
 * Determines the length of the Longest Increasing Subsequence (LIS) within a given array.
 * This implementation uses a dynamic programming approach with binary search,
 * similar to patience sorting, achieving O(N log N) time complexity.
 *
 * @param {number[]} inputSequence - The array of numbers for which to find the LIS.
 * @returns {number} The length of the LIS.
 */
function findLongestIncreasingSubsequence(inputSequence) {
  // 'sequenceTracker' stores the smallest ending element of all increasing subsequences
  // of a certain length. sequenceTracker[k] holds the smallest tail of an increasing
  // subsequence of length (k+1).
  var sequenceTracker = [inputSequence[0]];
  
  // Iterate through the input sequence, starting from the second element.
  for (var idx = 1; idx < inputSequence.length; idx++) {
    var currentValue = inputSequence[idx];
    // Find the appropriate position for 'currentValue' in 'sequenceTracker'.
    // This position ensures 'sequenceTracker' remains sorted and helps maintain
    // the smallest tail for subsequences of various lengths.
    var insertionPoint = binarySearchForInsertionPoint(sequenceTracker, currentValue);
    sequenceTracker[insertionPoint + 1] = currentValue;
    // Output the current state of the sequence tracker for debugging purposes.
    logDiagnostic(sequenceTracker);
  }
  // The final length of 'sequenceTracker' represents the length of the LIS.
  return sequenceTracker.length;
}
 

/**
 * Performs a binary search on a sorted array to find the index 'k' such that
 * array[k] < targetValue and targetValue <= array[k+1].
 * If 'targetValue' is less than or equal to the first element, it returns -1.
 * This function is crucial for efficiently updating the 'sequenceTracker' in the LIS algorithm.
 *
 * @param {number[]} sequenceTracker - The sorted array to search within.
 * @param {number} targetValue - The value for which to find the insertion point.
 * @returns {number} The index 'k' or -1 if 'targetValue' is smaller than or equal to the first element.
 */
function binarySearchForInsertionPoint(sequenceTracker, targetValue) {
  var lowBound = 0, highBound = sequenceTracker.length;
  
  // Handle edge cases: if the tracker is empty or the target value is smaller
  // than or equal to the smallest element in the tracker.
  if (sequenceTracker.length === 0 || targetValue <= sequenceTracker[0]) {
    return -1;
  }
  
  // Execute the binary search loop.
  while (lowBound + 1 < highBound) {
    // Calculate the midpoint. The '+ 1' ensures the pivot leans towards 'highBound'
    // which is important for correctly handling cases where 'lowBound + 1 === highBound'.
    var midPoint = Math.floor((lowBound + highBound + 1) / 2);
    if (sequenceTracker[midPoint] < targetValue) {
      lowBound = midPoint; // If the element at 'midPoint' is smaller, move 'lowBound' up.
    } else {
      highBound = midPoint; // Otherwise, move 'highBound' down.
    }
    // Log the current search bounds for diagnostic review.
    logDiagnostic({ l: lowBound, h: highBound });
  }
  // 'lowBound' now points to the largest index 'k' where sequenceTracker[k] < targetValue.
  return lowBound;
}

// A global boolean flag to detect if the current execution environment is Node.js.
var isNodeEnvironment = typeof require !== 'undefined';

/**
 * Retrieves input data based on the detected execution environment.
 * In a browser, it fetches the value from an HTML element with the ID 'input'.
 * In a Node.js environment, it reads data from '/dev/stdin'.
 *
 * @returns {string} The raw input data as a string.
 */
function retrieveSourceData() {
  if (!isNodeEnvironment) {
    // Browser environment: get input from a DOM element.
    return document.getElementById('input').value;
  }
  // Node.js environment: read input from standard input.
  return require('fs').readFileSync('/dev/stdin').toString();
}

/**
 * Provides a mechanism for logging diagnostic messages.
 * This function outputs messages to `console.error` only when not running in a Node.js environment.
 * In Node.js, it performs no action, mirroring the original behavior.
 *
 * @param {*} diagnosticMessage - The message or object to be logged for diagnostics.
 */
function logDiagnostic(diagnosticMessage) {
  if (!isNodeEnvironment) {
    console.error(diagnosticMessage);
  }
}

// If the script is being executed in a Node.js environment,
// invoke the main program function to start execution.
if (isNodeEnvironment) {
  executeProgram();
}
