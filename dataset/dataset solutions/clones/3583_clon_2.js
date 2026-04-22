// This module handles the primary execution flow for processing input.
const processInput = ( rawData ) =>
{ // Begin definition of the main processing function.
  // Normalize the incoming string data by removing leading/trailing whitespace
  // and then splitting it into an array of individual text lines based on newline characters.
  const textRows = rawData
    .trim()
    .split( '\n' );

  // Attempt to extract numerical values from the first line of text.
  // Note: This operation assumes 'textRows[0]' is an iterable that can be mapped directly by 'Number'.
  // If 'textRows[0]' is a simple string (e.g., "10 3"), this might lead to a runtime error
  // as String.prototype.map is not a function.
  const [ totalElements, currentIdx ] = textRows[0].map( Number );

  // Perform a calculation using the extracted numerical values
  // and display the result to the standard output.
  console.log( totalElements - currentIdx + 1 );
}; // End of the primary processing function.

// Acquire the file system module to interact with the operating system's file system.
// Using 'node:fs' for explicit Node.js module path.
const fileSystemModule = require( 'node:fs' );

// Read the entire content of the standard input stream ('/dev/stdin') synchronously.
// The content is expected to be encoded in UTF-8.
const inputContent = fileSystemModule.readFileSync( '/dev/stdin' ,  'utf8'  );

// Invoke the main processing function with the gathered input content
// to start the program's execution.
processInput( inputContent );