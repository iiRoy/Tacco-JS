"use strict";

const largeNum = (function () {
  // Define core constants for the arbitrary-precision arithmetic
  const CHUNK_SIZE = 1e7; // Each array element stores numbers up to 10^7 - 1
  const CHUNK_DIGITS = 7; // Number of decimal digits per chunk
  const JS_SAFE_MAX = 9007199254740992; // Max safe integer in JavaScript
  const JS_SAFE_MAX_CHUNKS = jsNumToChunks(JS_SAFE_MAX); // JS_SAFE_MAX represented in chunks
  const LOG_JS_SAFE_MAX = Math.log(JS_SAFE_MAX); // Log of JS_SAFE_MAX, used for base parsing optimization

  /**
   * Helper to set up prototype inheritance.
   * @param {function} childCtor
   * @param {function} parentCtor
   */
  function inheritProto(childCtor, parentCtor) {
    childCtor.prototype = Object.create(parentCtor.prototype);
    childCtor.prototype.constructor = childCtor;
  }

  /**
   * Main factory function for creating largeNum instances.
   * @param {any} value Input value (number, string, or another largeNum instance).
   * @param {number} [base] Optional base for string input.
   * @returns {TinyNum|LargeNum}
   */
  function NumFactory(value, base) {
    if (value === undefined || value === null) {
      return NumFactory.ZERO_VAL; // Default to zero if no value
    }
    if (base !== undefined) {
      return +base === 10 ? parseInput(value) : parseStringWithBase(value, base);
    }
    return parseInput(value);
  }

  /**
   * Represents an arbitrary-precision integer.
   * @param {number[]} chunks Array of number chunks.
   * @param {boolean} isNegative Sign of the number.
   */
  function LargeNum(chunks, isNegative) {
    this.val = chunks;
    this.isNegative = isNegative;
    this.isTiny = false; // Flag to indicate it's a "large" number
  }
  inheritProto(LargeNum, NumFactory);

  /**
   * Represents a number that fits within JavaScript's safe integer range.
   * @param {number} value The actual JavaScript number.
   */
  function TinyNum(value) {
    this.val = value;
    this.isNegative = value < 0;
    this.isTiny = true; // Flag to indicate it's a "small" number
  }
  inheritProto(TinyNum, NumFactory);

  /**
   * Checks if a number fits within JavaScript's safe integer range.
   * @param {number} n
   * @returns {boolean}
   */
  function fitsJsNumber(n) {
    return -JS_SAFE_MAX < n && n < JS_SAFE_MAX;
  }

  /**
   * Converts a JavaScript number into an array of chunks.
   * @param {number} n
   * @returns {number[]}
   */
  function jsNumToChunks(n) {
    if (n < CHUNK_SIZE) return [n];
    if (n < CHUNK_SIZE * CHUNK_SIZE) return [n % CHUNK_SIZE, Math.floor(n / CHUNK_SIZE)];
    return [n % CHUNK_SIZE, Math.floor(n / CHUNK_SIZE) % CHUNK_SIZE, Math.floor(n / (CHUNK_SIZE * CHUNK_SIZE))];
  }

  /**
   * Converts an array of chunks back to a JavaScript number if possible.
   * @param {number[]} chunkArr
   * @returns {number|number[]} Returns a number if it fits, otherwise the chunk array.
   */
  function chunksToJsNum(chunkArr) {
    removeLeadingZeros(chunkArr);
    const len = chunkArr.length;
    // Check if the chunk representation is small enough to fit a JS number
    if (len < 4 && compareAbsoluteChunks(chunkArr, JS_SAFE_MAX_CHUNKS) < 0) {
      switch (len) {
        case 0:
          return 0;
        case 1:
          return chunkArr[0];
        case 2:
          return chunkArr[0] + chunkArr[1] * CHUNK_SIZE;
        default: // len = 3
          return chunkArr[0] + (chunkArr[1] + chunkArr[2] * CHUNK_SIZE) * CHUNK_SIZE;
      }
    }
    return chunkArr;
  }

  /**
   * Removes leading zero chunks from an array. (Modifies in place)
   * @param {number[]} arr
   */
  function removeLeadingZeros(arr) {
    let i = arr.length;
    while (i-- > 0 && arr[i] === 0);
    arr.length = i + 1;
  }

  /**
   * Creates a new array of specified length, filled with zeros.
   * @param {number} length
   * @returns {number[]}
   */
  function makeZeroFilledArray(length) {
    const arr = new Array(length);
    for (let i = 0; i < length; ++i) {
      arr[i] = 0;
    }
    return arr;
  }

  /**
   * Returns the integer part of a number (floor for positive, ceil for negative).
   * @param {number} n
   * @returns {number}
   */
  function intPart(n) {
    return n > 0 ? Math.floor(n) : Math.ceil(n);
  }

  /**
   * Adds two chunk arrays (representing positive numbers).
   * @param {number[]} arr1
   * @param {number[]} arr2
   * @returns {number[]} New chunk array representing the sum.
   */
  function sumChunkArrays(arr1, arr2) {
    const len1 = arr1.length,
      len2 = arr2.length;
    const result = new Array(len1);
    let carry = 0;
    let sumChunk;
    let i = 0;

    // Add common parts
    for (; i < len2; ++i) {
      sumChunk = arr1[i] + arr2[i] + carry;
      carry = sumChunk >= CHUNK_SIZE ? 1 : 0;
      result[i] = sumChunk - carry * CHUNK_SIZE;
    }

    // Add remaining part of the longer array
    while (i < len1) {
      sumChunk = arr1[i] + carry;
      carry = sumChunk === CHUNK_SIZE ? 1 : 0;
      result[i++] = sumChunk - carry * CHUNK_SIZE;
    }

    // If there's a final carry, add it
    if (carry > 0) result.push(carry);
    return result;
  }

  /**
   * Adds two chunk arrays, ensuring the first argument is always the longer one.
   * @param {number[]} arr1
   * @param {number[]} arr2
   * @returns {number[]}
   */
  function addFlexibleChunks(arr1, arr2) {
    return arr1.length >= arr2.length ? sumChunkArrays(arr1, arr2) : sumChunkArrays(arr2, arr1);
  }

  /**
   * Adds a JavaScript number (carry) to a chunk array.
   * @param {number[]} chunkArr
   * @param {number} carryVal The number to add.
   * @returns {number[]}
   */
  function addJsNumToChunks(chunkArr, carryVal) {
    const len = chunkArr.length;
    const result = new Array(len);
    let currentCarry = carryVal;
    let sumChunk;
    let i = 0;

    for (; i < len; ++i) {
      sumChunk = chunkArr[i] + currentCarry;
      currentCarry = Math.floor(sumChunk / CHUNK_SIZE);
      result[i] = sumChunk % CHUNK_SIZE;
    }

    while (currentCarry > 0) {
      result[i++] = currentCarry % CHUNK_SIZE;
      currentCarry = Math.floor(currentCarry / CHUNK_SIZE);
    }
    return result;
  }

  LargeNum.prototype.add = function (operand) {
    const otherNum = parseInput(operand);
    // If signs are different, perform subtraction
    if (this.isNegative !== otherNum.isNegative) {
      return this.subtract(otherNum.flipSign());
    }

    const valA = this.val;
    const valB = otherNum.val;

    if (otherNum.isTiny) {
      // If adding a TinyNum, convert its absolute value to chunks and add
      return new LargeNum(addJsNumToChunks(valA, Math.abs(valB)), this.isNegative);
    }
    // Both are LargeNums, add their chunk arrays
    return new LargeNum(addFlexibleChunks(valA, valB), this.isNegative);
  };
  // Alias for readability
  LargeNum.prototype.plus = LargeNum.prototype.add;

  TinyNum.prototype.add = function (operand) {
    const otherNum = parseInput(operand);
    const valA = this.val;

    // If signs are different, perform subtraction
    if (valA < 0 !== otherNum.isNegative) {
      return this.subtract(otherNum.flipSign());
    }

    const valB = otherNum.val;

    if (otherNum.isTiny) {
      // Both are TinyNums, check if sum fits JS number
      const sum = valA + valB;
      if (fitsJsNumber(sum)) {
        return new TinyNum(sum);
      }
      // Sum is too large for TinyNum, convert valB to chunks and add
      return new LargeNum(addJsNumToChunks(jsNumToChunks(Math.abs(valB)), Math.abs(valA)), valA < 0);
    }
    // This is TinyNum, otherNum is LargeNum
    return new LargeNum(addJsNumToChunks(valB, Math.abs(valA)), valA < 0);
  };
  // Alias for readability
  TinyNum.prototype.plus = TinyNum.prototype.add;

  /**
   * Subtracts two chunk arrays (representing positive numbers), arr1 - arr2.
   * Assumes arr1 >= arr2.
   * @param {number[]} arr1
   * @param {number[]} arr2
   * @returns {number[]} New chunk array representing the difference.
   */
  function diffChunkArrays(arr1, arr2) {
    const len1 = arr1.length,
      len2 = arr2.length;
    const result = new Array(len1);
    let borrow = 0;
    let diffChunk;
    let i = 0;

    // Subtract common parts
    for (; i < len2; ++i) {
      diffChunk = arr1[i] - borrow - arr2[i];
      if (diffChunk < 0) {
        diffChunk += CHUNK_SIZE;
        borrow = 1;
      } else {
        borrow = 0;
      }
      result[i] = diffChunk;
    }

    // Propagate borrow through remaining part of arr1
    for (; i < len1; ++i) {
      diffChunk = arr1[i] - borrow;
      if (diffChunk < 0) {
        diffChunk += CHUNK_SIZE;
      } else {
        result[i++] = diffChunk; // If no borrow, just copy remaining chunks
        break;
      }
      result[i] = diffChunk;
    }
    // Copy any remaining chunks from arr1 (if no more borrows)
    for (; i < len1; ++i) {
      result[i] = arr1[i];
    }

    removeLeadingZeros(result);
    return result;
  }

  /**
   * Performs subtraction between two chunk arrays, handling signs and order.
   * @param {number[]} arr1
   * @param {number[]} arr2
   * @param {boolean} currentSign The sign of the result if arr1 >= arr2.
   * @returns {TinyNum|LargeNum}
   */
  function subtractFlexibleChunks(arr1, arr2, currentSign) {
    let resultChunks;
    let newSign = currentSign;

    if (compareAbsoluteChunks(arr1, arr2) >= 0) {
      resultChunks = diffChunkArrays(arr1, arr2);
    } else {
      resultChunks = diffChunkArrays(arr2, arr1);
      newSign = !currentSign; // Flip sign if abs(arr2) > abs(arr1)
    }

    const value = chunksToJsNum(resultChunks);
    if (typeof value === "number") {
      if (newSign && value !== 0) value = -value; // Apply sign, but not to zero
      return new TinyNum(value);
    }
    return new LargeNum(value, newSign);
  }

  /**
   * Subtracts a JavaScript number (subtrahend) from a chunk array (minuend).
   * @param {number[]} minuendChunks
   * @param {number} subtrahendVal The number to subtract.
   * @param {boolean} currentSign The sign of the minuend.
   * @returns {TinyNum|LargeNum}
   */
  function subtractJsNumFromChunks(minuendChunks, subtrahendVal, currentSign) {
    const len = minuendChunks.length;
    const resultChunks = new Array(len);
    let currentBorrow = subtrahendVal;
    let diffChunk;
    let i = 0;

    for (; i < len; ++i) {
      diffChunk = minuendChunks[i] - currentBorrow;
      currentBorrow = Math.floor(diffChunk / CHUNK_SIZE);
      diffChunk %= CHUNK_SIZE;
      resultChunks[i] = diffChunk < 0 ? diffChunk + CHUNK_SIZE : diffChunk;
    }

    const value = chunksToJsNum(resultChunks);
    if (typeof value === "number") {
      if (currentSign && value !== 0) value = -value;
      return new TinyNum(value);
    }
    return new LargeNum(value, currentSign);
  }

  LargeNum.prototype.subtract = function (operand) {
    const otherNum = parseInput(operand);
    // If signs are different, convert to addition of the negated number
    if (this.isNegative !== otherNum.isNegative) {
      return this.add(otherNum.flipSign());
    }

    const valA = this.val;
    const valB = otherNum.val;

    if (otherNum.isTiny) {
      return subtractJsNumFromChunks(valA, Math.abs(valB), this.isNegative);
    }
    return subtractFlexibleChunks(valA, valB, this.isNegative);
  };
  // Alias for readability
  LargeNum.prototype.minus = LargeNum.prototype.subtract;

  TinyNum.prototype.subtract = function (operand) {
    const otherNum = parseInput(operand);
    const valA = this.val;

    // If signs are different, convert to addition of the negated number
    if (valA < 0 !== otherNum.isNegative) {
      return this.add(otherNum.flipSign());
    }

    const valB = otherNum.val;

    if (otherNum.isTiny) {
      // Both are TinyNums, perform direct subtraction
      return new TinyNum(valA - valB);
    }
    // This is TinyNum, otherNum is LargeNum
    // The result's sign depends on which absolute value is larger
    // Here, this.val is a single number, otherNum.val is chunk array
    // So if valA is positive and valB is negative (e.g. 5 - (-3)), it's 5+3
    // If valA is negative and valB is positive (e.g. -5 - 3), it's -5 + (-3)
    // The previous check (valA < 0 !== otherNum.isNegative) should handle this.
    // So here, both have same sign, e.g., 5 - 3 or -5 - (-3)
    // If this is -5 and otherNum is -3, we want -5 - (-3) = -5 + 3 = -2
    // subtractJsNumFromChunks expects positive chunks, so otherNum.val is abs(valB)
    // The sign parameter is for the overall result.
    // If valA is negative, result is negative. If valA is positive, result is positive.
    return subtractJsNumFromChunks(valB, Math.abs(valA), valA >= 0);
  };
  // Alias for readability
  TinyNum.prototype.minus = TinyNum.prototype.subtract;

  LargeNum.prototype.flipSign = function () {
    return new LargeNum(this.val, !this.isNegative);
  };
  TinyNum.prototype.flipSign = function () {
    const newTiny = new TinyNum(-this.val);
    newTiny.isNegative = !this.isNegative; // Explicitly set sign for -0 edge case
    return newTiny;
  };

  LargeNum.prototype.absoluteValue = function () {
    return new LargeNum(this.val, false);
  };
  TinyNum.prototype.absoluteValue = function () {
    return new TinyNum(Math.abs(this.val));
  };

  /**
   * Multiplies two chunk arrays using the standard "long multiplication" algorithm.
   * @param {number[]} arr1
   * @param {number[]} arr2
   * @returns {number[]} New chunk array representing the product.
   */
  function multiplyChunksLong(arr1, arr2) {
    const len1 = arr1.length,
      len2 = arr2.length;
    const result = makeZeroFilledArray(len1 + len2);
    let productChunk, carry;
    let chunkA, chunkB;

    for (let i = 0; i < len1; ++i) {
      chunkA = arr1[i];
      carry = 0;
      for (let j = 0; j < len2; ++j) {
        chunkB = arr2[j];
        productChunk = chunkA * chunkB + result[i + j] + carry;
        carry = Math.floor(productChunk / CHUNK_SIZE);
        result[i + j] = productChunk - carry * CHUNK_SIZE;
      }
      result[i + len2] += carry;
    }
    removeLeadingZeros(result);
    return result;
  }

  /**
   * Multiplies a chunk array by a single JavaScript number.
   * @param {number[]} chunkArr
   * @param {number} multiplier
   * @returns {number[]} New chunk array representing the product.
   */
  function multiplyChunksByJsNum(chunkArr, multiplier) {
    const len = chunkArr.length;
    const result = new Array(len);
    let carry = 0;
    let productChunk;
    let i = 0;

    for (; i < len; ++i) {
      productChunk = chunkArr[i] * multiplier + carry;
      carry = Math.floor(productChunk / CHUNK_SIZE);
      result[i] = productChunk - carry * CHUNK_SIZE;
    }

    while (carry > 0) {
      result[i++] = carry % CHUNK_SIZE;
      carry = Math.floor(carry / CHUNK_SIZE);
    }
    return result;
  }

  /**
   * Pads a chunk array with `n` leading zeros (effectively shifting left).
   * @param {number[]} arr
   * @param {number} n Number of zeros to add.
   * @returns {number[]} New array with padded zeros.
   */
  function padWithZeros(arr, n) {
    const result = [];
    for (let i = 0; i < n; ++i) result.push(0);
    return result.concat(arr);
  }

  const KARATSUBA_THRESHOLD = 30; // Threshold for switching to Karatsuba multiplication

  /**
   * Multiplies two chunk arrays using the Karatsuba algorithm.
   * This is a recursive divide-and-conquer algorithm.
   * @param {number[]} x Chunks of the first number.
   * @param {number[]} y Chunks of the second number.
   * @returns {number[]} Chunks of the product.
   */
  function karatsubaMultiply(x, y) {
    const n = Math.max(x.length, y.length);

    // Base case: if numbers are small, use long multiplication
    if (n <= KARATSUBA_THRESHOLD) {
      return multiplyChunksLong(x, y);
    }

    // Divide x and y into two halves
    const m = Math.ceil(n / 2);
    const xHigh = x.slice(m);
    const xLow = x.slice(0, m);
    const yHigh = y.slice(m);
    const yLow = y.slice(0, m);

    // Recursively calculate three products
    const p1 = karatsubaMultiply(xLow, yLow);
    const p2 = karatsubaMultiply(xHigh, yHigh);
    const p3 = karatsubaMultiply(addFlexibleChunks(xLow, xHigh), addFlexibleChunks(yLow, yHigh));

    // Combine results: p1 + (p3 - p1 - p2) * B^m + p2 * B^(2m)
    const middleTerm = diffChunkArrays(diffChunkArrays(p3, p1), p2);
    const product = addFlexibleChunks(addFlexibleChunks(p1, padWithZeros(middleTerm, m)), padWithZeros(p2, 2 * m));

    removeLeadingZeros(product);
    return product;
  }

  /**
   * Determines if Karatsuba algorithm should be used based on operand lengths.
   * Heuristic determined by profiling.
   * @param {number} len1 Length of first operand.
   * @param {number} len2 Length of second operand.
   * @returns {boolean}
   */
  function shouldUseKaratsuba(len1, len2) {
    return -0.012 * len1 - 0.012 * len2 + 15e-6 * len1 * len2 > 0;
  }

  LargeNum.prototype.multiply = function (operand) {
    const otherNum = parseInput(operand);
    const valA = this.val;
    let valB = otherNum.val;
    const resultIsNegative = this.isNegative !== otherNum.isNegative;

    if (otherNum.isTiny) {
      if (valB === 0) return NumFactory.ZERO_VAL;
      if (valB === 1) return this;
      if (valB === -1) return this.flipSign();

      const absValB = Math.abs(valB);
      if (absValB < CHUNK_SIZE) {
        return new LargeNum(multiplyChunksByJsNum(valA, absValB), resultIsNegative);
      }
      // If TinyNum is larger than a single chunk, convert to chunks
      valB = jsNumToChunks(absValB);
    }

    // Decide between Karatsuba and long multiplication
    if (shouldUseKaratsuba(valA.length, valB.length)) {
      return new LargeNum(karatsubaMultiply(valA, valB), resultIsNegative);
    }
    return new LargeNum(multiplyChunksLong(valA, valB), resultIsNegative);
  };
  // Alias for readability
  LargeNum.prototype.times = LargeNum.prototype.multiply;

  /**
   * Multiplies a JavaScript number by a chunk array.
   * @param {number} jsNum
   * @param {number[]} chunkArr
   * @param {boolean} resultIsNegative
   * @returns {LargeNum}
   */
  function multiplyJsNumByChunks(jsNum, chunkArr, resultIsNegative) {
    if (jsNum < CHUNK_SIZE) {
      return new LargeNum(multiplyChunksByJsNum(chunkArr, jsNum), resultIsNegative);
    }
    return new LargeNum(multiplyChunksLong(chunkArr, jsNumToChunks(jsNum)), resultIsNegative);
  }

  LargeNum.prototype._multiplyByTiny = function (tinyOperand) {
    if (tinyOperand.val === 0) return NumFactory.ZERO_VAL;
    if (tinyOperand.val === 1) return this;
    if (tinyOperand.val === -1) return this.flipSign();
    return multiplyJsNumByChunks(Math.abs(tinyOperand.val), this.val, this.isNegative !== tinyOperand.isNegative);
  };

  TinyNum.prototype._multiplyByTiny = function (tinyOperand) {
    const product = tinyOperand.val * this.val;
    if (fitsJsNumber(product)) {
      return new TinyNum(product);
    }
    // Result is too large for TinyNum, convert to LargeNum
    return multiplyJsNumByChunks(Math.abs(tinyOperand.val), jsNumToChunks(Math.abs(this.val)), this.isNegative !== tinyOperand.isNegative);
  };

  TinyNum.prototype.multiply = function (operand) {
    // Delegate to _multiplyByTiny if operand is also TinyNum, otherwise handle as LargeNum
    const otherNum = parseInput(operand);
    return otherNum._multiplyByTiny(this); // Let the other number handle multiplication if it's a TinyNum
  };
  // Alias for readability
  TinyNum.prototype.times = TinyNum.prototype.multiply;

  /**
   * Squares a chunk array (representing a positive number).
   * @param {number[]} arr
   * @returns {number[]} New chunk array representing the square.
   */
  function squareChunks(arr) {
    const len = arr.length;
    const result = makeZeroFilledArray(len + len);
    let productChunk, carry;
    let chunk_i, chunk_j;

    for (let i = 0; i < len; ++i) {
      chunk_i = arr[i];
      carry = 0 - chunk_i * chunk_i; // Initialize carry with negative square for the diagonal term (handled differently)
      for (let j = i; j < len; ++j) {
        chunk_j = arr[j];
        productChunk = 2 * (chunk_i * chunk_j) + result[i + j] + carry;
        carry = Math.floor(productChunk / CHUNK_SIZE);
        result[i + j] = productChunk - carry * CHUNK_SIZE;
      }
      result[i + len] += carry;
    }
    removeLeadingZeros(result);
    return result;
  }

  LargeNum.prototype.square = function () {
    return new LargeNum(squareChunks(this.val), false); // Square is always positive
  };
  TinyNum.prototype.square = function () {
    const squaredVal = this.val * this.val;
    if (fitsJsNumber(squaredVal)) {
      return new TinyNum(squaredVal);
    }
    return new LargeNum(squareChunks(jsNumToChunks(Math.abs(this.val))), false);
  };

  /**
   * Performs division and modulo for two chunk arrays using a normalized algorithm (Knuth's D-algorithm).
   * Suitable for numbers with moderate lengths.
   * @param {number[]} dividendArr
   * @param {number[]} divisorArr
   * @returns {[number[], number[]]} [quotientChunks, remainderChunks]
   */
  function divideAndModLong(dividendArr, divisorArr) {
    const lenDivd = dividendArr.length,
      lenDivs = divisorArr.length;
    const resultQuotient = makeZeroFilledArray(lenDivs); // Quotient will have at most lenDivd - lenDivs + 1 chunks
    const divisorMostSignificantDigit = divisorArr[lenDivs - 1];

    // Normalize divisor and dividend by multiplying by a factor 'lambda'
    // such that the most significant digit of the divisor is >= CHUNK_SIZE / 2.
    // This helps improve the accuracy of quotient digit estimation.
    const lambda = Math.ceil(CHUNK_SIZE / (2 * divisorMostSignificantDigit));
    let remainder = multiplyChunksByJsNum(dividendArr, lambda);
    let divisor = multiplyChunksByJsNum(divisorArr, lambda);

    // Adjust remainder length if necessary
    if (remainder.length <= lenDivd) remainder.push(0);
    divisor.push(0); // Pad divisor to align with remainder in loop

    const normalizedDivisorMSD = divisor[lenDivs - 1];

    for (let shift = lenDivd - lenDivs; shift >= 0; --shift) {
      // Estimate quotient digit
      let qDigitEstimate = CHUNK_SIZE - 1;
      if (remainder[shift + lenDivs] !== normalizedDivisorMSD) {
        qDigitEstimate = Math.floor((remainder[shift + lenDivs] * CHUNK_SIZE + remainder[shift + lenDivs - 1]) / normalizedDivisorMSD);
      }

      // Multiply divisor by estimated quotient digit and subtract from remainder
      let carry = 0;
      let borrow = 0;
      const currentDivisorLen = divisor.length;
      for (let i = 0; i < currentDivisorLen; ++i) {
        carry += qDigitEstimate * divisor[i];
        const q = Math.floor(carry / CHUNK_SIZE);
        borrow += remainder[shift + i] - (carry - q * CHUNK_SIZE);
        carry = q;

        if (borrow < 0) {
          remainder[shift + i] = borrow + CHUNK_SIZE;
          borrow = -1;
        } else {
          remainder[shift + i] = borrow;
          borrow = 0;
        }
      }

      // Adjust quotient digit if subtraction resulted in a negative borrow
      while (borrow !== 0) {
        qDigitEstimate -= 1;
        carry = 0;
        for (let i = 0; i < currentDivisorLen; ++i) {
          carry += remainder[shift + i] - CHUNK_SIZE + divisor[i];
          if (carry < 0) {
            remainder[shift + i] = carry + CHUNK_SIZE;
            carry = 0;
          } else {
            remainder[shift + i] = carry;
            carry = 1;
          }
        }
        borrow += carry;
      }
      resultQuotient[shift] = qDigitEstimate;
    }

    // Denormalize remainder
    remainder = divideAndModByJsNum(remainder, lambda)[0];
    return [chunksToJsNum(resultQuotient), chunksToJsNum(remainder)];
  }

  /**
   * Performs division and modulo for two chunk arrays using a simpler, iterative approach.
   * Less efficient than `divideAndModLong` for very large numbers but works for all.
   * @param {number[]} dividendArr
   * @param {number[]} divisorArr
   * @returns {[number[], number[]]} [quotientChunks, remainderChunks]
   */
  function divideAndModStandard(dividendArr, divisorArr) {
    let lenDivd = dividendArr.length,
      lenDivs = divisorArr.length;
    const quotientChunks = [];
    let currentPartialDividend = [];
    let estimatedQuotientDigit;
    let xlen, highx, highy, check;

    // Process dividend chunks from most significant to least significant
    while (lenDivd > 0) {
      currentPartialDividend.unshift(dividendArr[--lenDivd]); // Add next chunk from dividend
      removeLeadingZeros(currentPartialDividend); // Keep partial dividend clean

      // If current partial dividend is smaller than divisor, quotient digit is 0
      if (compareAbsoluteChunks(currentPartialDividend, divisorArr) < 0) {
        quotientChunks.push(0);
        continue;
      }

      // Estimate quotient digit
      xlen = currentPartialDividend.length;
      highx = currentPartialDividend[xlen - 1] * CHUNK_SIZE + currentPartialDividend[xlen - 2];
      highy = divisorArr[lenDivs - 1] * CHUNK_SIZE + divisorArr[lenDivs - 2];

      if (xlen > lenDivs) {
        // If partial dividend is longer than divisor, adjust highx for better estimate
        highx = (highx + 1) * CHUNK_SIZE;
      }
      estimatedQuotientDigit = Math.ceil(highx / highy);

      // Refine estimated quotient digit by trial multiplication and subtraction
      do {
        check = multiplyChunksByJsNum(divisorArr, estimatedQuotientDigit);
        if (compareAbsoluteChunks(check, currentPartialDividend) <= 0) break;
        estimatedQuotientDigit--;
      } while (estimatedQuotientDigit > 0); // Ensure quotient digit doesn't go below 0

      quotientChunks.push(estimatedQuotientDigit);
      currentPartialDividend = diffChunkArrays(currentPartialDividend, check); // Update partial dividend (remainder)
    }

    quotientChunks.reverse(); // Chunks were added in reverse order
    return [chunksToJsNum(quotientChunks), chunksToJsNum(currentPartialDividend)];
  }

  /**
   * Divides a chunk array by a JavaScript number.
   * @param {number[]} chunkArr
   * @param {number} divisorVal
   * @returns {[number[], number]} [quotientChunks, remainder]
   */
  function divideAndModByJsNum(chunkArr, divisorVal) {
    const len = chunkArr.length;
    const quotientChunks = makeZeroFilledArray(len);
    let remainder = 0;
    let currentChunk, q;

    // Process chunks from most significant to least significant
    for (let i = len - 1; i >= 0; --i) {
      currentChunk = remainder * CHUNK_SIZE + chunkArr[i];
      q = intPart(currentChunk / divisorVal);
      remainder = currentChunk - q * divisorVal; // Calculate new remainder
      quotientChunks[i] = q | 0; // Ensure integer value
    }
    return [quotientChunks, remainder | 0];
  }

  /**
   * Performs division and modulo operation, handling different types and signs.
   * @param {LargeNum|TinyNum} self The dividend.
   * @param {LargeNum|TinyNum} operand The divisor.
   * @returns {[LargeNum|TinyNum, LargeNum|TinyNum]} [quotient, remainder]
   */
  function flexibleDivideAndMod(self, operand) {
    const otherNum = parseInput(operand);
    const valA = self.val;
    let valB = otherNum.val;

    if (otherNum.isZeroNum()) {
      throw new Error("Cannot divide by zero");
    }

    // Handle TinyNum cases
    if (self.isTiny) {
      if (otherNum.isTiny) {
        return [new TinyNum(intPart(valA / valB)), new TinyNum(valA % valB)];
      }
      // TinyNum / LargeNum (abs(TinyNum) < abs(LargeNum))
      return [NumFactory.ZERO_VAL, self];
    }

    // Dividend is LargeNum
    if (otherNum.isTiny) {
      // LargeNum / TinyNum
      if (valB === 1) return [self, NumFactory.ZERO_VAL];
      if (valB === -1) return [self.flipSign(), NumFactory.ZERO_VAL];

      const absValB = Math.abs(valB);
      if (absValB < CHUNK_SIZE) {
        const [quotientChunks, remainderVal] = divideAndModByJsNum(valA, absValB);
        let remainderResult = remainderVal;
        if (self.isNegative && remainderResult !== 0) remainderResult = -remainderResult; // Apply dividend's sign to remainder

        const quotientNum = chunksToJsNum(quotientChunks);
        if (typeof quotientNum === "number") {
          // If quotient fits JS number
          if (self.isNegative !== otherNum.isNegative && quotientNum !== 0) quotientNum = -quotientNum;
          return [new TinyNum(quotientNum), new TinyNum(remainderResult)];
        }
        // Quotient is LargeNum
        return [new LargeNum(quotientNum, self.isNegative !== otherNum.isNegative), new TinyNum(remainderResult)];
      }
      // If TinyNum is larger than a single chunk, convert to chunks
      valB = jsNumToChunks(absValB);
    }

    // Both are LargeNums
    const comparison = compareAbsoluteChunks(valA, valB);
    if (comparison === -1) return [NumFactory.ZERO_VAL, self]; // abs(dividend) < abs(divisor)
    if (comparison === 0) {
      // abs(dividend) === abs(divisor)
      return [new TinyNum(self.isNegative !== otherNum.isNegative ? -1 : 1), NumFactory.ZERO_VAL];
    }

    let resultQuoRem;
    // Choose division algorithm based on length (heuristic)
    if (valA.length + valB.length <= 200) {
      resultQuoRem = divideAndModLong(valA, valB);
    } else {
      resultQuoRem = divideAndModStandard(valA, valB);
    }

    const quotientRaw = resultQuoRem[0];
    const remainderRaw = resultQuoRem[1];

    const quotientSign = self.isNegative !== otherNum.isNegative;
    const remainderSign = self.isNegative;

    let finalQuotient, finalRemainder;

    if (typeof quotientRaw === "number") {
      if (quotientSign && quotientRaw !== 0) finalQuotient = -quotientRaw;
      else finalQuotient = quotientRaw;
      finalQuotient = new TinyNum(finalQuotient);
    } else {
      finalQuotient = new LargeNum(quotientRaw, quotientSign);
    }

    if (typeof remainderRaw === "number") {
      if (remainderSign && remainderRaw !== 0) finalRemainder = -remainderRaw;
      else finalRemainder = remainderRaw;
      finalRemainder = new TinyNum(finalRemainder);
    } else {
      finalRemainder = new LargeNum(remainderRaw, remainderSign);
    }

    return [finalQuotient, finalRemainder];
  }

  LargeNum.prototype.getDivMod = function (operand) {
    const [quotient, remainder] = flexibleDivideAndMod(this, operand);
    return {
      quotient: quotient,
      remainder: remainder,
    };
  };
  TinyNum.prototype.getDivMod = LargeNum.prototype.getDivMod;

  LargeNum.prototype.getQuotient = function (operand) {
    return flexibleDivideAndMod(this, operand)[0];
  };
  TinyNum.prototype.getQuotient = LargeNum.prototype.getQuotient;
  LargeNum.prototype.divide = LargeNum.prototype.getQuotient; // Alias
  TinyNum.prototype.divide = TinyNum.prototype.getQuotient; // Alias

  LargeNum.prototype.getRemainder = function (operand) {
    return flexibleDivideAndMod(this, operand)[1];
  };
  TinyNum.prototype.getRemainder = LargeNum.prototype.getRemainder;
  LargeNum.prototype.mod = LargeNum.prototype.getRemainder; // Alias
  TinyNum.prototype.mod = TinyNum.prototype.getRemainder; // Alias

  LargeNum.prototype.power = function (exponent) {
    const expNum = parseInput(exponent);
    const baseVal = this.val;
    const expVal = expNum.val;

    if (expVal === 0) return NumFactory.ONE_VAL;
    if (this.isZeroNum()) return NumFactory.ZERO_VAL;
    if (this.isOneOrMinusOne()) {
      return this.isEqualTo(NumFactory.ONE_VAL) || expNum.isEvenlyDivisible() ? NumFactory.ONE_VAL : NumFactory.MINUS_ONE_VAL;
    }

    if (expNum.isNegative) {
      // Negative exponent means 1 / (base^abs(exp)), which results in 0 for integers
      return NumFactory.ZERO_VAL;
    }
    if (!expNum.isTiny) {
      throw new Error("The exponent " + expNum.toBase10String() + " is too large.");
    }

    if (this.isTiny) {
      const result = Math.pow(baseVal, expVal);
      if (fitsJsNumber(result)) return new TinyNum(intPart(result));
    }

    let currentBase = this;
    let result = NumFactory.ONE_VAL;
    let remainingExp = expVal;

    // Binary exponentiation (exponentiation by squaring)
    while (remainingExp > 0) {
      if (remainingExp % 2 === 1) {
        result = result.times(currentBase);
      }
      if (remainingExp === 1) break; // Optimization for last iteration
      currentBase = currentBase.square();
      remainingExp = intPart(remainingExp / 2);
    }
    return result;
  };
  TinyNum.prototype.power = LargeNum.prototype.power;

  LargeNum.prototype.modularPower = function (exponent, modulus) {
    let expNum = parseInput(exponent);
    const modNum = parseInput(modulus);

    if (modNum.isZeroNum()) {
      throw new Error("Cannot take modular power with modulus 0");
    }
    if (modNum.isOneOrMinusOne()) {
      return NumFactory.ZERO_VAL; // Any number mod 1 or -1 is 0
    }

    let result = NumFactory.ONE_VAL;
    let currentBase = this.getRemainder(modNum); // Reduce base modulo modulus

    // Binary exponentiation (exponentiation by squaring)
    while (expNum.isPositiveNum()) {
      if (currentBase.isZeroNum()) return NumFactory.ZERO_VAL; // 0^exp mod M = 0
      if (expNum.isOddlyDivisible()) {
        result = result.multiply(currentBase).mod(modNum);
      }
      expNum = expNum.getQuotient(2);
      currentBase = currentBase.square().mod(modNum);
    }
    return result;
  };
  TinyNum.prototype.modularPower = LargeNum.prototype.modularPower;

  /**
   * Compares the absolute values of two chunk arrays.
   * @param {number[]} arr1
   * @param {number[]} arr2
   * @returns {number} 1 if arr1 > arr2, -1 if arr1 < arr2, 0 if arr1 === arr2.
   */
  function compareAbsoluteChunks(arr1, arr2) {
    if (arr1.length !== arr2.length) {
      return arr1.length > arr2.length ? 1 : -1;
    }
    // Compare chunk by chunk from most significant
    for (let i = arr1.length - 1; i >= 0; --i) {
      if (arr1[i] !== arr2[i]) return arr1[i] > arr2[i] ? 1 : -1;
    }
    return 0; // Arrays are identical
  }

  LargeNum.prototype.compareWith = function (operand) {
    if (operand === Infinity) return -1;
    if (operand === -Infinity) return 1;

    const otherNum = parseInput(operand);
    const valA = this.val;
    const valB = otherNum.val;

    // Different signs: Negative is always less than positive
    if (this.isNegative !== otherNum.isNegative) {
      return otherNum.isNegative ? 1 : -1; // If other is negative, this is positive (1). If other is positive, this is negative (-1).
    }

    // Both have the same sign
    let comparisonResult;
    if (otherNum.isTiny) {
      // LargeNum vs TinyNum (same sign) => LargeNum is always "larger" in magnitude
      comparisonResult = 1;
    } else {
      comparisonResult = compareAbsoluteChunks(valA, valB);
    }

    // If both are negative, flip the comparison result
    return this.isNegative ? -comparisonResult : comparisonResult;
  };
  LargeNum.prototype.compareTo = LargeNum.prototype.compareWith; // Alias

  TinyNum.prototype.compareWith = function (operand) {
    if (operand === Infinity) return -1;
    if (operand === -Infinity) return 1;

    const otherNum = parseInput(operand);
    const valA = this.val;
    const valB = otherNum.val;

    if (otherNum.isTiny) {
      // Both are TinyNums
      return valA === valB ? 0 : valA > valB ? 1 : -1;
    }

    // This is TinyNum, otherNum is LargeNum
    // If valA < 0 !== otherNum.isNegative
    // This case means different signs, e.g., -5 (Tiny) vs 10 (Large) or 5 (Tiny) vs -10 (Large)
    if (valA < 0 !== otherNum.isNegative) {
      return valA < 0 ? -1 : 1; // If this is negative, it's smaller. If this is positive, it's larger.
    }

    // Same signs: TinyNum vs LargeNum
    // A TinyNum (value `valA`) is always "smaller" in magnitude than a LargeNum (value `valB`) if both are positive.
    // A TinyNum is always "larger" in magnitude than a LargeNum if both are negative.
    // e.g. 5 (Tiny) vs [1,0,0] (Large) -> Tiny is smaller
    // e.g. -5 (Tiny) vs [-1,0,0] (Large) -> Tiny is larger (-5 > -[1,0,0])
    return valA < 0 ? 1 : -1; // If this is negative, it's greater. If positive, it's lesser.
  };
  TinyNum.prototype.compareTo = TinyNum.prototype.compareWith; // Alias

  LargeNum.prototype.isEqualTo = function (operand) {
    return this.compareWith(operand) === 0;
  };
  TinyNum.prototype.isEqualTo = LargeNum.prototype.isEqualTo;

  LargeNum.prototype.isNotEqualTo = function (operand) {
    return this.compareWith(operand) !== 0;
  };
  TinyNum.prototype.isNotEqualTo = LargeNum.prototype.isNotEqualTo;

  LargeNum.prototype.isGreater = function (operand) {
    return this.compareWith(operand) > 0;
  };
  TinyNum.prototype.isGreater = LargeNum.prototype.isGreater;

  LargeNum.prototype.isLesser = function (operand) {
    return this.compareWith(operand) < 0;
  };
  TinyNum.prototype.isLesser = LargeNum.prototype.isLesser;

  LargeNum.prototype.isGreaterOrEqual = function (operand) {
    return this.compareWith(operand) >= 0;
  };
  TinyNum.prototype.isGreaterOrEqual = LargeNum.prototype.isGreaterOrEqual;

  LargeNum.prototype.isLesserOrEqual = function (operand) {
    return this.compareWith(operand) <= 0;
  };
  TinyNum.prototype.isLesserOrEqual = LargeNum.prototype.isLesserOrEqual;

  LargeNum.prototype.isEvenlyDivisible = function () {
    return (this.val[0] & 1) === 0; // Check least significant chunk
  };
  TinyNum.prototype.isEvenlyDivisible = function () {
    return (this.val & 1) === 0; // Check JS number
  };

  LargeNum.prototype.isOddlyDivisible = function () {
    return (this.val[0] & 1) === 1; // Check least significant chunk
  };
  TinyNum.prototype.isOddlyDivisible = function () {
    return (this.val & 1) === 1; // Check JS number
  };

  LargeNum.prototype.isPositiveNum = function () {
    return !this.isNegative;
  };
  TinyNum.prototype.isPositiveNum = function () {
    return this.val > 0;
  };

  LargeNum.prototype.isNegativeNum = function () {
    return this.isNegative;
  };
  TinyNum.prototype.isNegativeNum = function () {
    return this.val < 0;
  };

  LargeNum.prototype.isOneOrMinusOne = function () {
    return false; // A LargeNum can't be 1 or -1 directly (it's always > JS_SAFE_MAX)
  };
  TinyNum.prototype.isOneOrMinusOne = function () {
    return Math.abs(this.val) === 1;
  };

  LargeNum.prototype.isZeroNum = function () {
    return false; // A LargeNum cannot be zero directly
  };
  TinyNum.prototype.isZeroNum = function () {
    return this.val === 0;
  };

  LargeNum.prototype.isDivisibleByNum = function (operand) {
    const otherNum = parseInput(operand);
    const otherVal = otherNum.val;

    if (otherNum.isZeroNum()) return false;
    if (otherNum.isOneOrMinusOne()) return true; // Divisible by 1 or -1
    if (otherNum.isEqualTo(NumFactory.cachedTinyNums[2])) return this.isEvenlyDivisible(); // Divisible by 2

    return this.getRemainder(otherNum).isEqualTo(NumFactory.ZERO_VAL);
  };
  TinyNum.prototype.isDivisibleByNum = LargeNum.prototype.isDivisibleByNum;

  /**
   * Checks if a number is a basic prime (2, 3, 5) or small composite.
   * @param {LargeNum|TinyNum} num
   * @returns {boolean|undefined} True/False if known, undefined otherwise.
   */
  function isSmallPrime(num) {
    const absNum = num.absoluteValue();
    if (absNum.isOneOrMinusOne() || absNum.isZeroNum()) return false;
    if (absNum.isEqualTo(NumFactory.cachedTinyNums[2]) || absNum.isEqualTo(NumFactory.cachedTinyNums[3]) || absNum.isEqualTo(NumFactory.cachedTinyNums[5])) return true;
    if (absNum.isEvenlyDivisible() || absNum.isDivisibleByNum(NumFactory.cachedTinyNums[3]) || absNum.isDivisibleByNum(NumFactory.cachedTinyNums[5])) return false;
    if (absNum.isLesser(NumFactory.cachedTinyNums[25])) return true; // Primes up to 23 are covered
  }

  LargeNum.prototype.checkPrimality = function () {
    const basicCheckResult = isSmallPrime(this);
    if (basicCheckResult !== undefined) return basicCheckResult;

    const numAbs = this.absoluteValue();
    const numMinusOne = numAbs.decrement(); // n-1

    // Miller-Rabin primality test (simplified for a few bases)
    const testBases = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37]; // More bases for better certainty
    let d = numMinusOne;
    let s = 0; // s such that n-1 = d * 2^s and d is odd

    while (d.isEvenlyDivisible()) {
      d = d.getQuotient(2);
      s++;
    }

    for (let i = 0; i < testBases.length; ++i) {
      if (testBases[i] >= numAbs.toNativeNumber()) break; // No need to test bases larger than n-2
      let a = largeNum(testBases[i]);
      let x = a.modularPower(d, numAbs);

      if (x.isEqualTo(NumFactory.ONE_VAL) || x.isEqualTo(numMinusOne)) {
        continue; // Witness passes
      }

      let witnessPass = false;
      for (let r = 0; r < s; ++r) {
        x = x.square().mod(numAbs);
        if (x.isEqualTo(numMinusOne)) {
          witnessPass = true;
          break;
        }
      }
      if (!witnessPass) return false; // Composite
    }
    return true; // Probably prime
  };
  TinyNum.prototype.checkPrimality = LargeNum.prototype.checkPrimality;

  LargeNum.prototype.checkProbablePrimality = function (iterations) {
    const basicCheckResult = isSmallPrime(this);
    if (basicCheckResult !== undefined) return basicCheckResult;

    const numAbs = this.absoluteValue();
    const numMinusOne = numAbs.decrement();
    const numMinusTwo = numAbs.subtract(NumFactory.cachedTinyNums[2]);

    const numIterations = iterations === undefined ? 5 : iterations; // Default to 5 iterations

    if (numAbs.isLesser(NumFactory.cachedTinyNums[2])) return false; // 0, 1, -1 are not prime
    if (numAbs.isEqualTo(NumFactory.cachedTinyNums[2])) return true; // 2 is prime
    if (numAbs.isEvenlyDivisible()) return false; // Even numbers > 2 are not prime

    // Miller-Rabin test with random bases
    for (let i = 0; i < numIterations; ++i) {
      // Pick a random base 'a' such that 2 <= a <= n-2
      const a = NumFactory.randomBetween(NumFactory.cachedTinyNums[2], numMinusTwo);
      if (!a.modularPower(numMinusOne, numAbs).isEqualTo(NumFactory.ONE_VAL)) {
        return false; // Composite
      }
    }
    return true; // Probably prime
  };
  TinyNum.prototype.checkProbablePrimality = LargeNum.prototype.checkProbablePrimality;

  LargeNum.prototype.modularInverse = function (modulus) {
    let t = NumFactory.ZERO_VAL,
      newT = NumFactory.ONE_VAL;
    let r = parseInput(modulus),
      newR = this.absoluteValue(); // Use absolute value for extended Euclidean algorithm

    let q, lastT, lastR;

    while (!newR.isZeroNum()) {
      q = r.getQuotient(newR); // q = floor(r / newR)
      lastT = t;
      lastR = r;

      t = newT;
      r = newR;

      newT = lastT.subtract(q.multiply(newT));
      newR = lastR.subtract(q.multiply(newR));
    }

    if (!r.isEqualTo(NumFactory.ONE_VAL)) {
      throw new Error(this.toBase10String() + " and " + modulus.toBase10String() + " are not co-prime.");
    }

    // Ensure result is positive and within [0, modulus-1]
    if (t.isNegativeNum()) {
      t = t.add(modulus);
    }

    // If original number was negative, negate the inverse (mod M)
    // For a^(-1) mod m, if a < 0, then a^(-1) = (a mod m)^(-1) mod m
    // The extended Euclidean algorithm finds inverse for abs(a).
    // If a < 0, then inv(a) = -inv(abs(a)) mod m
    if (this.isNegativeNum()) {
      return t.flipSign().mod(modulus); // (modulus - t) mod modulus
    }

    return t;
  };
  TinyNum.prototype.modularInverse = LargeNum.prototype.modularInverse;

  LargeNum.prototype.increment = function () {
    const currentVal = this.val;
    if (this.isNegative) {
      // -N + 1 = -(N-1)
      return subtractJsNumFromChunks(currentVal, 1, this.isNegative);
    }
    return new LargeNum(addJsNumToChunks(currentVal, 1), this.isNegative);
  };
  TinyNum.prototype.increment = function () {
    const currentVal = this.val;
    if (currentVal + 1 < JS_SAFE_MAX) {
      return new TinyNum(currentVal + 1);
    }
    // If incrementing exceeds JS_SAFE_MAX, convert to LargeNum
    return new LargeNum(JS_SAFE_MAX_CHUNKS, false);
  };

  LargeNum.prototype.decrement = function () {
    const currentVal = this.val;
    if (this.isNegative) {
      // -N - 1 = -(N+1)
      return new LargeNum(addJsNumToChunks(currentVal, 1), true);
    }
    return subtractJsNumFromChunks(currentVal, 1, this.isNegative);
  };
  TinyNum.prototype.decrement = function () {
    const currentVal = this.val;
    if (currentVal - 1 > -JS_SAFE_MAX) {
      return new TinyNum(currentVal - 1);
    }
    // If decrementing goes below -JS_SAFE_MAX, convert to LargeNum
    return new LargeNum(JS_SAFE_MAX_CHUNKS, true); // Represents -JS_SAFE_MAX
  };

  // Pre-calculated powers of 2 for efficient shifting
  const chunkPowersOfTwo = [1];
  while (2 * chunkPowersOfTwo[chunkPowersOfTwo.length - 1] <= CHUNK_SIZE) {
    chunkPowersOfTwo.push(2 * chunkPowersOfTwo[chunkPowersOfTwo.length - 1]);
  }
  const chunkPowersCount = chunkPowersOfTwo.length;
  const maxChunkPower = chunkPowersOfTwo[chunkPowersCount - 1];

  /**
   * Checks if a shift amount is a small enough number to be directly handled.
   * @param {any} n
   * @returns {boolean}
   */
  function canShiftByJsNum(n) {
    return (typeof n === "number" || typeof n === "string") && +Math.abs(n) <= CHUNK_SIZE * CHUNK_SIZE || (n instanceof LargeNum || n instanceof TinyNum) && n.val.length <= 2;
  }

  LargeNum.prototype.leftShiftBits = function (shiftAmount) {
    if (!canShiftByJsNum(shiftAmount)) {
      throw new Error("Shift amount " + String(shiftAmount) + " is too large for shifting.");
    }
    const numShift = +shiftAmount;
    if (numShift < 0) return this.rightShiftBits(-numShift); // Delegate to right shift for negative shifts

    if (this.isZeroNum()) return this;

    let result = this;
    let remainingShift = numShift;

    // Perform shifts in chunks (multiples of maxChunkPower)
    while (remainingShift >= chunkPowersCount) {
      result = result.multiply(maxChunkPower);
      remainingShift -= chunkPowersCount - 1; // PowersOfTwo[0] is 1, so count is off by 1
    }
    return result.multiply(chunkPowersOfTwo[remainingShift]);
  };
  TinyNum.prototype.leftShiftBits = LargeNum.prototype.leftShiftBits;

  LargeNum.prototype.rightShiftBits = function (shiftAmount) {
    if (!canShiftByJsNum(shiftAmount)) {
      throw new Error("Shift amount " + String(shiftAmount) + " is too large for shifting.");
    }
    const numShift = +shiftAmount;
    if (numShift < 0) return this.leftShiftBits(-numShift); // Delegate to left shift for negative shifts

    if (this.isZeroNum()) return this;

    let result = this;
    let remainingShift = numShift;
    let divModResult;

    // Perform shifts in chunks
    while (remainingShift >= chunkPowersCount) {
      // If result becomes 0 or -1, further shifts don't change
      if (result.isZeroNum() || (result.isNegativeNum() && result.isOneOrMinusOne())) return result;
      divModResult = flexibleDivideAndMod(result, maxChunkPower);
      // For right shift, if remainder is negative and non-zero, adjust quotient (floor division)
      result = divModResult[1].isNegativeNum() && !divModResult[1].isZeroNum() ? divModResult[0].decrement() : divModResult[0];
      remainingShift -= chunkPowersCount - 1;
    }
    divModResult = flexibleDivideAndMod(result, chunkPowersOfTwo[remainingShift]);
    return divModResult[1].isNegativeNum() && !divModResult[1].isZeroNum() ? divModResult[0].decrement() : divModResult[0];
  };
  TinyNum.prototype.rightShiftBits = LargeNum.prototype.rightShiftBits;

  // Masks for rough LOB calculation
  const LOW_ORDER_BIT_MASK_JS = 1 << 30; // 2^30
  const LOW_ORDER_BIT_MASK_BIG = (CHUNK_SIZE & -CHUNK_SIZE) * (CHUNK_SIZE & -CHUNK_SIZE) | LOW_ORDER_BIT_MASK_JS;

  /**
   * Calculates a rough estimate of the lowest order bit (LOB) for GCD optimization.
   * Not perfectly accurate for all cases but sufficient for GCD.
   * @param {LargeNum|TinyNum} num
   * @returns {number}
   */
  function getRoughLowOrderBit(num) {
    const val = num.val;
    // For TinyNum, use JS bitwise ops. For LargeNum, use the first chunk.
    const x = typeof val === "number" ? val | LOW_ORDER_BIT_MASK_JS : val[0] + val[1] * CHUNK_SIZE | LOW_ORDER_BIT_MASK_BIG;
    return x & -x; // Returns the lowest set bit (e.g., 8 for 8, 2 for 10)
  }

  /**
   * Performs a bitwise operation on two large numbers.
   * @param {LargeNum|TinyNum} x
   * @param {LargeNum|TinyNum} y
   * @param {function(number, number): number} bitwiseFn The bitwise operation function (e.g., `(a,b) => a & b`).
   * @returns {LargeNum|TinyNum}
   */
  function performBitwiseOp(x, y, bitwiseFn) {
    y = parseInput(y);

    // Handle two's complement representation for negative numbers
    const xIsNegative = x.isNegativeNum();
    const yIsNegative = y.isNegativeNum();

    // Convert to "positive" two's complement representation (if negative, it's ~N + 1)
    let xRemaining = xIsNegative ? x.bitwiseNot() : x;
    let yRemaining = yIsNegative ? y.bitwiseNot() : y;

    const resultChunks = [];
    let xDigit = 0,
      yDigit = 0;
    let xDivMod = null,
      yDivMod = null;

    // Process chunks from least significant to most significant using maxChunkPower
    while (!xRemaining.isZeroNum() || !yRemaining.isZeroNum()) {
      xDivMod = flexibleDivideAndMod(xRemaining, maxChunkPower);
      xDigit = xDivMod[1].toNativeNumber();
      if (xIsNegative) {
        xDigit = maxChunkPower - 1 - xDigit; // Invert bits for two's complement
      }

      yDivMod = flexibleDivideAndMod(yRemaining, maxChunkPower);
      yDigit = yDivMod[1].toNativeNumber();
      if (yIsNegative) {
        yDigit = maxChunkPower - 1 - yDigit; // Invert bits for two's complement
      }

      xRemaining = xDivMod[0];
      yRemaining = yDivMod[0];
      resultChunks.push(bitwiseFn(xDigit, yDigit));
    }

    // Determine the sign of the result based on the bitwise operation on the sign bits
    const finalSignBitResult = bitwiseFn(xIsNegative ? 1 : 0, yIsNegative ? 1 : 0);
    let finalResult = finalSignBitResult !== 0 ? largeNum(-1) : largeNum(0);

    // Reconstruct the number from result chunks
    for (let i = resultChunks.length - 1; i >= 0; --i) {
      finalResult = finalResult.multiply(maxChunkPower).add(largeNum(resultChunks[i]));
    }

    return finalResult;
  }

  LargeNum.prototype.bitwiseNot = function () {
    return this.flipSign().decrement(); // ~N = -N - 1
  };
  TinyNum.prototype.bitwiseNot = LargeNum.prototype.bitwiseNot;

  LargeNum.prototype.bitwiseAnd = function (operand) {
    return performBitwiseOp(this, operand, (a, b) => a & b);
  };
  TinyNum.prototype.bitwiseAnd = LargeNum.prototype.bitwiseAnd;

  LargeNum.prototype.bitwiseOr = function (operand) {
    return performBitwiseOp(this, operand, (a, b) => a | b);
  };
  TinyNum.prototype.bitwiseOr = LargeNum.prototype.bitwiseOr;

  LargeNum.prototype.bitwiseXor = function (operand) {
    return performBitwiseOp(this, operand, (a, b) => a ^ b);
  };
  TinyNum.prototype.bitwiseXor = LargeNum.prototype.bitwiseXor;

  /**
   * Calculates the integer logarithm of a number to a given base.
   * @param {LargeNum|TinyNum} value
   * @param {LargeNum|TinyNum} base
   * @returns {{p: LargeNum|TinyNum, e: number}} Returns {p: largest power of base <= value, e: exponent}
   */
  function calcIntegerLog(value, base) {
    // Base case for recursion: if base > value, then log is 0 and power is 1
    if (base.compareWith(value) > 0) {
      return {
        p: NumFactory.ONE_VAL,
        e: 0,
      };
    }

    // Recursive step: log_b(N) = 2 * log_b^2(N)
    const recursiveResult = calcIntegerLog(value, base.square());
    let power = recursiveResult.p;
    let exponent = recursiveResult.e;

    // Check if base * power is still <= value
    const testPower = power.multiply(base);
    if (testPower.compareWith(value) <= 0) {
      return {
        p: testPower,
        e: exponent * 2 + 1,
      };
    }
    return {
      p: power,
      e: exponent * 2,
    };
  }

  LargeNum.prototype.getBitLength = function () {
    let num = this;
    if (num.isNegativeNum()) {
      num = num.flipSign().decrement(); // Bit length of negative numbers: ~N + 1
    }
    if (num.isZeroNum()) {
      return NumFactory.ZERO_VAL;
    }
    // Calculate log base 2 and add 1 (for 0-indexed bits)
    return largeNum(calcIntegerLog(num, largeNum(2)).e).add(NumFactory.ONE_VAL);
  };
  TinyNum.prototype.getBitLength = LargeNum.prototype.getBitLength;

  /**
   * Returns the maximum of two large numbers.
   * @param {any} val1
   * @param {any} val2
   * @returns {LargeNum|TinyNum}
   */
  function getMaximum(val1, val2) {
    const num1 = parseInput(val1);
    const num2 = parseInput(val2);
    return num1.isGreater(num2) ? num1 : num2;
  }

  /**
   * Returns the minimum of two large numbers.
   * @param {any} val1
   * @param {any} val2
   * @returns {LargeNum|TinyNum}
   */
  function getMinimum(val1, val2) {
    const num1 = parseInput(val1);
    const num2 = parseInput(val2);
    return num1.isLesser(num2) ? num1 : num2;
  }

  /**
   * Computes the greatest common divisor (GCD) of two large numbers using Binary GCD algorithm.
   * @param {any} val1
   * @param {any} val2
   * @returns {LargeNum|TinyNum}
   */
  function greatestCommonDivisor(val1, val2) {
    let num1 = parseInput(val1).absoluteValue();
    let num2 = parseInput(val2).absoluteValue();

    if (num1.isEqualTo(num2)) return num1;
    if (num1.isZeroNum()) return num2;
    if (num2.isZeroNum()) return num1;

    let commonFactors = NumFactory.ONE_VAL;
    let lob1, lob2;

    // Remove common factors of 2
    while (num1.isEvenlyDivisible() && num2.isEvenlyDivisible()) {
      lob1 = getRoughLowOrderBit(num1);
      lob2 = getRoughLowOrderBit(num2);
      const minLob = Math.min(lob1, lob2);
      num1 = num1.getQuotient(minLob);
      num2 = num2.getQuotient(minLob);
      commonFactors = commonFactors.multiply(minLob);
    }

    // Remove factors of 2 from num1
    while (num1.isEvenlyDivisible()) {
      num1 = num1.getQuotient(getRoughLowOrderBit(num1));
    }

    // Binary GCD loop (Euclidean algorithm variant for even numbers)
    do {
      while (num2.isEvenlyDivisible()) {
        num2 = num2.getQuotient(getRoughLowOrderBit(num2));
      }
      if (num1.isGreater(num2)) {
        let temp = num2;
        num2 = num1;
        num1 = temp;
      }
      num2 = num2.subtract(num1);
    } while (!num2.isZeroNum());

    return commonFactors.isOneOrMinusOne() ? num1 : num1.multiply(commonFactors);
  }

  /**
   * Computes the least common multiple (LCM) of two large numbers.
   * @param {any} val1
   * @param {any} val2
   * @returns {LargeNum|TinyNum}
   */
  function leastCommonMultiple(val1, val2) {
    const num1 = parseInput(val1).absoluteValue();
    const num2 = parseInput(val2).absoluteValue();
    if (num1.isZeroNum() || num2.isZeroNum()) return NumFactory.ZERO_VAL; // LCM(0, N) = 0
    return num1.getQuotient(greatestCommonDivisor(num1, num2)).multiply(num2);
  }

  /**
   * Generates a random large number between two given bounds (inclusive).
   * @param {any} lowerBound
   * @param {any} upperBound
   * @returns {LargeNum|TinyNum}
   */
  function randomBetween(lowerBound, upperBound) {
    const low = getMinimum(lowerBound, upperBound);
    const high = getMaximum(lowerBound, upperBound);
    const range = high.subtract(low).add(NumFactory.ONE_VAL);

    if (range.isTiny) {
      return low.add(Math.floor(Math.random() * range.val));
    }

    const rangeChunks = range.val;
    const len = rangeChunks.length;
    const resultChunks = [];
    let restricted = true; // True if the generated digits must be less than or equal to rangeChunks
    let digit;

    for (let i = len - 1; i >= 0; --i) {
      const topLimit = restricted ? rangeChunks[i] : CHUNK_SIZE;
      digit = intPart(Math.random() * (topLimit + 1)); // Random digit up to topLimit (inclusive)
      resultChunks.unshift(digit);
      if (digit < topLimit) restricted = false; // If digit is less than topLimit, subsequent digits can be anything
    }

    const randomOffset = chunksToJsNum(resultChunks);
    return low.add(typeof randomOffset === "number" ? new TinyNum(randomOffset) : new LargeNum(randomOffset, false));
  }

  /**
   * Parses a string representation of a number in a given base.
   * @param {string} text The string to parse.
   * @param {any} base The base (number or largeNum instance).
   * @returns {LargeNum|TinyNum}
   */
  const parseStringWithBase = function (text, base) {
    const inputLength = text.length;
    const baseNum = parseInput(base);
    const absBase = baseNum.absoluteValue();

    // Basic validation of characters for the given base
    for (let i = 0; i < inputLength; ++i) {
      const char = text[i].toLowerCase();
      if (char === "-") continue; // Allow negative sign at start

      // Check if character is a valid digit in the given base
      if (/[a-z0-9]/.test(char)) {
        if (/[0-9]/.test(char)) {
          if (largeNum(+char).isGreaterOrEqual(absBase)) {
            // Special case for base 1, '1' is valid
            if (!(char === "1" && absBase.isEqualTo(NumFactory.ONE_VAL))) {
              throw new Error(`'${char}' is not a valid digit in base ${base}.`);
            }
          }
        } else if (char.charCodeAt(0) - 87 >= absBase.toNativeNumber()) {
          // 'a' is 10, 'b' is 11, etc.
          throw new Error(`'${char}' is not a valid digit in base ${base}.`);
        }
      }
    }

    // Optimization for small bases and small numbers that fit JS parseInt
    if (baseNum.isGreaterOrEqual(NumFactory.cachedTinyNums[2]) && baseNum.isLesserOrEqual(NumFactory.cachedTinyNums[36])) {
      // Check if the number of digits is small enough for native parseInt
      if (inputLength <= LOG_JS_SAFE_MAX / Math.log(baseNum.toNativeNumber())) {
        const result = parseInt(text, baseNum.toNativeNumber());
        if (isNaN(result)) {
          throw new Error(`Invalid number string: "${text}" for base ${base}.`);
        }
        return new TinyNum(result);
      }
    }

    const digits = [];
    const isNegative = text[0] === "-";
    let charCode;

    for (let i = isNegative ? 1 : 0; i < text.length; ++i) {
      const char = text[i].toLowerCase();
      charCode = char.charCodeAt(0);
      if (48 <= charCode && charCode <= 57) {
        digits.push(parseInput(char)); // 0-9
      } else if (97 <= charCode && charCode <= 122) {
        digits.push(parseInput(charCode - 87)); // a-z (10-35)
      } else if (char === "<") {
        // Custom digit format for bases > 36 (e.g., <100>)
        const startIndex = i;
        do {
          i++;
        } while (i < text.length && text[i] !== ">");
        if (i >= text.length) throw new Error("Unclosed custom digit in base string.");
        digits.push(parseInput(text.slice(startIndex + 1, i)));
      } else {
        throw new Error(`'${char}' is not a valid character in base ${base}.`);
      }
    }
    return constructFromChunkArray(digits, baseNum, isNegative);
  };

  /**
   * Constructs a large number from an array of digits and a base.
   * @param {Array<LargeNum|TinyNum>} digitNums Array of digit values as largeNum instances.
   * @param {LargeNum|TinyNum} base The base of the number.
   * @param {boolean} isNegative Sign of the number.
   * @returns {LargeNum|TinyNum}
   */
  function constructFromChunkArray(digitNums, base, isNegative) {
    let result = NumFactory.ZERO_VAL;
    let powerOfBase = NumFactory.ONE_VAL;

    // Horner's method: sum(d_i * base^i)
    for (let i = digitNums.length - 1; i >= 0; --i) {
      result = result.add(digitNums[i].times(powerOfBase));
      powerOfBase = powerOfBase.times(base);
    }
    return isNegative ? result.flipSign() : result;
  }

  /**
   * Converts a digit value to its string representation (0-9, a-z, or <N>).
   * @param {number} digit
   * @returns {string}
   */
  function chunkToStringChar(digit) {
    if (digit <= 35) {
      return "0123456789abcdefghijklmnopqrstuvwxyz".charAt(digit);
    }
    return `<${digit}>`; // For digits > 35
  }

  /**
   * Converts a large number to its representation in a given base, as an array of digits.
   * @param {LargeNum|TinyNum} num
   * @param {LargeNum|TinyNum} base
   * @returns {{value: number[], isNegative: boolean}} Object containing digit array and sign.
   */
  function convertToBaseChunks(num, base) {
    const baseNum = parseInput(base);
    if (baseNum.isZeroNum()) {
      if (num.isZeroNum()) return {
        value: [0],
        isNegative: false
      };
      throw new Error("Cannot convert nonzero numbers to base 0.");
    }
    if (baseNum.isEqualTo(NumFactory.ONE_VAL)) {
      if (num.isZeroNum()) return {
        value: [0],
        isNegative: false
      };
      const onesArray = Array(num.absoluteValue().toNativeNumber()).fill(1); // Array of 1s
      return {
        value: onesArray,
        isNegative: num.isNegativeNum()
      };
    }
    if (baseNum.isEqualTo(NumFactory.MINUS_ONE_VAL)) {
      // Special handling for base -1 (alternating base system)
      if (num.isZeroNum()) return {
        value: [0],
        isNegative: false
      };
      // This is a complex conversion for base -1, preserving original logic
      if (num.isNegativeNum()) {
        // For negative numbers, convert -n to base -1
        // Example: -3 in base -1 is [1,1,0,1]
        let currentNum = num.absoluteValue();
        const resultDigits = [];
        while (!currentNum.isZeroNum()) {
          let rem = currentNum.mod(NumFactory.cachedTinyNums[2]); // remainder 0 or 1
          currentNum = currentNum.getQuotient(NumFactory.cachedTinyNums[2]);
          if (rem.isZeroNum()) {
            resultDigits.push(0);
          } else {
            resultDigits.push(1);
            currentNum = currentNum.increment();
          }
        }
        return { value: resultDigits.reverse(), isNegative: false }; // Base -1 doesn't use explicit negative sign
      } else {
        // For positive numbers, convert n to base -1
        // Example: 3 in base -1 is [1,1,1]
        let currentNum = num;
        const resultDigits = [];
        while (!currentNum.isZeroNum()) {
          let rem = currentNum.mod(NumFactory.cachedTinyNums[2]);
          currentNum = currentNum.getQuotient(NumFactory.cachedTinyNums[2]);
          if (rem.isZeroNum()) {
            resultDigits.push(0);
          } else {
            resultDigits.push(1);
            currentNum = currentNum.decrement();
          }
        }
        return { value: resultDigits.reverse(), isNegative: false };
      }
    }

    let isResultNegative = false;
    let currentNum = num;
    if (num.isNegativeNum() && baseNum.isPositiveNum()) {
      isResultNegative = true;
      currentNum = num.absoluteValue();
    }

    const outputDigits = [];
    let divModResult;
    while (currentNum.isNegativeNum() || currentNum.compareAbsoluteChunks(baseNum) >= 0) {
      divModResult = currentNum.getDivMod(baseNum);
      currentNum = divModResult.quotient;
      let digit = divModResult.remainder;

      // Handle negative remainders for non-standard bases (e.g., negative base)
      if (digit.isNegativeNum() && !digit.isZeroNum()) {
        digit = baseNum.minus(digit).absoluteValue(); // digit = abs(base - abs(digit))
        currentNum = currentNum.increment();
      }
      outputDigits.push(digit.toNativeNumber());
    }
    outputDigits.push(currentNum.toNativeNumber()); // Add the last quotient

    return {
      value: outputDigits.reverse(),
      isNegative: isResultNegative,
    };
  }

  /**
   * Converts a large number to its string representation in a given base.
   * @param {LargeNum|TinyNum} num
   * @param {any} base
   * @returns {string}
   */
  function toBaseStringRepresentation(num, base) {
    const {
      value: digitArray,
      isNegative
    } = convertToBaseChunks(num, base);
    return (isNegative ? "-" : "") + digitArray.map(chunkToStringChar).join("");
  }

  LargeNum.prototype.toChunkArray = function (base) {
    return convertToBaseChunks(this, base);
  };
  TinyNum.prototype.toChunkArray = function (base) {
    return convertToBaseChunks(this, base);
  };

  LargeNum.prototype.toBase10String = function (radix) {
    if (radix === undefined) radix = 10;
    if (radix !== 10) return toBaseStringRepresentation(this, radix);

    const chunkArray = this.val;
    let len = chunkArray.length;
    let resultString = String(chunkArray[--len]); // Most significant chunk
    const zeroPad = "0000000"; // For padding chunks to 7 digits

    while (len-- > 0) {
      let digitString = String(chunkArray[len]);
      resultString += zeroPad.slice(digitString.length) + digitString;
    }
    const signPrefix = this.isNegative ? "-" : "";
    return signPrefix + resultString;
  };

  TinyNum.prototype.toBase10String = function (radix) {
    if (radix === undefined) radix = 10;
    if (radix !== 10) return toBaseStringRepresentation(this, radix);
    return String(this.val);
  };

  LargeNum.prototype.toJsonString = TinyNum.prototype.toJsonString = function () {
    return this.toBase10String();
  };

  LargeNum.prototype.valueOfJsNum = function () {
    return parseInt(this.toBase10String(), 10);
  };
  LargeNum.prototype.toNativeNumber = LargeNum.prototype.valueOfJsNum;

  TinyNum.prototype.valueOfJsNum = function () {
    return this.val;
  };
  TinyNum.prototype.toNativeNumber = TinyNum.prototype.valueOfJsNum;

  /**
   * Parses a string representation of a large number.
   * Handles scientific notation and decimal points (for exponent calculation).
   * @param {string} strVal
   * @returns {LargeNum|TinyNum}
   */
  function parseStringInput(strVal) {
    // Check if it's a precise JS number first for efficiency
    if (fitsJsNumber(+strVal)) {
      const num = +strVal;
      if (num === intPart(num)) return new TinyNum(num);
      throw new Error(`Invalid integer: "${strVal}" contains a fractional part.`);
    }

    let isNegative = strVal[0] === "-";
    if (isNegative) strVal = strVal.slice(1);

    const parts = strVal.split(/e/i); // Split by 'e' for scientific notation
    if (parts.length > 2) {
      throw new Error(`Invalid integer: "${strVal}" contains multiple 'e' characters.`);
    }

    if (parts.length === 2) {
      // Handle scientific notation (e.g., "1.23e5")
      let exponentStr = parts[1];
      if (exponentStr[0] === "+") exponentStr = exponentStr.slice(1); // Remove optional '+'
      const exponentVal = +exponentStr;

      if (exponentVal !== intPart(exponentVal) || !fitsJsNumber(exponentVal)) {
        throw new Error(`Invalid integer: "${exponentStr}" is not a valid integer exponent.`);
      }

      let mantissa = parts[0];
      const decimalPointIndex = mantissa.indexOf(".");
      if (decimalPointIndex >= 0) {
        exponentVal -= mantissa.length - decimalPointIndex - 1; // Adjust exponent for decimal places
        mantissa = mantissa.slice(0, decimalPointIndex) + mantissa.slice(decimalPointIndex + 1);
      }

      if (exponentVal < 0) {
        throw new Error(`Cannot parse integer with negative exponent part: "${strVal}" would result in a fractional number.`);
      }

      mantissa += "0".repeat(exponentVal); // Append zeros for positive exponent
      strVal = mantissa;
    }

    // Validate remaining string is purely digits
    if (!/^([0-9][0-9]*)$/.test(strVal)) {
      throw new Error(`Invalid integer format: "${strVal}" contains non-digit characters.`);
    }

    // Convert string to chunk array
    const resultChunks = [];
    let currentMax = strVal.length;
    const chunkSize = CHUNK_DIGITS; // 7 digits per chunk
    let currentMin = currentMax - chunkSize;

    while (currentMax > 0) {
      if (currentMin < 0) currentMin = 0;
      resultChunks.push(+strVal.slice(currentMin, currentMax));
      currentMax = currentMin;
      currentMin -= chunkSize;
    }
    removeLeadingZeros(resultChunks);
    return new LargeNum(resultChunks, isNegative);
  }

  /**
   * Parses a JavaScript number input.
   * @param {number} numVal
   * @returns {TinyNum|LargeNum}
   */
  function parseNumberInput(numVal) {
    if (fitsJsNumber(numVal)) {
      if (numVal !== intPart(numVal)) {
        throw new Error(`${numVal} is not an integer.`);
      }
      return new TinyNum(numVal);
    }
    // If number is too large for JS, convert to string and parse
    return parseStringInput(numVal.toString());
  }

  /**
   * Normalizes various input types (number, string, LargeNum/TinyNum) into a LargeNum or TinyNum instance.
   * @param {any} input The value to parse.
   * @returns {LargeNum|TinyNum}
   */
  function normalizeInput(input) {
    if (typeof input === "number") {
      return parseNumberInput(input);
    }
    if (typeof input === "string") {
      return parseStringInput(input);
    }
    // If already a LargeNum or TinyNum, return it directly
    if (input instanceof LargeNum || input instanceof TinyNum) {
      return input;
    }
    // Fallback for other types or invalid inputs
    throw new Error(`Invalid input type for largeNum: ${typeof input} (${input})`);
  }

  // Pre-cache TinyNum instances for small integers (0-999)
  NumFactory.cachedTinyNums = {};
  for (let i = 0; i < 1e3; ++i) {
    NumFactory.cachedTinyNums[i] = new TinyNum(i);
    if (i > 0) NumFactory.cachedTinyNums[-i] = new TinyNum(-i);
  }

  // Assign common constants and utility methods to the factory
  NumFactory.ONE = NumFactory.ONE_VAL = NumFactory.cachedTinyNums[1];
  NumFactory.ZERO = NumFactory.ZERO_VAL = NumFactory.cachedTinyNums[0];
  NumFactory.NEG_ONE = NumFactory.MINUS_ONE_VAL = NumFactory.cachedTinyNums[-1];

  NumFactory.max = getMaximum;
  NumFactory.min = getMinimum;
  NumFactory.gcd = greatestCommonDivisor;
  NumFactory.lcm = leastCommonMultiple;
  NumFactory.isBigIntInstance = function (obj) {
    return obj instanceof LargeNum || obj instanceof TinyNum;
  };
  NumFactory.randomBetween = randomBetween;
  NumFactory.fromChunkArray = function (digitArray, base, isNegative) {
    // Map input digits to NumFactory instances
    const parsedDigits = digitArray.map(normalizeInput);
    const parsedBase = normalizeInput(base || 10);
    return constructFromChunkArray(parsedDigits, parsedBase, isNegative);
  };

  return NumFactory;
})();

const MODULO_CONSTANT = 998244353;

/**
 * Main function to solve the problem.
 * Reads input, processes it, and prints the result.
 * @param {string} rawInput The raw string input from stdin.
 */
const main = (rawInput) => {
  // Split input into lines and trim each line
  const inputLines = rawInput.split("\n").map((line) => line.trim());

  // Validate input lines existence
  if (inputLines.length < 2) {
    console.log(0);
    return;
  }

  // Parse node count and depth array
  const nodeCount = parseInt(inputLines[0], 10);
  const depthsArray = inputLines[1].split(" ").map((val) => parseInt(val, 10));

  // Basic input validation
  if (isNaN(nodeCount) || nodeCount < 1 || depthsArray.some(isNaN)) {
    console.log(0);
    return;
  }
  if (depthsArray.length !== nodeCount) {
    console.log(0);
    return;
  }

  // Determine the maximum depth in the tree
  const maxDepth = Math.max(...depthsArray);

  // Edge case: Root node must be at depth 0
  if (depthsArray[0] !== 0) {
    console.log(0);
    return;
  }

  // Frequency map to store counts of nodes at each depth
  // Initialize with the root node at depth 0
  const depthFrequencies = {
    0: 1
  };

  // Populate frequency map for other nodes
  for (let i = 1; i < nodeCount; ++i) {
    const currentDepth = depthsArray[i];
    // Edge case: No node should be at depth 0 except the root
    if (currentDepth === 0) {
      console.log(0);
      return;
    }

    // Increment frequency for current depth
    if (depthFrequencies[currentDepth]) {
      depthFrequencies[currentDepth]++;
    } else {
      depthFrequencies[currentDepth] = 1;
    }
  }

  // Initialize total ways to 1
  let totalWays = largeNum(1);
  const moduloNum = largeNum(MODULO_CONSTANT);

  // Calculate total ways based on parent-child relationships
  for (let currentLevel = 1; currentLevel <= maxDepth; ++currentLevel) {
    const parentsAtPrevLevel = depthFrequencies[currentLevel - 1];
    const childrenAtCurrentLevel = depthFrequencies[currentLevel];

    // If any level is missing nodes or a parent level is missing, it's an invalid tree
    if (parentsAtPrevLevel === undefined || childrenAtCurrentLevel === undefined) {
      console.log(0);
      return;
    }

    // Number of ways to assign parents for nodes at currentLevel:
    // (count of parents at (currentLevel-1)) ^ (count of children at currentLevel)
    const waysForCurrentLevel = largeNum(parentsAtPrevLevel).power(childrenAtCurrentLevel);

    // Multiply into total ways, taking modulo at each step to prevent overflow
    totalWays = totalWays.multiply(waysForCurrentLevel).mod(moduloNum);
  }

  // Output the final result modulo 998244353
  console.log(totalWays.toBase10String());
};

// Read input from standard input and execute main function
main(require("fs").readFileSync("/dev/stdin", "utf8"));