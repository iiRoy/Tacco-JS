'use strict'; // Enforce stricter parsing and error handling for the entire script

/**
 * Determines if every numerical entry within a given array is strictly zero.
 * This helper function is used to check for the termination condition of the main loop.
 * @param {Array<number>} dataList - The array of numerical values to be examined.
 * @returns {boolean} Returns true if all elements are zero, false otherwise.
 */
function areAllElementsZero(dataList) {
  // Iterate through each individual number in the provided list.
  for (let elementValue of dataList) {
    // If any element is found that is not equal to zero,
    // it means the condition (all elements are zero) is not met.
    if (elementValue !== 0) {
      return false; // Exit early as a non-zero element was found.
    }
  }
  // If the loop completes without finding any non-zero elements,
  // it implies that all elements in the array are indeed zero.
  return true;
}


/**
 * This is the primary function that orchestrates the solution logic.
 * It reads input, performs calculations based on an iterative process,
 * and then outputs the final result.
 * @param {string} sourceContent - The raw string content obtained from the input source.
 */
function runSolution(sourceContent) {
  // Process the raw input string by splitting it into individual lines.
  // The 'Array.from' ensures we get a proper array from the iterable split result.
  const parsedLines = Array.from(sourceContent.split('\n'));

  // The first line of input typically contains a single integer,
  // which we parse and store (though not directly used in the loop logic here).
  const totalCount = parseInt(parsedLines[0], 10);

  // The second line contains space-separated numbers.
  // We split this line into strings, then convert each string segment into an integer.
  // This forms the dynamic data series that will be modified during the process.
  const dataSeries = parsedLines[1].split(' ').map((elementString) => parseInt(elementString, 10));


  // Initialize a counter to keep track of the number of operations performed.
  let stepsTaken = 0;

  // The main processing loop continues as long as the 'dataSeries' contains
  // at least one element that is not zero.
  while (!areAllElementsZero(dataSeries)) {
    // Identify the maximum value present in the current 'dataSeries'.
    // The 'reduce' method is used to iterate and find the highest number.
    const peakValue = dataSeries.reduce((accumulatorMax, valueToCompare) => Math.max(accumulatorMax, valueToCompare));

    // Find the index of the first occurrence of this maximum value.
    const firstPeakIndex = dataSeries.indexOf(peakValue);

    // Initialize the end index of the peak segment. It starts at the same point as the beginning.
    let lastPeakIndex = firstPeakIndex;

    // Extend the 'lastPeakIndex' to encompass all consecutive elements
    // that also hold the 'peakValue'. This identifies the full contiguous peak.
    while (dataSeries[lastPeakIndex + 1] === peakValue) {
      lastPeakIndex++;
    }

    // Construct an array of indices that represent the entire range of the identified peak.
    // This allows easy iteration over all elements that need to be modified.
    const targetIndices = Array.from(new Array(lastPeakIndex - firstPeakIndex + 1)
      .fill(0) // Placeholder values, the actual value doesn't matter for map
      .map((_, loopIndex) => loopIndex + firstPeakIndex)); // Map to actual indices

    // Iterate through each index within the 'targetIndices' array.
    for (let currentAffectedIndex of targetIndices) {
      // Decrement the value at the current index in the 'dataSeries'.
      // This simulates "reducing" the peak.
      dataSeries[currentAffectedIndex]--;
    }

    // After successfully processing one peak, increment the operation counter.
    stepsTaken++;
  }

  // Once the loop terminates (all elements in 'dataSeries' are zero),
  // print the total number of operations performed to the console.
  console.log(stepsTaken);
}

// Invoke the main solution function by reading input from standard input.
// 'require('fs').readFileSync' is used to synchronously read the file content.
runSolution(require('fs').readFileSync('/dev/stdin', 'utf8'));