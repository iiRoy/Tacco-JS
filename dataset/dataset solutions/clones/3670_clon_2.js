var largeNumLib = (function (noValue) {
  "use strict";

  var segmentSize = 10000000;
  var segmentDigits = 7;
  var jsSafeMax = 9007199254740992;
  var jsSafeMaxParts = splitNativeNum(jsSafeMax);
  var logJsSafeMax = Math.log(jsSafeMax);

  function NumHandler(inputVal, numericRadix) {
    if (typeof inputVal === "undefined") {
      return NumHandler[0];
    }
    if (typeof numericRadix !== "undefined") {
      return +numericRadix === 10 ? interpretInput(inputVal) : interpretRadixString(inputVal, numericRadix);
    }
    return interpretInput(inputVal);
  }

  function LargeValue(valueSegments, isNegativeFlag) {
    this.data = valueSegments;
    this.isNegative = isNegativeFlag;
    this.isCompact = false;
  }

  LargeValue.prototype = Object.create(NumHandler.prototype);

  function TinyValue(nativeValue) {
    this.data = nativeValue;
    this.isNegative = nativeValue < 0;
    this.isCompact = true;
  }

  TinyValue.prototype = Object.create(NumHandler.prototype);

  function fitsNativeRange(numToCheck) {
    return -jsSafeMax < numToCheck && numToCheck < jsSafeMax;
  }

  function splitNativeNum(numToSplit) {
    if (numToSplit < segmentSize) {
      return [numToSplit];
    }
    if (numToSplit < 100000000000000) {
      return [numToSplit % segmentSize, Math.floor(numToSplit / segmentSize)];
    }
    return [numToSplit % segmentSize, Math.floor(numToSplit / segmentSize) % segmentSize, Math.floor(numToSplit / 100000000000000)];
  }

  function joinToNativeNum(segmentArray) {
    normalizeParts(segmentArray);
    var segCount = segmentArray.length;
    if (segCount < 4 && compareMagnitudes(segmentArray, jsSafeMaxParts) < 0) {
      switch (segCount) {
        case 0:
          return 0;
        case 1:
          return segmentArray[0];
        case 2:
          return segmentArray[0] + segmentArray[1] * segmentSize;
        default:
          return segmentArray[0] + (segmentArray[1] + segmentArray[2] * segmentSize) * segmentSize;
      }
    }
    return segmentArray;
  }

  function normalizeParts(segmentList) {
    var idx = segmentList.length;
    while (segmentList[--idx] === 0 && idx > 0);
    segmentList.length = idx + 1;
  }

  function initZeroArray(size) {
    var newArr = new Array(size);
    var currentIdx = -1;
    while (++currentIdx < size) {
      newArr[currentIdx] = 0;
    }
    return newArr;
  }

  function floorOrCeil(numVal) {
    if (numVal > 0) {
      return Math.floor(numVal);
    }
    return Math.ceil(numVal);
  }

  function performAddition(arr1, arr2) {
    var len1 = arr1.length;
    var len2 = arr2.length;
    var resultArr = new Array(len1);
    var carryOver = 0;
    var currentSegmentSize = segmentSize;
    var sumVal, i;
    for (i = 0; i < len2; i++) {
      sumVal = arr1[i] + arr2[i] + carryOver;
      carryOver = sumVal >= currentSegmentSize ? 1 : 0;
      resultArr[i] = sumVal - carryOver * currentSegmentSize;
    }
    while (i < len1) {
      sumVal = arr1[i] + carryOver;
      carryOver = sumVal === currentSegmentSize ? 1 : 0;
      resultArr[i++] = sumVal - carryOver * currentSegmentSize;
    }
    if (carryOver > 0) {
      resultArr.push(carryOver);
    }
    return resultArr;
  }

  function unifiedAddition(firstArr, secondArr) {
    if (firstArr.length >= secondArr.length) {
      return performAddition(firstArr, secondArr);
    }
    return performAddition(secondArr, firstArr);
  }

  function addNative(segmentArr, nativeCarry) {
    var arrLen = segmentArr.length;
    var resArr = new Array(arrLen);
    var currentSegmentSize = segmentSize;
    var currentSum, i;
    for (i = 0; i < arrLen; i++) {
      currentSum = segmentArr[i] - currentSegmentSize + nativeCarry;
      nativeCarry = Math.floor(currentSum / currentSegmentSize);
      resArr[i] = currentSum - nativeCarry * currentSegmentSize;
      nativeCarry += 1;
    }
    while (nativeCarry > 0) {
      resArr[i++] = nativeCarry % currentSegmentSize;
      nativeCarry = Math.floor(nativeCarry / currentSegmentSize);
    }
    return resArr;
  }

  LargeValue.prototype.addOp = function (otherVal) {
    var otherNum = interpretInput(otherVal);
    if (this.isNegative !== otherNum.isNegative) {
      return this.subOp(otherNum.flipSign());
    }
    var currentData = this.data;
    var otherData = otherNum.data;
    if (otherNum.isCompact) {
      return new LargeValue(addNative(currentData, Math.abs(otherData)), this.isNegative);
    }
    return new LargeValue(unifiedAddition(currentData, otherData), this.isNegative);
  };
  LargeValue.prototype.plus = LargeValue.prototype.addOp;

  TinyValue.prototype.addOp = function (otherVal) {
    var otherNum = interpretInput(otherVal);
    var currentNative = this.data;
    if (currentNative < 0 !== otherNum.isNegative) {
      return this.subOp(otherNum.flipSign());
    }
    var otherNative = otherNum.data;
    if (otherNum.isCompact) {
      if (fitsNativeRange(currentNative + otherNative)) {
        return new TinyValue(currentNative + otherNative);
      }
      otherNative = splitNativeNum(Math.abs(otherNative));
    }
    return new LargeValue(addNative(otherNative, Math.abs(currentNative)), currentNative < 0);
  };
  TinyValue.prototype.plus = TinyValue.prototype.addOp;

  function performSubtraction(arr1, arr2) {
    var arr1Len = arr1.length;
    var arr2Len = arr2.length;
    var resArr = new Array(arr1Len);
    var borrowAmt = 0;
    var currentSegmentSize = segmentSize;
    var currentDiff, i;
    for (i = 0; i < arr2Len; i++) {
      currentDiff = arr1[i] - borrowAmt - arr2[i];
      if (currentDiff < 0) {
        currentDiff += currentSegmentSize;
        borrowAmt = 1;
      } else {
        borrowAmt = 0;
      }
      resArr[i] = currentDiff;
    }
    for (i = arr2Len; i < arr1Len; i++) {
      currentDiff = arr1[i] - borrowAmt;
      if (currentDiff < 0) {
        currentDiff += currentSegmentSize;
      } else {
        resArr[i++] = currentDiff;
        break;
      }
      resArr[i] = currentDiff;
    }
    for (; i < arr1Len; i++) {
      resArr[i] = arr1[i];
    }
    normalizeParts(resArr);
    return resArr;
  }

  function unifiedSubtraction(arr1, arr2, resultIsNegative) {
    var finalValue;
    if (compareMagnitudes(arr1, arr2) >= 0) {
      finalValue = performSubtraction(arr1, arr2);
    } else {
      finalValue = performSubtraction(arr2, arr1);
      resultIsNegative = !resultIsNegative;
    }
    finalValue = joinToNativeNum(finalValue);
    if (typeof finalValue === "number") {
      if (resultIsNegative) {
        finalValue = -finalValue;
      }
      return new TinyValue(finalValue);
    }
    return new LargeValue(finalValue, resultIsNegative);
  }

  function subtractNative(segmentArr, nativeVal, resultIsNegative) {
    var arrLen = segmentArr.length;
    var resArr = new Array(arrLen);
    var carryVal = -nativeVal;
    var currentSegmentSize = segmentSize;
    var currentDiff, i;
    for (i = 0; i < arrLen; i++) {
      currentDiff = segmentArr[i] + carryVal;
      carryVal = Math.floor(currentDiff / currentSegmentSize);
      currentDiff %= currentSegmentSize;
      resArr[i] = currentDiff < 0 ? currentDiff + currentSegmentSize : currentDiff;
    }
    resArr = joinToNativeNum(resArr);
    if (typeof resArr === "number") {
      if (resultIsNegative) {
        resArr = -resArr;
      }
      return new TinyValue(resArr);
    }
    return new LargeValue(resArr, resultIsNegative);
  }

  LargeValue.prototype.subOp = function (otherVal) {
    var otherNum = interpretInput(otherVal);
    if (this.isNegative !== otherNum.isNegative) {
      return this.addOp(otherNum.flipSign());
    }
    var currentData = this.data;
    var otherData = otherNum.data;
    if (otherNum.isCompact) {
      return subtractNative(currentData, Math.abs(otherData), this.isNegative);
    }
    return unifiedSubtraction(currentData, otherData, this.isNegative);
  };
  LargeValue.prototype.minus = LargeValue.prototype.subOp;

  TinyValue.prototype.subOp = function (otherVal) {
    var otherNum = interpretInput(otherVal);
    var currentNative = this.data;
    if (currentNative < 0 !== otherNum.isNegative) {
      return this.addOp(otherNum.flipSign());
    }
    var otherNative = otherNum.data;
    if (otherNum.isCompact) {
      return new TinyValue(currentNative - otherNative);
    }
    return subtractNative(otherNative, Math.abs(currentNative), currentNative >= 0);
  };
  TinyValue.prototype.minus = TinyValue.prototype.subOp;

  LargeValue.prototype.flipSign = function () {
    return new LargeValue(this.data, !this.isNegative);
  };

  TinyValue.prototype.flipSign = function () {
    var currentSign = this.isNegative;
    var smallResult = new TinyValue(-this.data);
    smallResult.isNegative = !currentSign;
    return smallResult;
  };

  LargeValue.prototype.getAbsolute = function () {
    return new LargeValue(this.data, false);
  };

  TinyValue.prototype.getAbsolute = function () {
    return new TinyValue(Math.abs(this.data));
  };

  function longMultiplication(arr1, arr2) {
    var arr1Len = arr1.length;
    var arr2Len = arr2.length;
    var resultLen = arr1Len + arr2Len;
    var resultArr = initZeroArray(resultLen);
    var currentSegmentSize = segmentSize;
    var productVal, carryVal, i, val1_i, val2_j;
    for (i = 0; i < arr1Len; ++i) {
      val1_i = arr1[i];
      for (var j = 0; j < arr2Len; ++j) {
        val2_j = arr2[j];
        productVal = val1_i * val2_j + resultArr[i + j];
        carryVal = Math.floor(productVal / currentSegmentSize);
        resultArr[i + j] = productVal - carryVal * currentSegmentSize;
        resultArr[i + j + 1] += carryVal;
      }
    }
    normalizeParts(resultArr);
    return resultArr;
  }

  function scalarMultiplication(segmentArr, scalar) {
    var arrLen = segmentArr.length;
    var resultArr = new Array(arrLen);
    var currentSegmentSize = segmentSize;
    var carryVal = 0;
    var productVal, i;
    for (i = 0; i < arrLen; i++) {
      productVal = segmentArr[i] * scalar + carryVal;
      carryVal = Math.floor(productVal / currentSegmentSize);
      resultArr[i] = productVal - carryVal * currentSegmentSize;
    }
    while (carryVal > 0) {
      resultArr[i++] = carryVal % currentSegmentSize;
      carryVal = Math.floor(carryVal / currentSegmentSize);
    }
    return resultArr;
  }

  function padWithZeros(arr, numZeros) {
    var paddedArr = [];
    while (numZeros-- > 0) {
      paddedArr.push(0);
    }
    return paddedArr.concat(arr);
  }

  function karatsubaProduct(xSegments, ySegments) {
    var n = Math.max(xSegments.length, ySegments.length);
    if (n <= 30) {
      return longMultiplication(xSegments, ySegments);
    }
    n = Math.ceil(n / 2);
    var x_high = xSegments.slice(n);
    var x_low = xSegments.slice(0, n);
    var y_high = ySegments.slice(n);
    var y_low = ySegments.slice(0, n);
    var product_low = karatsubaProduct(x_low, y_low);
    var product_high = karatsubaProduct(x_high, y_high);
    var sum_x_parts = unifiedAddition(x_low, x_high);
    var sum_y_parts = unifiedAddition(y_low, y_high);
    var product_middle = karatsubaProduct(sum_x_parts, sum_y_parts);
    var finalProduct = unifiedAddition(
      unifiedAddition(product_low, padWithZeros(performSubtraction(performSubtraction(product_middle, product_low), product_high), n)),
      padWithZeros(product_high, 2 * n)
    );
    normalizeParts(finalProduct);
    return finalProduct;
  }

  function shouldUseKaratsuba(len1, len2) {
    return -0.012 * len1 - 0.012 * len2 + 0.000015 * len1 * len2 > 0;
  }

  LargeValue.prototype.mulOp = function (otherVal) {
    var otherNum = interpretInput(otherVal);
    var currentData = this.data;
    var otherData = otherNum.data;
    var finalSign = this.isNegative !== otherNum.isNegative;
    if (otherNum.isCompact) {
      if (otherData === 0) {
        return NumHandler[0];
      }
      if (otherData === 1) {
        return this;
      }
      if (otherData === -1) {
        return this.flipSign();
      }
      var absOtherData = Math.abs(otherData);
      if (absOtherData < segmentSize) {
        return new LargeValue(scalarMultiplication(currentData, absOtherData), finalSign);
      }
      otherData = splitNativeNum(absOtherData);
    }
    if (shouldUseKaratsuba(currentData.length, otherData.length)) {
      return new LargeValue(karatsubaProduct(currentData, otherData), finalSign);
    }
    return new LargeValue(longMultiplication(currentData, otherData), finalSign);
  };
  LargeValue.prototype.times = LargeValue.prototype.mulOp;

  function scalarArrayProduct(scalarVal, segmentArr, resultIsNegative) {
    if (scalarVal < segmentSize) {
      return new LargeValue(scalarMultiplication(segmentArr, scalarVal), resultIsNegative);
    }
    return new LargeValue(longMultiplication(segmentArr, splitNativeNum(scalarVal)), resultIsNegative);
  }

  LargeValue.prototype._scalarProduct = function (tinyNum) {
    if (tinyNum.data === 0) {
      return NumHandler[0];
    }
    if (tinyNum.data === 1) {
      return this;
    }
    if (tinyNum.data === -1) {
      return this.flipSign();
    }
    return scalarArrayProduct(Math.abs(tinyNum.data), this.data, this.isNegative !== tinyNum.isNegative);
  };

  TinyValue.prototype._scalarProduct = function (tinyNum) {
    if (fitsNativeRange(tinyNum.data * this.data)) {
      return new TinyValue(tinyNum.data * this.data);
    }
    return scalarArrayProduct(Math.abs(tinyNum.data), splitNativeNum(Math.abs(this.data)), this.isNegative !== tinyNum.isNegative);
  };

  TinyValue.prototype.mulOp = function (otherVal) {
    return interpretInput(otherVal)._scalarProduct(this);
  };
  TinyValue.prototype.times = TinyValue.prototype.mulOp;

  function computeSquare(segmentArr) {
    var arrLen = segmentArr.length;
    var resultArr = initZeroArray(arrLen + arrLen);
    var currentSegmentSize = segmentSize;
    var productVal, carryVal, i, val_i, val_j;
    for (i = 0; i < arrLen; i++) {
      val_i = segmentArr[i];
      carryVal = 0 - val_i * val_i;
      for (var j = i; j < arrLen; j++) {
        val_j = segmentArr[j];
        productVal = 2 * (val_i * val_j) + resultArr[i + j] + carryVal;
        carryVal = Math.floor(productVal / currentSegmentSize);
        resultArr[i + j] = productVal - carryVal * currentSegmentSize;
      }
      resultArr[i + arrLen] = carryVal;
    }
    normalizeParts(resultArr);
    return resultArr;
  }

  LargeValue.prototype.computeSquare = function () {
    return new LargeValue(computeSquare(this.data), false);
  };

  TinyValue.prototype.computeSquare = function () {
    var squaredVal = this.data * this.data;
    if (fitsNativeRange(squaredVal)) {
      return new TinyValue(squaredVal);
    }
    return new LargeValue(computeSquare(splitNativeNum(Math.abs(this.data))), false);
  };

  function longDivisionAlgorithm(dividendSegments, divisorSegments) {
    var dividendLen = dividendSegments.length;
    var divisorLen = divisorSegments.length;
    var quotientSegments = initZeroArray(divisorLen);
    var currentSegmentSize = segmentSize;
    var divisorMostSignificant = divisorSegments[divisorLen - 1];
    var normalizationFactor = Math.ceil(currentSegmentSize / (2 * divisorMostSignificant));
    var remainderSegments = scalarMultiplication(dividendSegments, normalizationFactor);
    var normalizedDivisor = scalarMultiplication(divisorSegments, normalizationFactor);
    var quotientDigit, shiftAmount, currentCarry, currentBorrow, i, loopLength, qVal;
    if (remainderSegments.length <= dividendLen) {
      remainderSegments.push(0);
    }
    normalizedDivisor.push(0);
    divisorMostSignificant = normalizedDivisor[divisorLen - 1];
    for (shiftAmount = dividendLen - divisorLen; shiftAmount >= 0; shiftAmount--) {
      quotientDigit = currentSegmentSize - 1;
      if (remainderSegments[shiftAmount + divisorLen] !== divisorMostSignificant) {
        quotientDigit = Math.floor((remainderSegments[shiftAmount + divisorLen] * currentSegmentSize + remainderSegments[shiftAmount + divisorLen - 1]) / divisorMostSignificant);
      }
      currentCarry = 0;
      currentBorrow = 0;
      loopLength = normalizedDivisor.length;
      for (i = 0; i < loopLength; i++) {
        currentCarry += quotientDigit * normalizedDivisor[i];
        qVal = Math.floor(currentCarry / currentSegmentSize);
        currentBorrow += remainderSegments[shiftAmount + i] - (currentCarry - qVal * currentSegmentSize);
        currentCarry = qVal;
        if (currentBorrow < 0) {
          remainderSegments[shiftAmount + i] = currentBorrow + currentSegmentSize;
          currentBorrow = -1;
        } else {
          remainderSegments[shiftAmount + i] = currentBorrow;
          currentBorrow = 0;
        }
      }
      while (currentBorrow !== 0) {
        quotientDigit -= 1;
        currentCarry = 0;
        for (i = 0; i < loopLength; i++) {
          currentCarry += remainderSegments[shiftAmount + i] - currentSegmentSize + normalizedDivisor[i];
          if (currentCarry < 0) {
            remainderSegments[shiftAmount + i] = currentCarry + currentSegmentSize;
            currentCarry = 0;
          } else {
            remainderSegments[shiftAmount + i] = currentCarry;
            currentCarry = 1;
          }
        }
        currentBorrow += currentCarry;
      }
      quotientSegments[shiftAmount] = quotientDigit;
    }
    remainderSegments = nativeDivMod(remainderSegments, normalizationFactor)[0];
    return [joinToNativeNum(quotientSegments), joinToNativeNum(remainderSegments)];
  }

  function subtractiveDivision(dividendSegments, divisorSegments) {
    var dividendLen = dividendSegments.length;
    var divisorLen = divisorSegments.length;
    var quotientResult = [];
    var currentPart = [];
    var currentSegmentSize = segmentSize;
    var estimatedQuotient, partLength, highDividendPart, highDivisorPart, checkResult;
    while (dividendLen) {
      currentPart.unshift(dividendSegments[--dividendLen]);
      normalizeParts(currentPart);
      if (compareMagnitudes(currentPart, divisorSegments) < 0) {
        quotientResult.push(0);
        continue;
      }
      partLength = currentPart.length;
      highDividendPart = currentPart[partLength - 1] * currentSegmentSize + currentPart[partLength - 2];
      highDivisorPart = divisorSegments[divisorLen - 1] * currentSegmentSize + divisorSegments[divisorLen - 2];
      if (partLength > divisorLen) {
        highDividendPart = (highDividendPart + 1) * currentSegmentSize;
      }
      estimatedQuotient = Math.ceil(highDividendPart / highDivisorPart);
      do {
        checkResult = scalarMultiplication(divisorSegments, estimatedQuotient);
        if (compareMagnitudes(checkResult, currentPart) <= 0) {
          break;
        }
        estimatedQuotient--;
      } while (estimatedQuotient);
      quotientResult.push(estimatedQuotient);
      currentPart = performSubtraction(currentPart, checkResult);
    }
    quotientResult.reverse();
    return [joinToNativeNum(quotientResult), joinToNativeNum(currentPart)];
  }

  function nativeDivMod(segmentArr, nativeDivisor) {
    var arrLen = segmentArr.length;
    var quotientArr = initZeroArray(arrLen);
    var currentSegmentSize = segmentSize;
    var i, currentQuotient, currentRemainder, currentDividend;
    currentRemainder = 0;
    for (i = arrLen - 1; i >= 0; --i) {
      currentDividend = currentRemainder * currentSegmentSize + segmentArr[i];
      currentQuotient = floorOrCeil(currentDividend / nativeDivisor);
      currentRemainder = currentDividend - currentQuotient * nativeDivisor;
      quotientArr[i] = currentQuotient | 0;
    }
    return [quotientArr, currentRemainder | 0];
  }

  function unifiedDivMod(currentNum, otherVal) {
    var finalValue, otherNum = interpretInput(otherVal);
    var currentData = currentNum.data;
    var otherData = otherNum.data;
    var computedQuotient;
    if (otherData === 0) {
      throw new Error("Cannot divide by zero, operation is undefined.");
    }
    if (currentNum.isCompact) {
      if (otherNum.isCompact) {
        return [new TinyValue(floorOrCeil(currentData / otherData)), new TinyValue(currentData % otherData)];
      }
      return [NumHandler[0], currentNum];
    }
    if (otherNum.isCompact) {
      if (otherData === 1) {
        return [currentNum, NumHandler[0]];
      }
      if (otherData === -1) {
        return [currentNum.flipSign(), NumHandler[0]];
      }
      var absOtherData = Math.abs(otherData);
      if (absOtherData < segmentSize) {
        finalValue = nativeDivMod(currentData, absOtherData);
        computedQuotient = joinToNativeNum(finalValue[0]);
        var remainderVal = finalValue[1];
        if (currentNum.isNegative) {
          remainderVal = -remainderVal;
        }
        if (typeof computedQuotient === "number") {
          if (currentNum.isNegative !== otherNum.isNegative) {
            computedQuotient = -computedQuotient;
          }
          return [new TinyValue(computedQuotient), new TinyValue(remainderVal)];
        }
        return [new LargeValue(computedQuotient, currentNum.isNegative !== otherNum.isNegative), new TinyValue(remainderVal)];
      }
      otherData = splitNativeNum(absOtherData);
    }
    var comparisonResult = compareMagnitudes(currentData, otherData);
    if (comparisonResult === -1) {
      return [NumHandler[0], currentNum];
    }
    if (comparisonResult === 0) {
      return [NumHandler[currentNum.isNegative === otherNum.isNegative ? 1 : -1], NumHandler[0]];
    }
    if (currentData.length + otherData.length <= 200) {
      finalValue = longDivisionAlgorithm(currentData, otherData);
    } else {
      finalValue = subtractiveDivision(currentData, otherData);
    }
    computedQuotient = finalValue[0];
    var quotientSign = currentNum.isNegative !== otherNum.isNegative;
    var moduloResult = finalValue[1];
    var moduloSign = currentNum.isNegative;
    if (typeof computedQuotient === "number") {
      if (quotientSign) {
        computedQuotient = -computedQuotient;
      }
      computedQuotient = new TinyValue(computedQuotient);
    } else {
      computedQuotient = new LargeValue(computedQuotient, quotientSign);
    }
    if (typeof moduloResult === "number") {
      if (moduloSign) {
        moduloResult = -moduloResult;
      }
      moduloResult = new TinyValue(moduloResult);
    } else {
      moduloResult = new LargeValue(moduloResult, moduloSign);
    }
    return [computedQuotient, moduloResult];
  }

  LargeValue.prototype.divmod = function (otherVal) {
    var resultParts = unifiedDivMod(this, otherVal);
    return {
      quotient: resultParts[0],
      remainder: resultParts[1]
    };
  };
  TinyValue.prototype.divmod = LargeValue.prototype.divmod;

  LargeValue.prototype.divOp = function (otherVal) {
    return unifiedDivMod(this, otherVal)[0];
  };
  TinyValue.prototype.over = TinyValue.prototype.divOp;
  TinyValue.prototype.divOp = LargeValue.prototype.divOp;
  LargeValue.prototype.over = LargeValue.prototype.divOp;

  LargeValue.prototype.modOp = function (otherVal) {
    return unifiedDivMod(this, otherVal)[1];
  };
  TinyValue.prototype.remainder = TinyValue.prototype.modOp;
  TinyValue.prototype.modOp = LargeValue.prototype.modOp;
  LargeValue.prototype.remainder = LargeValue.prototype.modOp;

  LargeValue.prototype.power = function (exponentVal) {
    var exponentNum = interpretInput(exponentVal);
    var baseData = this.data;
    var expData = exponentNum.data;
    var computedValue, currentBase, currentExp;
    if (expData === 0) {
      return NumHandler[1];
    }
    if (baseData === 0) {
      return NumHandler[0];
    }
    if (baseData === 1) {
      return NumHandler[1];
    }
    if (baseData === -1) {
      return exponentNum.checkEven() ? NumHandler[1] : NumHandler[-1];
    }
    if (exponentNum.isNegative) {
      return NumHandler[0];
    }
    if (!exponentNum.isCompact) {
      throw new Error("The exponent " + exponentNum.toFormattedString() + " is too large for computation.");
    }
    if (this.isCompact) {
      if (fitsNativeRange(computedValue = Math.pow(baseData, expData))) {
        return new TinyValue(floorOrCeil(computedValue));
      }
    }
    currentBase = this;
    currentExp = NumHandler[1];
    while (true) {
      if ((expData & 1) === 1) {
        currentExp = currentExp.times(currentBase);
        --expData;
      }
      if (expData === 0) {
        break;
      }
      expData /= 2;
      currentBase = currentBase.computeSquare();
    }
    return currentExp;
  };
  TinyValue.prototype.power = LargeValue.prototype.power;

  LargeValue.prototype.modularExponentiation = function (expVal, modVal) {
    var exponent = interpretInput(expVal);
    var modulus = interpretInput(modVal);
    if (modulus.checkZero()) {
      throw new Error("Cannot compute modular exponentiation with modulus 0.");
    }
    var result = NumHandler[1];
    var currentBase = this.modOp(modulus);
    while (exponent.checkPositive()) {
      if (currentBase.checkZero()) {
        return NumHandler[0];
      }
      if (exponent.checkOdd()) {
        result = result.mulOp(currentBase).modOp(modulus);
      }
      exponent = exponent.divOp(2);
      currentBase = currentBase.computeSquare().modOp(modulus);
    }
    return result;
  };
  TinyValue.prototype.modularExponentiation = LargeValue.prototype.modularExponentiation;

  function compareMagnitudes(arrA, arrB) {
    if (arrA.length !== arrB.length) {
      return arrA.length > arrB.length ? 1 : -1;
    }
    for (var i = arrA.length - 1; i >= 0; i--) {
      if (arrA[i] !== arrB[i]) {
        return arrA[i] > arrB[i] ? 1 : -1;
      }
    }
    return 0;
  }

  LargeValue.prototype.compareMagnitudes = function (otherVal) {
    var otherNum = interpretInput(otherVal);
    var currentData = this.data;
    var otherData = otherNum.data;
    if (otherNum.isCompact) {
      return compareMagnitudes(currentData, splitNativeNum(Math.abs(otherData)));
    }
    return compareMagnitudes(currentData, otherData);
  };

  TinyValue.prototype.compareMagnitudes = function (otherVal) {
    var otherNum = interpretInput(otherVal);
    var currentAbs = Math.abs(this.data);
    var otherData = otherNum.data;
    if (otherNum.isCompact) {
      var otherAbs = Math.abs(otherData);
      return currentAbs === otherAbs ? 0 : currentAbs > otherAbs ? 1 : -1;
    }
    return compareMagnitudes(splitNativeNum(currentAbs), otherData);
  };

  LargeValue.prototype.compare = function (otherVal) {
    if (otherVal === Infinity) {
      return -1;
    }
    if (otherVal === -Infinity) {
      return 1;
    }
    var otherNum = interpretInput(otherVal);
    var currentData = this.data;
    var otherData = otherNum.data;
    if (this.isNegative !== otherNum.isNegative) {
      return otherNum.isNegative ? 1 : -1;
    }
    if (otherNum.isCompact) {
      return compareMagnitudes(currentData, splitNativeNum(Math.abs(otherData))) * (this.isNegative ? -1 : 1);
    }
    return compareMagnitudes(currentData, otherData) * (this.isNegative ? -1 : 1);
  };
  LargeValue.prototype.compareTo = LargeValue.prototype.compare;

  TinyValue.prototype.compare = function (otherVal) {
    if (otherVal === Infinity) {
      return -1;
    }
    if (otherVal === -Infinity) {
      return 1;
    }
    var otherNum = interpretInput(otherVal);
    var currentNative = this.data;
    var otherData = otherNum.data;
    if (otherNum.isCompact) {
      return currentNative === otherData ? 0 : currentNative > otherData ? 1 : -1;
    }
    if (currentNative < 0 !== otherNum.isNegative) {
      return currentNative < 0 ? -1 : 1;
    }
    return compareMagnitudes(splitNativeNum(Math.abs(currentNative)), otherData) * (this.isNegative ? -1 : 1);
  };
  TinyValue.prototype.compareTo = TinyValue.prototype.compare;

  LargeValue.prototype.equalCheck = function (otherVal) {
    return this.compare(otherVal) === 0;
  };
  TinyValue.prototype.eq = TinyValue.prototype.equalCheck;
  TinyValue.prototype.equalCheck = LargeValue.prototype.equalCheck;
  LargeValue.prototype.eq = LargeValue.prototype.equalCheck;

  LargeValue.prototype.notEqualCheck = function (otherVal) {
    return this.compare(otherVal) !== 0;
  };
  TinyValue.prototype.neq = TinyValue.prototype.notEqualCheck;
  TinyValue.prototype.notEqualCheck = LargeValue.prototype.notEqualCheck;
  LargeValue.prototype.neq = LargeValue.prototype.notEqualCheck;

  LargeValue.prototype.greaterThanCheck = function (otherVal) {
    return this.compare(otherVal) > 0;
  };
  TinyValue.prototype.gt = TinyValue.prototype.greaterThanCheck;
  TinyValue.prototype.greaterThanCheck = LargeValue.prototype.greaterThanCheck;
  LargeValue.prototype.gt = LargeValue.prototype.greaterThanCheck;

  LargeValue.prototype.lessThanCheck = function (otherVal) {
    return this.compare(otherVal) < 0;
  };
  TinyValue.prototype.lt = TinyValue.prototype.lessThanCheck;
  TinyValue.prototype.lessThanCheck = LargeValue.prototype.lessThanCheck;
  LargeValue.prototype.lt = LargeValue.prototype.lessThanCheck;

  LargeValue.prototype.greaterEqualCheck = function (otherVal) {
    return this.compare(otherVal) >= 0;
  };
  TinyValue.prototype.geq = TinyValue.prototype.greaterEqualCheck;
  TinyValue.prototype.greaterEqualCheck = LargeValue.prototype.greaterEqualCheck;
  LargeValue.prototype.geq = LargeValue.prototype.greaterEqualCheck;

  LargeValue.prototype.lessEqualCheck = function (otherVal) {
    return this.compare(otherVal) <= 0;
  };
  TinyValue.prototype.leq = TinyValue.prototype.lessEqualCheck;
  TinyValue.prototype.lessEqualCheck = LargeValue.prototype.lessEqualCheck;
  LargeValue.prototype.leq = LargeValue.prototype.lessEqualCheck;

  LargeValue.prototype.checkEven = function () {
    return (this.data[0] & 1) === 0;
  };
  TinyValue.prototype.checkEven = function () {
    return (this.data & 1) === 0;
  };

  LargeValue.prototype.checkOdd = function () {
    return (this.data[0] & 1) === 1;
  };
  TinyValue.prototype.checkOdd = function () {
    return (this.data & 1) === 1;
  };

  LargeValue.prototype.checkPositive = function () {
    return !this.isNegative;
  };
  TinyValue.prototype.checkPositive = function () {
    return this.data > 0;
  };

  LargeValue.prototype.checkNegative = function () {
    return this.isNegative;
  };
  TinyValue.prototype.checkNegative = function () {
    return this.data < 0;
  };

  LargeValue.prototype.checkUnit = function () {
    return false;
  };
  TinyValue.prototype.checkUnit = function () {
    return Math.abs(this.data) === 1;
  };

  LargeValue.prototype.checkZero = function () {
    return false;
  };
  TinyValue.prototype.checkZero = function () {
    return this.data === 0;
  };

  LargeValue.prototype.checkDivisibleBy = function (otherVal) {
    var otherNum = interpretInput(otherVal);
    var otherData = otherNum.data;
    if (otherData === 0) {
      return false;
    }
    if (otherData === 1) {
      return true;
    }
    if (otherData === 2) {
      return this.checkEven();
    }
    return this.modOp(otherNum).equalCheck(NumHandler[0]);
  };
  TinyValue.prototype.checkDivisibleBy = LargeValue.prototype.checkDivisibleBy;

  function isSmallPrimeCandidate(numVal) {
    var absNum = numVal.getAbsolute();
    if (absNum.checkUnit()) {
      return false;
    }
    if (absNum.equalCheck(2) || absNum.equalCheck(3) || absNum.equalCheck(5)) {
      return true;
    }
    if (absNum.checkEven() || absNum.checkDivisibleBy(3) || absNum.checkDivisibleBy(5)) {
      return false;
    }
    if (absNum.lessThanCheck(25)) {
      return true;
    }
  }

  LargeValue.prototype.checkPrime = function () {
    var smallPrimeResult = isSmallPrimeCandidate(this);
    if (smallPrimeResult !== undefined) {
      return smallPrimeResult;
    }
    var currentNum = this.getAbsolute();
    var previousNum = currentNum.decrementValue();
    var testPrimes = [2, 3, 5, 7, 11, 13, 17, 19];
    var currentB = previousNum;
    var currentD, isCompositeFlag, currentX;
    while (currentB.checkEven()) {
      currentB = currentB.divOp(2);
    }
    for (var i = 0; i < testPrimes.length; i++) {
      currentX = largeNumLib(testPrimes[i]).modularExponentiation(currentB, currentNum);
      if (currentX.equalCheck(NumHandler[1]) || currentX.equalCheck(previousNum)) {
        continue;
      }
      isCompositeFlag = true;
      for (currentD = currentB; isCompositeFlag && currentD.lessThanCheck(previousNum); currentD = currentD.mulOp(2)) {
        currentX = currentX.computeSquare().modOp(currentNum);
        if (currentX.equalCheck(previousNum)) {
          isCompositeFlag = false;
        }
      }
      if (isCompositeFlag) {
        return false;
      }
    }
    return true;
  };
  TinyValue.prototype.checkPrime = LargeValue.prototype.checkPrime;

  LargeValue.prototype.checkProbablePrime = function (numIterations) {
    var smallPrimeResult = isSmallPrimeCandidate(this);
    if (smallPrimeResult !== undefined) {
      return smallPrimeResult;
    }
    var currentNum = this.getAbsolute();
    var numTests = numIterations === undefined ? 5 : numIterations;
    for (var i = 0; i < numTests; i++) {
      var randomA = largeNumLib.randomBetween(2, currentNum.subOp(2));
      if (!randomA.modularExponentiation(currentNum.decrementValue(), currentNum).checkUnit()) {
        return false;
      }
    }
    return true;
  };
TinyValue.prototype.checkProbablePrime = LargeValue.prototype.checkProbablePrime;

  LargeValue.prototype.modularInverse = function (modulusVal) {
    var currentT = largeNumLib.zero;
    var newT = largeNumLib.one;
    var modulusR = interpretInput(modulusVal);
    var newR = this.getAbsolute();
    var quotientVal, lastT, lastR;
    while (!newR.equalCheck(largeNumLib.zero)) {
      quotientVal = modulusR.divOp(newR);
      lastT = currentT;
      lastR = modulusR;
      currentT = newT;
      modulusR = newR;
      newT = lastT.subOp(quotientVal.mulOp(newT));
      newR = lastR.subOp(quotientVal.mulOp(newR));
    }
    if (!modulusR.equalCheck(1)) {
      throw new Error(this.toFormattedString() + " and " + modulusVal.toFormattedString() + " are not co-prime.");
    }
    if (currentT.compare(0) === -1) {
      currentT = currentT.addOp(modulusVal);
    }
    if (this.checkNegative()) {
      return currentT.flipSign();
    }
    return currentT;
  };
  TinyValue.prototype.modularInverse = LargeValue.prototype.modularInverse;

  LargeValue.prototype.incrementValue = function () {
    var currentData = this.data;
    if (this.isNegative) {
      return subtractNative(currentData, 1, this.isNegative);
    }
    return new LargeValue(addNative(currentData, 1), this.isNegative);
  };

  TinyValue.prototype.incrementValue = function () {
    var currentNative = this.data;
    if (currentNative + 1 < jsSafeMax) {
      return new TinyValue(currentNative + 1);
    }
    return new LargeValue(jsSafeMaxParts, false);
  };

  LargeValue.prototype.decrementValue = function () {
    var currentData = this.data;
    if (this.isNegative) {
      return new LargeValue(addNative(currentData, 1), true);
    }
    return subtractNative(currentData, 1, this.isNegative);
  };

  TinyValue.prototype.decrementValue = function () {
    var currentNative = this.data;
    if (currentNative - 1 > -jsSafeMax) {
      return new TinyValue(currentNative - 1);
    }
    return new LargeValue(jsSafeMaxParts, true);
  };

  var binaryFactors = [1];
  while (2 * binaryFactors[binaryFactors.length - 1] <= segmentSize) {
    binaryFactors.push(2 * binaryFactors[binaryFactors.length - 1]);
  }
  var binaryFactorCount = binaryFactors.length;
  var largestBinaryFactor = binaryFactors[binaryFactorCount - 1];

  function isShiftAmountCompact(shiftAmount) {
    return (typeof shiftAmount === "number" || typeof shiftAmount === "string") && +Math.abs(shiftAmount) <= segmentSize || shiftAmount instanceof LargeValue && shiftAmount.data.length <= 1;
  }

  LargeValue.prototype.shiftBitsLeft = function (shiftAmount) {
    if (!isShiftAmountCompact(shiftAmount)) {
      throw new Error(String(shiftAmount) + " is too large for bit shifting.");
    }
    shiftAmount = +shiftAmount;
    if (shiftAmount < 0) {
      return this.shiftBitsRight(-shiftAmount);
    }
    var currentResult = this;
    if (currentResult.checkZero()) {
      return currentResult;
    }
    while (shiftAmount >= binaryFactorCount) {
      currentResult = currentResult.mulOp(largestBinaryFactor);
      shiftAmount -= binaryFactorCount - 1;
    }
    return currentResult.mulOp(binaryFactors[shiftAmount]);
  };
  TinyValue.prototype.shiftBitsLeft = LargeValue.prototype.shiftBitsLeft;

  LargeValue.prototype.shiftBitsRight = function (shiftAmount) {
    var divModResult;
    if (!isShiftAmountCompact(shiftAmount)) {
      throw new Error(String(shiftAmount) + " is too large for bit shifting.");
    }
    shiftAmount = +shiftAmount;
    if (shiftAmount < 0) {
      return this.shiftBitsLeft(-shiftAmount);
    }
    var currentResult = this;
    while (shiftAmount >= binaryFactorCount) {
      if (currentResult.checkZero() || (currentResult.checkNegative() && currentResult.checkUnit())) {
        return currentResult;
      }
      divModResult = unifiedDivMod(currentResult, largestBinaryFactor);
      currentResult = divModResult[1].checkNegative() ? divModResult[0].decrementValue() : divModResult[0];
      shiftAmount -= binaryFactorCount - 1;
    }
    divModResult = unifiedDivMod(currentResult, binaryFactors[shiftAmount]);
    return divModResult[1].checkNegative() ? divModResult[0].decrementValue() : divModResult[0];
  };
  TinyValue.prototype.shiftBitsRight = LargeValue.prototype.shiftBitsRight;

  function performBitwiseOp(valX, valY, operationFn) {
    valY = interpretInput(valY);
    var xIsNegative = valX.checkNegative();
    var yIsNegative = valY.checkNegative();
    var xRemainder = xIsNegative ? valX.notOp() : valX;
    var yRemainder = yIsNegative ? valY.notOp() : valY;
    var xCurrentDigit = 0;
    var yCurrentDigit = 0;
    var xDivModResult = null;
    var yDivModResult = null;
    var resultDigits = [];
    while (!xRemainder.checkZero() || !yRemainder.checkZero()) {
      xDivModResult = unifiedDivMod(xRemainder, largestBinaryFactor);
      xCurrentDigit = xDivModResult[1].toNativeNumber();
      if (xIsNegative) {
        xCurrentDigit = largestBinaryFactor - 1 - xCurrentDigit;
      }
      yDivModResult = unifiedDivMod(yRemainder, largestBinaryFactor);
      yCurrentDigit = yDivModResult[1].toNativeNumber();
      if (yIsNegative) {
        yCurrentDigit = largestBinaryFactor - 1 - yCurrentDigit;
      }
      xRemainder = xDivModResult[0];
      yRemainder = yDivModResult[0];
      resultDigits.push(operationFn(xCurrentDigit, yCurrentDigit));
    }
    var finalSignBit = operationFn(xIsNegative ? 1 : 0, yIsNegative ? 1 : 0) !== 0 ? largeNumLib(-1) : largeNumLib(0);
    var finalSum = finalSignBit;
    for (var i = resultDigits.length - 1; i >= 0; i -= 1) {
      finalSum = finalSum.mulOp(largestBinaryFactor).addOp(largeNumLib(resultDigits[i]));
    }
    return finalSum;
  }

  LargeValue.prototype.notOp = function () {
    return this.flipSign().decrementValue();
  };
  TinyValue.prototype.notOp = LargeValue.prototype.notOp;

  LargeValue.prototype.andOp = function (otherNum) {
    return performBitwiseOp(this, otherNum, function (a, b) {
      return a & b;
    });
  };
  TinyValue.prototype.andOp = LargeValue.prototype.andOp;

  LargeValue.prototype.orOp = function (otherNum) {
    return performBitwiseOp(this, otherNum, function (a, b) {
      return a | b;
    });
  };
  TinyValue.prototype.orOp = LargeValue.prototype.orOp;

  LargeValue.prototype.xorOp = function (otherNum) {
    return performBitwiseOp(this, otherNum, function (a, b) {
      return a ^ b;
    });
  };
  TinyValue.prototype.xorOp = LargeValue.prototype.xorOp;

  var lowBitMaskInt = 1 << 30;
  var lowBitMaskBig = (segmentSize & -segmentSize) * (segmentSize & -segmentSize) | lowBitMaskInt;

  function approximateLowBit(numVal) {
    var valData = numVal.data;
    var lowBit;
    if (typeof valData === "number") {
      lowBit = valData | lowBitMaskInt;
    } else {
      lowBit = valData[0] + (valData[1] || 0) * segmentSize | lowBitMaskBig;
    }
    return lowBit & -lowBit;
  }

  function calcIntegerLog(targetValue, logBase) {
    if (logBase.compareTo(targetValue) <= 0) {
      var tempResult = calcIntegerLog(targetValue, logBase.computeSquare());
      var currentPower = tempResult.p;
      var currentExponent = tempResult.e;
      var productWithBase = currentPower.mulOp(logBase);
      return productWithBase.compareTo(targetValue) <= 0 ? {
        p: productWithBase,
        e: currentExponent * 2 + 1
      } : {
        p: currentPower,
        e: currentExponent * 2
      };
    }
    return {
      p: largeNumLib(1),
      e: 0
    };
  }

  LargeValue.prototype.getBitLength = function () {
    var currentNum = this;
    if (currentNum.compare(largeNumLib(0)) < 0) {
      currentNum = currentNum.flipSign().subOp(largeNumLib(1));
    }
    if (currentNum.compare(largeNumLib(0)) === 0) {
      return largeNumLib(0);
    }
    return largeNumLib(calcIntegerLog(currentNum, largeNumLib(2)).e).addOp(largeNumLib(1));
  };
  TinyValue.prototype.getBitLength = LargeValue.prototype.getBitLength;

  function findMaximum(val1, val2) {
    val1 = interpretInput(val1);
    val2 = interpretInput(val2);
    return val1.greaterThanCheck(val2) ? val1 : val2;
  }

  function findMinimum(val1, val2) {
    val1 = interpretInput(val1);
    val2 = interpretInput(val2);
    return val1.lessThanCheck(val2) ? val1 : val2;
  }

  function greatestCommonDivisor(valA, valB) {
    valA = interpretInput(valA).getAbsolute();
    valB = interpretInput(valB).getAbsolute();
    if (valA.equalCheck(valB)) {
      return valA;
    }
    if (valA.checkZero()) {
      return valB;
    }
    if (valB.checkZero()) {
      return valA;
    }
    var commonFactor = NumHandler[1];
    var lowBitA, lowBitB, tempVal;
    while (valA.checkEven() && valB.checkEven()) {
      lowBitA = approximateLowBit(valA);
      lowBitB = approximateLowBit(valB);
      var minLowBit = Math.min(lowBitA, lowBitB);
      valA = valA.divOp(minLowBit);
      valB = valB.divOp(minLowBit);
      commonFactor = commonFactor.mulOp(minLowBit);
    }
    while (valA.checkEven()) {
      valA = valA.divOp(approximateLowBit(valA));
    }
    do {
      while (valB.checkEven()) {
        valB = valB.divOp(approximateLowBit(valB));
      }
      if (valA.greaterThanCheck(valB)) {
        tempVal = valB;
        valB = valA;
        valA = tempVal;
      }
      valB = valB.subOp(valA);
    } while (!valB.checkZero());
    return commonFactor.checkUnit() ? valA : valA.mulOp(commonFactor);
  }

  function leastCommonMultiple(valA, valB) {
    valA = interpretInput(valA).getAbsolute();
    valB = interpretInput(valB).getAbsolute();
    return valA.divOp(greatestCommonDivisor(valA, valB)).mulOp(valB);
  }

  function randomBetween(lowerBound, upperBound) {
    lowerBound = interpretInput(lowerBound);
    upperBound = interpretInput(upperBound);
    var low = findMinimum(lowerBound, upperBound);
    var high = findMaximum(lowerBound, upperBound);
    var valueRange = high.subOp(low).addOp(1);
    if (valueRange.isCompact) {
      return low.addOp(Math.floor(Math.random() * valueRange.data));
    }
    var rangeLen = valueRange.data.length - 1;
    var randomResult = [];
    var isRestricted = true;
    for (var i = rangeLen; i >= 0; i--) {
      var topLimit = isRestricted ? valueRange.data[i] : segmentSize;
      var digit = floorOrCeil(Math.random() * topLimit);
      randomResult.unshift(digit);
      if (digit < topLimit) {
        isRestricted = false;
      }
    }
    randomResult = joinToNativeNum(randomResult);
    return low.addOp(typeof randomResult === "number" ? new TinyValue(randomResult) : new LargeValue(randomResult, false));
  }

  var interpretRadixString = function (textValue, numericRadix) {
    var textLength = textValue.length;
    var charIndex;
    var absRadix = Math.abs(numericRadix);
    for (charIndex = 0; charIndex < textLength; charIndex++) {
      var char = textValue[charIndex].toLowerCase();
      if (char === "-") {
        continue;
      }
      if (/[a-z0-9]/.test(char)) {
        if (/[0-9]/.test(char) && +char >= absRadix) {
          if (char === "1" && absRadix === 1) {
            continue;
          }
          throw new Error(char + " is not a valid digit in base " + numericRadix + ".");
        } else if (char.charCodeAt(0) - 87 >= absRadix) {
          throw new Error(char + " is not a valid digit in base " + numericRadix + ".");
        }
      }
    }
    if (2 <= numericRadix && numericRadix <= 36) {
      if (textLength <= logJsSafeMax / Math.log(numericRadix)) {
        var parsedResult = parseInt(textValue, numericRadix);
        if (isNaN(parsedResult)) {
          throw new Error(char + " is not a valid digit in base " + numericRadix + ".");
        }
        return new TinyValue(parseInt(textValue, numericRadix));
      }
    }
    numericRadix = interpretInput(numericRadix);
    var digitList = [];
    var isNumNegative = textValue.charAt(0) === "-";
    for (charIndex = isNumNegative ? 1 : 0; charIndex < textValue.length; charIndex++) {
      var currentSymbol = textValue[charIndex].toLowerCase();
      var charCode = currentSymbol.charCodeAt(0);
      if (48 <= charCode && charCode <= 57) {
        digitList.push(interpretInput(currentSymbol));
      } else if (97 <= charCode && charCode <= 122) {
        digitList.push(interpretInput(currentSymbol.charCodeAt(0) - 87));
      } else if (currentSymbol === "<") {
        var startIndex = charIndex;
        do {
          charIndex++;
        } while (textValue[charIndex] !== ">");
        digitList.push(interpretInput(textValue.slice(startIndex + 1, charIndex)));
      } else {
        throw new Error(currentSymbol + " is not a valid character");
      }
    }
    return interpretBaseParts(digitList, numericRadix, isNumNegative);
  };

  function interpretBaseParts(digitsArray, baseNum, isNegativeFlag) {
    var finalValue = NumHandler[0];
    var currentPower = NumHandler[1];
    var i;
    for (i = digitsArray.length - 1; i >= 0; i--) {
      finalValue = finalValue.addOp(digitsArray[i].mulOp(currentPower));
      currentPower = currentPower.mulOp(baseNum);
    }
    return isNegativeFlag ? finalValue.flipSign() : finalValue;
  }

  function digitToString(digitVal) {
    if (digitVal <= 35) {
      return "0123456789abcdefghijklmnopqrstuvwxyz".charAt(digitVal);
    }
    return "<" + digitVal + ">";
  }

  function convertToBase(numToConvert, targetBase) {
    targetBase = largeNumLib(targetBase);
    if (targetBase.checkZero()) {
      if (numToConvert.checkZero()) {
        return {
          digits: [0],
          isNegative: false
        };
      }
      throw new Error("Cannot convert nonzero numbers to base 0.");
    }
    if (targetBase.equalCheck(-1)) {
      if (numToConvert.checkZero()) {
        return {
          digits: [0],
          isNegative: false
        };
      }
      if (numToConvert.checkNegative()) {
        var tempArr = Array.from({
          length: -numToConvert.data
        }).map(() => [1, 0]);
        return {
          digits: [].concat.apply([], tempArr),
          isNegative: false
        };
      }
      var tempArr2 = Array.from({
        length: numToConvert.data - 1
      }).map(() => [0, 1]);
      tempArr2.unshift([1]);
      return {
        digits: [].concat.apply([], tempArr2),
        isNegative: false
      };
    }
    var resultIsNegative = false;
    if (numToConvert.checkNegative() && targetBase.checkPositive()) {
      resultIsNegative = true;
      numToConvert = numToConvert.getAbsolute();
    }
    if (targetBase.equalCheck(1)) {
      if (numToConvert.checkZero()) {
        return {
          digits: [0],
          isNegative: false
        };
      }
      return {
        digits: Array.from({
          length: numToConvert.data
        }).map(Number.prototype.valueOf, 1),
        isNegative: resultIsNegative
      };
    }
    var outputDigits = [];
    var currentRemainder = numToConvert;
    var divisionResult;
    while (currentRemainder.checkNegative() || currentRemainder.compareMagnitudes(targetBase) >= 0) {
      divisionResult = currentRemainder.divmod(targetBase);
      currentRemainder = divisionResult.quotient;
      var currentDigit = divisionResult.remainder;
      if (currentDigit.checkNegative()) {
        currentDigit = targetBase.subOp(currentDigit).getAbsolute();
        currentRemainder = currentRemainder.incrementValue();
      }
      outputDigits.push(currentDigit.toNativeNumber());
    }
    outputDigits.push(currentRemainder.toNativeNumber());
    return {
      digits: outputDigits.reverse(),
      isNegative: resultIsNegative
    };
  }

  LargeValue.prototype.toSegmentArray = function (radixVal) {
    return convertToBase(this, radixVal);
  };
  TinyValue.prototype.toSegmentArray = function (radixVal) {
    return convertToBase(this, radixVal);
  };

  LargeValue.prototype.toFormattedString = function (radixVal) {
    if (radixVal === undefined) {
      radixVal = 10;
    }
    if (radixVal !== 10) {
      return toRadixString(this, radixVal);
    }
    var segments = this.data;
    var segLength = segments.length;
    var stringResult = String(segments[--segLength]);
    var zeroPad = "0000000";
    var currentDigitString;
    while (--segLength >= 0) {
      currentDigitString = String(segments[segLength]);
      stringResult += zeroPad.slice(currentDigitString.length) + currentDigitString;
    }
    var finalSign = this.isNegative ? "-" : "";
    return finalSign + stringResult;
  };

  TinyValue.prototype.toFormattedString = function (radixVal) {
    if (radixVal === undefined) {
      radixVal = 10;
    }
    if (radixVal !== 10) {
      return toRadixString(this, radixVal);
    }
    return String(this.data);
  };

  function toRadixString(numVal, baseVal) {
    var converted = convertToBase(numVal, baseVal);
    return (converted.isNegative ? "-" : "") + converted.digits.map(digitToString).join("");
  }

  LargeValue.prototype.serializeToJSON = TinyValue.prototype.serializeToJSON = function () {
    return this.toFormattedString();
  };

  LargeValue.prototype.getNumericValue = function () {
    return parseInt(this.toFormattedString(), 10);
  };
  LargeValue.prototype.toNativeNumber = LargeValue.prototype.getNumericValue;

  TinyValue.prototype.getNumericValue = function () {
    return this.data;
  };
  TinyValue.prototype.toNativeNumber = TinyValue.prototype.getNumericValue;

  function interpretStringValue(stringValue) {
    if (fitsNativeRange(+stringValue)) {
      var parsedNative = +stringValue;
      if (parsedNative === floorOrCeil(parsedNative)) {
        return new TinyValue(parsedNative);
      }
      throw new Error("Invalid integer: " + stringValue);
    }
    var isNegative = stringValue.charAt(0) === "-";
    if (isNegative) {
      stringValue = stringValue.slice(1);
    }
    var splitByE = stringValue.split(/E/i);
    if (splitByE.length > 2) {
      throw new Error("Invalid integer: " + splitByE.join("E"));
    }
    if (splitByE.length === 2) {
      var exponentPart = splitByE[1];
      if (exponentPart.charAt(0) === "+") {
        exponentPart = exponentPart.slice(1);
      }
      var exponentNum = +exponentPart;
      if (exponentNum !== floorOrCeil(exponentNum) || !fitsNativeRange(exponentNum)) {
        throw new Error("Invalid integer: " + exponentNum + " is not a valid exponent.");
      }
      var baseText = splitByE[0];
      var decimalPointIndex = baseText.indexOf(".");
      if (decimalPointIndex >= 0) {
        exponentNum -= baseText.length - decimalPointIndex - 1;
        baseText = baseText.slice(0, decimalPointIndex) + baseText.slice(decimalPointIndex + 1);
      }
      if (exponentNum < 0) {
        throw new Error("Cannot include negative exponent part for integers.");
      }
      baseText += new Array(exponentNum + 1).join("0");
      stringValue = baseText;
    }
    var isValidFormat = /^([0-9][0-9]*)$/.test(stringValue);
    if (!isValidFormat) {
      throw new Error("Invalid integer: " + stringValue);
    }
    var segments = [];
    var strMax = stringValue.length;
    var segLen = segmentDigits;
    var strMin = strMax - segLen;
    while (strMax > 0) {
      segments.push(+(stringValue.slice(strMin, strMax)));
      strMin -= segLen;
      if (strMin < 0) {
        strMin = 0;
      }
      strMax -= segLen;
    }
    normalizeParts(segments);
    return new LargeValue(segments, isNegative);
  }

  function interpretNumberValue(numValue) {
    if (fitsNativeRange(numValue)) {
      if (numValue !== floorOrCeil(numValue)) {
        throw new Error(numValue + " is not an integer.");
      }
      return new TinyValue(numValue);
    }
    return interpretStringValue(numValue.toFormattedString());
  }

  function interpretInput(input) {
    if (typeof input === "number") {
      return interpretNumberValue(input);
    }
    if (typeof input === "string") {
      return interpretStringValue(input);
    }
    return input;
  }

  for (var i = 0; i < 1000; i++) {
    NumHandler[i] = new TinyValue(i);
    if (i > 0) {
      NumHandler[-i] = new TinyValue(-i);
    }
  }

  NumHandler.one = NumHandler[1];
  NumHandler.zero = NumHandler[0];
  NumHandler.minusOne = NumHandler[-1];
  NumHandler.findMaximum = findMaximum;
  NumHandler.findMinimum = findMinimum;
  NumHandler.greatestCommonDivisor = greatestCommonDivisor;
  NumHandler.leastCommonMultiple = leastCommonMultiple;
  NumHandler.isInstance = function (obj) {
    return obj instanceof LargeValue || obj instanceof TinyValue;
  };
  NumHandler.randomBetween = randomBetween;
  NumHandler.fromSegmentArray = function (digitSegs, baseOption, isNegativeFlag) {
    return interpretBaseParts(
      digitSegs.map(interpretInput),
      interpretInput(baseOption || 10),
      isNegativeFlag
    );
  };

  return NumHandler;
})();

var largeNum = largeNumLib();

function ProcessInput(inputLines) {
  inputLines = inputLines.split("\n");
  var testCaseCount = +inputLines[0];

  for (var lineIndex = 1; lineIndex <= testCaseCount; lineIndex++) {
    var values = inputLines[lineIndex].split(" ");
    var valB = largeNum.addOp(values[1]);
    var valC = largeNum.addOp(values[2]);
    var valD = largeNum.addOp(values[3]);
    var valA = largeNum.addOp(values[0]);

    if (valA.lessThanCheck(valB) || valD.lessThanCheck(valB)) {
      console.log("No");
      continue;
    }
    if (valB.lessEqualCheck(valC.subOp(1))) {
      console.log("Yes");
      continue;
    }
    var remainderValue = valA.modOp(valB);
    if (valC.lessThanCheck(remainderValue)) {
      console.log("No");
      continue;
    }
    var commonDivisor = largeNumLib.greatestCommonDivisor(valB, valD);
    remainderValue = remainderValue.modOp(commonDivisor);
    if (valC.subOp(remainderValue).divOp(commonDivisor).mulOp(commonDivisor).addOp(remainderValue).addOp(commonDivisor).lessThanCheck(valB)) {
      console.log("No");
    } else {
      console.log("Yes");
    }
  }
}
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));