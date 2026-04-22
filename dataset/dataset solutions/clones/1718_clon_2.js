/*
 * This module defines a primary function to perform
 * a specific mathematical calculation based on input.
 */
function processData(rawInputString)
{
  // Convert the incoming string data into a numerical format.
  // The 'Number' constructor is used for this type conversion.
  const parsedNumericInput = Number(rawInputString);

  // Perform a calculation: add the number itself, its square, and its cube.
  // The result is then outputted to the standard console stream.
  console.log(
    parsedNumericInput +
    Math.pow(parsedNumericInput, 2) + // Calculate the square
    Math.pow(parsedNumericInput, 3)   // Calculate the cube
  );
}

// Entry point of the script.
// It reads content from standard input, typically a file or piped data.
// The data is read synchronously and decoded as UTF-8 text.
processData(
  require('fs')
    .readFileSync(
      '/dev/stdin', // Standard input file path
      'utf8'        // Encoding for the input data
    )
);