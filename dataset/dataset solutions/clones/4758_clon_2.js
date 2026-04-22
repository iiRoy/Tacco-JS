process.stdin.resume();
process.stdin.setEncoding('utf8');

// This section handles incoming data from the standard input stream.
process.stdin.on('data', function (inputBlock) {
  let receivedLines = inputBlock.toString().split('\n');

  const totalIterations = parseInt(receivedLines[0]);
  let sequenceString = receivedLines[1];

  let currentLevel = 0; // Tracks the present value during traversal.
  let peakLevel = 0;    // Stores the highest value achieved.

  for (let idx = 0; idx < totalIterations; idx++) { // Iterate through each character of the sequence.
    if (sequenceString.charAt(idx) === "I") {
      currentLevel++; // Increment the current level.
      if (currentLevel > peakLevel) {
        peakLevel = currentLevel; // Update the maximum level if the current one is higher.
      }
    } else { // Assuming the character is 'D' for decrement.
      currentLevel--; // Decrement the current level.
    }
  }

  console.log(peakLevel); // Output the final peak level.
});