'use strict'; // Enforce strict mode for cleaner code.

/**
 * Main application logic processor.
 * This class encapsulates the primary algorithm to solve the problem.
 */
class Processor {
  /**
   * Executes the core problem-solving algorithm.
   * @returns {number} The calculated minimum value.
   */
  processData() {
    // Read the number of elements from input.
    const count = inputHandler.getNextInt();
    // Read the next line, convert it to an array of characters,
    // and map '#' to 1 and other characters (presumably '.') to 0.
    const charSequence = Array.from(inputHandler.getNextLine()).map(
      (element) => (element === '#') ? 0b1 : 0x0
    );

    // Flag to determine if leading non-'#' characters should be skipped.
    let shouldSkip = true;
    // Array to store the sequence after skipping leading non-'#' characters.
    const trimmedLeft = [];

    // Iterate through the character sequence.
    for (let idx = 0; idx < count; ++idx) {
      // If a '#' (represented as 1) is encountered, stop skipping.
      if (charSequence[idx] === 0b1) {
        shouldSkip = false;
      }
      // If still skipping, continue to the next iteration.
      if (shouldSkip) {
        continue;
      }
      // Add the current element to the trimmed array.
      trimmedLeft.push(charSequence[idx]);
    }

    // Determine the effective length by trimming trailing non-'#' characters.
    let effectiveLength = trimmedLeft.length;
    // Iterate backwards from the end of the trimmedLeft array.
    for (let idx = trimmedLeft.length - 1; idx >= 0; --idx) {
      // If a '.' (represented as 0) is encountered, stop trimming.
      if (trimmedLeft[idx] === 0x0) {
        break;
      }
      // Update the effective length to the current index.
      effectiveLength = idx;
    }

    // Create the final segment by slicing the trimmedLeft array.
    const finalSegment = trimmedLeft.slice(0, effectiveLength);

    // Count the number of 1s (hashes) in the final segment.
    const onesCount = finalSegment.filter((element) => element === 0b1).length;
    // Count the number of 0s (dots) in the final segment.
    const zerosCount = finalSegment.filter((element) => element === 0x0).length;

    // Return the minimum of the counts of 1s and 0s.
    return Math.min(onesCount, zerosCount);
  }
}

/**
 * Provides modular arithmetic operations.
 * This class is designed for calculations involving a specific modulus.
 */
class ModularArithmetic {
  /**
   * Constructs a new ModularArithmetic instance.
   * @param {number} modulus - The modulus for all operations.
   */
  constructor(modulus) {
    // If modulus is not provided, use a default (though not defined here,
    // it implies an external constant or a default value).
    if (modulus == null) {
      modulus = Combinatorics.DefaultMod; // This constant is not defined in the original snippet.
    }
    this.modulusValue = modulus;
  }

  /**
   * Performs modular multiplication (a * b) % modulus.
   * @param {number} operandA - The first operand.
   * @param {number} operandB - The second operand.
   * @returns {number} The result of (operandA * operandB) % modulus.
   */
  multiplyMod(operandA, operandB) {
    let result = 0;
    operandA %= this.modulusValue;
    operandB %= this.modulusValue;

    // Binary multiplication method to prevent overflow.
    while (operandB) {
      if (operandB & 0b1) { // If the last bit of operandB is 1.
        result += operandA;
        if (result >= this.modulusValue) { // Check for overflow and reduce.
          result -= this.modulusValue;
        }
      }
      operandA <<= 0b1; // Left shift operandA (multiply by 2).
      if (operandA >= this.modulusValue) { // Check for overflow and reduce.
        operandA -= this.modulusValue;
      }
      operandB >>= 0b1; // Right shift operandB (divide by 2).
    }
    return result;
  }

  /**
   * Performs modular exponentiation (a^b) % modulus.
   * @param {number} base - The base.
   * @param {number} exponent - The exponent.
   * @returns {number} The result of (base^exponent) % modulus.
   */
  powerMod(base, exponent) {
    let result = 0b1; // Initialize result to 1.
    while (exponent) {
      if (exponent & 0b1) { // If the last bit of exponent is 1.
        result = this.multiplyMod(result, base);
      }
      base = this.multiplyMod(base, base); // Square the base.
      exponent >>= 0b1; // Divide exponent by 2.
    }
    return result;
  }

  /**
   * Performs modular division (a / b) % modulus using Fermat's Little Theorem.
   * Requires modulus to be a prime number.
   * @param {number} numerator - The numerator.
   * @param {number} denominator - The denominator.
   * @returns {number} The result of (numerator * b^(modulus-2)) % modulus.
   */
  divideMod(numerator, denominator) {
    // a / b = a * b^(mod-2) (mod mod)
    return this.multiplyMod(numerator, this.powerMod(denominator, this.modulusValue - 0b1));
  }

  /**
   * Calculates modular combinations (nCk) % modulus.
   * Requires precomputed factorial and inverse factorial tables.
   * @param {number} n - Total number of items.
   * @param {number} k - Number of items to choose.
   * @returns {number} The result of (nCk) % modulus.
   */
  combinationsMod(n, k) {
    // nCk = n! / (k! * (n-k)!) = n! * (k!)^(-1) * ((n-k)!)^(-1) (mod mod)
    return MOD_CALCULATOR.multiplyMod(
      factorialTable[n],
      MOD_CALCULATOR.multiplyMod(inverseFactorialTable[k], inverseFactorialTable[n - k])
    );
  }
}
// Global instance for modular arithmetic with a specific prime modulus.
const MOD_CALCULATOR = new ModularArithmetic(998244353);

/**
 * A collection of general utility functions, similar to a simplified Underscore.js.
 */
class UtilityFunctions {
  /**
   * Calculates the sum of all elements in an array.
   * @param {Array<number>} inputArray - The array of numbers.
   * @returns {number} The sum of the array elements.
   */
  calculateSum(inputArray) {
    return inputArray.reduce((accumulator, currentValue) => accumulator + currentValue);
  }

  /**
   * Calculates the sum of array elements modulo a given modulus.
   * @param {Array<number>} inputArray - The array of numbers.
   * @param {number} [modulus] - The modulus to use. Defaults to MOD_CALCULATOR.modulusValue.
   * @returns {number} The modular sum.
   */
  calculateModSum(inputArray, modulus) {
    if (modulus == null) {
      modulus = MOD_CALCULATOR.modulusValue;
    }
    return inputArray.reduce((accumulator, currentValue) => (accumulator + currentValue) % modulus);
  }

  /**
   * Finds the minimum element in an array based on a comparison function.
   * @param {Array<any>} inputArray - The array to search.
   * @param {Function} [comparisonFunc] - A function (a, b) => number, similar to Array.prototype.sort.
   * @returns {any} The minimum element.
   */
  findMinimum(inputArray, comparisonFunc) {
    if (comparisonFunc == null) {
      comparisonFunc = (a, b) => a - b;
    }
    return inputArray.reduce((accumulator, currentValue) =>
      comparisonFunc(accumulator, currentValue) < 0 ? accumulator : currentValue
    );
  }

  /**
   * Finds the maximum element in an array based on a comparison function.
   * @param {Array<any>} inputArray - The array to search.
   * @param {Function} [comparisonFunc] - A function (a, b) => number, similar to Array.prototype.sort.
   * @returns {any} The maximum element.
   */
  findMaximum(inputArray, comparisonFunc) {
    if (comparisonFunc == null) {
      comparisonFunc = (a, b) => a - b;
    }
    return inputArray.reduce((accumulator, currentValue) =>
      comparisonFunc(accumulator, currentValue) > 0 ? accumulator : currentValue
    );
  }

  /**
   * Sorts an array in place using an optional comparison function.
   * @param {Array<any>} inputArray - The array to sort.
   * @param {Function} [comparisonFunc] - A function (a, b) => number.
   * @returns {Array<any>} The sorted array.
   */
  sortArray(inputArray, comparisonFunc) {
    if (comparisonFunc == null) {
      comparisonFunc = (a, b) => a - b;
    }
    return inputArray.sort(comparisonFunc);
  }

  /**
   * Returns an array with unique elements. Modifies the original array by sorting it.
   * @param {Array<any>} inputArray - The array to process.
   * @returns {Array<any>} An array containing only unique elements.
   */
  getUniqueElements(inputArray) {
    inputArray.sort(); // Sort the array first to group duplicates.
    for (let indexCounter = 0; indexCounter < inputArray.length - 0b1; ++indexCounter) {
      // If current element is same as next, mark current as null.
      inputArray[indexCounter] =
        inputArray[indexCounter + 0b1] === inputArray[indexCounter] ? void 0 : inputArray[indexCounter];
    }
    // Filter out the nulls (marked duplicates).
    return inputArray.filter((element) => element !== void 0);
  }

  /**
   * Generates an array of numbers within a specified range.
   * @param {number} rangeStart - The starting value of the range.
   * @param {number} [rangeEnd] - The ending value of the range (exclusive).
   * @param {number} [rangeStep] - The step increment/decrement.
   * @returns {Array<number>} An array of numbers in the specified range.
   */
  generateRange(rangeStart, rangeEnd, rangeStep) {
    if (rangeEnd == null) {
      rangeEnd = rangeStart || 0x0;
      rangeStart = 0x0;
    }
    if (!rangeStep) {
      rangeStep = rangeEnd < rangeStart ? -0b1 : 0b1;
    }
    const rangeLength = Math.max(Math.ceil((rangeEnd - rangeStart) / rangeStep), 0x0);
    const generatedRange = Array(rangeLength);
    for (var indexCounter = 0x0; indexCounter < rangeLength; indexCounter++, rangeStart += rangeStep) {
      generatedRange[indexCounter] = rangeStart;
    }
    return generatedRange;
  }

  /**
   * Gets the first N elements of an array, or the first element if N is not specified.
   * @param {Array<any>} targetArray - The array to extract from.
   * @param {number} [numElements] - The number of elements to take from the beginning.
   * @returns {any|Array<any>} The first element or an array of first N elements.
   */
  getFirstElements(targetArray, numElements) {
    if (targetArray == null || targetArray.length < 0b1)
      return numElements == null ? void 0 : [];
    if (numElements == null) return targetArray[0x0];
    return this.getInitialElements(targetArray, targetArray.length - numElements);
  }

  /**
   * Gets all but the last N elements of an array, or all but the last element if N is not specified.
   * @param {Array<any>} targetArray - The array to extract from.
   * @param {number} [numElements] - The number of elements to exclude from the end.
   * @returns {Array<any>} An array containing the initial elements.
   */
  getInitialElements(targetArray, numElements) {
    return targetArray.slice.call(
      targetArray,
      0x0,
      Math.max(0x0, targetArray.length - (numElements == null ? 0b1 : numElements))
    );
  }

  /**
   * Gets the last N elements of an array, or all but the first element if N is not specified.
   * @param {Array<any>} targetArray - The array to extract from.
   * @param {number} [numElements] - The number of elements to exclude from the beginning.
   * @returns {Array<any>} An array containing the tail elements.
   */
  getTailElements(targetArray, numElements) {
    return targetArray.slice.call(targetArray, numElements == null ? 0b1 : numElements);
  }

  /**
   * Gets the last N elements of an array, or the last element if N is not specified.
   * @param {Array<any>} targetArray - The array to extract from.
   * @param {number} [numElements] - The number of elements to take from the end.
   * @returns {any|Array<any>} The last element or an array of last N elements.
   */
  getLastElements(targetArray, numElements) {
    if (numElements == null) return targetArray[targetArray.length - 0b1];
    return this.getTailElements(targetArray, Math.max(0x0, targetArray.length - numElements));
  }

  /**
   * Calculates the cumulative sum of an array.
   * @param {Array<number>} inputArray - The array of numbers.
   * @returns {Array<number>} An array where each element is the sum of all preceding elements plus itself.
   */
  getCumulativeSums(inputArray) {
    // The initial [0] is for the first element's sum to be just itself.
    return this.getTailElements(
      inputArray.reduce(
        (accumulator, currentValue, index) => {
          accumulator.push(currentValue + accumulator[index]);
          return accumulator;
        },
        [0x0]
      )
    );
  }

  /**
   * Calculates the differences between adjacent elements in an array.
   * @param {Array<number>} inputArray - The array of numbers.
   * @returns {Array<number>} An array of differences.
   */
  getDifferences(inputArray) {
    const diffs = [];
    for (let indexCounter = 0b1; indexCounter < inputArray.length; ++indexCounter) {
      diffs.push(inputArray[indexCounter] - inputArray[indexCounter - 0b1]);
    }
    return diffs;
  }

  /**
   * Performs a binary search on a sorted array to find the index of the largest element
   * less than or equal to the search key, or the insertion point.
   * @param {Array<any>} targetArray - The sorted array.
   * @param {any} searchKey - The value to search for.
   * @param {string} [iteratorProperty] - The property name to use for comparison if elements are objects.
   * @returns {number} The index where the key would be inserted to maintain order.
   */
  performBinarySearch(targetArray, searchKey, iteratorProperty) {
    // Helper function to get the value for comparison.
    const iteratorFn = (currentObject) =>
      typeof currentObject === 'object' ? currentObject[iteratorProperty] : currentObject;

    const searchValue = iteratorFn(searchKey);
    let lowerBound = 0x0,
      upperBound = targetArray.length;

    while (lowerBound < upperBound) {
      let middleIndex = Math.floor((lowerBound + upperBound) / 0b10); // Integer division by 2.
      if (iteratorFn(targetArray[middleIndex]) < searchValue) {
        lowerBound = middleIndex + 0b1;
      } else {
        upperBound = middleIndex;
      }
    }
    return lowerBound;
  }
}
// Global instance for utility functions.
const _UTIL = new UtilityFunctions();

/**
 * Handles reading input from stdin.
 */
class InputReader {
  /**
   * Initializes the InputReader and reads all input.
   */
  constructor() {
    this.readCursor = 0x0; // Pointer to the current line being read.
    this.readAllInput(); // Read all input data upon instantiation.
  }

  /**
   * Reads all lines from standard input and stores them.
   * @returns {Array<string>} An array of input lines.
   */
  readAllInput() {
    // Use Node.js 'fs' module to read from /dev/stdin.
    this.inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');
    return this.inputLines;
  }

  /**
   * Reads one or multiple lines from the input.
   * @param {number} [numLines] - The number of lines to read.
   * @returns {string|Array<string>} A single line or an array of lines.
   */
  getNextLine(numLines) {
    if (numLines) {
      const resultLines = this.inputLines.slice(this.readCursor, this.readCursor + numLines);
      this.readCursor += numLines;
      return resultLines;
    }
    return this.inputLines[this.readCursor++];
  }

  /**
   * Reads the next line and parses it as an integer.
   * @returns {number} The parsed integer.
   */
  getNextInt() {
    return parseInt(this.getNextLine(), 0b10); // Base 10 for parsing.
  }

  /**
   * Reads the next line, splits it by space, and returns an array of strings.
   * @returns {Array<string>} An array of strings.
   */
  getNextStringArray() {
    return this.getNextLine().split(' ');
  }

  /**
   * Reads the next line, splits it by space, and parses elements as integers.
   * @returns {Array<number>} An array of integers.
   */
  getNextIntArray() {
    return this.getNextStringArray().map((element) => parseInt(element, 0b10));
  }

  /**
   * Reads the next line, splits it by space, and parses elements as floats.
   * @returns {Array<number>} An array of floating-point numbers.
   */
  getNextFloatArray() {
    return this.getNextStringArray().map((element) => parseFloat(element));
  }

  /**
   * Reads multiple lines and parses each as an integer.
   * @param {number} numLines - The number of lines to read.
   * @returns {Array<number>} An array of integers.
   */
  getNextIntLines(numLines) {
    return this.getNextLine(numLines).map((element) => parseInt(element, 0b10));
  }

  /**
   * Reads multiple lines and parses each as a float.
   * @param {number} numLines - The number of lines to read.
   * @returns {Array<number>} An array of floating-point numbers.
   */
  getNextFloatLines(numLines) {
    return this.getNextLine(numLines).map((element) => parseFloat(element));
  }

  /**
   * Reads multiple lines, splits each by space, and returns a 2D array of strings.
   * @param {number} numLines - The number of lines to read.
   * @returns {Array<Array<string>>} A 2D array of strings.
   */
  getNextStringMatrix(numLines) {
    return this.getNextLine(numLines).map((currentLine) => currentLine.split(' '));
  }

  /**
   * Reads multiple lines, splits each by space, and parses elements as integers, returning a 2D array.
   * @param {number} numLines - The number of lines to read.
   * @returns {Array<Array<number>>} A 2D array of integers.
   */
  getNextIntMatrix(numLines) {
    return this.getNextLine(numLines).map((currentLine) =>
      currentLine.split(' ').map((element) => parseInt(element, 0b10))
    );
  }

  /**
   * Reads multiple lines, splits each by space, and parses elements as floats, returning a 2D array.
   * @param {number} numLines - The number of lines to read.
   * @returns {Array<Array<number>>} A 2D array of floating-point numbers.
   */
  getNextFloatMatrix(numLines) {
    return this.getNextLine(numLines).map((currentLine) =>
      currentLine.split(' ').map((element) => parseFloat(element))
    );
  }
}
// Global instance for input handling.
const inputHandler = new InputReader();

/**
 * Handles writing output to stdout.
 */
class OutputWriter {
  /**
   * Initializes the OutputWriter with default boolean options.
   */
  constructor() {
    this.booleanOptions = {
      'true': 'Yes',
      'false': 'No',
    };
  }

  /**
   * Prints a value to the console, handling boolean conversions.
   * @param {any} valueToPrint - The value to be printed.
   */
  printOutput(valueToPrint) {
    let formattedOutput;
    if (valueToPrint == null) return; // Do nothing if output is null or undefined.

    if (valueToPrint === true) {
      formattedOutput = this.booleanOptions['true'];
    } else if (valueToPrint === false) {
      formattedOutput = this.booleanOptions['false'];
    } else {
      formattedOutput = valueToPrint;
    }
    console.log(formattedOutput); // Use console.log for output.
  }

  /**
   * Sets custom string representations for true/false boolean output.
   * @param {Array<string>} optionsArray - An array where optionsArray[0] is for false, optionsArray[1] for true.
   * @returns {OutputWriter} The current instance for chaining.
   */
  setBooleanOptions(optionsArray) {
    this.booleanOptions['false'] = optionsArray[0x0];
    this.booleanOptions['true'] = optionsArray[0b1];
    return this; // Allow method chaining.
  }
}
// Global instance for output handling.
const outputHandler = new OutputWriter();

// Execute the main processing logic and print the result.
outputHandler.printOutput(new Processor().processData());
