'use strict'; // Ensure strict mode for better code quality and error detection.

process.stdin.on(
  'data',
  function (inputSegment) { // Define an event handler for incoming data chunks.

    // Convert the received data buffer into a string, then remove any leading or trailing whitespace.
    var rawInputString = inputSegment.toString().trim();

    // Parse the cleaned string: split it by spaces and convert each resulting part into an integer.
    var numericalValues = rawInputString.split(' ').map(parseInt);

    // Extract the three distinct numerical parameters from the parsed array.
    var lowerBound = numericalValues[0];
    var upperBound = numericalValues[1];
    var targetNumber = numericalValues[2];

    // Initialize a counter to track how many times the condition is met.
    var divisorCount = 0;

    // Iterate through each integer from the lower bound up to and including the upper bound.
    for (var currentDivisor = lowerBound; currentDivisor <= upperBound; currentDivisor++) {
      // Check if the target number is perfectly divisible by the current iterator value.
      if (targetNumber % currentDivisor === 0) {
        // If it is, increment the counter.
        divisorCount++;
      }
    }
    // Print the final accumulated count of divisors to the console output.
    console.log(divisorCount);

  }
);

// Keep the standard input stream alive to continue listening for data.
process.stdin.resume();

// Set the character encoding for the standard input stream to UTF-8.
process.stdin.setEncoding('utf8');