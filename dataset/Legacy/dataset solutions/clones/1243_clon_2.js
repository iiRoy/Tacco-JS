'use strict'; // Enable strict mode for better code quality

process.stdin.on('data', function (dataChunk) {
  // This function processes each incoming data chunk from standard input.
  let inputLine = dataChunk.toString().trim(); // Convert the buffer chunk to a string and remove any leading/trailing whitespace.
  const numericParts = inputLine.split(' ').map(Number); // Split the cleaned string by space and convert each resulting part into a number.

  let firstOperand = numericParts[0]; // Assign the first number from the parsed input.
  let secondOperand = numericParts[1]; // Assign the second number from the parsed input.

  // Output the results of three different calculations:
  // 1. Integer division (floor of the quotient).
  // 2. The remainder of the division.
  // 3. Floating-point division, formatted to 5 decimal places.
  console.log(
    Math.floor(firstOperand / secondOperand),
    firstOperand % secondOperand,
    (firstOperand / secondOperand).toFixed(5)
  );
});

// Keep the standard input stream active so it doesn't close automatically.
process.stdin.resume();
// Specify the character encoding for the standard input stream.
process.stdin.setEncoding('utf8');
