"use strict";

// --- Input/Output Utilities (Renamed and slightly refactored) ---
const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
const inputTokens = fileContent.split(/ |\n/);
let currentTokenIndex = 0;

function readIntegerToken() {
  return +inputTokens[currentTokenIndex++];
}

function readStringToken() {
  return inputTokens[currentTokenIndex++];
}

// Original `nexts` function, slightly renamed
function getNextTokens(count, asString) {
  const start = currentTokenIndex;
  currentTokenIndex += count;
  if (asString) {
    return inputTokens.slice(start, currentTokenIndex);
  } else {
    return inputTokens.slice(start, currentTokenIndex).map(Number);
  }
}

// Original `nextm` function, slightly renamed
function readMatrixData(height, width, asString) {
  const matrix = [];
  for (let row = 0; row < height; row++) {
    const rowData = getNextTokens(width, asString);
    matrix.push(rowData);
  }
  return matrix;
}

// Original `xArray` function, not used in main logic, minimal rename
function initializeMultiDimArray(initialValue) {
  const args = arguments;
  let dimCount = args.length;
  let arrayCreationString = `Array(args[${--dimCount}]).fill().map(x=>{return ${initialValue};})`;
  while (--dimCount) {
    arrayCreationString = `Array(args[${dimCount}]).fill().map(x=>${arrayCreationString})`;
  }
  return eval(arrayCreationString);
}

// --- 64-bit Integer Arithmetic Functions (Renamed and moderately refactored) ---

const LOW_MASK = 0xffff;
const HIGH_SHIFT_BITS = 16;
const CARRY_THRESHOLD = 0x100000000; // 2^32

function multiply64Bit(valA, valB) {
  const aHigh = valA >>> HIGH_SHIFT_BITS; // Unsigned right shift for high 16 bits
  const aLow = valA & LOW_MASK;           // Low 16 bits

  let productHigh = aHigh * valB; // High part of A * B
  let productLow = aLow * valB;   // Low part of A * B

  // Add the middle 32 bits of the full 64-bit product to the low part
  // This is (A_high * B) & 0xffff, shifted by 16 bits
  productLow += (productHigh & LOW_MASK) << HIGH_SHIFT_BITS;

  // Update productHigh with its own upper 16 bits and any carry from productLow
  productHigh = Math.floor(productHigh / (1 << HIGH_SHIFT_BITS)); // Get the upper 16 bits of productHigh
  productHigh += Math.floor(productLow / CARRY_THRESHOLD);        // Add carry from productLow

  return [productLow >>> 0, productHigh]; // Ensure low part is unsigned 32-bit
}

function add64Bit(valA, valB) {
  let lowSum = valA[0] + valB[0];
  let highSum = valA[1] + valB[1];

  if (lowSum >= CARRY_THRESHOLD) { // Check for carry from low part
    highSum++;
    lowSum -= CARRY_THRESHOLD;
  }
  return [lowSum, highSum >> 0]; // Ensure high part is integer
}

function subtract64Bit(valA, valB) {
  let lowDiff = valA[0] - valB[0];
  let highDiff = valA[1] - valB[1];

  if (lowDiff < 0) { // Check for borrow from high part
    highDiff--;
    lowDiff += CARRY_THRESHOLD;
  }
  return [lowDiff, highDiff >> 0]; // Ensure high part is integer
}

function divide64BitByTwo(valA) {
  const lowPart = valA[0];
  const highPart = valA[1];

  // If highPart is odd, its lowest bit (1) shifts into the highest bit of lowPart after division.
  const carryFromHigh = (highPart & 1) ? (CARRY_THRESHOLD >>> 1) : 0;
  return [(lowPart >>> 1) + carryFromHigh, highPart >> 1];
}

function compare64Bit(valA, valB) {
  if (valA[1] > valB[1]) return 1;
  if (valA[1] < valB[1]) return -1;
  if (valA[0] > valB[0]) return 1;
  if (valA[0] < valB[0]) return -1;
  return 0;
}

const FIVE_DIGIT_GROUP = 100000;
const FIVE_DIGIT_PAD = "00000";

function format64BitToString(bigIntArray) {
  let isNegative = false;
  // Create mutable copies for potential negation
  let currentLow = bigIntArray[0];
  let currentHigh = bigIntArray[1];

  // Handle negative numbers: convert to positive, then add sign later
  if (currentHigh < 0) {
    isNegative = true;
    currentHigh = -currentHigh; // Make high part positive
    if (currentLow !== 0) { // If low part is non-zero, adjust it and decrement high part
      currentLow = CARRY_THRESHOLD - currentLow;
      currentHigh--;
    }
  }

  // Constants derived from 2^32 / 100000 and 2^32 % 100000
  const factorHigh = Math.floor(CARRY_THRESHOLD / FIVE_DIGIT_GROUP); // 42949
  const factorLow = CARRY_THRESHOLD % FIVE_DIGIT_GROUP; // 67296

  // Convert the 64-bit number to base 100000 for string representation
  let tempLow = currentHigh * factorLow + currentLow;
  let tempHigh = currentHigh * factorHigh + Math.floor(tempLow / FIVE_DIGIT_GROUP);
  tempLow %= FIVE_DIGIT_GROUP;

  let stringValue = "";
  if (tempHigh === 0) {
    stringValue += tempLow;
  } else {
    // Pad the low part with leading zeros if necessary
    stringValue = tempHigh + (FIVE_DIGIT_PAD + tempLow).slice(-5);
  }

  if (isNegative && stringValue !== "0") { // Only prepend '-' if it's negative and not zero
    stringValue = "-" + stringValue;
  }
  return stringValue;
}

// --- Global Variables (Renamed) ---
let zeroElementCount = 0;
const negativeElements = [];
const positiveElements = [];
let numNegatives;
let numPositives;

// --- Main Execution Block ---
const finalResult = executeSolution();
if (finalResult !== undefined) {
  console.log(finalResult);
}

// --- Core Logic Functions (Renamed and moderately refactored) ---

function executeSolution() {
  const totalElements = readIntegerToken();
  const targetK = readIntegerToken();

  // Helper function to categorize input numbers into global arrays
  function categorizeInputNumbers(count) {
    for (let i = 0; i < count; i++) {
      const currentValue = readIntegerToken();
      if (currentValue === 0) {
        zeroElementCount++;
      } else if (currentValue < 0) {
        negativeElements.push(currentValue);
      } else {
        positiveElements.push(currentValue);
      }
    }
  }

  categorizeInputNumbers(totalElements);

  numNegatives = negativeElements.length;
  numPositives = positiveElements.length;

  // Sort arrays for efficient two-pointer or binary search approaches
  negativeElements.sort((a, b) => a - b); // Ascending order
  positiveElements.sort((a, b) => a - b); // Ascending order

  // Calculate initial product counts
  let productCount = numNegatives * numPositives; // Count of negative products

  // If targetK falls within the range of negative products
  if (targetK <= productCount) {
    return findKthSmallestNegativeProduct(targetK);
  }

  // Calculate count of zero products
  // This includes products of (zero * non-zero) and (zero * zero)
  const nonZeroCount = totalElements - zeroElementCount;
  const zeroNonZeroProducts = zeroElementCount * nonZeroCount;
  const zeroZeroProducts = zeroElementCount * (zeroElementCount - 1) / 2;
  productCount += zeroNonZeroProducts + zeroZeroProducts;

  // If targetK falls within the range of zero products
  if (targetK <= productCount) {
    return 0; // The K-th product is 0
  }

  // If K-th product is positive, adjust targetK and find it
  return findKthSmallestPositiveProduct(targetK - productCount);
}

function findKthSmallestNegativeProduct(targetK) {
  // Binary search range for negative products
  // `upperBound` represents the smallest magnitude negative product (e.g., -1)
  // `lowerBound` represents the largest magnitude negative product (e.g., -1e18)
  const ONE_64BIT = [1, 0];
  const MAX_NEG_VAL = multiply64Bit(-1e9, 1e9); // Approximately -1e18
  const MIN_NEG_VAL = subtract64Bit([0, 0], ONE_64BIT); // Represents -1

  let upperBound = MIN_NEG_VAL;
  let lowerBound = MAX_NEG_VAL;

  // Binary search loop: while (upperBound - lowerBound > 1)
  while (compare64Bit(subtract64Bit(upperBound, lowerBound), ONE_64BIT) > 0) {
    const midValue = divide64BitByTwo(add64Bit(upperBound, lowerBound));
    let currentCount = 0;
    let negIndex = 0; // Pointer for `negativeElements`

    // Count pairs (negativeElements[negIndex] * positiveElements[posIndex]) <= midValue
    for (let posIndex = 0; posIndex < numPositives && currentCount < targetK; posIndex++) {
      // Move `negIndex` forward while the product is less than or equal to `midValue`
      while (negIndex < numNegatives && compare64Bit(multiply64Bit(negativeElements[negIndex], positiveElements[posIndex]), midValue) <= 0) {
        negIndex++;
      }
      // All `negativeElements` up to `negIndex` form products <= `midValue` with the current `positiveElements[posIndex]`
      currentCount += negIndex;
    }

    if (targetK <= currentCount) {
      upperBound = midValue;
    } else {
      lowerBound = midValue;
    }
  }
  return format64BitToString(upperBound);
}

function findKthSmallestPositiveProduct(targetK) {
  // Reverse `negativeElements` to sort by descending magnitude (largest magnitude first)
  negativeElements.reverse();

  // Binary search range for positive products
  // `upperBound` represents the largest possible positive product (e.g., 1e18)
  // `lowerBound` represents the smallest possible positive product (e.g., 0)
  const MAX_POS_VAL = multiply64Bit(1e9, 1e9); // Approximately 1e18
  const ZERO_64BIT = [0, 0];

  let upperBound = MAX_POS_VAL;
  let lowerBound = ZERO_64BIT;

  // Binary search loop: while (upperBound - lowerBound > 1)
  while (compare64Bit(subtract64Bit(upperBound, lowerBound), [1, 0]) > 0) {
    const midValue = divide64BitByTwo(add64Bit(upperBound, lowerBound));
    let currentCount = 0;

    // Count positive products from `positiveElements` * `positiveElements`
    let rightPointerPos = numPositives - 1;
    for (let leftPointerPos = 0; leftPointerPos < numPositives && currentCount < targetK; leftPointerPos++) {
      // Find the largest `rightPointerPos` such that `positiveElements[leftPointerPos] * positiveElements[rightPointerPos]` is <= `midValue`.
      // If product is > `midValue`, we need a smaller `rightPointerPos`.
      while (rightPointerPos > leftPointerPos && compare64Bit(multiply64Bit(positiveElements[rightPointerPos], positiveElements[leftPointerPos]), midValue) > 0) {
        rightPointerPos--;
      }
      // If `rightPointerPos` has crossed `leftPointerPos`, no more valid pairs for this `leftPointerPos`.
      if (rightPointerPos <= leftPointerPos) {
        break;
      }
      // All elements from `leftPointerPos + 1` to `rightPointerPos` form a valid pair with `positiveElements[leftPointerPos]`.
      currentCount += rightPointerPos - leftPointerPos;
    }

    // Count positive products from `negativeElements` * `negativeElements`
    // `negativeElements` is now sorted descending (largest magnitude first)
    let rightPointerNeg = numNegatives - 1;
    for (let leftPointerNeg = 0; leftPointerNeg < numNegatives && currentCount < targetK; leftPointerNeg++) {
      // Find the largest `rightPointerNeg` such that `negativeElements[leftPointerNeg] * negativeElements[rightPointerNeg]` is <= `midValue`.
      while (rightPointerNeg > leftPointerNeg && compare64Bit(multiply64Bit(negativeElements[rightPointerNeg], negativeElements[leftPointerNeg]), midValue) > 0) {
        rightPointerNeg--;
      }
      if (rightPointerNeg <= leftPointerNeg) {
        break;
      }
      currentCount += rightPointerNeg - leftPointerNeg;
    }

    if (targetK <= currentCount) {
      upperBound = midValue;
    } else {
      lowerBound = midValue;
    }
  }
  return format64BitToString(upperBound);
}
