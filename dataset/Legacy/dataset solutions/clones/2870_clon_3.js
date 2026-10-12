const largeNumberModule=(voidValue)=>{
  "use strict";

  // Constants for internal representation and JavaScript's safe integer limits
  const CHUNK_SIZE = 1e7; // Each chunk stores up to 10^7
  const CHUNK_DIGITS = 7; // Number of decimal digits per chunk
  const MAX_SAFE_JS_INT = 9007199254740992; // 2^53
  const MAX_SAFE_JS_ARRAY = decomposeSmallToChunks(MAX_SAFE_JS_INT); // MAX_SAFE_JS_INT as a chunk array
  const LOG_MAX_SAFE_JS_INT = Math.log(MAX_SAFE_JS_INT); // Log for optimization

  // Base class/factory for all number types
  function NumBaseFactory(val, baseRadix) {
    if (val === voidValue || val === null) {
      return NumBaseFactory._zero; // Return pre-cached zero
    }
    if (baseRadix !== voidValue) {
      return +baseRadix === 10 ? parseNumericValue(val) : parseStringWithBase(val, baseRadix);
    }
    return parseNumericValue(val);
  }

  // Represents very large numbers as an array of fixed-size "chunks"
  function HugeNum(chunkList, isNegative) {
    this.internalValue = chunkList; // Array of number chunks
    this.isNegative = isNegative; // Boolean: true if negative
    this.isCompact = false; // Flag to distinguish from CompactNum
  }
  HugeNum.prototype = Object.create(NumBaseFactory.prototype); // Inherit from base

  // Represents numbers that fit within JavaScript's safe integer limits
  function CompactNum(numericValue) {
    this.internalValue = numericValue; // Raw JavaScript number
    this.isNegative = numericValue < 0; // Boolean: true if negative
    this.isCompact = true; // Flag to distinguish from HugeNum
  }
  CompactNum.prototype = Object.create(NumBaseFactory.prototype); // Inherit from base

  // Checks if a given JavaScript number is within the safe integer range
  function isWithinSafeIntegerRange(n) {
    return n > -MAX_SAFE_JS_INT && n < MAX_SAFE_JS_INT;
  }

  // Converts a small integer into its chunk array representation
  function decomposeSmallToChunks(numVal) {
    if (numVal < CHUNK_SIZE) return [numVal];
    if (numVal < CHUNK_SIZE * CHUNK_SIZE) return [numVal % CHUNK_SIZE, Math.floor(numVal / CHUNK_SIZE)];
    return [numVal % CHUNK_SIZE, Math.floor(numVal / CHUNK_SIZE) % CHUNK_SIZE, Math.floor(numVal / (CHUNK_SIZE * CHUNK_SIZE))];
  }

  // Converts a chunk array back into a small integer if possible
  function composeChunksToSmall(chunkArr) {
    normalizeChunkArray(chunkArr);
    const chunkCount = chunkArr.length;
    // Check if the array represents a number within MAX_SAFE_JS_INT and has few chunks
    if (chunkCount < 4 && compareAbsoluteChunks(chunkArr, MAX_SAFE_JS_ARRAY) < 0) {
      switch (chunkCount) {
        case 0: return 0;
        case 1: return chunkArr[0];
        case 2: return chunkArr[0] + chunkArr[1] * CHUNK_SIZE;
        default: return chunkArr[0] + (chunkArr[1] + chunkArr[2] * CHUNK_SIZE) * CHUNK_SIZE;
      }
    }
    return chunkArr; // If too large or complex, return the array
  }

  // Removes leading zeros from a chunk array (normalizes it)
  function normalizeChunkArray(chunkVector) {
    let index = chunkVector.length;
    while (index > 0 && chunkVector[--index] === 0);
    chunkVector.length = index + 1;
  }

  // Creates an array of a given length, initialized with zeros
  function initializeZeroArray(size) {
    const newArray = new Array(size);
    for (let i = 0; i < size; i++) {
      newArray[i] = 0;
    }
    return newArray;
  }

  // Truncates a number (floor for positive, ceil for negative)
  function chopDecimal(val) {
    return val > 0 ? Math.floor(val) : Math.ceil(val);
  }

  // Performs addition on two chunk arrays (assuming both are positive)
  function sumChunkArrays(arrA, arrB) {
    const lenA = arrA.length;
    const lenB = arrB.length;
    const resultArr = new Array(lenA);
    let carry = 0;
    let currentSum;
    let i = 0;

    // Add corresponding chunks from both arrays
    for (; i < lenB; i++) {
      currentSum = arrA[i] + arrB[i] + carry;
      carry = Math.floor(currentSum / CHUNK_SIZE);
      resultArr[i] = currentSum % CHUNK_SIZE;
    }

    // Add remaining chunks from the longer array with carry
    while (i < lenA) {
      currentSum = arrA[i] + carry;
      carry = Math.floor(currentSum / CHUNK_SIZE);
      resultArr[i++] = currentSum % CHUNK_SIZE;
    }

    // If there's a final carry, add it
    if (carry > 0) resultArr.push(carry);
    return resultArr;
  }

  // Flexible addition for chunk arrays, ensures longer array is first argument
  function sumChunkArraysFlexible(arrA, arrB) {
    return arrA.length >= arrB.length ? sumChunkArrays(arrA, arrB) : sumChunkArrays(arrB, arrA);
  }

  // Adds a small integer (carry) to a chunk array
  function sumChunkArrayWithSmall(chunkArr, smallCarry) {
    const len = chunkArr.length;
    const resultArr = new Array(len);
    let currentCarry = smallCarry;
    let currentSum;
    let i = 0;

    for (; i < len; i++) {
      currentSum = chunkArr[i] + currentCarry;
      currentCarry = Math.floor(currentSum / CHUNK_SIZE);
      resultArr[i] = currentSum % CHUNK_SIZE;
    }

    // Propagate any remaining carry
    while (currentCarry > 0) {
      resultArr[i++] = currentCarry % CHUNK_SIZE;
      currentCarry = Math.floor(currentCarry / CHUNK_SIZE);
    }
    return resultArr;
  }

  // HugeNum.prototype.sum method
  HugeNum.prototype.sum = function(operand) {
    const otherNum = parseNumericValue(operand);
    if (this.isNegative !== otherNum.isNegative) {
      return this.difference(otherNum.invertSign());
    }
    const valA = this.internalValue;
    const valB = otherNum.internalValue;

    // If adding a CompactNum, convert its value to a small integer (absolute)
    if (otherNum.isCompact) {
      // Direct sum if both are compact and fit
      if (this.isCompact && isWithinSafeIntegerRange(this.internalValue + otherNum.internalValue)) {
          return new CompactNum(this.internalValue + otherNum.internalValue);
      }
      return new HugeNum(sumChunkArrayWithSmall(valA, Math.abs(valB)), this.isNegative);
    }
    return new HugeNum(sumChunkArraysFlexible(valA, valB), this.isNegative);
  };
  HugeNum.prototype.addAlias = HugeNum.prototype.sum;

  // CompactNum.prototype.sum method
  CompactNum.prototype.sum = function(operand) {
    const otherNum = parseNumericValue(operand);
    const selfVal = this.internalValue;

    // If signs differ, convert to subtraction
    if ((selfVal < 0) !== otherNum.isNegative) {
      return this.difference(otherNum.invertSign());
    }

    // If both are compact, try direct addition
    if (otherNum.isCompact) {
      const otherVal = otherNum.internalValue;
      if (isWithinSafeIntegerRange(selfVal + otherVal)) {
        return new CompactNum(selfVal + otherVal);
      }
      // If sum overflows, convert to chunk array addition
      const absOtherVal = decomposeSmallToChunks(Math.abs(otherVal));
      return new HugeNum(sumChunkArrayWithSmall(absOtherVal, Math.abs(selfVal)), selfVal < 0);
    }

    // If one is compact and one is huge, convert compact to chunk array and add
    const otherVal = otherNum.internalValue;
    return new HugeNum(sumChunkArrayWithSmall(otherVal, Math.abs(selfVal)), selfVal < 0);
  };
  CompactNum.prototype.addAlias = CompactNum.prototype.sum;

  // Performs subtraction on two chunk arrays (arrA - arrB, assuming arrA >= arrB and both positive)
  function subtractChunkArrays(arrA, arrB) {
    const lenA = arrA.length;
    const lenB = arrB.length;
    const resultArr = new Array(lenA);
    let borrow = 0;
    let currentDiff;
    let i = 0;

    // Subtract corresponding chunks
    for (; i < lenB; i++) {
      currentDiff = arrA[i] - borrow - arrB[i];
      if (currentDiff < 0) {
        currentDiff += CHUNK_SIZE;
        borrow = 1;
      } else {
        borrow = 0;
      }
      resultArr[i] = currentDiff;
    }

    // Subtract remaining chunks from arrA with borrow
    for (; i < lenA; i++) {
      currentDiff = arrA[i] - borrow;
      if (currentDiff < 0) {
        currentDiff += CHUNK_SIZE;
      } else {
        resultArr[i++] = currentDiff; // If no borrow, add and break
        break;
      }
      resultArr[i] = currentDiff;
    }

    // Copy remaining chunks from arrA if any
    for (; i < lenA; i++) {
      resultArr[i] = arrA[i];
    }
    normalizeChunkArray(resultArr);
    return resultArr;
  }

  // Flexible subtraction for chunk arrays, handles signs and magnitude comparison
  function subtractChunkArraysFlexible(arrA, arrB, currentSign) {
    let resultValue;
    let finalSign = currentSign;

    if (compareAbsoluteChunks(arrA, arrB) >= 0) {
      resultValue = subtractChunkArrays(arrA, arrB);
    } else {
      resultValue = subtractChunkArrays(arrB, arrA);
      finalSign = !finalSign; // Flip sign if B was larger
    }

    // Try to convert to CompactNum if result is small enough
    resultValue = composeChunksToSmall(resultValue);
    if (typeof resultValue === "number") {
      if (finalSign) resultValue = -resultValue;
      return new CompactNum(resultValue);
    }
    return new HugeNum(resultValue, finalSign);
  }

  // Subtracts a small integer (absolute value) from a chunk array
  function subtractChunkArrayBySmall(chunkArr, smallVal, currentSign) {
    const len = chunkArr.length;
    const resultArr = new Array(len);
    let currentCarry = -smallVal; // Negative value acts as borrow
    let currentDiff;
    let i = 0;

    for (; i < len; i++) {
      currentDiff = chunkArr[i] + currentCarry;
      currentCarry = Math.floor(currentDiff / CHUNK_SIZE); // Determine borrow/carry
      currentDiff %= CHUNK_SIZE;
      resultArr[i] = currentDiff < 0 ? currentDiff + CHUNK_SIZE : currentDiff; // Ensure positive chunk
    }

    // Try to convert to CompactNum if result is small enough
    const composedResult = composeChunksToSmall(resultArr);
    if (typeof composedResult === "number") {
      if (currentSign) composedResult = -composedResult;
      return new CompactNum(composedResult);
    }
    return new HugeNum(composedResult, currentSign);
  }

  // HugeNum.prototype.difference method
  HugeNum.prototype.difference = function(operand) {
    const otherNum = parseNumericValue(operand);
    if (this.isNegative !== otherNum.isNegative) {
      return this.sum(otherNum.invertSign());
    }
    const valA = this.internalValue;
    const valB = otherNum.internalValue;

    if (otherNum.isCompact) {
      // If subtracting a CompactNum, convert its value to absolute
      return subtractChunkArrayBySmall(valA, Math.abs(valB), this.isNegative);
    }
    return subtractChunkArraysFlexible(valA, valB, this.isNegative);
  };
  HugeNum.prototype.subtractAlias = HugeNum.prototype.difference;

  // CompactNum.prototype.difference method
  CompactNum.prototype.difference = function(operand) {
    const otherNum = parseNumericValue(operand);
    const selfVal = this.internalValue;

    // If signs differ, convert to addition
    if ((selfVal < 0) !== otherNum.isNegative) {
      return this.sum(otherNum.invertSign());
    }

    // If both are compact, try direct subtraction
    if (otherNum.isCompact) {
      const otherVal = otherNum.internalValue;
      if (isWithinSafeIntegerRange(selfVal - otherVal)) {
          return new CompactNum(selfVal - otherVal);
      }
      // If result overflows, convert to chunk array subtraction (B-A if A is smaller)
      const absSelfVal = Math.abs(selfVal);
      const absOtherVal = Math.abs(otherNum.internalValue);
      if (absSelfVal >= absOtherVal) {
          return subtractChunkArrayBySmall(decomposeSmallToChunks(absSelfVal), absOtherVal, selfVal < 0);
      } else {
          return subtractChunkArrayBySmall(decomposeSmallToChunks(absOtherVal), absSelfVal, !(selfVal < 0));
      }
    }

    // If one is compact and one is huge, convert compact to chunk array and subtract
    const otherVal = otherNum.internalValue;
    return subtractChunkArrayBySmall(otherVal, Math.abs(selfVal), selfVal >= 0);
  };
  CompactNum.prototype.subtractAlias = CompactNum.prototype.difference;

  // Inverts the sign of a HugeNum
  HugeNum.prototype.invertSign = function() {
    return new HugeNum(this.internalValue, !this.isNegative);
  };

  // Inverts the sign of a CompactNum
  CompactNum.prototype.invertSign = function() {
    const newSign = !this.isNegative;
    const compactResult = new CompactNum(-this.internalValue);
    compactResult.isNegative = newSign; // Ensure sign is correctly set
    return compactResult;
  };

  // Returns the absolute value of a HugeNum
  HugeNum.prototype.absoluteValue = function() {
    return new HugeNum(this.internalValue, false);
  };

  // Returns the absolute value of a CompactNum
  CompactNum.prototype.absoluteValue = function() {
    return new CompactNum(Math.abs(this.internalValue));
  };

  // Standard long multiplication for chunk arrays
  function multiplyChunkArraysStandard(arrA, arrB) {
    const lenA = arrA.length;
    const lenB = arrB.length;
    const resultLen = lenA + lenB;
    const resultArr = initializeZeroArray(resultLen);
    let product, carry;

    for (let i = 0; i < lenA; ++i) {
      const chunkA_i = arrA[i];
      for (let j = 0; j < lenB; ++j) {
        const chunkB_j = arrB[j];
        product = chunkA_i * chunkB_j + resultArr[i + j];
        carry = Math.floor(product / CHUNK_SIZE);
        resultArr[i + j] = product % CHUNK_SIZE;
        resultArr[i + j + 1] += carry;
      }
    }
    normalizeChunkArray(resultArr);
    return resultArr;
  }

  // Multiplies a chunk array by a small integer
  function multiplyChunkArrayBySmall(chunkArr, smallVal) {
    const len = chunkArr.length;
    const resultArr = new Array(len);
    let carry = 0;
    let product;

    for (let i = 0; i < len; i++) {
      product = chunkArr[i] * smallVal + carry;
      carry = Math.floor(product / CHUNK_SIZE);
      resultArr[i] = product % CHUNK_SIZE;
    }

    // Propagate any remaining carry
    while (carry > 0) {
      resultArr.push(carry % CHUNK_SIZE);
      carry = Math.floor(carry / CHUNK_SIZE);
    }
    return resultArr;
  }

  // Helper for Karatsuba to append zeros (effectively shift left by chunks)
  function appendZeroChunks(chunkArr, numZeros) {
    const padded = [];
    for (let i = 0; i < numZeros; i++) padded.push(0);
    return padded.concat(chunkArr);
  }

  // Karatsuba multiplication algorithm for large chunk arrays
  function karatsubaMultiply(xChunks, yChunks) {
    const len = Math.max(xChunks.length, yChunks.length);

    // Base case: if arrays are small, use standard multiplication
    if (len <= 30) { // Threshold can be tuned
      return multiplyChunkArraysStandard(xChunks, yChunks);
    }

    // Split point for Karatsuba
    const halfLen = Math.ceil(len / 2);

    // Split xChunks and yChunks into two parts
    const b = xChunks.slice(halfLen);
    const a = xChunks.slice(0, halfLen);
    const d = yChunks.slice(halfLen);
    const c = yChunks.slice(0, halfLen);

    // Recursively compute products
    const ac = karatsubaMultiply(a, c);
    const bd = karatsubaMultiply(b, d);
    const abcd = karatsubaMultiply(sumChunkArraysFlexible(a, b), sumChunkArraysFlexible(c, d));

    // Combine results using the Karatsuba formula:
    // (a*BASE^n + b) * (c*BASE^n + d) = ac*BASE^2n + (ad+bc)*BASE^n + bd
    // ad+bc = (a+b)(c+d) - ac - bd
    let middleTerm = subtractChunkArrays(subtractChunkArrays(abcd, ac), bd);
    middleTerm = appendZeroChunks(middleTerm, halfLen); // Shift by n chunks

    let finalProduct = sumChunkArraysFlexible(sumChunkArraysFlexible(appendZeroChunks(ac, 2 * halfLen), middleTerm), bd);
    normalizeChunkArray(finalProduct);
    return finalProduct;
  }

  // Heuristic to decide whether to use Karatsuba or standard multiplication
  function shouldUseKaratsuba(len1, len2) {
    // This is an empirical formula, original constant for comparison.
    // A simplified version could just be based on a fixed length threshold.
    return -0.012 * len1 - 0.012 * len2 + 0.000015 * len1 * len2 > 0;
  }

  // HugeNum.prototype.product method
  HugeNum.prototype.product = function(operand) {
    const otherNum = parseNumericValue(operand);
    const valA = this.internalValue;
    let valB = otherNum.internalValue;
    const finalSign = this.isNegative !== otherNum.isNegative; // XOR for sign

    // Handle multiplication by CompactNum
    if (otherNum.isCompact) {
      const smallVal = otherNum.internalValue;
      if (smallVal === 0) return NumBaseFactory._zero;
      if (smallVal === 1) return this;
      if (smallVal === -1) return this.invertSign();

      const absSmallVal = Math.abs(smallVal);
      // If small value fits within a single chunk, use optimized small multiplication
      if (absSmallVal < CHUNK_SIZE) {
        return new HugeNum(multiplyChunkArrayBySmall(valA, absSmallVal), finalSign);
      }
      // Otherwise, convert small value to chunk array for general multiplication
      valB = decomposeSmallToChunks(absSmallVal);
    }

    // Decide between Karatsuba and standard multiplication
    if (shouldUseKaratsuba(valA.length, valB.length)) {
      return new HugeNum(karatsubaMultiply(valA, valB), finalSign);
    }
    return new HugeNum(multiplyChunkArraysStandard(valA, valB), finalSign);
  };
  HugeNum.prototype.multiplyAlias = HugeNum.prototype.product;

  // Helper for multiplying a small number by a chunk array, returning a HugeNum
  function productSmallAndChunkArray(smallFactor, chunkArr, finalSign) {
    if (smallFactor < CHUNK_SIZE) {
      return new HugeNum(multiplyChunkArrayBySmall(chunkArr, smallFactor), finalSign);
    }
    return new HugeNum(multiplyChunkArraysStandard(chunkArr, decomposeSmallToChunks(smallFactor)), finalSign);
  }

  // HugeNum's internal multiplication by a CompactNum helper
  HugeNum.prototype._multiplyByCompact = function(compactOperand) {
    if (compactOperand.internalValue === 0) return NumBaseFactory._zero;
    if (compactOperand.internalValue === 1) return this;
    if (compactOperand.internalValue === -1) return this.invertSign();
    return productSmallAndChunkArray(Math.abs(compactOperand.internalValue), this.internalValue, this.isNegative !== compactOperand.isNegative);
  };

  // CompactNum's internal multiplication by a CompactNum helper
  CompactNum.prototype._multiplyByCompact = function(compactOperand) {
    const product = compactOperand.internalValue * this.internalValue;
    if (isWithinSafeIntegerRange(product)) {
      return new CompactNum(product);
    }
    // If product overflows, convert to HugeNum multiplication
    return productSmallAndChunkArray(Math.abs(compactOperand.internalValue), decomposeSmallToChunks(Math.abs(this.internalValue)), this.isNegative !== compactOperand.isNegative);
  };

  // CompactNum.prototype.product method
  CompactNum.prototype.product = function(operand) {
    // Delegate to internal helper, ensuring operand is parsed
    return parseNumericValue(operand)._multiplyByCompact(this);
  };
  CompactNum.prototype.multiplyAlias = CompactNum.prototype.product;


  // Squares a chunk array using a specialized algorithm (optimization for A*A)
  function squareChunkArray(arr) {
    const len = arr.length;
    const resultArr = initializeZeroArray(2 * len); // Result can be up to 2*len chunks
    let product, carry;

    for (let i = 0; i < len; i++) {
      const chunk_i = arr[i];
      carry = 0; // Reset carry for each outer loop iteration

      // Calculate diagonal and upper triangle contributions
      for (let j = 0; j < len; j++) {
        const chunk_j = arr[j];
        if (i === j) { // Diagonal term
          product = chunk_i * chunk_j + resultArr[i + j] + carry;
        } else if (i < j) { // Only need to calculate upper triangle, then double
          product = 2 * (chunk_i * chunk_j) + resultArr[i + j] + carry;
        } else { // Lower triangle already covered by symmetry, skip
          continue;
        }
        carry = Math.floor(product / CHUNK_SIZE);
        resultArr[i + j] = product % CHUNK_SIZE;
      }
      resultArr[i + len] += carry; // Add remaining carry to the next chunk
    }
    normalizeChunkArray(resultArr);
    return resultArr;
  }

  // HugeNum.prototype.raiseToPowerTwo method
  HugeNum.prototype.raiseToPowerTwo = function() {
    return new HugeNum(squareChunkArray(this.internalValue), false); // Square is always positive
  };

  // CompactNum.prototype.raiseToPowerTwo method
  CompactNum.prototype.raiseToPowerTwo = function() {
    const squaredVal = this.internalValue * this.internalValue;
    if (isWithinSafeIntegerRange(squaredVal)) return new CompactNum(squaredVal);
    // If squared value overflows, convert to HugeNum operation
    return new HugeNum(squareChunkArray(decomposeSmallToChunks(Math.abs(this.internalValue))), false);
  };

  // Division and Modulo (Algorithm 1: Knuth's D-algorithm, for larger numbers)
  function divideAndModStandard(dividendChunks, divisorChunks) {
    const dividendLen = dividendChunks.length;
    const divisorLen = divisorChunks.length;
    const quotientArr = initializeZeroArray(divisorLen); // Quotient result array

    // Normalize divisor and dividend for D-algorithm (D1 step)
    // Scale by lambda to make divisor[divisorLen-1] >= CHUNK_SIZE/2
    const divisorMostSignificantDigit = divisorChunks[divisorLen - 1];
    const lambda = Math.ceil(CHUNK_SIZE / (2 * divisorMostSignificantDigit)); // Normalization factor
    const scaledDividend = multiplyChunkArrayBySmall(dividendChunks, lambda);
    const scaledDivisor = multiplyChunkArrayBySmall(divisorChunks, lambda);

    // Adjust dividend length if scaling increased it
    if (scaledDividend.length <= dividendLen) scaledDividend.push(0);
    scaledDivisor.push(0); // Pad divisor with a zero for easier indexing

    const normDivisorMSD = scaledDivisor[divisorLen - 1]; // Most significant digit of normalized divisor

    // D3: Loop for each quotient digit
    for (let shift = dividendLen - divisorLen; shift >= 0; shift--) {
      let currentQuotientDigit = CHUNK_SIZE - 1; // Initial guess for quotient digit

      // D3.1: Estimate quotient digit
      const highDividendPart = scaledDividend[shift + divisorLen] * CHUNK_SIZE + scaledDividend[shift + divisorLen - 1];
      if (scaledDividend[shift + divisorLen] !== normDivisorMSD) {
        currentQuotientDigit = Math.floor(highDividendPart / normDivisorMSD);
      }

      // D3.2: Multiply and Subtract (scaledDivisor * currentQuotientDigit) from scaledDividend
      let carry = 0;
      let borrow = 0;
      const currentScaledDivisorLen = scaledDivisor.length;

      for (let i = 0; i < currentScaledDivisorLen; i++) {
        carry += currentQuotientDigit * scaledDivisor[i];
        const q = Math.floor(carry / CHUNK_SIZE);
        borrow += scaledDividend[shift + i] - (carry % CHUNK_SIZE); // Remainder of carry
        carry = q;
        if (borrow < 0) {
          scaledDividend[shift + i] = borrow + CHUNK_SIZE;
          borrow = -1;
        } else {
          scaledDividend[shift + i] = borrow;
          borrow = 0;
        }
      }

      // D3.3: Add back (if guess was too high)
      while (borrow !== 0) {
        currentQuotientDigit -= 1;
        carry = 0;
        for (let i = 0; i < currentScaledDivisorLen; i++) {
          carry += scaledDividend[shift + i] - CHUNK_SIZE + scaledDivisor[i];
          if (carry < 0) {
            scaledDividend[shift + i] = carry + CHUNK_SIZE;
            carry = 0;
          } else {
            scaledDividend[shift + i] = carry;
            carry = 1;
          }
        }
        borrow += carry;
      }
      quotientArr[shift] = currentQuotientDigit;
    }

    // D4: Unnormalize remainder
    const unnormalizedRemainder = divideAndModBySmall(scaledDividend, lambda)[0];
    return [composeChunksToSmall(quotientArr), composeChunksToSmall(unnormalizedRemainder)];
  }

  // Division and Modulo (Algorithm 2: Repeated Subtraction, simpler but slower)
  function divideAndModIterative(dividendChunks, divisorChunks) {
    const dividendLen = dividendChunks.length;
    const divisorLen = divisorChunks.length;
    const resultQuotient = [];
    let currentPartialDividend = []; // Represents the current working part of the dividend

    let currentDividendIdx = dividendLen;
    while (currentDividendIdx > 0) {
      // Take one chunk at a time from the dividend
      currentPartialDividend.unshift(dividendChunks[--currentDividendIdx]);
      normalizeChunkArray(currentPartialDividend); // Remove leading zeros if any

      // If current partial dividend is smaller than divisor, quotient digit is 0
      if (compareAbsoluteChunks(currentPartialDividend, divisorChunks) < 0) {
        resultQuotient.push(0);
        continue;
      }

      // Estimate quotient digit
      let partialLen = currentPartialDividend.length;
      let highPartial = currentPartialDividend[partialLen - 1] * CHUNK_SIZE + (currentPartialDividend[partialLen - 2] || 0);
      let highDivisor = divisorChunks[divisorLen - 1] * CHUNK_SIZE + (divisorChunks[divisorLen - 2] || 0);

      // Adjust highPartial if lengths mismatch significantly
      if (partialLen > divisorLen) {
        highPartial = (highPartial + 1) * CHUNK_SIZE; // Effectively shift left by one chunk
      }
      let estimatedQuotient = Math.ceil(highPartial / highDivisor);

      // Refine quotient digit by trial multiplication and subtraction
      let checkProduct;
      do {
        checkProduct = multiplyChunkArrayBySmall(divisorChunks, estimatedQuotient);
        if (compareAbsoluteChunks(checkProduct, currentPartialDividend) <= 0) break;
        estimatedQuotient--;
      } while (estimatedQuotient > 0); // Ensure quotient doesn't go below 0

      resultQuotient.push(estimatedQuotient);
      currentPartialDividend = subtractChunkArrays(currentPartialDividend, checkProduct); // Update partial dividend
    }
    resultQuotient.reverse(); // Quotient digits were collected in reverse order

    return [composeChunksToSmall(resultQuotient), composeChunksToSmall(currentPartialDividend)];
  }

  // Divides a chunk array by a small integer
  function divideAndModBySmall(chunkArr, smallDivisor) {
    const len = chunkArr.length;
    const quotientArr = initializeZeroArray(len);
    let remainder = 0;
    let currentDivisorPart;
    let q;

    for (let i = len - 1; i >= 0; --i) {
      currentDivisorPart = remainder * CHUNK_SIZE + chunkArr[i];
      q = chopDecimal(currentDivisorPart / smallDivisor);
      remainder = currentDivisorPart - q * smallDivisor; // Calculate new remainder
      quotientArr[i] = q | 0; // Store integer part of quotient
    }
    return [quotientArr, remainder | 0]; // Return quotient array and final remainder
  }

  // Unified division and modulo function
  function flexibleDivideAndMod(selfNum, otherNum) {
    const parsedOther = parseNumericValue(otherNum);
    const dividendChunks = selfNum.internalValue;
    const divisorChunks = parsedOther.internalValue;
    let quotientResult;

    // Guard against division by zero
    if (parsedOther.isZeroValue()) {
      throw new Error("Cannot divide by zero.");
    }

    // Handle CompactNum cases first for efficiency
    if (selfNum.isCompact) {
      if (parsedOther.isCompact) {
        const q = chopDecimal(selfNum.internalValue / parsedOther.internalValue);
        const r = selfNum.internalValue % parsedOther.internalValue;
        return [new CompactNum(q), new CompactNum(r)];
      }
      return [NumBaseFactory._zero, selfNum]; // Small num divided by huge num yields 0 quotient
    }

    // Handle HugeNum divided by CompactNum
    if (parsedOther.isCompact) {
      const smallDivisorVal = parsedOther.internalValue;
      if (smallDivisorVal === 1) return [selfNum, NumBaseFactory._zero];
      if (smallDivisorVal === -1) return [selfNum.invertSign(), NumBaseFactory._zero];

      const absSmallDivisor = Math.abs(smallDivisorVal);
      if (absSmallDivisor < CHUNK_SIZE) { // If small divisor fits in one chunk
        const [chunks, rem] = divideAndModBySmall(dividendChunks, absSmallDivisor);
        const processedQuotient = composeChunksToSmall(chunks);
        let finalRemainder = rem;

        // Adjust remainder sign if original dividend was negative
        if (selfNum.isNegative) finalRemainder = -finalRemainder;

        // Construct quotient object
        let finalQuotient;
        if (typeof processedQuotient === "number") {
          if (selfNum.isNegative !== parsedOther.isNegative) finalQuotient = -processedQuotient;
          else finalQuotient = processedQuotient;
          finalQuotient = new CompactNum(finalQuotient);
        } else {
          finalQuotient = new HugeNum(processedQuotient, selfNum.isNegative !== parsedOther.isNegative);
        }
        return [finalQuotient, new CompactNum(finalRemainder)];
      }
      // If CompactNum is large (multiple chunks), convert to chunk array
      divisorChunks = decomposeSmallToChunks(absSmallDivisor);
    }

    // General HugeNum / HugeNum case
    const comparisonResult = compareAbsoluteChunks(dividendChunks, divisorChunks);
    if (comparisonResult === -1) return [NumBaseFactory._zero, selfNum]; // Dividend < Divisor
    if (comparisonResult === 0) { // Dividend == Divisor
      const finalSign = selfNum.isNegative === parsedOther.isNegative ? NumBaseFactory._one : NumBaseFactory._minusOne;
      return [finalSign, NumBaseFactory._zero];
    }

    // Choose division algorithm based on size
    if (dividendChunks.length + divisorChunks.length <= 200) { // Empirical threshold
      quotientResult = divideAndModStandard(dividendChunks, divisorChunks);
    } else {
      quotientResult = divideAndModIterative(dividendChunks, divisorChunks);
    }

    // Process quotient and remainder
    let finalQuotient = quotientResult[0];
    let finalRemainder = quotientResult[1];

    const quotientSign = selfNum.isNegative !== parsedOther.isNegative;
    const remainderSign = selfNum.isNegative;

    if (typeof finalQuotient === "number") {
      if (quotientSign) finalQuotient = -finalQuotient;
      finalQuotient = new CompactNum(finalQuotient);
    } else finalQuotient = new HugeNum(finalQuotient, quotientSign);

    if (typeof finalRemainder === "number") {
      if (remainderSign) finalRemainder = -finalRemainder;
      finalRemainder = new CompactNum(finalRemainder);
    } else finalRemainder = new HugeNum(finalRemainder, remainderSign);

    return [finalQuotient, finalRemainder];
  }

  // HugeNum.prototype.getQuotientAndRemainder method
  HugeNum.prototype.getQuotientAndRemainder = function(operand) {
    const result = flexibleDivideAndMod(this, operand);
    return { quotient: result[0], remainder: result[1] };
  };
  CompactNum.prototype.getQuotientAndRemainder = HugeNum.prototype.getQuotientAndRemainder;

  // HugeNum.prototype.getQuotient method
  HugeNum.prototype.getQuotient = function(operand) {
    return flexibleDivideAndMod(this, operand)[0];
  };
  CompactNum.prototype.divideAlias = CompactNum.prototype.getQuotient;
  HugeNum.prototype.divideAlias = HugeNum.prototype.getQuotient;

  // HugeNum.prototype.getRemainder method
  HugeNum.prototype.getRemainder = function(operand) {
    return flexibleDivideAndMod(this, operand)[1];
  };
  CompactNum.prototype.modAlias = CompactNum.prototype.getRemainder;
  HugeNum.prototype.modAlias = HugeNum.prototype.getRemainder;

  // HugeNum.prototype.exponentiate method (integer power)
  HugeNum.prototype.exponentiate = function(power) {
    const parsedPower = parseNumericValue(power);
    const baseValue = this.internalValue;
    const exponentValue = parsedPower.internalValue;
    let intermediateResult;

    if (parsedPower.isZeroValue()) return NumBaseFactory._one;
    if (this.isZeroValue()) return NumBaseFactory._zero;
    if (this.isOneOrMinusOne()) {
      if (this.isEqualTo(NumBaseFactory._one)) return NumBaseFactory._one;
      return parsedPower.isEvenlyDivisibleByTwo() ? NumBaseFactory._one : NumBaseFactory._minusOne;
    }

    if (parsedPower.isNegativeNumber()) {
      // Negative exponent means 1/x^n, which is 0 for integers (except 1/1)
      return NumBaseFactory._zero;
    }
    if (!parsedPower.isCompact) {
      throw new Error("The exponent " + parsedPower.toNumericalString() + " is too large for current implementation.");
    }

    // If base is compact, try direct Math.pow
    if (this.isCompact) {
      if (isWithinSafeIntegerRange(intermediateResult = Math.pow(baseValue, exponentValue))) {
        return new CompactNum(chopDecimal(intermediateResult));
      }
    }

    let currentBase = this;
    let finalResult = NumBaseFactory._one;
    let currentExp = exponentValue;

    // Binary exponentiation (exponentiation by squaring)
    while (true) {
      if ((currentExp & 1) === 1) { // If exponent is odd
        finalResult = finalResult.product(currentBase);
        currentExp--; // Decrement exponent
      }
      if (currentExp === 0) break;
      currentExp /= 2; // Halve the exponent
      currentBase = currentBase.raiseToPowerTwo(); // Square the base
    }
    return finalResult;
  };
  CompactNum.prototype.exponentiate = HugeNum.prototype.exponentiate;

  // HugeNum.prototype.modularExponentiate method (a^b mod m)
  HugeNum.prototype.modularExponentiate = function(exponent, modulus) {
    let parsedExp = parseNumericValue(exponent);
    let parsedMod = parseNumericValue(modulus);

    if (parsedMod.isZeroValue()) {
      throw new Error("Cannot perform modular exponentiation with modulus 0.");
    }
    if (parsedMod.isNegativeNumber()) {
      parsedMod = parsedMod.absoluteValue(); // Modulus should be positive
    }

    let result = NumBaseFactory._one;
    let base = this.getRemainder(parsedMod); // a mod m

    // Handle negative exponents by finding modular inverse
    if (parsedExp.isNegativeNumber()) {
      parsedExp = parsedExp.absoluteValue();
      base = base.modularInverse(parsedMod);
    }

    // Binary exponentiation (exponentiation by squaring)
    while (parsedExp.isPositiveNumber()) {
      if (base.isZeroValue()) return NumBaseFactory._zero; // 0^anything mod m = 0
      if (parsedExp.isUnevenlyDivisibleByTwo()) {
        result = result.product(base).getRemainder(parsedMod);
      }
      parsedExp = parsedExp.getQuotient(NumBaseFactory._two); // Divide exponent by 2
      base = base.raiseToPowerTwo().getRemainder(parsedMod); // Square base mod m
    }
    return result;
  };
  CompactNum.prototype.modularExponentiate = HugeNum.prototype.modularExponentiate;

  // Compares the absolute values of two chunk arrays
  function compareAbsoluteChunks(arrA, arrB) {
    if (arrA.length !== arrB.length) {
      return arrA.length > arrB.length ? 1 : -1;
    }
    for (let i = arrA.length - 1; i >= 0; i--) {
      if (arrA[i] !== arrB[i]) {
        return arrA[i] > arrB[i] ? 1 : -1;
      }
    }
    return 0; // Arrays are identical
  }

  // HugeNum.prototype.compareAbsolute method
  HugeNum.prototype.compareAbsolute = function(operand) {
    const otherNum = parseNumericValue(operand);
    const valA = this.internalValue;
    let valB = otherNum.internalValue;

    if (otherNum.isCompact) { // If comparing with CompactNum, convert it to chunk array
      valB = decomposeSmallToChunks(Math.abs(valB));
    }
    return compareAbsoluteChunks(valA, valB);
  };

  // CompactNum.prototype.compareAbsolute method
  CompactNum.prototype.compareAbsolute = function(operand) {
    const otherNum = parseNumericValue(operand);
    const absSelfVal = Math.abs(this.internalValue);
    let absOtherVal;

    if (otherNum.isCompact) {
      absOtherVal = Math.abs(otherNum.internalValue);
      return absSelfVal === absOtherVal ? 0 : (absSelfVal > absOtherVal ? 1 : -1);
    }
    // If other is HugeNum, current CompactNum is always smaller in absolute value (unless other is 0)
    return -1;
  };

  // HugeNum.prototype.compareTo method
  HugeNum.prototype.compareTo = function(operand) {
    if (operand === Infinity) return -1;
    if (operand === -Infinity) return 1;

    const otherNum = parseNumericValue(operand);
    const valA = this.internalValue;
    let valB = otherNum.internalValue;

    // Compare signs first
    if (this.isNegative !== otherNum.isNegative) {
      return otherNum.isNegative ? 1 : -1; // If other is negative, this (positive) is larger; else this (negative) is smaller
    }

    // If both are CompactNum, compare directly
    if (this.isCompact && otherNum.isCompact) {
        const result = this.internalValue - otherNum.internalValue;
        return result === 0 ? 0 : (result > 0 ? 1 : -1);
    }

    // If one is CompactNum, and the other is HugeNum (but same sign)
    if (otherNum.isCompact) { // This is HugeNum, other is CompactNum
      // If this is negative, then huge is smaller than compact
      return this.isNegative ? -1 : 1;
    }

    // Both are HugeNums with same sign, compare absolute values
    const absComparison = compareAbsoluteChunks(valA, valB);
    return this.isNegative ? -absComparison : absComparison; // Flip result if negative
  };
  HugeNum.prototype.compareAlias = HugeNum.prototype.compareTo;

  // CompactNum.prototype.compareTo method
  CompactNum.prototype.compareTo = function(operand) {
    if (operand === Infinity) return -1;
    if (operand === -Infinity) return 1;

    const otherNum = parseNumericValue(operand);
    const selfVal = this.internalValue;
    let otherVal = otherNum.internalValue;

    if (otherNum.isCompact) {
      return selfVal === otherVal ? 0 : (selfVal > otherVal ? 1 : -1);
    }

    // If other is HugeNum
    if ((selfVal < 0) !== otherNum.isNegative) { // Different signs
      return selfVal < 0 ? -1 : 1; // Negative compact is smaller than positive huge, positive compact is larger than negative huge
    }
    // Same signs, other is HugeNum. CompactNum is always smaller than HugeNum (unless HugeNum is 0, which is handled as compact)
    return selfVal < 0 ? 1 : -1; // If negative, compact is 'less negative' (larger). If positive, compact is smaller.
  };
  CompactNum.prototype.compareAlias = CompactNum.prototype.compareTo;

  // Comparison aliases
  HugeNum.prototype.isEqualTo = function(operand) { return this.compareTo(operand) === 0; };
  CompactNum.prototype.equalsAlias = CompactNum.prototype.isEqualTo;
  HugeNum.prototype.equalsAlias = HugeNum.prototype.isEqualTo;

  HugeNum.prototype.isNotEqualTo = function(operand) { return this.compareTo(operand) !== 0; };
  CompactNum.prototype.notEqualsAlias = CompactNum.prototype.isNotEqualTo;
  HugeNum.prototype.notEqualsAlias = HugeNum.prototype.isNotEqualTo;

  HugeNum.prototype.isGreaterThan = function(operand) { return this.compareTo(operand) > 0; };
  CompactNum.prototype.greaterAlias = CompactNum.prototype.isGreaterThan;
  HugeNum.prototype.greaterAlias = HugeNum.prototype.isGreaterThan;

  HugeNum.prototype.isLesserThan = function(operand) { return this.compareTo(operand) < 0; };
  CompactNum.prototype.lesserAlias = CompactNum.prototype.isLesserThan;
  HugeNum.prototype.lesserAlias = HugeNum.prototype.isLesserThan;

  HugeNum.prototype.isGreaterOrEqualTo = function(operand) { return this.compareTo(operand) >= 0; };
  CompactNum.prototype.greaterOrEqualsAlias = CompactNum.prototype.isGreaterOrEqualTo;
  HugeNum.prototype.greaterOrEqualsAlias = HugeNum.prototype.isGreaterOrEqualTo;

  HugeNum.prototype.isLesserOrEqualTo = function(operand) { return this.compareTo(operand) <= 0; };
  CompactNum.prototype.lesserOrEqualsAlias = CompactNum.prototype.isLesserOrEqualTo;
  HugeNum.prototype.lesserOrEqualsAlias = HugeNum.prototype.isLesserOrEqualTo;

  // Parity checks
  HugeNum.prototype.isEvenlyDivisibleByTwo = function() {
    return (this.internalValue[0] & 1) === 0;
  };
  CompactNum.prototype.isEvenlyDivisibleByTwo = function() {
    return (this.internalValue & 1) === 0;
  };

  HugeNum.prototype.isUnevenlyDivisibleByTwo = function() {
    return (this.internalValue[0] & 1) === 1;
  };
  CompactNum.prototype.isUnevenlyDivisibleByTwo = function() {
    return (this.internalValue & 1) === 1;
  };

  // Sign checks
  HugeNum.prototype.isPositiveNumber = function() { return !this.isNegative; };
  CompactNum.prototype.isPositiveNumber = function() { return this.internalValue > 0; };

  HugeNum.prototype.isNegativeNumber = function() { return this.isNegative; };
  CompactNum.prototype.isNegativeNumber = function() { return this.internalValue < 0; };

  // Special value checks
  HugeNum.prototype.isOneOrMinusOne = function() { return false; }; // A HugeNum can't be 1 or -1
  CompactNum.prototype.isOneOrMinusOne = function() { return Math.abs(this.internalValue) === 1; };

  HugeNum.prototype.isZeroValue = function() { return false; }; // A HugeNum can't be 0
  CompactNum.prototype.isZeroValue = function() { return this.internalValue === 0; };

  // HugeNum.prototype.checkDivisibilityBy method
  HugeNum.prototype.checkDivisibilityBy = function(operand) {
    const otherNum = parseNumericValue(operand);
    const otherVal = otherNum.internalValue;

    if (otherNum.isZeroValue()) return false;
    if (otherNum.isOneOrMinusOne()) return true;
    if (otherNum.isEqualTo(NumBaseFactory._two)) return this.isEvenlyDivisibleByTwo();

    return this.getRemainder(otherNum).isEqualTo(NumBaseFactory._zero);
  };
  CompactNum.prototype.checkDivisibilityBy = HugeNum.prototype.checkDivisibilityBy;


  // Helper for basic primality tests (small numbers)
  function testSimplePrimes(valueNum) {
    const absVal = valueNum.absoluteValue();
    if (absVal.isOneOrMinusOne()) return false;
    if (absVal.isEqualTo(NumBaseFactory._two) || absVal.isEqualTo(NumBaseFactory._three) || absVal.isEqualTo(NumBaseFactory._five)) return true;
    if (absVal.isEvenlyDivisibleByTwo() || absVal.checkDivisibilityBy(NumBaseFactory._three) || absVal.checkDivisibilityBy(NumBaseFactory._five)) return false;
    if (absVal.isLesserThan(NumBaseFactory._twentyFive)) return true; // Primes up to 23
    return voidValue; // Undefined, need stronger test
  }

  // Miller-Rabin primality test for HugeNum
  HugeNum.prototype.checkIfPrime = function() {
    const basicResult = testSimplePrimes(this);
    if (basicResult !== voidValue) return basicResult;

    const absNum = this.absoluteValue();
    const prevNum = absNum.decrement(); // n-1

    // Write n-1 as 2^s * d
    let d = prevNum;
    // Count factors of 2 in d (s)
    while (d.isEvenlyDivisibleByTwo()) {
      d = d.getQuotient(NumBaseFactory._two);
    }

    const testBases = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37]; // Common small primes for Miller-Rabin
    for (let i = 0; i < testBases.length; i++) {
      // If n is one of the test bases, it's prime
      if (absNum.isEqualTo(NumBaseFactory(testBases[i]))) return true;
      if (absNum.isLesserThan(NumBaseFactory(testBases[i]))) continue; // Skip if base is larger than n

      let x = NumBaseFactory(testBases[i]).modularExponentiate(d, absNum); // a^d mod n

      if (x.isEqualTo(NumBaseFactory._one) || x.isEqualTo(prevNum)) continue; // Witness test passed for this base

      let isStrongProbablePrime = false;
      let currentD = d;
      while (currentD.isLesserThan(prevNum)) {
        x = x.raiseToPowerTwo().getRemainder(absNum); // x^2 mod n
        if (x.isEqualTo(prevNum)) {
          isStrongProbablePrime = true;
          break;
        }
        currentD = currentD.product(NumBaseFactory._two); // d = d * 2
      }
      if (!isStrongProbablePrime) return false; // Not a strong probable prime for this base, so n is composite
    }
    return true; // Passed all tests, n is prime
  };
  CompactNum.prototype.checkIfPrime = HugeNum.prototype.checkIfPrime;

  // Miller-Rabin primality test (probabilistic)
  HugeNum.prototype.checkIfProbablePrime = function(iterations) {
    const basicResult = testSimplePrimes(this);
    if (basicResult !== voidValue) return basicResult;

    const absNum = this.absoluteValue();
    const testCount = iterations === voidValue ? 5 : iterations; // Default 5 iterations

    // Miller-Rabin for chosen number of iterations
    for (let i = 0; i < testCount; i++) {
      // Pick a random base 'a' such that 2 <= a <= n-2
      const randomBase = NumBaseFactory.generateRandomBetween(NumBaseFactory._two, absNum.difference(NumBaseFactory._two));
      if (!randomBase.modularExponentiate(absNum.decrement(), absNum).isOneOrMinusOne()) {
        return false; // Composite
      }
    }
    return true; // Probably prime
  };
  CompactNum.prototype.checkIfProbablePrime = HugeNum.prototype.checkIfProbablePrime;

  // Extended Euclidean Algorithm for modular inverse (a^-1 mod n)
  HugeNum.prototype.modularInverse = function(modulus) {
    let oldT = NumBaseFactory._zero, currentT = NumBaseFactory._one;
    let oldR = parseNumericValue(modulus), currentR = this.absoluteValue();
    let quotient, tempT, tempR;

    while (!currentR.isZeroValue()) {
      quotient = oldR.getQuotient(currentR);
      tempT = oldT;
      tempR = oldR;

      oldT = currentT;
      oldR = currentR;

      currentT = tempT.difference(quotient.product(currentT));
      currentR = tempR.difference(quotient.product(currentR));
    }

    if (!oldR.isEqualTo(NumBaseFactory._one)) {
      throw new Error(this.toNumericalString() + " and " + modulus.toNumericalString() + " are not coprime.");
    }

    if (oldT.compareTo(NumBaseFactory._zero) === -1) {
      oldT = oldT.sum(modulus); // Ensure positive result
    }

    // If original number was negative, invert the result's sign
    if (this.isNegativeNumber()) {
      return oldT.invertSign();
    }
    return oldT;
  };
  CompactNum.prototype.modularInverse = HugeNum.prototype.modularInverse;

  // HugeNum.prototype.increment method
  HugeNum.prototype.increment = function() {
    const currentVal = this.internalValue;
    if (this.isNegative) {
      return subtractChunkArrayBySmall(currentVal, 1, this.isNegative); // e.g., -5 + 1 = -4
    }
    return new HugeNum(sumChunkArrayWithSmall(currentVal, 1), this.isNegative);
  };

  // CompactNum.prototype.increment method
  CompactNum.prototype.increment = function() {
    const currentVal = this.internalValue;
    if (currentVal + 1 < MAX_SAFE_JS_INT) return new CompactNum(currentVal + 1);
    // If overflow, convert to HugeNum
    return new HugeNum(MAX_SAFE_JS_ARRAY, false); // MAX_SAFE_JS_INT + 1
  };

  // HugeNum.prototype.decrement method
  HugeNum.prototype.decrement = function() {
    const currentVal = this.internalValue;
    if (this.isNegative) {
      return new HugeNum(sumChunkArrayWithSmall(currentVal, 1), true); // e.g., -5 - 1 = -6
    }
    return subtractChunkArrayBySmall(currentVal, 1, this.isNegative);
  };

  // CompactNum.prototype.decrement method
  CompactNum.prototype.decrement = function() {
    const currentVal = this.internalValue;
    if (currentVal - 1 > -MAX_SAFE_JS_INT) return new CompactNum(currentVal - 1);
    // If underflow, convert to HugeNum
    return new HugeNum(MAX_SAFE_JS_ARRAY, true); // -MAX_SAFE_JS_INT - 1
  };

  // Precompute powers of 2 up to CHUNK_SIZE
  const powersOfTwo = [1];
  while (2 * powersOfTwo[powersOfTwo.length - 1] <= CHUNK_SIZE) {
    powersOfTwo.push(2 * powersOfTwo[powersOfTwo.length - 1]);
  }
  const powers2Length = powersOfTwo.length;
  const highestPower2 = powersOfTwo[powers2Length - 1];

  // Helper to check if shift amount is a "small" number
  function isSmallShiftAmount(shiftAmount) {
    return (typeof shiftAmount === "number" || typeof shiftAmount === "string") &&
           +Math.abs(shiftAmount) <= CHUNK_SIZE ||
           (shiftAmount instanceof HugeNum && shiftAmount.internalValue.length <= 1);
  }

  // HugeNum.prototype.bitShiftLeft method (multiplies by 2^n)
  HugeNum.prototype.bitShiftLeft = function(shiftAmount) {
    if (!isSmallShiftAmount(shiftAmount)) {
      throw new Error(String(shiftAmount) + " is too large for shifting.");
    }
    let n = +shiftAmount;
    if (n < 0) return this.bitShiftRight(-n); // Convert negative left shift to right shift

    let currentNum = this;
    if (currentNum.isZeroValue()) return currentNum;

    // Multiply by highestPower2 repeatedly until n is small enough
    while (n >= powers2Length) {
      currentNum = currentNum.product(NumBaseFactory(highestPower2));
      n -= (powers2Length - 1); // powers2Length-1 is the exponent for highestPower2 (2^((powers2Length-1)*1))
    }
    return currentNum.product(NumBaseFactory(powersOfTwo[n]));
  };
  CompactNum.prototype.bitShiftLeft = HugeNum.prototype.bitShiftLeft;

  // HugeNum.prototype.bitShiftRight method (divides by 2^n)
  HugeNum.prototype.bitShiftRight = function(shiftAmount) {
    let divModResult;
    if (!isSmallShiftAmount(shiftAmount)) {
      throw new Error(String(shiftAmount) + " is too large for shifting.");
    }
    let n = +shiftAmount;
    if (n < 0) return this.bitShiftLeft(-n); // Convert negative right shift to left shift

    let currentNum = this;

    while (n >= powers2Length) {
      // If number becomes zero or -1, further shifts don't change it
      if (currentNum.isZeroValue() || (currentNum.isNegativeNumber() && currentNum.isOneOrMinusOne())) return currentNum;

      divModResult = flexibleDivideAndMod(currentNum, NumBaseFactory(highestPower2));
      currentNum = divModResult[1].isNegativeNumber() ? divModResult[0].decrement() : divModResult[0]; // Floor division for negative numbers
      n -= (powers2Length - 1);
    }

    divModResult = flexibleDivideAndMod(currentNum, NumBaseFactory(powersOfTwo[n]));
    return divModResult[1].isNegativeNumber() ? divModResult[0].decrement() : divModResult[0]; // Floor division for negative numbers
  };
  CompactNum.prototype.bitShiftRight = HugeNum.prototype.bitShiftRight;

  // Generic bitwise operation function
  function performBitwiseOperation(numX, numY, operationFn) {
    numY = parseNumericValue(numY);

    const xIsNegative = numX.isNegativeNumber();
    const yIsNegative = numY.isNegativeNumber();

    // Use two's complement representation for negative numbers
    let xRemainder = xIsNegative ? numX.bitwiseNot() : numX;
    let yRemainder = yIsNegative ? numY.bitwiseNot() : numY;

    const resultChunks = [];
    let xChunk, yChunk;
    let xDivModResult = null, yDivModResult = null;

    // Process chunk by chunk
    while (!xRemainder.isZeroValue() || !yRemainder.isZeroValue()) {
      xDivModResult = flexibleDivideAndMod(xRemainder, NumBaseFactory(highestPower2));
      xChunk = xDivModResult[1].toJSPrimitive();
      if (xIsNegative) xChunk = highestPower2 - 1 - xChunk; // Apply two's complement for this chunk

      yDivModResult = flexibleDivideAndMod(yRemainder, NumBaseFactory(highestPower2));
      yChunk = yDivModResult[1].toJSPrimitive();
      if (yIsNegative) yChunk = highestPower2 - 1 - yChunk; // Apply two's complement for this chunk

      xRemainder = xDivModResult[0];
      yRemainder = yDivModResult[0];

      resultChunks.push(operationFn(xChunk, yChunk));
    }

    // Determine sign of the result based on the most significant bit of the two's complement representation
    let finalSum = operationFn(xIsNegative ? 1 : 0, yIsNegative ? 1 : 0) !== 0 ? NumBaseFactory._minusOne : NumBaseFactory._zero;

    // Reconstruct the number from result chunks
    for (let i = resultChunks.length - 1; i >= 0; i--) {
      finalSum = finalSum.product(NumBaseFactory(highestPower2)).sum(NumBaseFactory(resultChunks[i]));
    }
    return finalSum;
  }

  // HugeNum.prototype.bitwiseNot method
  HugeNum.prototype.bitwiseNot = function() {
    return this.invertSign().decrement(); // ~x = -x - 1
  };
  CompactNum.prototype.bitwiseNot = HugeNum.prototype.bitwiseNot;

  // HugeNum.prototype.bitwiseAnd method
  HugeNum.prototype.bitwiseAnd = function(operand) {
    return performBitwiseOperation(this, operand, (a, b) => a & b);
  };
  CompactNum.prototype.bitwiseAnd = HugeNum.prototype.bitwiseAnd;

  // HugeNum.prototype.bitwiseOr method
  HugeNum.prototype.bitwiseOr = function(operand) {
    return performBitwiseOperation(this, operand, (a, b) => a | b);
  };
  CompactNum.prototype.bitwiseOr = HugeNum.prototype.bitwiseOr;

  // HugeNum.prototype.bitwiseXor method
  HugeNum.prototype.bitwiseXor = function(operand) {
    return performBitwiseOperation(this, operand, (a, b) => a ^ b);
  };
  CompactNum.prototype.bitwiseXor = HugeNum.prototype.bitwiseXor;


  // For GCD: estimates the position of the lowest set bit (rough approximation)
  // This is a rough heuristic, not a precise LSB calculation.
  const LOB_MASK_JS_INT = 1 << 30; // Max bit for JS int
  const LOB_MASK_CHUNK_INT = (CHUNK_SIZE & -CHUNK_SIZE) * (CHUNK_SIZE & -CHUNK_SIZE) | LOB_MASK_JS_INT;

  function estimateLowestOneBit(numVal) {
    const val = numVal.internalValue;
    let x;
    if (typeof val === "number") { // CompactNum
      x = val | LOB_MASK_JS_INT;
    } else { // HugeNum
      // Use the least significant chunk and combine with the next if available
      x = val[0] + (val[1] || 0) * CHUNK_SIZE | LOB_MASK_CHUNK_INT;
    }
    return x & -x; // Returns the lowest set bit
  }

  // Calculates integer logarithm (base 2) recursively
  function calcIntegerLog(valueNum, baseNum) {
    // Base case: if value is smaller than or equal to base, log is 0
    if (baseNum.compareTo(valueNum) > 0) {
      return { powerResult: NumBaseFactory._one, exponent: 0 };
    }

    // Recursive step: log(N) = 2 * log(sqrt(N))
    const halfLog = calcIntegerLog(valueNum, baseNum.raiseToPowerTwo());
    const halfPower = halfLog.powerResult;
    const halfExponent = halfLog.exponent;

    // Check if base^currentExponent fits within value
    const potentialPower = halfPower.product(baseNum);
    if (potentialPower.compareTo(valueNum) <= 0) {
      return { powerResult: potentialPower, exponent: halfExponent * 2 + 1 };
    }
    return { powerResult: halfPower, exponent: halfExponent * 2 };
  }

  // HugeNum.prototype.getBitLength method
  HugeNum.prototype.getBitLength = function() {
    let currentNum = this;
    if (currentNum.isNegativeNumber()) {
      currentNum = currentNum.invertSign().decrement(); // Two's complement for negative
    }
    if (currentNum.isZeroValue()) return NumBaseFactory._zero; // log2(0) is undefined, return 0 bits

    // Use integer logarithm base 2
    const logResult = calcIntegerLog(currentNum, NumBaseFactory._two);
    return NumBaseFactory(logResult.exponent).sum(NumBaseFactory._one);
  };
  CompactNum.prototype.getBitLength = HugeNum.prototype.getBitLength;


  // Finds the maximum of two numbers
  function getMaximumValue(valA, valB) {
    valA = parseNumericValue(valA);
    valB = parseNumericValue(valB);
    return valA.isGreaterThan(valB) ? valA : valB;
  }

  // Finds the minimum of two numbers
  function getMinimumValue(valA, valB) {
    valA = parseNumericValue(valA);
    valB = parseNumericValue(valB);
    return valA.isLesserThan(valB) ? valA : valB;
  }

  // Greatest Common Divisor (Binary GCD algorithm / Stein's algorithm)
  function greatestCommonDivisor(valA, valB) {
    let numA = parseNumericValue(valA).absoluteValue();
    let numB = parseNumericValue(valB).absoluteValue();

    if (numA.isEqualTo(numB)) return numA;
    if (numA.isZeroValue()) return numB;
    if (numB.isZeroValue()) return numA;

    let commonFactors = NumBaseFactory._one;
    let factor;

    // Remove common factors of 2
    while (numA.isEvenlyDivisibleByTwo() && numB.isEvenlyDivisibleByTwo()) {
      factor = Math.min(estimateLowestOneBit(numA), estimateLowestOneBit(numB));
      numA = numA.getQuotient(NumBaseFactory(factor));
      numB = numB.getQuotient(NumBaseFactory(factor));
      commonFactors = commonFactors.product(NumBaseFactory(factor));
    }

    // Remove factors of 2 from numA
    while (numA.isEvenlyDivisibleByTwo()) {
      numA = numA.getQuotient(NumBaseFactory(estimateLowestOneBit(numA)));
    }

    // Main loop of Stein's algorithm
    do {
      // Remove factors of 2 from numB
      while (numB.isEvenlyDivisibleByTwo()) {
        numB = numB.getQuotient(NumBaseFactory(estimateLowestOneBit(numB)));
      }

      // If numA > numB, swap them
      if (numA.isGreaterThan(numB)) {
        let temp = numB;
        numB = numA;
        numA = temp;
      }
      numB = numB.difference(numA); // numB = numB - numA
    } while (!numB.isZeroValue());

    return commonFactors.isOneOrMinusOne() ? numA : numA.product(commonFactors);
  }

  // Least Common Multiple (LCM(a,b) = |a*b| / GCD(a,b))
  function leastCommonMultiple(valA, valB) {
    valA = parseNumericValue(valA).absoluteValue();
    valB = parseNumericValue(valB).absoluteValue();
    const gcdResult = greatestCommonDivisor(valA, valB);
    return valA.getQuotient(gcdResult).product(valB);
  }

  // Generates a random number between two given numbers (inclusive)
  function generateRandomBetween(lowerBound, upperBound) {
    lowerBound = parseNumericValue(lowerBound);
    upperBound = parseNumericValue(upperBound);

    const lowVal = getMinimumValue(lowerBound, upperBound);
    const highVal = getMaximumValue(lowerBound, upperBound);

    const range = highVal.difference(lowVal).sum(NumBaseFactory._one);

    // If range is small, use simple Math.random
    if (range.isCompact) {
      return lowVal.sum(new CompactNum(Math.floor(Math.random() * range.internalValue)));
    }

    // For large ranges, generate random chunks
    const numChunks = range.internalValue.length;
    const randomChunks = [];
    let isRestrictedByRange = true; // Flag to ensure number doesn't exceed range

    for (let i = numChunks - 1; i >= 0; i--) {
      const upperLimit = isRestrictedByRange ? range.internalValue[i] : CHUNK_SIZE;
      const randomDigit = chopDecimal(Math.random() * upperLimit);
      randomChunks.unshift(randomDigit); // Add to the front

      if (randomDigit < upperLimit) isRestrictedByRange = false; // If a digit is less than max, restriction is lifted
    }

    const composedResult = composeChunksToSmall(randomChunks);
    let finalRandomNum;
    if (typeof composedResult === "number") {
      finalRandomNum = new CompactNum(composedResult);
    } else {
      finalRandomNum = new HugeNum(composedResult, false);
    }
    return lowVal.sum(finalRandomNum);
  }

  // Parses a string representation of a number with a given base
  const parseStringWithBase = (textString, baseRadix) => {
    const stringLength = textString.length;
    const absBase = Math.abs(baseRadix);

    // Initial validation of digits
    for (let i = 0; i < stringLength; i++) {
      const char = textString[i].toLowerCase();
      if (char === "-") continue; // Allow negative sign

      if (/[a-z0-9]/.test(char)) {
        if (/[0-9]/.test(char)) {
          // Numeric digit check
          if (+char >= absBase) {
            if (char === "1" && absBase === 1) continue; // Special case for base 1 (unary)
            throw new Error(`'${char}' is not a valid digit in base ${baseRadix}.`);
          }
        } else {
          // Alphabetic digit check (a=10, b=11...)
          if (char.charCodeAt(0) - 87 >= absBase) { // 'a' is 97, 'a'-87 = 10
            throw new Error(`'${char}' is not a valid digit in base ${baseRadix}.`);
          }
        }
      }
    }

    // Optimized path for common small bases (2-36) if string length is not too big
    if (baseRadix >= 2 && baseRadix <= 36) {
      // Check if the number, if parsed, would fit into a JS safe integer
      if (stringLength * Math.log(baseRadix) <= LOG_MAX_SAFE_JS_INT) {
        const parsedInt = parseInt(textString, baseRadix);
        if (isNaN(parsedInt)) {
          throw new Error("Invalid number string: " + textString);
        }
        return new CompactNum(parsedInt);
      }
    }

    // General case for larger bases or numbers
    const parsedBase = parseNumericValue(baseRadix);
    const digitValues = [];
    const isNegative = textString[0] === "-";

    for (let i = isNegative ? 1 : 0; i < textString.length; i++) {
      const char = textString[i].toLowerCase();
      const charCode = char.charCodeAt(0);

      if (charCode >= 48 && charCode <= 57) { // '0'-'9'
        digitValues.push(parseNumericValue(char));
      } else if (charCode >= 97 && charCode <= 122) { // 'a'-'z'
        digitValues.push(parseNumericValue(charCode - 87));
      } else if (char === "<") { // Custom multi-digit "digit" for very large bases
        let start = i;
        do { i++; } while (textString[i] !== ">" && i < textString.length);
        if (textString[i] !== ">") throw new Error("Unclosed custom digit.");
        digitValues.push(parseNumericValue(textString.slice(start + 1, i)));
      } else {
        throw new Error(`'${char}' is not a valid character for base ${baseRadix}.`);
      }
    }
    return constructFromBaseChunks(digitValues, parsedBase, isNegative);
  };

  // Constructs a number from an array of digits in a given base
  function constructFromBaseChunks(digitArray, baseNum, isNegative) {
    let accumulatedValue = NumBaseFactory._zero;
    let currentPower = NumBaseFactory._one;
    // Iterate from least significant digit to most significant
    for (let i = digitArray.length - 1; i >= 0; i--) {
      accumulatedValue = accumulatedValue.sum(digitArray[i].product(currentPower));
      currentPower = currentPower.product(baseNum);
    }
    return isNegative ? accumulatedValue.invertSign() : accumulatedValue;
  }

  // Converts a single digit (0-35) to its string representation
  function convertDigitToString(digit) {
    if (digit <= 35) {
      return "0123456789abcdefghijklmnopqrstuvwxyz".charAt(digit);
    }
    return `<${digit}>`; // For bases > 36, use custom format
  }

  // Converts a number to its representation in a given base
  function convertToBaseRepresentation(number, base) {
    base = NumBaseFactory(base);
    if (base.isZeroValue()) {
      if (number.isZeroValue()) return { value: [0], isNegative: false };
      throw new Error("Cannot convert nonzero numbers to base 0.");
    }
    if (base.isEqualTo(NumBaseFactory._minusOne)) {
      // Special handling for base -1 (negabase)
      if (number.isZeroValue()) return { value: [0], isNegative: false };
      if (number.isNegativeNumber()) {
        // For negative numbers, result is a repeating pattern of 10 for each unit
        let unaryPattern = [];
        for (let k = 0; k < -number.toJSPrimitive(); k++) unaryPattern.push(1, 0);
        return { value: unaryPattern, isNegative: false };
      }
      // For positive numbers, alternating 0 and 1
      let positivePattern = [];
      for (let k = 0; k < number.toJSPrimitive() - 1; k++) positivePattern.push(0, 1);
      positivePattern.unshift(1); // Start with 1
      return { value: positivePattern, isNegative: false };
    }

    let isResultNegative = false;
    if (number.isNegativeNumber() && base.isPositiveNumber()) {
      isResultNegative = true;
      number = number.absoluteValue();
    }

    if (base.isEqualTo(NumBaseFactory._one)) {
      if (number.isZeroValue()) return { value: [0], isNegative: false };
      // For base 1, unary representation (e.g., 5 in base 1 is "11111")
      const onesArray = [];
      for (let k = 0; k < number.toJSPrimitive(); k++) onesArray.push(1);
      return { value: onesArray, isNegative: isResultNegative };
    }

    const outputDigits = [];
    let currentNum = number;
    let divModResult;

    // Repeatedly divide by base and collect remainders
    while (currentNum.isNegativeNumber() || currentNum.compareAbsolute(base) >= 0) {
      divModResult = currentNum.getQuotientAndRemainder(base);
      currentNum = divModResult.quotient;
      let digit = divModResult.remainder;

      if (digit.isNegativeNumber()) {
        digit = base.difference(digit).absoluteValue(); // Adjust negative remainder
        currentNum = currentNum.increment(); // Adjust quotient
      }
      outputDigits.push(digit.toJSPrimitive());
    }
    outputDigits.push(currentNum.toJSPrimitive()); // Add the last quotient

    return { value: outputDigits.reverse(), isNegative: isResultNegative };
  }

  // HugeNum.prototype.toBaseArray method
  HugeNum.prototype.toBaseArray = function(baseRadix) {
    return convertToBaseRepresentation(this, baseRadix);
  };
  CompactNum.prototype.toBaseArray = function(baseRadix) {
    return convertToBaseRepresentation(this, baseRadix);
  };

  // Converts a number to its string representation in a given base
  function toBaseStringRepresentation(number, base) {
    const baseRep = convertToBaseRepresentation(number, base);
    const signPrefix = baseRep.isNegative ? "-" : "";
    return signPrefix + baseRep.value.map(convertDigitToString).join("");
  }

  // HugeNum.prototype.toNumericalString method
  HugeNum.prototype.toNumericalString = function(radix) {
    if (radix === voidValue) radix = 10;
    if (radix !== 10) return toBaseStringRepresentation(this, radix);

    const valChunks = this.internalValue;
    let currentChunkIndex = valChunks.length - 1;
    let resultString = String(valChunks[currentChunkIndex]); // Start with most significant chunk

    // Padding for smaller chunks
    const zeroPadding = "0000000"; // CHUNK_DIGITS zeros
    let chunkString;

    while (--currentChunkIndex >= 0) {
      chunkString = String(valChunks[currentChunkIndex]);
      resultString += zeroPadding.slice(chunkString.length) + chunkString;
    }
    const signPrefix = this.isNegative ? "-" : "";
    return signPrefix + resultString;
  };

  // CompactNum.prototype.toNumericalString method
  CompactNum.prototype.toNumericalString = function(radix) {
    if (radix === voidValue) radix = 10;
    if (radix !== 10) return toBaseStringRepresentation(this, radix);
    return String(this.internalValue);
  };

  // JSON serialization (uses toString)
  HugeNum.prototype.serializeToJSON = CompactNum.prototype.serializeToJSON = function() {
    return this.toNumericalString();
  };

  // Converts to a JavaScript primitive number (may lose precision for HugeNum)
  HugeNum.prototype.toJSPrimitive = function() {
    // Attempt to parse string to int, but will fail for very large numbers
    return parseInt(this.toNumericalString(), 10);
  };
  HugeNum.prototype.toJSNumberAlias = HugeNum.prototype.toJSPrimitive;

  CompactNum.prototype.toJSPrimitive = function() {
    return this.internalValue;
  };
  CompactNum.prototype.toJSNumberAlias = CompactNum.prototype.toJSPrimitive;


  // Parses a string into a number object (CompactNum or HugeNum)
  function parseNumericString(stringValue) {
    // Check if it's a precise JS number first
    if (isWithinSafeIntegerRange(+stringValue)) {
      const num = +stringValue;
      if (num === chopDecimal(num)) return new CompactNum(num); // Ensure it's an integer
      throw new Error(`Invalid integer string: "${stringValue}" is not an integer.`);
    }

    let isNegative = false;
    let processedString = stringValue;
    if (stringValue[0] === "-") {
      isNegative = true;
      processedString = stringValue.slice(1);
    }

    // Handle scientific notation (e.g., "1.23e+5")
    const scientificParts = processedString.split(/e/i);
    if (scientificParts.length > 2) {
      throw new Error(`Invalid integer string: "${stringValue}" contains multiple 'e' characters.`);
    }
    if (scientificParts.length === 2) {
      let exponentPart = scientificParts[1];
      if (exponentPart[0] === "+") exponentPart = exponentPart.slice(1);
      const exponentValue = +exponentPart;

      if (isNaN(exponentValue) || exponentValue !== chopDecimal(exponentValue) || !isWithinSafeIntegerRange(exponentValue)) {
        throw new Error(`Invalid integer string: "${exponentPart}" is not a valid integer exponent.`);
      }

      let mantissaPart = scientificParts[0];
      const decimalPointIndex = mantissaPart.indexOf(".");
      if (decimalPointIndex >= 0) {
        // Adjust exponent based on decimal point position
        exponentValue -= (mantissaPart.length - decimalPointIndex - 1);
        mantissaPart = mantissaPart.slice(0, decimalPointIndex) + mantissaPart.slice(decimalPointIndex + 1);
      }

      if (exponentValue < 0) {
        throw new Error("Cannot parse negative exponent for integer representation.");
      }
      processedString = mantissaPart + "0".repeat(exponentValue); // Append zeros
    }

    // Basic validation for integer format
    const isValidInteger = /^([0-9][0-9]*)$/.test(processedString);
    if (!isValidInteger) {
      throw new Error(`Invalid integer string format: "${stringValue}".`);
    }

    // Convert string to chunk array
    const chunkArray = [];
    let currentMaxIndex = processedString.length;
    let currentMinIndex = currentMaxIndex - CHUNK_DIGITS;

    while (currentMaxIndex > 0) {
      if (currentMinIndex < 0) currentMinIndex = 0;
      chunkArray.push(+processedString.slice(currentMinIndex, currentMaxIndex));
      currentMaxIndex = currentMinIndex;
      currentMinIndex -= CHUNK_DIGITS;
    }
    normalizeChunkArray(chunkArray);
    return new HugeNum(chunkArray, isNegative);
  }

  // Parses a JavaScript number into a number object
  function parseJsNumber(numValue) {
    if (isWithinSafeIntegerRange(numValue)) {
      if (numValue !== chopDecimal(numValue)) {
        throw new Error(`"${numValue}" is not an integer.`);
      }
      return new CompactNum(numValue);
    }
    // If it's a large JS number, convert to string and parse
    return parseNumericString(numValue.toString());
  }

  // Universal value parsing function
  function coerceToNumBase(value) {
    if (value === null) return NumBaseFactory._zero; // Treat null as zero
    if (typeof value === "number") {
      return parseJsNumber(value);
    }
    if (typeof value === "string") {
      return parseNumericString(value);
    }
    return value; // Assume it's already a NumBase object
  }

  // Pre-cache small integers for performance
  for (let i = 0; i < 1e3; i++) {
    NumBaseFactory[i] = new CompactNum(i);
    if (i > 0) NumBaseFactory[-i] = new CompactNum(-i);
  }
  NumBaseFactory._one = NumBaseFactory[1];
  NumBaseFactory._two = NumBaseFactory[2]; // Added for convenience
  NumBaseFactory._three = NumBaseFactory[3]; // Added for convenience
  NumBaseFactory._five = NumBaseFactory[5]; // Added for convenience
  NumBaseFactory._twentyFive = NumBaseFactory[25]; // Added for convenience
  NumBaseFactory._zero = NumBaseFactory[0];
  NumBaseFactory._minusOne = NumBaseFactory[-1];

  // Expose utility functions
  NumBaseFactory.getMaximumValue = getMaximumValue;
  NumBaseFactory.getMinimumValue = getMinimumValue;
  NumBaseFactory.greatestCommonDivisor = greatestCommonDivisor;
  NumBaseFactory.leastCommonMultiple = leastCommonMultiple;
  NumBaseFactory.isInstance = function(obj) {
    return obj instanceof HugeNum || obj instanceof CompactNum;
  };
  NumBaseFactory.generateRandomBetween = generateRandomBetween;
  NumBaseFactory.constructFromBaseChunks = function(digits, base, isNegative) {
    return constructFromBaseChunks(digits.map(coerceToNumBase), coerceToNumBase(base || 10), isNegative);
  };

  return NumBaseFactory;
}();

// Input Reader Module
const InputReaderFactory = (function() {
  function createReader(sourceString) {
    return new StreamProcessor(sourceString);
  }

  function StreamProcessor(inputContent) {
    this._sourceLines = inputContent.trim().split("\n"); // Split input into lines
    this._currentLineIndex = 0; // Pointer to the current line being processed
  }

  StreamProcessor.prototype.getNextAtom = function(shouldReturnRawString = false) {
    let currentLine = this._sourceLines[this._currentLineIndex];
    if (currentLine === undefined || currentLine.trim() === "") {
        throw new Error("Attempted to read from an empty or non-existent line.");
    }

    // If the line hasn't been split into tokens yet, do so and reverse for efficient popping
    if (typeof currentLine === "string") {
      this._sourceLines[this._currentLineIndex] = currentLine.split(" ").reverse();
    }
    
    let tokens = this._sourceLines[this._currentLineIndex];
    let nextToken = tokens.pop(); // Get the last token (first in original order due to reverse)

    // If all tokens on the line are consumed, advance to the next line
    if (tokens.length === 0) {
      this._currentLineIndex++;
    }
    return shouldReturnRawString ? nextToken : +nextToken; // Return as string or number
  };

  StreamProcessor.prototype.getNextLine = function(shouldReturnRawStrings = false) {
    const lineContent = this._sourceLines[this._currentLineIndex];
    if (lineContent === undefined) {
        throw new Error("Attempted to read from a non-existent line.");
    }
    this._currentLineIndex++; // Advance line pointer

    const tokens = lineContent.split(" ");
    if (shouldReturnRawStrings) {
      return tokens;
    } else {
      const numericTokens = [];
      for (let i = 0; i < tokens.length; i++) {
        numericTokens.push(+tokens[i]);
      }
      return numericTokens;
    }
  };

  StreamProcessor.prototype.getNextMatrix = function(numRows, shouldReturnRawStrings = false) {
    const matrixRows = [];
    for (let i = 0; i < numRows; i++) {
      const lineContent = this._sourceLines[this._currentLineIndex + i];
      if (lineContent === undefined) {
          throw new Error(`Attempted to read matrix row ${i} from non-existent line.`);
      }
      const tokens = lineContent.split(" ");
      if (shouldReturnRawStrings) {
        matrixRows.push(tokens);
      } else {
        const numericRow = [];
        for (let j = 0; j < tokens.length; j++) {
          numericRow.push(+tokens[j]);
        }
        matrixRows.push(numericRow);
      }
    }
    this._currentLineIndex += numRows; // Advance line pointer by numRows
    return matrixRows;
  };

  StreamProcessor.prototype.getNextRawLines = function(numLines, shouldReturnRawStrings = false) {
    const rawLines = [];
    for (let i = 0; i < numLines; i++) {
      const lineContent = this._sourceLines[this._currentLineIndex + i];
      if (lineContent === undefined) {
          throw new Error(`Attempted to read raw line ${i} from non-existent line.`);
      }
      rawLines.push(shouldReturnRawStrings ? lineContent : +lineContent);
    }
    this._currentLineIndex += numLines;
    return rawLines;
  };

  return createReader;
})();

const dataStream = InputReaderFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

// Creates a multi-dimensional array initialized with a value
function createMultiDimArray(initialValue, ...dimensions) {
    if (dimensions.length === 0) {
        throw new Error("At least one dimension is required for createMultiDimArray.");
    }

    function createNested(dimIndex) {
        if (dimIndex >= dimensions.length) {
            return initialValue;
        }
        const size = dimensions[dimIndex];
        const arr = new Array(size);
        for (let i = 0; i < size; i++) {
            arr[i] = createNested(dimIndex + 1);
        }
        return arr;
    }
    return createNested(0);
}

let currentModuloValue; // Global variable for the current modulus

// Calculates (val1 * val2) % currentModuloValue for values that might exceed 32-bit int
function calculateModularProduct(value1, value2) {
    let result = value1;
    // Iterate through additional arguments if provided, though typically used for two factors
    for (let i = 1; i < arguments.length; i++) {
        const factor = arguments[i];
        // Split values into 16-bit chunks to avoid overflow before modulo
        // (result_high * 2^16 + result_low) * factor % mod
        const rHigh = Math.floor(result / 65536); // result >> 16
        const rLow = result % 65536; // result & 65535

        const term1 = (rHigh * factor) % currentModuloValue * 65536;
        const term2 = (rLow * factor) % currentModuloValue;

        result = (term1 + term2) % currentModuloValue;
    }
    return result;
}

// Performs modular exponentiation (base^exp % mod)
function performModularExponentiation(base, exponent) {
    let result = 1;
    let currentBase = base;
    let currentExponent = exponent;

    while (currentExponent > 0) {
        // If exponent is odd
        if ((currentExponent % 2) === 1) { // currentExponent & 1
            result = calculateModularProduct(currentBase, result);
        }
        currentBase = calculateModularProduct(currentBase, currentBase); // Square the base
        currentExponent = Math.floor(currentExponent / 2); // currentExponent >>= 1
    }
    return result;
}

console.log(solveProblem()); // Execute the main problem-solving function

function solveProblem() {
  // Read problem inputs
  const inputLengthStr = dataStream.getNextAtom(true);
  const inputStartStr = dataStream.getNextAtom(true);
  const inputIntervalStr = dataStream.getNextAtom(true);

  // Convert inputs to largeNumberModule objects
  const bigIntegerConstructor = largeNumberModule; // Alias for brevity
  const bigLength = bigIntegerConstructor(inputLengthStr);
  const bigStart = bigIntegerConstructor(inputStartStr);
  const bigInterval = bigIntegerConstructor(inputIntervalStr);

  // Read the modulus value and convert primary inputs to JS numbers for specific uses
  currentModuloValue = dataStream.getNextAtom();
  const jsInputLength = +inputLengthStr;
  const jsInputStart = +inputStartStr;
  const jsInputInterval = +inputIntervalStr;

  // Initial state matrix: [[0, 0, B % mod]]
  // Represents [sum of answers, current number, B % mod]
  let resultMatrix = [[0, 0, bigInterval.getRemainder(currentModuloValue).toJSPrimitive()]];

  let currentPosition = bigIntegerConstructor._zero; // Current number of digits processed

  // Loop through different number of digits (i.e., powers of 10)
  // Max digits for L, A, B up to 10^18, so 19 digits should be sufficient
  for (let digitCount = 1; digitCount <= 19 && currentPosition.isLesserThan(bigLength); digitCount++) {
    // Calculate 10^digitCount - 1 (e.g., 9, 99, 999...)
    const upperBoundForDigits = bigIntegerConstructor(10).exponentiate(bigIntegerConstructor(digitCount)).difference(bigIntegerConstructor._one);

    // Calculate how many numbers (stepsToTake) of this digitCount range are relevant
    // The formula is derived from: (upperBoundForDigits - bigStart + bigInterval) / bigInterval - currentPosition
    // This calculates the count of numbers in this range, then adjusts for already processed numbers.
    let stepsToTake = upperBoundForDigits.difference(bigStart).sum(bigInterval).getQuotient(bigInterval).difference(currentPosition);

    // If stepsToTake is not positive, skip this range
    if (stepsToTake.isNegativeNumber() || stepsToTake.isZeroValue()) {
      continue;
    }

    // Ensure we don't go beyond the total length L
    if (currentPosition.sum(stepsToTake).isGreaterThan(bigLength)) {
      stepsToTake = bigLength.difference(currentPosition); // Limit steps to remaining length
    }

    // Construct the transformation matrix for this step
    // M = [[10^digitCount, 0, 0], [1, 1, 0], [0, 1, 1]]
    // This matrix transforms [Sum, CurrentNum, B_mod] -> [Sum', CurrentNum', B_mod']
    // Sum' = (Sum * 10^digitCount + CurrentNum * (10^digitCount - 1) + B_mod * count) % mod
    // CurrentNum' = (CurrentNum * 10^digitCount + B_mod * count) % mod
    // B_mod' = B_mod % mod
    const powerOfTenMod = performModularExponentiation(10, digitCount);
    const transformBaseMatrix = [
      [powerOfTenMod, 0, 0],
      [1, 1, 0],
      [0, 1, 1]
    ];

    // Raise the transformation matrix to the power of stepsToTake
    const poweredTransformMatrix = matrixModularExponentiation(transformBaseMatrix, stepsToTake);

    // Update the second element of the result matrix before multiplication
    // ans[0][1] = (B * S + A) % mod
    const currentNumVal = bigInterval.product(currentPosition).sum(bigStart);
    resultMatrix[0][1] = currentNumVal.getRemainder(currentModuloValue).toJSPrimitive();

    // Apply the transformation
    resultMatrix = matrixMultiplyModular(resultMatrix, poweredTransformMatrix);

    // Update the total processed position
    currentPosition = currentPosition.sum(stepsToTake);
  }
  return resultMatrix[0][0]; // The final sum of answers
}

// Performs modular exponentiation for matrices
function matrixModularExponentiation(baseMatrix, exponentNum) {
  const matrixDim = baseMatrix.length;
  // Initialize an identity matrix of size matrixDim x matrixDim
  let identityResult = createMultiDimArray(0, matrixDim, matrixDim);
  for (let i = 0; i < matrixDim; i++) {
    identityResult[i][i] = 1;
  }

  let currentExponent = exponentNum;
  let currentBase = baseMatrix;

  // Binary exponentiation for matrices
  while (currentExponent.isPositiveNumber()) {
    if (currentExponent.isUnevenlyDivisibleByTwo()) { // If exponent is odd
      identityResult = matrixMultiplyModular(identityResult, currentBase);
    }
    currentBase = matrixMultiplyModular(currentBase, currentBase); // Square the base matrix
    currentExponent = currentExponent.getQuotient(largeNumberModule._two); // Divide exponent by 2
  }
  return identityResult;
}

// Performs modular multiplication of two matrices
function matrixMultiplyModular(matrixA, matrixB) {
  // Ensure inputs are treated as 2D arrays
  const parsedMatrixA = Array.isArray(matrixA[0]) ? matrixA : [matrixA];
  const parsedMatrixB = Array.isArray(matrixB[0]) ? matrixB : [matrixB];

  const rowsA = parsedMatrixA.length;
  const colsA = parsedMatrixA[0].length; // Columns of A must match rows of B
  const colsB = parsedMatrixB[0].length;

  if (colsA !== parsedMatrixB.length) {
      throw new Error("Matrix dimensions are incompatible for multiplication.");
  }

  // Initialize result matrix with zeros
  const productResult = createMultiDimArray(0, rowsA, colsB);

  for (let rowIdx = 0; rowIdx < rowsA; rowIdx++) {
    for (let colIdx = 0; colIdx < colsB; colIdx++) {
      let sumComponent = 0;
      for (let innerIdx = 0; innerIdx < colsA; innerIdx++) { // Iterate through columns of A (or rows of B)
        const term = calculateModularProduct(parsedMatrixA[rowIdx][innerIdx], parsedMatrixB[innerIdx][colIdx]);
        sumComponent = (sumComponent + term) % currentModuloValue; // Accumulate sum with modulo
      }
      productResult[rowIdx][colIdx] = sumComponent;
    }
  }
  return productResult;
}