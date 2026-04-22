// This JavaScript module implements a solution to a problem that typically involves finding a specific K-th smallest value
// among medians of all possible subarrays within a given input array.
// It utilizes a Fenwick Tree (Binary Indexed Tree) for efficient prefix sum queries
// and point updates, combined with a binary search approach on the answer space.

// --- Input Handling Utility ---
// The `InputParser` class is designed to read and parse input data,
// particularly from standard input streams where data is line-oriented.
// It maintains an internal buffer of lines and a pointer to the current line being processed.
function InputParser(rawInputData) {
  // Defensive check: Ensure input data is a valid string.
  if (typeof rawInputData !== 'string' || rawInputData.trim() === '') {
    // In a production scenario, one might throw an error or log a warning.
    // console.error("InputParser: Provided raw data is empty or not a string.");
    this.lineBuffer = []; // Initialize with an empty buffer to prevent errors.
  } else {
    // Split the raw input string into individual lines.
    // The `filter` method is used to discard any empty lines, which can occur
    // if the input string has trailing newlines.
    this.lineBuffer = rawInputData.split('\n').filter(line => line.length > 0);
  }
  // `currentLineIndex` keeps track of which line is next to be read.
  this.currentLineIndex = 0;
}

// Define the methods for the `InputParser` on its prototype for efficiency.
InputParser.prototype = {
  /**
   * Extracts a single element (word) from the current line.
   * This method processes words from right-to-left within a line,
   * simulating a stack-like behavior for words on the current line.
   *
   * @param {boolean} returnAsString - If true, returns the element as a string; otherwise, attempts to convert to a number.
   * @returns {string|number|undefined} The extracted element, or undefined if no more input is available.
   */
  extractNextElement: function(returnAsString) {
    // Reference to the internal line buffer and current index for brevity.
    const sourceLines = this.lineBuffer;
    let currentLinePointer = this.currentLineIndex;

    // Guard clause: Check if we've read past the end of the available input lines.
    if (currentLinePointer >= sourceLines.length) {
      // console.warn("InputParser: Attempted to read element beyond input buffer end.");
      return undefined; // Indicate no more elements.
    }

    // The original implementation modifies the line in `lineBuffer` directly.
    // If the current line is still a raw string, split it into words and reverse
    // so that `pop()` retrieves elements in their original order.
    if (typeof sourceLines[currentLinePointer] === "string") {
      sourceLines[currentLinePointer] = sourceLines[currentLinePointer].split(" ").reverse();
    }
    // Now `sourceLines[currentLinePointer]` is guaranteed to be an array of words (reversed).

    // Retrieve the last word from the (reversed) current line array.
    const extractedWord = sourceLines[currentLinePointer].pop();

    // If the current line has no more words, advance the line pointer to the next line.
    if (sourceLines[currentLinePointer].length === 0) {
      this.currentLineIndex++;
    }

    // Return the word, either as its raw string form or parsed as a floating-point number.
    return returnAsString ? extractedWord : parseFloat(extractedWord);
  },

  /**
   * Reads an entire line from the input and returns its elements as an array.
   * The line pointer is automatically advanced to the next line.
   *
   * @param {boolean} returnStrings - If true, elements are strings; otherwise, they are numbers.
   * @returns {Array<string|number>} An array of elements from the line. Returns an empty array if no more lines.
   */
  readEntireLine: function(returnStrings) {
    // Guard clause: Check for end of input.
    if (this.currentLineIndex >= this.lineBuffer.length) {
      // console.warn("InputParser: Attempted to read line beyond input buffer end.");
      return []; // Return an empty array indicating no data.
    }

    // Get the current line, then immediately increment the line pointer for the next read.
    const currentLineContent = this.lineBuffer[this.currentLineIndex++];
    // Split the line into individual elements (words) based on spaces.
    const lineElements = currentLineContent.split(" ");

    // If numerical conversion is not requested, return the array of strings.
    // Otherwise, map each string element to its floating-point number equivalent.
    return returnStrings ? lineElements : lineElements.map(val => parseFloat(val));
  },

  /**
   * Reads a specified number of consecutive lines and returns them as a 2D array.
   * Each inner array represents a line's elements.
   *
   * @param {number} numberOfLines - The count of lines to read.
   * @param {boolean} returnRawStrings - If true, elements are strings; otherwise, they are numbers.
   * @returns {Array<Array<string|number>>} A 2D array containing the parsed lines.
   */
  readConsecutiveLines: function(numberOfLines, returnRawStrings) {
    // Input validation: Ensure a positive number of lines is requested.
    if (numberOfLines <= 0) {
      // console.warn("InputParser: Requested to read zero or negative lines.");
      return []; // Return an empty 2D array.
    }

    const collectedLinesData = [];
    const initialLinePointer = this.currentLineIndex;
    // Determine the actual end line, ensuring we don't read beyond the buffer's capacity.
    const effectiveEndLine = Math.min(initialLinePointer + numberOfLines, this.lineBuffer.length);

    // Loop through the specified range of lines.
    for (let currentLine = initialLinePointer; currentLine < effectiveEndLine; currentLine++) {
      const lineWords = this.lineBuffer[currentLine].split(" ");
      if (returnRawStrings) {
        collectedLinesData.push(lineWords);
      } else {
        // Convert all elements in the current line to numbers.
        collectedLinesData.push(lineWords.map(val => parseFloat(val)));
      }
    }

    // Update the global line pointer to reflect the lines that have just been read.
    this.currentLineIndex = effectiveEndLine;
    return collectedLinesData;
  },
};

// --- Fenwick Tree (Binary Indexed Tree) Implementation ---
// A `FenwickTree` is a data structure that provides efficient ways to:
// 1. Update an element at a specific index.
// 2. Query the prefix sum of elements up to a specific index.
// It is typically 1-indexed.
function FenwickTree(capacity) {
  // Input validation: Capacity must be a positive integer.
  if (capacity <= 0 || !Number.isInteger(capacity)) {
    throw new Error("FenwickTree: Capacity must be a positive integer.");
  }
  // Initialize the internal `treeData` array.
  // We use `capacity + 1` to accommodate 1-based indexing, with index 0 unused.
  this.treeData = new Array(capacity + 1).fill(0);
}

FenwickTree.prototype = {
  /**
   * Adds a `delta` value to the element at `index` in the conceptual array
   * represented by the Fenwick tree. This update propagates through the tree.
   *
   * @param {number} index - The 1-based index to update.
   * @param {number} delta - The value to add.
   */
  updateValue: function(index, delta) {
    // Guard clause: Ensure the index is within the valid 1-based range.
    if (index <= 0 || index >= this.treeData.length) {
      // console.warn(`FenwickTree: Update index ${index} out of valid bounds [1, ${this.treeData.length - 1}].`);
      return;
    }
    // Traverse up the tree, updating all relevant parent nodes.
    // `index & -index` isolates the lowest set bit, which determines the next parent.
    for (; index < this.treeData.length; index += index & -index) {
      this.treeData[index] += delta;
    }
  },

  /**
   * Queries the sum of all elements from the first index up to `index` (inclusive).
   *
   * @param {number} index - The 1-based index up to which to sum.
   * @returns {number} The prefix sum.
   */
  queryPrefixSum: function(index) {
    let accumulatedSum = 0;
    // Guard clause: Handle invalid or out-of-bounds indices.
    if (index <= 0) {
      return 0; // Sum up to or before the first element is 0.
    }
    // If index exceeds capacity, cap it at the maximum valid index.
    if (index >= this.treeData.length) {
      index = this.treeData.length - 1;
    }

    // Traverse down the tree, summing relevant nodes.
    // `index & -index` isolates the lowest set bit, used to jump to the next segment.
    for (; index > 0; index -= index & -index) {
      accumulatedSum += this.treeData[index];
    }
    return accumulatedSum;
  },
};

// --- Global Input Reader Instance ---
// Instantiate the `InputParser` to read from standard input.
// `require("fs").readFileSync("/dev/stdin", "utf8")` is a Node.js specific way
// to read the entire content of standard input synchronously as a UTF-8 string.
const standardInputReader = new InputParser(require("fs").readFileSync("/dev/stdin", "utf8"));

// --- Main Problem Solving Function ---
// This function encapsulates the core logic to solve the problem,
// which is typically finding the K-th smallest median among all possible subarrays.
function solveMedianProblem() {
  // First, read the size of the input array.
  const arraySize = standardInputReader.extractNextElement();
  // Then, read the array elements themselves as numbers.
  const numericalArray = standardInputReader.readEntireLine();

  // Edge case handling for very small array sizes.
  // The problem's specific definition for n <= 2 often simplifies.
  // The original code returns the maximum element for n=1 or n=2.
  if (arraySize <= 2) {
    return Math.max(...numericalArray);
  }

  // Calculate the total number of distinct subarrays possible for an array of `arraySize`.
  // This is given by the formula N * (N + 1) / 2.
  const totalPossibleSubarrays = arraySize * (arraySize + 1) / 2;

  // Determine the rank of the median we are searching for.
  // For the actual median, we look for the (TotalSubarrays / 2 + 1)-th smallest median.
  // The original code uses `Math.floor(n * (n+1) / 4 + 1)`, which is `floor(TotalSubarrays / 2 + 1)`.
  const targetMedianRank = Math.floor(totalPossibleSubarrays / 2) + 1;

  // Binary search is used to find the target median value.
  // `lowBound` and `highBound` define the search space for the median value itself.
  // Assuming array elements are positive integers up to 10^9.
  let lowBound = 1; // Smallest possible median value.
  let highBound = 1e9 + 2; // Upper bound for the values in the array + 1 to ensure range.

  // The binary search continues until `lowBound` and `highBound` converge.
  while (lowBound < highBound) {
    // Calculate the midpoint of the current search range.
    // `Math.floor` ensures an integer result.
    const midCandidateValue = Math.floor((lowBound + highBound) / 2);

    // Initialize variables for the Fenwick Tree-based counting process.
    // `currentBalanceOffset` tracks the running sum of (+1 if element >= mid, -1 if element < mid).
    // An offset (`arraySize + 1`) is added to map these sums (which can be negative) to
    // 1-based positive indices suitable for the Fenwick Tree.
    let currentBalanceOffset = arraySize + 1;
    // `countPairsGE_Mid` will accumulate the number of subarrays whose median is >= `midCandidateValue`.
    let countPairsGE_Mid = 0;

    // The Fenwick tree is used to count occurrences of `currentBalanceOffset` values.
    // Its capacity needs to cover the full range of `currentBalanceOffset`:
    // Min: `(1 - arraySize) + arraySize + 1 = 2` (all elements < mid)
    // Max: `(arraySize) + arraySize + 1 = 2*arraySize + 1` (all elements >= mid)
    // So, `2 * arraySize + 2` is a safe upper bound for Fenwick tree size.
    const balanceFenwickTree = new FenwickTree(2 * arraySize + 2);

    // Before processing any array elements, the balance is at its initial offset.
    // We record this initial state in the Fenwick tree.
    balanceFenwickTree.updateValue(currentBalanceOffset, 1);

    // Iterate through the input array to calculate the count of relevant subarrays.
    for (let elementIdx = 0; elementIdx < arraySize; elementIdx++) {
      // Adjust `currentBalanceOffset` based on the comparison with `midCandidateValue`.
      if (numericalArray[elementIdx] < midCandidateValue) {
        currentBalanceOffset--; // Decrement if current element is smaller.
      } else {
        currentBalanceOffset++; // Increment if current element is greater or equal.
      }

      // Query the Fenwick tree: `queryPrefixSum(currentBalanceOffset)` returns the number of times
      // any previous `currentBalanceOffset` (from indices 0 to `elementIdx-1`) was
      // less than or equal to the current `currentBalanceOffset`.
      // This effectively counts subarrays ending at `elementIdx` whose balance sum is non-negative,
      // which corresponds to their median being >= `midCandidateValue`.
      countPairsGE_Mid += balanceFenwickTree.queryPrefixSum(currentBalanceOffset);

      // After processing the current element, update the Fenwick tree with the new `currentBalanceOffset`.
      balanceFenwickTree.updateValue(currentBalanceOffset, 1);
    }

    // `countPairsGE_Mid` now holds the count of subarrays whose median is >= `midCandidateValue`.
    // To match the original problem's binary search condition, we often need the count
    // of subarrays whose median is strictly less than `midCandidateValue`.
    const countPairsLT_Mid = totalPossibleSubarrays - countPairsGE_Mid;

    // Adjust the binary search range based on `countPairsLT_Mid` relative to `targetMedianRank`.
    if (countPairsLT_Mid < targetMedianRank) {
      // If the count of subarrays with median < `midCandidateValue` is less than `targetMedianRank`,
      // it means `midCandidateValue` is too low (or possibly the answer).
      // We need a larger value, so we shift `lowBound` up.
      lowBound = midCandidateValue + 1;
    } else {
      // If `countPairsLT_Mid` is greater than or equal to `targetMedianRank`,
      // it means `midCandidateValue` could be the answer or is too high.
      // We try a smaller or equal value by shifting `highBound` down.
      highBound = midCandidateValue;
    }
  }

  // The binary search converges to `lowBound` which represents the smallest value `X`
  // such that the number of subarrays with median strictly less than `X`
  // is greater than or equal to `targetMedianRank`.
  // Therefore, the actual K-th smallest median value is `lowBound - 1`.
  return lowBound - 1;
}

// Execute the main problem-solving function and print its result to standard output.
console.log(solveMedianProblem());