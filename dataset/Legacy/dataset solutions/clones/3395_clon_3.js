"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function processInput(rawData) {
  var inputLines = rawData.split('\n');
  var elementCountStr = inputLines[0];
  var numberSequenceStr = inputLines[1];

  var countOfElements = parseInt(elementCountStr, 10);
  var numberSequence = parseNumbersFromString(numberSequenceStr).slice(0, countOfElements);

  var frequencyMap = new Map();
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = numberSequence[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var currentNum = _step.value;
      var currentCount = frequencyMap.get(currentNum);

      if (currentCount != null) {
        frequencyMap.set(currentNum, currentCount + 1);
      } else {
        frequencyMap.set(currentNum, 1);
      }
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

  var finalScore = 0;

  while (frequencyMap.size > 0) {
    var _currentMapEntry = frequencyMap[Symbol.iterator]().next(),
        _destructuredEntry = _slicedToArray(_currentMapEntry.value, 2),
        startValue = _destructuredEntry[0],
        initialCount = _destructuredEntry[1];

    decrementOrRemoveFromMap(frequencyMap, startValue, initialCount);

    var _branchCalculationResult = calculateBranchCounts(startValue),
        _destructuredBranches = _slicedToArray(_branchCalculationResult, 2),
        leftBranchCount = _destructuredBranches[0],
        rightBranchCount = _destructuredBranches[1];

    var minOfBranches = Math.min(leftBranchCount, rightBranchCount);
    finalScore += minOfBranches;
  }

  console.log(finalScore);

  function calculateBranchCounts(baseValueForRec) {
    var currentLeft = 1;
    var currentRight = 0;
    var complementaryValues = generateComplementaryValues(baseValueForRec);

    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = complementaryValues[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var differenceValue = _step2.value;

        if (decrementOrRemoveFromMap(frequencyMap, differenceValue)) {
          var _subBranchCalculation = calculateBranchCounts(differenceValue),
              _destructuredSubBranches = _slicedToArray(_subBranchCalculation, 2),
              subLeft = _destructuredSubBranches[0],
              subRight = _destructuredSubBranches[1];

          currentLeft += subRight;
          currentRight += subLeft;
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

    return [currentLeft, currentRight];
  }
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));

function parseNumbersFromString(inputLine) {
  return inputLine.split(/\s+/).map(function (parsedNumber) {
    return parseInt(parsedNumber, 10);
  });
}

function generateComplementaryValues(baseValue) {
  var complementaryList = [];

  for (var powerOfTwo = 2; powerOfTwo <= 2 * 1e9; powerOfTwo *= 2) {
    var difference = powerOfTwo - baseValue;

    if (difference > 0) {
      complementaryList.push(difference);
    }
  }

  return complementaryList;
}

function decrementOrRemoveFromMap(targetMap, mapKey) {
  var mapValue = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : targetMap.get(mapKey);
  
  if (mapValue == null) {
    return false;
  }

  if (mapValue > 1) {
    targetMap.set(mapKey, mapValue - 1);
  } else {
    targetMap.delete(mapKey);
  }

  return true;
}
