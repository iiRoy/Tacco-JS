"use strict";

const largeNum = (undefined) => {
  // Constants for the internal chunk-based number representation.
  // Numbers are stored as arrays of 'chunks' in base CHUNK_BASE.
  const CHUNK_BASE = 1e7; // Each chunk holds up to 10 million - 1.
  const CHUNK_DIGITS = 7; // Number of decimal digits per chunk (log10(1e7)).
  
  // JavaScript's maximum safe integer and its representation.
  const JS_MAX_SAFE_INT = 9007199254740992; // 2^53
  const JS_MAX_SAFE_ARR = splitIntoChunks(JS_MAX_SAFE_INT); // JS max safe int as chunk array.
  const JS_MAX_SAFE_LOG = Math.log(JS_MAX_SAFE_INT); // Logarithm for base conversion checks.

  /**
   * Base class for all numeric entities (large or compact).
   * Provides a common interface and prototype chain.
   * @constructor
   * @param {number|string|HugeNumber|CompactNumber} inputValue - The initial value.
   * @param {number} [inputRadix] - The base for string input.
   * @returns {NumericEntity} An instance of HugeNumber or CompactNumber.
   */
  function NumericEntity(inputValue, inputRadix) {
    // If no value is provided, default to zero.
    if (inputValue == null) {
      return NumericEntity.zero;
    }
    // If a radix is specified, parse the string value accordingly.
    if (inputRadix != null) {
      return (+inputRadix === 10) ? processStringInput(inputValue) : parseStringWithBase(inputValue, inputRadix);
    }
    // Otherwise, normalize the input value (number, string, or existing NumericEntity).
    return normalizeInput(inputValue);
  }

  /**
   * Represents a number that exceeds JavaScript's safe integer limits.
   * Internally stored as an array of 'chunks'.
   * @constructor
   * @param {number[]} chunkArray - Array of number chunks (least significant first).
   * @param {boolean} negativeFlag - True if the number is negative.
   */
  function HugeNumber(chunkArray, negativeFlag) {
    this.numericParts = chunkArray;
    this.isNegative = negativeFlag;
    this.isCompact = false; // Flag indicating it's a large number.
  }
  HugeNumber.prototype = Object.create(NumericEntity.prototype);
  HugeNumber.prototype.constructor = HugeNumber;

  /**
   * Represents a number that fits within JavaScript's safe integer limits.
   * Stored directly as a standard JavaScript number.
   * @constructor
   * @param {number} jsValue - The JavaScript number.
   */
  function CompactNumber(jsValue) {
    this.exactVal = jsValue;
    this.isNegative = jsValue < 0;
    this.isCompact = true; // Flag indicating it's a small number.
  }
  CompactNumber.prototype = Object.create(NumericEntity.prototype);
  CompactNumber.prototype.constructor = CompactNumber;

  /**
   * Checks if a given JavaScript number is within the safe integer range.
   * @param {number} num - The number to validate.
   * @returns {boolean} True if safe, false otherwise.
   */
  function isWithinJsRange(num) {
    return num > -JS_MAX_SAFE_INT && num < JS_MAX_SAFE_INT;
  }

  /**
   * Converts a standard JavaScript number into an array of chunks.
   * This is used when a CompactNumber needs to be promoted to a HugeNumber
   * or when parsing a large number from a JS number.
   * @param {number} num - The number to convert.
   * @returns {number[]} An array of chunks.
   */
  function splitIntoChunks(num) {
    // Handle small numbers efficiently.
    if (num < CHUNK_BASE) {
      return [num];
    }
    if (num < CHUNK_BASE * CHUNK_BASE) { // Up to 10^14
      return [num % CHUNK_BASE, Math.floor(num / CHUNK_BASE)];
    }
    // For numbers up to JS_MAX_SAFE_INT (approx 9 * 10^15), requiring three chunks.
    return [num % CHUNK_BASE, Math.floor(num / CHUNK_BASE) % CHUNK_BASE, Math.floor(num / (CHUNK_BASE * CHUNK_BASE))];
  }

  /**
   * Attempts to convert an array of chunks back into a standard JavaScript number.
   * If the number is too large or has too many chunks, the original array is returned.
   * @param {number[]} chunkArr - The array of chunks.
   * @returns {number|number[]} A JavaScript number if it fits, otherwise the original chunk array.
   */
  function recombineChunks(chunkArr) {
    normalizeChunks(chunkArr); // Remove any leading zero chunks.
    const chunkLength = chunkArr.length;

    // Check if the number of chunks is small and its absolute value fits within JS_MAX_SAFE_INT.
    if (chunkLength < 4 && compareAbsoluteChunks(chunkArr, JS_MAX_SAFE_ARR) < 0) {
      switch (chunkLength) {
        case 0: return 0;
        case 1: return chunkArr[0];
        case 2: return chunkArr[0] + chunkArr[1] * CHUNK_BASE;
        case 3: return chunkArr[0] + (chunkArr[1] + chunkArr[2] * CHUNK_BASE) * CHUNK_BASE;
        default: return chunkArr; // Should not happen with chunkLength < 4, but as a fallback.
      }
    }
    return chunkArr;
  }

  /**
   * Removes leading zero chunks from a chunk array, modifying it in place.
   * Essential for canonical representation and correct comparisons.
   * @param {number[]} chunkVector - The array of chunks.
   */
  function normalizeChunks(chunkVector) {
    let currentLength = chunkVector.length;
    while (currentLength > 0 && chunkVector[--currentLength] === 0);
    chunkVector.length = currentLength + 1; // Trim the array.
  }

  /**
   * Creates a new array of a specified length, initialized with zeros.
   * @param {number} len - The desired length of the array.
   * @returns {number[]} A new array filled with zeros.
   */
  function initializeChunkArray(len) {
    const newArray = new Array(len);
    for (let i = 0; i < len; ++i) {
      newArray[i] = 0;
    }
    return newArray;
  }

  /**
   * Truncates a number towards zero (floor for positive, ceil for negative).
   * @param {number} num - The number to truncate.
   * @returns {number} The truncated integer.
   */
  function floorOrCeil(num) {
    return num > 0 ? Math.floor(num) : Math.ceil(num);
  }

  /**
   * Performs addition of two chunk arrays. Assumes `chunkA` is longer or equal in length to `chunkB`.
   * @param {number[]} chunkA - First operand (chunk array).
   * @param {number[]} chunkB - Second operand (chunk array).
   * @returns {number[]} Resulting chunk array.
   */
  function performAddition(chunkA, chunkB) {
    const lenA = chunkA.length;
    const lenB = chunkB.length;
    const result = new Array(lenA);
    let carry = 0;
    let sum;
    let i;

    // Add chunks up to the length of the shorter array.
    for (i = 0; i < lenB; i++) {
      sum = chunkA[i] + chunkB[i] + carry;
      carry = floorOrCeil(sum / CHUNK_BASE); // Calculate carry.
      result[i] = sum % CHUNK_BASE; // Remainder is the current chunk digit.
    }

    // Propagate carry through remaining chunks of the longer array.
    while (i < lenA) {
      sum = chunkA[i] + carry;
      carry = floorOrCeil(sum / CHUNK_BASE);
      result[i++] = sum % CHUNK_BASE;
    }

    // If there's a final carry, append it as a new chunk.
    if (carry > 0) {
      result.push(carry);
    }
    return result;
  }

  /**
   * Handles addition for two chunk arrays, ensuring the longer array is processed first.
   * @param {number[]} chunkA - First operand.
   * @param {number[]} chunkB - Second operand.
   * @returns {number[]} Resulting chunk array.
   */
  function sumAnyChunks(chunkA, chunkB) {
    return (chunkA.length >= chunkB.length) ? performAddition(chunkA, chunkB) : performAddition(chunkB, chunkA);
  }

  /**
   * Adds a small integer (scalar) to a chunk array. Can handle negative scalars for subtraction.
   * @param {number[]} chunkArray - The base chunk array.
   * @param {number} scalar - The small integer to add (can be negative).
   * @returns {number[]} Resulting chunk array.
   */
  function addSmallToChunks(chunkArray, scalar) {
    const len = chunkArray.length;
    const result = new Array(len);
    let currentCarry = scalar;
    let sum;
    let i;

    for (i = 0; i < len; i++) {
      sum = chunkArray[i] + currentCarry;
      currentCarry = floorOrCeil(sum / CHUNK_BASE);
      result[i] = sum % CHUNK_BASE;
      // Adjust if result[i] became negative (e.g., 5 + (-10) with carry -1)
      if (result[i] < 0) {
        result[i] += CHUNK_BASE;
        currentCarry--;
      }
    }

    // Propagate any remaining carry (positive or negative).
    while (currentCarry !== 0) {
      result[i++] = currentCarry % CHUNK_BASE;
      currentCarry = floorOrCeil(currentCarry / CHUNK_BASE);
      // Ensure positive remainder for negative carry
      if (result[i-1] < 0) {
          result[i-1] += CHUNK_BASE;
          currentCarry--;
      }
    }
    return result;
  }

  /**
   * Adds a value to the current HugeNumber instance.
   * @param {NumericEntity|number|string} operand - The value to add.
   * @returns {HugeNumber|CompactNumber} The sum.
   */
  HugeNumber.prototype.add = function(operand) {
    const otherNum = normalizeInput(operand);

    // If signs are different, it's effectively a subtraction (this - |other|)
    if (this.isNegative !== otherNum.isNegative) {
      return this.subtract(otherNum.negate());
    }

    const currentChunks = this.numericParts;
    let otherChunks;

    // If the other number is compact, convert its absolute value to chunks for addition.
    if (otherNum.isCompact) {
      otherChunks = splitIntoChunks(Math.abs(otherNum.exactVal));
    } else {
      otherChunks = otherNum.numericParts;
    }

    // Perform chunk addition and create a new HugeNumber.
    const sumChunks = sumAnyChunks(currentChunks, otherChunks);
    const compactResult = recombineChunks(sumChunks);
    if (typeof compactResult === "number") {
      return new CompactNumber(this.isNegative ? -compactResult : compactResult);
    }
    return new HugeNumber(sumChunks, this.isNegative);
  };
  HugeNumber.prototype.plus = HugeNumber.prototype.add; // Alias for add.

  /**
   * Adds a value to the current CompactNumber instance.
   * @param {NumericEntity|number|string} operand - The value to add.
   * @returns {HugeNumber|CompactNumber} The sum.
   */
  CompactNumber.prototype.add = function(operand) {
    const otherNum = normalizeInput(operand);
    const currentVal = this.exactVal;

    // If signs are different, it's effectively a subtraction.
    if (currentVal < 0 !== otherNum.isNegative) {
      return this.subtract(otherNum.negate());
    }

    // If both are compact, try direct JavaScript addition.
    if (otherNum.isCompact) {
      const sum = currentVal + otherNum.exactVal;
      if (isWithinJsRange(sum)) {
        return new CompactNumber(sum);
      }
    }

    // If one or both are large, convert to chunks and perform large addition.
    const currentAbsChunks = splitIntoChunks(Math.abs(currentVal));
    const otherAbsChunks = otherNum.isCompact ? splitIntoChunks(Math.abs(otherNum.exactVal)) : otherNum.numericParts;

    const sumChunks = sumAnyChunks(currentAbsChunks, otherAbsChunks);
    const compactResult = recombineChunks(sumChunks);
    if (typeof compactResult === "number") {
        return new CompactNumber(currentVal < 0 ? -compactResult : compactResult);
    }
    return new HugeNumber(sumChunks, currentVal < 0);
  };
  CompactNumber.prototype.plus = CompactNumber.prototype.add; // Alias for add.

  /**
   * Performs subtraction of two chunk arrays (minuend - subtrahend).
   * Assumes `minuendChunks` is greater than or equal to `subtrahendChunks` in absolute value.
   * @param {number[]} minuendChunks - The minuend (chunk array).
   * @param {number[]} subtrahendChunks - The subtrahend (chunk array).
   * @returns {number[]} Resulting chunk array.
   */
  function performSubtraction(minuendChunks, subtrahendChunks) {
    const lenA = minuendChunks.length;
    const lenB = subtrahendChunks.length;
    const result = new Array(lenA);
    let borrow = 0;
    let difference;
    let i;

    // Subtract chunks up to the length of the shorter array.
    for (i = 0; i < lenB; i++) {
      difference = minuendChunks[i] - borrow - subtrahendChunks[i];
      if (difference < 0) {
        difference += CHUNK_BASE;
        borrow = 1;
      } else {
        borrow = 0;
      }
      result[i] = difference;
    }

    // Propagate borrow through remaining chunks of the longer array.
    for (i = lenB; i < lenA; i++) {
      difference = minuendChunks[i] - borrow;
      if (difference < 0) {
        difference += CHUNK_BASE;
      } else {
        result[i++] = difference; // If no borrow, copy and break.
        break;
      }
      result[i] = difference;
    }

    // Copy any remaining chunks from the minuend.
    for (; i < lenA; i++) {
      result[i] = minuendChunks[i];
    }
    normalizeChunks(result); // Remove leading zeros.
    return result;
  }

  /**
   * Handles subtraction for two chunk arrays, correctly determining the order and sign.
   * @param {number[]} chunkA - First operand.
   * @param {number[]} chunkB - Second operand.
   * @param {boolean} currentIsNegative - The sign of the current number (this).
   * @returns {HugeNumber|CompactNumber} The difference.
   */
  function diffAnyChunks(chunkA, chunkB, currentIsNegative) {
    let resultingChunks;
    let finalIsNegative = currentIsNegative;

    // Compare absolute values to determine the actual subtraction order and result sign.
    if (compareAbsoluteChunks(chunkA, chunkB) >= 0) {
      resultingChunks = performSubtraction(chunkA, chunkB);
    } else {
      resultingChunks = performSubtraction(chunkB, chunkA);
      finalIsNegative = !finalIsNegative; // Flip sign if operands were swapped.
    }

    // Attempt to convert the result back to a CompactNumber.
    const compactResult = recombineChunks(resultingChunks);
    if (typeof compactResult === "number") {
      return new CompactNumber(finalIsNegative ? -compactResult : compactResult);
    }
    return new HugeNumber(compactResult, finalIsNegative);
  }

  /**
   * Subtracts a small integer (scalar) from a chunk array.
   * @param {number[]} chunkArray - The minuend chunk array.
   * @param {number} scalarAbs - The absolute value of the small integer subtrahend.
   * @param {boolean} currentIsNegative - The sign of the current number (this).
   * @returns {HugeNumber|CompactNumber} The difference.
   */
  function subtractSmallFromChunks(chunkArray, scalarAbs, currentIsNegative) {
    // Using addSmallToChunks with a negative scalar handles this.
    // This is a direct rewrite to leverage addSmallToChunks' robustness.
    const resultChunks = addSmallToChunks(chunkArray, -scalarAbs);
    const compactResult = recombineChunks(resultChunks);
    if (typeof compactResult === "number") {
        return new CompactNumber(currentIsNegative ? -compactResult : compactResult);
    }
    return new HugeNumber(resultChunks, currentIsNegative);
  }

  /**
   * Subtracts a value from the current HugeNumber instance.
   * @param {NumericEntity|number|string} operand - The value to subtract.
   * @returns {HugeNumber|CompactNumber} The difference.
   */
  HugeNumber.prototype.subtract = function(operand) {
    const otherNum = normalizeInput(operand);

    // If signs are different, it's effectively an addition (this + |other|).
    if (this.isNegative !== otherNum.isNegative) {
      return this.add(otherNum.negate());
    }

    const currentChunks = this.numericParts;
    let otherAbsVal = otherNum.isCompact ? Math.abs(otherNum.exactVal) : null;

    // If the other number is compact, use specialized subtraction.
    if (otherNum.isCompact && otherAbsVal !== null) {
      return subtractSmallFromChunks(currentChunks, otherAbsVal, this.isNegative);
    }

    // Otherwise, perform general chunk subtraction.
    return diffAnyChunks(currentChunks, otherNum.numericParts, this.isNegative);
  };
  HugeNumber.prototype.minus = HugeNumber.prototype.subtract; // Alias for subtract.

  /**
   * Subtracts a value from the current CompactNumber instance.
   * @param {NumericEntity|number|string} operand - The value to subtract.
   * @returns {HugeNumber|CompactNumber} The difference.
   */
  CompactNumber.prototype.subtract = function(operand) {
    const otherNum = normalizeInput(operand);
    const currentVal = this.exactVal;

    // If signs are different, it's effectively an addition.
    if (currentVal < 0 !== otherNum.isNegative) {
      return this.add(otherNum.negate());
    }

    // If both are compact, try direct JavaScript subtraction.
    if (otherNum.isCompact) {
      const diff = currentVal - otherNum.exactVal;
      if (isWithinJsRange(diff)) {
        return new CompactNumber(diff);
      }
    }

    // If one or both are large, convert to chunks and perform large subtraction.
    const currentAbsChunks = splitIntoChunks(Math.abs(currentVal));
    const otherAbsChunks = otherNum.isCompact ? splitIntoChunks(Math.abs(otherNum.exactVal)) : otherNum.numericParts;

    // Determine the sign based on absolute values and original signs.
    const comparison = compareAbsoluteChunks(currentAbsChunks, otherAbsChunks);
    const initialSign = currentVal < 0; // If `this` is negative, the result tends to be more negative.

    if (comparison >= 0) { // |this| >= |other|
        return diffAnyChunks(currentAbsChunks, otherAbsChunks, initialSign);
    } else { // |this| < |other|
        return diffAnyChunks(otherAbsChunks, currentAbsChunks, !initialSign); // Swap and flip sign.
    }
  };
  CompactNumber.prototype.minus = CompactNumber.prototype.subtract; // Alias for subtract.

  /**
   * Returns a new NumericEntity with the negated sign.
   * @returns {HugeNumber|CompactNumber} The negated number.
   */
  HugeNumber.prototype.negate = function() {
    // Handle special case for zero to ensure it remains positive zero.
    if (this.isZero()) return NumericEntity.zero;
    return new HugeNumber(this.numericParts, !this.isNegative);
  };

  /**
   * Returns a new CompactNumber with the negated sign.
   * @returns {CompactNumber} The negated number.
   */
  CompactNumber.prototype.negate = function() {
    return new CompactNumber(-this.exactVal);
  };

  /**
   * Returns a new NumericEntity representing the absolute value.
   * @returns {HugeNumber|CompactNumber} The absolute value.
   */
  HugeNumber.prototype.abs = function() {
    return new HugeNumber(this.numericParts, false); // Always non-negative.
  };

  /**
   * Returns a new CompactNumber representing the absolute value.
   * @returns {CompactNumber} The absolute value.
   */
  CompactNumber.prototype.abs = function() {
    return new CompactNumber(Math.abs(this.exactVal));
  };

  /**
   * Performs long multiplication of two chunk arrays.
   * @param {number[]} chunkA - First operand.
   * @param {number[]} chunkB - Second operand.
   * @returns {number[]} Resulting chunk array.
   */
  function longMultiply(chunkA, chunkB) {
    const lenA = chunkA.length;
    const lenB = chunkB.length;
    const resultChunks = initializeChunkArray(lenA + lenB); // Maximum possible length of product.
    let product;
    let carry;

    for (let i = 0; i < lenA; ++i) {
      const a_i = chunkA[i];
      if (a_i === 0) continue; // Optimization: skip if chunk is zero.

      carry = 0;
      for (let j = 0; j < lenB; ++j) {
        // Calculate product of current chunks, add existing value and carry.
        product = a_i * chunkB[j] + resultChunks[i + j] + carry;
        carry = floorOrCeil(product / CHUNK_BASE);
        resultChunks[i + j] = product % CHUNK_BASE;
      }
      resultChunks[i + lenB] += carry; // Add final carry to the next chunk position.
    }
    normalizeChunks(resultChunks); // Remove any leading zeros.
    return resultChunks;
  }

  /**
   * Multiplies a chunk array by a small integer scalar.
   * @param {number[]} chunkArray - The chunk array operand.
   * @param {number} scalar - The small integer scalar.
   * @returns {number[]} Resulting chunk array.
   */
  function scalarMultiplyChunks(chunkArray, scalar) {
    const len = chunkArray.length;
    const result = new Array(len);
    let carry = 0;
    let product;
    let i;

    for (i = 0; i < len; i++) {
      product = chunkArray[i] * scalar + carry;
      carry = floorOrCeil(product / CHUNK_BASE);
      result[i] = product % CHUNK_BASE;
    }

    // Append any remaining carry as new chunks.
    while (carry > 0) {
      result[i++] = carry % CHUNK_BASE;
      carry = floorOrCeil(carry / CHUNK_BASE);
    }
    return result;
  }

  /**
   * Pads a chunk array with leading zeros (effectively shifting left by chunks).
   * @param {number[]} chunkArr - The chunk array.
   * @param {number} numChunksToPad - The number of zero chunks to prepend.
   * @returns {number[]} A new array with prepended zeros.
   */
  function padWithZeros(chunkArr, numChunksToPad) {
    if (numChunksToPad === 0) return [...chunkArr]; // Return a copy to prevent mutation.
    const newArr = initializeChunkArray(numChunksToPad);
    return newArr.concat(chunkArr);
  }

  /**
   * Karatsuba multiplication algorithm for faster multiplication of very large numbers.
   * Recursively splits numbers into halves and uses three multiplications instead of four.
   * @param {number[]} xChunks - First operand chunks.
   * @param {number[]} yChunks - Second operand chunks.
   * @returns {number[]} Resulting chunk array.
   */
  function karatsubaMultiply(xChunks, yChunks) {
    const maxLength = Math.max(xChunks.length, yChunks.length);

    // Base case for recursion: fall back to long multiplication for small arrays.
    if (maxLength <= 30) { // Threshold for switching to long multiplication.
      return longMultiply(xChunks, yChunks);
    }

    // Pad arrays with zeros to ensure equal length for splitting.
    const paddedX = [...xChunks]; while(paddedX.length < maxLength) paddedX.push(0);
    const paddedY = [...yChunks]; while(paddedY.length < maxLength) paddedY.push(0);

    // Split numbers into halves.
    const halfLen = Math.ceil(maxLength / 2);
    const xHigh = paddedX.slice(halfLen);
    const xLow = paddedX.slice(0, halfLen);
    const yHigh = paddedY.slice(halfLen);
    const yLow = paddedY.slice(0, halfLen);

    // Three recursive calls.
    const z0 = karatsubaMultiply(xLow, yLow); // xLow * yLow
    const z1 = karatsubaMultiply(sumAnyChunks(xLow, xHigh), sumAnyChunks(yLow, yHigh)); // (xLow+xHigh)*(yLow+yHigh)
    const z2 = karatsubaMultiply(xHigh, yHigh); // xHigh * yHigh

    // Combine results: z2 * B^(2*halfLen) + (z1 - z0 - z2) * B^halfLen + z0
    const term1 = padWithZeros(z2, 2 * halfLen);
    const middleTerm = diffAnyChunks(diffAnyChunks(z1, z0, false).numericParts, z2, false).numericParts;
    const term2 = padWithZeros(middleTerm, halfLen);
    const product = sumAnyChunks(sumAnyChunks(term1, term2), z0);

    normalizeChunks(product);
    return product;
  }

  /**
   * Heuristic to decide whether to use Karatsuba algorithm based on array lengths.
   * @param {number} len1 - Length of first chunk array.
   * @param {number} len2 - Length of second chunk array.
   * @returns {boolean} True if Karatsuba is likely faster.
   */
  function shouldUseKaratsuba(len1, len2) {
    // This formula is an empirical approximation; specific values might need tuning.
    return -0.012 * len1 - 0.012 * len2 + 15e-6 * len1 * len2 > 0;
  }

  /**
   * Multiplies the current HugeNumber instance by another value.
   * @param {NumericEntity|number|string} operand - The value to multiply by.
   * @returns {HugeNumber|CompactNumber} The product.
   */
  HugeNumber.prototype.multiply = function(operand) {
    const otherNum = normalizeInput(operand);
    const currentChunks = this.numericParts;
    const finalSign = this.isNegative !== otherNum.isNegative; // XOR for sign determination.

    // Handle special cases for zero.
    if (this.isZero() || otherNum.isZero()) return NumericEntity.zero;

    // Handle special cases for small multipliers.
    if (otherNum.isCompact) {
      const scalarVal = otherNum.exactVal;
      if (scalarVal === 1) return this;
      if (scalarVal === -1) return this.negate();

      const absScalar = Math.abs(scalarVal);
      if (absScalar < CHUNK_BASE) {
        const productChunks = scalarMultiplyChunks(currentChunks, absScalar);
        const compactResult = recombineChunks(productChunks);
        if (typeof compactResult === "number") {
          return new CompactNumber(finalSign ? -compactResult : compactResult);
        }
        return new HugeNumber(productChunks, finalSign);
      }
      // If scalar is small but still large enough to be represented as multiple chunks.
      const productChunks = longMultiply(currentChunks, splitIntoChunks(absScalar));
      const compactResult = recombineChunks(productChunks);
      if (typeof compactResult === "number") {
        return new CompactNumber(finalSign ? -compactResult : compactResult);
      }
      return new HugeNumber(productChunks, finalSign);
    }

    // Determine which multiplication algorithm to use for two large numbers.
    const otherChunks = otherNum.numericParts;
    let productChunks;
    if (shouldUseKaratsuba(currentChunks.length, otherChunks.length)) {
      productChunks = karatsubaMultiply(currentChunks, otherChunks);
    } else {
      productChunks = longMultiply(currentChunks, otherChunks);
    }
    
    const compactResult = recombineChunks(productChunks);
    if (typeof compactResult === "number") {
      return new CompactNumber(finalSign ? -compactResult : compactResult);
    }
    return new HugeNumber(productChunks, finalSign);
  };
  HugeNumber.prototype.times = HugeNumber.prototype.multiply; // Alias for multiply.

  /**
   * Internal multiplication helper for HugeNumber when multiplied by a CompactNumber.
   * This is called by CompactNumber.prototype.multiply to avoid code duplication.
   * @param {CompactNumber} compactNum - The compact number operand.
   * @returns {HugeNumber|CompactNumber} The product.
   */
  HugeNumber.prototype._multiplyByCompact = function(compactNum) {
    if (compactNum.isZero()) return NumericEntity.zero;
    if (compactNum.isOne()) return this;
    if (compactNum.isNegativeOne()) return this.negate();

    const absScalar = Math.abs(compactNum.exactVal);
    const finalSign = this.isNegative !== compactNum.isNegative;
    let productChunks;

    if (absScalar < CHUNK_BASE) {
      productChunks = scalarMultiplyChunks(this.numericParts, absScalar);
    } else {
      productChunks = longMultiply(this.numericParts, splitIntoChunks(absScalar));
    }

    const compactResult = recombineChunks(productChunks);
    if (typeof compactResult === "number") {
      return new CompactNumber(finalSign ? -compactResult : compactResult);
    }
    return new HugeNumber(productChunks, finalSign);
  };

  /**
   * Multiplies the current CompactNumber instance by another value.
   * @param {NumericEntity|number|string} operand - The value to multiply by.
   * @returns {HugeNumber|CompactNumber} The product.
   */
  CompactNumber.prototype.multiply = function(operand) {
    const otherNum = normalizeInput(operand);

    // If both are compact, try direct JavaScript multiplication.
    if (otherNum.isCompact) {
      const product = this.exactVal * otherNum.exactVal;
      if (isWithinJsRange(product)) {
        return new CompactNumber(product);
      }
    }

    // If one or both are large, delegate to HugeNumber's multiplication logic.
    // By calling otherNum._multiplyByCompact(this), we ensure the HugeNumber logic is used
    // and the operands are correctly ordered.
    // If 'otherNum' is also a CompactNumber, this will fall through to HugeNumber.prototype._multiplyByCompact
    // which handles the conversion to chunks.
    return otherNum._multiplyByCompact(this);
  };
  CompactNumber.prototype.times = CompactNumber.prototype.multiply; // Alias for times.

  /**
   * Squares a chunk array. Optimized for squaring (avoids redundant calculations).
   * @param {number[]} chunkArr - The chunk array to square.
   * @returns {number[]} The squared chunk array.
   */
  function square(chunkArr) {
    const len = chunkArr.length;
    const result = initializeChunkArray(len + len); // Max length is 2 * len.
    let product;
    let carry;

    for (let i = 0; i < len; i++) {
      const a_i = chunkArr[i];
      carry = 0; // Reset carry for each row.

      // Handle diagonal term (a_i * a_i)
      product = a_i * a_i + result[i + i];
      carry = floorOrCeil(product / CHUNK_BASE);
      result[i + i] = product % CHUNK_BASE;

      // Handle off-diagonal terms (2 * a_i * a_j)
      for (let j = i + 1; j < len; j++) {
        const a_j = chunkArr[j];
        product = 2 * (a_i * a_j) + result[i + j] + carry;
        carry = floorOrCeil(product / CHUNK_BASE);
        result[i + j] = product % CHUNK_BASE;
      }
      result[i + len] += carry; // Add remaining carry.
    }
    normalizeChunks(result);
    return result;
  }

  /**
   * Squares the current HugeNumber instance.
   * @returns {HugeNumber} The squared number.
   */
  HugeNumber.prototype.square = function() {
    return new HugeNumber(square(this.numericParts), false); // Square is always non-negative.
  };

  /**
   * Squares the current CompactNumber instance.
   * @returns {HugeNumber|CompactNumber} The squared number.
   */
  CompactNumber.prototype.square = function() {
    const squaredVal = this.exactVal * this.exactVal;
    if (isWithinJsRange(squaredVal)) {
      return new CompactNumber(squaredVal);
    }
    // If it exceeds JS safe range, convert to chunks and square.
    return new HugeNumber(square(splitIntoChunks(Math.abs(this.exactVal))), false);
  };

  /**
   * Division algorithm 1: Knuth's algorithm D.
   * Generally faster for smaller divisors and provides more precise control.
   * @param {number[]} dividendChunks - The dividend.
   * @param {number[]} divisorChunks - The divisor.
   * @returns {[number[], number[]]} An array containing [quotient, remainder] chunk arrays.
   */
  function divisionAlgorithmA(dividendChunks, divisorChunks) {
    const lenA = dividendChunks.length;
    const lenB = divisorChunks.length;
    const quotientResult = initializeChunkArray(lenA - lenB + 1); // Quotient max length.
    let remainderChunks = [...dividendChunks]; // Copy dividend as initial remainder.

    // D1. Normalization: Scale dividend and divisor to make divisor's most significant digit large.
    const divisorMSD = divisorChunks[lenB - 1];
    const normalizationFactor = Math.floor(CHUNK_BASE / (divisorMSD + 1)); // Lambda.

    remainderChunks = scalarMultiplyChunks(remainderChunks, normalizationFactor);
    const normalizedDivisor = scalarMultiplyChunks(divisorChunks, normalizationFactor);

    // Adjust lengths after normalization.
    // Add a leading zero to remainder if it became longer.
    if (remainderChunks.length <= lenA) remainderChunks.push(0);
    const normalizedDivisorMSD = normalizedDivisor[lenB - 1];

    // D3. Loop for k from n down to 0 (where k is the shift amount for current partial dividend).
    for (let k = lenA - lenB; k >= 0; k--) {
      // D4. Calculate quotient digit (q_hat).
      let q_hat = CHUNK_BASE - 1; // Initial guess.

      // If the most significant chunk of remainder is smaller than divisor's MSD,
      // combine with the next chunk for a better estimate.
      if (remainderChunks[k + lenB] !== normalizedDivisorMSD) {
        q_hat = floorOrCeil((remainderChunks[k + lenB] * CHUNK_BASE + remainderChunks[k + lenB - 1]) / normalizedDivisorMSD);
      }

      // D5. Multiply and subtract (q_hat * divisor from remainder).
      let carry = 0;
      let borrow = 0;
      const currentDivisorLen = normalizedDivisor.length;

      for (let i = 0; i < currentDivisorLen; i++) {
        carry += q_hat * normalizedDivisor[i];
        const q = floorOrCeil(carry / CHUNK_BASE);
        borrow += remainderChunks[k + i] - (carry % CHUNK_BASE);
        carry = q;
        if (borrow < 0) {
          remainderChunks[k + i] = borrow + CHUNK_BASE;
          borrow = -1; // Indicates a borrow occurred.
        } else {
          remainderChunks[k + i] = borrow;
          borrow = 0; // No borrow.
        }
      }

      // D6. Add back if q_hat was too large (borrow > 0 means overshot).
      while (borrow !== 0) {
        q_hat -= 1;
        carry = 0;
        for (let i = 0; i < currentDivisorLen; i++) {
          carry += remainderChunks[k + i] - CHUNK_BASE + normalizedDivisor[i]; // Add back divisor.
          if (carry < 0) {
            remainderChunks[k + i] = carry + CHUNK_BASE;
            carry = 0;
          } else {
            remainderChunks[k + i] = carry;
            carry = 1;
          }
        }
        borrow += carry; // Adjust borrow based on final carry.
      }
      quotientResult[k] = q_hat;
    }

    // D8. Denormalize remainder: divide by the normalization factor.
    remainderChunks = divideChunksByScalar(remainderChunks, normalizationFactor)[0];

    return [recombineChunks(quotientResult), recombineChunks(remainderChunks)];
  }

  /**
   * Division algorithm 2: Simpler iterative subtraction.
   * Can be less efficient than Knuth's for certain inputs but easier to implement.
   * @param {number[]} dividendChunks - The dividend.
   * @param {number[]} divisorChunks - The divisor.
   * @returns {[number[], number[]]} An array containing [quotient, remainder] chunk arrays.
   */
  function divisionAlgorithmB(dividendChunks, divisorChunks) {
    let lenA = dividendChunks.length;
    const lenB = divisorChunks.length;
    const quotientDigits = [];
    let currentPartialDividend = []; // Accumulate dividend chunks.

    // Iterate through dividend chunks from most significant to least.
    while (lenA > 0) {
      currentPartialDividend.unshift(dividendChunks[--lenA]); // Add next chunk to the front.
      normalizeChunks(currentPartialDividend); // Remove any leading zeros.

      // If current partial dividend is smaller than divisor, quotient digit is 0.
      if (compareAbsoluteChunks(currentPartialDividend, divisorChunks) < 0) {
        quotientDigits.push(0);
        continue;
      }

      // Estimate quotient digit based on most significant chunks.
      const xLen = currentPartialDividend.length;
      let highX = currentPartialDividend[xLen - 1] * CHUNK_BASE + (currentPartialDividend[xLen - 2] || 0);
      const highY = divisorChunks[lenB - 1] * CHUNK_BASE + (divisorChunks[lenB - 2] || 0);

      if (xLen > lenB) { // If partial dividend is significantly longer, adjust estimate.
        highX = (highX + 1) * CHUNK_BASE;
      }

      let estimatedQuotient = floorOrCeil(highX / highY);

      // Refine quotient digit by trial subtraction.
      let checkProduct;
      do {
        checkProduct = scalarMultiplyChunks(divisorChunks, estimatedQuotient);
        if (compareAbsoluteChunks(checkProduct, currentPartialDividend) <= 0) break; // Found a valid quotient.
        estimatedQuotient--; // Reduce quotient guess.
      } while (estimatedQuotient > 0);

      quotientDigits.push(estimatedQuotient);
      // Subtract (estimatedQuotient * divisor) from currentPartialDividend.
      currentPartialDividend = performSubtraction(currentPartialDividend, checkProduct);
    }
    quotientDigits.reverse(); // Digits were collected in reverse order.
    return [recombineChunks(quotientDigits), recombineChunks(currentPartialDividend)];
  }

  /**
   * Divides a chunk array by a small integer scalar.
   * @param {number[]} chunkArray - The dividend chunk array.
   * @param {number} scalar - The small integer divisor.
   * @returns {[number[], number]} An array containing [quotient_chunks, remainder_scalar].
   */
  function divideChunksByScalar(chunkArray, scalar) {
    const len = chunkArray.length;
    const quotient = initializeChunkArray(len);
    let remainder = 0;
    let currentDivisor;
    let qVal;

    // Process chunks from most significant to least significant.
    for (let i = len - 1; i >= 0; --i) {
      currentDivisor = remainder * CHUNK_BASE + chunkArray[i];
      qVal = floorOrCeil(currentDivisor / scalar);
      remainder = currentDivisor - qVal * scalar;
      quotient[i] = qVal | 0; // Ensure integer.
    }
    return [quotient, remainder | 0]; // Ensure integer remainder.
  }

  /**
   * Handles division and modulo operations for any NumericEntity.
   * This function orchestrates the division process, handling signs, small numbers,
   * and selecting the appropriate division algorithm for large numbers.
   * @param {NumericEntity} currentNum - The dividend.
   * @param {NumericEntity|number|string} divisorVal - The divisor.
   * @returns {[HugeNumber|CompactNumber, HugeNumber|CompactNumber]} An array containing [quotient, remainder].
   * @throws {Error} If division by zero.
   */
  function handleDivision(currentNum, divisorVal) {
    const otherNum = normalizeInput(divisorVal);
    const dividendChunks = currentNum.numericParts;
    const divisorChunks = otherNum.numericParts;

    if (otherNum.isZero()) {
      throw new Error("Division by zero is not allowed.");
    }

    // Handle cases where currentNum is small.
    if (currentNum.isCompact) {
      if (otherNum.isCompact) {
        // Both are small, use JavaScript division directly.
        const jsQuotient = floorOrCeil(currentNum.exactVal / otherNum.exactVal);
        const jsRemainder = currentNum.exactVal % otherNum.exactVal;
        return [new CompactNumber(jsQuotient), new CompactNumber(jsRemainder)];
      }
      // currentNum is small, otherNum is large: quotient is 0, remainder is currentNum.
      return [NumericEntity.zero, currentNum];
    }

    // Handle cases where otherNum is small (but currentNum is large).
    if (otherNum.isCompact) {
      const scalarDivisor = otherNum.exactVal;
      if (scalarDivisor === 1) return [currentNum, NumericEntity.zero];
      if (scalarDivisor === -1) return [currentNum.negate(), NumericEntity.zero];

      const absScalar = Math.abs(scalarDivisor);
      if (absScalar < CHUNK_BASE) {
        // Divide chunks by scalar efficiently.
        const [quotientChunks, remainderScalar] = divideChunksByScalar(dividendChunks, absScalar);
        const remainder = currentNum.isNegative ? -remainderScalar : remainderScalar; // Remainder sign matches dividend.
        const finalQuotient = recombineChunks(quotientChunks);

        const quotientSign = currentNum.isNegative !== otherNum.isNegative;

        if (typeof finalQuotient === "number") {
          return [new CompactNumber(quotientSign ? -finalQuotient : finalQuotient), new CompactNumber(remainder)];
        }
        return [new HugeNumber(finalQuotient, quotientSign), new CompactNumber(remainder)];
      }
    }

    // General case: both are large or one is large and other is compact but large magnitude.
    const absoluteComparison = compareAbsoluteChunks(dividendChunks, divisorChunks);

    if (absoluteComparison === -1) { // |dividend| < |divisor|.
      return [NumericEntity.zero, currentNum];
    }
    if (absoluteComparison === 0) { // |dividend| == |divisor|.
      const quotientVal = (currentNum.isNegative !== otherNum.isNegative) ? -1 : 1;
      return [new CompactNumber(quotientVal), NumericEntity.zero];
    }

    // Choose division algorithm based on total length or a fixed heuristic.
    const divisionResult = (dividendChunks.length + divisorChunks.length <= 200) ?
      divisionAlgorithmA(dividendChunks, divisorChunks) :
      divisionAlgorithmB(dividendChunks, divisorChunks);

    const quotientRaw = divisionResult[0];
    const remainderRaw = divisionResult[1];

    const quotientSign = currentNum.isNegative !== otherNum.isNegative;
    const remainderSign = currentNum.isNegative; // Remainder usually takes the sign of the dividend.

    let finalQuotient, finalRemainder;

    if (typeof quotientRaw === "number") {
      finalQuotient = new CompactNumber(quotientSign ? -quotientRaw : quotientRaw);
    } else {
      finalQuotient = new HugeNumber(quotientRaw, quotientSign);
    }

    if (typeof remainderRaw === "number") {
      finalRemainder = new CompactNumber(remainderSign ? -remainderRaw : remainderRaw);
    } else {
      finalRemainder = new HugeNumber(remainderRaw, remainderSign);
    }

    // Adjust remainder and quotient if remainder has a different sign than the dividend
    // and is non-zero, to match typical modulo behavior (remainder sign matches dividend).
    if (!finalRemainder.isZero() && finalRemainder.isNegative !== currentNum.isNegative) {
        if (currentNum.isNegative) { // Dividend was negative, remainder should be negative or zero.
            finalQuotient = finalQuotient.subtract(NumericEntity.one);
            finalRemainder = finalRemainder.add(otherNum.abs());
        } else { // Dividend was positive, remainder should be positive or zero.
            finalQuotient = finalQuotient.add(NumericEntity.one);
            finalRemainder = finalRemainder.subtract(otherNum.abs());
        }
    }

    return [finalQuotient, finalRemainder];
  }

  /**
   * Divides the current NumericEntity by another value and returns both quotient and remainder.
   * @param {NumericEntity|number|string} divisorVal - The divisor.
   * @returns {{quotient: HugeNumber|CompactNumber, remainder: HugeNumber|CompactNumber}} The division result.
   */
  HugeNumber.prototype.divmod = function(divisorVal) {
    const resultPair = handleDivision(this, divisorVal);
    return {
      quotient: resultPair[0],
      remainder: resultPair[1]
    };
  };
  CompactNumber.prototype.divmod = HugeNumber.prototype.divmod; // Share implementation.

  /**
   * Divides the current NumericEntity by another value and returns only the quotient.
   * @param {NumericEntity|number|string} divisorVal - The divisor.
   * @returns {HugeNumber|CompactNumber} The quotient.
   */
  HugeNumber.prototype.divide = function(divisorVal) {
    return handleDivision(this, divisorVal)[0];
  };
  CompactNumber.prototype.over = CompactNumber.prototype.divide = HugeNumber.prototype.over = HugeNumber.prototype.divide; // Aliases.

  /**
   * Divides the current NumericEntity by another value and returns only the remainder.
   * @param {NumericEntity|number|string} divisorVal - The divisor.
   * @returns {HugeNumber|CompactNumber} The remainder.
   */
  HugeNumber.prototype.mod = function(divisorVal) {
    return handleDivision(this, divisorVal)[1];
  };
  CompactNumber.prototype.remainder = CompactNumber.prototype.mod = HugeNumber.prototype.remainder = HugeNumber.prototype.mod; // Aliases.

  /**
   * Computes the current NumericEntity raised to the power of an exponent.
   * @param {NumericEntity|number|string} exponent - The exponent.
   * @returns {HugeNumber|CompactNumber} The result of the power operation.
   * @throws {Error} If the exponent is too large or negative (for non-integer results).
   */
  HugeNumber.prototype.pow = function(exponent) {
    const expNum = normalizeInput(exponent);

    // Base cases for exponentiation.
    if (expNum.isZero()) return NumericEntity.one;
    if (this.isZero()) return NumericEntity.zero;
    if (this.isOne()) return NumericEntity.one;
    if (this.isNegativeOne()) return expNum.isEven() ? NumericEntity.one : NumericEntity.negativeOne;

    // Handle negative exponents: for integers, this typically yields 0.
    if (expNum.isNegative()) {
      return NumericEntity.zero;
    }

    // Exponent must be a compact number for performance and current implementation.
    if (!expNum.isCompact) {
      throw new Error(`The exponent ${expNum.toString()} is too large for current power implementation.`);
    }

    let base = this;
    let exp = expNum.exactVal;
    let result = NumericEntity.one;

    // Binary exponentiation (exponentiation by squaring).
    while (exp > 0) {
      if (exp & 1) { // If exponent is odd.
        result = result.multiply(base);
      }
      if (exp === 1) break; // Optimization: If exponent becomes 1, no more squaring needed.
      base = base.square();
      exp = floorOrCeil(exp / 2);
    }
    return result;
  };
  CompactNumber.prototype.pow = HugeNumber.prototype.pow; // Share implementation.

  /**
   * Computes (base^exponent) mod modulus. Uses modular exponentiation.
   * @param {NumericEntity|number|string} exponent - The exponent.
   * @param {NumericEntity|number|string} modulus - The modulus.
   * @returns {HugeNumber|CompactNumber} The result of the modular exponentiation.
   * @throws {Error} If modulus is zero.
   */
  HugeNumber.prototype.modPow = function(exponent, modulus) {
    let exp = normalizeInput(exponent);
    const mod = normalizeInput(modulus);

    if (mod.isZero()) {
      throw new Error("Cannot perform modular exponentiation with modulus 0.");
    }
    if (mod.isOne() || mod.isNegativeOne()) { // x mod 1 or x mod -1 is always 0.
        return NumericEntity.zero;
    }

    let result = NumericEntity.one;
    let base = this.mod(mod); // Reduce base modulo modulus first.

    // Handle negative exponent by converting to positive (modular inverse).
    if (exp.isNegative()) {
        exp = exp.abs();
        base = base.modInv(mod); // base^-1 mod mod
    }

    while (exp.isPositive()) {
      if (base.isZero()) return NumericEntity.zero; // Optimization: 0^exp = 0.
      if (exp.isOdd()) {
        result = result.multiply(base).mod(mod);
      }
      exp = exp.divide(2);
      base = base.square().mod(mod);
    }
    return result;
  };
  CompactNumber.prototype.modPow = HugeNumber.prototype.modPow; // Share implementation.

  /**
   * Compares the absolute values of two chunk arrays.
   * @param {number[]} chunkA - First chunk array.
   * @param {number[]} chunkB - Second chunk array.
   * @returns {number} 0 if equal, 1 if chunkA > chunkB, -1 if chunkA < chunkB.
   */
  function compareAbsoluteChunks(chunkA, chunkB) {
    if (chunkA.length !== chunkB.length) {
      return chunkA.length > chunkB.length ? 1 : -1;
    }
    // Compare chunk by chunk from most significant to least.
    for (let i = chunkA.length - 1; i >= 0; i--) {
      if (chunkA[i] !== chunkB[i]) {
        return chunkA[i] > chunkB[i] ? 1 : -1;
      }
    }
    return 0; // Arrays are identical.
  }

  /**
   * Compares the absolute value of the current HugeNumber with another value.
   * @param {NumericEntity|number|string} operand - The value to compare with.
   * @returns {number} 0 if equal, 1 if current > operand, -1 if current < operand.
   */
  HugeNumber.prototype.compareAbs = function(operand) {
    const otherNum = normalizeInput(operand);
    // If otherNum is compact, and this is Huge, then this is always greater (unless otherNum is 0).
    if (otherNum.isCompact) {
      return this.isZero() ? (otherNum.isZero() ? 0 : 1) : 1;
    }
    return compareAbsoluteChunks(this.numericParts, otherNum.numericParts);
  };

  /**
   * Compares the absolute value of the current CompactNumber with another value.
   * @param {NumericEntity|number|string} operand - The value to compare with.
   * @returns {number} 0 if equal, 1 if current > operand, -1 if current < operand.
   */
  CompactNumber.prototype.compareAbs = function(operand) {
    const otherNum = normalizeInput(operand);
    const currentAbsVal = Math.abs(this.exactVal);

    if (otherNum.isCompact) {
      const otherAbsVal = Math.abs(otherNum.exactVal);
      return (currentAbsVal === otherAbsVal) ? 0 : (currentAbsVal > otherAbsVal ? 1 : -1);
    }
    // If otherNum is Huge, and this is Compact, then this is always smaller (unless this is 0).
    return this.isZero() ? (otherNum.isZero() ? 0 : -1) : -1;
  };

  /**
   * Internal helper for general comparison logic between two NumericEntities.
   * This centralizes the logic for `compare` methods to reduce duplication.
   * @param {NumericEntity} thisNum - The current number.
   * @param {NumericEntity} otherNum - The number to compare with.
   * @returns {number} -1, 0, or 1.
   */
  function _compareInternal(thisNum, otherNum) {
    // Handle special JS values like Infinity.
    if (otherNum === Infinity) return -1;
    if (otherNum === -Infinity) return 1;

    // Different signs: negative numbers are always smaller than positive numbers.
    if (thisNum.isNegative !== otherNum.isNegative) {
      return thisNum.isNegative ? -1 : 1;
    }

    // Same signs:
    // If both are compact, compare directly using JS numbers.
    if (thisNum.isCompact && otherNum.isCompact) {
      const diff = thisNum.exactVal - otherNum.exactVal;
      return diff === 0 ? 0 : (diff > 0 ? 1 : -1);
    }

    // If one is compact and the other is huge.
    if (thisNum.isCompact) { // `thisNum` is compact, `otherNum` is huge.
        if (thisNum.isZero() && otherNum.isZero()) return 0; // Both are zero.
        // If `thisNum` is compact and `otherNum` is huge with same sign:
        // If negative, `thisNum` (smaller magnitude) is greater (e.g., -5 > -100).
        // If positive, `thisNum` (smaller magnitude) is lesser (e.g., 5 < 100).
        return thisNum.isNegative ? 1 : -1;
    } else if (otherNum.isCompact) { // `thisNum` is huge, `otherNum` is compact.
        if (thisNum.isZero() && otherNum.isZero()) return 0; // Both are zero.
        // If `thisNum` is huge and `otherNum` is compact with same sign:
        // If negative, `thisNum` (larger magnitude) is lesser (e.g., -100 < -5).
        // If positive, `thisNum` (larger magnitude) is greater (e.g., 100 > 5).
        return thisNum.isNegative ? -1 : 1;
    }

    // Both are HugeNumbers: compare their absolute chunk representations.
    const comparisonResult = compareAbsoluteChunks(thisNum.numericParts, otherNum.numericParts);
    // If negative, flip the comparison result (e.g., -100 < -5, but 100 > 5).
    return thisNum.isNegative ? -comparisonResult : comparisonResult;
  }

  /**
   * Compares the current HugeNumber with another value.
   * @param {NumericEntity|number|string} operand - The value to compare with.
   * @returns {number} -1, 0, or 1 (less than, equal to, greater than).
   */
  HugeNumber.prototype.compare = function(operand) {
    return _compareInternal(this, normalizeInput(operand));
  };
  HugeNumber.prototype.compareTo = HugeNumber.prototype.compare; // Alias.

  /**
   * Compares the current CompactNumber with another value.
   * @param {NumericEntity|number|string} operand - The value to compare with.
   * @returns {number} -1, 0, or 1.
   */
  CompactNumber.prototype.compare = function(operand) {
    return _compareInternal(this, normalizeInput(operand));
  };
  CompactNumber.prototype.compareTo = CompactNumber.prototype.compare; // Alias.

  /**
   * Checks if the current NumericEntity is equal to another value.
   * @param {NumericEntity|number|string} operand - The value to compare with.
   * @returns {boolean} True if equal, false otherwise.
   */
  HugeNumber.prototype.equals = function(operand) {
    return this.compare(operand) === 0;
  };
  CompactNumber.prototype.eq = CompactNumber.prototype.equals = HugeNumber.prototype.eq = HugeNumber.prototype.equals; // Aliases.

  /**
   * Checks if the current NumericEntity is not equal to another value.
   * @param {NumericEntity|number|string} operand - The value to compare with.
   * @returns {boolean} True if not equal, false otherwise.
   */
  HugeNumber.prototype.notEquals = function(operand) {
    return this.compare(operand) !== 0;
  };
  CompactNumber.prototype.neq = CompactNumber.prototype.notEquals = HugeNumber.prototype.neq = HugeNumber.prototype.notEquals; // Aliases.

  /**
   * Checks if the current NumericEntity is greater than another value.
   * @param {NumericEntity|number|string} operand - The value to compare with.
   * @returns {boolean} True if greater, false otherwise.
   */
  HugeNumber.prototype.greater = function(operand) {
    return this.compare(operand) > 0;
  };
  CompactNumber.prototype.gt = CompactNumber.prototype.greater = HugeNumber.prototype.gt = HugeNumber.prototype.greater; // Aliases.

  /**
   * Checks if the current NumericEntity is less than another value.
   * @param {NumericEntity|number|string} operand - The value to compare with.
   * @returns {boolean} True if less, false otherwise.
   */
  HugeNumber.prototype.lesser = function(operand) {
    return this.compare(operand) < 0;
  };
  CompactNumber.prototype.lt = CompactNumber.prototype.lesser = HugeNumber.prototype.lt = HugeNumber.prototype.lesser; // Aliases.

  /**
   * Checks if the current NumericEntity is greater than or equal to another value.
   * @param {NumericEntity|number|string} operand - The value to compare with.
   * @returns {boolean} True if greater or equal, false otherwise.
   */
  HugeNumber.prototype.greaterOrEquals = function(operand) {
    return this.compare(operand) >= 0;
  };
  CompactNumber.prototype.geq = CompactNumber.prototype.greaterOrEquals = HugeNumber.prototype.geq = HugeNumber.prototype.greaterOrEquals; // Aliases.

  /**
   * Checks if the current NumericEntity is less than or equal to another value.
   * @param {NumericEntity|number|string} operand - The value to compare with.
   * @returns {boolean} True if less or equal, false otherwise.
   */
  HugeNumber.prototype.lesserOrEquals = function(operand) {
    return this.compare(operand) <= 0;
  };
  CompactNumber.prototype.leq = CompactNumber.prototype.lesserOrEquals = HugeNumber.prototype.leq = HugeNumber.prototype.lesserOrEquals; // Aliases.

  /**
   * Checks if the current HugeNumber is an even number.
   * @returns {boolean} True if even, false otherwise.
   */
  HugeNumber.prototype.isEven = function() {
    return (this.numericParts[0] & 1) === 0;
  };

  /**
   * Checks if the current CompactNumber is an even number.
   * @returns {boolean} True if even, false otherwise.
   */
  CompactNumber.prototype.isEven = function() {
    return (this.exactVal & 1) === 0;
  };

  /**
   * Checks if the current HugeNumber is an odd number.
   * @returns {boolean} True if odd, false otherwise.
   */
  HugeNumber.prototype.isOdd = function() {
    return (this.numericParts[0] & 1) === 1;
  };

  /**
   * Checks if the current CompactNumber is an odd number.
   * @returns {boolean} True if odd, false otherwise.
   */
  CompactNumber.prototype.isOdd = function() {
    return (this.exactVal & 1) === 1;
  };

  /**
   * Checks if the current HugeNumber is positive.
   * @returns {boolean} True if positive, false otherwise.
   */
  HugeNumber.prototype.isPositive = function() {
    return !this.isNegative;
  };

  /**
   * Checks if the current CompactNumber is positive.
   * @returns {boolean} True if positive, false otherwise.
   */
  CompactNumber.prototype.isPositive = function() {
    return this.exactVal > 0;
  };

  /**
   * Checks if the current HugeNumber is negative.
   * @returns {boolean} True if negative, false otherwise.
   */
  HugeNumber.prototype.isNegative = function() {
    return this.isNegative;
  };

  /**
   * Checks if the current CompactNumber is negative.
   * @returns {boolean} True if negative, false otherwise.
   */
  CompactNumber.prototype.isNegative = function() {
    return this.exactVal < 0;
  };

  /**
   * Checks if the current HugeNumber is 1 or -1.
   * A huge number cannot be a unit by definition (it would be compact).
   * @returns {boolean} Always false for HugeNumber.
   */
  HugeNumber.prototype.isUnit = function() {
    return false;
  };

  /**
   * Checks if the current CompactNumber is 1 or -1.
   * @returns {boolean} True if 1 or -1, false otherwise.
   */
  CompactNumber.prototype.isUnit = function() {
    return Math.abs(this.exactVal) === 1;
  };

  /**
   * Checks if the current HugeNumber is zero.
   * @returns {boolean} True if zero, false otherwise.
   */
  HugeNumber.prototype.isZero = function() {
    // A HugeNumber is zero if its numericParts array is empty or contains only [0].
    return this.numericParts.length === 0 || (this.numericParts.length === 1 && this.numericParts[0] === 0);
  };

  /**
   * Checks if the current CompactNumber is zero.
   * @returns {boolean} True if zero, false otherwise.
   */
  CompactNumber.prototype.isZero = function() {
    return this.exactVal === 0;
  };

  /**
   * Checks if the current NumericEntity is divisible by another value.
   * @param {NumericEntity|number|string} divisorVal - The value to check divisibility by.
   * @returns {boolean} True if divisible, false otherwise.
   */
  HugeNumber.prototype.isDivisibleBy = function(divisorVal) {
    const otherNum = normalizeInput(divisorVal);
    const otherVal = otherNum.isCompact ? otherNum.exactVal : null;

    if (otherVal === 0) return false; // Cannot divide by zero.
    if (otherVal === 1 || otherVal === -1) return true; // Always divisible by 1 or -1.
    if (otherVal === 2) return this.isEven(); // Optimization for 2.

    return this.mod(otherNum).equals(NumericEntity.zero);
  };
  CompactNumber.prototype.isDivisibleBy = HugeNumber.prototype.isDivisibleBy; // Share implementation.

  /**
   * Performs a basic primality test for small numbers (up to 25).
   * @param {NumericEntity} numToCheck - The number to test.
   * @returns {boolean|undefined} True/False for small primes, undefined if it's a large number.
   */
  function isBasicPrimeCheck(numToCheck) {
    const absNum = numToCheck.abs();
    if (absNum.isUnit()) return false; // 1 is not prime.
    if (absNum.equals(2) || absNum.equals(3) || absNum.equals(5)) return true;
    if (absNum.isEven() || absNum.isDivisibleBy(3) || absNum.isDivisibleBy(5)) return false;
    if (absNum.lesser(25)) return true; // Numbers < 25 not caught above are prime (7, 11, 13, 17, 19, 23).
    return undefined; // Not a basic prime, needs Miller-Rabin.
  }

  /**
   * Checks if the current NumericEntity is a prime number (using Miller-Rabin for large numbers).
   * Note: This is a deterministic Miller-Rabin test for numbers up to ~3.3 * 10^14.
   * For larger numbers, it's a probabilistic test with high confidence.
   * @returns {boolean} True if prime, false otherwise.
   */
  HugeNumber.prototype.isPrime = function() {
    const basicCheckResult = isBasicPrimeCheck(this);
    if (basicCheckResult !== undefined) return basicCheckResult;

    const n = this.abs();
    if (n.lesser(2)) return false; // 0, 1 are not prime.
    if (n.isEven()) return false; // Even numbers > 2 are not prime.

    const nMinusOne = n.prev(); // n-1.

    // Find d and s such that n-1 = d * 2^s, where d is odd.
    let d = nMinusOne;
    let s = 0;
    while (d.isEven()) {
      d = d.divide(2);
      s++;
    }

    // Deterministic Miller-Rabin test bases for numbers up to 3,317,044,064,679,887,385,961,981
    // For smaller N, a subset of these is sufficient.
    const testBases = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37];

    for (let i = 0; i < testBases.length; i++) {
      const a = largeNum(testBases[i]);
      if (a.greaterOrEquals(n)) break; // Base 'a' must be less than 'n'.

      let x = a.modPow(d, n); // x = a^d mod n.

      if (x.equals(NumericEntity.one) || x.equals(nMinusOne)) {
        continue; // Potentially prime.
      }

      let isStrongWitness = false;
      // Loop s-1 times (from r=0 to s-1).
      for (let r = 0; r < s; r++) {
        x = x.square().mod(n);
        if (x.equals(nMinusOne)) {
          isStrongWitness = true;
          break; // Potentially prime.
        }
      }
      if (!isStrongWitness) return false; // Composite.
    }
    return true; // Probably prime (or deterministically prime for smaller N).
  };
  CompactNumber.prototype.isPrime = HugeNumber.prototype.isPrime; // Share implementation.

  /**
   * Checks if the current NumericEntity is a probable prime using Miller-Rabin.
   * This is a probabilistic test, with `iterations` determining confidence.
   * @param {number} [iterations=5] - Number of Miller-Rabin iterations.
   * @returns {boolean} True if probable prime, false otherwise.
   */
  HugeNumber.prototype.isProbablePrime = function(iterations) {
    const basicCheckResult = isBasicPrimeCheck(this);
    if (basicCheckResult !== undefined) return basicCheckResult;

    const n = this.abs();
    const numIterations = iterations == null ? 5 : iterations;

    if (n.lesser(2)) return false; // 0, 1 are not prime.
    if (n.equals(2) || n.equals(3)) return true; // 2, 3 are prime.
    if (n.isEven()) return false; // Even numbers > 2 are not prime.

    const nMinusTwo = n.subtract(NumericEntity.two);
    const nMinusOne = n.prev();

    // Find d and s such that n-1 = d * 2^s, where d is odd.
    let d = nMinusOne;
    let s = 0;
    while (d.isEven()) {
        d = d.divide(2);
        s++;
    }

    // Miller-Rabin test with random bases.
    for (let i = 0; i < numIterations; i++) {
        // Choose a random base 'a' such that 2 <= a <= n-2.
        const a = generateRandomBetween(NumericEntity.two, nMinusTwo);
        let x = a.modPow(d, n); // x = a^d mod n.

        if (x.equals(NumericEntity.one) || x.equals(nMinusOne)) {
            continue; // Potentially prime.
        }

        let isComposite = true;
        // Check a^(d*2^r) mod n for r from 0 to s-1.
        for (let r = 0; r < s; r++) {
            x = x.square().mod(n);
            if (x.equals(nMinusOne)) {
                isComposite = false;
                break; // Potentially prime.
            }
        }
        if (isComposite) return false; // Definitely composite.
    }
    return true; // Probably prime.
  };
  CompactNumber.prototype.isProbablePrime = HugeNumber.prototype.isProbablePrime; // Share implementation.

  /**
   * Computes the modular multiplicative inverse of the current number modulo n.
   * Uses the extended Euclidean algorithm.
   * @param {NumericEntity|number|string} modulus - The modulus n.
   * @returns {HugeNumber|CompactNumber} The modular inverse, in the range [0, n-1].
   * @throws {Error} If no inverse exists (not coprime).
   */
  HugeNumber.prototype.modInv = function(modulus) {
    let t = NumericEntity.zero;
    let newT = NumericEntity.one;
    let r = normalizeInput(modulus);
    let newR = this.abs(); // Use absolute value for calculations, adjust sign later.

    let q, lastT, lastR;

    // Extended Euclidean algorithm.
    while (!newR.isZero()) {
      q = r.divide(newR);
      lastT = t;
      lastR = r;
      t = newT;
      r = newR;
      newT = lastT.subtract(q.multiply(newT));
      newR = lastR.subtract(q.multiply(newR));
    }

    if (!r.equals(NumericEntity.one)) {
      throw new Error(`The number ${this.toString()} and modulus ${modulus.toString()} are not coprime, no modular inverse exists.`);
    }

    // Ensure t is positive and in the range [0, modulus-1].
    if (t.isNegative()) {
      t = t.add(modulus);
    }

    // If the original number was negative, the inverse needs adjustment.
    // inv(-a) mod n = (n - inv(a)) mod n
    if (this.isNegative) {
      return modulus.subtract(t).mod(modulus);
    }
    return t;
  };
  CompactNumber.prototype.modInv = HugeNumber.prototype.modInv; // Share implementation.

  /**
   * Returns the next integer (current + 1).
   * @returns {HugeNumber|CompactNumber} The next integer.
   */
  HugeNumber.prototype.next = function() {
    // If negative, adding 1 means subtracting 1 from the absolute value.
    if (this.isNegative) {
      // Example: -5.next() = -4. Abs(-5) = 5. 5-1 = 4. Result -4.
      return subtractSmallFromChunks(this.numericParts, 1, this.isNegative);
    }
    // If positive, simply add 1.
    return new HugeNumber(addSmallToChunks(this.numericParts, 1), this.isNegative);
  };

  /**
   * Returns the next integer (current + 1).
   * @returns {HugeNumber|CompactNumber} The next integer.
   */
  CompactNumber.prototype.next = function() {
    const nextVal = this.exactVal + 1;
    if (nextVal < JS_MAX_SAFE_INT) {
      return new CompactNumber(nextVal);
    }
    // If it overflows JS safe integer, convert to HugeNumber.
    return new HugeNumber(JS_MAX_SAFE_ARR, false); // JS_MAX_SAFE_INT is positive.
  };

  /**
   * Returns the previous integer (current - 1).
   * @returns {HugeNumber|CompactNumber} The previous integer.
   */
  HugeNumber.prototype.prev = function() {
    // If negative, subtracting 1 means adding 1 to the absolute value and keeping negative sign.
    if (this.isNegative) {
      // Example: -5.prev() = -6. Abs(-5) = 5. 5+1 = 6. Result -6.
      return new HugeNumber(addSmallToChunks(this.numericParts, 1), true);
    }
    // If positive, simply subtract 1.
    return subtractSmallFromChunks(this.numericParts, 1, this.isNegative);
  };

  /**
   * Returns the previous integer (current - 1).
   * @returns {HugeNumber|CompactNumber} The previous integer.
   */
  CompactNumber.prototype.prev = function() {
    const prevVal = this.exactVal - 1;
    if (prevVal > -JS_MAX_SAFE_INT) {
      return new CompactNumber(prevVal);
    }
    // If it underflows JS safe integer, convert to HugeNumber.
    // The previous value of -JS_MAX_SAFE_INT should be a HugeNumber representing -(JS_MAX_SAFE_INT + 1).
    return new HugeNumber(addSmallToChunks(JS_MAX_SAFE_ARR, 1), true);
  };

  // Pre-calculate powers of 2 (up to CHUNK_BASE) for efficient bit shifting (chunk-based).
  const baseChunkPowers = [1];
  while (2 * baseChunkPowers[baseChunkPowers.length - 1] <= CHUNK_BASE) {
    baseChunkPowers.push(2 * baseChunkPowers[baseChunkPowers.length - 1]);
  }
  const baseChunkPowersCount = baseChunkPowers.length; // Number of powers of 2 <= CHUNK_BASE.
  const maxChunkPower = baseChunkPowers[baseChunkPowersCount - 1]; // The largest power of 2 <= CHUNK_BASE.

  /**
   * Checks if the shift amount is compact (fits within JS number or a single chunk).
   * @param {number|string|NumericEntity} shiftAmount - The amount to shift.
   * @returns {boolean} True if compact, false otherwise.
   */
  function isShiftAmountCompact(shiftAmount) {
    if (typeof shiftAmount === "number" || typeof shiftAmount === "string") {
        const numShift = +shiftAmount;
        return Number.isInteger(numShift) && Math.abs(numShift) <= CHUNK_BASE;
    }
    if (shiftAmount instanceof CompactNumber) return true;
    if (shiftAmount instanceof HugeNumber && shiftAmount.numericParts.length <= 1) return true;
    return false;
  }

  /**
   * Performs a bitwise left shift on the current NumericEntity.
   * Equivalent to multiplying by 2^n.
   * @param {number|string|NumericEntity} shiftAmount - The number of bits to shift.
   * @returns {HugeNumber|CompactNumber} The shifted number.
   * @throws {Error} If shift amount is too large or not an integer.
   */
  HugeNumber.prototype.shiftLeft = function(shiftAmount) {
    if (!isShiftAmountCompact(shiftAmount)) {
      throw new Error(`Shift amount '${String(shiftAmount)}' is too large or not a valid integer for shifting.`);
    }
    let n = +shiftAmount; // Convert to number.
    if (!Number.isInteger(n)) throw new Error("Shift amount must be an integer.");
    if (n < 0) return this.shiftRight(-n); // Negative shift left is shift right.

    let result = this;
    if (result.isZero()) return result;

    // Perform shifts in chunks using pre-calculated powers of 2.
    // This effectively multiplies by powers of 2 directly.
    while (n >= baseChunkPowersCount) {
      result = result.multiply(maxChunkPower); // Multiply by largest pre-calculated power.
      n -= (baseChunkPowersCount - 1); // Reduce shift amount.
    }
    return result.multiply(baseChunkPowers[n]); // Multiply by remaining power of 2.
  };
  CompactNumber.prototype.shiftLeft = HugeNumber.prototype.shiftLeft; // Share implementation.

  /**
   * Performs a bitwise right shift on the current NumericEntity.
   * Equivalent to integer division by 2^n, with specific floor behavior for negative numbers.
   * @param {number|string|NumericEntity} shiftAmount - The number of bits to shift.
   * @returns {HugeNumber|CompactNumber} The shifted number.
   * @throws {Error} If shift amount is too large or not an integer.
   */
  HugeNumber.prototype.shiftRight = function(shiftAmount) {
    if (!isShiftAmountCompact(shiftAmount)) {
      throw new Error(`Shift amount '${String(shiftAmount)}' is too large or not a valid integer for shifting.`);
    }
    let n = +shiftAmount; // Convert to number.
    if (!Number.isInteger(n)) throw new Error("Shift amount must be an integer.");
    if (n < 0) return this.shiftLeft(-n); // Negative shift right is shift left.

    let result = this;
    if (result.isZero()) return result;
    
    const originalIsNegative = result.isNegative;

    // Perform shifts in chunks.
    while (n >= baseChunkPowersCount) {
      // If we shift a negative number past its last significant bit, it becomes -1.
      if (result.isZero() || (originalIsNegative && result.isUnit())) {
        return originalIsNegative ? NumericEntity.negativeOne : NumericEntity.zero;
      }
      const [quotient, remainder] = handleDivision(result, maxChunkPower);
      // Adjust quotient to ensure floor towards negative infinity for negative numbers.
      result = (originalIsNegative && !remainder.isZero()) ? quotient.prev() : quotient;
      n -= (baseChunkPowersCount - 1);
    }
    const [quotient, remainder] = handleDivision(result, baseChunkPowers[n]);
    return (originalIsNegative && !remainder.isZero()) ? quotient.prev() : quotient;
  };
  CompactNumber.prototype.shiftRight = HugeNumber.prototype.shiftRight; // Share implementation.

  // Masks for rough lowest bit calculation (used in GCD).
  const LOWEST_BIT_MASK_INT = 1 << 30; // For JS numbers (31-bit signed int).
  // For chunk parts, combine with a mask for the first two chunks.
  const LOWEST_BIT_MASK_BIG = (CHUNK_BASE & -CHUNK_BASE) * (CHUNK_BASE & -CHUNK_BASE) | LOWEST_BIT_MASK_INT;

  /**
   * Estimates the lowest set bit position (rough approximation).
   * This is used in the binary GCD algorithm for optimization.
   * @param {HugeNumber|CompactNumber} num - The number.
   * @returns {number} An integer representing the lowest set bit (e.g., 8 for 0b1000).
   */
  function getApproxLowestBit(num) {
    const val = num.isCompact ? num.exactVal : num.numericParts;
    const x = typeof val === "number" ? val | LOWEST_BIT_MASK_INT : (val[0] || 0) + (val[1] || 0) * CHUNK_BASE | LOWEST_BIT_MASK_BIG;
    return x & -x; // Returns the lowest set bit.
  }

  /**
   * Applies a bitwise operation function (`fn`) to two NumericEntities.
   * Works by processing chunks, handling 2's complement for negative numbers,
   * then recombining the results.
   * @param {NumericEntity} numX - First operand.
   * @param {NumericEntity} numY - Second operand.
   * @param {function(number, number): number} fn - The bitwise function (e.g., `&`, `|`, `^`).
   * @returns {HugeNumber|CompactNumber} The result of the bitwise operation.
   */
  function applyBitwiseOperation(numX, numY, fn) {
    const operandY = normalizeInput(numY);

    // Get signs for 2's complement handling.
    const xIsNegative = numX.isNegative;
    const yIsNegative = operandY.isNegative;

    // Convert to conceptual 2's complement representation if negative.
    // `~N` is equivalent to `- (N + 1)`.
    let xRemaining = xIsNegative ? numX.not() : numX;
    let yRemaining = yIsNegative ? operandY.not() : operandY;

    const resultChunks = [];
    let xChunk, yChunk;
    let xDivModResult, yDivModResult;

    // Process chunks from least significant to most significant.
    while (!xRemaining.isZero() || !yRemaining.isZero()) {
      // Extract lowest chunk from xRemaining.
      xDivModResult = handleDivision(xRemaining, maxChunkPower);
      xChunk = xDivModResult[1].toJSNumber();
      if (xIsNegative) {
        xChunk = maxChunkPower - 1 - xChunk; // Invert bits for 2's complement conceptual representation.
      }
      xRemaining = xDivModResult[0];

      // Extract lowest chunk from yRemaining.
      yDivModResult = handleDivision(yRemaining, maxChunkPower);
      yChunk = yDivModResult[1].toJSNumber();
      if (yIsNegative) {
        yChunk = maxChunkPower - 1 - yChunk; // Invert bits.
      }
      yRemaining = yDivModResult[0];

      resultChunks.push(fn(xChunk, yChunk)); // Apply bitwise function.
    }

    // Determine the sign of the result based on the bitwise operation on conceptual leading bits.
    const finalSignBit = fn(xIsNegative ? 1 : 0, yIsNegative ? 1 : 0);
    let finalResult = finalSignBit !== 0 ? largeNum(-1) : largeNum(0); // If leading bit is 1, result is negative.

    // Reconstruct the number from result chunks.
    for (let i = resultChunks.length - 1; i >= 0; i--) {
      finalResult = finalResult.multiply(maxChunkPower).add(largeNum(resultChunks[i]));
    }

    return finalResult;
  }

  /**
   * Performs a bitwise NOT operation (~) on the current NumericEntity.
   * Equivalent to `-(this + 1)` in 2's complement arithmetic.
   * @returns {HugeNumber|CompactNumber} The result.
   */
  HugeNumber.prototype.not = function() {
    return this.negate().prev();
  };
  CompactNumber.prototype.not = HugeNumber.prototype.not; // Share implementation.

  /**
   * Performs a bitwise AND operation (&) with another value.
   * @param {NumericEntity|number|string} operand - The other operand.
   * @returns {HugeNumber|CompactNumber} The result.
   */
  HugeNumber.prototype.and = function(operand) {
    return applyBitwiseOperation(this, operand, (a, b) => a & b);
  };
  CompactNumber.prototype.and = HugeNumber.prototype.and; // Share implementation.

  /**
   * Performs a bitwise OR operation (|) with another value.
   * @param {NumericEntity|number|string} operand - The other operand.
   * @returns {HugeNumber|CompactNumber} The result.
   */
  HugeNumber.prototype.or = function(operand) {
    return applyBitwiseOperation(this, operand, (a, b) => a | b);
  };
  CompactNumber.prototype.or = HugeNumber.prototype.or; // Share implementation.

  /**
   * Performs a bitwise XOR operation (^) with another value.
   * @param {NumericEntity|number|string} operand - The other operand.
   * @returns {HugeNumber|CompactNumber} The result.
   */
  HugeNumber.prototype.xor = function(operand) {
    return applyBitwiseOperation(this, operand, (a, b) => a ^ b);
  };
  CompactNumber.prototype.xor = HugeNumber.prototype.xor; // Share implementation.

  /**
   * Calculates the integer logarithm (log_base(value)).
   * Finds the largest integer 'e' such that base^e <= value.
   * @param {NumericEntity} val - The value.
   * @param {NumericEntity} base - The base.
   * @returns {{p: NumericEntity, e: number}} An object with 'p' (base^e) and 'e' (exponent).
   */
  function calculateIntegerLog(val, base) {
    // If base is larger than value, the exponent is 0 (base^0 = 1).
    if (base.compareTo(val) > 0) {
      return { p: largeNum(1), e: 0 };
    }
    
    // Recursive approach: log_B(N) = 2 * log_B^2(N).
    // We find log_B^2(N), then adjust.
    const tempResult = calculateIntegerLog(val, base.square()); // Calculate log with base^2.
    let currentPower = tempResult.p; // This will be base^(2*e_temp).
    let currentExp = tempResult.e * 2;

    // Check if currentPower * base is still <= value.
    const productWithBase = currentPower.multiply(base);
    if (productWithBase.compareTo(val) <= 0) {
      currentPower = productWithBase;
      currentExp += 1;
    }
    return { p: currentPower, e: currentExp };
  }

  /**
   * Calculates the bit length (number of bits required to represent the number).
   * For negative numbers, it's the bit length of `-(N+1)` (2's complement representation).
   * @returns {HugeNumber|CompactNumber} The bit length.
   */
  HugeNumber.prototype.bitLength = function() {
    let num = this;
    if (num.isNegative) {
      // For negative numbers, bit length is typically defined for 2's complement.
      // E.g., -1 is 1 bit (0b1), -2 is 2 bits (0b10), -3 is 2 bits (0b11).
      // This maps to bitLength of abs(N)-1 for `~N` style, or `abs(N)` for magnitude.
      // The original code uses `-(n+1)` which is effectively `abs(n)+1` for bit length calculation.
      num = num.negate().subtract(NumericEntity.one);
    }
    if (num.isZero()) {
      return NumericEntity.zero;
    }
    // Calculate log base 2 of the number, then add 1 (for 0-indexed bits).
    return largeNum(calculateIntegerLog(num, largeNum(2)).e).add(NumericEntity.one);
  };
  CompactNumber.prototype.bitLength = HugeNumber.prototype.bitLength; // Share implementation.

  /**
   * Returns the maximum of two NumericEntities.
   * @param {NumericEntity|number|string} val1 - First value.
   * @param {NumericEntity|number|string} val2 - Second value.
   * @returns {HugeNumber|CompactNumber} The larger value.
   */
  function getMaximum(val1, val2) {
    const num1 = normalizeInput(val1);
    const num2 = normalizeInput(val2);
    return num1.greater(num2) ? num1 : num2;
  }

  /**
   * Returns the minimum of two NumericEntities.
   * @param {NumericEntity|number|string} val1 - First value.
   * @param {NumericEntity|number|string} val2 - Second value.
   * @returns {HugeNumber|CompactNumber} The smaller value.
   */
  function getMinimum(val1, val2) {
    const num1 = normalizeInput(val1);
    const num2 = normalizeInput(val2);
    return num1.lesser(num2) ? num1 : num2;
  }

  /**
   * Calculates the Greatest Common Divisor (GCD) of two NumericEntities using the binary GCD algorithm.
   * @param {NumericEntity|number|string} valA - First value.
   * @param {NumericEntity|number|string} valB - Second value.
   * @returns {HugeNumber|CompactNumber} The GCD.
   */
  function greatestCommonDivisor(valA, valB) {
    let a = normalizeInput(valA).abs();
    let b = normalizeInput(valB).abs();

    if (a.equals(b)) return a;
    if (a.isZero()) return b;
    if (b.isZero()) return a;

    let commonPowerOfTwoFactor = NumericEntity.one;
    let d, temp;

    // Step 1: Remove common factors of 2.
    while (a.isEven() && b.isEven()) {
      // Find the minimum power of 2 that divides both.
      // `getApproxLowestBit` gives 2^k, so divide by it.
      d = getMinimum(largeNum(getApproxLowestBit(a)), largeNum(getApproxLowestBit(b)));
      a = a.divide(d);
      b = b.divide(d);
      commonPowerOfTwoFactor = commonPowerOfTwoFactor.multiply(d);
    }

    // Step 2: Remove factors of 2 from 'a' (now 'b' must be odd).
    while (a.isEven()) {
      a = a.divide(largeNum(getApproxLowestBit(a)));
    }

    // Step 3: Binary Euclidean algorithm.
    do {
      while (b.isEven()) {
        b = b.divide(largeNum(getApproxLowestBit(b)));
      }
      if (a.greater(b)) { // Ensure a <= b.
        temp = b;
        b = a;
        a = temp;
      }
      b = b.subtract(a); // b = b - a.
    } while (!b.isZero());

    // Step 4: Multiply back the common factors of 2.
    return commonPowerOfTwoFactor.isUnit() ? a : a.multiply(commonPowerOfTwoFactor);
  }

  /**
   * Calculates the Least Common Multiple (LCM) of two NumericEntities.
   * LCM(a, b) = |a * b| / GCD(a, b).
   * @param {NumericEntity|number|string} valA - First value.
   * @param {NumericEntity|number|string} valB - Second value.
   * @returns {HugeNumber|CompactNumber} The LCM.
   */
  function leastCommonMultiple(valA, valB) {
    const a = normalizeInput(valA).abs();
    const b = normalizeInput(valB).abs();
    if (a.isZero() || b.isZero()) return NumericEntity.zero; // LCM of zero is zero.
    return a.divide(greatestCommonDivisor(a, b)).multiply(b);
  }

  /**
   * Generates a random NumericEntity between two bounds (inclusive).
   * @param {NumericEntity|number|string} lowerBound - The lower bound.
   * @param {NumericEntity|number|string} upperBound - The upper bound.
   * @returns {HugeNumber|CompactNumber} A random number within the range.
   */
  function generateRandomBetween(lowerBound, upperBound) {
    const low = getMinimum(lowerBound, upperBound);
    const high = getMaximum(lowerBound, upperBound);
    const range = high.subtract(low).add(NumericEntity.one);

    // If the range is small enough, use standard Math.random.
    if (range.isCompact && range.exactVal <= JS_MAX_SAFE_INT) {
      return low.add(Math.floor(Math.random() * range.exactVal));
    }

    // For large ranges, generate chunks randomly.
    const len = range.numericParts.length - 1;
    const resultChunks = [];
    let restricted = true; // Flag to indicate if we're restricted by the range's upper chunks.

    for (let i = len; i >= 0; i--) {
      const upperLimit = restricted ? range.numericParts[i] : CHUNK_BASE;
      // Generate a random digit for this chunk, inclusive of upperLimit.
      const digit = floorOrCeil(Math.random() * (upperLimit + 1));
      resultChunks.unshift(digit);
      if (digit < upperLimit) restricted = false; // If we picked a smaller digit, no longer restricted.
    }

    const randomVal = recombineChunks(resultChunks);
    return low.add(typeof randomVal === "number" ? new CompactNumber(randomVal) : new HugeNumber(randomVal, false));
  }

  // String containing characters for bases up to 36.
  const DIGIT_CHARS = "0123456789abcdefghijklmnopqrstuvwxyz";

  /**
   * Converts a single digit (0-35) to its character representation.
   * @param {number} digit - The digit value.
   * @returns {string} The character representation.
   */
  function digitToChar(digit) {
    if (digit >= 0 && digit <= 35) {
      return DIGIT_CHARS.charAt(digit);
    }
    // For digits > 35, enclose in angle brackets (custom base representation).
    return `<${digit}>`;
  }

  /**
   * Parses a string representation of a number in a given base.
   * @param {string} textValue - The string to parse.
   * @param {number|NumericEntity} base - The base (radix).
   * @returns {HugeNumber|CompactNumber} The parsed number.
   * @throws {Error} If the string contains invalid digits for the base.
   */
  const parseStringWithBase = function(textValue, base) {
    textValue = String(textValue).trim(); // Ensure string and trim whitespace.
    const stringLength = textValue.length;
    const parsedBase = normalizeInput(base);
    const absBaseNum = parsedBase.abs().toJSNumber(); // Get JS number for base for character checks.

    if (absBaseNum < 2) {
      throw new Error(`Invalid base: ${base.toString()}. Base must be an integer >= 2.`);
    }

    // Basic validation for string characters based on the base.
    for (let i = 0; i < stringLength; i++) {
      const char = textValue[i].toLowerCase();
      if (i === 0 && char === "-") continue; // Allow negative sign at start.

      const digitValue = DIGIT_CHARS.indexOf(char);
      if (char === "<") { // Handle custom digits like <123>.
        let endIdx = textValue.indexOf(">", i);
        if (endIdx === -1) throw new Error(`Unclosed custom digit in base ${base.toString()}.`);
        const customDigit = parseInt(textValue.slice(i + 1, endIdx), 10);
        if (isNaN(customDigit) || customDigit < 0 || customDigit >= absBaseNum) {
          throw new Error(`Custom digit <${customDigit}> is not valid in base ${base.toString()}.`);
        }
        i = endIdx; // Skip to end of custom digit.
      } else if (digitValue === -1 || digitValue >= absBaseNum) { // Check standard digits.
        throw new Error(`Digit '${char}' is not valid in base ${base.toString()}.`);
      }
    }

    // Optimization for small bases and numbers that fit in JS integers.
    if (parsedBase.greaterOrEquals(2) && parsedBase.lesserOrEquals(36)) {
      // Estimate max digits for JS_MAX_SAFE_INT in this base.
      const maxDigitsForJsInt = floorOrCeil(JS_MAX_SAFE_LOG / Math.log(absBaseNum));
      if (stringLength <= maxDigitsForJsInt + 2) { // Allow some buffer for sign/precision.
        const jsResult = parseInt(textValue, absBaseNum);
        if (!isNaN(jsResult) && isWithinJsRange(jsResult)) {
          return new CompactNumber(jsResult);
        }
      }
    }

    // General case for large numbers or arbitrary bases.
    const digitValues = [];
    const isNegative = textValue[0] === "-";
    let currentIdx = isNegative ? 1 : 0;

    while (currentIdx < textValue.length) {
      const char = textValue[currentIdx].toLowerCase();
      if (char === "<") {
        const endIdx = textValue.indexOf(">", currentIdx);
        digitValues.push(normalizeInput(textValue.slice(currentIdx + 1, endIdx)));
        currentIdx = endIdx + 1;
      } else {
        const charCode = char.charCodeAt(0);
        if (charCode >= 48 && charCode <= 57) { // '0'-'9'.
          digitValues.push(normalizeInput(charCode - 48));
        } else if (charCode >= 97 && charCode <= 122) { // 'a'-'z'.
          digitValues.push(normalizeInput(charCode - 87));
        }
        currentIdx++;
      }
    }
    return constructFromBaseChunks(digitValues, parsedBase, isNegative);
  };

  /**
   * Constructs a NumericEntity from an array of digit NumericEntities and a base.
   * @param {NumericEntity[]} digitNums - Array of digit values as NumericEntities.
   * @param {NumericEntity} baseNum - The base as a NumericEntity.
   * @param {boolean} isNegativeFlag - True if the final number should be negative.
   * @returns {HugeNumber|CompactNumber} The constructed number.
   */
  function constructFromBaseChunks(digitNums, baseNum, isNegativeFlag) {
    let resultValue = NumericEntity.zero;
    let currentPower = NumericEntity.one;
    
    // Sum digits * base^power, from least significant to most significant.
    for (let i = digitNums.length - 1; i >= 0; i--) {
      resultValue = resultValue.add(digitNums[i].times(currentPower));
      currentPower = currentPower.times(baseNum);
    }
    return isNegativeFlag ? resultValue.negate() : resultValue;
  }

  /**
   * Converts a NumericEntity to an array of its digits in a specified base.
   * @param {NumericEntity} num - The number to convert.
   * @param {NumericEntity} base - The target base.
   * @returns {{value: number[], isNegative: boolean}} Object containing the digit array and sign.
   * @throws {Error} If base is zero.
   */
  function convertToBaseRepresentation(num, base) {
    const targetBase = normalizeInput(base);

    if (targetBase.isZero()) {
      if (num.isZero()) return { value: [0], isNegative: false };
      throw new Error("Cannot convert non-zero numbers to base 0.");
    }
    if (targetBase.isOne()) {
      if (num.isZero()) return { value: [0], isNegative: false };
      // Base 1 representation is just `n` ones.
      // This can be problematic for very large numbers in JS array.
      // For simplicity, we'll return an error if it's too big, or a simplified representation.
      if (!num.isCompact || num.exactVal < 0 || num.exactVal > 1000) { // Arbitrary limit for demo.
          throw new Error("Conversion to base 1 for large or negative numbers is not supported.");
      }
      const onesArray = Array.from({length: num.toJSNumber()}, () => 1);
      return { value: onesArray, isNegative: num.isNegative };
    }

    let isResultNegative = false;
    let currentNumber = num;

    // Handle negative numbers: convert positive number and then apply sign.
    if (currentNumber.isNegative && targetBase.isPositive()) {
      isResultNegative = true;
      currentNumber = currentNumber.abs();
    }

    const outputDigits = [];
    let remaining = currentNumber;
    let divModResult;

    // Repeatedly divide by base and collect remainders.
    while (remaining.isNegative() || remaining.compareAbs(targetBase) >= 0) {
      divModResult = remaining.divmod(targetBase);
      remaining = divModResult.quotient;
      let digit = divModResult.remainder;

      // Adjust for negative remainders (common in arbitrary base conversion).
      if (digit.isNegative()) {
        digit = targetBase.minus(digit).abs(); // digit = abs(base - abs(digit)).
        remaining = remaining.next(); // Adjust quotient.
      }
      outputDigits.push(digit.toJSNumber());
    }
    outputDigits.push(remaining.toJSNumber()); // Add the last quotient.

    return {
      value: outputDigits.reverse(),
      isNegative: isResultNegative
    };
  }

  /**
   * Converts a NumericEntity to its string representation in a given base.
   * @param {NumericEntity} num - The number to convert.
   * @param {number|NumericEntity} base - The target base.
   * @returns {string} The string representation.
   */
  function formatToBaseString(num, base) {
    const conversionResult = convertToBaseRepresentation(num, base);
    const signPrefix = conversionResult.isNegative ? "-" : "";
    return signPrefix + conversionResult.value.map(digitToChar).join("");
  }

  /**
   * Converts the HugeNumber to an array of its digits in a given radix.
   * @param {number} [radix=10] - The target radix.
   * @returns {{value: number[], isNegative: boolean}} Object containing the digit array and sign.
   */
  HugeNumber.prototype.toArray = function(radix = 10) {
    return convertToBaseRepresentation(this, radix);
  };
  CompactNumber.prototype.toArray = HugeNumber.prototype.toArray; // Share implementation.

  /**
   * Converts the HugeNumber to its string representation.
   * @param {number} [radix=10] - The target radix.
   * @returns {string} The string representation.
   */
  HugeNumber.prototype.toString = function(radix = 10) {
    if (radix !== 10) return formatToBaseString(this, radix);

    // Optimized string conversion for base 10.
    const chunks = this.numericParts;
    const len = chunks.length;
    let str = String(chunks[len - 1]); // Start with the most significant chunk.

    // Pad intermediate chunks with leading zeros.
    const zeroPad = "0".repeat(CHUNK_DIGITS);
    for (let i = len - 2; i >= 0; i--) {
      const digitStr = String(chunks[i]);
      str += zeroPad.slice(digitStr.length) + digitStr;
    }
    const signPrefix = this.isNegative ? "-" : "";
    return signPrefix + str;
  };

  /**
   * Converts the CompactNumber to its string representation.
   * @param {number} [radix=10] - The target radix.
   * @returns {string} The string representation.
   */
  CompactNumber.prototype.toString = function(radix = 10) {
    if (radix !== 10) return formatToBaseString(this, radix);
    return String(this.exactVal);
  };

  /**
   * Returns the JSON representation of the number (its string form).
   * @returns {string} JSON string.
   */
  HugeNumber.prototype.toJSON = CompactNumber.prototype.toJSON = function() {
    return this.toString();
  };

  /**
   * Converts the HugeNumber to a JavaScript number.
   * WARNING: This can be lossy for numbers exceeding JS_MAX_SAFE_INT.
   * @returns {number} The JS number representation.
   */
  HugeNumber.prototype.toJSNumber = function() {
    // Attempt to parse the string representation, which might lose precision for very large numbers.
    return parseFloat(this.toString());
  };
  HugeNumber.prototype.valueOf = HugeNumber.prototype.toJSNumber; // Alias.

  /**
   * Converts the CompactNumber to a JavaScript number.
   * @returns {number} The JS number representation.
   */
  CompactNumber.prototype.toJSNumber = function() {
    return this.exactVal;
  };
  CompactNumber.prototype.valueOf = CompactNumber.prototype.toJSNumber; // Alias.

  /**
   * Parses a string value into a NumericEntity.
   * Handles scientific notation and ensures it's an integer.
   * @param {string} strVal - The string value.
   * @returns {HugeNumber|CompactNumber} The parsed number.
   * @throws {Error} If the string is not a valid integer.
   */
  function processStringInput(strVal) {
    strVal = String(strVal).trim(); // Ensure string and trim whitespace.

    // Check for "e" notation (scientific notation).
    const scientificNotationParts = strVal.split(/e/i);
    if (scientificNotationParts.length > 2) {
      throw new Error(`Invalid integer format: "${strVal}" contains multiple 'e' characters.`);
    }

    let finalStringValue = scientificNotationParts[0];
    let isNegative = finalStringValue[0] === "-";
    if (isNegative) {
      finalStringValue = finalStringValue.slice(1);
    }

    if (scientificNotationParts.length === 2) {
      let exponentStr = scientificNotationParts[1];
      if (exponentStr[0] === "+") exponentStr = exponentStr.slice(1);
      const exponent = +exponentStr;

      if (!Number.isInteger(exponent) || !isWithinJsRange(exponent)) {
        throw new Error(`Invalid exponent in scientific notation: "${exponentStr}" is not a valid integer.`);
      }

      const decimalPointIndex = finalStringValue.indexOf(".");
      if (decimalPointIndex >= 0) {
        // Adjust exponent by number of fractional digits.
        exponent -= (finalStringValue.length - decimalPointIndex - 1);
        finalStringValue = finalStringValue.slice(0, decimalPointIndex) + finalStringValue.slice(decimalPointIndex + 1);
      }

      if (exponent < 0) {
        throw new Error(`Cannot represent fractional numbers (negative exponent) as integers: "${strVal}".`);
      }
      // Pad with zeros for positive exponent.
      finalStringValue += "0".repeat(exponent);
    }

    // After processing scientific notation, check for any remaining decimal points.
    if (finalStringValue.includes(".")) {
      throw new Error(`Invalid integer format: "${strVal}" contains a decimal point after exponent processing.`);
    }

    // Quick check: if the number fits JS safe integer range and is a simple numeric string.
    const numAsJs = +finalStringValue;
    if (Number.isInteger(numAsJs) && isWithinJsRange(numAsJs) && String(numAsJs) === finalStringValue) {
        return new CompactNumber(isNegative ? -numAsJs : numAsJs);
    }

    // Validate if it's a pure digit string.
    if (!/^[0-9]+$/.test(finalStringValue)) {
      throw new Error(`Invalid integer format: "${finalStringValue}" contains non-digit characters.`);
    }
    if (finalStringValue.length === 0) return NumericEntity.zero; // Handle empty string after processing.

    // Split into chunks for HugeNumber representation.
    const chunks = [];
    const maxLen = finalStringValue.length;
    let currentEnd = maxLen;
    let currentStart = maxLen - CHUNK_DIGITS;

    while (currentEnd > 0) {
      if (currentStart < 0) currentStart = 0;
      chunks.push(+finalStringValue.slice(currentStart, currentEnd));
      currentEnd = currentStart;
      currentStart -= CHUNK_DIGITS;
    }
    normalizeChunks(chunks); // Ensure no leading zeros if the number was 0.
    return new HugeNumber(chunks, isNegative);
  }

  /**
   * Parses a number value into a NumericEntity.
   * @param {number} numVal - The number value.
   * @returns {HugeNumber|CompactNumber} The parsed number.
   * @throws {Error} If the number is not an integer.
   */
  function processNumericInput(numVal) {
    if (!Number.isInteger(numVal)) {
      throw new Error(`${numVal} is not an integer.`);
    }
    if (isWithinJsRange(numVal)) {
      return new CompactNumber(numVal);
    }
    // If it's a large integer, convert to string and parse (might lose precision if not exact).
    return processStringInput(numVal.toString());
  }

  /**
   * Normalizes various input types into a NumericEntity instance.
   * This is the primary entry point for converting external inputs to internal number objects.
   * @param {number|string|NumericEntity} input - The input value.
   * @returns {HugeNumber|CompactNumber} A NumericEntity instance.
   * @throws {TypeError} For invalid input types.
   */
  function normalizeInput(input) {
    if (input instanceof HugeNumber || input instanceof CompactNumber) {
      return input;
    }
    if (typeof input === "number") {
      return processNumericInput(input);
    }
    if (typeof input === "string") {
      return processStringInput(input);
    }
    // Fallback for unexpected types.
    throw new TypeError(`Invalid input type for NumericEntity: ${typeof input}. Expected number, string, HugeNumber, or CompactNumber.`);
  }

  // Pre-populate small integers (0-999 and their negatives) for performance.
  for (let i = 0; i < 1e3; i++) {
    NumericEntity[i] = new CompactNumber(i);
    if (i > 0) NumericEntity[-i] = new CompactNumber(-i);
  }

  // Static properties and aliases for common NumericEntity instances and functions.
  NumericEntity.one = NumericEntity[1];
  NumericEntity.two = NumericEntity[2];
  NumericEntity.zero = NumericEntity[0];
  NumericEntity.negativeOne = NumericEntity[-1];
  NumericEntity.max = getMaximum;
  NumericEntity.min = getMinimum;
  NumericEntity.gcd = greatestCommonDivisor;
  NumericEntity.lcm = leastCommonMultiple;
  NumericEntity.isInstance = function(x) {
    return x instanceof HugeNumber || x instanceof CompactNumber;
  };
  NumericEntity.randBetween = generateRandomBetween;
  NumericEntity.fromArray = function(digits, base, isNegative) {
    // Ensure digits are NumericEntities.
    const processedDigits = digits.map(normalizeInput);
    // Base defaults to 10 if not provided.
    const processedBase = normalizeInput(base == null ? 10 : base);
    return constructFromBaseChunks(processedDigits, processedBase, isNegative || false);
  };

  // Add a static factory function for convenient instance creation.
  NumericEntity.create = function(value, radix) {
    return new NumericEntity(value, radix);
  }

  return NumericEntity;
}(); // IIFE (Immediately Invoked Function Expression) for `largeNum`.

/**
 * Main execution logic for the problem.
 * This function processes the input and calculates the result.
 * The problem appears to be a variation of counting trailing zeros,
 * specifically by calculating sum(floor(N / (2 * 5^k))).
 * @param {string} rawInput - The raw input string from stdin.
 */
const executeCalculation = rawInput => {
    // Input validation.
    if (typeof rawInput !== 'string') {
        console.error("Error: Input must be a string.");
        return;
    }

    const inputLines = rawInput.trim().split("\n");
    if (inputLines.length === 0 || inputLines[0].trim() === '') {
        console.error("Error: Empty input provided.");
        return;
    }

    // Parse the input number using the custom largeNum library.
    let targetNumber;
    try {
        targetNumber = largeNum(inputLines[0]);
    } catch (e) {
        console.error(`Error parsing input number: ${e.message}`);
        return;
    }
    
    // According to the original problem's logic, if N is negative, the result is 0.
    if (targetNumber.isNegative()) {
        console.log(0);
        return;
    }

    // The original code checks if N itself is odd, and if so, prints 0.
    // This is a specific constraint of the problem, not a general property of trailing zeros in factorials.
    // (e.g., 5! = 120, has 1 trailing zero, and 5 is odd).
    // The problem statement implies a calculation based on N divided by 2.
    // If N is odd, N/2 is not an integer, making the premise of the calculation invalid.
    const remainderAfterDivisionByTwo = targetNumber.divmod(largeNum.two).remainder;
    if (!remainderAfterDivisionByTwo.isZero()) { // Check if the remainder is not zero (i.e., N is odd).
        console.log(0);
        return;
    }
    
    // Calculate the sum of factors of 5 in a specific context.
    // The formula being implemented is sum(floor(N / (2 * 5^k))) for k >= 1.
    // This is a modified Legendre's formula. Legendre's formula for trailing zeros in N! is sum(floor(N / 5^k)).
    // The division by 2 in the denominator suggests a special variant, possibly related to N/2!.

    const powersOfFiveList = [];
    let currentPowerOfFive = largeNum(5); // Start with 5^1.
    
    // Generate powers of 5 up to N.
    while (targetNumber.greaterOrEquals(currentPowerOfFive)) {
        powersOfFiveList.push(currentPowerOfFive);
        currentPowerOfFive = currentPowerOfFive.multiply(5);
    }

    let accumulatedZeroCount = largeNum(0); // Initialize the total count.
    
    // Iterate through the powers of 5.
    for (const fivePower of powersOfFiveList) {
        // Calculate the effective divisor: 2 * 5^k.
        const effectiveDivisor = fivePower.multiply(2);
        
        // Compute floor(N / effectiveDivisor).
        const currentQuotient = targetNumber.divide(effectiveDivisor);
        
        // Add this quotient to the total count.
        accumulatedZeroCount = accumulatedZeroCount.add(currentQuotient);
    }
    
    // Output the final count as a string.
    console.log(accumulatedZeroCount.toString());
};

// Read input from standard input and execute the calculation.
executeCalculation(require('fs').readFileSync('/dev/stdin', 'utf8'));