/*
 * This JavaScript file processes standard input to count occurrences of the digit '2'.
 * It demonstrates basic Node.js stream handling and string manipulation.
 */

// Resume the standard input stream, ensuring it's ready to receive data.
process.stdin.resume();

// Set the character encoding for the standard input stream to UTF-8.
process.stdin.setEncoding('utf8');


// Declare a global variable to accumulate all incoming data from stdin.
var g_input = '';


// Attach an event listener for the 'data' event on the standard input stream.
// This callback function is executed whenever new data chunks are available.
process.stdin.on(
  'data',
  function ( chunk ) {
    // Append the received data chunk to the global input string.
    g_input += chunk;
  }
);


// Attach an event listener for the 'end' event on the standard input stream.
// This callback function is executed once all input has been received.
process.stdin.on(
  'end',
  function () {
    // Split the accumulated global input string by newline characters
    // (handling both Windows and Unix style newlines)
    // and then pass the resulting array of lines to the main processing function.
    main( g_input.split( /\r?\n/ ) );
  }
);


/**
 * The primary function to process the input received from stdin.
 * @param {Array<string>} input - An array of strings, where each string represents a line of input.
 */
function main( input ) {

  // Concatenate the input array into a single string.
  // This ensures 'input' is a string for the subsequent regular expression match.
  input = input + "";

  // Use a regular expression to find all occurrences of the digit '2' within the input string.
  // The 'g' flag ensures that all matches are found, not just the first one.
  input = input.match( /2/g );


  // Check if the 'match' operation returned null (meaning no matches were found).
  // If so, reassign 'input' to an empty array for consistent handling.
  if ( input === null ) {
    input = [];
  }


  // Log the resulting array of '2's (or an empty array if none were found) to the console.
  console.log( input );


  // Log the total count of occurrences of the digit '2' found in the input.
  console.log( input.length );
}