"use strict"; // This directive ensures strict mode, enforcing stricter parsing and error handling.

// Define the primary function responsible for processing the input.
const processInputContent = ( inputPayload ) => {
  // Extract a specific character from the input string.
  // The process involves:
  // 1. Splitting the input by newline and taking the first line.
  // 2. Splitting that line by space and taking the second segment.
  // 3. Converting that segment to an array of characters and selecting the initial character.
  const firstExtractedCharacter = inputPayload
    .split( "\n" )
    [ 0 ]
    .split( " " )
    [ 1 ]
    .split( "" )
    [ 0 ];

  // Log a combined string to the console, using fixed letters and the extracted character.
  console.log( "A" + firstExtractedCharacter + "C" );
};

// Invoke the main processing routine.
// It reads content synchronously from standard input ('/dev/stdin') using Node.js's 'fs' module,
// interpreting the content as UTF-8 encoded text, and then passes it to the function.
processInputContent( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );