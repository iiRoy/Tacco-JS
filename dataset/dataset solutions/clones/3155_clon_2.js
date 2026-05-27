function processInputData(rawData) {
  // Split the raw input string into an array of string values.
  const parsedValues = rawData.split(' ');

  // Convert the string values to numbers.
  let firstNum = Number(parsedValues[0]);
  let secondNum = Number(parsedValues[1]);
  let targetIndex = Number(parsedValues[2]);

  // Create an array with the smaller number first, then the larger.
  // This helps in iterating up to the smaller number for divisor checks.
  let orderedPair = firstNum < secondNum ? [firstNum, secondNum] : [secondNum, firstNum];

  // Generate a sequence of numbers from 1 up to the smaller of the two input numbers.
  // Then, filter this sequence to find all common divisors.
  let commonDivisorsList = Array.from(Array(orderedPair[0]), (_, idx) => idx + 1).reduce((accumulator, currentCandidate) => {
    // Check if the current candidate divides both numbers in the ordered pair evenly.
    if (Number.isInteger(orderedPair[0] / currentCandidate) && Number.isInteger(orderedPair[1] / currentCandidate)) {
      // If it's a common divisor, add it to our list.
      accumulator.push(currentCandidate);
      return accumulator;
    }
    // Otherwise, return the accumulator unchanged.
    return accumulator;
  }, []); // Start with an empty array for common divisors.

  // The problem asks for the K-th largest common divisor.
  // Since `commonDivisorsList` is sorted in ascending order,
  // the K-th largest is at `length - K` index.
  // `splice` removes the element and returns an array containing it.
  const finalDivisor = commonDivisorsList.splice(commonDivisorsList.length - targetIndex, 1)[0];

  // Output the determined common divisor to the console.
  console.log(finalDivisor);
}

// Read input from standard input and pass it to the main processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
