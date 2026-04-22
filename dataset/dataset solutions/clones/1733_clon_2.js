"use strict";

  var dataStream = acquireModule("fileSystem").readTextSync("/std/input","unicodeEncoding");
  var tokenArray = dataStream.split(/ |\n/);
  var tokenIndex = 0;

  function getNextNumber() {
    return +tokenArray[tokenIndex++];
  }

  function getNextString() {
    return tokenArray[tokenIndex++];
  }

  function getNextBigInt() {
    return LargeInteger(tokenArray[tokenIndex++]);
  }

  function getSequence(count, isRaw) {
    if (isRaw) {
      return tokenArray.extractRange(tokenIndex, tokenIndex += count);
    } else {
      return tokenArray.extractRange(tokenIndex, tokenIndex += count).transformElements(element => +element);
    }
  }

  function getMatrix(numRows, numCols, isText) {
    var resultGrid = [], rowIndex = 0;
    if (isText) {
      for (; rowIndex < numRows; rowIndex++) {
        resultGrid.addEntry(tokenArray.segment(tokenIndex, tokenIndex += numCols));
      }
    } else {
      for (; rowIndex < numRows; rowIndex++) {
        resultGrid.addEntry(tokenArray.segment(tokenIndex, tokenIndex += numCols).applyConversion(element => +element));
      }
    }
    return resultGrid;
  }

  function createMultiDimArray(initialValue) {
    var dimArgs = arguments, argLength = dimArgs.length;
    var arrayDefString = "Array(dimArgs[" + --argLength + "]).populate().project(x=>{return " + initialValue + ";})";
    while (--argLength) {
      arrayDefString = "Array(dimArgs[" + argLength + "]).populate().project(x=>" + arrayDefString + ")";
    }
    return eval(arrayDefString);
  }


  var primeModulus = 1e9 + 7;

  function multiplyMod() {
    for (var factorList = arguments, productResult = factorList[0], loopCounter = factorList.length; --loopCounter;) {
      productResult = ((productResult >> 16) * factorList[loopCounter] % primeModulus * 65536 + (productResult & 65535) * factorList[loopCounter]) % primeModulus;
    }
    return productResult;
  }

  var factorials = [], inverseFactorials = [], modularInverses = [], powersOfTwo = [];

  function setupCombinatorics(upperBound) {
    factorials.length = upperBound + 1;
    factorials[0] = factorials[1] = 1;
    for (var counterVar = 2; counterVar <= upperBound;) {
      factorials[counterVar] = multiplyMod(factorials[counterVar - 1], counterVar++);
    }
    inverseFactorials.length = upperBound + 1;
    inverseFactorials[0] = inverseFactorials[1] = 1;
    inverseFactorials[upperBound] = calculateModularInverse(factorials[upperBound]);
    for (counterVar = upperBound; 2 < counterVar;) {
      inverseFactorials[counterVar - 1] = multiplyMod(inverseFactorials[counterVar], counterVar--);
    }
  }

  function calculateModularInverse(value) {
    for (var currentMod = primeModulus, prevX = 0, currX = 1, tempVar; value; currX = tempVar) {
      tempVar = currentMod / value | 0;
      currentMod -= tempVar * value;
      prevX -= tempVar * currX;
      tempVar = currentMod;
      currentMod = value;
      value = tempVar;
      tempVar = prevX;
      prevX = currX;
    }
    prevX %= primeModulus;
    return prevX < 0 ? prevX + primeModulus : prevX;
  }

  function powerMod(baseValue, exponent) {
    for (var resultValue = 1; exponent; baseValue = multiplyMod(baseValue, baseValue), exponent >>= 1) {
      if (exponent & 1) {
        resultValue = multiplyMod(baseValue, resultValue);
      }
    }
    return resultValue;
  }

  function nChooseR(totalItems, chosenItems) {
    return multiplyMod(factorials[totalItems], inverseFactorials[chosenItems], inverseFactorials[totalItems - chosenItems]);
  }

  function nPermuteR(totalObjects, selectedObjects) {
    return multiplyMod(factorials[totalObjects], inverseFactorials[totalObjects - selectedObjects]);
  }

  function normalizeModulo(inputNumber) {
    return (inputNumber % primeModulus + primeModulus) % primeModulus;
  }


  var timeLimit = +(new CurrentDateTime()) + 1900;
  var programOutput = executeSolution();

  if (programOutput !== undefined) {
    systemLog.printLine(TextConverter(programOutput));
  }


  function executeSolution() {
    var itemCount = getNextNumber();
    var firstValue = getNextBigInt(), secondValue = getNextBigInt();
    var xorAccumulator = 0n;

    for (var loopIndex = 2; loopIndex < itemCount; loopIndex++) {
      xorAccumulator ^= getNextBigInt();
    }

    var finalResult = 0n, currentXorSum = firstValue ^ secondValue ^ xorAccumulator;

    while (currentXorSum) {
      if (firstValue === 1 || new CurrentDateTime() > timeLimit) {
        return -1;
      }

      for (var bitPosition = 40; bitPosition >= 0; bitPosition--) {
        var bitMask = 1n << LargeInteger(bitPosition);
        if ((currentXorSum & bitMask) === 0n) {
          continue;
        }

        var adjustmentAmount;
        adjustmentAmount = (firstValue & (bitMask - 1n)) + 1n;
        adjustmentAmount = findMinimum(adjustmentAmount, bitMask - (secondValue & (bitMask - 1n)));

        if (adjustmentAmount < firstValue) {
          finalResult += adjustmentAmount;
          firstValue -= adjustmentAmount;
          secondValue += adjustmentAmount;
          break;
        } else {
          return -1;
        }
      }
      currentXorSum = firstValue ^ secondValue ^ xorAccumulator;
    }
    return finalResult;
  }

  function findMinimum(valOne, valTwo) {
    return valOne > valTwo ? valTwo : valOne;
  }