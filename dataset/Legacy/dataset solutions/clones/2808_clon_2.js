// This script processes input lines to perform a specific calculation.
function processInput(rawData) {
  // Split the raw input string into an array of individual lines.
  const inputLines = rawData.split('\n');

  // Iterate over each line received from the input.
  inputLines.forEach(currentLine => {
    // If a line is empty, skip it and move to the next one.
    if (currentLine.length === 0) {
      return;
    }

    // Split the current line by spaces to get an array of string values.
    const valuesArray = currentLine.split(' ');

    // Log the result of the calculation performed by the 'calculateRangeCount' function.
    // Parse string values to integers before passing them to the function.
    console.log(calculateRangeCount(
      parseInt(valuesArray[0], 10), // First value as starting point
      parseInt(valuesArray[1], 10), // Second value as ending point
      parseInt(valuesArray[2], 10), // Third value as first divisor
      parseInt(valuesArray[3], 10)  // Fourth value as second divisor
    ));
  });
}

// This function calculates the number of integers in a range [startVal, endVal]
// that are not divisible by divisorOne and not divisible by divisorTwo.
// It uses the principle of inclusion-exclusion.
function calculateRangeCount(startVal, endVal, divisorOne, divisorTwo) {
  // Total numbers in the range: (endVal - startVal + 1)
  // Subtract numbers divisible by divisorOne
  // Subtract numbers divisible by divisorTwo
  // Add back numbers divisible by both (divisorOne * divisorTwo) because they were subtracted twice.
  return (endVal - startVal + 1) - getDivisibleCount(startVal, endVal, divisorOne) - getDivisibleCount(startVal, endVal, divisorTwo) + getDivisibleCount(startVal, endVal, divisorOne * divisorTwo);
}

// This helper function counts how many numbers in a given range [lowerBound, upperBound]
// are perfectly divisible by a specified divisor.
function getDivisibleCount(lowerBound, upperBound, divisor) {
  // Calculate the total count of multiples of 'divisor' up to 'upperBound'.
  const totalMultiples = Math.floor(upperBound / divisor);
  // Calculate the count of multiples of 'divisor' strictly before 'lowerBound'.
  const multiplesBeforeStart = Math.floor((lowerBound - 1) / divisor);
  // The difference gives the count of multiples within the [lowerBound, upperBound] range.
  return totalMultiples - multiplesBeforeStart;
}

// Read input from standard input and pass it to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
