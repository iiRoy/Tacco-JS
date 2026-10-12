'use strict'; // Enforce strict mode for cleaner code execution

/**
 * Main class responsible for solving the problem.
 * This class encapsulates the primary logic for processing input and generating the final result.
 */
class ProblemSolver {
  /**
   * Executes the core algorithm to solve the problem.
   * @returns {number} The calculated result based on the input data.
   */
  processInput() {
    // Read the number of elements from the input.
    const countElements = dataReader.readNextInt();
    // Read 'n' pairs of integers, where each pair is an array [a, b].
    const pairList = dataReader.readIntMatrix(countElements);

    // Check if all pairs have identical first and second elements.
    // If 'a' equals 'b' for every pair, the result is 0.
    if (pairList.every(item => item[0] === item[1])) {
      return 0;
    }

    // Filter out pairs where the first element is greater than the second.
    const greaterPairs = pairList.filter(item => item[0] > item[1]);

    // Calculate the sum of all first elements from all pairs.
    const totalSumOfFirstElements = utilityFunctions.calculateSum(pairList.map(item => item[0]));

    // If there are no pairs where the first element is greater than the second,
    // it implies a specific condition for the problem, returning 0.
    // Otherwise, find the minimum of the second elements from the 'greaterPairs'.
    const minimumSecondElement = greaterPairs.length === 0 ? 0 : utilityFunctions.findMinimum(greaterPairs.map(item => item[1]));

    // The final result is the total sum of first elements minus the minimum second element found.
    return totalSumOfFirstElements - minimumSecondElement;
  }
}

/**
 * Provides modular arithmetic operations.
 * Useful for problems involving large numbers where results need to be kept within a specific modulus.
 */
class ModularArithmetic {
  /**
   * Constructs a new ModularArithmetic instance.
   * @param {number} [modulusValue] - The modulus to use for all operations. Defaults to a predefined value if not provided.
   */
  constructor(modulusValue) {
    // If no modulus is specified, use a default value (e.g., from a Combinatorics class, though not defined here).
    // For this problem, it's typically 1e9 + 7.
    if (modulusValue == null) {
      modulusValue = 1000000007; // Default modulus value
    }
    this.modulusValue = modulusValue;
  }

  /**
   * Performs modular multiplication of two numbers.
   * @param {number} operandA - The first number.
   * @param {number} operandB - The second number.
   * @returns {number} The result of (operandA * operandB) % modulusValue.
   */
  multiplyMod(operandA, operandB) {
    let resultVal = 0;
    operandA %= this.modulusValue;
    operandB %= this.modulusValue;

    // Standard binary multiplication algorithm to prevent overflow before modulo.
    while (operandB) {
      if (operandB & 1) { // If the last bit of operandB is 1
        resultVal += operandA;
        if (resultVal >= this.modulusValue) { // Ensure result stays within modulus
          resultVal -= this.modulusValue;
        }
      }
      operandA <<= 1; // Double operandA
      if (operandA >= this.modulusValue) { // Ensure operandA stays within modulus
        operandA -= this.modulusValue;
      }
      operandB >>= 1; // Halve operandB
    }
    return resultVal;
  }

  /**
   * Calculates (operandA ^ exponentB) % modulusValue using modular exponentiation (binary exponentiation).
   * @param {number} operandA - The base.
   * @param {number} exponentB - The exponent.
   * @returns {number} The result of (operandA ^ exponentB) % modulusValue.
   */
  powerMod(operandA, exponentB) {
    let resultVal = 1;
    while (exponentB) {
      if (exponentB & 1) { // If exponentB is odd
        resultVal = this.multiplyMod(resultVal, operandA);
      }
      operandA = this.multiplyMod(operandA, operandA); // Square the base
      exponentB >>= 1; // Halve the exponent
    }
    return resultVal;
  }

  /**
   * Performs modular division (operandA / operandB) % modulusValue.
   * This is equivalent to (operandA * (operandB ^ (modulusValue - 2))) % modulusValue
   * by Fermat's Little Theorem, assuming modulusValue is prime.
   * @param {number} operandA - The numerator.
   * @param {number} operandB - The denominator.
   * @returns {number} The result of (operandA / operandB) % modulusValue.
   */
  divideMod(operandA, operandB) {
    // Calculate modular inverse of operandB using powerMod.
    const inverseB = this.powerMod(operandB, this.modulusValue - 2);
    return this.multiplyMod(operandA, inverseB);
  }

  /**
   * Calculates nCk (n choose k) modulo modulusValue.
   * Requires precomputed factorial and inverse factorial tables.
   * NOTE: `factTable` and `invFactTable` are not defined in this scope.
   * This method would typically rely on external precomputed arrays.
   * @param {number} n - Total number of items.
   * @param {number} k - Number of items to choose.
   * @returns {number} (nCk) % modulusValue.
   */
  combinationsMod(n, k) {
    // This assumes `factTable` and `invFactTable` are globally available or passed.
    // For a complete solution, these would need to be precomputed up to 'n'.
    // Example: MOD_CALCULATOR.multiplyMod(factTable[n], MOD_CALCULATOR.multiplyMod(invFactTable[k], invFactTable[n - k]));
    return 0; // Placeholder as tables are not defined.
  }
}
// Instantiate the modular arithmetic calculator with a common prime modulus.
const MOD_CALCULATOR = new ModularArithmetic(1000000007);

/**
 * A collection of common utility functions, similar to a simplified Lodash or Underscore.js.
 */
class UtilityHelpers {
  /**
   * Calculates the sum of all elements in an array.
   * @param {Array<number>} inputArray - The array of numbers.
   * @returns {number} The sum of the array elements.
   */
  calculateSum(inputArray) {
    return inputArray.reduce((valA, valB) => valA + valB);
  }

  /**
   * Calculates the sum of array elements modulo a given value.
   * @param {Array<number>} inputArray - The array of numbers.
   * @param {number} [modulus] - The modulus value. Defaults to MOD_CALCULATOR.modulusValue if not provided.
   * @returns {number} The modular sum of the array elements.
   */
  calculateModSum(inputArray, modulus) {
    if (modulus == null) {
      modulus = MOD_CALCULATOR.modulusValue;
    }
    return inputArray.reduce((valA, valB) => (valA + valB) % modulus);
  }

  /**
   * Finds the minimum element in an array.
   * @param {Array<any>} inputArray - The array to search.
   * @param {Function} [comparisonFunc] - An optional comparison function (a, b) => a - b.
   * @returns {any} The minimum element.
   */
  findMinimum(inputArray, comparisonFunc) {
    if (comparisonFunc == null) {
      comparisonFunc = (valA, valB) => valA - valB;
    }
    return inputArray.reduce((valA, valB) => comparisonFunc(valA, valB) < 0 ? valA : valB);
  }

  /**
   * Finds the maximum element in an array.
   * @param {Array<any>} inputArray - The array to search.
   * @param {Function} [comparisonFunc] - An optional comparison function (a, b) => a - b.
   * @returns {any} The maximum element.
   */
  findMaximum(inputArray, comparisonFunc) {
    if (comparisonFunc == null) {
      comparisonFunc = (valA, valB) => valA - valB;
    }
    return inputArray.reduce((valA, valB) => comparisonFunc(valA, valB) > 0 ? valA : valB);
  }

  /**
   * Sorts an array in place.
   * @param {Array<any>} inputArray - The array to sort.
   * @param {Function} [comparisonFunc] - An optional comparison function (a, b) => a - b.
   * @returns {Array<any>} The sorted array.
   */
  sortArray(inputArray, comparisonFunc) {
    if (comparisonFunc == null) {
      comparisonFunc = (valA, valB) => valA - valB;
    }
    return inputArray.sort(comparisonFunc);
  }

  /**
   * Returns a new array containing only the unique elements from the input array.
   * The input array is modified (sorted) internally.
   * @param {Array<any>} inputArray - The array to process.
   * @returns {Array<any>} An array with unique elements.
   */
  getUniqueElements(inputArray) {
    inputArray.sort(); // Sort to group identical elements
    for (let i = 0; i < inputArray.length - 1; ++i) {
      // Mark duplicates as null
      inputArray[i] = inputArray[i + 1] === inputArray[i] ? null : inputArray[i];
    }
    return inputArray.filter(element => element != null); // Filter out nulls
  }

  /**
   * Generates an array of numbers within a specified range.
   * @param {number} rangeStart - The starting value of the range.
   * @param {number} [rangeEnd] - The ending value of the range (exclusive). If not provided, rangeStart becomes rangeEnd and start is 0.
   * @param {number} [rangeStep] - The step increment/decrement. Defaults to 1 or -1 based on start/end.
   * @returns {Array<number>} An array of numbers in the specified range.
   */
  generateRange(rangeStart, rangeEnd, rangeStep) {
    if (rangeEnd == null) {
      rangeEnd = rangeStart || 0;
      rangeStart = 0;
    }
    if (!rangeStep) {
      rangeStep = rangeEnd < rangeStart ? -1 : 1;
    }
    const rangeLength = Math.max(Math.ceil((rangeEnd - rangeStart) / rangeStep), 0);
    const generatedRange = Array(rangeLength);
    for (let currentIndex = 0; currentIndex < rangeLength; currentIndex++, rangeStart += rangeStep) {
      generatedRange[currentIndex] = rangeStart;
    }
    return generatedRange;
  }

  /**
   * Retrieves the first 'numElements' elements of an array, or the first element if 'numElements' is not specified.
   * @param {Array<any>} targetArray - The array to extract from.
   * @param {number} [numElements] - The number of elements to retrieve from the beginning.
   * @returns {any|Array<any>} The first element or an array of the first 'numElements' elements.
   */
  getFirstElements(targetArray, numElements) {
    if (targetArray == null || targetArray.length < 1) return numElements == null ? undefined : [];
    if (numElements == null) return targetArray[0];
    return this.getInitialElements(targetArray, targetArray.length - numElements);
  }

  /**
   * Retrieves all but the last 'numElements' elements of an array.
   * @param {Array<any>} targetArray - The array to extract from.
   * @param {number} [numElements] - The number of elements to exclude from the end. Defaults to 1.
   * @returns {Array<any>} An array containing the initial elements.
   */
  getInitialElements(targetArray, numElements) {
    return targetArray.slice(0, Math.max(0, targetArray.length - (numElements == null ? 1 : numElements)));
  }

  /**
   * Retrieves all but the first 'numElements' elements of an array.
   * @param {Array<any>} targetArray - The array to extract from.
   * @param {number} [numElements] - The number of elements to exclude from the beginning. Defaults to 1.
   * @returns {Array<any>} An array containing the tail elements.
   */
  getTailElements(targetArray, numElements) {
    return targetArray.slice(numElements == null ? 1 : numElements);
  }

  /**
   * Retrieves the last 'numElements' elements of an array, or the last element if 'numElements' is not specified.
   * @param {Array<any>} targetArray - The array to extract from.
   * @param {number} [numElements] - The number of elements to retrieve from the end.
   * @returns {any|Array<any>} The last element or an array of the last 'numElements' elements.
   */
  getLastElements(targetArray, numElements) {
    if (numElements == null) return targetArray[targetArray.length - 1];
    return this.getTailElements(targetArray, Math.max(0, targetArray.length - numElements));
  }

  /**
   * Calculates the prefix sums (cumulative sums) of an array.
   * The first element of the result array is the first element of the input array,
   * the second is the sum of the first two, and so on.
   * @param {Array<number>} inputArray - The array of numbers.
   * @returns {Array<number>} An array of prefix sums.
   */
  getPrefixSums(inputArray) {
    // The reduce function starts with [0] to handle the initial sum correctly.
    // The tail function then removes this initial 0 if it's not desired as part of the prefix sums.
    return this.getTailElements(inputArray.reduce(((accumulator, currentVal, index) => {
      accumulator.push(currentVal + accumulator[index]);
      return accumulator;
    }), [0]));
  }

  /**
   * Calculates the differences between adjacent elements in an array.
   * @param {Array<number>} inputArray - The array of numbers.
   * @returns {Array<number>} An array of differences (arr[i] - arr[i-1]).
   */
  getDifferences(inputArray) {
    const diffs = [];
    for (let i = 1; i < inputArray.length; ++i) {
      diffs.push(inputArray[i] - inputArray[i - 1]);
    }
    return diffs;
  }

  /**
   * Performs a binary search on a sorted array to find the index where `searchValue` would be inserted
   * to maintain sorted order, or the index of the first element greater than or equal to `searchValue`.
   * @param {Array<any>} targetArray - The sorted array to search.
   * @param {any} searchValue - The value to search for.
   * @param {string} [propertyAccessor] - If elements are objects, the property name to compare.
   * @returns {number} The insertion point (index).
   */
  performBinarySearch(targetArray, searchValue, propertyAccessor) {
    // Helper function to get the value for comparison, either directly or from an object property.
    const accessorFn = (itemObject) => (typeof itemObject === 'object' && propertyAccessor != null) ? itemObject[propertyAccessor] : itemObject;
    const targetValue = accessorFn(searchValue);

    let lowIndex = 0,
      highIndex = targetArray.length;
    while (lowIndex < highIndex) {
      let midIndex = Math.floor((lowIndex + highIndex) / 2);
      if (accessorFn(targetArray[midIndex]) < targetValue) {
        lowIndex = midIndex + 1;
      } else {
        highIndex = midIndex;
      }
    }
    return lowIndex;
  }
}
// Instantiate the utility helper functions.
const utilityFunctions = new UtilityHelpers();

/**
 * Handles reading input from standard input.
 * Provides methods to parse various data types from lines of input.
 */
class DataReader {
  /**
   * Initializes the DataReader, setting the cursor and loading all input data.
   */
  constructor() {
    this.readCursor = 0; // Tracks the current line being read.
    this.loadAllData(); // Loads all input from stdin.
  }

  /**
   * Reads all data from `/dev/stdin` and splits it into an array of lines.
   * @returns {Array<string>} An array where each element is a line from the input.
   */
  loadAllData() {
    // Node.js specific: reads from standard input.
    this.rawDataLines = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');
    return this.rawDataLines;
  }

  /**
   * Reads one or multiple lines from the input.
   * @param {number} [lineCount] - The number of lines to read. If not provided, reads a single line.
   * @returns {string|Array<string>} A single line string or an array of line strings.
   */
  readNextLine(lineCount) {
    if (lineCount) {
      const resultLines = this.rawDataLines.slice(this.readCursor, this.readCursor + lineCount);
      this.readCursor += lineCount;
      return resultLines;
    }
    return this.rawDataLines[this.readCursor++];
  }

  /**
   * Reads the next line and parses it as an integer.
   * @returns {number} The parsed integer.
   */
  readNextInt() {
    return parseInt(this.readNextLine(), 10);
  }

  /**
   * Reads the next line, splits it by space, and returns an array of strings.
   * @returns {Array<string>} An array of strings from the line.
   */
  readNextStringArray() {
    return this.readNextLine().split(' ');
  }

  /**
   * Reads the next line, splits it by space, and parses each part as an integer.
   * @returns {Array<number>} An array of integers from the line.
   */
  readNextIntArray() {
    return this.readNextStringArray().map((elementStr) => parseInt(elementStr, 10));
  }

  /**
   * Reads the next line, splits it by space, and parses each part as a float.
   * @returns {Array<number>} An array of floating-point numbers from the line.
   */
  readNextFloatArray() {
    return this.readNextStringArray().map((elementStr) => parseFloat(elementStr));
  }

  /**
   * Reads 'lineCount' lines and parses each as an integer.
   * @param {number} lineCount - The number of lines to read.
   * @returns {Array<number>} An array of integers, one for each line.
   */
  readIntLines(lineCount) {
    return this.readNextLine(lineCount).map((currentLine) => parseInt(currentLine, 10));
  }

  /**
   * Reads 'lineCount' lines and parses each as a float.
   * @param {number} lineCount - The number of lines to read.
   * @returns {Array<number>} An array of floating-point numbers, one for each line.
   */
  readFloatLines(lineCount) {
    return this.readNextLine(lineCount).map((currentLine) => parseFloat(currentLine));
  }

  /**
   * Reads 'lineCount' lines, splits each by space, and returns a 2D array of strings.
   * @param {number} lineCount - The number of lines to read.
   * @returns {Array<Array<string>>} A 2D array of strings.
   */
  readStringMatrix(lineCount) {
    return this.readNextLine(lineCount).map((currentLine) => currentLine.split(' '));
  }

  /**
   * Reads 'lineCount' lines, splits each by space, and parses each part as an integer,
   * returning a 2D array of integers.
   * @param {number} lineCount - The number of lines to read.
   * @returns {Array<Array<number>>} A 2D array of integers.
   */
  readIntMatrix(lineCount) {
    return this.readNextLine(lineCount).map((currentLine) => currentLine.split(' ').map((elementStr) => parseInt(elementStr, 10)));
  }

  /**
   * Reads 'lineCount' lines, splits each by space, and parses each part as a float,
   * returning a 2D array of floats.
   * @param {number} lineCount - The number of lines to read.
   * @returns {Array<Array<number>>} A 2D array of floating-point numbers.
   */
  readFloatMatrix(lineCount) {
    return this.readNextLine(lineCount).map((currentLine) => currentLine.split(' ').map((elementStr) => parseFloat(elementStr)));
  }
}
// Instantiate the data reader to load input.
const dataReader = new DataReader();

/**
 * Handles writing output to standard output (console).
 * Provides options for custom boolean string representations.
 */
class OutputWriter {
  /**
   * Initializes the OutputWriter with default boolean string representations.
   */
  constructor() {
    this.booleanOptions = {
      'true': 'Yes',
      'false': 'No',
    };
  }

  /**
   * Writes the given data to the console.
   * Handles special cases for boolean values based on `booleanOptions`.
   * @param {any} dataToDisplay - The data to be written.
   */
  displayOutput(dataToDisplay) {
    let formattedOutput;
    if (dataToDisplay == null) return; // Do nothing if output is null or undefined.

    if (dataToDisplay === true) {
      formattedOutput = this.booleanOptions['true'];
    } else if (dataToDisplay === false) {
      formattedOutput = this.booleanOptions['false'];
    } else {
      formattedOutput = dataToDisplay;
    }
    console.log(formattedOutput);
  }

  /**
   * Sets custom string representations for true and false boolean values.
   * @param {Array<string>} option - An array where option[0] is for false and option[1] is for true.
   * @returns {OutputWriter} The current OutputWriter instance for chaining.
   */
  setBooleanOptions(option) {
    this.booleanOptions['false'] = option[0];
    this.booleanOptions['true'] = option[1];
    return this;
  }
}
// Instantiate the output handler.
const outputHandler = new OutputWriter();

// Execute the main problem-solving logic and display its result.
outputHandler.displayOutput(new ProblemSolver().processInput());
