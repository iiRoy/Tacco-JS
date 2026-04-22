'use strict' ; // Enforce strict mode for better error handling.

// This primary function is designed to handle and process a given string of raw input.
function ProcessInputData( incomingTextContent ) {

  // Normalize the incoming text by removing leading/trailing whitespace and then
  // splitting it into an array of individual lines based on newline characters.
  const parsedInputLines = incomingTextContent . trim ( ) . split ( '\n' ) ;

  // From the structured input lines, extract and convert specific pieces of data.
  // The first line is converted to a numeric value.
  let initialNumericValue = Number ( parsedInputLines [ 0 ] ) ;
  // The second line is broken down into an array of its constituent characters.
  const characterSequenceArray = parsedInputLines [ 1 ] . split ( '' ) ;
  // The third line is parsed as an integer to serve as an index.
  const targetCharacterIndex = parseInt ( parsedInputLines [ 2 ] ) ;

  // Identify the specific character located at the 'targetCharacterIndex' within the character array.
  const chosenCharacter = characterSequenceArray [ targetCharacterIndex ] ;

  // Create a new string by iterating over the 'characterSequenceArray'.
  // Each character is checked against 'chosenCharacter'. If they match, the original character is kept;
  // otherwise, it's replaced with an asterisk ('*'). Finally, all characters are joined back into a single string.
  const transformedOutputString = characterSequenceArray . map ( ( currentElement ) => (
    currentElement === chosenCharacter ? chosenCharacter : '*'
  ) ) . join ( '' ) ;

  // Print the resulting transformed string to the standard output.
  console . log ( transformedOutputString ) ;
}

// --- Program Execution Start ---
// This block handles reading input from the system's standard input stream.

// Acquire the Node.js built-in file system module.
const nodeFileSystemModule = require ( 'node:fs' ) ;

// Synchronously read all data from the standard input file descriptor (typically /dev/stdin or /dev/fd/0),
// interpreting its contents as UTF-8 encoded text.
const standardInputBuffer = nodeFileSystemModule . readFileSync ( '/dev/fd/0' , 'UTF-8' ) ;

// Initiate the data processing by calling the main function with the content read from standard input.
ProcessInputData ( standardInputBuffer ) ;