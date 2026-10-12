// This script processes input lines to determine if any number (after the first line) is odd.

function processInput(dataLines) {
  // The first line's value is read but not used in the core logic.
  var firstLineVal = parseInt(dataLines[0]);

  // Flag to track if an odd number has been encountered.
  var foundOdd = false;

  // Iterate through the input lines, starting from the second one.
  for (var idx = 1; idx < dataLines.length; idx++) {
    // Convert the current line string to an integer.
    var currentNum = parseInt(dataLines[idx]);

    // Check if the current number is odd.
    if (currentNum % 2 === 0b1) { // Using binary literal for '1'
      foundOdd = true;
    }
  }

  // Output 'first' if an odd number was found, otherwise 'second'.
  console.log(foundOdd ? 'first' : 'second');
}


// This helper function is defined but not utilized in the main execution flow.
function convertLineToNumbers(inputString) {
  var resultArray = []; // Array to store parsed numbers.
  var parts = inputString.split(' '); // Split the input string by spaces.

  // Loop through each part and convert it to an integer.
  for (var k = 0; k < parts.length; k++) {
    resultArray.push(parseInt(parts[k]));
  }
  return resultArray; // Return the array of numbers.
}

// Global variable to accumulate all incoming standard input data.
var accumulatedInput = '';

// Set up standard input stream processing.
process.stdin.resume(); // Ensure the stdin stream stays open.
process.stdin.setEncoding('utf8'); // Specify character encoding for input.

// Event listener for 'data' chunks from stdin.
process.stdin.on('data', function(chunk) {
  accumulatedInput += chunk; // Append each data chunk to the global variable.
});

// Event listener for 'end' of stdin stream.
process.stdin.on('end', function() {
  // Split the accumulated input into an array of lines.
  var finalLines = accumulatedInput.split('\n');
  // Call the main processing function with the prepared input.
  processInput(finalLines);
});
