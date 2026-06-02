function ProcessInput(rawData) {
  // Split the raw input string into individual lines.
  var lines = rawData.split('\n');

  // The first line contains the count of elements as a string.
  var totalItemsCountStr = lines[0];

  // The second line contains space-separated numbers, which we'll parse.
  var numericValues = lines[1].split(' ');

  // Initialize a counter for specific patterns.
  var peakValleyCounter = 0;

  // Convert all string elements in the array to integers.
  for (var idx = 0; idx < numericValues.length; idx++) {
    numericValues[idx] = parseInt(numericValues[idx], 10); // Base 10 for safety
  }

  // Iterate through the array, skipping the first and last elements.
  // The loop condition `idx < (totalItemsCountStr - 1)` implicitly converts
  // totalItemsCountStr to a number.
  for (var idx = 1; idx < (totalItemsCountStr - 1); idx++) {
    // Check if the current element is a "peak" (greater than neighbors).
    if ((numericValues[idx] > numericValues[idx - 1]) && (numericValues[idx] < numericValues[idx + 1])) {
      peakValleyCounter++; // Increment if it's a peak.
    }
    // Otherwise, check if the current element is a "valley" (smaller than neighbors).
    else if ((numericValues[idx] < numericValues[idx - 1]) && (numericValues[idx] > numericValues[idx + 1])) {
      peakValleyCounter++; // Increment if it's a valley.
    }
  }

  // Output the final count to the console.
  console.log(peakValleyCounter);
}

// Read input from standard input and pass it to the processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
