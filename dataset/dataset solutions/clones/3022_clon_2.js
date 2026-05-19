const INPUT_PARSER = (function () {
  // This factory function creates an instance of the InputReader.
  function createParser(inputString) {
    return new InputReader(inputString);
  }

  // The InputReader class handles parsing lines from the provided string.
  function InputReader(inputString) {
    this._lines = inputString.trim().split("\n"); // Stores all input lines.
    this._currentLineIndex = 0x0; // Pointer to the current line being processed.
  }

  // Reads a single value from the current line. Values are consumed from right to left
  // after the line is reversed.
  InputReader.prototype.readSingleValue = function (asStrings) {
    let lineArray = this._lines;
    let lineIdx = this._currentLineIndex;
    let resultValue;

    // If the current line is still a single string, split it into words and reverse.
    // This allows popping from the end to get values from the beginning of the original line.
    if (typeof lineArray[lineIdx] === "string") {
      lineArray[lineIdx] = lineArray[lineIdx].split(" ").reverse();
    }

    // Extract the last element (which was the first in the original line).
    resultValue = lineArray[lineIdx].pop();

    // If the current line is now empty, advance the line pointer.
    if (!lineArray[lineIdx].length) {
      this._currentLineIndex++;
    }

    // Return the value as a string or a number based on the 'asStrings' flag.
    return asStrings ? resultValue : +resultValue;
  };

  // Reads an entire line of space-separated values.
  InputReader.prototype.readLineValues = function (asStrings) {
    // Get the current line, split it by spaces, and then advance the line pointer.
    let lineParts = this._lines[this._currentLineIndex++].split(" ");
    // Return the parts as strings or convert them to numbers.
    return asStrings ? lineParts : lineParts.map((item) => +item);
  };

  // Reads 'numLines' lines and processes them as a matrix (array of arrays).
  InputReader.prototype.readMatrix = function (numLines, asStrings) {
    // Slice the specified number of lines and split each line into words.
    let matrixRows = this._lines
      .slice(this._currentLineIndex, (this._currentLineIndex += numLines))
      .map((item) => item.split(" "));
    // Return the matrix as strings or convert all elements to numbers.
    return asStrings
      ? matrixRows
      : matrixRows.map((row) => row.map((item) => +item));
  };

  // Reads 'numLines' lines and processes each line as a single number.
  InputReader.prototype.readLinesAsNumbers = function (numLines, asStrings) {
    // Slice the specified number of lines.
    let numberLines = this._lines.slice(
      this._currentLineIndex,
      (this._currentLineIndex += numLines)
    );
    // Return the lines as strings or convert each line to a number.
    return asStrings ? numberLines : numberLines.map((item) => +item);
  };

  return createParser; // The IIFE returns the factory function.
})();

/**
 * Creates a multi-dimensional array initialized with a specific value.
 * The dimensions are passed as subsequent arguments after the initial value.
 * @param {*} initialValue - The value to initialize array elements with.
 * @param {...number} dimensions - The sizes of each dimension.
 * @returns {Array} The multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
  const dimensions = arguments;
  let dimCount = dimensions.length;
  // Start building the array creation string from the innermost dimension.
  let arrayCreationString = `Array(dimensions[${--dimCount}]).fill(0x0).map(x => { return ${initialValue}; })`;

  // Wrap the string with outer Array.map calls for each remaining dimension.
  while (--dimCount) {
    arrayCreationString = `Array(dimensions[${dimCount}]).fill(0x0).map(x => ${arrayCreationString})`;
  }

  // Use eval to execute the dynamically generated array creation code.
  return eval(arrayCreationString);
}

const MODULUS_VAL = 998244353; // A large prime modulus used for all modular arithmetic operations.

/**
 * Performs modular multiplication for an arbitrary number of arguments.
 * This function uses a specific optimization to handle intermediate products
 * that might exceed standard 32-bit integer limits before the modulo operation.
 * It splits numbers into 16-bit parts to perform multiplication.
 * @param {...number} operands - Numbers to multiply.
 * @returns {number} The product of all operands modulo MODULUS_VAL.
 */
function multiplyMod() {
  const operands = arguments;
  let currentProduct = operands[0x0]; // Initialize with the first operand.
  let operandIndex = 0x1;

  // Iterate through the remaining operands.
  while (operandIndex < operands.length) {
    // This calculation is equivalent to (currentProduct * operands[operandIndex]) % MODULUS_VAL
    // but is designed to prevent overflow for large numbers by breaking down the multiplication.
    currentProduct =
      ((currentProduct >>> 0x10) * operands[operandIndex] % MODULUS_VAL * 0x10000 +
        (currentProduct & 0xFFFF) * operands[operandIndex++]) %
      MODULUS_VAL;
  }
  return currentProduct;
}

/**
 * Computes (baseVal ^ exponentVal) % MODULUS_VAL using the binary exponentiation (exponentiation by squaring) algorithm.
 * This method efficiently calculates large powers by repeatedly squaring the base and multiplying
 * only when the corresponding bit in the exponent is set.
 * @param {number} baseVal - The base number.
 * @param {number} exponentVal - The exponent.
 * @returns {number} The result of (baseVal ^ exponentVal) % MODULUS_VAL.
 */
function powerMod(baseVal, exponentVal) {
  let resultAccumulator = 0x1; // Initialize the result to 1 (any number to the power of 0 is 1).

  // Loop while the exponent is greater than 0.
  for (; exponentVal; baseVal = multiplyMod(baseVal, baseVal), exponentVal >>= 0x1) {
    // If the least significant bit of the exponent is 1, multiply the result by the current base.
    if (exponentVal & 0x1) {
      resultAccumulator = multiplyMod(baseVal, resultAccumulator);
    }
  }
  return resultAccumulator;
}

// Read input from standard input using the custom parser.
const inputData = INPUT_PARSER(
  require("fs").readFileSync("/dev/stdin", "utf8")
);

// Output the result of the main calculation function.
console.log(executeCalculation());

/**
 * Main function to perform the problem's core calculation.
 * It uses dynamic programming to count subsets with specific sums and combines results.
 * @returns {number} The final calculated answer modulo MODULUS_VAL.
 */
function executeCalculation() {
  // Read the number of elements for the array.
  const elementCount = inputData.readSingleValue();

  // Read the array of numbers, then sort it in ascending order.
  const dataArray = inputData.readLinesAsNumbers(elementCount).sort((valA, valB) => valA - valB);

  // Calculate the total sum of all elements in the dataArray.
  const totalSum = dataArray.reduce((acc, current) => acc + current);

  // Initialize the dynamic programming array. `dynamicProgression[k]` will store the count
  // of ways to achieve sum `k` using a subset of elements processed so far.
  // `dynamicProgression[0]` is initialized to 1, representing one way to achieve a sum of 0 (the empty set).
  let dynamicProgression = [0x1];

  // Iterate through each number in the `dataArray`.
  for (let outerLoopIndex = 0x0; outerLoopIndex < elementCount; outerLoopIndex++) {
    // Create a new DP array for the current iteration. Its size is `previous_max_sum + current_element`.
    const nextDynamicProgression = createMultiDimArray(
      0x0,
      dynamicProgression.length + dataArray[outerLoopIndex]
    );

    // Iterate through the sums achievable in the previous DP state.
    for (let innerLoopIndex = 0x0; innerLoopIndex < dynamicProgression.length; innerLoopIndex++) {
      // If `dynamicProgression[innerLoopIndex]` is non-zero, it means sum `innerLoopIndex` is achievable.
      if (dynamicProgression[innerLoopIndex] > 0x0) {
        // Option 1: Do not include `dataArray[outerLoopIndex]` in the current subset.
        // The problem's specific logic implies a doubling of counts for existing sums.
        nextDynamicProgression[innerLoopIndex] =
          (nextDynamicProgression[innerLoopIndex] +
            dynamicProgression[innerLoopIndex] * 0b10) %
          MODULUS_VAL;

        // Option 2: Include `dataArray[outerLoopIndex]` in the current subset.
        // This contributes to the count for sum `innerLoopIndex + dataArray[outerLoopIndex]`.
        nextDynamicProgression[innerLoopIndex + dataArray[outerLoopIndex]] =
          (nextDynamicProgression[innerLoopIndex + dataArray[outerLoopIndex]] +
            dynamicProgression[innerLoopIndex]) %
          MODULUS_VAL;
      }
    }
    // Update the `dynamicProgression` array for the next iteration.
    dynamicProgression = nextDynamicProgression;
  }

  // Calculate the initial part of the answer: 3 raised to the power of `elementCount` (modulo MODULUS_VAL).
  let finalAnswer = powerMod(0x3, elementCount);

  // If the `totalSum` is even, add the result of a specific subproblem calculation.
  if (totalSum % 0b10 === 0x0) {
    finalAnswer = (finalAnswer + calculateSubproblem(dataArray, elementCount, totalSum / 0b10)) % MODULUS_VAL;
  }

  // Calculate `halfSum` as `ceil(totalSum / 2)`. This is equivalent to `(totalSum + 1) / 2` using integer division.
  let halfSum = (totalSum + 0x1) >> 0x1;

  // Subtract contributions from sums that are greater than or equal to `halfSum`.
  // Each such contribution is multiplied by 3.
  for (let innerLoopIndex = halfSum; innerLoopIndex < dynamicProgression.length; innerLoopIndex++) {
    finalAnswer =
      (finalAnswer - dynamicProgression[innerLoopIndex] * 0x3) % MODULUS_VAL;
  }

  // Ensure the final answer is positive before returning by adding MODULUS_VAL if it's negative.
  return (finalAnswer + MODULUS_VAL) % MODULUS_VAL;
}

/**
 * Calculates a subproblem, which is a variation of the subset sum problem.
 * It counts the number of ways to achieve a `targetSum` using elements from `inputNumbers`.
 * @param {Array<number>} inputNumbers - The array of numbers to choose from.
 * @param {number} numElements - The number of elements in `inputNumbers`.
 * @param {number} targetSum - The specific sum to achieve.
 * @returns {number} The count of ways to achieve `targetSum`, multiplied by 3, modulo MODULUS_VAL.
 */
function calculateSubproblem(inputNumbers, numElements, targetSum) {
  // Initialize DP array: `currentDP[k]` stores the count of ways to achieve sum `k`.
  // `currentDP[0]` is 1 (one way to make sum 0, by choosing no elements).
  let currentDP = [0x1];

  // Iterate through each number in the `inputNumbers` array.
  for (let idx = 0x0; idx < numElements; idx++) {
    // Create a new DP array for the current iteration.
    const nextDP = createMultiDimArray(
      0x0,
      currentDP.length + inputNumbers[idx]
    );

    // Iterate through the sums achievable in the previous DP state.
    for (let sumIdx = 0x0; sumIdx < currentDP.length; sumIdx++) {
      // If `currentDP[sumIdx]` is non-zero, it means sum `sumIdx` is achievable.
      if (currentDP[sumIdx] > 0x0) {
        // Option 1: Do not include `inputNumbers[idx]` in the current subset.
        nextDP[sumIdx] = (nextDP[sumIdx] + currentDP[sumIdx]) % MODULUS_VAL;

        // Option 2: Include `inputNumbers[idx]` in the current subset.
        nextDP[sumIdx + inputNumbers[idx]] =
          (nextDP[sumIdx + inputNumbers[idx]] + currentDP[sumIdx]) %
          MODULUS_VAL;
      }
    }
    // Update the `currentDP` array for the next iteration.
    currentDP = nextDP;
  }

  // Return the count for the `targetSum`, multiplied by 3, modulo MODULUS_VAL.
  return (currentDP[targetSum] * 0x3) % MODULUS_VAL;
}
