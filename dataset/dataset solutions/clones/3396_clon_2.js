"use strict";

// Helper function to extract array elements
function _destructureArrayElements(sourceArray, limitCount) {
  return _extractArrayItems(sourceArray) || _convertIterableToLimitedArray(sourceArray, limitCount) || _handleNonIterableRemainder();
}

// Helper function for non-iterable destructuring
function _handleNonIterableRemainder() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

// Helper to convert an iterable to a limited array with a specific maximum size
function _convertIterableToLimitedArray(sourceArray, limitCount) {
  var tempArray = [];
  var isNormal = true;
  var isErrored = false;
  var errorObject = undefined;
  try {
    for (var iteratorRef = sourceArray[Symbol.iterator](), iteratorResult; !(isNormal = (iteratorResult = iteratorRef.next()).done); isNormal = true) {
      tempArray.push(iteratorResult.value);
      if (limitCount && tempArray.length === limitCount) break;
    }
  } catch (err) {
    isErrored = true;
    errorObject = err;
  } finally {
    try {
      if (!isNormal && iteratorRef["return"] != null) iteratorRef["return"]();
    } finally {
      if (isErrored) throw errorObject;
    }
  }
  return tempArray;
}

// Helper to check if an array is a standard array type
function _extractArrayItems(sourceArray) {
  if (Array.isArray(sourceArray)) return sourceArray;
}


function processInputData(rawDataString) {
  // Split the raw input string into separate lines
  var inputLines = rawDataString.split('\n');

  // Parse the first line to get the total number of elements
  var elementCount = parseInt(inputLines[0]);

  // Process the second line, split numbers, and take the first 'elementCount' elements
  var numericSequence = parseNumbersFromString(inputLines[1]).slice(0, elementCount);

  // Create a frequency map to store counts of numbers
  var frequencyMap = new Map();
  var iteratorStatusOk = true;
  var iteratorHadError = false;
  var currentIteratorError = undefined;

  try {
    // Iterate over each number in the sequence to populate the frequency map
    for (var sequenceIterator = numericSequence[Symbol.iterator](), currentStep; !(iteratorStatusOk = (currentStep = sequenceIterator.next()).done); iteratorStatusOk = true) {
      var currentValue = currentStep.value;
      var existingCount = frequencyMap.get(currentValue);

      // Increment count if number exists, otherwise set to 1
      if (existingCount != null) {
        frequencyMap.set(currentValue, existingCount + 1);
      } else {
        frequencyMap.set(currentValue, 1);
      }
    }
  } catch (err) {
    iteratorHadError = true;
    currentIteratorError = err;
  } finally {
    try {
      // Ensure iterator is properly closed if it didn't complete normally
      if (!iteratorStatusOk && sequenceIterator.return != null) {
        sequenceIterator.return();
      }
    } finally {
      // Re-throw any errors that occurred during iteration
      if (iteratorHadError) {
        throw currentIteratorError;
      }
    }
  }

  var finalOutcome = 0;
  /*
  // This section contains a commented-out alternative recursive approach.
  // It was likely an earlier implementation strategy that was later replaced
  // by the iterative BFS-like approach below.
  // The original idea involved recursively exploring paths from a starting number.
  //
  // while (frequencyMap.size > 0) {
  //     const {value: [init, num]} = frequencyMap[Symbol.iterator]().next();
  //     decrementOrRemove(frequencyMap, init, num);
  //
  //     const [leftCount, rightCount] = rec(init);
  //     finalOutcome += Math.min(leftCount, rightCount);
  // }
  // function rec(init) {
  //     let leftNum = 1;
  //     let rightNum = 0;
  //     for (const d of calculateDifferences(init)) {
  //         if (decrementOrRemove(frequencyMap, d)) {
  //             const [ls, rs] = rec(d);
  //             leftNum += rs;
  //             rightNum += ls;
  //         }
  //     }
  //     return [leftNum, rightNum];
  // }
  */

  // Process elements as long as the frequency map is not empty
  while (frequencyMap.size > 0) {
    // Extract the first key-value pair from the map using its iterator
    var mapIteratorResult = frequencyMap[Symbol.iterator]().next(),
        destructuredPair = _destructureArrayElements(mapIteratorResult.value, 2),
        initialKey = destructuredPair[0],
        initialCount = destructuredPair[1];

    // Decrement or remove the initial key from the map
    decrementOrRemove(frequencyMap, initialKey, initialCount);
    var processingQueue = [initialKey]; // Initialize a queue for traversal
    var leftBranchCount = 0, // Counter for elements associated with the 'left' path
        rightBranchCount = 0; // Counter for elements associated with the 'right' path

    // Process elements in the queue until it's empty
    while (processingQueue.length > 0) {
      var currentElement = processingQueue.pop(); // Retrieve the next element from the queue
      var isNegativeBranch = currentElement < 0; // Determine if the element indicates a 'right' (negative) branch
      var absoluteValue = Math.abs(currentElement); // Use the absolute value for calculations

      // Increment the appropriate branch counter based on 'isNegativeBranch'
      leftBranchCount += +!isNegativeBranch; // Adds 1 if not negative, 0 otherwise
      rightBranchCount += +isNegativeBranch; // Adds 1 if negative, 0 otherwise

      var innerIteratorStatusOk = true;
      var innerIteratorHadError = false;
      var innerIteratorErrorObject = undefined;

      try {
        // Iterate through all calculated differences for the current absolute value
        for (var differenceIterator = calculateDifferences(absoluteValue)[Symbol.iterator](), innerStep; !(innerIteratorStatusOk = (innerStep = differenceIterator.next()).done); innerIteratorStatusOk = true) {
          var differenceValue = innerStep.value;

          // If the difference value exists in the map and can be decremented/removed
          if (decrementOrRemove(frequencyMap, differenceValue)) {
            // Add the difference to the queue, negating it if it originated from a negative branch
            processingQueue.push(isNegativeBranch ? differenceValue : -differenceValue);
          }
        }
      } catch (err) {
        innerIteratorHadError = true;
        innerIteratorErrorObject = err;
      } finally {
        try {
          // Ensure the inner iterator is closed properly
          if (!innerIteratorStatusOk && differenceIterator.return != null) {
            differenceIterator.return();
          }
        } finally {
          // Re-throw any errors encountered during inner iteration
          if (innerIteratorHadError) {
            throw innerIteratorErrorObject;
          }
        }
      }
    }

    // Add the minimum of the two branch counts to the total final outcome
    finalOutcome += Math.min(leftBranchCount, rightBranchCount);
  }

  // Output the final calculated result to the console
  console.log(finalOutcome);
}

// Execute the main processing function, reading input from stdin
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));

// Function to parse space-separated numbers from a string
function parseNumbersFromString(inputLine) {
  return inputLine.split(/\s+/).map(function (parsedNumber) {
    return parseInt(parsedNumber);
  });
}

// Function to find a value in a sorted array using binary search
// This utility function is defined but not utilized in the current main logic.
function findValueInSortedArray(sortedArray, searchValue) {
  var startIndex = 0,
      endIndex = sortedArray.length;

  while (startIndex < endIndex) {
    var middleIndex = Math.floor((endIndex - startIndex) / 2) + startIndex;
    var middleValue = sortedArray[middleIndex];

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

// Function to calculate differences based on powers of two
function calculateDifferences(inputNumber) {
  var resultDifferences = [];

  // Iterate through powers of 2 up to 2 * 10^9
  for (var targetPower = 2; targetPower <= 2 * 1e9; targetPower *= 2) {
    var calculatedDifference = targetPower - inputNumber;

    // If the difference is positive, add it to the results list
    if (calculatedDifference > 0) {
      resultDifferences.push(calculatedDifference);
    }
  }

  return resultDifferences;
}

// Function to decrement the count of a key in a map or remove it if count reaches 0 or 1
function decrementOrRemove(targetMap, targetKey) {
  // Get the current count for the key, or use a provided count if available
  var currentCount = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : targetMap.get(targetKey);
  // If no count is found or it's invalid, indicate failure
  if (currentCount == null) return false;

  // If the count is greater than 1, simply decrement it
  if (currentCount > 1) {
    targetMap.set(targetKey, currentCount - 1);
  } else {
    // Otherwise, remove the key entirely from the map
    targetMap.delete(targetKey);
  }

  return true; // Indicate that the operation was successful
}