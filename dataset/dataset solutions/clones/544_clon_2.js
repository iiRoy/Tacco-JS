// This script processes two numerical command-line arguments.

// Retrieve the command-line arguments, excluding 'node' and the script path.
const cliInputs = process.argv.slice(2);

// Check if exactly two arguments were provided by the user.
if (cliInputs.length === 2) {
  // Parse the first argument into an integer.
  const valOne = parseInt(cliInputs[0], 10);
  // Parse the second argument into an integer.
  const valTwo = parseInt(cliInputs[1], 10);

  // Perform floor division on the two values and add one.
  // Math.floor ensures integer division behavior similar to Java's Math.floorDiv.
  const finalOutcome = Math.floor(valOne / valTwo) + 1;

  // Output the computed result to the console.
  console.log(finalOutcome);
}
