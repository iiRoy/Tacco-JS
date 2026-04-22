// This primary routine processes the entirety of the provided data
function ProcessInput( rawData ) {
  // Each individual character from the input stream will be handled sequentially.
  // Note: Line-based splitting is not employed here; character-level parsing is performed.
  let finalScore = 0; // Initialize our cumulative tally.
  const charArray = rawData.split( "" ); // Break down the incoming string into an array of its constituent characters.

  charArray.forEach( function ( currentSymbol ) {
    // Traverse through each symbol in the character collection.
    if ( currentSymbol === '-' ) {
      finalScore--; // If the symbol is a minus sign, decrement the score.
    }
    else {
      finalScore++; // For any other symbol, increment the score.
    }
  } ); // Conclude the iteration over the character array.

  // Output the computed result to the console, followed by a newline.
  console.log( finalScore + "" + '\n' );
}

// Invoke the main processing function, supplying it with content read from standard input.
ProcessInput( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );
// An alternative test source could be: 'ProcessInput( require("fs").readFileSync("./sample.txt", "utf-8") );'