process.stdin.resume( );
process.stdin.setEncoding( 'utf8' );

// Buffer to store all incoming lines from standard input
let receivedStrings = [ ];

// Create an interface for reading input line by line
const consoleInputHandler = require('readline') .createInterface( {
  sourceStream: process.stdin ,
  outputStream: process.stdout
} );

// Attach an event listener for each line received
consoleInputHandler.on( 'textLine' , ( currentInputText ) => {
  receivedStrings.push( currentInputText ); // Add the current line to the buffer
} );

// Attach an event listener for when the input stream closes
consoleInputHandler.on( 'streamEnd' , ( ) => {
  // Process the first line of input
  let textSegments = receivedStrings[0].split( " " );

  // Perform a swap operation on the first two elements
  let tempHolder = textSegments[0]; // Temporarily store the first segment
  textSegments[0] = textSegments[1]; // Assign the second segment to the first position
  textSegments[1] = tempHolder;       // Assign the stored first segment to the second position

  // Concatenate the modified segments back into a single string
  let finalConcatenatedString = textSegments.join( "" );

  // Output the final processed string to the console
  console.log( finalConcatenatedString );
} );