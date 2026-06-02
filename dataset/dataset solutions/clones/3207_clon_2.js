var inputData = [];

var maxIterations = 0;
var factorA = 0;
var factorB = 0;
var currentValue = 1; // Initial value for the calculation

// Import the standard Node.js 'readline' module for input processing.
var inputReader = require('readline');
var inputHandler = inputReader.createInterface({
  input:  process.stdin, // Read from standard input stream.
  output: process.stdout // Output to standard output stream (not used for prompts here).
});

// Event listener for each line of input received.
inputHandler.on('line', function(currentLine) {
  inputData.push(currentLine); // Store the received line in our array.
});

// Event listener for when the input stream is closed.
inputHandler.on('close', function() {
  // Parse the first line of input to extract numerical parameters.
  var firstLineParts = inputData[0].split(" ");
  maxIterations = Number(firstLineParts[0]);
  factorA = Number(firstLineParts[1]);
  factorB = Number(firstLineParts[2]);

  // Main processing loop.
  for (var loopCounter = 1; loopCounter <= maxIterations; loopCounter++) {
    // Check various conditions to determine the next step in the calculation.
    if (Math.abs(factorA - factorB) === 1 || factorA > factorB || currentValue < factorA || loopCounter === maxIterations) {
      currentValue++; // Increment the value if any of the conditions are met.
    } else {
      // Perform a more complex calculation if none of the above conditions are true.
      // This calculation effectively multiplies currentValue by (factorB / factorA)
      // while preserving the remainder from division by factorA.
      currentValue = (currentValue - (currentValue % factorA)) / factorA * factorB + (currentValue % factorA);
      loopCounter = loopCounter + 1; // Increment the loop counter an additional time.
    }
  }

  // Output the final calculated value to the console.
  console.log(currentValue);
});
