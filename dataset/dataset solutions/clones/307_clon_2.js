(function () {
  // This variable will accumulate all incoming standard input data.
  let rawData = '';

  /**
   * Performs the primary calculation logic after all input has been received.
   * It parses two numbers from the accumulated input and performs a specific
   * arithmetic operation using a predefined conversion constant.
   */
  function executeCalculation() {
    let firstValue, secondValue, parsedNumbers;
    // Define a constant for area conversion (e.g., tsubo to square meters, or similar).
    const conversionFactor = 3.305785;

    // Split the raw input string by space to get the two numeric parts.
    parsedNumbers = rawData.split(' ');
    // Convert the first part to an integer.
    firstValue = parseInt(parsedNumbers[0], 10);
    // Convert the second part to an integer.
    secondValue = parseInt(parsedNumbers[1], 10);

    // Calculate the result: (firstValue * secondValue) / conversionFactor
    // And print it to the console.
    console.log(firstValue * secondValue / conversionFactor);
  }

  // Ensure the standard input stream remains open to receive data.
  process.stdin.resume();
  // Set the encoding for the incoming data to UTF-8.
  process.stdin.setEncoding('utf8');

  // Attach an event listener for 'data' events on the standard input.
  // Each time a chunk of data is received, append it to the rawData string.
  process.stdin.on('data', function (dataSegment) {
    rawData += dataSegment;
  });

  // Attach an event listener for the 'end' event on the standard input.
  // This signifies that all input has been received.
  process.stdin.on('end', function () {
    // Although split('\n') is called here, its return value is not used.
    // The original logic relies on rawData containing the space-separated numbers.
    rawData.split('\n');
    // Now that all input is gathered, execute the main calculation.
    executeCalculation();
  });
}());
