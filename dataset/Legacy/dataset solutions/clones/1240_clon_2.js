// This script processes numerical input from standard input to determine
// how many integers within a specified range are divisors of a given number.

process.stdin.resume(); // Ensures the standard input stream remains active.
process.stdin.setEncoding('utf8'); // Configures the input stream to use UTF-8 encoding.

// Attaches an event listener to the standard input stream for 'data' events.
// This function executes whenever a chunk of data is received.
process.stdin.on('data', (inputDataBuffer) => {
  // Converts the incoming data buffer to a string, splits it by spaces,
  // and then transforms each resulting string segment into a number.
  let numericalParameters = inputDataBuffer.toString().split(' ').map(Number);

  // Extracts the three required numerical values from the parsed input array.
  let lowerBound = numericalParameters[0]; // The starting point of the range (inclusive).
  let upperBound = numericalParameters[1]; // The ending point of the range (inclusive).
  let targetDivisor = numericalParameters[2]; // The number whose divisors are being counted.

  let successfulDivisions = 0; // Initializes a counter for numbers that divide 'targetDivisor'.

  // Iterates through each integer from 'lowerBound' up to 'upperBound', inclusive.
  for (let currentIterationValue = lowerBound; currentIterationValue <= upperBound; currentIterationValue++) {
    // Checks if 'targetDivisor' is perfectly divisible by the 'currentIterationValue'.
    // A remainder of 0 indicates perfect divisibility.
    if (targetDivisor % currentIterationValue === 0) {
      successfulDivisions++; // Increments the counter if a divisor is found.
    }
  }

  // Outputs the final tally of successful divisions to the console.
  console.log(successfulDivisions);
});
