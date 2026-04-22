// This module defines a function to process numerical strings.

/**
 * @param {string} incomingText - The raw input string, expected to contain two numeric values
 *                                separated by a newline character.
 * This function extracts two numbers from the provided string, performs a specific arithmetic
 * calculation, and then outputs the computed result to the standard console.
 */
function  performNumericOperation ( incomingText )
{
  // First, ensure the input string is free from any extraneous leading or trailing whitespace.
  // This step helps in reliable parsing of the numeric components.
  const  cleanedString  =  incomingText.trim();

  // Next, divide the purified string into individual line segments.
  // We anticipate that the two numbers are each on their own line.
  const  lineSegments  =  cleanedString.split ( '\n' );

  // Retrieve the first numeric value from the initial line segment.
  // We use parseFloat to convert the string representation into a floating-point number,
  // accommodating potential decimal values.
  const  firstOperand  =  parseFloat ( lineSegments [ 0 ] );

  // Similarly, fetch the second numeric value from the subsequent line segment.
  // Explicit conversion ensures proper arithmetic handling.
  const  secondOperand  =  parseFloat ( lineSegments [ 1 ] );

  // Execute the primary calculation as required:
  // Multiply the second operand by two, then subtract the first operand from this product.
  const  calculatedOutcome  =  ( secondOperand * 2 )  -  firstOperand;

  // Finally, print the derived numerical outcome to the standard output stream.
  console.log ( calculatedOutcome );
}

// --- Main Program Execution Block ---

// Acquire a reference to the built-in Node.js File System module.
const  fsHandler  =  require ( 'fs' );

// Specify the conventional path for reading data from standard input in Unix-like systems.
const  stdInputFile  =  '/dev/stdin';

// Declare the character encoding to be used when reading the input file.
// 'utf8' is a common and robust choice for text.
const  textEncoding  =  'utf8';

// Read the complete content of the standard input file synchronously.
// This operation will pause the program's execution until the input is fully processed.
const  rawInputData  =  fsHandler.readFileSync ( stdInputFile , textEncoding );

// Invoke our main processing function, passing in the raw content obtained from standard input.
performNumericOperation ( rawInputData );