'use strict';

// This module provides a robust implementation for handling arbitrary-precision integers,
// mimicking JavaScript's native number behavior but extending beyond its safe integer limits.
let largeNum = function ( _void ) {
  // The base for internal array representation, effectively the size of each "chunk" or "digit".
  const CHUNK_SIZE = 1e7;
  // The number of decimal digits that each CHUNK_SIZE can hold (e.g., 7 for 10^7).
  const CHUNK_DIGITS = 7;
  // The maximum safe integer value that JavaScript can natively represent accurately (2^53 - 1).
  const MAX_SAFE_JS_NUM = 9007199254740992;
  // The chunk-array representation of MAX_SAFE_JS_NUM, used for comparisons and bounds checking.
  const SAFE_NUM_PARTS = decomposeSmall(MAX_SAFE_JS_NUM);
  // The natural logarithm of MAX_SAFE_JS_NUM, used for optimizing parsing of numbers from strings.
  const LOG_SAFE_NUM = Math.log(MAX_SAFE_JS_NUM);


  // The primary constructor function for creating numeric entities.
  // It acts as a factory, returning either a TinyNumeric or HugeNumeric instance.
  function NumericEntity(val, baseRepresentation) {
    // If no value is provided, default to zero.
    if (typeof val === "undefined") {
      return NumericEntity[0];
    }
    // If a base is specified, parse the value according to that base.
    if (typeof baseRepresentation !== "undefined") {
      return +baseRepresentation === 10 ? parseTextValue(val) : parseStringWithBase(val, baseRepresentation);
    }
    // Otherwise, parse the value as a standard number or string.
    return parseTextValue(val);
  }


  // Represents an integer that exceeds JavaScript's safe integer limits.
  // Stored as an array of 'digits' (chunks) in a specified base.
  function HugeNumeric(currentValue, currentSign) {
    this.value = currentValue; // Array of numeric chunks.
    this.sign = currentSign;   // Boolean: true for negative, false for positive.
    this.isSmall = false;      // Flag indicating it's a large number.
  }
  // Inherit prototype methods from NumericEntity.
  HugeNumeric.prototype = Object.create(NumericEntity.prototype);


  // Represents an integer that fits within JavaScript's safe integer limits.
  // Stored directly as a native JavaScript number.
  function TinyNumeric(currentValue) {
    this.value = currentValue; // Native JavaScript number.
    this.sign = currentValue < 0; // Boolean: true for negative, false for positive.
    this.isSmall = true;       // Flag indicating it's a small number.
  }
  // Inherit prototype methods from NumericEntity.
  TinyNumeric.prototype = Object.create(NumericEntity.prototype);


  // Determines if a given number can be precisely represented by JavaScript's `number` type.
  function isWithinJsLimit(num) {
    return -MAX_SAFE_JS_NUM < num && num < MAX_SAFE_JS_NUM;
  }


  // Converts a small JavaScript number into its chunk-array representation.
  // This is used for internal arithmetic operations on HugeNumeric instances.
  function decomposeSmall(num) {
    if (num < 1e7) return [num];
    if (num < 1e14) return [num % 1e7, Math.floor(num / 1e7)];
    return [num % 1e7, Math.floor(num / 1e7) % 1e7, Math.floor(num / 1e14)];
  }


  // Attempts to convert a chunk-array representation back into a small JavaScript number.
  // Returns the array if it cannot be represented as a small number.
  function recomposeSmall(chunkVector) {
    normalizeVector(chunkVector); // Remove leading zeros.
    let vectorLength = chunkVector.length;
    // Check if the number of chunks and its magnitude allow for small representation.
    if (vectorLength < 4 && compareAbsoluteVectors(chunkVector, SAFE_NUM_PARTS) < 0) {
      switch (vectorLength) {
        case 0:
          return 0;
        case 1:
          return chunkVector[0];
        case 2:
          return chunkVector[0] + chunkVector[1] * CHUNK_SIZE;
        default:
          return chunkVector[0] + (chunkVector[1] + chunkVector[2] * CHUNK_SIZE) * CHUNK_SIZE;
      }
    }
    return chunkVector;
  }


  // Removes any leading zero chunks from an array representation of a number.
  // This helps maintain canonical form and avoids unnecessary computations.
  function normalizeVector(vector) {
    let index = vector.length;
    // Iterate backwards to find the first non-zero chunk.
    while (index > 0 && vector[--index] === 0);
    vector.length = index + 1; // Trim the array.
  }


  // Creates a new array of a specified length, initialized with zeros.
  function makeZeroVector(len) {
    let newVector = new Array(len);
    let currentIdx = -1;
    while (++currentIdx < len) {
      newVector[currentIdx] = 0;
    }
    return newVector;
  }


  // Truncates a number towards zero (floor for positive, ceil for negative).
  function floorOrCeil(num) {
    if (num > 0) return Math.floor(num);
    return Math.ceil(num);
  }


  // Performs digit-by-digit addition of two chunk arrays.
  // Assumes both input arrays represent positive numbers.
  function performAddition(vecA, vecB) {
    let lenA = vecA.length;
    let lenB = vecB.length;
    let resultVector = new Array(lenA);
    let currentCarry = 0;
    let chunkBase = CHUNK_SIZE;
    let currentSum, idx;

    for (idx = 0; idx < lenB; idx++) {
      currentSum = vecA[idx] + vecB[idx] + currentCarry;
      currentCarry = currentSum >= chunkBase ? 1 : 0;
      resultVector[idx] = currentSum - currentCarry * chunkBase;
    }
    // Propagate carry through remaining digits of the longer number.
    while (idx < lenA) {
      currentSum = vecA[idx] + currentCarry;
      currentCarry = currentSum === chunkBase ? 1 : 0;
      resultVector[idx++] = currentSum - currentCarry * chunkBase;
    }
    // If there's a final carry, append it.
    if (currentCarry > 0) resultVector.push(currentCarry);
    return resultVector;
  }


  // A flexible addition wrapper that ensures the longer array is passed first to `performAddition`.
  function flexibleAddition(vecA, vecB) {
    if (vecA.length >= vecB.length) return performAddition(vecA, vecB);
    return performAddition(vecB, vecA);
  }


  // Adds a small scalar value to a chunk array, handling carries.
  function addSmallScalar(vec, scalarCarry) {
    let len = vec.length;
    let resultVec = new Array(len);
    let chunkBase = CHUNK_SIZE;
    let currentSum, idx;

    for (idx = 0; idx < len; idx++) {
      currentSum = vec[idx] - chunkBase + scalarCarry; // This is a bit of a trick to handle carry propagation.
      scalarCarry = Math.floor(currentSum / chunkBase);
      resultVec[idx] = currentSum - scalarCarry * chunkBase;
      scalarCarry += 1; // Increment carry for next iteration if sum was positive.
    }
    // Handle any remaining carry.
    while (scalarCarry > 0) {
      resultVec[idx++] = scalarCarry % chunkBase;
      scalarCarry = Math.floor(scalarCarry / chunkBase);
    }
    return resultVec;
  }


  // HugeNumeric addition method.
  HugeNumeric.prototype.add = function (operand) {
    let parsedOperand = coerceToNumericEntity(operand);
    // If signs are different, it's effectively a subtraction.
    if (this.sign !== parsedOperand.sign) {
      return this.subtract(parsedOperand.negate());
    }
    let valA = this.value;
    let valB = parsedOperand.value;
    // Optimize for adding a small number.
    if (parsedOperand.isSmall) {
      return new HugeNumeric(addSmallScalar(valA, Math.abs(valB)), this.sign);
    }
    // General addition for two huge numbers.
    return new HugeNumeric(flexibleAddition(valA, valB), this.sign);
  };
  HugeNumeric.prototype.plus = HugeNumeric.prototype.add;


  // TinyNumeric addition method.
  TinyNumeric.prototype.add = function (operand) {
    let parsedOperand = coerceToNumericEntity(operand);
    let currentVal = this.value;
    // If signs are different, it's effectively a subtraction.
    if (currentVal < 0 !== parsedOperand.sign) {
      return this.subtract(parsedOperand.negate());
    }
    let operandVal = parsedOperand.value;
    if (parsedOperand.isSmall) {
      // If both are small, try direct native addition.
      if (isWithinJsLimit(currentVal + operandVal)) return new TinyNumeric(currentVal + operandVal);
      // If native addition overflows, convert operand to array and perform chunk-based addition.
      operandVal = decomposeSmall(Math.abs(operandVal));
    }
    // Fallback to HugeNumeric-style addition (small + huge).
    return new HugeNumeric(addSmallScalar(operandVal, Math.abs(currentVal)), currentVal < 0);
  };
  TinyNumeric.prototype.plus = TinyNumeric.prototype.add;


  // Performs digit-by-digit subtraction of two chunk arrays.
  // Assumes `vecA` is greater than or equal to `vecB` in absolute value.
  function performSubtraction(vecA, vecB) {
    let lenA = vecA.length;
    let lenB = vecB.length;
    let resultVec = new Array(lenA);
    let currentBorrow = 0;
    let chunkBase = CHUNK_SIZE;
    let currentDifference, idx;

    for (idx = 0; idx < lenB; idx++) {
      currentDifference = vecA[idx] - currentBorrow - vecB[idx];
      if (currentDifference < 0) {
        currentDifference += chunkBase;
        currentBorrow = 1;
      } else currentBorrow = 0;
      resultVec[idx] = currentDifference;
    }
    // Propagate borrow through remaining digits of the minuend.
    for (idx = lenB; idx < lenA; idx++) {
      currentDifference = vecA[idx] - currentBorrow;
      if (currentDifference < 0) currentDifference += chunkBase;
      else {
        resultVec[idx++] = currentDifference;
        break; // No more borrows, so remaining digits can be copied directly.
      }
      resultVec[idx] = currentDifference;
    }
    // Copy any remaining higher-order digits from vecA.
    for (; idx < lenA; idx++) {
      resultVec[idx] = vecA[idx];
    }
    normalizeVector(resultVec); // Clean up leading zeros.
    return resultVec;
  }


  // Flexible subtraction wrapper, handles sign determination and magnitude comparison.
  function flexibleSubtraction(vecA, vecB, currentSign) {
    let resultValue;
    // Compare absolute values to determine which number is larger.
    if (compareAbsoluteVectors(vecA, vecB) >= 0) {
      resultValue = performSubtraction(vecA, vecB);
    } else {
      resultValue = performSubtraction(vecB, vecA);
      currentSign = !currentSign; // Flip sign if subtrahend was larger.
    }
    resultValue = recomposeSmall(resultValue); // Try to convert to TinyNumeric.
    if (typeof resultValue === "number") {
      if (currentSign) resultValue = -resultValue;
      return new TinyNumeric(resultValue);
    }
    return new HugeNumeric(resultValue, currentSign);
  }


  // Subtracts a small scalar from a chunk array.
  function subtractSmallScalar(vec, smallScalar, currentSign) {
    let len = vec.length;
    let resultVec = new Array(len);
    let currentCarry = -smallScalar; // Initial carry is negative scalar.
    let chunkBase = CHUNK_SIZE;
    let currentDifference, idx;

    for (idx = 0; idx < len; idx++) {
      currentDifference = vec[idx] + currentCarry;
      currentCarry = Math.floor(currentDifference / chunkBase);
      currentDifference %= chunkBase;
      resultVec[idx] = currentDifference < 0 ? currentDifference + chunkBase : currentDifference;
    }
    resultVec = recomposeSmall(resultVec); // Try to convert to TinyNumeric.
    if (typeof resultVec === "number") {
      if (currentSign) resultVec = -resultVec;
      return new TinyNumeric(resultVec);
    }
    return new HugeNumeric(resultVec, currentSign);
  }


  // HugeNumeric subtraction method.
  HugeNumeric.prototype.subtract = function (operand) {
    let parsedOperand = coerceToNumericEntity(operand);
    // If signs are different, it's effectively an addition.
    if (this.sign !== parsedOperand.sign) {
      return this.add(parsedOperand.negate());
    }
    let valA = this.value;
    let valB = parsedOperand.value;
    // Optimize for subtracting a small number.
    if (parsedOperand.isSmall) return subtractSmallScalar(valA, Math.abs(valB), this.sign);
    // General subtraction for two huge numbers.
    return flexibleSubtraction(valA, valB, this.sign);
  };
  HugeNumeric.prototype.minus = HugeNumeric.prototype.subtract;


  // TinyNumeric subtraction method.
  TinyNumeric.prototype.subtract = function (operand) {
    let parsedOperand = coerceToNumericEntity(operand);
    let currentVal = this.value;
    // If signs are different, it's effectively an addition.
    if (currentVal < 0 !== parsedOperand.sign) {
      return this.add(parsedOperand.negate());
    }
    let operandVal = parsedOperand.value;
    if (parsedOperand.isSmall) {
      // If both are small, perform direct native subtraction.
      return new TinyNumeric(currentVal - operandVal);
    }
    // Fallback to HugeNumeric-style subtraction (small - huge).
    return subtractSmallScalar(operandVal, Math.abs(currentVal), currentVal >= 0);
  };
  TinyNumeric.prototype.minus = TinyNumeric.prototype.subtract;


  // Returns a new HugeNumeric instance with the sign flipped.
  HugeNumeric.prototype.negate = function () {
    return new HugeNumeric(this.value, !this.sign);
  };


  // Returns a new TinyNumeric instance with the sign flipped.
  TinyNumeric.prototype.negate = function () {
    let currentSign = this.sign;
    let tiny = new TinyNumeric(-this.value);
    tiny.sign = !currentSign; // Explicitly set sign for consistency.
    return tiny;
  };


  // Returns a new HugeNumeric instance representing the absolute value.
  HugeNumeric.prototype.absolute = function () {
    return new HugeNumeric(this.value, false);
  };


  // Returns a new TinyNumeric instance representing the absolute value.
  TinyNumeric.prototype.absolute = function () {
    return new TinyNumeric(Math.abs(this.value));
  };


  // Performs long multiplication (schoolbook method) for two chunk arrays.
  function longMultiplication(vecA, vecB) {
    let lenA = vecA.length;
    let lenB = vecB.length;
    let resultLen = lenA + lenB;
    let resultVec = makeZeroVector(resultLen);
    let chunkBase = CHUNK_SIZE;
    let currentProduct, currentCarry, idx, digitA, digitB;

    for (idx = 0; idx < lenA; ++idx) {
      digitA = vecA[idx];
      for (let j = 0; j < lenB; ++j) {
        digitB = vecB[j];
        currentProduct = digitA * digitB + resultVec[idx + j];
        currentCarry = Math.floor(currentProduct / chunkBase);
        resultVec[idx + j] = currentProduct - currentCarry * chunkBase;
        resultVec[idx + j + 1] += currentCarry; // Add carry to the next position.
      }
    }
    normalizeVector(resultVec); // Clean up leading zeros.
    return resultVec;
  }


  // Multiplies a chunk array by a single small scalar.
  function scalarMultiplication(vec, scalar) {
    let len = vec.length;
    let resultVec = new Array(len);
    let chunkBase = CHUNK_SIZE;
    let currentCarry = 0;
    let currentProduct, idx;

    for (idx = 0; idx < len; idx++) {
      currentProduct = vec[idx] * scalar + currentCarry;
      currentCarry = Math.floor(currentProduct / chunkBase);
      resultVec[idx] = currentProduct - currentCarry * chunkBase;
    }
    // Handle any remaining carry.
    while (currentCarry > 0) {
      resultVec[idx++] = currentCarry % chunkBase;
      currentCarry = Math.floor(currentCarry / chunkBase);
    }
    return resultVec;
  }


  // Prepends zeros to a chunk array, effectively multiplying by a power of the base.
  function padWithZeros(vec, numZeros) {
    let result = [];
    while (numZeros-- > 0) result.push(0);
    return result.concat(vec);
  }


  // Implements the Karatsuba multiplication algorithm for improved performance with very large numbers.
  function karatsubaProduct(vecX, vecY) {
    let N = Math.max(vecX.length, vecY.length);
    // Fallback to simpler long multiplication for smaller arrays, where Karatsuba overhead is too high.
    if (N <= 30) return longMultiplication(vecX, vecY);

    N = Math.ceil(N / 2);
    // Split the numbers (represented as chunk arrays) into two halves.
    let vecB = vecX.slice(N);
    let vecA = vecX.slice(0, N);
    let vecD = vecY.slice(N);
    let vecC = vecY.slice(0, N);

    // Recursively compute the three necessary products.
    let productAC = karatsubaProduct(vecA, vecC);
    let productBD = karatsubaProduct(vecB, vecD);
    let productABCD = karatsubaProduct(flexibleAddition(vecA, vecB), flexibleAddition(vecC, vecD));

    // Combine the results using the Karatsuba formula: P = ac * (Base^2N) + ((a+b)(c+d) - ac - bd) * (Base^N) + bd
    let combinedProduct = flexibleAddition(
      flexibleAddition(productAC, padWithZeros(performSubtraction(performSubtraction(productABCD, productAC), productBD), N)),
      padWithZeros(productBD, 2 * N)
    );
    normalizeVector(combinedProduct); // Clean up leading zeros.
    return combinedProduct;
  }


  // Heuristic function to determine if Karatsuba multiplication would be more efficient.
  // The threshold depends on array lengths.
  function shouldUseKaratsuba(len1, len2) {
    return -.012 * len1 - .012 * len2 + 15e-6 * len1 * len2 > 0;
  }


  // HugeNumeric multiplication method.
  HugeNumeric.prototype.multiply = function (operand) {
    let parsedOperand = coerceToNumericEntity(operand);
    let valA = this.value;
    let valB = parsedOperand.value;
    let resultSign = this.sign !== parsedOperand.sign; // Determine overall sign.
    let absVal;

    if (parsedOperand.isSmall) {
      if (valB === 0) return NumericEntity[0];
      if (valB === 1) return this;
      if (valB === -1) return this.negate();
      absVal = Math.abs(valB);
      // Optimize for multiplying by a small scalar chunk.
      if (absVal < CHUNK_SIZE) {
        return new HugeNumeric(scalarMultiplication(valA, absVal), resultSign);
      }
      valB = decomposeSmall(absVal); // Convert small operand to array for general multiplication.
    }
    // Choose between Karatsuba and long multiplication based on size.
    if (shouldUseKaratsuba(valA.length, valB.length)) return new HugeNumeric(karatsubaProduct(valA, valB), resultSign);
    return new HugeNumeric(longMultiplication(valA, valB), resultSign);
  };
  HugeNumeric.prototype.times = HugeNumeric.prototype.multiply;


  // Multiplies a small number by a chunk array.
  function scalarVectorMultiply(smallVal, chunkVec, resultSign) {
    if (smallVal < CHUNK_SIZE) {
      return new HugeNumeric(scalarMultiplication(chunkVec, smallVal), resultSign);
    }
    // If smallVal is too large for scalarMultiplication, convert it to an array.
    return new HugeNumeric(longMultiplication(chunkVec, decomposeSmall(smallVal)), resultSign);
  }


  // Internal multiplication method for TinyNumeric when multiplied by another small number.
  TinyNumeric.prototype._multiplyBySmall = function (operand) {
    // If the product fits within JavaScript's safe integer limits.
    if (isWithinJsLimit(operand.value * this.value)) {
      return new TinyNumeric(operand.value * this.value);
    }
    // Otherwise, convert to HugeNumeric logic.
    return scalarVectorMultiply(Math.abs(operand.value), decomposeSmall(Math.abs(this.value)), this.sign !== operand.sign);
  };


  // Internal multiplication method for HugeNumeric when multiplied by a small number.
  HugeNumeric.prototype._multiplyBySmall = function (operand) {
    if (operand.value === 0) return NumericEntity[0];
    if (operand.value === 1) return this;
    if (operand.value === -1) return this.negate();
    return scalarVectorMultiply(Math.abs(operand.value), this.value, this.sign !== operand.sign);
  };


  // TinyNumeric multiplication method.
  TinyNumeric.prototype.multiply = function (operand) {
    return coerceToNumericEntity(operand)._multiplyBySmall(this);
  };
  TinyNumeric.prototype.times = TinyNumeric.prototype.multiply;


  // Squares a chunk array.
  function performSquaring(vec) {
    let len = vec.length;
    let resultVec = makeZeroVector(len + len);
    let chunkBase = CHUNK_SIZE;
    let currentProduct, currentCarry, idx, valI, valJ;

    for (idx = 0; idx < len; idx++) {
      valI = vec[idx];
      currentCarry = 0 - valI * valI; // Initialize carry based on the square of the current digit.
      for (let j = idx; j < len; j++) {
        valJ = vec[j];
        currentProduct = 2 * (valI * valJ) + resultVec[idx + j] + currentCarry;
        currentCarry = Math.floor(currentProduct / chunkBase);
        resultVec[idx + j] = currentProduct - currentCarry * chunkBase;
      }
      resultVec[idx + len] = currentCarry; // Store the final carry for this row.
    }
    normalizeVector(resultVec); // Clean up leading zeros.
    return resultVec;
  }


  // HugeNumeric squaring method.
  HugeNumeric.prototype.square = function () {
    return new HugeNumeric(performSquaring(this.value), false);
  };


  // TinyNumeric squaring method.
  TinyNumeric.prototype.square = function () {
    let squaredValue = this.value * this.value;
    if (isWithinJsLimit(squaredValue)) return new TinyNumeric(squaredValue);
    // If native squaring overflows, convert to HugeNumeric and perform chunk-based squaring.
    return new HugeNumeric(performSquaring(decomposeSmall(Math.abs(this.value))), false);
  };


  // Division and Modulo using Algorithm D (Knuth's, optimized for large numbers).
  function extendedDivision(dividendVec, divisorVec) {
    let dividendLen = dividendVec.length;
    let divisorLen = divisorVec.length;
    let quotientVec = makeZeroVector(divisorLen);
    let chunkBase = CHUNK_SIZE;
    let msbDivisor = divisorVec[divisorLen - 1]; // Most significant chunk of the divisor.
    // Normalize divisor and dividend by multiplying by a factor `lambdaFactor`
    // to make the divisor's MSB larger, improving quotient digit estimation.
    let lambdaFactor = Math.ceil(chunkBase / (2 * msbDivisor));
    let remainderVec = scalarMultiplication(dividendVec, lambdaFactor);
    let scaledDivisor = scalarMultiplication(divisorVec, lambdaFactor);
    let currentQuotientDigit, currentShift, currentCarry, currentBorrow, idx, loopLen, tempQ;

    // Ensure remainder has enough space.
    if (remainderVec.length <= dividendLen) remainderVec.push(0);
    scaledDivisor.push(0); // Pad scaled divisor for easier calculations.
    msbDivisor = scaledDivisor[divisorLen - 1]; // Update MSB after scaling.

    for (currentShift = dividendLen - divisorLen; currentShift >= 0; currentShift--) {
      currentQuotientDigit = chunkBase - 1;
      // Estimate the quotient digit.
      if (remainderVec[currentShift + divisorLen] !== msbDivisor) {
        currentQuotientDigit = Math.floor((remainderVec[currentShift + divisorLen] * chunkBase + remainderVec[currentShift + divisorLen - 1]) / msbDivisor);
      }

      currentCarry = 0;
      currentBorrow = 0;
      loopLen = scaledDivisor.length;
      // Subtract (estimated_q * scaled_divisor) from the current part of the remainder.
      for (idx = 0; idx < loopLen; idx++) {
        currentCarry += currentQuotientDigit * scaledDivisor[idx];
        tempQ = Math.floor(currentCarry / chunkBase);
        currentBorrow += remainderVec[currentShift + idx] - (currentCarry - tempQ * chunkBase);
        currentCarry = tempQ;
        if (currentBorrow < 0) {
          remainderVec[currentShift + idx] = currentBorrow + chunkBase;
          currentBorrow = -1;
        } else {
          remainderVec[currentShift + idx] = currentBorrow;
          currentBorrow = 0;
        }
      }

      // Adjust the quotient digit if the subtraction resulted in a negative remainder (too high estimate).
      while (currentBorrow !== 0) {
        currentQuotientDigit -= 1;
        currentCarry = 0;
        for (idx = 0; idx < loopLen; idx++) {
          currentCarry += remainderVec[currentShift + idx] - chunkBase + scaledDivisor[idx];
          if (currentCarry < 0) {
            remainderVec[currentShift + idx] = currentCarry + chunkBase;
            currentCarry = 0;
          } else {
            remainderVec[currentShift + idx] = currentCarry;
            currentCarry = 1;
          }
        }
        currentBorrow += currentCarry;
      }
      quotientVec[currentShift] = currentQuotientDigit;
    }
    // Un-normalize the remainder by dividing by the `lambdaFactor`.
    remainderVec = scalarDivision(remainderVec, lambdaFactor)[0];
    return [recomposeSmall(quotientVec), recomposeSmall(remainderVec)];
  }


  // Division and Modulo using an iterative subtraction approach.
  // This is simpler but generally less efficient for very large numbers than Algorithm D.
  function iterativeDivision(dividendVec, divisorVec) {
    let dividendLen = dividendVec.length;
    let divisorLen = divisorVec.length;
    let quotientResults = [];
    let currentPart = [];
    let chunkBase = CHUNK_SIZE;
    let estimatedQuotient, partLen, highPartX, highPartY, checkProduct;

    while (dividendLen) {
      currentPart.unshift(dividendVec[--dividendLen]); // Take one chunk from dividend.
      normalizeVector(currentPart); // Clean up.

      // If the current part is smaller than the divisor, the quotient digit is 0.
      if (compareAbsoluteVectors(currentPart, divisorVec) < 0) {
        quotientResults.push(0);
        continue;
      }

      partLen = currentPart.length;
      // Estimate quotient digit using the most significant chunks.
      highPartX = currentPart[partLen - 1] * chunkBase + currentPart[partLen - 2];
      highPartY = divisorVec[divisorLen - 1] * chunkBase + divisorVec[divisorLen - 2];

      if (partLen > divisorLen) { // Adjust highPartX if it's one chunk longer.
        highPartX = (highPartX + 1) * chunkBase;
      }

      estimatedQuotient = Math.ceil(highPartX / highPartY);
      // Refine the estimated quotient by trial subtraction.
      do {
        checkProduct = scalarMultiplication(divisorVec, estimatedQuotient);
        if (compareAbsoluteVectors(checkProduct, currentPart) <= 0) break;
        estimatedQuotient--;
      } while (estimatedQuotient);

      quotientResults.push(estimatedQuotient);
      currentPart = performSubtraction(currentPart, checkProduct); // Subtract the product.
    }
    quotientResults.reverse(); // Digits were collected in reverse order.
    return [recomposeSmall(quotientResults), recomposeSmall(currentPart)];
  }


  // Divides a chunk array by a single small scalar.
  function scalarDivision(chunkVec, scalar) {
    let len = chunkVec.length;
    let quotientVec = makeZeroVector(len);
    let chunkBase = CHUNK_SIZE;
    let currentRemainder = 0;
    let idx, currentQuotient, currentDivisor;

    for (idx = len - 1; idx >= 0; --idx) {
      currentDivisor = currentRemainder * chunkBase + chunkVec[idx];
      currentQuotient = floorOrCeil(currentDivisor / scalar);
      currentRemainder = currentDivisor - currentQuotient * scalar;
      quotientVec[idx] = currentQuotient | 0; // Ensure integer value.
    }
    return [quotientVec, currentRemainder | 0]; // Return quotient array and final remainder.
  }


  // Generic division and modulo function, handling signs, types, and choosing algorithms.
  function flexibleDivisionModulo(selfInstance, operand) {
    let resultTuple,
      parsedOperand = coerceToNumericEntity(operand);
    let valA = selfInstance.value;
    let valB = parsedOperand.value;
    let calculatedQuotient;

    if (valB === 0) throw new Error("Cannot divide by zero");

    // Handle cases where the dividend is a TinyNumeric.
    if (selfInstance.isSmall) {
      if (parsedOperand.isSmall) {
        return [new TinyNumeric(floorOrCeil(valA / valB)), new TinyNumeric(valA % valB)];
      }
      return [NumericEntity[0], selfInstance]; // If small dividend and huge divisor, quotient is 0, remainder is dividend.
    }

    // Handle cases where the divisor is a TinyNumeric.
    if (parsedOperand.isSmall) {
      if (valB === 1) return [selfInstance, NumericEntity[0]];
      if (valB == -1) return [selfInstance.negate(), NumericEntity[0]];
      let absValB = Math.abs(valB);
      if (absValB < CHUNK_SIZE) { // If small divisor fits in a chunk.
        resultTuple = scalarDivision(valA, absValB);
        calculatedQuotient = recomposeSmall(resultTuple[0]);
        let remainderResult = resultTuple[1];
        if (selfInstance.sign) remainderResult = -remainderResult; // Apply dividend's sign to remainder.

        if (typeof calculatedQuotient === "number") {
          if (selfInstance.sign !== parsedOperand.sign) calculatedQuotient = -calculatedQuotient;
          return [new TinyNumeric(calculatedQuotient), new TinyNumeric(remainderResult)];
        }
        return [new HugeNumeric(calculatedQuotient, selfInstance.sign !== parsedOperand.sign), new TinyNumeric(remainderResult)];
      }
      valB = decomposeSmall(absValB); // Convert small divisor to array for generic division.
    }

    // Compare absolute values of dividend and divisor.
    let comparisonResult = compareAbsoluteVectors(valA, valB);
    if (comparisonResult === -1) return [NumericEntity[0], selfInstance]; // Dividend < divisor.
    if (comparisonResult === 0) return [NumericEntity[selfInstance.sign === parsedOperand.sign ? 1 : -1], NumericEntity[0]]; // Dividend == divisor.

    // Choose division algorithm based on total length.
    if (valA.length + valB.length <= 200) resultTuple = extendedDivision(valA, valB);
    else resultTuple = iterativeDivision(valA, valB);

    calculatedQuotient = resultTuple[0];
    let quotientSign = selfInstance.sign !== parsedOperand.sign;
    let calculatedMod = resultTuple[1];
    let modSign = selfInstance.sign; // Remainder takes sign of dividend.

    // Convert results back to appropriate NumericEntity instances.
    if (typeof calculatedQuotient === "number") {
      if (quotientSign) calculatedQuotient = -calculatedQuotient;
      calculatedQuotient = new TinyNumeric(calculatedQuotient);
    } else calculatedQuotient = new HugeNumeric(calculatedQuotient, quotientSign);

    if (typeof calculatedMod === "number") {
      if (modSign) calculatedMod = -calculatedMod;
      calculatedMod = new TinyNumeric(calculatedMod);
    } else calculatedMod = new HugeNumeric(calculatedMod, modSign);

    return [calculatedQuotient, calculatedMod];
  }


  // HugeNumeric method to return both quotient and remainder.
  HugeNumeric.prototype.divmod = function (operand) {
    let results = flexibleDivisionModulo(this, operand);
    return {
      quotient: results[0],
      remainder: results[1]
    };
  };
  TinyNumeric.prototype.divmod = HugeNumeric.prototype.divmod; // Share implementation.


  // HugeNumeric method to return only the quotient.
  HugeNumeric.prototype.divide = function (operand) {
    return flexibleDivisionModulo(this, operand)[0];
  };
  TinyNumeric.prototype.over = TinyNumeric.prototype.divide = HugeNumeric.prototype.over = HugeNumeric.prototype.divide;


  // HugeNumeric method to return only the remainder.
  HugeNumeric.prototype.mod = function (operand) {
    return flexibleDivisionModulo(this, operand)[1];
  };
  TinyNumeric.prototype.remainder = TinyNumeric.prototype.mod = HugeNumeric.prototype.remainder = HugeNumeric.prototype.mod;


  // HugeNumeric exponentiation (power) method.
  HugeNumeric.prototype.power = function (exponent) {
    let parsedExp = coerceToNumericEntity(exponent);
    let baseValue = this.value;
    let expValue = parsedExp.value;
    let tempResult, currentX, currentY;

    if (expValue === 0) return NumericEntity[1];
    if (baseValue === 0) return NumericEntity[0];
    if (baseValue === 1) return NumericEntity[1];
    if (baseValue === -1) return parsedExp.isEven() ? NumericEntity[1] : NumericEntity[-1];

    if (parsedExp.sign) {
      return NumericEntity[0]; // Negative exponent implies fractional result, approximated as 0 for integers.
    }
    if (!parsedExp.isSmall) throw new Error("The exponent " + parsedExp.toString() + " is too large.");

    if (this.isSmall) {
      // Try native Math.pow for small numbers if possible.
      if (isWithinJsLimit(tempResult = Math.pow(baseValue, expValue))) return new TinyNumeric(floorOrCeil(tempResult));
    }

    // Use binary exponentiation (exponentiation by squaring) for efficiency.
    currentX = this;
    currentY = NumericEntity[1];
    while (true) {
      if ((expValue & 1) === 1) { // If exponent is odd.
        currentY = currentY.times(currentX);
        --expValue;
      }
      if (expValue === 0) break;
      expValue /= 2;
      currentX = currentX.square();
    }
    return currentY;
  };
  TinyNumeric.prototype.power = HugeNumeric.prototype.power;


  // HugeNumeric modular exponentiation (a^b mod m).
  HugeNumeric.prototype.modularPower = function (exponent, modulus) {
    exponent = coerceToNumericEntity(exponent);
    modulus = coerceToNumericEntity(modulus);
    if (modulus.isZero()) throw new Error("Cannot take modular power with modulus 0");

    let resultAccumulator = NumericEntity[1];
    let currentBase = this.mod(modulus); // Reduce base modulo modulus first.

    while (exponent.isPositive()) {
      if (currentBase.isZero()) return NumericEntity[0]; // If base is 0, result is 0.
      if (exponent.isOdd()) resultAccumulator = resultAccumulator.multiply(currentBase).mod(modulus);
      exponent = exponent.divide(2);
      currentBase = currentBase.square().mod(modulus);
    }
    return resultAccumulator;
  };
  TinyNumeric.prototype.modularPower = HugeNumeric.prototype.modularPower;


  // Compares the absolute values of two chunk arrays.
  // Returns -1 if vecA < vecB, 0 if vecA == vecB, 1 if vecA > vecB.
  function compareAbsoluteVectors(vecA, vecB) {
    if (vecA.length !== vecB.length) {
      return vecA.length > vecB.length ? 1 : -1;
    }
    // Compare chunk by chunk from most significant to least significant.
    for (let idx = vecA.length - 1; idx >= 0; idx--) {
      if (vecA[idx] !== vecB[idx]) return vecA[idx] > vecB[idx] ? 1 : -1;
    }
    return 0; // Arrays are identical.
  }


  // HugeNumeric method for comparing absolute values.
  HugeNumeric.prototype.compareAbsolute = function (operand) {
    let parsedOperand = coerceToNumericEntity(operand);
    let valA = this.value;
    let valB = parsedOperand.value;
    if (parsedOperand.isSmall) return 1; // A huge number's magnitude is always greater than a small one (if non-zero).
    return compareAbsoluteVectors(valA, valB);
  };


  // TinyNumeric method for comparing absolute values.
  TinyNumeric.prototype.compareAbsolute = function (operand) {
    let parsedOperand = coerceToNumericEntity(operand);
    let valA = Math.abs(this.value);
    let valB = parsedOperand.value;
    if (parsedOperand.isSmall) {
      valB = Math.abs(valB);
      return valA === valB ? 0 : valA > valB ? 1 : -1;
    }
    return -1; // A tiny number's magnitude is always smaller than a huge one (if non-zero).
  };


  // HugeNumeric general comparison method.
  HugeNumeric.prototype.compare = function (operand) {
    if (operand === Infinity) return -1;
    if (operand === -Infinity) return 1;

    let parsedOperand = coerceToNumericEntity(operand);
    let valA = this.value;
    let valB = parsedOperand.value;

    // Handle different signs first.
    if (this.sign !== parsedOperand.sign) {
      return parsedOperand.sign ? 1 : -1; // If parsedOperand is negative, this (positive) is greater.
    }
    // If signs are the same, compare magnitudes, considering small vs. huge.
    if (parsedOperand.isSmall) {
      return this.sign ? -1 : 1; // If negative, a huge negative is smaller. If positive, a huge positive is larger.
    }
    // Both are HugeNumeric and have the same sign.
    return compareAbsoluteVectors(valA, valB) * (this.sign ? -1 : 1); // Flip result if numbers are negative.
  };
  HugeNumeric.prototype.compareTo = HugeNumeric.prototype.compare;


  // TinyNumeric general comparison method.
  TinyNumeric.prototype.compare = function (operand) {
    if (operand === Infinity) return -1;
    if (operand === -Infinity) return 1;

    let parsedOperand = coerceToNumericEntity(operand);
    let valA = this.value;
    let valB = parsedOperand.value;

    if (parsedOperand.isSmall) {
      return valA == valB ? 0 : valA > valB ? 1 : -1; // Direct comparison for native numbers.
    }
    // If signs are different (e.g., this is negative, operand is positive HugeNumeric).
    if (valA < 0 !== parsedOperand.sign) {
      return valA < 0 ? -1 : 1; // If this is negative, it's smaller. If this is positive, it's larger.
    }
    // Both have same sign, this is small, operand is huge.
    return valA < 0 ? 1 : -1; // If both negative, small negative is "larger" (closer to zero). If both positive, small positive is "smaller".
  };
  TinyNumeric.prototype.compareTo = TinyNumeric.prototype.compare;


  // Checks if two numeric entities are equal.
  HugeNumeric.prototype.equals = function (operand) {
    return this.compare(operand) === 0;
  };
  TinyNumeric.prototype.eq = TinyNumeric.prototype.equals = HugeNumeric.prototype.eq = HugeNumeric.prototype.equals;


  // Checks if two numeric entities are not equal.
  HugeNumeric.prototype.notEquals = function (operand) {
    return this.compare(operand) !== 0;
  };
  TinyNumeric.prototype.neq = TinyNumeric.prototype.notEquals = HugeNumeric.prototype.neq = HugeNumeric.prototype.notEquals;


  // Checks if this numeric entity is greater than the operand.
  HugeNumeric.prototype.isGreater = function (operand) {
    return this.compare(operand) > 0;
  };
  TinyNumeric.prototype.gt = TinyNumeric.prototype.isGreater = HugeNumeric.prototype.gt = HugeNumeric.prototype.isGreater;


  // Checks if this numeric entity is lesser than the operand.
  HugeNumeric.prototype.isLesser = function (operand) {
    return this.compare(operand) < 0;
  };
  TinyNumeric.prototype.lt = TinyNumeric.prototype.isLesser = HugeNumeric.prototype.lt = HugeNumeric.prototype.isLesser;


  // Checks if this numeric entity is greater than or equal to the operand.
  HugeNumeric.prototype.isGreaterOrEqual = function (operand) {
    return this.compare(operand) >= 0;
  };
  TinyNumeric.prototype.geq = TinyNumeric.prototype.isGreaterOrEqual = HugeNumeric.prototype.geq = HugeNumeric.prototype.isGreaterOrEqual;


  // Checks if this numeric entity is lesser than or equal to the operand.
  HugeNumeric.prototype.isLesserOrEqual = function (operand) {
    return this.compare(operand) <= 0;
  };
  TinyNumeric.prototype.leq = TinyNumeric.prototype.isLesserOrEqual = HugeNumeric.prototype.leq = HugeNumeric.prototype.isLesserOrEqual;


  // Checks if the HugeNumeric instance is even.
  HugeNumeric.prototype.isEven = function () {
    return (this.value[0] & 1) === 0; // Check the least significant chunk.
  };
  // Checks if the TinyNumeric instance is even.
  TinyNumeric.prototype.isEven = function () {
    return (this.value & 1) === 0; // Check the native number.
  };


  // Checks if the HugeNumeric instance is odd.
  HugeNumeric.prototype.isOdd = function () {
    return (this.value[0] & 1) === 1; // Check the least significant chunk.
  };
  // Checks if the TinyNumeric instance is odd.
  TinyNumeric.prototype.isOdd = function () {
    return (this.value & 1) === 1; // Check the native number.
  };


  // Checks if the HugeNumeric instance is positive.
  HugeNumeric.prototype.isPositive = function () {
    return !this.sign;
  };
  // Checks if the TinyNumeric instance is positive.
  TinyNumeric.prototype.isPositive = function () {
    return this.value > 0;
  };


  // Checks if the HugeNumeric instance is negative.
  HugeNumeric.prototype.isNegative = function () {
    return this.sign;
  };
  // Checks if the TinyNumeric instance is negative.
  TinyNumeric.prototype.isNegative = function () {
    return this.value < 0;
  };


  // Checks if the absolute value of the HugeNumeric instance is 1.
  HugeNumeric.prototype.isUnit = function () {
    return false; // A HugeNumeric is never 1 (1 is always a TinyNumeric).
  };
  // Checks if the absolute value of the TinyNumeric instance is 1.
  TinyNumeric.prototype.isUnit = function () {
    return Math.abs(this.value) === 1;
  };


  // Checks if the HugeNumeric instance is zero.
  HugeNumeric.prototype.isZero = function () {
    return false; // A HugeNumeric is never 0 (0 is always a TinyNumeric).
  };
  // Checks if the TinyNumeric instance is zero.
  TinyNumeric.prototype.isZero = function () {
    return this.value === 0;
  };


  // Checks if this numeric entity is divisible by another.
  HugeNumeric.prototype.isDivisibleBy = function (operand) {
    let parsedOperand = coerceToNumericEntity(operand);
    let operandVal = parsedOperand.value;
    if (operandVal === 0) return false; // Cannot divide by zero.
    if (operandVal === 1) return true; // Any integer is divisible by 1.
    if (operandVal === 2) return this.isEven(); // Optimized check for divisibility by 2.
    return this.mod(parsedOperand).equals(NumericEntity[0]); // General case: remainder is zero.
  };
  TinyNumeric.prototype.isDivisibleBy = HugeNumeric.prototype.isDivisibleBy;


  // Performs a basic primality test for small numbers (up to 25).
  function isBasicPrimeCheck(numVal) {
    let absoluteNum = numVal.absolute();
    if (absoluteNum.isUnit()) return false;
    if (absoluteNum.equals(2) || absoluteNum.equals(3) || absoluteNum.equals(5)) return true;
    if (absoluteNum.isEven() || absoluteNum.isDivisibleBy(3) || absoluteNum.isDivisibleBy(5)) return false;
    if (absoluteNum.isLesser(25)) return true; // Catch primes like 7, 11, 13, 17, 19, 23.
  }


  // Miller-Rabin primality test for HugeNumeric instances.
  HugeNumeric.prototype.isPrime = function () {
    let primeStatus = isBasicPrimeCheck(this);
    if (primeStatus !== undefined) return primeStatus; // If small, use basic check result.

    let absoluteVal = this.absolute(),
      prevVal = absoluteVal.prev(); // n-1
    let testPrimes = [2, 3, 5, 7, 11, 13, 17, 19],
      tempB = prevVal,
      divisor, isTrue, idx, testX;

    // Find d such that n-1 = 2^s * d (where d is odd).
    while (tempB.isEven()) tempB = tempB.divide(2);

    // Perform Miller-Rabin tests with fixed bases.
    for (idx = 0; idx < testPrimes.length; idx++) {
      testX = largeNum(testPrimes[idx]).modularPower(tempB, absoluteVal);
      if (testX.equals(NumericEntity[1]) || testX.equals(prevVal)) continue; // Passes a witness test.

      // Check for other conditions (a^(2^r * d) mod n).
      for (isTrue = true, divisor = tempB; isTrue && divisor.isLesser(prevVal); divisor = divisor.multiply(2)) {
        testX = testX.square().mod(absoluteVal);
        if (testX.equals(prevVal)) isTrue = false; // Witness found.
      }
      if (isTrue) return false; // Not prime.
    }
    return true; // Probably prime.
  };
  TinyNumeric.prototype.isPrime = HugeNumeric.prototype.isPrime;


  // Probabilistic primality test (Miller-Rabin with random bases).
  HugeNumeric.prototype.isProbablePrime = function (numIterations) {
    let primeStatus = isBasicPrimeCheck(this);
    if (primeStatus !== undefined) return primeStatus; // If small, use basic check result.

    let absoluteVal = this.absolute();
    let numTests = numIterations === undefined ? 5 : numIterations; // Default to 5 iterations.

    for (let idx = 0; idx < numTests; idx++) {
      let randomBase = largeNum.generateRandomBetween(2, absoluteVal.minus(2));
      if (!randomBase.modularPower(absoluteVal.prev(), absoluteVal).isUnit()) return false; // If not a strong probable prime, it's composite.
    }
    return true; // Probably prime.
  };
  TinyNumeric.prototype.isProbablePrime = HugeNumeric.prototype.isProbablePrime;


  // Calculates the modular multiplicative inverse (a^-1 mod n) using extended Euclidean algorithm.
  HugeNumeric.prototype.modularInverse = function (modNum) {
    let tVal = largeNum.nullValue,
      newTVal = largeNum.unit,
      rVal = coerceToNumericEntity(modNum),
      newRVal = this.absolute(),
      qVal, lastT, lastR;

    while (!newRVal.equals(largeNum.nullValue)) {
      qVal = rVal.divide(newRVal);
      lastT = tVal;
      lastR = rVal;
      tVal = newTVal;
      rVal = newRVal;
      newTVal = lastT.subtract(qVal.multiply(newTVal));
      newRVal = lastR.subtract(qVal.multiply(newRVal));
    }
    if (!rVal.equals(1)) throw new Error(this.toString() + " and " + modNum.toString() + " are not co-prime");
    if (tVal.compare(0) === -1) {
      tVal = tVal.add(modNum); // Ensure result is positive.
    }
    if (this.isNegative()) {
      return tVal.negate(); // Apply original sign if base was negative.
    }
    return tVal;
  };
  TinyNumeric.prototype.modularInverse = HugeNumeric.prototype.modularInverse;


  // Returns the next integer (this + 1).
  HugeNumeric.prototype.next = function () {
    let val = this.value;
    if (this.sign) { // If negative, adding 1 means subtracting 1 from its absolute value.
      return subtractSmallScalar(val, 1, this.sign);
    }
    return new HugeNumeric(addSmallScalar(val, 1), this.sign);
  };
  // Returns the next integer for TinyNumeric.
  TinyNumeric.prototype.next = function () {
    let val = this.value;
    if (val + 1 < MAX_SAFE_JS_NUM) return new TinyNumeric(val + 1);
    return new HugeNumeric(SAFE_NUM_PARTS, false); // If it overflows JS safe int, convert to HugeNumeric.
  };


  // Returns the previous integer (this - 1).
  HugeNumeric.prototype.prev = function () {
    let val = this.value;
    if (this.sign) { // If negative, subtracting 1 means adding 1 to its absolute value.
      return new HugeNumeric(addSmallScalar(val, 1), true);
    }
    return subtractSmallScalar(val, 1, this.sign);
  };
  // Returns the previous integer for TinyNumeric.
  TinyNumeric.prototype.prev = function () {
    let val = this.value;
    if (val - 1 > -MAX_SAFE_JS_NUM) return new TinyNumeric(val - 1);
    return new HugeNumeric(SAFE_NUM_PARTS, true); // If it underflows JS safe int, convert to HugeNumeric.
  };


  // Precomputed powers of two up to CHUNK_SIZE for efficient bitwise shifts.
  const binaryMultipliers = [1];
  while (2 * binaryMultipliers[binaryMultipliers.length - 1] <= CHUNK_SIZE) binaryMultipliers.push(2 * binaryMultipliers[binaryMultipliers.length - 1]);
  const multiplierCount = binaryMultipliers.length;
  const maxBinaryMultiplier = binaryMultipliers[multiplierCount - 1];


  // Checks if the shift amount is small enough to be handled directly or with simple multiplication/division.
  function isShiftAmountSmall(shiftVal) {
    return (typeof shiftVal === "number" || typeof shiftVal === "string") && +Math.abs(shiftVal) <= CHUNK_SIZE || shiftVal instanceof HugeNumeric && shiftVal.value.length <= 1;
  }


  // HugeNumeric left shift operation.
  HugeNumeric.prototype.shiftLeft = function (shiftAmount) {
    if (!isShiftAmountSmall(shiftAmount)) {
      throw new Error(String(shiftAmount) + " is too large for shifting.");
    }
    shiftAmount = +shiftAmount; // Ensure it's a number.
    if (shiftAmount < 0) return this.shiftRight(-shiftAmount); // Negative left shift is a right shift.

    let currentResult = this;
    if (currentResult.isZero()) return currentResult;

    // Shift by multiples of `multiplierCount` (which corresponds to `maxBinaryMultiplier`).
    while (shiftAmount >= multiplierCount) {
      currentResult = currentResult.multiply(maxBinaryMultiplier);
      shiftAmount -= multiplierCount - 1; // Adjust remaining shift amount.
    }
    return currentResult.multiply(binaryMultipliers[shiftAmount]); // Apply final shift.
  };
  TinyNumeric.prototype.shiftLeft = HugeNumeric.prototype.shiftLeft;


  // HugeNumeric right shift operation.
  HugeNumeric.prototype.shiftRight = function (shiftAmount) {
    let quotientRemainderPair;
    if (!isShiftAmountSmall(shiftAmount)) {
      throw new Error(String(shiftAmount) + " is too large for shifting.");
    }
    shiftAmount = +shiftAmount; // Ensure it's a number.
    if (shiftAmount < 0) return this.shiftLeft(-shiftAmount); // Negative right shift is a left shift.

    let currentResult = this;
    // Handle special cases for zero or negative unit (e.g., -1 shifted right is still -1).
    while (shiftAmount >= multiplierCount) {
      if (currentResult.isZero() || currentResult.isNegative() && currentResult.isUnit()) return currentResult;
      quotientRemainderPair = flexibleDivisionModulo(currentResult, maxBinaryMultiplier);
      // Adjust quotient if remainder is negative (mimics signed right shift).
      currentResult = quotientRemainderPair[1].isNegative() ? quotientRemainderPair[0].prev() : quotientRemainderPair[0];
      shiftAmount -= multiplierCount - 1;
    }
    quotientRemainderPair = flexibleDivisionModulo(currentResult, binaryMultipliers[shiftAmount]);
    return quotientRemainderPair[1].isNegative() ? quotientRemainderPair[0].prev() : quotientRemainderPair[0];
  };
  TinyNumeric.prototype.shiftRight = HugeNumeric.prototype.shiftRight;


  // Applies a bitwise operation (AND, OR, XOR) to two numeric entities.
  // Handles negative numbers using two's complement logic.
  function applyBitwiseOp(numX, numY, operationFn) {
    numY = coerceToNumericEntity(numY);
    let signX = numX.isNegative(),
      signY = numY.isNegative();
    // Convert negative numbers to their two's complement representation for bitwise ops.
    let remainingX = signX ? numX.not() : numX,
      remainingY = signY ? numY.not() : numY;
    let digitX = 0,
      digitY = 0;
    let divModX = null,
      divModY = null;
    let digitResults = [];

    // Process chunk by chunk (from least significant).
    while (!remainingX.isZero() || !remainingY.isZero()) {
      divModX = flexibleDivisionModulo(remainingX, maxBinaryMultiplier);
      digitX = divModX[1].toJsNumber();
      if (signX) {
        digitX = maxBinaryMultiplier - 1 - digitX; // Invert digits for negative numbers.
      }
      divModY = flexibleDivisionModulo(remainingY, maxBinaryMultiplier);
      digitY = divModY[1].toJsNumber();
      if (signY) {
        digitY = maxBinaryMultiplier - 1 - digitY; // Invert digits for negative numbers.
      }
      remainingX = divModX[0];
      remainingY = divModY[0];
      digitResults.push(operationFn(digitX, digitY)); // Apply the bitwise function.
    }

    // Determine the final sign based on the highest bits of the original numbers.
    let finalSum = operationFn(signX ? 1 : 0, signY ? 1 : 0) !== 0 ? largeNum(-1) : largeNum(0);
    // Reconstruct the number from the bitwise results.
    for (let idx = digitResults.length - 1; idx >= 0; idx -= 1) {
      finalSum = finalSum.multiply(maxBinaryMultiplier).add(largeNum(digitResults[idx]));
    }
    return finalSum;
  }


  // Bitwise NOT operation.
  HugeNumeric.prototype.not = function () {
    return this.negate().prev(); // Equivalent to -(x + 1).
  };
  TinyNumeric.prototype.not = HugeNumeric.prototype.not;


  // Bitwise AND operation.
  HugeNumeric.prototype.and = function (operand) {
    return applyBitwiseOp(this, operand, function (bitA, bitB) {
      return bitA & bitB;
    });
  };
  TinyNumeric.prototype.and = HugeNumeric.prototype.and;


  // Bitwise OR operation.
  HugeNumeric.prototype.or = function (operand) {
    return applyBitwiseOp(this, operand, function (bitA, bitB) {
      return bitA | bitB;
    });
  };
  TinyNumeric.prototype.or = HugeNumeric.prototype.or;


  // Bitwise XOR operation.
  HugeNumeric.prototype.xor = function (operand) {
    return applyBitwiseOp(this, operand, function (bitA, bitB) {
      return bitA ^ bitB;
    });
  };
  TinyNumeric.prototype.xor = HugeNumeric.prototype.xor;


  // Constants used for calculating the lowest set bit (similar to `n & -n`).
  const JS_LOB_MASK = 1 << 30; // Mask for native JS numbers.
  const CHUNK_LOB_MASK = (CHUNK_SIZE & -CHUNK_SIZE) * (CHUNK_SIZE & -CHUNK_SIZE) | JS_LOB_MASK; // Mask for chunk numbers.


  // Estimates the lowest set bit for a numeric entity.
  function estimateLowestBit(numVal) {
    let val = numVal.value;
    let bitwiseResult = typeof val === "number" ? val | JS_LOB_MASK : val[0] + val[1] * CHUNK_SIZE | CHUNK_LOB_MASK;
    return bitwiseResult & -bitwiseResult; // Common bit hack to isolate the LSB.
  }


  // Calculates the integer logarithm (log_base_num(valueNum)).
  function calculateIntLog(valueNum, baseNum) {
    if (baseNum.compareTo(valueNum) <= 0) {
      let tempLog = calculateIntLog(valueNum, baseNum.square(baseNum));
      let pVal = tempLog.p;
      let expVal = tempLog.e;
      let testT = pVal.multiply(baseNum);
      return testT.compareTo(valueNum) <= 0 ? {
        p: testT,
        e: expVal * 2 + 1
      } : {
        p: pVal,
        e: expVal * 2
      };
    }
    return {
      p: largeNum(1),
      e: 0
    };
  }


  // Calculates the bit length (number of bits required to represent the number).
  HugeNumeric.prototype.bitLength = function () {
    let currentNum = this;
    // For negative numbers, bit length is usually defined for their two's complement.
    if (currentNum.compareTo(largeNum(0)) < 0) {
      currentNum = currentNum.negate().subtract(largeNum(1));
    }
    if (currentNum.compareTo(largeNum(0)) === 0) {
      return largeNum(0);
    }
    return largeNum(calculateIntLog(currentNum, largeNum(2)).e).add(largeNum(1));
  };
  TinyNumeric.prototype.bitLength = HugeNumeric.prototype.bitLength;


  // Finds the maximum of two numeric entities.
  function findMaximum(numA, numB) {
    numA = coerceToNumericEntity(numA);
    numB = coerceToNumericEntity(numB);
    return numA.isGreater(numB) ? numA : numB;
  }


  // Finds the minimum of two numeric entities.
  function findMinimum(numA, numB) {
    numA = coerceToNumericEntity(numA);
    numB = coerceToNumericEntity(numB);
    return numA.isLesser(numB) ? numA : numB;
  }


  // Calculates the greatest common divisor (GCD) using the binary GCD algorithm.
  function greatestCommonDivisor(numA, numB) {
    numA = coerceToNumericEntity(numA).absolute();
    numB = coerceToNumericEntity(numB).absolute();

    if (numA.equals(numB)) return numA;
    if (numA.isZero()) return numB;
    if (numB.isZero()) return numA;

    let commonFactor = NumericEntity[1],
      tempD, tempT;
    // Remove common factors of 2.
    while (numA.isEven() && numB.isEven()) {
      tempD = Math.min(estimateLowestBit(numA), estimateLowestBit(numB));
      numA = numA.divide(tempD);
      numB = numB.divide(tempD);
      commonFactor = commonFactor.multiply(tempD);
    }
    // Remove factors of 2 from A.
    while (numA.isEven()) {
      numA = numA.divide(estimateLowestBit(numA));
    }
    // Main loop of binary GCD.
    do {
      while (numB.isEven()) {
        numB = numB.divide(estimateLowestBit(numB));
      }
      if (numA.isGreater(numB)) {
        tempT = numB;
        numB = numA;
        numA = tempT;
      }
      numB = numB.subtract(numA);
    } while (!numB.isZero());
    return commonFactor.isUnit() ? numA : numA.multiply(commonFactor);
  }


  // Calculates the least common multiple (LCM).
  function leastCommonMultiple(numA, numB) {
    numA = coerceToNumericEntity(numA).absolute();
    numB = coerceToNumericEntity(numB).absolute();
    // LCM(a, b) = |a * b| / GCD(a, b)
    return numA.divide(greatestCommonDivisor(numA, numB)).multiply(numB);
  }


  // Generates a cryptographically weak pseudo-random number within a specified range.
  function randomBetweenRange(lowBound, highBound) {
    lowBound = coerceToNumericEntity(lowBound);
    highBound = coerceToNumericEntity(highBound);
    let actualLow = findMinimum(lowBound, highBound);
    let actualHigh = findMaximum(lowBound, highBound);
    let rangeSpan = actualHigh.subtract(actualLow).add(1);

    // If the range fits in a small number, use native Math.random.
    if (rangeSpan.isSmall) return actualLow.add(Math.floor(Math.random() * rangeSpan.value));

    let len = rangeSpan.value.length - 1;
    let digitResults = [],
      isRestricted = true;
    // Generate random chunks, respecting the upper bound of the range.
    for (let idx = len; idx >= 0; idx--) {
      let maxDigit = isRestricted ? rangeSpan.value[idx] : CHUNK_SIZE;
      let randomDigit = floorOrCeil(Math.random() * maxDigit);
      digitResults.unshift(randomDigit);
      if (randomDigit < maxDigit) isRestricted = false; // Once a digit is less than maxDigit, subsequent digits are unrestricted.
    }
    digitResults = recomposeSmall(digitResults);
    return actualLow.add(typeof digitResults === "number" ? new TinyNumeric(digitResults) : new HugeNumeric(digitResults, false));
  }


  // Parses a string representation of a number in a given base.
  const parseStringWithBase = function (textValue, baseVal) {
    let textLength = textValue.length;
    let currentIdx;
    let absoluteBase = Math.abs(baseVal);

    // First pass: validate all characters are valid digits for the given base.
    for (currentIdx = 0; currentIdx < textLength; currentIdx++) {
      let char = textValue[currentIdx].toLowerCase();
      if (char === "-") continue; // Skip negative sign.
      if (/[a-z0-9]/.test(char)) {
        if (/[0-9]/.test(char) && +char >= absoluteBase) {
          if (char === "1" && absoluteBase === 1) continue; // Special case for base 1.
          throw new Error(char + " is not a valid digit in base " + baseVal + ".");
        } else if (char.charCodeAt(0) - 87 >= absoluteBase) { // For a-z digits.
          throw new Error(char + " is not a valid digit in base " + baseVal + ".");
        }
      }
    }

    // Optimization: for common bases (2-36) and small numbers, use native `parseInt`.
    if (2 <= baseVal && baseVal <= 36) {
      if (textLength <= LOG_SAFE_NUM / Math.log(baseVal)) {
        let result = parseInt(textValue, baseVal);
        if (isNaN(result)) {
          throw new Error("Invalid character in base " + baseVal + " string.");
        }
        return new TinyNumeric(parseInt(textValue, baseVal));
      }
    }

    baseVal = coerceToNumericEntity(baseVal);
    let digitVector = [];
    let isNegativeFlag = textValue[0] === "-";

    // Second pass: parse digits into NumericEntity instances.
    for (currentIdx = isNegativeFlag ? 1 : 0; currentIdx < textValue.length; currentIdx++) {
      let char = textValue[currentIdx].toLowerCase(),
        charCode = char.charCodeAt(0);
      if (48 <= charCode && charCode <= 57) digitVector.push(coerceToNumericEntity(char)); // '0' to '9'
      else if (97 <= charCode && charCode <= 122) digitVector.push(coerceToNumericEntity(char.charCodeAt(0) - 87)); // 'a' to 'z'
      else if (char === "<") { // Handle custom digits in <value> format.
        let startIndex = currentIdx;
        do {
          currentIdx++;
        } while (textValue[currentIdx] !== ">");
        digitVector.push(coerceToNumericEntity(textValue.slice(startIndex + 1, currentIdx)));
      } else throw new Error(char + " is not a valid character");
    }
    return constructFromDigits(digitVector, baseVal, isNegativeFlag); // Build the number.
  };


  // Constructs a numeric entity from an array of individual digit entities and a base.
  function constructFromDigits(digitsArr, baseNum, isNegative) {
    let accumulatedVal = NumericEntity[0],
      currentPower = NumericEntity[1],
      idx;
    // Polynomial evaluation: sum(digit[i] * base^i)
    for (idx = digitsArr.length - 1; idx >= 0; idx--) {
      accumulatedVal = accumulatedVal.add(digitsArr[idx].times(currentPower));
      currentPower = currentPower.times(baseNum);
    }
    return isNegative ? accumulatedVal.negate() : accumulatedVal;
  }


  // Converts a numeric digit value (0-35) into its string representation.
  // Uses '0'-'9', 'a'-'z', or '<value>' for larger digits.
  function digitToString(digitVal) {
    if (digitVal <= 35) {
      return "0123456789abcdefghijklmnopqrstuvwxyz".charAt(digitVal);
    }
    return "<" + digitVal + ">"; // For digits larger than 35.
  }


  // Converts a numeric entity to its representation in a specified target base (as an array of digits).
  function convertToBaseRepresentation(numericInst, targetBase) {
    targetBase = largeNum(targetBase);
    if (targetBase.isZero()) {
      if (numericInst.isZero()) return {
        value: [0],
        isNegative: false
      };
      throw new Error("Cannot convert nonzero numbers to base 0.");
    }
    if (targetBase.equals(-1)) { // Special handling for base -1.
      if (numericInst.isZero()) return {
        value: [0],
        isNegative: false
      };
      if (numericInst.isNegative()) {
        return {
          value: [].concat.apply([], Array.apply(null, Array(-numericInst)).map(Array.prototype.valueOf, [1, 0])),
          isNegative: false
        };
      }
      let arr = Array.apply(null, Array(+numericInst - 1)).map(Array.prototype.valueOf, [0, 1]);
      arr.unshift([1]);
      return {
        value: [].concat.apply([], arr),
        isNegative: false
      };
    }

    let isNegativeResult = false;
    if (numericInst.isNegative() && targetBase.isPositive()) {
      isNegativeResult = true;
      numericInst = numericInst.absolute(); // Work with absolute value for conversion.
    }
    if (targetBase.equals(1)) { // Special handling for base 1 (unary).
      if (numericInst.isZero()) return {
        value: [0],
        isNegative: false
      };
      return {
        value: Array.apply(null, Array(+numericInst)).map(Number.prototype.valueOf, 1),
        isNegative: isNegativeResult
      };
    }

    let outputDigits = [];
    let remainingValue = numericInst,
      divModResult;
    // Repeatedly divide by the base and collect remainders.
    while (remainingValue.isNegative() || remainingValue.compareAbsolute(targetBase) >= 0) {
      divModResult = remainingValue.divmod(targetBase);
      remainingValue = divModResult.quotient;
      let currentDigit = divModResult.remainder;
      if (currentDigit.isNegative()) { // Adjust for negative remainders.
        currentDigit = targetBase.minus(currentDigit).absolute();
        remainingValue = remainingValue.next();
      }
      outputDigits.push(currentDigit.toJsNumber());
    }
    outputDigits.push(remainingValue.toJsNumber());
    return {
      value: outputDigits.reverse(),
      isNegative: isNegativeResult
    };
  }


  // Formats a numeric entity into its string representation in a given base.
  function formatToBaseString(numericInst, targetBase) {
    let baseRepresentation = convertToBaseRepresentation(numericInst, targetBase);
    return (baseRepresentation.isNegative ? "-" : "") + baseRepresentation.value.map(digitToString).join("");
  }


  // HugeNumeric method to convert to an array of digits in a given radix.
  HugeNumeric.prototype.toDigitArray = function (radix) {
    return convertToBaseRepresentation(this, radix);
  };
  TinyNumeric.prototype.toDigitArray = function (radix) {
    return convertToBaseRepresentation(this, radix);
  };


  // HugeNumeric method to convert to a string representation.
  HugeNumeric.prototype.toString = function (radix) {
    if (radix === undefined) radix = 10;
    if (radix !== 10) return formatToBaseString(this, radix); // For non-base 10.

    let val = this.value,
      len = val.length,
      str = String(val[--len]),
      paddingZeros = "0000000", // Used to pad chunks with leading zeros.
      digitChunk;
    while (--len >= 0) {
      digitChunk = String(val[len]);
      str += paddingZeros.slice(digitChunk.length) + digitChunk;
    }
    let signPrefix = this.sign ? "-" : "";
    return signPrefix + str;
  };
  // TinyNumeric method to convert to a string representation.
  TinyNumeric.prototype.toString = function (radix) {
    if (radix === undefined) radix = 10;
    if (radix != 10) return formatToBaseString(this, radix); // For non-base 10.
    return String(this.value); // Native conversion for small numbers.
  };


  // JSON serialization method.
  HugeNumeric.prototype.toJSON = TinyNumeric.prototype.toJSON = function () {
    return this.toString();
  };


  // Returns the primitive value of the HugeNumeric object (may lose precision).
  HugeNumeric.prototype.valueOf = function () {
    return parseInt(this.toString(), 10);
  };
  HugeNumeric.prototype.toJsNumber = HugeNumeric.prototype.valueOf;


  // Returns the primitive value of the TinyNumeric object.
  TinyNumeric.prototype.valueOf = function () {
    return this.value;
  };
  TinyNumeric.prototype.toJsNumber = TinyNumeric.prototype.valueOf;


  // Parses a string value into a NumericEntity instance.
  function parseTextValue(valStr) {
    // Attempt to parse as a small number first.
    if (isWithinJsLimit(+valStr)) {
      let num = +valStr;
      if (num === floorOrCeil(num)) return new TinyNumeric(num);
      throw new Error("Invalid integer: " + valStr); // Not an integer.
    }

    let isNegative = valStr[0] === "-";
    if (isNegative) valStr = valStr.slice(1);

    // Handle scientific notation (e.g., "1.23e5").
    let splitByE = valStr.split(/e/i);
    if (splitByE.length > 2) throw new Error("Invalid integer: " + splitByE.join("e"));
    if (splitByE.length === 2) {
      let exponentPart = splitByE[1];
      if (exponentPart[0] === "+") exponentPart = exponentPart.slice(1);
      exponentPart = +exponentPart;
      if (exponentPart !== floorOrCeil(exponentPart) || !isWithinJsLimit(exponentPart)) throw new Error("Invalid integer: " + exponentPart + " is not a valid exponent.");

      let baseText = splitByE[0];
      let decimalPointIdx = baseText.indexOf(".");
      if (decimalPointIdx >= 0) {
        exponentPart -= baseText.length - decimalPointIdx - 1;
        baseText = baseText.slice(0, decimalPointIdx) + baseText.slice(decimalPointIdx + 1);
      }
      if (exponentPart < 0) throw new Error("Cannot include negative exponent part for integers");
      baseText += new Array(exponentPart + 1).join("0"); // Pad with zeros for exponent.
      valStr = baseText;
    }

    // Validate the string contains only digits.
    let isValidFormat = /^([0-9][0-9]*)$/.test(valStr);
    if (!isValidFormat) throw new Error("Invalid integer: " + valStr);

    let resultChunks = [],
      maxLen = valStr.length,
      chunkSize = CHUNK_DIGITS,
      minLen = maxLen - chunkSize;

    // Split the string into chunks from right to left.
    while (maxLen > 0) {
      resultChunks.push(+valStr.slice(minLen, maxLen));
      minLen -= chunkSize;
      if (minLen < 0) minLen = 0;
      maxLen -= chunkSize;
    }
    normalizeVector(resultChunks); // Clean up leading zeros.
    return new HugeNumeric(resultChunks, isNegative);
  }


  // Parses a raw JavaScript number into a NumericEntity instance.
  function parseNumericValue(num) {
    if (isWithinJsLimit(num)) {
      if (num !== floorOrCeil(num)) throw new Error(num + " is not an integer.");
      return new TinyNumeric(num);
    }
    return parseTextValue(num.toString()); // If too large, convert to string and parse.
  }


  // Universal coercion function to convert various input types into NumericEntity instances.
  function coerceToNumericEntity(inputVal) {
    if (typeof inputVal === "number") {
      return parseNumericValue(inputVal);
    }
    if (typeof inputVal === "string") {
      return parseTextValue(inputVal);
    }
    return inputVal; // Assume it's already a NumericEntity object.
  }


  // Pre-populate instances for small integers (0-999 and their negatives) for performance.
  for (let idx = 0; idx < 1e3; idx++) {
    NumericEntity[idx] = new TinyNumeric(idx);
    if (idx > 0) NumericEntity[-idx] = new TinyNumeric(-idx);
  }

  // Assign static properties and methods to the NumericEntity constructor.
  NumericEntity.unit = NumericEntity[1];
  NumericEntity.nullValue = NumericEntity[0];
  NumericEntity.negativeUnit = NumericEntity[-1];
  NumericEntity.maximum = findMaximum;
  NumericEntity.minimum = findMinimum;
  NumericEntity.greatestCommonDivisor = greatestCommonDivisor;
  NumericEntity.leastCommonMultiple = leastCommonMultiple;
  NumericEntity.isNumericInstance = function (obj) {
    return obj instanceof HugeNumeric || obj instanceof TinyNumeric;
  };
  NumericEntity.generateRandomBetween = randomBetweenRange;
  NumericEntity.fromDigitArray = function (digits, base, isNegative) {
    return constructFromDigits(digits.map(coerceToNumericEntity), coerceToNumericEntity(base || 10), isNegative);
  };

  return NumericEntity;
}(); // End of the IIFE defining the numeric library.


// --- Main Application Logic for the given problem ---

// Use Node.js file system to read input from stdin.
const dataSource = require("fs").readFileSync("/dev/stdin", "utf8");
// Split the input into an array of lines and clean up whitespace.
const lineFragments = dataSource.trim().split('\n');

// Parse the first line to get the quantity of numbers.
const quantity = Number(lineFragments[0].trim());
// Parse the second line, split by space, and convert each element to a largeNum.
const numericSequence = lineFragments[1].trim().split(' ').map((element) => {
  return largeNum(Number(element));
});

// Initialize a variable to store the cumulative XOR sum.
let totalResult = largeNum(0);
// Iterate through all unique pairs of numbers in the sequence.
for (let outerIdx = 0; outerIdx < quantity - 1; outerIdx++) {
  for (let innerIdx = outerIdx + 1; innerIdx < quantity; innerIdx++) {
    // Calculate the XOR of the pair and add it to the total result.
    totalResult = totalResult.add(numericSequence[outerIdx].xor(numericSequence[innerIdx]));
  }
}

// Compute the final sum modulo 1000000007 and print it to the console.
console.log(totalResult.mod(1000000007).toString());