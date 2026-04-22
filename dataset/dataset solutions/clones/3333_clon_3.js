'use strict';
// This self-executing anonymous function processes input data
// to compute an optimal score using a dynamic programming strategy.
// It reads raw data from standard input, parses it, and then applies
// a specific recurrence relation to fill a memoization table.
(function(rawInputStreamContent) {
  // Enforce strict parsing and execution rules for the entire script.

  // --- Input Acquisition, Parsing, and Initial Validation ---

  // Basic check to ensure that some input content was actually provided.
  if (!rawInputStreamContent || typeof rawInputStreamContent !== 'string' || rawInputStreamContent.length === 0) {
    console.error("Execution Aborted: No valid input stream content was supplied. Please provide data via stdin.");
    return; // Terminate execution if input is empty or invalid.
  }

  // Step 1: Normalize whitespace and break the input string into an array of string tokens.
  const dataTokens = rawInputStreamContent.trim().split(/\s+/);

  // Initialize an array to store the parsed numeric values.
  const numericalInputSequence = [];

  // Step 2: Iterate through each token, attempting to convert it into an integer.
  // Robustly handle potential non-numeric tokens.
  for (let tokenIndex = 0; tokenIndex < dataTokens.length; tokenIndex++) {
    const currentToken = dataTokens[tokenIndex];
    const numericValue = parseInt(currentToken, 10); // Use radix 10 for explicit decimal parsing.

    // Validate if the parsed result is indeed a number.
    if (isNaN(numericValue)) {
      // Log a warning for non-numeric data but attempt to continue processing.
      console.warn(`Data Parsing Warning: Token "${currentToken}" at index ${tokenIndex} is not a valid number and will be skipped.`);
      continue; // Skip this token and proceed to the next.
    }
    numericalInputSequence.push(numericValue);
  }

  // Crucial validation: Ensure that we have successfully parsed at least some numbers.
  if (numericalInputSequence.length === 0) {
    console.error("Execution Aborted: No valid numerical data could be extracted from the input stream.");
    return;
  }

  // The very first number in the processed sequence denotes the intended number of elements
  // for the main array, let's call it the 'problem dimension'.
  const problemDimension = numericalInputSequence.shift();

  // Further validation on the 'problemDimension'. It must be a positive integer
  // and cannot exceed the actual number of elements available in the sequence.
  if (problemDimension <= 0 || problemDimension > numericalInputSequence.length) {
    console.error(`Execution Aborted: Invalid problem dimension (${problemDimension}). 
                   It must be a positive integer and not greater than the remaining data count (${numericalInputSequence.length}).`);
    return;
  }

  // The remaining elements in 'numericalInputSequence' form the primary data set
  // upon which the dynamic programming will operate.
  const sourceValueArray = numericalInputSequence;

  // --- Dynamic Programming Table Initialization ---

  // Construct a 2D array, often called a memoization table or DP table.
  // This table, `optimalScoreGrid`, will store intermediate results:
  // `optimalScoreGrid[length][startIndex]` will contain the maximum score
  // for a sub-segment of `length` elements starting at `startIndex`.
  // The table is designed to be triangular, optimizing space by only creating
  // necessary columns for each row (length).
  const optimalScoreGrid = Array.from({ length: problemDimension + 1 }, (_, currentLength) => {
    // For a given segment length (`currentLength`), the number of possible starting
    // indices is `problemDimension - currentLength + 1`.
    // All cells are initially set to 0, representing base cases or uncalculated states.
    return Array.from({ length: problemDimension - currentLength + 1 }, () => 0);
  });

  // --- Core Dynamic Programming Algorithm ---

  // The outer loop iterates through possible lengths of sub-segments,
  // starting from the smallest (1 element) up to the full problemDimension.
  for (let currentSegmentLength = 1; currentSegmentLength <= problemDimension; currentSegmentLength++) {
    // The inner loop iterates through all valid starting positions for a sub-segment
    // of the `currentSegmentLength`.
    for (let segmentStartingIndex = 0; segmentStartingIndex <= problemDimension - currentSegmentLength; segmentStartingIndex++) {

      // Identify the index of the last element within the current sub-segment.
      const segmentEndingIndex = segmentStartingIndex + currentSegmentLength - 1;

      // Fetch the value of the first element in the current sub-segment.
      const valueOfFirstElement = sourceValueArray[segmentStartingIndex];

      // Fetch the value of the last element in the current sub-segment.
      const valueOfLastElement = sourceValueArray[segmentEndingIndex];

      // --- Apply the Specific Recurrence Relation ---
      // This is the core logic, replicating the original code's specific DP recurrence.
      // It calculates the current player's optimal score for the segment.
      //
      // The recurrence is: `dp[len][start] = max(A[end] - dp[len-1][start], A[start] - dp[len-1][start])`.
      // This implies that regardless of whether the first or last element is chosen,
      // the opponent's subsequent turn is always evaluated on the sub-segment
      // of length `len-1` starting at `start`. This is a direct translation of the
      // original algorithm's behavior, even if it deviates from standard game theory DP.

      // Scenario A: The current player chooses the element at the end of the segment.
      // The score obtained is the value of this element minus the opponent's optimal
      // score from the *remaining sub-segment beginning at `segmentStartingIndex`*
      // with a length reduced by one.
      const scoreIfEndElementTaken = valueOfLastElement - optimalScoreGrid[currentSegmentLength - 1][segmentStartingIndex];

      // Scenario B: The current player chooses the element at the beginning of the segment.
      // The score obtained is the value of this element minus the opponent's optimal
      // score from the *remaining sub-segment beginning at `segmentStartingIndex`*
      // with a length reduced by one.
      const scoreIfStartElementTaken = valueOfFirstElement - optimalScoreGrid[currentSegmentLength - 1][segmentStartingIndex];

      // The optimal score for the current segment (current player's turn) is the maximum
      // of the scores from these two scenarios.
      optimalScoreGrid[currentSegmentLength][segmentStartingIndex] = Math.max(scoreIfEndElementTaken, scoreIfStartElementTaken);
    }
  }

  // --- Result Extraction and Final Output ---

  // The ultimate answer resides in the cell corresponding to the entire sequence:
  // `problemDimension` (full length) and `0` (starting from the very first element).
  const computedFinalOptimalScore = optimalScoreGrid[problemDimension][0];

  // Present the calculated optimal score to the console, clearly labeled.
  console.log(`The final calculated optimal score for the complete sequence is: ${computedFinalOptimalScore}`);

})(require('fs').readFileSync('/dev/stdin', 'utf8')); // Read the entire content of standard input as a UTF-8 string.