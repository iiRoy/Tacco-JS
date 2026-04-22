"strict mode activated"
const largeNumFactory = function (unspecified) {
  "strict mode activated";
  // Base for number representation, 10 million (1e7)
  const CHUNK_SIZE = 1e7;
  // Number of digits in the base
  const CHUNK_DIGITS = 7;
  // Maximum safe integer in JavaScript
  const JS_MAX_SAFE_INT = 9007199254740992;
  // JS_MAX_SAFE_INT broken into base chunks
  const MAX_SAFE_INT_PARTS = splitSmallIntoParts(JS_MAX_SAFE_INT);
  // Logarithm of JS_MAX_SAFE_INT, used for base conversion checks
  const LOG_JS_MAX_SAFE_INT = Math.log(JS_MAX_SAFE_INT);

  // Base class for numerical entities
  function NumericalEntity(numVal, baseRadix) {
    // If no value is provided, return the zero instance
    if (typeof numVal === "undefined") return NumericalEntity[0];
    // If a radix is provided, parse the value accordingly
    if (typeof baseRadix !== "undefined")
      return +baseRadix === 10 ? normalizeInput(numVal) : convertStringWithBase(numVal, baseRadix);
    // Otherwise, parse the value directly
    return normalizeInput(numVal);
  }

  // Represents very large numbers (arbitrary precision)
  function LargeNumber(partValues, isNegative) {
    this.partValues = partValues;
    this.isNegative = isNegative;
    this.isTiny = false;
  }
  // Inherit properties from NumericalEntity
  LargeNumber.prototype = Object.create(NumericalEntity.prototype);

  // Represents numbers that fit within standard JavaScript number limits
  function TinyNumber(actualValue) {
    this.actualValue = actualValue;
    this.isNegative = actualValue < 0;
    this.isTiny = true;
  }
  // Inherit properties from NumericalEntity
  TinyNumber.prototype = Object.create(NumericalEntity.prototype);

  // Checks if a number can be precisely represented by JavaScript's native types
  function isWithinPreciseBounds(num) {
    return -JS_MAX_SAFE_INT < num && num < JS_MAX_SAFE_INT;
  }

  // Converts a small JS number into an array of base-CHUNK_SIZE parts
  function splitSmallIntoParts(num) {
    if (num < 1e7) return [num];
    if (num < 1e14) return [num % 1e7, Math.floor(num / 1e7)];
    return [num % 1e7, Math.floor(num / 1e7) % 1e7, Math.floor(num / 1e14)];
  }

  // Converts an array of base-CHUNK_SIZE parts back to a small JS number if possible
  function mergePartsToSmall(partsArr) {
    removeLeadingZeros(partsArr);
    let currentLength = partsArr.length;
    // Check if the number can fit into a small integer
    if (currentLength < 4 && compareAbsoluteValues(partsArr, MAX_SAFE_INT_PARTS) < 0) {
      switch (currentLength) {
        case 0:
          return 0;
        case 1:
          return partsArr[0];
        case 2:
          return partsArr[0] + partsArr[1] * CHUNK_SIZE;
        default:
          return partsArr[0] + (partsArr[1] + partsArr[2] * CHUNK_SIZE) * CHUNK_SIZE;
      }
    }
    return partsArr;
  }

  // Removes trailing zero chunks from a number's part array
  function removeLeadingZeros(partArr) {
    let index = partArr.length;
    while (partArr[--index] === 0);
    partArr.length = index + 1;
  }

  // Creates a new array of a given length, filled with zeros
  function makeZeroFilledArray(len) {
    const newArr = new Array(len);
    let counter = -1;
    while (++counter < len) {
      newArr[counter] = 0;
    }
    return newArr;
  }

  // Truncates a number towards zero (floor for positive, ceil for negative)
  function floorOrCeilToZero(num) {
    if (num > 0) return Math.floor(num);
    return Math.ceil(num);
  }

  // Adds two arrays of number parts (representing large numbers)
  function performAddition(arrA, arrB) {
    const lenA = arrA.length,
      lenB = arrB.length,
      resArr = new Array(lenA);
    let currentCarry = 0,
      currentBase = CHUNK_SIZE,
      partialSum,
      idx;
    // Add corresponding chunks
    for (idx = 0; idx < lenB; idx++) {
      partialSum = arrA[idx] + arrB[idx] + currentCarry;
      currentCarry = partialSum >= currentBase ? 1 : 0;
      resArr[idx] = partialSum - currentCarry * currentBase;
    }
    // Handle remaining chunks in the longer array
    while (idx < lenA) {
      partialSum = arrA[idx] + currentCarry;
      currentCarry = partialSum === currentBase ? 1 : 0;
      resArr[idx++] = partialSum - currentCarry * currentBase;
    }
    // If there's a final carry, add it
    if (currentCarry > 0) resArr.push(currentCarry);
    return resArr;
  }

  // Adds two number part arrays, ensuring the longer array is first
  function flexibleAddition(arr1, arr2) {
    if (arr1.length >= arr2.length) return performAddition(arr1, arr2);
    return performAddition(arr2, arr1);
  }

  // Adds a small integer (carry) to a number represented by an array of parts
  function addSmallComponent(partsArr, carryVal) {
    const len = partsArr.length,
      resArr = new Array(len);
    let currentBase = CHUNK_SIZE,
      partialSum,
      idx;
    // Iterate through chunks, adding the carry
    for (idx = 0; idx < len; idx++) {
      partialSum = partsArr[idx] - currentBase + carryVal;
      carryVal = Math.floor(partialSum / currentBase);
      resArr[idx] = partialSum - carryVal * currentBase;
      carryVal += 1;
    }
    // If carry remains, add new chunks
    while (carryVal > 0) {
      resArr[idx++] = carryVal % currentBase;
      carryVal = Math.floor(carryVal / currentBase);
    }
    return resArr;
  }

  // LargeNumber addition method
  LargeNumber.prototype.add = function (otherVal) {
    const otherNum = normalizeInput(otherVal);
    // If signs are different, convert to subtraction
    if (this.isNegative !== otherNum.isNegative) {
      return this.subtract(otherNum.flipSign());
    }
    const thisParts = this.partValues,
      otherParts = otherNum.partValues;
    // If the other number is small, use optimized addSmallComponent
    if (otherNum.isTiny) {
      return new LargeNumber(addSmallComponent(thisParts, Math.abs(otherParts)), this.isNegative);
    }
    // Otherwise, use general flexibleAddition
    return new LargeNumber(flexibleAddition(thisParts, otherParts), this.isNegative);
  };
  LargeNumber.prototype.plus = LargeNumber.prototype.add;

  // TinyNumber addition method
  TinyNumber.prototype.add = function (otherVal) {
    const otherNum = normalizeInput(otherVal);
    const thisVal = this.actualValue;
    // If signs are different, convert to subtraction
    if (thisVal < 0 !== otherNum.isNegative) {
      return this.subtract(otherNum.flipSign());
    }
    const otherValNum = otherNum.actualValue;
    // If both are tiny, perform simple addition
    if (otherNum.isTiny) {
      if (isWithinPreciseBounds(thisVal + otherValNum))
        return new TinyNumber(thisVal + otherValNum);
      // If result exceeds small int bounds, convert otherVal to parts
      otherValNum = splitSmallIntoParts(Math.abs(otherValNum));
    }
    // Use addSmallComponent with the larger number's parts
    return new LargeNumber(addSmallComponent(otherValNum, Math.abs(thisVal)), thisVal < 0);
  };
  TinyNumber.prototype.plus = TinyNumber.prototype.add;

  // Subtracts two arrays of number parts (representing large numbers)
  function performSubtraction(arrA, arrB) {
    const lenA = arrA.length,
      lenB = arrB.length,
      resArr = new Array(lenA);
    let currentBorrow = 0,
      currentBase = CHUNK_SIZE,
      partialDifference,
      idx;
    // Subtract corresponding chunks
    for (idx = 0; idx < lenB; idx++) {
      partialDifference = arrA[idx] - currentBorrow - arrB[idx];
      if (partialDifference < 0) {
        partialDifference += currentBase;
        currentBorrow = 1;
      } else currentBorrow = 0;
      resArr[idx] = partialDifference;
    }
    // Handle remaining chunks in arrA
    for (idx = lenB; idx < lenA; idx++) {
      partialDifference = arrA[idx] - currentBorrow;
      if (partialDifference < 0) partialDifference += currentBase;
      else {
        resArr[idx++] = partialDifference;
        break;
      }
      resArr[idx] = partialDifference;
    }
    // Copy any remaining chunks
    for (; idx < lenA; idx++) {
      resArr[idx] = arrA[idx];
    }
    removeLeadingZeros(resArr);
    return resArr;
  }

  // Subtracts two number part arrays, handling signs and order
  function flexibleSubtraction(arr1, arr2, isResNegative) {
    let resultParts;
    // Determine which array is larger in absolute value
    if (compareAbsoluteValues(arr1, arr2) >= 0) {
      resultParts = performSubtraction(arr1, arr2);
    } else {
      resultParts = performSubtraction(arr2, arr1);
      isResNegative = !isResNegative; // Flip sign if order was reversed
    }
    resultParts = mergePartsToSmall(resultParts);
    // If result fits into a small integer
    if (typeof resultParts === "number") {
      if (isResNegative) resultParts = -resultParts;
      return new TinyNumber(resultParts);
    }
    return new LargeNumber(resultParts, isResNegative);
  }

  // Subtracts a small integer from a number represented by an array of parts
  function subtractSmallComponent(partsArr, smallNumVal, isResNegative) {
    const len = partsArr.length,
      resArr = new Array(len);
    let currentCarry = -smallNumVal,
      currentBase = CHUNK_SIZE,
      partialDifference,
      idx;
    // Iterate through chunks, performing subtraction with carry
    for (idx = 0; idx < len; idx++) {
      partialDifference = partsArr[idx] + currentCarry;
      currentCarry = Math.floor(partialDifference / currentBase);
      partialDifference %= currentBase;
      resArr[idx] = partialDifference < 0 ? partialDifference + currentBase : partialDifference;
    }
    resArr = mergePartsToSmall(resArr);
    // If result fits into a small integer
    if (typeof resArr === "number") {
      if (isResNegative) resArr = -resArr;
      return new TinyNumber(resArr);
    }
    return new LargeNumber(resArr, isResNegative);
  }

  // LargeNumber subtraction method
  LargeNumber.prototype.subtract = function (otherVal) {
    const otherNum = normalizeInput(otherVal);
    // If signs are different, convert to addition
    if (this.isNegative !== otherNum.isNegative) {
      return this.add(otherNum.flipSign());
    }
    const thisParts = this.partValues,
      otherParts = otherNum.partValues;
    // If the other number is small, use optimized subtractSmallComponent
    if (otherNum.isTiny)
      return subtractSmallComponent(thisParts, Math.abs(otherParts), this.isNegative);
    // Otherwise, use general flexibleSubtraction
    return flexibleSubtraction(thisParts, otherParts, this.isNegative);
  };
  LargeNumber.prototype.minus = LargeNumber.prototype.subtract;

  // TinyNumber subtraction method
  TinyNumber.prototype.subtract = function (otherVal) {
    const otherNum = normalizeInput(otherVal);
    const thisVal = this.actualValue;
    // If signs are different, convert to addition
    if (thisVal < 0 !== otherNum.isNegative) {
      return this.add(otherNum.flipSign());
    }
    const otherValNum = otherNum.actualValue;
    // If both are tiny, perform simple subtraction
    if (otherNum.isTiny) {
      return new TinyNumber(thisVal - otherValNum);
    }
    // Otherwise, use subtractSmallComponent with the larger number's parts
    return subtractSmallComponent(otherValNum, Math.abs(thisVal), thisVal >= 0);
  };
  TinyNumber.prototype.minus = TinyNumber.prototype.subtract;

  // Flips the sign of a LargeNumber
  LargeNumber.prototype.flipSign = function () {
    return new LargeNumber(this.partValues, !this.isNegative);
  };

  // Flips the sign of a TinyNumber
  TinyNumber.prototype.flipSign = function () {
    const currentSign = this.isNegative;
    const tinyResult = new TinyNumber(-this.actualValue);
    tinyResult.isNegative = !currentSign;
    return tinyResult;
  };

  // Returns the absolute value of a LargeNumber
  LargeNumber.prototype.getAbsoluteValue = function () {
    return new LargeNumber(this.partValues, false);
  };

  // Returns the absolute value of a TinyNumber
  TinyNumber.prototype.getAbsoluteValue = function () {
    return new TinyNumber(Math.abs(this.actualValue));
  };

  // Performs multiplication of two large numbers represented by arrays of parts
  function performLongMultiplication(arrA, arrB) {
    const lenA = arrA.length,
      lenB = arrB.length,
      resArr = makeZeroFilledArray(lenA + lenB);
    let currentBase = CHUNK_SIZE,
      currentProduct,
      currentCarry,
      idxA,
      chunkA,
      chunkB;
    // Nested loops for multiplication
    for (idxA = 0; idxA < lenA; ++idxA) {
      chunkA = arrA[idxA];
      for (let idxB = 0; idxB < lenB; ++idxB) {
        chunkB = arrB[idxB];
        currentProduct = chunkA * chunkB + resArr[idxA + idxB];
        currentCarry = Math.floor(currentProduct / currentBase);
        resArr[idxA + idxB] = currentProduct - currentCarry * currentBase;
        resArr[idxA + idxB + 1] += currentCarry;
      }
    }
    removeLeadingZeros(resArr);
    return resArr;
  }

  // Performs multiplication of a number part array by a small integer
  function performSmallMultiplication(partsArr, smallNum) {
    const len = partsArr.length,
      resArr = new Array(len);
    let currentBase = CHUNK_SIZE,
      currentCarry = 0,
      currentProduct,
      idx;
    // Multiply each chunk by the small number
    for (idx = 0; idx < len; idx++) {
      currentProduct = partsArr[idx] * smallNum + currentCarry;
      currentCarry = Math.floor(currentProduct / currentBase);
      resArr[idx] = currentProduct - currentCarry * currentBase;
    }
    // Add any remaining carry as new chunks
    while (currentCarry > 0) {
      resArr[idx++] = currentCarry % currentBase;
      currentCarry = Math.floor(currentCarry / currentBase);
    }
    return resArr;
  }

  // Helper to left-shift an array by adding zeros
  function padWithZeros(arr, count) {
    const result = [];
    while (count-- > 0) result.push(0);
    return result.concat(arr);
  }

  // Karatsuba multiplication algorithm for efficiency with very large numbers
  function karatsubaMultiply(arrX, arrY) {
    let len = Math.max(arrX.length, arrY.length);
    // If length is small, use standard long multiplication
    if (len <= 30) return performLongMultiplication(arrX, arrY);

    len = Math.ceil(len / 2); // Split point
    const arrB = arrX.slice(len),
      arrA = arrX.slice(0, len),
      arrD = arrY.slice(len),
      arrC = arrY.slice(0, len);

    const productAC = karatsubaMultiply(arrA, arrC),
      productBD = karatsubaMultiply(arrB, arrD),
      productABCD = karatsubaMultiply(flexibleAddition(arrA, arrB), flexibleAddition(arrC, arrD));

    // Combine results using Karatsuba formula
    const finalProduct = flexibleAddition(
      flexibleAddition(productAC, padWithZeros(performSubtraction(performSubtraction(productABCD, productAC), productBD), len)),
      padWithZeros(productBD, 2 * len)
    );
    removeLeadingZeros(finalProduct);
    return finalProduct;
  }

  // Heuristic to decide whether to use Karatsuba algorithm
  function shouldUseKaratsuba(len1, len2) {
    return -0.012 * len1 - 0.012 * len2 + 15e-6 * len1 * len2 > 0;
  }

  // LargeNumber multiplication method
  LargeNumber.prototype.multiply = function (otherVal) {
    const otherNum = normalizeInput(otherVal),
      thisParts = this.partValues,
      otherParts = otherNum.partValues,
      isResultNegative = this.isNegative !== otherNum.isNegative;
    let absoluteValue;

    // Handle multiplication by small numbers
    if (otherNum.isTiny) {
      const smallVal = otherNum.actualValue;
      if (smallVal === 0) return NumericalEntity[0];
      if (smallVal === 1) return this;
      if (smallVal === -1) return this.flipSign();
      absoluteValue = Math.abs(smallVal);
      // If small value fits within a chunk
      if (absoluteValue < CHUNK_SIZE) {
        return new LargeNumber(performSmallMultiplication(thisParts, absoluteValue), isResultNegative);
      }
      // If small value is larger than a chunk, convert to parts
      otherParts = splitSmallIntoParts(absoluteValue);
    }

    // Choose between Karatsuba and long multiplication
    if (shouldUseKaratsuba(thisParts.length, otherParts.length))
      return new LargeNumber(karatsubaMultiply(thisParts, otherParts), isResultNegative);
    return new LargeNumber(performLongMultiplication(thisParts, otherParts), isResultNegative);
  };
  LargeNumber.prototype.times = LargeNumber.prototype.multiply;

  // Multiplies a small integer by a number represented by an array of parts
  function multiplySmallByParts(smallNum, partsArr, isResultNegative) {
    if (smallNum < CHUNK_SIZE) {
      return new LargeNumber(performSmallMultiplication(partsArr, smallNum), isResultNegative);
    }
    return new LargeNumber(performLongMultiplication(partsArr, splitSmallIntoParts(smallNum)), isResultNegative);
  }

  // Internal multiplication helper for TinyNumber
  TinyNumber.prototype._internalMultiplyBySmall = function (otherNum) {
    // If result fits within JS precise bounds
    if (isWithinPreciseBounds(otherNum.actualValue * this.actualValue)) {
      return new TinyNumber(otherNum.actualValue * this.actualValue);
    }
    // Otherwise, convert to large number multiplication
    return multiplySmallByParts(Math.abs(otherNum.actualValue), splitSmallIntoParts(Math.abs(this.actualValue)), this.isNegative !== otherNum.isNegative);
  };

  // Internal multiplication helper for LargeNumber
  LargeNumber.prototype._internalMultiplyBySmall = function (otherNum) {
    const smallVal = otherNum.actualValue;
    if (smallVal === 0) return NumericalEntity[0];
    if (smallVal === 1) return this;
    if (smallVal === -1) return this.flipSign();
    return multiplySmallByParts(Math.abs(smallVal), this.partValues, this.isNegative !== otherNum.isNegative);
  };

  // TinyNumber multiplication method
  TinyNumber.prototype.multiply = function (otherVal) {
    return normalizeInput(otherVal)._internalMultiplyBySmall(this);
  };
  TinyNumber.prototype.times = TinyNumber.prototype.multiply;

  // Calculates the square of a number represented by an array of parts
  function calculateSquare(partsArr) {
    const len = partsArr.length,
      resArr = makeZeroFilledArray(len + len);
    let currentBase = CHUNK_SIZE,
      currentProduct,
      currentCarry,
      idxA,
      chunkA,
      chunkB;
    // Optimized squaring algorithm
    for (idxA = 0; idxA < len; idxA++) {
      chunkA = partsArr[idxA];
      currentCarry = 0 - chunkA * chunkA; // Initialize carry with diagonal term
      for (let idxB = idxA; idxB < len; idxB++) {
        chunkB = partsArr[idxB];
        currentProduct = 2 * (chunkA * chunkB) + resArr[idxA + idxB] + currentCarry;
        currentCarry = Math.floor(currentProduct / currentBase);
        resArr[idxA + idxB] = currentProduct - currentCarry * currentBase;
      }
      resArr[idxA + len] += currentCarry;
    }
    removeLeadingZeros(resArr);
    return resArr;
  }

  // LargeNumber square method
  LargeNumber.prototype.square = function () {
    return new LargeNumber(calculateSquare(this.partValues), false);
  };

  // TinyNumber square method
  TinyNumber.prototype.square = function () {
    const squaredVal = this.actualValue * this.actualValue;
    if (isWithinPreciseBounds(squaredVal)) return new TinyNumber(squaredVal);
    return new LargeNumber(calculateSquare(splitSmallIntoParts(Math.abs(this.actualValue))), false);
  };

  // Long division algorithm (Knuth's D-algorithm)
  function longDivisionAlgorithm(dividendParts, divisorParts) {
    const divLen = dividendParts.length,
      dvLen = divisorParts.length,
      resultParts = makeZeroFilledArray(divisorParts.length);
    let dvMostSigDigit = divisorParts[dvLen - 1],
      lambda = Math.ceil(CHUNK_SIZE / (2 * dvMostSigDigit)), // Normalization factor
      remParts = performSmallMultiplication(dividendParts, lambda),
      dvScaled = performSmallMultiplication(divisorParts, lambda),
      quotientDigit,
      shiftAmount,
      currentCarry,
      currentBorrow,
      idx,
      loopLen,
      qVal;

    // Ensure remainder is large enough
    if (remParts.length <= divLen) remParts.push(0);
    dvScaled.push(0); // Pad divisor
    dvMostSigDigit = dvScaled[dvLen - 1]; // Update most significant digit after scaling

    // Iterate for each quotient digit
    for (shiftAmount = divLen - dvLen; shiftAmount >= 0; shiftAmount--) {
      quotientDigit = CHUNK_SIZE - 1;
      // Estimate quotient digit
      if (remParts[shiftAmount + dvLen] !== dvMostSigDigit) {
        quotientDigit = Math.floor((remParts[shiftAmount + dvLen] * CHUNK_SIZE + remParts[shiftAmount + dvLen - 1]) / dvMostSigDigit);
      }

      currentCarry = 0;
      currentBorrow = 0;
      loopLen = dvScaled.length;
      // Subtract (quotientDigit * dvScaled) from remainder
      for (idx = 0; idx < loopLen; idx++) {
        currentCarry += quotientDigit * dvScaled[idx];
        qVal = Math.floor(currentCarry / CHUNK_SIZE);
        currentBorrow += remParts[shiftAmount + idx] - (currentCarry - qVal * CHUNK_SIZE);
        currentCarry = qVal;
        if (currentBorrow < 0) {
          remParts[shiftAmount + idx] = currentBorrow + CHUNK_SIZE;
          currentBorrow = -1;
        } else {
          remParts[shiftAmount + idx] = currentBorrow;
          currentBorrow = 0;
        }
      }

      // Adjust quotient digit if estimate was too high
      while (currentBorrow !== 0) {
        quotientDigit -= 1;
        currentCarry = 0;
        for (idx = 0; idx < loopLen; idx++) {
          currentCarry += remParts[shiftAmount + idx] - CHUNK_SIZE + dvScaled[idx];
          if (currentCarry < 0) {
            remParts[shiftAmount + idx] = currentCarry + CHUNK_SIZE;
            currentCarry = 0;
          } else {
            remParts[shiftAmount + idx] = currentCarry;
            currentCarry = 1;
          }
        }
        currentBorrow += currentCarry;
      }
      resultParts[shiftAmount] = quotientDigit;
    }
    // Unscale remainder
    remParts = divideBySmallComponent(remParts, lambda)[0];
    return [mergePartsToSmall(resultParts), mergePartsToSmall(remParts)];
  }

  // Short division algorithm (repeated subtraction)
  function shortDivisionAlgorithm(dividendParts, divisorParts) {
    const divLen = dividendParts.length,
      dvLen = divisorParts.length,
      result = [],
      currentPart = [];
    let currentBase = CHUNK_SIZE,
      estimatedQuotient,
      xLen,
      highX,
      highY,
      checkVal;

    // Process dividend chunks from most significant to least
    while (divLen) {
      currentPart.unshift(dividendParts[--divLen]);
      removeLeadingZeros(currentPart);
      // If current part is smaller than divisor, quotient digit is 0
      if (compareAbsoluteValues(currentPart, divisorParts) < 0) {
        result.push(0);
        continue;
      }
      xLen = currentPart.length;
      highX = currentPart[xLen - 1] * currentBase + currentPart[xLen - 2];
      highY = divisorParts[dvLen - 1] * currentBase + divisorParts[dvLen - 2];
      // Adjust highX if current part is longer than divisor
      if (xLen > dvLen) {
        highX = (highX + 1) * currentBase;
      }
      estimatedQuotient = Math.ceil(highX / highY);

      // Refine estimated quotient by trial subtraction
      do {
        checkVal = performSmallMultiplication(divisorParts, estimatedQuotient);
        if (compareAbsoluteValues(checkVal, currentPart) <= 0) break;
        estimatedQuotient--;
      } while (estimatedQuotient);

      result.push(estimatedQuotient);
      currentPart = performSubtraction(currentPart, checkVal);
    }
    result.reverse();
    return [mergePartsToSmall(result), mergePartsToSmall(currentPart)];
  }

  // Divides a number represented by an array of parts by a small integer
  function divideBySmallComponent(partsArr, smallDivisor) {
    const len = partsArr.length,
      quotientArr = makeZeroFilledArray(len);
    let currentBase = CHUNK_SIZE,
      idx,
      quotientDigit,
      currentRemainder,
      currentDivisor;

    currentRemainder = 0;
    // Iterate from most significant chunk to least significant
    for (idx = len - 1; idx >= 0; --idx) {
      currentDivisor = currentRemainder * currentBase + partsArr[idx];
      quotientDigit = floorOrCeilToZero(currentDivisor / smallDivisor);
      currentRemainder = currentDivisor - quotientDigit * smallDivisor;
      quotientArr[idx] = quotientDigit | 0;
    }
    return [quotientArr, currentRemainder | 0];
  }

  // Performs division and modulo for any combination of LargeNumber and TinyNumber
  function flexibleDivisionAndModulo(currentNum, otherVal) {
    let resultParts,
      otherNum = normalizeInput(otherVal);
    const thisParts = currentNum.partValues,
      otherParts = otherNum.partValues;
    let calculatedQuotient;

    // Handle division by zero
    if (otherParts === 0) throw new Error("Cannot divide by zero");

    // If current number is small
    if (currentNum.isTiny) {
      // If both are small, use native JS division
      if (otherNum.isTiny) {
        return [new TinyNumber(floorOrCeilToZero(thisParts / otherParts)), new TinyNumber(thisParts % otherParts)];
      }
      // If current is small and other is large, result is 0 and current number
      return [NumericalEntity[0], currentNum];
    }

    // If divisor is small
    if (otherNum.isTiny) {
      const smallDivisor = otherParts;
      if (smallDivisor === 1) return [currentNum, NumericalEntity[0]];
      if (smallDivisor === -1) return [currentNum.flipSign(), NumericalEntity[0]];
      const absoluteDivisor = Math.abs(smallDivisor);
      // If small divisor fits within a chunk
      if (absoluteDivisor < CHUNK_SIZE) {
        resultParts = divideBySmallComponent(thisParts, absoluteDivisor);
        calculatedQuotient = mergePartsToSmall(resultParts[0]);
        let remainderVal = resultParts[1];
        if (currentNum.isNegative) remainderVal = -remainderVal;
        // Construct quotient and remainder based on size
        if (typeof calculatedQuotient === "number") {
          if (currentNum.isNegative !== otherNum.isNegative) calculatedQuotient = -calculatedQuotient;
          return [new TinyNumber(calculatedQuotient), new TinyNumber(remainderVal)];
        }
        return [new LargeNumber(calculatedQuotient, currentNum.isNegative !== otherNum.isNegative), new TinyNumber(remainderVal)];
      }
      // If small divisor is larger than a chunk, convert to parts
      otherParts = splitSmallIntoParts(absoluteDivisor);
    }

    // Compare absolute values to determine if division is possible
    const comparisonResult = compareAbsoluteValues(thisParts, otherParts);
    if (comparisonResult === -1) return [NumericalEntity[0], currentNum]; // Dividend < Divisor
    if (comparisonResult === 0)
      return [NumericalEntity[currentNum.isNegative === otherNum.isNegative ? 1 : -1], NumericalEntity[0]]; // Dividend === Divisor

    // Choose division algorithm based on length
    if (thisParts.length + otherParts.length <= 200) resultParts = longDivisionAlgorithm(thisParts, otherParts);
    else resultParts = shortDivisionAlgorithm(thisParts, otherParts);

    calculatedQuotient = resultParts[0];
    const quotientSign = currentNum.isNegative !== otherNum.isNegative,
      moduloResult = resultParts[1],
      moduloSign = currentNum.isNegative;

    // Construct quotient object
    if (typeof calculatedQuotient === "number") {
      if (quotientSign) calculatedQuotient = -calculatedQuotient;
      calculatedQuotient = new TinyNumber(calculatedQuotient);
    } else calculatedQuotient = new LargeNumber(calculatedQuotient, quotientSign);

    // Construct modulo object
    if (typeof moduloResult === "number") {
      if (moduloSign) moduloResult = -moduloResult;
      moduloResult = new TinyNumber(moduloResult);
    } else moduloResult = new LargeNumber(moduloResult, moduloSign);

    return [calculatedQuotient, moduloResult];
  }

  // LargeNumber divmod method
  LargeNumber.prototype.getDivModResult = function (otherVal) {
    const resultPair = flexibleDivisionAndModulo(this, otherVal);
    return {
      quotient: resultPair[0],
      remainder: resultPair[1]
    };
  };
  TinyNumber.prototype.getDivModResult = LargeNumber.prototype.getDivModResult;

  // LargeNumber divide method
  LargeNumber.prototype.getQuotient = function (otherVal) {
    return flexibleDivisionAndModulo(this, otherVal)[0];
  };
  TinyNumber.prototype.over = TinyNumber.prototype.getQuotient = LargeNumber.prototype.over = LargeNumber.prototype.getQuotient;

  // LargeNumber modulo method
  LargeNumber.prototype.getRemainder = function (otherVal) {
    return flexibleDivisionAndModulo(this, otherVal)[1];
  };
  TinyNumber.prototype.remainder = TinyNumber.prototype.getRemainder = LargeNumber.prototype.remainder = LargeNumber.prototype.getRemainder;

  // LargeNumber power method (exponentiation)
  LargeNumber.prototype.powerOf = function (exponentVal) {
    const exponentNum = normalizeInput(exponentVal),
      thisParts = this.partValues,
      exponentValNum = exponentNum.actualValue;
    let finalValue,
      baseNum,
      resultNum;

    // Handle special cases for base and exponent
    if (exponentValNum === 0) return NumericalEntity[1];
    if (thisParts === 0) return NumericalEntity[0];
    if (thisParts === 1) return NumericalEntity[1];
    if (thisParts === -1) return exponentNum.isEvenNumber() ? NumericalEntity[1] : NumericalEntity[-1];
    if (exponentNum.isNegative) {
      return NumericalEntity[0]; // Negative exponent results in fraction, which is 0 for integers
    }
    if (!exponentNum.isTiny) throw new Error("The exponent " + exponentNum.toText() + " is too large.");

    // If base is small, check if result fits into JS precise bounds
    if (this.isTiny) {
      if (isWithinPreciseBounds((finalValue = Math.pow(thisParts, exponentValNum))))
        return new TinyNumber(floorOrCeilToZero(finalValue));
    }

    baseNum = this;
    resultNum = NumericalEntity[1];
    // Binary exponentiation (exponentiation by squaring)
    while (true) {
      if ((exponentValNum & 1) === 1) {
        resultNum = resultNum.times(baseNum);
        --exponentValNum;
      }
      if (exponentValNum === 0) break;
      exponentValNum /= 2;
      baseNum = baseNum.square();
    }
    return resultNum;
  };
  TinyNumber.prototype.powerOf = LargeNumber.prototype.powerOf;

  // LargeNumber modular exponentiation method
  LargeNumber.prototype.modularExponentiation = function (exponent, modulus) {
    exponent = normalizeInput(exponent);
    modulus = normalizeInput(modulus);
    if (modulus.isZeroValue()) throw new Error("Cannot take modular exponentiation with modulus 0");

    let finalResult = NumericalEntity[1],
      currentBase = this.getRemainder(modulus);
    // Loop while exponent is positive
    while (exponent.isPositiveNumber()) {
      if (currentBase.isZeroValue()) return NumericalEntity[0]; // If base is 0, result is 0
      if (exponent.isOddNumber()) finalResult = finalResult.multiply(currentBase).getRemainder(modulus);
      exponent = exponent.getQuotient(2);
      currentBase = currentBase.square().getRemainder(modulus);
    }
    return finalResult;
  };
  TinyNumber.prototype.modularExponentiation = LargeNumber.prototype.modularExponentiation;

  // Compares the absolute values of two numbers represented by arrays of parts
  function compareAbsoluteValues(arrA, arrB) {
    if (arrA.length !== arrB.length) {
      return arrA.length > arrB.length ? 1 : -1;
    }
    // Compare chunks from most significant to least significant
    for (let idx = arrA.length - 1; idx >= 0; idx--) {
      if (arrA[idx] !== arrB[idx]) return arrA[idx] > arrB[idx] ? 1 : -1;
    }
    return 0; // Numbers are equal in absolute value
  }

  // LargeNumber compare absolute value method
  LargeNumber.prototype.compareAbsoluteValues = function (otherVal) {
    const otherNum = normalizeInput(otherVal),
      thisParts = this.partValues,
      otherParts = otherNum.partValues;
    if (otherNum.isTiny) return 1; // A large number is always greater in abs value than a tiny number
    return compareAbsoluteValues(thisParts, otherParts);
  };

  // TinyNumber compare absolute value method
  TinyNumber.prototype.compareAbsoluteValues = function (otherVal) {
    const otherNum = normalizeInput(otherVal),
      thisValAbs = Math.abs(this.actualValue),
      otherValParts = otherNum.partValues;
    if (otherNum.isTiny) {
      const otherValAbs = Math.abs(otherValParts);
      return thisValAbs === otherValAbs ? 0 : thisValAbs > otherValAbs ? 1 : -1;
    }
    return -1; // A tiny number is always lesser in abs value than a large number
  };

  // LargeNumber general comparison method
  LargeNumber.prototype.compareValues = function (otherVal) {
    if (otherVal === Infinity) {
      return -1;
    }
    if (otherVal === -Infinity) {
      return 1;
    }
    const otherNum = normalizeInput(otherVal),
      thisParts = this.partValues,
      otherParts = otherNum.partValues;
    // Compare signs first
    if (this.isNegative !== otherNum.isNegative) {
      return otherNum.isNegative ? 1 : -1; // If `this` is positive and `other` is negative, `this` is greater
    }
    // If other number is small, and `this` is large, `this` is greater (or lesser if negative)
    if (otherNum.isTiny) {
      return this.isNegative ? -1 : 1;
    }
    // Compare absolute values, then apply sign
    return compareAbsoluteValues(thisParts, otherParts) * (this.isNegative ? -1 : 1);
  };
  LargeNumber.prototype.compareWith = LargeNumber.prototype.compareValues;

  // TinyNumber general comparison method
  TinyNumber.prototype.compareValues = function (otherVal) {
    if (otherVal === Infinity) {
      return -1;
    }
    if (otherVal === -Infinity) {
      return 1;
    }
    const otherNum = normalizeInput(otherVal),
      thisVal = this.actualValue,
      otherValNum = otherNum.actualValue;
    // If both are tiny, direct comparison
    if (otherNum.isTiny) {
      return thisVal == otherValNum ? 0 : thisVal > otherValNum ? 1 : -1;
    }
    // If signs are different
    if (thisVal < 0 !== otherNum.isNegative) {
      return thisVal < 0 ? -1 : 1; // If `this` is negative, it's smaller than a positive large number
    }
    // If signs are the same, `this` (tiny) is smaller than `other` (large)
    return thisVal < 0 ? 1 : -1; // If both negative, tiny is "larger" (closer to zero)
  };
  TinyNumber.prototype.compareWith = TinyNumber.prototype.compareValues;

  // Equality checks
  LargeNumber.prototype.isEqualTo = function (otherVal) {
    return this.compareValues(otherVal) === 0;
  };
  TinyNumber.prototype.isEq = TinyNumber.prototype.isEqualTo = LargeNumber.prototype.isEq = LargeNumber.prototype.isEqualTo;

  // Inequality checks
  LargeNumber.prototype.isNotEqualTo = function (otherVal) {
    return this.compareValues(otherVal) !== 0;
  };
  TinyNumber.prototype.isNEq = TinyNumber.prototype.isNotEqualTo = LargeNumber.prototype.isNEq = LargeNumber.prototype.isNotEqualTo;

  // Greater than check
  LargeNumber.prototype.isGreater = function (otherVal) {
    return this.compareValues(otherVal) > 0;
  };
  TinyNumber.prototype.isGt = TinyNumber.prototype.isGreater = LargeNumber.prototype.isGt = LargeNumber.prototype.isGreater;

  // Lesser than check
  LargeNumber.prototype.isLesser = function (otherVal) {
    return this.compareValues(otherVal) < 0;
  };
  TinyNumber.prototype.isLt = TinyNumber.prototype.isLesser = LargeNumber.prototype.isLt = LargeNumber.prototype.isLesser;

  // Greater than or equal check
  LargeNumber.prototype.isGreaterOrEqual = function (otherVal) {
    return this.compareValues(otherVal) >= 0;
  };
  TinyNumber.prototype.isGEq = TinyNumber.prototype.isGreaterOrEqual = LargeNumber.prototype.isGEq = LargeNumber.prototype.isGreaterOrEqual;

  // Lesser than or equal check
  LargeNumber.prototype.isLesserOrEqual = function (otherVal) {
    return this.compareValues(otherVal) <= 0;
  };
  TinyNumber.prototype.isLEq = TinyNumber.prototype.isLesserOrEqual = LargeNumber.prototype.isLEq = LargeNumber.prototype.isLesserOrEqual;

  // Parity checks
  LargeNumber.prototype.isEvenNumber = function () {
    return (this.partValues[0] & 1) === 0;
  };
  TinyNumber.prototype.isEvenNumber = function () {
    return (this.actualValue & 1) === 0;
  };

  LargeNumber.prototype.isOddNumber = function () {
    return (this.partValues[0] & 1) === 1;
  };
  TinyNumber.prototype.isOddNumber = function () {
    return (this.actualValue & 1) === 1;
  };

  // Sign checks
  LargeNumber.prototype.isPositiveNumber = function () {
    return !this.isNegative;
  };
  TinyNumber.prototype.isPositiveNumber = function () {
    return this.actualValue > 0;
  };

  LargeNumber.prototype.isNegativeNumber = function () {
    return this.isNegative;
  };
  TinyNumber.prototype.isNegativeNumber = function () {
    return this.actualValue < 0;
  };

  // Value checks
  LargeNumber.prototype.isOneOrMinusOne = function () {
    return false; // A large number is generally not unit unless explicitly checked
  };
  TinyNumber.prototype.isOneOrMinusOne = function () {
    return Math.abs(this.actualValue) === 1;
  };

  LargeNumber.prototype.isZeroValue = function () {
    return false; // A large number is generally not zero unless explicitly checked
  };
  TinyNumber.prototype.isZeroValue = function () {
    return this.actualValue === 0;
  };

  // Divisibility check
  LargeNumber.prototype.isExactlyDivisibleBy = function (otherVal) {
    const otherNum = normalizeInput(otherVal);
    const otherValNum = otherNum.actualValue;
    if (otherValNum === 0) return false;
    if (otherValNum === 1) return true;
    if (otherValNum === 2) return this.isEvenNumber();
    return this.getRemainder(otherNum).isEqualTo(NumericalEntity[0]);
  };
  TinyNumber.prototype.isExactlyDivisibleBy = LargeNumber.prototype.isExactlyDivisibleBy;

  // Basic primality test for small numbers
  function isTrivialPrime(num) {
    const absNum = num.getAbsoluteValue();
    if (absNum.isOneOrMinusOne()) return false;
    if (absNum.isEqualTo(2) || absNum.isEqualTo(3) || absNum.isEqualTo(5)) return true;
    if (absNum.isEvenNumber() || absNum.isExactlyDivisibleBy(3) || absNum.isExactlyDivisibleBy(5)) return false;
    if (absNum.isLesser(25)) return true; // Numbers below 25 that pass above checks are prime
  }

  // Miller-Rabin primality test for LargeNumbers
  LargeNumber.prototype.checkPrime = function () {
    const trivialCheck = isTrivialPrime(this);
    if (trivialCheck !== undefined) return trivialCheck;

    const currentNum = this.getAbsoluteValue(),
      numMinusOne = currentNum.getPreviousNumber();
    const testBases = [2, 3, 5, 7, 11, 13, 17, 19],
      tempB = numMinusOne;
    let factorD, factorT, idx, xVal;

    // Find d and s such that n-1 = d * 2^s
    while (tempB.isEvenNumber()) tempB = tempB.getQuotient(2);

    for (idx = 0; idx < testBases.length; idx++) {
      xVal = largeNumFactory(testBases[idx]).modularExponentiation(tempB, currentNum);
      if (xVal.isEqualTo(NumericalEntity[1]) || xVal.isEqualTo(numMinusOne)) continue;

      for (factorT = true, factorD = tempB; factorT && factorD.isLesser(numMinusOne); factorD = factorD.multiply(2)) {
        xVal = xVal.square().getRemainder(currentNum);
        if (xVal.isEqualTo(numMinusOne)) factorT = false;
      }
      if (factorT) return false; // Not prime
    }
    return true; // Likely prime
  };
  TinyNumber.prototype.checkPrime = LargeNumber.prototype.checkPrime;

  // Probabilistic primality test (Miller-Rabin with iterations)
  LargeNumber.prototype.checkProbablePrime = function (numIterations) {
    const trivialCheck = isTrivialPrime(this);
    if (trivialCheck !== undefined) return trivialCheck;

    const currentNum = this.getAbsoluteValue();
    const iterationsCount = numIterations === undefined ? 5 : numIterations;
    for (let idx = 0; idx < iterationsCount; idx++) {
      const testA = largeNumFactory.generateRandomBetween(2, currentNum.minus(2));
      if (!testA.modularExponentiation(currentNum.getPreviousNumber(), currentNum).isOneOrMinusOne())
        return false; // Not probable prime
    }
    return true; // Probable prime
  };
  TinyNumber.prototype.checkProbablePrime = LargeNumber.prototype.checkProbablePrime;

  // Modular inverse using extended Euclidean algorithm
  LargeNumber.prototype.modularInverse = function (modulusNum) {
    let tVal = largeNumFactory.zero,
      newTVal = largeNumFactory.one,
      rVal = normalizeInput(modulusNum),
      newRVal = this.getAbsoluteValue(),
      quotientVal,
      lastTVal,
      lastRVal;

    // Extended Euclidean algorithm
    while (!newRVal.isEqualTo(largeNumFactory.zero)) {
      quotientVal = rVal.getQuotient(newRVal);
      lastTVal = tVal;
      lastRVal = rVal;
      tVal = newTVal;
      rVal = newRVal;
      newTVal = lastTVal.subtract(quotientVal.multiply(newTVal));
      newRVal = lastRVal.subtract(quotientVal.multiply(newRVal));
    }

    // Check for co-prime condition
    if (!rVal.isEqualTo(1))
      throw new Error(this.toText() + " and " + modulusNum.toText() + " are not co-prime");

    // Adjust result to be positive
    if (tVal.compareValues(0) === -1) {
      tVal = tVal.add(modulusNum);
    }
    // If original number was negative, negate the result
    if (this.isNegativeNumber()) {
      return tVal.flipSign();
    }
    return tVal;
  };
  TinyNumber.prototype.modularInverse = LargeNumber.prototype.modularInverse;

  // Returns the next consecutive integer
  LargeNumber.prototype.getNextNumber = function () {
    const currentParts = this.partValues;
    if (this.isNegative) {
      return subtractSmallComponent(currentParts, 1, this.isNegative);
    }
    return new LargeNumber(addSmallComponent(currentParts, 1), this.isNegative);
  };
  TinyNumber.prototype.getNextNumber = function () {
    const currentVal = this.actualValue;
    if (currentVal + 1 < JS_MAX_SAFE_INT) return new TinyNumber(currentVal + 1);
    return new LargeNumber(MAX_SAFE_INT_PARTS, false);
  };

  // Returns the previous consecutive integer
  LargeNumber.prototype.getPreviousNumber = function () {
    const currentParts = this.partValues;
    if (this.isNegative) {
      return new LargeNumber(addSmallComponent(currentParts, 1), true);
    }
    return subtractSmallComponent(currentParts, 1, this.isNegative);
  };
  TinyNumber.prototype.getPreviousNumber = function () {
    const currentVal = this.actualValue;
    if (currentVal - 1 > -JS_MAX_SAFE_INT) return new TinyNumber(currentVal - 1);
    return new LargeNumber(MAX_SAFE_INT_PARTS, true);
  };

  // Pre-calculated powers of two up to CHUNK_SIZE
  const powersOfTwo = [1];
  while (2 * powersOfTwo[powersOfTwo.length - 1] <= CHUNK_SIZE)
    powersOfTwo.push(2 * powersOfTwo[powersOfTwo.length - 1]);
  const powers2Length = powersOfTwo.length,
    highestPower2 = powersOfTwo[powers2Length - 1];

  // Checks if the shift amount is small enough for direct processing
  function isShiftAmountSmall(val) {
    return (typeof val === "number" || typeof val === "string") && +Math.abs(val) <= CHUNK_SIZE || val instanceof LargeNumber && val.partValues.length <= 1;
  }

  // LargeNumber bitwise left shift
  LargeNumber.prototype.shiftBitsLeft = function (shiftAmount) {
    if (!isShiftAmountSmall(shiftAmount)) {
      throw new Error(String(shiftAmount) + " is too large for shifting.");
    }
    shiftAmount = +shiftAmount; // Convert to number
    if (shiftAmount < 0) return this.shiftBitsRight(-shiftAmount); // Convert left shift by negative to right shift

    let currentResult = this;
    if (currentResult.isZeroValue()) return currentResult;

    // Shift by multiples of powers2Length by multiplying with highestPower2
    while (shiftAmount >= powers2Length) {
      currentResult = currentResult.multiply(highestPower2);
      shiftAmount -= powers2Length - 1;
    }
    // Multiply by remaining power of two
    return currentResult.multiply(powersOfTwo[shiftAmount]);
  };
  TinyNumber.prototype.shiftBitsLeft = LargeNumber.prototype.shiftBitsLeft;

  // LargeNumber bitwise right shift
  LargeNumber.prototype.shiftBitsRight = function (shiftAmount) {
    let remainderAndQuotient;
    if (!isShiftAmountSmall(shiftAmount)) {
      throw new Error(String(shiftAmount) + " is too large for shifting.");
    }
    shiftAmount = +shiftAmount; // Convert to number
    if (shiftAmount < 0) return this.shiftBitsLeft(-shiftAmount); // Convert right shift by negative to left shift

    let currentResult = this;
    // Shift by multiples of powers2Length by dividing with highestPower2
    while (shiftAmount >= powers2Length) {
      if (currentResult.isZeroValue() || currentResult.isNegativeNumber() && currentResult.isOneOrMinusOne())
        return currentResult; // Handle cases where further shifting results in 0 or -1
      remainderAndQuotient = flexibleDivisionAndModulo(currentResult, highestPower2);
      // Adjust quotient for negative numbers (floor towards -infinity)
      currentResult = remainderAndQuotient[1].isNegativeNumber() ? remainderAndQuotient[0].getPreviousNumber() : remainderAndQuotient[0];
      shiftAmount -= powers2Length - 1;
    }
    // Divide by remaining power of two
    remainderAndQuotient = flexibleDivisionAndModulo(currentResult, powersOfTwo[shiftAmount]);
    return remainderAndQuotient[1].isNegativeNumber() ? remainderAndQuotient[0].getPreviousNumber() : remainderAndQuotient[0];
  };
  TinyNumber.prototype.shiftBitsRight = LargeNumber.prototype.shiftBitsRight;

  // Generic bitwise operation function
  function performBitwiseOperation(numX, numY, bitwiseFunc) {
    numY = normalizeInput(numY);
    const xIsNegative = numX.isNegativeNumber(),
      yIsNegative = numY.isNegativeNumber();
    // Convert to two's complement representation if negative
    let xRemaining = xIsNegative ? numX.bitwiseNot() : numX,
      yRemaining = yIsNegative ? numY.bitwiseNot() : numY;
    let xChunk = 0,
      yChunk = 0;
    let xDivModResult = null,
      yDivModResult = null;
    const resultChunks = [];

    // Process numbers chunk by chunk
    while (!xRemaining.isZeroValue() || !yRemaining.isZeroValue()) {
      xDivModResult = flexibleDivisionAndModulo(xRemaining, highestPower2);
      xChunk = xDivModResult[1].toNativeNumber();
      if (xIsNegative) {
        xChunk = highestPower2 - 1 - xChunk; // Apply two's complement for this chunk
      }
      yDivModResult = flexibleDivisionAndModulo(yRemaining, highestPower2);
      yChunk = yDivModResult[1].toNativeNumber();
      if (yIsNegative) {
        yChunk = highestPower2 - 1 - yChunk; // Apply two's complement for this chunk
      }
      xRemaining = xDivModResult[0];
      yRemaining = yDivModResult[0];
      resultChunks.push(bitwiseFunc(xChunk, yChunk));
    }

    // Determine sign of the final result and reconstruct
    let finalSum = bitwiseFunc(xIsNegative ? 1 : 0, yIsNegative ? 1 : 0) !== 0 ? largeNumFactory(-1) : largeNumFactory(0);
    for (let idx = resultChunks.length - 1; idx >= 0; idx -= 1) {
      finalSum = finalSum.multiply(highestPower2).add(largeNumFactory(resultChunks[idx]));
    }
    return finalSum;
  }

  // LargeNumber bitwise NOT (one's complement, equivalent to -n-1)
  LargeNumber.prototype.bitwiseNot = function () {
    return this.flipSign().getPreviousNumber();
  };
  TinyNumber.prototype.bitwiseNot = LargeNumber.prototype.bitwiseNot;

  // LargeNumber bitwise AND
  LargeNumber.prototype.bitwiseAnd = function (otherVal) {
    return performBitwiseOperation(this, otherVal, function (a, b) {
      return a & b;
    });
  };
  TinyNumber.prototype.bitwiseAnd = LargeNumber.prototype.bitwiseAnd;

  // LargeNumber bitwise OR
  LargeNumber.prototype.bitwiseOr = function (otherVal) {
    return performBitwiseOperation(this, otherVal, function (a, b) {
      return a | b;
    });
  };
  TinyNumber.prototype.bitwiseOr = LargeNumber.prototype.bitwiseOr;

  // LargeNumber bitwise XOR
  LargeNumber.prototype.bitwiseXor = function (otherVal) {
    return performBitwiseOperation(this, otherVal, function (a, b) {
      return a ^ b;
    });
  };
  TinyNumber.prototype.bitwiseXor = LargeNumber.prototype.bitwiseXor;

  const LOW_ORDER_BITS_INTEGER = 1 << 30, // Mask for lowest set bit in a 32-bit int
    LOW_ORDER_BITS_BIGINT = (CHUNK_SIZE & -CHUNK_SIZE) * (CHUNK_SIZE & -CHUNK_SIZE) | LOW_ORDER_BITS_INTEGER; // Mask for lowest set bit in big int chunk

  // Approximates the lowest order bit (LSB)
  function getRoughLowOrderBits(num) {
    const val = num.partValues;
    const x = typeof val === "number" ? val | LOW_ORDER_BITS_INTEGER : val[0] + val[1] * CHUNK_SIZE | LOW_ORDER_BITS_BIGINT;
    return x & -x; // Returns the LSB
  }

  // Calculates integer logarithm base 2
  function calculateIntegerLogarithm(val, base) {
    if (base.compareWith(val) <= 0) {
      const tempResult = calculateIntegerLogarithm(val, base.square());
      const powerP = tempResult.p;
      const exponentE = tempResult.e;
      const testProduct = powerP.multiply(base);
      return testProduct.compareWith(val) <= 0 ? {
        p: testProduct,
        e: exponentE * 2 + 1
      } : {
        p: powerP,
        e: exponentE * 2
      };
    }
    return {
      p: largeNumFactory(1),
      e: 0
    };
  }

  // LargeNumber bit length method
  LargeNumber.prototype.getBitLength = function () {
    let currentNum = this;
    if (currentNum.compareWith(largeNumFactory(0)) < 0) {
      currentNum = currentNum.flipSign().subtract(largeNumFactory(1)); // Two's complement representation
    }
    if (currentNum.compareWith(largeNumFactory(0)) === 0) {
      return largeNumFactory(0);
    }
    return largeNumFactory(calculateIntegerLogarithm(currentNum, largeNumFactory(2)).e).add(largeNumFactory(1));
  };
  TinyNumber.prototype.getBitLength = LargeNumber.prototype.getBitLength;

  // Finds the maximum of two numbers
  function findMaximum(num1, num2) {
    num1 = normalizeInput(num1);
    num2 = normalizeInput(num2);
    return num1.isGreater(num2) ? num1 : num2;
  }

  // Finds the minimum of two numbers
  function findMinimum(num1, num2) {
    num1 = normalizeInput(num1);
    num2 = normalizeInput(num2);
    return num1.isLesser(num2) ? num1 : num2;
  }

  // Calculates the greatest common divisor (GCD) using binary GCD algorithm
  function greatestCommonDivisor(numA, numB) {
    numA = normalizeInput(numA).getAbsoluteValue();
    numB = normalizeInput(numB).getAbsoluteValue();
    if (numA.isEqualTo(numB)) return numA;
    if (numA.isZeroValue()) return numB;
    if (numB.isZeroValue()) return numA;

    let commonFactor = NumericalEntity[1],
      tempD,
      tempT;
    // Remove common factors of 2
    while (numA.isEvenNumber() && numB.isEvenNumber()) {
      tempD = Math.min(getRoughLowOrderBits(numA), getRoughLowOrderBits(numB));
      numA = numA.getQuotient(tempD);
      numB = numB.getQuotient(tempD);
      commonFactor = commonFactor.multiply(tempD);
    }
    // Remove factors of 2 from numA
    while (numA.isEvenNumber()) {
      numA = numA.getQuotient(getRoughLowOrderBits(numA));
    }
    // Main binary GCD loop
    do {
      while (numB.isEvenNumber()) {
        numB = numB.getQuotient(getRoughLowOrderBits(numB));
      }
      if (numA.isGreater(numB)) {
        tempT = numB;
        numB = numA;
        numA = tempT;
      }
      numB = numB.subtract(numA);
    } while (!numB.isZeroValue());

    return commonFactor.isOneOrMinusOne() ? numA : numA.multiply(commonFactor);
  }

  // Calculates the least common multiple (LCM)
  function leastCommonMultiple(numA, numB) {
    numA = normalizeInput(numA).getAbsoluteValue();
    numB = normalizeInput(numB).getAbsoluteValue();
    return numA.getQuotient(greatestCommonDivisor(numA, numB)).multiply(numB);
  }

  // Generates a random number between two given numbers (inclusive)
  function generateRandomBetween(lowerBound, upperBound) {
    lowerBound = normalizeInput(lowerBound);
    upperBound = normalizeInput(upperBound);
    const lowVal = findMinimum(lowerBound, upperBound),
      highVal = findMaximum(lowerBound, upperBound);
    const valueRange = highVal.subtract(lowVal).add(1);

    // If range is small, use native Math.random
    if (valueRange.isTiny)
      return lowVal.add(Math.floor(Math.random() * valueRange.actualValue));

    // For large ranges, generate random parts
    const rangeLen = valueRange.partValues.length - 1;
    const randomParts = [];
    let isRestricted = true; // Flag to ensure numbers don't exceed upper bound
    for (let idx = rangeLen; idx >= 0; idx--) {
      const currentTop = isRestricted ? valueRange.partValues[idx] : CHUNK_SIZE;
      const randomDigit = floorOrCeilToZero(Math.random() * currentTop);
      randomParts.unshift(randomDigit);
      if (randomDigit < currentTop) isRestricted = false;
    }
    const mergedResult = mergePartsToSmall(randomParts);
    return lowVal.add(typeof mergedResult === "number" ? new TinyNumber(mergedResult) : new LargeNumber(mergedResult, false));
  }

  // Parses a string value with a specified base (radix)
  const convertStringWithBase = function (textInput, baseRadix) {
    const textLen = textInput.length;
    const absBase = Math.abs(baseRadix);

    // Validate characters for the given base
    for (let idx = 0; idx < textLen; idx++) {
      const char = textInput[idx].toLowerCase();
      if (char === "-") continue;
      if (/[a-z0-9]/.test(char)) {
        if (/[0-9]/.test(char) && +char >= absBase) {
          if (char === "1" && absBase === 1) continue;
          throw new Error(char + " is not a valid digit in base " + baseRadix + ".");
        } else if (char.charCodeAt(0) - 87 >= absBase) {
          throw new Error(char + " is not a valid digit in base " + baseRadix + ".");
        }
      }
    }

    // For small bases and small numbers, use native parseInt
    if (2 <= baseRadix && baseRadix <= 36) {
      if (textLen <= LOG_JS_MAX_SAFE_INT / Math.log(baseRadix)) {
        const parsedResult = parseInt(textInput, baseRadix);
        if (isNaN(parsedResult)) {
          throw new Error("Invalid number string for base " + baseRadix + ".");
        }
        return new TinyNumber(parseInt(textInput, baseRadix));
      }
    }

    baseRadix = normalizeInput(baseRadix);
    const digitArray = [];
    const isNegativeSign = textInput[0] === "-";
    // Parse digits, handling custom base representations (e.g., "<10>")
    for (let idx = isNegativeSign ? 1 : 0; idx < textInput.length; idx++) {
      const char = textInput[idx].toLowerCase(),
        charCode = char.charCodeAt(0);
      if (48 <= charCode && charCode <= 57) digitArray.push(normalizeInput(char));
      else if (97 <= charCode && charCode <= 122) digitArray.push(normalizeInput(char.charCodeAt(0) - 87));
      else if (char === "<") {
        const startIdx = idx;
        do {
          idx++;
        } while (textInput[idx] !== ">");
        digitArray.push(normalizeInput(textInput.slice(startIdx + 1, idx)));
      } else throw new Error(char + " is not a valid character");
    }
    return convertPartsWithBase(digitArray, baseRadix, isNegativeSign);
  };

  // Converts an array of digits (parsed as numbers) from a given base to a NumericalEntity
  function convertPartsWithBase(digitsArr, baseNum, isNegative) {
    let resultVal = NumericalEntity[0],
      currentPower = NumericalEntity[1],
      idx;
    // Horner's method for base conversion
    for (idx = digitsArr.length - 1; idx >= 0; idx--) {
      resultVal = resultVal.add(digitsArr[idx].times(currentPower));
      currentPower = currentPower.times(baseNum);
    }
    return isNegative ? resultVal.flipSign() : resultVal;
  }

  // Converts a single digit (0-35) to its string representation
  function digitToString(digit) {
    if (digit <= 35) {
      return "0123456789abcdefghijklmnopqrstuvwxyz".charAt(digit);
    }
    return "<" + digit + ">"; // For digits > 35
  }

  // Converts a number to its representation in a given base
  function convertToBaseRepresentation(num, targetBase) {
    targetBase = largeNumFactory(targetBase);
    if (targetBase.isZeroValue()) {
      if (num.isZeroValue()) return {
        value: [0],
        isNegative: false
      };
      throw new Error("Cannot convert nonzero numbers to base 0.");
    }
    // Handle base -1 (alternating sequence of 0s and 1s)
    if (targetBase.isEqualTo(-1)) {
      if (num.isZeroValue()) return {
        value: [0],
        isNegative: false
      };
      if (num.isNegativeNumber())
        return {
          value: [].concat.apply([], Array.apply(null, Array(-num.toNativeNumber())).map(Array.prototype.valueOf, [1, 0])),
          isNegative: false
        };
      const arr = Array.apply(null, Array(+num.toNativeNumber() - 1)).map(Array.prototype.valueOf, [0, 1]);
      arr.unshift([1]);
      return {
        value: [].concat.apply([], arr),
        isNegative: false
      };
    }

    let isResultNegative = false;
    // If number is negative and base is positive, store sign and work with absolute value
    if (num.isNegativeNumber() && targetBase.isPositiveNumber()) {
      isResultNegative = true;
      num = num.getAbsoluteValue();
    }
    // Handle base 1
    if (targetBase.isEqualTo(1)) {
      if (num.isZeroValue()) return {
        value: [0],
        isNegative: false
      };
      return {
        value: Array.apply(null, Array(+num.toNativeNumber())).map(Number.prototype.valueOf, 1),
        isNegative: isResultNegative
      };
    }

    const outputDigits = [];
    let currentLeft = num,
      divModPair;
    // Repeatedly divide by base and take remainder
    while (currentLeft.isNegativeNumber() || currentLeft.compareAbsoluteValues(targetBase) >= 0) {
      divModPair = currentLeft.getDivModResult(targetBase);
      currentLeft = divModPair.quotient;
      let digit = divModPair.remainder;
      // Adjust for negative remainders in non-standard bases
      if (digit.isNegativeNumber()) {
        digit = targetBase.minus(digit).getAbsoluteValue();
        currentLeft = currentLeft.getNextNumber();
      }
      outputDigits.push(digit.toNativeNumber());
    }
    outputDigits.push(currentLeft.toNativeNumber());
    return {
      value: outputDigits.reverse(),
      isNegative: isResultNegative
    };
  }

  // Converts a number to its string representation in a given base
  function getBaseString(num, baseRadix) {
    const baseResult = convertToBaseRepresentation(num, baseRadix);
    return (baseResult.isNegative ? "-" : "") + baseResult.value.map(digitToString).join("");
  }

  // LargeNumber to array representation in a given radix
  LargeNumber.prototype.toBaseArray = function (radix) {
    return convertToBaseRepresentation(this, radix);
  };
  TinyNumber.prototype.toBaseArray = function (radix) {
    return convertToBaseRepresentation(this, radix);
  };

  // LargeNumber to string representation
  LargeNumber.prototype.toText = function (radix) {
    if (radix === undefined) radix = 10;
    if (radix !== 10) return getBaseString(this, radix);
    const valParts = this.partValues,
      len = valParts.length;
    let stringResult = String(valParts[--len]),
      paddingZeros = "0000000",
      currentDigit;
    // Concatenate chunks, padding with zeros
    while (--len >= 0) {
      currentDigit = String(valParts[len]);
      stringResult += paddingZeros.slice(currentDigit.length) + currentDigit;
    }
    const signPrefix = this.isNegative ? "-" : "";
    return signPrefix + stringResult;
  };

  // TinyNumber to string representation
  TinyNumber.prototype.toText = function (radix) {
    if (radix === undefined) radix = 10;
    if (radix != 10) return getBaseString(this, radix);
    return String(this.actualValue);
  };

  // JSON serialization methods
  LargeNumber.prototype.toJSONString = TinyNumber.prototype.toJSONString = function () {
    return this.toText();
  };

  // ValueOf and JSNumber conversion methods
  LargeNumber.prototype.getValue = function () {
    return parseInt(this.toText(), 10);
  };
  LargeNumber.prototype.toNativeNumber = LargeNumber.prototype.getValue;

  TinyNumber.prototype.getValue = function () {
    return this.actualValue;
  };
  TinyNumber.prototype.toNativeNumber = TinyNumber.prototype.getValue;

  // Parses a string into a NumericalEntity
  function convertStringValue(strVal) {
    // If it fits into a precise JS number, create a TinyNumber
    if (isWithinPreciseBounds(+strVal)) {
      const num = +strVal;
      if (num === floorOrCeilToZero(num)) return new TinyNumber(num);
      throw new Error("Invalid integer: " + strVal);
    }

    let isNegative = strVal[0] === "-";
    if (isNegative) strVal = strVal.slice(1);

    // Handle scientific notation
    const splitExp = strVal.split(/e/i);
    if (splitExp.length > 2) throw new Error("Invalid integer: " + splitExp.join("e"));
    if (splitExp.length === 2) {
      let exponentPart = splitExp[1];
      if (exponentPart[0] === "+") exponentPart = exponentPart.slice(1);
      exponentPart = +exponentPart;
      if (exponentPart !== floorOrCeilToZero(exponentPart) || !isWithinPreciseBounds(exponentPart))
        throw new Error("Invalid integer: " + exponentPart + " is not a valid exponent.");

      let baseText = splitExp[0];
      const decimalPoint = baseText.indexOf(".");
      if (decimalPoint >= 0) {
        exponentPart -= baseText.length - decimalPoint - 1;
        baseText = baseText.slice(0, decimalPoint) + baseText.slice(decimalPoint + 1);
      }
      if (exponentPart < 0)
        throw new Error("Cannot include negative exponent part for integers");
      baseText += new Array(exponentPart + 1).join("0"); // Append zeros
      strVal = baseText;
    }

    // Validate string format
    const isValidFormat = /^([0-9][0-9]*)$/.test(strVal);
    if (!isValidFormat) throw new Error("Invalid integer: " + strVal);

    const partsResult = [],
      maxLen = strVal.length,
      chunkLength = CHUNK_DIGITS;
    let minLen = maxLen - chunkLength;
    // Split string into chunks from right to left
    while (maxLen > 0) {
      partsResult.push(+strVal.slice(minLen, maxLen));
      minLen -= chunkLength;
      if (minLen < 0) minLen = 0;
      maxLen -= chunkLength;
    }
    removeLeadingZeros(partsResult);
    return new LargeNumber(partsResult, isNegative);
  }

  // Parses a number into a NumericalEntity
  function convertNumberValue(numVal) {
    if (isWithinPreciseBounds(numVal)) {
      if (numVal !== floorOrCeilToZero(numVal)) throw new Error(numVal + " is not an integer.");
      return new TinyNumber(numVal);
    }
    return convertStringValue(numVal.toString());
  }

  // Main function to normalize any input value into a NumericalEntity
  function normalizeInput(val) {
    if (typeof val === "number") {
      return convertNumberValue(val);
    }
    if (typeof val === "string") {
      return convertStringValue(val);
    }
    return val; // Assume it's already a NumericalEntity
  }

  // Pre-instantiate common small integers for efficiency
  for (let i = 0; i < 1e3; i++) {
    NumericalEntity[i] = new TinyNumber(i);
    if (i > 0) NumericalEntity[-i] = new TinyNumber(-i);
  }

  // Expose common constants and utility functions
  NumericalEntity.one = NumericalEntity[1];
  NumericalEntity.zero = NumericalEntity[0];
  NumericalEntity.minusOne = NumericalEntity[-1];
  NumericalEntity.max = findMaximum;
  NumericalEntity.min = findMinimum;
  NumericalEntity.gcd = greatestCommonDivisor;
  NumericalEntity.lcm = leastCommonMultiple;
  NumericalEntity.isInstance = function (obj) {
    return obj instanceof LargeNumber || obj instanceof TinyNumber;
  };
  NumericalEntity.randBetween = generateRandomBetween;
  NumericalEntity.fromArray = function (digits, base, isNegative) {
    return convertPartsWithBase(digits.map(normalizeInput), normalizeInput(base || 10), isNegative);
  };

  return NumericalEntity; // Return the factory function
}();

// Main processing function for the given input structure
function processInput(inputData) {
  // Parse the first line for N and K
  const sourceParams = inputData.trim().split("\n")[0].split(" ").map(Number);
  // Parse the second line for the array of numbers
  const dataArray = inputData.trim().split("\n")[1].split(" ").map(Number);
  const totalElements = sourceParams[0];
  const subsetSize = sourceParams[1];

  // Generate combinations of dataArray elements
  const combinationsList = generateCombinations(dataArray, subsetSize, subsetSize);
  let totalSum = 0;

  // Iterate through each combination
  for (let idx = 0; idx < combinationsList.length; idx++) {
    // Calculate the difference between max and min in the current combination
    const currentDifference =
      Math.max.apply(null, combinationsList[idx]) - Math.min.apply(null, combinationsList[idx]);
    // Add the difference modulo 1000000007 to the total sum
    totalSum += currentDifference % 1000000007;
  }
  // Output the final sum
  console.log(totalSum);
}

// Read input from stdin and pass to the processing function
processInput(require('node:fs').readFileSync('/dev/stdin', 'utf8'));

// Recursive function to generate combinations
function generateCombinations(inputNumbers, currentK, originalK) {
  const resultCombinations = [];
  // `tempSum` is unused in the original logic, kept for structural identity
  let tempSum = 0;

  // If there aren't enough numbers to form a combination of size k, return empty
  if (inputNumbers.length < currentK) {
    return [];
  }

  // Base case: if k is 1, each number is its own combination
  if (currentK === 1) {
    for (let idx1 = 0; idx1 < inputNumbers.length; idx1++) {
      resultCombinations[idx1] = [inputNumbers[idx1]];
    }
  } else {
    // Recursive step: pick a number, then find combinations for k-1 from remaining numbers
    for (let idx1 = 0; idx1 < inputNumbers.length - currentK + 1; idx1++) {
      const subCombinations = generateCombinations(
        inputNumbers.slice(idx1 + 1),
        currentK - 1,
        originalK
      );
      // Prepend the current number to each sub-combination
      for (let idx2 = 0; idx2 < subCombinations.length; idx2++) {
        resultCombinations.push([inputNumbers[idx1]].concat(subCombinations[idx2]));
      }
    }
  }
  return resultCombinations;
}