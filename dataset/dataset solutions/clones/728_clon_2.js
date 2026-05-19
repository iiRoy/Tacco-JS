#!/usr/bin/node
// This JavaScript module processes numerical input from the standard input stream.
// It calculates and outputs a specific value for each set of input numbers.

(function() {
  // Declare variables to hold incoming data lines and the input stream object.
  var inputLines = [],
    inputSource;

  // Obtain a reference to the standard input stream.
  inputSource = process.openStdin();
  // Configure the input stream to interpret data as UTF-8 encoded text.
  inputSource.setEncoding('utf8');

  // Register an event handler for when data chunks are received from stdin.
  inputSource.on('data', function(receivedData) {
    // Split the raw input string into an array of strings, using newline as a delimiter.
    var processedLines = receivedData.split("\n");

    // Determine how to store the processed lines:
    // If there are more than two lines, or if the second line is not empty,
    // replace the entire collection of input lines with the new set.
    if (processedLines.length > 2 || processedLines[1] !== '') {
      inputLines = processedLines;
    }
    // Otherwise, append only the first processed line to the existing collection.
    else {
      inputLines.push(processedLines[0]);
    }
  });

  // Register an event handler for when the standard input stream has ended.
  inputSource.on('end', function(unusedParam) {
    // Declare various local variables that will be used during the data processing.
    var currentNumbers, elementStr, loopIndex, secondVal, numIterations, resultModifier, firstVal,
      // These variables are remnants from CoffeeScript compilation and are not actively used in the logic.
      outerLoopCounter, iterationResults;

    // Extract the first line from the collected input, parse it as an integer,
    // and use it to determine the total number of processing iterations.
    numIterations = parseInt(inputLines.shift());

    // Initialize an array to potentially store results from each iteration (though not used in this specific script).
    iterationResults = [];

    // Begin the main processing loop. The structure reflects the original CoffeeScript loop.
    for (loopIndex = outerLoopCounter = 0; outerLoopCounter < numIterations; loopIndex = ++outerLoopCounter) {
      // This immediately invoked function expression (IIFE) processes the current line of input.
      currentNumbers = (function() {
        var innerLoopCounter, refLength, splitElements, parsedNumbers;
        // Split the current line from the inputLines array by spaces to get string elements.
        splitElements = inputLines[loopIndex].split(" ");
        parsedNumbers = []; // Prepare an array to store the integer versions of these elements.

        // Iterate through each string element obtained from splitting the line.
        for (innerLoopCounter = 0, refLength = splitElements.length; innerLoopCounter < refLength; innerLoopCounter++) {
          elementStr = splitElements[innerLoopCounter]; // Get the current string element.
          parsedNumbers.push(parseInt(elementStr)); // Convert the string to an integer and add it to the array.
        }
        return parsedNumbers; // Return the array containing all parsed integers for the current line.
      })();

      // Adjust the first two numbers obtained from the current line by subtracting one.
      firstVal = currentNumbers[0] - 1;
      secondVal = currentNumbers[1] - 1;

      // Initialize a variable that may modify the final calculation result.
      resultModifier = 0;

      // Apply a specific modification if 'firstVal' modulo 3 is not equal to 2.
      if (firstVal % 3 !== 2) {
        resultModifier = Math.floor(secondVal / 2);
      }

      // Perform a complex calculation using the processed numbers and print the final result to the console.
      console.log(196471 - firstVal * 195 - Math.floor(firstVal / 3) * 5 - secondVal * 20 + resultModifier - currentNumbers[2]);
    }
  });
}).call(this);
