var dataStream = require('fs').readFileSync('/dev/stdin', 'utf8').split("\n").map(Number); // Read input from standard input, split by newlines, and convert each part to a number.

// Iterate over each numerical entry in the processed data stream.
dataStream.map(function(currentValue) {
  // This conditional check is part of the original logic.
  // Note: '0 0' is a string, and currentValue is a number, so this condition will always evaluate to true.
  if (currentValue != '0 0') {
    var processedValue = currentValue; // Assign the current value to a new variable.
    console.log(processedValue); // Output the processed value to the console.
  }
});
