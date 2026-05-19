#!/usr/bin/node
// This script processes numerical input from standard input.
// It calculates a specific value based on the input lines provided.
(function() {
  // Declare variables for storing accumulated input lines and the standard input stream object.
  let inputLines = [];
  let inputReader;

  // Obtain a readable stream for standard input.
  inputReader = process.openStdin();
  // Configure the input stream to decode incoming data as UTF-8 strings.
  inputReader.setEncoding('utf8');

  // Register an event handler for the 'data' event, which fires when input data is available.
  inputReader.on('data', function(chunkData) {
    // Split the received data chunk into an array of strings based on newline characters.
    let processedLines = chunkData.split("\n");
    // This conditional logic determines how input lines are stored.
    // If the split chunk contains more than two elements, or if the second element is not an empty string,
    // it implies multiple meaningful lines or a non-empty second line, so replace the entire buffer.
    if (processedLines.length > 2 || processedLines[1] !== '') {
      inputLines = processedLines;
    } else {
      // Otherwise, if it's a single line or a line followed by an empty string (e.g., due to a trailing newline),
      // just append the first meaningful line to the existing buffer.
      inputLines.push(processedLines[0]);
    }
  });

  // Register an event handler for the 'end' event, which fires when the input stream has concluded.
  inputReader.on('end', function(endEventArg) {
    // Declare variables to be used within the processing loop.
    let currentLineNumbers, testCaseIndex, numberIndex, secondVal, numTestCases, remainderCalc, firstVal;

    // The first line of the accumulated input is expected to be the total number of test cases.
    // Remove it from the array and parse it into an integer.
    numTestCases = parseInt(inputLines.shift());

    // Iterate through each test case based on the parsed number of test cases.
    for (testCaseIndex = 0; testCaseIndex < numTestCases; testCaseIndex++) {
      // For the current test case line, split it by spaces to get individual number strings.
      currentLineNumbers = inputLines[testCaseIndex].split(" ");
      // Convert each string element in the array to its integer representation.
      for (numberIndex = 0; numberIndex < currentLineNumbers.length; numberIndex++) {
        currentLineNumbers[numberIndex] = parseInt(currentLineNumbers[numberIndex]);
      }

      // Extract and adjust the first two numbers from the current line by subtracting one.
      firstVal = currentLineNumbers[0] - 1;
      secondVal = currentLineNumbers[1] - 1;
      // Initialize a variable that will hold a conditionally calculated value.
      remainderCalc = 0;

      // Check a specific condition based on the adjusted first value.
      if (firstVal % 3 !== 2) {
        // If the condition is met, calculate 'remainderCalc' by dividing 'secondVal' by 2 and taking the floor.
        remainderCalc = Math.floor(secondVal / 2);
      }

      // Perform a complex calculation using the adjusted values and the third number from the input line,
      // then print the final result to the standard output.
      console.log(196471 - firstVal * 195 - Math.floor(firstVal / 3) * 5 - secondVal * 20 + remainderCalc - currentLineNumbers[2]);
    }
  });
}).call(this); // Execute the Immediately Invoked Function Expression (IIFE) to encapsulate the script's scope.
