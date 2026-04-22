// This module is designed to process sequences of numbers from standard input.
// Its primary function is to determine if a given sequence can be partitioned
// into two strictly increasing subsequences using a recursive backtracking algorithm.

/**
 * Orchestrates the entire sequence analysis process.
 * This function is invoked once all input data has been gathered from stdin.
 * It handles parsing the input lines, validating the number of test cases,
 * and then iterating through each case to apply the core partitioning logic.
 */
function initiateSequenceAnalysis() {

  /**
   * Recursively checks if the `currentSequenceSlice` can be successfully distributed
   * into two strictly increasing subsequences.
   *
   * @param {number[]} currentSequenceSlice - The remaining portion of the numeric sequence to process.
   * @param {number} lastElementInSubsequenceA - The last (largest) number placed into the first subsequence.
   *                                            This acts as the "top" of the first conceptual stack.
   * @param {number} lastElementInSubsequenceB - The last (largest) number placed into the second subsequence.
   *                                            This acts as the "top" of the second conceptual stack.
   * @returns {boolean} True if the current slice can be partitioned, false otherwise.
   */
  const canPartitionIntoIncreasingSubsequences = (
    currentSequenceSlice,
    lastElementInSubsequenceA,
    lastElementInSubsequenceB
  ) => {
    // Base case: If there are no more elements to process, a valid partition has been found.
    if (currentSequenceSlice.length === 0) {
      return true;
    }

    // Extract the first element from the current slice and the rest of the sequence.
    const elementToConsider = currentSequenceSlice[0];
    const remainingElementsForNextStep = currentSequenceSlice.slice(1);

    let outcomeOfAttempt = false; // Flag to track if any path leads to a solution.

    // Attempt 1: Try adding the current element to the first subsequence (Subsequence A).
    // This is only possible if the current element is strictly greater than the last element added to A.
    if (elementToConsider > lastElementInSubsequenceA) {
      // Recursively call with the updated 'lastElementInSubsequenceA'.
      outcomeOfAttempt = canPartitionIntoIncreasingSubsequences(
        remainingElementsForNextStep,
        elementToConsider, // Update the last element for subsequence A
        lastElementInSubsequenceB // Subsequence B's last element remains unchanged
      );
    }

    // If the first attempt (adding to A) was successful, we don't need to explore other paths.
    if (outcomeOfAttempt) {
      return true;
    }

    // Attempt 2: If the first attempt failed or wasn't possible, try adding the current element
    // to the second subsequence (Subsequence B).
    // This is only possible if the current element is strictly greater than the last element added to B.
    if (elementToConsider > lastElementInSubsequenceB) {
      // Recursively call with the updated 'lastElementInSubsequenceB'.
      outcomeOfAttempt = canPartitionIntoIncreasingSubsequences(
        remainingElementsForNextStep,
        lastElementInSubsequenceA, // Subsequence A's last element remains unchanged
        elementToConsider // Update the last element for subsequence B
      );
    }

    // Return the final outcome: true if either attempt succeeded, false otherwise.
    return outcomeOfAttempt;
  };

  // --- Input Data Validation and Processing ---

  // Check if the global raw input data buffer is empty or improperly structured.
  if (!globalRawInputData || !Array.isArray(globalRawInputData) || globalRawInputData.length === 0) {
    console.error("Error: Input data buffer is empty or not an array of lines. Cannot proceed.");
    return;
  }

  // The first line of input specifies the total number of test cases.
  const numCasesString = globalRawInputData[0];
  const totalCasesCount = parseInt(numCasesString, 10);

  // Validate the parsed number of test cases.
  if (isNaN(totalCasesCount) || totalCasesCount < 0) {
    console.error(`Error: The specified number of test cases '${numCasesString}' is invalid.`);
    return;
  }
  if (totalCasesCount === 0) {
      console.log("No test cases specified. Exiting.");
      return;
  }

  // The actual sequence data starts from the second line.
  const sequenceDataLines = globalRawInputData.slice(1);

  // Provide a warning if the number of actual data lines doesn't match the expected count.
  if (sequenceDataLines.length < totalCasesCount) {
      console.warn(`Warning: Expected ${totalCasesCount} test cases but only ${sequenceDataLines.length} data lines were found.`);
      // The processing will continue for the available lines.
  }

  /**
   * Helper function to parse a single string line into an array of floating-point numbers.
   * It handles potential empty strings or non-numeric values gracefully.
   * @param {string} lineStr - The input string line containing space-separated numbers.
   * @returns {number[]} An array of parsed numbers, or an empty array if parsing fails or line is invalid.
   */
  const parseLineToNumbers = (lineStr) => {
      if (typeof lineStr !== 'string' || lineStr.trim() === '') {
          // console.warn(`Skipping invalid or empty input line: '${lineStr}'`);
          return [];
      }
      const numbersAsStrings = lineStr.split(' ').filter(s => s.trim() !== '');
      const parsedNumericArray = numbersAsStrings.map(numStr => parseFloat(numStr));

      // Check for any NaN values resulting from parsing failures.
      if (parsedNumericArray.some(num => isNaN(num))) {
          console.warn(`Warning: Some values in line '${lineStr}' could not be parsed as valid numbers. This line will be treated as empty.`);
          return [];
      }
      return parsedNumericArray;
  };

  // Iterate through each test case and apply the partitioning logic.
  for (let caseIterator = 0; caseIterator < totalCasesCount; caseIterator++) {
    const currentInputLine = sequenceDataLines[caseIterator];
    const numericSequenceForCase = parseLineToNumbers(currentInputLine);

    // Define the initial "last element" values for the two subsequences.
    // Starting with 0 allows any positive number to be the first element.
    const initialLastValueA = 0;
    const initialLastValueB = 0;

    // Execute the recursive partitioning check for the current sequence.
    const isPartitionPossible = canPartitionIntoIncreasingSubsequences(
      numericSequenceForCase,
      initialLastValueA,
      initialLastValueB
    );

    // Output the result as 'YES' or 'NO' based on the partitioning outcome.
    console.log(isPartitionPossible ? 'YES' : 'NO');
  }
}

// --- Global Input Handling Mechanism ---

// A global buffer to accumulate all incoming standard input data.
let globalRawInputData = '';

// Ensure the Node.js process doesn't exit prematurely and is ready to receive input.
process.stdin.resume();
// Set the character encoding for incoming data to UTF-8.
process.stdin.setEncoding('utf8');

// Event listener: Appends each received data chunk to the global buffer.
process.stdin.on('data', (dataChunk) => {
  globalRawInputData += dataChunk;
});

// Event listener: Triggered when the end of the standard input stream is reached.
process.stdin.on('end', () => {
  // Split the accumulated input into individual lines, filtering out any empty lines.
  globalRawInputData = globalRawInputData.split('\n').filter(line => line.trim() !== '');

  // Once all input lines are ready, initiate the main analysis function.
  initiateSequenceAnalysis();
});