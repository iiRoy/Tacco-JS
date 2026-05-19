process.stdin.resume(); // Start reading from standard input
process.stdin.setEncoding('utf8'); // Set the encoding for incoming data

let incomingStream = ''; // Initialize a variable to accumulate all input data

// Event listener for 'data' chunks from standard input
process.stdin.on('data', chunkOfData => {
  incomingStream += chunkOfData; // Append each data chunk to the accumulated stream
});

// Event listener for the 'end' of standard input
process.stdin.on('end', noEventArg => {
  // Process the accumulated input:
  // 1. Remove any trailing whitespace characters.
  // 2. Split the string into an array of substrings using space as a delimiter.
  incomingStream = incomingStream.replace(/\s*$/g, '').split(' ');

  // Execute the primary logic function after input processing.
  performCalculation();
});

/**
 * This function performs the core calculation on the processed input data.
 * It multiplies all numbers in the input array and prints the result.
 */
function performCalculation() {
  // Use the reduce method to multiply all elements in the incomingStream array.
  // The initial accumulatorValue will be the first element, and currentElement will be the second, and so on.
  let finalProduct = incomingStream.reduce((accumulatorValue, currentElement) => accumulatorValue * currentElement);

  // Write the final calculated product to standard output, converting it to a string first.
  process.stdout.write(finalProduct.toString());
}
