'use strict'; // Enforce strict parsing and error handling for robust code execution.

/**
 * Manages the process of reading input data from a standard source.
 * This utility class handles file I/O and parsing of various data types.
 */
class DataStreamReader {
  /**
   * Initializes the reader, setting up the internal cursor and loading all input data.
   */
  constructor() {
    this.currentPosition = 0; // Tracks the current line being read.
    this.allInputLines = []; // Initialize to an empty array.
    this.loadAllInputData(); // Fetches all lines from the input source.
  }

  /**
   * Reads all lines from the standard input file and stores them internally.
   * @returns {string[]} An array of strings, where each string is a line from the input.
   * @throws {Error} If the input file cannot be read.
   */
  loadAllInputData() {
    try {
      // Using 'fs' module for file system operations to read from stdin.
      const rawInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
      this.allInputLines = rawInputContent.split('\n');
      // Remove any empty lines that might result from trailing newlines.
      if (this.allInputLines.length > 0 && this.allInputLines[this.allInputLines.length - 1] === '') {
        this.allInputLines.pop();
      }
    } catch (readError) {
      console.error("Failed to read input data:", readError.message);
      // In a production scenario, might re-throw or handle more gracefully.
      // For competitive programming, this means no input, so `allInputLines` remains empty.
    }
    return this.allInputLines;
  }

  /**
   * Retrieves one or more lines from the input stream.
   * @param {number} [count] - The number of lines to retrieve. If omitted, retrieves a single line.
   * @returns {string|string[]|undefined} A single line string, an array of line strings, or undefined if no more lines.
   */
  retrieveLine(count) {
    if (this.currentPosition >= this.allInputLines.length) {
      return count ? [] : undefined; // No more lines available.
    }

    if (count != null && count > 0) {
      const retrievedLines = this.allInputLines.slice(this.currentPosition, this.currentPosition + count);
      this.currentPosition += retrievedLines.length; // Advance cursor by actual number of lines retrieved.
      return retrievedLines;
    }
    // Default: retrieve a single line.
    return this.allInputLines[this.currentPosition++];
  }

  /**
   * Parses the next line as an integer.
   * @returns {number|undefined} The parsed integer, or undefined if no line is available.
   */
  retrieveInt() {
    const line = this.retrieveLine();
    return line !== undefined ? Number.parseInt(line, 10) : undefined;
  }

  /**
   * Parses the next line as an array of strings, split by spaces.
   * @returns {string[]|undefined} An array of strings, or undefined if no line is available.
   */
  retrieveStringArray() {
    const line = this.retrieveLine();
    return line !== undefined ? line.split(' ') : undefined;
  }

  /**
   * Parses the next line as an array of integers.
   * @returns {number[]|undefined} An array of integers, or undefined if no line is available.
   */
  retrieveIntArray() {
    const strArr = this.retrieveStringArray();
    return strArr !== undefined ? strArr.map((val) => Number.parseInt(val, 10)) : undefined;
  }

  /**
   * Parses the next line as an array of floating-point numbers.
   * @returns {number[]|undefined} An array of floats, or undefined if no line is available.
   */
  retrieveFloatArray() {
    const strArr = this.retrieveStringArray();
    return strArr !== undefined ? strArr.map((val) => Number.parseFloat(val)) : undefined;
  }

  /**
   * Reads a specified number of lines and parses each as an integer.
   * @param {number} numLines - The number of lines to read.
   * @returns {number[]} An array of integers.
   */
  retrieveIntLines(numLines) {
    const lines = this.retrieveLine(numLines);
    return Array.isArray(lines) ? lines.map((line) => Number.parseInt(line, 10)) : [];
  }

  /**
   * Reads a specified number of lines and parses each as a floating-point number.
   * @param {number} numLines - The number of lines to read.
   * @returns {number[]} An array of floats.
   */
  retrieveFloatLines(numLines) {
    const lines = this.retrieveLine(numLines);
    return Array.isArray(lines) ? lines.map((line) => Number.parseFloat(line)) : [];
  }

  /**
   * Reads a specified number of lines and splits each into an array of strings.
   * @param {number} numLines - The number of lines to read.
   * @returns {string[][]} A 2D array of strings.
   */
  retrieveStringMatrix(numLines) {
    const lines = this.retrieveLine(numLines);
    return Array.isArray(lines) ? lines.map((line) => line.split(' ')) : [];
  }

  /**
   * Reads a specified number of lines and parses each into an array of integers.
   * @param {number} numLines - The number of lines to read.
   * @returns {number[][]} A 2D array of integers.
   */
  retrieveIntMatrix(numLines) {
    const lines = this.retrieveLine(numLines);
    return Array.isArray(lines) ? lines.map((line) => line.split(' ').map((val) => Number.parseInt(val, 10))) : [];
  }

  /**
   * Reads a specified number of lines and parses each into an array of floating-point numbers.
   * @param {number} numLines - The number of lines to read.
   * @returns {number[][]} A 2D array of floats.
   */
  retrieveFloatMatrix(numLines) {
    const lines = this.retrieveLine(numLines);
    return Array.isArray(lines) ? lines.map((line) => line.split(' ').map((val) => Number.parseFloat(val))) : [];
  }
}

const dataStream = new DataStreamReader();

/**
 * Provides a collection of common utility functions for array manipulation and calculations.
 * Designed to mimic some functionalities found in libraries like Lodash or Underscore.js.
 */
class CollectionUtils {
  /**
   * Calculates the sum of all numeric elements in an array.
   * Supports both regular numbers and BigInts, returning a BigInt if any element is BigInt or if the sum exceeds Number.MAX_SAFE_INTEGER.
   * @param {Array<number|BigInt>} numericArray - The array of numbers to sum.
   * @returns {BigInt} The total sum as a BigInt. Returns 0n for empty or invalid input.
   */
  accumulate(numericArray) {
    if (!Array.isArray(numericArray) || numericArray.length === 0) {
      return 0n; // Return BigInt zero for consistency with potential BigInt sums.
    }
    let currentSum = 0n; // Start with BigInt to ensure large sums are handled.
    for (const item of numericArray) {
      currentSum += BigInt(item);
    }
    return currentSum;
  }

  /**
   * Finds the minimum element in an array based on a comparison function.
   * @param {Array<any>} sourceArray - The array to search.
   * @param {Function} [comparisonFn] - A function `(a, b)` returning <0 if a<b, 0 if a==b, >0 if a>b. Defaults to numeric comparison.
   * @returns {any|undefined} The minimum element, or undefined if the array is empty.
   */
  findMinimum(sourceArray, comparisonFn) {
    if (!Array.isArray(sourceArray) || sourceArray.length === 0) return undefined;
    const effectiveComparator = comparisonFn || ((valA, valB) => valA - valB);
    return sourceArray.reduce((minVal, currentVal) => effectiveComparator(minVal, currentVal) < 0 ? minVal : currentVal);
  }

  /**
   * Finds the maximum element in an array based on a comparison function.
   * @param {Array<any>} sourceArray - The array to search.
   * @param {Function} [comparisonFn] - A function `(a, b)` returning <0 if a<b, 0 if a==b, >0 if a>b. Defaults to numeric comparison.
   * @returns {any|undefined} The maximum element, or undefined if the array is empty.
   */
  findMaximum(sourceArray, comparisonFn) {
    if (!Array.isArray(sourceArray) || sourceArray.length === 0) return undefined;
    const effectiveComparator = comparisonFn || ((valA, valB) => valA - valB);
    return sourceArray.reduce((maxVal, currentVal) => effectiveComparator(maxVal, currentVal) > 0 ? maxVal : currentVal);
  }

  /**
   * Sorts an array in place using a provided comparison function.
   * @param {Array<any>} sourceArray - The array to sort.
   * @param {Function} [comparisonFn] - A function `(a, b)` returning <0 if a<b, 0 if a==b, >0 if a>b. Defaults to numeric comparison.
   * @returns {Array<any>} The sorted array (same instance as input).
   */
  sortElements(sourceArray, comparisonFn) {
    if (!Array.isArray(sourceArray)) return []; // Return empty array for invalid input.
    const effectiveComparator = comparisonFn || ((valA, valB) => valA - valB);
    return sourceArray.sort(effectiveComparator);
  }

  /**
   * Generates an array of numbers within a specified range, with an optional step.
   * @param {number} startValue - The starting value (inclusive).
   * @param {number} [endValue] - The ending value (exclusive). If omitted, `startValue` becomes `endValue` and `startValue` defaults to 0.
   * @param {number} [stepSize=1] - The increment or decrement step.
   * @returns {number[]} An array of numbers.
   */
  generateRange(startValue, endValue, stepSize) {
    let currentStart = startValue || 0;
    let currentEnd = endValue;
    let currentStep = stepSize;

    if (currentEnd === undefined) {
      currentEnd = currentStart;
      currentStart = 0;
    }

    if (currentStep === undefined) {
      currentStep = currentEnd < currentStart ? -1 : 1;
    }

    const arrayLength = Math.max(Math.ceil((currentEnd - currentStart) / currentStep), 0);
    const generatedArray = Array(arrayLength);

    for (let index = 0; index < arrayLength; index++, currentStart += currentStep) {
      generatedArray[index] = currentStart;
    }
    return generatedArray;
  }

  /**
   * Retrieves the first element(s) of an array.
   * @param {Array<any>} targetArray - The array from which to retrieve elements.
   * @param {number} [count] - The number of elements to retrieve from the beginning.
   * @returns {any|Array<any>|undefined} The first element, an array of first elements, or undefined/empty array for invalid input.
   */
  getHead(targetArray, count) {
    if (!Array.isArray(targetArray) || targetArray.length === 0) {
      return count == null ? undefined : [];
    }
    if (count == null) {
      return targetArray[0];
    }
    // Ensure count is not negative.
    return targetArray.slice(0, Math.max(0, count));
  }

  /**
   * Retrieves all but the last element(s) of an array.
   * @param {Array<any>} targetArray - The array.
   * @param {number} [elementsToExclude=1] - The number of elements to exclude from the end.
   * @returns {Array<any>} A new array containing initial elements.
   */
  getInitialSegment(targetArray, elementsToExclude = 1) {
    if (!Array.isArray(targetArray)) return [];
    // Ensure elementsToExclude is not negative.
    return targetArray.slice(0, Math.max(0, targetArray.length - elementsToExclude));
  }

  /**
   * Retrieves all but the first element(s) of an array.
   * @param {Array<any>} targetArray - The array.
   * @param {number} [elementsToExclude=1] - The number of elements to exclude from the beginning.
   * @returns {Array<any>} A new array containing the tail elements.
   */
  getTailSegment(targetArray, elementsToExclude = 1) {
    if (!Array.isArray(targetArray)) return [];
    // Ensure elementsToExclude is not negative.
    return targetArray.slice(Math.max(0, elementsToExclude));
  }

  /**
   * Retrieves the last element(s) of an array.
   * @param {Array<any>} targetArray - The array from which to retrieve elements.
   * @param {number} [count] - The number of elements to retrieve from the end.
   * @returns {any|Array<any>|undefined} The last element, an array of last elements, or undefined/empty array for invalid input.
   */
  getFoot(targetArray, count) {
    if (!Array.isArray(targetArray) || targetArray.length === 0) {
      return count == null ? undefined : [];
    }
    if (count == null) {
      return targetArray[targetArray.length - 1];
    }
    // Re-use getTailSegment for consistency.
    return this.getTailSegment(targetArray, Math.max(0, targetArray.length - count));
  }

  /**
   * Calculates the cumulative sum (prefix sum) of an array.
   * @param {Array<number|BigInt>} sourceArray - The array of numbers.
   * @returns {Array<BigInt>} An array where each element is the sum of all preceding elements (including itself) from the original array.
   */
  calculatePrefixSums(sourceArray) {
    if (!Array.isArray(sourceArray) || sourceArray.length === 0) {
      return [];
    }
    let currentTotal = 0n;
    const prefixSums = [0n]; // Start with 0 for convenience, then slice it off later.
    for (const val of sourceArray) {
      currentTotal += BigInt(val);
      prefixSums.push(currentTotal);
    }
    return this.getTailSegment(prefixSums, 1); // Remove the initial 0n.
  }

  /**
   * Performs a binary search on a sorted array to find the insertion point for a key.
   * @param {Array<any>} sortedArray - The array to search within (must be sorted).
   * @param {any} searchKey - The value to search for.
   * @param {string|Function} [accessorOrComparator] - A property name string to extract value from objects, or a custom comparison function `(element, key)` returning <0 if element<key, 0 if element==key, >0 if element>key.
   * @returns {number} The index where the key should be inserted to maintain sorted order (or the index of the first occurrence if found).
   */
  findInsertionPoint(sortedArray, searchKey, accessorOrComparator) {
    if (!Array.isArray(sortedArray)) return 0; // Invalid array, assume start.

    const resolveValue = (item) => {
      if (typeof accessorOrComparator === 'string') {
        return item[accessorOrComparator];
      }
      // If accessorOrComparator is a function, it's a comparator, not an accessor.
      // So we just return the item itself for comparison with the key.
      return item;
    };

    const compare = (itemValue, keyValue) => {
      if (typeof accessorOrComparator === 'function') {
        return accessorOrComparator(itemValue, keyValue);
      }
      // Default numeric/string comparison if no custom comparator.
      if (itemValue < keyValue) return -1;
      if (itemValue > keyValue) return 1;
      return 0;
    };

    let lowBoundary = 0;
    let highBoundary = sortedArray.length;

    while (lowBoundary < highBoundary) {
      const mid = Math.floor((lowBoundary + highBoundary) / 2);
      const midValue = resolveValue(sortedArray[mid]);

      if (compare(midValue, searchKey) < 0) {
        lowBoundary = mid + 1;
      } else {
        highBoundary = mid;
      }
    }
    return lowBoundary;
  }
}
const collectionHelpers = new CollectionUtils(); // Instantiate the utility class.

/**
 * Core application logic for processing digit strings and calculating sums of expressions.
 */
class ArithmeticExpressionProcessor {
  /**
   * Executes the main computational task:
   * Reads a string of digits, then calculates the sum of all possible numbers formed
   * by inserting '+' operators between its digits.
   * Example: For "123", it calculates (1+2+3) + (1+23) + (12+3) + (123).
   * @returns {BigInt|string} The total sum as a BigInt, or an error message string if input is invalid.
   */
  processAllCombinations() {
    // Retrieve the input digit string.
    const inputDigitString = dataStream.retrieveLine();

    // Guard clause for empty or invalid input.
    if (inputDigitString === undefined || typeof inputDigitString !== 'string' || inputDigitString.length === 0) {
      return "Input string is empty or invalid. Cannot process.";
    }

    // Convert the string to an array of characters, then reverse it.
    // Example: "123" -> ['1', '2', '3'] -> ['3', '2', '1']
    const reversedNumeralCharacters = Array.from(inputDigitString).reverse();
    const numberOfDigits = reversedNumeralCharacters.length;

    // If there's only one digit, there are no operators to insert, so the sum is just the digit itself.
    if (numberOfDigits === 1) {
        return BigInt(reversedNumeralCharacters[0]);
    }

    // The total sum, initialized as a BigInt to prevent overflow for large inputs.
    let cumulativeSum = 0n;

    // There are (numberOfDigits - 1) possible positions for operators.
    // Each position can either be a '+' (addition) or a concatenation (no operator).
    // This results in 2^(numberOfDigits - 1) unique combinations.
    // The bitmask 'operatorPattern' represents these combinations.
    // A bit '1' at position `j` means concatenate digits `j` and `j+1`.
    // A bit '0' at position `j` means insert '+' between digits `j` and `j+1`.
    // The loop iterates from 0 up to 2^(N-1) - 1.
    const totalCombinations = 1 << (numberOfDigits - 1); // Max value for bit patterns.

    for (let operatorPattern = 0; operatorPattern < totalCombinations; ++operatorPattern) {
      let currentBitMask = operatorPattern; // Copy the pattern for bit manipulation.
      let segmentValueMultiplier = 1n; // Represents the place value (1, 10, 100...) for the current digit within its number segment.
      
      // Iterate through the reversed digit characters.
      // Example: for "123", we process '3', then '2', then '1'.
      for (const currentNumeral of reversedNumeralCharacters) {
        // Convert the character digit to a BigInt and multiply by its current place value.
        // Add this product to the overall cumulative sum for the current pattern.
        cumulativeSum += BigInt(currentNumeral) * segmentValueMultiplier;

        // Determine the next place value based on the current bit in the pattern.
        // This logic applies to the *boundary after* the current digit and *before* the next digit.
        // The bit corresponds to the operator *between* the current digit and the next one.
        // If the bit is 1, concatenate: multiply the multiplier by 10.
        // If the bit is 0, add: reset the multiplier to 1 (start a new number segment).
        // This is based on the original problem's specific bitmask interpretation.
        if ((currentBitMask & 1) === 1) { // Bit is 1: concatenate
          segmentValueMultiplier *= 10n;
        } else { // Bit is 0: add (start new segment)
          segmentValueMultiplier = 1n;
        }
        
        // Shift the bitmask to the right to process the next bit for the next digit pair.
        currentBitMask >>>= 1; // Unsigned right shift for clarity and safety.
      }
    }
    // Return the final computed sum.
    return cumulativeSum;
  }
}

/**
 * Handles the final output of the program, formatting it as needed.
 * @param {any} finalOutput - The result to be displayed.
 */
const displayResult = (finalOutput) => {
  let formattedOutput;
  // Guard against null or undefined output.
  if (finalOutput == null) {
    console.log(""); // Output an empty line or nothing if preferred.
    return;
  }

  // Special handling for boolean results, converting them to "Yes" or "No" strings.
  if (typeof finalOutput === 'boolean') {
    formattedOutput = finalOutput ? 'Yes' : 'No';
  } else if (finalOutput instanceof BigInt) {
    // Ensure BigInts are converted to string for console output.
    formattedOutput = finalOutput.toString();
  }
  else {
    // Default case: use the output as is.
    formattedOutput = finalOutput;
  }
  console.log(formattedOutput);
};

// Execute the main processing logic.
const appProcessor = new ArithmeticExpressionProcessor();
displayResult(appProcessor.processAllCombinations());