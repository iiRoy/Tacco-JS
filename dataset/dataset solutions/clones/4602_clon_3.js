const analyzeSequence = (incomingText) => {
  // This routine processes textual input to determine a specific arithmetic property.

  const UPPER_THRESHOLD = 10000;
  const POSITIVE_RESPONSE = 'YES';
  const NEGATIVE_RESPONSE = 'NO';

  const trimmedContent = incomingText.trim();
  if (trimmedContent.length === 0) {
    console.log(NEGATIVE_RESPONSE);
    return;
  }

  const linesOfData = trimmedContent.split('\n');

  // We are primarily interested in the first line for our numerical parameters.
  if (linesOfData.length === 0) {
    console.log(NEGATIVE_RESPONSE);
    return;
  }

  const primaryParameters = linesOfData[0].split(' ');
  if (primaryParameters.length < 3) {
    // Insufficient parameters provided in the input line.
    console.log(NEGATIVE_RESPONSE);
    return;
  }

  // Extract and parse the three essential numerical values.
  const incrementBase = parseInt(primaryParameters[0], 10); // The base value for our multiples
  const testDivisor = parseInt(primaryParameters[1], 10);   // The divisor for the modulo operation
  const desiredRem = parseInt(primaryParameters[2], 10);    // The target remainder

  // Basic validation to ensure all parsed numbers are valid.
  if (isNaN(incrementBase) || isNaN(testDivisor) || isNaN(desiredRem)) {
    console.log(NEGATIVE_RESPONSE);
    return;
  }

  // A boolean flag to track if the desired condition is met during iteration.
  let outcomeDetermined = false;

  // Iterate through multiples of the base value, starting from the base itself,
  // up to a predefined upper limit.
  for (let currentMultipleValue = incrementBase; currentMultipleValue <= UPPER_THRESHOLD; currentMultipleValue += incrementBase) {
    // Calculate the remainder when the current multiple is divided by the test divisor.
    const calculatedRemainder = currentMultipleValue % testDivisor;

    // Check if the calculated remainder matches our target remainder.
    if (calculatedRemainder === desiredRem) {
      outcomeDetermined = true; // Condition met!
      break; // Exit the loop early as we've found what we're looking for.
    }
  }

  // Based on whether the condition was met during the loop, print the appropriate response.
  if (outcomeDetermined) {
    console.log(POSITIVE_RESPONSE);
  } else {
    console.log(NEGATIVE_RESPONSE);
  }
};

// Initiate the sequence analysis by reading standard input.
// This setup is typical for competitive programming environments.
analyzeSequence(require('fs').readFileSync('/dev/stdin', 'utf-8'));