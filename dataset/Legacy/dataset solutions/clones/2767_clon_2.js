"use strict";

let largeNum = (function(notDefined) {
  // Constants for internal number representation
  const CHUNK_SIZE = 1e7; // Base for digit chunks (10^7)
  const CHUNK_LOG = 7; // Logarithm of the chunk size
  const MAX_SAFE_VAL = 9007199254740992; // Max safe integer in JavaScript
  const MAX_SAFE_ARR = compactToArray(MAX_SAFE_VAL); // Max safe integer as an array of chunks
  const LOG_MAX_SAFE = Math.log(MAX_SAFE_VAL); // Log of max safe integer

  // Main factory function for number objects
  function NumValueGenerator(inputVal, baseValue) {
    if (typeof inputVal === "undefined") {
      return NumValueGenerator.nullValue;
    }
    if (typeof baseValue !== "undefined") {
      return +baseValue === 10 ? processGenericInput(inputVal) : convertFromBaseString(inputVal, baseValue);
    }
    return processGenericInput(inputVal);
  }

  // Constructor for large number objects
  function LargeNumObj(data, isNegative) {
    this.data = data;
    this.isNegative = isNegative;
    this.isCompact = false;
  }

  // Inherit from the base NumValueGenerator prototype
  LargeNumObj.prototype = Object.create(NumValueGenerator.prototype);

  // Constructor for small number objects
  function SmallNumObj(data) {
    this.data = data;
    this.isNegative = data < 0;
    this.isCompact = true;
  }

  // Inherit from the base NumValueGenerator prototype
  SmallNumObj.prototype = Object.create(NumValueGenerator.prototype);

  // Checks if a number fits within standard JS integer limits
  function canFitStandard(num) {
    return -MAX_SAFE_VAL < num && num < MAX_SAFE_VAL;
  }

  // Converts a standard JS number to an array of chunks
  function compactToArray(num) {
    if (num < 1e7) return [num];
    if (num < 1e14) return [num % 1e7, Math.floor(num / 1e7)];
    return [num % 1e7, Math.floor(num / 1e7) % 1e7, Math.floor(num / 1e14)];
  }

  // Converts an array of chunks back to a standard JS number if possible
  function arrayToCompact(arr) {
    removeLeadingZeros(arr);
    const currentLength = arr.length;
    if (currentLength < 4 && compareAbsoluteValues(arr, MAX_SAFE_ARR) < 0) {
      switch (currentLength) {
        case 0:
          return 0;
        case 1:
          return arr[0];
        case 2:
          return arr[0] + arr[1] * CHUNK_SIZE;
        default:
          return arr[0] + (arr[1] + arr[2] * CHUNK_SIZE) * CHUNK_SIZE;
      }
    }
    return arr;
  }

  // Removes leading zero chunks from an array
  function removeLeadingZeros(vec) {
    let index = vec.length;
    while (index > 0 && vec[--index] === 0);
    vec.length = index + 1;
  }

  // Creates a new array filled with zeros
  function makeZeroFilledArray(len) {
    const freshArray = new Array(len);
    let idx = -1;
    while (++idx < len) {
      freshArray[idx] = 0;
    }
    return freshArray;
  }

  // Floors a positive number, or ceils a negative number (truncates towards zero)
  function floorOrCeil(num) {
    if (num > 0) return Math.floor(num);
    return Math.ceil(num);
  }

  // Adds two arrays of chunks (representing positive numbers)
  function performAddition(arrA, arrB) {
    const lenA = arrA.length,
      lenB = arrB.length,
      result = new Array(lenA);
    let carry = 0,
      base = CHUNK_SIZE,
      sumValue,
      idx;
    for (idx = 0; idx < lenB; idx++) {
      sumValue = arrA[idx] + arrB[idx] + carry;
      carry = sumValue >= base ? 1 : 0;
      result[idx] = sumValue - carry * base;
    }
    while (idx < lenA) {
      sumValue = arrA[idx] + carry;
      carry = sumValue === base ? 1 : 0;
      result[idx++] = sumValue - carry * base;
    }
    if (carry > 0) result.push(carry);
    return result;
  }

  // Adds two arrays, ensuring the longer one is the first argument
  function addAnyLength(arr1, arr2) {
    if (arr1.length >= arr2.length) return performAddition(arr1, arr2);
    return performAddition(arr2, arr1);
  }

  // Adds a small number (carry) to an array of chunks
  function addCompact(arr, carry) {
    const len = arr.length,
      result = new Array(len);
    let base = CHUNK_SIZE,
      sumValue,
      idx;
    for (idx = 0; idx < len; idx++) {
      sumValue = arr[idx] - base + carry;
      carry = Math.floor(sumValue / base);
      result[idx] = sumValue - carry * base;
      carry += 1;
    }
    while (carry > 0) {
      result[idx++] = carry % base;
      carry = Math.floor(carry / base);
    }
    return result;
  }

  // Prototype method for LargeNumObj addition
  LargeNumObj.prototype.sumWith = function(incomingVal) {
    const parsedNum = processGenericInput(incomingVal);
    if (this.isNegative !== parsedNum.isNegative) {
      return this.differenceWith(parsedNum.invertSign());
    }
    const currentData = this.data,
      otherData = parsedNum.data;
    if (parsedNum.isCompact) {
      return new LargeNumObj(addCompact(currentData, Math.abs(otherData)), this.isNegative);
    }
    return new LargeNumObj(addAnyLength(currentData, otherData), this.isNegative);
  };

  // Alias for sumWith
  LargeNumObj.prototype.plusVal = LargeNumObj.prototype.sumWith;

  // Prototype method for SmallNumObj addition
  SmallNumObj.prototype.sumWith = function(incomingVal) {
    const parsedNum = processGenericInput(incomingVal);
    const currentVal = this.data;
    if ((currentVal < 0) !== parsedNum.isNegative) {
      return this.differenceWith(parsedNum.invertSign());
    }
    let otherVal = parsedNum.data;
    if (parsedNum.isCompact) {
      if (canFitStandard(currentVal + otherVal)) return new SmallNumObj(currentVal + otherVal);
      otherVal = compactToArray(Math.abs(otherVal));
    }
    return new LargeNumObj(addCompact(otherVal, Math.abs(currentVal)), currentVal < 0);
  };

  // Alias for sumWith
  SmallNumObj.prototype.plusVal = SmallNumObj.prototype.sumWith;

  // Subtracts two arrays of chunks (arrA >= arrB)
  function performSubtraction(arrA, arrB) {
    const lenA = arrA.length,
      lenB = arrB.length,
      result = new Array(lenA);
    let borrow = 0,
      base = CHUNK_SIZE,
      diffVal;
    for (let idx = 0; idx < lenB; idx++) {
      diffVal = arrA[idx] - borrow - arrB[idx];
      if (diffVal < 0) {
        diffVal += base;
        borrow = 1;
      } else borrow = 0;
      result[idx] = diffVal;
    }
    for (let idx = lenB; idx < lenA; idx++) {
      diffVal = arrA[idx] - borrow;
      if (diffVal < 0) diffVal += base;
      else {
        result[idx++] = diffVal;
        break;
      }
      result[idx] = diffVal;
    }
    for (let idx = arrA.length; idx < lenA; idx++) {
      result[idx] = arrA[idx];
    }
    removeLeadingZeros(result);
    return result;
  }

  // Subtracts two arrays, handling signs and order
  function subtractAnyLength(arrA, arrB, isNegativeResult) {
    let finalValue;
    if (compareAbsoluteValues(arrA, arrB) >= 0) {
      finalValue = performSubtraction(arrA, arrB);
    } else {
      finalValue = performSubtraction(arrB, arrA);
      isNegativeResult = !isNegativeResult;
    }
    finalValue = arrayToCompact(finalValue);
    if (typeof finalValue === "number") {
      if (isNegativeResult) finalValue = -finalValue;
      return new SmallNumObj(finalValue);
    }
    return new LargeNumObj(finalValue, isNegativeResult);
  }

  // Subtracts a small number from an array of chunks
  function subtractCompact(arr, smallVal, isNegativeResult) {
    const len = arr.length,
      result = new Array(len);
    let carry = -smallVal,
      base = CHUNK_SIZE,
      diffVal;
    for (let idx = 0; idx < len; idx++) {
      diffVal = arr[idx] + carry;
      carry = Math.floor(diffVal / base);
      diffVal %= base;
      result[idx] = diffVal < 0 ? diffVal + base : diffVal;
    }
    let compactResult = arrayToCompact(result);
    if (typeof compactResult === "number") {
      if (isNegativeResult) compactResult = -compactResult;
      return new SmallNumObj(compactResult);
    }
    return new LargeNumObj(compactResult, isNegativeResult);
  }

  // Prototype method for LargeNumObj subtraction
  LargeNumObj.prototype.differenceWith = function(incomingVal) {
    const parsedNum = processGenericInput(incomingVal);
    if (this.isNegative !== parsedNum.isNegative) {
      return this.sumWith(parsedNum.invertSign());
    }
    const currentData = this.data,
      otherData = parsedNum.data;
    if (parsedNum.isCompact) return subtractCompact(currentData, Math.abs(otherData), this.isNegative);
    return subtractAnyLength(currentData, otherData, this.isNegative);
  };

  // Alias for differenceWith
  LargeNumObj.prototype.minusVal = LargeNumObj.prototype.differenceWith;

  // Prototype method for SmallNumObj subtraction
  SmallNumObj.prototype.differenceWith = function(incomingVal) {
    const parsedNum = processGenericInput(incomingVal);
    const currentVal = this.data;
    if ((currentVal < 0) !== parsedNum.isNegative) {
      return this.sumWith(parsedNum.invertSign());
    }
    let otherVal = parsedNum.data;
    if (parsedNum.isCompact) {
      return new SmallNumObj(currentVal - otherVal);
    }
    return subtractCompact(otherVal, Math.abs(currentVal), currentVal >= 0);
  };

  // Alias for differenceWith
  SmallNumObj.prototype.minusVal = SmallNumObj.prototype.differenceWith;

  // Prototype method to invert the sign of a LargeNumObj
  LargeNumObj.prototype.invertSign = function() {
    return new LargeNumObj(this.data, !this.isNegative);
  };

  // Prototype method to invert the sign of a SmallNumObj
  SmallNumObj.prototype.invertSign = function() {
    const currentSign = this.isNegative;
    const smallResult = new SmallNumObj(-this.data);
    smallResult.isNegative = !currentSign;
    return smallResult;
  };

  // Prototype method to get the absolute value of a LargeNumObj
  LargeNumObj.prototype.absoluteValue = function() {
    return new LargeNumObj(this.data, false);
  };

  // Prototype method to get the absolute value of a SmallNumObj
  SmallNumObj.prototype.absoluteValue = function() {
    return new SmallNumObj(Math.abs(this.data));
  };

  // Multiplies two arrays of chunks using long multiplication
  function multLongForm(arrA, arrB) {
    const lenA = arrA.length,
      lenB = arrB.length,
      resultLen = lenA + lenB,
      result = makeZeroFilledArray(resultLen);
    const base = CHUNK_SIZE;
    let productVal, carryVal, idxA, chunkA, idxB, chunkB;

    for (idxA = 0; idxA < lenA; ++idxA) {
      chunkA = arrA[idxA];
      for (idxB = 0; idxB < lenB; ++idxB) {
        chunkB = arrB[idxB];
        productVal = chunkA * chunkB + result[idxA + idxB];
        carryVal = Math.floor(productVal / base);
        result[idxA + idxB] = productVal - carryVal * base;
        result[idxA + idxB + 1] += carryVal;
      }
    }
    removeLeadingZeros(result);
    return result;
  }

  // Multiplies an array of chunks by a small number
  function multCompact(arr, smallNum) {
    const len = arr.length,
      result = new Array(len);
    const base = CHUNK_SIZE;
    let carry = 0,
      productVal,
      idx;
    for (idx = 0; idx < len; idx++) {
      productVal = arr[idx] * smallNum + carry;
      carry = Math.floor(productVal / base);
      result[idx] = productVal - carry * base;
    }
    while (carry > 0) {
      result[idx++] = carry % base;
      carry = Math.floor(carry / base);
    }
    return result;
  }

  // Shifts an array of chunks left by 'n' positions (appends zeros)
  function shiftLeft(arr, count) {
    const shifted = [];
    while (count-- > 0) shifted.push(0);
    return shifted.concat(arr);
  }

  // Multiplies two arrays of chunks using Karatsuba algorithm
  function multKaratsuba(arrX, arrY) {
    let currentN = Math.max(arrX.length, arrY.length);
    if (currentN <= 30) return multLongForm(arrX, arrY); // Fallback to long multiplication for small arrays

    currentN = Math.ceil(currentN / 2); // Split point

    const b_part = arrX.slice(currentN);
    const a_part = arrX.slice(0, currentN);
    const d_part = arrY.slice(currentN);
    const c_part = arrY.slice(0, currentN);

    const ac_product = multKaratsuba(a_part, c_part);
    const bd_product = multKaratsuba(b_part, d_part);
    const abcd_product = multKaratsuba(addAnyLength(a_part, b_part), addAnyLength(c_part, d_part));

    // Karatsuba formula: Z2*B^2n + (Z1-Z2-Z0)*B^n + Z0
    // where Z2=ac, Z0=bd, Z1=abcd
    const finalProduct = addAnyLength(
      addAnyLength(ac_product, shiftLeft(subtractAnyLength(subtractAnyLength(abcd_product, ac_product, false), bd_product, false), currentN)),
      shiftLeft(bd_product, 2 * currentN)
    );
    removeLeadingZeros(finalProduct);
    return finalProduct;
  }

  // Heuristic to decide whether to use Karatsuba multiplication
  function shouldUseKaratsuba(len1, len2) {
    return -0.012 * len1 - 0.012 * len2 + 15e-6 * len1 * len2 > 0;
  }

  // Prototype method for LargeNumObj multiplication
  LargeNumObj.prototype.timesBy = function(incomingVal) {
    const parsedNum = processGenericInput(incomingVal);
    const currentData = this.data,
      otherData = parsedNum.data;
    const isResultNegative = this.isNegative !== parsedNum.isNegative;
    let absOtherData;

    if (parsedNum.isCompact) {
      if (otherData === 0) return NumValueGenerator.nullValue;
      if (otherData === 1) return this;
      if (otherData === -1) return this.invertSign();
      absOtherData = Math.abs(otherData);
      if (absOtherData < CHUNK_SIZE) {
        return new LargeNumObj(multCompact(currentData, absOtherData), isResultNegative);
      }
      absOtherData = compactToArray(absOtherData);
    }
    if (shouldUseKaratsuba(currentData.length, otherData.length)) return new LargeNumObj(multKaratsuba(currentData, absOtherData || otherData), isResultNegative);
    return new LargeNumObj(multLongForm(currentData, absOtherData || otherData), isResultNegative);
  };

  // Alias for timesBy
  LargeNumObj.prototype.multBy = LargeNumObj.prototype.timesBy;

  // Multiplies a small number by an array of chunks
  function multCompactAndArray(smallVal, arr, isNegativeResult) {
    if (smallVal < CHUNK_SIZE) {
      return new LargeNumObj(multCompact(arr, smallVal), isNegativeResult);
    }
    return new LargeNumObj(multLongForm(arr, compactToArray(smallVal)), isNegativeResult);
  }

  // Internal multiplication for SmallNumObj by SmallNumObj
  SmallNumObj.prototype._multiplyBySmall = function(otherSmallNum) {
    if (canFitStandard(otherSmallNum.data * this.data)) {
      return new SmallNumObj(otherSmallNum.data * this.data);
    }
    return multCompactAndArray(Math.abs(otherSmallNum.data), compactToArray(Math.abs(this.data)), this.isNegative !== otherSmallNum.isNegative);
  };

  // Internal multiplication for LargeNumObj by SmallNumObj
  LargeNumObj.prototype._multiplyBySmall = function(otherSmallNum) {
    if (otherSmallNum.data === 0) return NumValueGenerator.nullValue;
    if (otherSmallNum.data === 1) return this;
    if (otherSmallNum.data === -1) return this.invertSign();
    return multCompactAndArray(Math.abs(otherSmallNum.data), this.data, this.isNegative !== otherSmallNum.isNegative);
  };

  // Prototype method for SmallNumObj multiplication
  SmallNumObj.prototype.timesBy = function(incomingVal) {
    return processGenericInput(incomingVal)._multiplyBySmall(this);
  };

  // Alias for timesBy
  SmallNumObj.prototype.multBy = SmallNumObj.prototype.timesBy;

  // Squares an array of chunks
  function raiseToPowerTwo(arr) {
    const len = arr.length,
      result = makeZeroFilledArray(len + len);
    const base = CHUNK_SIZE;
    let productVal, carryVal, idx, chunkI, chunkJ;
    for (idx = 0; idx < len; idx++) {
      chunkI = arr[idx];
      carryVal = 0 - chunkI * chunkI; // Initialize carry, then adjust
      for (let j = idx; j < len; j++) {
        chunkJ = arr[j];
        productVal = 2 * (chunkI * chunkJ) + result[idx + j] + carryVal;
        carryVal = Math.floor(productVal / base);
        result[idx + j] = productVal - carryVal * base;
      }
      result[idx + len] = carryVal;
    }
    removeLeadingZeros(result);
    return result;
  }

  // Prototype method for LargeNumObj squaring
  LargeNumObj.prototype.squared = function() {
    return new LargeNumObj(raiseToPowerTwo(this.data), false);
  };

  // Prototype method for SmallNumObj squaring
  SmallNumObj.prototype.squared = function() {
    const resultVal = this.data * this.data;
    if (canFitStandard(resultVal)) return new SmallNumObj(resultVal);
    return new LargeNumObj(raiseToPowerTwo(compactToArray(Math.abs(this.data))), false);
  };

  // Division with remainder, first algorithm (Knuth's D-algorithm)
  function divideAndRemainderLong(dividendArr, divisorArr) {
    const dividendLen = dividendArr.length,
      divisorLen = divisorArr.length,
      base = CHUNK_SIZE,
      quotientResult = makeZeroFilledArray(divisorArr.length);
    const divisorMostSignificant = divisorArr[divisorLen - 1];
    const lambda = Math.ceil(base / (2 * divisorMostSignificant)); // Normalization factor
    let remainderArr = multCompact(dividendArr, lambda);
    let normalizedDivisor = multCompact(divisorArr, lambda);
    let quotientDigit, shiftAmount, currentCarry, currentBorrow, idx, loopLen, currentQ;

    if (remainderArr.length <= dividendLen) remainderArr.push(0); // Ensure enough space
    normalizedDivisor.push(0); // For easier calculation
    const normalizedDivisorMSD = normalizedDivisor[divisorLen - 1];

    for (shiftAmount = dividendLen - divisorLen; shiftAmount >= 0; shiftAmount--) {
      quotientDigit = base - 1;
      // Estimate quotient digit
      if (remainderArr[shiftAmount + divisorLen] !== normalizedDivisorMSD) {
        quotientDigit = Math.floor((remainderArr[shiftAmount + divisorLen] * base + remainderArr[shiftAmount + divisorLen - 1]) / normalizedDivisorMSD);
      }

      currentCarry = 0;
      currentBorrow = 0;
      loopLen = normalizedDivisor.length;
      for (idx = 0; idx < loopLen; idx++) {
        currentCarry += quotientDigit * normalizedDivisor[idx];
        currentQ = Math.floor(currentCarry / base);
        currentBorrow += remainderArr[shiftAmount + idx] - (currentCarry - currentQ * base);
        currentCarry = currentQ;
        if (currentBorrow < 0) {
          remainderArr[shiftAmount + idx] = currentBorrow + base;
          currentBorrow = -1;
        } else {
          remainderArr[shiftAmount + idx] = currentBorrow;
          currentBorrow = 0;
        }
      }

      // Adjust quotient digit if too large
      while (currentBorrow !== 0) {
        quotientDigit -= 1;
        currentCarry = 0;
        for (idx = 0; idx < loopLen; idx++) {
          currentCarry += remainderArr[shiftAmount + idx] - base + normalizedDivisor[idx];
          if (currentCarry < 0) {
            remainderArr[shiftAmount + idx] = currentCarry + base;
            currentCarry = 0;
          } else {
            remainderArr[shiftAmount + idx] = currentCarry;
            currentCarry = 1;
          }
        }
        currentBorrow += currentCarry;
      }
      quotientResult[shiftAmount] = quotientDigit;
    }
    remainderArr = divideAndRemainderCompact(remainderArr, lambda)[0]; // Denormalize remainder
    return [arrayToCompact(quotientResult), arrayToCompact(remainderArr)];
  }

  // Division with remainder, second algorithm (simpler, for smaller numbers)
  function divideAndRemainderShort(dividendArr, divisorArr) {
    let dividendLen = dividendArr.length,
      divisorLen = divisorArr.length,
      quotientResult = [],
      currentPart = [],
      base = CHUNK_SIZE,
      estimatedQuotient,
      currentXLen,
      highX,
      highY,
      checkResult;

    while (dividendLen) {
      currentPart.unshift(dividendArr[--dividendLen]);
      removeLeadingZeros(currentPart);
      if (compareAbsoluteValues(currentPart, divisorArr) < 0) {
        quotientResult.push(0);
        continue;
      }
      currentXLen = currentPart.length;
      highX = currentPart[currentXLen - 1] * base + currentPart[currentXLen - 2];
      highY = divisorArr[divisorLen - 1] * base + divisorArr[divisorLen - 2];
      if (currentXLen > divisorLen) {
        highX = (highX + 1) * base; // Adjust for potential overflow
      }
      estimatedQuotient = Math.ceil(highX / highY); // Initial estimate
      do {
        checkResult = multCompact(divisorArr, estimatedQuotient);
        if (compareAbsoluteValues(checkResult, currentPart) <= 0) break;
        estimatedQuotient--;
      } while (estimatedQuotient);
      quotientResult.push(estimatedQuotient);
      currentPart = performSubtraction(currentPart, checkResult);
    }
    quotientResult.reverse();
    return [arrayToCompact(quotientResult), arrayToCompact(currentPart)];
  }

  // Divides an array of chunks by a small number, returning quotient and remainder
  function divideAndRemainderCompact(arr, smallDivisor) {
    const len = arr.length,
      quotient = makeZeroFilledArray(len);
    const base = CHUNK_SIZE;
    let idx, qVal, remainderVal, currentDivisor;
    remainderVal = 0;
    for (idx = len - 1; idx >= 0; --idx) {
      currentDivisor = remainderVal * base + arr[idx];
      qVal = floorOrCeil(currentDivisor / smallDivisor);
      remainderVal = currentDivisor - qVal * smallDivisor;
      quotient[idx] = qVal | 0; // Ensure integer
    }
    return [quotient, remainderVal | 0]; // Ensure integer
  }

  // Generic division and remainder function, handles all cases
  function genericDivideAndRemainder(currentNum, incomingVal) {
    let resultValue, parsedNum = processGenericInput(incomingVal);
    const arrA = currentNum.data,
      arrB = parsedNum.data;
    let finalQuotient;

    if (arrB === 0) throw new Error("Division by zero is not allowed.");

    if (currentNum.isCompact) {
      if (parsedNum.isCompact) {
        return [new SmallNumObj(floorOrCeil(arrA / arrB)), new SmallNumObj(arrA % arrB)];
      }
      return [NumValueGenerator.nullValue, currentNum]; // Small number divided by large number is 0 with small number as remainder
    }

    if (parsedNum.isCompact) {
      if (arrB === 1) return [currentNum, NumValueGenerator.nullValue];
      if (arrB === -1) return [currentNum.invertSign(), NumValueGenerator.nullValue];
      const absOther = Math.abs(arrB);
      if (absOther < CHUNK_SIZE) {
        resultValue = divideAndRemainderCompact(arrA, absOther);
        finalQuotient = arrayToCompact(resultValue[0]);
        let remainder = resultValue[1];
        if (currentNum.isNegative) remainder = -remainder;
        if (typeof finalQuotient === "number") {
          if (currentNum.isNegative !== parsedNum.isNegative) finalQuotient = -finalQuotient;
          return [new SmallNumObj(finalQuotient), new SmallNumObj(remainder)];
        }
        return [new LargeNumObj(finalQuotient, currentNum.isNegative !== parsedNum.isNegative), new SmallNumObj(remainder)];
      }
      parsedNum.data = compactToArray(absOther); // Convert small divisor to array for next step
    }

    const comparison = compareAbsoluteValues(arrA, parsedNum.data);
    if (comparison === -1) return [NumValueGenerator.nullValue, currentNum]; // Dividend is smaller than divisor
    if (comparison === 0) return [NumValueGenerator[currentNum.isNegative === parsedNum.isNegative ? 1 : -1], NumValueGenerator.nullValue]; // Equal absolute values

    if (arrA.length + parsedNum.data.length <= 200) resultValue = divideAndRemainderLong(arrA, parsedNum.data);
    else resultValue = divideAndRemainderShort(arrA, parsedNum.data);

    finalQuotient = resultValue[0];
    const quotientIsNegative = currentNum.isNegative !== parsedNum.isNegative;
    let remainder = resultValue[1],
      remainderIsNegative = currentNum.isNegative;

    if (typeof finalQuotient === "number") {
      if (quotientIsNegative) finalQuotient = -finalQuotient;
      finalQuotient = new SmallNumObj(finalQuotient);
    } else finalQuotient = new LargeNumObj(finalQuotient, quotientIsNegative);

    if (typeof remainder === "number") {
      if (remainderIsNegative) remainder = -remainder;
      remainder = new SmallNumObj(remainder);
    } else remainder = new LargeNumObj(remainder, remainderIsNegative);

    return [finalQuotient, remainder];
  }

  // Prototype method for LargeNumObj divmod
  LargeNumObj.prototype.getQuotientAndRemainder = function(incomingVal) {
    const result = genericDivideAndRemainder(this, incomingVal);
    return {
      quotient: result[0],
      remainder: result[1]
    };
  };

  // SmallNumObj also uses the same divmod implementation
  SmallNumObj.prototype.getQuotientAndRemainder = LargeNumObj.prototype.getQuotientAndRemainder;

  // Prototype method for LargeNumObj division (returns only quotient)
  LargeNumObj.prototype.getQuotient = function(incomingVal) {
    return genericDivideAndRemainder(this, incomingVal)[0];
  };

  // Aliases for getQuotient
  SmallNumObj.prototype.divBy = SmallNumObj.prototype.getQuotient;
  LargeNumObj.prototype.divBy = LargeNumObj.prototype.getQuotient;

  // Prototype method for LargeNumObj modulo (returns only remainder)
  LargeNumObj.prototype.getRemainder = function(incomingVal) {
    return genericDivideAndRemainder(this, incomingVal)[1];
  };

  // Aliases for getRemainder
  SmallNumObj.prototype.modulo = SmallNumObj.prototype.getRemainder;
  LargeNumObj.prototype.modulo = LargeNumObj.prototype.getRemainder;

  // Prototype method for LargeNumObj power
  LargeNumObj.prototype.powerOf = function(exponentVal) {
    const expNum = processGenericInput(exponentVal);
    const baseData = this.data,
      expData = expNum.data;
    let resultVal, currentX, currentY;

    if (expData === 0) return NumValueGenerator.unitValue;
    if (baseData === 0) return NumValueGenerator.nullValue;
    if (baseData === 1) return NumValueGenerator.unitValue;
    if (baseData === -1) return expNum.isEvenlyDivided() ? NumValueGenerator.unitValue : NumValueGenerator.negUnitValue;

    if (expNum.isNegative) {
      return NumValueGenerator.nullValue; // Negative exponents result in fractions, which are 0 for integers
    }
    if (!expNum.isCompact) throw new Error("The exponent " + expNum.toText() + " is too large.");

    if (this.isCompact) {
      resultVal = Math.pow(baseData, expData);
      if (canFitStandard(resultVal)) return new SmallNumObj(floorOrCeil(resultVal));
    }

    currentX = this;
    currentY = NumValueGenerator.unitValue;
    while (true) {
      if ((expData & 1) === 1) { // If exponent is odd
        currentY = currentY.timesBy(currentX);
        --expData;
      }
      if (expData === 0) break;
      expData /= 2; // expData is an integer, so this is equivalent to right shift
      currentX = currentX.squared();
    }
    return currentY;
  };

  // SmallNumObj also uses the same powerOf implementation
  SmallNumObj.prototype.powerOf = LargeNumObj.prototype.powerOf;

  // Prototype method for LargeNumObj modular exponentiation
  LargeNumObj.prototype.modularExponentiation = function(exp, mod) {
    exp = processGenericInput(exp);
    mod = processGenericInput(mod);
    if (mod.isZeroVal()) throw new Error("Cannot take modular exponentiation with modulus 0");

    let result = NumValueGenerator.unitValue;
    let currentBase = this.getRemainder(mod);

    while (exp.isPos()) {
      if (currentBase.isZeroVal()) return NumValueGenerator.nullValue;
      if (exp.isOddNumbered()) result = result.timesBy(currentBase).getRemainder(mod);
      exp = exp.getQuotient(2);
      currentBase = currentBase.squared().getRemainder(mod);
    }
    return result;
  };

  // SmallNumObj also uses the same modularExponentiation implementation
  SmallNumObj.prototype.modularExponentiation = LargeNumObj.prototype.modularExponentiation;

  // Compares the absolute values of two arrays of chunks
  function compareAbsoluteValues(arr1, arr2) {
    if (arr1.length !== arr2.length) {
      return arr1.length > arr2.length ? 1 : -1;
    }
    for (let idx = arr1.length - 1; idx >= 0; idx--) {
      if (arr1[idx] !== arr2[idx]) return arr1[idx] > arr2[idx] ? 1 : -1;
    }
    return 0;
  }

  // Prototype method for LargeNumObj absolute value comparison
  LargeNumObj.prototype.compareAbsVal = function(incomingVal) {
    const parsedNum = processGenericInput(incomingVal);
    const currentData = this.data,
      otherData = parsedNum.data;
    if (parsedNum.isCompact) return 1; // A compact number is "smaller" in representation
    return compareAbsoluteValues(currentData, otherData);
  };

  // Prototype method for SmallNumObj absolute value comparison
  SmallNumObj.prototype.compareAbsVal = function(incomingVal) {
    const parsedNum = processGenericInput(incomingVal);
    const currentAbs = Math.abs(this.data),
      otherData = parsedNum.data;
    if (parsedNum.isCompact) {
      const otherAbs = Math.abs(otherData);
      return currentAbs === otherAbs ? 0 : currentAbs > otherAbs ? 1 : -1;
    }
    return -1; // A small number is "smaller" in representation
  };

  // Prototype method for LargeNumObj comparison
  LargeNumObj.prototype.compareWith = function(incomingVal) {
    if (incomingVal === Infinity) return -1;
    if (incomingVal === -Infinity) return 1;

    const parsedNum = processGenericInput(incomingVal);
    const currentData = this.data,
      otherData = parsedNum.data;

    if (this.isNegative !== parsedNum.isNegative) {
      return parsedNum.isNegative ? 1 : -1; // Different signs
    }
    if (parsedNum.isCompact) {
      return this.isNegative ? -1 : 1; // Large vs small with same sign
    }
    return compareAbsoluteValues(currentData, otherData) * (this.isNegative ? -1 : 1);
  };

  // Alias for compareWith
  LargeNumObj.prototype.cmpTo = LargeNumObj.prototype.compareWith;

  // Prototype method for SmallNumObj comparison
  SmallNumObj.prototype.compareWith = function(incomingVal) {
    if (incomingVal === Infinity) return -1;
    if (incomingVal === -Infinity) return 1;

    const parsedNum = processGenericInput(incomingVal);
    const currentVal = this.data,
      otherVal = parsedNum.data;

    if (parsedNum.isCompact) {
      return currentVal === otherVal ? 0 : currentVal > otherVal ? 1 : -1;
    }
    if ((currentVal < 0) !== parsedNum.isNegative) {
      return currentVal < 0 ? -1 : 1; // Small vs large with different signs
    }
    return currentVal < 0 ? 1 : -1; // Small vs large with same sign (small is always smaller if large is large)
  };

  // Alias for compareWith
  SmallNumObj.prototype.cmpTo = SmallNumObj.prototype.compareWith;

  // Comparison utility methods
  LargeNumObj.prototype.isEqualTo = function(v) {
    return this.compareWith(v) === 0;
  };
  SmallNumObj.prototype.eqTo = SmallNumObj.prototype.isEqualTo = LargeNumObj.prototype.eqTo = LargeNumObj.prototype.isEqualTo;

  LargeNumObj.prototype.isNotEqualTo = function(v) {
    return this.compareWith(v) !== 0;
  };
  SmallNumObj.prototype.neqTo = SmallNumObj.prototype.isNotEqualTo = LargeNumObj.prototype.neqTo = LargeNumObj.prototype.isNotEqualTo;

  LargeNumObj.prototype.isGreaterThan = function(v) {
    return this.compareWith(v) > 0;
  };
SmallNumObj.prototype.gtThan = SmallNumObj.prototype.isGreaterThan = LargeNumObj.prototype.gtThan = LargeNumObj.prototype.isGreaterThan;

  LargeNumObj.prototype.isLessThan = function(v) {
    return this.compareWith(v) < 0;
  };
SmallNumObj.prototype.ltThan = SmallNumObj.prototype.isLessThan = LargeNumObj.prototype.ltThan = LargeNumObj.prototype.isLessThan;

  LargeNumObj.prototype.isGreaterOrEqualTo = function(v) {
    return this.compareWith(v) >= 0;
  };
SmallNumObj.prototype.geqTo = SmallNumObj.prototype.isGreaterOrEqualTo = LargeNumObj.prototype.geqTo = LargeNumObj.prototype.isGreaterOrEqualTo;

  LargeNumObj.prototype.isLessOrEqualTo = function(v) {
    return this.compareWith(v) <= 0;
  };
SmallNumObj.prototype.leqTo = SmallNumObj.prototype.isLessOrEqualTo = LargeNumObj.prototype.leqTo = LargeNumObj.prototype.isLessOrEqualTo;

  // Property check methods
  LargeNumObj.prototype.isEvenlyDivided = function() {
    return (this.data[0] & 1) === 0;
  };
  SmallNumObj.prototype.isEvenlyDivided = function() {
    return (this.data & 1) === 0;
  };

  LargeNumObj.prototype.isOddNumbered = function() {
    return (this.data[0] & 1) === 1;
  };
  SmallNumObj.prototype.isOddNumbered = function() {
    return (this.data & 1) === 1;
  };

  LargeNumObj.prototype.isPos = function() {
    return !this.isNegative;
  };
  SmallNumObj.prototype.isPos = function() {
    return this.data > 0;
  };

  LargeNumObj.prototype.isNeg = function() {
    return this.isNegative;
  };
  SmallNumObj.prototype.isNeg = function() {
    return this.data < 0;
  };

  LargeNumObj.prototype.isSingleUnit = function() {
    return false; // Large number cannot be a single unit
  };
  SmallNumObj.prototype.isSingleUnit = function() {
    return Math.abs(this.data) === 1;
  };

  LargeNumObj.prototype.isZeroVal = function() {
    return false; // Large number cannot be zero
  };
  SmallNumObj.prototype.isZeroVal = function() {
    return this.data === 0;
  };

  LargeNumObj.prototype.canBeDividedBy = function(incomingVal) {
    const parsedNum = processGenericInput(incomingVal);
    const otherData = parsedNum.data;
    if (otherData === 0) return false;
    if (otherData === 1) return true;
    if (otherData === 2) return this.isEvenlyDivided();
    return this.getRemainder(parsedNum).isEqualTo(NumValueGenerator.nullValue);
  };
  SmallNumObj.prototype.canBeDividedBy = LargeNumObj.prototype.canBeDividedBy;

  // Helper for primality tests
  function checkBasicPrime(val) {
    const absVal = val.absoluteValue();
    if (absVal.isSingleUnit()) return false;
    if (absVal.isEqualTo(2) || absVal.isEqualTo(3) || absVal.isEqualTo(5)) return true;
    if (absVal.isEvenlyDivided() || absVal.canBeDividedBy(3) || absVal.canBeDividedBy(5)) return false;
    if (absVal.isLessThan(25)) return true; // Smallest composite not divisible by 2,3,5 is 7*7=49
  }

  // Miller-Rabin primality test
  LargeNumObj.prototype.isPrimary = function() {
    const basicCheck = checkBasicPrime(this);
    if (basicCheck !== notDefined) return basicCheck;

    const currentNum = this.absoluteValue(),
      numMinusOne = currentNum.decrement();
    const testPrimes = [2, 3, 5, 7, 11, 13, 17, 19];
    let dVal = numMinusOne;
    let sCount, xResult, idx;

    // Find s and d such that num - 1 = 2^s * d with d odd
    while (dVal.isEvenlyDivided()) dVal = dVal.getQuotient(2);

    for (idx = 0; idx < testPrimes.length; idx++) {
      xResult = largeNum(testPrimes[idx]).modularExponentiation(dVal, currentNum);
      if (xResult.isEqualTo(NumValueGenerator.unitValue) || xResult.isEqualTo(numMinusOne)) continue;

      let loopFlag = true;
      for (sCount = dVal; loopFlag && sCount.isLessThan(numMinusOne); sCount = sCount.timesBy(2)) {
        xResult = xResult.squared().getRemainder(currentNum);
        if (xResult.isEqualTo(numMinusOne)) loopFlag = false;
      }
      if (loopFlag) return false; // Not prime
    }
    return true; // Likely prime
  };
  SmallNumObj.prototype.isPrimary = LargeNumObj.prototype.isPrimary;

  // Probabilistic primality test
  LargeNumObj.prototype.isProbablyPrimary = function(iterations) {
    const basicCheck = checkBasicPrime(this);
    if (basicCheck !== notDefined) return basicCheck;

    const currentNum = this.absoluteValue();
    const testIterations = iterations === notDefined ? 5 : iterations;

    for (let idx = 0; idx < testIterations; idx++) {
      const randomBase = largeNum.generateRandomBetween(2, currentNum.minusVal(2));
      if (!randomBase.modularExponentiation(currentNum.decrement(), currentNum).isSingleUnit()) return false;
    }
    return true;
  };
  SmallNumObj.prototype.isProbablyPrimary = LargeNumObj.prototype.isProbablyPrimary;

  // Modular inverse using extended Euclidean algorithm
  LargeNumObj.prototype.modularInverse = function(modulus) {
    let tVal = largeNum.nullValue,
      newTVal = largeNum.unitValue;
    let rVal = processGenericInput(modulus),
      newRVal = this.absoluteValue();
    let quotientVal, lastT, lastR;

    while (!newRVal.isEqualTo(largeNum.nullValue)) {
      quotientVal = rVal.getQuotient(newRVal);
      lastT = tVal;
      lastR = rVal;
      tVal = newTVal;
      rVal = newRVal;
      newTVal = lastT.differenceWith(quotientVal.timesBy(newTVal));
      newRVal = lastR.differenceWith(quotientVal.timesBy(newRVal));
    }

    if (!rVal.isEqualTo(1)) throw new Error(this.toText() + " and " + modulus.toText() + " are not coprime");
    if (tVal.compareWith(0) === -1) {
      tVal = tVal.sumWith(modulus);
    }
    if (this.isNeg()) {
      return tVal.invertSign();
    }
    return tVal;
  };
  SmallNumObj.prototype.modularInverse = LargeNumObj.prototype.modularInverse;

  // Get the next integer
  LargeNumObj.prototype.increment = function() {
    const currentData = this.data;
    if (this.isNegative) {
      return subtractCompact(currentData, 1, this.isNegative);
    }
    return new LargeNumObj(addCompact(currentData, 1), this.isNegative);
  };
  SmallNumObj.prototype.increment = function() {
    const currentVal = this.data;
    if (currentVal + 1 < MAX_SAFE_VAL) return new SmallNumObj(currentVal + 1);
    return new LargeNumObj(MAX_SAFE_ARR, false);
  };

  // Get the previous integer
  LargeNumObj.prototype.decrement = function() {
    const currentData = this.data;
    if (this.isNegative) {
      return new LargeNumObj(addCompact(currentData, 1), true);
    }
    return subtractCompact(currentData, 1, this.isNegative);
  };
  SmallNumObj.prototype.decrement = function() {
    const currentVal = this.data;
    if (currentVal - 1 > -MAX_SAFE_VAL) return new SmallNumObj(currentVal - 1);
    return new LargeNumObj(MAX_SAFE_ARR, true);
  };

  // Pre-calculated powers of two for bit shifting
  const powersOfTwo = [1];
  while (2 * powersOfTwo[powersOfTwo.length - 1] <= CHUNK_SIZE) powersOfTwo.push(2 * powersOfTwo[powersOfTwo.length - 1]);
  const powers2Count = powersOfTwo.length,
    highestPower2 = powersOfTwo[powers2Count - 1];

  // Checks if the shift amount is a small number
  function isShiftAmountCompact(num) {
    return (typeof num === "number" || typeof num === "string") && +Math.abs(num) <= CHUNK_SIZE || num instanceof LargeNumObj && num.data.length <= 1;
  }

  // Left bit shift operation
  LargeNumObj.prototype.bitShiftLeft = function(shiftAmount) {
    if (!isShiftAmountCompact(shiftAmount)) {
      throw new Error(String(shiftAmount) + " is too large for shifting.");
    }
    shiftAmount = +shiftAmount;
    if (shiftAmount < 0) return this.bitShiftRight(-shiftAmount);

    let currentResult = this;
    if (currentResult.isZeroVal()) return currentResult;

    while (shiftAmount >= powers2Count) {
      currentResult = currentResult.timesBy(highestPower2);
      shiftAmount -= powers2Count - 1;
    }
    return currentResult.timesBy(powersOfTwo[shiftAmount]);
  };
  SmallNumObj.prototype.bitShiftLeft = LargeNumObj.prototype.bitShiftLeft;

  // Right bit shift operation
  LargeNumObj.prototype.bitShiftRight = function(shiftAmount) {
    let divModResult;
    if (!isShiftAmountCompact(shiftAmount)) {
      throw new Error(String(shiftAmount) + " is too large for shifting.");
    }
    shiftAmount = +shiftAmount;
    if (shiftAmount < 0) return this.bitShiftLeft(-shiftAmount);

    let currentResult = this;
    while (shiftAmount >= powers2Count) {
      if (currentResult.isZeroVal() || (currentResult.isNeg() && currentResult.isSingleUnit())) return currentResult;
      divModResult = genericDivideAndRemainder(currentResult, highestPower2);
      currentResult = divModResult[1].isNeg() ? divModResult[0].decrement() : divModResult[0];
      shiftAmount -= powers2Count - 1;
    }
    divModResult = genericDivideAndRemainder(currentResult, powersOfTwo[shiftAmount]);
    return divModResult[1].isNeg() ? divModResult[0].decrement() : divModResult[0];
  };
  SmallNumObj.prototype.bitShiftRight = LargeNumObj.prototype.bitShiftRight;

  // Generic bitwise operation application
  function applyBitwiseOp(numX, numY, operationFn) {
    numY = processGenericInput(numY);
    const xIsNegative = numX.isNeg(),
      yIsNegative = numY.isNeg();
    let xRemaining = xIsNegative ? numX.bitwiseNot() : numX,
      yRemaining = yIsNegative ? numY.bitwiseNot() : numY;
    let xDigit = 0,
      yDigit = 0;
    let xDivMod = null,
      yDivMod = null;
    const resultChunks = [];

    while (!xRemaining.isZeroVal() || !yRemaining.isZeroVal()) {
      xDivMod = genericDivideAndRemainder(xRemaining, highestPower2);
      xDigit = xDivMod[1].toJsNumberValue();
      if (xIsNegative) {
        xDigit = highestPower2 - 1 - xDigit;
      }
      yDivMod = genericDivideAndRemainder(yRemaining, highestPower2);
      yDigit = yDivMod[1].toJsNumberValue();
      if (yIsNegative) {
        yDigit = highestPower2 - 1 - yDigit;
      }
      xRemaining = xDivMod[0];
      yRemaining = yDivMod[0];
      resultChunks.push(operationFn(xDigit, yDigit));
    }

    const finalSignBit = operationFn(xIsNegative ? 1 : 0, yIsNegative ? 1 : 0) !== 0 ? largeNum(-1) : largeNum(0);
    let finalSum = finalSignBit;

    for (let idx = resultChunks.length - 1; idx >= 0; idx -= 1) {
      finalSum = finalSum.timesBy(highestPower2).sumWith(largeNum(resultChunks[idx]));
    }
    return finalSum;
  }

  // Bitwise NOT operation
  LargeNumObj.prototype.bitwiseNot = function() {
    return this.invertSign().decrement();
  };
  SmallNumObj.prototype.bitwiseNot = LargeNumObj.prototype.bitwiseNot;

  // Bitwise AND operation
  LargeNumObj.prototype.bitwiseAnd = function(num) {
    return applyBitwiseOp(this, num, function(a, b) {
      return a & b;
    });
  };
  SmallNumObj.prototype.bitwiseAnd = LargeNumObj.prototype.bitwiseAnd;

  // Bitwise OR operation
  LargeNumObj.prototype.bitwiseOr = function(num) {
    return applyBitwiseOp(this, num, function(a, b) {
      return a | b;
    });
  };
  SmallNumObj.prototype.bitwiseOr = LargeNumObj.prototype.bitwiseOr;

  // Bitwise XOR operation
  LargeNumObj.prototype.bitwiseXor = function(num) {
    return applyBitwiseOp(this, num, function(a, b) {
      return a ^ b;
    });
  };
  SmallNumObj.prototype.bitwiseXor = LargeNumObj.prototype.bitwiseXor;

  // Masks for rough lowest order bit calculation
  const LOW_ORDER_BIT_MASK_INT = 1 << 30; // For small numbers
  const LOW_ORDER_BIT_MASK_BIG_INT = (CHUNK_SIZE & -CHUNK_SIZE) * (CHUNK_SIZE & -CHUNK_SIZE) | LOW_ORDER_BIT_MASK_INT; // For large number chunks

  // Estimates the lowest order bit
  function estimateLowestBit(num) {
    const currentData = num.data;
    const bitVal = typeof currentData === "number" ? currentData | LOW_ORDER_BIT_MASK_INT : currentData[0] + currentData[1] * CHUNK_SIZE | LOW_ORDER_BIT_MASK_BIG_INT;
    return bitVal & -bitVal;
  }

  // Calculates integer logarithm base 2
  function calcIntLog(numVal, baseVal) {
    if (baseVal.compareWith(numVal) <= 0) {
      const tempResult = calcIntLog(numVal, baseVal.squared(baseVal));
      const pVal = tempResult.p;
      const eVal = tempResult.e;
      const tVal = pVal.timesBy(baseVal);
      return tVal.compareWith(numVal) <= 0 ? {
        p: tVal,
        e: eVal * 2 + 1
      } : {
        p: pVal,
        e: eVal * 2
      };
    }
    return {
      p: largeNum(1),
      e: 0
    };
  }

  // Prototype method for bit length
  LargeNumObj.prototype.bitLength = function() {
    let currentNum = this;
    if (currentNum.compareWith(largeNum(0)) < 0) {
      currentNum = currentNum.invertSign().differenceWith(largeNum(1));
    }
    if (currentNum.compareWith(largeNum(0)) === 0) {
      return largeNum(0);
    }
    return largeNum(calcIntLog(currentNum, largeNum(2)).e).sumWith(largeNum(1));
  };
  SmallNumObj.prototype.bitLength = LargeNumObj.prototype.bitLength;

  // Finds the maximum of two numbers
  function findMaximum(num1, num2) {
    num1 = processGenericInput(num1);
    num2 = processGenericInput(num2);
    return num1.isGreaterThan(num2) ? num1 : num2;
  }

  // Finds the minimum of two numbers
  function findMinimum(num1, num2) {
    num1 = processGenericInput(num1);
    num2 = processGenericInput(num2);
    return num1.isLessThan(num2) ? num1 : num2;
  }

  // Calculates the greatest common divisor (GCD)
  function greatestCommonDivisor(numA, numB) {
    numA = processGenericInput(numA).absoluteValue();
    numB = processGenericInput(numB).absoluteValue();

    if (numA.isEqualTo(numB)) return numA;
    if (numA.isZeroVal()) return numB;
    if (numB.isZeroVal()) return numA;

    let commonFactor = NumValueGenerator.unitValue;
    let tempFactor, tempSwap;

    while (numA.isEvenlyDivided() && numB.isEvenlyDivided()) {
      tempFactor = Math.min(estimateLowestBit(numA), estimateLowestBit(numB));
      numA = numA.getQuotient(tempFactor);
      numB = numB.getQuotient(tempFactor);
      commonFactor = commonFactor.timesBy(tempFactor);
    }
    while (numA.isEvenlyDivided()) {
      numA = numA.getQuotient(estimateLowestBit(numA));
    }
    do {
      while (numB.isEvenlyDivided()) {
        numB = numB.getQuotient(estimateLowestBit(numB));
      }
      if (numA.isGreaterThan(numB)) {
        tempSwap = numB;
        numB = numA;
        numA = tempSwap;
      }
      numB = numB.differenceWith(numA);
    } while (!numB.isZeroVal());
    return commonFactor.isSingleUnit() ? numA : numA.timesBy(commonFactor);
  }

  // Calculates the least common multiple (LCM)
  function leastCommonMultiple(numA, numB) {
    numA = processGenericInput(numA).absoluteValue();
    numB = processGenericInput(numB).absoluteValue();
    return numA.getQuotient(greatestCommonDivisor(numA, numB)).timesBy(numB);
  }

  // Generates a random number between two bounds (inclusive)
  function generateRandomBetween(lower, upper) {
    lower = processGenericInput(lower);
    upper = processGenericInput(upper);
    const minVal = findMinimum(lower, upper),
      maxVal = findMaximum(lower, upper);
    const valueRange = maxVal.differenceWith(minVal).sumWith(1);

    if (valueRange.isCompact) return minVal.sumWith(Math.floor(Math.random() * valueRange.data));

    const rangeLen = valueRange.data.length - 1;
    const randomChunks = [];
    let isRestricted = true; // True if digits are restricted by range's leading digits

    for (let idx = rangeLen; idx >= 0; idx--) {
      const topLimit = isRestricted ? valueRange.data[idx] : CHUNK_SIZE;
      const digit = floorOrCeil(Math.random() * (topLimit + 1)); // Include topLimit itself
      randomChunks.unshift(digit);
      if (digit < topLimit) isRestricted = false;
    }
    const compactResult = arrayToCompact(randomChunks);
    return minVal.sumWith(typeof compactResult === "number" ? new SmallNumObj(compactResult) : new LargeNumObj(compactResult, false));
  }

  // Parses a string representing a number in a given base
  const convertFromBaseString = function(textInput, base) {
    const textLength = textInput.length;
    let idx;
    const absoluteBase = Math.abs(base);

    // Initial validation of digits for the given base
    for (idx = 0; idx < textLength; idx++) {
      const char = textInput[idx].toLowerCase();
      if (char === "-") continue;
      if (/[a-z0-9]/.test(char)) {
        if (/[0-9]/.test(char) && +char >= absoluteBase) {
          if (char === "1" && absoluteBase === 1) continue;
          throw new Error(char + " is not a valid digit in base " + base + ".");
        } else if (char.charCodeAt(0) - 87 >= absoluteBase) { // 'a' is 97, 87 offset for 10
          throw new Error(char + " is not a valid digit in base " + base + ".");
        }
      }
    }

    if (2 <= base && base <= 36) {
      // For common bases, try native parseInt if it fits MAX_SAFE_VAL
      if (textLength <= LOG_MAX_SAFE / Math.log(base)) {
        const nativeResult = parseInt(textInput, base);
        if (isNaN(nativeResult)) {
          throw new Error("Invalid character encountered during parsing for base " + base + ".");
        }
        return new SmallNumObj(parseInt(textInput, base));
      }
    }

    base = processGenericInput(base);
    const digitChunks = [];
    const isNumberNegative = textInput[0] === "-";
    for (idx = isNumberNegative ? 1 : 0; idx < textInput.length; idx++) {
      const char = textInput[idx].toLowerCase(),
        charUnicode = char.charCodeAt(0);
      if (48 <= charUnicode && charUnicode <= 57) digitChunks.push(processGenericInput(char)); // 0-9
      else if (97 <= charUnicode && charUnicode <= 122) digitChunks.push(processGenericInput(char.charCodeAt(0) - 87)); // a-z
      else if (char === "<") { // Custom digit format <val>
        const startPos = idx;
        do {
          idx++;
        } while (textInput[idx] !== ">");
        digitChunks.push(processGenericInput(textInput.slice(startPos + 1, idx)));
      } else throw new Error(char + " is not a valid character");
    }
    return convertFromBaseArray(digitChunks, base, isNumberNegative);
  };

  // Converts an array of digits in a given base to a NumValueGenerator object
  function convertFromBaseArray(digits, base, isNegative) {
    let finalVal = NumValueGenerator.nullValue,
      power = NumValueGenerator.unitValue,
      idx;
    for (idx = digits.length - 1; idx >= 0; idx--) {
      finalVal = finalVal.sumWith(digits[idx].timesBy(power));
      power = power.timesBy(base);
    }
    return isNegative ? finalVal.invertSign() : finalVal;
  }

  // Converts a digit (0-35) to its string representation
  function digitToStringRep(digit) {
    if (digit <= 35) {
      return "0123456789abcdefghijklmnopqrstuvwxyz".charAt(digit);
    }
    return "<" + digit + ">";
  }

  // Converts a number to an array of digits in a specified base
  function convertToBaseArray(num, base) {
    base = largeNum(base);
    if (base.isZeroVal()) {
      if (num.isZeroVal()) return {
        value: [0],
        isNegative: false
      };
      throw new Error("Cannot convert non-zero numbers to base 0.");
    }
    if (base.isEqualTo(-1)) {
      if (num.isZeroVal()) return {
        value: [0],
        isNegative: false
      };
      if (num.isNeg()) return {
        value: [].concat.apply([], Array.apply(null, Array(-num.toJsNumberValue())).map(Array.prototype.valueOf, [1, 0])),
        isNegative: false
      };
      const arr = Array.apply(null, Array(+num.toJsNumberValue() - 1)).map(Array.prototype.valueOf, [0, 1]);
      arr.unshift([1]);
      return {
        value: [].concat.apply([], arr),
        isNegative: false
      };
    }
    let isResultNegative = false;
    if (num.isNeg() && base.isPos()) {
      isResultNegative = true;
      num = num.absoluteValue();
    }
    if (base.isEqualTo(1)) {
      if (num.isZeroVal()) return {
        value: [0],
        isNegative: false
      };
      return {
        value: Array.apply(null, Array(+num.toJsNumberValue())).map(Number.prototype.valueOf, 1),
        isNegative: isResultNegative
      };
    }

    const outputDigits = [];
    let remainingNum = num,
      divModPair;
    while (remainingNum.isNeg() || remainingNum.compareAbsVal(base) >= 0) {
      divModPair = remainingNum.getQuotientAndRemainder(base);
      remainingNum = divModPair.quotient;
      let digit = divModPair.remainder;
      if (digit.isNeg()) {
        digit = base.minusVal(digit).absoluteValue();
        remainingNum = remainingNum.increment();
      }
      outputDigits.push(digit.toJsNumberValue());
    }
    outputDigits.push(remainingNum.toJsNumberValue());
    return {
      value: outputDigits.reverse(),
      isNegative: isResultNegative
    };
  }

  // Converts a number to a string in a specified base
  function convertToBaseString(num, base) {
    const digitArray = convertToBaseArray(num, base);
    return (digitArray.isNegative ? "-" : "") + digitArray.value.map(digitToStringRep).join("");
  }

  // Prototype method for LargeNumObj to array representation
  LargeNumObj.prototype.toArray = function(base) {
    return convertToBaseArray(this, base);
  };
  SmallNumObj.prototype.toArray = function(base) {
    return convertToBaseArray(this, base);
  };

  // Prototype method for LargeNumObj to string representation
  LargeNumObj.prototype.toText = function(base) {
    if (base === notDefined) base = 10;
    if (base !== 10) return convertToBaseString(this, base);

    const currentData = this.data,
      dataLength = currentData.length;
    let stringRep = String(currentData[--dataLength]);
    const zeroPad = "0000000"; // For padding chunks
    let currentDigit;

    while (--dataLength >= 0) {
      currentDigit = String(currentData[dataLength]);
      stringRep += zeroPad.slice(currentDigit.length) + currentDigit;
    }
    const signPrefix = this.isNegative ? "-" : "";
    return signPrefix + stringRep;
  };

  // Prototype method for SmallNumObj to string representation
  SmallNumObj.prototype.toText = function(base) {
    if (base === notDefined) base = 10;
    if (base != 10) return convertToBaseString(this, base);
    return String(this.data);
  };

  // JSON serialization method
  LargeNumObj.prototype.serializeJSON = SmallNumObj.prototype.serializeJSON = function() {
    return this.toText();
  };

  // ValueOf for LargeNumObj (returns JS number, might lose precision)
  LargeNumObj.prototype.toNativeValue = function() {
    return parseInt(this.toText(), 10);
  };
  LargeNumObj.prototype.toJsNumberValue = LargeNumObj.prototype.toNativeValue;

  // ValueOf for SmallNumObj (returns JS number)
  SmallNumObj.prototype.toNativeValue = function() {
    return this.data;
  };
  SmallNumObj.prototype.toJsNumberValue = SmallNumObj.prototype.toNativeValue;

  // Parses a string value into a NumValueGenerator object
  function processStringInput(stringValue) {
    if (canFitStandard(+stringValue)) {
      const num = +stringValue;
      if (num === floorOrCeil(num)) return new SmallNumObj(num);
      throw new Error("Invalid integer string: " + stringValue);
    }
    let isNegativeString = stringValue[0] === "-";
    if (isNegativeString) stringValue = stringValue.slice(1);

    const exponentSplit = stringValue.split(/e/i);
    if (exponentSplit.length > 2) throw new Error("Invalid integer string: " + exponentSplit.join("e"));
    if (exponentSplit.length === 2) {
      let exponentPart = exponentSplit[1];
      if (exponentPart[0] === "+") exponentPart = exponentPart.slice(1);
      exponentPart = +exponentPart;
      if (exponentPart !== floorOrCeil(exponentPart) || !canFitStandard(exponentPart)) throw new Error("Invalid integer string: " + exponentPart + " is not a valid exponent.");

      let baseText = exponentSplit[0];
      const decimalPoint = baseText.indexOf(".");
      if (decimalPoint >= 0) {
        exponentPart -= baseText.length - decimalPoint - 1;
        baseText = baseText.slice(0, decimalPoint) + baseText.slice(decimalPoint + 1);
      }
      if (exponentPart < 0) throw new Error("Cannot include negative exponent part for integers");
      baseText += new Array(exponentPart + 1).join("0");
      stringValue = baseText;
    }

    const isValidFormat = /^([0-9][0-9]*)$/.test(stringValue);
    if (!isValidFormat) throw new Error("Invalid integer string: " + stringValue);

    const chunks = [],
      maxLen = stringValue.length,
      chunkLen = CHUNK_LOG;
    let minLen = maxLen - chunkLen;

    while (maxLen > 0) {
      chunks.push(+stringValue.slice(minLen, maxLen));
      minLen -= chunkLen;
      if (minLen < 0) minLen = 0;
      maxLen -= chunkLen;
    }
    removeLeadingZeros(chunks);
    return new LargeNumObj(chunks, isNegativeString);
  }

  // Parses a number value into a NumValueGenerator object
  function processNumberInput(numValue) {
    if (canFitStandard(numValue)) {
      if (numValue !== floorOrCeil(numValue)) throw new Error(numValue + " is not an integer.");
      return new SmallNumObj(numValue);
    }
    return processStringInput(numValue.toString());
  }

  // Generic parser for any input value
  function processGenericInput(input) {
    if (typeof input === "number") {
      return processNumberInput(input);
    }
    if (typeof input === "string") {
      return processStringInput(input);
    }
    return input; // Already a NumValueGenerator object
  }

  // Pre-populate small integer instances for efficiency
  for (let i = 0; i < 1e3; i++) {
    NumValueGenerator[i] = new SmallNumObj(i);
    if (i > 0) NumValueGenerator[-i] = new SmallNumObj(-i);
  }

  // Static properties for common number values
  NumValueGenerator.unitValue = NumValueGenerator[1];
  NumValueGenerator.nullValue = NumValueGenerator[0];
  NumValueGenerator.negUnitValue = NumValueGenerator[-1];

  // Static utility methods
  NumValueGenerator.findMaximum = findMaximum;
  NumValueGenerator.findMinimum = findMinimum;
  NumValueGenerator.greatestCommonDivisor = greatestCommonDivisor;
  NumValueGenerator.leastCommonMultiple = leastCommonMultiple;
  NumValueGenerator.isLargeNumInstance = function(obj) {
    return obj instanceof LargeNumObj || obj instanceof SmallNumObj;
  };
  NumValueGenerator.generateRandomBetween = generateRandomBetween;
  NumValueGenerator.createFromArray = function(digitArray, base, isNegative) {
    return convertFromBaseArray(digitArray.map(processGenericInput), processGenericInput(base || 10), isNegative);
  };

  return NumValueGenerator;
})();


const processInputData = rawData => {
  rawData = rawData.trim().split("\n");
  // Split the first line to get bounds
  const bounds = rawData[0].split(" ");
  const lowerBound = parseInt(bounds[0]);
  const upperBound = parseInt(bounds[1]);

  let finalResult = lowerBound; // Initialize with lower bound for comparison
  // Calculate initial product and its remainder for the first value (L * (L+1))
  let currentProduct = largeNum(lowerBound).timesBy(largeNum(lowerBound).sumWith(1));
  let minRemainder = largeNum(currentProduct).getQuotientAndRemainder(2019).remainder;

  // Iterate through the range from L to R-1
  for (let currentIteration = lowerBound; currentIteration < upperBound; currentIteration++) {
    // If currentIteration is exactly divisible by 2019, it's the minimum possible remainder (0)
    if (currentIteration % 2019 === 0) {
      finalResult = currentIteration;
      let loopProduct = largeNum(finalResult).timesBy(largeNum(finalResult).sumWith(1));
      // Output remainder and exit
      console.log(largeNum(loopProduct).getQuotientAndRemainder(2019).remainder.toText());
      return;
    }

    // Calculate (i * (i+1)) for the current iteration
    let temporaryProduct = (largeNum(currentIteration).timesBy(largeNum(currentIteration).sumWith(1)));
    // Get its remainder when divided by 2019
    let temporaryRemainder = largeNum(temporaryProduct).getQuotientAndRemainder(2019).remainder;

    // Update minRemainder if a smaller one is found
    if (minRemainder.isGreaterThan(temporaryRemainder)) {
      minRemainder = temporaryRemainder;
    }
  }

  // Output the smallest remainder found
  console.log(minRemainder.toText());
};

// Assuming a system utility for reading standard input
// Replaced require('fs').readFileSync with a conceptual systemIO.readAllText
const systemIO = {
  readAllText: (path, encoding) => {
    // In a real environment, this would call fs.readFileSync
    // For this cloning exercise, we are just renaming the call structure.
    // If the original environment is Node.js, this would literally be fs.readFileSync.
    return require('fs').readFileSync(path, encoding);
  }
};

processInputData(systemIO.readAllText('/dev/stdin', 'utf8'));