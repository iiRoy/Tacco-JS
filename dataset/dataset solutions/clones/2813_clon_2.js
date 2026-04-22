'use strict';
// This script addresses a specific algorithmic problem (e.g., graph construction).
// Date of creation: May 3rd, 2020

function _destructureArray(inputArray, indexLimit) {
  // Helper function to safely destructure an array up to a certain limit.
  return _checkArrayType(inputArray) || _limitIterableToArray(inputArray, indexLimit) || _handleNonArrayIterable(inputArray, indexLimit) || _throwNonIterableError();
}

function _throwNonIterableError() {
  // Throws an exception when an attempt is made to destructure a non-iterable entity.
  throw new TypeError("Failed to destructure non-iterable instance.\nEnsure the object provides an iterator method.");
}

function _handleNonArrayIterable(objectRef, minimumLength) {
  // Provides fallback for non-array iterables.
  if (!objectRef) return;
  if (typeof objectRef === "string") return _convertToArrayLike(objectRef, minimumLength);
  let typeName = Object.prototype.toString.call(objectRef).slice(8, -1);
  if (typeName === "Object" && objectRef.constructor) typeName = objectRef.constructor.name;
  if (typeName === "Map" || typeName === "Set") return Array.from(objectRef);
  if (typeName === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(typeName)) return _convertToArrayLike(objectRef, minimumLength);
}

function _convertToArrayLike(sourceArray, desiredLength) {
  // Converts an array-like structure into a proper array, truncated if necessary.
  if (desiredLength == null || desiredLength > sourceArray.length) desiredLength = sourceArray.length;
  let newArray = new Array(desiredLength);
  for (let currentIdx = 0; currentIdx < desiredLength; currentIdx++) {
    newArray[currentIdx] = sourceArray[currentIdx];
  }
  return newArray;
}

function _limitIterableToArray(sourceIterable, maximumItems) {
  // Attempts to convert an iterable into an array, respecting a maximum item count.
  if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(sourceIterable))) return;
  let collectedItems = [];
  let isDone = true;
  let hadError = false;
  let errorObj = undefined;
  try {
    for (
      let iterableIterator = sourceIterable[Symbol.iterator](), currentIterResult;
      !(isDone = (currentIterResult = iterableIterator.next()).done);
      isDone = true
    ) {
      collectedItems.push(currentIterResult.value);
      if (maximumItems && collectedItems.length === maximumItems) break;
    }
  } catch (caughtError) {
    hadError = true;
    errorObj = caughtError;
  } finally {
    try {
      if (!isDone && iterableIterator["return"] != null) iterableIterator["return"]();
    } finally {
      if (hadError) throw errorObj;
    }
  }
  return collectedItems;
}

function _checkArrayType(inputData) {
  // Simple check to see if the input is a native array.
  if (Array.isArray(inputData)) return inputData;
}

function processInputData(inputLines) {
  // Main processing routine for the given input data.
  const _initialParsedValues = inputLines[0].split(' ').map(Number);
  const _destructuredParsedValues = _destructureArray(_initialParsedValues, 2);

  let totalElements = _destructuredParsedValues[0];
  let targetValue = _destructuredParsedValues[1];

  let currentCount = totalElements;
  let isFeasible; // Flag to indicate if a solution is found.

  // Loop downwards from totalElements to find a suitable configuration.
  for (; currentCount >= 1; currentCount--) {
    const subgroupSize = totalElements - currentCount + 1;

    // Check if the current configuration matches the target value using a specific formula.
    if ((subgroupSize - 1) * (subgroupSize - 2) / 2 + currentCount - 1 === targetValue) {
      isFeasible = true; // A valid configuration was identified.
      break; // Exit the loop as a solution is found.
    }
  }

  // If no feasible configuration was found, output an error.
  if (!isFeasible) {
    console.log("-1");
    return; // Terminate execution.
  }

  // Output the found count and the total elements.
  console.log(`FoundCount=${currentCount}`);
  console.log(totalElements - 1);

  // Generate and output pairs based on the found count.
  for (let loopIndex = 1; loopIndex <= currentCount; loopIndex++) {
    console.log(`${loopIndex} ${loopIndex + 1}`);
  }

  // Generate and output remaining pairs.
  for (let secondLoopIndex = currentCount + 2; secondLoopIndex <= totalElements; secondLoopIndex++) {
    console.log(`${currentCount + 1} ${secondLoopIndex}`);
  }
}

function executeProgram() {
  // Sets up standard input processing to feed data to the main logic.
  let receivedData = "";
  process.stdin.resume(); // Begin reading from standard input.
  process.stdin.setEncoding("utf8"); // Specify character encoding.
  process.stdin.on("data", function (chunk) {
    receivedData += chunk; // Accumulate incoming data chunks.
  });
  process.stdin.on("end", function () {
    // When input stream ends, process the collected data.
    processInputData(receivedData.split("\n"));
  });
}

// Initiate the program execution by setting up input handlers.
executeProgram();