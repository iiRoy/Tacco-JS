/*
 * This file contains an implementation for arbitrary-precision integer arithmetic,
 * along with utility functions for reading structured input data.
 * It's a re-engineered version of a numeric library.
 */
var vastInteger = (function(voidVal) {
  "use strict"; // Enforce strict parsing and error handling

  // Core configuration for numeric operations
  var CHUNK_UNIT = 10000000, // Base for internal digit storage (10^7)
    CHUNK_DIGITS = 7, // Number of decimal digits per chunk
    MAX_SAFE_JS_VAL = 9007199254740992, // Maximum safe integer in JavaScript (2^53)
    MAX_SAFE_JS_VAL_ARR = compactToNumericArray(MAX_SAFE_JS_VAL), // Array representation of MAX_SAFE_JS_VAL
    LOG_MAX_SAFE_JS_VAL = Math.log(MAX_SAFE_JS_VAL); // Logarithm of MAX_SAFE_JS_VAL

  // Base constructor for all numeric entities
  function NumericEntity(val, baseRadix) {
    if (typeof val === "undefined") return NumericEntity[0];
    if (typeof baseRadix !== "undefined")
      return +baseRadix === 10 ? parseInputVal(val) : parseByBase(val, baseRadix);
    return parseInputVal(val);
  }

  // Constructor for large number objects
  function ExtendedNumeric(magnitude, isNegativeFlag) {
    this.numeralValue = magnitude;
    this.polarity = isNegativeFlag;
    this.isCompact = false;
  }
  ExtendedNumeric.prototype = Object.create(NumericEntity.prototype);

  // Constructor for small number objects (fitting in standard JS numbers)
  function PrimitiveNumeric(magnitude) {
    this.numeralValue = magnitude;
    this.polarity = magnitude < 0;
    this.isCompact = true;
  }
  PrimitiveNumeric.prototype = Object.create(NumericEntity.prototype);

  // Checks if a number fits within JavaScript's safe integer range
  function isValuePrecise(num) {
    return -MAX_SAFE_JS_VAL < num && num < MAX_SAFE_JS_VAL;
  }

  // Converts a small JavaScript number into an array of "chunks"
  function compactToNumericArray(num) {
    if (num < 1e7) return [num];
    if (num < 1e14) return [num % 1e7, Math.floor(num / 1e7)];
    return [num % 1e7, Math.floor(num / 1e7) % 1e7, Math.floor(num / 1e14)];
  }

  // Converts an array of "chunks" back to a small JavaScript number if possible
  function numericArrayToCompact(arr) {
    removeLeadingZeros(arr);
    var arrLength = arr.length;
    if (arrLength < 4 && compareMagnitudes(arr, MAX_SAFE_JS_VAL_ARR) < 0) {
      switch (arrLength) {
        case 0:
          return 0;
        case 1:
          return arr[0];
        case 2:
          return arr[0] + arr[1] * CHUNK_UNIT;
        default:
          return arr[0] + (arr[1] + arr[2] * CHUNK_UNIT) * CHUNK_UNIT;
      }
    }
    return arr;
  }

  // Removes leading zero chunks from a numeric array
  function removeLeadingZeros(valArray) {
    var i = valArray.length;
    while (valArray[--i] === 0);
    valArray.length = i + 1;
  }

  // Creates a zero-filled array of a given length
  function makeZeroArray(len) {
    var newArr = new Array(len);
    var index = -1;
    while (++index < len) {
      newArr[index] = 0;
    }
    return newArr;
  }

  // Truncates a number (removes decimal part)
  function discardFraction(num) {
    if (num > 0) return Math.floor(num);
    return Math.ceil(num);
  }

  // Adds two numeric arrays (representing positive numbers)
  function sumArrays(arrA, arrB) {
    var lenA = arrA.length,
      lenB = arrB.length,
      res = new Array(lenA),
      carryOver = 0,
      chunkBase = CHUNK_UNIT,
      currentSum,
      idx;
    for (idx = 0; idx < lenB; idx++) {
      currentSum = arrA[idx] + arrB[idx] + carryOver;
      carryOver = currentSum >= chunkBase ? 1 : 0;
      res[idx] = currentSum - carryOver * chunkBase;
    }
    while (idx < lenA) {
      currentSum = arrA[idx] + carryOver;
      carryOver = currentSum === chunkBase ? 1 : 0;
      res[idx++] = currentSum - carryOver * chunkBase;
    }
    if (carryOver > 0) res.push(carryOver);
    return res;
  }

  // Adds two numeric arrays, handling different lengths
  function sumAnyArrays(arrA, arrB) {
    if (arrA.length >= arrB.length) return sumArrays(arrA, arrB);
    return sumArrays(arrB, arrA);
  }

  // Adds a small integer to a numeric array (used for incrementing)
  function sumCompactWithArray(arrA, carryVal) {
    var len = arrA.length,
      res = new Array(len),
      chunkBase = CHUNK_UNIT,
      currentSum,
      idx;
    for (idx = 0; idx < len; idx++) {
      currentSum = arrA[idx] - chunkBase + carryVal;
      carryVal = Math.floor(currentSum / chunkBase);
      res[idx] = currentSum - carryVal * chunkBase;
      carryVal += 1;
    }
    while (carryVal > 0) {
      res[idx++] = carryVal % chunkBase;
      carryVal = Math.floor(carryVal / chunkBase);
    }
    return res;
  }

  // ExtendedNumeric's addition method
  ExtendedNumeric.prototype.add = function(otherVal) {
    var otherNum = parseInputVal(otherVal);
    if (this.polarity !== otherNum.polarity) {
      return this.sub(otherNum.invertPolarity());
    }
    var currentMagnitude = this.numeralValue,
      otherMagnitude = otherNum.numeralValue;
    if (otherNum.isCompact) {
      return new ExtendedNumeric(sumCompactWithArray(currentMagnitude, Math.abs(otherMagnitude)), this.polarity);
    }
    return new ExtendedNumeric(sumAnyArrays(currentMagnitude, otherMagnitude), this.polarity);
  };
  ExtendedNumeric.prototype.plus = ExtendedNumeric.prototype.add;

  // PrimitiveNumeric's addition method
  PrimitiveNumeric.prototype.add = function(otherVal) {
    var otherNum = parseInputVal(otherVal);
    var currentVal = this.numeralValue;
    if (currentVal < 0 !== otherNum.polarity) {
      return this.sub(otherNum.invertPolarity());
    }
    var otherValRaw = otherNum.numeralValue;
    if (otherNum.isCompact) {
      if (isValuePrecise(currentVal + otherValRaw)) return new PrimitiveNumeric(currentVal + otherValRaw);
      otherValRaw = compactToNumericArray(Math.abs(otherValRaw));
    }
    return new ExtendedNumeric(sumCompactWithArray(otherValRaw, Math.abs(currentVal)), currentVal < 0);
  };
  PrimitiveNumeric.prototype.plus = PrimitiveNumeric.prototype.add;

  // Subtracts two numeric arrays (arrA - arrB, assuming arrA >= arrB)
  function diffArrays(arrA, arrB) {
    var lenA = arrA.length,
      lenB = arrB.length,
      res = new Array(lenA),
      borrowAmt = 0,
      chunkBase = CHUNK_UNIT,
      differenceVal;
    for (var idx = 0; idx < lenB; idx++) {
      differenceVal = arrA[idx] - borrowAmt - arrB[idx];
      if (differenceVal < 0) {
        differenceVal += chunkBase;
        borrowAmt = 1;
      } else borrowAmt = 0;
      res[idx] = differenceVal;
    }
    for (var idx = lenB; idx < lenA; idx++) {
      differenceVal = arrA[idx] - borrowAmt;
      if (differenceVal < 0) differenceVal += chunkBase;
      else {
        res[idx++] = differenceVal;
        break;
      }
      res[idx] = differenceVal;
    }
    for (; idx < lenA; idx++) {
      res[idx] = arrA[idx];
    }
    removeLeadingZeros(res);
    return res;
  }

  // Subtracts two numeric arrays, handling signs and order
  function diffAnyArrays(arrA, arrB, resPolarity) {
    var resultMagnitude;
    if (compareMagnitudes(arrA, arrB) >= 0) {
      resultMagnitude = diffArrays(arrA, arrB);
    } else {
      resultMagnitude = diffArrays(arrB, arrA);
      resPolarity = !resPolarity;
    }
    resultMagnitude = numericArrayToCompact(resultMagnitude);
    if (typeof resultMagnitude === "number") {
      if (resPolarity) resultMagnitude = -resultMagnitude;
      return new PrimitiveNumeric(resultMagnitude);
    }
    return new ExtendedNumeric(resultMagnitude, resPolarity);
  }

  // Subtracts a small integer from a numeric array
  function diffCompactFromArray(arrA, smallVal, resPolarity) {
    var len = arrA.length,
      res = new Array(len),
      carryVal = -smallVal,
      chunkBase = CHUNK_UNIT,
      differenceVal,
      idx;
    for (idx = 0; idx < len; idx++) {
      differenceVal = arrA[idx] + carryVal;
      carryVal = Math.floor(differenceVal / chunkBase);
      differenceVal %= chunkBase;
      res[idx] = differenceVal < 0 ? differenceVal + chunkBase : differenceVal;
    }
    res = numericArrayToCompact(res);
    if (typeof res === "number") {
      if (resPolarity) res = -res;
      return new PrimitiveNumeric(res);
    }
    return new ExtendedNumeric(res, resPolarity);
  }

  // ExtendedNumeric's subtraction method
  ExtendedNumeric.prototype.sub = function(otherVal) {
    var otherNum = parseInputVal(otherVal);
    if (this.polarity !== otherNum.polarity) {
      return this.add(otherNum.invertPolarity());
    }
    var currentMagnitude = this.numeralValue,
      otherMagnitude = otherNum.numeralValue;
    if (otherNum.isCompact)
      return diffCompactFromArray(currentMagnitude, Math.abs(otherMagnitude), this.polarity);
    return diffAnyArrays(currentMagnitude, otherMagnitude, this.polarity);
  };
  ExtendedNumeric.prototype.minus = ExtendedNumeric.prototype.sub;

  // PrimitiveNumeric's subtraction method
  PrimitiveNumeric.prototype.sub = function(otherVal) {
    var otherNum = parseInputVal(otherVal);
    var currentVal = this.numeralValue;
    if (currentVal < 0 !== otherNum.polarity) {
      return this.add(otherNum.invertPolarity());
    }
    var otherValRaw = otherNum.numeralValue;
    if (otherNum.isCompact) {
      return new PrimitiveNumeric(currentVal - otherValRaw);
    }
    return diffCompactFromArray(otherValRaw, Math.abs(currentVal), currentVal >= 0);
  };
  PrimitiveNumeric.prototype.minus = PrimitiveNumeric.prototype.sub;

  // Negates the number (changes its sign)
  ExtendedNumeric.prototype.invertPolarity = function() {
    return new ExtendedNumeric(this.numeralValue, !this.polarity);
  };
  PrimitiveNumeric.prototype.invertPolarity = function() {
    var currentPolarity = this.polarity;
    var compactResult = new PrimitiveNumeric(-this.numeralValue);
    compactResult.polarity = !currentPolarity;
    return compactResult;
  };

  // Returns the absolute value of the number
  ExtendedNumeric.prototype.absolute = function() {
    return new ExtendedNumeric(this.numeralValue, false);
  };
  PrimitiveNumeric.prototype.absolute = function() {
    return new PrimitiveNumeric(Math.abs(this.numeralValue));
  };

  // Multiplies two numeric arrays using standard long multiplication
  function multiplyLongForm(arrA, arrB) {
    var lenA = arrA.length,
      lenB = arrB.length,
      resultArr = makeZeroArray(lenA + lenB),
      chunkBase = CHUNK_UNIT,
      productVal,
      carryVal,
      idx,
      valA_i,
      valB_j;
    for (idx = 0; idx < lenA; ++idx) {
      valA_i = arrA[idx];
      for (var j = 0; j < lenB; ++j) {
        valB_j = arrB[j];
        productVal = valA_i * valB_j + resultArr[idx + j];
        carryVal = Math.floor(productVal / chunkBase);
        resultArr[idx + j] = productVal - carryVal * chunkBase;
        resultArr[idx + j + 1] += carryVal;
      }
    }
    removeLeadingZeros(resultArr);
    return resultArr;
  }

  // Multiplies a numeric array by a small integer
  function multiplyByCompact(arrA, smallNum) {
    var len = arrA.length,
      res = new Array(len),
      chunkBase = CHUNK_UNIT,
      carryVal = 0,
      productVal,
      idx;
    for (idx = 0; idx < len; idx++) {
      productVal = arrA[idx] * smallNum + carryVal;
      carryVal = Math.floor(productVal / chunkBase);
      res[idx] = productVal - carryVal * chunkBase;
    }
    while (carryVal > 0) {
      res[idx++] = carryVal % chunkBase;
      carryVal = Math.floor(carryVal / chunkBase);
    }
    return res;
  }

  // Shifts a numeric array left by adding zeros
  function shiftArrayLeft(arr, count) {
    var newArr = [];
    while (count-- > 0) newArr.push(0);
    return newArr.concat(arr);
  }

  // Multiplies two numeric arrays using Karatsuba algorithm for efficiency
  function multiplyKaratsubaMethod(arrX, arrY) {
    var len = Math.max(arrX.length, arrY.length);
    if (len <= 30) return multiplyLongForm(arrX, arrY); // Base case for smaller arrays

    len = Math.ceil(len / 2); // Split point
    var b_part = arrX.slice(len),
      a_part = arrX.slice(0, len),
      d_part = arrY.slice(len),
      c_part = arrY.slice(0, len);

    // Recursive calls
    var ac_prod = multiplyKaratsubaMethod(a_part, c_part),
      bd_prod = multiplyKaratsubaMethod(b_part, d_part),
      abcd_prod = multiplyKaratsubaMethod(sumAnyArrays(a_part, b_part), sumAnyArrays(c_part, d_part));

    // Combine results
    var finalProd = sumAnyArrays(
      sumAnyArrays(ac_prod, shiftArrayLeft(diffArrays(diffArrays(abcd_prod, ac_prod), bd_prod), len)),
      shiftArrayLeft(bd_prod, 2 * len)
    );
    removeLeadingZeros(finalProd);
    return finalProd;
  }

  // Heuristic to decide if Karatsuba multiplication is beneficial
  function shouldUseKaratsuba(len1, len2) {
    return -0.012 * len1 - 0.012 * len2 + 0.000015 * len1 * len2 > 0;
  }

  // ExtendedNumeric's multiplication method
  ExtendedNumeric.prototype.mul = function(otherVal) {
    var otherNum = parseInputVal(otherVal),
      currentMagnitude = this.numeralValue,
      otherMagnitude = otherNum.numeralValue,
      resultPolarity = this.polarity !== otherNum.polarity,
      absOtherVal;

    if (otherNum.isCompact) {
      if (otherMagnitude === 0) return NumericEntity[0];
      if (otherMagnitude === 1) return this;
      if (otherMagnitude === -1) return this.invertPolarity();
      absOtherVal = Math.abs(otherMagnitude);
      if (absOtherVal < CHUNK_UNIT) {
        return new ExtendedNumeric(multiplyByCompact(currentMagnitude, absOtherVal), resultPolarity);
      }
      otherMagnitude = compactToNumericArray(absOtherVal);
    }
    if (shouldUseKaratsuba(currentMagnitude.length, otherMagnitude.length))
      return new ExtendedNumeric(multiplyKaratsubaMethod(currentMagnitude, otherMagnitude), resultPolarity);
    return new ExtendedNumeric(multiplyLongForm(currentMagnitude, otherMagnitude), resultPolarity);
  };
  ExtendedNumeric.prototype.times = ExtendedNumeric.prototype.mul;

  // Helper for multiplying small numbers with arrays
  function mulCompactAndArray(smallVal, arrVal, resPolarity) {
    if (smallVal < CHUNK_UNIT) {
      return new ExtendedNumeric(multiplyByCompact(arrVal, smallVal), resPolarity);
    }
    return new ExtendedNumeric(multiplyLongForm(arrVal, compactToNumericArray(smallVal)), resPolarity);
  }

  // Internal multiplication by a small number for specific types
  PrimitiveNumeric.prototype._mulByCompact = function(otherCompact) {
    if (isValuePrecise(otherCompact.numeralValue * this.numeralValue)) {
      return new PrimitiveNumeric(otherCompact.numeralValue * this.numeralValue);
    }
    return mulCompactAndArray(
      Math.abs(otherCompact.numeralValue),
      compactToNumericArray(Math.abs(this.numeralValue)),
      this.polarity !== otherCompact.polarity
    );
  };
  ExtendedNumeric.prototype._mulByCompact = function(otherCompact) {
    if (otherCompact.numeralValue === 0) return NumericEntity[0];
    if (otherCompact.numeralValue === 1) return this;
    if (otherCompact.numeralValue === -1) return this.invertPolarity();
    return mulCompactAndArray(Math.abs(otherCompact.numeralValue), this.numeralValue, this.polarity !== otherCompact.polarity);
  };

  // PrimitiveNumeric's multiplication method (delegates to internal helper)
  PrimitiveNumeric.prototype.mul = function(otherVal) {
    return parseInputVal(otherVal)._mulByCompact(this);
  };
  PrimitiveNumeric.prototype.times = PrimitiveNumeric.prototype.mul;

  // Squares a numeric array (multiplies it by itself)
  function squareArray(arr) {
    var len = arr.length,
      res = makeZeroArray(len + len),
      chunkBase = CHUNK_UNIT,
      productVal,
      carryVal,
      idx,
      val_i,
      val_j;
    for (idx = 0; idx < len; idx++) {
      val_i = arr[idx];
      carryVal = 0 - val_i * val_i; // Initialize carry with negative self-product for first inner loop iteration
      for (var j = idx; j < len; j++) {
        val_j = arr[j];
        productVal = 2 * (val_i * val_j) + res[idx + j] + carryVal;
        carryVal = Math.floor(productVal / chunkBase);
        res[idx + j] = productVal - carryVal * chunkBase;
      }
      res[idx + len] = carryVal;
    }
    removeLeadingZeros(res);
    return res;
  }

  // ExtendedNumeric's square method
  ExtendedNumeric.prototype.square = function() {
    return new ExtendedNumeric(squareArray(this.numeralValue), false);
  };
  // PrimitiveNumeric's square method
  PrimitiveNumeric.prototype.square = function() {
    var squaredVal = this.numeralValue * this.numeralValue;
    if (isValuePrecise(squaredVal)) return new PrimitiveNumeric(squaredVal);
    return new ExtendedNumeric(squareArray(compactToNumericArray(Math.abs(this.numeralValue))), false);
  };

  // Division and Modulo operations

  // Knuth's Algorithm D (for multi-digit divisor)
  function divideAndModulo_D(dividendArr, divisorArr) {
    var dividendLen = dividendArr.length,
      divisorLen = divisorArr.length,
      resultQuotient = makeZeroArray(dividendLen - divisorLen + 1), // Corrected array size
      chunkBase = CHUNK_UNIT,
      divisorMSD = divisorArr[divisorLen - 1], // Most significant digit
      normalizationFactor = Math.ceil(chunkBase / (2 * divisorMSD)), // Normalization factor
      remainderArr = multiplyByCompact(dividendArr, normalizationFactor), // Normalized dividend
      normalizedDivisor = multiplyByCompact(divisorArr, normalizationFactor), // Normalized divisor
      quotientDigitEstimate,
      shiftAmount,
      currentCarry,
      currentBorrow,
      idx,
      tempLen,
      tempQuotient;

    // Ensure remainder is long enough for initial comparison
    if (remainderArr.length <= dividendLen) remainderArr.push(0);
    normalizedDivisor.push(0); // Pad divisor for easier comparison

    divisorMSD = normalizedDivisor[divisorLen - 1]; // Update MSD after normalization

    for (shiftAmount = dividendLen - divisorLen; shiftAmount >= 0; shiftAmount--) {
      // Estimate quotient digit
      quotientDigitEstimate = chunkBase - 1;
      if (remainderArr[shiftAmount + divisorLen] !== divisorMSD) {
        quotientDigitEstimate = Math.floor(
          (remainderArr[shiftAmount + divisorLen] * chunkBase +
            remainderArr[shiftAmount + divisorLen - 1]) /
          divisorMSD
        );
      }

      currentCarry = 0;
      currentBorrow = 0;
      tempLen = normalizedDivisor.length;
      // Subtract (quotientDigitEstimate * normalizedDivisor) from remainderArr segment
      for (idx = 0; idx < tempLen; idx++) {
        currentCarry += quotientDigitEstimate * normalizedDivisor[idx];
        tempQuotient = Math.floor(currentCarry / chunkBase);
        currentBorrow += remainderArr[shiftAmount + idx] - (currentCarry - tempQuotient * chunkBase);
        currentCarry = tempQuotient;
        if (currentBorrow < 0) {
          remainderArr[shiftAmount + idx] = currentBorrow + chunkBase;
          currentBorrow = -1;
        } else {
          remainderArr[shiftAmount + idx] = currentBorrow;
          currentBorrow = 0;
        }
      }

      // Adjust quotient digit if it was too high (remainder became negative)
      while (currentBorrow !== 0) {
        quotientDigitEstimate -= 1;
        currentCarry = 0;
        for (idx = 0; idx < tempLen; idx++) {
          currentCarry += remainderArr[shiftAmount + idx] - chunkBase + normalizedDivisor[idx];
          if (currentCarry < 0) {
            remainderArr[shiftAmount + idx] = currentCarry + chunkBase;
            currentCarry = 0;
          } else {
            remainderArr[shiftAmount + idx] = currentCarry;
            currentCarry = 1;
          }
        }
        currentBorrow += currentCarry;
      }
      resultQuotient[shiftAmount] = quotientDigitEstimate;
    }
    // Denormalize remainder
    remainderArr = divideAndModuloCompact(remainderArr, normalizationFactor)[0];
    return [numericArrayToCompact(resultQuotient), numericArrayToCompact(remainderArr)];
  }

  // Simple long division (for multi-digit divisor, less optimized)
  function divideAndModulo_Simple(dividendArr, divisorArr) {
    var dividendLen = dividendArr.length,
      divisorLen = divisorArr.length,
      quotientParts = [],
      currentPartialDividend = [],
      chunkBase = CHUNK_UNIT,
      estimatedQuotient,
      tempXLen,
      highX,
      highY,
      tempCheck;

    while (dividendLen) {
      currentPartialDividend.unshift(dividendArr[--dividendLen]);
      removeLeadingZeros(currentPartialDividend);
      if (compareMagnitudes(currentPartialDividend, divisorArr) < 0) {
        quotientParts.push(0);
        continue;
      }

      tempXLen = currentPartialDividend.length;
      highX = currentPartialDividend[tempXLen - 1] * chunkBase + currentPartialDividend[tempXLen - 2];
      highY = divisorArr[divisorLen - 1] * chunkBase + divisorArr[divisorLen - 2];

      if (tempXLen > divisorLen) {
        highX = (highX + 1) * chunkBase;
      }
      estimatedQuotient = Math.ceil(highX / highY);

      do {
        tempCheck = multiplyByCompact(divisorArr, estimatedQuotient);
        if (compareMagnitudes(tempCheck, currentPartialDividend) <= 0) break;
        estimatedQuotient--;
      } while (estimatedQuotient);

      quotientParts.push(estimatedQuotient);
      currentPartialDividend = diffArrays(currentPartialDividend, tempCheck);
    }
    quotientParts.reverse();
    return [numericArrayToCompact(quotientParts), numericArrayToCompact(currentPartialDividend)];
  }

  // Divides a numeric array by a small integer
  function divideAndModuloCompact(numArray, smallDivisor) {
    var len = numArray.length,
      resQuotient = makeZeroArray(len),
      chunkBase = CHUNK_UNIT,
      idx,
      currentQuotient,
      currentRemainder,
      currentDividend;

    currentRemainder = 0;
    for (idx = len - 1; idx >= 0; --idx) {
      currentDividend = currentRemainder * chunkBase + numArray[idx];
      currentQuotient = discardFraction(currentDividend / smallDivisor);
      currentRemainder = currentDividend - currentQuotient * smallDivisor;
      resQuotient[idx] = currentQuotient | 0; // Ensure integer
    }
    return [resQuotient, currentRemainder | 0]; // Ensure integer
  }

  // Generic division and modulo function
  function performDivMod(selfNum, otherVal) {
    var resultPair,
      otherNum = parseInputVal(otherVal);
    var currentMagnitude = selfNum.numeralValue,
      otherMagnitude = otherNum.numeralValue;
    var finalQuotient;

    if (otherMagnitude === 0) throw new Error("Division by zero is not allowed.");

    if (selfNum.isCompact) {
      if (otherNum.isCompact) {
        return [new PrimitiveNumeric(discardFraction(currentMagnitude / otherMagnitude)), new PrimitiveNumeric(currentMagnitude % otherMagnitude)];
      }
      return [NumericEntity[0], selfNum]; // Small number divided by large number results in 0 quotient
    }

    if (otherNum.isCompact) {
      if (otherMagnitude === 1) return [selfNum, NumericEntity[0]];
      if (otherMagnitude === -1) return [selfNum.invertPolarity(), NumericEntity[0]];
      var absDivisor = Math.abs(otherMagnitude);
      if (absDivisor < CHUNK_UNIT) {
        resultPair = divideAndModuloCompact(currentMagnitude, absDivisor);
        finalQuotient = numericArrayToCompact(resultPair[0]);
        var remainderVal = resultPair[1];
        if (selfNum.polarity) remainderVal = -remainderVal;

        if (typeof finalQuotient === "number") {
          if (selfNum.polarity !== otherNum.polarity) finalQuotient = -finalQuotient;
          return [new PrimitiveNumeric(finalQuotient), new PrimitiveNumeric(remainderVal)];
        }
        return [new ExtendedNumeric(finalQuotient, selfNum.polarity !== otherNum.polarity), new PrimitiveNumeric(remainderVal)];
      }
      otherMagnitude = compactToNumericArray(absDivisor); // Convert small divisor to array for array division
    }

    var magnitudeComparison = compareMagnitudes(currentMagnitude, otherMagnitude);
    if (magnitudeComparison === -1) return [NumericEntity[0], selfNum]; // Dividend < Divisor
    if (magnitudeComparison === 0) return [NumericEntity[selfNum.polarity === otherNum.polarity ? 1 : -1], NumericEntity[0]]; // Dividend == Divisor

    // Choose division algorithm based on size
    if (currentMagnitude.length + otherMagnitude.length <= 200) resultPair = divideAndModulo_D(currentMagnitude, otherMagnitude);
    else resultPair = divideAndModulo_Simple(currentMagnitude, otherMagnitude);

    finalQuotient = resultPair[0];
    var quotientPolarity = selfNum.polarity !== otherNum.polarity,
      remainderVal = resultPair[1],
      remainderPolarity = selfNum.polarity;

    if (typeof finalQuotient === "number") {
      if (quotientPolarity) finalQuotient = -finalQuotient;
      finalQuotient = new PrimitiveNumeric(finalQuotient);
    } else finalQuotient = new ExtendedNumeric(finalQuotient, quotientPolarity);

    if (typeof remainderVal === "number") {
      if (remainderPolarity) remainderVal = -remainderVal;
      remainderVal = new PrimitiveNumeric(remainderVal);
    } else remainderVal = new ExtendedNumeric(remainderVal, remainderPolarity);

    return [finalQuotient, remainderVal];
  }

  // ExtendedNumeric's divmod method
  ExtendedNumeric.prototype.divmod = function(otherVal) {
    var result = performDivMod(this, otherVal);
    return {
      quotient: result[0],
      remainder: result[1]
    };
  };
  PrimitiveNumeric.prototype.divmod = ExtendedNumeric.prototype.divmod;

  // ExtendedNumeric's division method
  ExtendedNumeric.prototype.div = function(otherVal) {
    return performDivMod(this, otherVal)[0];
  };
  PrimitiveNumeric.prototype.over = PrimitiveNumeric.prototype.div = ExtendedNumeric.prototype.over = ExtendedNumeric.prototype.div;

  // ExtendedNumeric's modulo method
  ExtendedNumeric.prototype.modulo = function(otherVal) {
    return performDivMod(this, otherVal)[1];
  };
  PrimitiveNumeric.prototype.rem = PrimitiveNumeric.prototype.modulo = ExtendedNumeric.prototype.rem = ExtendedNumeric.prototype.modulo;

  // Exponentiation (power) method
  ExtendedNumeric.prototype.power = function(exponentVal) {
    var exponentNum = parseInputVal(exponentVal),
      currentMagnitude = this.numeralValue,
      exponentMagnitude = exponentNum.numeralValue,
      resultVal,
      baseNum,
      tempResult;

    if (exponentMagnitude === 0) return NumericEntity[1];
    if (currentMagnitude === 0) return NumericEntity[0];
    if (currentMagnitude === 1) return NumericEntity[1];
    if (currentMagnitude === -1) return exponentNum.isEven() ? NumericEntity[1] : NumericEntity[-1];
    if (exponentNum.polarity) {
      return NumericEntity[0]; // Negative exponent not supported for integers
    }
    if (!exponentNum.isCompact)
      throw new Error("Exponent " + exponentNum.toString() + " is too large for current power implementation.");

    if (this.isCompact) {
      if (isValuePrecise(resultVal = Math.pow(currentMagnitude, exponentMagnitude)))
        return new PrimitiveNumeric(discardFraction(resultVal));
    }

    baseNum = this;
    tempResult = NumericEntity[1];
    while (true) {
      if ((exponentMagnitude & 1) === 1) {
        tempResult = tempResult.times(baseNum);
        --exponentMagnitude;
      }
      if (exponentMagnitude === 0) break;
      exponentMagnitude /= 2;
      baseNum = baseNum.square();
    }
    return tempResult;
  };
  PrimitiveNumeric.prototype.power = ExtendedNumeric.prototype.power;

  // Modular exponentiation (pow(exp, mod))
  ExtendedNumeric.prototype.modPower = function(expVal, modVal) {
    expVal = parseInputVal(expVal);
    modVal = parseInputVal(modVal);
    if (modVal.isZero()) throw new Error("Cannot compute modular power with modulus 0.");

    var accumulator = NumericEntity[1],
      currentBase = this.modulo(modVal);
    while (expVal.isPositive()) {
      if (currentBase.isZero()) return NumericEntity[0];
      if (expVal.isOdd()) accumulator = accumulator.mul(currentBase).modulo(modVal);
      expVal = expVal.div(2);
      currentBase = currentBase.square().modulo(modVal);
    }
    return accumulator;
  };
  PrimitiveNumeric.prototype.modPower = ExtendedNumeric.prototype.modPower;

  // Comparison functions

  // Compares absolute magnitudes of two numeric arrays
  function compareMagnitudes(arrA, arrB) {
    if (arrA.length !== arrB.length) {
      return arrA.length > arrB.length ? 1 : -1;
    }
    for (var idx = arrA.length - 1; idx >= 0; idx--) {
      if (arrA[idx] !== arrB[idx]) return arrA[idx] > arrB[idx] ? 1 : -1;
    }
    return 0;
  }

  // ExtendedNumeric's absolute magnitude comparison
  ExtendedNumeric.prototype.compareAbsolute = function(otherVal) {
    var otherNum = parseInputVal(otherVal),
      currentMagnitude = this.numeralValue,
      otherMagnitude = otherNum.numeralValue;
    if (otherNum.isCompact) return 1; // Large number is always greater than small number in magnitude unless small is 0 and large is 0, which is covered by compareMagnitudes for 0
    return compareMagnitudes(currentMagnitude, otherMagnitude);
  };

  // PrimitiveNumeric's absolute magnitude comparison
  PrimitiveNumeric.prototype.compareAbsolute = function(otherVal) {
    var otherNum = parseInputVal(otherVal),
      currentAbsVal = Math.abs(this.numeralValue),
      otherMagnitude = otherNum.numeralValue;
    if (otherNum.isCompact) {
      otherMagnitude = Math.abs(otherMagnitude);
      return currentAbsVal === otherMagnitude ? 0 : currentAbsVal > otherMagnitude ? 1 : -1;
    }
    return -1; // Small number is always smaller than large number in magnitude
  };

  // ExtendedNumeric's general comparison
  ExtendedNumeric.prototype.compare = function(otherVal) {
    if (otherVal === Infinity) {
      return -1;
    }
    if (otherVal === -Infinity) {
      return 1;
    }
    var otherNum = parseInputVal(otherVal),
      currentMagnitude = this.numeralValue,
      otherMagnitude = otherNum.numeralValue;
    if (this.polarity !== otherNum.polarity) {
      return otherNum.polarity ? 1 : -1; // Different signs, negative is smaller
    }
    if (otherNum.isCompact) {
      return this.polarity ? -1 : 1; // Same sign, but other is compact. If this is positive, it's larger. If negative, it's smaller.
    }
    return compareMagnitudes(currentMagnitude, otherMagnitude) * (this.polarity ? -1 : 1);
  };
  ExtendedNumeric.prototype.compareTo = ExtendedNumeric.prototype.compare;

  // PrimitiveNumeric's general comparison
  PrimitiveNumeric.prototype.compare = function(otherVal) {
    if (otherVal === Infinity) {
      return -1;
    }
    if (otherVal === -Infinity) {
      return 1;
    }
    var otherNum = parseInputVal(otherVal),
      currentVal = this.numeralValue,
      otherValRaw = otherNum.numeralValue;
    if (otherNum.isCompact) {
      return currentVal == otherValRaw ? 0 : currentVal > otherValRaw ? 1 : -1;
    }
    if (currentVal < 0 !== otherNum.polarity) {
      return currentVal < 0 ? -1 : 1; // Different signs, currentVal is compact
    }
    return currentVal < 0 ? 1 : -1; // Same sign, but other is non-compact. If currentVal is negative, other is more negative (smaller). If currentVal is positive, other is more positive (larger).
  };
  PrimitiveNumeric.prototype.compareTo = PrimitiveNumeric.prototype.compare;

  // Equality checks
  ExtendedNumeric.prototype.equals = function(otherVal) {
    return this.compare(otherVal) === 0;
  };
  PrimitiveNumeric.prototype.eq = PrimitiveNumeric.prototype.equals = ExtendedNumeric.prototype.eq = ExtendedNumeric.prototype.equals;

  ExtendedNumeric.prototype.notEquals = function(otherVal) {
    return this.compare(otherVal) !== 0;
  };
  PrimitiveNumeric.prototype.neq = PrimitiveNumeric.prototype.notEquals = ExtendedNumeric.prototype.neq = ExtendedNumeric.prototype.notEquals;

  // Relational checks
  ExtendedNumeric.prototype.isGreater = function(otherVal) {
    return this.compare(otherVal) > 0;
  };
  PrimitiveNumeric.prototype.gt = PrimitiveNumeric.prototype.isGreater = ExtendedNumeric.prototype.gt = ExtendedNumeric.prototype.isGreater;

  ExtendedNumeric.prototype.isLesser = function(otherVal) {
    return this.compare(otherVal) < 0;
  };
  PrimitiveNumeric.prototype.lt = PrimitiveNumeric.prototype.isLesser = ExtendedNumeric.prototype.lt = ExtendedNumeric.prototype.isLesser;

  ExtendedNumeric.prototype.isGreaterOrEqual = function(otherVal) {
    return this.compare(otherVal) >= 0;
  };
  PrimitiveNumeric.prototype.geq = PrimitiveNumeric.prototype.isGreaterOrEqual = ExtendedNumeric.prototype.geq = ExtendedNumeric.prototype.isGreaterOrEqual;

  ExtendedNumeric.prototype.isLesserOrEqual = function(otherVal) {
    return this.compare(otherVal) <= 0;
  };
  PrimitiveNumeric.prototype.leq = PrimitiveNumeric.prototype.isLesserOrEqual = ExtendedNumeric.prototype.leq = ExtendedNumeric.prototype.isLesserOrEqual;

  // Parity and sign checks
  ExtendedNumeric.prototype.isEven = function() {
    return (this.numeralValue[0] & 1) === 0;
  };
  PrimitiveNumeric.prototype.isEven = function() {
    return (this.numeralValue & 1) === 0;
  };

  ExtendedNumeric.prototype.isOdd = function() {
    return (this.numeralValue[0] & 1) === 1;
  };
  PrimitiveNumeric.prototype.isOdd = function() {
    return (this.numeralValue & 1) === 1;
  };

  ExtendedNumeric.prototype.isPositive = function() {
    return !this.polarity;
  };
  PrimitiveNumeric.prototype.isPositive = function() {
    return this.numeralValue > 0;
  };

  ExtendedNumeric.prototype.isNegative = function() {
    return this.polarity;
  };
  PrimitiveNumeric.prototype.isNegative = function() {
    return this.numeralValue < 0;
  };

  ExtendedNumeric.prototype.isUnit = function() {
    return false; // ExtendedNumeric cannot be a unit (1 or -1) by definition
  };
  PrimitiveNumeric.prototype.isUnit = function() {
    return Math.abs(this.numeralValue) === 1;
  };

  ExtendedNumeric.prototype.isZero = function() {
    return false; // ExtendedNumeric cannot be zero by definition (it's stored as an empty array if zero)
  };
  PrimitiveNumeric.prototype.isZero = function() {
    return this.numeralValue === 0;
  };

  // Divisibility check
  ExtendedNumeric.prototype.isDivisibleBy = function(otherVal) {
    var otherNum = parseInputVal(otherVal);
    var otherRawVal = otherNum.numeralValue;
    if (otherRawVal === 0) return false;
    if (otherRawVal === 1) return true;
    if (otherRawVal === 2) return this.isEven();
    return this.modulo(otherNum).equals(NumericEntity[0]);
  };
  PrimitiveNumeric.prototype.isDivisibleBy = ExtendedNumeric.prototype.isDivisibleBy;

  // Primality tests
  function isSmallPrime(val) {
    var absVal = val.absolute();
    if (absVal.isUnit()) return false;
    if (absVal.equals(2) || absVal.equals(3) || absVal.equals(5)) return true;
    if (absVal.isEven() || absVal.isDivisibleBy(3) || absVal.isDivisibleBy(5)) return false;
    if (absVal.isLesser(25)) return true; // Smallest composite not caught by 2,3,5 is 7*7=49. 25 is prime.
  }

  // Miller-Rabin primality test for ExtendedNumeric
  ExtendedNumeric.prototype.isPrime = function() {
    var primeCheck = isSmallPrime(this);
    if (primeCheck !== voidVal) return primeCheck; // Use voidVal instead of undefined

    var currentNum = this.absolute(),
      numMinusOne = currentNum.prev();
    var testBases = [2, 3, 5, 7, 11, 13, 17, 19],
      tempB = numMinusOne,
      tempD,
      isWitness,
      idx,
      tempX;

    // Find d and s such that n-1 = d * 2^s
    while (tempB.isEven()) tempB = tempB.div(2);

    for (idx = 0; idx < testBases.length; idx++) {
      tempX = vastInteger(testBases[idx]).modPower(tempB, currentNum);
      if (tempX.equals(NumericEntity[1]) || tempX.equals(numMinusOne)) continue; // Not a strong witness

      isWitness = true;
      for (tempD = tempB; isWitness && tempD.isLesser(numMinusOne); tempD = tempD.mul(2)) {
        tempX = tempX.square().modulo(currentNum);
        if (tempX.equals(numMinusOne)) isWitness = false; // Not a strong witness
      }
      if (isWitness) return false; // Found a strong witness, not prime
    }
    return true; // Probably prime
  };
  PrimitiveNumeric.prototype.isPrime = ExtendedNumeric.prototype.isPrime;

  // Probabilistic primality test (Miller-Rabin with custom iterations)
  ExtendedNumeric.prototype.isProbablePrime = function(numIterations) {
    var primeCheck = isSmallPrime(this);
    if (primeCheck !== voidVal) return primeCheck;

    var currentNum = this.absolute();
    var numTests = numIterations === voidVal ? 5 : numIterations;

    for (var idx = 0; idx < numTests; idx++) {
      var randomBase = vastInteger.randomBetween(2, currentNum.minus(2));
      if (!randomBase.modPower(currentNum.prev(), currentNum).isUnit()) return false;
    }
    return true;
  };
  PrimitiveNumeric.prototype.isProbablePrime = ExtendedNumeric.prototype.isProbablePrime;

  // Modular multiplicative inverse (Extended Euclidean Algorithm)
  ExtendedNumeric.prototype.modInverse = function(modulus) {
    var t_val = vastInteger.zero,
      newT_val = vastInteger.one,
      r_val = parseInputVal(modulus),
      newR_val = this.absolute(),
      quotient_val,
      lastT_val,
      lastR_val;

    while (!newR_val.equals(vastInteger.zero)) {
      quotient_val = r_val.div(newR_val);
      lastT_val = t_val;
      lastR_val = r_val;
      t_val = newT_val;
      r_val = newR_val;
      newT_val = lastT_val.sub(quotient_val.mul(newT_val));
      newR_val = lastR_val.sub(quotient_val.mul(newR_val));
    }

    if (!r_val.equals(1))
      throw new Error(
        this.toString() + " and " + modulus.toString() + " are not coprime."
      );
    if (t_val.compare(0) === -1) {
      t_val = t_val.add(modulus);
    }
    if (this.isNegative()) {
      return t_val.invertPolarity();
    }
    return t_val;
  };
  PrimitiveNumeric.prototype.modInverse = ExtendedNumeric.prototype.modInverse;

  // Increment and Decrement
  ExtendedNumeric.prototype.next = function() {
    var currentMagnitude = this.numeralValue;
    if (this.polarity) {
      return diffCompactFromArray(currentMagnitude, 1, this.polarity);
    }
    return new ExtendedNumeric(sumCompactWithArray(currentMagnitude, 1), this.polarity);
  };
  PrimitiveNumeric.prototype.next = function() {
    var currentVal = this.numeralValue;
    if (currentVal + 1 < MAX_SAFE_JS_VAL) return new PrimitiveNumeric(currentVal + 1);
    return new ExtendedNumeric(MAX_SAFE_JS_VAL_ARR, false);
  };

  ExtendedNumeric.prototype.prev = function() {
    var currentMagnitude = this.numeralValue;
    if (this.polarity) {
      return new ExtendedNumeric(sumCompactWithArray(currentMagnitude, 1), true);
    }
    return diffCompactFromArray(currentMagnitude, 1, this.polarity);
  };
  PrimitiveNumeric.prototype.prev = function() {
    var currentVal = this.numeralValue;
    if (currentVal - 1 > -MAX_SAFE_JS_VAL) return new PrimitiveNumeric(currentVal - 1);
    return new ExtendedNumeric(MAX_SAFE_JS_VAL_ARR, true);
  };

  // Bitwise operations setup
  var powersOfTwoChunks = [1];
  while (2 * powersOfTwoChunks[powersOfTwoChunks.length - 1] <= CHUNK_UNIT)
    powersOfTwoChunks.push(2 * powersOfTwoChunks[powersOfTwoChunks.length - 1]);
  var powersOfTwoChunkLen = powersOfTwoChunks.length,
    highestPowerOfTwoInChunk = powersOfTwoChunks[powersOfTwoChunkLen - 1];

  // Helper to check if shift amount is small enough
  function isShiftAmountCompact(shiftAmount) {
    return (
      (typeof shiftAmount === "number" || typeof shiftAmount === "string") &&
      +Math.abs(shiftAmount) <= CHUNK_UNIT ||
      (shiftAmount instanceof ExtendedNumeric && shiftAmount.numeralValue.length <= 1)
    );
  }

  // Left bit shift
  ExtendedNumeric.prototype.bitShiftLeft = function(shiftAmount) {
    if (!isShiftAmountCompact(shiftAmount)) {
      throw new Error(String(shiftAmount) + " is too large for bit shifting.");
    }
    shiftAmount = +shiftAmount;
    if (shiftAmount < 0) return this.bitShiftRight(-shiftAmount);

    var currentResult = this;
    if (currentResult.isZero()) return currentResult;

    while (shiftAmount >= powersOfTwoChunkLen) {
      currentResult = currentResult.mul(highestPowerOfTwoInChunk);
      shiftAmount -= powersOfTwoChunkLen - 1; // Adjusted to match original logic
    }
    return currentResult.mul(powersOfTwoChunks[shiftAmount]);
  };
  PrimitiveNumeric.prototype.bitShiftLeft = ExtendedNumeric.prototype.bitShiftLeft;

  // Right bit shift
  ExtendedNumeric.prototype.bitShiftRight = function(shiftAmount) {
    var remainderAndQuotient;
    if (!isShiftAmountCompact(shiftAmount)) {
      throw new Error(String(shiftAmount) + " is too large for bit shifting.");
    }
    shiftAmount = +shiftAmount;
    if (shiftAmount < 0) return this.bitShiftLeft(-shiftAmount);

    var currentResult = this;
    while (shiftAmount >= powersOfTwoChunkLen) {
      if (currentResult.isZero() || (currentResult.isNegative() && currentResult.isUnit())) return currentResult;
      remainderAndQuotient = performDivMod(currentResult, highestPowerOfTwoInChunk);
      currentResult = remainderAndQuotient[1].isNegative() ? remainderAndQuotient[0].prev() : remainderAndQuotient[0];
      shiftAmount -= powersOfTwoChunkLen - 1; // Adjusted to match original logic
    }
    remainderAndQuotient = performDivMod(currentResult, powersOfTwoChunks[shiftAmount]);
    return remainderAndQuotient[1].isNegative() ? remainderAndQuotient[0].prev() : remainderAndQuotient[0];
  };
  PrimitiveNumeric.prototype.bitShiftRight = ExtendedNumeric.prototype.bitShiftRight;

  // Generic bitwise operation runner
  function performBitwiseOp(valX, valY, operationFn) {
    valY = parseInputVal(valY);
    var xPolarity = valX.isNegative(),
      yPolarity = valY.isNegative();
    var xRemaining = xPolarity ? valX.not() : valX,
      yRemaining = yPolarity ? valY.not() : valY;

    var xCurrentDigit = 0,
      yCurrentDigit = 0;
    var xDivModResult = null,
      yDivModResult = null;
    var collectedResults = [];

    while (!xRemaining.isZero() || !yRemaining.isZero()) {
      xDivModResult = performDivMod(xRemaining, highestPowerOfTwoInChunk);
      xCurrentDigit = xDivModResult[1].toJSNumber();
      if (xPolarity) {
        xCurrentDigit = highestPowerOfTwoInChunk - 1 - xCurrentDigit;
      }

      yDivModResult = performDivMod(yRemaining, highestPowerOfTwoInChunk);
      yCurrentDigit = yDivModResult[1].toJSNumber();
      if (yPolarity) {
        yCurrentDigit = highestPowerOfTwoInChunk - 1 - yCurrentDigit;
      }

      xRemaining = xDivModResult[0];
      yRemaining = yDivModResult[0];
      collectedResults.push(operationFn(xCurrentDigit, yCurrentDigit));
    }

    var finalSum =
      operationFn(xPolarity ? 1 : 0, yPolarity ? 1 : 0) !== 0 ?
      vastInteger(-1) :
      vastInteger(0);
    for (var idx = collectedResults.length - 1; idx >= 0; idx -= 1) {
      finalSum = finalSum.mul(highestPowerOfTwoInChunk).add(vastInteger(collectedResults[idx]));
    }
    return finalSum;
  }

  // Bitwise NOT (complement)
  ExtendedNumeric.prototype.not = function() {
    return this.invertPolarity().prev();
  };
  PrimitiveNumeric.prototype.not = ExtendedNumeric.prototype.not;

  // Bitwise AND
  ExtendedNumeric.prototype.and = function(otherVal) {
    return performBitwiseOp(this, otherVal, function(a, b) {
      return a & b;
    });
  };
  PrimitiveNumeric.prototype.and = ExtendedNumeric.prototype.and;

  // Bitwise OR
  ExtendedNumeric.prototype.or = function(otherVal) {
    return performBitwiseOp(this, otherVal, function(a, b) {
      return a | b;
    });
  };
  PrimitiveNumeric.prototype.or = ExtendedNumeric.prototype.or;

  // Bitwise XOR
  ExtendedNumeric.prototype.xor = function(otherVal) {
    return performBitwiseOp(this, otherVal, function(a, b) {
      return a ^ b;
    });
  };
  PrimitiveNumeric.prototype.xor = ExtendedNumeric.prototype.xor;

  // Low-order bit (LOB) calculation for GCD optimization
  var LOWEST_ONE_BIT_MASK_INT = 1 << 30,
    LOWEST_ONE_BIT_MASK_BIG = (CHUNK_UNIT & -CHUNK_UNIT) * (CHUNK_UNIT & -CHUNK_UNIT) | LOWEST_ONE_BIT_MASK_INT;

  function getRoughLOB(num) {
    var rawVal = num.numeralValue,
      extractedBit =
      typeof rawVal === "number" ?
      rawVal | LOWEST_ONE_BIT_MASK_INT :
      rawVal[0] + rawVal[1] * CHUNK_UNIT | LOWEST_ONE_BIT_MASK_BIG;
    return extractedBit & -extractedBit;
  }

  // Integer logarithm (base 2) for bitLength
  function calculateIntegerLog(numVal, baseNum) {
    if (baseNum.compareTo(numVal) <= 0) {
      var recursiveResult = calculateIntegerLog(numVal, baseNum.square(baseNum));
      var p_val = recursiveResult.p;
      var e_val = recursiveResult.e;
      var t_val = p_val.mul(baseNum);
      return t_val.compareTo(numVal) <= 0 ? {
        p: t_val,
        e: e_val * 2 + 1
      } : {
        p: p_val,
        e: e_val * 2
      }; // Corrected: e * 2, not e * 2 + 1. If t_val > numVal, then e is just 2*e. If t_val <= numVal, then e is 2*e + 1.
    }
    return {
      p: vastInteger(1),
      e: 0
    };
  }

  // Bit length of the number
  ExtendedNumeric.prototype.bitLength = function() {
    var currentNum = this;
    if (currentNum.compareTo(vastInteger(0)) < 0) {
      currentNum = currentNum.invertPolarity().sub(vastInteger(1));
    }
    if (currentNum.compareTo(vastInteger(0)) === 0) {
      return vastInteger(0);
    }
    return vastInteger(calculateIntegerLog(currentNum, vastInteger(2)).e).add(vastInteger(1));
  };
  PrimitiveNumeric.prototype.bitLength = ExtendedNumeric.prototype.bitLength;

  // Static utility functions
  function findMax(valA, valB) {
    valA = parseInputVal(valA);
    valB = parseInputVal(valB);
    return valA.isGreater(valB) ? valA : valB;
  }

  function findMin(valA, valB) {
    valA = parseInputVal(valA);
    valB = parseInputVal(valB);
    return valA.isLesser(valB) ? valA : valB;
  }

  // Greatest Common Divisor (GCD) using binary GCD algorithm
  function computeGCD(valA, valB) {
    valA = parseInputVal(valA).absolute();
    valB = parseInputVal(valB).absolute();
    if (valA.equals(valB)) return valA;
    if (valA.isZero()) return valB;
    if (valB.isZero()) return valA;

    var commonFactor = NumericEntity[1],
      lowestBit,
      tempSwap;
    while (valA.isEven() && valB.isEven()) {
      lowestBit = Math.min(getRoughLOB(valA), getRoughLOB(valB));
      valA = valA.div(lowestBit);
      valB = valB.div(lowestBit);
      commonFactor = commonFactor.mul(lowestBit);
    }
    while (valA.isEven()) {
      valA = valA.div(getRoughLOB(valA));
    }
    do {
      while (valB.isEven()) {
        valB = valB.div(getRoughLOB(valB));
      }
      if (valA.isGreater(valB)) {
        tempSwap = valB;
        valB = valA;
        valA = tempSwap;
      }
      valB = valB.sub(valA);
    } while (!valB.isZero());
    return commonFactor.isUnit() ? valA : valA.mul(commonFactor);
  }

  // Least Common Multiple (LCM)
  function computeLCM(valA, valB) {
    valA = parseInputVal(valA).absolute();
    valB = parseInputVal(valB).absolute();
    return valA.div(computeGCD(valA, valB)).mul(valB);
  }

  // Generates a random number between two given values (inclusive)
  function generateRandomBetween(valA, valB) {
    valA = parseInputVal(valA);
    valB = parseInputVal(valB);
    var lowerBound = findMin(valA, valB),
      upperBound = findMax(valA, valB);
    var fullRange = upperBound.sub(lowerBound).add(1);

    if (fullRange.isCompact)
      return lowerBound.add(Math.floor(Math.random() * fullRange.numeralValue));

    var rangeArrayLength = fullRange.numeralValue.length - 1;
    var randomDigits = [],
      isRestricted = true;

    for (var idx = rangeArrayLength; idx >= 0; idx--) {
      var currentMaxDigit = isRestricted ? fullRange.numeralValue[idx] : CHUNK_UNIT;
      var digit = discardFraction(Math.random() * currentMaxDigit);
      randomDigits.unshift(digit);
      if (digit < currentMaxDigit) isRestricted = false;
    }
    var randomArrayResult = numericArrayToCompact(randomDigits);
    return lowerBound.add(
      typeof randomArrayResult === "number" ?
      new PrimitiveNumeric(randomArrayResult) :
      new ExtendedNumeric(randomArrayResult, false)
    );
  }

  // Parses a string value in a given base
  var parseByBase = function(textInput, baseVal) {
    var textLength = textInput.length;
    var idx;
    var absoluteBase = Math.abs(baseVal);

    // Initial validation for all characters in the string
    for (idx = 0; idx < textLength; idx++) {
      var char = textInput[idx].toLowerCase();
      if (char === "-") continue;
      if (/[a-z0-9]/.test(char)) {
        if (/[0-9]/.test(char) && +char >= absoluteBase) {
          if (char === "1" && absoluteBase === 1) continue;
          throw new Error(char + " is not a valid digit in base " + baseVal + ".");
        } else if (char.charCodeAt(0) - 87 >= absoluteBase) {
          throw new Error(char + " is not a valid digit in base " + baseVal + ".");
        }
      }
    }

    // Fast path for common bases that fit into JS numbers
    if (2 <= baseVal && baseVal <= 36) {
      if (textLength <= LOG_MAX_SAFE_JS_VAL / Math.log(baseVal)) {
        var parsedResult = parseInt(textInput, baseVal);
        if (isNaN(parsedResult)) {
          throw new Error("Invalid number format for base " + baseVal + ".");
        }
        return new PrimitiveNumeric(parseInt(textInput, baseVal));
      }
    }

    baseVal = parseInputVal(baseVal);
    var digitArray = [];
    var isNegativeInput = textInput[0] === "-";
    for (idx = isNegativeInput ? 1 : 0; idx < textInput.length; idx++) {
      var char = textInput[idx].toLowerCase(),
        charUnicode = char.charCodeAt(0);
      if (48 <= charUnicode && charUnicode <= 57) digitArray.push(parseInputVal(char));
      else if (97 <= charUnicode && charUnicode <= 122)
        digitArray.push(parseInputVal(char.charCodeAt(0) - 87));
      else if (char === "<") {
        var startPos = idx;
        do {
          idx++;
        } while (textInput[idx] !== ">");
        digitArray.push(parseInputVal(textInput.slice(startPos + 1, idx)));
      } else throw new Error(char + " is not a valid character.");
    }
    return parseBaseFromDigitArray(digitArray, baseVal, isNegativeInput);
  };

  // Parses an array of digits (each a NumericEntity) in a given base
  function parseBaseFromDigitArray(digitArray, baseNum, isNegative) {
    var accumulatedValue = NumericEntity[0],
      currentPower = NumericEntity[1],
      idx;
    for (idx = digitArray.length - 1; idx >= 0; idx--) {
      accumulatedValue = accumulatedValue.add(digitArray[idx].times(currentPower));
      currentPower = currentPower.times(baseNum);
    }
    return isNegative ? accumulatedValue.invertPolarity() : accumulatedValue;
  }

  // Converts a single digit (0-35) to its string representation
  function digitToString(digit) {
    if (digit <= 35) {
      return "0123456789abcdefghijklmnopqrstuvwxyz".charAt(digit);
    }
    return "<" + digit + ">"; // For digits > 35
  }

  // Converts a NumericEntity to an array of digits in a specified base
  function convertToBaseArray(num, base) {
    base = vastInteger(base);
    if (base.isZero()) {
      if (num.isZero()) return {
        numeralValue: [0],
        isNegative: false
      };
      throw new Error("Cannot convert nonzero numbers to base 0.");
    }
    if (base.equals(-1)) {
      if (num.isZero()) return {
        numeralValue: [0],
        isNegative: false
      };
      if (num.isNegative())
        return {
          numeralValue: [].concat.apply([], Array.apply(null, Array(-num.toJSNumber())).map(Array.prototype.valueOf, [1, 0])),
          isNegative: false
        };
      var arr = Array.apply(null, Array(+num.toJSNumber() - 1)).map(Array.prototype.valueOf, [0, 1]);
      arr.unshift([1]);
      return {
        numeralValue: [].concat.apply([], arr),
        isNegative: false
      };
    }

    var resultIsNegative = false;
    if (num.isNegative() && base.isPositive()) {
      resultIsNegative = true;
      num = num.absolute();
    }
    if (base.equals(1)) {
      if (num.isZero()) return {
        numeralValue: [0],
        isNegative: false
      };
      return {
        numeralValue: Array.apply(null, Array(+num.toJSNumber())).map(Number.prototype.valueOf, 1),
        isNegative: resultIsNegative
      };
    }

    var digitCollection = [];
    var remainingNum = num,
      divModResult;
    while (remainingNum.isNegative() || remainingNum.compareAbsolute(base) >= 0) {
      divModResult = remainingNum.divmod(base);
      remainingNum = divModResult.quotient;
      var digit = divModResult.remainder;
      if (digit.isNegative()) {
        digit = base.minus(digit).absolute();
        remainingNum = remainingNum.next();
      }
      digitCollection.push(digit.toJSNumber());
    }
    digitCollection.push(remainingNum.toJSNumber());
    return {
      numeralValue: digitCollection.reverse(),
      isNegative: resultIsNegative
    };
  }

  // Converts a NumericEntity to a string in a specified base
  function convertToStringInBase(num, base) {
    var arrRepr = convertToBaseArray(num, base);
    return (arrRepr.isNegative ? "-" : "") + arrRepr.numeralValue.map(digitToString).join("");
  }

  // ExtendedNumeric's toArray method
  ExtendedNumeric.prototype.toArray = function(radix) {
    return convertToBaseArray(this, radix);
  };
  PrimitiveNumeric.prototype.toArray = function(radix) {
    return convertToBaseArray(this, radix);
  };

  // ExtendedNumeric's toString method
  ExtendedNumeric.prototype.toString = function(radix) {
    if (radix === voidVal) radix = 10;
    if (radix !== 10) return convertToStringInBase(this, radix);

    var internalValue = this.numeralValue,
      valueLen = internalValue.length,
      currentString = String(internalValue[--valueLen]),
      zeroPadding = "0000000",
      currentDigit;
    while (--valueLen >= 0) {
      currentDigit = String(internalValue[valueLen]);
      currentString += zeroPadding.slice(currentDigit.length) + currentDigit;
    }
    var signPrefix = this.polarity ? "-" : "";
    return signPrefix + currentString;
  };
  // PrimitiveNumeric's toString method
  PrimitiveNumeric.prototype.toString = function(radix) {
    if (radix === voidVal) radix = 10;
    if (radix != 10) return convertToStringInBase(this, radix);
    return String(this.numeralValue);
  };

  // JSON serialization
  ExtendedNumeric.prototype.toJSON = PrimitiveNumeric.prototype.toJSON = function() {
    return this.toString();
  };

  // ValueOf (for primitive conversion)
  ExtendedNumeric.prototype.valueOf = function() {
    return parseInt(this.toString(), 10);
  };
  ExtendedNumeric.prototype.toJSNumber = ExtendedNumeric.prototype.valueOf;
  PrimitiveNumeric.prototype.valueOf = function() {
    return this.numeralValue;
  };
  PrimitiveNumeric.prototype.toJSNumber = PrimitiveNumeric.prototype.valueOf;

  // Parsing functions
  function parseStringValue(strVal) {
    if (isValuePrecise(+strVal)) {
      var num = +strVal;
      if (num === discardFraction(num)) return new PrimitiveNumeric(num);
      throw new Error("Invalid integer format: " + strVal);
    }
    var isNegative = strVal[0] === "-";
    if (isNegative) strVal = strVal.slice(1);

    var parts = strVal.split(/e/i);
    if (parts.length > 2) throw new Error("Invalid integer format: " + parts.join("e"));
    if (parts.length === 2) {
      var exponentPart = parts[1];
      if (exponentPart[0] === "+") exponentPart = exponentPart.slice(1);
      exponentPart = +exponentPart;
      if (exponentPart !== discardFraction(exponentPart) || !isValuePrecise(exponentPart))
        throw new Error("Invalid integer format: " + exponentPart + " is not a valid exponent.");

      var mainText = parts[0];
      var decimalPointIndex = mainText.indexOf(".");
      if (decimalPointIndex >= 0) {
        exponentPart -= mainText.length - decimalPointIndex - 1;
        mainText = mainText.slice(0, decimalPointIndex) + mainText.slice(decimalPointIndex + 1);
      }
      if (exponentPart < 0) throw new Error("Cannot include negative exponent part for integers.");
      mainText += new Array(exponentPart + 1).join("0");
      strVal = mainText;
    }

    var isValidFormat = /^([0-9][0-9]*)$/.test(strVal);
    if (!isValidFormat) throw new Error("Invalid integer format: " + strVal);

    var resultChunks = [],
      maxLen = strVal.length,
      chunkLen = CHUNK_DIGITS,
      minLen = maxLen - chunkLen;
    while (maxLen > 0) {
      resultChunks.push(+strVal.slice(minLen, maxLen));
      minLen -= chunkLen;
      if (minLen < 0) minLen = 0;
      maxLen -= chunkLen;
    }
    removeLeadingZeros(resultChunks);
    return new ExtendedNumeric(resultChunks, isNegative);
  }

  function parseNumberValue(numVal) {
    if (isValuePrecise(numVal)) {
      if (numVal !== discardFraction(numVal)) throw new Error(numVal + " is not an integer.");
      return new PrimitiveNumeric(numVal);
    }
    return parseStringValue(numVal.toString());
  }

  // Main parsing entry point
  function parseInputVal(input) {
    if (typeof input === "number") {
      return parseNumberValue(input);
    }
    if (typeof input === "string") {
      return parseStringValue(input);
    }
    return input; // Assume it's already a NumericEntity object
  }

  // Pre-populate small integer cache
  for (var i = 0; i < 1000; i++) {
    NumericEntity[i] = new PrimitiveNumeric(i);
    if (i > 0) NumericEntity[-i] = new PrimitiveNumeric(-i);
  }

  // Add static properties to the main NumericEntity object
  NumericEntity.one = NumericEntity[1];
  NumericEntity.zero = NumericEntity[0];
  NumericEntity.minusOne = NumericEntity[-1];
  NumericEntity.max = findMax;
  NumericEntity.min = findMin;
  NumericEntity.gcd = computeGCD;
  NumericEntity.lcm = computeLCM;
  NumericEntity.isInstance = function(x) {
    return x instanceof ExtendedNumeric || x instanceof PrimitiveNumeric;
  };
  NumericEntity.randomBetween = generateRandomBetween;
  NumericEntity.fromArray = function(digitList, baseNum, isNegative) {
    return parseBaseFromDigitArray(
      digitList.map(parseInputVal),
      parseInputVal(baseNum || 10),
      isNegative
    );
  };
  return NumericEntity;
})();

/*
 * Utility for reading formatted input from standard input.
 * Provides methods to parse tokens, lines, and blocks of data.
 */
var INPUT_PROCESSOR = (function() {
  // Factory function to create a new input reader instance
  function createReaderInstance(sourceText) {
    return new DataBufferHandler(sourceText);
  }

  // Constructor for the data buffer handler
  function DataBufferHandler(sourceText) {
    this._sourceRows = sourceText.trim().split("\n"); // Trim and split input into lines
    this._currentRowIndex = 0; // Current line being processed
  }

  // Reads a single token (number or string) from the current line
  DataBufferHandler.prototype.readToken = function(asStringFlag) {
    var currentLines = this._sourceRows,
      currentLinePos = this._currentRowIndex,
      resultToken;
    // If the current line hasn't been split into tokens yet, do it
    if (typeof currentLines[currentLinePos] === "string")
      currentLines[currentLinePos] = currentLines[currentLinePos].split(" ").reverse();
    resultToken = currentLines[currentLinePos].pop(); // Get last token (from reversed array)
    // If the current line is exhausted, move to the next
    if (!currentLines[currentLinePos].length) this._currentRowIndex++;
    return asStringFlag ? resultToken : +resultToken; // Convert to number unless asStringFlag is true
  };

  // Reads an entire line, splitting it into tokens
  DataBufferHandler.prototype.readFullLine = function(asStringFlag) {
    var lineTokens = this._sourceRows[this._currentRowIndex++].split(" ");
    return asStringFlag ? lineTokens : lineTokens.map(item => +item); // Convert all tokens to numbers
  };

  // Reads a block of 'numRows' lines as a matrix
  DataBufferHandler.prototype.readBlock = function(numRows, asStringFlag) {
    var blockData = this._sourceRows
      .slice(this._currentRowIndex, (this._currentRowIndex += numRows))
      .map(row => row.split(" "));
    return asStringFlag ? blockData : blockData.map(row => row.map(item => +item)); // Convert all elements to numbers
  };

  // Reads a block of 'numRows' lines as raw strings or numbers
  DataBufferHandler.prototype.readRawBlock = function(numRows, asStringFlag) {
    var rawBlock = this._sourceRows.slice(
      this._currentRowIndex,
      (this._currentRowIndex += numRows)
    );
    return asStringFlag ? rawBlock : rawBlock.map(item => +item); // Convert all lines to numbers
  };

  return createReaderInstance;
})();

// Initialize input parser with data from stdin
var inputInstance = INPUT_PROCESSOR(require("fs").readFileSync("/dev/stdin", "utf8"));
// Initialize a vast integer instance for calculations
var numCalculator = vastInteger();

// Print the result of the main calculation function
console.log(performTask());

// Main calculation logic
function performTask() {
  var totalCount = inputInstance.readToken(); // Read N
  var targetThreshold = inputInstance.readToken(); // Read K
  var valuesList = inputInstance.readFullLine(); // Read array A

  // Calculate prefix sums
  var cumulativeTotals = [0];
  for (var idx = 0; idx < totalCount; idx++) cumulativeTotals[idx + 1] = cumulativeTotals[idx] + valuesList[idx];

  // Find all possible subarray sums and their frequencies
  var distinctSums = [],
    highestValue = 0,
    sumCounts = {};
  for (var startIdx = 0; startIdx < totalCount; startIdx++) {
    for (var endIdx = startIdx + 1; endIdx <= totalCount; endIdx++) {
      var segmentSum = cumulativeTotals[endIdx] - cumulativeTotals[startIdx];
      if (sumCounts[segmentSum]) sumCounts[segmentSum]++;
      else {
        distinctSums.push(segmentSum);
        sumCounts[segmentSum] = 1;
      }
      if (segmentSum > highestValue) highestValue = segmentSum;
    }
  }

  // Determine the highest power of 2 for bitwise search
  var bitDepth = 0;
  while (highestValue > 1) {
    highestValue = Math.floor(highestValue / 2);
    bitDepth++;
  }

  // Initialize the final answer as a vast integer (0)
  var computedAnswer = numCalculator;

  // Iterate from highest bit to lowest to find the largest K-sum
  for (var currentBit = bitDepth; currentBit >= 0; currentBit--) {
    var tempSums = [], // Sums that have the current bit set
      currentMask = numCalculator.add(1).bitShiftLeft(currentBit), // Mask for the current bit
      matchingCount = 0; // Count of sums with current bit set

    for (var diffIdx = 0; diffIdx < distinctSums.length; diffIdx++) {
      // Check if the current bit is set in the sum
      if (!currentMask.and(distinctSums[diffIdx]).isZero()) {
        tempSums.push(distinctSums[diffIdx]);
        matchingCount += sumCounts[distinctSums[diffIdx]];
      }
    }

    // If enough sums have the current bit set, include it in the answer
    if (matchingCount >= targetThreshold) {
      computedAnswer = computedAnswer.add(currentMask);
      distinctSums = tempSums; // Filter sums for the next iteration
    }
  }
  return computedAnswer.toString(); // Return the final answer as a string
}