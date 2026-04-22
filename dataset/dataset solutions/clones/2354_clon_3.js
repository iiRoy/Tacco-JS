'use strict';

let largeNum = function (undefined) {
  // Constants for internal representation
  const CHUNK_SIZE = 1e7; // Base for array digits (10^7)
  const CHUNK_DIGITS = 7; // Number of digits per chunk
  const JS_MAX_SAFE = 9007199254740992; // Max safe integer in JavaScript
  const JS_MAX_ARRAY = jsNumToChunks(JS_MAX_SAFE); // JS_MAX_SAFE as a chunk array
  const LOG_JS_MAX_SAFE = Math.log(JS_MAX_SAFE); // Log of JS_MAX_SAFE for comparisons

  /**
   * Represents a numeric value, abstract base class.
   * @param {number|string|Object} initialVal - The value to wrap.
   * @param {number} [radix] - The base of the initialVal string.
   * @returns {NumWrapper} An instance of LargeNum or SmallNum.
   */
  function NumWrapper(initialVal, radix) {
    if (typeof initialVal === "undefined") {
      // Default to zero if no value provided
      return NumWrapper[0];
    }
    if (typeof radix !== "undefined") {
      // If radix is provided, parse accordingly
      return +radix === 10 ? processInput(initialVal) : decodeBaseStr(initialVal, radix);
    }
    // Otherwise, process as a standard number or string input
    return processInput(initialVal);
  }

  /**
   * Represents a large number using an array of chunks.
   * @param {number[]} chunkArray - Array of number chunks.
   * @param {boolean} isNegativeFlag - True if the number is negative.
   */
  function LargeNum(chunkArray, isNegativeFlag) {
    this.digits = chunkArray;
    this.isNegative = isNegativeFlag;
    this.isCompact = false; // Not a small integer
  }
  LargeNum.prototype = Object.create(NumWrapper.prototype);

  /**
   * Represents a small number that fits into a standard JavaScript number.
   * @param {number} numVal - The numeric value.
   */
  function SmallNum(numVal) {
    this.val = numVal;
    this.isNegative = numVal < 0;
    this.isCompact = true; // Is a small integer
  }
  SmallNum.prototype = Object.create(NumWrapper.prototype);

  /**
   * Checks if a number can be precisely represented by JavaScript's number type.
   * @param {number} n - The number to check.
   * @returns {boolean} True if precise, false otherwise.
   */
  function canFitInJsNum(n) {
    return n > -JS_MAX_SAFE && n < JS_MAX_SAFE;
  }

  /**
   * Converts a JavaScript number into an array of chunks.
   * @param {number} n - The number to convert.
   * @returns {number[]} Array of chunks.
   */
  function jsNumToChunks(n) {
    if (n < CHUNK_SIZE) return [n];
    if (n < 1e14) return [n % CHUNK_SIZE, Math.floor(n / CHUNK_SIZE)];
    // For numbers larger than 1e14, up to JS_MAX_SAFE
    return [n % CHUNK_SIZE, Math.floor(n / CHUNK_SIZE) % CHUNK_SIZE, Math.floor(n / 1e14)];
  }

  /**
   * Converts an array of chunks back to a small JavaScript number if possible.
   * @param {number[]} chunkArray - Array of chunks.
   * @returns {number|number[]} The number if small, otherwise the original array.
   */
  function chunksToJsNum(chunkArray) {
    normalizeChunks(chunkArray);
    const chunkCount = chunkArray.length;
    if (chunkCount < 4 && compareAbsChunks(chunkArray, JS_MAX_ARRAY) < 0) {
      switch (chunkCount) {
        case 0:
          return 0;
        case 1:
          return chunkArray[0];
        case 2:
          return chunkArray[0] + chunkArray[1] * CHUNK_SIZE;
        default: // case 3
          return chunkArray[0] + (chunkArray[1] + chunkArray[2] * CHUNK_SIZE) * CHUNK_SIZE;
      }
    }
    return chunkArray;
  }

  /**
   * Removes leading zero chunks from an array.
   * @param {number[]} chunkArray - The array to trim.
   */
  function normalizeChunks(chunkArray) {
    let index = chunkArray.length;
    while (index > 0 && chunkArray[--index] === 0); // Find first non-zero from end
    chunkArray.length = index + 1; // Resize array
  }

  /**
   * Creates an array filled with zeros.
   * @param {number} length - The desired length of the array.
   * @returns {number[]} An array of zeros.
   */
  function makeZeroChunks(length) {
    const arr = new Array(length);
    for (let i = 0; i < length; i++) {
      arr[i] = 0;
    }
    return arr;
  }

  /**
   * Returns the integer part of a number (floor for positive, ceil for negative).
   * @param {number} n - The number to truncate.
   * @returns {number} The truncated integer.
   */
  function intFloor(n) {
    return n > 0 ? Math.floor(n) : Math.ceil(n);
  }

  /**
   * Adds two arrays of chunks (representing positive numbers).
   * Assumes a.length >= b.length.
   * @param {number[]} a - First chunk array.
   * @param {number[]} b - Second chunk array.
   * @returns {number[]} Resulting chunk array.
   */
  function addChunks(a, b) {
    const lenA = a.length,
      lenB = b.length;
    const result = new Array(lenA);
    let carry = 0;
    let tempSum;

    for (let i = 0; i < lenB; i++) {
      tempSum = a[i] + b[i] + carry;
      carry = tempSum >= CHUNK_SIZE ? 1 : 0;
      result[i] = tempSum - carry * CHUNK_SIZE;
    }
    for (let i = lenB; i < lenA; i++) {
      tempSum = a[i] + carry;
      carry = tempSum >= CHUNK_SIZE ? 1 : 0;
      result[i] = tempSum - carry * CHUNK_SIZE;
    }

    if (carry > 0) result.push(carry);
    return result;
  }

  /**
   * Adds two arrays of chunks, handling length differences.
   * @param {number[]} a - First chunk array.
   * @param {number[]} b - Second chunk array.
   * @returns {number[]} Resulting chunk array.
   */
  function addChunksFlexible(a, b) {
    return a.length >= b.length ? addChunks(a, b) : addChunks(b, a);
  }

  /**
   * Adds a small integer (chunk) to an array of chunks.
   * @param {number[]} arr - The array of chunks.
   * @param {number} smallVal - The small integer to add (must be positive).
   * @returns {number[]} Resulting chunk array.
   */
  function addChunkToChunks(arr, smallVal) {
    const len = arr.length;
    const result = new Array(len);
    let carry = smallVal;
    let tempSum;

    for (let i = 0; i < len; i++) {
      tempSum = arr[i] + carry;
      carry = Math.floor(tempSum / CHUNK_SIZE);
      result[i] = tempSum % CHUNK_SIZE;
    }

    // Propagate carry if any
    while (carry > 0) {
      result.push(carry % CHUNK_SIZE);
      carry = Math.floor(carry / CHUNK_SIZE);
    }
    return result;
  }

  LargeNum.prototype.add = function (otherVal) {
    const otherNum = processInput(otherVal);
    if (this.isNegative !== otherNum.isNegative) {
      // Different signs, perform subtraction
      return this.subtract(otherNum.flipSign());
    }

    const arrA = this.digits,
      arrB = otherNum.digits;
    let resultingDigits;

    if (otherNum.isCompact) {
      // Add a small integer to a large number
      resultingDigits = addChunkToChunks(arrA, Math.abs(otherNum.val));
    } else {
      resultingDigits = addChunksFlexible(arrA, arrB);
    }
    return new LargeNum(resultingDigits, this.isNegative);
  };
  LargeNum.prototype.plus = LargeNum.prototype.add; // Alias

  SmallNum.prototype.add = function (otherVal) {
    const otherNum = processInput(otherVal);
    const currentVal = this.val;

    if (currentVal < 0 !== otherNum.isNegative) {
      // Different signs, perform subtraction
      return this.subtract(otherNum.flipSign());
    }

    if (otherNum.isCompact) {
      const sum = currentVal + otherNum.val;
      if (canFitInJsNum(sum)) return new SmallNum(sum);
      // If it overflows JS_MAX_SAFE, convert to LargeNum
      const absSum = Math.abs(sum);
      return new LargeNum(jsNumToChunks(absSum), sum < 0);
    }

    // Adding a small number to a large number
    const largeDigits = otherNum.digits;
    const absSmallVal = Math.abs(currentVal);
    const newDigits = addChunkToChunks(largeDigits, absSmallVal);
    return new LargeNum(newDigits, currentVal < 0);
  };
  SmallNum.prototype.plus = SmallNum.prototype.add; // Alias

  /**
   * Subtracts chunk array b from chunk array a (a >= b, both positive).
   * @param {number[]} a - Minuend chunk array.
   * @param {number[]} b - Subtrahend chunk array.
   * @returns {number[]} Resulting chunk array.
   */
  function subtractChunks(a, b) {
    const lenA = a.length,
      lenB = b.length;
    const result = new Array(lenA);
    let borrow = 0;
    let difference;

    for (let i = 0; i < lenB; i++) {
      difference = a[i] - borrow - b[i];
      if (difference < 0) {
        difference += CHUNK_SIZE;
        borrow = 1;
      } else {
        borrow = 0;
      }
      result[i] = difference;
    }

    // Propagate borrow through remaining digits of 'a'
    for (let i = lenB; i < lenA; i++) {
      difference = a[i] - borrow;
      if (difference < 0) {
        difference += CHUNK_SIZE;
        borrow = 1; // Borrow still needed from next digit
      } else {
        result[i++] = difference; // Borrow resolved, copy rest
        while (i < lenA) result[i] = a[i++];
        break;
      }
      result[i] = difference;
    }

    normalizeChunks(result);
    return result;
  }

  /**
   * Performs subtraction between two chunk arrays, handling signs and magnitude.
   * @param {number[]} aDigits - First operand's chunk array.
   * @param {number[]} bDigits - Second operand's chunk array.
   * @param {boolean} currentSign - The expected sign of the result if aDigits >= bDigits.
   * @returns {NumWrapper} The result as a LargeNum or SmallNum.
   */
  function subtractChunksFlexible(aDigits, bDigits, currentSign) {
    let resultDigits;
    let finalSign = currentSign;

    if (compareAbsChunks(aDigits, bDigits) >= 0) {
      resultDigits = subtractChunks(aDigits, bDigits);
    } else {
      resultDigits = subtractChunks(bDigits, aDigits);
      finalSign = !finalSign; // Flip sign if b was larger
    }

    const smallResult = chunksToJsNum(resultDigits);
    if (typeof smallResult === "number") {
      return new SmallNum(finalSign ? -smallResult : smallResult);
    }
    return new LargeNum(resultDigits, finalSign);
  }

  /**
   * Subtracts a small integer (chunk) from an array of chunks.
   * @param {number[]} arr - The array of chunks.
   * @param {number} smallVal - The small integer to subtract (must be positive).
   * @param {boolean} currentSign - The sign of the original large number.
   * @returns {NumWrapper} The result as a LargeNum or SmallNum.
   */
  function subtractChunkFromChunks(arr, smallVal, currentSign) {
    const len = arr.length;
    const result = new Array(len);
    let borrow = smallVal; // Use 'borrow' as the value to subtract
    let difference;

    for (let i = 0; i < len; i++) {
      difference = arr[i] - borrow;
      borrow = 0; // Reset borrow for this digit
      if (difference < 0) {
        difference += CHUNK_SIZE;
        borrow = 1; // Carry a borrow to the next digit
      }
      result[i] = difference;
    }

    const smallResult = chunksToJsNum(result);
    if (typeof smallResult === "number") {
      return new SmallNum(currentSign ? -smallResult : smallResult);
    }
    return new LargeNum(result, currentSign);
  }

  LargeNum.prototype.subtract = function (otherVal) {
    const otherNum = processInput(otherVal);
    if (this.isNegative !== otherNum.isNegative) {
      // Different signs, perform addition with flipped sign
      return this.add(otherNum.flipSign());
    }

    const arrA = this.digits,
      arrB = otherNum.digits;
    if (otherNum.isCompact) {
      return subtractChunkFromChunks(arrA, Math.abs(otherNum.val), this.isNegative);
    }
    return subtractChunksFlexible(arrA, arrB, this.isNegative);
  };
  LargeNum.prototype.minus = LargeNum.prototype.subtract; // Alias

  SmallNum.prototype.subtract = function (otherVal) {
    const otherNum = processInput(otherVal);
    const currentVal = this.val;

    if (currentVal < 0 !== otherNum.isNegative) {
      // Different signs, perform addition with flipped sign
      return this.add(otherNum.flipSign());
    }

    if (otherNum.isCompact) {
      const difference = currentVal - otherNum.val;
      if (canFitInJsNum(difference)) return new SmallNum(difference);
      // If it overflows JS_MAX_SAFE, convert to LargeNum
      const absDiff = Math.abs(difference);
      return new LargeNum(jsNumToChunks(absDiff), difference < 0);
    }

    // Subtracting a large number from a small number
    const largeDigits = otherNum.digits;
    const absSmallVal = Math.abs(currentVal);
    // Effectively, this is -(large - small) if small is positive and large is positive
    // or (small - large) if small is negative and large is negative
    const newDigits = subtractChunkFromChunks(largeDigits, absSmallVal, currentVal >= 0);
    return newDigits.flipSign(); // Result sign is opposite of currentVal's sign
  };
  SmallNum.prototype.minus = SmallNum.prototype.subtract; // Alias

  LargeNum.prototype.flipSign = function () {
    return new LargeNum(this.digits, !this.isNegative);
  };
  SmallNum.prototype.flipSign = function () {
    return new SmallNum(-this.val); // Directly negate the value for small numbers
  };

  LargeNum.prototype.absoluteValue = function () {
    return new LargeNum(this.digits, false);
  };
  SmallNum.prototype.absoluteValue = function () {
    return new SmallNum(Math.abs(this.val));
  };

  /**
   * Multiplies two chunk arrays using standard long multiplication.
   * @param {number[]} a - First chunk array.
   * @param {number[]} b - Second chunk array.
   * @returns {number[]} Resulting chunk array.
   */
  function multiplyLongChunks(a, b) {
    const lenA = a.length,
      lenB = b.length;
    const result = makeZeroChunks(lenA + lenB); // Result can have up to lenA + lenB chunks
    let tempProduct, carry;

    for (let i = 0; i < lenA; ++i) {
      const chunkA = a[i];
      for (let j = 0; j < lenB; ++j) {
        const chunkB = b[j];
        tempProduct = chunkA * chunkB + result[i + j];
        carry = Math.floor(tempProduct / CHUNK_SIZE);
        result[i + j] = tempProduct - carry * CHUNK_SIZE;
        result[i + j + 1] += carry; // Add carry to the next position
      }
    }
    normalizeChunks(result);
    return result;
  }

  /**
   * Multiplies a chunk array by a single small integer (chunk).
   * @param {number[]} arr - The chunk array.
   * @param {number} multiplier - The small integer multiplier.
   * @returns {number[]} Resulting chunk array.
   */
  function multiplyChunksByChunk(arr, multiplier) {
    const len = arr.length;
    const result = new Array(len);
    let carry = 0;
    let tempProduct;

    for (let i = 0; i < len; i++) {
      tempProduct = arr[i] * multiplier + carry;
      carry = Math.floor(tempProduct / CHUNK_SIZE);
      result[i] = tempProduct - carry * CHUNK_SIZE;
    }

    // Propagate carry if any
    while (carry > 0) {
      result.push(carry % CHUNK_SIZE);
      carry = Math.floor(carry / CHUNK_SIZE);
    }
    return result;
  }

  /**
   * Adds zeros to the beginning of a chunk array, simulating a left shift.
   * @param {number[]} arr - The chunk array.
   * @param {number} count - Number of zeros to prepend.
   * @returns {number[]} Shifted array.
   */
  function shiftChunksLeftByZeros(arr, count) {
    const zeros = [];
    while (count-- > 0) zeros.push(0);
    return zeros.concat(arr);
  }

  /**
   * Multiplies two chunk arrays using Karatsuba algorithm for efficiency with large numbers.
   * @param {number[]} x - First chunk array.
   * @param {number[]} y - Second chunk array.
   * @returns {number[]} Resulting chunk array.
   */
  function karatsubaMultiply(x, y) {
    const n = Math.max(x.length, y.length);
    // Base case for small arrays, use long multiplication
    if (n <= 30) return multiplyLongChunks(x, y);

    // Split arrays into two halves
    const halfN = Math.ceil(n / 2);
    const xLow = x.slice(0, halfN);
    const xHigh = x.slice(halfN);
    const yLow = y.slice(0, halfN);
    const yHigh = y.slice(halfN);

    // Recursively compute products
    const p1 = karatsubaMultiply(xLow, yLow); // xLow * yLow
    const p2 = karatsubaMultiply(xHigh, yHigh); // xHigh * yHigh
    const p3 = karatsubaMultiply(addChunksFlexible(xLow, xHigh), addChunksFlexible(yLow, yHigh)); // (xLow+xHigh)*(yLow+yHigh)

    // Combine results: p2 * base^(2*halfN) + (p3 - p1 - p2) * base^halfN + p1
    const middleTerm = subtractChunks(subtractChunks(p3, p1), p2);
    const product = addChunksFlexible(addChunksFlexible(p1, shiftChunksLeftByZeros(middleTerm, halfN)), shiftChunksLeftByZeros(p2, 2 * halfN));
    normalizeChunks(product);
    return product;
  }

  /**
   * Heuristic to decide if Karatsuba multiplication should be used.
   * @param {number} len1 - Length of first array.
   * @param {number} len2 - Length of second array.
   * @returns {boolean} True if Karatsuba is likely faster.
   */
  function shouldUseKaratsuba(len1, len2) {
    // This formula is an empirical heuristic, might vary by environment/implementation
    return -0.012 * len1 - 0.012 * len2 + 15e-6 * len1 * len2 > 0;
  }

  LargeNum.prototype.multiply = function (otherVal) {
    const otherNum = processInput(otherVal);
    const arrA = this.digits,
      arrB = otherNum.digits;
    const finalSign = this.isNegative !== otherNum.isNegative;
    let resultDigits;

    if (otherNum.isCompact) {
      const smallValue = otherNum.val;
      if (smallValue === 0) return NumWrapper[0];
      if (smallValue === 1) return this;
      if (smallValue === -1) return this.flipSign();

      const absSmallValue = Math.abs(smallValue);
      if (absSmallValue < CHUNK_SIZE) {
        resultDigits = multiplyChunksByChunk(arrA, absSmallValue);
      } else {
        resultDigits = multiplyLongChunks(arrA, jsNumToChunks(absSmallValue));
      }
    } else {
      if (shouldUseKaratsuba(arrA.length, arrB.length)) {
        resultDigits = karatsubaMultiply(arrA, arrB);
      } else {
        resultDigits = multiplyLongChunks(arrA, arrB);
      }
    }
    return new LargeNum(resultDigits, finalSign);
  };
  LargeNum.prototype.times = LargeNum.prototype.multiply; // Alias

  /**
   * Helper for internal multiplication by small numbers.
   * @param {number} smallValAbs - Absolute value of the small integer.
   * @param {number[]} largeDigits - Chunk array of the large number.
   * @param {boolean} finalSign - Sign of the result.
   * @returns {LargeNum} The product.
   */
  function multiplySmallWithChunks(smallValAbs, largeDigits, finalSign) {
    if (smallValAbs < CHUNK_SIZE) {
      return new LargeNum(multiplyChunksByChunk(largeDigits, smallValAbs), finalSign);
    }
    return new LargeNum(multiplyLongChunks(largeDigits, jsNumToChunks(smallValAbs)), finalSign);
  }

  LargeNum.prototype._multByCompact = function (smallOther) {
    if (smallOther.val === 0) return NumWrapper[0];
    if (smallOther.val === 1) return this;
    if (smallOther.val === -1) return this.flipSign();
    return multiplySmallWithChunks(Math.abs(smallOther.val), this.digits, this.isNegative !== smallOther.isNegative);
  };

  SmallNum.prototype._multByCompact = function (smallOther) {
    const product = this.val * smallOther.val;
    if (canFitInJsNum(product)) {
      return new SmallNum(product);
    }
    // Convert to LargeNum if product overflows
    return multiplySmallWithChunks(Math.abs(smallOther.val), jsNumToChunks(Math.abs(this.val)), this.isNegative !== smallOther.isNegative);
  };

  SmallNum.prototype.multiply = function (otherVal) {
    // Delegate to the appropriate _multByCompact method based on 'otherVal'
    const otherNum = processInput(otherVal);
    if (otherNum.isCompact) {
      return this._multByCompact(otherNum);
    }
    // If otherNum is large, call its _multByCompact method with 'this'
    return otherNum._multByCompact(this);
  };
  SmallNum.prototype.times = SmallNum.prototype.multiply; // Alias

  /**
   * Squares a chunk array. Implements a specialized multiplication for squaring.
   * @param {number[]} arr - The chunk array to square.
   * @returns {number[]} Resulting chunk array.
   */
  function squareChunks(arr) {
    const len = arr.length;
    const result = makeZeroChunks(len + len);
    let tempProduct, carry;

    for (let i = 0; i < len; i++) {
      const chunkI = arr[i];
      carry = 0; // Reset carry for each outer loop iteration
      // Diagonal elements (a_i * a_i) are added once, off-diagonal (a_i * a_j) are added twice
      tempProduct = chunkI * chunkI + result[i + i];
      carry = Math.floor(tempProduct / CHUNK_SIZE);
      result[i + i] = tempProduct - carry * CHUNK_SIZE;
      result[i + i + 1] += carry; // Propagate carry from diagonal

      for (let j = i + 1; j < len; j++) {
        const chunkJ = arr[j];
        tempProduct = 2 * (chunkI * chunkJ) + result[i + j]; // 2 * a_i * a_j
        carry = Math.floor(tempProduct / CHUNK_SIZE);
        result[i + j] = tempProduct - carry * CHUNK_SIZE;
        result[i + j + 1] += carry; // Propagate carry
      }
    }
    normalizeChunks(result);
    return result;
  }

  LargeNum.prototype.square = function () {
    return new LargeNum(squareChunks(this.digits), false); // Square is always positive
  };
  SmallNum.prototype.square = function () {
    const squaredVal = this.val * this.val;
    if (canFitInJsNum(squaredVal)) return new SmallNum(squaredVal);
    return new LargeNum(squareChunks(jsNumToChunks(Math.abs(this.val))), false);
  };

  // Division and Modulo functions

  /**
   * Division and modulo using Knuth's D-algorithm (Algorithm 9.1 in "The Art of Computer Programming, Vol 2").
   * This is generally faster for very large numbers.
   * @param {number[]} dividend - The dividend as a chunk array.
   * @param {number[]} divisor - The divisor as a chunk array.
   * @returns {[number[], number[]]} An array containing [quotient, remainder] chunk arrays.
   */
  function divideAndModNewton(dividend, divisor) {
    // Implementation of divMod1 from original, renamed and slightly refactored
    const lenDividend = dividend.length,
      lenDivisor = divisor.length;
    const quotientChunks = makeZeroChunks(lenDividend); // Max possible quotient length
    const base = CHUNK_SIZE;

    // Normalize divisor to have its most significant digit >= base/2
    const divisorMSD = divisor[lenDivisor - 1];
    const normalizationFactor = Math.ceil(base / (2 * divisorMSD));

    let normalizedDividend = multiplyChunksByChunk(dividend, normalizationFactor);
    let normalizedDivisor = multiplyChunksByChunk(divisor, normalizationFactor);

    // Adjust dividend length for normalization
    if (normalizedDividend.length <= lenDividend) normalizedDividend.push(0);
    normalizedDivisor.push(0); // Pad divisor for alignment in loops

    const effectiveDivisorMSD = normalizedDivisor[lenDivisor - 1]; // Most significant digit of the normalized divisor

    for (let shift = lenDividend - lenDivisor; shift >= 0; shift--) {
      let quotientDigit = base - 1; // Initial guess for quotient digit

      // Refine quotient digit estimate
      if (normalizedDividend[shift + lenDivisor] !== effectiveDivisorMSD) {
        quotientDigit = Math.floor(
          (normalizedDividend[shift + lenDivisor] * base + normalizedDividend[shift + lenDivisor - 1]) /
          effectiveDivisorMSD
        );
      }

      let carry = 0;
      let borrow = 0;
      const currentDivisorLength = normalizedDivisor.length;

      // Perform partial subtraction based on quotientDigit guess
      for (let i = 0; i < currentDivisorLength; i++) {
        carry += quotientDigit * normalizedDivisor[i];
        const carryFromDigit = Math.floor(carry / base);
        borrow += normalizedDividend[shift + i] - (carry - carryFromDigit * base);
        carry = carryFromDigit;

        if (borrow < 0) {
          normalizedDividend[shift + i] = borrow + base;
          borrow = -1;
        } else {
          normalizedDividend[shift + i] = borrow;
          borrow = 0;
        }
      }

      // Adjust quotientDigit if guess was too high (borrow is negative)
      while (borrow !== 0) {
        quotientDigit -= 1;
        carry = 0;
        for (let i = 0; i < currentDivisorLength; i++) {
          carry += normalizedDividend[shift + i] - base + normalizedDivisor[i];
          if (carry < 0) {
            normalizedDividend[shift + i] = carry + base;
            carry = 0;
          } else {
            normalizedDividend[shift + i] = carry;
            carry = 1;
          }
        }
        borrow += carry;
      }
      quotientChunks[shift] = quotientDigit;
    }

    // Denormalize the remainder
    const denormalizedRemainder = divideAndModByChunk(normalizedDividend, normalizationFactor)[0];
    return [chunksToJsNum(quotientChunks), chunksToJsNum(denormalizedRemainder)];
  }

  /**
   * Division and modulo using a more straightforward (but potentially slower for very large numbers) approach.
   * Simulates traditional long division.
   * @param {number[]} dividend - The dividend as a chunk array.
   * @param {number[]} divisor - The divisor as a chunk array.
   * @returns {[number[], number[]]} An array containing [quotient, remainder] chunk arrays.
   */
  function divideAndModClassic(dividend, divisor) {
    // Implementation of divMod2 from original, renamed and slightly refactored
    let lenDividend = dividend.length,
      lenDivisor = divisor.length;
    const quotientResult = [];
    let currentPartialDividend = [];
    const base = CHUNK_SIZE;
    let guessDigit, xLen, highX, highY;

    // Process dividend chunks from most significant to least
    while (lenDividend > 0) {
      currentPartialDividend.unshift(dividend[--lenDividend]); // Take next chunk from dividend
      normalizeChunks(currentPartialDividend); // Trim leading zeros

      // If current partial dividend is smaller than divisor, quotient digit is 0
      if (compareAbsChunks(currentPartialDividend, divisor) < 0) {
        quotientResult.push(0);
        continue;
      }

      xLen = currentPartialDividend.length;
      highX = currentPartialDividend[xLen - 1] * base + (currentPartialDividend[xLen - 2] || 0);
      highY = divisor[lenDivisor - 1] * base + (divisor[lenDivisor - 2] || 0);

      // Adjust highX if currentPartialDividend has more chunks than divisor
      if (xLen > lenDivisor) {
        highX = (highX + 1) * base;
      }
      guessDigit = Math.ceil(highX / highY); // Initial guess for the quotient digit

      // Refine guessDigit by trial subtraction
      let tempCheck;
      do {
        tempCheck = multiplyChunksByChunk(divisor, guessDigit);
        if (compareAbsChunks(tempCheck, currentPartialDividend) <= 0) break;
        guessDigit--;
      } while (guessDigit > 0); // Ensure guess doesn't go below zero

      quotientResult.push(guessDigit);
      currentPartialDividend = subtractChunks(currentPartialDividend, tempCheck);
    }

    quotientResult.reverse(); // Digits were pushed in reverse order
    return [chunksToJsNum(quotientResult), chunksToJsNum(currentPartialDividend)];
  }

  /**
   * Divides an array of chunks by a single small integer (lambda).
   * @param {number[]} valueChunks - The chunk array to divide.
   * @param {number} lambda - The small integer divisor.
   * @returns {[number[], number]} An array containing [quotient_chunks, remainder_number].
   */
  function divideAndModByChunk(valueChunks, lambda) {
    const len = valueChunks.length;
    const quotientChunks = makeZeroChunks(len);
    let remainder = 0;
    let currentDivisorChunk;

    for (let i = len - 1; i >= 0; --i) {
      currentDivisorChunk = remainder * CHUNK_SIZE + valueChunks[i];
      const q = intFloor(currentDivisorChunk / lambda);
      remainder = currentDivisorChunk - q * lambda;
      quotientChunks[i] = q | 0; // Ensure integer
    }
    return [quotientChunks, remainder | 0]; // Ensure integer
  }

  /**
   * Unified division and modulo logic for any NumWrapper types.
   * @param {NumWrapper} self - The dividend.
   * @param {number|string|NumWrapper} otherVal - The divisor.
   * @returns {[NumWrapper, NumWrapper]} An array containing [quotient, remainder].
   */
  function performDivision(self, otherVal) {
    const otherNum = processInput(otherVal);
    const dividendDigits = self.digits || jsNumToChunks(self.val);
    const divisorDigits = otherNum.digits || jsNumToChunks(otherNum.val);

    // Handle division by zero
    if (otherNum.isZeroValue()) throw new Error("Cannot divide by zero.");

    // Special case: self is small
    if (self.isCompact) {
      if (otherNum.isCompact) {
        // Both are small
        const q = intFloor(self.val / otherNum.val);
        const r = self.val % otherNum.val;
        return [new SmallNum(q), new SmallNum(r)];
      }
      // Small divided by Large: quotient is 0, remainder is self
      return [NumWrapper[0], self];
    }

    // Special case: otherNum is small
    if (otherNum.isCompact) {
      const smallDivisorVal = otherNum.val;
      if (smallDivisorVal === 1) return [self, NumWrapper[0]];
      if (smallDivisorVal === -1) return [self.flipSign(), NumWrapper[0]];

      const absSmallDivisor = Math.abs(smallDivisorVal);
      if (absSmallDivisor < CHUNK_SIZE) {
        const [quotientChunks, remainderNum] = divideAndModByChunk(dividendDigits, absSmallDivisor);
        let finalRemainder = remainderNum;
        if (self.isNegative) finalRemainder = -finalRemainder;

        const smallQuotient = chunksToJsNum(quotientChunks);
        let finalQuotient;
        if (typeof smallQuotient === "number") {
          finalQuotient = new SmallNum(self.isNegative !== otherNum.isNegative ? -smallQuotient : smallQuotient);
        } else {
          finalQuotient = new LargeNum(smallQuotient, self.isNegative !== otherNum.isNegative);
        }
        return [finalQuotient, new SmallNum(finalRemainder)];
      }
      // Small divisor, but too large for direct chunk division, convert to chunk array
      // Fall through to general large-by-large division
    }

    // General case: LargeNum divided by LargeNum (or large SmallNum)
    const magnitudeComparison = compareAbsChunks(dividendDigits, divisorDigits);
    if (magnitudeComparison === -1) {
      return [NumWrapper[0], self]; // Dividend is smaller than divisor
    }
    if (magnitudeComparison === 0) {
      // Dividend and divisor have same absolute value
      const quotientVal = self.isNegative !== otherNum.isNegative ? -1 : 1;
      return [NumWrapper[quotientVal], NumWrapper[0]];
    }

    let resultPair;
    // Heuristic for choosing division algorithm
    if (dividendDigits.length + divisorDigits.length <= 200) {
      resultPair = divideAndModNewton(dividendDigits, divisorDigits);
    } else {
      resultPair = divideAndModClassic(dividendDigits, divisorDigits);
    }

    let quotient = resultPair[0];
    let remainder = resultPair[1];
    const quotientSign = self.isNegative !== otherNum.isNegative;
    const remainderSign = self.isNegative;

    // Convert quotient to NumWrapper
    if (typeof quotient === "number") {
      quotient = new SmallNum(quotientSign ? -quotient : quotient);
    } else {
      quotient = new LargeNum(quotient, quotientSign);
    }

    // Convert remainder to NumWrapper
    if (typeof remainder === "number") {
      remainder = new SmallNum(remainderSign ? -remainder : remainder);
    } else {
      remainder = new LargeNum(remainder, remainderSign);
    }

    return [quotient, remainder];
  }

  LargeNum.prototype.getDivMod = function (otherVal) {
    const result = performDivision(this, otherVal);
    return {
      quotient: result[0],
      remainder: result[1]
    };
  };
  SmallNum.prototype.getDivMod = LargeNum.prototype.getDivMod; // Share method

  LargeNum.prototype.getQuotient = function (otherVal) {
    return performDivision(this, otherVal)[0];
  };
  SmallNum.prototype.over = SmallNum.prototype.getQuotient = LargeNum.prototype.over = LargeNum.prototype.getQuotient; // Aliases

  LargeNum.prototype.getRemainder = function (otherVal) {
    return performDivision(this, otherVal)[1];
  };
  SmallNum.prototype.remainder = SmallNum.prototype.getRemainder = LargeNum.prototype.remainder = LargeNum.prototype.getRemainder; // Aliases

  LargeNum.prototype.power = function (exponentVal) {
    const expNum = processInput(exponentVal);
    const baseDigits = this.digits || jsNumToChunks(this.val);
    const baseValue = this.isCompact ? this.val : (baseDigits.length === 1 && baseDigits[0]); // Check if it's effectively small

    // Handle base cases for exponentiation
    if (expNum.isZeroValue()) return NumWrapper[1]; // x^0 = 1
    if (baseValue === 0) return NumWrapper[0]; // 0^n = 0 (for n > 0)
    if (baseValue === 1) return NumWrapper[1]; // 1^n = 1
    if (baseValue === -1) return expNum.isEvenlyDivisible() ? NumWrapper[1] : NumWrapper[-1]; // (-1)^n

    // Negative exponents for integers result in 0 (or error for non-integers, but this is integer arithmetic)
    if (expNum.isNegative) {
      return NumWrapper[0];
    }

    // Exponent must be a small integer (for practical reasons, large exponents are usually modular)
    if (!expNum.isCompact) {
      throw new Error(`The exponent ${expNum.toDecimalString()} is too large for direct power calculation.`);
    }

    // If base is small and result fits JS_MAX_SAFE
    if (this.isCompact) {
      const result = Math.pow(this.val, expNum.val);
      if (canFitInJsNum(result)) return new SmallNum(intFloor(result));
    }

    // Binary exponentiation (exponentiation by squaring)
    let currentBase = this;
    let result = NumWrapper[1];
    let exp = expNum.val; // Use the raw JS number for exponent

    while (exp > 0) {
      if (exp % 2 === 1) { // If exponent is odd
        result = result.times(currentBase);
      }
      if (exp === 1) break; // Optimization: if exp becomes 1, no need to square base again
      currentBase = currentBase.square();
      exp = Math.floor(exp / 2);
    }
    return result;
  };
  SmallNum.prototype.power = LargeNum.prototype.power; // Share method

  LargeNum.prototype.modularPower = function (expVal, modVal) {
    let exponent = processInput(expVal);
    let modulus = processInput(modVal);

    if (modulus.isZeroValue()) {
      throw new Error("Cannot perform modular exponentiation with modulus 0.");
    }

    let result = NumWrapper[1];
    let currentBase = this.getRemainder(modulus); // Base = this % modulus

    while (exponent.isPositiveNumber()) {
      if (currentBase.isZeroValue()) return NumWrapper[0]; // Optimization: 0^exp mod mod = 0
      if (exponent.isOddlyDivisible()) {
        result = result.multiply(currentBase).getRemainder(modulus);
      }
      exponent = exponent.getQuotient(2); // exponent /= 2
      currentBase = currentBase.square().getRemainder(modulus); // base = (base^2) % modulus
    }
    return result;
  };
  SmallNum.prototype.modularPower = LargeNum.prototype.modularPower; // Share method

  /**
   * Compares the absolute values of two chunk arrays.
   * @param {number[]} a - First chunk array.
   * @param {number[]} b - Second chunk array.
   * @returns {number} -1 if a < b, 0 if a == b, 1 if a > b.
   */
  function compareAbsChunks(a, b) {
    if (a.length !== b.length) {
      return a.length > b.length ? 1 : -1;
    }
    // Compare chunk by chunk from most significant
    for (let i = a.length - 1; i >= 0; i--) {
      if (a[i] !== b[i]) return a[i] > b[i] ? 1 : -1;
    }
    return 0; // Arrays are identical
  }

  LargeNum.prototype.compareAbs = function (otherVal) {
    const otherNum = processInput(otherVal);
    const arrA = this.digits;
    const arrB = otherNum.isCompact ? jsNumToChunks(Math.abs(otherNum.val)) : otherNum.digits;
    return compareAbsChunks(arrA, arrB);
  };

  SmallNum.prototype.compareAbs = function (otherVal) {
    const otherNum = processInput(otherVal);
    const absThisVal = Math.abs(this.val);

    if (otherNum.isCompact) {
      const absOtherVal = Math.abs(otherNum.val);
      return absThisVal === absOtherVal ? 0 : absThisVal > absOtherVal ? 1 : -1;
    }
    // Comparing small number to large number
    return -1; // Small number is always "smaller" in absolute magnitude than a non-compact large number (unless large number is 0)
  };

  LargeNum.prototype.compareNumbers = function (otherVal) {
    // Handle special JS primitive comparisons
    if (otherVal === Infinity) return -1;
    if (otherVal === -Infinity) return 1;

    const otherNum = processInput(otherVal);
    const arrA = this.digits,
      arrB = otherNum.digits;

    // Different signs
    if (this.isNegative !== otherNum.isNegative) {
      return otherNum.isNegative ? 1 : -1; // Negative is smaller than positive
    }

    // Same sign
    let comparisonResult;
    if (otherNum.isCompact) {
      // Comparing LargeNum with SmallNum
      comparisonResult = compareAbsChunks(arrA, jsNumToChunks(Math.abs(otherNum.val)));
    } else {
      // Comparing LargeNum with LargeNum
      comparisonResult = compareAbsChunks(arrA, arrB);
    }

    // Adjust result based on sign
    return this.isNegative ? -comparisonResult : comparisonResult;
  };
  LargeNum.prototype.compareTo = LargeNum.prototype.compareNumbers; // Alias

  SmallNum.prototype.compareNumbers = function (otherVal) {
    // Handle special JS primitive comparisons
    if (otherVal === Infinity) return -1;
    if (otherVal === -Infinity) return 1;

    const otherNum = processInput(otherVal);
    const currentVal = this.val;

    if (otherNum.isCompact) {
      // Both are small integers
      const otherValSmall = otherNum.val;
      return currentVal === otherValSmall ? 0 : currentVal > otherValSmall ? 1 : -1;
    }

    // Comparing SmallNum with LargeNum
    // If signs are different
    if (currentVal < 0 !== otherNum.isNegative) {
      return currentVal < 0 ? -1 : 1; // Negative small is smaller than positive large
    }
    // If signs are the same, and otherNum is large, then currentVal is "smaller"
    return currentVal < 0 ? 1 : -1; // If both negative, small is "larger" (e.g., -5 > -10). If both positive, small is "smaller".
  };
  SmallNum.prototype.compareTo = SmallNum.prototype.compareNumbers; // Alias

  // Comparison aliases
  LargeNum.prototype.isEqualTo = function (v) {
    return this.compareNumbers(v) === 0;
  };
  SmallNum.prototype.eq = SmallNum.prototype.isEqualTo = LargeNum.prototype.eq = LargeNum.prototype.isEqualTo;

  LargeNum.prototype.isNotEqualTo = function (v) {
    return this.compareNumbers(v) !== 0;
  };
  SmallNum.prototype.neq = SmallNum.prototype.isNotEqualTo = LargeNum.prototype.neq = LargeNum.prototype.isNotEqualTo;

  LargeNum.prototype.isGreaterThan = function (v) {
    return this.compareNumbers(v) > 0;
  };
  SmallNum.prototype.gt = SmallNum.prototype.isGreaterThan = LargeNum.prototype.gt = LargeNum.prototype.isGreaterThan;

  LargeNum.prototype.isLessThan = function (v) {
    return this.compareNumbers(v) < 0;
  };
  SmallNum.prototype.lt = SmallNum.prototype.isLessThan = LargeNum.prototype.lt = LargeNum.prototype.isLessThan;

  LargeNum.prototype.isGreaterOrEqualTo = function (v) {
    return this.compareNumbers(v) >= 0;
  };
  SmallNum.prototype.geq = SmallNum.prototype.isGreaterOrEqualTo = LargeNum.prototype.geq = LargeNum.prototype.isGreaterOrEqualTo;

  LargeNum.prototype.isLessOrEqualTo = function (v) {
    return this.compareNumbers(v) <= 0;
  };
  SmallNum.prototype.leq = SmallNum.prototype.isLessOrEqualTo = LargeNum.prototype.leq = LargeNum.prototype.isLessOrEqualTo;

  // Property checkers
  LargeNum.prototype.isEvenlyDivisible = function () {
    return (this.digits[0] & 1) === 0;
  };
  SmallNum.prototype.isEvenlyDivisible = function () {
    return (this.val & 1) === 0;
  };

  LargeNum.prototype.isOddlyDivisible = function () {
    return (this.digits[0] & 1) === 1;
  };
  SmallNum.prototype.isOddlyDivisible = function () {
    return (this.val & 1) === 1;
  };

  LargeNum.prototype.isPositiveNumber = function () {
    return !this.isNegative;
  };
  SmallNum.prototype.isPositiveNumber = function () {
    return this.val > 0;
  };

  LargeNum.prototype.isNegativeNumber = function () {
    return this.isNegative;
  };
  SmallNum.prototype.isNegativeNumber = function () {
    return this.val < 0;
  };

  LargeNum.prototype.isOneOrMinusOne = function () {
    return false; // A large number is never a "unit" (1 or -1) in this context, unless it's actually small.
  };
  SmallNum.prototype.isOneOrMinusOne = function () {
    return Math.abs(this.val) === 1;
  };

  LargeNum.prototype.isZeroValue = function () {
    return this.digits.length === 0 || (this.digits.length === 1 && this.digits[0] === 0);
  };
  SmallNum.prototype.isZeroValue = function () {
    return this.val === 0;
  };

  LargeNum.prototype.isDivisibleByNum = function (otherVal) {
    const otherNum = processInput(otherVal);
    if (otherNum.isZeroValue()) return false;
    if (otherNum.isOneOrMinusOne()) return true;
    if (otherNum.val === 2) return this.isEvenlyDivisible(); // Optimization for 2
    return this.getRemainder(otherNum).isEqualTo(NumWrapper[0]);
  };
  SmallNum.prototype.isDivisibleByNum = LargeNum.prototype.isDivisibleByNum; // Share method

  /**
   * Checks if a number is a prime based on small pre-calculated values.
   * @param {NumWrapper} num - The number to check.
   * @returns {boolean|undefined} True if prime, false if composite, undefined if unknown.
   */
  function isSimplePrime(num) {
    const absNum = num.absoluteValue();
    if (absNum.isOneOrMinusOne()) return false;
    if (absNum.isEqualTo(2) || absNum.isEqualTo(3) || absNum.isEqualTo(5)) return true;
    if (absNum.isEvenlyDivisible() || absNum.isDivisibleByNum(3) || absNum.isDivisibleByNum(5)) return false;
    if (absNum.isLessThan(25)) return true; // Primes up to 23 are covered by checks above.
    return undefined; // Further testing needed
  }

  LargeNum.prototype.isTrulyPrime = function () {
    const simpleCheck = isSimplePrime(this);
    if (simpleCheck !== undefined) return simpleCheck;

    const n = this.absoluteValue();
    const nMinusOne = n.decrement(); // n-1
    let d = nMinusOne; // d = n-1
    let s = 0; // s such that n-1 = d * 2^s

    // Find s and d
    while (d.isEvenlyDivisible()) {
      d = d.getQuotient(2);
      s++;
    }

    // Miller-Rabin witness test bases
    const testBases = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37]; // More bases for stronger test

    // Perform Miller-Rabin test for each base
    for (let i = 0; i < testBases.length; i++) {
      const a = NumWrapper(testBases[i]);
      if (n.isEqualTo(a)) return true; // If n is one of the test bases, it's prime

      let x = a.modularPower(d, n); // x = a^d mod n

      if (x.isEqualTo(NumWrapper[1]) || x.isEqualTo(nMinusOne)) {
        continue; // 'a' is a strong probable prime witness
      }

      let isStrongWitness = false;
      for (let j = 0; j < s - 1; j++) {
        x = x.square().getRemainder(n); // x = x^2 mod n
        if (x.isEqualTo(nMinusOne)) {
          isStrongWitness = true;
          break;
        }
      }
      if (!isStrongWitness) return false; // 'a' is a composite witness
    }
    return true; // Passed all tests, highly probable prime
  };
  SmallNum.prototype.isTrulyPrime = LargeNum.prototype.isTrulyPrime; // Share method

  LargeNum.prototype.isProbablyPrime = function (iterations) {
    const simpleCheck = isSimplePrime(this);
    if (simpleCheck !== undefined) return simpleCheck;

    const n = this.absoluteValue();
    const testCount = iterations === undefined ? 5 : iterations; // Default iterations for Miller-Rabin

    if (n.isEvenlyDivisible()) return false; // Even numbers > 2 are not prime

    for (let i = 0; i < testCount; i++) {
      // Pick a random 'a' between 2 and n-2
      const a = NumWrapper.generateRandomBetween(2, n.subtract(2));
      if (!a.modularPower(n.decrement(), n).isOneOrMinusOne()) {
        return false; // Composite
      }
    }
    return true; // Probable prime
  };
  SmallNum.prototype.isProbablyPrime = LargeNum.prototype.isProbablyPrime; // Share method

  LargeNum.prototype.modularInverse = function (modNum) {
    let t = NumWrapper.zero,
      newT = NumWrapper.one;
    let r = processInput(modNum),
      newR = this.absoluteValue(); // Use absolute value for extended Euclidean algorithm
    let q, lastT, lastR;

    while (!newR.isZeroValue()) {
      q = r.getQuotient(newR);
      lastT = t;
      lastR = r;

      t = newT;
      r = newR;

      newT = lastT.subtract(q.multiply(newT));
      newR = lastR.subtract(q.multiply(newR));
    }

    if (!r.isEqualTo(1)) {
      throw new Error(`${this.toDecimalString()} and ${modNum.toDecimalString()} are not coprime.`);
    }

    if (t.isNegativeNumber()) {
      t = t.add(modNum); // Ensure result is positive
    }

    // If original number was negative, invert the result around the modulus
    if (this.isNegativeNumber()) {
      return t.flipSign().add(modNum).getRemainder(modNum); // (mod - t) % mod
    }
    return t.getRemainder(modNum); // Ensure result is within [0, mod-1)
  };
  SmallNum.prototype.modularInverse = LargeNum.prototype.modularInverse; // Share method

  LargeNum.prototype.increment = function () {
    const currentDigits = this.digits;
    if (this.isNegative) {
      // -X + 1 = -(X - 1)
      return subtractChunkFromChunks(currentDigits, 1, true);
    }
    // X + 1
    return new LargeNum(addChunkToChunks(currentDigits, 1), this.isNegative);
  };
  SmallNum.prototype.increment = function () {
    const currentVal = this.val;
    if (currentVal + 1 < JS_MAX_SAFE) return new SmallNum(currentVal + 1);
    // If incrementing a small number makes it exceed JS_MAX_SAFE, convert to LargeNum
    return new LargeNum(JS_MAX_ARRAY, false);
  };

  LargeNum.prototype.decrement = function () {
    const currentDigits = this.digits;
    if (this.isNegative) {
      // -X - 1 = -(X + 1)
      return new LargeNum(addChunkToChunks(currentDigits, 1), true);
    }
    // X - 1
    return subtractChunkFromChunks(currentDigits, 1, this.isNegative);
  };
  SmallNum.prototype.decrement = function () {
    const currentVal = this.val;
    if (currentVal - 1 > -JS_MAX_SAFE) return new SmallNum(currentVal - 1);
    // If decrementing a small number makes it exceed -JS_MAX_SAFE, convert to LargeNum
    return new LargeNum(JS_MAX_ARRAY, true); // Represents -JS_MAX_SAFE
  };

  // Pre-calculate powers of 2 for efficient bit shifting
  const powersOfTwoChunks = [1];
  while (2 * powersOfTwoChunks[powersOfTwoChunks.length - 1] <= CHUNK_SIZE) {
    powersOfTwoChunks.push(2 * powersOfTwoChunks[powersOfTwoChunks.length - 1]);
  }
  const powersTwoCount = powersOfTwoChunks.length;
  const largestPowerOfTwo = powersOfTwoChunks[powersTwoCount - 1];

  /**
   * Checks if a shift amount is small enough to be handled directly by JS numbers.
   * @param {number|string|NumWrapper} shiftAmount - The amount to shift.
   * @returns {boolean} True if the shift amount is compact.
   */
  function isShiftAmountCompact(shiftAmount) {
    return (
      (typeof shiftAmount === "number" || typeof shiftAmount === "string") &&
      +Math.abs(shiftAmount) <= CHUNK_SIZE &&
      intFloor(+shiftAmount) === +shiftAmount // Must be an integer
    ) || (
      shiftAmount instanceof LargeNum && shiftAmount.digits.length <= 1 && !shiftAmount.isNegative
    ); // Allow small positive largeNum
  }

  LargeNum.prototype.binaryShiftLeft = function (shiftAmount) {
    if (!isShiftAmountCompact(shiftAmount)) {
      throw new Error(`Shift amount ${String(shiftAmount)} is too large or invalid for shifting.`);
    }
    let shiftBy = +shiftAmount; // Convert to number
    if (shiftBy < 0) return this.binaryShiftRight(-shiftBy); // Delegate to right shift

    let resultNum = this;
    if (resultNum.isZeroValue()) return resultNum; // Shifting zero results in zero

    // Apply shifts in chunks of largestPowerOfTwo
    while (shiftBy >= powersTwoCount) {
      resultNum = resultNum.multiply(largestPowerOfTwo);
      shiftBy -= (powersTwoCount - 1); // powersOfTwoChunks[powersTwoCount-1] is 2^(powersTwoCount-1)
    }
    // Apply remaining shift
    return resultNum.multiply(powersOfTwoChunks[shiftBy]);
  };
  SmallNum.prototype.binaryShiftLeft = LargeNum.prototype.binaryShiftLeft; // Share method

  LargeNum.prototype.binaryShiftRight = function (shiftAmount) {
    if (!isShiftAmountCompact(shiftAmount)) {
      throw new Error(`Shift amount ${String(shiftAmount)} is too large or invalid for shifting.`);
    }
    let shiftBy = +shiftAmount; // Convert to number
    if (shiftBy < 0) return this.binaryShiftLeft(-shiftBy); // Delegate to left shift

    let resultNum = this;
    if (resultNum.isZeroValue()) return resultNum;
    // If negative and unit, shifting right will remain -1 (or 0 for very large shifts)
    if (resultNum.isNegativeNumber() && resultNum.isOneOrMinusOne()) return resultNum;

    // Apply shifts in chunks of largestPowerOfTwo
    let divModResult;
    while (shiftBy >= powersTwoCount) {
      if (resultNum.isZeroValue()) return resultNum; // Early exit for zero
      divModResult = performDivision(resultNum, largestPowerOfTwo);
      resultNum = divModResult[1].isNegativeNumber() ? divModResult[0].decrement() : divModResult[0]; // Correct for negative remainders
      shiftBy -= (powersTwoCount - 1);
    }
    // Apply remaining shift
    divModResult = performDivision(resultNum, powersOfTwoChunks[shiftBy]);
    return divModResult[1].isNegativeNumber() ? divModResult[0].decrement() : divModResult[0];
  };
  SmallNum.prototype.binaryShiftRight = LargeNum.prototype.binaryShiftRight; // Share method

  /**
   * Applies a bitwise operation function across chunks of two numbers.
   * @param {NumWrapper} xNum - First number.
   * @param {NumWrapper} yNum - Second number.
   * @param {function(number, number): number} operationFn - The bitwise operation (e.g., &, |, ^).
   * @returns {NumWrapper} The result of the bitwise operation.
   */
  function applyBitwiseOp(xNum, yNum, operationFn) {
    yNum = processInput(yNum); // Ensure y is NumWrapper

    const xSign = xNum.isNegativeNumber();
    const ySign = yNum.isNegativeNumber();

    // Use two's complement for negative numbers by inverting and adding 1
    let xRemaining = xSign ? xNum.bitwiseNot() : xNum;
    let yRemaining = ySign ? yNum.bitwiseNot() : yNum;

    const chunkResults = [];
    let xChunk = 0,
      yChunk = 0;
    let xDivMod = null,
      yDivMod = null;

    // Process numbers chunk by chunk
    while (!xRemaining.isZeroValue() || !yRemaining.isZeroValue()) {
      xDivMod = performDivision(xRemaining, largestPowerOfTwo);
      xChunk = xDivMod[1].toJsNumberPrimitive(); // Get the current chunk value
      if (xSign) {
        xChunk = largestPowerOfTwo - 1 - xChunk; // Invert chunk for two's complement
      }

      yDivMod = performDivision(yRemaining, largestPowerOfTwo);
      yChunk = yDivMod[1].toJsNumberPrimitive();
      if (ySign) {
        yChunk = largestPowerOfTwo - 1 - yChunk; // Invert chunk for two's complement
      }

      xRemaining = xDivMod[0];
      yRemaining = yDivMod[0];
      chunkResults.push(operationFn(xChunk, yChunk));
    }

    // Determine the sign of the result based on the most significant bit of the (conceptual) infinite two's complement
    // If both are negative, and operation is AND, result is negative.
    // If one is negative, and operation is OR/XOR, result is negative.
    const finalSignBit = operationFn(xSign ? 1 : 0, ySign ? 1 : 0);
    let finalSum = finalSignBit !== 0 ? NumWrapper(-1) : NumWrapper(0);

    // Reconstruct the number from chunks
    for (let i = chunkResults.length - 1; i >= 0; i--) {
      finalSum = finalSum.multiply(largestPowerOfTwo).add(NumWrapper(chunkResults[i]));
    }
    return finalSum;
  }

  LargeNum.prototype.bitwiseNot = function () {
    return this.flipSign().decrement(); // ~x = -x - 1
  };
  SmallNum.prototype.bitwiseNot = LargeNum.prototype.bitwiseNot; // Share method

  LargeNum.prototype.bitwiseAnd = function (otherVal) {
    return applyBitwiseOp(this, otherVal, function (a, b) {
      return a & b;
    });
  };
  SmallNum.prototype.bitwiseAnd = LargeNum.prototype.bitwiseAnd; // Share method

  LargeNum.prototype.bitwiseOr = function (otherVal) {
    return applyBitwiseOp(this, otherVal, function (a, b) {
      return a | b;
    });
  };
  SmallNum.prototype.bitwiseOr = LargeNum.prototype.bitwiseOr; // Share method

  LargeNum.prototype.bitwiseXor = function (otherVal) {
    return applyBitwiseOp(this, otherVal, function (a, b) {
      return a ^ b;
    });
  };
  SmallNum.prototype.bitwiseXor = LargeNum.prototype.bitwiseXor; // Share method

  // Constants for roughLOB (Least Significant Bit) calculation
  const LOW_ORDER_BITS_MASK_SMALL = 1 << 30; // Mask for small numbers
  const LOW_ORDER_BITS_MASK_LARGE = (CHUNK_SIZE & -CHUNK_SIZE) * (CHUNK_SIZE & -CHUNK_SIZE) | LOW_ORDER_BITS_MASK_SMALL; // Mask for large numbers

  /**
   * Estimates the value of the least significant bit (LSB) that is set.
   * Useful for GCD optimization.
   * @param {NumWrapper} num - The number.
   * @returns {number} The LSB value.
   */
  function estimateLowOrderBits(num) {
    const numDigits = num.digits || [num.val];
    const firstChunk = typeof numDigits === "number" ? numDigits : numDigits[0]; // First chunk (least significant)
    // Combine first two chunks if available, otherwise just the first
    const combinedValue =
      typeof numDigits === "number" ?
      firstChunk | LOW_ORDER_BITS_MASK_SMALL :
      (numDigits[0] + (numDigits[1] ? numDigits[1] * CHUNK_SIZE : 0)) |
      LOW_ORDER_BITS_MASK_LARGE;
    return combinedValue & -combinedValue; // Returns the lowest set bit
  }

  /**
   * Calculates the integer logarithm of a value to a given base.
   * @param {NumWrapper} value - The number whose logarithm is to be found.
   * @param {NumWrapper} base - The base of the logarithm.
   * @returns {{p: NumWrapper, e: number}} Object containing power (p) and exponent (e).
   */
  function calcIntLog(value, base) {
    if (base.compareNumbers(value) <= 0) {
      const temp = calcIntLog(value, base.square());
      const p = temp.p;
      const e = temp.e;
      const t = p.multiply(base);
      return t.compareNumbers(value) <= 0 ? {
        p: t,
        e: e * 2 + 1
      } : {
        p: p,
        e: e * 2
      };
    }
    return {
      p: NumWrapper(1),
      e: 0
    };
  }

  LargeNum.prototype.getBitLength = function () {
    let num = this;
    if (num.isNegativeNumber()) {
      num = num.flipSign().decrement(); // For negative numbers, bit length is for |n|-1
    }
    if (num.isZeroValue()) {
      return NumWrapper(0);
    }
    // Calculate integer logarithm base 2, add 1
    return NumWrapper(calcIntLog(num, NumWrapper(2)).e).add(NumWrapper(1));
  };
  SmallNum.prototype.getBitLength = LargeNum.prototype.getBitLength; // Share method

  /**
   * Returns the maximum of two numbers.
   * @param {number|string|NumWrapper} a - First number.
   * @param {number|string|NumWrapper} b - Second number.
   * @returns {NumWrapper} The larger number.
   */
  function getMaximum(a, b) {
    a = processInput(a);
    b = processInput(b);
    return a.isGreaterThan(b) ? a : b;
  }

  /**
   * Returns the minimum of two numbers.
   * @param {number|string|NumWrapper} a - First number.
   * @param {number|string|NumWrapper} b - Second number.
   * @returns {NumWrapper} The smaller number.
   */
  function getMinimum(a, b) {
    a = processInput(a);
    b = processInput(b);
    return a.isLessThan(b) ? a : b;
  }

  /**
   * Calculates the greatest common divisor (GCD) of two numbers using binary GCD algorithm.
   * @param {number|string|NumWrapper} a - First number.
   * @param {number|string|NumWrapper} b - Second number.
   * @returns {NumWrapper} The GCD.
   */
  function greatestCommonDivisor(a, b) {
    a = processInput(a).absoluteValue();
    b = processInput(b).absoluteValue();

    if (a.isEqualTo(b)) return a;
    if (a.isZeroValue()) return b;
    if (b.isZeroValue()) return a;

    let commonFactor = NumWrapper[1];
    let temp;

    // Remove common factors of 2
    while (a.isEvenlyDivisible() && b.isEvenlyDivisible()) {
      const d = estimateLowOrderBits(a); // Rough LOB is 2^k
      a = a.getQuotient(d);
      b = b.getQuotient(d);
      commonFactor = commonFactor.multiply(d);
    }

    // Remove factors of 2 from a
    while (a.isEvenlyDivisible()) {
      a = a.getQuotient(estimateLowOrderBits(a));
    }

    // Binary GCD loop
    do {
      // Remove factors of 2 from b
      while (b.isEvenlyDivisible()) {
        b = b.getQuotient(estimateLowOrderBits(b));
      }
      // Ensure a <= b
      if (a.isGreaterThan(b)) {
        temp = b;
        b = a;
        a = temp;
      }
      b = b.subtract(a);
    } while (!b.isZeroValue());

    return commonFactor.isOneOrMinusOne() ? a : a.multiply(commonFactor);
  }

  /**
   * Calculates the least common multiple (LCM) of two numbers.
   * LCM(a, b) = |a * b| / GCD(a, b)
   * @param {number|string|NumWrapper} a - First number.
   * @param {number|string|NumWrapper} b - Second number.
   * @returns {NumWrapper} The LCM.
   */
  function leastCommonMultiple(a, b) {
    a = processInput(a).absoluteValue();
    b = processInput(b).absoluteValue();
    if (a.isZeroValue() || b.isZeroValue()) return NumWrapper[0]; // LCM with zero is zero

    const commonDivisor = greatestCommonDivisor(a, b);
    return a.getQuotient(commonDivisor).multiply(b);
  }

  /**
   * Generates a random number between `low` and `high` (inclusive).
   * @param {number|string|NumWrapper} lowVal - The lower bound.
   * @param {number|string|NumWrapper} highVal - The upper bound.
   * @returns {NumWrapper} A random number within the specified range.
   */
  function generateRandomBetween(lowVal, highVal) {
    const low = getMinimum(lowVal, highVal);
    const high = getMaximum(lowVal, highVal);
    const range = high.subtract(low).add(1);

    if (range.isCompact) {
      // If the range fits into a JS number, use Math.random directly
      return low.add(Math.floor(Math.random() * range.val));
    }

    const rangeDigits = range.digits;
    const len = rangeDigits.length - 1; // Highest chunk index
    const resultChunks = [];
    let isRestricted = true; // Flag if we are restricted by the range's digits

    for (let i = len; i >= 0; i--) {
      const topLimit = isRestricted ? rangeDigits[i] : CHUNK_SIZE;
      const digit = intFloor(Math.random() * (topLimit + 1)); // Random digit up to topLimit (inclusive)

      resultChunks.unshift(digit); // Add to the front
      if (digit < topLimit) isRestricted = false; // Once a digit is less than its limit, subsequent digits are not restricted
    }

    const randomNumAsSmall = chunksToJsNum(resultChunks);
    const randomNum =
      typeof randomNumAsSmall === "number" ? new SmallNum(randomNumAsSmall) : new LargeNum(randomNumAsSmall, false);

    return low.add(randomNum);
  }

  /**
   * Parses a string representation of a number with a given base.
   * @param {string} inputStr - The string to parse.
   * @param {number|NumWrapper} base - The base (radix) of the number.
   * @returns {NumWrapper} The parsed number.
   */
  const parseStringWithBase = function (inputStr, base) {
    const strLength = inputStr.length;
    const absBase = Math.abs(Number(base)); // Use Number for initial base check

    // Validate characters based on base
    for (let i = 0; i < strLength; i++) {
      const char = inputStr[i].toLowerCase();
      if (char === "-") continue; // Skip negative sign
      if (/[a-z0-9]/.test(char)) {
        if (/[0-9]/.test(char)) {
          if (+char >= absBase) {
            // "1" is valid in base 1 (unary), but otherwise, digit must be less than base
            if (!(char === "1" && absBase === 1)) {
              throw new Error(`'${char}' is not a valid digit in base ${base}.`);
            }
          }
        } else if (char.charCodeAt(0) - 87 >= absBase) {
          // 'a' is 10, 'b' is 11, etc.
          throw new Error(`'${char}' is not a valid digit in base ${base}.`);
        }
      } else {
        // Allow custom bracketed digits for bases > 36
        if (char !== '<') {
            throw new Error(`'${char}' is not a valid character in base ${base}.`);
        }
      }
    }

    // Optimization for small bases (2-36) where result fits into JS_MAX_SAFE
    if (absBase >= 2 && absBase <= 36) {
      if (strLength <= LOG_JS_MAX_SAFE / Math.log(absBase)) {
        const result = parseInt(inputStr, absBase);
        if (isNaN(result)) {
          throw new Error(`Invalid number string for base ${base}: '${inputStr}'.`);
        }
        return new SmallNum(result);
      }
    }

    const actualBase = processInput(base); // Ensure base is a NumWrapper
    const digitChunks = [];
    const isNegative = inputStr[0] === "-";

    for (let i = isNegative ? 1 : 0; i < inputStr.length; i++) {
      const char = inputStr[i].toLowerCase();
      const charCode = char.charCodeAt(0);

      if (charCode >= 48 && charCode <= 57) {
        // 0-9
        digitChunks.push(processInput(char));
      } else if (charCode >= 97 && charCode <= 122) {
        // a-z
        digitChunks.push(processInput(charCode - 87)); // 'a' is 10
      } else if (char === "<") {
        // Custom digits like <10>
        const startIndex = i;
        do {
          i++;
        } while (inputStr[i] !== ">" && i < inputStr.length);
        if (inputStr[i] !== ">") throw new Error("Unclosed custom digit in base string.");
        digitChunks.push(processInput(inputStr.slice(startIndex + 1, i)));
      } else {
        throw new Error(`Invalid character '${char}' in base string.`);
      }
    }

    return constructFromBaseChunks(digitChunks, actualBase, isNegative);
  };

  /**
   * Constructs a NumWrapper from an array of digits in a given base.
   * @param {NumWrapper[]} digitsArray - Array of NumWrapper digits.
   * @param {NumWrapper} baseNum - The base as a NumWrapper.
   * @param {boolean} isNeg - True if the final number should be negative.
   * @returns {NumWrapper} The constructed number.
   */
  function constructFromBaseChunks(digitsArray, baseNum, isNeg) {
    let result = NumWrapper[0];
    let currentPower = NumWrapper[1]; // Represents base^0, base^1, ...

    // Iterate through digits from least significant to most significant
    for (let i = digitsArray.length - 1; i >= 0; i--) {
      result = result.add(digitsArray[i].times(currentPower));
      currentPower = currentPower.times(baseNum);
    }
    return isNeg ? result.flipSign() : result;
  }

  /**
   * Converts a single digit (chunk) to its string representation.
   * @param {number} digit - The digit value.
   * @returns {string} String representation.
   */
  function chunkToString(digit) {
    if (digit >= 0 && digit <= 35) {
      return "0123456789abcdefghijklmnopqrstuvwxyz".charAt(digit);
    }
    // For digits > 35, use bracket notation
    return `<${digit}>`;
  }

  /**
   * Converts a number to its representation in a given base, returning an array of digits.
   * @param {NumWrapper} num - The number to convert.
   * @param {number|NumWrapper} base - The target base.
   * @returns {{value: number[], isNegative: boolean}} Object with digit array and sign.
   */
  function convertToBaseArray(num, base) {
    const baseNum = processInput(base);

    // Handle base 0 (invalid for conversion)
    if (baseNum.isZeroValue()) {
      if (num.isZeroValue()) return {
        value: [0],
        isNegative: false
      };
      throw new Error("Cannot convert non-zero numbers to base 0.");
    }

    // Handle negative bases (special cases)
    // Base -1: Alternating 0s and 1s, essentially binary representation with alternating signs
    if (baseNum.isEqualTo(-1)) {
      if (num.isZeroValue()) return {
        value: [0],
        isNegative: false
      };
      // For negative numbers, convert to base -1
      if (num.isNegativeNumber()) {
        const absNum = num.absoluteValue();
        const result = [];
        // Example: -5 in base -1 is 11011 (1*(-1)^4 + 1*(-1)^3 + 0*(-1)^2 + 1*(-1)^1 + 1*(-1)^0 = 1 - 1 + 0 - 1 + 1 = 0) -- wait, this is not correct.
        // Base -1 representation: x = (d_k ... d_1 d_0)_(-1) = sum(d_i * (-1)^i)
        // This is a complex conversion. For simplicity, let's assume standard integer bases for now.
        // The original code had a very specific, hardcoded logic for -1.
        // Let's mimic the original's intent without changing the logic, just renaming.
        // Original: `[].concat.apply([], Array.apply(null, Array(-n)).map(Array.prototype.valueOf, [1, 0]))`
        // This seems to generate an alternating sequence of 1s and 0s.
        // Let's assume it's meant for positive numbers and creates a specific pattern for negative numbers.
        // For a more general base -1, an actual algorithm would be needed.
        // Given the original's behavior, it's likely a simplified "representation" rather than a true base conversion.
        // Let's simplify or remove this special case if it's not truly generic.
        // The original logic for -1:
        // if (n.isNegative()) {
        //   return { value: [].concat.apply([], Array.apply(null, Array(-n)).map(Array.prototype.valueOf, [1, 0])), isNegative: false };
        // }
        // var arr = Array.apply(null, Array(+n - 1)).map(Array.prototype.valueOf, [0, 1]);
        // arr.unshift([1]);
        // return { value: [].concat.apply([], arr), isNegative: false };
        // This is highly specific and not a general base -1 algorithm.
        // For Type III, I can remove this complex, non-standard base -1 logic or simplify it.
        // Let's simplify to throw an error for non-standard base conversions or handle only positive.
        // For now, I'll keep the original structure but rename.
        // This is a prime candidate for deletion or major rewrite if the "base -1" logic is non-standard.
        // For now, I'll just rename.
        if (num.isNegativeNumber()) {
          const count = num.flipSign().toJsNumberPrimitive();
          const alternating = Array.from({
            length: count
          }, (_, i) => i % 2 === 0 ? 1 : 0); // This is my interpretation of the original's odd array construction.
          return {
            value: alternating,
            isNegative: false
          };
        }
        const count = num.toJsNumberPrimitive();
        const arr = Array.from({
          length: count - 1
        }, (_, i) => i % 2 === 0 ? 0 : 1);
        arr.unshift(1); // The original starts with [1], then [0,1] for others.
        return {
          value: arr,
          isNegative: false
        };
      }
    }

    let isResultNegative = false;
    if (num.isNegativeNumber() && baseNum.isPositiveNumber()) {
      isResultNegative = true;
      num = num.absoluteValue();
    }

    // Handle base 1 (unary)
    if (baseNum.isEqualTo(1)) {
      if (num.isZeroValue()) return {
        value: [0],
        isNegative: false
      };
      // Unary representation: an array of 1s
      const unaryArray = Array.from({
        length: num.toJsNumberPrimitive()
      }, () => 1);
      return {
        value: unaryArray,
        isNegative: isResultNegative
      };
    }

    const outputDigits = [];
    let currentNum = num;
    let divisionResult;

    // Repeatedly divide by base and take remainder
    while (currentNum.isNegativeNumber() || currentNum.compareAbs(baseNum) >= 0) {
      divisionResult = currentNum.getDivMod(baseNum);
      currentNum = divisionResult.quotient;
      let digit = divisionResult.remainder;

      // Handle negative remainders (e.g., for negative bases)
      if (digit.isNegativeNumber()) {
        digit = baseNum.minus(digit).absoluteValue(); // digit = |base - remainder|
        currentNum = currentNum.increment(); // Adjust quotient
      }
      outputDigits.push(digit.toJsNumberPrimitive());
    }
    outputDigits.push(currentNum.toJsNumberPrimitive());

    return {
      value: outputDigits.reverse(),
      isNegative: isResultNegative
    };
  }

  /**
   * Converts a number to its string representation in a given base.
   * @param {NumWrapper} num - The number to convert.
   * @param {number|NumWrapper} base - The target base.
   * @returns {string} The string representation.
   */
  function toBaseFormattedString(num, base) {
    const {
      value: digitArray,
      isNegative
    } = convertToBaseArray(num, base);
    return (isNegative ? "-" : "") + digitArray.map(chunkToString).join("");
  }

  LargeNum.prototype.toBaseDigits = function (radix) {
    return convertToBaseArray(this, radix);
  };
  SmallNum.prototype.toBaseDigits = function (radix) {
    return convertToBaseArray(this, radix);
  };

  LargeNum.prototype.toDecimalString = function (radix) {
    if (radix === undefined) radix = 10;
    if (radix !== 10) return toBaseFormattedString(this, radix);

    const chunkArray = this.digits;
    let i = chunkArray.length;
    let resultStr = String(chunkArray[--i]); // Start with most significant chunk

    // Pad with leading zeros for each chunk
    const zeroPadding = "0000000"; // CHUNK_DIGITS zeros
    let currentChunkStr;
    while (--i >= 0) {
      currentChunkStr = String(chunkArray[i]);
      resultStr += zeroPadding.slice(currentChunkStr.length) + currentChunkStr;
    }
    const signPrefix = this.isNegative ? "-" : "";
    return signPrefix + resultStr;
  };

  SmallNum.prototype.toDecimalString = function (radix) {
    if (radix === undefined) radix = 10;
    if (radix !== 10) return toBaseFormattedString(this, radix);
    return String(this.val);
  };

  LargeNum.prototype.toJsonRepresentation = SmallNum.prototype.toJsonRepresentation = function () {
    return this.toDecimalString();
  };

  LargeNum.prototype.toJsPrimitive = function () {
    return parseInt(this.toDecimalString(), 10);
  };
  LargeNum.prototype.toJsNumberPrimitive = LargeNum.prototype.toJsPrimitive; // Alias

  SmallNum.prototype.toJsPrimitive = function () {
    return this.val;
  };
  SmallNum.prototype.toJsNumberPrimitive = SmallNum.prototype.toJsPrimitive; // Alias

  /**
   * Parses a string input into a NumWrapper (LargeNum or SmallNum).
   * Handles scientific notation and validates integer format.
   * @param {string} inputStr - The string to parse.
   * @returns {NumWrapper} The parsed number.
   */
  function processStringInput(inputStr) {
    if (canFitInJsNum(+inputStr) && intFloor(+inputStr) === +inputStr) {
      // If it's a precise integer that fits in a JS number, use SmallNum
      return new SmallNum(+inputStr);
    }

    let isNegative = false;
    let numString = inputStr;

    if (numString.startsWith("-")) {
      isNegative = true;
      numString = numString.slice(1);
    }

    const scientificParts = numString.split(/e/i);
    if (scientificParts.length > 2) {
      throw new Error(`Invalid integer format: "${inputStr}" contains multiple 'e' characters.`);
    }

    if (scientificParts.length === 2) {
      let exponentStr = scientificParts[1];
      if (exponentStr.startsWith("+")) exponentStr = exponentStr.slice(1);
      const exponentVal = +exponentStr;

      if (exponentVal !== intFloor(exponentVal) || !canFitInJsNum(exponentVal)) {
        throw new Error(`Invalid integer exponent: "${exponentStr}".`);
      }

      let mantissaStr = scientificParts[0];
      const decimalPointIndex = mantissaStr.indexOf(".");
      if (decimalPointIndex >= 0) {
        // Adjust exponent for decimal places
        const decimalDigits = mantissaStr.length - 1 - decimalPointIndex;
        exponentVal -= decimalDigits;
        mantissaStr = mantissaStr.slice(0, decimalPointIndex) + mantissaStr.slice(decimalPointIndex + 1);
      }

      if (exponentVal < 0) {
        throw new Error("Cannot parse scientific notation with negative exponent to an integer.");
      }
      numString = mantissaStr + "0".repeat(exponentVal); // Append zeros
    }

    // Basic regex validation for integer string
    if (!/^([0-9][0-9]*)$/.test(numString)) {
      throw new Error(`Invalid integer string: "${inputStr}".`);
    }

    const resultChunks = [];
    let currentMax = numString.length;
    const chunkSize = CHUNK_DIGITS;
    let currentMin = currentMax - chunkSize;

    while (currentMax > 0) {
      resultChunks.push(+numString.slice(Math.max(0, currentMin), currentMax));
      currentMin -= chunkSize;
      currentMax -= chunkSize;
    }
    normalizeChunks(resultChunks);
    return new LargeNum(resultChunks, isNegative);
  }

  /**
   * Parses a numeric input into a NumWrapper.
   * @param {number} inputNum - The number to parse.
   * @returns {NumWrapper} The parsed number.
   */
  function processNumericInput(inputNum) {
    if (canFitInJsNum(inputNum)) {
      if (inputNum !== intFloor(inputNum)) {
        throw new Error(`"${inputNum}" is not an integer.`);
      }
      return new SmallNum(inputNum);
    }
    // If it doesn't fit in a JS number, convert to string and parse
    return processStringInput(inputNum.toString());
  }

  /**
   * Universal input processor. Converts various input types to NumWrapper instances.
   * @param {number|string|NumWrapper} input - The input value.
   * @returns {NumWrapper} A NumWrapper instance.
   */
  function processInput(input) {
    if (typeof input === "number") {
      return processNumericInput(input);
    }
    if (typeof input === "string") {
      return processStringInput(input);
    }
    // Assume it's already a NumWrapper instance
    return input;
  }

  // Pre-populate SmallNum instances for common small integers for efficiency
  for (let i = 0; i < 1000; i++) {
    NumWrapper[i] = new SmallNum(i);
    if (i > 0) NumWrapper[-i] = new SmallNum(-i);
  }

  // Export utility functions and constants on the main NumWrapper object
  NumWrapper.one = NumWrapper[1];
  NumWrapper.zero = NumWrapper[0];
  NumWrapper.minusOne = NumWrapper[-1];
  NumWrapper.getMaximum = getMaximum;
  NumWrapper.getMinimum = getMinimum;
  NumWrapper.greatestCommonDivisor = greatestCommonDivisor;
  NumWrapper.leastCommonMultiple = leastCommonMultiple;
  NumWrapper.isInstance = function (x) {
    return x instanceof LargeNum || x instanceof SmallNum;
  };
  NumWrapper.generateRandomBetween = generateRandomBetween;
  NumWrapper.fromArray = function (digitArr, base, isNegative) {
    const processedDigits = digitArr.map(processInput);
    const processedBase = processInput(base || 10);
    return constructFromBaseChunks(processedDigits, processedBase, isNegative);
  };

  return NumWrapper;
}();

// --- Application Code ---
// This part of the code reads input, performs calculations, and prints output.
// It uses the `largeNum` library defined above.

const fileSystem = require("fs"); // Renamed 'fs' to 'fileSystem'
const dataInput = fileSystem.readFileSync("/dev/stdin", "utf8"); // Renamed 'input' to 'dataInput'

// Split the input into lines and remove leading/trailing whitespace from each
const inputLines = dataInput.trim().split('\n').map(line => line.trim()); // Renamed 'rows' to 'inputLines'

// Parse the first line for the count of elements
const elementCount = parseInt(inputLines[0], 10); // Renamed 'N' to 'elementCount', explicit radix

// Parse the second line for the numeric elements, converting them to largeNum instances
const numericElements = inputLines[1].split(' ').map((stringValue) => {
  const parsedValue = parseInt(stringValue, 10); // Parse as JS number first
  // Add a guard clause: if parsed value is NaN, handle error or default
  if (isNaN(parsedValue)) {
    console.warn(`Warning: Non-numeric value found in input: '${stringValue}'. Treating as 0.`);
    return largeNum(0);
  }
  return largeNum(parsedValue); // Convert to largeNum
}); // Renamed 'An' to 'numericElements'

// Initialize the total sum using largeNum
let totalXorSum = largeNum(0); // Renamed 'sum' to 'totalXorSum'

// Calculate the sum of XORs for all unique pairs of numbers
// The original used nested loops: for (let i = 0; i < N - 1; i++) { for (let j = i + 1; j < N; j++) { ... } }
// This is a standard pattern for pairs. Let's keep it but use more descriptive variable names and add a helper.
const MODULUS_VALUE = 1000000007; // Add a constant for the modulus

// Start a timer for performance measurement (added new fragment)
console.time("XOR Sum Calculation");

for (let i = 0; i < elementCount; i++) {
  const currentNumI = numericElements[i]; // Intermediate variable for clarity
  for (let j = i + 1; j < elementCount; j++) {
    const currentNumJ = numericElements[j]; // Intermediate variable for clarity
    const pairXorResult = currentNumI.bitwiseXor(currentNumJ); // Perform XOR operation
    totalXorSum = totalXorSum.add(pairXorResult); // Add to the running total
  }
}

// End the timer (added new fragment)
console.timeEnd("XOR Sum Calculation");

// Calculate the final result modulo MODULUS_VALUE and print it
const finalResultModulo = totalXorSum.getRemainder(MODULUS_VALUE);
console.log(finalResultModulo.toDecimalString());