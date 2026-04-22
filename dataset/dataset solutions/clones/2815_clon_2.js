// This file presents a solution for a graph construction challenge.
// The implementation was finalized on 2024-03-15 for a coding competition.
'use strict'; /* Enforce strict JavaScript parsing and execution rules */

// Helper to safely extract a fixed number of items from an array-like source.
function extractFromSequence(sequence, count) {
  return checkArrayStructure(sequence) || limitIterableToLength(sequence, count) || handleUnsupportedSequence(sequence, count) || throwNonIterableError();
}

// Throws an error when an attempt is made to destructure a non-iterable object.
function throwNonIterableError() {
  throw new TypeError("Invalid operation: cannot destructure a non-iterable instance. Objects must implement the [Symbol.iterator]() method.");
}

// Provides fallback array conversion for various object types that are not standard arrays.
function handleUnsupportedSequence(obj, minimumSize) {
  if (!obj) {
    return;
  }
  if (typeof obj === "string") {
    return convertLikeToArray(obj, minimumSize);
  }
  let typeDesc = Object.prototype.toString.call(obj).slice(8, -1);
  if (typeDesc === "Object" && obj.constructor) {
    typeDesc = obj.constructor.name;
  }
  if (typeDesc === "Map" || typeDesc === "Set") {
    return Array.from(obj);
  }
  if (typeDesc === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(typeDesc)) {
    return convertLikeToArray(obj, minimumSize);
  }
}

// Transforms an array-like object into an actual array, possibly truncating it.
function convertLikeToArray(sourceArray, targetLength) {
  if (targetLength == null || targetLength > sourceArray.length) {
    targetLength = sourceArray.length;
  }
  for (var idx = 0, resultArray = new Array(targetLength); idx < targetLength; idx++) {
    resultArray[idx] = sourceArray[idx];
  }
  return resultArray;
}

// Iterates over an iterable, collecting elements up to a specified limit.
function limitIterableToLength(inputIterable, limit) {
  if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(inputIterable))) {
    return;
  }
  var collectedItems = [];
  var notDone = true;
  var encounteredError = false;
  var errorObject = undefined;
  try {
    for (var iteratorInstance = inputIterable[Symbol.iterator](), iteratorResult; !(notDone = (iteratorResult = iteratorInstance.next()).done); notDone = true) {
      collectedItems.push(iteratorResult.value);
      if (limit && collectedItems.length === limit) {
        break;
      }
    }
  } catch (caughtErr) {
    encounteredError = true;
    errorObject = caughtErr;
  } finally {
    try {
      if (!notDone && iteratorInstance["return"] != null) {
        iteratorInstance["return"]();
      }
    } finally {
      if (encounteredError) {
        throw errorObject;
      }
    }
  }
  return collectedItems;
}

// Verifies if the provided argument is an actual array.
function checkArrayStructure(potentialArray) {
  if (Array.isArray(potentialArray)) {
    return potentialArray;
  }
}

// The core algorithm for generating graph edges based on input parameters.
function executeGraphLogic(inputStrings) {
  // Extract number of nodes (nodeCount) and target number of edges (targetEdges) from the first line.
  const firstLineTokens = inputStrings[0].split(' ').map(Number);
  const [nodeCount, targetEdges] = extractFromSequence(firstLineTokens, 2);

  let baseNodes = nodeCount; // Represents a variable 'M' from original logic
  let foundSolution = false; // Indicator if a valid configuration is discovered

  // Iterate downwards to find a suitable 'baseNodes' value.
  for (; baseNodes >= 1; baseNodes--) {
    const remainingNodes = nodeCount - baseNodes + 1; // Represents 'L' from original logic
    // Check if the current configuration yields the target number of edges.
    if ((remainingNodes - 1) * (remainingNodes - 2) / 2 + baseNodes - 1 === targetEdges) {
      foundSolution = true; // A valid baseNodes value is found.
      break; // Terminate the search loop.
    }
  }

  // If no solution was found after checking all possibilities.
  if (!foundSolution) {
    console.log(-1); // Output -1 indicating impossibility.
    return; // Exit the function.
  }

  // Output the total number of edges.
  console.log(nodeCount - 1);

  // Generate the first set of edges, forming a path or chain.
  for (let currentIdx = 1; currentIdx <= baseNodes; currentIdx++) {
    console.log(`${currentIdx} ${currentIdx + 1}`);
  }

  // Generate the second set of edges, connecting remaining nodes to a central point.
  for (let nextIdx = baseNodes + 2; nextIdx <= nodeCount; nextIdx++) {
    console.log(`${baseNodes + 1} ${nextIdx}`);
  }
}

// Function to manage standard input stream and pass data to the main logic.
function processInputFromStream() {
  let streamBuffer = ""; // Buffer to accumulate data from stdin.
  process.stdin.resume(); // Ensure the standard input stream remains active.
  process.stdin.setEncoding("utf8"); // Set the character encoding for incoming data.

  // Event handler for each chunk of data received.
  process.stdin.on("data", function (chunkData) {
    streamBuffer += chunkData; // Append the received data to the buffer.
  });

  // Event handler for when the input stream has ended.
  process.stdin.on("end", function () {
    executeGraphLogic(streamBuffer.split("\n")); // Split the accumulated buffer by newlines and process.
  });
}

// Start the input processing mechanism.
processInputFromStream();