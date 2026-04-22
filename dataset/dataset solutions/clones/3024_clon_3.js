(() => {
  "use strict";

  // --- Input Processing Utility Class ---
  /**
   * InputScanner is a utility class designed to parse raw string input
   * line by line and token by token, converting tokens to a specified data type.
   * It handles various whitespace scenarios and ensures robust input consumption.
   */
  class InputScanner {
    /**
     * @private {string[]} #sourceLines - An array where each element is a trimmed line from the input text.
     */
    #sourceLines;
    /**
     * @private {number} #currentLineIndex - Tracks the index of the line currently being processed.
     */
    #currentLineIndex;
    /**
     * @private {number} #currentTokenIndex - Tracks the index of the token on the current line.
     */
    #currentTokenIndex;
    /**
     * @private {function(string): *} #valueParser - The function used to convert string tokens to their desired type (e.g., Number, parseInt).
     */
    #valueParser;
    /**
     * @private {string[]} #tokensOnCurrentLine - An array of string tokens extracted from the current line.
     */
    #tokensOnCurrentLine;

    /**
     * Constructs an InputScanner instance.
     * @param {string} rawInputText - The complete input content as a single string.
     * @param {function(string): *} [parser=Number] - An optional function to convert token strings. Defaults to the global `Number` function.
     */
    constructor(rawInputText, parser = Number) {
      this.#sourceLines = rawInputText.split(/\r?\n/).map(line => line.trim()); // Split by newlines (CRLF or LF) and trim each line.
      this.#currentLineIndex = 0;
      this.#currentTokenIndex = 0;
      this.#valueParser = parser;
      this.#tokensOnCurrentLine = []; // Initialize with an empty array of tokens.
      this.#prepareNextNonEmptyLine(); // Initialize by finding the first non-empty line.
    }

    /**
     * Internal helper method to advance to the next non-empty line and tokenize it.
     * Skips any completely empty lines.
     * @private
     */
    #prepareNextNonEmptyLine() {
      while (this.#currentLineIndex < this.#sourceLines.length && this.#sourceLines[this.#currentLineIndex] === '') {
        this.#currentLineIndex++; // Skip empty lines.
      }
      if (this.#currentLineIndex < this.#sourceLines.length) {
        // Split the non-empty line by one or more whitespace characters and filter out any empty strings.
        this.#tokensOnCurrentLine = this.#sourceLines[this.#currentLineIndex].split(/\s+/).filter(Boolean);
      } else {
        this.#tokensOnCurrentLine = []; // No more lines available.
      }
    }

    /**
     * Reads and returns the next available token from the input.
     * Automatically advances to the next line if all tokens on the current line have been consumed.
     * @returns {*} The parsed value of the next token, or `undefined` if the end of input is reached.
     */
    readNextToken() {
      if (this.#currentLineIndex >= this.#sourceLines.length) {
        return undefined; // End of input.
      }

      // If all tokens on the current line have been read, move to the next line.
      if (this.#currentTokenIndex >= this.#tokensOnCurrentLine.length) {
        this.#currentLineIndex++;
        this.#currentTokenIndex = 0; // Reset token index for the new line.
        this.#prepareNextNonEmptyLine(); // Prepare the new line.
        if (this.#currentLineIndex >= this.#sourceLines.length) {
          return undefined; // No more tokens after advancing lines.
        }
      }

      const tokenString = this.#tokensOnCurrentLine[this.#currentTokenIndex];
      this.#currentTokenIndex++;
      return this.#valueParser(tokenString);
    }

    /**
     * Reads all remaining tokens on the current line, parses them, and then advances to the next line.
     * @returns {*[]} An array containing all parsed token values from the line that was just read.
     *                 Returns an empty array if there are no more lines to read.
     */
    readAllTokensOnCurrentLine() {
      if (this.#currentLineIndex >= this.#sourceLines.length) {
        return []; // End of input.
      }

      const parsedTokens = this.#tokensOnCurrentLine.map(this.#valueParser);
      this.#currentLineIndex++;
      this.#currentTokenIndex = 0; // Reset for the next line.
      this.#prepareNextNonEmptyLine(); // Prepare the subsequent line.
      return parsedTokens;
    }
  }

  // --- Modular Arithmetic Helper Functions ---
  /**
   * A common prime modulus used in competitive programming to keep results within a manageable range.
   */
  const PRIME_MODULUS = 998244353;

  /**
   * Performs modular addition: `(a + b) % PRIME_MODULUS`.
   * @param {number} addend1 - The first number to add.
   * @param {number} addend2 - The second number to add.
   * @returns {number} The result of the addition modulo PRIME_MODULUS.
   */
  const modularAdd = (addend1, addend2) => (addend1 + addend2) % PRIME_MODULUS;

  /**
   * Performs modular subtraction: `(a - b) % PRIME_MODULUS`, ensuring the result is non-negative.
   * @param {number} minuend - The number from which to subtract.
   * @param {number} subtrahend - The number to subtract.
   * @returns {number} The result of the subtraction modulo PRIME_MODULUS.
   */
  const modularSubtract = (minuend, subtrahend) => (minuend - subtrahend % PRIME_MODULUS + PRIME_MODULUS) % PRIME_MODULUS;

  /**
   * Performs modular multiplication: `(a * b) % PRIME_MODULUS`.
   * Uses `BigInt` for intermediate products to prevent potential overflow before the modulo operation,
   * especially when `a` and `b` are large.
   * @param {number} factor1 - The first number to multiply.
   * @param {number} factor2 - The second number to multiply.
   * @returns {number} The result of the multiplication modulo PRIME_MODULUS.
   */
  const modularMultiply = (factor1, factor2) => Number((1n * BigInt(factor1) * BigInt(factor2)) % BigInt(PRIME_MODULUS));

  /**
   * Computes `base^exponent % PRIME_MODULUS` efficiently using binary exponentiation (exponentiation by squaring).
   * @param {number} base - The base number.
   * @param {number} exponent - The exponent (must be a non-negative integer).
   * @returns {number} The result of the modular exponentiation.
   */
  const modularPower = (base, exponent) => {
    let result = 1n; // Initialize result as BigInt.
    let currentBase = BigInt(base);
    let currentExp = exponent;

    currentBase %= BigInt(PRIME_MODULUS); // Reduce base modulo PRIME_MODULUS.

    while (currentExp > 0) {
      if (currentExp % 2 === 1) { // If the current exponent bit is 1.
        result = (result * currentBase) % BigInt(PRIME_MODULUS);
      }
      currentBase = (currentBase * currentBase) % BigInt(PRIME_MODULUS); // Square the base.
      currentExp = Math.floor(currentExp / 2); // Halve the exponent.
    }
    return Number(result); // Convert the final BigInt result back to a Number.
  };

  // --- Core Problem Solving Logic ---
  /**
   * This function orchestrates the solution to the problem by reading input,
   * performing dynamic programming calculations, and applying inclusion-exclusion.
   * @param {string} rawInputData - The entire raw input as a string.
   */
  function executeSolution(rawInputData) {
    const dataParser = new InputScanner(rawInputData);

    // Read the total number of items, N.
    const totalItemsCount = dataParser.readNextToken();

    // Read N individual item values into an array.
    const itemNumericalValues = [];
    for (let i = 0; i < totalItemsCount; ++i) {
      itemNumericalValues.push(dataParser.readNextToken());
    }

    // Calculate the grand total sum of all item values.
    const overallSumOfAllElements = itemNumericalValues.reduce((acc, val) => acc + val, 0);

    // Calculate the total number of ways to assign each of the N items to one of three distinct categories.
    // This is 3^N, which serves as the universe for inclusion-exclusion.
    const totalPossibleCategorizations = modularPower(3, totalItemsCount);

    // --- DP Phase 1: Count ways for a subset sum to be >= (overallSumOfAllElements / 2) ---
    // This dynamic programming approach calculates `dpCurrentWaysToAchieveSum[s]`,
    // representing the number of ways to form a subset sum 's' from a prefix of `itemNumericalValues`.
    // Each item can either be:
    // 1. Included in the "target" subset (contributing to 's').
    // 2. Excluded from the "target" subset, but assigned to one of the *two other* conceptual categories.
    //    This "other two categories" option is reflected by a `* 2` factor for non-inclusion.
    let dpCurrentWaysToAchieveSum = new Array(overallSumOfAllElements + 1).fill(0);
    dpCurrentWaysToAchieveSum[0] = 1; // Base case: There's one way to get a sum of 0 (by selecting no items).

    for (let itemIdx = 0; itemIdx < totalItemsCount; ++itemIdx) {
      const currentItemValue = itemNumericalValues[itemIdx];
      let dpNextWaysToAchieveSum = new Array(overallSumOfAllElements + 1).fill(0); // Initialize next DP state.

      for (let s = 0; s <= overallSumOfAllElements; ++s) {
        if (dpCurrentWaysToAchieveSum[s] === 0) {
          continue; // Optimization: If no ways exist to reach sum 's', skip processing.
        }

        // Scenario A: The current item is NOT included in the subset sum 's'.
        // It can be assigned to one of the two other categories.
        dpNextWaysToAchieveSum[s] = modularAdd(dpNextWaysToAchieveSum[s],
                                              modularMultiply(dpCurrentWaysToAchieveSum[s], 2));

        // Scenario B: The current item IS included in the subset sum 's'.
        // This creates a new sum `s + currentItemValue`.
        const newSumValue = s + currentItemValue;
        if (newSumValue <= overallSumOfAllElements) {
          dpNextWaysToAchieveSum[newSumValue] = modularAdd(dpNextWaysToAchieveSum[newSumValue], dpCurrentWaysToAchieveSum[s]);
        }
      }
      dpCurrentWaysToAchieveSum = dpNextWaysToAchieveSum; // Transition to the next DP state.
    }

    let totalWaysSumGTEHalf = 0;
    const minSumForThreshold = Math.ceil(overallSumOfAllElements / 2);

    // Accumulate all ways where the computed subset sum is greater than or equal to half of the total sum.
    for (let s = minSumForThreshold; s <= overallSumOfAllElements; ++s) {
      totalWaysSumGTEHalf = modularAdd(totalWaysSumGTEHalf, dpCurrentWaysToAchieveSum[s]);
    }

    // --- DP Phase 2: Count ways for a subset sum to be exactly equal to (overallSumOfAllElements / 2) ---
    // This DP counts the number of distinct subsets whose sum is precisely `overallSumOfAllElements / 2`.
    // Each item can either be included or excluded (0/1 knapsack problem variant).
    let totalWaysSumEQHalf = 0;

    // Guard clause: If the total sum is odd, it's impossible to form a subset with exactly half the total sum.
    if (overallSumOfAllElements % 2 !== 0) {
      totalWaysSumEQHalf = 0;
    } else {
      const targetExactSumHalf = overallSumOfAllElements / 2;
      // `dpExactSum[s]` stores the count of ways to achieve sum 's' using a subset of items.
      let dpExactSum = new Array(targetExactSumHalf + 1).fill(0);
      dpExactSum[0] = 1; // Base case: One way to get sum 0 (the empty set).

      for (let itemIdx = 0; itemIdx < totalItemsCount; ++itemIdx) {
        const currentItem = itemNumericalValues[itemIdx];
        // Iterate backwards to ensure that each item is considered at most once for forming `s`.
        // Forward iteration would allow an item to be re-used multiple times within the same DP step.
        for (let s = targetExactSumHalf; s >= currentItem; --s) {
          dpExactSum[s] = modularAdd(dpExactSum[s], dpExactSum[s - currentItem]);
        }
      }
      totalWaysSumEQHalf = dpExactSum[targetExactSumHalf];
    }

    // --- Final Result Calculation using the Principle of Inclusion-Exclusion ---
    // This formula is typically used to solve problems that involve counting partitions
    // (e.g., into three groups A, B, C) that satisfy symmetric conditions,
    // like `sum(A) < sum(B)` and `sum(A) < sum(C)`.
    // The formula: Total - 3 * (ways where one group sum >= S/2) + 3 * (ways where one group sum == S/2)
    // accounts for overcounting and undercounting when multiple groups satisfy the condition.
    let finalCalculatedAnswer = totalPossibleCategorizations;

    // Subtract cases where at least one specific group's sum is >= half the total sum.
    // Multiplied by 3 due to symmetry (any of the three groups could be "the one").
    finalCalculatedAnswer = modularSubtract(finalCalculatedAnswer, modularMultiply(totalWaysSumGTEHalf, 3));

    // Add back cases where a specific group's sum is exactly half the total sum.
    // These cases were over-subtracted because they are counted multiple times in `totalWaysSumGTEHalf`
    // (e.g., if two groups each sum to exactly half, they are counted twice in the subtraction).
    // Multiplied by 3 for symmetry.
    finalCalculatedAnswer = modularAdd(finalCalculatedAnswer, modularMultiply(totalWaysSumEQHalf, 3));

    console.log(Number(finalCalculatedAnswer)); // Output the final answer.
  }

  // --- Entry Point: Read Input and Execute Solution ---
  // Reads the entire content of standard input (`/dev/stdin`) as a UTF-8 string,
  // then passes it to the main solution function.
  executeSolution(require("fs").readFileSync("/dev/stdin", "utf8"));

})();