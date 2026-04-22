// This script processes a sequence of arithmetic operations provided via standard input.
// It computes a final integer result based on the given operands and operators.
var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// The input string is first trimmed to remove any leading/trailing whitespace,
// then split into an array of strings, with each element representing a line.
var processedLines = ( rawData.trim( ) ).split( "\n" );

// Initialize the calculation accumulator with the very first numeric operand.
// The string is explicitly converted to a number.
var resultValue = Number( processedLines[0] );

// Iterate through the array to apply operations.
// The loop starts from the second element (index 1), which is the first operator.
// It increments by two to jump from one operator to the next, skipping operands.
for
(
  var idx = 1;
  idx < processedLines.length - 1; // The loop should not process the very last element if it's an operand for a non-existent operator.
  idx = idx + 2
)
{
  // Check if the current element represents an addition operation.
  if ( processedLines[idx] === "+" ) {
    resultValue += Number( processedLines[idx + 1] ); // Add the subsequent operand.
  }
  // Check if the current element represents a subtraction operation.
  if ( processedLines[idx] === "-" ) {
    resultValue -= Number( processedLines[idx + 1] ); // Subtract the subsequent operand.
  }
  // Check if the current element represents a multiplication operation.
  if ( processedLines[idx] === "*" ) {
    resultValue *= Number( processedLines[idx + 1] ); // Multiply by the subsequent operand.
  }
  // Check if the current element represents a division operation.
  if ( processedLines[idx] === "/" ) {
    resultValue /= Number( processedLines[idx + 1] ); // Divide by the subsequent operand.
  }
  // After each operation, ensure the intermediate result is an integer by
  // converting it to a string with zero decimal places, then back to a number.
  resultValue = resultValue.toFixed( 0 );
}

// Display the final computed numeric result to the standard output.
console.log( resultValue );