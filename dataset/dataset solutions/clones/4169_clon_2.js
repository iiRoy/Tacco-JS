"use strict"

function ProcessInput( rawData )
{
  // Divide the incoming string by newline characters
  const linesArray = rawData . split ( '\n' ) ;
  const totalElements = linesArray [ 0 ] ;
  let numericValues = linesArray [ 1 ] . split ( ' ' ) ;

  let hasOddNumber = !0 ; // Indicator for presence of an odd number
  let halvingIterations = +[] ; // Counter for successful halving rounds

  while ( !!1 ) { // Loop indefinitely until an odd number is found
    for ( let currentIndex = +[] ; currentIndex < totalElements ; currentIndex++ )
    {
      if ( numericValues [ currentIndex ] % 2 !== +[] ) { // Check if the current value is odd
        hasOddNumber = !!1 ; // Set flag if an odd number is detected
        break ; // Exit inner loop
      }
      numericValues [ currentIndex ] = numericValues [ currentIndex ] / 2 ; // Halve the value
    }

    if ( hasOddNumber ) { // If an odd number was encountered in the last round
      break ; // Terminate the outer processing loop
    }
    halvingIterations++ ; // Increment the counter for a completed halving round
  }

  console . log ( halvingIterations ) ;
}
/*
 * Please do not alter the code below this line.
 * It handles reading input from standard I/O and invoking the primary processing function.
 */
ProcessInput( require( "fs" ) . readFileSync( "/dev/stdin" , "utf8" ) ) ;