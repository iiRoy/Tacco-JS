var largeNumber = function (unassigned) {
  // Define constants for internal arithmetic operations
  var CHUNK_SIZE = 1e7,
    CHUNK_LOG = 7,
    MAX_SAFE_JS_VALUE = 9007199254740992,
    MAX_SAFE_JS_PARTS = splitSmallNumber(MAX_SAFE_JS_VALUE),
    LOG_MAX_SAFE_JS_VALUE = Math.log(MAX_SAFE_JS_VALUE);

  // Constructor for NumericObject, the base type for all numbers
  function NumericObject(inputVal, numericBase) {
    if (typeof inputVal === 'undefined')
      return NumericObject[0]; // Default to zero if no value provided
    if (typeof numericBase !== 'undefined')
      return +numericBase === 10 ? processInput(inputVal) : parseFromBase(inputVal, numericBase);
    return processInput(inputVal);
  }

  // Constructor for LargeNumeric (BigInteger equivalent)
  function LargeNumeric(digitArray, isNegativeFlag) {
    this.numericParts = digitArray;
    this.isNegativeFlag = isNegativeFlag;
    this.isCompact = false; // Indicates it's not a SmallInteger
  }
  LargeNumeric.prototype = Object.create(NumericObject.prototype);

  // Constructor for CompactNumeric (SmallInteger equivalent)
  function CompactNumeric(inputVal) {
    this.numericParts = inputVal;
    this.isNegativeFlag = inputVal < 0;
    this.isCompact = true; // Indicates it's a SmallInteger
  }
  CompactNumeric.prototype = Object.create(NumericObject.prototype);

  // Checks if a number can be represented precisely by JavaScript's number type
  function canFitInJSNum(numVal) {
    return -MAX_SAFE_JS_VALUE < numVal && numVal < MAX_SAFE_JS_VALUE;
  }

  // Converts a small JavaScript number into an array of chunks
  function splitSmallNumber(numVal) {
    if (numVal < 1e7)
      return [numVal];
    if (numVal < 1e14)
      return [numVal % 1e7, Math.floor(numVal / 1e7)];
    return [numVal % 1e7, Math.floor(numVal / 1e7) % 1e7, Math.floor(numVal / 1e14)];
  }

  // Converts an array of chunks back into a small JavaScript number if possible
  function reconstructSmallNumber(partsArr) {
    removeLeadingZeros(partsArr);
    var partsCount = partsArr.length;
    if (partsCount < 4 && compareAbsoluteValues(partsArr, MAX_SAFE_JS_PARTS) < 0) {
      switch (partsCount) {
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

  // Removes trailing zero chunks from a numeric parts array
  function removeLeadingZeros(partsArr) {
    var idx = partsArr.length;
    while (partsArr[--idx] === 0);
    partsArr.length = idx + 1;
  }

  // Creates a new array initialized with zeros
  function makeZeroFilledArray(count) {
    var newArr = new Array(count);
    var currentIdx = -1;
    while (++currentIdx < count) {
      newArr[currentIdx] = 0;
    }
    return newArr;
  }

  // Truncates a number (removes decimal part)
  function discardFraction(numVal) {
    if (numVal > 0)
      return Math.floor(numVal);
    return Math.ceil(numVal);
  }

  // Performs addition of two numeric parts arrays
  function performAddition(firstParts, secondParts) {
    var lenA = firstParts.length,
      lenB = secondParts.length,
      resultArr = new Array(lenA),
      carryOver = 0,
      chunkBase = CHUNK_SIZE,
      partialSum, idx;
    for (idx = 0; idx < lenB; idx++) {
      partialSum = firstParts[idx] + secondParts[idx] + carryOver;
      carryOver = partialSum >= chunkBase ? 1 : 0;
      resultArr[idx] = partialSum - carryOver * chunkBase;
    }
    while (idx < lenA) {
      partialSum = firstParts[idx] + carryOver;
      carryOver = partialSum === chunkBase ? 1 : 0;
      resultArr[idx++] = partialSum - carryOver * chunkBase;
    }
    if (carryOver > 0)
      resultArr.push(carryOver);
    return resultArr;
  }

  // Flexible addition, ensuring the longer array is first
  function flexibleAddition(firstParts, secondParts) {
    if (firstParts.length >= secondParts.length)
      return performAddition(firstParts, secondParts);
    return performAddition(secondParts, firstParts);
  }

  // Adds a small number (carry) to a numeric parts array
  function addCompactValue(partsArr, carryVal) {
    var currentLength = partsArr.length,
      resultArr = new Array(currentLength),
      chunkBase = CHUNK_SIZE,
      partialSum, idx;
    for (idx = 0; idx < currentLength; idx++) {
      partialSum = partsArr[idx] - chunkBase + carryVal;
      carryVal = Math.floor(partialSum / chunkBase);
      resultArr[idx] = partialSum - carryVal * chunkBase;
      carryVal += 1;
    }
    while (carryVal > 0) {
      resultArr[idx++] = carryVal % chunkBase;
      carryVal = Math.floor(carryVal / chunkBase);
    }
    return resultArr;
  }

  // LargeNumeric addition method
  LargeNumeric.prototype.sum = function (inputVal) {
    var otherNum = processInput(inputVal);
    if (this.isNegativeFlag !== otherNum.isNegativeFlag) {
      return this.deduct(otherNum.flipSign());
    }
    var currentParts = this.numericParts,
      otherParts = otherNum.numericParts;
    if (otherNum.isCompact) {
      return new LargeNumeric(addCompactValue(currentParts, Math.abs(otherNum.numericParts)), this.isNegativeFlag);
    }
    return new LargeNumeric(flexibleAddition(currentParts, otherParts), this.isNegativeFlag);
  };
  LargeNumeric.prototype.plusOp = LargeNumeric.prototype.sum;

  // CompactNumeric addition method
  CompactNumeric.prototype.sum = function (inputVal) {
    var otherNum = processInput(inputVal);
    var currentVal = this.numericParts;
    if (currentVal < 0 !== otherNum.isNegativeFlag) {
      return this.deduct(otherNum.flipSign());
    }
    var otherVal = otherNum.numericParts;
    if (otherNum.isCompact) {
      if (canFitInJSNum(currentVal + otherVal))
        return new CompactNumeric(currentVal + otherVal);
      otherVal = splitSmallNumber(Math.abs(otherVal));
    }
    return new LargeNumeric(addCompactValue(otherVal, Math.abs(currentVal)), currentVal < 0);
  };
  CompactNumeric.prototype.plusOp = CompactNumeric.prototype.sum;

  // Performs subtraction of two numeric parts arrays
  function performSubtraction(firstParts, secondParts) {
    var lenA = firstParts.length,
      lenB = secondParts.length,
      resultArr = new Array(lenA),
      borrowVal = 0,
      chunkBase = CHUNK_SIZE,
      idx, diffVal;
    for (idx = 0; idx < lenB; idx++) {
      diffVal = firstParts[idx] - borrowVal - secondParts[idx];
      if (diffVal < 0) {
        diffVal += chunkBase;
        borrowVal = 1;
      } else
        borrowVal = 0;
      resultArr[idx] = diffVal;
    }
    for (idx = lenB; idx < lenA; idx++) {
      diffVal = firstParts[idx] - borrowVal;
      if (diffVal < 0)
        diffVal += chunkBase;
      else {
        resultArr[idx++] = diffVal;
        break;
      }
      resultArr[idx] = diffVal;
    }
    for (; idx < lenA; idx++) {
      resultArr[idx] = firstParts[idx];
    }
    removeLeadingZeros(resultArr);
    return resultArr;
  }

  // Flexible subtraction, handling signs and order
  function flexibleSubtraction(firstParts, secondParts, isResultNegative) {
    var resultVal;
    if (compareAbsoluteValues(firstParts, secondParts) >= 0) {
      resultVal = performSubtraction(firstParts, secondParts);
    } else {
      resultVal = performSubtraction(secondParts, firstParts);
      isResultNegative = !isResultNegative;
    }
    resultVal = reconstructSmallNumber(resultVal);
    if (typeof resultVal === 'number') {
      if (isResultNegative)
        resultVal = -resultVal;
      return new CompactNumeric(resultVal);
    }
    return new LargeNumeric(resultVal, isResultNegative);
  }

  // Subtracts a small number from a numeric parts array
  function subtractCompactValue(partsArr, smallVal, isResultNegative) {
    var currentLength = partsArr.length,
      resultArr = new Array(currentLength),
      carryVal = -smallVal,
      chunkBase = CHUNK_SIZE,
      idx, diffVal;
    for (idx = 0; idx < currentLength; idx++) {
      diffVal = partsArr[idx] + carryVal;
      carryVal = Math.floor(diffVal / chunkBase);
      diffVal %= chunkBase;
      resultArr[idx] = diffVal < 0 ? diffVal + chunkBase : diffVal;
    }
    resultArr = reconstructSmallNumber(resultArr);
    if (typeof resultArr === 'number') {
      if (isResultNegative)
        resultArr = -resultArr;
      return new CompactNumeric(resultArr);
    }
    return new LargeNumeric(resultArr, isResultNegative);
  }

  // LargeNumeric subtraction method
  LargeNumeric.prototype.deduct = function (inputVal) {
    var otherNum = processInput(inputVal);
    if (this.isNegativeFlag !== otherNum.isNegativeFlag) {
      return this.sum(otherNum.flipSign());
    }
    var currentParts = this.numericParts,
      otherParts = otherNum.numericParts;
    if (otherNum.isCompact)
      return subtractCompactValue(currentParts, Math.abs(otherParts), this.isNegativeFlag);
    return flexibleSubtraction(currentParts, otherParts, this.isNegativeFlag);
  };
  LargeNumeric.prototype.minusOp = LargeNumeric.prototype.deduct;

  // CompactNumeric subtraction method
  CompactNumeric.prototype.deduct = function (inputVal) {
    var otherNum = processInput(inputVal);
    var currentVal = this.numericParts;
    if (currentVal < 0 !== otherNum.isNegativeFlag) {
      return this.sum(otherNum.flipSign());
    }
    var otherVal = otherNum.numericParts;
    if (otherNum.isCompact) {
      return new CompactNumeric(currentVal - otherVal);
    }
    return subtractCompactValue(otherParts, Math.abs(currentVal), currentVal >= 0);
  };
  CompactNumeric.prototype.minusOp = CompactNumeric.prototype.deduct;

  // Flips the sign of the numeric object
  LargeNumeric.prototype.flipSign = function () {
    return new LargeNumeric(this.numericParts, !this.isNegativeFlag);
  };
  CompactNumeric.prototype.flipSign = function () {
    var currentSign = this.isNegativeFlag;
    var compactResult = new CompactNumeric(-this.numericParts);
    compactResult.isNegativeFlag = !currentSign;
    return compactResult;
  };

  // Returns the absolute value of the numeric object
  LargeNumeric.prototype.absoluteValue = function () {
    return new LargeNumeric(this.numericParts, false);
  };
  CompactNumeric.prototype.absoluteValue = function () {
    return new CompactNumeric(Math.abs(this.numericParts));
  };

  // Performs long multiplication of two numeric parts arrays
  function performLongMultiplication(firstParts, secondParts) {
    var lenA = firstParts.length,
      lenB = secondParts.length,
      resultLen = lenA + lenB,
      resultArr = makeZeroFilledArray(resultLen),
      chunkBase = CHUNK_SIZE,
      partialProduct, carryOver, idxA, partA, idxB, partB;
    for (idxA = 0; idxA < lenA; ++idxA) {
      partA = firstParts[idxA];
      for (idxB = 0; idxB < lenB; ++idxB) {
        partB = secondParts[idxB];
        partialProduct = partA * partB + resultArr[idxA + idxB];
        carryOver = Math.floor(partialProduct / chunkBase);
        resultArr[idxA + idxB] = partialProduct - carryOver * chunkBase;
        resultArr[idxA + idxB + 1] += carryOver;
      }
    }
    removeLeadingZeros(resultArr);
    return resultArr;
  }

  // Multiplies a numeric parts array by a small number
  function multiplyByCompact(partsArr, smallVal) {
    var currentLength = partsArr.length,
      resultArr = new Array(currentLength),
      chunkBase = CHUNK_SIZE,
      carryOver = 0,
      partialProduct, idx;
    for (idx = 0; idx < currentLength; idx++) {
      partialProduct = partsArr[idx] * smallVal + carryOver;
      carryOver = Math.floor(partialProduct / chunkBase);
      resultArr[idx] = partialProduct - carryOver * chunkBase;
    }
    while (carryOver > 0) {
      resultArr[idx++] = carryOver % chunkBase;
      carryOver = Math.floor(carryOver / chunkBase);
    }
    return resultArr;
  }

  // Shifts an array of numeric parts to the left (multiplies by powers of CHUNK_SIZE)
  function shiftDigitsLeft(partsArr, count) {
    var shiftedArr = [];
    while (count-- > 0)
      shiftedArr.push(0);
    return shiftedArr.concat(partsArr);
  }

  // Karatsuba multiplication algorithm for efficiency with large numbers
  function karatsubaProduct(xParts, yParts) {
    var splitPoint = Math.max(xParts.length, yParts.length);
    if (splitPoint <= 30)
      return performLongMultiplication(xParts, yParts);

    splitPoint = Math.ceil(splitPoint / 2);

    var bParts = xParts.slice(splitPoint),
      aParts = xParts.slice(0, splitPoint),
      dParts = yParts.slice(splitPoint),
      cParts = yParts.slice(0, splitPoint);

    var prodAC = karatsubaProduct(aParts, cParts),
      prodBD = karatsubaProduct(bParts, dParts),
      prodABCD = karatsubaProduct(flexibleAddition(aParts, bParts), flexibleAddition(cParts, dParts));

    var finalProduct = flexibleAddition(
      flexibleAddition(prodAC, shiftDigitsLeft(performSubtraction(performSubtraction(prodABCD, prodAC), prodBD), splitPoint)),
      shiftDigitsLeft(prodBD, 2 * splitPoint)
    );
    removeLeadingZeros(finalProduct);
    return finalProduct;
  }

  // Heuristic to decide whether to use Karatsuba multiplication
  function shouldUseKaratsuba(lenOne, lenTwo) {
    return -.012 * lenOne - .012 * lenTwo + 15e-6 * lenOne * lenTwo > 0;
  }

  // LargeNumeric multiplication method
  LargeNumeric.prototype.product = function (inputVal) {
    var otherNum = processInput(inputVal),
      currentParts = this.numericParts,
      otherParts = otherNum.numericParts,
      isResultNegative = this.isNegativeFlag !== otherNum.isNegativeFlag,
      absoluteOperand;
    if (otherNum.isCompact) {
      if (otherParts === 0)
        return NumericObject[0];
      if (otherParts === 1)
        return this;
      if (otherParts === -1)
        return this.flipSign();
      absoluteOperand = Math.abs(otherParts);
      if (absoluteOperand < CHUNK_SIZE) {
        return new LargeNumeric(multiplyByCompact(currentParts, absoluteOperand), isResultNegative);
      }
      otherParts = splitSmallNumber(absoluteOperand);
    }
    if (shouldUseKaratsuba(currentParts.length, otherParts.length))
      return new LargeNumeric(karatsubaProduct(currentParts, otherParts), isResultNegative);
    return new LargeNumeric(performLongMultiplication(currentParts, otherParts), isResultNegative);
  };
  LargeNumeric.prototype.timesOp = LargeNumeric.prototype.product;

  // Multiplies a small number (JS primitive) by a numeric parts array
  function compactTimesParts(smallVal, partsArr, isResultNegative) {
    if (smallVal < CHUNK_SIZE) {
      return new LargeNumeric(multiplyByCompact(partsArr, smallVal), isResultNegative);
    }
    return new LargeNumeric(performLongMultiplication(partsArr, splitSmallNumber(smallVal)), isResultNegative);
  }

  // Internal multiplication by a CompactNumeric for LargeNumeric
  LargeNumeric.prototype._calcProductWithCompact = function (compactOperand) {
    if (compactOperand.numericParts === 0)
      return NumericObject[0];
    if (compactOperand.numericParts === 1)
      return this;
    if (compactOperand.numericParts === -1)
      return this.flipSign();
    return compactTimesParts(Math.abs(compactOperand.numericParts), this.numericParts, this.isNegativeFlag !== compactOperand.isNegativeFlag);
  };

  // Internal multiplication by a CompactNumeric for CompactNumeric
  CompactNumeric.prototype._calcProductWithCompact = function (compactOperand) {
    if (canFitInJSNum(compactOperand.numericParts * this.numericParts)) {
      return new CompactNumeric(compactOperand.numericParts * this.numericParts);
    }
    return compactTimesParts(Math.abs(compactOperand.numericParts), splitSmallNumber(Math.abs(this.numericParts)), this.isNegativeFlag !== compactOperand.isNegativeFlag);
  };

  // CompactNumeric multiplication method
  CompactNumeric.prototype.product = function (inputVal) {
    return processInput(inputVal)._calcProductWithCompact(this);
  };
  CompactNumeric.prototype.timesOp = CompactNumeric.prototype.product;

  // Performs squaring of a numeric parts array
  function performSquaring(partsArr) {
    var currentLength = partsArr.length,
      resultArr = makeZeroFilledArray(currentLength + currentLength),
      chunkBase = CHUNK_SIZE,
      partialProduct, carryOver, idxA, valA, idxJ, valJ;
    for (idxA = 0; idxA < currentLength; idxA++) {
      valA = partsArr[idxA];
      carryOver = 0 - valA * valA; // Initialize carry with diagonal term
      for (idxJ = idxA; idxJ < currentLength; idxJ++) {
        valJ = partsArr[idxJ];
        partialProduct = 2 * (valA * valJ) + resultArr[idxA + idxJ] + carryOver;
        carryOver = Math.floor(partialProduct / chunkBase);
        resultArr[idxA + idxJ] = partialProduct - carryOver * chunkBase;
      }
      resultArr[idxA + currentLength] = carryOver;
    }
    removeLeadingZeros(resultArr);
    return resultArr;
  }

  // LargeNumeric squaring method
  LargeNumeric.prototype.powerOfTwo = function () {
    return new LargeNumeric(performSquaring(this.numericParts), false);
  };

  // CompactNumeric squaring method
  CompactNumeric.prototype.powerOfTwo = function () {
    var squaredVal = this.numericParts * this.numericParts;
    if (canFitInJSNum(squaredVal))
      return new CompactNumeric(squaredVal);
    return new LargeNumeric(performSquaring(splitSmallNumber(Math.abs(this.numericParts))), false);
  };

  // Division with remainder, method 1 (Knuth's algorithm D)
  function divisionAlgorithmA(dividendParts, divisorParts) {
    var lenA = dividendParts.length,
      lenB = divisorParts.length,
      resultArr = makeZeroFilledArray(lenB),
      chunkBase = CHUNK_SIZE,
      leadingDivisorDigit = divisorParts[lenB - 1],
      normalizationFactor = Math.ceil(chunkBase / (2 * leadingDivisorDigit)),
      scaledRemainder = multiplyByCompact(dividendParts, normalizationFactor),
      scaledDivisor = multiplyByCompact(divisorParts, normalizationFactor),
      stepQuotient, positionShift, carryOver, borrowVal, idx, innerLen, tempQuotient;

    if (scaledRemainder.length <= lenA)
      scaledRemainder.push(0);
    scaledDivisor.push(0);
    leadingDivisorDigit = scaledDivisor[lenB - 1];

    for (positionShift = lenA - lenB; positionShift >= 0; positionShift--) {
      stepQuotient = chunkBase - 1;
      if (scaledRemainder[positionShift + lenB] !== leadingDivisorDigit) {
        stepQuotient = Math.floor((scaledRemainder[positionShift + lenB] * chunkBase + scaledRemainder[positionShift + lenB - 1]) / leadingDivisorDigit);
      }

      carryOver = 0;
      borrowVal = 0;
      innerLen = scaledDivisor.length;
      for (idx = 0; idx < innerLen; idx++) {
        carryOver += stepQuotient * scaledDivisor[idx];
        tempQuotient = Math.floor(carryOver / chunkBase);
        borrowVal += scaledRemainder[positionShift + idx] - (carryOver - tempQuotient * chunkBase);
        carryOver = tempQuotient;
        if (borrowVal < 0) {
          scaledRemainder[positionShift + idx] = borrowVal + chunkBase;
          borrowVal = -1;
        } else {
          scaledRemainder[positionShift + idx] = borrowVal;
          borrowVal = 0;
        }
      }

      while (borrowVal !== 0) {
        stepQuotient -= 1;
        carryOver = 0;
        for (idx = 0; idx < innerLen; idx++) {
          carryOver += scaledRemainder[positionShift + idx] - chunkBase + scaledDivisor[idx];
          if (carryOver < 0) {
            scaledRemainder[positionShift + idx] = carryOver + chunkBase;
            carryOver = 0;
          } else {
            scaledRemainder[positionShift + idx] = carryOver;
            carryOver = 1;
          }
        }
        borrowVal += carryOver;
      }
      resultArr[positionShift] = stepQuotient;
    }
    scaledRemainder = divideByCompact(scaledRemainder, normalizationFactor)[0];
    return [reconstructSmallNumber(resultArr), reconstructSmallNumber(scaledRemainder)];
  }

  // Division with remainder, method 2 (simpler long division)
  function divisionAlgorithmB(dividendParts, divisorParts) {
    var lenA = dividendParts.length,
      lenB = divisorParts.length,
      quotientResult = [],
      dividendSegment = [],
      chunkBase = CHUNK_SIZE,
      trialQuotient, dividendPartLen, highDividend, highDivisor, checkProduct;

    while (lenA) {
      dividendSegment.unshift(dividendParts[--lenA]);
      removeLeadingZeros(dividendSegment);
      if (compareAbsoluteValues(dividendSegment, divisorParts) < 0) {
        quotientResult.push(0);
        continue;
      }

      dividendPartLen = dividendSegment.length;
      highDividend = dividendSegment[dividendPartLen - 1] * chunkBase + dividendSegment[dividendPartLen - 2];
      highDivisor = divisorParts[lenB - 1] * chunkBase + divisorParts[lenB - 2];
      if (dividendPartLen > lenB) {
        highDividend = (highDividend + 1) * chunkBase;
      }
      trialQuotient = Math.ceil(highDividend / highDivisor);

      do {
        checkProduct = multiplyByCompact(divisorParts, trialQuotient);
        if (compareAbsoluteValues(checkProduct, dividendSegment) <= 0)
          break;
        trialQuotient--;
      } while (trialQuotient);

      quotientResult.push(trialQuotient);
      dividendSegment = performSubtraction(dividendSegment, checkProduct);
    }
    quotientResult.reverse();
    return [reconstructSmallNumber(quotientResult), reconstructSmallNumber(dividendSegment)];
  }

  // Divides a numeric parts array by a small number
  function divideByCompact(partsArr, smallDivisor) {
    var currentLength = partsArr.length,
      quotientArr = makeZeroFilledArray(currentLength),
      chunkBase = CHUNK_SIZE,
      idx, tempQuotient, remainderVal, divisorVal;

    remainderVal = 0;
    for (idx = currentLength - 1; idx >= 0; --idx) {
      divisorVal = remainderVal * chunkBase + partsArr[idx];
      tempQuotient = discardFraction(divisorVal / smallDivisor);
      remainderVal = divisorVal - tempQuotient * smallDivisor;
      quotientArr[idx] = tempQuotient | 0;
    }
    return [quotientArr, remainderVal | 0];
  }

  // Generic division with remainder for any numeric types
  function anyDivMod(selfOperand, otherOperand) {
    var resultPair, otherNum = processInput(otherOperand);
    var firstParts = selfOperand.numericParts,
      secondParts = otherNum.numericParts;
    var finalQuotient;

    if (secondParts === 0)
      throw new Error("Cannot divide by zero");

    if (selfOperand.isCompact) {
      if (otherNum.isCompact) {
        return [new CompactNumeric(discardFraction(firstParts / secondParts)), new CompactNumeric(firstParts % secondParts)];
      }
      return [NumericObject[0], selfOperand];
    }

    if (otherNum.isCompact) {
      if (secondParts === 1)
        return [selfOperand, NumericObject[0]];
      if (secondParts === -1)
        return [selfOperand.flipSign(), NumericObject[0]];

      var absoluteDivisor = Math.abs(secondParts);
      if (absoluteDivisor < CHUNK_SIZE) {
        resultPair = divideByCompact(firstParts, absoluteDivisor);
        finalQuotient = reconstructSmallNumber(resultPair[0]);
        var remainderVal = resultPair[1];
        if (selfOperand.isNegativeFlag)
          remainderVal = -remainderVal;

        if (typeof finalQuotient === 'number') {
          if (selfOperand.isNegativeFlag !== otherNum.isNegativeFlag)
            finalQuotient = -finalQuotient;
          return [new CompactNumeric(finalQuotient), new CompactNumeric(remainderVal)];
        }
        return [new LargeNumeric(finalQuotient, selfOperand.isNegativeFlag !== otherNum.isNegativeFlag), new CompactNumeric(remainderVal)];
      }
      secondParts = splitSmallNumber(absoluteDivisor);
    }

    var comparisonResult = compareAbsoluteValues(firstParts, secondParts);
    if (comparisonResult === -1)
      return [NumericObject[0], selfOperand];
    if (comparisonResult === 0)
      return [NumericObject[selfOperand.isNegativeFlag === otherNum.isNegativeFlag ? 1 : -1], NumericObject[0]];

    if (firstParts.length + secondParts.length <= 200)
      resultPair = divisionAlgorithmA(firstParts, secondParts);
    else
      resultPair = divisionAlgorithmB(firstParts, secondParts);

    finalQuotient = resultPair[0];
    var quotientIsNegative = selfOperand.isNegativeFlag !== otherNum.isNegativeFlag,
      modResult = resultPair[1],
      remainderIsNegative = selfOperand.isNegativeFlag;

    if (typeof finalQuotient === 'number') {
      if (quotientIsNegative)
        finalQuotient = -finalQuotient;
      finalQuotient = new CompactNumeric(finalQuotient);
    } else
      finalQuotient = new LargeNumeric(finalQuotient, quotientIsNegative);

    if (typeof modResult === 'number') {
      if (remainderIsNegative)
        modResult = -modResult;
      modResult = new CompactNumeric(modResult);
    } else
      modResult = new LargeNumeric(modResult, remainderIsNegative);

    return [finalQuotient, modResult];
  }

  // LargeNumeric divmod method
  LargeNumeric.prototype.quotientRemainder = function (inputVal) {
    var resultPair = anyDivMod(this, inputVal);
    return {
      quotient: resultPair[0],
      remainder: resultPair[1]
    };
  };
  CompactNumeric.prototype.quotientRemainder = LargeNumeric.prototype.quotientRemainder;

  // LargeNumeric divide method
  LargeNumeric.prototype.quotientResult = function (inputVal) {
    return anyDivMod(this, inputVal)[0];
  };
  CompactNumeric.prototype.divSymbol = CompactNumeric.prototype.quotientResult = LargeNumeric.prototype.divSymbol = LargeNumeric.prototype.quotientResult;

  // LargeNumeric modulo method
  LargeNumeric.prototype.remainderResult = function (inputVal) {
    return anyDivMod(this, inputVal)[1];
  };
  CompactNumeric.prototype.modSymbol = CompactNumeric.prototype.remainderResult = LargeNumeric.prototype.modSymbol = LargeNumeric.prototype.remainderResult;

  // LargeNumeric power method
  LargeNumeric.prototype.exponentiate = function (inputVal) {
    var exponentVal = processInput(inputVal),
      baseParts = this.numericParts,
      expVal = exponentVal.numericParts,
      computedVal, baseNum, powerAccumulator;

    if (expVal === 0)
      return NumericObject[1];
    if (baseParts === 0)
      return NumericObject[0];
    if (baseParts === 1)
      return NumericObject[1];
    if (baseParts === -1)
      return exponentVal.checkEven() ? NumericObject[1] : NumericObject[-1];
    if (exponentVal.isNegativeFlag) {
      return NumericObject[0];
    }
    if (!exponentVal.isCompact)
      throw new Error("The exponent " + exponentVal.toTextString() + " is too large.");

    if (this.isCompact) {
      if (canFitInJSNum(computedVal = Math.pow(baseParts, expVal)))
        return new CompactNumeric(discardFraction(computedVal));
    }

    baseNum = this;
    powerAccumulator = NumericObject[1];
    while (true) {
      if ((expVal & 1) === 1) {
        powerAccumulator = powerAccumulator.timesOp(baseNum);
        --expVal;
      }
      if (expVal === 0)
        break;
      expVal /= 2;
      baseNum = baseNum.powerOfTwo();
    }
    return powerAccumulator;
  };
  CompactNumeric.prototype.exponentiate = LargeNumeric.prototype.exponentiate;

  // LargeNumeric modular exponentiation method
  LargeNumeric.prototype.modularExponentiation = function (exponentOperand, modulusOperand) {
    exponentOperand = processInput(exponentOperand);
    modulusOperand = processInput(modulusOperand);
    if (modulusOperand.isNaught())
      throw new Error("Cannot take modPow with modulus 0");

    var resultAccumulator = NumericObject[1],
      currentBase = this.remainderResult(modulusOperand);
    while (exponentOperand.checkPositive()) {
      if (currentBase.isNaught())
        return NumericObject[0];
      if (exponentOperand.checkOdd())
        resultAccumulator = resultAccumulator.product(currentBase).remainderResult(modulusOperand);
      exponentOperand = exponentOperand.quotientResult(2);
      currentBase = currentBase.powerOfTwo().remainderResult(modulusOperand);
    }
    return resultAccumulator;
  };
  CompactNumeric.prototype.modularExponentiation = LargeNumeric.prototype.modularExponentiation;

  // Compares the absolute values of two numeric parts arrays
  function compareAbsoluteValues(firstParts, secondParts) {
    if (firstParts.length !== secondParts.length) {
      return firstParts.length > secondParts.length ? 1 : -1;
    }
    for (var idx = firstParts.length - 1; idx >= 0; idx--) {
      if (firstParts[idx] !== secondParts[idx])
        return firstParts[idx] > secondParts[idx] ? 1 : -1;
    }
    return 0;
  }

  // LargeNumeric compare absolute values method
  LargeNumeric.prototype.compareMagnitudes = function (inputVal) {
    var otherNum = processInput(inputVal),
      currentParts = this.numericParts,
      otherParts = otherNum.numericParts;
    if (otherNum.isCompact)
      return 1; // A LargeNumeric is always "larger" in comparison context than a CompactNumeric if both are positive
    return compareAbsoluteValues(currentParts, otherParts);
  };

  // CompactNumeric compare absolute values method
  CompactNumeric.prototype.compareMagnitudes = function (inputVal) {
    var otherNum = processInput(inputVal),
      absoluteCurrent = Math.abs(this.numericParts),
      otherParts = otherNum.numericParts;
    if (otherNum.isCompact) {
      otherParts = Math.abs(otherParts);
      return absoluteCurrent === otherParts ? 0 : absoluteCurrent > otherParts ? 1 : -1;
    }
    return -1; // A CompactNumeric is always "smaller" in comparison context than a LargeNumeric
  };

  // LargeNumeric compare method
  LargeNumeric.prototype.compareValues = function (inputVal) {
    if (inputVal === Infinity) {
      return -1;
    }
    if (inputVal === -Infinity) {
      return 1;
    }
    var otherNum = processInput(inputVal),
      currentParts = this.numericParts,
      otherParts = otherNum.numericParts;
    if (this.isNegativeFlag !== otherNum.isNegativeFlag) {
      return otherNum.isNegativeFlag ? 1 : -1;
    }
    if (otherNum.isCompact) {
      return this.isNegativeFlag ? -1 : 1; // If signs are same, LargeNumeric vs CompactNumeric
    }
    return compareAbsoluteValues(currentParts, otherParts) * (this.isNegativeFlag ? -1 : 1);
  };
  LargeNumeric.prototype.valCompareTo = LargeNumeric.prototype.compareValues;

  // CompactNumeric compare method
  CompactNumeric.prototype.compareValues = function (inputVal) {
    if (inputVal === Infinity) {
      return -1;
    }
    if (inputVal === -Infinity) {
      return 1;
    }
    var otherNum = processInput(inputVal),
      currentVal = this.numericParts,
      otherVal = otherNum.numericParts;
    if (otherNum.isCompact) {
      return currentVal == otherVal ? 0 : currentVal > otherVal ? 1 : -1;
    }
    if (currentVal < 0 !== otherNum.isNegativeFlag) {
      return currentVal < 0 ? -1 : 1; // Different signs
    }
    return currentVal < 0 ? 1 : -1; // Same sign, but CompactNumeric is larger/smaller than LargeNumeric
  };
  CompactNumeric.prototype.valCompareTo = CompactNumeric.prototype.compareValues;

  // LargeNumeric equality check
  LargeNumeric.prototype.isEqualTo = function (inputVal) {
    return this.compareValues(inputVal) === 0;
  };
  CompactNumeric.prototype.equalityOp = CompactNumeric.prototype.isEqualTo = LargeNumeric.prototype.equalityOp = LargeNumeric.prototype.isEqualTo;

  // LargeNumeric inequality check
  LargeNumeric.prototype.isNotEqualTo = function (inputVal) {
    return this.compareValues(inputVal) !== 0;
  };
  CompactNumeric.prototype.unequalityOp = CompactNumeric.prototype.isNotEqualTo = LargeNumeric.prototype.unequalityOp = LargeNumeric.prototype.isNotEqualTo;

  // LargeNumeric greater than check
  LargeNumeric.prototype.isLargerThan = function (inputVal) {
    return this.compareValues(inputVal) > 0;
  };
  CompactNumeric.prototype.greaterThanOp = CompactNumeric.prototype.isLargerThan = LargeNumeric.prototype.greaterThanOp = LargeNumeric.prototype.isLargerThan;

  // LargeNumeric less than check
  LargeNumeric.prototype.isSmallerThan = function (inputVal) {
    return this.compareValues(inputVal) < 0;
  };
  CompactNumeric.prototype.lessThanOp = CompactNumeric.prototype.isSmallerThan = LargeNumeric.prototype.lessThanOp = LargeNumeric.prototype.isSmallerThan;

  // LargeNumeric greater than or equal check
  LargeNumeric.prototype.isLargerOrEqualTo = function (inputVal) {
    return this.compareValues(inputVal) >= 0;
  };
  CompactNumeric.prototype.greaterEqualOp = CompactNumeric.prototype.isLargerOrEqualTo = LargeNumeric.prototype.greaterEqualOp = LargeNumeric.prototype.isLargerOrEqualTo;

  // LargeNumeric less than or equal check
  LargeNumeric.prototype.isSmallerOrEqualTo = function (inputVal) {
    return this.compareValues(inputVal) <= 0;
  };
  CompactNumeric.prototype.lessEqualOp = CompactNumeric.prototype.isSmallerOrEqualTo = LargeNumeric.prototype.lessEqualOp = LargeNumeric.prototype.isSmallerOrEqualTo;

  // LargeNumeric even check
  LargeNumeric.prototype.checkEven = function () {
    return (this.numericParts[0] & 1) === 0;
  };
  CompactNumeric.prototype.checkEven = function () {
    return (this.numericParts & 1) === 0;
  };

  // LargeNumeric odd check
  LargeNumeric.prototype.checkOdd = function () {
    return (this.numericParts[0] & 1) === 1;
  };
  CompactNumeric.prototype.checkOdd = function () {
    return (this.numericParts & 1) === 1;
  };

  // LargeNumeric positive check
  LargeNumeric.prototype.checkPositive = function () {
    return !this.isNegativeFlag;
  };
  CompactNumeric.prototype.checkPositive = function () {
    return this.numericParts > 0;
  };

  // LargeNumeric negative check
  LargeNumeric.prototype.checkNegative = function () {
    return this.isNegativeFlag;
  };
  CompactNumeric.prototype.checkNegative = function () {
    return this.numericParts < 0;
  };

  // LargeNumeric unit check (1 or -1)
  LargeNumeric.prototype.checkUnit = function () {
    return false;
  };
  CompactNumeric.prototype.checkUnit = function () {
    return Math.abs(this.numericParts) === 1;
  };

  // LargeNumeric zero check
  LargeNumeric.prototype.isNaught = function () {
    return false;
  };
  CompactNumeric.prototype.isNaught = function () {
    return this.numericParts === 0;
  };

  // LargeNumeric divisibility check
  LargeNumeric.prototype.checkDivisibility = function (inputVal) {
    var otherNum = processInput(inputVal);
    var divisorVal = otherNum.numericParts;
    if (divisorVal === 0)
      return false;
    if (divisorVal === 1)
      return true;
    if (divisorVal === 2)
      return this.checkEven();
    return this.remainderResult(otherNum).isEqualTo(NumericObject[0]);
  };
  CompactNumeric.prototype.checkDivisibility = LargeNumeric.prototype.checkDivisibility;

  // Checks for basic primality (small primes)
  function checkSimplePrime(numObj) {
    var absoluteNum = numObj.absoluteValue();
    if (absoluteNum.checkUnit())
      return false;
    if (absoluteNum.isEqualTo(2) || absoluteNum.isEqualTo(3) || absoluteNum.isEqualTo(5))
      return true;
    if (absoluteNum.checkEven() || absoluteNum.checkDivisibility(3) || absoluteNum.checkDivisibility(5))
      return false;
    if (absoluteNum.isSmallerThan(25))
      return true; // Numbers like 7, 11, 13, 17, 19, 23 (not divisible by 2,3,5)
  }

  // LargeNumeric primality test (Miller-Rabin)
  LargeNumeric.prototype.checkPrime = function () {
    var isSimple = checkSimplePrime(this);
    if (isSimple !== unassigned)
      return isSimple;

    var absoluteNum = this.absoluteValue(),
      prevNum = absoluteNum.predecessor();
    var testPrimes = [2, 3, 5, 7, 11, 13, 17, 19],
      tempB = prevNum,
      divisor, testFlag, idx, testVal;

    while (tempB.checkEven())
      tempB = tempB.quotientResult(2);

    for (idx = 0; idx < testPrimes.length; idx++) {
      testVal = largeNumber(testPrimes[idx]).modularExponentiation(tempB, absoluteNum);
      if (testVal.isEqualTo(NumericObject[1]) || testVal.isEqualTo(prevNum))
        continue;

      for (testFlag = true, divisor = tempB; testFlag && divisor.isSmallerThan(prevNum); divisor = divisor.product(2)) {
        testVal = testVal.powerOfTwo().remainderResult(absoluteNum);
        if (testVal.isEqualTo(prevNum))
          testFlag = false;
      }
      if (testFlag)
        return false;
    }
    return true;
  };
  CompactNumeric.prototype.checkPrime = LargeNumeric.prototype.checkPrime;

  // LargeNumeric probable primality test
  LargeNumeric.prototype.checkProbablePrime = function (iterationsCnt) {
    var isSimple = checkSimplePrime(this);
    if (isSimple !== unassigned)
      return isSimple;

    var absoluteNum = this.absoluteValue();
    var testIterations = iterationsCnt === unassigned ? 5 : iterationsCnt;
    for (var idx = 0; idx < testIterations; idx++) {
      var randomBase = largeNumber.randomBetween(2, absoluteNum.deduct(2));
      if (!randomBase.modularExponentiation(absoluteNum.predecessor(), absoluteNum).checkUnit())
        return false;
    }
    return true;
  };
  CompactNumeric.prototype.checkProbablePrime = LargeNumeric.prototype.checkProbablePrime;

  // LargeNumeric modular inverse method
  LargeNumeric.prototype.modularInverse = function (modulusNum) {
    var tempT = largeNumber.zero,
      nextT = largeNumber.one,
      remainderR = processInput(modulusNum),
      nextR = this.absoluteValue(),
      quotientVal, previousT, previousR;

    while (!nextR.isEqualTo(largeNumber.zero)) {
      quotientVal = remainderR.quotientResult(nextR);
      previousT = tempT;
      previousR = remainderR;
      tempT = nextT;
      remainderR = nextR;
      nextT = previousT.deduct(quotientVal.product(nextT));
      nextR = previousR.deduct(quotientVal.product(nextR));
    }
    if (!remainderR.isEqualTo(1))
      throw new Error(this.toTextString() + " and " + modulusNum.toTextString() + " are not co-prime");
    if (tempT.compareValues(0) === -1) {
      tempT = tempT.sum(modulusNum);
    }
    if (this.checkNegative()) {
      return tempT.flipSign();
    }
    return tempT;
  };
  CompactNumeric.prototype.modularInverse = LargeNumeric.prototype.modularInverse;

  // LargeNumeric increment method
  LargeNumeric.prototype.successor = function () {
    var currentParts = this.numericParts;
    if (this.isNegativeFlag) {
      return subtractCompactValue(currentParts, 1, this.isNegativeFlag);
    }
    return new LargeNumeric(addCompactValue(currentParts, 1), this.isNegativeFlag);
  };
  CompactNumeric.prototype.successor = function () {
    var currentVal = this.numericParts;
    if (currentVal + 1 < MAX_SAFE_JS_VALUE)
      return new CompactNumeric(currentVal + 1);
    return new LargeNumeric(MAX_SAFE_JS_PARTS, false);
  };

  // LargeNumeric decrement method
  LargeNumeric.prototype.predecessor = function () {
    var currentParts = this.numericParts;
    if (this.isNegativeFlag) {
      return new LargeNumeric(addCompactValue(currentParts, 1), true);
    }
    return subtractCompactValue(currentParts, 1, this.isNegativeFlag);
  };
  CompactNumeric.prototype.predecessor = function () {
    var currentVal = this.numericParts;
    if (currentVal - 1 > -MAX_SAFE_JS_VALUE)
      return new CompactNumeric(currentVal - 1);
    return new LargeNumeric(MAX_SAFE_JS_PARTS, true);
  };

  // Pre-calculate powers of two up to CHUNK_SIZE
  var twoPowers = [1];
  while (2 * twoPowers[twoPowers.length - 1] <= CHUNK_SIZE)
    twoPowers.push(2 * twoPowers[twoPowers.length - 1]);
  var twoPowersCount = twoPowers.length,
    largestTwoPower = twoPowers[twoPowersCount - 1];

  // Helper to check if shift amount is small enough for direct JS number conversion
  function isSmallShiftAmount(shiftAmount) {
    return (typeof shiftAmount === 'number' || typeof shiftAmount === 'string') && +Math.abs(shiftAmount) <= CHUNK_SIZE || shiftAmount instanceof LargeNumeric && shiftAmount.numericParts.length <= 1;
  }

  // LargeNumeric bitwise left shift
  LargeNumeric.prototype.leftShiftBits = function (shiftAmount) {
    if (!isSmallShiftAmount(shiftAmount)) {
      throw new Error(String(shiftAmount) + " is too large for shifting.");
    }
    shiftAmount = +shiftAmount;
    if (shiftAmount < 0)
      return this.rightShiftBits(-shiftAmount);

    var currentResult = this;
    if (currentResult.isNaught())
      return currentResult;

    while (shiftAmount >= twoPowersCount) {
      currentResult = currentResult.product(largestTwoPower);
      shiftAmount -= twoPowersCount - 1;
    }
    return currentResult.product(twoPowers[shiftAmount]);
  };
  CompactNumeric.prototype.leftShiftBits = LargeNumeric.prototype.leftShiftBits;

  // LargeNumeric bitwise right shift
  LargeNumeric.prototype.rightShiftBits = function (shiftAmount) {
    var divisionResult;
    if (!isSmallShiftAmount(shiftAmount)) {
      throw new Error(String(shiftAmount) + " is too large for shifting.");
    }
    shiftAmount = +shiftAmount;
    if (shiftAmount < 0)
      return this.leftShiftBits(-shiftAmount);

    var currentResult = this;
    while (shiftAmount >= twoPowersCount) {
      if (currentResult.isNaught() || currentResult.checkNegative() && currentResult.checkUnit())
        return currentResult;
      divisionResult = anyDivMod(currentResult, largestTwoPower);
      currentResult = divisionResult[1].checkNegative() ? divisionResult[0].predecessor() : divisionResult[0];
      shiftAmount -= twoPowersCount - 1;
    }
    divisionResult = anyDivMod(currentResult, twoPowers[shiftAmount]);
    return divisionResult[1].checkNegative() ? divisionResult[0].predecessor() : divisionResult[0];
  };
  CompactNumeric.prototype.rightShiftBits = LargeNumeric.prototype.rightShiftBits;

  // Generic bitwise operation handler
  function performBitwiseOperation(firstNum, secondNum, operationFn) {
    secondNum = processInput(secondNum);
    var xIsNegative = firstNum.checkNegative(),
      yIsNegative = secondNum.checkNegative();
    var xRemaining = xIsNegative ? firstNum.bitwiseNot() : firstNum,
      yRemaining = yIsNegative ? secondNum.bitwiseNot() : secondNum;
    var xCurrentDigit = 0,
      yCurrentDigit = 0;
    var xDivisionModulus = null,
      yDivisionModulus = null;
    var resultDigits = [];

    while (!xRemaining.isNaught() || !yRemaining.isNaught()) {
      xDivisionModulus = anyDivMod(xRemaining, largestTwoPower);
      xCurrentDigit = xDivisionModulus[1].toJavaScriptNumber();
      if (xIsNegative) {
        xCurrentDigit = largestTwoPower - 1 - xCurrentDigit;
      }
      yDivisionModulus = anyDivMod(yRemaining, largestTwoPower);
      yCurrentDigit = yDivisionModulus[1].toJavaScriptNumber();
      if (yIsNegative) {
        yCurrentDigit = largestTwoPower - 1 - yCurrentDigit;
      }
      xRemaining = xDivisionModulus[0];
      yRemaining = yDivisionModulus[0];
      resultDigits.push(operationFn(xCurrentDigit, yCurrentDigit));
    }

    var bitwiseSum = operationFn(xIsNegative ? 1 : 0, yIsNegative ? 1 : 0) !== 0 ? largeNumber(-1) : largeNumber(0);
    for (var idx = resultDigits.length - 1; idx >= 0; idx -= 1) {
      bitwiseSum = bitwiseSum.product(largestTwoPower).sum(largeNumber(resultDigits[idx]));
    }
    return bitwiseSum;
  }

  // LargeNumeric bitwise NOT
  LargeNumeric.prototype.bitwiseNot = function () {
    return this.flipSign().predecessor();
  };
  CompactNumeric.prototype.bitwiseNot = LargeNumeric.prototype.bitwiseNot;

  // LargeNumeric bitwise AND
  LargeNumeric.prototype.bitwiseAnd = function (inputNum) {
    return performBitwiseOperation(this, inputNum, function (a, b) {
      return a & b;
    });
  };
  CompactNumeric.prototype.bitwiseAnd = LargeNumeric.prototype.bitwiseAnd;

  // LargeNumeric bitwise OR
  LargeNumeric.prototype.bitwiseOr = function (inputNum) {
    return performBitwiseOperation(this, inputNum, function (a, b) {
      return a | b;
    });
  };
  CompactNumeric.prototype.bitwiseOr = LargeNumeric.prototype.bitwiseOr;

  // LargeNumeric bitwise XOR
  LargeNumeric.prototype.bitwiseXor = function (inputNum) {
    return performBitwiseOperation(this, inputNum, function (a, b) {
      return a ^ b;
    });
  };
  CompactNumeric.prototype.bitwiseXor = LargeNumeric.prototype.bitwiseXor;

  // Constants for rough LOB calculation
  var LOB_MASK_JS_INT = 1 << 30,
    LOB_MASK_LARGE_NUM = (CHUNK_SIZE & -CHUNK_SIZE) * (CHUNK_SIZE & -CHUNK_SIZE) | LOB_MASK_JS_INT;

  // Rough estimate of Lowest One Bit (LOB)
  function lowestBitEstimate(numObj) {
    var digitVal = numObj.numericParts,
      xVal = typeof digitVal === 'number' ? digitVal | LOB_MASK_JS_INT : digitVal[0] + digitVal[1] * CHUNK_SIZE | LOB_MASK_LARGE_NUM;
    return xVal & -xVal;
  }

  // Calculates integer logarithm
  function calcIntegerLog(targetValue, baseValue) {
    if (baseValue.compareValues(targetValue) <= 0) {
      var tempLogResult = calcIntegerLog(targetValue, baseValue.powerOfTwo());
      var powerResult = tempLogResult.p;
      var exponentResult = tempLogResult.e;
      var intermediateProduct = powerResult.product(baseValue);
      return intermediateProduct.compareValues(targetValue) <= 0 ? {
        p: intermediateProduct,
        e: exponentResult * 2 + 1
      } : {
        p: powerResult,
        e: exponentResult * 2
      };
    }
    return {
      p: largeNumber(1),
      e: 0
    };
  }

  // LargeNumeric bit length method
  LargeNumeric.prototype.bitCount = function () {
    var currentNum = this;
    if (currentNum.compareValues(largeNumber(0)) < 0) {
      currentNum = currentNum.flipSign().deduct(largeNumber(1));
    }
    if (currentNum.compareValues(largeNumber(0)) === 0) {
      return largeNumber(0);
    }
    return largeNumber(calcIntegerLog(currentNum, largeNumber(2)).e).sum(largeNumber(1));
  };
  CompactNumeric.prototype.bitCount = LargeNumeric.prototype.bitCount;

  // Finds the maximum of two numeric objects
  function getLargest(firstVal, secondVal) {
    firstVal = processInput(firstVal);
    secondVal = processInput(secondVal);
    return firstVal.isLargerThan(secondVal) ? firstVal : secondVal;
  }

  // Finds the minimum of two numeric objects
  function getSmallest(firstVal, secondVal) {
    firstVal = processInput(firstVal);
    secondVal = processInput(secondVal);
    return firstVal.isSmallerThan(secondVal) ? firstVal : secondVal;
  }

  // Calculates the greatest common divisor (GCD)
  function greatestCommonDivisor(firstVal, secondVal) {
    firstVal = processInput(firstVal).absoluteValue();
    secondVal = processInput(secondVal).absoluteValue();
    if (firstVal.isEqualTo(secondVal))
      return firstVal;
    if (firstVal.isNaught())
      return secondVal;
    if (secondVal.isNaught())
      return firstVal;

    var commonFactor = NumericObject[1],
      gcdFactor, tempSwap;
    while (firstVal.checkEven() && secondVal.checkEven()) {
      gcdFactor = Math.min(lowestBitEstimate(firstVal), lowestBitEstimate(secondVal));
      firstVal = firstVal.quotientResult(gcdFactor);
      secondVal = secondVal.quotientResult(gcdFactor);
      commonFactor = commonFactor.product(gcdFactor);
    }
    while (firstVal.checkEven()) {
      firstVal = firstVal.quotientResult(lowestBitEstimate(firstVal));
    }
    do {
      while (secondVal.checkEven()) {
        secondVal = secondVal.quotientResult(lowestBitEstimate(secondVal));
      }
      if (firstVal.isLargerThan(secondVal)) {
        tempSwap = secondVal;
        secondVal = firstVal;
        firstVal = tempSwap;
      }
      secondVal = secondVal.deduct(firstVal);
    } while (!secondVal.isNaught());
    return commonFactor.checkUnit() ? firstVal : firstVal.product(commonFactor);
  }

  // Calculates the least common multiple (LCM)
  function leastCommonMultiple(firstVal, secondVal) {
    firstVal = processInput(firstVal).absoluteValue();
    secondVal = processInput(secondVal).absoluteValue();
    return firstVal.quotientResult(greatestCommonDivisor(firstVal, secondVal)).product(secondVal);
  }

  // Generates a random number between two bounds
  function randomBetween(lowerBound, upperBound) {
    lowerBound = processInput(lowerBound);
    upperBound = processInput(upperBound);
    var lower = getSmallest(lowerBound, upperBound),
      upper = getLargest(lowerBound, upperBound);
    var valueRange = upper.deduct(lower).sum(1);

    if (valueRange.isCompact)
      return lower.sum(Math.floor(Math.random() * valueRange.numericParts));

    var segmentCount = valueRange.numericParts.length - 1;
    var resultDigits = [],
      isRestricted = true;

    for (var idx = segmentCount; idx >= 0; idx--) {
      var upperLimit = isRestricted ? valueRange.numericParts[idx] : CHUNK_SIZE;
      var randomDigit = discardFraction(Math.random() * upperLimit);
      resultDigits.unshift(randomDigit);
      if (randomDigit < upperLimit)
        isRestricted = false;
    }
    resultDigits = reconstructSmallNumber(resultDigits);
    return lower.sum(typeof resultDigits === 'number' ? new CompactNumeric(resultDigits) : new LargeNumeric(resultDigits, false));
  }

  // Parses a string representation of a number from a given base
  var parseFromBase = function (numericText, numericBase) {
    var textLength = numericText.length;
    var idx;
    var absoluteBase = Math.abs(numericBase);

    // Initial validation for digits in the given base
    for (idx = 0; idx < textLength; idx++) {
      var currentCharacter = numericText[idx].toLowerCase();
      if (currentCharacter === "-")
        continue;
      if (/[a-z0-9]/.test(currentCharacter)) {
        if (/[0-9]/.test(currentCharacter) && +currentCharacter >= absoluteBase) {
          if (currentCharacter === "1" && absoluteBase === 1)
            continue;
          throw new Error(currentCharacter + " is not a valid digit in base " + numericBase + ".");
        } else if (currentCharacter.charCodeAt(0) - 87 >= absoluteBase) {
          throw new Error(currentCharacter + " is not a valid digit in base " + numericBase + ".");
        }
      }
    }

    // Handle small bases and numbers that fit in JS integers
    if (2 <= numericBase && numericBase <= 36) {
      if (textLength <= LOG_MAX_SAFE_JS_VALUE / Math.log(numericBase)) {
        var jsParsedResult = parseInt(numericText, numericBase);
        if (isNaN(jsParsedResult)) {
          throw new Error(currentCharacter + " is not a valid digit in base " + numericBase + ".");
        }
        return new CompactNumeric(parseInt(numericText, numericBase));
      }
    }

    numericBase = processInput(numericBase);
    var digitObjects = [];
    var isNegative = numericText[0] === "-";

    for (idx = isNegative ? 1 : 0; idx < numericText.length; idx++) {
      var currentCharacter = numericText[idx].toLowerCase(),
        characterCode = currentCharacter.charCodeAt(0);
      if (48 <= characterCode && characterCode <= 57)
        digitObjects.push(processInput(currentCharacter));
      else if (97 <= characterCode && characterCode <= 122)
        digitObjects.push(processInput(currentCharacter.charCodeAt(0) - 87));
      else if (currentCharacter === "<") {
        var startIndex = idx;
        do {
          idx++;
        } while (numericText[idx] !== ">");
        digitObjects.push(processInput(numericText.slice(startIndex + 1, idx)));
      } else
        throw new Error(currentCharacter + " is not a valid character");
    }
    return parseFromDigitsAndBase(digitObjects, numericBase, isNegative);
  };

  // Parses an array of digit NumericObjects from a given base
  function parseFromDigitsAndBase(digitObjects, numericBase, isNegative) {
    var accumulatorVal = NumericObject[0],
      powerAccumulator = NumericObject[1],
      idx;
    for (idx = digitObjects.length - 1; idx >= 0; idx--) {
      accumulatorVal = accumulatorVal.sum(digitObjects[idx].timesOp(powerAccumulator));
      powerAccumulator = powerAccumulator.timesOp(numericBase);
    }
    return isNegative ? accumulatorVal.flipSign() : accumulatorVal;
  }

  // Converts a digit (0-35) to its character representation
  function formatDigit(digitVal) {
    if (digitVal <= 35) {
      return "0123456789abcdefghijklmnopqrstuvwxyz".charAt(digitVal);
    }
    return "<" + digitVal + ">";
  }

  // Converts a NumericObject to an array of digits in a specified base
  function convertToBase(numObj, numericBase) {
    numericBase = largeNumber(numericBase);
    if (numericBase.isNaught()) {
      if (numObj.isNaught())
        return {
          value: [0],
          isNegative: false
        };
      throw new Error("Cannot convert nonzero numbers to base 0.");
    }
    if (numericBase.isEqualTo(-1)) {
      if (numObj.isNaught())
        return {
          value: [0],
          isNegative: false
        };
      if (numObj.checkNegative())
        return {
          value: [].concat.apply([], Array.apply(null, Array(-numObj.numericParts)).map(Array.prototype.valueOf, [1, 0])),
          isNegative: false
        };
      var tempArr = Array.apply(null, Array(+numObj.numericParts - 1)).map(Array.prototype.valueOf, [0, 1]);
      tempArr.unshift([1]);
      return {
        value: [].concat.apply([], tempArr),
        isNegative: false
      };
    }

    var isNegativeResult = false;
    if (numObj.checkNegative() && numericBase.checkPositive()) {
      isNegativeResult = true;
      numObj = numObj.absoluteValue();
    }
    if (numericBase.isEqualTo(1)) {
      if (numObj.isNaught())
        return {
          value: [0],
          isNegative: false
        };
      return {
        value: Array.apply(null, Array(+numObj.numericParts)).map(Number.prototype.valueOf, 1),
        isNegative: isNegativeResult
      };
    }

    var outputDigits = [];
    var remainingNum = numObj,
      divmodResult;
    while (remainingNum.checkNegative() || remainingNum.compareMagnitudes(numericBase) >= 0) {
      divmodResult = remainingNum.quotientRemainder(numericBase);
      remainingNum = divmodResult.quotient;
      var digitObj = divmodResult.remainder;
      if (digitObj.checkNegative()) {
        digitObj = numericBase.minusOp(digitObj).absoluteValue();
        remainingNum = remainingNum.successor();
      }
      outputDigits.push(digitObj.toJavaScriptNumber());
    }
    outputDigits.push(remainingNum.toJavaScriptNumber());
    return {
      value: outputDigits.reverse(),
      isNegative: isNegativeResult
    };
  }

  // Converts a NumericObject to a string in a specified base
  function formatToBase(numObj, numericBase) {
    var resultArr = convertToBase(numObj, numericBase);
    return (resultArr.isNegative ? "-" : "") + resultArr.value.map(formatDigit).join("");
  }

  // LargeNumeric to array method
  LargeNumeric.prototype.toNumericArray = function (numericBase) {
    return convertToBase(this, numericBase);
  };
  CompactNumeric.prototype.toNumericArray = function (numericBase) {
    return convertToBase(this, numericBase);
  };

  // LargeNumeric to string method
  LargeNumeric.prototype.toTextString = function (numericBase) {
    if (numericBase === unassigned)
      numericBase = 10;
    if (numericBase !== 10)
      return formatToBase(this, numericBase);

    var partsArr = this.numericParts,
      partsCount = partsArr.length,
      outputString = String(partsArr[--partsCount]),
      zeroPadding = "0000000",
      currentDigit;
    while (--partsCount >= 0) {
      currentDigit = String(partsArr[partsCount]);
      outputString += zeroPadding.slice(currentDigit.length) + currentDigit;
    }
    var signPrefix = this.isNegativeFlag ? "-" : "";
    return signPrefix + outputString;
  };
  CompactNumeric.prototype.toTextString = function (numericBase) {
    if (numericBase === unassigned)
      numericBase = 10;
    if (numericBase != 10)
      return formatToBase(this, numericBase);
    return String(this.numericParts);
  };

  // LargeNumeric JSON representation
  LargeNumeric.prototype.toJsonRep = CompactNumeric.prototype.toJsonRep = function () {
    return this.toTextString();
  };

  // LargeNumeric primitive value (JS Number)
  LargeNumeric.prototype.getPrimitiveValue = function () {
    return parseInt(this.toTextString(), 10);
  };
  LargeNumeric.prototype.toJavaScriptNumber = LargeNumeric.prototype.getPrimitiveValue;

  // CompactNumeric primitive value (JS Number)
  CompactNumeric.prototype.getPrimitiveValue = function () {
    return this.numericParts;
  };
  CompactNumeric.prototype.toJavaScriptNumber = CompactNumeric.prototype.getPrimitiveValue;

  // Parses a string value into a NumericObject
  function stringToNumeric(inputString) {
    if (canFitInJSNum(+inputString)) {
      var numericX = +inputString;
      if (numericX === discardFraction(numericX))
        return new CompactNumeric(numericX);
      throw new Error("Invalid integer: " + inputString);
    }

    var isNegative = inputString[0] === "-";
    if (isNegative)
      inputString = inputString.slice(1);

    var splitParts = inputString.split(/e/i);
    if (splitParts.length > 2)
      throw new Error("Invalid integer: " + splitParts.join("e"));
    if (splitParts.length === 2) {
      var exponentPart = splitParts[1];
      if (exponentPart[0] === "+")
        exponentPart = exponentPart.slice(1);
      exponentPart = +exponentPart;
      if (exponentPart !== discardFraction(exponentPart) || !canFitInJSNum(exponentPart))
        throw new Error("Invalid integer: " + exponentPart + " is not a valid exponent.");

      var mainText = splitParts[0];
      var dotPosition = mainText.indexOf(".");
      if (dotPosition >= 0) {
        exponentPart -= mainText.length - dotPosition - 1;
        mainText = mainText.slice(0, dotPosition) + mainText.slice(dotPosition + 1);
      }
      if (exponentPart < 0)
        throw new Error("Cannot include negative exponent part for integers");
      mainText += new Array(exponentPart + 1).join("0");
      inputString = mainText;
    }

    var isFormatValid = /^([0-9][0-9]*)$/.test(inputString);
    if (!isFormatValid)
      throw new Error("Invalid integer: " + inputString);

    var resultParts = [],
      maxIdx = inputString.length,
      segmentLength = CHUNK_LOG,
      minIdx = maxIdx - segmentLength;

    while (maxIdx > 0) {
      resultParts.push(+inputString.slice(minIdx, maxIdx));
      minIdx -= segmentLength;
      if (minIdx < 0)
        minIdx = 0;
      maxIdx -= segmentLength;
    }
    removeLeadingZeros(resultParts);
    return new LargeNumeric(resultParts, isNegative);
  }

  // Parses a primitive number value into a NumericObject
  function numberToNumeric(inputVal) {
    if (canFitInJSNum(inputVal)) {
      if (inputVal !== discardFraction(inputVal))
        throw new Error(inputVal + " is not an integer.");
      return new CompactNumeric(inputVal);
    }
    return stringToNumeric(inputVal.toString());
  }

  // Determines the type of input and converts it to a NumericObject
  function processInput(inputVal) {
    if (typeof inputVal === 'number') {
      return numberToNumeric(inputVal);
    }
    if (typeof inputVal === 'string') {
      return stringToNumeric(inputVal);
    }
    return inputVal; // Assume it's already a NumericObject
  }

  // Pre-populate NumericObject with small integer instances for optimization
  for (var idx = 0; idx < 1e3; idx++) {
    NumericObject[idx] = new CompactNumeric(idx);
    if (idx > 0)
      NumericObject[-idx] = new CompactNumeric(-idx);
  }

  // Aliases for common integer values
  NumericObject.one = NumericObject[1];
  NumericObject.zero = NumericObject[0];
  NumericObject.minusOne = NumericObject[-1];

  // Export utility functions
  NumericObject.max = getLargest;
  NumericObject.min = getSmallest;
  NumericObject.gcd = greatestCommonDivisor;
  NumericObject.lcm = leastCommonMultiple;
  NumericObject.isInstance = function (x) {
    return x instanceof LargeNumeric || x instanceof CompactNumeric;
  };
  NumericObject.randomBetween = randomBetween;
  NumericObject.fromArray = function (digitArr, numericBase, isNegative) {
    return parseFromDigitsAndBase(digitArr.map(processInput), processInput(numericBase || 10), isNegative);
  };

  return NumericObject;
}();

// Main program logic
function RunProgram(inputArgument) {
  // Parse input number N
  var inputNumber = inputArgument.split("\n")[0] - 0;

  // Calculate N * (N-1) / 2 using largeNumber operations
  var finalAnswer = largeNumber(largeNumber(inputNumber - 1).product(inputNumber)).quotientResult(2);

  // Output the result to console
  console.log(finalAnswer.toTextString());
}

// Read input from stdin and execute program
RunProgram(require("fs").readFileSync("/dev/stdin", "utf8"));