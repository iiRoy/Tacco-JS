var firstCount, secondCount; // Declare primary counters
var listA = [], listB = []; // Initialize dynamic arrays for data storage

function locateValue(targetVal) { // Function to find a specific value within a sorted array
  var lowIdx = 0, highIdx = secondCount; // Initialize search boundaries
  while (highIdx - lowIdx > 1) { // Binary search loop
    var midIdx = (lowIdx + highIdx) >> 1; // Calculate middle index efficiently
    // Check if the element at midIdx is less than or equal to the target
    if (listB[midIdx] <= targetVal) {
      lowIdx = midIdx; // Move lower bound
    } else {
      highIdx = midIdx; // Move upper bound
    }
  }
  // Return true if the value at lowIdx matches the target, false otherwise
  return listB[lowIdx] === targetVal;
}

function executePrimaryProcess() { // Main execution logic for the program
  // Loop as long as there's valid input for the first counter
  while (firstCount = readInput()) {
    secondCount = readInput(); // Read the second counter value

    // Populate listA with elements based on firstCount
    iterateRange(firstCount, function(currentIdx) {
      listA[currentIdx] = readInput();
    });
    // Populate listB with elements based on secondCount
    iterateRange(secondCount, function(currentIdx) {
      listB[currentIdx] = readInput();
    });

    // Sort both arrays in ascending order
    listA.sort(function(firstEl, secondEl) {
      return firstEl - secondEl;
    });
    listB.sort(function(firstEl, secondEl) {
      return firstEl - secondEl;
    });

    var sumA = 0; // Accumulator for elements in listA
    // Calculate the sum of all elements in listA
    iterateRange(firstCount, function(currentIdx) {
      sumA += listA[currentIdx];
    });
    var sumB = 0; // Accumulator for elements in listB
    // Calculate the sum of all elements in listB
    iterateRange(secondCount, function(currentIdx) {
      sumB += listB[currentIdx];
    });

    // Calculate the required difference, divided by two
    var differenceHalf = Math.trunc((sumB - sumA) / 2);
    // If the total difference is not perfectly divisible by 2, no solution
    if ((sumB - sumA) !== (2 * differenceHalf)) {
      outputResult(-1); // Indicate no solution
    } else {
      var foundSolution = false; // Flag to track if a solution is found
      // Iterate through listA to find a matching pair
      iterateRange(firstCount, function(currentIdx) {
        // Check if a value exists in listB that matches the current element + difference
        if (locateValue(listA[currentIdx] + differenceHalf)) {
          outputResult(listA[currentIdx] + ' ' + (listA[currentIdx] + differenceHalf));
          foundSolution = true; // Mark as found
          return false; // Stop iteration
        }
      });
      // If no solution was found after checking all elements
      if (!foundSolution) {
        outputResult(-1); // Indicate no solution
      }
    }

    // Reset arrays for the next iteration of input
    listA = [];
    listB = [];
  }
}

function iterateRange(startVal, endVal, callbackFn) { // Generic iteration function
  // Handle overloaded function signature for simpler iteration
  if (callbackFn === undefined) {
    callbackFn = endVal;
    endVal = startVal;
    startVal = 0;
  }
  // Loop from startVal up to (but not including) endVal
  for (var loopIndex = startVal; loopIndex < endVal; ++loopIndex) {
    // If the callback returns false, break the loop
    if (callbackFn(loopIndex) === false) {
      break;
    }
  }
}

var rawDataBuffer = ''; // Buffer to accumulate raw input data

function readInput() { // Function to parse and return a number from input
  return +rawDataBuffer.pop();
}
function readStringInput() { // Function to return a string from input
  return rawDataBuffer.pop();
}
function outputResult(valueToDisplay) { // Function to display output
  console.log(valueToDisplay);
}

process.stdin.resume(); // Keep the process alive to receive input
process.stdin.setEncoding('utf8'); // Set input encoding to UTF-8
process.stdin.on('data', function(inputChunk) { // Event listener for incoming data
  rawDataBuffer += inputChunk; // Append new data to the buffer
});
process.stdin.on('end', function() { // Event listener for end of input
  // Process the accumulated raw data: trim, split by whitespace, and reverse
  rawDataBuffer = rawDataBuffer.trim().split(/\s+/).reverse();
  executePrimaryProcess(); // Start the main processing logic
});