"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function processInput(rawData) {
  var inputLines = rawData.split('\n');
  var arrayLength = parseInt(inputLines[0]);
  var dataArray = parseNumbers(inputLines[1]).slice(0, arrayLength);
  var prefixSums = new Array(arrayLength);
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = generateRange(0, arrayLength)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var currentIdx = _step.value;
      var previousSum = currentIdx === 0 ? 0 : prefixSums[currentIdx - 1];
      prefixSums[currentIdx] = dataArray[currentIdx] + previousSum;
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return != null) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  var leftSplitPoints = [-1];
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = generateRange(1, arrayLength - 2)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var currentSplitIdx = _step2.value;

      if (currentSplitIdx === 1) {
        leftSplitPoints.push(0);
        continue;
      }

      var prevLeftSplit = leftSplitPoints[currentSplitIdx - 1];

      for (var leftBoundary = prevLeftSplit; leftBoundary < currentSplitIdx; leftBoundary++) {
        var firstPartSum = prefixSums[leftBoundary];
        var secondPartSum = prefixSums[currentSplitIdx] - prefixSums[leftBoundary];
        var diffIfKeep = Math.abs(firstPartSum - secondPartSum);
        var nextFirstPartSum = prefixSums[leftBoundary + 1];
        var nextSecondPartSum = prefixSums[currentSplitIdx] - prefixSums[leftBoundary + 1];
        var diffIfMove = Math.abs(nextFirstPartSum - nextSecondPartSum);

        if (diffIfKeep < diffIfMove || leftBoundary === currentSplitIdx - 1) {
          leftSplitPoints.push(leftBoundary);
          break;
        }
      }
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
        _iterator2.return();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  leftSplitPoints.push(-1);
  var rightSplitPoints = [-1];
  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = generateRange(1, arrayLength - 2)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var currentSplitIdxRev = _step3.value;

      if (currentSplitIdxRev === 1) {
        rightSplitPoints.push(arrayLength - 2);
        continue;
      }

      var rightBoundaryLimit = arrayLength - 2 - currentSplitIdxRev;
      var prevRightSplit = rightSplitPoints[currentSplitIdxRev - 1];

      for (var rightBoundary = prevRightSplit; rightBoundary > rightBoundaryLimit; rightBoundary--) {
        var thirdPartSum = prefixSums[rightBoundary] - prefixSums[rightBoundaryLimit];
        var fourthPartSum = prefixSums[arrayLength - 1] - prefixSums[rightBoundary];
        var diffIfKeep = Math.abs(thirdPartSum - fourthPartSum);
        var nextThirdPartSum = prefixSums[rightBoundary - 1] - prefixSums[rightBoundaryLimit];
        var nextFourthPartSum = prefixSums[arrayLength - 1] - prefixSums[rightBoundary - 1];
        var diffIfMove = Math.abs(nextThirdPartSum - nextFourthPartSum);

        if (diffIfKeep < diffIfMove || rightBoundary === rightBoundaryLimit + 1) {
          rightSplitPoints.push(rightBoundary);
          break;
        }
      }
    }
  } catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
        _iterator3.return();
      }
    } finally {
      if (_didIteratorError3) {
        throw _iteratorError3;
      }
    }
  }

  rightSplitPoints.push(-1);
  rightSplitPoints.reverse();
  var minMaxDiff = Infinity;
  var _iteratorNormalCompletion4 = true;
  var _didIteratorError4 = false;
  var _iteratorError4 = undefined;

  try {
    for (var _iterator4 = generateRange(1, arrayLength - 2)[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
      var currentMidIdx = _step4.value;
      var leftSplitIdx = leftSplitPoints[currentMidIdx];
      var rightSplitIdx = rightSplitPoints[currentMidIdx];
      var partP = prefixSums[leftSplitIdx];
      var partQ = prefixSums[currentMidIdx] - prefixSums[leftSplitIdx];
      var partR = prefixSums[rightSplitIdx] - prefixSums[currentMidIdx];
      var partS = prefixSums[arrayLength - 1] - prefixSums[rightSplitIdx];
      var currentMin = Math.min(partP, partQ, partR, partS);
      var currentMax = Math.max(partP, partQ, partR, partS);
      minMaxDiff = Math.min(minMaxDiff, currentMax - currentMin);
    }
  } catch (err) {
    _didIteratorError4 = true;
    _iteratorError4 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion4 && _iterator4.return != null) {
        _iterator4.return();
      }
    } finally {
      if (_didIteratorError4) {
        throw _iteratorError4;
      }
    }
  }

  console.log(minMaxDiff);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));

function parseNumbers(lineContent) {
  return lineContent.split(/\s+/).map(function (numStr) {
    return parseInt(numStr);
  });
}

function* generateRange(startVal, endVal) {
  for (var i = startVal; i < endVal; i++) {
    yield i;
  }
}

function* generateReverseRange(startVal, endVal) {
  for (var i = startVal - 1; i >= endVal; i--) {
    yield i;
  }
}

function executeRecursiveGenerator(func) {
  var rootCaller = {
    lastReturnValue: null
  };
  var callStack = [];

  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  callStack.push({
    iterator: func.apply(void 0, args),
    lastReturnValue: null,
    caller: rootCaller
  });

  while (callStack.length > 0) {
    var stackFrame = callStack[callStack.length - 1];
    var iterator = stackFrame.iterator,
        lastReturnValue = stackFrame.lastReturnValue,
        caller = stackFrame.caller;
    var _iterator$next = iterator.next(lastReturnValue),
        value = _iterator$next.value,
        done = _iterator$next.done;

    if (done) {
      caller.lastReturnValue = value;
      callStack.pop();
    } else {
      callStack.push({
        iterator: func.apply(void 0, _toConsumableArray(value)),
        lastReturnValue: null,
        caller: stackFrame
      });
    }
  }

  return rootCaller.lastReturnValue;
}
