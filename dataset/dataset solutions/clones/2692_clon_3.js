const InputProcessorFactory = (function () {
  /**
   * Creates an instance of a TextDataReader to process raw input.
   * @param {string} rawInputText The entire input content as a single string.
   * @returns {TextDataReader} An object capable of reading various data types from the input.
   */
  function createInputReader(rawInputText) {
    return new TextDataReader(rawInputText);
  }

  /**
   * @class TextDataReader
   * @description A utility class for parsing line-based and space-separated data.
   */
  class TextDataReader {
    /**
     * Initializes the data reader with the raw input string.
     * @param {string} rawInputText The complete input content.
     */
    constructor(rawInputText) {
      // Clean and split the input into individual lines.
      this.lineSegments = rawInputText.trim().split("\n");
      // Initialize a pointer to the current line being read.
      this.currentReadPointer = 0;
    }

    /**
     * Extracts a single numeric item from the current line.
     * It reads items from right to left on a line.
     * Advances the line pointer if the current line becomes empty after extraction.
     * @param {boolean} [returnStringFormat=false] If true, returns the value as a string; otherwise, as a number.
     * @returns {(string|number)} The extracted item.
     */
    extractNextInteger(returnStringFormat = false) {
      const currentSegments = this.lineSegments;
      const currentIdx = this.currentReadPointer;

      // Guard against reading beyond available lines.
      if (currentIdx >= currentSegments.length) {
        throw new Error("Attempted to read past end of input data.");
      }

      // If the current line hasn't been split into items yet, split it and reverse for right-to-left popping.
      if (typeof currentSegments[currentIdx] === "string") {
        currentSegments[currentIdx] = currentSegments[currentIdx].split(" ").reverse();
      }

      // Pop the last item (which is the first item after reversing).
      const extractedValue = currentSegments[currentIdx].pop();

      // If the current line is now empty, advance to the next line.
      if (!currentSegments[currentIdx] || currentSegments[currentIdx].length === 0) {
        this.currentReadPointer++;
      }

      // Return as string or convert to number based on the flag.
      return returnStringFormat ? extractedValue : Number(extractedValue);
    }

    /**
     * Reads an entire line, splits it by spaces, and returns an array of items.
     * Advances the line pointer after reading.
     * @param {boolean} [returnStringFormat=false] If true, returns array of strings; otherwise, array of numbers.
     * @returns {Array<(string|number)>} An array of items from the line.
     */
    readNextLineAsNumbers(returnStringFormat = false) {
      const currentLineContent = this.lineSegments[this.currentReadPointer++];
      // Guard against empty or undefined lines.
      if (!currentLineContent) {
        return [];
      }
      const splitItems = currentLineContent.split(" ");
      return returnStringFormat ? splitItems : splitItems.map((item) => Number(item));
    }

    /**
     * Reads 'numberOfLines' consecutive lines, splits each into items, and returns a 2D array (matrix).
     * Advances the line pointer by 'numberOfLines'.
     * @param {number} numberOfLines The number of lines to read for the matrix.
     * @param {boolean} [returnStringFormat=false] If true, returns matrix of strings; otherwise, matrix of numbers.
     * @returns {Array<Array<(string|number)>>} A 2D array representing the matrix.
     */
    fetchMatrixOfNumbers(numberOfLines, returnStringFormat = false) {
      const startLine = this.currentReadPointer;
      const endLine = startLine + numberOfLines;

      // Slice the relevant lines and then update the pointer.
      const rawMatrixLines = this.lineSegments.slice(startLine, endLine);
      this.currentReadPointer = endLine;

      const processedMatrix = rawMatrixLines.map((line) => line.split(" "));

      return returnStringFormat
        ? processedMatrix
        : processedMatrix.map((row) => row.map((item) => Number(item)));
    }

    /**
     * Reads 'numberOfLines' consecutive lines as raw strings.
     * Advances the line pointer by 'numberOfLines'.
     * @param {number} numberOfLines The number of lines to read.
     * @param {boolean} [returnStringFormat=false] This parameter is ignored as raw lines are always strings.
     * @returns {Array<string>} An array of raw line strings.
     */
    getRawLines(numberOfLines, returnStringFormat = false) {
      const startLine = this.currentReadPointer;
      const endLine = startLine + numberOfLines;

      const rawLines = this.lineSegments.slice(startLine, endLine);
      this.currentReadPointer = endLine;

      return rawLines;
    }
  }

  return createInputReader; // Expose the factory function.
})();

// Instantiate the input reader by reading from standard input.
const dataReaderInstance = InputProcessorFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Finds all divisors of a given number and returns them in descending order.
 * Uses a Set to handle duplicates efficiently.
 * @param {number} targetNumber The number for which to find divisors.
 * @returns {Array<number>} An array of divisors sorted in descending order.
 */
function calculateDivisorsInDescendingOrder(targetNumber) {
  // Guard against non-positive numbers if the context expects positive.
  if (targetNumber <= 0) {
    // For competitive programming, usually inputs are positive.
    // If targetNumber can be 0 or negative, this logic needs adjustment.
    return targetNumber === 0 ? [] : [-Math.abs(targetNumber)]; // Example: for -5, return [-5, -1]
  }

  const foundDivisors = new Set();
  foundDivisors.add(1); // 1 is always a divisor.
  foundDivisors.add(targetNumber); // The number itself is always a divisor.

  const squareRootLimit = Math.sqrt(targetNumber);

  // Iterate from 2 up to the square root of the target number.
  for (let candidate = 2; candidate <= squareRootLimit; candidate++) {
    if (targetNumber % candidate === 0) {
      foundDivisors.add(candidate);
      foundDivisors.add(targetNumber / candidate); // Add the complementary divisor.
    }
  }

  // Convert the Set to an Array and sort in descending order.
  const sortedDivisors = Array.from(foundDivisors).sort((valA, valB) => valB - valA);
  return sortedDivisors;
}

/**
 * Main function to solve the problem: find the largest divisor 'd'
 * such that the sum of remainders of elements in 'inputNumberArray' modulo 'd'
 * can be adjusted within a 'maxPermissibleCost' budget.
 * @returns {number} The optimal divisor or 1 if no other valid divisor is found.
 */
function calculateOptimalDivisor() {
  const totalElements = dataReaderInstance.extractNextInteger(); // Read N
  const maxPermissibleCost = dataReaderInstance.extractNextInteger(); // Read K
  const inputNumberArray = dataReaderInstance.readNextLineAsNumbers(); // Read array A

  // Calculate the total sum of the input array elements.
  const totalArraySum = inputNumberArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

  // Get all divisors of the total sum, sorted in descending order.
  const potentialDivisors = calculateDivisorsInDescendingOrder(totalArraySum);

  // Iterate through each potential divisor, starting from the largest.
  for (let divisorIterator = 0; divisorIterator < potentialDivisors.length; divisorIterator++) {
    const currentDivisor = potentialDivisors[divisorIterator];

    // Calculate remainders for each element in the input array with the current divisor.
    // Sort these remainders in ascending order.
    const remainderValues = inputNumberArray
      .map((value) => value % currentDivisor)
      .sort((valA, valB) => valA - valB);

    let currentRemainderSumForDivisor = 0; // Tracks the sum of remainders currently considered, adjusted by "payments".
    let currentBudgetUsage = 0; // Tracks the sum of the smallest remainders (original 'mx' variable).
    let rightmostPointer = totalElements; // Pointer for removing largest remainders (original 'y' variable, starts at N).

    // Iterate through the sorted remainders from smallest to largest (left pointer).
    for (let currentLeftPointer = 0; currentLeftPointer < totalElements; currentLeftPointer++) {
      // Add the current smallest remainder to both sums.
      currentRemainderSumForDivisor += remainderValues[currentLeftPointer];
      currentBudgetUsage += remainderValues[currentLeftPointer];

      // If the sum of the smallest remainders (budget usage) exceeds the limit,
      // this divisor is not valid. Mark it and break from the inner loop.
      if (currentBudgetUsage > maxPermissibleCost) {
        currentBudgetUsage = Infinity; // Ensures this divisor fails the final check.
        break;
      }

      // While the adjusted sum of remainders is positive, "pay" to make the largest available remainders multiples of the divisor.
      // This reduces 'currentRemainderSumForDivisor' but does NOT add to 'currentBudgetUsage'.
      // The condition `rightmostPointer > currentLeftPointer + 1` ensures that `remainderValues[rightmostPointer - 1]`
      // is always a distinct element to the right of `remainderValues[currentLeftPointer]`.
      while (currentRemainderSumForDivisor > 0 && rightmostPointer > currentLeftPointer + 1) {
        rightmostPointer--; // Decrement the pointer to consider the next largest remainder.
        // Calculate the "cost" to make this remainder a multiple of the divisor.
        const adjustmentCost = currentDivisor - remainderValues[rightmostPointer];
        currentRemainderSumForDivisor -= adjustmentCost; // Apply the adjustment to the sum.
      }
    }

    // After iterating through all elements (or breaking early),
    // if the total budget usage (sum of smallest remainders) is within the limit,
    // this currentDivisor is the largest valid one found so far.
    if (currentBudgetUsage <= maxPermissibleCost) {
      return currentDivisor; // Return this divisor as it's the largest valid one due to descending sort.
    }
  }

  // If no suitable divisor is found, return 1 as a fallback.
  return 1;
}

// Execute the main logic and print the result.
(function () {
  const finalResult = calculateOptimalDivisor();
  process.stdout.write(String(finalResult) + "\n");
})();