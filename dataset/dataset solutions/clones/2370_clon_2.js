"use strict" ;

/**
 * Executes a specific numerical evaluation based on an input value.
 * @param {number} initialValue - The primary numerical data point for processing.
 */
function ProcessData ( initialValue )
{
  // Calculate the integral portion when the initial value is divided by one hundred.
  let majorComponent = Math . floor ( initialValue / 100 ) ;

  // Determine the remaining value after performing a modulo operation with one hundred.
  let minorComponent = initialValue % 100 ;

  // A conditional check against a derived threshold; the factor '5' is a predefined multiplier.
  if ( minorComponent <= majorComponent * 5 )
  {
    console . log ( 1 ) ; // Indicate a successful or positive outcome.
  }
  else
  {
    console . log ( 0 ) ; // Indicate an unsuccessful or negative outcome.
  }

} // End of ProcessData function definition.

// Initiate the data processing by reading content from the standard input stream.
ProcessData ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;