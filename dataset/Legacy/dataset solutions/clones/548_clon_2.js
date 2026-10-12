function processData() {
  // Declare and initialize variables for the data processing logic.
  let
    idx, // Loop counter for iterating through data entries.
    valA, valB, // Variables to hold the two numeric values from each line.
    currentLineParts, // Temporary array to store parsed numbers from a single line.
    numEntries = parseInt(input[0], 10), // The total count of data lines to process, parsed from the first input line.
    dataLines = input.slice(1), // An array containing all the actual data lines, excluding the initial count.
    sumA = 0, // Accumulator for the first category of sums.
    sumB = 0; // Accumulator for the second category of sums.

  // Iterate through each of the data entries as specified by numEntries.
  for (idx = 0; idx < numEntries; idx++) {
    // Take the current data line, split it by space, and convert each part to a floating-point number.
    currentLineParts = dataLines[idx].split(' ').map(parseFloat);

    // Assign the first parsed number to valA and the second to valB.
    valA = currentLineParts[0];
    valB = currentLineParts[1];

    // Apply conditional logic based on the comparison of valA and valB.
    if (valA > valB) {
      // If valA is strictly greater than valB, add their sum to sumA.
      sumA += valA + valB;
    } else if (valA < valB) {
      // If valA is strictly less than valB, add their sum to sumB.
      sumB += valA + valB;
    } else {
      // If valA and valB are equal, add valA to sumA and valB to sumB.
      // (Since they are equal, this is equivalent to adding valA * 2 to sumA and valB * 2 to sumB if both were updated,
      // but the original logic adds valA to sumA and valB to sumB separately.)
      sumA += valA;
      sumB += valB;
    }
  }

  // Output the final accumulated sums, formatted as two decimal integers.
  console.log("%d %d", sumA, sumB);
}

// A global string variable to accumulate all incoming standard input data.
let
  input = '';

// Begin listening for standard input.
process.stdin.resume();
// Specify the character encoding for the incoming data stream.
process.stdin.setEncoding('utf8');

// Attach an event listener for when data chunks are received from stdin.
process.stdin.on('data', function(chunkOfData) {
  // Append each received data chunk to the global input string.
  input += chunkOfData;
});

// Attach an event listener for when the standard input stream has ended.
process.stdin.on('end', function() {
  // Once all input is received, split the accumulated string into an array of lines.
  input = input.split('\n');
  // Invoke the primary data processing function.
  processData();
});
