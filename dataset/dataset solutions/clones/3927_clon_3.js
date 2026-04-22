// This codebase provides a structured approach for competitive programming tasks,
// encompassing input handling, core algorithmic logic, utility functions,
// and result presentation. It aims for clarity and modularity.

// No 'use strict' directive is applied globally, allowing for more flexible
// script execution in various environments.

/**
 * Encapsulates operations for modular arithmetic, crucial for problems
 * involving large numbers where results need to be kept within a specific modulus.
 */
class ModularArithmeticEngine {
  // A private static constant defining the default prime modulus,
  // commonly used in competitive programming (10^9 + 7).
  static #STANDARD_MODULUS = 1_000_000_007;

  /**
   * Initializes the modular arithmetic engine with a specified modulus.
   * If no modulus is provided, it defaults to `STANDARD_MODULUS`.
   * @param {number} [modulusValue] - The integer modulus for all operations.
   */
  constructor(modulusValue) {
    // Assign the provided modulus or fall back to the standard default.
    this.currentModulus = modulusValue ?? ModularArithmeticEngine.#STANDARD_MODULUS;
  }

  /**
   * Computes the modular product of two numbers (a * b) % currentModulus.
   * This implementation uses a binary multiplication approach to prevent
   * intermediate overflow for very large numbers before the modulo operation.
   * @param {number} termOne - The first multiplicand.
   * @param {number} termTwo - The second multiplicand.
   * @returns {number} The modular product.
   */
  performModularMultiplication(termOne, termTwo) {
    let accumulator = 0;
    // Reduce terms modulo currentModulus to handle potential large inputs.
    let reducedTermOne = termOne % this.currentModulus;
    let reducedTermTwo = termTwo % this.currentModulus;

    // Loop until the second term becomes zero.
    // This process mimics traditional multiplication but applies modulo at each step.
    while (reducedTermTwo > 0) {
      // If the LSB of reducedTermTwo is 1, add reducedTermOne to the accumulator.
      if ((reducedTermTwo & 1) === 1) {
        accumulator = (accumulator + reducedTermOne);
        // Keep accumulator within the modulus range.
        if (accumulator >= this.currentModulus) {
          accumulator -= this.currentModulus;
        }
      }
      // Double reducedTermOne and apply modulo.
      reducedTermOne = (reducedTermOne << 1); // Equivalent to reducedTermOne * 2
      if (reducedTermOne >= this.currentModulus) {
        reducedTermOne -= this.currentModulus;
      }
      // Halve reducedTermTwo by right-shifting.
      reducedTermTwo >>= 1; // Equivalent to Math.floor(reducedTermTwo / 2)
    }
    return accumulator;
  }

  /**
   * Calculates (base ^ exponent) % currentModulus using binary exponentiation
   * (exponentiation by squaring) for efficiency with large exponents.
   * @param {number} baseValue - The base number.
   * @param {number} exponentValue - The power to raise the base to.
   * @returns {number} The modular exponentiation result.
   */
  calculateModularPower(baseValue, exponentValue) {
    let result = 1;
    let currentBase = baseValue;

    // Ensure currentBase is within the modulus.
    currentBase %= this.currentModulus;

    // Loop while exponentValue is positive.
    while (exponentValue > 0) {
      // If exponentValue is odd, incorporate currentBase into the result.
      if ((exponentValue & 1) === 1) {
        result = this.performModularMultiplication(result, currentBase);
      }
      // Square the currentBase for the next iteration.
      currentBase = this.performModularMultiplication(currentBase, currentBase);
      // Halve the exponentValue.
      exponentValue >>= 1;
    }
    return result;
  }

  /**
   * Performs modular division (numerator / denominator) % currentModulus.
   * This is achieved by multiplying the numerator with the modular
   * multiplicative inverse of the denominator, calculated using Fermat's Little Theorem.
   * Assumes `currentModulus` is a prime number.
   * @param {number} numeratorValue - The dividend.
   * @param {number} denominatorValue - The divisor.
   * @returns {number} The modular division result.
   */
  performModularDivision(numeratorValue, denominatorValue) {
    // The modular inverse of 'denominatorValue' is 'denominatorValue^(currentModulus - 2)'
    // when currentModulus is prime, according to Fermat's Little Theorem.
    const inverseDenominator = this.calculateModularPower(denominatorValue, this.currentModulus - 2);
    return this.performModularMultiplication(numeratorValue, inverseDenominator);
  }

  /**
   * Computes the binomial coefficient "n choose k" (C(n, k)) modulo currentModulus.
   * This method relies on external precomputed factorial and inverse factorial tables.
   * @param {number} totalItems - The total number of items (n).
   * @param {number} itemsToChoose - The number of items to choose (k).
   * @returns {number} The combination value modulo currentModulus.
   * @throws {Error} If `factLookupTable` or `invFactLookupTable` are not defined.
   * @remarks This function assumes the existence of globally accessible `factLookupTable`
   *          and `invFactLookupTable` arrays, populated with modular factorials
   *          and their inverses, respectively. These are not part of this class.
   */
  calculateCombinations(totalItems, itemsToChoose) {
    // Validate input parameters.
    if (itemsToChoose < 0 || itemsToChoose > totalItems) {
      return 0; // Invalid combination, result is 0.
    }
    // Check for required global tables.
    if (typeof factLookupTable === 'undefined' || typeof invFactLookupTable === 'undefined') {
      throw new Error("ModularArithmeticEngine.calculateCombinations requires 'factLookupTable' and 'invFactLookupTable' to be defined.");
    }

    // C(n, k) = n! / (k! * (n-k)!) = n! * (k!)^-1 * ((n-k)!)^-1 (mod P)
    const nFactorial = factLookupTable[totalItems];
    const kFactorialInverse = invFactLookupTable[itemsToChoose];
    const nkFactorialInverse = invFactLookupTable[totalItems - itemsToChoose];

    // Perform multiplications modulo currentModulus.
    let partialResult = this.performModularMultiplication(nFactorial, kFactorialInverse);
    partialResult = this.performModularMultiplication(partialResult, nkFactorialInverse);
    return partialResult;
  }
}

// Instantiate the modular arithmetic engine for global use.
const globalModularCalculator = new ModularArithmeticEngine();

/**
 * A utility class offering common collection manipulation methods,
 * similar to a simplified functional programming library.
 */
class ArrayManipulationUtilities {
  /**
   * Computes the sum of all numerical elements in an array.
   * @param {number[]} arrayOfNumbers - The array of numbers to sum.
   * @returns {number} The aggregated sum.
   */
  sumAllElements(arrayOfNumbers) {
    let totalAccumulation = 0;
    // Iterate using a traditional for loop to accumulate the sum.
    for (let index = 0; index < arrayOfNumbers.length; ++index) {
      totalAccumulation += arrayOfNumbers[index];
    }
    return totalAccumulation;
  }

  /**
   * Finds the minimum element within an array based on an optional comparison function.
   * If the array is empty, it returns `undefined`.
   * @param {Array<any>} dataArray - The array to search for the minimum element.
   * @param {Function} [comparatorFunction] - An optional function (a, b) => number,
   *                                            returning <0 if a < b, 0 if a == b, >0 if a > b.
   * @returns {any|undefined} The smallest element, or `undefined` if `dataArray` is empty.
   */
  findSmallestElement(dataArray, comparatorFunction) {
    // Handle edge case: empty or null array.
    if (!dataArray || dataArray.length === 0) {
      return undefined;
    }

    // Default comparator for numeric types.
    const actualComparator = comparatorFunction ?? ((valA, valB) => valA - valB);

    let currentSmallest = dataArray[0];
    // Iterate from the second element onwards.
    for (let idx = 1; idx < dataArray.length; ++idx) {
      const element = dataArray[idx];
      // If the current element is smaller than the currentSmallest.
      if (actualComparator(element, currentSmallest) < 0) {
        currentSmallest = element;
      }
    }
    return currentSmallest;
  }

  /**
   * Filters elements from an array based on a provided predicate function.
   * This method creates a new array containing only the elements for which
   * the predicate returns `true`.
   * @param {Array<any>} sourceCollection - The array to filter.
   * @param {Function} predicate - A function `(element, index, array)` that returns a boolean.
   * @returns {Array<any>} A new array with filtered elements.
   */
  filterCollection(sourceCollection, predicate) {
    const filteredItems = [];
    // Iterate over the source collection.
    for (let i = 0; i < sourceCollection.length; ++i) {
      // If the predicate function returns true for the current element, add it to the results.
      if (predicate(sourceCollection[i], i, sourceCollection)) {
        filteredItems.push(sourceCollection[i]);
      }
    }
    return filteredItems;
  }

  /**
   * Transforms each element in an array using a mapping function,
   * producing a new array of the transformed results.
   * @param {Array<any>} originalCollection - The array whose elements are to be transformed.
   * @param {Function} transformationFunction - A function `(element, index, array)` that returns the new value.
   * @returns {Array<any>} A new array containing the results of the transformation.
   */
  transformCollection(originalCollection, transformationFunction) {
    const transformedResults = [];
    // Iterate through the original collection to apply the transformation.
    for (let i = 0; i < originalCollection.length; ++i) {
      transformedResults.push(transformationFunction(originalCollection[i], i, originalCollection));
    }
    return transformedResults;
  }
}

// Create an instance of the array manipulation utilities for general use.
const collectionOperations = new ArrayManipulationUtilities();

/**
 * Manages reading various types of input from standard input (`/dev/stdin`).
 * It buffers all input lines upon initialization for efficient sequential access.
 */
class InputDataReader {
  #currentLinePointer; // Private field to keep track of the next line to read.
  #inputLineBuffer; // Private field to store all lines read from stdin.

  /**
   * Constructs an InputDataReader instance and immediately loads all input.
   */
  constructor() {
    this.#currentLinePointer = 0;
    this.#inputLineBuffer = [];
    this.#loadAllInputIntoBuffer(); // Populate the buffer during instantiation.
  }

  /**
   * Reads the entire content from `/dev/stdin` and stores it as an array of lines.
   * Handles potential file reading errors.
   * @private
   */
  #loadAllInputIntoBuffer() {
    try {
      const fileContents = require("fs").readFileSync("/dev/stdin", "utf8");
      this.#inputLineBuffer = fileContents.split('\n');
      // Remove any trailing empty line that might result from `split('\n')`.
      if (this.#inputLineBuffer[this.#inputLineBuffer.length - 1] === '') {
        this.#inputLineBuffer.pop();
      }
    } catch (readingError) {
      console.error("Failed to read input from /dev/stdin:", readingError);
      this.#inputLineBuffer = []; // Ensure buffer is empty on error.
    }
  }

  /**
   * Retrieves one or more lines from the input buffer.
   * Advances the internal line pointer.
   * @param {number} [count=1] - The number of lines to fetch. Defaults to 1.
   * @returns {string|string[]} A single string if `count` is 1, or an array of strings otherwise.
   */
  retrieveNextLines(count = 1) {
    // Validate input count.
    if (count <= 0) {
      return count === 1 ? '' : [];
    }

    const remainingLines = this.#inputLineBuffer.length - this.#currentLinePointer;
    if (remainingLines <= 0) {
      return count === 1 ? '' : []; // No more lines available.
    }

    const actualLinesToFetch = Math.min(count, remainingLines);
    const fetchedSegment = this.#inputLineBuffer.slice(this.#currentLinePointer, this.#currentLinePointer + actualLinesToFetch);
    this.#currentLinePointer += actualLinesToFetch;

    return actualLinesToFetch === 1 ? fetchedSegment[0] : fetchedSegment;
  }

  /**
   * Reads and parses the next line as a single integer.
   * @returns {number} The parsed integer.
   */
  getSingleInteger() {
    const lineData = this.retrieveNextLines();
    return parseInt(lineData, 10); // Specify radix 10 for safety.
  }

  /**
   * Reads the next line, splits it by spaces, and returns an array of strings.
   * @returns {string[]} An array of string tokens.
   */
  getStringTokensOnNextLine() {
    const lineData = this.retrieveNextLines();
    return lineData.split(' ');
  }

  /**
   * Reads N subsequent lines, where each line contains space-separated integers,
   * and converts them into a two-dimensional array (matrix) of integers.
   * @param {number} numRows - The number of rows (lines) to read.
   * @returns {number[][]} A 2D array representing the integer matrix.
   */
  getIntegerMatrix(numRows) {
    const allFetchedLines = this.retrieveNextLines(numRows);
    const matrixResult = [];

    // Iterate over each line obtained.
    for (let rowIndex = 0; rowIndex < allFetchedLines.length; rowIndex++) {
      const currentInputLine = allFetchedLines[rowIndex];
      // Split the line by spaces and parse each token as an integer.
      const rowOfIntegers = currentInputLine.split(' ').map(str => parseInt(str, 10));
      matrixResult.push(rowOfIntegers);
    }
    return matrixResult;
  }
}

// Initialize the input data reader.
const problemInput = new InputDataReader();

/**
 * Implements the main problem-solving algorithm.
 * It orchestrates input reading, processing logic, and result determination.
 */
class SolutionAlgorithmProcessor {
  /**
   * Executes the core logic to solve the given problem based on input data.
   * @returns {number} The final computed numerical result.
   */
  processAndSolve() {
    // Read the total number of data pairs from the input.
    const totalDataPairs = problemInput.getSingleInteger();

    // Read all 'totalDataPairs' lines, each containing two integers, into a 2D array.
    const integerPairs = problemInput.getIntegerMatrix(totalDataPairs);

    // Initial guard clause: If there are no pairs or the input is malformed, return 0.
    if (totalDataPairs === 0 || !integerPairs || integerPairs.length === 0) {
      return 0;
    }

    let areAllElementsIdentical = true;
    // Iterate through the pairs to check if a_i == b_i for all pairs.
    for (let k = 0; k < integerPairs.length; ++k) {
      const currentTuple = integerPairs[k];
      // If any pair has different elements, set flag to false and break.
      if (currentTuple[0] !== currentTuple[1]) {
        areAllElementsIdentical = false;
        break;
      }
    }

    // If all pairs satisfy a_i == b_i, the problem statement implies the result is 0.
    if (areAllElementsIdentical) {
      return 0;
    }

    // Filter the original pairs to find those where the first element is strictly greater than the second.
    const itemsWithFirstLarger = collectionOperations.filterCollection(integerPairs, (pair) => pair[0] > pair[1]);

    // Calculate the sum of the first elements of all pairs.
    let sumOfAllFirstElements = 0;
    // Using a for...of loop for summing the first components.
    for (const pairEntry of integerPairs) {
      sumOfAllFirstElements += pairEntry[0];
    }

    // Compute an intermediate value based on the problem's specific logic.
    // This involves subtracting the count of 'first larger' pairs from the total sum of first elements.
    const intermediateCalculationResult = sumOfAllFirstElements - itemsWithFirstLarger.length;

    // A specific condition from the problem: if this intermediate result is 0, output 0.
    if (intermediateCalculationResult === 0) {
      return 0;
    } else {
      // Otherwise, we need to find the minimum of the second elements
      // from the `itemsWithFirstLarger` collection.

      // First, extract all second elements from the filtered pairs.
      const secondComponentsToConsider = collectionOperations.transformCollection(
        itemsWithFirstLarger,
        (pair) => pair[1]
      );

      // Then, find the smallest value among these extracted second components.
      const minimumRelevantValue = collectionOperations.findSmallestElement(secondComponentsToConsider);

      // A safety check: if `itemsWithFirstLarger` was unexpectedly empty here,
      // `minimumRelevantValue` would be `undefined`. This shouldn't happen if `intermediateCalculationResult` is not 0
      // and `areAllElementsIdentical` was false, but it's good practice.
      if (minimumRelevantValue === undefined) {
          // This implies a logical inconsistency or an unexpected input state.
          // Depending on problem specifics, might return 0 or throw an error.
          return 0;
      }

      return minimumRelevantValue;
    }
  }
}

/**
 * Manages the presentation of results, typically to the console.
 * Allows for custom string representations of boolean outputs.
 */
class ResultOutputPresenter {
  #booleanOutputMap; // Private Map to store custom strings for true/false.

  /**
   * Initializes the ResultOutputPresenter with default boolean mappings ('Yes', 'No').
   */
  constructor() {
    this.#booleanOutputMap = new Map();
    this.#booleanOutputMap.set(true, 'Yes');
    this.#booleanOutputMap.set(false, 'No');
  }

  /**
   * Displays the given content to the standard output (console).
   * It handles `null` or `undefined` gracefully by doing nothing,
   * and applies custom string mappings for boolean values if configured.
   * @param {any} contentToDisplay - The data to be written to the console.
   */
  outputToConsole(contentToDisplay) {
    // If the content is null or undefined, do not print anything.
    if (contentToDisplay === null || contentToDisplay === undefined) {
      return;
    }

    let finalFormattedContent;
    // Check if the content is a boolean and if a custom mapping exists for it.
    if (typeof contentToDisplay === 'boolean' && this.#booleanOutputMap.has(contentToDisplay)) {
      finalFormattedContent = this.#booleanOutputMap.get(contentToDisplay);
    } else {
      // For non-boolean or unmapped boolean values, use the content as is.
      finalFormattedContent = contentToDisplay;
    }
    console.log(finalFormattedContent);
  }

  /**
   * Configures custom string representations for `true` and `false` boolean outputs.
   * @param {string[]} customStringOptions - An array where `customStringOptions[0]` maps to `false`
   *                                         and `customStringOptions[1]` maps to `true`.
   * @returns {ResultOutputPresenter} Returns `this` instance for method chaining.
   */
  setupBooleanDisplay(customStringOptions) {
    if (Array.isArray(customStringOptions) && customStringOptions.length >= 2) {
      this.#booleanOutputMap.set(false, customStringOptions[0]);
      this.#booleanOutputMap.set(true, customStringOptions[1]);
    } else {
      console.warn("Invalid options for boolean display. Expected an array with at least two strings.");
    }
    return this; // Allows for fluent API chaining.
  }
}

// Initialize the result output handler.
const problemOutput = new ResultOutputPresenter();

// --- Main Execution Flow ---
// Create an instance of the algorithm processor.
const mainSolverInstance = new SolutionAlgorithmProcessor();
// Execute the solution logic and obtain the final result.
const calculatedFinalResult = mainSolverInstance.processAndSolve();
// Display the computed result to the console.
problemOutput.outputToConsole(calculatedFinalResult);

// --- Global Dummy Tables (for ModularArithmeticEngine.calculateCombinations) ---
// These arrays are placeholders. In a real scenario, they would be populated
// through precomputation (e.g., in a separate Combinatorics class or initialization phase)
// if `calculateCombinations` were actually used by `SolutionAlgorithmProcessor`.
// They are included here to satisfy potential, albeit unused, dependencies.
const factLookupTable = []; // Stores n! % MOD
const invFactLookupTable = []; // Stores (n!)^-1 % MOD