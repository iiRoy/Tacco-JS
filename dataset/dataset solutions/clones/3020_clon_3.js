'use strict';

/*
 * Core processing logic for the input challenge.
 * This class orchestrates the steps to derive the final result.
 */
class Processor {
  /**
   * Executes the primary computation sequence.
   * Reads input, transforms it, and performs segment analysis.
   * @returns {number} The minimum count of two distinct elements within a processed segment.
   */
  execute() {
    // Acquire the total count of elements as a numerical value.
    const totalElementCount = dataAcquisitionSystem.fetchInteger();

    // Validate the input count; if zero or negative, no processing is needed.
    if (totalElementCount <= 0) {
        // A trivial case: an empty sequence means no elements to count.
        return 0;
    }

    // Read the next line, split into individual characters, and map them to boolean indicators.
    // '#' is considered a significant marker (true), everything else is a non-marker (false).
    const rawInputSequence = dataAcquisitionSystem.fetchLines()
                                              .split('')
                                              .map(charToken => {
                                                // Using a ternary for concise boolean conversion.
                                                return (charToken === '#') ? true : false;
                                              });

    // Initialize a flag to track if leading non-markers should still be ignored.
    let ignoringInitialNonMarkers = true;
    // This array will hold the sequence after discarding any leading non-marker characters.
    const postInitialTrimmedSegment = [];

    // Iterate through the raw input sequence to perform the initial trimming.
    // This loop identifies the first significant marker and begins collecting elements thereafter.
    for (let idx = 0; idx < totalElementCount; ++idx) {
      // If the current element is a significant marker, we stop ignoring leading non-markers.
      if (rawInputSequence[idx] === true) {
        ignoringInitialNonMarkers = false;
      }

      // If we are still in the phase of ignoring initial non-markers, skip this element.
      if (ignoringInitialNonMarkers) {
        continue; // Proceed to the next element without adding to the segment.
      }
      // Otherwise, add the current element to our interim segment.
      postInitialTrimmedSegment.push(rawInputSequence[idx]);
    }

    // Determine the effective length of the segment after trimming from the beginning.
    let currentEffectiveLength = postInitialTrimmedSegment.length;

    // Perform trimming from the end: find the last significant marker.
    // Iterate backwards from the end of the `postInitialTrimmedSegment`.
    // Any non-markers at the end, after the last significant marker, will be excluded.
    let reverseIndex = postInitialTrimmedSegment.length - 1;
    while (reverseIndex >= 0) {
        // If a non-marker is encountered, it signifies the end of the relevant segment.
        if (postInitialTrimmedSegment[reverseIndex] === false) {
            // The `currentEffectiveLength` should be set to this index, effectively slicing before it.
            currentEffectiveLength = reverseIndex;
            break; // Exit the loop as the boundary has been found.
        }
        // If it's a significant marker, this could be the new end boundary.
        // Continue searching backward.
        currentEffectiveLength = reverseIndex;
        reverseIndex--;
    }

    // Extract the final relevant segment using the determined effective length.
    // This creates a new array containing only the elements between the first and last significant markers.
    const finalAnalyzedPortion = postInitialTrimmedSegment.slice(0, currentEffectiveLength);

    // If the final portion is empty, there's nothing to count.
    if (finalAnalyzedPortion.length === 0) {
        return 0;
    }

    // Count the occurrences of significant markers (true) and non-markers (false) within the final segment.
    let trueCount = 0;
    let falseCount = 0;

    // Using a for...of loop for clear iteration over segment elements.
    for (const element of finalAnalyzedPortion) {
        if (element === true) {
            trueCount++;
        } else {
            falseCount++;
        }
    }

    // Return the smaller of the two counts.
    // Using a ternary operator for brevity instead of Math.min.
    return (trueCount < falseCount) ? trueCount : falseCount;
  }
}

/*
 * Provides modular arithmetic operations.
 * This class supports calculations within a specified modulus.
 */
class ArithmeticModule {
  /**
   * Constructs an ArithmeticModule instance.
   * @param {number} modulusValue - The modulus for all operations. Defaults to a standard prime if not provided.
   */
  constructor(modulusValue) {
    // Ensure a valid modulus is provided or use a default.
    if (modulusValue === null || modulusValue === undefined || modulusValue <= 0) {
      // Default modulus, commonly used in competitive programming.
      this.modulus = 998244353;
    } else {
      this.modulus = modulusValue;
    }
  }

  /**
   * Calculates the modular product of two numbers.
   * Implemented using a binary multiplication method to avoid overflow with large numbers.
   * @param {number} operandA - The first operand.
   * @param {number} operandB - The second operand.
   * @returns {number} The product (operandA * operandB) modulo this.modulus.
   */
  product(operandA, operandB) {
    let resultAccumulator = 0;
    let currentA = operandA % this.modulus;
    let currentB = operandB % this.modulus;

    // Perform multiplication using repeated addition and doubling (Russian peasant multiplication).
    while (currentB > 0) {
      // If the least significant bit of currentB is 1, add currentA to the result.
      if ((currentB & 1) === 1) {
        resultAccumulator = (resultAccumulator + currentA);
        // Ensure result stays within modulus bounds.
        if (resultAccumulator >= this.modulus) {
          resultAccumulator -= this.modulus;
        }
      }
      // Double currentA for the next iteration.
      currentA = (currentA << 1);
      // Ensure currentA stays within modulus bounds.
      if (currentA >= this.modulus) {
        currentA -= this.modulus;
      }
      // Halve currentB, effectively shifting bits to the right.
      currentB = (currentB >> 1);
    }
    return resultAccumulator;
  }

  /**
   * Calculates the modular exponentiation (a^b).
   * Uses binary exponentiation (exponentiation by squaring) for efficiency.
   * @param {number} base - The base number.
   * @param {number} exponent - The exponent.
   * @returns {number} (base^exponent) modulo this.modulus.
   */
  exponentiate(base, exponent) {
    let powerResult = 1;
    let currentBase = base; // Use a mutable variable for the base
    while(exponent > 0) {
      // If the current exponent bit is 1, multiply into the result.
      if ((exponent & 1) === 1) {
        powerResult = this.product(powerResult, currentBase);
      }
      // Square the base for the next iteration.
      currentBase = this.product(currentBase, currentBase);
      // Halve the exponent.
      exponent = (exponent >> 1);
    }
    return powerResult;
  }

  /**
   * Calculates modular division (a / b).
   * Utilizes Fermat's Little Theorem for modular inverse: a/b = a * b^(mod-2) (mod mod).
   * @param {number} numerator - The numerator.
   * @param {number} denominator - The denominator.
   * @returns {number} (numerator / denominator) modulo this.modulus.
   */
  inverseProduct(numerator, denominator) {
    // Assumes modulus is prime for Fermat's Little Theorem.
    // Calculates modular inverse of denominator using exponentiation.
    const inverseDenominator = this.exponentiate(denominator, this.modulus - 2);
    return this.product(numerator, inverseDenominator);
  }

  /*
   * The original 'comb' method was removed as it relied on external, undefined global variables
   * (factTable, invFactTable). This functionality would require additional setup for factorials
   * and inverse factorials, which is outside the scope of the current problem's main logic.
   * It could be re-implemented if combinatorics are needed.
   */
}
// Instantiate the global modular arithmetic engine with a common large prime.
const ComputationContext = new ArithmeticModule(998244353);

/*
 * A collection of utility functions for array and collection manipulation.
 * Mimics some functionalities found in libraries like Underscore.js or Lodash.
 */
class CollectionUtils {
  /**
   * Computes the sum of all numeric elements in an array.
   * @param {Array<number>} numericArray - The array of numbers.
   * @returns {number} The total sum.
   */
  calculateSum(numericArray) {
    // Use reduce for a concise summation.
    return numericArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
  }

  /**
   * Computes the sum of all numeric elements in an array, modulo a given value.
   * @param {Array<number>} numericArray - The array of numbers.
   * @param {number} [modulusValue] - The modulus. Defaults to ComputationContext.modulus if not provided.
   * @returns {number} The modular sum.
   */
  modularSummation(numericArray, modulusValue) {
    // If no specific modulus is given, use the global ComputationContext's modulus.
    const activeModulus = (modulusValue === null || modulusValue === undefined) ? ComputationContext.modulus : modulusValue;
    // Accumulate sum while keeping it within the modulus.
    return numericArray.reduce((acc, val) => (acc + val) % activeModulus, 0);
  }

  /**
   * Finds the minimum element in an array based on a comparison function.
   * @param {Array<any>} sourceArray - The array to search.
   * @param {Function} [comparisonFn] - A function (a, b) => number, returning <0 if a<b, >0 if a>b, 0 if a==b.
   * @returns {any|undefined} The minimum element, or undefined if the array is empty.
   */
  determineMinimum(sourceArray, comparisonFn) {
    // Handle empty array case.
    if (!sourceArray || sourceArray.length === 0) return undefined;
    // Default comparison function for numbers.
    const activeComparison = comparisonFn || ((a, b) => a - b);
    return sourceArray.reduce((minVal, currentVal) => {
      // Use the comparison function to decide.
      return activeComparison(minVal, currentVal) < 0 ? minVal : currentVal;
    });
  }

  /**
   * Finds the maximum element in an array based on a comparison function.
   * @param {Array<any>} sourceArray - The array to search.
   * @param {Function} [comparisonFn] - A function (a, b) => number, returning <0 if a<b, >0 if a>b, 0 if a==b.
   * @returns {any|undefined} The maximum element, or undefined if the array is empty.
   */
  determineMaximum(sourceArray, comparisonFn) {
    // Handle empty array case.
    if (!sourceArray || sourceArray.length === 0) return undefined;
    // Default comparison function for numbers.
    const activeComparison = comparisonFn || ((a, b) => a - b);
    return sourceArray.reduce((maxVal, currentVal) => {
      // Use the comparison function to decide.
      return activeComparison(maxVal, currentVal) > 0 ? maxVal : currentVal;
    });
  }

  /**
   * Sorts an array in-place using an optional comparison function.
   * @param {Array<any>} sourceArray - The array to sort.
   * @param {Function} [comparisonFn] - A function (a, b) => number.
   * @returns {Array<any>} The sorted array (same instance).
   */
  arrangeElements(sourceArray, comparisonFn) {
    // Default comparison function for numbers.
    const activeComparison = comparisonFn || ((a, b) => a - b);
    // Use the native sort method with the provided or default comparator.
    return sourceArray.sort(activeComparison);
  }

  /**
   * Removes duplicate elements from an array, returning a new array with unique elements.
   * Note: This implementation sorts the array internally.
   * @param {Array<any>} sourceArray - The array from which to remove duplicates.
   * @returns {Array<any>} A new array containing only unique elements.
   */
  removeDuplicates(sourceArray) {
    // A more efficient way using Set.
    // Convert to Set to automatically handle uniqueness, then back to Array.
    return Array.from(new Set(sourceArray));
  }

  /**
   * Generates an array of numbers within a specified range.
   * @param {number} startValue - The starting value of the sequence (inclusive).
   * @param {number} [endValue] - The ending value of the sequence (exclusive). If omitted, `startValue` becomes `endValue` and `startValue` defaults to 0.
   * @param {number} [stepValue] - The increment or decrement between numbers. Defaults to 1 or -1 based on `startValue` and `endValue`.
   * @returns {Array<number>} An array containing the generated sequence.
   */
  generateSequence(startValue, endValue, stepValue) {
    let currentStart = startValue;
    let currentEnd = endValue;
    let currentStep = stepValue;

    // Handle flexible argument signature: range(stop) or range(start, stop)
    if (currentEnd === null || currentEnd === undefined) {
      currentEnd = currentStart || 0; // If only one arg, it's 'stop', start defaults to 0.
      currentStart = 0;
    }

    // Determine default step if not provided.
    if (currentStep === null || currentStep === undefined || currentStep === 0) {
      currentStep = (currentEnd > currentStart) ? 1 : -1;
    }

    const sequence = [];
    let current = currentStart;

    // Generate the sequence based on the step direction.
    if (currentStep > 0) {
      while (current < currentEnd) {
        sequence.push(current);
        current += currentStep;
      }
    } else { // stepValue < 0
      while (current > currentEnd) {
        sequence.push(current);
        current += currentStep;
      }
    }
    return sequence;
  }

  /**
   * Retrieves the first element(s) of an array.
   * @param {Array<any>} sourceArray - The array.
   * @param {number} [numElements] - The number of elements to retrieve. If omitted, returns the first element.
   * @returns {any|Array<any>|undefined} The first element, an array of first N elements, or undefined/empty array.
   */
  retrieveFirst(sourceArray, numElements) {
    if (!Array.isArray(sourceArray) || sourceArray.length === 0) {
      return (numElements === null || numElements === undefined) ? undefined : [];
    }
    if (numElements === null || numElements === undefined) {
      return sourceArray[0];
    }
    // Ensure numElements is a positive integer.
    const count = Math.max(0, Math.floor(numElements));
    return sourceArray.slice(0, count);
  }

  /**
   * Retrieves an initial segment of an array, excluding the last N elements.
   * @param {Array<any>} sourceArray - The array.
   * @param {number} [numToExclude] - The number of elements to exclude from the end. Defaults to 1.
   * @returns {Array<any>} A new array with the initial segment.
   */
  getInitialSegment(sourceArray, numToExclude) {
    if (!Array.isArray(sourceArray) || sourceArray.length === 0) {
      return [];
    }
    const excludeCount = Math.max(0, (numToExclude === null || numToExclude === undefined) ? 1 : Math.floor(numToExclude));
    return sourceArray.slice(0, Math.max(0, sourceArray.length - excludeCount));
  }

  /**
   * Retrieves the remaining elements of an array after the first N elements.
   * @param {Array<any>} sourceArray - The array.
   * @param {number} [numToSkip] - The number of elements to skip from the beginning. Defaults to 1.
   * @returns {Array<any>} A new array with the remaining elements.
   */
  getRemainingElements(sourceArray, numToSkip) {
    if (!Array.isArray(sourceArray) || sourceArray.length === 0) {
      return [];
    }
    const skipCount = Math.max(0, (numToSkip === null || numToSkip === undefined) ? 1 : Math.floor(numToSkip));
    return sourceArray.slice(skipCount);
  }

  /**
   * Retrieves the last element(s) of an array.
   * @param {Array<any>} sourceArray - The array.
   * @param {number} [numElements] - The number of elements to retrieve from the end. If omitted, returns the last element.
   * @returns {any|Array<any>|undefined} The last element, an array of last N elements, or undefined/empty array.
   */
  retrieveLast(sourceArray, numElements) {
    if (!Array.isArray(sourceArray) || sourceArray.length === 0) {
      return (numElements === null || numElements === undefined) ? undefined : [];
    }
    if (numElements === null || numElements === undefined) {
      return sourceArray[sourceArray.length - 1];
    }
    const count = Math.max(0, Math.floor(numElements));
    // Use getRemainingElements starting from the calculated index.
    return this.getRemainingElements(sourceArray, Math.max(0, sourceArray.length - count));
  }

  /**
   * Computes the cumulative sum (prefix sum) of an array.
   * @param {Array<number>} numericArray - The array of numbers.
   * @returns {Array<number>} A new array where each element is the sum of all preceding elements plus itself.
   */
  cumulativeSum(numericArray) {
    if (!Array.isArray(numericArray) || numericArray.length === 0) {
      return [];
    }
    const sums = [];
    let runningTotal = 0;
    for (let i = 0; i < numericArray.length; ++i) {
      runningTotal += numericArray[i];
      sums.push(runningTotal);
    }
    return sums;
  }

  /**
   * Computes the difference array (delta array) where each element is the difference
   * between consecutive elements of the input array.
   * @param {Array<number>} numericArray - The input array.
   * @returns {Array<number>} A new array of differences.
   */
  differentialSequence(numericArray) {
    const differences = [];
    if (!Array.isArray(numericArray) || numericArray.length < 2) {
      return differences; // Need at least two elements to calculate a difference.
    }
    for (let i = 1; i < numericArray.length; ++i) {
      differences.push(numericArray[i] - numericArray[i-1]);
    }
    return differences;
  }

  /**
   * Performs a binary search on a sorted array to find the insertion point for a key.
   * Specifically, it finds the index of the first element greater than or equal to the key.
   * @param {Array<any>} sortedArray - The array to search, assumed to be sorted.
   * @param {any} searchKey - The value to search for.
   * @param {string|Function} [accessor] - A property name string or a function to extract the comparable value from array elements/key.
   * @returns {number} The index where the key would be inserted to maintain sorted order (lower bound).
   */
  locateIndex(sortedArray, searchKey, accessor) {
    // Define the function to extract the comparable value.
    const extractValue = (item) => {
      if (typeof accessor === 'string' && item && typeof item === 'object') {
        return item[accessor];
      }
      if (typeof accessor === 'function') {
        return accessor(item);
      }
      return item; // If no accessor or not an object, use the item directly.
    };

    const targetValue = extractValue(searchKey);
    let lowBoundary = 0;
    let highBoundary = sortedArray.length; // Exclusive upper bound

    // Standard binary search loop.
    while (lowBoundary < highBoundary) {
      const midPoint = Math.floor((lowBoundary + highBoundary) / 2);
      // Compare the value at midPoint with the target value.
      if (extractValue(sortedArray[midPoint]) < targetValue) {
        lowBoundary = midPoint + 1; // Search in the upper half.
      } else {
        highBoundary = midPoint; // Search in the lower half (including midPoint).
      }
    }
    return lowBoundary; // This is the insertion point / lower bound.
  }
}
// Instantiate the global utility functions object.
const collectionHelper = new CollectionUtils();

/*
 * Manages input reading from standard input.
 * Provides methods to parse various data types from lines of text.
 */
class DataStream {
  /**
   * Initializes the DataStream by loading all input data.
   */
  constructor() {
    this.currentReadCursor = 0; // Tracks the current line being read.
    this.cachedInputLines = []; // Stores all lines read from stdin.
    this.loadAllData(); // Immediately load all data upon construction.
  }

  /**
   * Reads all available data from standard input and splits it into lines.
   * This method is called once during construction.
   * @returns {Array<string>} An array of strings, where each string is a line from input.
   */
  loadAllData() {
    try {
      // Use Node.js 'fs' module to synchronously read from '/dev/stdin'.
      // This is common in competitive programming environments.
      const rawInputBuffer = require("fs").readFileSync("/dev/stdin", "utf8");
      this.cachedInputLines = rawInputBuffer.split('\n');
      // Remove any trailing empty line if present (common with split('\n')).
      if (this.cachedInputLines[this.cachedInputLines.length - 1] === '') {
        this.cachedInputLines.pop();
      }
    } catch (error) {
      console.error("Error reading input from /dev/stdin:", error.message);
      // In a production scenario, you might throw or handle this more gracefully.
      this.cachedInputLines = [];
    }
    return this.cachedInputLines;
  }

  /**
   * Fetches one or more lines from the input stream.
   * @param {number} [numberOfLines] - The number of lines to fetch. If omitted, fetches a single line.
   * @returns {string|Array<string>} A single line string or an array of line strings.
   */
  fetchLines(numberOfLines) {
    // Basic validation for the number of lines requested.
    if (numberOfLines !== null && numberOfLines !== undefined) {
      const count = Math.max(0, Math.floor(numberOfLines));
      if (count === 0) {
        return []; // Request for 0 lines returns an empty array.
      }
      const startIdx = this.currentReadCursor;
      const endIdx = startIdx + count;
      // Ensure we don't read beyond the available data.
      if (endIdx > this.cachedInputLines.length) {
        console.warn(`Attempted to read ${count} lines, but only ${this.cachedInputLines.length - startIdx} are available.`);
        // Return whatever is available up to the end.
        const availableLines = this.cachedInputLines.slice(startIdx);
        this.currentReadCursor = this.cachedInputLines.length;
        return availableLines;
      }
      const lines = this.cachedInputLines.slice(startIdx, endIdx);
      this.currentReadCursor = endIdx;
      return lines;
    }

    // If no count specified, fetch a single line.
    if (this.currentReadCursor >= this.cachedInputLines.length) {
      console.error("Attempted to read past end of input data.");
      return null; // Or throw an error, depending on desired behavior.
    }
    const singleLine = this.cachedInputLines[this.currentReadCursor];
    this.currentReadCursor++;
    return singleLine;
  }

  /**
   * Fetches a single integer from the next line of input.
   * @returns {number} The parsed integer.
   */
  fetchInteger() {
    // Use radix 10 for parseInt to ensure correct parsing.
    return parseInt(this.fetchLines(), 10);
  }

  /**
   * Fetches the next line and splits it into an array of strings.
   * @returns {Array<string>} An array of strings.
   */
  fetchStringArray() {
    const line = this.fetchLines();
    return line ? line.split(' ') : [];
  }

  /**
   * Fetches the next line, splits it, and parses elements into an array of integers.
   * @returns {Array<number>} An array of integers.
   */
  fetchIntegerArray() {
    return this.fetchStringArray().map((element) => parseInt(element, 10));
  }

  /**
   * Fetches the next line, splits it, and parses elements into an array of floating-point numbers.
   * @returns {Array<number>} An array of floats.
   */
  fetchFloatArray() {
    return this.fetchStringArray().map((element) => parseFloat(element));
  }

  /**
   * Fetches N lines and parses each into an integer.
   * @param {number} N - The number of lines to read.
   * @returns {Array<number>} An array of integers.
   */
  fetchIntegerLines(N) {
    const lines = this.fetchLines(N);
    // Ensure lines is an array before mapping.
    return Array.isArray(lines) ? lines.map((line) => parseInt(line, 10)) : [];
  }

  /**
   * Fetches N lines and parses each into a floating-point number.
   * @param {number} N - The number of lines to read.
   * @returns {Array<number>} An array of floats.
   */
  fetchFloatLines(N) {
    const lines = this.fetchLines(N);
    return Array.isArray(lines) ? lines.map((line) => parseFloat(line)) : [];
  }

  /**
   * Fetches N lines, each split into an array of strings, forming a 2D array.
   * @param {number} N - The number of lines to read.
   * @returns {Array<Array<string>>} A 2D array of strings.
   */
  fetchStringGrid(N) {
    const lines = this.fetchLines(N);
    return Array.isArray(lines) ? lines.map((line) => line.split(' ')) : [];
  }

  /**
   * Fetches N lines, each split and parsed into an array of integers, forming a 2D array.
   * @param {number} N - The number of lines to read.
   * @returns {Array<Array<number>>} A 2D array of integers.
   */
  fetchIntegerGrid(N) {
    const lines = this.fetchLines(N);
    return Array.isArray(lines) ? lines.map((line) => line.split(' ').map((element) => parseInt(element, 10))) : [];
  }

  /**
   * Fetches N lines, each split and parsed into an array of floats, forming a 2D array.
   * @param {number} N - The number of lines to read.
   * @returns {Array<Array<number>>} A 2D array of floats.
   */
  fetchFloatGrid(N) {
    const lines = this.fetchLines(N);
    return Array.isArray(lines) ? lines.map((line) => line.split(' ').map((element) => parseFloat(element))) : [];
  }
}
// Instantiate the global input data handler.
const dataAcquisitionSystem = new DataStream();

/*
 * Handles output formatting and display to the console.
 * Allows custom labels for boolean outputs.
 */
class OutputWriter {
  /**
   * Initializes the OutputWriter with default boolean labels.
   */
  constructor() {
    // Using a Map for flexible boolean label storage.
    this.booleanLabels = new Map();
    this.booleanLabels.set(true, 'Yes');
    this.booleanLabels.set(false, 'No');
  }

  /**
   * Displays the given output to the console, applying special formatting for booleans.
   * @param {any} contentToDisplay - The content to be written. Can be any type.
   */
  displayResult(contentToDisplay) {
    let formattedOutput;

    // Check for null or undefined explicitly.
    if (contentToDisplay === null || contentToDisplay === undefined) {
      // Decide how to handle null/undefined output. For now, simply return.
      // Could also output an empty string or specific message.
      return;
    }

    // Use a switch statement for handling different types of output.
    switch (typeof contentToDisplay) {
      case 'boolean':
        // Retrieve custom label for boolean values.
        formattedOutput = this.booleanLabels.get(contentToDisplay);
        // Fallback to string representation if no custom label is set (shouldn't happen with default).
        if (formattedOutput === undefined) {
          formattedOutput = contentToDisplay.toString();
        }
        break;
      case 'object':
        // For objects (including arrays), convert to JSON string for readable output.
        // This might be overly verbose for simple cases, but robust for complex ones.
        if (Array.isArray(contentToDisplay)) {
            formattedOutput = contentToDisplay.join(' '); // Join array elements with space
        } else {
            formattedOutput = JSON.stringify(contentToDisplay, null, 2); // Pretty print JSON
        }
        break;
      case 'string':
      case 'number':
      default:
        // For primitives, use their direct string representation.
        formattedOutput = contentToDisplay;
        break;
    }
    // Finally, log the formatted output to the console.
    console.log(formattedOutput);
  }

  /**
   * Configures custom string labels for boolean true/false output.
   * @param {Array<string>} customLabels - An array where customLabels[0] is for false, customLabels[1] for true.
   * @returns {OutputWriter} Returns this instance for chaining.
   */
  setBooleanLabels(customLabels) {
    if (!Array.isArray(customLabels) || customLabels.length !== 2) {
      console.error("Boolean labels must be an array of exactly two strings: [falseLabel, trueLabel].");
      return this; // Return without modifying if input is invalid.
    }
    this.booleanLabels.set(false, customLabels[0]);
    this.booleanLabels.set(true, customLabels[1]);
    return this; // Enable method chaining.
  }
}
// Instantiate the global output utility.
const displayUtility = new OutputWriter();

// --- Execution Flow ---
// Create an instance of the main processing class.
const mainProcessorInstance = new Processor();

// Execute the processing logic and capture the result.
const finalOutcome = mainProcessorInstance.execute();

// Display the computed result using the output utility.
displayUtility.displayResult(finalOutcome);