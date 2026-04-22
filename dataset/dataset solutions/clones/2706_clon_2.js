'use strict';

// This utility function helps in destructuring an array-like object into a fixed number of elements.
function _partitionInputArray(sourceArray, chunkSize) {
  return (
    _checkArrayValidity(sourceArray) || // Check if it's a direct array
    _limitIterableConversion(sourceArray, chunkSize) || // Try converting iterable to array with a limit
    _handleNonArrayConversion(sourceArray, chunkSize) || // Handle non-array, non-iterable cases
    _throwNonIterableError() // If all else fails, throw an error
  );
}

// Throws an error when an attempt to destructure a non-iterable instance occurs.
function _throwNonIterableError() {
  throw new TypeError(
    "Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
  );
}

// Converts various types of objects (like strings, Maps, Sets, TypedArrays) into an array.
function _handleNonArrayConversion(inputObject, minimumLength) {
  if (!inputObject) return; // If the object is null or undefined, return early.

  if (typeof inputObject === "string")
    return _convertStringToArray(inputObject, minimumLength); // Handle strings specifically.

  // Determine the type name of the object.
  var objectTypeName = Object.prototype.toString.call(inputObject).slice(8, -1);

  if (objectTypeName === "Object" && inputObject.constructor)
    objectTypeName = inputObject.constructor.name; // Use constructor name if available for plain objects.

  if (objectTypeName === "Map" || objectTypeName === "Set")
    return Array.from(inputObject); // Convert Maps and Sets directly.

  // Handle various TypedArrays.
  if (
    objectTypeName === "Arguments" ||
    /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(objectTypeName)
  )
    return _convertStringToArray(inputObject, minimumLength);

  // If no specific handling, return undefined.
}

// Helper for converting array-like structures (including strings) to a new array.
function _convertStringToArray(sourceCollection, desiredLength) {
  // Adjust the desired length if it's not provided or exceeds the collection's actual length.
  if (desiredLength == null || desiredLength > sourceCollection.length)
    desiredLength = sourceCollection.length;

  // Create a new array and populate it.
  for (var idx = 0, resultCollection = new Array(desiredLength); idx < desiredLength; idx++) {
    resultCollection[idx] = sourceCollection[idx];
  }
  return resultCollection;
}

// Attempts to convert an iterable object into an array, limiting the number of elements.
function _limitIterableConversion(sourceArray, chunkSize) {
  // Check if Symbol.iterator exists and the object is iterable.
  if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(sourceArray))) return;

  var collectedElements = []; // Stores elements from the iterable.
  var isNotDone = true; // Flag for iteration status.
  var encounteredError = false; // Flag to track if an error occurred during iteration.
  var errorObject = undefined; // Stores the error object if an error occurs.

  try {
    // Get the iterator instance.
    for (
      var iteratorInstance = sourceArray[Symbol.iterator](), iterationResult;
      !(isNotDone = (iterationResult = iteratorInstance.next()).done);
      isNotDone = true
    ) {
      collectedElements.push(iterationResult.value); // Add the current value to the collection.
      if (chunkSize && collectedElements.length === chunkSize) break; // Stop if chunk limit is reached.
    }
  } catch (err) {
    encounteredError = true; // Mark error state.
    errorObject = err; // Store the error.
  } finally {
    try {
      // If iteration was not done and a 'return' method exists on the iterator, call it.
      if (!isNotDone && iteratorInstance["return"] != null) iteratorInstance["return"]();
    } finally {
      if (encounteredError) throw errorObject; // Re-throw the error if one occurred.
    }
  }
  return collectedElements; // Return the collected elements.
}

// Checks if the given argument is a native JavaScript Array.
function _checkArrayValidity(sourceArray) {
  if (Array.isArray(sourceArray)) return sourceArray; // If it's an array, return it directly.
}

// The primary function to process input lines and calculate a specific modulus.
function processInputLines(inputContent) {
  // Destructure the first line from the input content.
  var _parsedLines = _partitionInputArray(inputContent, 1),
    targetString = _parsedLines[0]; // The string to be processed.

  // Initialize a 2D array (memoization table) for dynamic programming.
  // The size is based on a maximum string length (10^5) + 1, and 13 possible remainders.
  var memoizationGrid = new Array(Math.pow(10, 5) + 1)
    .fill(null) // Fill with null first, then map
    .map(function () {
      return new Array(13).fill(undefined); // Each inner array represents remainders 0-12.
    });

  /**
   * Recursive function to compute the number of ways to achieve a target remainder.
   * @param {number} currentPosition - The current digit position being processed (from right to left).
   * @param {number} targetRemainder - The desired remainder when the number formed by digits up to currentPosition is divided by 13.
   * @returns {number} The count of ways to achieve the target remainder.
   */
  function calculateModulus(currentPosition, targetRemainder) {
    // Base case: If no digits are left and the target remainder is 0, it's one valid way.
    if (currentPosition === 0 && targetRemainder === 0) return 1;
    // Base case: If no digits are left but the target remainder is not 0, it's not a valid way.
    if (currentPosition === 0) return 0;

    // Check if the result for this state is already memoized.
    var cachedValue = memoizationGrid[currentPosition][targetRemainder];
    if (cachedValue !== undefined) return cachedValue;

    var currentCharacter = targetString[currentPosition - 1]; // Get the digit character at the current position.

    // If the current character is a wildcard '?'.
    if (currentCharacter === "?") {
      // Iterate through all possible digits (0-9) for the wildcard.
      return (memoizationGrid[currentPosition][targetRemainder] = new Array(10)
        .fill(null)
        .reduce(function (accumulator, _dummy, currentDigitValue) {
          // For each possible digit, find previous remainders that would lead to the targetRemainder.
          var partialSum = new Array(13)
            .fill(null)
            .map(function (_, index) {
              return index;
            }) // Create an array [0, 1, ..., 12]
            .filter(function (previousRemainder) {
              // Filter for remainders that, when combined with currentDigitValue, yield targetRemainder.
              return (previousRemainder * 10 + currentDigitValue) % 13 === targetRemainder;
            })
            .reduce(function (innerAccumulator, previousRemainder) {
              // Recursively call for the previous state and sum up the results.
              return calculateModulus(currentPosition - 1, previousRemainder) + innerAccumulator;
            }, 0);
          return partialSum + accumulator; // Add the partial sum for this digit to the total accumulator.
        }, 0) % // Take modulus by (10^9 + 7) to prevent overflow.
        (Math.pow(10, 9) + 7));
    }

    // If the current character is a specific digit.
    var numericValue = Number(currentCharacter); // Convert the character to its numeric value.

    // Calculate for a specific digit.
    return (memoizationGrid[currentPosition][targetRemainder] = new Array(13)
      .fill(null)
      .map(function (_, index) {
        return index;
      }) // Create an array [0, 1, ..., 12]
      .filter(function (previousRemainder) {
        // Filter for remainders that, when combined with numericValue, yield targetRemainder.
        return (previousRemainder * 10 + numericValue) % 13 === targetRemainder;
      })
      .reduce(function (innerAccumulator, previousRemainder) {
        // Recursively call for the previous state and sum up the results.
        return calculateModulus(currentPosition - 1, previousRemainder) + innerAccumulator;
      }, 0) % // Take modulus by (10^9 + 7) to prevent overflow.
      (Math.pow(10, 9) + 7));
  }

  // Finally, log the result of calculating the modulus for the entire string and a target remainder of 5.
  console.log(calculateModulus(targetString.length, 5));
}

// Sets up standard input processing to run the main logic.
function executeWithStandardInput() {
  var receivedInput = ""; // Buffer to store all incoming data.
  process.stdin.resume(); // Ensure stdin is open.
  process.stdin.setEncoding("utf8"); // Set encoding for input.
  process.stdin.on("data", function (chunkData) {
    receivedInput += chunkData; // Append incoming data chunks.
  });
  process.stdin.on("end", function () {
    // When input ends, split by newlines and pass to the main processing function.
    processInputLines(receivedInput.split("\n"));
  });
}

// Initiate the process of reading from standard input and executing the program.
executeWithStandardInput();