// This script processes numerical data from standard input.
function ProcessData(rawData) {
  // The raw input string is broken down into an array of lines.
  let linesArray = rawData.split('\n');

  // The first line provides the upper limit for our numerical range.
  const upperBound = parseInt(linesArray[0], 10);
  // The second line specifies the required count of non-zero digits.
  const targetNonZeroDigits = parseInt(linesArray[1], 10);

  // Initialize a variable to accumulate the final tally.
  let finalTally = 0;

  // Iterate through numbers starting from one up to the defined upper bound.
  for (let currentNumber = 1; currentNumber <= upperBound; currentNumber++) {
    // Convert the current number into a string, then split it into individual digit characters.
    let numberDigits = ('' + currentNumber).split('');

    // A temporary counter for non-zero digits within the current number.
    let nonZeroDigitCounter = 0;

    // Examine each character representing a digit in the current number.
    for (let digitIndex = 0; digitIndex < numberDigits.length; digitIndex++) {
      // Convert the digit character back into its numerical value.
      let currentDigitValue = parseInt(numberDigits[digitIndex], 10);

      // If the digit is not zero, increment our non-zero digit counter.
      if (currentDigitValue !== 0) {
        nonZeroDigitCounter++;
      }
    }

    // If the count of non-zero digits matches our target, increment the main tally.
    if (nonZeroDigitCounter === targetNonZeroDigits) {
      finalTally++;
    }
  }

  // Output the computed total count to the console.
  console.log(finalTally);
}

// The following line handles reading from standard input and invoking the main processing function.
// It should not be modified as it's part of the execution environment.
ProcessData(require('fs').readFileSync('/dev/stdin', 'utf8'));
