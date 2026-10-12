function ProcessInput(rawData) {
  // Trim leading/trailing whitespace from the input and split it by spaces
  const tokenizedValues = rawData.trim().split(' ');

  // Convert the first token to an integer, using base 10
  const firstVal = parseInt(tokenizedValues[0], 10);
  // Convert the second token to an integer, also using base 10
  const secondVal = parseInt(tokenizedValues[1], 10);

  // Initialize a variable to store the cumulative score
  let totalScore = 0;

  // Check for a specific combination of values (both being 1)
  if (firstVal === 1 && secondVal === 1) {
    totalScore += 400000; // Add a significant bonus for this exact match
  }

  // Evaluate individual conditions for the first value and add to score
  if (firstVal === 1) totalScore += 300000;
  // Evaluate individual conditions for the second value and add to score
  if (secondVal === 1) totalScore += 300000;
  // Check if the first value is 2
  if (firstVal === 2) totalScore += 200000;
  // Check if the second value is 2
  if (secondVal === 2) totalScore += 200000;
  // Check if the first value is 3
  if (firstVal === 3) totalScore += 100000;
  // Check if the second value is 3
  if (secondVal === 3) totalScore += 100000;

  // Print the final calculated score to the standard output
  console.log(totalScore);
}

// Read the entire content of standard input as a UTF-8 string
// and then pass it to our processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
