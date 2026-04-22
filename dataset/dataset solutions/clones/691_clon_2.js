// This section initializes an array to store precomputed cubic values.
var cubicValues = [];

// Populate the array with cubes of numbers from 0 up to 1111.
for ( var iterator = 0; iterator <= 1111; iterator++ ) {
  cubicValues[iterator] = Math.pow(iterator, 3);
}

// Read the entire input file from standard input as a UTF-8 string.
var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input: remove leading/trailing whitespace and split into lines.
var inputLines = fileContent.trim().split("\n");

// Main processing loop: continues until a specific termination condition is met.
while (true) {
  // Extract the next number from the input lines and convert it to a numeric type.
  var currentNumber = inputLines.shift() - 0;

  // Check for the termination condition: if the number is zero, break the loop.
  if (currentNumber === 0) {
    break;
  }

  // Initialize the smallest residual difference to a very large value.
  var smallestResidual = Infinity;

  // Outer loop to iterate through possible first terms, starting from one less than the current number.
  for ( var firstTermIndex = currentNumber - 1; firstTermIndex > 0; firstTermIndex-- ) {
    // Inner loop to iterate through possible second terms, starting from the current outer loop index.
    for ( var secondTermIndex = firstTermIndex; secondTermIndex > 0; secondTermIndex-- ) {
      // Calculate the difference between the cube of the current number and the cubes of the two terms.
      var calculatedDiff = cubicValues[currentNumber] - cubicValues[firstTermIndex] - cubicValues[secondTermIndex];

      // If the calculated difference is positive and smaller than the current smallest residual, update it.
      if (calculatedDiff > 0 && smallestResidual > calculatedDiff) {
        smallestResidual = calculatedDiff;
      }
    }
  }

  // Output the determined smallest residual difference for the current input number.
  console.log(smallestResidual);
}