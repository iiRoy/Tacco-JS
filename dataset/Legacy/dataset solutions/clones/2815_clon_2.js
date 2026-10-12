'use strict'; // Enforce strict mode for better error handling and cleaner code.

// Helper function to safely destructure an array-like object.
function _destructureArray(sourceArr, limitCount) {
  // Attempt to use various array-like conversion methods in order of preference.
  return _checkIfArray(sourceArr) ||
         _limitIterableConversion(sourceArr, limitCount) ||
         _convertNonArrayToArr(sourceArr, limitCount) ||
         _throwNonIterableError();
}

// Throws an error if an object is not iterable and cannot be destructured.
function _throwNonIterableError() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

// Converts an unsupported iterable or array-like object into an array.
function _convertNonArrayToArr(inputObj, minimumLength) {
  if (!inputObj) return; // If input is null or undefined, return early.
  if (typeof inputObj === "string") return _createArrayFromLike(inputObj, minimumLength); // Handle strings.

  // Determine the type name of the object.
  var typeName = Object.prototype.toString.call(inputObj).slice(8, -1);
  if (typeName === "Object" && inputObj.constructor) typeName = inputObj.constructor.name;

  // Handle specific built-in types that can be converted to arrays.
  if (typeName === "Map" || typeName === "Set") return Array.from(inputObj);
  // Handle typed arrays and arguments object.
  if (typeName === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(typeName)) return _createArrayFromLike(inputObj, minimumLength);
}

// Creates a new array from an array-like object up to a specified length.
function _createArrayFromLike(sourceArr, targetLength) {
  // If targetLength is not provided or exceeds sourceArr's length, use sourceArr's length.
  if (targetLength == null || targetLength > sourceArr.length) targetLength = sourceArr.length;
  // Initialize a new array and copy elements.
  for (var idx = 0, resultArr = new Array(targetLength); idx < targetLength; idx++) {
    resultArr[idx] = sourceArr[idx];
  }
  return resultArr;
}

// Converts an iterable object to an array, limiting the number of elements.
function _limitIterableConversion(sourceArr, limitCount) {
  // Check if Symbol.iterator is defined for the object.
  if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(sourceArr))) return;

  var tempArr = []; // Temporary array to store elements.
  var notDone = true; // Flag to control iteration.
  var hadError = false; // Flag to track if an error occurred during iteration.
  var caughtError = undefined; // Stores any caught error.

  try {
    // Get the iterator for the source array.
    for (var iterator = sourceArr[Symbol.iterator](), iteratorResult; !(notDone = (iteratorResult = iterator.next()).done); notDone = true) {
      tempArr.push(iteratorResult.value); // Add current value to temp array.
      if (limitCount && tempArr.length === limitCount) break; // Stop if limit is reached.
    }
  } catch (exception) {
    hadError = true; // Mark that an error occurred.
    caughtError = exception; // Store the exception.
  } finally {
    try {
      // Ensure the iterator's return method is called if it exists and iteration wasn't complete.
      if (!notDone && iterator["return"] != null) iterator["return"]();
    } finally {
      if (hadError) throw caughtError; // Re-throw the original error if one occurred.
    }
  }
  return tempArr; // Return the partially converted array.
}

// Checks if the given argument is an actual array.
function _checkIfArray(sourceArr) {
  if (Array.isArray(sourceArr)) return sourceArr; // If it's an array, return it directly.
}

// Main function to solve the problem based on input data.
function solveProblem(inputDataRows) {
  // Parse the first line of input to get totalVertices (N) and desiredEdges (K).
  var _firstRowValues = inputDataRows[0].split(' ').map(Number),
      _destructuredInput = _destructureArray(_firstRowValues, 2),
      totalVertices = _destructuredInput[0],
      desiredEdges = _destructuredInput[1];

  var currentChainLength = totalVertices; // Initialize M with N.
  var foundSolution; // Flag to indicate if a valid M is found.

  // Iterate downwards from N to 1 to find the optimal M.
  for (; currentChainLength >= 1; currentChainLength--) {
    // Calculate L based on current M.
    var remainingVertices = totalVertices - currentChainLength + 1;

    // Check if the current M satisfies the condition for K.
    if ((remainingVertices - 1) * (remainingVertices - 2) / 2 + currentChainLength - 1 === desiredEdges) {
      foundSolution = true; // A solution is found.
      break; // Exit the loop.
    }
  }

  // If no valid M was found, output -1 and terminate.
  if (!foundSolution) {
    console.log(-1);
    return;
  }

  // Optional: Debugging output for M.
  // console.log(`M=${currentChainLength}`);

  // Output the number of edges in the first part of the graph (N-1).
  console.log(totalVertices - 1);

  // Output edges for the "chain" part of the graph.
  for (var vertexA = 1; vertexA <= currentChainLength; vertexA++) {
    console.log(`${vertexA} ${vertexA + 1}`);
  }

  // Output edges for the "star" part of the graph, connecting to M+1.
  for (var vertexB = currentChainLength + 2; vertexB <= totalVertices; vertexB++) {
    console.log(`${currentChainLength + 1} ${vertexB}`);
  }
}

// Function to handle standard input and pass it to the main solver.
function startExecution() {
  var fullInputString = ""; // Accumulator for all input data.
  process.stdin.resume(); // Keep the process alive for input.
  process.stdin.setEncoding("utf8"); // Set input encoding to UTF-8.

  // Event listener for incoming data chunks.
  process.stdin.on("data", function (dataChunk) {
    fullInputString += dataChunk; // Append data to the input string.
  });

  // Event listener for the end of input stream.
  process.stdin.on("end", function () {
    // Split the accumulated input by newline and pass to the solver.
    solveProblem(fullInputString.split("\n"));
  });
}

// Initiate the program execution by setting up stdin handling.
startExecution();
