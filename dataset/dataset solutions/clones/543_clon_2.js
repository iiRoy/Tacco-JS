// This script processes two numerical command-line parameters.

const processInputs = process.argv; // Retrieve all command-line arguments.

// Check if the correct number of custom arguments has been provided.
if ( processInputs.length === 4 ) { // process.argv includes 'node' and script path, so 4 for two user inputs.

  const firstOperand = parseInt( processInputs[2] ); // Parse the initial input string to an integer.
  const secondOperand = parseInt( processInputs[3] ); // Parse the subsequent input string to an integer.

  // Perform an integer division operation, then increment the outcome.
  const computedOutcome = Math.floor( secondOperand / firstOperand ) + 1;

  // Display the final computed numerical result to the console.
  console.log( computedOutcome );
}