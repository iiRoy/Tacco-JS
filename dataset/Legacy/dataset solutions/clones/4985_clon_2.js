let vastInt = function (notDefined) {
  "use strict";
  const CHUNK_SIZE_MAGNITUDE = 1e7;
  const CHUNK_LOG_EXPONENT = 7;
  const MAX_SAFE_JS_VALUE = 9007199254740992;
  const MAX_SAFE_JS_VALUE_ARRAY_FORM = convertSmallToChunkArray(MAX_SAFE_JS_VALUE);
  const DEFAULT_CHAR_SET = "0123456789abcdefghijklmnopqrstuvwxyz";
  const hasNativeBigIntSupport = typeof BigInt === "function";

  function NumericEntity(inputValue, baseSystem, charSet, caseSensitivity) {
    if (typeof inputValue === "undefined") return NumericEntity[0];
    if (typeof baseSystem !== "undefined")
      return +baseSystem === 10 && !charSet ? interpretInput(inputValue) : interpretFromBase(inputValue, baseSystem, charSet, caseSensitivity);
    return interpretInput(inputValue);
  }

  function LargeInteger(numParts, isNegativeFlag) {
    this.numericParts = numParts;
    this.isNegativeFlag = isNegativeFlag;
    this.isCompact = false;
  }
  LargeInteger.prototype = Object.create(NumericEntity.prototype);

  function TinyInteger(numVal) {
    this.numericParts = numVal;
    this.isNegativeFlag = numVal < 0;
    this.isCompact = true;
  }
  TinyInteger.prototype = Object.create(NumericEntity.prototype);

  function PlatformBigInt(bigIntValue) {
    this.numericParts = bigIntValue;
  }
  PlatformBigInt.prototype = Object.create(NumericEntity.prototype);

  function isExact(valToCheck) {
    return -MAX_SAFE_JS_VALUE < valToCheck && valToCheck < MAX_SAFE_JS_VALUE;
  }

  function convertSmallToChunkArray(numToConvert) {
    if (numToConvert < 1e7) return [numToConvert];
    if (numToConvert < 1e14) return [numToConvert % 1e7, Math.floor(numToConvert / 1e7)];
    return [numToConvert % 1e7, Math.floor(numToConvert / 1e7) % 1e7, Math.floor(numToConvert / 1e14)];
  }

  function convertChunkArrayToSmallNum(chunkList) {
    removeLeadingZeros(chunkList);
    let listLength = chunkList.length;
    if (listLength < 4 && compareAbsoluteValues(chunkList, MAX_SAFE_JS_VALUE_ARRAY_FORM) < 0) {
      switch (listLength) {
        case 0:
          return 0;
        case 1:
          return chunkList[0];
        case 2:
          return chunkList[0] + chunkList[1] * CHUNK_SIZE_MAGNITUDE;
        default:
          return chunkList[0] + (chunkList[1] + chunkList[2] * CHUNK_SIZE_MAGNITUDE) * CHUNK_SIZE_MAGNITUDE;
      }
    }
    return chunkList;
  }

  function removeLeadingZeros(chunkVector) {
    let currentLength = chunkVector.length;
    while (currentLength > 0 && chunkVector[currentLength - 1] === 0) currentLength--;
    chunkVector.length = currentLength;
  }

  function makeZeroFilledArray(size) {
    let newArray = new Array(size);
    let index = -1;
    while (++index < size) {
      newArray[index] = 0;
    }
    return newArray;
  }

  function floorOrCeilToZero(numToTruncate) {
    if (numToTruncate > 0) return Math.floor(numToTruncate);
    return Math.ceil(numToTruncate);
  }

  function addChunkArrays(firstList, secondList) {
    let lenA = firstList.length,
      lenB = secondList.length,
      resultList = new Array(lenA),
      overflow = 0,
      baseVal = CHUNK_SIZE_MAGNITUDE,
      partialSum,
      idx;
    for (idx = 0; idx < lenB; idx++) {
      partialSum = firstList[idx] + secondList[idx] + overflow;
      overflow = partialSum >= baseVal ? 1 : 0;
      resultList[idx] = partialSum - overflow * baseVal;
    }
    while (idx < lenA) {
      partialSum = firstList[idx] + overflow;
      overflow = partialSum === baseVal ? 1 : 0;
      resultList[idx++] = partialSum - overflow * baseVal;
    }
    if (overflow > 0) resultList.push(overflow);
    return resultList;
  }

  function flexibleAddChunks(firstList, secondList) {
    if (firstList.length >= secondList.length) return addChunkArrays(firstList, secondList);
    return addChunkArrays(secondList, firstList);
  }

  function addSmallIntToChunkArray(chunkList, carryVal) {
    let listLen = chunkList.length,
      resultList = new Array(listLen),
      baseVal = CHUNK_SIZE_MAGNITUDE,
      partialSum,
      idx;
    for (idx = 0; idx < listLen; idx++) {
      partialSum = chunkList[idx] - baseVal + carryVal;
      carryVal = Math.floor(partialSum / baseVal);
      resultList[idx] = partialSum - carryVal * baseVal;
      carryVal += 1;
    }
    while (carryVal > 0) {
      resultList[idx++] = carryVal % baseVal;
      carryVal = Math.floor(carryVal / baseVal);
    }
    return resultList;
  }

  LargeInteger.prototype.sumUp = function (otherVal) {
    let otherNum = interpretInput(otherVal);
    if (this.isNegativeFlag !== otherNum.isNegativeFlag) {
      return this.takeAway(otherNum.invertSign());
    }
    let firstOperand = this.numericParts,
      secondOperand = otherNum.numericParts;
    if (otherNum.isCompact) {
      return new LargeInteger(addSmallIntToChunkArray(firstOperand, Math.abs(secondOperand)), this.isNegativeFlag);
    }
    return new LargeInteger(flexibleAddChunks(firstOperand, secondOperand), this.isNegativeFlag);
  };
  LargeInteger.prototype.addUp = LargeInteger.prototype.sumUp;

  TinyInteger.prototype.sumUp = function (otherVal) {
    let otherNum = interpretInput(otherVal);
    let currentVal = this.numericParts;
    if (currentVal < 0 !== otherNum.isNegativeFlag) {
      return this.takeAway(otherNum.invertSign());
    }
    let otherValNum = otherNum.numericParts;
    if (otherNum.isCompact) {
      if (isExact(currentVal + otherValNum)) return new TinyInteger(currentVal + otherValNum);
      otherValNum = convertSmallToChunkArray(Math.abs(otherValNum));
    }
    return new LargeInteger(addSmallIntToChunkArray(otherValNum, Math.abs(currentVal)), currentVal < 0);
  };
  TinyInteger.prototype.addUp = TinyInteger.prototype.sumUp;

  PlatformBigInt.prototype.sumUp = function (otherVal) {
    return new PlatformBigInt(this.numericParts + interpretInput(otherVal).numericParts);
  };
  PlatformBigInt.prototype.addUp = PlatformBigInt.prototype.sumUp;

  function subtractChunkArrays(firstList, secondList) {
    let lenA = firstList.length,
      lenB = secondList.length,
      resultList = new Array(lenA),
      underflow = 0,
      baseVal = CHUNK_SIZE_MAGNITUDE,
      diffResult,
      idx;
    for (idx = 0; idx < lenB; idx++) {
      diffResult = firstList[idx] - underflow - secondList[idx];
      if (diffResult < 0) {
        diffResult += baseVal;
        underflow = 1;
      } else underflow = 0;
      resultList[idx] = diffResult;
    }
    for (idx = lenB; idx < lenA; idx++) {
      diffResult = firstList[idx] - underflow;
      if (diffResult < 0) diffResult += baseVal;
      else {
        resultList[idx++] = diffResult;
        break;
      }
      resultList[idx] = diffResult;
    }
    for (; idx < lenA; idx++) {
      resultList[idx] = firstList[idx];
    }
    removeLeadingZeros(resultList);
    return resultList;
  }

  function flexibleSubtract(firstList, secondList, currentSign) {
    let calculationResult;
    if (compareAbsoluteValues(firstList, secondList) >= 0) {
      calculationResult = subtractChunkArrays(firstList, secondList);
    } else {
      calculationResult = subtractChunkArrays(secondList, firstList);
      currentSign = !currentSign;
    }
    calculationResult = convertChunkArrayToSmallNum(calculationResult);
    if (typeof calculationResult === "number") {
      if (currentSign) calculationResult = -calculationResult;
      return new TinyInteger(calculationResult);
    }
    return new LargeInteger(calculationResult, currentSign);
  }

  function subtractSmallFromChunkArray(chunkList, smallNum, currentSign) {
    let listLen = chunkList.length,
      resultList = new Array(listLen),
      carryVal = -smallNum,
      baseVal = CHUNK_SIZE_MAGNITUDE,
      diffResult,
      idx;
    for (idx = 0; idx < listLen; idx++) {
      diffResult = chunkList[idx] + carryVal;
      carryVal = Math.floor(diffResult / baseVal);
      diffResult %= baseVal;
      resultList[idx] = diffResult < 0 ? diffResult + baseVal : diffResult;
    }
    resultList = convertChunkArrayToSmallNum(resultList);
    if (typeof resultList === "number") {
      if (currentSign) resultList = -resultList;
      return new TinyInteger(resultList);
    }
    return new LargeInteger(resultList, currentSign);
  }

  LargeInteger.prototype.takeAway = function (otherVal) {
    let otherNum = interpretInput(otherVal);
    if (this.isNegativeFlag !== otherNum.isNegativeFlag) {
      return this.sumUp(otherNum.invertSign());
    }
    let firstOperand = this.numericParts,
      secondOperand = otherNum.numericParts;
    if (otherNum.isCompact) return subtractSmallFromChunkArray(firstOperand, Math.abs(secondOperand), this.isNegativeFlag);
    return flexibleSubtract(firstOperand, secondOperand, this.isNegativeFlag);
  };
  LargeInteger.prototype.minus = LargeInteger.prototype.takeAway;

  TinyInteger.prototype.takeAway = function (otherVal) {
    let otherNum = interpretInput(otherVal);
    let currentVal = this.numericParts;
    if (currentVal < 0 !== otherNum.isNegativeFlag) {
      return this.sumUp(otherNum.invertSign());
    }
    let otherValNum = otherNum.numericParts;
    if (otherNum.isCompact) {
      return new TinyInteger(currentVal - otherValNum);
    }
    return subtractSmallFromChunkArray(otherValNum, Math.abs(currentVal), currentVal >= 0);
  };
  TinyInteger.prototype.minus = TinyInteger.prototype.takeAway;

  PlatformBigInt.prototype.takeAway = function (otherVal) {
    return new PlatformBigInt(this.numericParts - interpretInput(otherVal).numericParts);
  };
  PlatformBigInt.prototype.minus = PlatformBigInt.prototype.takeAway;

  LargeInteger.prototype.invertSign = function () {
    return new LargeInteger(this.numericParts, !this.isNegativeFlag);
  };

  TinyInteger.prototype.invertSign = function () {
    let currentSign = this.isNegativeFlag;
    let compactNum = new TinyInteger(-this.numericParts);
    compactNum.isNegativeFlag = !currentSign;
    return compactNum;
  };

  PlatformBigInt.prototype.invertSign = function () {
    return new PlatformBigInt(-this.numericParts);
  };

  LargeInteger.prototype.absoluteValue = function () {
    return new LargeInteger(this.numericParts, false);
  };

  TinyInteger.prototype.absoluteValue = function () {
    return new TinyInteger(Math.abs(this.numericParts));
  };

  PlatformBigInt.prototype.absoluteValue = function () {
    return new PlatformBigInt(this.numericParts >= BigInt(0) ? this.numericParts : -this.numericParts);
  };

  function longMultiplication(firstList, secondList) {
    let lenA = firstList.length,
      lenB = secondList.length,
      resultLen = lenA + lenB,
      finalProductList = makeZeroFilledArray(resultLen),
      baseVal = CHUNK_SIZE_MAGNITUDE,
      partialProduct,
      overflow,
      idxA,
      chunkA;
    for (idxA = 0; idxA < lenA; ++idxA) {
      chunkA = firstList[idxA];
      for (let idxB = 0; idxB < lenB; ++idxB) {
        let chunkB = secondList[idxB];
        partialProduct = chunkA * chunkB + finalProductList[idxA + idxB];
        overflow = Math.floor(partialProduct / baseVal);
        finalProductList[idxA + idxB] = partialProduct - overflow * baseVal;
        finalProductList[idxA + idxB + 1] += overflow;
      }
    }
    removeLeadingZeros(finalProductList);
    return finalProductList;
  }

  function multiplyChunkArrayBySmallInt(chunkList, smallMultiplier) {
    let listLen = chunkList.length,
      resultList = new Array(listLen),
      baseVal = CHUNK_SIZE_MAGNITUDE,
      overflow = 0,
      partialProduct,
      idx;
    for (idx = 0; idx < listLen; idx++) {
      partialProduct = chunkList[idx] * smallMultiplier + overflow;
      overflow = Math.floor(partialProduct / baseVal);
      resultList[idx] = partialProduct - overflow * baseVal;
    }
    while (overflow > 0) {
      resultList[idx++] = overflow % baseVal;
      overflow = Math.floor(overflow / baseVal);
    }
    return resultList;
  }

  function prependZeros(chunkList, numZeros) {
    let newChunkList = [];
    while (numZeros-- > 0) newChunkList.push(0);
    return newChunkList.concat(chunkList);
  }

  function karatsubaProduct(xChunks, yChunks) {
    let currentLength = Math.max(xChunks.length, yChunks.length);
    if (currentLength <= 30) return longMultiplication(xChunks, yChunks);
    currentLength = Math.ceil(currentLength / 2);
    let highX = xChunks.slice(currentLength),
      lowX = xChunks.slice(0, currentLength),
      highY = yChunks.slice(currentLength),
      lowY = yChunks.slice(0, currentLength);
    let productLowLow = karatsubaProduct(lowX, lowY),
      productHighHigh = karatsubaProduct(highX, highY),
      sumLowHigh = karatsubaProduct(flexibleAddChunks(lowX, highX), flexibleAddChunks(lowY, highY));
    let finalResult = flexibleAddChunks(
      flexibleAddChunks(productLowLow, prependZeros(flexibleSubtract(flexibleSubtract(sumLowHigh, productLowLow), productHighHigh).numericParts, currentLength)),
      prependZeros(productHighHigh, 2 * currentLength)
    );
    removeLeadingZeros(finalResult);
    return finalResult;
  }

  function shouldUseKaratsuba(len1, len2) {
    return -0.012 * len1 - 0.012 * len2 + 15e-6 * len1 * len2 > 0;
  }

  LargeInteger.prototype.productOf = function (otherVal) {
    let otherNum = interpretInput(otherVal),
      firstOperand = this.numericParts,
      secondOperand = otherNum.numericParts,
      resultSign = this.isNegativeFlag !== otherNum.isNegativeFlag,
      absVal;
    if (otherNum.isCompact) {
      if (secondOperand === 0) return NumericEntity[0];
      if (secondOperand === 1) return this;
      if (secondOperand === -1) return this.invertSign();
      absVal = Math.abs(secondOperand);
      if (absVal < CHUNK_SIZE_MAGNITUDE) {
        return new LargeInteger(multiplyChunkArrayBySmallInt(firstOperand, absVal), resultSign);
      }
      secondOperand = convertSmallToChunkArray(absVal);
    }
    if (shouldUseKaratsuba(firstOperand.length, secondOperand.length))
      return new LargeInteger(karatsubaProduct(firstOperand, secondOperand), resultSign);
    return new LargeInteger(longMultiplication(firstOperand, secondOperand), resultSign);
  };
  LargeInteger.prototype.times = LargeInteger.prototype.productOf;

  function multiplySmallNumAndChunkArray(smallNum, chunkList, resultSign) {
    if (smallNum < CHUNK_SIZE_MAGNITUDE) {
      return new LargeInteger(multiplyChunkArrayBySmallInt(chunkList, smallNum), resultSign);
    }
    return new LargeInteger(longMultiplication(chunkList, convertSmallToChunkArray(smallNum)), resultSign);
  }

  TinyInteger.prototype._multiplyByCompact = function (otherSmallNum) {
    if (isExact(otherSmallNum.numericParts * this.numericParts)) {
      return new TinyInteger(otherSmallNum.numericParts * this.numericParts);
    }
    return multiplySmallNumAndChunkArray(
      Math.abs(otherSmallNum.numericParts),
      convertSmallToChunkArray(Math.abs(this.numericParts)),
      this.isNegativeFlag !== otherSmallNum.isNegativeFlag
    );
  };

  LargeInteger.prototype._multiplyByCompact = function (otherSmallNum) {
    if (otherSmallNum.numericParts === 0) return NumericEntity[0];
    if (otherSmallNum.numericParts === 1) return this;
    if (otherSmallNum.numericParts === -1) return this.invertSign();
    return multiplySmallNumAndChunkArray(Math.abs(otherSmallNum.numericParts), this.numericParts, this.isNegativeFlag !== otherSmallNum.isNegativeFlag);
  };

  TinyInteger.prototype.productOf = function (otherVal) {
    return interpretInput(otherVal)._multiplyByCompact(this);
  };
  TinyInteger.prototype.times = TinyInteger.prototype.productOf;

  PlatformBigInt.prototype.productOf = function (otherVal) {
    return new PlatformBigInt(this.numericParts * interpretInput(otherVal).numericParts);
  };
  PlatformBigInt.prototype.times = PlatformBigInt.prototype.productOf;

  function computeSquare(chunkList) {
    let listLen = chunkList.length,
      resultList = makeZeroFilledArray(listLen + listLen),
      baseVal = CHUNK_SIZE_MAGNITUDE,
      partialProduct,
      overflow,
      idxA,
      chunkA;
    for (idxA = 0; idxA < listLen; idxA++) {
      chunkA = chunkList[idxA];
      overflow = 0 - chunkA * chunkA;
      for (let idxB = idxA; idxB < listLen; idxB++) {
        let chunkB = chunkList[idxB];
        partialProduct = 2 * (chunkA * chunkB) + resultList[idxA + idxB] + overflow;
        overflow = Math.floor(partialProduct / baseVal);
        resultList[idxA + idxB] = partialProduct - overflow * baseVal;
      }
      resultList[idxA + listLen] = overflow;
    }
    removeLeadingZeros(resultList);
    return resultList;
  }

  LargeInteger.prototype.squareValue = function () {
    return new LargeInteger(computeSquare(this.numericParts), false);
  };

  TinyInteger.prototype.squareValue = function () {
    let squaredVal = this.numericParts * this.numericParts;
    if (isExact(squaredVal)) return new TinyInteger(squaredVal);
    return new LargeInteger(computeSquare(convertSmallToChunkArray(Math.abs(this.numericParts))), false);
  };

  PlatformBigInt.prototype.squareValue = function () {
    return new PlatformBigInt(this.numericParts * this.numericParts);
  };

  function chunkArrayDivModAlgorithm1(dividendChunks, divisorChunks) {
    let lenA = dividendChunks.length,
      lenB = divisorChunks.length,
      quotientResult = makeZeroFilledArray(divisorChunks.length),
      divisorMSD = divisorChunks[lenB - 1],
      normalizationFactor = Math.ceil(CHUNK_SIZE_MAGNITUDE / (2 * divisorMSD)),
      normalizedDividend = multiplyChunkArrayBySmallInt(dividendChunks, normalizationFactor),
      normalizedDivisor = multiplyChunkArrayBySmallInt(divisorChunks, normalizationFactor),
      currentQuotientDigit,
      shiftAmount,
      carryVal,
      underflowVal,
      idx,
      loopLen,
      chunkQ;
    if (normalizedDividend.length <= lenA) normalizedDividend.push(0);
    normalizedDivisor.push(0);
    divisorMSD = normalizedDivisor[lenB - 1];
    for (shiftAmount = lenA - lenB; shiftAmount >= 0; shiftAmount--) {
      currentQuotientDigit = CHUNK_SIZE_MAGNITUDE - 1;
      if (normalizedDividend[shiftAmount + lenB] !== divisorMSD) {
        currentQuotientDigit = Math.floor(
          (normalizedDividend[shiftAmount + lenB] * CHUNK_SIZE_MAGNITUDE + normalizedDividend[shiftAmount + lenB - 1]) / divisorMSD
        );
      }
      carryVal = 0;
      underflowVal = 0;
      loopLen = normalizedDivisor.length;
      for (idx = 0; idx < loopLen; idx++) {
        carryVal += currentQuotientDigit * normalizedDivisor[idx];
        chunkQ = Math.floor(carryVal / CHUNK_SIZE_MAGNITUDE);
        underflowVal += normalizedDividend[shiftAmount + idx] - (carryVal - chunkQ * CHUNK_SIZE_MAGNITUDE);
        carryVal = chunkQ;
        if (underflowVal < 0) {
          normalizedDividend[shiftAmount + idx] = underflowVal + CHUNK_SIZE_MAGNITUDE;
          underflowVal = -1;
        } else {
          normalizedDividend[shiftAmount + idx] = underflowVal;
          underflowVal = 0;
        }
      }
      while (underflowVal !== 0) {
        currentQuotientDigit -= 1;
        carryVal = 0;
        for (idx = 0; idx < loopLen; idx++) {
          carryVal += normalizedDividend[shiftAmount + idx] - CHUNK_SIZE_MAGNITUDE + normalizedDivisor[idx];
          if (carryVal < 0) {
            normalizedDividend[shiftAmount + idx] = carryVal + CHUNK_SIZE_MAGNITUDE;
            carryVal = 0;
          } else {
            normalizedDividend[shiftAmount + idx] = carryVal;
            carryVal = 1;
          }
        }
        underflowVal += carryVal;
      }
      quotientResult[shiftAmount] = currentQuotientDigit;
    }
    let remainderResult = divModSmall(normalizedDividend, normalizationFactor)[0];
    return [convertChunkArrayToSmallNum(quotientResult), convertChunkArrayToSmallNum(remainderResult)];
  }

  function chunkArrayDivModAlgorithm2(dividendChunks, divisorChunks) {
    let lenA = dividendChunks.length,
      lenB = divisorChunks.length,
      quotientParts = [],
      currentPart = [],
      baseVal = CHUNK_SIZE_MAGNITUDE,
      estimatedQuotient,
      currentPartLen,
      highDividendPart,
      highDivisorPart,
      comparisonCheck;
    while (lenA) {
      currentPart.unshift(dividendChunks[--lenA]);
      removeLeadingZeros(currentPart);
      if (compareAbsoluteValues(currentPart, divisorChunks) < 0) {
        quotientParts.push(0);
        continue;
      }
      currentPartLen = currentPart.length;
      highDividendPart = currentPart[currentPartLen - 1] * baseVal + currentPart[currentPartLen - 2];
      highDivisorPart = divisorChunks[lenB - 1] * baseVal + divisorChunks[lenB - 2];
      if (currentPartLen > lenB) {
        highDividendPart = (highDividendPart + 1) * baseVal;
      }
      estimatedQuotient = Math.ceil(highDividendPart / highDivisorPart);
      do {
        comparisonCheck = multiplyChunkArrayBySmallInt(divisorChunks, estimatedQuotient);
        if (compareAbsoluteValues(comparisonCheck, currentPart) <= 0) break;
        estimatedQuotient--;
      } while (estimatedQuotient);
      quotientParts.push(estimatedQuotient);
      currentPart = subtractChunkArrays(currentPart, comparisonCheck);
    }
    quotientParts.reverse();
    return [convertChunkArrayToSmallNum(quotientParts), convertChunkArrayToSmallNum(currentPart)];
  }

  function divModSmall(chunkList, smallDivisor) {
    let listLength = chunkList.length,
      quotientList = makeZeroFilledArray(listLength),
      baseVal = CHUNK_SIZE_MAGNITUDE,
      idx,
      digitQ,
      remainderVal,
      currentDivisorChunk;
    remainderVal = 0;
    for (idx = listLength - 1; idx >= 0; --idx) {
      currentDivisorChunk = remainderVal * baseVal + chunkList[idx];
      digitQ = floorOrCeilToZero(currentDivisorChunk / smallDivisor);
      remainderVal = currentDivisorChunk - digitQ * smallDivisor;
      quotientList[idx] = digitQ | 0;
    }
    return [quotientList, remainderVal | 0];
  }

  function flexibleDivMod(selfNum, otherVal) {
    let resultValue, otherNum = interpretInput(otherVal);
    if (hasNativeBigIntSupport) {
      return [new PlatformBigInt(selfNum.numericParts / otherNum.numericParts), new PlatformBigInt(selfNum.numericParts % otherNum.numericParts)];
    }
    let firstOperand = selfNum.numericParts,
      secondOperand = otherNum.numericParts;
    let computedQuotient;
    if (secondOperand === 0) throw new Error("Cannot divide by zero");
    if (selfNum.isCompact) {
      if (otherNum.isCompact) {
        return [new TinyInteger(floorOrCeilToZero(firstOperand / secondOperand)), new TinyInteger(firstOperand % secondOperand)];
      }
      return [NumericEntity[0], selfNum];
    }
    if (otherNum.isCompact) {
      if (secondOperand === 1) return [selfNum, NumericEntity[0]];
      if (secondOperand == -1) return [selfNum.invertSign(), NumericEntity[0]];
      let absSecondOperand = Math.abs(secondOperand);
      if (absSecondOperand < CHUNK_SIZE_MAGNITUDE) {
        resultValue = divModSmall(firstOperand, absSecondOperand);
        computedQuotient = convertChunkArrayToSmallNum(resultValue[0]);
        let remainderResult = resultValue[1];
        if (selfNum.isNegativeFlag) remainderResult = -remainderResult;
        if (typeof computedQuotient === "number") {
          if (selfNum.isNegativeFlag !== otherNum.isNegativeFlag) computedQuotient = -computedQuotient;
          return [new TinyInteger(computedQuotient), new TinyInteger(remainderResult)];
        }
        return [new LargeInteger(computedQuotient, selfNum.isNegativeFlag !== otherNum.isNegativeFlag), new TinyInteger(remainderResult)];
      }
      secondOperand = convertSmallToChunkArray(absSecondOperand);
    }
    let absoluteComparison = compareAbsoluteValues(firstOperand, secondOperand);
    if (absoluteComparison === -1) return [NumericEntity[0], selfNum];
    if (absoluteComparison === 0) return [NumericEntity[selfNum.isNegativeFlag === otherNum.isNegativeFlag ? 1 : -1], NumericEntity[0]];
    if (firstOperand.length + secondOperand.length <= 200) resultValue = chunkArrayDivModAlgorithm1(firstOperand, secondOperand);
    else resultValue = chunkArrayDivModAlgorithm2(firstOperand, secondOperand);
    computedQuotient = resultValue[0];
    let quotientIsNegative = selfNum.isNegativeFlag !== otherNum.isNegativeFlag,
      remainderValue = resultValue[1],
      remainderIsNegative = selfNum.isNegativeFlag;
    if (typeof computedQuotient === "number") {
      if (quotientIsNegative) computedQuotient = -computedQuotient;
      computedQuotient = new TinyInteger(computedQuotient);
    } else computedQuotient = new LargeInteger(computedQuotient, quotientIsNegative);
    if (typeof remainderValue === "number") {
      if (remainderIsNegative) remainderValue = -remainderValue;
      remainderValue = new TinyInteger(remainderValue);
    } else remainderValue = new LargeInteger(remainderValue, remainderIsNegative);
    return [computedQuotient, remainderValue];
  }

  LargeInteger.prototype.quotientAndRemainder = function (otherVal) {
    let divisionResults = flexibleDivMod(this, otherVal);
    return {
      quotient: divisionResults[0],
      remainder: divisionResults[1]
    };
  };
  PlatformBigInt.prototype.quotientAndRemainder = TinyInteger.prototype.quotientAndRemainder = LargeInteger.prototype.quotientAndRemainder;

  LargeInteger.prototype.portionBy = function (otherVal) {
    return flexibleDivMod(this, otherVal)[0];
  };
  PlatformBigInt.prototype.portionBy = PlatformBigInt.prototype.divide = function (otherVal) {
    return new PlatformBigInt(this.numericParts / interpretInput(otherVal).numericParts);
  };
  TinyInteger.prototype.portionBy = TinyInteger.prototype.divide = LargeInteger.prototype.portionBy = LargeInteger.prototype.portionBy;

  LargeInteger.prototype.remainderOf = function (otherVal) {
    return flexibleDivMod(this, otherVal)[1];
  };
  PlatformBigInt.prototype.remainderOf = PlatformBigInt.prototype.modulo = function (otherVal) {
    return new PlatformBigInt(this.numericParts % interpretInput(otherVal).numericParts);
  };
  TinyInteger.prototype.modulo = TinyInteger.prototype.remainderOf = LargeInteger.prototype.modulo = LargeInteger.prototype.remainderOf;

  LargeInteger.prototype.raiseToPower = function (exponentVal) {
    let otherNum = interpretInput(exponentVal),
      baseChunks = this.numericParts,
      exponentNum = otherNum.numericParts,
      calculatedVal,
      currentBase,
      finalProduct;
    if (exponentNum === 0) return NumericEntity[1];
    if (baseChunks === 0) return NumericEntity[0];
    if (baseChunks === 1) return NumericEntity[1];
    if (baseChunks === -1) return otherNum.isDivisibleByTwo() ? NumericEntity[1] : NumericEntity[-1];
    if (otherNum.isNegativeFlag) {
      return NumericEntity[0];
    }
    if (!otherNum.isCompact) throw new Error("The exponent " + otherNum.toString() + " is too large.");
    if (this.isCompact) {
      calculatedVal = Math.pow(baseChunks, exponentNum);
      if (isExact(calculatedVal)) return new TinyInteger(floorOrCeilToZero(calculatedVal));
    }
    currentBase = this;
    finalProduct = NumericEntity[1];
    while (true) {
      if ((exponentNum & 1) === 1) {
        finalProduct = finalProduct.times(currentBase);
        --exponentNum;
      }
      if (exponentNum === 0) break;
      exponentNum /= 2;
      currentBase = currentBase.squareValue();
    }
    return finalProduct;
  };
  TinyInteger.prototype.raiseToPower = LargeInteger.prototype.raiseToPower;

  PlatformBigInt.prototype.raiseToPower = function (exponentVal) {
    let otherNum = interpretInput(exponentVal);
    let baseVal = this.numericParts,
      expVal = otherNum.numericParts;
    let zeroBigInt = BigInt(0),
      oneBigInt = BigInt(1),
      twoBigInt = BigInt(2);
    if (expVal === zeroBigInt) return NumericEntity[1];
    if (baseVal === zeroBigInt) return NumericEntity[0];
    if (baseVal === oneBigInt) return NumericEntity[1];
    if (baseVal === BigInt(-1)) return otherNum.isDivisibleByTwo() ? NumericEntity[1] : NumericEntity[-1];
    if (otherNum.isNegative()) return new PlatformBigInt(zeroBigInt);
    let currentBase = this;
    let finalProduct = NumericEntity[1];
    while (true) {
      if ((expVal & oneBigInt) === oneBigInt) {
        finalProduct = finalProduct.times(currentBase);
        --expVal;
      }
      if (expVal === zeroBigInt) break;
      expVal /= twoBigInt;
      currentBase = currentBase.squareValue();
    }
    return finalProduct;
  };

  LargeInteger.prototype.modularPower = function (exponent, modulus) {
    exponent = interpretInput(exponent);
    modulus = interpretInput(modulus);
    if (modulus.isNil()) throw new Error("Cannot take modular power with modulus 0");
    let resultAccumulator = NumericEntity[1],
      currentBase = this.remainderOf(modulus);
    if (exponent.isNegative()) {
      exponent = exponent.productOf(NumericEntity[-1]);
      currentBase = currentBase.modularInverse(modulus);
    }
    while (exponent.isPositive()) {
      if (currentBase.isNil()) return NumericEntity[0];
      if (exponent.isOdd()) resultAccumulator = resultAccumulator.productOf(currentBase).remainderOf(modulus);
      exponent = exponent.portionBy(2);
      currentBase = currentBase.squareValue().remainderOf(modulus);
    }
    return resultAccumulator;
  };
  PlatformBigInt.prototype.modularPower = TinyInteger.prototype.modularPower = LargeInteger.prototype.modularPower;

  function compareAbsoluteValues(firstList, secondList) {
    if (firstList.length !== secondList.length) {
      return firstList.length > secondList.length ? 1 : -1;
    }
    for (let idx = firstList.length - 1; idx >= 0; idx--) {
      if (firstList[idx] !== secondList[idx]) return firstList[idx] > secondList[idx] ? 1 : -1;
    }
    return 0;
  }

  LargeInteger.prototype.compareAbsolute = function (otherVal) {
    let otherNum = interpretInput(otherVal),
      firstOperand = this.numericParts,
      secondOperand = otherNum.numericParts;
    if (otherNum.isCompact) return 1;
    return compareAbsoluteValues(firstOperand, secondOperand);
  };

  TinyInteger.prototype.compareAbsolute = function (otherVal) {
    let otherNum = interpretInput(otherVal),
      absCurrentVal = Math.abs(this.numericParts),
      otherNumVal = otherNum.numericParts;
    if (otherNum.isCompact) {
      otherNumVal = Math.abs(otherNumVal);
      return absCurrentVal === otherNumVal ? 0 : absCurrentVal > otherNumVal ? 1 : -1;
    }
    return -1;
  };

  PlatformBigInt.prototype.compareAbsolute = function (otherVal) {
    let currentVal = this.numericParts;
    let otherNumVal = interpretInput(otherVal).numericParts;
    currentVal = currentVal >= BigInt(0) ? currentVal : -currentVal;
    otherNumVal = otherNumVal >= BigInt(0) ? otherNumVal : -otherNumVal;
    return currentVal === otherNumVal ? 0 : currentVal > otherNumVal ? 1 : -1;
  };

  LargeInteger.prototype.evaluateAgainst = function (otherVal) {
    if (otherVal === Infinity) return -1;
    if (otherVal === -Infinity) return 1;
    let otherNum = interpretInput(otherVal),
      firstOperand = this.numericParts,
      secondOperand = otherNum.numericParts;
    if (this.isNegativeFlag !== otherNum.isNegativeFlag) {
      return otherNum.isNegativeFlag ? 1 : -1;
    }
    if (otherNum.isCompact) {
      return this.isNegativeFlag ? -1 : 1;
    }
    return compareAbsoluteValues(firstOperand, secondOperand) * (this.isNegativeFlag ? -1 : 1);
  };
  LargeInteger.prototype.compareTo = LargeInteger.prototype.evaluateAgainst;

  TinyInteger.prototype.evaluateAgainst = function (otherVal) {
    if (otherVal === Infinity) return -1;
    if (otherVal === -Infinity) return 1;
    let otherNum = interpretInput(otherVal),
      currentVal = this.numericParts,
      otherNumVal = otherNum.numericParts;
    if (otherNum.isCompact) {
      return currentVal == otherNumVal ? 0 : currentVal > otherNumVal ? 1 : -1;
    }
    if (currentVal < 0 !== otherNum.isNegativeFlag) {
      return currentVal < 0 ? -1 : 1;
    }
    return currentVal < 0 ? 1 : -1;
  };
  TinyInteger.prototype.compareTo = TinyInteger.prototype.evaluateAgainst;

  PlatformBigInt.prototype.evaluateAgainst = function (otherVal) {
    if (otherVal === Infinity) return -1;
    if (otherVal === -Infinity) return 1;
    let currentVal = this.numericParts;
    let otherNumVal = interpretInput(otherVal).numericParts;
    return currentVal === otherNumVal ? 0 : currentVal > otherNumVal ? 1 : -1;
  };
  PlatformBigInt.prototype.compareTo = PlatformBigInt.prototype.evaluateAgainst;

  LargeInteger.prototype.isEqual = function (otherVal) {
    return this.evaluateAgainst(otherVal) === 0;
  };
  PlatformBigInt.prototype.eq = PlatformBigInt.prototype.isEqual = TinyInteger.prototype.eq = TinyInteger.prototype.isEqual = LargeInteger.prototype.eq = LargeInteger.prototype.isEqual;

  LargeInteger.prototype.isNotEqual = function (otherVal) {
    return this.evaluateAgainst(otherVal) !== 0;
  };
  PlatformBigInt.prototype.neq = PlatformBigInt.prototype.isNotEqual = TinyInteger.prototype.neq = TinyInteger.prototype.isNotEqual = LargeInteger.prototype.neq = LargeInteger.prototype.isNotEqual;

  LargeInteger.prototype.isGreater = function (otherVal) {
    return this.evaluateAgainst(otherVal) > 0;
  };
  PlatformBigInt.prototype.gt = PlatformBigInt.prototype.isGreater = TinyInteger.prototype.gt = TinyInteger.prototype.isGreater = LargeInteger.prototype.gt = LargeInteger.prototype.isGreater;

  LargeInteger.prototype.isLesser = function (otherVal) {
    return this.evaluateAgainst(otherVal) < 0;
  };
  PlatformBigInt.prototype.lt = PlatformBigInt.prototype.isLesser = TinyInteger.prototype.lt = TinyInteger.prototype.isLesser = LargeInteger.prototype.lt = LargeInteger.prototype.isLesser;

  LargeInteger.prototype.isGreaterOrEqual = function (otherVal) {
    return this.evaluateAgainst(otherVal) >= 0;
  };
  PlatformBigInt.prototype.geq = PlatformBigInt.prototype.isGreaterOrEqual = TinyInteger.prototype.geq = TinyInteger.prototype.isGreaterOrEqual = LargeInteger.prototype.geq = LargeInteger.prototype.isGreaterOrEqual;

  LargeInteger.prototype.isLesserOrEqual = function (otherVal) {
    return this.evaluateAgainst(otherVal) <= 0;
  };
  PlatformBigInt.prototype.leq = PlatformBigInt.prototype.isLesserOrEqual = TinyInteger.prototype.leq = TinyInteger.prototype.isLesserOrEqual = LargeInteger.prototype.leq = LargeInteger.prototype.isLesserOrEqual;

  LargeInteger.prototype.isDivisibleByTwo = function () {
    return (this.numericParts[0] & 1) === 0;
  };

  TinyInteger.prototype.isDivisibleByTwo = function () {
    return (this.numericParts & 1) === 0;
  };

  PlatformBigInt.prototype.isDivisibleByTwo = function () {
    return (this.numericParts & BigInt(1)) === BigInt(0);
  };

  LargeInteger.prototype.isOdd = function () {
    return (this.numericParts[0] & 1) === 1;
  };

  TinyInteger.prototype.isOdd = function () {
    return (this.numericParts & 1) === 1;
  };

  PlatformBigInt.prototype.isOdd = function () {
    return (this.numericParts & BigInt(1)) === BigInt(1);
  };

  LargeInteger.prototype.isPositive = function () {
    return !this.isNegativeFlag;
  };

  TinyInteger.prototype.isPositive = function () {
    return this.numericParts > 0;
  };
  PlatformBigInt.prototype.isPositive = TinyInteger.prototype.isPositive;

  LargeInteger.prototype.isNegative = function () {
    return this.isNegativeFlag;
  };

  TinyInteger.prototype.isNegative = function () {
    return this.numericParts < 0;
  };
  PlatformBigInt.prototype.isNegative = TinyInteger.prototype.isNegative;

  LargeInteger.prototype.isUnit = function () {
    return false;
  };

  TinyInteger.prototype.isUnit = function () {
    return Math.abs(this.numericParts) === 1;
  };

  PlatformBigInt.prototype.isUnit = function () {
    return this.absoluteValue().numericParts === BigInt(1);
  };

  LargeInteger.prototype.isNil = function () {
    return false;
  };

  TinyInteger.prototype.isNil = function () {
    return this.numericParts === 0;
  };

  PlatformBigInt.prototype.isNil = function () {
    return this.numericParts === BigInt(0);
  };

  LargeInteger.prototype.isDivisibleBy = function (otherVal) {
    let otherNum = interpretInput(otherVal);
    if (otherNum.isNil()) return false;
    if (otherNum.isUnit()) return true;
    if (otherNum.compareAbsolute(2) === 0) return this.isDivisibleByTwo();
    return this.remainderOf(otherNum).isNil();
  };
  PlatformBigInt.prototype.isDivisibleBy = TinyInteger.prototype.isDivisibleBy = LargeInteger.prototype.isDivisibleBy;

  function checkBasicPrimality(numToCheck) {
    let absNum = numToCheck.absoluteValue();
    if (absNum.isUnit()) return false;
    if (absNum.isEqual(2) || absNum.isEqual(3) || absNum.isEqual(5)) return true;
    if (absNum.isDivisibleByTwo() || absNum.isDivisibleBy(3) || absNum.isDivisibleBy(5)) return false;
    if (absNum.isLesser(49)) return true;
    return notDefined;
  }

  function runMillerRabinTest(candidateNum, testBases) {
    let candidateMinusOne = candidateNum.decrement(),
      currentB = candidateMinusOne,
      exponentR = 0,
      divisorD,
      tempVal,
      idx,
      testResult;
    while (currentB.isDivisibleByTwo()) {
      currentB = currentB.portionBy(2);
      exponentR++;
    }
    nextTestBase: for (idx = 0; idx < testBases.length; idx++) {
      if (candidateNum.isLesser(testBases[idx])) continue;
      testResult = vastInt(testBases[idx]).modularPower(currentB, candidateNum);
      if (testResult.isUnit() || testResult.isEqual(candidateMinusOne)) continue;
      for (divisorD = exponentR - 1; divisorD != 0; divisorD--) {
        testResult = testResult.squareValue().remainderOf(candidateNum);
        if (testResult.isUnit()) return false;
        if (testResult.isEqual(candidateMinusOne)) continue nextTestBase;
      }
      return false;
    }
    return true;
  }

  LargeInteger.prototype.isDefinitelyPrime = function (strictMode) {
    let basicPrimeCheck = checkBasicPrimality(this);
    if (basicPrimeCheck !== notDefined) return basicPrimeCheck;
    let absNum = this.absoluteValue();
    let bitCount = absNum.bitCount();
    if (bitCount.isLesserOrEqual(64))
      return runMillerRabinTest(absNum, [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37]);
    let logarithmOfN = Math.log(2) * bitCount.toJSNumber();
    let numIterations = Math.ceil(strictMode === true ? 2 * Math.pow(logarithmOfN, 2) : logarithmOfN);
    let testBases = [];
    for (let idx = 0; idx < numIterations; idx++) {
      testBases.push(vastInt(idx + 2));
    }
    return runMillerRabinTest(absNum, testBases);
  };
  PlatformBigInt.prototype.isDefinitelyPrime = TinyInteger.prototype.isDefinitelyPrime = LargeInteger.prototype.isDefinitelyPrime;

  LargeInteger.prototype.isProbablyPrime = function (iterationsCount, randomGenerator) {
    let basicPrimeCheck = checkBasicPrimality(this);
    if (basicPrimeCheck !== notDefined) return basicPrimeCheck;
    let absNum = this.absoluteValue();
    let effectiveIterations = iterationsCount === notDefined ? 5 : iterationsCount;
    let testBases = [];
    for (let idx = 0; idx < effectiveIterations; idx++) {
      testBases.push(vastInt.randomInRange(2, absNum.minus(2), randomGenerator));
    }
    return runMillerRabinTest(absNum, testBases);
  };
  PlatformBigInt.prototype.isProbablyPrime = TinyInteger.prototype.isProbablyPrime = LargeInteger.prototype.isProbablyPrime;

  LargeInteger.prototype.modularInverse = function (modulusNum) {
    let tempT = vastInt.zero,
      newTempT = vastInt.one,
      remainderR = interpretInput(modulusNum),
      newRemainderR = this.absoluteValue(),
      quotientVal,
      lastTempT,
      lastRemainderR;
    while (!newRemainderR.isNil()) {
      quotientVal = remainderR.portionBy(newRemainderR);
      lastTempT = tempT;
      lastRemainderR = remainderR;
      tempT = newTempT;
      remainderR = newRemainderR;
      newTempT = lastTempT.takeAway(quotientVal.productOf(newTempT));
      newRemainderR = lastRemainderR.takeAway(quotientVal.productOf(newRemainderR));
    }
    if (!remainderR.isUnit()) throw new Error(this.toString() + " and " + modulusNum.toString() + " are not co-prime");
    if (tempT.evaluateAgainst(0) === -1) {
      tempT = tempT.sumUp(modulusNum);
    }
    if (this.isNegative()) {
      return tempT.invertSign();
    }
    return tempT;
  };
  PlatformBigInt.prototype.modularInverse = TinyInteger.prototype.modularInverse = LargeInteger.prototype.modularInverse;

  LargeInteger.prototype.increment = function () {
    let currentVal = this.numericParts;
    if (this.isNegativeFlag) {
      return subtractSmallFromChunkArray(currentVal, 1, this.isNegativeFlag);
    }
    return new LargeInteger(addSmallIntToChunkArray(currentVal, 1), this.isNegativeFlag);
  };

  TinyInteger.prototype.increment = function () {
    let currentVal = this.numericParts;
    if (currentVal + 1 < MAX_SAFE_JS_VALUE) return new TinyInteger(currentVal + 1);
    return new LargeInteger(MAX_SAFE_JS_VALUE_ARRAY_FORM, false);
  };

  PlatformBigInt.prototype.increment = function () {
    return new PlatformBigInt(this.numericParts + BigInt(1));
  };

  LargeInteger.prototype.decrement = function () {
    let currentVal = this.numericParts;
    if (this.isNegativeFlag) {
      return new LargeInteger(addSmallIntToChunkArray(currentVal, 1), true);
    }
    return subtractSmallFromChunkArray(currentVal, 1, this.isNegativeFlag);
  };

  TinyInteger.prototype.decrement = function () {
    let currentVal = this.numericParts;
    if (currentVal - 1 > -MAX_SAFE_JS_VALUE) return new TinyInteger(currentVal - 1);
    return new LargeInteger(MAX_SAFE_JS_VALUE_ARRAY_FORM, true);
  };

  PlatformBigInt.prototype.decrement = function () {
    return new PlatformBigInt(this.numericParts - BigInt(1));
  };

  let binaryPowerValues = [1];
  while (2 * binaryPowerValues[binaryPowerValues.length - 1] <= CHUNK_SIZE_MAGNITUDE)
    binaryPowerValues.push(2 * binaryPowerValues[binaryPowerValues.length - 1]);
  const binaryPowerCount = binaryPowerValues.length;
  const largestBinaryPower = binaryPowerValues[binaryPowerCount - 1];

  function isShiftAmountCompact(shiftAmount) {
    return Math.abs(shiftAmount) <= CHUNK_SIZE_MAGNITUDE;
  }

  LargeInteger.prototype.shiftBitsLeft = function (shiftAmountVal) {
    let numShift = interpretInput(shiftAmountVal).toJSNumber();
    if (!isShiftAmountCompact(numShift)) {
      throw new Error(String(numShift) + " is too large for shifting.");
    }
    if (numShift < 0) return this.shiftBitsRight(-numShift);
    let currentResult = this;
    if (currentResult.isNil()) return currentResult;
    while (numShift >= binaryPowerCount) {
      currentResult = currentResult.productOf(largestBinaryPower);
      numShift -= binaryPowerCount - 1;
    }
    return currentResult.productOf(binaryPowerValues[numShift]);
  };
  PlatformBigInt.prototype.shiftBitsLeft = TinyInteger.prototype.shiftBitsLeft = LargeInteger.prototype.shiftBitsLeft;

  LargeInteger.prototype.shiftBitsRight = function (shiftAmountVal) {
    let quotientRemTuple;
    let numShift = interpretInput(shiftAmountVal).toJSNumber();
    if (!isShiftAmountCompact(numShift)) {
      throw new Error(String(numShift) + " is too large for shifting.");
    }
    if (numShift < 0) return this.shiftBitsLeft(-numShift);
    let currentResult = this;
    while (numShift >= binaryPowerCount) {
      if (currentResult.isNil() || currentResult.isNegative() && currentResult.isUnit()) return currentResult;
      quotientRemTuple = flexibleDivMod(currentResult, largestBinaryPower);
      currentResult = quotientRemTuple[1].isNegative() ? quotientRemTuple[0].decrement() : quotientRemTuple[0];
      numShift -= binaryPowerCount - 1;
    }
    quotientRemTuple = flexibleDivMod(currentResult, binaryPowerValues[numShift]);
    return quotientRemTuple[1].isNegative() ? quotientRemTuple[0].decrement() : quotientRemTuple[0];
  };
  PlatformBigInt.prototype.shiftBitsRight = TinyInteger.prototype.shiftBitsRight = LargeInteger.prototype.shiftBitsRight;

  function applyBitwiseOperation(firstNum, secondNum, bitwiseFunction) {
    secondNum = interpretInput(secondNum);
    let xIsNegative = firstNum.isNegative(),
      yIsNegative = secondNum.isNegative();
    let xRemaining = xIsNegative ? firstNum.bitwiseNot() : firstNum,
      yRemaining = yIsNegative ? secondNum.bitwiseNot() : secondNum;
    let xSegment = 0,
      ySegment = 0;
    let xDivisionResult = null,
      yDivisionResult = null;
    let operationResults = [];
    while (!xRemaining.isNil() || !yRemaining.isNil()) {
      xDivisionResult = flexibleDivMod(xRemaining, largestBinaryPower);
      xSegment = xDivisionResult[1].toJSNumber();
      if (xIsNegative) {
        xSegment = largestBinaryPower - 1 - xSegment;
      }
      yDivisionResult = flexibleDivMod(yRemaining, largestBinaryPower);
      ySegment = yDivisionResult[1].toJSNumber();
      if (yIsNegative) {
        ySegment = largestBinaryPower - 1 - ySegment;
      }
      xRemaining = xDivisionResult[0];
      yRemaining = yDivisionResult[0];
      operationResults.push(bitwiseFunction(xSegment, ySegment));
    }
    let finalSum = bitwiseFunction(xIsNegative ? 1 : 0, yIsNegative ? 1 : 0) !== 0 ? vastInt(-1) : vastInt(0);
    for (let idx = operationResults.length - 1; idx >= 0; idx -= 1) {
      finalSum = finalSum.productOf(largestBinaryPower).sumUp(vastInt(operationResults[idx]));
    }
    return finalSum;
  }

  LargeInteger.prototype.bitwiseNot = function () {
    return this.invertSign().decrement();
  };
  PlatformBigInt.prototype.not = TinyInteger.prototype.not = LargeInteger.prototype.bitwiseNot;

  LargeInteger.prototype.bitwiseAnd = function (otherNum) {
    return applyBitwiseOperation(this, otherNum, function (valA, valB) {
      return valA & valB;
    });
  };
  PlatformBigInt.prototype.and = TinyInteger.prototype.and = LargeInteger.prototype.bitwiseAnd;

  LargeInteger.prototype.bitwiseOr = function (otherNum) {
    return applyBitwiseOperation(this, otherNum, function (valA, valB) {
      return valA | valB;
    });
  };
  PlatformBigInt.prototype.or = TinyInteger.prototype.or = LargeInteger.prototype.bitwiseOr;

  LargeInteger.prototype.bitwiseXor = function (otherNum) {
    return applyBitwiseOperation(this, otherNum, function (valA, valB) {
      return valA ^ valB;
    });
  };
  PlatformBigInt.prototype.xor = TinyInteger.prototype.xor = LargeInteger.prototype.bitwiseXor;

  const LOW_ORDER_BIT_MASK_INT = 1 << 30;
  const LOW_ORDER_BIT_MASK_BIG_INT = (CHUNK_SIZE_MAGNITUDE & -CHUNK_SIZE_MAGNITUDE) * (CHUNK_SIZE_MAGNITUDE & -CHUNK_SIZE_MAGNITUDE) | LOW_ORDER_BIT_MASK_INT;

  function approximateLowestBit(numObj) {
    let numVal = numObj.numericParts;
    let bitCheck =
      typeof numVal === "number" ?
      numVal | LOW_ORDER_BIT_MASK_INT :
      typeof numVal === "bigint" ?
      numVal | BigInt(LOW_ORDER_BIT_MASK_INT) :
      numVal[0] + numVal[1] * CHUNK_SIZE_MAGNITUDE | LOW_ORDER_BIT_MASK_BIG_INT;
    return bitCheck & -bitCheck;
  }

  function wholeNumberLogarithm(currentVal, baseVal) {
    if (baseVal.compareTo(currentVal) <= 0) {
      let tempLog = wholeNumberLogarithm(currentVal, baseVal.squareValue());
      let powerVal = tempLog.powerResult;
      let exponentVal = tempLog.exponentResult;
      let testProduct = powerVal.productOf(baseVal);
      return testProduct.compareTo(currentVal) <= 0 ? {
        powerResult: testProduct,
        exponentResult: exponentVal * 2 + 1
      } : {
        powerResult: powerVal,
        exponentResult: exponentVal * 2
      };
    }
    return {
      powerResult: vastInt(1),
      exponentResult: 0
    };
  }

  LargeInteger.prototype.bitCount = function () {
    let currentNum = this;
    if (currentNum.evaluateAgainst(vastInt(0)) < 0) {
      currentNum = currentNum.invertSign().takeAway(vastInt(1));
    }
    if (currentNum.evaluateAgainst(vastInt(0)) === 0) {
      return vastInt(0);
    }
    return vastInt(wholeNumberLogarithm(currentNum, vastInt(2)).exponentResult).sumUp(vastInt(1));
  };
  PlatformBigInt.prototype.bitLength = TinyInteger.prototype.bitLength = LargeInteger.prototype.bitCount;

  function findMaximum(numA, numB) {
    numA = interpretInput(numA);
    numB = interpretInput(numB);
    return numA.isGreater(numB) ? numA : numB;
  }

  function findMinimum(numA, numB) {
    numA = interpretInput(numA);
    numB = interpretInput(numB);
    return numA.isLesser(numB) ? numA : numB;
  }

  function greatestCommonDivisor(numA, numB) {
    numA = interpretInput(numA).absoluteValue();
    numB = interpretInput(numB).absoluteValue();
    if (numA.isEqual(numB)) return numA;
    if (numA.isNil()) return numB;
    if (numB.isNil()) return numA;
    let commonFactor = NumericEntity[1],
      divisorD,
      tempVal;
    while (numA.isDivisibleByTwo() && numB.isDivisibleByTwo()) {
      divisorD = findMinimum(approximateLowestBit(numA), approximateLowestBit(numB));
      numA = numA.portionBy(divisorD);
      numB = numB.portionBy(divisorD);
      commonFactor = commonFactor.productOf(divisorD);
    }
    while (numA.isDivisibleByTwo()) {
      numA = numA.portionBy(approximateLowestBit(numA));
    }
    do {
      while (numB.isDivisibleByTwo()) {
        numB = numB.portionBy(approximateLowestBit(numB));
      }
      if (numA.isGreater(numB)) {
        tempVal = numB;
        numB = numA;
        numA = tempVal;
      }
      numB = numB.takeAway(numA);
    } while (!numB.isNil());
    return commonFactor.isUnit() ? numA : numA.productOf(commonFactor);
  }

  function leastCommonMultiple(numA, numB) {
    numA = interpretInput(numA).absoluteValue();
    numB = interpretInput(numB).absoluteValue();
    return numA.portionBy(greatestCommonDivisor(numA, numB)).productOf(numB);
  }

  function randomInRange(lowerBound, upperBound, randomSource) {
    lowerBound = interpretInput(lowerBound);
    upperBound = interpretInput(upperBound);
    let activeRNG = randomSource || Math.random;
    let minVal = findMinimum(lowerBound, upperBound),
      maxVal = findMaximum(lowerBound, upperBound);
    let valueRange = maxVal.takeAway(minVal).sumUp(1);
    if (valueRange.isCompact) return minVal.sumUp(Math.floor(activeRNG() * valueRange.numericParts));
    let rangeDigits = convertToBaseSystem(valueRange, CHUNK_SIZE_MAGNITUDE).numericParts;
    let generatedDigits = [],
      isRestricted = true;
    for (let idx = 0; idx < rangeDigits.length; idx++) {
      let limit = isRestricted ? rangeDigits[idx] : CHUNK_SIZE_MAGNITUDE;
      let digitVal = floorOrCeilToZero(activeRNG() * limit);
      generatedDigits.push(digitVal);
      if (digitVal < limit) isRestricted = false;
    }
    return minVal.sumUp(NumericEntity.fromArray(generatedDigits, CHUNK_SIZE_MAGNITUDE, false));
  }

  let interpretFromBase = function (textInput, baseSystem, charSet, caseSensitivity) {
    charSet = charSet || DEFAULT_CHAR_SET;
    textInput = String(textInput);
    if (!caseSensitivity) {
      textInput = textInput.toLowerCase();
      charSet = charSet.toLowerCase();
    }
    let inputLength = textInput.length;
    let idx;
    let absoluteBase = Math.abs(baseSystem);
    let charValuesMap = {};
    for (idx = 0; idx < charSet.length; idx++) {
      charValuesMap[charSet[idx]] = idx;
    }
    for (idx = 0; idx < inputLength; idx++) {
      let currentChar = textInput[idx];
      if (currentChar === "-") continue;
      if (currentChar in charValuesMap) {
        if (charValuesMap[currentChar] >= absoluteBase) {
          if (currentChar === "1" && absoluteBase === 1) continue;
          throw new Error(currentChar + " is not a valid digit in base " + baseSystem + ".");
        }
      }
    }
    baseSystem = interpretInput(baseSystem);
    let digitEntities = [];
    let isNegativeValue = textInput[0] === "-";
    for (idx = isNegativeValue ? 1 : 0; idx < textInput.length; idx++) {
      let currentChar = textInput[idx];
      if (currentChar in charValuesMap) digitEntities.push(interpretInput(charValuesMap[currentChar]));
      else if (currentChar === "<") {
        let blockStart = idx;
        do {
          idx++;
        } while (textInput[idx] !== ">" && idx < textInput.length);
        digitEntities.push(interpretInput(textInput.slice(blockStart + 1, idx)));
      } else throw new Error(currentChar + " is not a valid character");
    }
    return constructFromArray(digitEntities, baseSystem, isNegativeValue);
  };

  function constructFromArray(digitEntities, baseSystem, isNegativeValue) {
    let accumulatedValue = NumericEntity[0],
      currentPower = NumericEntity[1],
      idx;
    for (idx = digitEntities.length - 1; idx >= 0; idx--) {
      accumulatedValue = accumulatedValue.sumUp(digitEntities[idx].times(currentPower));
      currentPower = currentPower.times(baseSystem);
    }
    return isNegativeValue ? accumulatedValue.invertSign() : accumulatedValue;
  }

  function formatDigit(digitValue, charSet) {
    charSet = charSet || DEFAULT_CHAR_SET;
    if (digitValue < charSet.length) {
      return charSet[digitValue];
    }
    return "<" + digitValue + ">";
  }

  function convertToBaseSystem(numToConvert, baseSystem) {
    baseSystem = vastInt(baseSystem);
    if (baseSystem.isNil()) {
      if (numToConvert.isNil()) return {
        numericParts: [0],
        isNegative: false
      };
      throw new Error("Cannot convert nonzero numbers to base 0.");
    }
    if (baseSystem.isEqual(-1)) {
      if (numToConvert.isNil()) return {
        numericParts: [0],
        isNegative: false
      };
      if (numToConvert.isNegative())
        return {
          numericParts: [].concat.apply([], Array.apply(null, Array(-numToConvert.toJSNumber())).map(Array.prototype.valueOf, [1, 0])),
          isNegative: false,
        };
      let alternatingArray = Array.apply(null, Array(numToConvert.toJSNumber() - 1)).map(Array.prototype.valueOf, [0, 1]);
      alternatingArray.unshift([1]);
      return {
        numericParts: [].concat.apply([], alternatingArray),
        isNegative: false
      };
    }
    let isResultNegative = false;
    if (numToConvert.isNegative() && baseSystem.isPositive()) {
      isResultNegative = true;
      numToConvert = numToConvert.absoluteValue();
    }
    if (baseSystem.isUnit()) {
      if (numToConvert.isNil()) return {
        numericParts: [0],
        isNegative: false
      };
      return {
        numericParts: Array.apply(null, Array(numToConvert.toJSNumber())).map(Number.prototype.valueOf, 1),
        isNegative: isResultNegative,
      };
    }
    let outputDigits = [];
    let remainingValue = numToConvert,
      divisionResult;
    while (remainingValue.isNegative() || remainingValue.compareAbsolute(baseSystem) >= 0) {
      divisionResult = remainingValue.quotientAndRemainder(baseSystem);
      remainingValue = divisionResult.quotient;
      let currentDigit = divisionResult.remainder;
      if (currentDigit.isNegative()) {
        currentDigit = baseSystem.minus(currentDigit).absoluteValue();
        remainingValue = remainingValue.increment();
      }
      outputDigits.push(currentDigit.toJSNumber());
    }
    outputDigits.push(remainingValue.toJSNumber());
    return {
      numericParts: outputDigits.reverse(),
      isNegative: isResultNegative
    };
  }

  function convertToBaseString(numToConvert, baseSystem, charSet) {
    let convertedArray = convertToBaseSystem(numToConvert, baseSystem);
    return (convertedArray.isNegative ? "-" : "") + convertedArray.numericParts.map(function (val) {
      return formatDigit(val, charSet);
    }).join("");
  }

  LargeInteger.prototype.toDigitArray = function (radixVal) {
    return convertToBaseSystem(this, radixVal);
  };
  TinyInteger.prototype.toDigitArray = PlatformBigInt.prototype.toDigitArray = LargeInteger.prototype.toDigitArray;

  LargeInteger.prototype.toText = function (radixVal, charSet) {
    if (radixVal === notDefined) radixVal = 10;
    if (radixVal !== 10) return convertToBaseString(this, radixVal, charSet);
    let numberChunks = this.numericParts,
      chunkCount = numberChunks.length,
      outputString = String(numberChunks[--chunkCount]),
      zeroPadding = "0000000",
      currentDigit;
    while (--chunkCount >= 0) {
      currentDigit = String(numberChunks[chunkCount]);
      outputString += zeroPadding.slice(currentDigit.length) + currentDigit;
    }
    let finalSign = this.isNegativeFlag ? "-" : "";
    return finalSign + outputString;
  };

  TinyInteger.prototype.toText = function (radixVal, charSet) {
    if (radixVal === notDefined) radixVal = 10;
    if (radixVal != 10) return convertToBaseString(this, radixVal, charSet);
    return String(this.numericParts);
  };
  PlatformBigInt.prototype.toText = TinyInteger.prototype.toText;

  PlatformBigInt.prototype.toJSON = LargeInteger.prototype.toJSON = TinyInteger.prototype.toJSON = function () {
    return this.toText();
  };

  LargeInteger.prototype.toPrimitiveValue = function () {
    return parseInt(this.toText(), 10);
  };
  LargeInteger.prototype.toJSNumber = LargeInteger.prototype.toPrimitiveValue;

  TinyInteger.prototype.toPrimitiveValue = function () {
    return this.numericParts;
  };
  TinyInteger.prototype.toJSNumber = TinyInteger.prototype.toPrimitiveValue;

  PlatformBigInt.prototype.toPrimitiveValue = PlatformBigInt.prototype.toJSNumber = function () {
    return parseInt(this.toText(), 10);
  };

  function parseStringInput(stringVal) {
    if (isExact(+stringVal)) {
      let numVal = +stringVal;
      if (numVal === floorOrCeilToZero(numVal))
        return hasNativeBigIntSupport ? new PlatformBigInt(BigInt(numVal)) : new TinyInteger(numVal);
      throw new Error("Invalid integer: " + stringVal);
    }
    let isNegativeInput = stringVal[0] === "-";
    if (isNegativeInput) stringVal = stringVal.slice(1);
    let parts = stringVal.split(/e/i);
    if (parts.length > 2) throw new Error("Invalid integer: " + parts.join("e"));
    if (parts.length === 2) {
      let exponentPart = parts[1];
      if (exponentPart[0] === "+") exponentPart = exponentPart.slice(1);
      exponentPart = +exponentPart;
      if (exponentPart !== floorOrCeilToZero(exponentPart) || !isExact(exponentPart))
        throw new Error("Invalid integer: " + exponentPart + " is not a valid exponent.");
      let mainText = parts[0];
      let dotPosition = mainText.indexOf(".");
      if (dotPosition >= 0) {
        exponentPart -= mainText.length - dotPosition - 1;
        mainText = mainText.slice(0, dotPosition) + mainText.slice(dotPosition + 1);
      }
      if (exponentPart < 0) throw new Error("Cannot include negative exponent part for integers");
      mainText += new Array(exponentPart + 1).join("0");
      stringVal = mainText;
    }
    let inputIsValid = /^([0-9][0-9]*)$/.test(stringVal);
    if (!inputIsValid) throw new Error("Invalid integer: " + stringVal);
    if (hasNativeBigIntSupport) {
      return new PlatformBigInt(BigInt(isNegativeInput ? "-" + stringVal : stringVal));
    }
    let chunkResult = [],
      currentMax = stringVal.length,
      chunkLog = CHUNK_LOG_EXPONENT,
      currentMin = currentMax - chunkLog;
    while (currentMax > 0) {
      chunkResult.push(+stringVal.slice(currentMin, currentMax));
      currentMin -= chunkLog;
      if (currentMin < 0) currentMin = 0;
      currentMax -= chunkLog;
    }
    removeLeadingZeros(chunkResult);
    return new LargeInteger(chunkResult, isNegativeInput);
  }

  function parseNumberInput(numVal) {
    if (hasNativeBigIntSupport) {
      return new PlatformBigInt(BigInt(numVal));
    }
    if (isExact(numVal)) {
      if (numVal !== floorOrCeilToZero(numVal)) throw new Error(numVal + " is not an integer.");
      return new TinyInteger(numVal);
    }
    return parseStringInput(numVal.toString());
  }

  function interpretInput(inputData) {
    if (typeof inputData === "number") {
      return parseNumberInput(inputData);
    }
    if (typeof inputData === "string") {
      return parseStringInput(inputData);
    }
    if (typeof inputData === "bigint") {
      return new PlatformBigInt(inputData);
    }
    return inputData;
  }

  for (let idx = 0; idx < 1e3; idx++) {
    NumericEntity[idx] = interpretInput(idx);
    if (idx > 0) NumericEntity[-idx] = interpretInput(-idx);
  }
  NumericEntity.one = NumericEntity[1];
  NumericEntity.zero = NumericEntity[0];
  NumericEntity.minusOne = NumericEntity[-1];
  NumericEntity.max = findMaximum;
  NumericEntity.min = findMinimum;
  NumericEntity.gcd = greatestCommonDivisor;
  NumericEntity.lcm = leastCommonMultiple;
  NumericEntity.isInstance = function (checkVal) {
    return checkVal instanceof LargeInteger || checkVal instanceof TinyInteger || checkVal instanceof PlatformBigInt;
  };
  NumericEntity.randomInRange = randomInRange;
  NumericEntity.fromArray = function (digitsArr, baseNum, isNegativeFlag) {
    return constructFromArray(digitsArr.map(interpretInput), interpretInput(baseNum || 10), isNegativeFlag);
  };
  return NumericEntity;
}();
if (typeof module !== "undefined" && module.hasOwnProperty("exports")) {
  module.exports = vastInt;
}
if (typeof define === "function" && define.amd) {
  define(function () {
    return vastInt;
  });
}
let ProcessInput = (rawData) => {
  const numericArray = rawData.trim().split(' ').map(Number);
  let calculationOutcome = 0;
  let foundEvenNum = false;
  for (let idx = 0; idx < numericArray.length; idx++) {
    if ((numericArray[1] % 2) === 0) {
      foundEvenNum = true;
    }
  }
  if (foundEvenNum === false) {
    calculationOutcome = Math.min(
      vastInt(numericArray[0] * numericArray[1]),
      vastInt(numericArray[0] * numericArray[2]),
      vastInt(numericArray[1] * numericArray[2]));
  }
  console.log(calculationOutcome);
  return calculationOutcome;
};
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));