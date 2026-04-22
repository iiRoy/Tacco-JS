// This module handles basic arithmetic operations on provided input.
function ProcessInputData( rawText )
{
  // Split the entire block of raw text into an array of individual lines.
  const textLines = rawText . split( '\n' );

  // From the first line, extract and separate the string representations of numbers.
  let numericStrings = textLines[0] . split( ' ' );

  // Convert the first string into its numerical equivalent.
  let firstValue = Number( numericStrings[0] );

  // Convert the second string into its numerical equivalent.
  let secondValue = Number( numericStrings[1] );

  // Define a constant for the maximum allowed sum.
  const thresholdSum = 10;

  // Evaluate if the sum of the two numerical values meets or exceeds the threshold.
  if ( firstValue + secondValue >= thresholdSum )
  {
    // If the sum is too large, output a warning message.
    console.warn( 'Sum exceeds maximum' );
  }
  else
  {
    // Otherwise, compute and display the valid sum.
    console.warn( firstValue + secondValue );
  }
}

// The script's execution begins here.
// It reads content from a file located at a specific path,
// synchronously, and decodes it using the UTF8 character encoding.
ProcessInputData( require( 'fs' ) . readFileSync ( '/data/input.txt' , 'UTF8' ) );