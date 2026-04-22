// This function processes raw string input to find a specific common divisor.
function processInputData(sourceText) {

  // Split the incoming string by spaces to get individual components.
  const inputParts = sourceText.split(' ');

  // Convert the first three parts into numerical values.
  let firstNum = Number(inputParts[0]);
  let secondNum = Number(inputParts[1]);
  let targetPosition = Number(inputParts[2]);

  // Create a sorted array containing the two numbers to simplify iteration.
  // The smaller number will be at index 0, the larger at index 1.
  let numericPair = firstNum < secondNum ? [firstNum, secondNum] : [secondNum, firstNum];

  // Initialize variables for the loop and potential result.
  let currentCandidate = 0; // Represents the potential common divisor being checked.
  let foundResult;         // Will store the K-th common divisor once found.
  let divisorCounter = 0;  // Counts how many common divisors have been discovered.

  // Iterate downwards from the smaller number (or its equivalent in the sorted pair)
  // to find common divisors in descending order.
  for (currentCandidate = numericPair[0]; currentCandidate > 0; --currentCandidate) {
    // Check if the current candidate divides both numbers without any remainder.
    // This condition confirms it is a common divisor.
    if (Number.isInteger(numericPair[0] / currentCandidate) && Number.isInteger(numericPair[1] / currentCandidate)) {
      divisorCounter++; // Increment the count of common divisors found.

      // If this is the target K-th common divisor, store it and exit the loop.
      if (divisorCounter === targetPosition) {
        foundResult = currentCandidate; // Store the K-th divisor.
        break; // Terminate the loop early as the desired divisor has been located.
      }
    }
  }

  // Output the final value of 'currentCandidate'.
  // Note: The original logic logs the loop variable 'cu', which corresponds to 'currentCandidate'.
  // If the K-th divisor is found, this will be its value. Otherwise, it will be 0.
  console.log(currentCandidate);
}

// Read input from standard input and pass it to the processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));