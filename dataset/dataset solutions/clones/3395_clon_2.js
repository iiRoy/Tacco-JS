"use strict";

// Helper function to destructure an array-like object.
function _destructureArray(collection, limit) {
  return _getArrayWithGaps(collection) || _getIterableSubset(collection, limit) || _handleNonIterableRemainder();
}

// Throws an error for non-iterable instances when destructuring.
function _handleNonIterableRemainder() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

// Extracts a limited number of elements from an iterable.
function _getIterableSubset(collection, limit) {
  var _subset = [];
  var _notDone = true;
  var _hadError = false;
  var _caughtError = undefined;
  try {
    for (var _iteratorInstance = collection[Symbol.iterator](), _stepResult; !(_notDone = (_stepResult = _iteratorInstance.next()).done); _notDone = true) {
      _subset.push(_stepResult.value);
      if (limit && _subset.length === limit) break;
    }
  } catch (errorVal) {
    _hadError = true;
    _caughtError = errorVal;
  } finally {
    try {
      if (!_notDone && _iteratorInstance["return"] != null) {
        _iteratorInstance["return"]();
      }
    } finally {
      if (_hadError) {
        throw _caughtError;
      }
    }
  }
  return _subset;
}

// Checks if an object is an array and returns it.
function _getArrayWithGaps(collection) {
  if (Array.isArray(collection)) return collection;
}

// Main processing function for the input data.
function processInput(rawData) {
  // Split the raw input string into individual lines.
  var textRows = rawData.split('\n');
  // Parse the first line to get the count of elements.
  var countElements = parseInteger(textRows[0]);
  // Parse the second line for numbers, then slice to the required count.
  var dataItems = parseNumbersFromString(textRows[1]).slice(0, countElements);

  // Initialize a map to store the frequency of each data item.
  var frequencyMap = new Map();
  var _iterationCompleted = true;
  var _iteratorEncounteredError = false;
  var _caughtIteratorError = undefined;

  try {
    // Iterate over the data items to populate the frequency map.
    for (var _itemIterator = dataItems[Symbol.iterator](), _currentStep; !(_iterationCompleted = (_currentStep = _itemIterator.next()).done); _iterationCompleted = true) {
      var currentItem = _currentStep.value;
      var currentCount = frequencyMap.get(currentItem);

      // Increment count if item exists, otherwise set to 1.
      if (currentCount != null) {
        frequencyMap.set(currentItem, currentCount + 1);
      } else {
        frequencyMap.set(currentItem, 1);
      }
    }
  } catch (errorVal) {
    _iteratorEncounteredError = true;
    _caughtIteratorError = errorVal;
  } finally {
    try {
      if (!_iterationCompleted && _itemIterator["return"] != null) {
        _itemIterator["return"]();
      }
    } finally {
      if (_iteratorEncounteredError) {
        throw _caughtIteratorError;
      }
    }
  }

  var finalScore = 0; // Initialize the total score.

  // Process the map until all entries are handled.
  while (frequencyMap.size > 0) {
    var _mapIteratorResult = frequencyMap[Symbol.iterator]().next(),
        _destructuredMapEntry = _destructureArray(_mapIteratorResult.value, 2),
        initialValue = _destructuredMapEntry[0],
        entryCount = _destructuredMapEntry[1];

    // Decrease the count for the initial value from the map.
    decreaseCount(frequencyMap, initialValue, entryCount);

    // Recursively calculate weights for paths starting from the initial value.
    var _recursiveResult = calculateWeights(initialValue),
        _destructuredRecursiveResult = _destructureArray(_recursiveResult, 2),
        leftPathWeight = _destructuredRecursiveResult[0],
        rightPathWeight = _destructuredRecursiveResult[1];

    // Add the minimum of the two weights to the final score.
    finalScore += Math.min(leftPathWeight, rightPathWeight);
  }

  // Output the final computed score.
  console.info(finalScore);

  // Recursive function to determine path weights.
  function calculateWeights(startValue) {
    var currentLeftWeight = 1;  // Initialize left path weight.
    var currentRightWeight = 0; // Initialize right path weight.
    var _innerIterationCompleted = true;
    var _innerIteratorError = false;
    var _innerCaughtError = undefined;

    try {
      // Iterate through potential difference values.
      for (var _innerIterator = generateDifferences(startValue)[Symbol.iterator](), _innerStep; !(_innerIterationCompleted = (_innerStep = _innerIterator.next()).done); _innerIterationCompleted = true) {
        var differenceVal = _innerStep.value;

        // If the difference value exists in the map and can be removed.
        if (decreaseCount(frequencyMap, differenceVal)) {
          // Recursively call to get weights for the difference value.
          var _subRecursiveResult = calculateWeights(differenceVal),
              _destructuredSubResult = _destructureArray(_subRecursiveResult, 2),
              subLeft = _destructuredSubResult[0],
              subRight = _destructuredSubResult[1];

          // Update current weights based on sub-results.
          currentLeftWeight += subRight;
          currentRightWeight += subLeft;
        }
      }
    } catch (errorVal) {
      _innerIteratorError = true;
      _innerCaughtError = errorVal;
    } finally {
      try {
        if (!_innerIterationCompleted && _innerIterator.return != null) {
          _innerIterator.return();
        }
      }
    }

    // Return the calculated left and right path weights.
    return [currentLeftWeight, currentRightWeight];
  }
}

// Read input from standard in and pass to the main function.
processInput(require('node:fs').readFileSync('/dev/stdin', 'utf8'));

// Parses a string of numbers separated by whitespace into an array of integers.
function parseNumbersFromString(inputLine) {
  return inputLine.split(/\s+/).map(function (numberStr) {
    return parseInteger(numberStr);
  });
}

// A custom integer parsing function (alias for parseInt).
function parseInteger(str) {
  return parseInt(str);
}


// Finds the index of a target value in a sorted array using binary search.
// (Note: This function is defined but not utilized in the main processing logic.)
function findValueIndex(sortedArray, searchValue) {
  var startIndex = 0,
      endIndex = sortedArray.length;

  while (startIndex < endIndex) {
    var middleIndex = Math.floor((endIndex - startIndex) / 2) + startIndex;
    var arrayValue = sortedArray[middleIndex];

    if (arrayValue === searchValue) {
      return middleIndex;
    }

    if (arrayValue < searchValue) {
      startIndex = middleIndex;
    } else {
      endIndex = middleIndex;
    }
  }

  return null;
}

// Generates a list of differences between a source value and powers of two.
function generateDifferences(sourceValue) {
  var resultList = [];
  // Iterate through powers of two up to a large limit.
  for (var targetPowerOfTwo = 2; targetPowerOfTwo <= 2 * 1e9; targetPowerOfTwo *= 2) {
    var computedDifference = targetPowerOfTwo - sourceValue;

    // Only add positive differences to the list.
    if (computedDifference > 0) {
      resultList.push(computedDifference);
    }
  }

  return resultList;
}

// Decreases the count of an item in a map, removing it if count reaches zero.
function decreaseCount(countMap, itemKey) {
  var currentCount = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : countMap.get(itemKey);
  if (currentCount == null) return false; // Item not found or count is zero.

  if (currentCount > 1) {
    countMap.set(itemKey, currentCount - 1);
  } else {
    countMap.delete(itemKey); // Remove item if its count becomes 1.
  }

  return true; // Successfully decreased count or removed item.
}