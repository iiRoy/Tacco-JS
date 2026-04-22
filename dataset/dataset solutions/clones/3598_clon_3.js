/**
 * DataStreamHandler: A class designed for sequential processing of input data,
 * parsing lines and tokens as needed for algorithmic challenges.
 * It manages an internal buffer of input lines and a pointer to the current read position.
 */
class DataStreamHandler {
  // Private fields to encapsulate the internal state of the handler.
  #lineBuffer;   // Stores all input lines, potentially modified during token extraction.
  #readPointer;  // An index pointing to the next line to be processed from `lineBuffer`.

  /**
   * Constructs a new DataStreamHandler instance.
   * @param {string} rawInputContent - The complete input data as a single string,
   *                                   typically read from a file or standard input.
   * @throws {Error} If the provided input is not a string.
   */
  constructor(rawInputContent) {
    // Basic validation for the input type.
    if (typeof rawInputContent !== 'string') {
      throw new Error('Initialization Error: Input content must be a string type.');
    }
    // Splits the entire input string into an array of individual lines.
    this.#lineBuffer = rawInputContent.split('\n');
    // Initializes the read pointer to the very first line.
    this.#readPointer = 0;
  }

  /**
   * Internal helper method to safely convert a string token into a number.
   * This ensures consistent numeric parsing across all reading methods.
   * @param {string} tokenString - The string representation of a number.
   * @returns {number} The numeric value of the token, or NaN if conversion fails.
   */
  #convertTokenToNumber(tokenString) {
    // Using the Number() constructor for explicit and consistent conversion.
    return Number(tokenString);
  }

  /**
   * Extracts the last token from the current line. If the line is a string,
   * it's first split, reversed, and stored back into the buffer before popping.
   * The read pointer advances if the current line becomes empty after extraction.
   * @param {boolean} [returnAsText=false] - If true, returns the token as a string;
   *                                         otherwise, attempts to convert it to a number.
   * @returns {string|number|undefined} The extracted token, or undefined if no more input lines.
   */
  obtainNumericToken(returnAsText = false) {
    // Guard clause: check if we've reached the end of the input buffer.
    if (this.#readPointer >= this.#lineBuffer.length) {
      console.warn("DataStreamHandler Warning: Attempted to read beyond the end of the input stream.");
      return undefined; // Indicate no more data available.
    }

    // Reference to the data at the current line pointer.
    let currentLineEntry = this.#lineBuffer[this.#readPointer];

    // If the current line entry is still a raw string, it needs to be processed.
    if (typeof currentLineEntry === "string") {
      // Split the line by spaces and reverse the resulting array.
      // This allows efficient extraction of the "last" element using `pop()`.
      // The processed array replaces the original string in the buffer for future calls.
      this.#lineBuffer[this.#readPointer] = currentLineEntry.split(" ").reverse();
    }

    // Now, `currentLineEntry` (or the updated buffer entry) should be an array of tokens.
    const tokensArray = this.#lineBuffer[this.#readPointer];

    // If the tokens array is somehow invalid or empty, handle it gracefully.
    if (!Array.isArray(tokensArray) || tokensArray.length === 0) {
      // This might occur if a line was originally empty or contained only whitespace.
      this.#readPointer++; // Advance to prevent infinite loop on an empty line.
      return returnAsText ? "" : NaN; // Return a default empty/invalid value.
    }

    // Extract the last token from the (reversed) array.
    const extractedFragment = tokensArray.pop();

    // If the line is now empty after popping, increment the read pointer to move to the next line.
    if (tokensArray.length === 0) {
      this.#readPointer++;
    }

    // Return the fragment, converting to a number if `returnAsText` is false.
    return returnAsText ? extractedFragment : this.#convertTokenToNumber(extractedFragment);
  }

  /**
   * Reads an entire line from the input buffer, splits it into tokens,
   * and immediately advances the read pointer to the next line.
   * @param {boolean} [returnStrings=false] - If true, returns an array of string tokens;
   *                                          otherwise, returns an array of numeric tokens.
   * @returns {Array<string|number>|undefined} An array of tokens, or undefined if no more lines.
   */
  acquireLineOfNumbers(returnStrings = false) {
    // Guard clause: ensure there are lines left to read.
    if (this.#readPointer >= this.#lineBuffer.length) {
      console.warn("DataStreamHandler Warning: Attempted to read beyond the end of the input stream.");
      return undefined;
    }

    // Retrieve the raw line and then immediately increment the read pointer.
    const rawLineContent = this.#lineBuffer[this.#readPointer++];

    // If the content is not a string (e.g., if a previous method partially processed this line),
    // this indicates an unexpected state or an empty line.
    if (typeof rawLineContent !== 'string') {
        return []; // Return an empty array to avoid errors, assuming an empty line.
    }

    // Split the raw line into individual tokens based on spaces.
    const splitTokens = rawLineContent.split(" ");

    // Return the tokens, applying numeric conversion if `returnStrings` is false.
    return returnStrings ? splitTokens : splitTokens.map(token => this.#convertTokenToNumber(token));
  }

  /**
   * Reads a specified number of consecutive lines from the input buffer.
   * Each line is split into tokens. The read pointer is advanced by `numberOfLines`.
   * @param {number} numberOfLinesToRetrieve - The count of lines to read sequentially.
   * @param {boolean} [returnStrings=false] - If true, returns a 2D array of string tokens;
   *                                          otherwise, returns a 2D array of numeric tokens.
   * @returns {Array<Array<string|number>>} A 2D array, where each inner array represents a line's tokens.
   */
  retrieveBlockOfLines(numberOfLinesToRetrieve, returnStrings = false) {
    // Validate the input count for lines to retrieve.
    if (numberOfLinesToRetrieve <= 0) {
      console.warn("DataStreamHandler Warning: Number of lines to retrieve must be a positive integer.");
      return [];
    }

    // Calculate available lines and adjust `numberOfLinesToRetrieve` if it exceeds what's left.
    let remainingLines = this.#lineBuffer.length - this.#readPointer;
    if (numberOfLinesToRetrieve > remainingLines) {
      console.warn(`DataStreamHandler Warning: Requested ${numberOfLinesToRetrieve} lines, but only ${remainingLines} remaining. Adjusting to read ${remainingLines} lines.`);
      numberOfLinesToRetrieve = remainingLines;
    }

    // If no lines are available after adjustment, return an empty block.
    if (numberOfLinesToRetrieve <= 0) {
        return [];
    }

    // Pre-allocate the result array for potential performance benefits.
    const processedLineBlock = new Array(numberOfLinesToRetrieve);

    // Loop through the specified number of lines.
    for (let currentLineIteration = 0; currentLineIteration < numberOfLinesToRetrieve; currentLineIteration++) {
      const rawLine = this.#lineBuffer[this.#readPointer + currentLineIteration];
      const tokens = rawLine.split(" ");
      // Populate the result block, applying numeric conversion if required.
      processedLineBlock[currentLineIteration] = returnStrings ? tokens : tokens.map(token => this.#convertTokenToNumber(token));
    }

    // Update the global read pointer to reflect the lines that have just been consumed.
    this.#readPointer += numberOfLinesToRetrieve;
    return processedLineBlock;
  }
}

/**
 * Executes the primary algorithm, processing input data and computing a result.
 * This function encapsulates the main logic of the application.
 * @returns {number} The final calculated numeric result.
 */
function processInputAndCalculate() {
  // Initialize the data stream handler by reading from standard input.
  // This assumes the environment provides `require('fs')` and `/dev/stdin`.
  const dataStream = new DataStreamHandler(require("fs").readFileSync("/dev/stdin", "utf8"));

  // Retrieve the initial count (N) from the input.
  const initialCount = dataStream.obtainNumericToken();

  // Fetch the primary sequence of numeric values (analogous to original array 'a').
  const primaryValues = dataStream.acquireLineOfNumbers();

  // Initialize a secondary array to store derived maximum pairs (analogous to original array 'b').
  const derivedPairsMax = [];

  // Helper function to determine the median value of a sorted array.
  // This function is defined locally as it's a utility specific to this algorithm.
  const getArrayMedian = (elements) => {
    // Robustness check for empty or invalid input arrays.
    if (!Array.isArray(elements) || elements.length === 0) {
      console.warn("Median Calculation Warning: Attempted to find median of an empty or invalid array.");
      return NaN; // Return Not-a-Number for undefined median.
    }
    // Sort the array in ascending order to find the median.
    elements.sort((valA, valB) => valA - valB);
    // Calculate the middle index using floor division for both odd and even lengths.
    const centralIndex = Math.floor(elements.length / 2);
    // Return the element at the calculated central index.
    return elements[centralIndex];
  };

  // Handle base cases for very small initial counts.
  if (initialCount <= 2) {
    // If input is empty or contains non-numbers, handle gracefully.
    if (!Array.isArray(primaryValues) || primaryValues.length === 0 || primaryValues.some(isNaN)) {
        console.error("Input Error: Primary values array is empty or contains non-numeric data for small N.");
        return 0; // Or throw an error, depending on error handling strategy.
    }
    // For N=0, 1, or 2, the result is simply the maximum value in the primary sequence.
    return Math.max(...primaryValues);
  }

  // Populate `derivedPairsMax` with the maximum of adjacent elements from `primaryValues`.
  for (let sequenceIndex = 0; sequenceIndex < initialCount - 1; sequenceIndex++) {
    derivedPairsMax[sequenceIndex] = Math.max(primaryValues[sequenceIndex], primaryValues[sequenceIndex + 1]);
  }

  // Determine the remainder when `initialCount` is divided by 4 to branch the logic.
  const remainderModuloFour = initialCount % 4;

  // Branching logic based on the calculated remainder.
  if ([1, 2].includes(remainderModuloFour)) {
    // Case 1: `initialCount` modulo 4 is 1 or 2.
    // Combine both sequences and find the median of the merged result.
    const mergedSequence = primaryValues.concat(derivedPairsMax);
    return getArrayMedian(mergedSequence);
  } else if (remainderModuloFour === 3) {
    // Case 2: `initialCount` modulo 4 is 3.
    // Sort the derived pairs array first.
    derivedPairsMax.sort((valA, valB) => valA - valB);

    // Calculate the median of the primary values.
    const medianOfPrimaryValues = getArrayMedian(primaryValues);

    // Determine specific indices for `derivedPairsMax` based on `initialCount`.
    // Using Math.floor for explicit integer division, equivalent to bitwise right shift.
    const firstMedianIndexB = Math.floor((initialCount - 1) / 2);
    const secondMedianIndexB = Math.floor((initialCount - 2) / 2);

    // Construct a new temporary array for the final median calculation.
    const finalMedianElementsSet = [
      medianOfPrimaryValues,
      medianOfPrimaryValues,
      derivedPairsMax[firstMedianIndexB],
      derivedPairsMax[secondMedianIndexB]
    ];
    return getArrayMedian(finalMedianElementsSet);
  } else { // This covers the case where `remainderModuloFour === 0`.
    // Case 3: `initialCount` modulo 4 is 0.
    // Sort the primary values array.
    primaryValues.sort((valA, valB) => valA - valB);

    // Calculate the median of the derived pairs array.
    const medianOfDerivedPairs = getArrayMedian(derivedPairsMax);

    // Determine specific indices for `primaryValues` based on `initialCount`.
    const firstMedianIndexA = Math.floor(initialCount / 2);
    const secondMedianIndexA = Math.floor((initialCount - 1) / 2);

    // Construct a new temporary array for the final median calculation.
    const finalMedianElementsSet = [
      medianOfDerivedPairs,
      medianOfDerivedPairs,
      primaryValues[firstMedianIndexA],
      primaryValues[secondMedianIndexA]
    ];
    return getArrayMedian(finalMedianElementsSet);
  }
}

// Execute the main processing function and output its result to the console.
console.log(processInputAndCalculate());