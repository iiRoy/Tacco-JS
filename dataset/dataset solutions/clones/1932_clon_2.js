const handleInputSequence = (inputLines) => {
  // This section extracts and converts the initial configuration values.
  let [totalElements, operationCount] = inputLines[0].split(' ').map(numStr => +numStr);

  // The logic diverges based on the parity of the first numerical input.
  if (totalElements % 2 === 1) { // If totalElements is an odd value
    let rightPointer = totalElements - 1; // Set the upper bound for the pair generation.
    let leftPointer = 1; // Establish the lower bound.

    // Iterate to generate the required number of output pairs.
    while (operationCount) {
      console.log(`${leftPointer++} ${rightPointer--}`); // Output the current pair and adjust pointers.
      operationCount--; // Decrement the remaining operation count.
    }
  }
  else { // If totalElements is an even value
    let rightPointer = totalElements / 2 + 1; // Initialize the right-side iterator.
    let leftPointer = totalElements / 2; // Initialize the left-side iterator.

    // Continue pairing until the operation counter reaches zero.
    while (operationCount > 0) {
      console.log(`${leftPointer--} ${rightPointer++}`); // Print the mirrored pair and update iterators.
      operationCount--; // Reduce the number of pending operations.
    }
  }
}; // End of the main sequence handler.


// This variable will accumulate all incoming standard input data.
let receivedData = '';

// Register an event listener to append data chunks from standard input.
process
  .stdin
  .on('data', chunkPiece => {
    receivedData += chunkPiece; // Concatenate the incoming data chunk.
  });

// Register an event listener for when all standard input has been received.
process
  .stdin
  .on('end', () => {
    const { EOL: lineSeparator } = require('os'); // Dynamically retrieve the system's end-of-line character.
    // Split the entire accumulated input string into an array of individual lines.
    const inputLines = receivedData.split(lineSeparator);
    // Invoke the primary function to process the parsed input lines.
    handleInputSequence(inputLines);
  });