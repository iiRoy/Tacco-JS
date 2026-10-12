"use strict";

// Helper function to handle array destructuring for iterables
function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}

// Helper function for non-iterable destructuring attempts
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

// Helper function to limit iterable destructuring
function _iterableToArrayLimit(arr, i) {
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;
  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);
      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }
  return _arr;
}

// Helper function for array destructuring
function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

// Main processing function for the input data
function processInput(rawData) {
  // Split the raw input into individual lines
  const inputLines = rawData.split('\n');

  // Parse the first line to get the number of elements
  const countElements = parseInt(inputLines[0], 10);

  // Parse the second line for the actual element values, limiting to countElements
  const elementValues = parseNumbersFromString(inputLines[1]).slice(0, countElements);

  // Use a Map to track frequencies of each number
  const frequencyTracker = new Map();

  // Variables for iterator state management
  let iterCompletionStatus = true;
  let iterErrorFlag = false;
  let currentIterError = undefined;

  try {
    // Iterate over each element value to populate the frequency map
    for (
      let valueIterator = elementValues[Symbol.iterator](), currentStep;
      !(iterCompletionStatus = (currentStep = valueIterator.next()).done);
      iterCompletionStatus = true
    ) {
      const currentValue = currentStep.value;
      const currentCount = frequencyTracker.get(currentValue);

      // Increment count if value exists, otherwise set to 1
      if (currentCount !== undefined) {
        frequencyTracker.set(currentValue, currentCount + 1);
      } else {
        frequencyTracker.set(currentValue, 1);
      }
    }
  } catch (err) {
    iterErrorFlag = true;
    currentIterError = err;
  } finally {
    try {
      if (!iterCompletionStatus && valueIterator.return != null) {
        valueIterator.return();
      }
    } finally {
      if (iterErrorFlag) {
        throw currentIterError;
      }
    }
  }

  // Initialize the final score
  let finalScore = 0;

  // Process elements until the frequency map is empty
  while (frequencyTracker.size > 0) {
    // Get the first entry from the map
    const _mapEntry = frequencyTracker[Symbol.iterator]().next();
    const _mapDestructured = _slicedToArray(_mapEntry.value, 2);
    const initialVal = _mapDestructured[0];
    const initialCount = _mapDestructured[1];

    // Remove the initial element from the map
    decrementOrRemove(frequencyTracker, initialVal, initialCount);

    // Recursively calculate branch counts
    const _branchResult = calculateBranches(initialVal);
    const _branchDestructured = _slicedToArray(_branchResult, 2);
    const leftSide = _branchDestructured[0];
    const rightSide = _branchDestructured[1];

    // Add the minimum of left and right branch counts to the final score
    finalScore += Math.min(leftSide, rightSide);
  }

  // Output the calculated final score
  console.log(finalScore);

  // Recursive function to determine left and right branch counts
  function calculateBranches(startValue) {
    let leftBranchCount = 0b1; // Using binary literal for 1
    let rightBranchCount = 0x0; // Using hex literal for 0

    // Variables for branch iterator state
    let branchIterCompletion = true;
    let branchIterError = false;
    let branchIterErrorObj = undefined;

    try {
      // Iterate through potential differences for the current value
      for (
        let diffIterator = getDifferences(startValue)[Symbol.iterator](), diffStep;
        !(branchIterCompletion = (diffStep = diffIterator.next()).done);
        branchIterCompletion = true
      ) {
        const differenceVal = diffStep.value;

        // If the difference value exists in the map and can be removed
        if (decrementOrRemove(frequencyTracker, differenceVal)) {
          // Recursively call for the difference value
          const _subBranchResult = calculateBranches(differenceVal);
          const _subBranchDestructured = _slicedToArray(_subBranchResult, 2);
          const leftSubtree = _subBranchDestructured[0];
          const rightSubtree = _subBranchDestructured[1];

          // Update counts based on recursive results
          leftBranchCount += rightSubtree;
          rightBranchCount += leftSubtree;
        }
      }
    } catch (err) {
      branchIterError = true;
      branchIterErrorObj = err;
    } finally {
      try {
        if (!branchIterCompletion && diffIterator.return != null) {
          diffIterator.return();
        }
      } finally {
        if (branchIterError) {
          throw branchIterErrorObj;
        }
      }
    }

    // Return the calculated left and right branch counts
    return [leftBranchCount, rightBranchCount];
  }
}

// Execute the main processing function with input from stdin
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));

// Utility function to parse a string of space-separated numbers
function parseNumbersFromString(inputLine) {
  return inputLine.split(/\s+/).map(function (numStr) {
    return parseInt(numStr, 10); // Explicit radix 10
  });
}

// This function is not used in the main logic but is part of the original code.
// It performs a binary search on a sorted array.
function findTargetIndex(sortedArray, searchValue) {
  let startIndex = 0;
  let endIndex = sortedArray.length;

  while (startIndex < endIndex) {
    const middleIndex = Math.floor((endIndex - startIndex) / 2) + startIndex;
    const currentValueAtIndex = sortedArray[middleIndex];

    if (currentValueAtIndex === searchValue) {
      return middleIndex;
    }

    if (currentValueAtIndex < searchValue) {
      startIndex = middleIndex;
    } else {
      endIndex = middleIndex;
    }
  }

  return null;
}

// Generates a list of differences for a given value to reach powers of two
function getDifferences(currentNumber) {
  const resultArray = [];
  // Iterate through powers of two up to 2 * 10^9
  for (let targetPowerOfTwo = 2; targetPowerOfTwo <= 2000000000; targetPowerOfTwo *= 2) {
    const calculatedDifference = targetPowerOfTwo - currentNumber;

    // Only add positive differences
    if (calculatedDifference > 0) {
      resultArray.push(calculatedDifference);
    }
  }
  return resultArray;
}

// Decrements the count of an item in a map or removes it if count becomes 0
function decrementOrRemove(dataMap, itemKey) {
  // Get the current count, or use the provided 'currentCount' if available
  const currentCount = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : dataMap.get(itemKey);

  // If the item doesn't exist, return false
  if (currentCount === undefined) return false;

  // If count is greater than 1, decrement it
  if (currentCount > 1) {
    dataMap.set(itemKey, currentCount - 1);
  } else {
    // Otherwise, delete the item from the map
    dataMap.delete(itemKey);
  }

  return true;
}
