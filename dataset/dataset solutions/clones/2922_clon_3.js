'use strict'

// Core processing logic for the given problem
class DataProcessor {
  /**
   * Executes the primary algorithm to find the maximum segment sum.
   * @returns {number} The computed maximum segment sum.
   */
  execute() {
    // Read the total count of elements from standard input.
    const elementCount = ioManager.fetchNextInteger();
    // Read the sequence of numbers as an array.
    const valueSequence = ioManager.fetchNextIntegerArray();

    // Early exit for trivial cases.
    if (elementCount < 1) {
      return 0;
    }

    // Determine the size for the symmetrically combined sums array.
    // If elementCount is odd, the middle element contributes to its own unique position
    // which is then potentially removed, so the initial size should accommodate it.
    const combinedSumsLength = Math.ceil(elementCount / 2);
    // Initialize an array to store sums of symmetrically positioned elements.
    // E.g., for [a,b,c,d,e], it combines (a+e), (b+d), and c.
    // For [a,b,c,d], it combines (a+d), (b+c).
    const symmetricSums = new Array(combinedSumsLength).fill(0);

    // Populate the symmetricSums array.
    // Each element in the original sequence is added to its symmetric counterpart's sum.
    // Math.min(idx, elementCount - 1 - idx) ensures elements are mirrored from both ends.
    for (let currentIdx = 0; currentIdx < elementCount; ++currentIdx) {
      const targetIndex = Math.min(currentIdx, elementCount - 1 - currentIdx);
      symmetricSums[targetIndex] += valueSequence[currentIdx];
    }

    // If the original element count was odd, the middle element (at combinedSumsLength - 1)
    // was added to symmetricSums. The original algorithm then removes this.
    // This effectively ensures symmetricSums always has Math.floor(elementCount / 2) elements.
    if (elementCount % 2 !== 0) {
      symmetricSums.pop(); // Remove the middle element's sum if n is odd.
    }

    // Initialize the variable to hold the highest segment sum found.
    let maximalSegmentResult = 0;

    // Iterate through possible starting points for segments in the symmetricSums array.
    // The loop runs up to half the original element count, as symmetricSums effectively represents half.
    for (let currentStartPos = 0; currentStartPos < elementCount / 2; ++currentStartPos) {
      // Iterate through possible step sizes (j in original code).
      // A step size of 0 is invalid, so start from 1.
      // The step size must be less than the current starting position for meaningful segments.
      for (let segmentStep = 1; segmentStep < currentStartPos; ++segmentStep) {
        // Guard against invalid step sizes, though `segmentStep` starts at 1.
        if (segmentStep === 0) continue;

        let currentSegmentTotal = 0;
        let highestSegmentTotal = 0;

        // Calculate segment sums using the current step size.
        // This resembles finding the maximum subarray sum (Kadane's algorithm variant)
        // over elements picked at regular intervals.
        for (let segmentIndex = 0; segmentIndex < symmetricSums.length; segmentIndex += segmentStep) {
          currentSegmentTotal += symmetricSums[segmentIndex];
          // Update the highest segment total found within this specific step size and starting point.
          highestSegmentTotal = Math.max(highestSegmentTotal, currentSegmentTotal);
          // Reset segment total if it becomes negative, as negative contributions are detrimental.
          if (currentSegmentTotal < 0) {
            currentSegmentTotal = 0;
          }
        }
        // Update the overall maximal result with the highest found for this segment configuration.
        maximalSegmentResult = Math.max(maximalSegmentResult, highestSegmentTotal);
      }
    }
    // Return the final maximum segment sum.
    return maximalSegmentResult;
  }
}

// Handles modular arithmetic operations.
class ModularArithmetic {
  /**
   * Initializes the ModularArithmetic instance with a specified modulus.
   * @param {number} [moduloValue=1000000007] The modulus to use for calculations.
   */
  constructor(moduloValue = 1000000007) {
    this.currentMod = moduloValue;
  }

  /**
   * Performs modular multiplication of two numbers.
   * Assumes inputs `num1` and `num2` are within `[0, this.currentMod - 1]`
   * or will be reduced by modulo internally.
   * @param {number} num1 - The first operand.
   * @param {number} num2 - The second operand.
   * @returns {number} The result of (num1 * num2) % this.currentMod.
   */
  multiplyMod(num1, num2) {
    // For typical competitive programming moduli (e.g., 1e9+7),
    // direct multiplication (num1 * num2) fits within JavaScript's
    // safe integer limit (2^53 - 1) before taking modulo,
    // assuming num1, num2 are also within the modulus.
    // If intermediate products could exceed MAX_SAFE_INTEGER,
    // a binary multiplication method (like in the original code)
    // or BigInt would be necessary.
    return (Number(num1) * Number(num2)) % this.currentMod;
  }

  /**
   * Computes (base ^ exponent) % this.currentMod using binary exponentiation.
   * @param {number} base - The base number.
   * @param {number} exponent - The exponent.
   * @returns {number} The result of (base ^ exponent) % this.currentMod.
   */
  powerMod(base, exponent) {
    let result = 1;
    let b = base % this.currentMod; // Ensure base is within mod range
    let exp = exponent;

    while (exp > 0) {
      if (exp % 2 === 1) { // If exponent is odd
        result = this.multiplyMod(result, b);
      }
      b = this.multiplyMod(b, b); // Square the base
      exp = Math.floor(exp / 2); // Halve the exponent
    }
    return result;
  }

  /**
   * Computes (numerator / denominator) % this.currentMod using modular inverse.
   * Requires this.currentMod to be a prime number.
   * @param {number} numerator - The numerator.
   * @param {number} denominator - The denominator.
   * @returns {number} The result of (numerator * denominator^-1) % this.currentMod.
   */
  divideMod(numerator, denominator) {
    // Modular inverse is denominator^(mod-2) for prime moduli (Fermat's Little Theorem)
    const invDenominator = this.powerMod(denominator, this.currentMod - 2);
    return this.multiplyMod(numerator, invDenominator);
  }

  // Placeholder for combinations; requires precomputed factorials and inverse factorials.
  // Not used in the main solve function, so can be simplified or adjusted.
  // combinationsMod(n, k) {
  //   // Assuming global factorial tables are available
  //   return GLOBAL_MODULUS_HANDLER.multiplyMod(factTable[n], GLOBAL_MODULUS_HANDLER.multiplyMod(invFactTable[k], invFactTable[n - k]));
  // }
}
// Global instance for modular arithmetic, typically used in competitive programming.
const GLOBAL_MODULUS_HANDLER = new ModularArithmetic(1000000007); // 1e9 + 7

// A collection of general utility functions, similar to Lodash/Underscore.
class UtilityToolkit {
  /**
   * Calculates the sum of all elements in an array.
   * @param {number[]} numberArray - The array of numbers.
   * @returns {number} The total sum.
   */
  calculateSum(numberArray) {
    if (!Array.isArray(numberArray) || numberArray.length === 0) return 0;
    return numberArray.reduce((acc, val) => acc + val, 0);
  }

  /**
   * Calculates the sum of all elements in an array, applying a modulus.
   * @param {number[]} numberArray - The array of numbers.
   * @param {number} [modVal] - The modulus to apply. Defaults to GLOBAL_MODULUS_HANDLER.currentMod.
   * @returns {number} The modular sum.
   */
  calculateModSum(numberArray, modVal = GLOBAL_MODULUS_HANDLER.currentMod) {
    if (!Array.isArray(numberArray) || numberArray.length === 0) return 0;
    return numberArray.reduce((acc, val) => (acc + val) % modVal, 0);
  }

  /**
   * Finds the minimum element in an array.
   * @param {number[]} numberArray - The array of numbers.
   * @param {function(a, b): number} [comparisonFunc=(a, b) => a - b] - Custom comparison function.
   * @returns {number|undefined} The minimum element, or undefined if array is empty.
   */
  findMinimum(numberArray, comparisonFunc = (a, b) => a - b) {
    if (!Array.isArray(numberArray) || numberArray.length === 0) return undefined;
    return numberArray.reduce((minVal, currentVal) => comparisonFunc(minVal, currentVal) < 0 ? minVal : currentVal);
  }

  /**
   * Finds the maximum element in an array.
   * @param {number[]} numberArray - The array of numbers.
   * @param {function(a, b): number} [comparisonFunc=(a, b) => a - b] - Custom comparison function.
   * @returns {number|undefined} The maximum element, or undefined if array is empty.
   */
  findMaximum(numberArray, comparisonFunc = (a, b) => a - b) {
    if (!Array.isArray(numberArray) || numberArray.length === 0) return undefined;
    return numberArray.reduce((maxVal, currentVal) => comparisonFunc(maxVal, currentVal) > 0 ? maxVal : currentVal);
  }

  /**
   * Sorts an array in place.
   * @param {Array} targetArray - The array to sort.
   * @param {function(a, b): number} [comparisonFunc=(a, b) => a - b] - Custom comparison function.
   * @returns {Array} The sorted array.
   */
  sortArray(targetArray, comparisonFunc = (a, b) => a - b) {
    if (!Array.isArray(targetArray)) return [];
    return targetArray.sort(comparisonFunc);
  }

  /**
   * Returns an array with only unique elements, preserving order if possible (not guaranteed by Set).
   * @param {Array} sourceArray - The input array.
   * @returns {Array} An array containing only unique elements.
   */
  getUniqueElements(sourceArray) {
    if (!Array.isArray(sourceArray)) return [];
    // Using Set for efficient uniqueness, then convert back to array.
    // Note: This does not preserve the original order of first appearance for unique elements.
    return Array.from(new Set(sourceArray));
  }

  /**
   * Generates an array of numbers within a specified range.
   * @param {number} [start=0] - The starting number of the sequence.
   * @param {number} stop - The ending number of the sequence (exclusive).
   * @param {number} [step=1] - The increment or decrement between numbers.
   * @returns {number[]} An array of numbers in the specified range.
   */
  generateRange(start, stop, step) {
    let actualStart = start;
    let actualStop = stop;
    let actualStep = step;

    if (actualStop === undefined) {
      actualStop = actualStart;
      actualStart = 0;
    }
    if (actualStep === undefined) {
      actualStep = actualStop < actualStart ? -1 : 1;
    }

    const rangeLength = Math.max(Math.ceil((actualStop - actualStart) / actualStep), 0);
    return Array.from({
      length: rangeLength
    }, (_, index) => actualStart + (index * actualStep));
  }

  /**
   * Retrieves the first N elements of an array.
   * @param {Array} sourceArray - The array.
   * @param {number} [numElements=1] - The number of elements to retrieve from the beginning.
   * @returns {Array|any} The first element if numElements is 1, otherwise an array of first N elements.
   */
  getFirstElements(sourceArray, numElements = 1) {
    if (!Array.isArray(sourceArray) || sourceArray.length === 0) return numElements === 1 ? undefined : [];
    if (numElements === 1) return sourceArray[0];
    return sourceArray.slice(0, Math.max(0, numElements));
  }

  /**
   * Retrieves the initial elements of an array, excluding the last N.
   * @param {Array} sourceArray - The array.
   * @param {number} [numToExclude=1] - The number of elements to exclude from the end.
   * @returns {Array} An array containing initial elements.
   */
  getInitialElements(sourceArray, numToExclude = 1) {
    if (!Array.isArray(sourceArray)) return [];
    return sourceArray.slice(0, Math.max(0, sourceArray.length - numToExclude));
  }

  /**
   * Retrieves the elements of an array starting from a given index.
   * @param {Array} sourceArray - The array.
   * @param {number} [startIndex=1] - The index from which to start retrieving elements.
   * @returns {Array} An array containing the remaining elements.
   */
  getRemainingElements(sourceArray, startIndex = 1) {
    if (!Array.isArray(sourceArray)) return [];
    return sourceArray.slice(Math.max(0, startIndex));
  }

  /**
   * Retrieves the last N elements of an array.
   * @param {Array} sourceArray - The array.
   * @param {number} [numElements=1] - The number of elements to retrieve from the end.
   * @returns {Array|any} The last element if numElements is 1, otherwise an array of last N elements.
   */
  getLastElements(sourceArray, numElements = 1) {
    if (!Array.isArray(sourceArray) || sourceArray.length === 0) return numElements === 1 ? undefined : [];
    if (numElements === 1) return sourceArray[sourceArray.length - 1];
    return sourceArray.slice(Math.max(0, sourceArray.length - numElements));
  }

  /**
   * Computes a prefix sum array (cumulative sum).
   * The resulting array will have `arr[i]` as the sum of elements from `arr[0]` to `arr[i]`.
   * @param {number[]} dataArray - The input array of numbers.
   * @returns {number[]} The prefix sum array.
   */
  computePrefixSums(dataArray) {
    if (!Array.isArray(dataArray) || dataArray.length === 0) return [];
    const prefixSums = [];
    let currentSum = 0;
    for (let i = 0; i < dataArray.length; ++i) {
      currentSum += dataArray[i];
      prefixSums.push(currentSum);
    }
    return prefixSums;
  }

  /**
   * Computes the difference array, where `diff[i] = arr[i+1] - arr[i]`.
   * @param {number[]} dataArray - The input array of numbers.
   * @returns {number[]} The difference array.
   */
  computeDifferences(dataArray) {
    if (!Array.isArray(dataArray) || dataArray.length < 2) return [];
    const differences = [];
    for (let i = 0; i < dataArray.length - 1; ++i) {
      differences.push(dataArray[i + 1] - dataArray[i]);
    }
    return differences;
  }

  /**
   * Performs a binary search on a sorted array to find the insertion point for a key.
   * Returns the index where the key would be inserted to maintain sorted order,
   * or the index of an existing element if found.
   * @param {Array} sortedArray - The array to search, must be sorted.
   * @param {*} searchKey - The value to search for.
   * @param {string} [propertyKey] - If array elements are objects, the property to compare.
   * @returns {number} The index where the key should be inserted.
   */
  performBinarySearch(sortedArray, searchKey, propertyKey) {
    const valueExtractor = (item) => (typeof item === 'object' && propertyKey) ? item[propertyKey] : item;
    const targetValue = valueExtractor(searchKey);

    let lowerBound = 0;
    let upperBound = sortedArray.length; // Use length as exclusive upper bound

    while (lowerBound < upperBound) {
      const midPoint = Math.floor((lowerBound + upperBound) / 2);
      if (valueExtractor(sortedArray[midPoint]) < targetValue) {
        lowerBound = midPoint + 1;
      } else {
        upperBound = midPoint;
      }
    }
    return lowerBound;
  }
}
// Global instance for utility functions.
const _utility = new UtilityToolkit();

// Manages reading input from standard input.
class InputReader {
  constructor() {
    this.currentLineIndex = 0;
    this.readAllInputData(); // Read all input at once upon instantiation.
  }

  /**
   * Reads all lines from standard input and stores them.
   */
  readAllInputData() {
    // Using `process.stdin.fd` for direct file descriptor access,
    // which is common in competitive programming environments for faster I/O.
    // Fallback to simpler `readFileSync` if `fs` is not directly available or preferred.
    try {
      const fs = require("fs");
      const buffer = fs.readFileSync(0, "utf8"); // Read from stdin (fd 0)
      this.bufferedLines = buffer.split(/\r?\n/).filter(line => line.trim() !== ''); // Handle Windows/Unix newlines & empty lines
    } catch (error) {
      console.error("Failed to read input:", error);
      this.bufferedLines = [];
    }
  }

  /**
   * Fetches one or more lines from the buffered input.
   * @param {number} [count] - The number of lines to fetch. If not provided, fetches one line.
   * @returns {string|string[]} A single line string or an array of line strings.
   */
  fetchNextLine(count) {
    if (count !== undefined) {
      const linesToReturn = this.bufferedLines.slice(this.currentLineIndex, this.currentLineIndex + count);
      this.currentLineIndex += count;
      return linesToReturn;
    }
    if (this.currentLineIndex >= this.bufferedLines.length) {
      return ''; // Return empty string if no more lines.
    }
    return this.bufferedLines[this.currentLineIndex++];
  }

  /**
   * Fetches the next line and parses it as an integer.
   * @returns {number} The parsed integer.
   */
  fetchNextInteger() {
    return Number(this.fetchNextLine());
  }

  /**
   * Fetches the next line, splits it by space, and returns an array of strings.
   * @returns {string[]} An array of strings.
   */
  fetchNextStringArray() {
    return this.fetchNextLine().split(' ');
  }

  /**
   * Fetches the next line, splits it by space, and parses each part as an integer.
   * @returns {number[]} An array of integers.
   */
  fetchNextIntegerArray() {
    return this.fetchNextStringArray().map(Number);
  }

  /**
   * Fetches the next line, splits it by space, and parses each part as a float.
   * @returns {number[]} An array of floats.
   */
  fetchNextFloatArray() {
    return this.fetchNextStringArray().map(parseFloat);
  }

  /**
   * Fetches N lines and parses each as an integer.
   * @param {number} numLines - The number of lines to fetch.
   * @returns {number[]} An array of integers.
   */
  fetchIntegerLines(numLines) {
    return this.fetchNextLine(numLines).map(Number);
  }

  /**
   * Fetches N lines and parses each as a float.
   * @param {number} numLines - The number of lines to fetch.
   * @returns {number[]} An array of floats.
   */
  fetchFloatLines(numLines) {
    return this.fetchNextLine(numLines).map(parseFloat);
  }

  /**
   * Fetches N lines and splits each line into an array of strings.
   * @param {number} numLines - The number of lines to fetch.
   * @returns {string[][]} A 2D array of strings.
   */
  fetchStringMatrix(numLines) {
    return this.fetchNextLine(numLines).map((line) => line.split(' '));
  }

  /**
   * Fetches N lines, splits each line, and parses each part as an integer.
   * @param {number} numLines - The number of lines to fetch.
   * @returns {number[][]} A 2D array of integers.
   */
  fetchIntegerMatrix(numLines) {
    return this.fetchNextLine(numLines).map((line) => line.split(' ').map(Number));
  }

  /**
   * Fetches N lines, splits each line, and parses each part as a float.
   * @param {number} numLines - The number of lines to fetch.
   * @returns {number[][]} A 2D array of floats.
   */
  fetchFloatMatrix(numLines) {
    return this.fetchNextLine(numLines).map((line) => line.split(' ').map(parseFloat));
  }
}
// Global instance for input handling.
const ioManager = new InputReader();

// Manages writing output to standard output.
class OutputWriter {
  constructor() {
    // Default display strings for boolean values.
    this.displayOptions = {
      'true': 'Yes',
      'false': 'No',
      'null': '', // Handle null explicitly
      'undefined': '' // Handle undefined explicitly
    };
  }

  /**
   * Emits the provided data to standard output, with special handling for booleans.
   * @param {*} outputData - The data to be written.
   */
  emitOutput(outputData) {
    let formattedOutput;
    // Check for explicit boolean values first.
    if (outputData === true) {
      formattedOutput = this.displayOptions['true'];
    } else if (outputData === false) {
      formattedOutput = this.displayOptions['false'];
    } else if (outputData === null) {
      formattedOutput = this.displayOptions['null'];
    } else if (outputData === undefined) {
      formattedOutput = this.displayOptions['undefined'];
    } else {
      // For all other types, convert to string.
      formattedOutput = String(outputData);
    }
    // Use process.stdout.write for potentially faster output without implicit newline,
    // then add newline explicitly.
    process.stdout.write(formattedOutput + '\n');
  }

  /**
   * Configures custom display strings for boolean true/false values.
   * @param {string[]} customOptions - An array where customOptions[0] is for false, customOptions[1] for true.
   * @returns {OutputWriter} The current OutputWriter instance for chaining.
   */
  configureBooleanDisplay(customOptions) {
    if (Array.isArray(customOptions) && customOptions.length >= 2) {
      this.displayOptions['false'] = customOptions[0];
      this.displayOptions['true'] = customOptions[1];
    } else {
      console.warn("Invalid boolean display options provided. Expected an array [falseString, trueString].");
    }
    return this; // Enable method chaining.
  }
}
// Global instance for output handling.
const resultPrinter = new OutputWriter();

// The main execution point of the script.
// Creates an instance of the DataProcessor and prints its result.
resultPrinter.emitOutput(new DataProcessor().execute());