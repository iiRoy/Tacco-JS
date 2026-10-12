"use strict";

// Helper function to handle array destructuring for non-iterable values
function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}

// Throws an error if destructuring fails for non-iterable instances
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

// Limits iteration over an iterable to a specified number of elements
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
      if (!_n && _i["return"] != null) {
        _i["return"]();
      }
    } finally {
      if (_d) throw _e;
    }
  }
  return _arr;
}

// Checks if a value is an array and returns it, otherwise returns null
function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

/**
 * Main function to process the input and calculate the result.
 * @param {string} rawData - The raw input string from stdin.
 */
function processInput(rawData) {
  // Split the input string into individual lines
  const inputLines = rawData.split('\n');
  // Parse the first line to get the number of elements
  const countElements = parseInt(inputLines[0]);
  // Parse the second line, split numbers, and take 'countElements' values
  const elementValues = parseNumbersFromString(inputLines[1]).slice(0, countElements);

  // Create a map to store the frequency of each number
  const valueCounts = new Map();

  // Iterate through the input numbers to populate the frequency map
  let iterCompletionStatus = true;
  let iterErrorOccurred = false;
  let currentIterError = undefined;

  try {
    for (
      let valueIterator = elementValues[Symbol.iterator](), iterStep;
      !(iterCompletionStatus = (iterStep = valueIterator.next()).done);
      iterCompletionStatus = true
    ) {
      const currentVal = iterStep.value;
      const existingCount = valueCounts.get(currentVal);

      // If the value already exists in the map, increment its count
      if (existingCount != null) {
        valueCounts.set(currentVal, existingCount + 1);
      } else {
        // Otherwise, add the value with a count of 1
        valueCounts.set(currentVal, 1);
      }
    }
  } catch (err) {
    iterErrorOccurred = true;
    currentIterError = err;
  } finally {
    try {
      if (!iterCompletionStatus && valueIterator["return"] != null) {
        valueIterator["return"]();
      }
    } finally {
      if (iterErrorOccurred) {
        throw currentIterError;
      }
    }
  }

  // Initialize the final result accumulator
  let finalResult = 0;

  /*
  // Original commented-out recursive approach
  while (valueCounts.size > 0) {
      const {value: [initialValue, initialCount]} = valueCounts[Symbol.iterator]().next();
      decrementOrRemove(valueCounts, initialValue, initialCount);
      
      const [leftSideCount, rightSideCount] = recursiveTraversal(initialValue);
      finalResult += Math.min(leftSideCount, rightSideCount);
  }
  function recursiveTraversal(initialValue) {
      let leftSideCount = 1;
      let rightSideCount = 0;
      for (const differenceVal of calculateDifferences(initialValue)) {
          if (decrementOrRemove(valueCounts, differenceVal)) {
              const [ls, rs] = recursiveTraversal(differenceVal);
              leftSideCount += rs;
              rightSideCount += ls;
          }
      }
      return [leftSideCount, rightSideCount];
  }
  */

  // Process elements from the map using an iterative approach until it's empty
  while (valueCounts.size > 0) {
    // Get the first entry from the map (key-value pair)
    const mapIterResult = valueCounts[Symbol.iterator]().next();
    const destructuredMapEntry = _slicedToArray(mapIterResult.value, 2);
    const initialValue = destructuredMapEntry[0];
    const initialCount = destructuredMapEntry[1];

    // Decrement or remove the initial value from the map
    decrementOrRemove(valueCounts, initialValue, initialCount);

    // Initialize a queue for breadth-first traversal (or stack for DFS, as pop is used)
    const processingQueue = [initialValue];
    let leftSideCount = 0;
    let rightSideCount = 0;

    // Process elements in the queue
    while (processingQueue.length > 0) {
      const currentElement = processingQueue.pop(); // Get the last element (acting as a stack for DFS)
      const isNegativeFlag = currentElement < 0; // Check if the current element is negative
      const absValue = Math.abs(currentElement); // Get the absolute value

      // Increment left or right count based on the sign
      leftSideCount += +!isNegativeFlag; // If not negative, add to left
      rightSideCount += +isNegativeFlag; // If negative, add to right

      // Iterate through potential differences for the absolute value
      let innerIterCompletion = true;
      let innerIterErrorFlag = false;
      let innerIterError = undefined;

      try {
        for (
          let diffIterator = calculateDifferences(absValue)[Symbol.iterator](), diffStep;
          !(innerIterCompletion = (diffStep = diffIterator.next()).done);
          innerIterCompletion = true
        ) {
          const differenceVal = diffStep.value;
          // If the difference value exists in the map and can be decremented/removed
          if (decrementOrRemove(valueCounts, differenceVal)) {
            // Add to the queue, preserving the 'side' (negative for right, positive for left)
            processingQueue.push(isNegativeFlag ? differenceVal : -differenceVal);
          }
        }
      } catch (err) {
        innerIterErrorFlag = true;
        innerIterError = err;
      } finally {
        try {
          if (!innerIterCompletion && diffIterator["return"] != null) {
            diffIterator["return"]();
          }
        } finally {
          if (innerIterErrorFlag) {
            throw innerIterError;
          }
        }
      }
    }

    // Add the minimum of left and right counts to the final result
    finalResult += Math.min(leftSideCount, rightSideCount);
  }

  // Output the final calculated result
  console.log(finalResult);
}

// Read input from stdin and pass it to the main processing function
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));

/**
 * Parses a string of space-separated numbers into an array of integers.
 * @param {string} inputLine - The string containing numbers.
 * @returns {number[]} An array of parsed integers.
 */
function parseNumbersFromString(inputLine) {
  return inputLine.split(/\s+/).map(function (parsedNumber) {
    return parseInt(parsedNumber);
  });
}

/**
 * Performs a binary search on a sorted array. (This function is not used in the main logic)
 * @param {number[]} targetArray - The array to search within.
 * @param {number} searchValue - The value to search for.
 * @returns {number|null} The index of the value if found, otherwise null.
 */
function findInSortedArray(targetArray, searchValue) {
  let startIndex = 0;
  let endIndex = targetArray.length;

  while (startIndex < endIndex) {
    const middleIndex = Math.floor((endIndex - startIndex) / 2) + startIndex;
    const middleValue = targetArray[middleIndex];

    if (middleValue === searchValue) {
      return middleIndex;
    }

    if (middleValue < searchValue) {
      startIndex = middleIndex;
    } else {
      endIndex = middleIndex;
    }
  }

  return null;
}

/**
 * Calculates differences between powers of two and the input number.
 * @param {number} inputNumber - The number to calculate differences for.
 * @returns {number[]} An array of positive differences.
 */
function calculateDifferences(inputNumber) {
  const differenceList = [];
  // Iterate through powers of two up to 2 * 10^9
  for (let targetPowerOfTwo = 2; targetPowerOfTwo <= 2 * 1e9; targetPowerOfTwo *= 2) {
    const calculatedDifference = targetPowerOfTwo - inputNumber;
    // Only add positive differences to the list
    if (calculatedDifference > 0) {
      differenceList.push(calculatedDifference);
    }
  }
  return differenceList;
}

/**
 * Decrements the count of an element in a map or removes it if count becomes 0.
 * @param {Map<number, number>} dataMap - The map storing element counts.
 * @param {number} elementKey - The key of the element to decrement/remove.
 * @param {number} [currentCount] - The current count of the element (optional, will fetch from map if not provided).
 * @returns {boolean} True if the element was found and processed, false otherwise.
 */
function decrementOrRemove(dataMap, elementKey, currentCount) {
  // If currentCount is not provided, try to get it from the map
  const actualCount = currentCount !== undefined ? currentCount : dataMap.get(elementKey);
  if (actualCount == null) return false; // Element not found

  // If count is greater than 1, just decrement
  if (actualCount > 1) {
    dataMap.set(elementKey, actualCount - 1);
  } else {
    // If count is 1, remove the element from the map
    dataMap.delete(elementKey);
  }

  return true; // Element was found and processed
}
