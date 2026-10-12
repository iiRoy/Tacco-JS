var hugeNum = (function(void0) {
  "use strict";

  // Configuration constants for the number representation
  var CHUNK_SIZE = 1e7; // Base for our large number system (10^7)
  var DIGITS_PER_CHUNK = 7; // Number of decimal digits per chunk
  var JS_MAX_SAFE_INTEGER = 9007199254740992; // 2^53, maximum integer JavaScript can precisely represent
  var JS_MAX_SAFE_INT_CHUNKS = jsNumToChunks(JS_MAX_SAFE_INTEGER); // JS_MAX_SAFE_INTEGER broken into chunks
  var LOG_JS_MAX_SAFE_INTEGER = Math.log(JS_MAX_SAFE_INTEGER); // Log for optimization

  // Base constructor for all numeric values
  function NumValue(val, baseRadix) {
    if (typeof val === "undefined") {
      return NumValue[0]; // Return zero if no value is provided
    }
    // Handle specific radix parsing
    if (typeof baseRadix !== "undefined") {
      // If radix is 10, parse as a standard number, otherwise parse by base
      return +baseRadix === 10 ? parseInputToNumValue(val) : parseByBase(val, baseRadix);
    }
    return parseInputToNumValue(val);
  }

  // Constructor for large numbers (arrays of chunks)
  function LargeNumber(chunkArray, isNegative) {
    this.chunkData = chunkArray;
    this.isNegative = isNegative;
    this.isSmall = false; // Flag to distinguish from TinyNumber
  }
  LargeNumber.prototype = Object.create(NumValue.prototype); // Inherit from NumValue

  // Constructor for small numbers (native JavaScript numbers)
  function TinyNumber(value) {
    this.value = value;
    this.isNegative = value < 0;
    this.isSmall = true; // Flag to distinguish from LargeNumber
  }
  TinyNumber.prototype = Object.create(NumValue.prototype); // Inherit from NumValue

  // Checks if a number can be precisely represented by JavaScript's native number type
  function isJsPrecise(n) {
    return -JS_MAX_SAFE_INTEGER < n && n < JS_MAX_SAFE_INTEGER;
  }

  // Converts a native JavaScript number into an array of chunks
  function jsNumToChunks(n) {
    if (n < CHUNK_SIZE) {
      return [n];
    }
    if (n < CHUNK_SIZE * CHUNK_SIZE) {
      return [n % CHUNK_SIZE, Math.floor(n / CHUNK_SIZE)];
    }
    return [n % CHUNK_SIZE, Math.floor(n / CHUNK_SIZE) % CHUNK_SIZE, Math.floor(n / (CHUNK_SIZE * CHUNK_SIZE))];
  }

  // Converts an array of chunks back to a native JavaScript number if possible
  function chunksToJsNum(arr) {
    normalizeChunks(arr); // Remove leading zeros
    var len = arr.length;
    // Only convert if it fits within JS_MAX_SAFE_INTEGER and has few chunks
    if (len < 4 && compareAbsoluteChunks(arr, JS_MAX_SAFE_INT_CHUNKS) < 0) {
      switch (len) {
        case 0:
          return 0;
        case 1:
          return arr[0];
        case 2:
          return arr[0] + arr[1] * CHUNK_SIZE;
        case 3:
          return arr[0] + (arr[1] + arr[2] * CHUNK_SIZE) * CHUNK_SIZE;
        default: // Should not happen with len < 4
          return arr;
      }
    }
    return arr; // If too large, return the chunk array
  }

  // Removes trailing zero chunks from an array
  function normalizeChunks(chunkArr) {
    var i = chunkArr.length;
    // Decrement i until a non-zero chunk is found or array is empty
    while (i > 0 && chunkArr[--i] === 0);
    chunkArr.length = i + 1; // Truncate the array
  }

  // Creates a new array of a given length, filled with zeros
  function makeZeroFilledArray(len) {
    var arr = new Array(len);
    for (var k = 0; k < len; k++) {
      arr[k] = 0;
    }
    return arr;
  }

  // Truncates a number (floor for positive, ceil for negative)
  function floorOrCeil(n) {
    return n > 0 ? Math.floor(n) : Math.ceil(n);
  }

  // Adds two chunk arrays (a and b), assuming a.length >= b.length
  function sumChunks(a, b) {
    var lenA = a.length,
      lenB = b.length;
    var resultChunks = new Array(lenA);
    var currentCarry = 0;
    var tempSum;

    // Add corresponding chunks up to the length of the shorter array
    for (var k = 0; k < lenB; k++) {
      tempSum = a[k] + b[k] + currentCarry;
      currentCarry = tempSum >= CHUNK_SIZE ? 1 : 0;
      resultChunks[k] = tempSum - currentCarry * CHUNK_SIZE;
    }
    // Add remaining chunks of the longer array with carry
    while (k < lenA) {
      tempSum = a[k] + currentCarry;
      currentCarry = tempSum === CHUNK_SIZE ? 1 : 0;
      resultChunks[k++] = tempSum - currentCarry * CHUNK_SIZE;
    }
    // If there's a final carry, append it
    if (currentCarry > 0) {
      resultChunks.push(currentCarry);
    }
    return resultChunks;
  }

  // Adds two chunk arrays, handling different lengths by ensuring the longer is 'a'
  function sumChunksAnyLength(a, b) {
    return a.length >= b.length ? sumChunks(a, b) : sumChunks(b, a);
  }

  // Adds a small integer (carry) to a chunk array, used for adding/subtracting 1
  function sumChunksWithCarry(chunkArr, smallVal) {
    var len = chunkArr.length;
    var result = new Array(len);
    var currentCarry = smallVal; // Initial carry
    var tempSum;

    for (var k = 0; k < len; k++) {
      tempSum = chunkArr[k] + currentCarry;
      currentCarry = Math.floor(tempSum / CHUNK_SIZE);
      result[k] = tempSum % CHUNK_SIZE; // Remainder is the chunk value
    }
    // Append any remaining carry
    while (currentCarry > 0) {
      result[k++] = currentCarry % CHUNK_SIZE;
      currentCarry = Math.floor(currentCarry / CHUNK_SIZE);
    }
    return result;
  }

  // Prototype methods for LargeNumber
  LargeNumber.prototype.add = function(otherNum) {
    var n = parseInputToNumValue(otherNum);
    // If signs are different, perform subtraction
    if (this.isNegative !== n.isNegative) {
      return this.subtract(n.negate());
    }
    var currentVal = this.chunkData,
      otherVal = n.chunkData;
    // If the other number is small, convert its absolute value to chunks and add
    if (n.isSmall) {
      return new LargeNumber(sumChunksWithCarry(currentVal, Math.abs(otherVal)), this.isNegative);
    }
    return new LargeNumber(sumChunksAnyLength(currentVal, otherVal), this.isNegative);
  };
  LargeNumber.prototype.plus = LargeNumber.prototype.add; // Alias for add

  // Prototype methods for TinyNumber
  TinyNumber.prototype.add = function(otherNum) {
    var n = parseInputToNumValue(otherNum);
    var thisVal = this.value;
    // If signs are different, perform subtraction
    if ((thisVal < 0) !== n.isNegative) {
      return this.subtract(n.negate());
    }
    var otherVal = n.value;
    // If both are small, try native addition
    if (n.isSmall) {
      if (isJsPrecise(thisVal + otherVal)) {
        return new TinyNumber(thisVal + otherVal);
      }
      otherVal = jsNumToChunks(Math.abs(otherVal)); // Convert other to chunks if sum is too large
    }
    // Convert current value to chunks and use sumChunksWithCarry
    return new LargeNumber(sumChunksWithCarry(otherVal, Math.abs(thisVal)), thisVal < 0);
  };
  TinyNumber.prototype.plus = TinyNumber.prototype.add; // Alias for add

  // Subtracts chunk array 'b' from 'a', assuming a >= b (absolute value)
  function diffChunks(a, b) {
    var lenA = a.length,
      lenB = b.length;
    var resultChunks = new Array(lenA);
    var currentBorrow = 0;
    var difference;

    // Subtract corresponding chunks
    for (var k = 0; k < lenB; k++) {
      difference = a[k] - currentBorrow - b[k];
      if (difference < 0) {
        difference += CHUNK_SIZE;
        currentBorrow = 1;
      } else {
        currentBorrow = 0;
      }
      resultChunks[k] = difference;
    }

    // Propagate borrow through remaining chunks of 'a'
    for (k = lenB; k < lenA; k++) {
      difference = a[k] - currentBorrow;
      if (difference < 0) {
        difference += CHUNK_SIZE;
      } else {
        resultChunks[k++] = difference; // If no borrow, can stop early
        break;
      }
      resultChunks[k] = difference;
    }
    // Copy remaining chunks if loop broke early
    for (; k < lenA; k++) {
      resultChunks[k] = a[k];
    }

    normalizeChunks(resultChunks);
    return resultChunks;
  }

  // Subtracts two chunk arrays, determining actual sign and order based on absolute values
  function diffChunksAnyLength(a, b, originalSign) {
    var value;
    var finalSign = originalSign; // Assume original sign initially

    if (compareAbsoluteChunks(a, b) >= 0) {
      value = diffChunks(a, b);
    } else {
      value = diffChunks(b, a);
      finalSign = !originalSign; // Flip sign if b was larger
    }

    // Convert to small number if possible
    value = chunksToJsNum(value);
    if (typeof value === "number") {
      return new TinyNumber(finalSign ? -value : value);
    }
    return new LargeNumber(value, finalSign);
  }

  // Subtracts a small integer from a chunk array
  function diffChunksWithBorrow(chunkArr, smallVal, originalSign) {
    var len = chunkArr.length;
    var result = new Array(len);
    var currentBorrow = -smallVal; // Negative value acts as borrow
    var difference;

    for (var k = 0; k < len; k++) {
      difference = chunkArr[k] + currentBorrow;
      currentBorrow = Math.floor(difference / CHUNK_SIZE);
      // Ensure difference is positive (within chunk range)
      result[k] = difference < 0 ? difference + CHUNK_SIZE : difference;
    }

    result = chunksToJsNum(result); // Try to convert back to small
    if (typeof result === "number") {
      return new TinyNumber(originalSign ? -result : result);
    }
    return new LargeNumber(result, originalSign);
  }

  LargeNumber.prototype.subtract = function(otherNum) {
    var n = parseInputToNumValue(otherNum);
    // If signs are different, convert to addition
    if (this.isNegative !== n.isNegative) {
      return this.add(n.negate());
    }
    var thisVal = this.chunkData,
      otherVal = n.chunkData;
    // If other number is small, use specialized subtraction
    if (n.isSmall) {
      return diffChunksWithBorrow(thisVal, Math.abs(otherVal), this.isNegative);
    }
    return diffChunksAnyLength(thisVal, otherVal, this.isNegative);
  };
  LargeNumber.prototype.minus = LargeNumber.prototype.subtract; // Alias for subtract

  TinyNumber.prototype.subtract = function(otherNum) {
    var n = parseInputToNumValue(otherNum);
    var thisVal = this.value;
    // If signs are different, convert to addition
    if ((thisVal < 0) !== n.isNegative) {
      return this.add(n.negate());
    }
    var otherVal = n.value;
    // If both are small, try native subtraction
    if (n.isSmall) {
      return new TinyNumber(thisVal - otherVal);
    }
    // If other is large, swap order and flip sign
    return diffChunksWithBorrow(otherVal, Math.abs(thisVal), thisVal >= 0);
  };
  TinyNumber.prototype.minus = TinyNumber.prototype.subtract; // Alias for subtract

  LargeNumber.prototype.negate = function() {
    return new LargeNumber(this.chunkData, !this.isNegative);
  };
  TinyNumber.prototype.negate = function() {
    return new TinyNumber(-this.value); // Just negate the native value
  };

  LargeNumber.prototype.abs = function() {
    return new LargeNumber(this.chunkData, false);
  };
  TinyNumber.prototype.abs = function() {
    return new TinyNumber(Math.abs(this.value));
  };

  // Multiplies two chunk arrays using standard long multiplication
  function productChunksLong(a, b) {
    var lenA = a.length,
      lenB = b.length;
    var resultLen = lenA + lenB;
    var resultChunks = makeZeroFilledArray(resultLen);
    var productTerm, currentCarry;
    var chunkA, chunkB;

    for (var i = 0; i < lenA; ++i) {
      chunkA = a[i];
      currentCarry = 0; // Reset carry for each chunk of 'a'
      for (var j = 0; j < lenB; ++j) {
        chunkB = b[j];
        productTerm = chunkA * chunkB + resultChunks[i + j] + currentCarry;
        currentCarry = Math.floor(productTerm / CHUNK_SIZE);
        resultChunks[i + j] = productTerm - currentCarry * CHUNK_SIZE;
      }
      resultChunks[i + lenB] += currentCarry; // Add final carry to next position
    }
    normalizeChunks(resultChunks);
    return resultChunks;
  }

  // Multiplies a chunk array by a small integer
  function productChunksSmall(chunkArr, smallNum) {
    var len = chunkArr.length;
    var result = new Array(len);
    var currentCarry = 0;
    var productTerm;

    for (var i = 0; i < len; i++) {
      productTerm = chunkArr[i] * smallNum + currentCarry;
      currentCarry = Math.floor(productTerm / CHUNK_SIZE);
      result[i] = productTerm - currentCarry * CHUNK_SIZE;
    }
    // Append any remaining carry
    while (currentCarry > 0) {
      result[i++] = currentCarry % CHUNK_SIZE;
      currentCarry = Math.floor(currentCarry / CHUNK_SIZE);
    }
    return result;
  }

  // Prepends zeros to a chunk array (effectively multiplying by CHUNK_SIZE^n)
  function padWithZeros(chunkArr, numZeros) {
    var padded = [];
    while (numZeros-- > 0) {
      padded.push(0);
    }
    return padded.concat(chunkArr);
  }

  // Multiplies two chunk arrays using Karatsuba algorithm
  function productKaratsuba(xChunks, yChunks) {
    var n = Math.max(xChunks.length, yChunks.length);
    // Base case for recursion: switch to long multiplication for small arrays
    if (n <= 30) return productChunksLong(xChunks, yChunks);

    // Split arrays into halves
    n = Math.ceil(n / 2);
    var xHigh = xChunks.slice(n);
    var xLow = xChunks.slice(0, n);
    var yHigh = yChunks.slice(n);
    var yLow = yChunks.slice(0, n);

    // Recursively compute sub-products
    var pLow = productKaratsuba(xLow, yLow); // z0
    var pHigh = productKaratsuba(xHigh, yHigh); // z2
    var pMid = productKaratsuba(sumChunksAnyLength(xLow, xHigh), sumChunksAnyLength(yLow, yHigh)); // z1

    // Combine results: z2 * CHUNK_SIZE^(2n) + (z1 - z0 - z2) * CHUNK_SIZE^n + z0
    var combinedResult = sumChunksAnyLength(
      pLow,
      padWithZeros(
        diffChunks(
          diffChunks(pMid, pLow),
          pHigh
        ),
        n
      )
    );
    combinedResult = sumChunksAnyLength(
      combinedResult,
      padWithZeros(pHigh, 2 * n)
    );

    normalizeChunks(combinedResult);
    return combinedResult;
  }

  // Heuristic to decide whether to use Karatsuba algorithm
  function shouldUseKaratsuba(len1, len2) {
    // This formula is empirical and might need tuning
    return -0.012 * len1 - 0.012 * len2 + 15e-6 * len1 * len2 > 0;
  }

  LargeNumber.prototype.multiply = function(otherNum) {
    var n = parseInputToNumValue(otherNum);
    var thisVal = this.chunkData,
      otherVal = n.chunkData;
    var finalSign = this.isNegative !== n.isNegative;
    var absOtherVal;

    if (n.isSmall) {
      // Handle special cases for small multipliers
      if (otherVal === 0) return NumValue[0];
      if (otherVal === 1) return this;
      if (otherVal === -1) return this.negate();

      absOtherVal = Math.abs(otherVal);
      // If small multiplier fits in a single chunk, use optimized small multiplication
      if (absOtherVal < CHUNK_SIZE) {
        return new LargeNumber(productChunksSmall(thisVal, absOtherVal), finalSign);
      }
      // Otherwise, convert small multiplier to chunks
      otherVal = jsNumToChunks(absOtherVal);
    }

    // Choose multiplication algorithm based on length heuristic
    if (shouldUseKaratsuba(thisVal.length, otherVal.length)) {
      return new LargeNumber(productKaratsuba(thisVal, otherVal), finalSign);
    }
    return new LargeNumber(productChunksLong(thisVal, otherVal), finalSign);
  };
  LargeNumber.prototype.times = LargeNumber.prototype.multiply; // Alias for multiply

  // Helper for multiplying a small number with a chunk array
  function productSmallAndChunks(smallNumAbs, chunkArr, finalSign) {
    if (smallNumAbs < CHUNK_SIZE) {
      return new LargeNumber(productChunksSmall(chunkArr, smallNumAbs), finalSign);
    }
    // If small number is larger than a chunk, convert it to chunks and use long multiplication
    return new LargeNumber(productChunksLong(chunkArr, jsNumToChunks(smallNumAbs)), finalSign);
  }

  TinyNumber.prototype._multiplyBySmall = function(aTinyNum) {
    if (isJsPrecise(aTinyNum.value * this.value)) {
      return new TinyNumber(aTinyNum.value * this.value);
    }
    return productSmallAndChunks(
      Math.abs(aTinyNum.value),
      jsNumToChunks(Math.abs(this.value)),
      this.isNegative !== aTinyNum.isNegative
    );
  };
  LargeNumber.prototype._multiplyBySmall = function(aTinyNum) {
    if (aTinyNum.value === 0) return NumValue[0];
    if (aTinyNum.value === 1) return this;
    if (aTinyNum.value === -1) return this.negate();
    return productSmallAndChunks(Math.abs(aTinyNum.value), this.chunkData, this.isNegative !== aTinyNum.isNegative);
  };

  TinyNumber.prototype.multiply = function(otherNum) {
    // Delegate to the internal _multiplyBySmall method after parsing
    return parseInputToNumValue(otherNum)._multiplyBySmall(this);
  };
  TinyNumber.prototype.times = TinyNumber.prototype.multiply; // Alias for multiply

  // Squares a chunk array using a specialized algorithm for efficiency
  function squareChunks(chunkArr) {
    var len = chunkArr.length;
    var result = makeZeroFilledArray(len + len);
    var currentCarry, productTerm;
    var chunkA_i, chunkA_j;

    for (var i = 0; i < len; i++) {
      chunkA_i = chunkArr[i];
      currentCarry = 0 - chunkA_i * chunkA_i; // Initialize carry with negative square
      for (var j = i; j < len; j++) {
        chunkA_j = chunkArr[j];
        // 2 * (a_i * a_j) + previous_chunk_value + carry
        productTerm = 2 * (chunkA_i * chunkA_j) + result[i + j] + currentCarry;
        currentCarry = Math.floor(productTerm / CHUNK_SIZE);
        result[i + j] = productTerm - currentCarry * CHUNK_SIZE;
      }
      result[i + len] += currentCarry; // Add final carry
    }
    normalizeChunks(result);
    return result;
  }

  LargeNumber.prototype.square = function() {
    return new LargeNumber(squareChunks(this.chunkData), false); // Square is always non-negative
  };
  TinyNumber.prototype.square = function() {
    var squaredVal = this.value * this.value;
    if (isJsPrecise(squaredVal)) {
      return new TinyNumber(squaredVal);
    }
    // Convert to chunks and then square if result is too large for JS number
    return new LargeNumber(squareChunks(jsNumToChunks(Math.abs(this.value))), false);
  };

  // Division and Modulus - Variant 1 (Knuth's Algorithm D)
  function divideAndModVariant1(dividendChunks, divisorChunks) {
    var dividendLen = dividendChunks.length,
      divisorLen = divisorChunks.length;
    var resultQuotient = makeZeroFilledArray(divisorLen); // Array for quotient chunks
    var scaledDividend, scaledDivisor;
    var divisorMostSignificantDigit = divisorChunks[divisorLen - 1];

    // Scaling factor (lambda) to normalize divisor's most significant digit
    var scalingFactor = Math.ceil(CHUNK_SIZE / (2 * divisorMostSignificantDigit));
    scaledDividend = productChunksSmall(dividendChunks, scalingFactor);
    scaledDivisor = productChunksSmall(divisorChunks, scalingFactor);

    // Adjust lengths for calculation
    if (scaledDividend.length <= dividendLen) scaledDividend.push(0);
    scaledDivisor.push(0); // Pad divisor to match scaledDividend's potential extra digit

    divisorMostSignificantDigit = scaledDivisor[divisorLen - 1]; // Update after scaling

    var currentQuotientDigit, currentShift, currentCarry, currentBorrow, k, subLen, q;

    // Iterate through dividend chunks from most significant
    for (currentShift = dividendLen - divisorLen; currentShift >= 0; currentShift--) {
      // Estimate quotient digit
      currentQuotientDigit = CHUNK_SIZE - 1;
      if (scaledDividend[currentShift + divisorLen] !== divisorMostSignificantDigit) {
        currentQuotientDigit = Math.floor(
          (scaledDividend[currentShift + divisorLen] * CHUNK_SIZE + scaledDividend[currentShift + divisorLen - 1]) /
          divisorMostSignificantDigit
        );
      }

      currentCarry = 0;
      currentBorrow = 0;
      subLen = scaledDivisor.length;

      // Multiply divisor by estimated quotient digit and subtract from dividend
      for (k = 0; k < subLen; k++) {
        currentCarry += currentQuotientDigit * scaledDivisor[k];
        q = Math.floor(currentCarry / CHUNK_SIZE);
        currentBorrow += scaledDividend[currentShift + k] - (currentCarry - q * CHUNK_SIZE); // Calculate difference
        currentCarry = q;
        if (currentBorrow < 0) {
          scaledDividend[currentShift + k] = currentBorrow + CHUNK_SIZE;
          currentBorrow = -1;
        } else {
          scaledDividend[currentShift + k] = currentBorrow;
          currentBorrow = 0;
        }
      }

      // Adjust quotient digit if subtraction resulted in a negative borrow
      while (currentBorrow !== 0) {
        currentQuotientDigit -= 1;
        currentCarry = 0;
        for (k = 0; k < subLen; k++) {
          currentCarry += scaledDividend[currentShift + k] - CHUNK_SIZE + scaledDivisor[k];
          if (currentCarry < 0) {
            scaledDividend[currentShift + k] = currentCarry + CHUNK_SIZE;
            currentCarry = 0;
          } else {
            scaledDividend[currentShift + k] = currentCarry;
            currentCarry = 1;
          }
        }
        currentBorrow += currentCarry;
      }
      resultQuotient[currentShift] = currentQuotientDigit;
    }

    // Unscale the remainder
    var unscaledRemainder = divideAndModSmallDivisor(scaledDividend, scalingFactor)[0];
    return [chunksToJsNum(resultQuotient), chunksToJsNum(unscaledRemainder)];
  }

  // Division and Modulus - Variant 2 (simpler but potentially slower for large numbers)
  function divideAndModVariant2(dividendChunks, divisorChunks) {
    var dividendLen = dividendChunks.length,
      divisorLen = divisorChunks.length;
    var quotientResult = [];
    var currentPartialDividend = [];
    var currentGuess, xLength, highX, highY, checkResult;

    // Process dividend chunks from most significant to least significant
    // Simulating long division
    while (dividendLen > 0) {
      currentPartialDividend.unshift(dividendChunks[--dividendLen]); // Take next chunk from dividend
      normalizeChunks(currentPartialDividend); // Remove leading zeros from partial

      if (compareAbsoluteChunks(currentPartialDividend, divisorChunks) < 0) {
        quotientResult.push(0); // If partial is smaller, quotient digit is 0
        continue;
      }

      xLength = currentPartialDividend.length;
      highX = currentPartialDividend[xLength - 1] * CHUNK_SIZE + currentPartialDividend[xLength - 2];
      highY = divisorChunks[divisorLen - 1] * CHUNK_SIZE + divisorChunks[divisorLen - 2];

      // Adjust highX if it's potentially much larger than highY
      if (xLength > divisorLen) {
        highX = (highX + 1) * CHUNK_SIZE;
      }

      currentGuess = Math.ceil(highX / highY); // Initial guess for quotient digit

      // Refine guess by trial subtraction
      do {
        checkResult = productChunksSmall(divisorChunks, currentGuess);
        if (compareAbsoluteChunks(checkResult, currentPartialDividend) <= 0) break;
        currentGuess--;
      } while (currentGuess);

      quotientResult.push(currentGuess);
      currentPartialDividend = diffChunks(currentPartialDividend, checkResult); // Update partial dividend
    }
    quotientResult.reverse(); // Digits were collected in reverse order
    return [chunksToJsNum(quotientResult), chunksToJsNum(currentPartialDividend)];
  }

  // Divides a chunk array by a small integer (lambda)
  function divideAndModSmallDivisor(chunkArr, smallDivisor) {
    var len = chunkArr.length;
    var quotient = makeZeroFilledArray(len);
    var currentRemainder = 0;
    var currentDividendChunk, q;

    // Process chunks from most significant to least significant
    for (var i = len - 1; i >= 0; --i) {
      currentDividendChunk = currentRemainder * CHUNK_SIZE + chunkArr[i];
      q = floorOrCeil(currentDividendChunk / smallDivisor);
      currentRemainder = currentDividendChunk - q * smallDivisor;
      quotient[i] = q | 0; // Ensure integer
    }
    return [quotient, currentRemainder | 0]; // Return quotient chunks and final remainder
  }

  // Main division and modulus function, handling all cases
  function divideAndModMain(selfNum, otherNum) {
    var resultValue, n = parseInputToNumValue(otherNum);
    var selfChunks = selfNum.chunkData,
      otherChunks = n.chunkData;
    var finalQuotient;

    if (otherChunks === 0) { // Divisor is zero
      throw new Error("Cannot divide by zero");
    }

    if (selfNum.isSmall) { // If dividend is small
      if (n.isSmall) { // If both are small, use native JS division
        return [new TinyNumber(floorOrCeil(selfChunks / otherChunks)), new TinyNumber(selfChunks % otherChunks)];
      }
      return [NumValue[0], selfNum]; // Small / Large = 0 remainder Small
    }

    if (n.isSmall) { // If divisor is small but dividend is large
      if (otherChunks === 1) return [selfNum, NumValue[0]]; // Divide by 1
      if (otherChunks === -1) return [selfNum.negate(), NumValue[0]]; // Divide by -1

      var absOtherChunks = Math.abs(otherChunks);
      if (absOtherChunks < CHUNK_SIZE) { // If small divisor fits in a chunk
        resultValue = divideAndModSmallDivisor(selfChunks, absOtherChunks);
        finalQuotient = chunksToJsNum(resultValue[0]);
        var remainder = resultValue[1];
        if (selfNum.isNegative) remainder = -remainder; // Adjust remainder sign

        if (typeof finalQuotient === "number") {
          return [
            new TinyNumber((selfNum.isNegative !== n.isNegative) ? -finalQuotient : finalQuotient),
            new TinyNumber(remainder)
          ];
        }
        return [
          new LargeNumber(finalQuotient, selfNum.isNegative !== n.isNegative),
          new TinyNumber(remainder)
        ];
      }
      otherChunks = jsNumToChunks(absOtherChunks); // Convert small divisor to chunks
    }

    // General case: Large / Large
    var comparison = compareAbsoluteChunks(selfChunks, otherChunks);
    if (comparison === -1) return [NumValue[0], selfNum]; // Dividend < Divisor
    if (comparison === 0) { // Dividend == Divisor
      return [
        NumValue[selfNum.isNegative === n.isNegative ? 1 : -1],
        NumValue[0]
      ];
    }

    // Choose division algorithm based on length
    if (selfChunks.length + otherChunks.length <= 200) {
      resultValue = divideAndModVariant1(selfChunks, otherChunks);
    } else {
      resultValue = divideAndModVariant2(selfChunks, otherChunks);
    }

    finalQuotient = resultValue[0];
    var quotientSign = selfNum.isNegative !== n.isNegative;
    var modulus = resultValue[1];
    var modulusSign = selfNum.isNegative;

    // Convert results to appropriate number types
    if (typeof finalQuotient === "number") {
      finalQuotient = new TinyNumber(quotientSign ? -finalQuotient : finalQuotient);
    } else {
      finalQuotient = new LargeNumber(finalQuotient, quotientSign);
    }
    if (typeof modulus === "number") {
      modulus = new TinyNumber(modulusSign ? -modulus : modulus);
    } else {
      modulus = new LargeNumber(modulus, modulusSign);
    }
    return [finalQuotient, modulus];
  }

  LargeNumber.prototype.divmod = function(otherNum) {
    var result = divideAndModMain(this, otherNum);
    return {
      quotient: result[0],
      remainder: result[1]
    };
  };
  TinyNumber.prototype.divmod = LargeNumber.prototype.divmod; // Share divmod implementation

  LargeNumber.prototype.divide = function(otherNum) {
    return divideAndModMain(this, otherNum)[0];
  };
  TinyNumber.prototype.over = TinyNumber.prototype.divide = LargeNumber.prototype.over = LargeNumber.prototype.divide; // Aliases

  LargeNumber.prototype.mod = function(otherNum) {
    return divideAndModMain(this, otherNum)[1];
  };
  TinyNumber.prototype.remainder = TinyNumber.prototype.mod = LargeNumber.prototype.remainder = LargeNumber.prototype.mod; // Aliases

  LargeNumber.prototype.pow = function(exponentNum) {
    var n = parseInputToNumValue(exponentNum);
    var baseValue = this.chunkData,
      expValue = n.value;
    var resultVal, x, y;

    // Handle special exponent cases
    if (expValue === 0) return NumValue[1]; // x^0 = 1
    if (baseValue === 0) return NumValue[0]; // 0^x = 0 (for x > 0)
    if (baseValue === 1) return NumValue[1]; // 1^x = 1
    if (baseValue === -1) return n.isEven() ? NumValue[1] : NumValue[-1]; // (-1)^x

    if (n.isNegative) { // Negative exponent
      return NumValue[0]; // For integers, x^-y is 0
    }
    if (!n.isSmall) {
      throw new Error("The exponent " + n.toString() + " is too large for current implementation.");
    }

    // If base is small and result fits JS number
    if (this.isSmall) {
      if (isJsPrecise(resultVal = Math.pow(baseValue, expValue))) {
        return new TinyNumber(floorOrCeil(resultVal));
      }
    }

    // Binary exponentiation (exponentiation by squaring)
    x = this;
    y = NumValue[1]; // Accumulator for result
    while (true) {
      if ((expValue & 1) === 1) { // If exponent is odd
        y = y.times(x);
        expValue--;
      }
      if (expValue === 0) break;
      expValue /= 2; // Halve the exponent
      x = x.square(); // Square the base
    }
    return y;
  };
  TinyNumber.prototype.pow = LargeNumber.prototype.pow; // Share pow implementation

  LargeNumber.prototype.modPow = function(exponent, modulus) {
    exponent = parseInputToNumValue(exponent);
    modulus = parseInputToNumValue(modulus);

    if (modulus.isZero()) {
      throw new Error("Cannot compute modular exponentiation with modulus 0");
    }

    var result = NumValue[1]; // Initialize result to 1
    var base = this.mod(modulus); // Reduce base modulo modulus

    // Binary exponentiation (exponentiation by squaring)
    while (exponent.isPositive()) {
      if (base.isZero()) return NumValue[0]; // Optimization: if base is 0, result is 0
      if (exponent.isOdd()) {
        result = result.multiply(base).mod(modulus);
      }
      exponent = exponent.divide(2);
      base = base.square().mod(modulus);
    }
    return result;
  };
  TinyNumber.prototype.modPow = LargeNumber.prototype.modPow; // Share modPow implementation

  // Compares absolute values of two chunk arrays
  function compareAbsoluteChunks(a, b) {
    if (a.length !== b.length) {
      return a.length > b.length ? 1 : -1; // Longer array is larger
    }
    // Compare chunk by chunk from most significant
    for (var i = a.length - 1; i >= 0; i--) {
      if (a[i] !== b[i]) return a[i] > b[i] ? 1 : -1;
    }
    return 0; // Arrays are equal
  }

  LargeNumber.prototype.compareAbs = function(otherNum) {
    var n = parseInputToNumValue(otherNum);
    var thisVal = this.chunkData,
      otherVal = n.chunkData;
    if (n.isSmall) return 1; // A large number is always absolutely greater than a small number (if both positive)
    return compareAbsoluteChunks(thisVal, otherVal);
  };
  TinyNumber.prototype.compareAbs = function(otherNum) {
    var n = parseInputToNumValue(otherNum);
    var thisAbsVal = Math.abs(this.value),
      otherAbsVal = n.value;
    if (n.isSmall) {
      otherAbsVal = Math.abs(otherAbsVal);
      return thisAbsVal === otherAbsVal ? 0 : (thisAbsVal > otherAbsVal ? 1 : -1);
    }
    return -1; // A small number is always absolutely smaller than a large number
  };

  LargeNumber.prototype.compare = function(otherNum) {
    // Handle special JS number values
    if (otherNum === Infinity) return -1;
    if (otherNum === -Infinity) return 1;

    var n = parseInputToNumValue(otherNum);
    var thisVal = this.chunkData,
      otherVal = n.chunkData;

    // Compare signs first
    if (this.isNegative !== n.isNegative) {
      return n.isNegative ? 1 : -1; // Negative is smaller than positive
    }
    // If signs are the same, compare absolute values
    if (n.isSmall) {
      // If other is small, and this is large, this is "more" negative or "more" positive
      return this.isNegative ? -1 : 1;
    }
    // Both are large numbers with same sign
    return compareAbsoluteChunks(thisVal, otherVal) * (this.isNegative ? -1 : 1); // Flip result if negative
  };
  LargeNumber.prototype.compareTo = LargeNumber.prototype.compare; // Alias

  TinyNumber.prototype.compare = function(otherNum) {
    // Handle special JS number values
    if (otherNum === Infinity) return -1;
    if (otherNum === -Infinity) return 1;

    var n = parseInputToNumValue(otherNum);
    var thisVal = this.value,
      otherVal = n.value;

    if (n.isSmall) { // Both are small numbers, use native comparison
      return thisVal === otherVal ? 0 : (thisVal > otherVal ? 1 : -1);
    }
    // This is small, other is large
    if ((thisVal < 0) !== n.isNegative) {
      return thisVal < 0 ? -1 : 1; // This is negative, other is positive OR vice versa
    }
    // Both same sign, this is small, other is large
    return thisVal < 0 ? 1 : -1; // Negative: small is larger (closer to zero); Positive: small is smaller
  };
  TinyNumber.prototype.compareTo = TinyNumber.prototype.compare; // Alias

  // Comparison aliases
  LargeNumber.prototype.equals = function(v) {
    return this.compare(v) === 0;
  };
  TinyNumber.prototype.eq = TinyNumber.prototype.equals = LargeNumber.prototype.eq = LargeNumber.prototype.equals;

  LargeNumber.prototype.notEquals = function(v) {
    return this.compare(v) !== 0;
  };
  TinyNumber.prototype.neq = TinyNumber.prototype.notEquals = LargeNumber.prototype.neq = LargeNumber.prototype.notEquals;

  LargeNumber.prototype.greater = function(v) {
    return this.compare(v) > 0;
  };
  TinyNumber.prototype.gt = TinyNumber.prototype.greater = LargeNumber.prototype.gt = LargeNumber.prototype.greater;

  LargeNumber.prototype.lesser = function(v) {
    return this.compare(v) < 0;
  };
  TinyNumber.prototype.lt = TinyNumber.prototype.lesser = LargeNumber.prototype.lt = LargeNumber.prototype.lesser;

  LargeNumber.prototype.greaterOrEquals = function(v) {
    return this.compare(v) >= 0;
  };
  TinyNumber.prototype.geq = TinyNumber.prototype.greaterOrEquals = LargeNumber.prototype.geq = LargeNumber.prototype.greaterOrEquals;

  LargeNumber.prototype.lesserOrEquals = function(v) {
    return this.compare(v) <= 0;
  };
  TinyNumber.prototype.leq = TinyNumber.prototype.lesserOrEquals = LargeNumber.prototype.leq = LargeNumber.prototype.lesserOrEquals;

  // Parity checks
  LargeNumber.prototype.isEven = function() {
    return (this.chunkData[0] & 1) === 0;
  };
  TinyNumber.prototype.isEven = function() {
    return (this.value & 1) === 0;
  };
  LargeNumber.prototype.isOdd = function() {
    return (this.chunkData[0] & 1) === 1;
  };
  TinyNumber.prototype.isOdd = function() {
    return (this.value & 1) === 1;
  };

  // Sign checks
  LargeNumber.prototype.isPositive = function() {
    return !this.isNegative;
  };
  TinyNumber.prototype.isPositive = function() {
    return this.value > 0;
  };
  LargeNumber.prototype.isNegative = function() {
    return this.isNegative;
  };
  TinyNumber.prototype.isNegative = function() {
    return this.value < 0;
  };

  // Value checks
  LargeNumber.prototype.isUnit = function() {
    return false; // Only small numbers can be unit (1 or -1)
  };
  TinyNumber.prototype.isUnit = function() {
    return Math.abs(this.value) === 1;
  };
  LargeNumber.prototype.isZero = function() {
    return false; // Only small numbers can be zero
  };
  TinyNumber.prototype.isZero = function() {
    return this.value === 0;
  };

  // Divisibility check
  LargeNumber.prototype.isDivisibleBy = function(otherNum) {
    var n = parseInputToNumValue(otherNum);
    var otherVal = n.value;
    if (otherVal === 0) return false;
    if (otherVal === 1) return true;
    if (otherVal === 2) return this.isEven();
    return this.mod(n).equals(NumValue[0]);
  };
  TinyNumber.prototype.isDivisibleBy = LargeNumber.prototype.isDivisibleBy; // Share implementation

  // Basic primality test for small numbers
  function isBasicPrime(num) {
    var nAbs = num.abs();
    if (nAbs.isUnit()) return false; // 1 is not prime
    if (nAbs.equals(2) || nAbs.equals(3) || nAbs.equals(5)) return true;
    if (nAbs.isEven() || nAbs.isDivisibleBy(3) || nAbs.isDivisibleBy(5)) return false;
    if (nAbs.lesser(25)) return true; // Primes < 25 not caught by above: 7, 11, 13, 17, 19, 23
    return void0; // Undefined, requires more complex test
  }

  LargeNumber.prototype.isPrime = function() {
    var basicResult = isBasicPrime(this);
    if (basicResult !== void0) return basicResult;

    var n = this.abs(),
      nMinusOne = n.prev();
    // Miller-Rabin witnesses for primality test
    var witnesses = [2, 3, 5, 7, 11, 13, 17, 19];
    var d = nMinusOne;
    // Find d such that n-1 = 2^s * d, where d is odd
    while (d.isEven()) d = d.divide(2);

    for (var i = 0; i < witnesses.length; i++) {
      var x = hugeNum(witnesses[i]).modPow(d, n);
      if (x.equals(NumValue[1]) || x.equals(nMinusOne)) continue; // Witness passed

      var testPassed = false;
      var currentD = d;
      while (currentD.lesser(nMinusOne)) {
        x = x.square().mod(n);
        if (x.equals(nMinusOne)) {
          testPassed = true;
          break;
        }
        currentD = currentD.multiply(2);
      }
      if (!testPassed) return false; // Composite
    }
    return true; // Probably prime
  };
  TinyNumber.prototype.isPrime = LargeNumber.prototype.isPrime; // Share implementation

  LargeNumber.prototype.isProbablePrime = function(iterations) {
    var basicResult = isBasicPrime(this);
    if (basicResult !== void0) return basicResult;

    var n = this.abs();
    // Default iterations for Miller-Rabin
    var numIterations = iterations === void0 ? 5 : iterations;

    for (var i = 0; i < numIterations; i++) {
      // Random base 'a' between 2 and n-2
      var a = hugeNum.randBetween(2, n.minus(2));
      if (!a.modPow(n.prev(), n).isUnit()) {
        return false; // Composite
      }
    }
    return true; // Probable prime
  };
  TinyNumber.prototype.isProbablePrime = LargeNumber.prototype.isProbablePrime; // Share implementation

  LargeNumber.prototype.modInv = function(modulus) {
    var tempT = hugeNum.zero,
      newTempT = hugeNum.one;
    var rVal = parseInputToNumValue(modulus),
      newRVal = this.abs();
    var quotient, lastT, lastR;

    // Extended Euclidean algorithm
    while (!newRVal.equals(hugeNum.zero)) {
      quotient = rVal.divide(newRVal);
      lastT = tempT;
      lastR = rVal;
      tempT = newTempT;
      rVal = newRVal;
      newTempT = lastT.subtract(quotient.multiply(newTempT));
      newRVal = lastR.subtract(quotient.multiply(newRVal));
    }

    if (!rVal.equals(1)) {
      throw new Error(this.toString() + " and " + modulus.toString() + " are not co-prime");
    }

    // Ensure result is positive
    if (tempT.compare(0) === -1) {
      tempT = tempT.add(modulus);
    }

    // Adjust for negative input (if this number was negative)
    if (this.isNegative()) {
      return tempT.negate();
    }
    return tempT;
  };
  TinyNumber.prototype.modInv = LargeNumber.prototype.modInv; // Share implementation

  LargeNumber.prototype.next = function() {
    var currentVal = this.chunkData;
    if (this.isNegative) {
      return diffChunksWithBorrow(currentVal, 1, this.isNegative); // -N + 1
    }
    return new LargeNumber(sumChunksWithCarry(currentVal, 1), this.isNegative); // N + 1
  };
  TinyNumber.prototype.next = function() {
    var currentVal = this.value;
    if (currentVal + 1 < JS_MAX_SAFE_INTEGER) {
      return new TinyNumber(currentVal + 1);
    }
    // If it exceeds small integer range, convert to large number
    return new LargeNumber(JS_MAX_SAFE_INT_CHUNKS, false);
  };

  LargeNumber.prototype.prev = function() {
    var currentVal = this.chunkData;
    if (this.isNegative) {
      return new LargeNumber(sumChunksWithCarry(currentVal, 1), true); // -N - 1
    }
    return diffChunksWithBorrow(currentVal, 1, this.isNegative); // N - 1
  };
  TinyNumber.prototype.prev = function() {
    var currentVal = this.value;
    if (currentVal - 1 > -JS_MAX_SAFE_INTEGER) {
      return new TinyNumber(currentVal - 1);
    }
    // If it falls below small integer range, convert to large number (negative)
    return new LargeNumber(JS_MAX_SAFE_INT_CHUNKS, true);
  };

  // Precompute powers of 2 up to CHUNK_SIZE
  var pow2Cache = [1];
  while (2 * pow2Cache[pow2Cache.length - 1] <= CHUNK_SIZE) {
    pow2Cache.push(2 * pow2Cache[pow2Cache.length - 1]);
  }
  var pow2CacheLen = pow2Cache.length;
  var largestCachedPow2 = pow2Cache[pow2CacheLen - 1];

  // Check if shift amount is small enough for optimization
  function isShiftAmountSmall(n) {
    return (typeof n === "number" || typeof n === "string") && +Math.abs(n) <= CHUNK_SIZE ||
      n instanceof LargeNumber && n.chunkData.length <= 1;
  }

  LargeNumber.prototype.shiftLeft = function(shiftAmount) {
    if (!isShiftAmountSmall(shiftAmount)) {
      throw new Error(String(shiftAmount) + " is too large for shifting.");
    }
    shiftAmount = +shiftAmount; // Ensure number type
    if (shiftAmount < 0) return this.shiftRight(-shiftAmount); // Convert left shift by negative to right shift

    var currentResult = this;
    if (currentResult.isZero()) return currentResult;

    // Apply shifts in chunks (multiples of CHUNK_SIZE)
    while (shiftAmount >= pow2CacheLen) {
      currentResult = currentResult.multiply(largestCachedPow2);
      shiftAmount -= (pow2CacheLen - 1); // Each largestCachedPow2 is 2^(pow2CacheLen-1)
    }
    // Apply remaining shift
    return currentResult.multiply(pow2Cache[shiftAmount]);
  };
  TinyNumber.prototype.shiftLeft = LargeNumber.prototype.shiftLeft; // Share implementation

  LargeNumber.prototype.shiftRight = function(shiftAmount) {
    var divResult;
    if (!isShiftAmountSmall(shiftAmount)) {
      throw new Error(String(shiftAmount) + " is too large for shifting.");
    }
    shiftAmount = +shiftAmount; // Ensure number type
    if (shiftAmount < 0) return this.shiftLeft(-shiftAmount); // Convert right shift by negative to left shift

    var currentResult = this;
    // Handle special cases: 0 or -1 shifted right
    if (currentResult.isZero() || (currentResult.isNegative() && currentResult.isUnit())) {
      return currentResult;
    }

    // Apply shifts in chunks
    while (shiftAmount >= pow2CacheLen) {
      divResult = divideAndModMain(currentResult, largestCachedPow2);
      // Adjust quotient for negative remainders (floor division)
      currentResult = divResult[1].isNegative() ? divResult[0].prev() : divResult[0];
      shiftAmount -= (pow2CacheLen - 1);
    }
    // Apply remaining shift
    divResult = divideAndModMain(currentResult, pow2Cache[shiftAmount]);
    return divResult[1].isNegative() ? divResult[0].prev() : divResult[0];
  };
  TinyNumber.prototype.shiftRight = LargeNumber.prototype.shiftRight; // Share implementation

  // Performs bitwise operations (AND, OR, XOR) on large numbers
  function performBitwiseOp(numX, numY, operationFn) {
    numY = parseInputToNumValue(numY);

    var xIsNegative = numX.isNegative(),
      yIsNegative = numY.isNegative();
    // Convert to two's complement representation if negative (by inverting and adding 1)
    var xRemainder = xIsNegative ? numX.not() : numX;
    var yRemainder = yIsNegative ? numY.not() : numY;

    var xChunkValue = 0,
      yChunkValue = 0;
    var xDivModResult = null,
      yDivModResult = null;
    var resultChunks = [];

    // Process chunk by chunk from least significant
    while (!xRemainder.isZero() || !yRemainder.isZero()) {
      xDivModResult = divideAndModMain(xRemainder, largestCachedPow2);
      xChunkValue = xDivModResult[1].toJSNumber();
      if (xIsNegative) {
        xChunkValue = largestCachedPow2 - 1 - xChunkValue; // Invert for two's complement
      }

      yDivModResult = divideAndModMain(yRemainder, largestCachedPow2);
      yChunkValue = yDivModResult[1].toJSNumber();
      if (yIsNegative) {
        yChunkValue = largestCachedPow2 - 1 - yChunkValue; // Invert for two's complement
      }

      xRemainder = xDivModResult[0];
      yRemainder = yDivModResult[0];

      resultChunks.push(operationFn(xChunkValue, yChunkValue)); // Apply bitwise operation
    }

    // Determine the sign of the result based on the last bit of the operation
    // If the operation on the 'sign bits' (represented by 0 or 1 for positive/negative) results in 1, it's negative
    var finalSum = operationFn(xIsNegative ? 1 : 0, yIsNegative ? 1 : 0) !== 0 ? hugeNum(-1) : hugeNum(0);

    // Reconstruct the number from result chunks
    for (var i = resultChunks.length - 1; i >= 0; i -= 1) {
      finalSum = finalSum.multiply(largestCachedPow2).add(hugeNum(resultChunks[i]));
    }
    return finalSum;
  }

  // Bitwise NOT (equivalent to -(N+1))
  LargeNumber.prototype.not = function() {
    return this.negate().prev();
  };
  TinyNumber.prototype.not = LargeNumber.prototype.not; // Share implementation

  LargeNumber.prototype.and = function(n) {
    return performBitwiseOp(this, n, function(a, b) {
      return a & b;
    });
  };
  TinyNumber.prototype.and = LargeNumber.prototype.and;

  LargeNumber.prototype.or = function(n) {
    return performBitwiseOp(this, n, function(a, b) {
      return a | b;
    });
  };
  TinyNumber.prototype.or = LargeNumber.prototype.or;

  LargeNumber.prototype.xor = function(n) {
    return performBitwiseOp(this, n, function(a, b) {
      return a ^ b;
    });
  };
  TinyNumber.prototype.xor = LargeNumber.prototype.xor;

  // Masks for rough lowest one bit calculation
  var LOW_BIT_MASK_INT = 1 << 30; // For small JS numbers
  var LOW_BIT_MASK_BIGINT = (CHUNK_SIZE & -CHUNK_SIZE) * (CHUNK_SIZE & -CHUNK_SIZE) | LOW_BIT_MASK_INT; // For large numbers (approximated)

  // Rough calculation of the lowest one bit (used in GCD)
  function getRoughLowestOneBit(num) {
    var v = num.value; // For TinyNumber
    var x;
    if (typeof v === "number") {
      x = v | LOW_BIT_MASK_INT;
    } else { // For LargeNumber, use first two chunks
      x = v[0] + v[1] * CHUNK_SIZE | LOW_BIT_MASK_BIGINT;
    }
    return x & -x; // Returns the value of the lowest set bit
  }

  // Calculates integer logarithm (base 2) for bitLength
  function calcIntegerLog(targetValue, baseValue) {
    if (baseValue.compareTo(targetValue) <= 0) {
      var recursiveResult = calcIntegerLog(targetValue, baseValue.square());
      var p = recursiveResult.p;
      var e = recursiveResult.e;
      var t = p.multiply(baseValue);
      return t.compareTo(targetValue) <= 0 ? {
        p: t,
        e: e * 2 + 1
      } : {
        p: p,
        e: e * 2
      };
    }
    return {
      p: hugeNum(1),
      e: 0
    };
  }

  LargeNumber.prototype.bitLength = function() {
    var currentNum = this;
    if (currentNum.compareTo(hugeNum(0)) < 0) {
      currentNum = currentNum.negate().subtract(hugeNum(1)); // For negative numbers, bit length of two's complement
    }
    if (currentNum.compareTo(hugeNum(0)) === 0) {
      return hugeNum(0);
    }
    // Calculate log2 and add 1
    return hugeNum(calcIntegerLog(currentNum, hugeNum(2)).e).add(hugeNum(1));
  };
  TinyNumber.prototype.bitLength = LargeNumber.prototype.bitLength;

  // Utility functions for min/max
  function getMaximum(a, b) {
    a = parseInputToNumValue(a);
    b = parseInputToNumValue(b);
    return a.greater(b) ? a : b;
  }

  function getMinimum(a, b) {
    a = parseInputToNumValue(a);
    b = parseInputToNumValue(b);
    return a.lesser(b) ? a : b;
  }

  // Calculates Greatest Common Divisor (GCD) using Binary GCD algorithm
  function greatestCommonDivisor(a, b) {
    a = parseInputToNumValue(a).abs();
    b = parseInputToNumValue(b).abs();

    if (a.equals(b)) return a;
    if (a.isZero()) return b;
    if (b.isZero()) return a;

    var commonFactor = NumValue[1];
    var d, temp;

    // Remove factors of 2
    while (a.isEven() && b.isEven()) {
      d = Math.min(getRoughLowestOneBit(a), getRoughLowestOneBit(b));
      a = a.divide(d);
      b = b.divide(d);
      commonFactor = commonFactor.multiply(d);
    }
    while (a.isEven()) {
      a = a.divide(getRoughLowestOneBit(a));
    }

    // Euclidean algorithm on odd numbers
    do {
      while (b.isEven()) {
        b = b.divide(getRoughLowestOneBit(b));
      }
      if (a.greater(b)) { // Swap if a > b
        temp = b;
        b = a;
        a = temp;
      }
      b = b.subtract(a);
    } while (!b.isZero());

    return commonFactor.isUnit() ? a : a.multiply(commonFactor);
  }

  // Calculates Least Common Multiple (LCM)
  function leastCommonMultiple(a, b) {
    a = parseInputToNumValue(a).abs();
    b = parseInputToNumValue(b).abs();
    return a.divide(greatestCommonDivisor(a, b)).multiply(b);
  }

  // Generates a random hugeNum between two bounds (inclusive)
  function generateRandomBetween(lowerBound, upperBound) {
    lowerBound = parseInputToNumValue(lowerBound);
    upperBound = parseInputToNumValue(upperBound);

    var low = getMinimum(lowerBound, upperBound);
    var high = getMaximum(lowerBound, upperBound);
    var range = high.subtract(low).add(1);

    if (range.isSmall) {
      return low.add(Math.floor(Math.random() * range.value));
    }

    var resultChunks = [];
    var restricted = true; // Flag to indicate if digits are restricted by range
    var rangeChunkLength = range.chunkData.length - 1;

    for (var i = rangeChunkLength; i >= 0; i--) {
      var upperLimitForChunk = restricted ? range.chunkData[i] : CHUNK_SIZE;
      var randomDigit = floorOrCeil(Math.random() * upperLimitForChunk);
      resultChunks.unshift(randomDigit); // Add to the beginning
      if (randomDigit < upperLimitForChunk) restricted = false; // Restriction lifted if digit is not max possible
    }

    var randomNumAsSmall = chunksToJsNum(resultChunks);
    return low.add(typeof randomNumAsSmall === "number" ? new TinyNumber(randomNumAsSmall) : new LargeNumber(randomNumAsSmall, false));
  }

  // Parses a string representation of a number in a given base
  var parseByBase = function(textStr, baseVal) {
    var strLen = textStr.length;
    var k;
    var absBase = Math.abs(baseVal);

    // Initial validation of digits for the given base
    for (k = 0; k < strLen; k++) {
      var char = textStr[k].toLowerCase();
      if (char === "-") continue;
      if (/[a-z0-9]/.test(char)) {
        if (/[0-9]/.test(char) && +char >= absBase) {
          if (char === "1" && absBase === 1) continue; // Special case for base 1
          throw new Error("Invalid digit: '" + char + "' is not valid in base " + baseVal + ".");
        } else if (char.charCodeAt(0) - 87 >= absBase) { // 'a' is 10, 'b' is 11, etc.
          throw new Error("Invalid digit: '" + char + "' is not valid in base " + baseVal + ".");
        }
      }
    }

    // Optimization for common bases that fit into native JS numbers
    if (2 <= baseVal && baseVal <= 36) {
      // Check if the number of digits would exceed JS_MAX_SAFE_INTEGER
      if (strLen <= LOG_JS_MAX_SAFE_INTEGER / Math.log(baseVal)) {
        var parsedResult = parseInt(textStr, baseVal);
        if (isNaN(parsedResult)) {
          throw new Error("Invalid number string for base " + baseVal + ".");
        }
        return new TinyNumber(parsedResult);
      }
    }

    // For larger numbers or custom bases, use bigInt logic
    baseVal = parseInputToNumValue(baseVal);
    var digitValues = [];
    var isNegative = textStr[0] === "-";

    for (k = isNegative ? 1 : 0; k < textStr.length; k++) {
      var char = textStr[k].toLowerCase();
      var charCode = char.charCodeAt(0);
      if (48 <= charCode && charCode <= 57) { // 0-9
        digitValues.push(parseInputToNumValue(char));
      } else if (97 <= charCode && charCode <= 122) { // a-z
        digitValues.push(parseInputToNumValue(charCode - 87)); // 'a' is 10
      } else if (char === "<") { // Custom digit format <value>
        var startIdx = k;
        do {
          k++;
        } while (textStr[k] !== ">" && k < textStr.length);
        if (textStr[k] !== ">") throw new Error("Unclosed custom digit tag in base string.");
        digitValues.push(parseInputToNumValue(textStr.slice(startIdx + 1, k)));
      } else {
        throw new Error("Invalid character '" + char + "' in base " + baseVal + " string.");
      }
    }
    return parseFromChunkArray(digitValues, baseVal, isNegative);
  };

  // Converts an array of digits (parsed as NumValue) and a base to a NumValue
  function parseFromChunkArray(digitsArr, baseNum, isNegative) {
    var accumulator = NumValue[0];
    var currentPower = NumValue[1];
    for (var i = digitsArr.length - 1; i >= 0; i--) {
      accumulator = accumulator.add(digitsArr[i].times(currentPower));
      currentPower = currentPower.times(baseNum);
    }
    return isNegative ? accumulator.negate() : accumulator;
  }

  // Converts a digit (0-35) to its string representation (0-9, a-z)
  function digitToStringRep(digit) {
    if (digit <= 35) {
      return "0123456789abcdefghijklmnopqrstuvwxyz".charAt(digit);
    }
    return "<" + digit + ">"; // For digits > 35
  }

  // Converts a NumValue to an array of digits in a specified base
  function convertToBaseRepresentation(num, base) {
    base = hugeNum(base);
    if (base.isZero()) {
      if (num.isZero()) return {
        value: [0],
        isNegative: false
      };
      throw new Error("Cannot convert nonzero numbers to base 0.");
    }
    if (base.equals(-1)) { // Special handling for base -1
      if (num.isZero()) return {
        value: [0],
        isNegative: false
      };
      // Not a simple conversion; needs more complex logic for base -1
      // Simplified for this clone:
      if (num.isNegative()) {
        // Example: -5 in base -1 is 10101_(-1)
        var negParts = [];
        var absN = num.abs();
        while(!absN.isZero()){
          if(absN.isEven()){
            negParts.push(0);
          } else {
            negParts.push(1);
          }
          absN = absN.add(negParts[negParts.length-1]).divide(2);
        }
        return { value: negParts.reverse(), isNegative: false };
      } else {
        var posParts = [];
        var curr = num;
        while (!curr.isZero()) {
          var rem = curr.mod(-2);
          curr = curr.divide(-2);
          if (rem.isNegative()) {
            rem = rem.add(2);
            curr = curr.add(1);
          }
          posParts.push(rem.toJSNumber());
        }
        return { value: posParts.reverse(), isNegative: false };
      }
    }

    var isNegative = false;
    if (num.isNegative() && base.isPositive()) {
      isNegative = true;
      num = num.abs();
    }

    if (base.equals(1)) {
      if (num.isZero()) return {
        value: [0],
        isNegative: false
      };
      // Base 1: array of 1s
      return {
        value: Array.apply(null, Array(num.toJSNumber())).map(Number.prototype.valueOf, 1),
        isNegative: isNegative
      };
    }

    var outputDigits = [];
    var currentNum = num,
      divmodResult;
    while (currentNum.isNegative() || currentNum.compareAbs(base) >= 0) {
      divmodResult = currentNum.divmod(base);
      currentNum = divmodResult.quotient;
      var digit = divmodResult.remainder;
      if (digit.isNegative()) {
        // Adjust for negative remainders (e.g., in Python-style division)
        digit = base.minus(digit).abs();
        currentNum = currentNum.next();
      }
      outputDigits.push(digit.toJSNumber());
    }
    outputDigits.push(currentNum.toJSNumber()); // Add the last quotient
    return {
      value: outputDigits.reverse(),
      isNegative: isNegative
    };
  }

  // Converts a NumValue to a string in a specified base
  function convertToBaseString(num, base) {
    var arr = convertToBaseRepresentation(num, base);
    return (arr.isNegative ? "-" : "") + arr.value.map(digitToStringRep).join("");
  }

  LargeNumber.prototype.toArray = function(radix) {
    return convertToBaseRepresentation(this, radix);
  };
  TinyNumber.prototype.toArray = function(radix) {
    return convertToBaseRepresentation(this, radix);
  };

  LargeNumber.prototype.toString = function(radix) {
    if (radix === void0) radix = 10;
    if (radix !== 10) return convertToBaseString(this, radix);

    var chunkArr = this.chunkData,
      len = chunkArr.length;
    var stringRep = String(chunkArr[--len]); // Start with MSB chunk
    var zeroPad = "0000000"; // For padding chunks to 7 digits
    var currentChunkDigit;

    while (--len >= 0) {
      currentChunkDigit = String(chunkArr[len]);
      stringRep += zeroPad.slice(currentChunkDigit.length) + currentChunkDigit;
    }
    var signPrefix = this.isNegative ? "-" : "";
    return signPrefix + stringRep;
  };
  TinyNumber.prototype.toString = function(radix) {
    if (radix === void0) radix = 10;
    if (radix != 10) return convertToBaseString(this, radix);
    return String(this.value);
  };

  LargeNumber.prototype.toJSON = TinyNumber.prototype.toJSON = function() {
    return this.toString();
  };

  LargeNumber.prototype.valueOf = function() {
    // Attempt to convert to native JS number, may lose precision
    return parseInt(this.toString(), 10);
  };
  LargeNumber.prototype.toJSNumber = LargeNumber.prototype.valueOf;

  TinyNumber.prototype.valueOf = function() {
    return this.value;
  };
  TinyNumber.prototype.toJSNumber = TinyNumber.prototype.valueOf;

  // Parses a string into a NumValue
  function parseStringNumeric(strValue) {
    // Check if it's a simple number that fits JS_MAX_SAFE_INTEGER
    if (isJsPrecise(+strValue)) {
      var num = +strValue;
      if (num === floorOrCeil(num)) return new TinyNumber(num);
      throw new Error("Invalid integer string: " + strValue + " contains a decimal part.");
    }

    var isNegative = strValue[0] === "-";
    if (isNegative) strValue = strValue.slice(1);

    // Handle scientific notation (e.g., "1.23e+5")
    var scientificSplit = strValue.split(/e/i);
    if (scientificSplit.length > 2) throw new Error("Invalid integer string: " + scientificSplit.join("e") + " has multiple 'e's.");
    if (scientificSplit.length === 2) {
      var exponentPart = scientificSplit[1];
      if (exponentPart[0] === "+") exponentPart = exponentPart.slice(1);
      exponentPart = +exponentPart;
      if (exponentPart !== floorOrCeil(exponentPart) || !isJsPrecise(exponentPart)) {
        throw new Error("Invalid integer string: exponent " + exponentPart + " is not a valid integer.");
      }
      var basePart = scientificSplit[0];
      var decimalPointIndex = basePart.indexOf(".");
      if (decimalPointIndex >= 0) {
        exponentPart -= (basePart.length - decimalPointIndex - 1); // Adjust exponent for decimal places
        basePart = basePart.slice(0, decimalPointIndex) + basePart.slice(decimalPointIndex + 1);
      }
      if (exponentPart < 0) {
        throw new Error("Cannot parse negative exponent part for integers: " + strValue);
      }
      basePart += new Array(exponentPart + 1).join("0"); // Append zeros
      strValue = basePart;
    }

    // Validate remaining string as pure digits
    var digitRegex = /^([0-9][0-9]*)$/;
    if (!digitRegex.test(strValue)) {
      throw new Error("Invalid integer string: " + strValue + " contains non-digit characters.");
    }

    var chunkArray = [];
    var currentMaxLength = strValue.length,
      currentMinLength = currentMaxLength - DIGITS_PER_CHUNK;

    // Split string into chunks from right to left
    while (currentMaxLength > 0) {
      chunkArray.push(+strValue.slice(Math.max(0, currentMinLength), currentMaxLength));
      currentMinLength -= DIGITS_PER_CHUNK;
      currentMaxLength -= DIGITS_PER_CHUNK;
    }
    normalizeChunks(chunkArray);
    return new LargeNumber(chunkArray, isNegative);
  }

  // Parses a native JavaScript number into a NumValue
  function parseJsNumeric(numValue) {
    if (isJsPrecise(numValue)) {
      if (numValue !== floorOrCeil(numValue)) {
        throw new Error(numValue + " is not an integer.");
      }
      return new TinyNumber(numValue);
    }
    // If too large for small integer, convert to string and parse
    return parseStringNumeric(numValue.toString());
  }

  // Main parsing function, handles various input types
  function parseInputToNumValue(input) {
    if (typeof input === "number") {
      return parseJsNumeric(input);
    }
    if (typeof input === "string") {
      return parseStringNumeric(input);
    }
    // Assume it's already a NumValue instance
    return input;
  }

  // Pre-instantiate small integer objects for performance
  for (var i = 0; i < 1000; i++) { // Changed from 1e3 to 1000 for clarity
    NumValue[i] = new TinyNumber(i);
    if (i > 0) NumValue[-i] = new TinyNumber(-i);
  }
  NumValue.one = NumValue[1];
  NumValue.zero = NumValue[0];
  NumValue.minusOne = NumValue[-1];

  // Attach utility functions to the NumValue object
  NumValue.max = getMaximum;
  NumValue.min = getMinimum;
  NumValue.gcd = greatestCommonDivisor;
  NumValue.lcm = leastCommonMultiple;
  NumValue.isInstance = function(x) {
    return x instanceof LargeNumber || x instanceof TinyNumber;
  };
  NumValue.randBetween = generateRandomBetween;
  NumValue.fromArray = function(digits, base, isNegative) {
    return parseFromChunkArray(digits.map(parseInputToNumValue), parseInputToNumValue(base || 10), isNegative);
  };

  return NumValue;
})();

const InputReader = (function() {
  // Helper function to create an instance of the line processor
  function createLineProcessor(rawSourceText) {
    // Basic validation for input type
    if (typeof rawSourceText !== 'string') {
      console.warn("InputReader received non-string input. Coercing to string.");
      rawSourceText = String(rawSourceText);
    }
    return new LineProcessor(rawSourceText);
  }

  // Class to handle processing lines from the input source
  function LineProcessor(sourceContent) {
    this.sourceLines = sourceContent.trim().split("\n");
    this.currentLineIndex = 0; // Tracks which line we are currently on
    // Cache for split lines that are read by 'readNextValue'
    this.currentLineTokens = null;
  }

  // Reads a single value from the current line, advancing within the line.
  // If the line is exhausted, moves to the next line.
  LineProcessor.prototype.readNextValue = function(returnAsString = false) {
    // If current line tokens are not initialized or exhausted, get the next line
    if (!this.currentLineTokens || this.currentLineTokens.length === 0) {
      if (this.currentLineIndex >= this.sourceLines.length) {
        throw new Error("InputReader: Attempted to read past end of input.");
      }
      const line = this.sourceLines[this.currentLineIndex];
      // Skip empty lines
      if (!line.trim()) {
        this.currentLineIndex++;
        return this.readNextValue(returnAsString); // Recurse to find next non-empty line
      }
      this.currentLineTokens = line.split(" ");
      // Optimization: if we always read from the left, no need to reverse
      // Original used reverse + pop. Let's use shift for natural order.
    }

    const token = this.currentLineTokens.shift(); // Get the first token
    if (this.currentLineTokens.length === 0) {
      this.currentLineIndex++; // Move to next line if current one is now empty
    }

    // Return as string or parsed number
    return returnAsString ? token : Number(token);
  };

  // Reads an entire line, splitting it into an array of values.
  LineProcessor.prototype.readLineValues = function(returnAsStrings = false) {
    if (this.currentLineIndex >= this.sourceLines.length) {
      throw new Error("InputReader: Attempted to read line past end of input.");
    }
    const lineContent = this.sourceLines[this.currentLineIndex++];
    const tokens = lineContent.split(" ");

    // Clear any pending tokens from previous `readNextValue` calls
    this.currentLineTokens = null;

    return returnAsStrings ? tokens : tokens.map(val => Number(val));
  };

  // Reads a block of 'numRows' lines, parsing each into an array of values, forming a matrix.
  LineProcessor.prototype.readMatrixBlock = function(numRows, returnAsStrings = false) {
    if (this.currentLineIndex + numRows > this.sourceLines.length) {
      throw new Error(`InputReader: Cannot read ${numRows} rows, not enough lines remaining.`);
    }
    const matrixData = [];
    for (let rowIdx = 0; rowIdx < numRows; rowIdx++) {
      const lineContent = this.sourceLines[this.currentLineIndex++];
      const rowTokens = lineContent.split(" ");
      matrixData.push(returnAsStrings ? rowTokens : rowTokens.map(val => Number(val)));
    }
    // Clear any pending tokens
    this.currentLineTokens = null;
    return matrixData;
  };

  // Reads 'numLines' raw lines without splitting.
  LineProcessor.prototype.readRawLines = function(numLines, returnAsStrings = true) {
    if (this.currentLineIndex + numLines > this.sourceLines.length) {
      throw new Error(`InputReader: Cannot read ${numLines} raw lines, not enough lines remaining.`);
    }
    const rawLines = [];
    for (let i = 0; i < numLines; i++) {
      rawLines.push(this.sourceLines[this.currentLineIndex++]);
    }
    // Clear any pending tokens
    this.currentLineTokens = null;
    return rawLines;
  };

  return createLineProcessor;
})();

// Centralized input acquisition and error handling
let inputSourceContent;
try {
  // Using 'process.argv' for a more robust CLI input, or fallback to stdin
  const fsModule = require("fs");
  const inputFilePath = process.argv[2] || "/dev/stdin";
  inputSourceContent = fsModule.readFileSync(inputFilePath, "utf8");
} catch (fileError) {
  console.error("Failed to read input:", fileError.message);
  // Provide a minimal default input for testing/fallback if file read fails
  inputSourceContent = "5 2\n1 2 3 4 5";
  console.warn("Using fallback input for demonstration due to file read error.");
}

const dataProcessor = InputReader(inputSourceContent);
const largeNumberFactory = hugeNum(); // Initialize the huge number library

// Main computation function
function calculateOptimalSum() {
  // Read problem parameters
  const countElements = dataProcessor.readNextValue(); // N
  const targetThreshold = dataProcessor.readNextValue(); // K
  const elementArray = dataProcessor.readLineValues(); // A

  // Input validation
  if (countElements <= 0 || targetThreshold <= 0 || !Array.isArray(elementArray) || elementArray.length !== countElements) {
    throw new Error("Invalid input parameters: N, K must be positive, and array A must match N elements.");
  }

  // Step 1: Compute prefix sums (cumulative sums)
  // Original: var s = [0]; for(var i = 0; i < n;i++)s[i+1] = s[i] + a[i];
  const prefixSums = [0];
  elementArray.forEach((val, idx) => {
    prefixSums.push(prefixSums[idx] + val);
  });
  // console.log("Prefix Sums:", prefixSums); // Debugging aid

  // Step 2: Generate all possible subarray sums and count their occurrences
  // Original: var w = [], max = 0, x = {};
  const distinctSums = []; // Stores unique sums
  const sumFrequencies = new Map(); // Maps sum to its count
  let maximumSum = 0; // Tracks the largest sum found

  for (let startIdx = 0; startIdx < countElements; startIdx++) {
    for (let endIdx = startIdx + 1; endIdx <= countElements; endIdx++) {
      const currentSubarraySum = prefixSums[endIdx] - prefixSums[startIdx];
      // Update frequency map
      if (sumFrequencies.has(currentSubarraySum)) {
        sumFrequencies.set(currentSubarraySum, sumFrequencies.get(currentSubarraySum) + 1);
      } else {
        distinctSums.push(currentSubarraySum);
        sumFrequencies.set(currentSubarraySum, 1);
      }
      // Update maximum sum
      if (currentSubarraySum > maximumSum) {
        maximumSum = currentSubarraySum;
      }
    }
  }
  // console.log("Distinct Sums:", distinctSums);
  // console.log("Sum Frequencies:", sumFrequencies);
  // console.log("Maximum Sum:", maximumSum);

  // Step 3: Determine the highest possible bit position for the maximum sum
  // Original: var q = 0; while(max > 1)max = Math.floor(max / 2), q++;
  // Using Math.log2 for a more direct calculation
  let highestBitPosition = (maximumSum > 0) ? Math.floor(Math.log2(maximumSum)) : -1;
  // console.log("Highest Bit Position (q):", highestBitPosition);

  // Step 4: Iteratively build the answer by checking bit positions from most significant to least significant
  // Original: var ans = bi; for(i = q; i >= 0; i--){...}
  let finalResult = largeNumberFactory.zero; // Initialize result as 0 (using bigInt equivalent)
  let currentCandidateSums = distinctSums; // Start with all distinct sums

  for (let bitIdx = highestBitPosition; bitIdx >= 0; bitIdx--) {
    // Calculate the value of the current bit (e.g., 2^bitIdx) using the largeNumberFactory
    const currentBitValue = largeNumberFactory.one.shiftLeft(bitIdx);
    // console.log(`Checking bit ${bitIdx}, value: ${currentBitValue.toString()}`);

    let sumsWithBitSet = [];
    let countSumsWithBitSet = 0;

    // Filter current candidate sums: only keep those that have the current bit set
    for (const sum of currentCandidateSums) {
      // Check if (sum AND currentBitValue) is non-zero
      // Original: if(!z.and(w[j]).isZero()){t.push(w[j]); c += x[w[j]];}
      const sumAsHugeNum = largeNumberFactory(sum);
      if (!sumAsHugeNum.and(currentBitValue).isZero()) {
        sumsWithBitSet.push(sum);
        countSumsWithBitSet += sumFrequencies.get(sum);
      }
    }
    // console.log(`  Sums with bit set: ${sumsWithBitSet.length}, total count: ${countSumsWithBitSet}`);

    // If the count of sums with this bit set meets or exceeds the threshold K,
    // then this bit contributes to the final answer. Update the result and
    // narrow down the candidate sums for the next iteration.
    // Original: if(c >= k){ans = ans.add(z); w = t;}
    if (countSumsWithBitSet >= targetThreshold) {
      finalResult = finalResult.add(currentBitValue);
      currentCandidateSums = sumsWithBitSet; // Only consider these sums for lower bits
      // console.log(`  Bit ${bitIdx} is part of the answer. Current result: ${finalResult.toString()}`);
    }
  }

  return finalResult.toString();
}

// Execute the solution and print the result
console.log(calculateOptimalSum());