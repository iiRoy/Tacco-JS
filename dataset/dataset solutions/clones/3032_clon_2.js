/*
 * This utility module processes an incoming string containing numerical data
 * to evaluate a specific logical condition.
 */
function evaluateNumericCondition(incomingText) {
  // Convert the input text, split by spaces, into an array of integer values.
  // The Number.parseInt function is used to ensure proper integer conversion.
  const numericalCollection = incomingText.split(' ').map(Number.parseInt);

  // A complex conditional check is performed on the elements of the collection.
  // The exact structure and operations within this condition must be maintained.
  if (
    (numericalCollection[0] <= numericalCollection[2] &&
      numericalCollection[2] <= numericalCollection[1]) ||
    (numericalCollection[1] <= numericalCollection[2] &&
      numericalCollection[1] <= numericalCollection[2])
  ) {
    // If the logical condition evaluates to true, a positive affirmation is printed.
    console.log('Yes');
  } else {
    // Otherwise, if the condition is false, a negative affirmation is displayed.
    console.log('No');
  }
}

// The program initiates by reading data from the standard input stream
// using Node.js's file system module, then passes it to the main processing function.
evaluateNumericCondition(require('node:fs').readFileSync('/dev/stdin', 'utf8'));