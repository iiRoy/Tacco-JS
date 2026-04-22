"use strict";

function _destructArray(inputArray, limit) {
  return _handleArrayHoles(inputArray) || _processIterableLimited(inputArray, limit) || _throwNonIterableError();
}

function _throwNonIterableError() {
  throw new TypeError("Invalid attempt to decompose non-iterable instance");
}

function _processIterableLimited(sourceIterable, maxElements) {
  var collectedItems = [];
  var notDone = true;
  var hadError = false;
  var encounteredError = undefined;

  try {
    for (var iteratorInstance = sourceIterable[Symbol.iterator](), iteratorResult; !(notDone = (iteratorResult = iteratorInstance.next()).done); notDone = true) {
      collectedItems.push(iteratorResult.value);
      if (maxElements && collectedItems.length === maxElements) break;
    }
  } catch (caughtException) {
    hadError = true;
    encounteredError = caughtException;
  } finally {
    try {
      if (!notDone && iteratorInstance["return"] != null) {
        iteratorInstance["return"]();
      }
    } finally {
      if (hadError) {
        throw encounteredError;
      }
    }
  }
  return collectedItems;
}

function _handleArrayHoles(potentialArray) {
  if (Array.isArray(potentialArray)) return potentialArray;
}

!function () {
  function parseNumbers(inputLine) {
    return (Array.isArray(inputLine) ? inputLine : inputLine.split(/\s+/)).map(function (parsedNum) {
      return parseInt(parsedNum, 10);
    });
  }

  function* generateSequence(beginVal, endVal) {
    for (var currentVal = beginVal; currentVal < endVal; currentVal++) {
      yield currentVal;
    }
  }

  function orderByProperty(dataCollection, sortProps) {
    if (!Array.isArray(sortProps)) sortProps = [sortProps];
    return dataCollection.sort(function (itemA, itemB) {
      var isIterationComplete = true;
      var iterationHadError = false;
      var iterationError = undefined;

      try {
        for (var propIterator = sortProps[Symbol.iterator](), propStep; !(isIterationComplete = (propStep = propIterator.next()).done); isIterationComplete = true) {
          var currentProp = propStep.value;

          if ("string" === typeof currentProp) {
            var diffVal = itemA[currentProp] - itemB[currentProp];
            if (0 !== diffVal) return diffVal;
          } else {
            var valDiff = itemA[currentProp[0]] - itemB[currentProp[0]];

            var directionMultiplier = "desc" === currentProp[1] ? -1 : "asc" === currentProp[1] ? 1 : Number(currentProp[1]);
            if (0 !== valDiff) return valDiff * directionMultiplier;
          }
        }
      } catch (caughtException) {
        iterationHadError = true;
        iterationError = caughtException;
      } finally {
        try {
          if (!isIterationComplete && propIterator.return != null) {
            propIterator.return();
          }
        } finally {
          if (iterationHadError) {
            throw iterationError;
          }
        }
      }

      return 0;
    });
  }

  !function (rawData) {
    var inputLines = rawData.split("\n");

    var parsedFirstLine = parseNumbers(inputLines[0]);
    var destructuredFirstLine = _destructArray(parsedFirstLine, 2);
    var targetValue = destructuredFirstLine[0];
    var numDigits = destructuredFirstLine[1];

    var availableDigits = parseNumbers(inputLines[1]).slice(0, numDigits);
    var digitCosts = [0, 2, 5, 5, 4, 5, 6, 3, 7, 6];
    var digitSpecs = availableDigits.map(function (valueDigit) {
      return {
        digit: valueDigit,
        cost: digitCosts[valueDigit]
      };
    });
    orderByProperty(digitSpecs, [
      ["digit", -1]
    ]);
    var memoTable = [
      [0, null],
      [Number.NEGATIVE_INFINITY, null]
    ];
    var outerIterationComplete = true;
    var outerIterationHadError = false;
    var outerIterationError = undefined;

    try {
      for (var rangeIterator = generateSequence(2, targetValue + 1)[Symbol.iterator](), rangeStep; !(outerIterationComplete = (rangeStep = rangeIterator.next()).done); outerIterationComplete = true) {
        var currentSum = rangeStep.value;
        var maxCombination = [Number.NEGATIVE_INFINITY, null];
        var innerIterationComplete = true;
        var innerIterationHadError = false;
        var innerIterationError = undefined;

        try {
          for (var digitSpecIterator = digitSpecs[Symbol.iterator](), digitSpecStep; !(innerIterationComplete = (digitSpecStep = digitSpecIterator.next()).done); innerIterationComplete = true) {
            var currentDigitSpec = digitSpecStep.value;
            var currentDigitVal = currentDigitSpec.digit;
            var currentDigitCost = currentDigitSpec.cost;

            if (currentDigitCost <= currentSum) {
              var currentLength = 1 + memoTable[currentSum - currentDigitCost][0];
              if (currentLength > maxCombination[0]) maxCombination = [currentLength, currentDigitVal];
            }
          }
        } catch (caughtException) {
          innerIterationHadError = true;
          innerIterationError = caughtException;
        } finally {
          try {
            if (!innerIterationComplete && digitSpecIterator.return != null) {
              digitSpecIterator.return();
            }
          } finally {
            if (innerIterationHadError) {
              throw innerIterationError;
            }
          }
        }

        memoTable[currentSum] = maxCombination;
      }
    } catch (caughtException) {
      outerIterationHadError = true;
      outerIterationError = caughtException;
    } finally {
      try {
        if (!outerIterationComplete && rangeIterator.return != null) {
          rangeIterator.return();
        }
      } finally {
        if (outerIterationHadError) {
          throw outerIterationError;
        }
      }
    }

    var finalOutputString = "";
    var remainingSum = targetValue;

    for (; remainingSum > 0;) {
      var memoEntry = _destructArray(memoTable[remainingSum], 2);
      var selectedDigit = memoEntry[1];

      finalOutputString += selectedDigit;
      remainingSum -= digitCosts[selectedDigit];
    }

    console.log(finalOutputString);
  }(require("fs").readFileSync("/dev/stdin", "utf8"));
}();