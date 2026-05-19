'use strict';

// This class handles the primary logic for the problem.
class Processor {
  // Executes the main problem-solving algorithm.
  execute() {
    // Read the number of pairs.
    const count = dataInput.getNextInt();
    // Read 'count' lines, each containing two integers, into a 2D array.
    const pairs = dataInput.getNextIntMatrix(count);

    // If all pairs have equal first and second elements, the result is 0.
    if (pairs.every(element => element[0] === element[1])) {
      return 0;
    }

    // Filter for pairs where the first element is strictly greater than the second.
    const greaterPairs = pairs.filter(element => element[0] > element[1]);

    // Calculate the sum of all first elements.
    // Subtract the minimum of the second elements from 'greaterPairs' if 'greaterPairs' is not empty.
    // Otherwise, subtract 0.
    return _UTIL.calculateSum(pairs.map(element => element[0])) -
           (greaterPairs.length === 0 ? 0 : _UTIL.findMinimum(greaterPairs.map(element => element[1])));
  }
}

// Provides modular arithmetic operations.
class ModularArithmetic {
  // Constructor initializes the modulus.
  constructor(moduloVal) {
    if (moduloVal == null) {
      // Default modulus, if not provided. (Original code had Combinatorics.DefaultMod, which wasn't defined. Assuming it's a placeholder or intended to be a global constant.)
      // For this clone, I'll assume it's meant to be a specific value if not passed.
      // Since the original `MOD` instance uses `1e9+7`, I'll keep that as the implicit default if not specified.
      // However, the original code explicitly passes `1e9+7` to the `MOD` instance, so this path is not taken.
      this.modulus = 1000000007; // A common prime modulus.
    } else {
      this.modulus = moduloVal;
    }
  }

  // Performs modular multiplication (a * b) % modulus.
  multiply(operandA, operandB) {
    let result = 0;
    operandA %= this.modulus;
    operandB %= this.modulus;

    // Binary multiplication to prevent overflow before modulo.
    while (operandB) {
      if (operandB & 1) {
        result += operandA;
        if (result >= this.modulus) {
          result -= this.modulus;
        }
      }
      operandA <<= 1;
      if (operandA >= this.modulus) {
        operandA -= this.modulus;
      }
      operandB >>= 1;
    }
    return result;
  }

  // Performs modular exponentiation (a^b) % modulus.
  power(operandA, operandB) {
    let result = 1;
    while (operandB) {
      if (operandB & 1) {
        result = this.multiply(result, operandA);
      }
      operandA = this.multiply(operandA, operandA);
      operandB >>= 1;
    }
    return result;
  }

  // Performs modular division (a / b) % modulus using Fermat's Little Theorem.
  // a / b = a * b^(mod-2) % mod
  divide(operandA, operandB) {
    return this.multiply(operandA, this.power(operandB, this.modulus - 2));
  }

  // Calculates modular combinations C(n, k) % modulus.
  // Requires precomputed factorial and inverse factorial tables (factTable, invFactTable)
  // which are not provided in the original code snippet, so this method would error if called.
  // Keeping the structure as is to maintain Type II clone rules.
  combinations(n, k) {
    // Assuming MOD_ARITHMETIC is accessible and factTable/invFactTable are global.
    // This part of the original code is incomplete without those tables.
    // For Type II, we preserve the call structure.
    return MOD_ARITHMETIC.multiply(factTable[n], MOD_ARITHMETIC.multiply(invFactTable[k], invFactTable[n - k]));
  }
}
// Global instance for modular arithmetic operations.
const MOD_ARITHMETIC = new ModularArithmetic(1000000007); // Using 1e9+7 as 1000000007

// A collection of utility functions, similar to Lodash or Underscore.js.
class UtilityFunctions {
  // Calculates the sum of elements in an array.
  calculateSum(dataArray) {
    return dataArray.reduce((accumulator, currentValue) => accumulator + currentValue);
  }

  // Calculates the sum of elements in an array, modulo a given value.
  calculateModSum(dataArray, moduloVal) {
    if (moduloVal == null) {
      moduloVal = MOD_ARITHMETIC.modulus;
    }
    return dataArray.reduce((accumulator, currentValue) => (accumulator + currentValue) % moduloVal);
  }

  // Finds the minimum element in an array.
  // An optional comparison function can be provided.
  findMinimum(dataArray, compareFunc) {
    if (compareFunc == null) {
      compareFunc = (valA, valB) => valA - valB;
    }
    return dataArray.reduce((accumulator, currentValue) => compareFunc(accumulator, currentValue) < 0 ? accumulator : currentValue);
  }

  // Finds the maximum element in an array.
  // An optional comparison function can be provided.
  findMaximum(dataArray, compareFunc) {
    if (compareFunc == null) {
      compareFunc = (valA, valB) => valA - valB;
    }
    return dataArray.reduce((accumulator, currentValue) => compareFunc(accumulator, currentValue) > 0 ? accumulator : currentValue);
  }

  // Sorts an array in place.
  // An optional comparison function can be provided.
  sortArray(dataArray, compareFunc) {
    if (compareFunc == null) {
      compareFunc = (valA, valB) => valA - valB;
    }
    return dataArray.sort(compareFunc);
  }

  // Returns an array with unique elements.
  uniqueElements(dataArray) {
    this.sortArray(dataArray); // Sort first to group duplicates.
    for (let index = 0; index < dataArray.length - 1; ++index) {
      // Mark duplicates as null.
      dataArray[index] = dataArray[index + 1] === dataArray[index] ? null : dataArray[index];
    }
    // Filter out the nulls.
    return dataArray.filter(element => element != null);
  }

  // Generates a range of numbers.
  // Similar to Python's range().
  generateRange(rangeStart, rangeEnd, rangeStep) {
    if (rangeEnd == null) {
      rangeEnd = rangeStart || 0;
      rangeStart = 0;
    }
    if (!rangeStep) {
      rangeStep = rangeEnd < rangeStart ? -1 : 1;
    }
    const arrayLength = Math.max(Math.ceil((rangeEnd - rangeStart) / rangeStep), 0);
    const generatedRange = Array(arrayLength);
    for (let index = 0; index < arrayLength; index++, rangeStart += rangeStep) {
      generatedRange[index] = rangeStart;
    }
    return generatedRange;
  }

  // Gets the first 'n' elements of an array, or just the first element if 'n' is not provided.
  getFirst(inputArray, numElements) {
    if (inputArray == null || inputArray.length < 1) {
      return numElements == null ? void 0 : [];
    }
    if (numElements == null) {
      return inputArray[0];
    }
    return this.getInitial(inputArray, inputArray.length - numElements);
  }

  // Gets all but the last 'n' elements of an array, or all but the last element if 'n' is not provided.
  getInitial(inputArray, numElements) {
    return inputArray.slice.call(inputArray, 0, Math.max(0, inputArray.length - (numElements == null ? 1 : numElements)));
  }

  // Gets all but the first 'n' elements of an array, or all but the first element if 'n' is not provided.
  getTail(inputArray, numElements) {
    return inputArray.slice.call(inputArray, numElements == null ? 1 : numElements);
  }

  // Gets the last 'n' elements of an array, or just the last element if 'n' is not provided.
  getLast(inputArray, numElements) {
    if (numElements == null) {
      return inputArray[inputArray.length - 1];
    }
    return this.getTail(inputArray, Math.max(0, inputArray.length - numElements));
  }

  // Calculates the cumulative sum of an array.
  cumulativeSum(dataArray) {
    return this.getTail(dataArray.reduce(((accumulator, currentValue, index) => {
      accumulator.push(currentValue + accumulator[index]);
      return accumulator;
    }), [0]));
  }

  // Calculates the difference array (arr[i] - arr[i-1]).
  differenceArray(dataArray) {
    const differences = [];
    for (let index = 1; index < dataArray.length; ++index) {
      differences.push(dataArray[index] - dataArray[index - 1]);
    }
    return differences;
  }

  // Performs a binary search on a sorted array to find the index of the largest element less than or equal to the key.
  // Or, more precisely, the insertion point for `key` to maintain sorted order.
  performBinarySearch(inputArray, searchKey, iteratorKey) {
    // Helper function to get the value from an object or directly use the primitive.
    const iteratorFn = (currentObject) => (typeof currentObject === 'object') ? currentObject[iteratorKey] : currentObject;
    const targetValue = iteratorFn(searchKey);
    let lowerBound = 0,
      upperBound = inputArray.length;

    while (lowerBound < upperBound) {
      let middleIndex = Math.floor((lowerBound + upperBound) / 2);
      if (iteratorFn(inputArray[middleIndex]) < targetValue) {
        lowerBound = middleIndex + 1;
      } else {
        upperBound = middleIndex;
      }
    }
    return lowerBound;
  }
}
// Global instance for utility functions.
const _UTIL = new UtilityFunctions();

// Handles reading input from stdin.
class DataStream {
  constructor() {
    this.position = 0; // Current reading position.
    this.readAllInput(); // Read all input upon instantiation.
  }

  // Reads all input from stdin and splits it into lines.
  readAllInput() {
    this.inputLines = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');
    return this.inputLines;
  }

  // Reads 'n' lines or a single line if 'n' is not provided.
  getNextLine(numLines) {
    if (numLines) {
      const result = this.inputLines.slice(this.position, this.position + numLines);
      this.position += numLines;
      return result;
    }
    return this.inputLines[this.position++];
  }

  // Reads the next line as an integer.
  getNextInt() {
    return parseInt(this.getNextLine());
  }

  // Reads the next line as an array of strings.
  getNextStringArray() {
    return this.getNextLine().split(' ');
  }

  // Reads the next line as an array of integers.
  getNextIntArray() {
    return this.getNextStringArray().map((element) => parseInt(element));
  }

  // Reads the next line as an array of floating-point numbers.
  getNextFloatArray() {
    return this.getNextStringArray().map((element) => parseFloat(element));
  }

  // Reads 'n' lines, each converted to an integer.
  getNextIntLines(numLines) {
    return this.getNextLine(numLines).map((element) => parseInt(element));
  }

  // Reads 'n' lines, each converted to a floating-point number.
  getNextFloatLines(numLines) {
    return this.getNextLine(numLines).map((element) => parseFloat(element));
  }

  // Reads 'n' lines, each split into an array of strings.
  getNextStringMatrix(numLines) {
    return this.getNextLine(numLines).map((currentLine) => currentLine.split(' '));
  }

  // Reads 'n' lines, each split into an array of integers.
  getNextIntMatrix(numLines) {
    return this.getNextLine(numLines).map((currentLine) => currentLine.split(' ').map((element) => parseInt(element)));
  }

  // Reads 'n' lines, each split into an array of floating-point numbers.
  getNextFloatMatrix(numLines) {
    return this.getNextLine(numLines).map((currentLine) => currentLine.split(' ').map((element) => parseFloat(element)));
  }
}
// Global instance for input handling.
const dataInput = new DataStream();

// Handles writing output to stdout.
class OutputHandler {
  constructor() {
    // Default options for boolean output.
    this.displayOptions = {
      'true': 'Yes',
      'false': 'No',
    };
  }

  // Prints the given output to the console.
  // Converts boolean true/false to 'Yes'/'No' based on displayOptions.
  printResult(finalOutput) {
    let formattedResult;
    if (finalOutput == null) {
      return; // Do nothing if output is null or undefined.
    }
    if (finalOutput === true) {
      formattedResult = this.displayOptions['true'];
    } else if (finalOutput === false) {
      formattedResult = this.displayOptions['false'];
    } else {
      formattedResult = finalOutput;
    }
    console.log(formattedResult);
  }

  // Sets custom strings for boolean true/false output.
  setBooleanOptions(optionArray) {
    this.displayOptions['false'] = optionArray[0];
    this.displayOptions['true'] = optionArray[1];
    return this; // Allows chaining.
  }
}
// Global instance for output handling.
const outputWriter = new OutputHandler();

// Execute the main problem solver and print its result.
outputWriter.printResult(new Processor().execute());
