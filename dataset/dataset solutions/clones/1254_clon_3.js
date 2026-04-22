let incomingDataBuffer = ''; // Accumulates data chunks received from standard input.

// Activate the standard input stream and specify the character encoding.
process.stdin.resume();
process.stdin.setEncoding('utf-8');

// Attach an event listener to capture each incoming data fragment.
process.stdin.on('data', function(dataFragment) {
  incomingDataBuffer += dataFragment; // Concatenate the new fragment to the buffer.
});

// Once the entire standard input stream has concluded, execute the main processing routine.
process.stdin.on('end', function() {
  // Delegate the accumulated input to a dedicated processing function.
  executeNumericAnalysis(incomingDataBuffer);
});

/**
 * Processes the raw input string to extract, validate, and analyze numeric data.
 * This function is responsible for parsing the input, calculating statistics, and outputting results.
 * @param {string} fullInputString The complete string content received from stdin.
 */
function executeNumericAnalysis(fullInputString) {
  // Normalize the input: trim whitespace and split into an array of lines.
  // Filter out any empty lines that might result from extra newlines.
  const parsedInputLines = fullInputString.trim().split('\n').filter(lineSegment => lineSegment.trim().length > 0);

  // Implement a guard clause to ensure sufficient input lines are present.
  if (parsedInputLines.length < 2) {
    console.error("ERR: Insufficient input lines. Expected at least two lines of data.");
    process.exit(1); // Terminate the process with an error code.
  }

  // The second line (index 1) is expected to contain space-separated numerical values.
  const rawNumberSequenceString = parsedInputLines[1];

  // Split the raw string by spaces, then filter out any empty string tokens
  // that could arise from multiple spaces between numbers or leading/trailing spaces.
  const stringRepresentations = rawNumberSequenceString.split(' ').filter(token => token !== '');

  // Another guard clause: check if any potential numeric tokens were found.
  if (stringRepresentations.length === 0) {
    console.error("ERR: No potential numeric tokens found on the second input line.");
    process.exit(1);
  }

  // Transform string representations into actual number types.
  const potentiallyInvalidNumbers = stringRepresentations.map(strValue => Number(strValue));

  // Filter out any values that failed to convert to a valid number (i.e., are NaN).
  const validatedNumbers = potentiallyInvalidNumbers.filter(numValue => !isNaN(numValue));

  // Final validation: ensure there are actual valid numbers to perform calculations on.
  if (validatedNumbers.length === 0) {
    console.error("ERR: No valid numbers could be successfully parsed from the input.");
    process.exit(1);
  }

  // Utilize ES6 spread syntax to efficiently find the minimum value.
  const calculatedMinimum = Math.min(...validatedNumbers);

  // Utilize ES6 spread syntax to efficiently find the maximum value.
  const calculatedMaximum = Math.max(...validatedNumbers);

  // Compute the sum of all validated numbers using the Array.prototype.reduce method.
  const totalAccumulatedSum = validatedNumbers.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

  // Output the computed statistics using a template literal for clear string interpolation.
  console.log(`${calculatedMinimum} ${calculatedMaximum} ${totalAccumulatedSum}`);
}