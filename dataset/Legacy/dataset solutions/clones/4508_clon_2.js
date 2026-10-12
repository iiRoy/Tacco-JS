"use strict";

var processInput = function processInput(rawData) {
  // Split the raw input string into an array of lines
  var lines = rawData.split('\n');

  // Parse the first line to get the total number of elements
  var numElements = parseInt(lines[0], 10);

  // Initialize an empty array to store the integer data
  var dataArray = [];

  // Populate the data array from the subsequent lines
  for (var idx = 1; idx <= numElements; idx++) {
    dataArray.push(parseInt(lines[idx], 10));
  }

  // Start the traversal from the first element of the data array
  var currentValue = dataArray[0];

  // A boolean flag to indicate if the target value (2) is found
  var foundTwo = false;

  // Counter for the number of steps taken during traversal
  var stepCounter = 0;

  // Iterate up to the maximum number of elements to prevent infinite loops
  for (var loopIndex = 0; loopIndex < numElements; loopIndex++) {
    stepCounter++; // Increment the step counter

    // Check if the current value is the target (2)
    if (currentValue == 2) {
      foundTwo = true; // Set the flag to true
      break; // Exit the loop if the target is found
    }

    // Move to the next element based on the current value
    currentValue = dataArray[currentValue - 1];
  }

  // Output the result based on whether the target was found
  if (foundTwo) {
    console.log(stepCounter); // Print the number of steps
  } else {
    console.log(-1); // Print -1 if the target was not found
  }
};

// Read input from standard input and pass it to the processing function
processInput(require('fs').readFileSync('/dev/stdin', 'utf-8'));
