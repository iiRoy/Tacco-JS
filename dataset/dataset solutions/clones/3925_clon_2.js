'use strict'

// This class encapsulates the main problem-solving logic.
class CoreProcessor {
  // Executes the primary algorithm to find the solution.
  execute() {
    // Read the total count of data entries.
    const count = dataFeeder.readInt();
    // Obtain a matrix of integer pairs.
    const pairs = dataFeeder.readIntMatrix(count);

    // Check if all pairs have identical elements; if so, the result is zero.
    if (pairs.every(item => item[0] === item[1])) return 0;

    // Filter for pairs where the first element is strictly greater than the second.
    const greaterPairs = pairs.filter(item => item[0] > item[1]);

    // Calculate the sum of all first elements in the original pairs.
    // Then subtract the minimum second element from the 'greaterPairs' if any exist, otherwise subtract zero.
    return _util.total(pairs.map(item => item[0])) - (greaterPairs.length === 0 ? 0 : _util.minimumValue(pairs.filter(item => item[0] > item[1]).map(item => item[1])));
  }
}

// A utility class for performing arithmetic operations under a specified modulo.
class ModuloCalculator {
  // Static property for a common default modulo value.
  static StandardModulo = 1000000007;

  // Initializes the calculator with a given modulo value.
  constructor(moduloVal) {
    // If no modulo is provided, use a standard default.
    if (moduloVal == null) {
      moduloVal = ModuloCalculator.StandardModulo;
    }
    this.currentModulo = moduloVal; // Store the modulo value.
  }

  // Multiplies two numbers modulo the stored value.
  multiplyMod(operandA, operandB) {
    let result = 0; // Initialize product.
    operandA %= this.currentModulo; // Reduce operandA.
    operandB %= this.currentModulo; // Reduce operandB.

    // Loop while operandB is non-zero.
    while (operandB) {
      // If the least significant bit of operandB is 1, add operandA to result.
      if (operandB & 1) {
        result += operandA;
        // Keep result within modulo bounds.
        if (result > this.currentModulo) {
          result -= this.currentModulo;
        }
      }
      operandA <<= 1; // Double operandA.
      // Keep operandA within modulo bounds.
      if (operandA > this.currentModulo) {
        operandA -= this.currentModulo;
      }
      operandB >>= 1; // Halve operandB.
    }
    return result; // Return the modular product.
  }

  // Calculates operandA raised to the power of operandB modulo the stored value.
  powerMod(operandA, operandB) {
    let result = 1; // Initialize result to 1 (A^0).
    // Loop while the exponent is non-zero.
    while (operandB) {
      // If the least significant bit of the exponent is 1, multiply result by operandA.
      if (operandB & 1) {
        result = this.multiplyMod(result, operandA);
      }
      operandA = this.multiplyMod(operandA, operandA); // Square operandA.
      operandB >>= 1; // Halve the exponent.
    }
    return result; // Return the modular power.
  }

  // Divides operandA by operandB modulo the stored value (using Fermat's Little Theorem for inverse).
  divideMod(operandA, operandB) {
    return this.multiplyMod(operandA, this.powerMod(operandB, this.currentModulo - 2));
  }

  // Calculates combinations (nCk) modulo the stored value.
  combinations(n, k) {
    return GLOBAL_MOD.multiplyMod(factorialCache[n], GLOBAL_MOD.multiplyMod(inverseFactorialCache[k], inverseFactorialCache[n - k]));
  }
}

// Global instance for modular arithmetic operations, typically used for large numbers.
const GLOBAL_MOD = new ModuloCalculator(1000000007);

// A collection of general-purpose utility functions, similar to a simplified Lodash.
class UtilityFunctions {
  // Computes the sum of all elements in an array.
  total(collection) {
    return collection.reduce((accumulator, currentValue) => accumulator + currentValue);
  }

  // Computes the sum of elements in an array, applying a modulo operation at each step.
  sumWithModulo(collection, moduloVal) {
    if (moduloVal == null) {
      moduloVal = GLOBAL_MOD.currentModulo;
    }
    return collection.reduce((accumulator, currentValue) => (accumulator + currentValue) % moduloVal);
  }

  // Finds the minimum element in an array, optionally using a custom comparator.
  minimumValue(collection, comparator) {
    if (comparator == null) {
      comparator = (valA, valB) => valA - valB;
    }
    return collection.reduce((minVal, currentVal) => comparator(minVal, currentVal) < 0 ? minVal : currentVal);
  }

  // Finds the maximum element in an array, optionally using a custom comparator.
  maximumValue(collection, comparator) {
    if (comparator == null) {
      comparator = (valA, valB) => valA - valB;
    }
    return collection.reduce((maxVal, currentVal) => comparator(maxVal, currentVal) > 0 ? maxVal : currentVal);
  }

  // Sorts an array in place, optionally using a custom comparator.
  sortElements(collection, comparator) {
    if (comparator == null) {
      comparator = (valA, valB) => valA - valB;
    }
    return collection.sort(comparator);
  }

  // Returns a new array containing only the unique elements from the input array.
  uniqueElements(collection) {
    collection.sort(); // Use built-in sort to group identical elements.
    for (let idx = 0; idx < collection.length - 1; ++idx) {
      // Mark duplicates as null.
      collection[idx] = collection[idx + 1] === collection[idx] ? null : collection[idx];
    }
    return collection.filter(item => item != null); // Filter out the marked nulls.
  }

  // Generates a sequence of numbers within a specified range.
  generateSequence(begin, end, increment) {
    if (end == null) {
      end = begin || 0;
      begin = 0;
    }
    if (!increment) {
      increment = end < begin ? -1 : 1;
    }
    const sequenceLength = Math.max(Math.ceil((end - begin) / increment), 0);
    const generatedSequence = Array(sequenceLength);
    for (var k = 0; k < sequenceLength; k++, begin += increment) {
      generatedSequence[k] = begin;
    }
    return generatedSequence;
  }

  // Retrieves the first element(s) of an array.
  getHead(sourceArray, numElements) {
    if (sourceArray == null || sourceArray.length < 1) return numElements == null ? undefined : [];
    if (numElements == null) return sourceArray[0];
    return this.getInitialElements(sourceArray, sourceArray.length - numElements);
  }

  // Retrieves elements from the beginning of an array, excluding the last 'n' elements.
  getInitialElements(sourceArray, numElements) {
    return sourceArray.slice.call(sourceArray, 0, Math.max(0, sourceArray.length - (numElements == null ? 1 : numElements)));
  }

  // Retrieves elements from a specific index to the end of an array.
  getTailElements(sourceArray, numElements) {
    return sourceArray.slice.call(sourceArray, numElements == null ? 1 : numElements);
  }

  // Retrieves the last element(s) of an array.
  getLast(sourceArray, numElements) {
    if (numElements == null) return sourceArray[sourceArray.length - 1];
    return this.getTailElements(sourceArray, Math.max(0, sourceArray.length - numElements));
  }

  // Computes the cumulative sum of an array.
  cumulativeSum(collection) {
    return this.getTailElements(collection.reduce(((sums, currentVal, currentIndex) => {
      sums.push(currentVal + sums[currentIndex]);
      return sums;
    }), [0]));
  }

  // Computes the difference between adjacent elements in an array.
  differenceArray(collection) {
    const diffs = [];
    for (let idx = 1; idx < collection.length; ++idx) {
      diffs.push(collection[idx] - collection[idx - 1]);
    }
    return diffs;
  }

  // Performs a binary search to find the insertion point for a key in a sorted array.
  findInsertionPoint(sourceArray, targetKey, propertyAccessor) {
    // Helper function to get the value for comparison.
    const accessorFn = (currentObject) => (typeof currentObject === 'object') ? currentObject[propertyAccessor] : currentObject;
    const searchValue = accessorFn(targetKey); // The value to search for.
    let lowerBound = 0,
      upperBound = sourceArray.length; // Define search range.

    // Binary search loop.
    while (lowerBound < upperBound) {
      let middleIndex = Math.floor((lowerBound + upperBound) / 2);
      // Adjust bounds based on comparison.
      if (accessorFn(sourceArray[middleIndex]) < searchValue) lowerBound = middleIndex + 1;
      else upperBound = middleIndex;
    }
    return lowerBound; // Return the insertion point.
  }
}

// Instantiate the utility functions object.
const _util = new UtilityFunctions();

// Class responsible for handling input data from a source.
class DataSource {
  // Initializes the input handler and loads all data.
  constructor() {
    this.positionPointer = 0; // Current reading position.
    this.loadAllData(); // Load all input data upon creation.
  }

  // Reads all data from the standard input stream.
  loadAllData() {
    this.rawDataLines = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');
    return this.rawDataLines;
  }

  /* Reads a single line or a block of 'numLines' lines as strings. */
  fetchLine(numLines) {
    if (numLines) {
      const returnValue = this.rawDataLines.slice(this.positionPointer, this.positionPointer + numLines);
      this.positionPointer += numLines;
      return returnValue;
    }
    return this.rawDataLines[this.positionPointer++];
  }

  /* Reads and parses a single integer from the input. */
  fetchInteger() {
    return parseInt(this.fetchLine());
  }

  /* Reads a line and splits it into an array of strings. */
  fetchStringArray() {
    return this.fetchLine().split(' ');
  }

  /* Reads a line, splits it, and parses elements into an array of integers. */
  fetchIntegerArray() {
    return this.fetchStringArray().map((element) => parseInt(element));
  }

  /* Reads a line, splits it, and parses elements into an array of floats. */
  fetchFloatArray() {
    return this.fetchStringArray().map((element) => parseFloat(element));
  }

  /* Reads multiple lines and parses each into an integer. */
  fetchIntegerLines(numLines) {
    return this.fetchLine(numLines).map((element) => parseInt(element));
  }

  /* Reads multiple lines and parses each into a float. */
  fetchFloatLines(numLines) {
    return this.fetchLine(numLines).map((element) => parseFloat(element));
  }

  /* Reads multiple lines, splits each, and returns a 2D array of strings. */
  fetchStringMatrix(numLines) {
    return this.fetchLine(numLines).map((lineString) => lineString.split(' '));
  }

  /* Reads multiple lines, splits each, and parses into a 2D array of integers. */
  fetchIntegerMatrix(numLines) {
    return this.fetchLine(numLines).map((lineString) => lineString.split(' ').map((element) => parseInt(element)));
  }

  /* Reads multiple lines, splits each, and parses into a 2D array of floats. */
  fetchFloatMatrix(numLines) {
    return this.fetchLine(numLines).map((lineString) => lineString.split(' ').map((element) => parseFloat(element)));
  }
}

// Global instance for input data processing.
const dataFeeder = new DataSource();

// Class for formatting and displaying output.
class OutputWriter {
  // Initializes the output formatter with default boolean options.
  constructor() {
    this.booleanOptions = {
      'true': 'Yes',
      'false': 'No',
    };
  }

  // Displays the provided data to the console.
  displayResult(dataToDisplay) {
    let returnValue;
    if (dataToDisplay == null) return; // Do nothing if output is null.

    // Apply boolean formatting if applicable.
    if (dataToDisplay === true) {
      returnValue = this.booleanOptions['true'];
    } else if (dataToDisplay === false) {
      returnValue = this.booleanOptions['false'];
    } else {
      returnValue = dataToDisplay; // Use data as-is for other types.
    }
    console.log(returnValue); // Print the final result.
  }

  // Configures custom strings for true/false boolean output.
  configureBooleanOutput(customOptions) {
    this.booleanOptions['false'] = customOptions[0];
    this.booleanOptions['true'] = customOptions[1];
    return this; // Allow chaining.
  }
}

// Global instance for output generation.
const resultPrinter = new OutputWriter();

// Execute the main processing logic and display its outcome.
resultPrinter.displayResult(new CoreProcessor().execute());