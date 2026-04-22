"use strict"; // Enforce strict parsing and error handling

// Module acquisition and input processing
var fileContent = require("fs").readFileSync("/std/input", "textEncoding");
var inputTokens = fileContent.split(/ |\n/);
var tokenIndex = 0;

// Helper function to get the next number from the input stream
function getNextNumber() {
  return +inputTokens[tokenIndex++];
}

// Helper function to get the next string from the input stream
function getNextString() {
  return inputTokens[tokenIndex++];
}

// Helper function to get the next BigInt from the input stream
function getNextBigInteger() {
  return BigInt(inputTokens[tokenIndex++]);
}

// Helper to retrieve a sequence of tokens
// If `convertToNumber` is true, map them to numbers
function getSequence(count, convertToNumber) {
  if (convertToNumber) {
    return inputTokens.slice(tokenIndex, (tokenIndex += count));
  } else {
    return inputTokens.slice(tokenIndex, (tokenIndex += count)).map((value) => +value);
  }
}

// Helper to retrieve a matrix of tokens
// If `parseNumbers` is true, map inner arrays to numbers
function getMatrix(rows, cols, parseNumbers) {
  var resultArray = [];
  var rowIndex = 0;
  if (parseNumbers) {
    for (; rowIndex < rows; rowIndex++) {
      resultArray.push(inputTokens.slice(tokenIndex, (tokenIndex += cols)));
    }
  } else {
    for (; rowIndex < rows; rowIndex++) {
      resultArray.push(inputTokens.slice(tokenIndex, (tokenIndex += cols)).map((val) => +val));
    }
  }
  return resultArray;
}

// Function to create a multi-dimensional array dynamically
function createMultiDimArray(initialValue) {
  var dimensions = arguments;
  var dimLength = dimensions.length;
  var arrayCreationString = "Array(dimensions[" + --dimLength + "]).fill().map(x=>{return " + initialValue + ";})";
  while (--dimLength) {
    arrayCreationString = "Array(dimensions[" + dimLength + "]).fill().map(x=>" + arrayCreationString + ")";
  }
  return eval(arrayCreationString);
}

// Execute the main program logic
var programOutput = executeProgram();

// If the program produced output, print it to console
if (programOutput !== undefined) {
  console.log(String(programOutput));
}

// Main program function
function executeProgram() {
  var totalElements = getNextNumber(); // Read N
  // Initialize a dynamic programming table with a very small number, and an additional counter
  var dynamicProgrammingTable = createMultiDimArray(-1e9, totalElements + 1, totalElements + 1);
  var additionalCount = 0;

  // Read initial two elements, sort them, and initialize the DP table
  var currentElements = getSequence(2).sort((valA, valB) => valA - valB);
  var updateQueue; // Declare update queue for later use

  dynamicProgrammingTable[0][0] = dynamicProgrammingTable[0][currentElements[0]] = dynamicProgrammingTable[0][currentElements[1]] = dynamicProgrammingTable[currentElements[0]][currentElements[1]] = 0;

  // Process N-1 iterations for subsequent triplets
  for (var iterationCounter = 1; iterationCounter < totalElements; iterationCounter++) {
    currentElements = getSequence(3).sort((valA, valB) => valA - valB); // Read three elements and sort them
    processTriplet(...currentElements); // Process the current triplet
  }

  // Read the final element
  currentElements = getNextNumber();

  // Calculate and return the final result
  return Math.max(dynamicProgrammingTable[0][0], dynamicProgrammingTable[currentElements][currentElements] + 1) + additionalCount;

  // Inner function to process a triplet of values (u, v, w)
  function processTriplet(firstVal, secondVal, thirdVal) {
    // If first and third values are equal, increment counter and return
    if (firstVal === thirdVal) {
      return additionalCount++;
    }
    updateQueue = []; // Initialize an empty queue for updates

    // Call handlers for various configurations of values
    handleSingleValue(firstVal);
    if (firstVal < secondVal) {
      handleSingleValue(secondVal);
    }
    if (secondVal < thirdVal) {
      handleSingleValue(thirdVal);
    }

    handleTwoValues(firstVal, secondVal);
    if (secondVal < thirdVal) {
      handleTwoValues(firstVal, thirdVal);
    }
    if (firstVal < secondVal) {
      handleTwoValues(secondVal, thirdVal);
    }

    handleThreeValues(firstVal, secondVal, thirdVal);

    // Apply updates from the queue to the DP table
    while (updateQueue.length) {
      var colIndex = updateQueue.pop(); // Pop elements in reverse order (z, y, x)
      var rowIndex = updateQueue.pop();
      var newValue = updateQueue.pop();
      if (dynamicProgrammingTable[rowIndex][colIndex] < newValue) {
        dynamicProgrammingTable[rowIndex][colIndex] = newValue;
      }
    }
  }

  // Inner function to handle operations related to a single value
  function handleSingleValue(targetValue) {
    compareAndIncrementUpdate(0, 0, targetValue, targetValue);
    for (var loopIndex = 0; loopIndex < targetValue; loopIndex++) {
      compareAndUpdate(loopIndex, targetValue, 0, loopIndex);
    }
    for (var loopIndex = targetValue; loopIndex <= totalElements; loopIndex++) {
      compareAndUpdate(targetValue, loopIndex, 0, loopIndex);
    }
  }

  // Inner function to handle operations related to two values
  function handleTwoValues(valOne, valTwo) {
    compareAndUpdate(valOne, valTwo, 0, 0);
    compareAndIncrementUpdate(0, valTwo, valOne, valOne);
    if (valOne < valTwo) {
      compareAndIncrementUpdate(0, valOne, valTwo, valTwo);
    } else {
      // Case where valOne equals valTwo
      for (var idx = 0; idx < valOne; idx++) {
        compareAndIncrementUpdate(0, idx, idx, valOne);
      }
      for (var idx = valOne; idx <= totalElements; idx++) {
        compareAndIncrementUpdate(0, idx, valOne, idx);
      }
    }
  }

  // Inner function to handle operations related to three values
  function handleThreeValues(paramA, paramB, paramC) {
    compareAndIncrementUpdate(paramB, paramC, paramA, paramA);
    if (paramA < paramB) {
      compareAndIncrementUpdate(paramA, paramC, paramB, paramB);
      if (paramB < paramC) {
        compareAndIncrementUpdate(paramA, paramB, paramC, paramC);
      } else {
        // Case where paramB equals paramC
        for (var iter = 0; iter < paramA; iter++) {
          compareAndIncrementUpdate(iter, paramA, iter, paramC);
        }
        for (var iter = paramA; iter < paramC; iter++) {
          compareAndIncrementUpdate(paramA, iter, iter, paramC);
        }
        for (var iter = paramC; iter <= totalElements; iter++) {
          compareAndIncrementUpdate(paramA, iter, paramC, iter);
        }
      }
    } else {
      // Case where paramA equals paramB
      compareAndIncrementUpdate(paramA, paramA, paramC, paramC);
      for (var iter = 0; iter < paramA; iter++) {
        compareAndIncrementUpdate(iter, paramC, iter, paramA);
      }
      for (var iter = paramA; iter < paramC; iter++) {
        compareAndIncrementUpdate(iter, paramC, paramA, iter);
      }
      for (var iter = paramC; iter <= totalElements; iter++) {
        compareAndIncrementUpdate(paramC, iter, paramA, iter);
      }
    }
  }

  // Utility function: If dp[idx1][idx2] is less than dp[idx3][idx4], push update to queue
  function compareAndUpdate(idx1, idx2, idx3, idx4) {
    if (dynamicProgrammingTable[idx1][idx2] < dynamicProgrammingTable[idx3][idx4]) {
      updateQueue.push(dynamicProgrammingTable[idx3][idx4], idx2, idx1);
    }
  }

  // Utility function: If dp[idx1][idx2] is less than dp[idx3][idx4] + 1, push update to queue
  function compareAndIncrementUpdate(idx1, idx2, idx3, idx4) {
    if (dynamicProgrammingTable[idx1][idx2] < dynamicProgrammingTable[idx3][idx4] + 1) {
      updateQueue.push(dynamicProgrammingTable[idx3][idx4] + 1, idx2, idx1);
    }
  }
}