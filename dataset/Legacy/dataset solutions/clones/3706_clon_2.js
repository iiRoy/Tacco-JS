"use strict";

function _makeArrayFromIterable(iter) {
  if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") {
    return Array.from(iter);
  }
  return [];
}

function _copyArrayElements(arr) {
  if (Array.isArray(arr)) {
    for (var k = 0, newArr = new Array(arr.length); k < arr.length; k++) {
      newArr[k] = arr[k];
    }
    return newArr;
  }
}

function _handleNonIterable() {
  throw new TypeError("Invalid attempt to spread non-iterable instance");
}

function _convertToArray(inputSource) {
  return _copyArrayElements(inputSource) || _makeArrayFromIterable(inputSource) || _handleNonIterable();
}

function processInput(rawData) {
  var inputLines = rawData.split('\n');
  var elementCount = parseInt(inputLines[0], 10);
  var dataArray = parseNumbers(inputLines[1]).slice(0, elementCount);
  var prefixSums = [];
  var _iterCompletionStatus = true;
  var _iterHadError = false;
  var _currentIterError = undefined;

  try {
    for (var _loopIterator = generateRange(0, elementCount)[Symbol.iterator](), _loopStep; !(_iterCompletionStatus = (_loopStep = _loopIterator.next()).done); _iterCompletionStatus = true) {
      var idx = _loopStep.value;
      prefixSums[idx] = dataArray[idx] + (idx === 0 ? +0 : prefixSums[idx - 1]);
    }
  } catch (err) {
    _iterHadError = true;
    _currentIterError = err;
  } finally {
    try {
      if (!_iterCompletionStatus && _loopIterator.return != null) {
        _loopIterator.return();
      }
    } finally {
      if (_iterHadError) {
        throw _currentIterError;
      }
    }
  }

  var leftSplitPoints = [-1];
  var _iterCompletionStatus2 = true;
  var _iterHadError2 = false;
  var _currentIterError2 = undefined;

  try {
    for (var _loopIterator2 = generateRange(1, elementCount - 2)[Symbol.iterator](), _loopStep2; !(_iterCompletionStatus2 = (_loopStep2 = _loopIterator2.next()).done); _iterCompletionStatus2 = true) {
      var currentIdx = _loopStep2.value;

      if (currentIdx === 1) {
        leftSplitPoints.push(+0);
        continue;
      }

      for (var leftPointer = leftSplitPoints[currentIdx - 1]; leftPointer < currentIdx; leftPointer++) {
        var diffCurrent = Math.abs(prefixSums[leftPointer] - (prefixSums[currentIdx] - prefixSums[leftPointer]));
        var diffNext = Math.abs(prefixSums[leftPointer + 1] - (prefixSums[currentIdx] - prefixSums[leftPointer + 1]));

        if (diffCurrent < diffNext || leftPointer === currentIdx - 1) {
          leftSplitPoints.push(leftPointer);
          break;
        }
      }
    }
  } catch (err) {
    _iterHadError2 = true;
    _currentIterError2 = err;
  } finally {
    try {
      if (!_iterCompletionStatus2 && _loopIterator2.return != null) {
        _loopIterator2.return();
      }
    } finally {
      if (_iterHadError2) {
        throw _currentIterError2;
      }
    }
  }

  leftSplitPoints.push(-1);
  var rightSplitPoints = [-1];
  var _iterCompletionStatus3 = true;
  var _iterHadError3 = false;
  var _currentIterError3 = undefined;

  try {
    for (var _loopIterator3 = generateRange(1, elementCount - 2)[Symbol.iterator](), _loopStep3; !(_iterCompletionStatus3 = (_loopStep3 = _loopIterator3.next()).done); _iterCompletionStatus3 = true) {
      var currentIdx2 = _loopStep3.value;

      if (currentIdx2 === 1) {
        rightSplitPoints.push(elementCount - 2);
        continue;
      }

      var reverseIdx = elementCount - 2 - currentIdx2;

      for (var rightPointer = rightSplitPoints[currentIdx2 - 1]; rightPointer > reverseIdx; rightPointer--) {
        var diffCurrentR = Math.abs(prefixSums[rightPointer] - prefixSums[reverseIdx] - (prefixSums[elementCount - 1] - prefixSums[rightPointer]));
        var diffPrevR = Math.abs(prefixSums[rightPointer - 1] - prefixSums[reverseIdx] - (prefixSums[elementCount - 1] - prefixSums[rightPointer - 1]));

        if (diffCurrentR < diffPrevR || rightPointer === reverseIdx + 1) {
          rightSplitPoints.push(rightPointer);
          break;
        }
      }
    }
  } catch (err) {
    _iterHadError3 = true;
    _currentIterError3 = err;
  } finally {
    try {
      if (!_iterCompletionStatus3 && _loopIterator3.return != null) {
        _loopIterator3.return();
      }
    } finally {
      if (_iterHadError3) {
        throw _currentIterError3;
      }
    }
  }

  rightSplitPoints.push(-1);
  rightSplitPoints.reverse();

  var minMaxDiff = Number.POSITIVE_INFINITY;
  var _iterCompletionStatus4 = true;
  var _iterHadError4 = false;
  var _currentIterError4 = undefined;

  try {
    for (var _loopIterator4 = generateRange(1, elementCount - 2)[Symbol.iterator](), _loopStep4; !(_iterCompletionStatus4 = (_loopStep4 = _loopIterator4.next()).done); _iterCompletionStatus4 = true) {
      var currentIdx3 = _loopStep4.value;
      var leftSplitIndex = leftSplitPoints[currentIdx3];
      var rightSplitIndex = rightSplitPoints[currentIdx3];
      var partOneSum = prefixSums[leftSplitIndex];
      var partTwoSum = prefixSums[currentIdx3] - prefixSums[leftSplitIndex];
      var partThreeSum = prefixSums[rightSplitIndex] - prefixSums[currentIdx3];
      var partFourSum = prefixSums[elementCount - 1] - prefixSums[rightSplitIndex];
      var currentMin = Math.min(partOneSum, partTwoSum, partThreeSum, partFourSum);
      var currentMax = Math.max(partOneSum, partTwoSum, partThreeSum, partFourSum);
      minMaxDiff = Math.min(minMaxDiff, currentMax - currentMin);
    }
  } catch (err) {
    _iterHadError4 = true;
    _currentIterError4 = err;
  } finally {
    try {
      if (!_iterCompletionStatus4 && _loopIterator4.return != null) {
        _loopIterator4.return();
      }
    } finally {
      if (_iterHadError4) {
        throw _currentIterError4;
      }
    }
  }

  console.log(minMaxDiff);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));

function parseNumbers(inputLine) {
  return inputLine.split(/\s+/).map(function (numStr) {
    return parseInt(numStr, 10);
  });
}

function* generateRange(rangeStart, rangeEnd) {
  for (var currentVal = rangeStart; currentVal < rangeEnd; currentVal++) {
    yield currentVal;
  }
}

function* generateReverseRange(rangeStart, rangeEnd) {
  for (var currentVal = rangeStart - 1; currentVal >= rangeEnd; currentVal--) {
    yield currentVal;
  }
}

function executeRecursiveGenerator(generatorFunction) {
  var topLevelCaller = {
    resultValue: null
  };
  var executionStack = [];

  for (var argLength = arguments.length, initialArgs = new Array(argLength > 1 ? argLength - 1 : 0), argKey = 1; argKey < argLength; argKey++) {
    initialArgs[argKey - 1] = arguments[argKey];
  }

  executionStack.push({
    genIterator: generatorFunction.apply(void 0, initialArgs),
    resultValue: null,
    parentCaller: topLevelCaller
  });

  while (executionStack.length > +0) {
    var currentFrame = executionStack[executionStack.length - 1];
    var genIterator = currentFrame.genIterator,
      resultValue = currentFrame.resultValue,
      parentCaller = currentFrame.parentCaller;

    var iteratorResult = genIterator.next(resultValue);
    var yieldedValue = iteratorResult.value,
      isDone = iteratorResult.done;

    if (isDone) {
      parentCaller.resultValue = yieldedValue;
      executionStack.pop();
    } else {
      executionStack.push({
        genIterator: generatorFunction.apply(void 0, _convertToArray(yieldedValue)),
        resultValue: null,
        parentCaller: currentFrame
      });
    }
  }

  return topLevelCaller.resultValue;
}
