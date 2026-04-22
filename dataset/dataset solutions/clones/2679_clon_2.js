// This module contains a routine designed to process a sequence of numbers.

function  performCalculation ( rawInputData )

{

  // The incoming string is first segmented into individual components.
  // We use a space character as the primary separator for these segments.
  let dataSegments = rawInputData.split( ' ' );


  // The first segment is interpreted as an integer, establishing an upper boundary for our process.
  // The radix '10' explicitly ensures decimal interpretation.
  let upperLimit = parseInt( dataSegments[ 0 ], 10 );


  // A counter is initialized to keep track of numbers that satisfy a specific digit-count property.
  let oddDigitCount = 0;


  // We iterate through a series of natural numbers, starting from one up to and including the upper limit.
  for ( let currentNumber = 1; currentNumber <= upperLimit; currentNumber++ )
  {

    // For each number, its string representation is examined.
    // The condition checks if the total number of digits (characters) is an odd value.
    if ( String( currentNumber ).length % 2 === 1 )
    {
      // If the digit count is indeed odd, our dedicated counter is incremented.
      oddDigitCount++;
    }
  }


  // Finally, the accumulated total of numbers with an odd digit count is displayed to the console.
  console.log( oddDigitCount );

}


// The primary processing function is invoked with data sourced from standard input.
// This involves utilizing the Node.js 'fs' module to synchronously read the entire content
// of '/dev/stdin' and passing it as a UTF-8 encoded string.
performCalculation( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );