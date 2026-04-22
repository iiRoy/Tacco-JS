"use strict";

// This section handles reading input from standard I/O in a competitive programming context.
// It parses the entire input file into an array of tokens for efficient access.

// File system module for reading input.
const fileSystemInterface = require("fs");

// Read the entire standard input stream as a UTF-8 string.
let rawInputContents = fileSystemInterface.readFileSync("/dev/stdin", "utf8");

// Split the input string into individual tokens using spaces or newlines as separators.
// This creates a global array of strings that will be consumed sequentially.
let inputTokenBuffer = rawInputContents.split(/ |\n/);

// A pointer to the current token being read from `inputTokenBuffer`.
let currentTokenPointer = 0;

/**
 * Retrieves the next token from the input buffer.
 * By default, it attempts to convert the token to a number.
 *
 * @param {boolean} [retrieveAsString=false] - If true, the token is returned as a string; otherwise, as a number.
 * @returns {string|number} The next token from the input stream.
 */
function fetchNextToken(retrieveAsString = false) {
  // In competitive programming, we typically assume valid input and won't run out of tokens.
  // A robust implementation might include bounds checking here.
  const tokenValue = inputTokenBuffer[currentTokenPointer++];
  return retrieveAsString ? tokenValue : Number(tokenValue);
}

/**
 * Reads a specified number of tokens and returns them as an array.
 *
 * @param {number} count - The number of tokens to read.
 * @param {boolean} [returnStrings=false] - If true, elements are strings; otherwise, numbers.
 * @returns {Array<string|number>} An array containing the requested tokens.
 */
function fetchTokensAsList(count, returnStrings = false) {
  const startIdx = currentTokenPointer;
  const endIdx = currentTokenPointer + count;
  currentTokenPointer = endIdx; // Advance the pointer

  const slicedTokens = inputTokenBuffer.slice(startIdx, endIdx);
  return returnStrings ? slicedTokens : slicedTokens.map(val => Number(val));
}

/**
 * Reads a matrix (2D array) of numerical or string tokens.
 *
 * @param {number} numRows - The desired number of rows.
 * @param {number} numCols - The desired number of columns per row.
 * @param {boolean} [stringElements=false] - If true, matrix elements are strings; otherwise, numbers.
 * @returns {Array<Array<string|number>>} The constructed matrix.
 */
function fetchMatrixFromInput(numRows, numCols, stringElements = false) {
  const matrixData = [];
  for (let r = 0; r < numRows; ++r) {
    const rowStart = currentTokenPointer;
    const rowEnd = currentTokenPointer + numCols;
    currentTokenPointer = rowEnd; // Update cursor after fetching a row
    const rowTokens = inputTokenBuffer.slice(rowStart, rowEnd);
    matrixData.push(stringElements ? rowTokens : rowTokens.map(Number));
  }
  return matrixData;
}

/**
 * Dynamically creates a multi-dimensional array with specified dimensions and a fill value.
 * This function uses a string-based approach similar to `eval` for construction.
 *
 * @param {*} fillValue - The value to initialize the innermost elements with.
 * @param {...number} arrayDimensions - A variable number of arguments representing the dimensions.
 * @returns {Array} The newly created multi-dimensional array.
 */
function buildDynamicArray(fillValue, ...arrayDimensions) {
  if (arrayDimensions.length === 0) {
    return fillValue; // Base case or error if no dimensions are meaningful.
  }

  let dimensionIdx = arrayDimensions.length - 1;
  // Start with the innermost array creation.
  let arrayInitializerString = `Array(arrayDimensions[${dimensionIdx}]).fill().map(() => { return ${JSON.stringify(fillValue)}; })`;

  // Wrap with outer array creations for each preceding dimension.
  while (--dimensionIdx >= 0) {
    arrayInitializerString = `Array(arrayDimensions[${dimensionIdx}]).fill().map(() => ${arrayInitializerString})`;
  }

  // Use the Function constructor for a controlled 'eval' effect.
  return new Function('arrayDimensions', 'fillValue', `return ${arrayInitializerString}`)(arrayDimensions, fillValue);
}


// --- 64-bit Integer Emulation Functions ---
// These functions operate on numbers represented as `[low32, high32]` arrays,
// where `low32` is an unsigned 32-bit integer and `high32` is a signed 32-bit integer.
// This allows simulation of 64-bit integer arithmetic in JavaScript.

const UNSIGNED_INT_32_MAX = 0xFFFFFFFF; // Max value for unsigned 32-bit
const TWO_TO_THE_32 = 0x100000000;      // Represents 2^32

/**
 * Multiplies two standard JavaScript numbers (up to 32-bit range) and returns
 * their product as a 64-bit pseudo-integer `[low, high]`.
 * This method helps in accurately calculating products that might exceed 32-bit signed limits.
 *
 * @param {number} valA - The first operand.
 * @param {number} valB - The second operand.
 * @returns {Array<number>} The product as a 64-bit pseudo-integer `[low, high]`.
 */
function perform64BitMultiplication(valA, valB) {
  // Decompose `valA` into 16-bit parts to manage intermediate products within JS's safe integer limits.
  const valA_high16 = valA >> 16;
  const valA_low16 = valA & 0xFFFF;

  // Calculate high and low parts of the initial 32-bit product.
  let productHigh = valA_high16 * valB;
  let productLow = valA_low16 * valB;

  // Propagate carries from `productHigh` to `productLow`.
  // The lower 16 bits of `productHigh` contribute to the upper 16 bits of the `productLow`.
  productLow += (productHigh & 0xFFFF) * 0x10000;

  // Shift the remaining higher bits of `productHigh` to get its final value.
  productHigh = Math.floor(productHigh / 0x10000); // Equivalent to `productHigh >> 16`

  // Propagate any overflow from `productLow` into `productHigh`.
  productHigh += Math.floor(productLow / TWO_TO_THE_32);

  // Return the result: `low32` (unsigned) and `high32` (signed).
  return [productLow >>> 0, productHigh >> 0];
}

/**
 * Adds two 64-bit pseudo-integers `[low, high]`.
 * Handles carry propagation from the low 32 bits to the high 32 bits.
 *
 * @param {Array<number>} num1 - The first 64-bit number.
 * @param {Array<number>} num2 - The second 64-bit number.
 * @returns {Array<number>} The sum as a 64-bit pseudo-integer.
 */
function perform64BitAddition(num1, num2) {
  let resultLow = num1[0] + num2[0];
  let resultHigh = num1[1] + num2[1];

  // Check for carry: if `resultLow` exceeds the maximum unsigned 32-bit value.
  if (resultLow > UNSIGNED_INT_32_MAX) {
    resultHigh++;             // Increment the high part due to carry.
    resultLow -= TWO_TO_THE_32; // Wrap `resultLow` around.
  }
  return [resultLow >>> 0, resultHigh >> 0];
}

/**
 * Subtracts one 64-bit pseudo-integer `[low, high]` from another.
 * Handles borrow propagation from the high 32 bits to the low 32 bits.
 *
 * @param {Array<number>} minuend - The number from which to subtract.
 * @param {Array<number>} subtrahend - The number to subtract.
 * @returns {Array<number>} The difference as a 64-bit pseudo-integer.
 */
function perform64BitSubtraction(minuend, subtrahend) {
  let resultLow = minuend[0] - subtrahend[0];
  let resultHigh = minuend[1] - subtrahend[1];

  // Check for borrow: if `resultLow` becomes negative.
  if (resultLow < 0) {
    resultHigh--;             // Decrement the high part due to borrow.
    resultLow += TWO_TO_THE_32; // Unwrap `resultLow`.
  }
  return [resultLow >>> 0, resultHigh >> 0];
}

/**
 * Divides a 64-bit pseudo-integer `[low, high]` by two (performs a right shift by 1).
 * Correctly handles the bit shifted from the high part into the low part.
 *
 * @param {Array<number>} value64 - The 64-bit number to divide.
 * @returns {Array<number>} The result of the division as a 64-bit pseudo-integer.
 */
function perform64BitHalf(value64) {
  // If the high 32-bit part is odd, its least significant bit (1) shifts into
  // the most significant bit of the low 32-bit part (0x80000000).
  const carryFromHighToLow = (value64[1] & 1) ? (TWO_TO_THE_32 / 2) : 0;
  const newLow = (value64[0] >>> 1) + carryFromHighToLow; // Unsigned right shift for low.
  const newHigh = value64[1] >> 1;                         // Signed right shift for high.

  return [newLow >>> 0, newHigh >> 0];
}

/**
 * Compares two 64-bit pseudo-integers `[low, high]`.
 *
 * @param {Array<number>} valA - The first 64-bit number.
 * @param {Array<number>} valB - The second 64-bit number.
 * @returns {number} -1 if valA < valB, 1 if valA > valB, 0 if valA === valB.
 */
function compare64BitNumbers(valA, valB) {
  // Compare the high 32-bit parts first (signed comparison).
  if (valA[1] > valB[1]) return 1;
  if (valA[1] < valB[1]) return -1;

  // If high parts are equal, compare the low 32-bit parts (unsigned comparison).
  // Standard JS comparison works for positive numbers within 32-bit range.
  if (valA[0] > valB[0]) return 1;
  if (valA[0] < valB[0]) return -1;

  // Both parts are equal.
  return 0;
}

/**
 * Converts a 64-bit pseudo-integer `[low, high]` to its decimal string representation.
 * Handles negative numbers by negating, formatting, and prepending a minus sign.
 * This conversion is suitable for numbers up to approximately 10^18.
 *
 * @param {Array<number>} value64 - The 64-bit number.
 * @returns {string} The decimal string representation of the number.
 */
function format64BitToString(value64) {
  let isValueNegative = false;
  // Work with a copy to avoid modifying the original array.
  let tempValue = [...value64];

  // Check for negative numbers.
  // A number is negative if its high part is negative, or if it's -0 (represented as [0, -0] or similar).
  if (tempValue[1] < 0 || (tempValue[1] === 0 && tempValue[0] === 0 && Object.is(tempValue[1], -0))) {
    isValueNegative = true;
    // Perform two's complement negation: `~value + 1`.
    // For `[low, high]`: if `low` is 0, negate `high`. Else, negate `low` (as `2^32 - low`) and negate `high` then decrement.
    if (tempValue[0] === 0) {
      tempValue[1] = -tempValue[1]; // Only high part needs negation.
    } else {
      tempValue[0] = TWO_TO_THE_32 - tempValue[0]; // (UINT32_MAX - low) + 1
      tempValue[1] = -(tempValue[1] + 1);          // Negate high after borrowing.
    }
  }

  // Handle the special case of zero.
  if (tempValue[0] === 0 && tempValue[1] === 0) {
    return "0";
  }

  // Constants for base-10 conversion from 2^32.
  // 2^32 = 4,294,967,296
  // 42949 is floor(2^32 / 10^5)
  // 67296 is 2^32 % 10^5
  const HIGH_PART_FACTOR = 42949;
  const LOW_PART_REMAINDER = 67296;
  const DECIMAL_CHUNK_SIZE = 100000; // Chunk size for converting to string.

  // Combine parts for initial calculation, focusing on chunks of 5 decimal digits.
  // This relies on JS's floating point for intermediate results, but is carefully structured.
  let currentLowPart = tempValue[1] * LOW_PART_REMAINDER + tempValue[0];
  let currentHighPart = tempValue[1] * HIGH_PART_FACTOR + Math.floor(currentLowPart / DECIMAL_CHUNK_SIZE);
  currentLowPart %= DECIMAL_CHUNK_SIZE; // Keep only the last 5 digits of `currentLowPart`.

  let finalString = "";

  // If `currentHighPart` is zero, the number is small enough to be represented by `currentLowPart`.
  if (currentHighPart === 0) {
    finalString = String(currentLowPart);
  } else {
    // Pad `currentLowPart` with leading zeros to ensure 5 digits.
    const paddedLow = String(currentLowPart).padStart(5, '0');
    finalString = String(currentHighPart) + paddedLow;
  }

  // Prepend the negative sign if the original number was negative.
  if (isValueNegative) {
    finalString = "-" + finalString;
  }
  return finalString;
}


// --- Problem-Specific Global Variables ---

// Counter for the number of zeroes encountered in the input.
let zeroInputCount = 0;
// Lists to store negative and positive numbers from input, respectively.
let negativeInputNumbers = [];
let positiveInputNumbers = [];

// Store lengths of the sorted number lists for convenience.
let countOfNegativeNums = 0;
let countOfPositiveNums = 0;

// Immediately execute the main problem-solving logic and print its result.
// This pattern is common in competitive programming to ensure script execution.
const computedResult = (() => {
  return processKthProductChallenge();
})();

// Output the result to the console if it's defined.
if (computedResult !== undefined) {
  console.log(computedResult);
}


/**
 * The main function orchestrating the solution for finding the K-th smallest product.
 * It reads input, categorizes numbers, and dispatches to specific solvers based on product sign.
 *
 * @returns {string|number} The K-th smallest product as a string, or "0" if it falls in the zero range.
 */
function processKthProductChallenge() {
  // Read the total count of numbers (N) and the target rank (K) for the product.
  const totalElementsInInput = fetchNextToken();
  const targetProductRank = fetchNextToken();

  // Basic validation for K. Although constraints usually guarantee K > 0, this is a Type III addition.
  if (targetProductRank <= 0) {
      // If K is invalid, return "0" as a plausible default or error.
      return "0";
  }

  // Iterate through all input numbers to categorize them.
  for (let idx = 0; idx < totalElementsInInput; ++idx) {
    const currentInputValue = fetchNextToken();
    if (currentInputValue === 0) {
      zeroInputCount++;
    } else if (currentInputValue < 0) {
      negativeInputNumbers.push(currentInputValue);
    } else {
      positiveInputNumbers.push(currentInputValue);
    }
  }

  // Update counts for later use.
  countOfNegativeNums = negativeInputNumbers.length;
  countOfPositiveNums = positiveInputNumbers.length;

  // Sort the lists. Negatives in ascending order (e.g., -5, -3, -1).
  // Positives in ascending order (e.g., 1, 2, 3).
  negativeInputNumbers.sort((a, b) => a - b);
  positiveInputNumbers.sort((a, b) => a - b);

  // --- Determine which range the K-th product falls into ---

  // 1. Count of negative products (negative * positive). These are always the smallest.
  let numNegativeProducts = countOfNegativeNums * countOfPositiveNums;

  // If K is within this range, find the K-th negative product.
  if (targetProductRank <= numNegativeProducts) {
    return findKthNegativeProduct(targetProductRank);
  }

  // Adjust K by subtracting the number of negative products.
  let remainingRank = targetProductRank - numNegativeProducts;

  // 2. Count of zero products (any number * 0, or 0 * 0).
  // Number of pairs involving at least one zero:
  // (non-zero numbers * zero numbers) + (zero numbers * (zero numbers - 1) / 2)
  let numZeroProducts = zeroInputCount * (totalElementsInInput - zeroInputCount) +
                        (zeroInputCount * (zeroInputCount - 1)) / 2;

  // If K is within this range, the K-th product is 0.
  if (remainingRank <= numZeroProducts) {
    return "0";
  }

  // Adjust K again by subtracting the number of zero products.
  remainingRank -= numZeroProducts;

  // 3. Count of positive products (negative * negative or positive * positive). These are the largest products.
  // Find the K-th positive product from the remaining rank.
  return findKthPositiveProduct(remainingRank);
}


/**
 * Finds the K-th smallest negative product using binary search.
 * Negative products are formed by multiplying a negative number by a positive number.
 *
 * @param {number} rankToFind - The 1-indexed rank of the desired negative product.
 * @returns {string} The K-th smallest negative product as a string.
 */
function findKthNegativeProduct(rankToFind) {
  // Binary search range for the K-th negative product.
  // `searchUpperLimit`: The current best candidate for the K-th product (smallest magnitude negative, closest to 0).
  // Initialized to -1 (represented as [UINT32_MAX, -1]).
  let searchUpperLimit = [UNSIGNED_INT_32_MAX, -1];
  // `searchLowerLimit`: A value known to be too small (largest magnitude negative, furthest from 0).
  // Initialized to a very small negative number (e.g., -1e18 - 1).
  let searchLowerLimit = perform64BitSubtraction(searchUpperLimit, perform64BitMultiplication(1_000_000_000, 1_000_000_000));

  // The binary search continues as long as the difference between `searchUpperLimit` and `searchLowerLimit` is greater than 1.
  while (compare64BitNumbers(perform64BitSubtraction(searchUpperLimit, searchLowerLimit), [1, 0]) > 0) {
    // Calculate the midpoint `midCandidate` of the current search range.
    const midCandidate = perform64BitHalf(perform64BitAddition(searchUpperLimit, searchLowerLimit));

    let currentProductCount = 0; // Counts products that are <= `midCandidate`.
    let negativeListIndex = 0;   // Pointer for `negativeInputNumbers`.

    // Iterate through positive numbers. For each positive number, count how many negative numbers
    // produce a product less than or equal to `midCandidate`.
    for (let positiveListIndex = 0; positiveListIndex < countOfPositiveNums && currentProductCount < rankToFind; ++positiveListIndex) {
      // `negativeInputNumbers` is sorted ascending (e.g., -5, -3, -1).
      // `positiveInputNumbers` is sorted ascending (e.g., 1, 2, 3).
      // The product `neg[i] * pos[j]` decreases (becomes more negative) as `i` increases for a fixed `j`.
      // Advance `negativeListIndex` as long as the product is less than or equal to `midCandidate`.
      while (negativeListIndex < countOfNegativeNums &&
             compare64BitNumbers(perform64BitMultiplication(negativeInputNumbers[negativeListIndex], positiveInputNumbers[positiveListIndex]), midCandidate) <= 0) {
        negativeListIndex++;
      }
      // All `negativeInputNumbers` from index 0 up to `negativeListIndex - 1` satisfy the condition.
      currentProductCount += negativeListIndex;
    }

    // Adjust the binary search range based on `currentProductCount`.
    // If `rankToFind` is less than or equal to `currentProductCount`, it means `midCandidate`
    // or a smaller (more negative) value is the K-th product. So, `midCandidate` is a possible answer.
    if (rankToFind <= currentProductCount) {
      searchUpperLimit = midCandidate; // Try a smaller (more negative) value.
    } else {
      searchLowerLimit = midCandidate; // `midCandidate` is too small (too negative), need a larger value.
    }
  }

  // `searchUpperLimit` will converge to the K-th smallest negative product.
  return format64BitToString(searchUpperLimit);
}


/**
 * Finds the K-th smallest positive product using binary search.
 * Positive products are formed by multiplying two positive numbers or two negative numbers.
 *
 * @param {number} rankToFind - The 1-indexed rank of the desired positive product.
 * @returns {string} The K-th smallest positive product as a string.
 */
function findKthPositiveProduct(rankToFind) {
  // For multiplying two negative numbers to get a positive, it's often convenient
  // to have the negative list sorted by magnitude (descending) or by value (ascending)
  // and then use two pointers from opposite ends.
  // The original `negativeInputNumbers` is sorted ascending (e.g., -5, -3, -1).
  // Reversing it makes it `[-1, -3, -5]`. This means `negativeInputNumbers[0]` is the least negative
  // (smallest magnitude), and `negativeInputNumbers[countOfNegativeNums-1]` is the most negative (largest magnitude).
  // This modification is an intentional Type III structural change.
  negativeInputNumbers.reverse();

  // Binary search range for the K-th positive product.
  // `searchUpperLimit`: The current best candidate (smallest positive value).
  // Initialized to a very large positive number (e.g., 1e18).
  let searchUpperLimit = perform64BitMultiplication(1_000_000_000, 1_000_000_000);
  // `searchLowerLimit`: A value known to be too small (0).
  let searchLowerLimit = [0, 0];

  // The binary search continues as long as the difference between `searchUpperLimit` and `searchLowerLimit` is greater than 1.
  while (compare64BitNumbers(perform64BitSubtraction(searchUpperLimit, searchLowerLimit), [1, 0]) > 0) {
    const midCandidate = perform64BitHalf(perform64BitAddition(searchUpperLimit, searchLowerLimit));
    let currentProductCount = 0; // Counts products that are <= `midCandidate`.

    // 1. Count (positive * positive) pairs <= `midCandidate`.
    // `positiveInputNumbers` is sorted ascending (e.g., 1, 2, 3, 5).
    // Use a two-pointer approach: `leftPtr` from start, `rightPtr` from end.
    for (let leftPtr = 0, rightPtr = countOfPositiveNums - 1; leftPtr < countOfPositiveNums && currentProductCount < rankToFind; ++leftPtr) {
      // Decrement `rightPtr` as long as `pos[leftPtr] * pos[rightPtr]` is greater than `midCandidate`.
      // We are looking for pairs where `product <= midCandidate`.
      while (rightPtr > leftPtr &&
             compare64BitNumbers(perform64BitMultiplication(positiveInputNumbers[leftPtr], positiveInputNumbers[rightPtr]), midCandidate) > 0) {
        rightPtr--;
      }
      // If `rightPtr` has crossed or met `leftPtr`, no more unique pairs for this `leftPtr`.
      if (rightPtr <= leftPtr) {
        break;
      }
      // All elements from `leftPtr + 1` up to `rightPtr` form valid pairs with `positiveInputNumbers[leftPtr]`.
      currentProductCount += (rightPtr - leftPtr);
    }

    // 2. Count (negative * negative) pairs <= `midCandidate`.
    // `negativeInputNumbers` is now reversed (e.g., -1, -3, -5).
    // Use a two-pointer approach: `leftPtr` from start, `rightPtr` from end.
    for (let leftPtr = 0, rightPtr = countOfNegativeNums - 1; leftPtr < countOfNegativeNums && currentProductCount < rankToFind; ++leftPtr) {
      // Decrement `rightPtr` as long as `neg[leftPtr] * neg[rightPtr]` is greater than `midCandidate`.
      // The products `neg[leftPtr] * neg[rightPtr]` are positive.
      // Since `negativeInputNumbers` is `[-1, -3, -5]`, `neg[leftPtr]` moves towards larger magnitude negatives,
      // and `neg[rightPtr]` also moves towards larger magnitude negatives.
      // Products like `(-1)*(-5)=5`, `(-3)*(-5)=15`. They increase as pointers move towards larger magnitudes.
      while (rightPtr > leftPtr &&
             compare64BitNumbers(perform64BitMultiplication(negativeInputNumbers[leftPtr], negativeInputNumbers[rightPtr]), midCandidate) > 0) {
        rightPtr--;
      }
      if (rightPtr <= leftPtr) {
        break;
      }
      currentProductCount += (rightPtr - leftPtr);
    }

    // Adjust the binary search range based on `currentProductCount`.
    // If `rankToFind` is less than or equal to `currentProductCount`, `midCandidate` is a potential answer.
    if (rankToFind <= currentProductCount) {
      searchUpperLimit = midCandidate; // Try a smaller positive value.
    } else {
      searchLowerLimit = midCandidate; // `midCandidate` is too small, need a larger positive value.
    }
  }

  // `searchUpperLimit` will converge to the K-th smallest positive product.
  return format64BitToString(searchUpperLimit);
}