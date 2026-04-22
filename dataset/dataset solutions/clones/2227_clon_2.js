"use strict";
const DATA_READER = (function() {
  function createReader(sourceTxt) {
    return new InputHandler(sourceTxt);
  }

  function InputHandler(sourceTxt) {
    this._sourceLines = sourceTxt.trim().split("\n");
    this._lineIndex = 0;
  }

  InputHandler.prototype.readSingle = function(asString) {
    let currentLine = this._sourceLines,
      lineCursor = this._lineIndex,
      resultVal;

    if (typeof currentLine[lineCursor] === "string")
      currentLine[lineCursor] = currentLine[lineCursor].split(" ").reverse();

    resultVal = currentLine[lineCursor].pop();

    if (!currentLine[lineCursor].length)
      this._lineIndex++;

    return asString ? resultVal : +resultVal;
  };

  InputHandler.prototype.readList = function(asString) {
    let currentLine = this._sourceLines[this._lineIndex++].split(" ");
    return asString ? currentLine : currentLine.map(itemVal => +itemVal);
  };

  InputHandler.prototype.readMatrix = function(numLines, asString) {
    let resultVal = this._sourceLines.slice(this._lineIndex, this._lineIndex += numLines).map(itemVal => itemVal.split(" "));
    return asString ? resultVal : resultVal.map(itemVal => itemVal.map(innerItem => +innerItem));
  };

  InputHandler.prototype.readRawLines = function(numLines, asString) {
    let resultVal = this._sourceLines.slice(this._lineIndex, this._lineIndex += numLines);
    return asString ? resultVal : resultVal.map(itemVal => +itemVal);
  };

  return createReader;
})();

const inputProcessor = DATA_READER(require("fs").readFileSync("/dev/stdin", "utf8"));

function multiDimArray(defaultValue) {
  let argsList = arguments,
    len = argsList.length,
    arrayCreationString = "Array(argsList[" + --len + "]).fill(0).map(_=>{return " + defaultValue + ";})";

  while (--len)
    arrayCreationString = "Array(argsList[" + len + "]).fill(0).map(_=>" + arrayCreationString + ")";

  return eval(arrayCreationString);
}

const largeNum = (function(void0) {
  "use strict";
  const NUM_BASE = 1e7,
    LOG_NUM_BASE = 7,
    MAX_JS_SAFE_INT = 9007199254740992,
    MAX_JS_SAFE_INT_DIGITS = intToDigitArray(MAX_JS_SAFE_INT),
    LOG_MAX_JS_SAFE_INT = Math.log(MAX_JS_SAFE_INT);

  function NumericType(valInput, baseSystem) {
    if (typeof valInput === "undefined")
      return NumericTypeCache[0];
    if (typeof baseSystem !== "undefined")
      return +baseSystem === 10 ? parseInput(valInput) : parseWithBase(valInput, baseSystem);
    return parseInput(valInput);
  }

  function LargeNumber(numericDigits, isNegativeFlag) {
    this.numericDigits = numericDigits;
    this.isNegativeFlag = isNegativeFlag;
    this.isTiny = false;
  }
  LargeNumber.prototype = Object.create(NumericType.prototype);

  function TinyNumber(numericDigits) {
    this.numericDigits = numericDigits;
    this.isNegativeFlag = numericDigits < 0;
    this.isTiny = true;
  }
  TinyNumber.prototype = Object.create(NumericType.prototype);

  function isWithinSafeRange(numVal) {
    return -MAX_JS_SAFE_INT < numVal && numVal < MAX_JS_SAFE_INT;
  }

  function intToDigitArray(numVal) {
    if (numVal < 1e7)
      return [numVal];
    if (numVal < 1e14)
      return [numVal % 1e7, Math.floor(numVal / 1e7)];
    return [numVal % 1e7, Math.floor(numVal / 1e7) % 1e7, Math.floor(numVal / 1e14)];
  }

  function digitArrayToInt(digitArr) {
    removeLeadingZeros(digitArr);
    const digitArrLen = digitArr.length;
    if (digitArrLen < 4 && compareAbsolute(digitArr, MAX_JS_SAFE_INT_DIGITS) < 0) {
      switch (digitArrLen) {
        case 0:
          return 0;
        case 1:
          return digitArr[0];
        case 2:
          return digitArr[0] + digitArr[1] * NUM_BASE;
        default:
          return digitArr[0] + (digitArr[1] + digitArr[2] * NUM_BASE) * NUM_BASE;
      }
    }
    return digitArr;
  }

  function removeLeadingZeros(digitArr) {
    let idx = digitArr.length;
    while (digitArr[--idx] === 0);
    digitArr.length = idx + 1;
  }

  function makeZeroArray(length) {
    const zeroArr = new Array(length);
    let idx = -1;
    while (++idx < length) {
      zeroArr[idx] = 0;
    }
    return zeroArr;
  }

  function floorOrCeil(numVal) {
    if (numVal > 0)
      return Math.floor(numVal);
    return Math.ceil(numVal);
  }

  function sumDigitArrays(firstOperand, secondOperand) {
    const lenA = firstOperand.length,
      lenB = secondOperand.length;
    const resultArray = new Array(lenA);
    let carryOver = 0,
      currentBase = NUM_BASE,
      currentSum, idx;

    for (idx = 0; idx < lenB; idx++) {
      currentSum = firstOperand[idx] + secondOperand[idx] + carryOver;
      carryOver = currentSum >= currentBase ? 1 : 0;
      resultArray[idx] = currentSum - carryOver * currentBase;
    }
    while (idx < lenA) {
      currentSum = firstOperand[idx] + carryOver;
      carryOver = currentSum === currentBase ? 1 : 0;
      resultArray[idx++] = currentSum - carryOver * currentBase;
    }
    if (carryOver > 0)
      resultArray.push(carryOver);
    return resultArray;
  }

  function sumAnyDigitArrays(firstOperand, secondOperand) {
    if (firstOperand.length >= secondOperand.length)
      return sumDigitArrays(firstOperand, secondOperand);
    return sumDigitArrays(secondOperand, firstOperand);
  }

  function sumDigitArrayAndSmallInt(digitArray, carryOver) {
    const len = digitArray.length;
    const resultArray = new Array(len);
    let currentBase = NUM_BASE,
      currentSum, idx;

    for (idx = 0; idx < len; idx++) {
      currentSum = digitArray[idx] - currentBase + carryOver;
      carryOver = Math.floor(currentSum / currentBase);
      resultArray[idx] = currentSum - carryOver * currentBase;
      carryOver += 1;
    }
    while (carryOver > 0) {
      resultArray[idx++] = carryOver % currentBase;
      carryOver = Math.floor(carryOver / currentBase);
    }
    return resultArray;
  }

  LargeNumber.prototype.add = function(valInput) {
    const parsedNum = parseInput(valInput);
    if (this.isNegativeFlag !== parsedNum.isNegativeFlag) {
      return this.subtract(parsedNum.invertSign());
    }
    const firstDigits = this.numericDigits,
      secondDigits = parsedNum.numericDigits;
    if (parsedNum.isTiny) {
      return new LargeNumber(sumDigitArrayAndSmallInt(firstDigits, Math.abs(secondDigits)), this.isNegativeFlag);
    }
    return new LargeNumber(sumAnyDigitArrays(firstDigits, secondDigits), this.isNegativeFlag);
  };
  LargeNumber.prototype.plus = LargeNumber.prototype.add;

  TinyNumber.prototype.add = function(valInput) {
    const parsedNum = parseInput(valInput);
    const tinyVal = this.numericDigits;
    if (tinyVal < 0 !== parsedNum.isNegativeFlag) {
      return this.subtract(parsedNum.invertSign());
    }
    let otherVal = parsedNum.numericDigits;
    if (parsedNum.isTiny) {
      if (isWithinSafeRange(tinyVal + otherVal))
        return new TinyNumber(tinyVal + otherVal);
      otherVal = intToDigitArray(Math.abs(otherVal));
    }
    return new LargeNumber(sumDigitArrayAndSmallInt(otherVal, Math.abs(tinyVal)), tinyVal < 0);
  };
  TinyNumber.prototype.plus = TinyNumber.prototype.add;

  function diffDigitArrays(firstOperand, secondOperand) {
    const lenA = firstOperand.length,
      lenB = secondOperand.length;
    const resultArray = new Array(lenA);
    let borrowFlag = 0,
      currentBase = NUM_BASE,
      currentDiff, idx;

    for (idx = 0; idx < lenB; idx++) {
      currentDiff = firstOperand[idx] - borrowFlag - secondOperand[idx];
      if (currentDiff < 0) {
        currentDiff += currentBase;
        borrowFlag = 1;
      } else
        borrowFlag = 0;
      resultArray[idx] = currentDiff;
    }
    for (idx = lenB; idx < lenA; idx++) {
      currentDiff = firstOperand[idx] - borrowFlag;
      if (currentDiff < 0)
        currentDiff += currentBase;
      else {
        resultArray[idx++] = currentDiff;
        break;
      }
      resultArray[idx] = currentDiff;
    }
    for (; idx < lenA; idx++) {
      resultArray[idx] = firstOperand[idx];
    }
    removeLeadingZeros(resultArray);
    return resultArray;
  }

  function diffAnyDigitArrays(firstOperand, secondOperand, isNegativeFlag) {
    let numericDigits;
    if (compareAbsolute(firstOperand, secondOperand) >= 0) {
      numericDigits = diffDigitArrays(firstOperand, secondOperand);
    } else {
      numericDigits = diffDigitArrays(secondOperand, firstOperand);
      isNegativeFlag = !isNegativeFlag;
    }
    numericDigits = digitArrayToInt(numericDigits);
    if (typeof numericDigits === "number") {
      if (isNegativeFlag)
        numericDigits = -numericDigits;
      return new TinyNumber(numericDigits);
    }
    return new LargeNumber(numericDigits, isNegativeFlag);
  }

  function diffDigitArrayAndSmallInt(digitArray, smallIntVal, isNegativeFlag) {
    const len = digitArray.length;
    const resultArray = new Array(len);
    let carryOver = -smallIntVal,
      currentBase = NUM_BASE,
      currentDiff, idx;

    for (idx = 0; idx < len; idx++) {
      currentDiff = digitArray[idx] + carryOver;
      carryOver = Math.floor(currentDiff / currentBase);
      currentDiff %= currentBase;
      resultArray[idx] = currentDiff < 0 ? currentDiff + currentBase : currentDiff;
    }
    const finalResult = digitArrayToInt(resultArray);
    if (typeof finalResult === "number") {
      if (isNegativeFlag)
        finalResult = -finalResult;
      return new TinyNumber(finalResult);
    }
    return new LargeNumber(finalResult, isNegativeFlag);
  }

  LargeNumber.prototype.subtract = function(valInput) {
    const parsedNum = parseInput(valInput);
    if (this.isNegativeFlag !== parsedNum.isNegativeFlag) {
      return this.add(parsedNum.invertSign());
    }
    const firstDigits = this.numericDigits,
      secondDigits = parsedNum.numericDigits;
    if (parsedNum.isTiny)
      return diffDigitArrayAndSmallInt(firstDigits, Math.abs(secondDigits), this.isNegativeFlag);
    return diffAnyDigitArrays(firstDigits, secondDigits, this.isNegativeFlag);
  };
  LargeNumber.prototype.minus = LargeNumber.prototype.subtract;

  TinyNumber.prototype.subtract = function(valInput) {
    const parsedNum = parseInput(valInput);
    const tinyVal = this.numericDigits;
    if (tinyVal < 0 !== parsedNum.isNegativeFlag) {
      return this.add(parsedNum.invertSign());
    }
    const otherVal = parsedNum.numericDigits;
    if (parsedNum.isTiny) {
      return new TinyNumber(tinyVal - otherVal);
    }
    return diffDigitArrayAndSmallInt(otherVal, Math.abs(tinyVal), tinyVal >= 0);
  };
  TinyNumber.prototype.minus = TinyNumber.prototype.subtract;

  LargeNumber.prototype.invertSign = function() {
    return new LargeNumber(this.numericDigits, !this.isNegativeFlag);
  };
  TinyNumber.prototype.invertSign = function() {
    const sign = this.isNegativeFlag;
    const tiny = new TinyNumber(-this.numericDigits);
    tiny.isNegativeFlag = !sign;
    return tiny;
  };

  LargeNumber.prototype.absoluteValue = function() {
    return new LargeNumber(this.numericDigits, false);
  };
  TinyNumber.prototype.absoluteValue = function() {
    return new TinyNumber(Math.abs(this.numericDigits));
  };

  function multiplyFull(firstOperandDigits, secondOperandDigits) {
    const lenA = firstOperandDigits.length,
      lenB = secondOperandDigits.length,
      totalLen = lenA + lenB;
    const resultArray = makeZeroArray(totalLen);
    const currentBase = NUM_BASE;
    let currentProduct, carryOver, idx, factorA_idx, factorB_jdx;

    for (idx = 0; idx < lenA; ++idx) {
      factorA_idx = firstOperandDigits[idx];
      for (let jdx = 0; jdx < lenB; ++jdx) {
        factorB_jdx = secondOperandDigits[jdx];
        currentProduct = factorA_idx * factorB_jdx + resultArray[idx + jdx];
        carryOver = Math.floor(currentProduct / currentBase);
        resultArray[idx + jdx] = currentProduct - carryOver * currentBase;
        resultArray[idx + jdx + 1] += carryOver;
      }
    }
    removeLeadingZeros(resultArray);
    return resultArray;
  }

  function multiplyBySmallInt(digitArray, smallIntFactor) {
    const len = digitArray.length;
    const resultArray = new Array(len);
    const currentBase = NUM_BASE;
    let carryOver = 0,
      currentProduct, idx;

    for (idx = 0; idx < len; idx++) {
      currentProduct = digitArray[idx] * smallIntFactor + carryOver;
      carryOver = Math.floor(currentProduct / currentBase);
      resultArray[idx] = currentProduct - carryOver * currentBase;
    }
    while (carryOver > 0) {
      resultArray[idx++] = carryOver % currentBase;
      carryOver = Math.floor(carryOver / currentBase);
    }
    return resultArray;
  }

  function padRightWithZeros(digitArr, numZeros) {
    const resultArray = [];
    while (numZeros-- > 0)
      resultArray.push(0);
    return resultArray.concat(digitArr);
  }

  function karatsubaMultiply(operandXDigits, operandYDigits) {
    let lenHalved = Math.max(operandXDigits.length, operandYDigits.length);
    if (lenHalved <= 30)
      return multiplyFull(operandXDigits, operandYDigits);

    lenHalved = Math.ceil(lenHalved / 2);

    const highX = operandXDigits.slice(lenHalved),
      lowX = operandXDigits.slice(0, lenHalved),
      highY = operandYDigits.slice(lenHalved),
      lowY = operandYDigits.slice(0, lenHalved);

    const prodAC = karatsubaMultiply(lowX, lowY),
      prodBD = karatsubaMultiply(highX, highY),
      prodABCD = karatsubaMultiply(sumAnyDigitArrays(lowX, highX), sumAnyDigitArrays(lowY, highY));

    const finalProduct = sumAnyDigitArrays(sumAnyDigitArrays(prodAC, padRightWithZeros(diffDigitArrays(diffDigitArrays(prodABCD, prodAC), prodBD), lenHalved)), padRightWithZeros(prodBD, 2 * lenHalved));
    removeLeadingZeros(finalProduct);
    return finalProduct;
  }

  function shouldUseKaratsuba(len1, len2) {
    return -.012 * len1 - .012 * len2 + 15e-6 * len1 * len2 > 0;
  }

  LargeNumber.prototype.multiply = function(valInput) {
    const parsedNum = parseInput(valInput),
      firstDigits = this.numericDigits,
      secondDigits = parsedNum.numericDigits,
      isNegativeFlag = this.isNegativeFlag !== parsedNum.isNegativeFlag;

    if (parsedNum.isTiny) {
      if (secondDigits === 0)
        return NumericTypeCache[0];
      if (secondDigits === 1)
        return this;
      if (secondDigits === -1)
        return this.invertSign();
      const absVal = Math.abs(secondDigits);
      if (absVal < NUM_BASE) {
        return new LargeNumber(multiplyBySmallInt(firstDigits, absVal), isNegativeFlag);
      }
      secondDigits = intToDigitArray(absVal);
    }
    if (shouldUseKaratsuba(firstDigits.length, secondDigits.length))
      return new LargeNumber(karatsubaMultiply(firstDigits, secondDigits), isNegativeFlag);
    return new LargeNumber(multiplyFull(firstDigits, secondDigits), isNegativeFlag);
  };
  LargeNumber.prototype.mul = LargeNumber.prototype.multiply;

  function multiplySmallIntAndDigitArray(smallIntFactor, digitArray, isNegativeFlag) {
    if (smallIntFactor < NUM_BASE) {
      return new LargeNumber(multiplyBySmallInt(digitArray, smallIntFactor), isNegativeFlag);
    }
    return new LargeNumber(multiplyFull(digitArray, intToDigitArray(smallIntFactor)), isNegativeFlag);
  }

  LargeNumber.prototype._multiplyByTiny = function(tinyNum) {
    if (tinyNum.numericDigits === 0)
      return NumericTypeCache[0];
    if (tinyNum.numericDigits === 1)
      return this;
    if (tinyNum.numericDigits === -1)
      return this.invertSign();
    return multiplySmallIntAndDigitArray(Math.abs(tinyNum.numericDigits), this.numericDigits, this.isNegativeFlag !== tinyNum.isNegativeFlag);
  };

  TinyNumber.prototype._multiplyByTiny = function(tinyNum) {
    if (isWithinSafeRange(tinyNum.numericDigits * this.numericDigits)) {
      return new TinyNumber(tinyNum.numericDigits * this.numericDigits);
    }
    return multiplySmallIntAndDigitArray(Math.abs(tinyNum.numericDigits), intToDigitArray(Math.abs(this.numericDigits)), this.isNegativeFlag !== tinyNum.isNegativeFlag);
  };

  TinyNumber.prototype.multiply = function(valInput) {
    return parseInput(valInput)._multiplyByTiny(this);
  };
  TinyNumber.prototype.mul = TinyNumber.prototype.multiply;

  function calcSquare(digitArray) {
    const len = digitArray.length,
      resultArray = makeZeroArray(len + len);
    const currentBase = NUM_BASE;
    let currentProduct, carryOver, idx, factorA_idx, factorA_jdx;

    for (idx = 0; idx < len; idx++) {
      factorA_idx = digitArray[idx];
      carryOver = 0 - factorA_idx * factorA_idx;
      for (let jdx = idx; jdx < len; jdx++) {
        factorA_jdx = digitArray[jdx];
        currentProduct = 2 * (factorA_idx * factorA_jdx) + resultArray[idx + jdx] + carryOver;
        carryOver = Math.floor(currentProduct / currentBase);
        resultArray[idx + jdx] = currentProduct - carryOver * currentBase;
      }
      resultArray[idx + len] = carryOver;
    }
    removeLeadingZeros(resultArray);
    return resultArray;
  }

  LargeNumber.prototype.square = function() {
    return new LargeNumber(calcSquare(this.numericDigits), false);
  };
  TinyNumber.prototype.square = function() {
    const squaredVal = this.numericDigits * this.numericDigits;
    if (isWithinSafeRange(squaredVal))
      return new TinyNumber(squaredVal);
    return new LargeNumber(calcSquare(intToDigitArray(Math.abs(this.numericDigits))), false);
  };

  function divideAndModuloNewton(dividendDigits, divisorDigits) {
    const lenA = dividendDigits.length,
      lenB = divisorDigits.length,
      currentBase = NUM_BASE;
    const quotientResult = makeZeroArray(divisorDigits.length);
    let msdDivisor = divisorDigits[lenB - 1],
      normFactor = Math.ceil(currentBase / (2 * msdDivisor)),
      remainderDigits = multiplyBySmallInt(dividendDigits, normFactor),
      scaledDivisor = multiplyBySmallInt(divisorDigits, normFactor),
      qDigitEstimate, shiftAmount, carryOver, borrowFlag, idx, totalLen, quotientPart;

    if (remainderDigits.length <= lenA)
      remainderDigits.push(0);
    scaledDivisor.push(0);
    msdDivisor = scaledDivisor[lenB - 1];

    for (shiftAmount = lenA - lenB; shiftAmount >= 0; shiftAmount--) {
      qDigitEstimate = currentBase - 1;
      if (remainderDigits[shiftAmount + lenB] !== msdDivisor) {
        qDigitEstimate = Math.floor((remainderDigits[shiftAmount + lenB] * currentBase + remainderDigits[shiftAmount + lenB - 1]) / msdDivisor);
      }
      carryOver = 0;
      borrowFlag = 0;
      totalLen = scaledDivisor.length;
      for (idx = 0; idx < totalLen; idx++) {
        carryOver += qDigitEstimate * scaledDivisor[idx];
        quotientPart = Math.floor(carryOver / currentBase);
        borrowFlag += remainderDigits[shiftAmount + idx] - (carryOver - quotientPart * currentBase);
        carryOver = quotientPart;
        if (borrowFlag < 0) {
          remainderDigits[shiftAmount + idx] = borrowFlag + currentBase;
          borrowFlag = -1;
        } else {
          remainderDigits[shiftAmount + idx] = borrowFlag;
          borrowFlag = 0;
        }
      }
      while (borrowFlag !== 0) {
        qDigitEstimate -= 1;
        carryOver = 0;
        for (idx = 0; idx < totalLen; idx++) {
          carryOver += remainderDigits[shiftAmount + idx] - currentBase + scaledDivisor[idx];
          if (carryOver < 0) {
            remainderDigits[shiftAmount + idx] = carryOver + currentBase;
            carryOver = 0;
          } else {
            remainderDigits[shiftAmount + idx] = carryOver;
            carryOver = 1;
          }
        }
        borrowFlag += carryOver;
      }
      quotientResult[shiftAmount] = qDigitEstimate;
    }
    remainderDigits = divideDigitArrayBySmallInt(remainderDigits, normFactor)[0];
    return [digitArrayToInt(quotientResult), digitArrayToInt(remainderDigits)];
  }

  function divideAndModuloLong(dividendDigits, divisorDigits) {
    const lenA = dividendDigits.length,
      lenB = divisorDigits.length;
    const quotientResult = [],
      currentDividendPart = [],
      currentBase = NUM_BASE;
    let qGuess, dividendPartLen, highDividend, highDivisor, checkProduct;

    while (lenA) {
      currentDividendPart.unshift(dividendDigits[--lenA]);
      removeLeadingZeros(currentDividendPart);
      if (compareAbsolute(currentDividendPart, divisorDigits) < 0) {
        quotientResult.push(0);
        continue;
      }
      dividendPartLen = currentDividendPart.length;
      highDividend = currentDividendPart[dividendPartLen - 1] * currentBase + currentDividendPart[dividendPartLen - 2];
      highDivisor = divisorDigits[lenB - 1] * currentBase + divisorDigits[lenB - 2];

      if (dividendPartLen > lenB) {
        highDividend = (highDividend + 1) * currentBase;
      }
      qGuess = Math.ceil(highDividend / highDivisor);
      do {
        checkProduct = multiplyBySmallInt(divisorDigits, qGuess);
        if (compareAbsolute(checkProduct, currentDividendPart) <= 0)
          break;
        qGuess--;
      } while (qGuess);
      quotientResult.push(qGuess);
      currentDividendPart = diffDigitArrays(currentDividendPart, checkProduct);
    }
    quotientResult.reverse();
    return [digitArrayToInt(quotientResult), digitArrayToInt(currentDividendPart)];
  }

  function divideDigitArrayBySmallInt(digitArray, lambdaFactor) {
    const len = digitArray.length;
    const quotientDigits = makeZeroArray(len);
    const currentBase = NUM_BASE;
    let idx, q, remainderVal, divisorVal;

    remainderVal = 0;
    for (idx = len - 1; idx >= 0; --idx) {
      divisorVal = remainderVal * currentBase + digitArray[idx];
      q = floorOrCeil(divisorVal / lambdaFactor);
      remainderVal = divisorVal - q * lambdaFactor;
      quotientDigits[idx] = q | 0;
    }
    return [quotientDigits, remainderVal | 0];
  }

  function divideAndModuloGeneral(instanceRef, valInput) {
    let numericDigits, parsedNum = parseInput(valInput);
    const firstDigits = instanceRef.numericDigits,
      secondDigits = parsedNum.numericDigits;
    let quotientVal;

    if (secondDigits === 0)
      throw new Error("Cannot divide by zero");

    if (instanceRef.isTiny) {
      if (parsedNum.isTiny) {
        return [new TinyNumber(floorOrCeil(firstDigits / secondDigits)), new TinyNumber(firstDigits % secondDigits)];
      }
      return [NumericTypeCache[0], instanceRef];
    }

    if (parsedNum.isTiny) {
      if (secondDigits === 1)
        return [instanceRef, NumericTypeCache[0]];
      if (secondDigits === -1)
        return [instanceRef.invertSign(), NumericTypeCache[0]];
      const absVal = Math.abs(secondDigits);
      if (absVal < NUM_BASE) {
        numericDigits = divideDigitArrayBySmallInt(firstDigits, absVal);
        quotientVal = digitArrayToInt(numericDigits[0]);
        let remainderVal = numericDigits[1];
        if (instanceRef.isNegativeFlag)
          remainderVal = -remainderVal;
        if (typeof quotientVal === "number") {
          if (instanceRef.isNegativeFlag !== parsedNum.isNegativeFlag)
            quotientVal = -quotientVal;
          return [new TinyNumber(quotientVal), new TinyNumber(remainderVal)];
        }
        return [new LargeNumber(quotientVal, instanceRef.isNegativeFlag !== parsedNum.isNegativeFlag), new TinyNumber(remainderVal)];
      }
      secondDigits = intToDigitArray(absVal);
    }

    const comparison = compareAbsolute(firstDigits, secondDigits);
    if (comparison === -1)
      return [NumericTypeCache[0], instanceRef];
    if (comparison === 0)
      return [NumericTypeCache[instanceRef.isNegativeFlag === parsedNum.isNegativeFlag ? 1 : -1], NumericTypeCache[0]];

    if (firstDigits.length + secondDigits.length <= 200)
      numericDigits = divideAndModuloNewton(firstDigits, secondDigits);
    else
      numericDigits = divideAndModuloLong(firstDigits, secondDigits);

    quotientVal = numericDigits[0];
    const quotientNegative = instanceRef.isNegativeFlag !== parsedNum.isNegativeFlag,
      moduloValue = numericDigits[1],
      moduloNegative = instanceRef.isNegativeFlag;

    if (typeof quotientVal === "number") {
      if (quotientNegative)
        quotientVal = -quotientVal;
      quotientVal = new TinyNumber(quotientVal);
    } else
      quotientVal = new LargeNumber(quotientVal, quotientNegative);

    if (typeof moduloValue === "number") {
      if (moduloNegative)
        moduloValue = -moduloValue;
      moduloValue = new TinyNumber(moduloValue);
    } else
      moduloValue = new LargeNumber(moduloValue, moduloNegative);

    return [quotientVal, moduloValue];
  }

  LargeNumber.prototype.quotientRemainder = function(valInput) {
    const result = divideAndModuloGeneral(this, valInput);
    return {
      quotient: result[0],
      remainder: result[1]
    };
  };
  TinyNumber.prototype.quotientRemainder = LargeNumber.prototype.quotientRemainder;

  LargeNumber.prototype.div = function(valInput) {
    return divideAndModuloGeneral(this, valInput)[0];
  };
  TinyNumber.prototype.over = TinyNumber.prototype.div = LargeNumber.prototype.over = LargeNumber.prototype.div;

  LargeNumber.prototype.rem = function(valInput) {
    return divideAndModuloGeneral(this, valInput)[1];
  };
  TinyNumber.prototype.remainder = TinyNumber.prototype.rem = LargeNumber.prototype.remainder = LargeNumber.prototype.rem;

  LargeNumber.prototype.power = function(valInput) {
    let parsedNum = parseInput(valInput),
      firstDigits = this.numericDigits,
      secondDigits = parsedNum.numericDigits,
      resultVal, baseVal, exponentVal;

    if (secondDigits === 0)
      return NumericTypeCache[1];
    if (firstDigits === 0)
      return NumericTypeCache[0];
    if (firstDigits === 1)
      return NumericTypeCache[1];
    if (firstDigits === -1)
      return parsedNum.isParityEven() ? NumericTypeCache[1] : NumericTypeCache[-1];
    if (parsedNum.isNegativeFlag) {
      return NumericTypeCache[0];
    }
    if (!parsedNum.isTiny)
      throw new Error("The exponent " + parsedNum.toText() + " is too large.");

    if (this.isTiny) {
      if (isWithinSafeRange(resultVal = Math.pow(firstDigits, secondDigits)))
        return new TinyNumber(floorOrCeil(resultVal));
    }
    baseVal = this;
    exponentVal = NumericTypeCache[1];
    while (true) {
      if (secondDigits & 1 === 1) {
        exponentVal = exponentVal.mul(baseVal);
        --secondDigits;
      }
      if (secondDigits === 0)
        break;
      secondDigits /= 2;
      baseVal = baseVal.square();
    }
    return exponentVal;
  };
  TinyNumber.prototype.power = LargeNumber.prototype.power;

  LargeNumber.prototype.modularPower = function(exponentVal, moduloVal) {
    exponentVal = parseInput(exponentVal);
    moduloVal = parseInput(moduloVal);

    if (moduloVal.isExactlyZero())
      throw new Error("Cannot take modularPower with modulus 0");

    let accumulator = NumericTypeCache[1],
      currentBase = this.rem(moduloVal);

    while (exponentVal.isPositiveNumber()) {
      if (currentBase.isExactlyZero())
        return NumericTypeCache[0];
      if (exponentVal.isParityOdd())
        accumulator = accumulator.multiply(currentBase).rem(moduloVal);
      exponentVal = exponentVal.div(2);
      currentBase = currentBase.square().rem(moduloVal);
    }
    return accumulator;
  };
  TinyNumber.prototype.modularPower = LargeNumber.prototype.modularPower;

  function compareAbsolute(firstDigits, secondDigits) {
    if (firstDigits.length !== secondDigits.length) {
      return firstDigits.length > secondDigits.length ? 1 : -1;
    }
    for (let idx = firstDigits.length - 1; idx >= 0; idx--) {
      if (firstDigits[idx] !== secondDigits[idx])
        return firstDigits[idx] > secondDigits[idx] ? 1 : -1;
    }
    return 0;
  }

  LargeNumber.prototype.compareAbsolute = function(valInput) {
    const parsedNum = parseInput(valInput),
      firstDigits = this.numericDigits,
      secondDigits = parsedNum.numericDigits;
    if (parsedNum.isTiny)
      return 1;
    return compareAbsolute(firstDigits, secondDigits);
  };
  TinyNumber.prototype.compareAbsolute = function(valInput) {
    const parsedNum = parseInput(valInput),
      firstAbsVal = Math.abs(this.numericDigits),
      secondDigits = parsedNum.numericDigits;
    if (parsedNum.isTiny) {
      const secondAbsVal = Math.abs(secondDigits);
      return firstAbsVal === secondAbsVal ? 0 : firstAbsVal > secondAbsVal ? 1 : -1;
    }
    return -1;
  };

  LargeNumber.prototype.compareTo = function(valInput) {
    if (valInput === Infinity) {
      return -1;
    }
    if (valInput === -Infinity) {
      return 1;
    }
    const parsedNum = parseInput(valInput),
      firstDigits = this.numericDigits,
      secondDigits = parsedNum.numericDigits;
    if (this.isNegativeFlag !== parsedNum.isNegativeFlag) {
      return parsedNum.isNegativeFlag ? 1 : -1;
    }
    if (parsedNum.isTiny) {
      return this.isNegativeFlag ? -1 : 1;
    }
    return compareAbsolute(firstDigits, secondDigits) * (this.isNegativeFlag ? -1 : 1);
  };
  LargeNumber.prototype.cmp = LargeNumber.prototype.compareTo;

  TinyNumber.prototype.compareTo = function(valInput) {
    if (valInput === Infinity) {
      return -1;
    }
    if (valInput === -Infinity) {
      return 1;
    }
    const parsedNum = parseInput(valInput),
      tinyVal = this.numericDigits,
      otherVal = parsedNum.numericDigits;
    if (parsedNum.isTiny) {
      return tinyVal == otherVal ? 0 : tinyVal > otherVal ? 1 : -1;
    }
    if (tinyVal < 0 !== parsedNum.isNegativeFlag) {
      return tinyVal < 0 ? -1 : 1;
    }
    return tinyVal < 0 ? 1 : -1;
  };
  TinyNumber.prototype.cmp = TinyNumber.prototype.compareTo;

  LargeNumber.prototype.isEqual = function(valInput) {
    return this.compareTo(valInput) === 0;
  };
  TinyNumber.prototype.eq = TinyNumber.prototype.isEqual = LargeNumber.prototype.eq = LargeNumber.prototype.isEqual;

  LargeNumber.prototype.isNotEqual = function(valInput) {
    return this.compareTo(valInput) !== 0;
  };
  TinyNumber.prototype.neq = TinyNumber.prototype.isNotEqual = LargeNumber.prototype.neq = LargeNumber.prototype.isNotEqual;

  LargeNumber.prototype.isGreaterThan = function(valInput) {
    return this.compareTo(valInput) > 0;
  };
  TinyNumber.prototype.gt = TinyNumber.prototype.isGreaterThan = LargeNumber.prototype.gt = LargeNumber.prototype.isGreaterThan;

  LargeNumber.prototype.isLessThan = function(valInput) {
    return this.compareTo(valInput) < 0;
  };
  TinyNumber.prototype.lt = TinyNumber.prototype.isLessThan = LargeNumber.prototype.lt = LargeNumber.prototype.isLessThan;

  LargeNumber.prototype.isGreaterThanOrEqual = function(valInput) {
    return this.compareTo(valInput) >= 0;
  };
  TinyNumber.prototype.geq = TinyNumber.prototype.isGreaterThanOrEqual = LargeNumber.prototype.geq = LargeNumber.prototype.isGreaterThanOrEqual;

  LargeNumber.prototype.isLessThanOrEqual = function(valInput) {
    return this.compareTo(valInput) <= 0;
  };
  TinyNumber.prototype.leq = TinyNumber.prototype.isLessThanOrEqual = LargeNumber.prototype.leq = LargeNumber.prototype.isLessThanOrEqual;

  LargeNumber.prototype.isParityEven = function() {
    return (this.numericDigits[0] & 1) === 0;
  };
  TinyNumber.prototype.isParityEven = function() {
    return (this.numericDigits & 1) === 0;
  };

  LargeNumber.prototype.isParityOdd = function() {
    return (this.numericDigits[0] & 1) === 1;
  };
  TinyNumber.prototype.isParityOdd = function() {
    return (this.numericDigits & 1) === 1;
  };

  LargeNumber.prototype.isPositiveNumber = function() {
    return !this.isNegativeFlag;
  };
  TinyNumber.prototype.isPositiveNumber = function() {
    return this.numericDigits > 0;
  };

  LargeNumber.prototype.isNegativeNumber = function() {
    return this.isNegativeFlag;
  };
  TinyNumber.prototype.isNegativeNumber = function() {
    return this.numericDigits < 0;
  };

  LargeNumber.prototype.isOneOrMinusOne = function() {
    return false;
  };
  TinyNumber.prototype.isOneOrMinusOne = function() {
    return Math.abs(this.numericDigits) === 1;
  };

  LargeNumber.prototype.isExactlyZero = function() {
    return false;
  };
  TinyNumber.prototype.isExactlyZero = function() {
    return this.numericDigits === 0;
  };

  LargeNumber.prototype.canBeDividedBy = function(valInput) {
    const parsedNum = parseInput(valInput);
    const numVal = parsedNum.numericDigits;
    if (numVal === 0)
      return false;
    if (numVal === 1)
      return true;
    if (numVal === 2)
      return this.isParityEven();
    return this.rem(parsedNum).isEqual(NumericTypeCache[0]);
  };
  TinyNumber.prototype.canBeDividedBy = LargeNumber.prototype.canBeDividedBy;

  function isSimplePrime(numVal) {
    const absVal = numVal.absoluteValue();
    if (absVal.isOneOrMinusOne())
      return false;
    if (absVal.isEqual(2) || absVal.isEqual(3) || absVal.isEqual(5))
      return true;
    if (absVal.isParityEven() || absVal.canBeDividedBy(3) || absVal.canBeDividedBy(5))
      return false;
    if (absVal.isLessThan(25))
      return true;
  }

  LargeNumber.prototype.checkPrimality = function() {
    const primeCheck = isSimplePrime(this);
    if (primeCheck !== void0)
      return primeCheck;

    const absVal = this.absoluteValue(),
      absValMinusOne = absVal.decrement();
    const testPrimes = [2, 3, 5, 7, 11, 13, 17, 19];
    let reducedAbsValMinusOne = absValMinusOne,
      currentDivisor, loopFlag, idx, modPowResult;

    while (reducedAbsValMinusOne.isParityEven())
      reducedAbsValMinusOne = reducedAbsValMinusOne.div(2);

    for (idx = 0; idx < testPrimes.length; idx++) {
      modPowResult = largeNum(testPrimes[idx]).modularPower(reducedAbsValMinusOne, absVal);
      if (modPowResult.isEqual(NumericTypeCache[1]) || modPowResult.isEqual(absValMinusOne))
        continue;

      for (loopFlag = true, currentDivisor = reducedAbsValMinusOne; loopFlag && currentDivisor.isLessThan(absValMinusOne); currentDivisor = currentDivisor.multiply(2)) {
        modPowResult = modPowResult.square().rem(absVal);
        if (modPowResult.isEqual(absValMinusOne))
          loopFlag = false;
      }
      if (loopFlag)
        return false;
    }
    return true;
  };
  TinyNumber.prototype.checkPrimality = LargeNumber.prototype.checkPrimality;

  LargeNumber.prototype.checkProbablePrimality = function(numIterations) {
    const primeCheck = isSimplePrime(this);
    if (primeCheck !== void0)
      return primeCheck;

    const absVal = this.absoluteValue();
    const iterationsCount = numIterations === void0 ? 5 : numIterations;

    for (let idx = 0; idx < iterationsCount; idx++) {
      const randomBase = largeNum.randomRange(2, absVal.minus(2));
      if (!randomBase.modularPower(absVal.decrement(), absVal).isOneOrMinusOne())
        return false;
    }
    return true;
  };
  TinyNumber.prototype.checkProbablePrimality = LargeNumber.prototype.checkProbablePrimality;

  LargeNumber.prototype.modularInverse = function(moduloVal) {
    let tempT = largeNum.valZero,
      nextT = largeNum.valOne,
      remVal = parseInput(moduloVal),
      nextRem = this.absoluteValue(),
      quotientVal, prevT, prevRem;

    while (!nextRem.isExactlyZero()) {
      quotientVal = remVal.div(nextRem);
      prevT = tempT;
      prevRem = remVal;
      tempT = nextT;
      remVal = nextRem;
      nextT = prevT.subtract(quotientVal.multiply(nextT));
      nextRem = prevRem.subtract(quotientVal.multiply(nextRem));
    }
    if (!remVal.isEqual(1))
      throw new Error(this.toText() + " and " + moduloVal.toText() + " are not co-prime");
    if (tempT.compareTo(0) === -1) {
      tempT = tempT.add(moduloVal);
    }
    if (this.isNegativeNumber()) {
      return tempT.invertSign();
    }
    return tempT;
  };
  TinyNumber.prototype.modularInverse = LargeNumber.prototype.modularInverse;

  LargeNumber.prototype.increment = function() {
    const numericDigits = this.numericDigits;
    if (this.isNegativeFlag) {
      return diffDigitArrayAndSmallInt(numericDigits, 1, this.isNegativeFlag);
    }
    return new LargeNumber(sumDigitArrayAndSmallInt(numericDigits, 1), this.isNegativeFlag);
  };
  TinyNumber.prototype.increment = function() {
    const numericDigits = this.numericDigits;
    if (numericDigits + 1 < MAX_JS_SAFE_INT)
      return new TinyNumber(numericDigits + 1);
    return new LargeNumber(MAX_JS_SAFE_INT_DIGITS, false);
  };

  LargeNumber.prototype.decrement = function() {
    const numericDigits = this.numericDigits;
    if (this.isNegativeFlag) {
      return new LargeNumber(sumDigitArrayAndSmallInt(numericDigits, 1), true);
    }
    return diffDigitArrayAndSmallInt(numericDigits, 1, this.isNegativeFlag);
  };
  TinyNumber.prototype.decrement = function() {
    const numericDigits = this.numericDigits;
    if (numericDigits - 1 > -MAX_JS_SAFE_INT)
      return new TinyNumber(numericDigits - 1);
    return new LargeNumber(MAX_JS_SAFE_INT_DIGITS, true);
  };

  const powerOfTwoDigits = [1];
  while (2 * powerOfTwoDigits[powerOfTwoDigits.length - 1] <= NUM_BASE)
    powerOfTwoDigits.push(2 * powerOfTwoDigits[powerOfTwoDigits.length - 1]);
  const powerOfTwoDigitsLen = powerOfTwoDigits.length,
    maxPowerOfTwoDigit = powerOfTwoDigits[powerOfTwoDigitsLen - 1];

  function canShiftBySmallAmount(numVal) {
    return (typeof numVal === "number" || typeof numVal === "string") && +Math.abs(numVal) <= NUM_BASE || numVal instanceof LargeNumber && numVal.numericDigits.length <= 1;
  }

  LargeNumber.prototype.bitShiftLeft = function(shiftAmount) {
    if (!canShiftBySmallAmount(shiftAmount)) {
      throw new Error(String(shiftAmount) + " is too large for shifting.");
    }
    shiftAmount = +shiftAmount;
    if (shiftAmount < 0)
      return this.bitShiftRight(-shiftAmount);
    let result = this;
    if (result.isExactlyZero())
      return result;
    while (shiftAmount >= powerOfTwoDigitsLen) {
      result = result.multiply(maxPowerOfTwoDigit);
      shiftAmount -= powerOfTwoDigitsLen - 1;
    }
    return result.multiply(powerOfTwoDigits[shiftAmount]);
  };
  TinyNumber.prototype.bitShiftLeft = LargeNumber.prototype.bitShiftLeft;

  LargeNumber.prototype.bitShiftRight = function(shiftAmount) {
    let remAndQuo;
    if (!canShiftBySmallAmount(shiftAmount)) {
      throw new Error(String(shiftAmount) + " is too large for shifting.");
    }
    shiftAmount = +shiftAmount;
    if (shiftAmount < 0)
      return this.bitShiftLeft(-shiftAmount);
    let result = this;
    while (shiftAmount >= powerOfTwoDigitsLen) {
      if (result.isExactlyZero() || result.isNegativeNumber() && result.isOneOrMinusOne())
        return result;
      remAndQuo = divideAndModuloGeneral(result, maxPowerOfTwoDigit);
      result = remAndQuo[1].isNegativeNumber() ? remAndQuo[0].decrement() : remAndQuo[0];
      shiftAmount -= powerOfTwoDigitsLen - 1;
    }
    remAndQuo = divideAndModuloGeneral(result, powerOfTwoDigits[shiftAmount]);
    return remAndQuo[1].isNegativeNumber() ? remAndQuo[0].decrement() : remAndQuo[0];
  };
  TinyNumber.prototype.bitShiftRight = LargeNumber.prototype.bitShiftRight;

  function performBitwiseOp(operandX, operandY, operationFn) {
    operandY = parseInput(operandY);
    const xIsNegative = operandX.isNegativeNumber(),
      yIsNegative = operandY.isNegativeNumber();
    let xRemaining = xIsNegative ? operandX.bitwiseNot() : operandX,
      yRemaining = yIsNegative ? operandY.bitwiseNot() : operandY;
    let xCurrentDigit = 0,
      yCurrentDigit = 0;
    let xDivAndMod = null,
      yDivAndMod = null;
    const resultArray = [];
    while (!xRemaining.isExactlyZero() || !yRemaining.isExactlyZero()) {
      xDivAndMod = divideAndModuloGeneral(xRemaining, maxPowerOfTwoDigit);
      xCurrentDigit = xDivAndMod[1].jsNumberValue();
      if (xIsNegative) {
        xCurrentDigit = maxPowerOfTwoDigit - 1 - xCurrentDigit;
      }
      yDivAndMod = divideAndModuloGeneral(yRemaining, maxPowerOfTwoDigit);
      yCurrentDigit = yDivAndMod[1].jsNumberValue();
      if (yIsNegative) {
        yCurrentDigit = maxPowerOfTwoDigit - 1 - yCurrentDigit;
      }
      xRemaining = xDivAndMod[0];
      yRemaining = yDivAndMod[0];
      resultArray.push(operationFn(xCurrentDigit, yCurrentDigit));
    }
    let bitwiseResultSum = operationFn(xIsNegative ? 1 : 0, yIsNegative ? 1 : 0) !== 0 ? largeNum(-1) : largeNum(0);
    for (let loopIndex = resultArray.length - 1; loopIndex >= 0; loopIndex -= 1) {
      bitwiseResultSum = bitwiseResultSum.multiply(maxPowerOfTwoDigit).add(largeNum(resultArray[loopIndex]));
    }
    return bitwiseResultSum;
  }

  LargeNumber.prototype.bitwiseNot = function() {
    return this.invertSign().decrement();
  };
  TinyNumber.prototype.bitwiseNot = LargeNumber.prototype.bitwiseNot;

  LargeNumber.prototype.bitwiseAnd = function(valInput) {
    return performBitwiseOp(this, valInput, function(val1, val2) {
      return val1 & val2;
    });
  };
  TinyNumber.prototype.bitwiseAnd = LargeNumber.prototype.bitwiseAnd;

  LargeNumber.prototype.bitwiseOr = function(valInput) {
    return performBitwiseOp(this, valInput, function(val1, val2) {
      return val1 | val2;
    });
  };
  TinyNumber.prototype.bitwiseOr = LargeNumber.prototype.bitwiseOr;

  LargeNumber.prototype.bitwiseXor = function(valInput) {
    return performBitwiseOp(this, valInput, function(val1, val2) {
      return val1 ^ val2;
    });
  };
  TinyNumber.prototype.bitwiseXor = LargeNumber.prototype.bitwiseXor;

  const LOW_BIT_MASK_INT = 1 << 30,
    LOW_BIT_MASK_LARGE_INT = (NUM_BASE & -NUM_BASE) * (NUM_BASE & -NUM_BASE) | LOW_BIT_MASK_INT;

  function approxLowestOneBit(numVal) {
    const digits = numVal.numericDigits,
      bitVal = typeof digits === "number" ? digits | LOW_BIT_MASK_INT : digits[0] + digits[1] * NUM_BASE | LOW_BIT_MASK_LARGE_INT;
    return bitVal & -bitVal;
  }

  function logarithmInteger(valueInput, baseInput) {
    if (baseInput.compareTo(valueInput) <= 0) {
      const tempResult = logarithmInteger(valueInput, baseInput.square(baseInput));
      const powerPart = tempResult.p;
      const exponentPart = tempResult.e;
      const intermediateProduct = powerPart.multiply(baseInput);
      return intermediateProduct.compareTo(valueInput) <= 0 ? {
        p: intermediateProduct,
        e: exponentPart * 2 + 1
      } : {
        p: powerPart,
        e: exponentPart * 2
      };
    }
    return {
      p: largeNum(1),
      e: 0
    };
  }

  LargeNumber.prototype.calcBitLength = function() {
    let currentNum = this;
    if (currentNum.compareTo(largeNum(0)) < 0) {
      currentNum = currentNum.invertSign().subtract(largeNum(1));
    }
    if (currentNum.compareTo(largeNum(0)) === 0) {
      return largeNum(0);
    }
    return largeNum(logarithmInteger(currentNum, largeNum(2)).e).add(largeNum(1));
  };
  TinyNumber.prototype.calcBitLength = LargeNumber.prototype.calcBitLength;

  function getMaximum(val1, val2) {
    val1 = parseInput(val1);
    val2 = parseInput(val2);
    return val1.isGreaterThan(val2) ? val1 : val2;
  }

  function getMinimum(val1, val2) {
    val1 = parseInput(val1);
    val2 = parseInput(val2);
    return val1.isLessThan(val2) ? val1 : val2;
  }

  function greatestCommonDivisor(num1, num2) {
    num1 = parseInput(num1).absoluteValue();
    num2 = parseInput(num2).absoluteValue();

    if (num1.isEqual(num2))
      return num1;
    if (num1.isExactlyZero())
      return num2;
    if (num2.isExactlyZero())
      return num1;

    let commonFactor = NumericTypeCache[1],
      powerOfTwoFactor, tempSwap;

    while (num1.isParityEven() && num2.isParityEven()) {
      powerOfTwoFactor = Math.min(approxLowestOneBit(num1), approxLowestOneBit(num2));
      num1 = num1.div(powerOfTwoFactor);
      num2 = num2.div(powerOfTwoFactor);
      commonFactor = commonFactor.multiply(powerOfTwoFactor);
    }
    while (num1.isParityEven()) {
      num1 = num1.div(approxLowestOneBit(num1));
    }
    do {
      while (num2.isParityEven()) {
        num2 = num2.div(approxLowestOneBit(num2));
      }
      if (num1.isGreaterThan(num2)) {
        tempSwap = num2;
        num2 = num1;
        num1 = tempSwap;
      }
      num2 = num2.subtract(num1);
    } while (!num2.isExactlyZero());
    return commonFactor.isOneOrMinusOne() ? num1 : num1.multiply(commonFactor);
  }

  function leastCommonMultiple(num1, num2) {
    num1 = parseInput(num1).absoluteValue();
    num2 = parseInput(num2).absoluteValue();
    return num1.div(greatestCommonDivisor(num1, num2)).multiply(num2);
  }

  function randomBetween(lowerBound, upperBound) {
    lowerBound = parseInput(lowerBound);
    upperBound = parseInput(upperBound);
    const valueRange = upperBound.subtract(lowerBound).add(1);
    if (valueRange.isTiny)
      return lowerBound.add(Math.floor(Math.random() * valueRange));

    const rangeLen = valueRange.numericDigits.length - 1;
    const resultArray = [];
    let isRestricted = true;

    for (let idx = rangeLen; idx >= 0; idx--) {
      const upperLimit = isRestricted ? valueRange.numericDigits[idx] : NUM_BASE;
      const randomDigit = floorOrCeil(Math.random() * upperLimit);
      resultArray.unshift(randomDigit);
      if (randomDigit < upperLimit)
        isRestricted = false;
    }
    const finalResult = digitArrayToInt(resultArray);
    return lowerBound.add(typeof finalResult === "number" ? new TinyNumber(finalResult) : new LargeNumber(finalResult, false));
  }

  const parseWithBase = function(inputStr, baseSystem) {
    const strLen = inputStr.length;
    let idx;
    const absRadix = Math.abs(baseSystem);

    for (idx = 0; idx < strLen; idx++) {
      const charVal = inputStr[idx].toLowerCase();
      if (charVal === "-")
        continue;
      if (/[a-z0-9]/.test(charVal)) {
        if (/[0-9]/.test(charVal) && +charVal >= absRadix) {
          if (charVal === "1" && absRadix === 1)
            continue;
          throw new Error(charVal + " is not a valid digit in base " + baseSystem + ".");
        } else if (charVal.charCodeAt(0) - 87 >= absRadix) {
          throw new Error(charVal + " is not a valid digit in base " + baseSystem + ".");
        }
      }
    }

    if (2 <= baseSystem && baseSystem <= 36) {
      if (strLen <= LOG_MAX_JS_SAFE_INT / Math.log(baseSystem)) {
        const parsedResult = parseInt(inputStr, baseSystem);
        if (isNaN(parsedResult)) {
          throw new Error(charVal + " is not a valid digit in base " + baseSystem + ".");
        }
        return new TinyNumber(parseInt(inputStr, baseSystem));
      }
    }

    baseSystem = parseInput(baseSystem);
    const digits = [];
    const isNegative = inputStr[0] === "-";

    for (idx = isNegative ? 1 : 0; idx < inputStr.length; idx++) {
      const charVal = inputStr[idx].toLowerCase(),
        charAscii = charVal.charCodeAt(0);
      if (48 <= charAscii && charAscii <= 57)
        digits.push(parseInput(charVal));
      else if (97 <= charAscii && charAscii <= 122)
        digits.push(parseInput(charVal.charCodeAt(0) - 87));
      else if (charVal === "<") {
        const startIndex = idx;
        do {
          idx++;
        } while (inputStr[idx] !== ">");
        digits.push(parseInput(inputStr.slice(startIndex + 1, idx)));
      } else
        throw new Error(charVal + " is not a valid character");
    }
    return parseDigitsWithBase(digits, baseSystem, isNegative);
  };

  function parseDigitsWithBase(digits, baseSystem, isNegativeFlag) {
    let accumulatedValue = NumericTypeCache[0],
      currentPower = NumericTypeCache[1],
      idx;
    for (idx = digits.length - 1; idx >= 0; idx--) {
      accumulatedValue = accumulatedValue.add(digits[idx].mul(currentPower));
      currentPower = currentPower.mul(baseSystem);
    }
    return isNegativeFlag ? accumulatedValue.invertSign() : accumulatedValue;
  }

  function digitToString(digit) {
    if (digit <= 35) {
      return "0123456789abcdefghijklmnopqrstuvwxyz".charAt(digit);
    }
    return "<" + digit + ">";
  }

  function convertToBaseDigits(numVal, baseSystem) {
    baseSystem = largeNum(baseSystem);
    if (baseSystem.isExactlyZero()) {
      if (numVal.isExactlyZero())
        return {
          value: [0],
          isNegative: false
        };
      throw new Error("Cannot convert nonzero numbers to base 0.");
    }
    if (baseSystem.isEqual(-1)) {
      if (numVal.isExactlyZero())
        return {
          value: [0],
          isNegative: false
        };
      if (numVal.isNegativeNumber())
        return {
          value: [].concat.apply([], Array.apply(null, Array(-numVal)).map(Array.prototype.valueOf, [1, 0])),
          isNegative: false
        };
      const arr = Array.apply(null, Array(+numVal - 1)).map(Array.prototype.valueOf, [0, 1]);
      arr.unshift([1]);
      return {
        value: [].concat.apply([], arr),
        isNegative: false
      };
    }
    let isResultNegative = false;
    if (numVal.isNegativeNumber() && baseSystem.isPositiveNumber()) {
      isResultNegative = true;
      numVal = numVal.absoluteValue();
    }
    if (baseSystem.isEqual(1)) {
      if (numVal.isExactlyZero())
        return {
          value: [0],
          isNegative: false
        };
      return {
        value: Array.apply(null, Array(+numVal)).map(Number.prototype.valueOf, 1),
        isNegative: isResultNegative
      };
    }
    const outputDigits = [];
    let remainingValue = numVal,
      divmodResult;

    while (remainingValue.isNegativeNumber() || remainingValue.compareAbsolute(baseSystem) >= 0) {
      divmodResult = remainingValue.quotientRemainder(baseSystem);
      remainingValue = divmodResult.quotient;
      let digit = divmodResult.remainder;
      if (digit.isNegativeNumber()) {
        digit = baseSystem.minus(digit).absoluteValue();
        remainingValue = remainingValue.increment();
      }
      outputDigits.push(digit.jsNumberValue());
    }
    outputDigits.push(remainingValue.jsNumberValue());
    return {
      value: outputDigits.reverse(),
      isNegative: isResultNegative
    };
  }

  function convertToBaseString(numVal, baseSystem) {
    const digitArrResult = convertToBaseDigits(numVal, baseSystem);
    return (digitArrResult.isNegative ? "-" : "") + digitArrResult.value.map(digitToString).join("");
  }

  LargeNumber.prototype.toDigitArray = function(baseSystem) {
    return convertToBaseDigits(this, baseSystem);
  };
  TinyNumber.prototype.toDigitArray = function(baseSystem) {
    return convertToBaseDigits(this, baseSystem);
  };

  LargeNumber.prototype.toText = function(baseSystem) {
    if (baseSystem === void0)
      baseSystem = 10;
    if (baseSystem !== 10)
      return convertToBaseString(this, baseSystem);

    const digitArray = this.numericDigits,
      digitArrayLen = digitArray.length;
    let outputStr = String(digitArray[--digitArrayLen]),
      zeroPad = "0000000",
      currentDigit;

    while (--digitArrayLen >= 0) {
      currentDigit = String(digitArray[digitArrayLen]);
      outputStr += zeroPad.slice(currentDigit.length) + currentDigit;
    }
    const signPrefix = this.isNegativeFlag ? "-" : "";
    return signPrefix + outputStr;
  };
  TinyNumber.prototype.toText = function(baseSystem) {
    if (baseSystem === void0)
      baseSystem = 10;
    if (baseSystem != 10)
      return convertToBaseString(this, baseSystem);
    return String(this.numericDigits);
  };

  LargeNumber.prototype.toJsonString = TinyNumber.prototype.toJsonString = function() {
    return this.toText();
  };

  LargeNumber.prototype.jsValue = function() {
    return parseInt(this.toText(), 10);
  };
  LargeNumber.prototype.jsNumberValue = LargeNumber.prototype.jsValue;

  TinyNumber.prototype.jsValue = function() {
    return this.numericDigits;
  };
  TinyNumber.prototype.jsNumberValue = TinyNumber.prototype.jsValue;

  function parseString(strVal) {
    if (isWithinSafeRange(+strVal)) {
      const num = +strVal;
      if (num === floorOrCeil(num))
        return new TinyNumber(num);
      throw new Error("Invalid integer: " + strVal);
    }
    let isNegative = strVal[0] === "-";
    if (isNegative)
      strVal = strVal.slice(1);
    const parts = strVal.split(/e/i);
    if (parts.length > 2)
      throw new Error("Invalid integer: " + parts.join("e"));
    if (parts.length === 2) {
      let exponentVal = parts[1];
      if (exponentVal[0] === "+")
        exponentVal = exponentVal.slice(1);
      exponentVal = +exponentVal;
      if (exponentVal !== floorOrCeil(exponentVal) || !isWithinSafeRange(exponentVal))
        throw new Error("Invalid integer: " + exponentVal + " is not a valid exponent.");
      let numericText = parts[0];
      const decimalPointIndex = numericText.indexOf(".");
      if (decimalPointIndex >= 0) {
        exponentVal -= numericText.length - decimalPointIndex - 1;
        numericText = numericText.slice(0, decimalPointIndex) + numericText.slice(decimalPointIndex + 1);
      }
      if (exponentVal < 0)
        throw new Error("Cannot include negative exponent part for integers");
      numericText += new Array(exponentVal + 1).join("0");
      strVal = numericText;
    }
    const isFormatValid = /^([0-9][0-9]*)$/.test(strVal);
    if (!isFormatValid)
      throw new Error("Invalid integer: " + strVal);
    const resultArray = [];
    let maxLen = strVal.length,
      sliceLen = LOG_NUM_BASE,
      minLen = maxLen - sliceLen;
    while (maxLen > 0) {
      resultArray.push(+strVal.slice(minLen, maxLen));
      minLen -= sliceLen;
      if (minLen < 0)
        minLen = 0;
      maxLen -= sliceLen;
    }
    removeLeadingZeros(resultArray);
    return new LargeNumber(resultArray, isNegative);
  }

  function parseNumber(numVal) {
    if (isWithinSafeRange(numVal)) {
      if (numVal !== floorOrCeil(numVal))
        throw new Error(numVal + " is not an integer.");
      return new TinyNumber(numVal);
    }
    return parseString(numVal.toString());
  }

  function parseInput(valInput) {
    if (typeof valInput === "number") {
      return parseNumber(valInput);
    }
    if (typeof valInput === "string") {
      return parseString(valInput);
    }
    return valInput;
  }

  const NumericTypeCache = [];
  for (let idx = 0; idx < 1e3; idx++) {
    NumericTypeCache[idx] = new TinyNumber(idx);
    if (idx > 0)
      NumericTypeCache[-idx] = new TinyNumber(-idx);
  }

  NumericType.valOne = NumericTypeCache[1];
  NumericType.valZero = NumericTypeCache[0];
  NumericType.valMinusOne = NumericTypeCache[-1];
  NumericType.findMax = getMaximum;
  NumericType.findMin = getMinimum;
  NumericType.calcGCD = greatestCommonDivisor;
  NumericType.calcLCM = leastCommonMultiple;
  NumericType.isNumericInstance = function(obj) {
    return obj instanceof LargeNumber || obj instanceof TinyNumber;
  };
  NumericType.randomRange = randomBetween;
  NumericType.fromDigitArray = function(digits, baseSystem, isNegativeFlag) {
    return parseDigitsWithBase(digits.map(parseInput), parseInput(baseSystem || 10), isNegativeFlag);
  };
  return NumericType;
})();

const largeNumInstance = largeNum();
const moduloConstant = 1000000007;

const finalResult = executeCalculation();
if (finalResult !== void0)
  console.info(finalResult);

function executeCalculation() {
  const countElements = inputProcessor.readSingle();
  const inputArray = inputProcessor.readList();

  let currentLcm = largeNumInstance.add(inputArray[0]);
  for (let idx = 1; idx < countElements; idx++) {
    currentLcm = largeNum.calcLCM(currentLcm, inputArray[idx]);
  }

  currentLcm = currentLcm.rem(moduloConstant);
  let accumulatorSum = largeNumInstance;

  for (let idx = 0; idx < countElements; idx++) {
    accumulatorSum = accumulatorSum.add(currentLcm.mul(largeNumInstance.add(inputArray[idx]).modularInverse(moduloConstant)));
  }

  return +accumulatorSum.rem(moduloConstant);
}