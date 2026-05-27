"use strict";

// Helper function to spread non-iterable instances
function _spreadArrayElements(inputArray) {
  return _copyArrayElements(inputArray) || _convertIterableToArray(inputArray) || _invalidSpreadAttempt();
}

// Throws an error for invalid spread attempts
function _invalidSpreadAttempt() {
  throw new TypeError("Invalid attempt to spread non-iterable instance");
}

// Converts an iterable to an array
function _convertIterableToArray(iterableObj) {
  if (Symbol.iterator in Object(iterableObj) || Object.prototype.toString.call(iterableObj) === "[object Arguments]") {
    return Array.from(iterableObj);
  }
}

// Copies elements from an array
function _copyArrayElements(sourceArray) {
  if (Array.isArray(sourceArray)) {
    for (var i = 0, newArray = new Array(sourceArray.length); i < sourceArray.length; i++) {
      newArray[i] = sourceArray[i];
    }
    return newArray;
  }
}

// Helper function to destructure arrays
function _destructureArray(inputArray, limit) {
  return _checkIfArray(inputArray) || _convertIterableToArrayLimited(inputArray, limit) || _invalidDestructureRest();
}

// Throws an error for invalid destructuring rest
function _invalidDestructureRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

// Converts an iterable to an array with a limit
function _convertIterableToArrayLimited(iterableObj, limit) {
  var tempArray = [];
  var isNormalCompletion = true;
  var hasError = false;
  var errorValue = undefined;
  try {
    for (var _iterator = iterableObj[Symbol.iterator](), _step; !(isNormalCompletion = (_step = _iterator.next()).done); isNormalCompletion = true) {
      tempArray.push(_step.value);
      if (limit && tempArray.length === limit) break;
    }
  } catch (err) {
    hasError = true;
    errorValue = err;
  } finally {
    try {
      if (!isNormalCompletion && _iterator["return"] != null) {
        _iterator["return"]();
      }
    } finally {
      if (hasError) {
        throw errorValue;
      }
    }
  }
  return tempArray;
}

// Checks if the input is an array
function _checkIfArray(inputArray) {
  if (Array.isArray(inputArray)) return inputArray;
}

// Main processing function
function processInputData(rawData) {
  // Split the raw input into individual lines
  var inputLines = rawData.split('\n');

  // Parse totalItems (N) and selectionCount (K) from the first line
  var _parsedNumbers = parseNumbersFromLine(inputLines[0]),
    _destructuredNumbers = _destructureArray(_parsedNumbers, 2),
    totalItems = _destructuredNumbers[0],
    selectionCount = _destructuredNumbers[1];

  // Process subsequent lines to get item details
  var itemDetails = inputLines.slice(1, totalItems + 1).map(function (currentLine, itemIndex) {
    var _parsedItemNumbers = parseNumbersFromLine(currentLine),
      _destructuredItemNumbers = _destructureArray(_parsedItemNumbers, 2),
      itemType = _destructuredItemNumbers[0],
      itemValue = _destructuredItemNumbers[1];

    return {
      itemType,
      itemValue,
      itemIndex
    };
  });

  // Sort items primarily by type, then by value in descending order
  itemDetails.sort(function (itemA, itemB) {
    if (itemA.itemType < itemB.itemType) return -1;
    if (itemA.itemType > itemB.itemType) return 1;
    return itemB.itemValue - itemA.itemValue;
  });

  // Create a copy and sort by value in descending order
  var sortedByValue = itemDetails.slice(0).sort(function (itemA, itemB) {
    return itemB.itemValue - itemA.itemValue;
  });

  var currentTypeIdentifier = -1;
  var currentTypeGroup = null;
  var typeGroupMap = new Map();

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    // Group items by their type
    for (var _iterator = itemDetails[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var currentItem = _step.value;

      if (currentItem.itemType !== currentTypeIdentifier) {
        if (currentTypeGroup) {
          typeGroupMap.set(currentTypeIdentifier, currentTypeGroup);
        }
        currentTypeIdentifier = currentItem.itemType;
        currentTypeGroup = [];
      }
      currentTypeGroup.push(currentItem);
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

  // Ensure the last group is added to the map
  if (currentTypeGroup) {
    typeGroupMap.set(currentTypeIdentifier, currentTypeGroup);
  }

  var uniqueTypes = Array.from(typeGroupMap.keys());
  var isTaken = new Array(totalItems).fill(false);

  // Initialize variables for the selection process
  var initialSelection,
    remainingSelection = [],
    currentValueSum = 0,
    uniqueTypeCount = 0;
  var selectionPointer = 0;

  // Case 1: Enough unique types to fill K items
  if (uniqueTypes.length >= selectionCount) {
    initialSelection = uniqueTypes.map(function (typeKey) {
      var item = typeGroupMap.get(typeKey)[0]; // Take the highest value item for each type
      return item;
    });

    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = initialSelection[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var item = _step2.value;
        isTaken[item.itemIndex] = true;
        currentValueSum += item.itemValue;
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

    uniqueTypeCount = selectionCount; // K unique types selected
  } else {
    // Case 2: Not enough unique types, fill with highest value items
    initialSelection = uniqueTypes.map(function (typeKey) {
      var item = typeGroupMap.get(typeKey)[0];
      isTaken[item.itemIndex] = true;
      currentValueSum += item.itemValue;
      return item;
    });

    // Fill the remaining slots with highest value items not yet taken
    while (remainingSelection.length < selectionCount - initialSelection.length) {
      for (; selectionPointer < totalItems; selectionPointer++) {
        var _currentItem = sortedByValue[selectionPointer];
        if (isTaken[_currentItem.itemIndex]) continue; // Skip if already taken
        isTaken[_currentItem.itemIndex] = true;
        currentValueSum += _currentItem.itemValue;
        remainingSelection.push(_currentItem);
      }
    }

    uniqueTypeCount = uniqueTypes.length; // All available unique types are taken
  }

  // Sort the initial selection by value in ascending order for replacement strategy
  initialSelection.sort(function (itemA, itemB) {
    return itemA.itemValue - itemB.itemValue;
  });

  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    // Iterate through the initial selection to find potential replacements
    for (var _iterator3 = generateRange(0, initialSelection.length)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var loopIndex = _step3.value;
      var _itemToReplace = initialSelection[loopIndex];

      // Look for a replacement item from the remaining sorted items
      for (; selectionPointer < totalItems; selectionPointer++) {
        var replacementItem = sortedByValue[selectionPointer];

        if (isTaken[replacementItem.itemIndex]) continue; // Skip if replacement is already taken

        // Calculate scores for old and new configurations
        var oldScore = currentValueSum + Math.pow(uniqueTypeCount, 2);
        var newScore = currentValueSum + replacementItem.itemValue - _itemToReplace.itemValue + Math.pow(uniqueTypeCount - 1, 2);

        // If replacing improves the score, perform the replacement
        if (oldScore < newScore) {
          currentValueSum += replacementItem.itemValue - _itemToReplace.itemValue;
          uniqueTypeCount--; // A unique type is potentially lost
          isTaken[replacementItem.itemIndex] = true;
          isTaken[_itemToReplace.itemIndex] = false;
          break; // Move to the next item to replace
        } else {
          // If no improvement, output the current best score and exit
          console.log(oldScore);
          return;
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

  // Calculate and output the final score
  var finalScore = currentValueSum + Math.pow(uniqueTypeCount, 2);
  console.log(finalScore);
}

// A constant, possibly for modulo operations (though not used in this specific problem logic)
var MODULO_CONSTANT = 1e9 + 7;

// Read input from stdin and pass to the main function
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));

// Helper function to parse numbers from a line of text
function parseNumbersFromLine(lineContent) {
  return (Array.isArray(lineContent) ? lineContent : lineContent.split(/\s+/)).map(function (numStr) {
    return parseInt(numStr);
  });
}

/**
 * Generator function that iterates over integers in [rangeStart, rangeEnd).
 * @param {number} rangeStart - The starting integer (inclusive).
 * @param {number} rangeEnd - The ending integer (exclusive).
 */
function* generateRange(rangeStart, rangeEnd) {
  for (var loopIndex = rangeStart; loopIndex < rangeEnd; loopIndex++) {
    yield loopIndex;
  }
}

/**
 * Generator function that iterates over integers in [rangeEnd, rangeStart) in descending order.
 * @param {number} rangeStart - The starting integer (exclusive).
 * @param {number} rangeEnd - The ending integer (inclusive).
 */
function* generateReverseRange(rangeStart, rangeEnd) {
  for (var loopIndex = rangeStart - 1; loopIndex >= rangeEnd; loopIndex--) {
    yield loopIndex;
  }
}

/**
 * Executes a recursive function expressed as a generator function, managing its own call stack.
 * This allows for deep recursion without hitting JavaScript's call stack limit.
 * @param {Function} generatorFunction - The generator function to execute recursively.
 * @param {...any} functionArguments - Initial arguments for the first call to the generator function.
 * @returns {any} The final return value of the generator function.
 */
function executeRecursiveGenerator(generatorFunction) {
  // Object to hold the final result of the top-level call
  var finalResultHolder = {
    returnValue: null
  };

  // Custom call stack for managing generator execution
  var executionStack = [];

  // Collect initial arguments for the generator function
  for (var _argLength = arguments.length, functionArguments = new Array(_argLength > 1 ? _argLength - 1 : 0), _argKey = 1; _argKey < _argLength; _argKey++) {
    functionArguments[_argKey - 1] = arguments[_argKey];
  }

  // Push the initial call onto the custom stack
  executionStack.push({
    generatorIterator: generatorFunction.apply(void 0, functionArguments),
    returnValue: null,
    callingFrame: finalResultHolder
  });

  // Process the custom call stack until it's empty
  while (executionStack.length > 0) {
    var currentStackFrame = executionStack[executionStack.length - 1];
    var generatorIterator = currentStackFrame.generatorIterator,
      returnValue = currentStackFrame.returnValue,
      callingFrame = currentStackFrame.callingFrame;

    // Resume execution of the current generator
    var _iteratorResult = generatorIterator.next(returnValue),
      yieldedValue = _iteratorResult.value,
      isDone = _iteratorResult.done;

    if (isDone) {
      // If the generator is done, record its return value in the calling frame
      callingFrame.returnValue = yieldedValue;
      executionStack.pop(); // Remove from stack
    } else {
      // If the generator yielded, it's a recursive call; push new frame
      executionStack.push({
        generatorIterator: generatorFunction.apply(void 0, _spreadArrayElements(yieldedValue)),
        returnValue: null,
        callingFrame: currentStackFrame
      });
    }
  }

  return finalResultHolder.returnValue;
}
