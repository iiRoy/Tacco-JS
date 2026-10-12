'use strict'; // Enforce strict mode for cleaner code practices.

/**
 * The primary class responsible for solving the problem.
 * It reads input, processes it, and determines the final result.
 */
class Processor {
  /**
   * Executes the main algorithm to find the solution.
   * This method orchestrates the data processing steps.
   * @returns {number} The calculated result based on the input sequence.
   */
  processData() {
    // Read the total count of elements from the input.
    const count = dataInput.getNextInt();
    // Read the sequence of integers.
    const sequence = dataInput.getNextIntArray();

    // Initialize an array to store the "folded" sums of the sequence.
    // The size is half the sequence length, rounded down.
    const foldedSequence = [];
    for (let idx = 0; idx < sequence.length >> 1; ++idx) {
      foldedSequence[idx] = 0;
    }

    // Populate the folded sequence by summing elements from symmetric positions.
    // For an element at index 'idx', it's added to the position
    // min(idx, sequence.length - 1 - idx) in the folded sequence.
    for (let idx = 0; idx < count; ++idx) {
      foldedSequence[Math.min(idx, sequence.length - 1 - idx)] += sequence[idx];
    }

    // If the original sequence has an odd number of elements,
    // the middle element was added to itself in the last position of foldedSequence.
    // This problem's logic implies we should remove this middle element's contribution
    // if the sequence length is odd, as it's not part of a pair.
    // The original code `halfSeq.pop()` effectively removes the last element
    // which corresponds to the middle element's sum if `n` is odd.
    if (count % 2) {
      foldedSequence.pop();
    }

    // Calculate the total sum of the elements in the folded sequence.
    // This variable is declared but not used in the final return,
    // indicating it might have been part of an earlier iteration or debugging.
    const totalFoldedSum = _util.getCumulativeSums(foldedSequence); // This actually returns cumulative sums, not a single sum.
                                                                    // The original code uses `_.sumArray` which is `getCumulativeSums`.
                                                                    // The variable name `halfSum` suggests a single sum, but the method returns an array.
                                                                    // This is a subtle point, but the behavior must be preserved.
                                                                    // The variable `halfSum` is not used later, so its exact value/type doesn't affect the final result.

    let resultValue = 0; // Initialize the maximum sub-sum found.

    // Outer loop iterates up to half the original sequence length.
    // This loop explores different starting points for the sub-sequences.
    for (let outerLoopVar = 0; outerLoopVar < count / 2; ++outerLoopVar) {
      // Inner loop iterates for possible step sizes.
      // `stepSize` must be less than `outerLoopVar`.
      // This condition `j < a` means the inner loop might not run if `a` is 0 or 1.
      for (let stepSize = 1; stepSize < outerLoopVar; ++stepSize) {
        let maxSubSum = 0; // Maximum sum for the current stepSize.
        let currentSubSum = 0; // Current running sum for the sub-sequence.

        // Innermost loop iterates through the folded sequence with the current stepSize.
        // It calculates the sum of elements at `k`, `k+stepSize`, `k+2*stepSize`, etc.
        for (let subIdx = 0; subIdx < foldedSequence.length; subIdx += stepSize) {
          currentSubSum += foldedSequence[subIdx];
          // Update the maximum sub-sum found for this stepSize.
          maxSubSum = Math.max(maxSubSum, currentSubSum);
        }
        // Update the overall maximum result.
        resultValue = Math.max(resultValue, maxSubSum);
      }
    }
    // Return the final maximum sub-sum found.
    return resultValue;
  }
}

/**
 * Provides modular arithmetic operations.
 * Useful for problems involving large numbers where results need to be kept within a specific modulus.
 */
class ModularArithmetic {
  /**
   * Constructs a new ModularArithmetic instance.
   * @param {number} [moduloVal] - The modulus to use for operations. Defaults to Combinatorics.DefaultMod if not provided.
   */
  constructor(moduloVal) {
    // If no modulus is provided, use a default from a (presumably external) Combinatorics class.
    // Since Combinatorics is not defined here, this implies an external dependency or a placeholder.
    // We preserve the original behavior.
    if (moduloVal == null) {
      moduloVal = Combinatorics.DefaultMod;
    }
    this.moduloVal = moduloVal;
  }

  /**
   * Performs modular multiplication (a * b) % moduloVal.
   * Uses a binary multiplication method to prevent overflow with large numbers.
   * @param {number} a - The first operand.
   * @param {number} b - The second operand.
   * @returns {number} The result of (a * b) % moduloVal.
   */
  multiplyMod(a, b) {
    let result = 0;
    a %= this.moduloVal;
    b %= this.moduloVal;
    while (b) {
      if (b & 1) { // If b is odd
        result += a;
        if (result >= this.moduloVal) {
          result -= this.moduloVal;
        }
      }
      a <<= 1; // Multiply a by 2
      if (a >= this.moduloVal) {
        a -= this.moduloVal;
      }
      b >>= 1; // Divide b by 2
    }
    return result;
  }

  /**
   * Performs modular exponentiation (a^b) % moduloVal.
   * Uses the method of exponentiation by squaring.
   * @param {number} base - The base.
   * @param {number} exponent - The exponent.
   * @returns {number} The result of (base^exponent) % moduloVal.
   */
  powerMod(base, exponent) {
    let result = 1;
    while (exponent) {
      if (exponent & 1) { // If exponent is odd
        result = this.multiplyMod(result, base);
      }
      base = this.multiplyMod(base, base); // Square the base
      exponent >>= 1; // Halve the exponent
    }
    return result;
  }

  /**
   * Performs modular division (a / b) % moduloVal.
   * This is equivalent to (a * b^(moduloVal-2)) % moduloVal,
   * using Fermat's Little Theorem for modular inverse.
   * @param {number} numerator - The numerator.
   * @param {number} denominator - The denominator.
   * @returns {number} The result of (numerator / denominator) % moduloVal.
   */
  divideMod(numerator, denominator) {
    // Calculate modular inverse of denominator using powerMod.
    // Note: MOD_CALCULATOR is used here, implying this method might be called statically or from another instance.
    // The original code uses `MOD.mult` and `this.pow`. This is a slight inconsistency in the original.
    // To preserve behavior, I will use `this.multiplyMod` and `this.powerMod`.
    return this.multiplyMod(numerator, this.powerMod(denominator, this.moduloVal - 2));
  }

  /**
   * Calculates combinations (n choose k) modulo moduloVal.
   * Requires precomputed factorial and inverse factorial tables.
   * @param {number} n - Total number of items.
   * @param {number} k - Number of items to choose.
   * @returns {number} The result of (n choose k) % moduloVal.
   */
  combinationsMod(n, k) {
    // `factTable` and `invFactTable` are assumed to be globally available or pre-initialized.
    // They are not defined within this class or file, so they are treated as external.
    return MOD_CALCULATOR.multiplyMod(factTable[n], MOD_CALCULATOR.multiplyMod(invFactTable[k], invFactTable[n - k]));
  }
}
// Instantiate the modular arithmetic calculator with a common prime modulus.
const MOD_CALCULATOR = new ModularArithmetic(1e9 + 7);

/**
 * A collection of utility functions, similar to a simplified Underscore.js or Lodash.
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
   * Calculates the sum of array elements modulo a given value.
   * @param {Array<number>} inputArray - The array of numbers.
   * @param {number} [moduloVal] - The modulus. Defaults to MOD_CALCULATOR.moduloVal.
   * @returns {number} The modular sum of the array elements.
   */
  calculateModSum(inputArray, moduloVal) {
    if (moduloVal == null) {
      moduloVal = MOD_CALCULATOR.moduloVal;
    }
    return inputArray.reduce((accumulator, currentValue) => (accumulator + currentValue) % moduloVal);
  }

  /**
   * Finds the minimum element in an array.
   * @param {Array<any>} inputArray - The array to search.
   * @param {Function} [comparisonFunction] - An optional comparison function (like Array.prototype.sort).
   * @returns {any} The minimum element.
   */
  findMinimum(inputArray, comparisonFunction) {
    if (comparisonFunction == null) {
      comparisonFunction = (a, b) => a - b;
    }
    return inputArray.reduce((a, b) => comparisonFunction(a, b) < 0 ? a : b);
  }

  /**
   * Finds the maximum element in an array.
   * @param {Array<any>} inputArray - The array to search.
   * @param {Function} [comparisonFunction] - An optional comparison function (like Array.prototype.sort).
   * @returns {any} The maximum element.
   */
  findMaximum(inputArray, comparisonFunction) {
    if (comparisonFunction == null) {
      comparisonFunction = (a, b) => a - b;
    }
    return inputArray.reduce((a, b) => comparisonFunction(a, b) > 0 ? a : b);
  }

  /**
   * Sorts an array in place.
   * @param {Array<any>} inputArray - The array to sort.
   * @param {Function} [comparisonFunction] - An optional comparison function.
   * @returns {Array<any>} The sorted array.
   */
  sortArray(inputArray, comparisonFunction) {
    if (comparisonFunction == null) {
      comparisonFunction = (a, b) => a - b;
    }
    return inputArray.sort(comparisonFunction);
  }

  /**
   * Returns a new array containing only the unique elements from the input array.
   * The input array is modified during the process (sorted and nullified).
   * @param {Array<any>} inputArray - The array to process.
   * @returns {Array<any>} An array with unique elements.
   */
  getUniqueElements(inputArray) {
    inputArray.sort(); // Sort to bring duplicates together.
    for (let indexCounter = 0; indexCounter < inputArray.length - 1; ++indexCounter) {
      // Mark duplicates as null.
      inputArray[indexCounter] = inputArray[indexCounter + 1] === inputArray[indexCounter] ? null : inputArray[indexCounter];
    }
    // Filter out the nulls.
    return inputArray.filter(element => element != null);
  }

  /**
   * Generates an array of numbers within a specified range.
   * @param {number} rangeStart - The starting value of the range.
   * @param {number} [rangeStop] - The ending value of the range (exclusive). If null, `rangeStart` becomes `rangeStop` and `rangeStart` becomes 0.
   * @param {number} [rangeStep] - The increment/decrement step. Defaults to 1 or -1 based on `rangeStart` and `rangeStop`.
   * @returns {Array<number>} An array of numbers in the specified range.
   */
  generateRange(rangeStart, rangeStop, rangeStep) {
    if (rangeStop == null) {
      rangeStop = rangeStart || 0;
      rangeStart = 0;
    }
    if (!rangeStep) {
      rangeStep = rangeStop < rangeStart ? -1 : 1;
    }
    const arrayLength = Math.max(Math.ceil((rangeStop - rangeStart) / rangeStep), 0);
    const rangeArray = Array(arrayLength);
    for (var indexCounter = 0; indexCounter < arrayLength; indexCounter++, rangeStart += rangeStep) {
      rangeArray[indexCounter] = rangeStart;
    }
    return rangeArray;
  }

  /**
   * Retrieves the first N elements of an array, or just the first element if N is not specified.
   * @param {Array<any>} targetArray - The array to extract from.
   * @param {number} [numElements] - The number of elements to retrieve from the beginning.
   * @returns {any|Array<any>} The first element or an array of the first N elements.
   */
  getFirstElements(targetArray, numElements) {
    if (targetArray == null || targetArray.length < 1) return numElements == null ? void 0 : [];
    if (numElements == null) return targetArray[0];
    return this.getInitialElements(targetArray, targetArray.length - numElements);
  }

  /**
   * Retrieves all but the last N elements of an array, or all but the last element if N is not specified.
   * @param {Array<any>} targetArray - The array to extract from.
   * @param {number} [numElements] - The number of elements to exclude from the end.
   * @returns {Array<any>} A new array containing the initial elements.
   */
  getInitialElements(targetArray, numElements) {
    return targetArray.slice.call(targetArray, 0, Math.max(0, targetArray.length - (numElements == null ? 1 : numElements)));
  }

  /**
   * Retrieves all but the first N elements of an array, or all but the first element if N is not specified.
   * @param {Array<any>} targetArray - The array to extract from.
   * @param {number} [numElements] - The number of elements to exclude from the beginning.
   * @returns {Array<any>} A new array containing the tail elements.
   */
  getTailElements(targetArray, numElements) {
    return targetArray.slice.call(targetArray, numElements == null ? 1 : numElements);
  }

  /**
   * Retrieves the last N elements of an array, or just the last element if N is not specified.
   * @param {Array<any>} targetArray - The array to extract from.
   * @param {number} [numElements] - The number of elements to retrieve from the end.
   * @returns {any|Array<any>} The last element or an array of the last N elements.
   */
  getLastElements(targetArray, numElements) {
    if (numElements == null) return targetArray[targetArray.length - 1];
    return this.getTailElements(targetArray, Math.max(0, targetArray.length - numElements));
  }

  /**
   * Calculates the cumulative sums (prefix sums) of an array.
   * The returned array will have the same length as the input, where each element
   * is the sum of all preceding elements in the input array up to that index.
   * @param {Array<number>} inputArray - The array of numbers.
   * @returns {Array<number>} An array of cumulative sums.
   */
  getCumulativeSums(inputArray) {
    // The original `sumArray` implementation returns `this.tail(...)` of the reduce result.
    // The `reduce` starts with `[0]` and pushes `b + a[i]`.
    // So, `[0, arr[0], arr[0]+arr[1], ...]`.
    // `this.tail` then removes the first element (the initial 0).
    // This effectively computes prefix sums where the first element is `arr[0]`,
    // the second is `arr[0]+arr[1]`, etc.
    return this.getTailElements(inputArray.reduce(((accumulator, currentValue, index) => {
      accumulator.push(currentValue + accumulator[index]);
      return accumulator;
    }), [0]));
  }

  /**
   * Calculates the differences between adjacent elements in an array.
   * @param {Array<number>} inputArray - The array of numbers.
   * @returns {Array<number>} An array of differences (inputArray[i] - inputArray[i-1]).
   */
  getDifferences(inputArray) {
    const differences = [];
    for (let indexCounter = 1; indexCounter < inputArray.length; ++indexCounter) {
      differences.push(inputArray[indexCounter] - inputArray[indexCounter - 1]);
    }
    return differences;
  }

  /**
   * Performs a binary search on a sorted array to find the index where `key` would be inserted
   * to maintain sorted order, or the index of the first element greater than or equal to `key`.
   * @param {Array<any>} targetArray - The sorted array to search within.
   * @param {any} searchKey - The value to search for.
   * @param {string} [iteratorProperty] - If `targetArray` contains objects, the property name to compare.
   * @returns {number} The insertion index (or index of first element >= key).
   */
  performBinarySearch(targetArray, searchKey, iteratorProperty) {
    // Helper function to get the comparable value from an object or primitive.
    const iteratorFunction = (objectItem) => (typeof objectItem === 'object') ? objectItem[iteratorProperty] : objectItem;
    const searchValue = iteratorFunction(searchKey); // Get the value to compare against.

    let lowIndex = 0;
    let highIndex = targetArray.length; // `highIndex` is exclusive.

    // Standard binary search loop.
    while (lowIndex < highIndex) {
      let middleIndex = Math.floor((lowIndex + highIndex) / 2);
      if (iteratorFunction(targetArray[middleIndex]) < searchValue) {
        lowIndex = middleIndex + 1; // Search in the right half.
      } else {
        highIndex = middleIndex; // Search in the left half (or `middleIndex` is the answer).
      }
    }
    return lowIndex; // `lowIndex` is the first index where element >= searchValue.
  }
}
// Instantiate the utility functions object.
const _util = new UtilityFunctions();

/**
 * Handles reading input from stdin.
 * Provides various methods to parse different input formats.
 */
class InputHandler {
  /**
   * Initializes the InputHandler by reading all input from stdin.
   */
  constructor() {
    this.readCursor = 0; // Pointer to the current line being read.
    this.readAllInput(); // Load all input data.
  }

  /**
   * Reads all data from standard input and splits it into an array of lines.
   * @returns {Array<string>} An array where each element is a line from stdin.
   */
  readAllInput() {
    // Use Node.js 'fs' module to read from /dev/stdin.
    this.inputLines = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');
    return this.inputLines;
  }

  /**
   * Retrieves one or more lines from the input data.
   * @param {number} [numLines] - The number of lines to retrieve. If not provided, retrieves one line.
   * @returns {string|Array<string>} A single line string or an array of line strings.
   */
  getNextLine(numLines) {
    if (numLines) {
      const retrievedLines = this.inputLines.slice(this.readCursor, this.readCursor + numLines);
      this.readCursor += numLines;
      return retrievedLines;
    }
    return this.inputLines[this.readCursor++];
  }

  /**
   * Retrieves the next line and parses it as an integer.
   * @returns {number} The parsed integer.
   */
  getNextInt() {
    return parseInt(this.getNextLine());
  }

  /**
   * Retrieves the next line, splits it by spaces, and returns an array of strings.
   * @returns {Array<string>} An array of strings from the next line.
   */
  getNextStringArray() {
    return this.getNextLine().split(' ');
  }

  /**
   * Retrieves the next line, splits it by spaces, and parses each part as an integer.
   * @returns {Array<number>} An array of integers from the next line.
   */
  getNextIntArray() {
    return this.getNextStringArray().map((element) => parseInt(element));
  }

  /**
   * Retrieves the next line, splits it by spaces, and parses each part as a float.
   * @returns {Array<number>} An array of floating-point numbers from the next line.
   */
  getNextFloatArray() {
    return this.getNextStringArray().map((element) => parseFloat(element));
  }

  /**
   * Retrieves N lines and parses each as an integer.
   * @param {number} numLines - The number of lines to retrieve.
   * @returns {Array<number>} An array of integers, one for each line.
   */
  getNextIntLines(numLines) {
    return this.getNextLine(numLines).map((element) => parseInt(element));
  }

  /**
   * Retrieves N lines and parses each as a float.
   * @param {number} numLines - The number of lines to retrieve.
   * @returns {Array<number>} An array of floating-point numbers, one for each line.
   */
  getNextFloatLines(numLines) {
    return this.getNextLine(numLines).map((element) => parseFloat(element));
  }

  /**
   * Retrieves N lines, splits each by spaces, and returns a 2D array of strings.
   * @param {number} numLines - The number of lines to retrieve.
   * @returns {Array<Array<string>>} A 2D array of strings.
   */
  getNextStringMatrix(numLines) {
    return this.getNextLine(numLines).map((currentLine) => currentLine.split(' '));
  }

  /**
   * Retrieves N lines, splits each by spaces, and parses each part as an integer, returning a 2D array.
   * @param {number} numLines - The number of lines to retrieve.
   * @returns {Array<Array<number>>} A 2D array of integers.
   */
  getNextIntMatrix(numLines) {
    return this.getNextLine(numLines).map((currentLine) => currentLine.split(' ').map((element) => parseInt(element)));
  }

  /**
   * Retrieves N lines, splits each by spaces, and parses each part as a float, returning a 2D array.
   * @param {number} numLines - The number of lines to retrieve.
   * @returns {Array<Array<number>>} A 2D array of floating-point numbers.
   */
  getNextFloatMatrix(numLines) {
    return this.getNextLine(numLines).map((currentLine) => currentLine.split(' ').map((element) => parseFloat(element)));
  }
}
// Instantiate the input handler to make it globally accessible.
const dataInput = new InputHandler();

/**
 * Handles writing output to stdout.
 * Provides options for custom boolean string representations.
 */
class OutputWriter {
  /**
   * Initializes the OutputWriter with default boolean string options.
   */
  constructor() {
    this.booleanOptions = {
      'true': 'Yes',
      'false': 'No',
    };
  }

  /**
   * Writes a value to the console. Handles special formatting for booleans.
   * @param {any} valueToPrint - The value to be printed.
   */
  printOutput(valueToPrint) {
    let formattedOutput;
    if (valueToPrint == null) return; // Do nothing if the value is null or undefined.

    if (valueToPrint === true) {
      formattedOutput = this.booleanOptions['true'];
    } else if (valueToPrint === false) {
      formattedOutput = this.booleanOptions['false'];
    } else {
      formattedOutput = valueToPrint; // For other types, print as is.
    }
    console.log(formattedOutput); // Use console.log for standard output.
  }

  /**
   * Sets custom string representations for boolean true/false values.
   * @param {Array<string>} options - An array where options[0] is for false, options[1] for true.
   * @returns {OutputWriter} Returns `this` for method chaining.
   */
  setBooleanOptions(options) {
    this.booleanOptions['false'] = options[0];
    this.booleanOptions['true'] = options[1];
    return this;
  }
}
// Instantiate the output writer.
const outputStream = new OutputWriter();

// Execute the main program logic.
// Create a new instance of the Processor class and call its processData method.
// The result is then passed to the outputStream to be printed.
outputStream.printOutput(new Processor().processData());
