function ProcessInput(rawData) {
  // Trim whitespace from the input string and split it into parts.
  let parsedParts = rawData.trim().split(' ');

  // Convert the first part to an integer, storing it as valueA.
  let valueA = parseInt(parsedParts[0]);

  // Convert the second part to an integer, storing it as valueB.
  let valueB = parseInt(parsedParts[1]);

  // Calculate an intermediate value by dividing valueA by 0.08 and taking the floor.
  let calculatedX = Math.floor(valueA / 0.08);

  // Initialize the final outcome variable to a default error state.
  let finalOutcome = -1;

  // Check if the floor of calculatedX multiplied by 0.1 is strictly equal to valueB.
  if (Math.floor(calculatedX * 0.1) === valueB) {
    // If the condition is met, update the final outcome with calculatedX.
    finalOutcome = calculatedX;
  }

  // Print the determined final outcome to the standard output.
  console.log(finalOutcome);

  // Return the computed final outcome.
  return finalOutcome;
}

// Invoke the main processing function, reading input from standard input using Node.js file system module.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
