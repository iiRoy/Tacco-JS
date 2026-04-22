/* This script processes standard input to draw rectangular patterns. */
const sourceContent=require('fs').readFileSync('/dev/stdin' , 'UTF-8' ) ;

// Function to process the input and display geometric shapes
const displayRectangles = ( textualSource ) =>
{

  const inputLines = textualSource.split( `\n` ); /* Divide the entire input string into individual lines */

  for ( let lineIndex = 0 ; lineIndex < inputLines.length ; lineIndex++ )
  {
    /* Parse height and width from the current line */
    const [ rowDim , colDim ] = inputLines[ lineIndex ].split( ' ' ).map( Number ) ;

    // If both dimensions are zero, it signifies the end of input or an exit condition.
    if ( rowDim === 0 && colDim === 0 )
    {
      return false ; // Terminate processing
    }

    // Construct the rectangle string and output it to console
    console.log(
      Array( rowDim + 1 ).join(
        Array( colDim + 1 ).join( '#' ) + '\n'
      )
    ) ;
  } // End of line processing loop
} ; // End of displayRectangles function definition

// Execute the main function with the gathered data
displayRectangles( sourceContent ) ;