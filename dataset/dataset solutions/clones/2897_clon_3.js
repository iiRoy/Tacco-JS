const DataStreamer = (function () {
  /**
   * Factory function to instantiate an InputReader.
   * @param {string} sourceText The complete raw input content as a string.
   * @returns {InputReader} A fresh InputReader object.
   */
  function createReader(sourceText) {
    return new InputReader(sourceText);
  }

  /**
   * @class InputReader
   * A utility class designed to manage and parse structured input from a multi-line string.
   */
  class InputReader {
    /**
     * Constructs an InputReader instance.
     * It processes the raw content by trimming whitespace and splitting it into individual lines.
     * A pointer is initialized to track the current line being processed.
     * @param {string} rawContent The entire input provided as a single string.
     */
    constructor(rawContent) {
      this._sourceLines = rawContent.trim().split("\n");
      this._linePointer = 0; // Points to the index of the next line to be read.
    }

    /**
     * Retrieves and processes a single element from the current line.
     * This method is optimized to reverse and split the line only once when first accessed,
     * allowing subsequent calls to efficiently pop elements from the end of the array.
     * If the current line becomes empty after popping, the line pointer advances.
     * @param {boolean} [asString=false] If true, the element is returned as a string; otherwise, it's converted to a number.
     * @returns {(string|number)} The next element from the input stream.
     */
    getNextElement(asString = false) {
      let currentLineCache = this._sourceLines[this._linePointer];
      // If the current line is still a string, it means it hasn't been processed yet.
      if (typeof currentLineCache === "string") {
        // Split the line by spaces and reverse it for efficient popping.
        this._sourceLines[this._linePointer] = currentLineCache.split(" ").reverse();
        currentLineCache = this._sourceLines[this._linePointer]; // Update the reference to the array.
      }

      // Extract the last element, which was the first element of the original line.
      const extractedValue = currentLineCache.pop();

      // If the array for the current line is now empty, move to the next line.
      if (currentLineCache.length === 0) {
        this._linePointer++;
      }

      // Return the value, either as a string or a parsed number.
      return asString ? extractedValue : Number(extractedValue);
    }

    /**
     * Reads all elements from the current line, converting them to numbers by default.
     * The line pointer is automatically advanced to the next line after this operation.
     * @param {boolean} [keepRaw=false] If true, elements are returned as strings; otherwise, they are parsed as floating-point numbers.
     * @returns {(string[]|number[])} An array containing all elements from the processed line.
     */
    fetchLineValues(keepRaw = false) {
      const lineContent = this._sourceLines[this._linePointer++];
      const elementsArray = lineContent.split(" ");
      return keepRaw ? elementsArray : elementsArray.map(parseFloat);
    }

    /**
     * Reads a specified number of lines, treating each as a row in a matrix.
     * Each line is split into elements, and by default, elements are converted to numbers.
     * The line pointer is advanced by the number of lines read.
     * @param {number} count The total number of lines to read for the matrix.
     * @param {boolean} [asStrings=false] If true, elements within the matrix rows are kept as strings; otherwise, they are parsed as numbers.
     * @returns {(string[][]|number[][])} A 2D array representing the matrix data.
     */
    getMultiLineData(count, asStrings = false) {
      // Extract the relevant block of lines.
      const linesBlock = this._sourceLines.slice(this._linePointer, this._linePointer + count);
      this._linePointer += count; // Advance the pointer past the read block.

      // Process each line into an array of strings.
      const stringMatrix = linesBlock.map(singleLine => singleLine.split(" "));

      // Convert to numbers if requested.
      return asStrings ? stringMatrix : stringMatrix.map(row => row.map(parseFloat));
    }

    /**
     * Reads a contiguous block of lines without further splitting them into elements.
     * Each line is treated as a single item in the resulting array.
     * The line pointer is advanced by the number of lines read.
     * @param {number} count The number of raw lines to fetch.
     * @param {boolean} [returnAsStrings=false] If true, returns lines as strings; otherwise, attempts to convert each line to a number.
     * @returns {(string[]|number[])} An array where each item is a raw line or its numeric representation.
     */
    fetchLineBlock(count, returnAsStrings = false) {
      const lineSegment = this._sourceLines.slice(this._linePointer, this._linePointer + count);
      this._linePointer += count;
      return returnAsStrings ? lineSegment : lineSegment.map(parseFloat);
    }
  }

  return createReader;
})();

// --- Global Constants and Core Utility Functions ---

// Initialize the input data handler by reading from standard input.
// Explicitly converting the Buffer to a UTF-8 string.
const inputHandler = DataStreamer(require("fs").readFileSync("/dev/stdin").toString('utf8'));

/**
 * Dynamically creates a multi-dimensional array initialized with a specific value.
 * This function utilizes `eval` to construct the array creation string, allowing
 * for arbitrary nesting based on the provided dimensions.
 * @param {*} initialElement The value that all elements of the array will be initialized with.
 * @param {...number} dimensions A variable number of arguments representing the sizes of each dimension, from outermost to innermost.
 * @returns {Array} The newly created and initialized multi-dimensional array.
 */
const initializeNestedArray = function (initialElement, ...dimensions) {
  if (dimensions.length === 0) {
    return initialElement; // Base case for 0 dimensions.
  }
  let currentDimensionIndex = dimensions.length - 1;
  // Start building the expression from the innermost dimension.
  let arrayConstructionString = `Array(dimensions[${currentDimensionIndex}]).fill(0).map(() => ${initialElement})`;

  // Iterate backwards through dimensions to build nested structure.
  while (--currentDimensionIndex >= 0) {
    arrayConstructionString = `Array(dimensions[${currentDimensionIndex}]).fill(0).map(() => ${arrayConstructionString})`;
  }
  // Execute the dynamically constructed string to create the array.
  return eval(arrayConstructionString);
};

// The primary modulus value used for all modular arithmetic operations in this problem.
const PRIME_MODULUS = 1000003;

/**
 * Performs modular multiplication for an arbitrary number of operands.
 * Each operand is multiplied sequentially, with the result taken modulo PRIME_MODULUS
 * at each step to prevent overflow and keep numbers within the required range.
 * @param {...number} values The numbers to be multiplied.
 * @returns {number} The final product modulo PRIME_MODULUS. Returns 1 if no values are provided (multiplicative identity).
 */
const performModMultiplication = function (...values) {
  if (values.length === 0) {
    return 1; // Multiplicative identity
  }
  let currentProduct = values[0] % PRIME_MODULUS; // Start with the first value, modulo'd.
  for (let k = 1; k < values.length; k++) {
    // Perform multiplication and immediately take modulo.
    // The original bitwise optimization is not strictly needed for PRIME_MODULUS = 10^6.
    currentProduct = (currentProduct * values[k]) % PRIME_MODULUS;
  }
  return currentProduct;
};

// A cache to store precomputed factorial values to avoid redundant calculations.
let factorialCache = [1, 1]; // 0! = 1, 1! = 1

/**
 * Precomputes and stores factorial values up to a specified limit in the `factorialCache`.
 * This function efficiently extends the cache if new factorials are needed.
 * @param {number} limit The maximum number for which factorial should be calculated and cached.
 */
const precomputeFactorials = function (limit) {
  if (limit < 0) {
    // Log a warning for invalid input, but do not proceed.
    console.warn("Factorial limit cannot be negative. Skipping precomputation.");
    return;
  }
  // If the cache already covers the limit, no recomputation is needed.
  if (factorialCache.length > limit + 1) {
    return;
  }
  // Extend the cache from the last computed factorial up to the new limit.
  for (let i = factorialCache.length; i <= limit; i++) {
    factorialCache[i] = performModMultiplication(factorialCache[i - 1], i);
  }
};

/**
 * Calculates the modular multiplicative inverse of a number `num` modulo `PRIME_MODULUS`.
 * It uses the Extended Euclidean Algorithm, which is suitable for prime moduli.
 * @param {number} num The number for which to find the modular inverse.
 * @returns {number} The modular inverse of `num` (i.e., `x` such that `(num * x) % PRIME_MODULUS === 1`).
 */
const calculateModularInverse = function (num) {
  let a = num;
  let b = PRIME_MODULUS;
  let x0 = 1, y0 = 0; // Bezout coefficients for 'a'
  let x1 = 0, y1 = 1; // Bezout coefficients for 'b'

  // Standard Extended Euclidean Algorithm implementation.
  while (b !== 0) {
    const quotient = Math.floor(a / b);
    // Update 'a' and 'b'
    let tempA = a;
    a = b;
    b = tempA % b;

    // Update Bezout coefficients (only x-coefficients are directly needed for the inverse).
    let tempX = x0;
    x0 = x1;
    x1 = tempX - quotient * x1;

    // (y-coefficients are typically updated as well, but not strictly necessary for inverse of 'a')
    // let tempY = y0;
    // y0 = y1;
    // y1 = tempY - quotient * y1;
  }

  // Ensure the inverse is positive and within the modulus range.
  let inverseResult = x0 % PRIME_MODULUS;
  return inverseResult < 0 ? inverseResult + PRIME_MODULUS : inverseResult;
};

/**
 * Computes the number of permutations (nPr) modulo `PRIME_MODULUS`.
 * The formula for nPr is n! / (n-r)!. This is calculated as n! * ( (n-r)! )^-1 mod P.
 * Factorials are precomputed using `precomputeFactorials`.
 * @param {number} totalItems The total number of items available (n).
 * @param {number} itemsToChoose The number of items to choose for permutation (r).
 * @returns {number} The value of nPr modulo `PRIME_MODULUS`. Returns 0 for invalid inputs, 1 for nP0.
 */
const computePermutationModulo = function (totalItems, itemsToChoose) {
  // Guard clauses for invalid or trivial permutation inputs.
  if (itemsToChoose < 0 || itemsToChoose > totalItems) {
    return 0; // Cannot choose more items than available, or negative items.
  }
  if (itemsToChoose === 0) {
    return 1; // nP0 is always 1.
  }

  // Ensure all necessary factorials are available in the cache.
  precomputeFactorials(totalItems);

  // Calculate the numerator: n! mod P.
  const numeratorFactorial = factorialCache[totalItems];

  // Calculate the denominator term: (n-r)! mod P.
  // Using `safeModSubtract` to ensure the argument for factorialCache is non-negative.
  const denominatorIndex = (totalItems - itemsToChoose + PRIME_MODULUS) % PRIME_MODULUS;
  const denominatorFactorialInverse = calculateModularInverse(factorialCache[denominatorIndex]);

  // The result is (n! * ( (n-r)! )^-1) mod P.
  return performModMultiplication(numeratorFactorial, denominatorFactorialInverse);
};

/**
 * Calculates modular exponentiation (baseValue ^ exponent) modulo `PRIME_MODULUS`
 * using the binary exponentiation (exponentiation by squaring) method.
 * This method is efficient for large exponents.
 * @param {number} baseValue The base of the exponentiation.
 * @param {number} exponent The power to which the base is raised.
 * @returns {number} The result of (baseValue ^ exponent) % PRIME_MODULUS.
 */
const calculatePowerModulo = function (baseValue, exponent) {
  let resultAccumulator = 1;
  let currentBase = baseValue % PRIME_MODULUS; // Normalize base to be within modulus.

  // Handle cases where exponent is non-positive.
  // For this problem context, exponents are typically non-negative integers.
  if (exponent < 0) {
    // If negative exponents were allowed, it would involve modular inverse:
    // result = calculatePowerModulo(calculateModularInverse(baseValue), -exponent);
    return 0; // Assuming non-negative exponent for this problem.
  }
  if (exponent === 0) {
    return 1; // Any number to the power of 0 is 1 (modulo P).
  }

  // Binary exponentiation loop.
  while (exponent > 0) {
    if (exponent % 2 === 1) { // If the current bit of the exponent is 1.
      resultAccumulator = performModMultiplication(resultAccumulator, currentBase);
    }
    currentBase = performModMultiplication(currentBase, currentBase); // Square the base.
    exponent = Math.floor(exponent / 2); // Halve the exponent.
  }
  return resultAccumulator;
};

/**
 * A helper function to perform modular subtraction, ensuring the result is always positive.
 * @param {number} a The minuend.
 * @param {number} b The subtrahend.
 * @param {number} modulus The modulus.
 * @returns {number} `(a - b + modulus) % modulus`, guaranteed to be non-negative.
 */
const safeModSubtract = (a, b, modulus) => (a - b % modulus + modulus) % modulus;


// --- Main Problem Solving Logic ---

/**
 * The primary function that orchestrates reading input, performing calculations,
 * and generating the final output for the problem.
 * It processes a series of queries, each involving specific modular arithmetic.
 * @returns {string} A string where each line represents the computed result for a query.
 */
function executeSolution() {
  const numberOfQueries = inputHandler.getNextElement();
  const solutionResults = []; // Stores results for each query, to be joined later.

  // Precompute factorials up to the modulus itself.
  // This is a common optimization for problems involving modular inverse of factorials.
  precomputeFactorials(PRIME_MODULUS);

  // Iterate through each query provided in the input.
  for (let queryIndex = 0; queryIndex < numberOfQueries; queryIndex++) {
    const queryParameters = inputHandler.fetchLineValues();
    // Destructure the input line into its components: x, d, and n.
    const [paramX, paramD, paramN] = queryParameters;

    let currentQueryResult; // Variable to store the computed result for the current query.

    // Guard clause: If n is large enough (>= modulus) or x is zero, the result is 0.
    // This is because nPr will result in 0 or x^n will be 0.
    if (paramN >= PRIME_MODULUS || paramX === 0) {
      currentQueryResult = 0;
    } else if (paramD === 0) {
      // Special case: if 'd' is zero, the expression simplifies to x^n mod P.
      currentQueryResult = calculatePowerModulo(paramX, paramN);
    } else {
      // General case: 'd' is non-zero.
      // The problem asks for (X * (X+D) * ... * (X+(N-1)D)) % MOD
      // This can be rewritten as (D^N * (X/D) * (X/D + 1) * ... * (X/D + N-1)) % MOD
      // Let A = X/D mod MOD. Then it becomes (D^N * A * (A+1) * ... * (A+N-1)) % MOD
      // The product A * (A+1) * ... * (A+N-1) is equivalent to P(A+N-1, N) * ( (A-1)! )^-1
      // Or more simply, (A+N-1)! / (A-1)!
      // The given solution structure suggests: P( (MOD - X * D^-1) % MOD, N) * (MOD - D)^N
      // Let adjustedA = (MOD - X * D^-1) % MOD.
      // This is a common transformation for (X * (X+D) * ... * (X+(N-1)D)) % MOD
      // when working with permutations.
      const dInverse = calculateModularInverse(paramD);
      const termX_D_Inverse = performModMultiplication(paramX, dInverse);
      const adjustedA = safeModSubtract(PRIME_MODULUS, termX_D_Inverse, PRIME_MODULUS);

      // Calculate the permutation component: P(adjustedA, paramN) mod PRIME_MODULUS.
      const permutationComponent = computePermutationModulo(adjustedA, paramN);

      // Calculate the power component: (PRIME_MODULUS - paramD)^paramN mod PRIME_MODULUS.
      // Using safeModSubtract to handle potential negative intermediate results gracefully.
      const baseForPower = safeModSubtract(PRIME_MODULUS, paramD, PRIME_MODULUS);
      const powerComponent = calculatePowerModulo(baseForPower, paramN);

      // The final result for the general case is the product of these two components.
      currentQueryResult = performModMultiplication(permutationComponent, powerComponent);
    }
    // Add the computed result for the current query to our list.
    solutionResults.push(currentQueryResult);
  }

  // Join all individual results with newline characters for the final output string.
  return solutionResults.join("\n");
}

// Execute the main solution logic and print the aggregated results to the console.
console.log(executeSolution());