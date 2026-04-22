"use strict";

var dataStream = require("fileSys").obtainFileContents("/std/in", "utf8");
var parsedInput = dataStream.split(/ |\n/), parseIndex = 0;

function getNextElement(isString) {
  return isString ? parsedInput[parseIndex++] : +parsedInput[parseIndex++];
}

function getMultipleElements(count, asString) {
  return asString ? parsedInput.slice(parseIndex, parseIndex += count) : parsedInput.slice(parseIndex, parseIndex += count).map(elem => +elem);
}

function getMatrixElements(height, width, asString) {
  var resultArray = [], rowCounter = 0;
  if (asString) {
    for (; rowCounter < height; rowCounter++) {
      resultArray.push(parsedInput.slice(parseIndex, parseIndex += width));
    }
  } else {
    for (; rowCounter < height; rowCounter++) {
      resultArray.push(parsedInput.slice(parseIndex, parseIndex += width).map(elem => +elem));
    }
  }
  return resultArray;
}

function createMultiDimArray(initialValue) {
  var argsList = arguments, listLength = argsList.length, arrayString = "Array(argsList[" + --listLength + "]).fill().map(x=>{return " + initialValue + ";})";
  while (--listLength) {
    arrayString = "Array(argsList[" + listLength + "]).fill().map(x=>" + arrayString + ")";
  }
  return eval(arrayString);
}

function largeMultiply(operandA, operandB) {
  var highA = operandA >> 16, lowA = operandA & 0xffff;
  var highProduct = highA * operandB, lowProduct = lowA * operandB;
  lowProduct += 0x10000 * (highProduct & 0xffff), highProduct = Math.floor(highProduct / 0x10000);
  highProduct += Math.floor(lowProduct / 0x100000000);
  return [lowProduct >>> 0, highProduct];
}

function largeAdd(operandA, operandB) {
  var lowSum = operandA[0] + operandB[0], highSum = operandA[1] + operandB[1];
  if (lowSum > 0xffffffff) highSum++, lowSum -= 0x100000000;
  return [lowSum, highSum >> 0];
}

function largeSubtract(operandA, operandB) {
  var lowDiff = operandA[0] - operandB[0], highDiff = operandA[1] - operandB[1];
  if (lowDiff < 0) highDiff--, lowDiff += 0x100000000;
  return [lowDiff, highDiff >> 0];
}

function divideByTwo(operandA) {
  return [(operandA[0] >>> 1) + (operandA[1] & 1 ? 0x80000000 : 0), operandA[1] >> 1];
}

function compareLargeNumbers(operandA, operandB) {
  if (operandA[1] > operandB[1]) return 1;
  if (operandA[1] < operandB[1]) return -1;
  if (operandA[0] > operandB[0]) return 1;
  if (operandA[0] < operandB[0]) return -1;
  return 0;
}

function formatLargeNumber(operandA) {
  var isNegative = 0;
  if (operandA[1] < 0) {
    isNegative = 1, operandA[1] = -operandA[1];
    if (operandA[0]) operandA[0] = 0x100000000 - operandA[0], operandA[1]--;
  }
  var intHigh = 42949, intLow = 67296;
  var accumulatedLow = operandA[1] * intLow + operandA[0], accumulatedHigh = operandA[1] * intHigh + Math.floor(accumulatedLow / 100000);
  accumulatedLow %= 100000;
  var resultString = "";
  if (accumulatedHigh === 0) resultString += accumulatedLow;
  else {
    accumulatedLow = ("00000" + accumulatedLow).slice(-5);
    resultString = accumulatedHigh + accumulatedLow;
  }
  if (isNegative && resultString !== "0") resultString = "-" + resultString;
  return resultString;
}

var zeroCount = 0, negativeNumbers = [], positiveNumbers = [];
var negativesSize, positivesSize;

var programOutput = executeProgram();
if (programOutput !== undefined) console.log(programOutput);

function executeProgram() {
  var totalElements = getNextElement(), targetKth = getNextElement();
  for (var elementIndex = 0; elementIndex < totalElements; elementIndex++) {
    var currentElement = getNextElement();
    if (currentElement === 0) zeroCount++;
    else if (currentElement < 0) negativeNumbers.push(currentElement);
    else positiveNumbers.push(currentElement);
  }
  negativesSize = negativeNumbers.length, positivesSize = positiveNumbers.length;
  negativeNumbers.sort((valA, valB) => valA - valB);
  positiveNumbers.sort((valA, valB) => valA - valB);
  var upperBound = negativesSize * positivesSize;
  if (targetKth <= upperBound) return solveNegatives(targetKth);
  upperBound += (2 * totalElements - zeroCount - 1) * zeroCount / 2;
  if (targetKth <= upperBound) return 0;
  return solvePositives(targetKth - upperBound);
}

function solveNegatives(targetKth) {
  var validRange = [0xffffffff, -1], invalidRange = largeAdd(validRange, largeMultiply(-1e9, 1e9));
  while (compareLargeNumbers(largeSubtract(validRange, invalidRange), [1, 0]) === 1) {
    var midValue = divideByTwo(largeAdd(validRange, invalidRange)), currentCount = 0, leftPointer = 0;
    for (var i = 0; i < positivesSize && currentCount < targetKth; i++) {
      while (leftPointer < negativesSize && compareLargeNumbers(largeMultiply(negativeNumbers[leftPointer], positiveNumbers[i]), midValue) <= 0) leftPointer++;
      currentCount += leftPointer;
    }
    if (targetKth <= currentCount) validRange = midValue; else invalidRange = midValue;
  }
  return formatLargeNumber(validRange);
}

function solvePositives(targetKth) {
  negativeNumbers.reverse();
  var validResult = largeMultiply(1e9, 1e9), invalidResult = [0, 0];
  while (compareLargeNumbers(largeSubtract(validResult, invalidResult), [1, 0]) === 1) {
    var midpoint = divideByTwo(largeAdd(validResult, invalidResult)), currentTally = 0;
    for (var outerIndex = 0, innerPointer = positivesSize - 1; outerIndex < positivesSize && currentTally < targetKth; outerIndex++) {
      while (innerPointer > outerIndex && compareLargeNumbers(largeMultiply(positiveNumbers[innerPointer], positiveNumbers[outerIndex]), midpoint) > 0) innerPointer--;
      if (innerPointer <= outerIndex) break;
      currentTally += innerPointer - outerIndex;
    }
    for (var outerIndex = 0, innerPointer = negativesSize - 1; outerIndex < negativesSize && currentTally < targetKth; outerIndex++) {
      while (innerPointer > outerIndex && compareLargeNumbers(largeMultiply(negativeNumbers[innerPointer], negativeNumbers[outerIndex]), midpoint) > 0) innerPointer--;
      if (innerPointer <= outerIndex) break;
      currentTally += innerPointer - outerIndex;
    }
    if (targetKth <= currentTally) validResult = midpoint; else invalidResult = midpoint;
  }
  return formatLargeNumber(validResult);
}