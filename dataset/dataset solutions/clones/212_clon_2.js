(function () {
  // This variable will accumulate all incoming data from standard input.
  var rawData = '';

  /**
   * The primary function to process the collected input.
   * It iterates through lines, parses numbers, and calculates trailing zeros.
   */
  function processInputData () {
    var dataLength, // Stores the effective length of the input array for looping.
        idx,        // Loop counter for iterating through input lines.
        currentNum, // The integer parsed from the current input line.
        trailingZerosCount; // Result of the trailing zero calculation.

    // Loop through each line of the input, excluding the last one if it's empty.
    // The original code uses `input.length - 1` as the upper bound,
    // which effectively ignores the last element if it's an empty string
    // resulting from a trailing newline.
    for (idx = 0, dataLength = rawData.length - 1; idx < dataLength; idx += 1) {
      // Convert the current line string to an integer.
      currentNum = parseInt(rawData[idx], 10);

      // If the parsed number is zero, it signifies the end of valid input.
      if (currentNum === 0) {
        break; // Exit the loop.
      } else {
        // Otherwise, calculate the number of trailing zeros for the factorial.
        trailingZerosCount = calculateTrailingZeros(currentNum);
        // Output the calculated count to the console.
        console.log(trailingZerosCount);
      }
    }
  }

  /**
   * Calculates the number of trailing zeros in the factorial of a given number.
   * This is determined by the number of factors of 5 in its prime factorization.
   *
   * @param {number} factorialBase The base number for which to calculate factorial trailing zeros.
   * @returns {number} The total count of trailing zeros.
   */
  function calculateTrailingZeros (factorialBase) {
    var divisor,    // Loop variable, initially the factorialBase, then divided by 5.
        totalZeros = 0; // Accumulator for the count of zeros.

    // Continuously divide the number by 5 and add the floor of the result to totalZeros.
    // This accounts for factors of 5, 25, 125, etc.
    for (divisor = factorialBase; divisor / 5 !== 0; divisor /= 5) {
      totalZeros += Math.floor(divisor / 5);
    }

    return totalZeros; // Return the final count.
  }

  // Set up standard input handling for Node.js environment.
  process.stdin.resume(); // Keep the process alive.
  process.stdin.setEncoding('utf8'); // Specify character encoding for input.

  // Event listener for when data chunks are received.
  process.stdin.on('data', function (chunk) {
    rawData += chunk; // Append the received chunk to the rawData string.
  });

  // Event listener for when the standard input stream ends.
  process.stdin.on('end', function () {
    // Split the accumulated rawData into an array of strings by newline characters.
    rawData = rawData.split('\n');
    // Once all input is received and processed into an array, call the main processing function.
    processInputData();
  });
}());
