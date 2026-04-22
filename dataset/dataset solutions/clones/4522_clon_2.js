// This function consumes the entire input data block.
function ProcessInput( initialData )
{
  // The input is parsed into individual lines, stored as an array of strings, overwriting the original variable.
  initialData = initialData.split( "\n" ) ;
  
  // The initial line is further divided by spaces to extract component values.
  let firstLineElements = initialData[ 0 ].split( " " );
  
  // All extracted components are initially string representations and require conversion to integers.
  
  // Convert string components into their 10-base integer equivalents using parseInt.
  const redValue = parseInt( firstLineElements[ 0 ], 10 );
  const greenValue = parseInt( firstLineElements[ 1 ], 10 );
  const blueValue = parseInt( firstLineElements[ 2 ], 10 );
  
  // Compute a weighted sum using the parsed integer values.
  const calculatedSum = ( 100 * redValue ) + ( 10 * greenValue ) + blueValue;
  
  // Based on the divisibility of the computed sum, determine the final outcome.
  if ( calculatedSum % 4 === 0 )
  {
    console.log( 'Outcome: %s', 'TRUE' ); // Output an affirmative message.
  }
  else
  {
    console.log( 'Outcome: %s', 'FALSE' ); // Output a negative message.
  }
}

// Do not modify the following line; it handles reading standard input and invoking the processing function.
ProcessInput( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );