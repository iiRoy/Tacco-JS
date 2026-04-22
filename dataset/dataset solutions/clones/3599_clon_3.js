/**
 * Custom Input Stream Processor
 * This utility class is designed to read and parse input data from a string,
 * typically from standard input. It provides methods to extract tokens
 * line by line, converting them to numbers or keeping them as strings.
 */
function StreamParser(rawInputContent) {
  // Defensive check: Ensure input is a valid string.
  if (typeof rawInputContent !== 'string' || rawInputContent.trim().length === 0) {
    console.error("Error: Input content provided to StreamParser is empty or invalid.");
    this.sourceLines = []; // Initialize to an empty array to prevent runtime errors.
    this.currentLinePointer = 0;
    return;
  }

  // Split the entire input content into individual lines.
  // Each line will be processed on demand.
  this.sourceLines = rawInputContent.split('\n');
  // Initialize an internal pointer to track the current line being processed.
  this.currentLinePointer = 0;
}

/**
 * Prototype methods for StreamParser.
 */
StreamParser.prototype = {
  /**
   * Reads and extracts the last token from the current active line.
   * By default, it attempts to convert the token to a number.
   * If the line becomes empty after token extraction, the internal line pointer advances.
   * @param {boolean} [returnAsText=false] - If true, the token is returned as a string.
   * @returns {number|string|undefined} The extracted token, or undefined if no more input.
   */
  obtainNumericToken: function(returnAsText = false) {
    // Check if there are any lines left to process.
    if (this.currentLinePointer >= this.sourceLines.length) {
      return undefined; // Indicate end of input.
    }

    let currentInputLine = this.sourceLines[this.currentLinePointer];
    // If the line is still a string, it means it hasn't been tokenized yet.
    if (typeof currentInputLine === 'string') {
      // Tokenize the line by spaces and store it back in the array.
      this.sourceLines[this.currentLinePointer] = currentInputLine.split(' ');
      currentInputLine = this.sourceLines[this.currentLinePointer];
    }

    // Use `pop()` to efficiently get and remove the last token.
    const fetchedToken = currentInputLine.pop();

    // If the line array is now empty, move to the next line for subsequent calls.
    if (currentInputLine.length === 0) {
      this.currentLinePointer++;
    }

    // Return the token, applying numeric conversion if `returnAsText` is false.
    return returnAsText ? fetchedToken : Number(fetchedToken);
  },

  /**
   * Fetches all tokens from the current line, then advances the line pointer.
   * Tokens are converted to numbers unless `outputStrings` is true.
   * @param {boolean} [outputStrings=false] - If true, tokens are returned as strings.
   * @returns {Array<number|string>} An array containing the tokens from the line.
   */
  fetchLineTokens: function(outputStrings = false) {
    // Guard against reading past the end of the input.
    if (this.currentLinePointer >= this.sourceLines.length) {
      return []; // Return an empty array if no more lines.
    }

    // Get and split the current line, then immediately increment the line pointer.
    const lineData = this.sourceLines[this.currentLinePointer++].split(' ');

    // Conditionally convert tokens to numbers or return as strings.
    return outputStrings ? lineData : lineData.map(val => Number(val));
  },

  /**
   * Reads a specified number of consecutive lines, processing their tokens.
   * Each line becomes an array of tokens within a larger array.
   * @param {number} numLinesToRead - The count of lines to retrieve.
   * @param {boolean} [returnStringsOnly=false] - If true, tokens are kept as strings.
   * @returns {Array<Array<number|string>>} A 2D array of processed line tokens.
   */
  acquireMultipleLines: function(numLinesToRead, returnStringsOnly = false) {
    // Validate input: number of lines must be positive.
    if (numLinesToRead <= 0) {
      return [];
    }
    // Adjust `numLinesToRead` if it exceeds available lines.
    const availableLines = this.sourceLines.length - this.currentLinePointer;
    if (numLinesToRead > availableLines) {
      console.warn(`Warning: Requested ${numLinesToRead} lines, but only ${availableLines} are available.`);
      numLinesToRead = availableLines;
    }

    const compiledLines = [];
    let linesCounter = 0; // Use a separate counter for the loop.

    // Loop to process each requested line.
    while (linesCounter < numLinesToRead) {
      const singleLineContent = this.sourceLines[this.currentLinePointer + linesCounter].split(' ');
      if (returnStringsOnly) {
        compiledLines.push(singleLineContent);
      } else {
        // Convert all elements in the current line to numbers.
        const numericConvertedLine = singleLineContent.map(token => Number(token));
        compiledLines.push(numericConvertedLine);
      }
      linesCounter++;
    }

    // Update the main line pointer after processing the block of lines.
    this.currentLinePointer += numLinesToRead;
    return compiledLines;
  },
};

/**
 * Calculates the total number of inversions in a numerical array.
 * An inversion exists for a pair (i, j) if i < j but array[i] > array[j].
 * This implementation uses a bottom-up merge sort strategy to count inversions
 * efficiently, with a time complexity of O(N log N).
 * The input array is effectively sorted during the process, but `currentArrayState`
 * is a local copy, preserving the original `inputData`'s reference in the caller.
 * @param {Array<number>} inputData - The array of numbers to analyze.
 * @returns {number} The total count of inversions.
 */
function calculateInversions(inputData) {
  // Input validation: ensure it's a non-empty array.
  if (!Array.isArray(inputData) || inputData.length === 0) {
    return 0;
  }

  const dataSize = inputData.length;
  let totalInversions = 0;
  // Create a mutable copy of the input array for sorting operations.
  let currentArrayState = [...inputData];

  // The core loop iterates with increasing block sizes (1, 2, 4, 8...).
  // Each iteration performs a merge pass over the entire array.
  for (let segmentSize = 1; segmentSize < dataSize; segmentSize *= 2) {
    // `nextIterationArray` will hold the sorted segments from the current pass.
    const nextIterationArray = new Array(dataSize);
    let mergeBlockStart = 0; // Index to start merging a pair of segments.

    // Iterate through the array, merging adjacent segments of `segmentSize`.
    while (mergeBlockStart < dataSize) {
      // Define the boundaries for the left and right segments.
      let leftSegmentBegin = mergeBlockStart;
      let leftSegmentEnd = Math.min(dataSize, leftSegmentBegin + segmentSize);
      let rightSegmentBegin = leftSegmentEnd; // Right segment starts immediately after left.
      let rightSegmentEnd = Math.min(dataSize, rightSegmentBegin + segmentSize);

      let leftPtr = leftSegmentBegin;  // Pointer for the left segment.
      let rightPtr = rightSegmentBegin; // Pointer for the right segment.
      let resultPos = mergeBlockStart; // Position in `nextIterationArray` for merged elements.

      // Merge the two segments into `nextIterationArray`.
      while (leftPtr < leftSegmentEnd || rightPtr < rightSegmentEnd) {
        if (leftPtr === leftSegmentEnd) {
          // Left segment is exhausted; take remaining elements from the right.
          nextIterationArray[resultPos++] = currentArrayState[rightPtr++];
        } else if (rightPtr === rightSegmentEnd) {
          // Right segment is exhausted; take remaining elements from the left.
          nextIterationArray[resultPos++] = currentArrayState[leftPtr++];
        } else if (currentArrayState[leftPtr] > currentArrayState[rightPtr]) {
          // An inversion is detected: an element from the left segment is greater
          // than an element from the right segment.
          // All remaining elements in the left segment (from `leftPtr` to `leftSegmentEnd-1`)
          // will also form inversions with `currentArrayState[rightPtr]`.
          totalInversions += (leftSegmentEnd - leftPtr);
          nextIterationArray[resultPos++] = currentArrayState[rightPtr++];
        } else {
          // No inversion: element from left is less than or equal to element from right.
          nextIterationArray[resultPos++] = currentArrayState[leftPtr++];
        }
      }
      // Move to the start of the next pair of segments in the current pass.
      mergeBlockStart += (2 * segmentSize);
    }
    // Update the array state for the next merge pass.
    currentArrayState = nextIterationArray;
  }
  return totalInversions;
}


// --- Main Program Entry Point ---

// Read the entire standard input content synchronously.
const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
// Initialize the input stream parser with the read content.
const dataInputReader = new StreamParser(fileContent);

/**
 * Implements the primary logic to find a specific "median-like" value
 * in a given array, leveraging binary search and inversion counting.
 * @returns {number} The computed result.
 */
function findTargetMedianEquivalent() {
  // Retrieve the total count of elements from the input.
  const totalItemsCount = dataInputReader.obtainNumericToken();
  // Retrieve the array of numbers for processing.
  const numericInputArray = dataInputReader.fetchLineTokens();

  // Handle edge cases for small input sizes.
  if (totalItemsCount <= 2) {
    if (totalItemsCount === 0) {
      return 0; // No elements, no meaningful result.
    }
    // For 1 or 2 elements, the "median-like" value is simply the maximum.
    // Rewrite: Explicit loop for clarity instead of Math.max(...).
    let maximumValue = -Infinity;
    for (let i = 0; i < totalItemsCount; i++) {
      if (numericInputArray[i] > maximumValue) {
        maximumValue = numericInputArray[i];
      }
    }
    return maximumValue;
  }

  // Calculate the target inversion count. This formula is specific
  // to the problem being solved (often related to finding K-th smallest/median).
  // Math.trunc is used for integer division (floor).
  const requiredInversionThreshold = Math.trunc((totalItemsCount * (totalItemsCount + 1)) / 4) + 1;

  // Initialize bounds for binary search.
  // Values are typically constrained, e.g., 1 to 10^9.
  let searchLowerBound = 1;
  let searchUpperBound = 1_000_000_000 + 1; // Exclusive upper bound.

  // Binary search loop to find the desired value.
  while (searchLowerBound < searchUpperBound) {
    // Calculate the midpoint of the current search range.
    const currentMidpointCandidate = Math.floor((searchLowerBound + searchUpperBound) / 2);

    // Helper function: Transforms the original array into a prefix sum array
    // based on comparison with the current midpoint candidate.
    const generatePrefixSumArray = (originalNumbers, comparisonValue) => {
      const prefixSums = new Array(originalNumbers.length + 1);
      prefixSums[0] = 0; // Initialize the first element of the prefix sum array to 0.

      // Populate the prefix sum array.
      for (let index = 0; index < originalNumbers.length; index++) {
        // If an original number is less than the comparison value, subtract 1 from the sum;
        // otherwise, add 1. This creates a sequence where the inversion count
        // can reveal properties related to the median.
        prefixSums[index + 1] = prefixSums[index] + (originalNumbers[index] < comparisonValue ? -1 : 1);
      }
      return prefixSums;
    };

    // Generate the transformed array using the helper function.
    const transformedDataSequence = generatePrefixSumArray(numericInputArray, currentMidpointCandidate);

    // Count inversions in the transformed sequence.
    // The comparison `countInversions(...) < requiredInversionThreshold` dictates
    // whether the current `currentMidpointCandidate` is too small or potentially correct/too large.
    if (calculateInversions(transformedDataSequence) < requiredInversionThreshold) {
      searchLowerBound = currentMidpointCandidate + 1; // Move to the upper half.
    } else {
      searchUpperBound = currentMidpointCandidate; // Consider this midpoint or a smaller one.
    }
  }

  // After the binary search converges, `searchLowerBound` will hold the smallest
  // value for which the inversion condition is met. The problem usually requires
  // `searchLowerBound - 1` as the final answer.
  return searchLowerBound - 1;
}

// Execute the main function and output its result.
console.log(findTargetMedianEquivalent());