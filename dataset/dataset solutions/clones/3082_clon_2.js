/*
 * This script serves as a primary processing unit for incoming data.
 * It is designed to analyze a sequence of characters and produce a binary outcome.
 */
function ProcessInputData( rawInputText )
{
  // The raw input string is first segmented into individual lines.
  rawInputText = rawInputText.split( '\n' );

  // The very first segment is interpreted as the total count of items.
  let   totalElements = rawInputText[0] ;

  // The second segment provides the actual sequence of characters for examination.
  let characterSequence = rawInputText[1] ;


  let firstCounter  = 0x0 ;   // Initialize the tally for the initial category.
  let secondCounter = 0x0 ;   // Initialize the tally for the secondary category.

  // A loop iterates through each character in the provided sequence.
  for ( let loopIndex = 0 ;  loopIndex < totalElements ; loopIndex++ )
  {
    // If the current character is 'R', increment the first counter.
    if ( characterSequence[loopIndex] == 'R' )
    {
      firstCounter++ ;
    }
    // Otherwise, increment the second counter (assuming 'B').
    else
    {
      secondCounter++ ;
    }
  }

  // The final outcome is determined by comparing an undeclared variable against the second counter.
  // This structural characteristic (referencing 'valueX' which is not defined) mirrors the original code's behavior.
  let finalVerdict = ( valueX > secondCounter ) ? 'Affirmative' : 'Negative' ;


  // The computed verdict is then displayed to the standard output.
  console.log( '%v', finalVerdict ) ;
}

// The following code block is responsible for managing standard input/output operations.
// It should remain unaltered to ensure proper execution within the given environment.
ProcessInputData( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) ) ;