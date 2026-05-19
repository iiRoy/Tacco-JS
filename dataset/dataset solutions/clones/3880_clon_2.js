function processInput(rawData) {
  // Divide the raw input string into an array of string segments,
  // using any single whitespace character or newline as a delimiter.
  var parsedValues = rawData.split(/\s|\n/);

  // Initialize a variable to accumulate the total calculated cost.
  var totalCost = 0;

  // First conditional block: Determines a portion of the total cost.
  // It compares the average of the first two parsed values with the third value.
  if ( (parsedValues[0] * 1 + parsedValues[1] * 1) / 2 > parsedValues[2] * 1 ) {
    // If the condition is true, add a cost based on the third value, doubled,
    // and multiplied by the minimum of the fourth and fifth values.
    totalCost += parsedValues[2] * 2 * Math.min(parsedValues[3] * 1, parsedValues[4] * 1);
  }
  else {
    // Otherwise, add a cost based on the sum of the first two values,
    // multiplied by the minimum of the fourth and fifth values.
    totalCost += (parsedValues[0] * 1 + parsedValues[1] * 1) * Math.min(parsedValues[3] * 1, parsedValues[4] * 1);
  }

  // Second conditional block: Adds another portion to the total cost.
  // It compares the fourth and fifth parsed values.
  if (parsedValues[3] * 1 > parsedValues[4] * 1) {
    // If the fourth value is greater, add a cost based on the first value
    // multiplied by the difference between the fourth and fifth values.
    totalCost += parsedValues[0] * (parsedValues[3] * 1 - parsedValues[4] * 1);
  }
  else {
    // Otherwise (if the fifth value is greater or equal), add a cost based on the second value
    // multiplied by the difference between the fifth and fourth values.
    totalCost += parsedValues[1] * (parsedValues[4] * 1 - parsedValues[3] * 1);
  }

  // Output the final computed total cost to the console.
  console.log(totalCost);
}

// Execute the main processing function by reading input from standard input.
// The input is read as a UTF-8 encoded string.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
