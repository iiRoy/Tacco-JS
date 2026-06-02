let rawData = ''; // This variable will accumulate all incoming data from standard input.

// Begin listening for input from the standard input stream.
process.stdin.resume();

// Set the character encoding for the input stream to UTF-8.
process.stdin.setEncoding('utf8');

// Attach an event listener for 'data' events.
// Each time a chunk of data is received, append it to our rawData string.
process.stdin.on('data', function(incomingChunk) {
  rawData += incomingChunk; // Concatenate the new chunk to the existing data.
});

// Attach an event listener for the 'end' event.
// This event fires when there is no more data to be read from stdin.
process.stdin.on('end', function() {
  // Once all data is received, clean it up:
  // 1. Remove leading/trailing whitespace.
  // 2. Split the entire string into an array of lines based on newline characters.
  rawData = rawData.trim().split('\n');
  // Now, invoke the primary processing function.
  processInputData();
});

/**
 * The main function responsible for processing the parsed input data.
 * It iterates through the input lines, checks conditions, and prints results.
 */
function processInputData() {
  // The first line of input is expected to be the number of datasets.
  let numberOfEntries = rawData[0];

  // A quick check to prevent processing excessively large datasets.
  // If the count exceeds 1000, we simply stop execution.
  if (numberOfEntries > 1000) {
    return;
  }

  // Loop through each subsequent line of input, starting from the second line (index 1).
  // Each line represents a set of numbers to be evaluated.
  for (let idx = 1; idx < rawData.length; idx++) {
    // Split the current line by spaces to get individual numeric values.
    let currentLineValues = rawData[idx].split(' ');
    // Sort these values in descending order. This is crucial for the Pythagorean check,
    // as the largest number (hypotenuse) needs to be at index 0.
    currentLineValues.sort(sortDescending);

    // Validate each of the three numbers. They must be between 0 and 1000 (inclusive).
    // If any number is out of this range, terminate the program.
    if (0 > currentLineValues[0] || currentLineValues[0] > 1000) {
      return;
    }
    if (0 > currentLineValues[1] || currentLineValues[1] > 1000) {
      return;
    }
    if (0 > currentLineValues[2] || currentLineValues[2] > 1000) {
      return;
    }

    // Apply the Pythagorean theorem: a^2 + b^2 = c^2.
    // Since the array is sorted descending, currentLineValues[0] is 'c' (the hypotenuse).
    // We compare c^2 with the sum of a^2 and b^2.
    if (Math.pow(currentLineValues[0], 2) === Math.pow(currentLineValues[1], 2) + Math.pow(currentLineValues[2], 2)) {
      console.log('YES'); // If the theorem holds, print 'YES'.
    } else {
      console.log('NO'); // Otherwise, print 'NO'.
    }
  }
}

/**
 * A comparison function used for sorting numbers in descending order.
 * @param {number} valA - The first value for comparison.
 * @param {number} valB - The second value for comparison.
 * @returns {number} A negative value if valB should come before valA,
 *                   a positive value if valA should come before valB,
 *                   or zero if their order doesn't matter.
 */
function sortDescending(valA, valB) {
  return valB - valA; // This ensures descending order (largest first).
}
