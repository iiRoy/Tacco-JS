"use strict"; // Enforce strict mode for cleaner code practices

// --- Input Processing Utilities ---
// Reads entire input from stdin, assumes UTF-8 encoding.
const rawInputData = require('node:fs').readFileSync('/dev/stdin', 'utf8');

// Splits the input into tokens by any whitespace and initializes a token index.
// .trim() removes leading/trailing whitespace to prevent empty tokens at start/end.
const tokenBuffer = rawInputData.trim().split(/\s+/);
let tokenIndex = 0;

/**
 * Parses and returns the next token from the buffer as an integer.
 * @returns {number} The parsed integer value.
 */
function parseNextInt() {
  return Number(tokenBuffer[tokenIndex++]);
}

/**
 * Returns the next token from the buffer as a string.
 * @returns {string} The next string token.
 */
function fetchNextString() {
  return tokenBuffer[tokenIndex++];
}

/**
 * Parses and returns the next token from the buffer as a BigInt.
 * @returns {bigint} The parsed BigInt value.
 */
function extractBigInt() {
  return BigInt(tokenBuffer[tokenIndex++]);
}

/**
 * Reads 'count' elements from the input buffer.
 * If 'shouldParseNumbers' is true (or truthy), parses them as numbers; otherwise, returns them as strings.
 * @param {number} count - The number of elements to read.
 * @param {boolean} [shouldParseNumbers=false] - Flag indicating whether to convert elements to numbers.
 * @returns {Array<number|string>} An array containing the read elements.
 */
function getArrayOfNumbers(count, shouldParseNumbers) {
  const segment = tokenBuffer.slice(tokenIndex, tokenIndex + count);
  tokenIndex += count;
  return shouldParseNumbers ? segment.map(Number) : segment;
}

/**
 * Reads a 2D array (matrix) of specified 'rows' and 'cols' from the input buffer.
 * If 'shouldParseNumbers' is true, parses elements as numbers; otherwise, returns them as strings.
 * @param {number} rows - The number of rows for the matrix.
 * @param {number} cols - The number of columns for each row.
 * @param {boolean} [shouldParseNumbers=false] - Flag indicating whether to convert elements to numbers.
 * @returns {Array<Array<number|string>>} A 2D array representing the matrix.
 */
function getMatrix(rows, cols, shouldParseNumbers) {
  const matrix = [];
  for (let r = 0; r < rows; ++r) {
    const rowSegment = tokenBuffer.slice(tokenIndex, tokenIndex + cols);
    tokenIndex += cols;
    matrix.push(shouldParseNumbers ? rowSegment.map(Number) : rowSegment);
  }
  return matrix;
}

/**
 * Recursively creates a multi-dimensional array filled with an initial value.
 * This function provides a safe alternative to `eval` for array creation.
 * Example: `createMultiDimensionalArray(0, 2, 3)` returns `[[0,0,0], [0,0,0]]`.
 * @param {*} initialValue - The value to pre-fill all elements of the array with.
 * @param {...number} dimensions - A variadic list of numbers specifying the size of each dimension.
 * @returns {Array} The newly created multi-dimensional array.
 */
function createMultiDimensionalArray(initialValue, ...dimensions) {
  // Base case: If no more dimensions are specified, return the initial value.
  if (dimensions.length === 0) {
    return initialValue;
  }

  // Get the size for the current dimension from the list.
  const currentDimensionSize = dimensions[0];
  // Prepare the remaining dimensions for the next recursive call.
  const remainingDimensions = dimensions.slice(1);

  // Create an array of the current dimension's size.
  // For each element, recursively call this function to build the next dimension.
  return Array.from({ length: currentDimensionSize }, () => {
    return createMultiDimensionalArray(initialValue, ...remainingDimensions);
  });
}

// --- Main Program Execution ---
// Call the primary solution function and capture its output.
const programOutput = executeSolution();

// If the solution function returns a defined value, print it to standard output.
// Using `process.stdout.write` allows for explicit control over newlines.
if (programOutput !== undefined) {
  process.stdout.write(String(programOutput) + '\n');
}

/**
 * The core function encapsulating the problem's solution logic.
 * It processes a binary string based on specific modulo operations related to popcount.
 * @returns {string} A newline-separated string of results for each bit position.
 */
function executeSolution() {
  const stringLength = parseNextInt(); // Read the length N of the binary string
  const binaryString = fetchNextString(); // Read the binary string X

  // --- First Pass: Calculations based on (original_popcount + 1) ---

  // Determine the original popcount (number of '1's) in the binary string.
  let originalPopCount = 0;
  for (let k = 0; k < stringLength; ++k) {
    if (binaryString[k] === '1') {
      originalPopCount++;
    }
  }

  // Define the modulus for the first set of operations: (popcount + 1).
  // This modulus is used when considering flipping a '0' bit to a '1'.
  const modulusForZeroFlip = originalPopCount + 1;

  // Initialize the result array, where resultArray[i] will store the
  // number of popcount operations for the i-th bit position.
  const resultArray = createMultiDimensionalArray(0, stringLength);

  // Calculate the initial value of the entire binary string (interpreted as a number)
  // modulo `modulusForZeroFlip`. This is `M % (popcount + 1)`.
  let currentModuloSum = 0;
  for (let idx = 0; idx < stringLength; ++idx) {
    currentModuloSum = (currentModuloSum * 2 + Number(binaryString[idx])) % modulusForZeroFlip;
  }

  // Initialize a variable to track powers of 2 modulo `modulusForZeroFlip`.
  // `currentPowerOfTwoMod` will represent `2^(stringLength - 1 - idx) % modulusForZeroFlip`.
  // It starts at `2^0 = 1` for the last digit (index `stringLength - 1`).
  let currentPowerOfTwoMod = 1;

  // Iterate backwards through the binary string, from the least significant bit to the most.
  for (let idx = stringLength - 1; idx >= 0; --idx) {
    // If the current bit at `idx` is '0', we consider flipping it to '1'.
    if (binaryString[idx] === '0') {
      // When a '0' is flipped to '1', the number increases by `2^(stringLength - 1 - idx)`.
      // The new number modulo `modulusForZeroFlip` is:
      // (original_number_modulo + current_power_of_two_modulo) % modulus
      const valueIfFlippedToOne = (currentModuloSum + currentPowerOfTwoMod) % modulusForZeroFlip;

      // Now, calculate how many `calculatePopCount` operations are needed to reduce
      // `valueIfFlippedToOne` to zero.
      let tempCalculationValue = valueIfFlippedToOne;
      let operationsCount = 1; // Start with 1, as per the problem's logic (even if 0, it counts as 1 op).

      // Only perform further calculations if the value is not already zero.
      if (tempCalculationValue !== 0) {
        while (tempCalculationValue !== 0) {
          const popCountOfCurrent = calculatePopCount(tempCalculationValue);
          // A positive number always has a popcount of at least 1. If popCountOfCurrent were 0,
          // it would imply tempCalculationValue is 0, which would terminate the loop.
          // This check is a safeguard, though unlikely to be triggered for positive values.
          if (popCountOfCurrent === 0) {
             break;
          }
          tempCalculationValue %= popCountOfCurrent;
          operationsCount++;
        }
      }
      resultArray[idx] = operationsCount;
    }
    // Update the power-of-two term for the next iteration (moving to the next higher power).
    currentPowerOfTwoMod = (currentPowerOfTwoMod * 2) % modulusForZeroFlip;
  }

  // --- Second Pass: Calculations based on (original_popcount - 1) ---

  // Define the modulus for the second set of operations: (popcount - 1).
  // This modulus is used when considering flipping a '1' bit to a '0'.
  const modulusForOneFlip = originalPopCount - 1;

  // Handle the edge case where `modulusForOneFlip` is non-positive (0 or less).
  // This occurs if the original binary string had 0 or 1 '1's.
  // In such cases, division by zero would occur, so we simply return the results
  // computed in the first pass (where only '0' bits were considered).
  if (modulusForOneFlip <= 0) {
    return resultArray.join('\n');
  }

  // Recalculate the initial value of the entire binary string modulo `modulusForOneFlip`.
  // This is `M % (popcount - 1)`.
  currentModuloSum = 0;
  for (let idx = 0; idx < stringLength; ++idx) {
    currentModuloSum = (currentModuloSum * 2 + Number(binaryString[idx])) % modulusForOneFlip;
  }

  // Initialize a variable to track powers of 2 modulo `modulusForOneFlip` for subtraction.
  // `negativePowerOfTwoMod` will represent `-(2^(stringLength - 1 - idx)) % modulusForOneFlip`.
  // It starts at `modulusForOneFlip - 1` (equivalent to -1) for the last digit.
  let negativePowerOfTwoMod = modulusForOneFlip - 1;

  // Iterate backwards through the binary string.
  for (let idx = stringLength - 1; idx >= 0; --idx) {
    // If the current bit at `idx` is '1', we consider flipping it to '0'.
    if (binaryString[idx] === '1') {
      // When a '1' is flipped to '0', the number decreases by `2^(stringLength - 1 - idx)`.
      // The new number modulo `modulusForOneFlip` is:
      // (original_number_modulo - current_power_of_two_modulo) % modulus.
      // This is effectively achieved by `(currentModuloSum + negativePowerOfTwoMod) % modulus`
      // due to how `negativePowerOfTwoMod` is initialized and updated.
      const valueIfFlippedToZero = (currentModuloSum + negativePowerOfTwoMod) % modulusForOneFlip;

      // Calculate how many `calculatePopCount` operations are needed to reduce
      // `valueIfFlippedToZero` to zero.
      let tempCalculationValue = valueIfFlippedToZero;
      let operationsCount = 1; // Start with 1, as per problem logic.

      // Only perform further calculations if the value is not already zero.
      if (tempCalculationValue !== 0) {
        while (tempCalculationValue !== 0) {
          const popCountOfCurrent = calculatePopCount(tempCalculationValue);
          if (popCountOfCurrent === 0) {
              break; // Safety break.
          }
          tempCalculationValue %= popCountOfCurrent;
          operationsCount++;
        }
      }
      resultArray[idx] = operationsCount;
    }
    // Update the negative power-of-two term for the next iteration.
    negativePowerOfTwoMod = (negativePowerOfTwoMod * 2) % modulusForOneFlip;
  }

  // Join the calculated results for each bit position with newlines and return the string.
  return resultArray.join('\n');
}

/**
 * Calculates the Hamming weight (popcount) of a 32-bit unsigned integer.
 * This function uses a highly optimized bit manipulation algorithm, often called "Hacker's Delight" popcount.
 * It's efficient for counting set bits (1s) in a number's binary representation.
 * @param {number} numValue - The non-negative integer for which to calculate the popcount.
 * @returns {number} The count of set bits in the binary representation of `numValue`.
 */
function calculatePopCount(numValue) {
  // Ensure the number is treated as an unsigned 32-bit integer.
  // JavaScript bitwise operators treat numbers as signed 32-bit integers.
  // The `>>> 0` forces it to an unsigned 32-bit representation.
  let bits = numValue >>> 0;

  // Step 1: Count bits in pairs (2 bits per group).
  // 0x55555555 is 01010101... in binary.
  // `bits & 0x55555555` isolates bits at odd positions.
  // `(bits >> 1) & 0x55555555` isolates bits at even positions and shifts them.
  // Adding them sums the bits in each 2-bit group.
  bits = (bits & 0x55555555) + ((bits >> 1) & 0x55555555);

  // Step 2: Count bits in groups of 4 (4 bits per group).
  // 0x33333333 is 00110011... in binary.
  // Similar logic: sum results from 2-bit groups into 4-bit groups.
  bits = (bits & 0x33333333) + ((bits >> 2) & 0x33333333);

  // Step 3: Count bits in groups of 8 (8 bits per group).
  // 0x0f0f0f0f is 0000111100001111... in binary.
  bits = (bits & 0x0f0f0f0f) + ((bits >> 4) & 0x0f0f0f0f);

  // Step 4: Count bits in groups of 16 (16 bits per group).
  // 0x00ff00ff is 00000000111111110000000011111111... in binary.
  bits = (bits & 0x00ff00ff) + ((bits >> 8) & 0x00ff00ff);

  // Step 5: Count bits in groups of 32 (32 bits per group).
  // 0x0000ffff is 00000000000000001111111111111111... in binary.
  // This final addition sums the popcounts of the two 16-bit halves.
  return (bits & 0x0000ffff) + ((bits >> 16) & 0x0000ffff);
}