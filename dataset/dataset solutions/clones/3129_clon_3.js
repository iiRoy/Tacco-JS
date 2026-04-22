const DataStreamProcessor = (function() {
  // A factory function to create a new parser instance.
  // This acts as the entry point for obtaining an input stream handler.
  function createInputParser(sourceText) {
    // Basic validation to ensure the input is a valid string.
    if (typeof sourceText !== 'string' || sourceText.length === 0) {
      throw new Error("Input source must be a non-empty string for parsing.");
    }
    return new StreamHandler(sourceText);
  }

  // The core class responsible for managing and parsing the input stream.
  // It handles splitting the raw text into lines and tokens, and tracking the current position.
  class StreamHandler {
    #sourceLines;     // Private field to store all input lines as an array.
    #linePointer;     // Private field to keep track of the current line being processed.

    /**
     * Constructs a new StreamHandler instance.
     * @param {string} rawInputContent The complete input string received from the source (e.g., stdin).
     */
    constructor(rawInputContent) {
      // Standardize line endings and remove any leading/trailing whitespace from the whole input.
      const cleanedInput = rawInputContent.replace(/\r\n/g, '\n').trim();
      this.#sourceLines = cleanedInput.split('\n'); // Split the cleaned input into individual lines.
      this.#linePointer = 0; // Initialize the line pointer to the very first line.
    }

    /**
     * Retrieves the next individual token from the input stream.
     * Tokens are extracted one by one from the current line; if the line is exhausted,
     * it proceeds to the next line.
     * @param {boolean} [returnAsString=false] If true, the token is returned as a string;
     *                                         otherwise, an attempt is made to convert it to a number.
     * @returns {string|number} The parsed token.
     * @throws {Error} If there are no more tokens left in the input stream.
     */
    retrieveNextElement(returnAsString = false) {
      let currentLineTokenBuffer = this.#sourceLines[this.#linePointer];

      // Check if we have read past the end of the available input lines.
      if (currentLineTokenBuffer === undefined) {
        throw new Error("Input stream exhausted: No more elements to read.");
      }

      // If the current line is still a raw string, it means it hasn't been split into tokens yet.
      // Process it into an array of tokens and store it back in the sourceLines array.
      if (typeof currentLineTokenBuffer === 'string') {
        // Split by one or more whitespace characters, filter out any empty strings
        // that might result from multiple spaces, and reverse the array.
        // Reversing allows efficient extraction using `pop()`.
        this.#sourceLines[this.#linePointer] = currentLineTokenBuffer.split(/\s+/).filter(Boolean).reverse();
        currentLineTokenBuffer = this.#sourceLines[this.#linePointer]; // Update the local reference.
      }

      const extractedToken = currentLineTokenBuffer.pop(); // Get the last token from the reversed array.

      // If the current line's token buffer is now empty, advance to the next line.
      if (!currentLineTokenBuffer.length) {
        this.#linePointer++;
      }

      // Return the token, either as a string or converted to a number.
      return returnAsString ? extractedToken : Number(extractedToken);
    }

    /**
     * Reads all tokens from the current line as an array and then advances to the next line.
     * @param {boolean} [returnAsString=false] If true, tokens are returned as strings;
     *                                         otherwise, they are converted to numbers.
     * @returns {Array<string|number>} An array containing all tokens from the current line.
     * @throws {Error} If there are no more lines to read.
     */
    getLineAsTokens(returnAsString = false) {
      const currentLineContent = this.#sourceLines[this.#linePointer];
      // Pre-check for end of input.
      if (currentLineContent === undefined) {
        throw new Error("Input stream exhausted: Cannot read a full line.");
      }

      this.#linePointer++; // Increment the line pointer immediately as this method consumes a whole line.
      // Ensure the content is treated as a string before splitting.
      const tokens = String(currentLineContent).split(/\s+/).filter(Boolean);

      return returnAsString ? tokens : tokens.map(str => Number(str));
    }

    /**
     * Reads a specified number of consecutive lines, parsing each into an array of tokens,
     * effectively creating a matrix (an array of arrays).
     * @param {number} numRows The total number of lines to read for the matrix.
     * @param {boolean} [returnAsString=false] If true, matrix elements are strings;
     *                                         otherwise, they are numbers.
     * @returns {Array<Array<string|number>>} The parsed matrix.
     * @throws {Error} If `numRows` is invalid or if there aren't enough lines remaining.
     */
    readDataMatrix(numRows, returnAsString = false) {
      // Validate the number of rows requested.
      if (numRows <= 0 || !Number.isInteger(numRows)) {
        throw new Error("Invalid parameter: Number of rows for matrix must be a positive integer.");
      }

      const endIndex = this.#linePointer + numRows;
      // Check if enough lines are available in the stream.
      if (endIndex > this.#sourceLines.length) {
        throw new Error(`Insufficient input: Not enough lines available to read a ${numRows}-row matrix.`);
      }

      // Extract the relevant lines using slice, without modifying the original array.
      const matrixRows = this.#sourceLines.slice(this.#linePointer, endIndex);
      this.#linePointer = endIndex; // Update the line pointer to reflect consumed lines.

      // Map each raw line to an array of parsed tokens.
      return matrixRows.map(line => {
        const lineTokens = String(line).split(/\s+/).filter(Boolean);
        return returnAsString ? lineTokens : lineTokens.map(val => Number(val));
      });
    }

    /**
     * Fetches a specified number of lines, treating each line as a single value.
     * @param {number} count The total number of lines to fetch.
     * @param {boolean} [returnAsString=false] If true, values are returned as strings;
     *                                         otherwise, they are converted to numbers.
     * @returns {Array<string|number>} An array of single values from each line.
     * @throws {Error} If `count` is invalid or if there aren't enough lines remaining.
     */
    fetchLinesAsList(count, returnAsString = false) {
      // Validate the count parameter.
      if (count <= 0 || !Number.isInteger(count)) {
        throw new Error("Invalid parameter: Count for fetching lines must be a positive integer.");
      }

      const endIndex = this.#linePointer + count;
      // Check for sufficient lines.
      if (endIndex > this.#sourceLines.length) {
        throw new Error(`Insufficient input: Not enough lines available to fetch ${count} lines.`);
      }

      const rawLines = this.#sourceLines.slice(this.#linePointer, endIndex);
      this.#linePointer = endIndex; // Update the line pointer.

      // Map each raw line (after trimming) to its desired format.
      return returnAsString ? rawLines : rawLines.map(line => Number(String(line).trim()));
    }
  }

  return createInputParser; // The factory function is exposed.
})();

// Instantiate the input data processing pipeline.
// This reads the entire content of standard input as a UTF-8 string.
const inputProcessor = DataStreamProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

// Execute the main problem-solving logic and print the final result to standard output.
console.log(executeBitManipulationSolver());

/**
 * The main function encapsulating the solution logic for the bit manipulation problem.
 * It orchestrates input reading, initial condition checks, and the recursive path-finding.
 * @returns {string} A string indicating "NO" if no solution, or "YES" followed by the path.
 */
function executeBitManipulationSolver() {
  const numberOfBits = inputProcessor.retrieveNextElement(); // Read the integer N.
  const initialValue = inputProcessor.retrieveNextElement(); // Read the integer A.
  const targetValue = inputProcessor.retrieveNextElement(); // Read the integer B.

  // --- Input Validation and Guard Clauses ---
  // Ensure N is within a reasonable range for bit manipulation problems (e.g., 1 to 30 for 32-bit integers).
  if (numberOfBits < 1 || numberOfBits > 31) {
    return "NO: Invalid number of bits (N must be between 1 and 31).";
  }
  // Ensure initial and target values are non-negative.
  if (initialValue < 0 || targetValue < 0) {
    return "NO: Negative input values (A or B) are not supported.";
  }
  // Additional check: values should fit within N bits.
  if (initialValue >= (1 << numberOfBits) || targetValue >= (1 << numberOfBits)) {
    return `NO: Input values (A or B) exceed the maximum for ${numberOfBits} bits.`;
  }

  let totalCombinedSetBits = 0; // Counter for the total number of set bits across A and B.

  // Iterate through each bit position from 0 up to (but not including) numberOfBits.
  for (let bitIndex = 0; bitIndex < numberOfBits; bitIndex++) {
    const currentBitMask = 1 << bitIndex; // Create a bitmask for the current bit position.

    // Check if the current bit is set in `initialValue`.
    if ((initialValue & currentBitMask) !== 0) {
      totalCombinedSetBits++;
    }
    // Check if the current bit is set in `targetValue`.
    if ((targetValue & currentBitMask) !== 0) {
      totalCombinedSetBits++;
    }
  }

  // The problem's core constraint: a solution exists only if the total count of set bits
  // (when considering A and B together, effectively A XOR B, but this check is simpler) is odd.
  // If it's even, no path can be formed by the allowed operations.
  if ((totalCombinedSetBits % 2) === 0) {
    return "NO"; // Early exit, problem is unsolvable under these conditions.
  }

  const solutionPathSegments = []; // This array will store the sequence of numbers that form the path.

  // Initiate the recursive path-finding process.
  // The '0' for `processedBitsMask` signifies that initially, no bits have been "used" to branch paths.
  findPathRecursively(initialValue, targetValue, 0, numberOfBits, solutionPathSegments);

  // If the recursive function completes without throwing an error (and `solutionPathSegments` is populated),
  // it means a valid path has been found.
  console.log("YES"); // Output "YES" as required by the problem statement.
  return solutionPathSegments.join(" "); // Join all numbers in the path with spaces.
}

/**
 * A recursive helper function designed to construct a path between `currentA` and `currentB`
 * by strategically flipping bits. This function implements a divide-and-conquer strategy.
 *
 * @param {number} currentA The current starting integer for this segment of the path.
 * @param {number} currentB The current target integer for this segment of the path.
 * @param {number} processedBitsMask A bitmask where set bits indicate positions that have
 *                                   already been used to differentiate recursive branches.
 *                                   These bits should not be considered for further branching in this subproblem.
 * @param {number} totalBits The total number of bits (N) relevant to the problem.
 * @param {Array<number>} pathContainer A mutable array to which path segments are appended.
 */
function findPathRecursively(currentA, currentB, processedBitsMask, totalBits, pathContainer) {
  // Base case for the recursion: If the current start and target values are identical,
  // we've found a point in the path.
  if (currentA === currentB) {
    pathContainer.push(currentA); // Add this common value to our solution path.
    return; // Terminate this specific recursive branch.
  }

  // Calculate the XOR difference between `currentA` and `currentB`.
  // This `differingBits` mask will have a '1' at each bit position where `currentA` and `currentB` differ,
  // and a '0' where they are the same.
  const differingBits = currentA ^ currentB;

  // Initialize two intermediate values for the next recursive steps.
  // Both start as `currentA` and will be modified based on bit analysis.
  let nextIntermediateA = currentA;
  let nextIntermediateB = currentA;

  // Flags to ensure that only the *first* encountered bit of each type (same or different)
  // is used for modification within this recursive call.
  let firstSameBitHandled = false;
  let firstDifferentBitHandled = false;

  // Iterate through all bit positions from 0 up to `totalBits - 1`.
  for (let bitPosition = 0; bitPosition < totalBits; bitPosition++) {
    const bitComparisonMask = 1 << bitPosition; // Create a mask for the current bit position.

    // If this bit position is already marked in `processedBitsMask`, it means it has been
    // used to create a branch in a higher-level recursive call. We must not use it again
    // in this branch to maintain the path structure.
    if ((processedBitsMask & bitComparisonMask) !== 0) {
      continue; // Skip this bit and move to the next.
    }

    // Check if the current bit is the SAME in `currentA` and `currentB`.
    // This is true if `differingBits` has a '0' at `bitPosition`.
    if ((differingBits & bitComparisonMask) === 0) {
      // If this is the first "same" bit we've encountered in this iteration,
      // flip it in both `nextIntermediateA` and `nextIntermediateB`.
      if (!firstSameBitHandled) {
        firstSameBitHandled = true; // Mark this type of bit as handled.
        nextIntermediateA ^= bitComparisonMask; // Flip the bit in `nextIntermediateA`.
        nextIntermediateB ^= bitComparisonMask; // Flip the bit in `nextIntermediateB`.
      }
    }
    // Otherwise, the current bit is DIFFERENT in `currentA` and `currentB`.
    // This is true if `differingBits` has a '1' at `bitPosition`.
    else {
      // If this is the first "different" bit we've encountered,
      // flip it in `nextIntermediateB` and add it to `processedBitsMask`.
      if (!firstDifferentBitHandled) {
        firstDifferentBitHandled = true; // Mark this type of bit as handled.
        nextIntermediateB ^= bitComparisonMask; // Flip the bit in `nextIntermediateB`.
        // Crucially, mark this bit as processed for subsequent recursive calls.
        // This bit has now served its purpose in differentiating paths.
        processedBitsMask |= bitComparisonMask;
      }
    }
  }

  // Make the two recursive calls to continue building the path.
  // The problem is divided into two subproblems:
  // 1. From `currentA` to `nextIntermediateA`.
  // 2. From `nextIntermediateB` to `currentB`.
  // Both calls use the updated `processedBitsMask` and the shared `pathContainer`.
  findPathRecursively(currentA, nextIntermediateA, processedBitsMask, totalBits, pathContainer);
  findPathRecursively(nextIntermediateB, currentB, processedBitsMask, totalBits, pathContainer);
}