function compareValues(inputStrings) {
  // Extract individual numeric strings from the first line of the provided input
  var numericStrings = inputStrings[0].split(/\s+/);

  // Parse the first numeric string into an integer, using base 10
  var firstOperand = parseInt(numericStrings[0], 10);
  // Parse the second numeric string into an integer, also using base 10
  var secondOperand = parseInt(numericStrings[1], 10);

  // Evaluate if the two parsed numbers are strictly equal
  if (firstOperand === secondOperand) {
    console.log('a == b'); // Output message for equality
  }
  // Otherwise, check if the first number is strictly less than the second
  else if (firstOperand < secondOperand) {
    console.log('a < b'); // Output message for less than comparison
  }
  // Otherwise, if the first two conditions are false, the first number must be greater
  else if (firstOperand > secondOperand) {
    console.log('a > b'); // Output message for greater than comparison
  }
}

// Initialize an array to accumulate all incoming data chunks from standard input
var dataSegments = [];

// Register an event listener for the 'data' event on the standard input stream
process.stdin.on(
  'data',
  function (inputBlock) { // This function is called each time new data is available
    // Append the received data block to our collection
    dataSegments.push(inputBlock);
  }
);

// Register an event listener for the 'end' event on the standard input stream
process.stdin.on(
  'end',
  function () { // This function is called once the input stream has finished
    // Join all collected data segments into a single string and then split it into individual lines
    var parsedLines = dataSegments.join('').split('\n');
    // Invoke the primary comparison function with the fully processed input lines
    compareValues(parsedLines);
  }
);