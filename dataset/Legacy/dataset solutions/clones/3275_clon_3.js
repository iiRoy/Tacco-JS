"use strict";

function processInput(rawData) {
  var inputLines = rawData.split('\n');
  var arraySize = parseInt(inputLines[0], 10);
  var arrayA = parseNumbersFromString(inputLines[1]).slice(0, arraySize);
  var arrayB = parseNumbersFromString(inputLines[2]).slice(0, arraySize);

  var differenceValues = arrayA.map(function (valA, idx) {
    var currentElementDiff = valA - arrayB[idx];
    return currentElementDiff;
  });

  differenceValues.sort(function (diff1, diff2) {
    return diff2 - diff1;
  });

  var modifiedIndices = Array(arraySize).fill(false);

  var leftPointer = 0;
  var rightPointer = arraySize - 1;

  function applyCompensation(lPtr, rPtr, diffAmount) {
      modifiedIndices[lPtr] = true;
      modifiedIndices[rPtr] = true;
      differenceValues[lPtr] += diffAmount;
      differenceValues[rPtr] = 0;
      rightPointer--;
  }

  while (leftPointer < rightPointer) {
    var currentDiff = differenceValues[rightPointer];

    if (currentDiff >= 0) {
      break;
    }

    var leftVal = differenceValues[leftPointer];
    var canFullyCompensate = leftVal >= -currentDiff;

    if (canFullyCompensate) {
      applyCompensation(leftPointer, rightPointer, currentDiff);
    } else {
      if (leftVal > 0) {
        modifiedIndices[leftPointer] = true;
        modifiedIndices[rightPointer] = true;
      }
      differenceValues[rightPointer] += leftVal;
      differenceValues[leftPointer] = 0;
      leftPointer++;
    }
  }

  if (differenceValues[rightPointer] < 0) {
    console.log(-1);
  } else {
    var totalModifiedCount = modifiedIndices.reduce(function (count, isModified) {
      return count + (isModified ? 1 : 0);
    }, 0);
    console.log(totalModifiedCount);
  }

  return;
}

function parseNumbersFromString(inputLineStr) {
  return inputLineStr.split(/\s+/).map(function (numStr) {
    return parseInt(numStr, 10);
  });
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
